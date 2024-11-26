import { NextResponse } from "next/server";
import db from "../../../../database/db"; // MSSQL connection pool
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";
import sql from "mssql";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Email ID is required for deletion." },
        { status: 400 }
      );
    }

    const pool = await db; // Ensure MSSQL connection pool is ready

    // Validate ownership of the email
    const emailResult = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, session.user.id)
      .query("SELECT * FROM Emails WHERE id = @id AND user_id = @userId");

    if (emailResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Email not found or unauthorized." },
        { status: 404 }
      );
    }

    // Perform deletion
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Emails WHERE id = @id");

    return NextResponse.json({ status: "success", message: "Email deleted successfully." });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json({ error: "Failed to delete email." }, { status: 500 });
  }
}
