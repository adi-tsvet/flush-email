import { NextResponse } from "next/server";
import db from "../../../../database/db";
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = db
      .prepare(
        `SELECT * 
         FROM email_templates 
         WHERE user_id = ? OR visibility = 'public' 
         ORDER BY created_at DESC`
      )
      .all(session.user.id);

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, subject, content, visibility } = await request.json();

    if (!title || !subject || !content) {
      return NextResponse.json(
        { error: "Title, Subject, and Content are required" },
        { status: 400 }
      );
    }

    db.prepare(
      `INSERT INTO email_templates (user_id, title, subject, content, visibility, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      session.user.id,
      title,
      subject,
      content,
      visibility || "private",
      new Date().toISOString()
    );

    return NextResponse.json({ message: "Template added successfully" });
  } catch (error) {
    console.error("Error adding template:", error);
    return NextResponse.json({ error: "Failed to add template" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, subject, content, visibility } = await request.json();

    if (!id || !title || !subject || !content) {
      return NextResponse.json(
        { error: "ID, Title, Subject, and Content are required" },
        { status: 400 }
      );
    }

    const existingTemplate = db
      .prepare("SELECT * FROM email_templates WHERE id = ? AND user_id = ?")
      .get(id, session.user.id);

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 403 });
    }

    db.prepare(
      `UPDATE email_templates 
       SET title = ?, subject = ?, content = ?, visibility = ? 
       WHERE id = ?`
    ).run(title, subject, content, visibility || "private", id);

    return NextResponse.json({ message: "Template updated successfully" });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingTemplate = db
      .prepare("SELECT * FROM email_templates WHERE id = ? AND user_id = ?")
      .get(id, session.user.id);

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 403 });
    }

    db.prepare("DELETE FROM email_templates WHERE id = ?").run(id);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
