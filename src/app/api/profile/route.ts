import bcrypt from "bcrypt";
import db from "../../../../database/db"; // MSSQL connection pool
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";
import sql from "mssql";

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const pool = await db;

    // Fetch user details from the database
    const result = await pool
      .request()
      .input("username", sql.VarChar, session.user.username)
      .query(`
        SELECT username, gmail_id, gmail_app_password 
        FROM Users 
        WHERE username = @username
      `);

    const user = result.recordset[0];

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Return user details
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { gmailId, gmailAppPassword, currentPassword, newPassword } = await request.json();
    const pool = await db;

    // Update Gmail credentials if provided
    if (gmailId || gmailAppPassword) {
      await pool
        .request()
        .input("gmailId", sql.VarChar, gmailId || null)
        .input("gmailAppPassword", sql.VarChar, gmailAppPassword || null)
        .input("username", sql.VarChar, session.user.username)
        .query(`
          UPDATE Users
          SET gmail_id = @gmailId, gmail_app_password = @gmailAppPassword
          WHERE username = @username
        `);
    }

    // Update password if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const result = await pool
        .request()
        .input("username", sql.VarChar, session.user.username)
        .query(`
          SELECT password 
          FROM Users 
          WHERE username = @username
        `);

      const user = result.recordset[0];

      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return new Response(JSON.stringify({ error: "Incorrect current password" }), {
          status: 400,
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await pool
        .request()
        .input("hashedPassword", sql.VarChar, hashedPassword)
        .input("username", sql.VarChar, session.user.username)
        .query(`
          UPDATE Users
          SET password = @hashedPassword
          WHERE username = @username
        `);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
