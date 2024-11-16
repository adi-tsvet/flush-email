// src/app/api/delete-email/route.ts
import { NextResponse } from 'next/server';
import db from '../../../../database/db'; // Adjust this path to your db connection

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: 'Email ID is required for deletion.' },
      { status: 400 }
    );
  }

  try {
    const stmt = db.prepare('DELETE FROM emails WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json({ error: 'Failed to delete email.' }, { status: 500 });
  }
}
