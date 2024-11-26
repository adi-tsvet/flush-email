import db from "../../../../database/db"; // MSSQL connection pool
import bcrypt from "bcrypt";
import sql from "mssql";

export async function POST(request: Request) {
  try {
    const { username, password, gmailId, gmailAppPassword } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await db;

    // Check if username already exists
    const existingUser = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(`
        SELECT 1 
        FROM Users 
        WHERE username = @username
      `);

    if (existingUser.recordset.length > 0) {
      return new Response(JSON.stringify({ error: "Username already exists" }), { status: 409 });
    }

    // Insert the new user into the database
    await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, hashedPassword)
      .input("gmailId", sql.VarChar, gmailId || null)
      .input("gmailAppPassword", sql.VarChar, gmailAppPassword || null)
      .query(`
        INSERT INTO Users (username, password, gmail_id, gmail_app_password)
        VALUES (@username, @password, @gmailId, @gmailAppPassword)
      `);

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error: any) {
    console.error("Error registering user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
