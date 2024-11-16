import { NextResponse } from 'next/server';
import db from '../../../../database/db';

export async function GET() {
  const stmt = db.prepare('SELECT * FROM emails ORDER BY sent_at DESC');
  const emails = stmt.all();

  return NextResponse.json(emails); // Now `NextResponse` is defined
}
