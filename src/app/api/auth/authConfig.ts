// src/app/api/auth/authConfig.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "../../../../database/db";
import bcrypt from "bcrypt";

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

        const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
        const user = stmt.get(credentials.username);

        if (!user) {
          throw new Error("No user found with this username.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid username or password.");
        }

        return {
          id: user.id,
          username: user.username,
          gmailId: user.gmail_id,
          gmailAppPassword: user.gmail_app_password,
        };
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
