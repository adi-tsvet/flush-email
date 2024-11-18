import { NextResponse } from 'next/server';
import db from '../../../../database/db'; // Adjust the path to your database setup

export async function GET() {
  try {
    const templates = db.prepare('SELECT * FROM email_templates ORDER BY created_at DESC').all();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const { title, subject, content } = await request.json();
      if (!title || !subject || !content) {
        return NextResponse.json({ error: 'Title, Subject and Content are required' }, { status: 400 });
      }
  
      db.prepare('INSERT INTO email_templates (title, subject, content) VALUES (?, ?, ?)').run(title, subject, content);
  
      return NextResponse.json({ message: 'Template added successfully' });
    } catch (error) {
      console.error('Error adding template:', error);
      return NextResponse.json({ error: 'Failed to add template' }, { status: 500 });
    }
  }
  
  export async function PUT(request: Request) {
    try {
      const { id, title, subject, content } = await request.json();
      if (!id || !title || !content || !subject) {
        return NextResponse.json({ error: 'ID, Title, Subject and Content are required' }, { status: 400 });
      }
  
      db.prepare('UPDATE email_templates SET title = ?, subject = ?, content = ? WHERE id = ?').run(title, subject, content, id);
  
      return NextResponse.json({ message: 'Template updated successfully' });
    } catch (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
  }
  
  export async function DELETE(request: Request) {
    try {
      const { id } = await request.json();
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
  
      db.prepare('DELETE FROM email_templates WHERE id = ?').run(id);
  
      return NextResponse.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
  }
  