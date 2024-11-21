import db from '../../../../database/db';
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { username, password, gmailId, gmailAppPassword } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (username, password, gmail_id, gmail_app_password)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(username, hashedPassword, gmailId || null, gmailAppPassword || null);

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return new Response(JSON.stringify({ error: "Username already exists" }), { status: 409 });
    }
    console.error("Error registering user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
