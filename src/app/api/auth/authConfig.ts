import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import sql from "mssql"; // Use mssql library for database operations
import bcrypt from "bcrypt";
import db from "../../../../database/db"; // Connection pool

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required.");
        }

        try {
          const pool = await db; // Ensure the database connection is ready
          
          // Fetch the user from the database
          const result = await pool
            .request()
            .input("username", sql.NVarChar, credentials.username)
            .query("SELECT * FROM Users WHERE username = @username");

          const user = result.recordset[0]; // Retrieve the first user record

          if (!user) {
            throw new Error("No user found with this username.");
          }

          // Verify the password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid username or password.");
          }

          // Return user details
          return {
            id: user.id,
            username: user.username,
            gmailId: user.gmail_id,
            gmailAppPassword: user.gmail_app_password,
          };
        } catch (error) {
          console.error("Error authorizing user:", error);
          throw new Error("Failed to authorize user.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.gmailId = user.gmailId;
        token.gmailAppPassword = user.gmailAppPassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as number,
        username: token.username as string,
        gmailId: token.gmailId as string,
        gmailAppPassword: token.gmailAppPassword as string,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
