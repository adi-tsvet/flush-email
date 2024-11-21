import db from "../../../../database/db";
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    // Check if the user is authenticated
    if (!session || !session.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Fetch emails for the authenticated user
    const stmt = db.prepare("SELECT * FROM emails WHERE user_id = ? ORDER BY sent_at DESC");
    const emails = stmt.all(session.user.id);

    return new Response(JSON.stringify(emails), { status: 200 });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
