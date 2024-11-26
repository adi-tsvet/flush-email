import { NextResponse } from "next/server";
import db from "../../../../database/db"; // MSSQL connection pool
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";
import sql from "mssql";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await db;

    const result = await pool
      .request()
      .input("userId", sql.Int, session.user.id)
      .query(`
        SELECT * 
        FROM EmailTemplates 
        WHERE user_id = @userId OR visibility = 'public'
        ORDER BY created_at DESC
      `);

    return NextResponse.json(result.recordset);
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

    const pool = await db;

    await pool
      .request()
      .input("userId", sql.Int, session.user.id)
      .input("title", sql.NVarChar, title)
      .input("subject", sql.NVarChar, subject)
      .input("content", sql.NVarChar, content)
      .input("visibility", sql.NVarChar, visibility || "private")
      .input("createdAt", sql.DateTime, new Date())
      .query(`
        INSERT INTO EmailTemplates (user_id, title, subject, content, visibility, created_at)
        VALUES (@userId, @title, @subject, @content, @visibility, @createdAt)
      `);

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

    const pool = await db;

    // Validate ownership
    const existingTemplate = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, session.user.id)
      .query(`
        SELECT * FROM EmailTemplates WHERE id = @id AND user_id = @userId
      `);

    if (existingTemplate.recordset.length === 0) {
      return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 403 });
    }

    // Update template
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar, title)
      .input("subject", sql.NVarChar, subject)
      .input("content", sql.NVarChar, content)
      .input("visibility", sql.NVarChar, visibility || "private")
      .query(`
        UPDATE EmailTemplates
        SET title = @title, subject = @subject, content = @content, visibility = @visibility
        WHERE id = @id
      `);

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

    const pool = await db;

    // Validate ownership
    const existingTemplate = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, session.user.id)
      .query(`
        SELECT * FROM EmailTemplates WHERE id = @id AND user_id = @userId
      `);

    if (existingTemplate.recordset.length === 0) {
      return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 403 });
    }

    // Delete template
    await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM EmailTemplates WHERE id = @id
    `);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
