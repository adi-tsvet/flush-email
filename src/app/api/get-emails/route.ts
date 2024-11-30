import db from "../../../../database/db"; // MSSQL connection pool
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";
import sql from "mssql";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    // Check if the user is authenticated
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const pool = await db;

    // Fetch emails for the authenticated user
    const result = await pool
      .request()
      .input("userId", sql.Int, session.user.id)
      .query(`
        SELECT * 
        FROM Emails 
        WHERE user_id = @userId 
        ORDER BY sent_at DESC
      `);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
