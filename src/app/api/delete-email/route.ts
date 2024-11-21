// src/app/api/delete-email/route.ts
import { NextResponse } from "next/server";
import db from "../../../../database/db"; // Adjust this path to your db connection
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";

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

    // Validate ownership of the email
    const email = db
      .prepare("SELECT * FROM emails WHERE id = ? AND user_id = ?")
      .get(id, session.user.id);

    if (!email) {
      return NextResponse.json(
        { error: "Email not found or unauthorized." },
        { status: 404 }
      );
    }

    // Perform deletion
    db.prepare("DELETE FROM emails WHERE id = ?").run(id);

    return NextResponse.json({ status: "success", message: "Email deleted successfully." });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json({ error: "Failed to delete email." }, { status: 500 });
  }
}

