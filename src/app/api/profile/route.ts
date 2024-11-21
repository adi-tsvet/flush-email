import bcrypt from "bcrypt";
import db from "../../../../database/db";
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Fetch user details from the database
    const user = db
      .prepare("SELECT username, gmail_id, gmail_app_password FROM users WHERE username = ?")
      .get(session.user.username);

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

    // Update Gmail credentials if provided
    if (gmailId || gmailAppPassword) {
      db.prepare(`
        UPDATE users
        SET gmail_id = ?, gmail_app_password = ?
        WHERE username = ?
      `).run(
        gmailId || null,
        gmailAppPassword || null,
        session.user.username
      );
    }

    // Update password if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const user = db
        .prepare("SELECT password FROM users WHERE username = ?")
        .get(session.user.username);

      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return new Response(JSON.stringify({ error: "Incorrect current password" }), { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE username = ?").run(
        hashedPassword,
        session.user.username
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
