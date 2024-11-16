import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import db from '../../../../database/db';

export async function POST(request: Request) {
  try {
    const { recipient, subject, content } = await request.json();

    if (!recipient || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const recipients = recipient.split(',').map((email: string) => email.trim());

    // Initialize Gmail API Client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      access_token: process.env.GMAIL_ACCESS_TOKEN,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const results = [];

    for (const email of recipients) {
      let emailSent = false;
      let emailSaved = false;
      let threadId: string | undefined;
      let errorMessage: string | null = null;

      try {
        // Build Raw Email
        const rawEmail = `To: ${email}\r\nSubject: ${subject}\r\n\r\n${content}`;
        const encodedEmail = Buffer.from(rawEmail)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // Send Email via Gmail API
        const sendResponse = await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: encodedEmail },
        });

        threadId = sendResponse.data.threadId ?? undefined;
        emailSent = true;
      } catch (err) {
        // Narrow the `error` type
        if (err instanceof Error) {
          console.error(`Error sending email to ${email}:`, err.message);

          if (
            err instanceof Error &&
            err.message.includes('Address not found')
          ) {
            errorMessage = `Email to ${email} could not be sent: Address not found.`;
          } else {
            errorMessage = `Email to ${email} failed: ${err.message}.`;
          }
        } else {
          console.error(`Unknown error sending email to ${email}:`, err);
          errorMessage = `An unknown error occurred for ${email}.`;
        }
      }

      if (emailSent) {
        try {
          // Save Email in Database
          const stmt = db.prepare(
            'INSERT INTO emails (recipient, subject, content, sent_at, follow_up, thread_id) VALUES (?, ?, ?, ?, ?, ?)'
          );
          stmt.run(email, subject, content, new Date().toISOString(), 0, threadId);
          emailSaved = true;
        } catch (err) {
          if (err instanceof Error) {
            console.error(`Error saving email to ${email}:`, err.message);
          } else {
            console.error(`Unknown error saving email to ${email}:`, err);
          }
        }
      }

      results.push({
        recipient: email,
        emailSent,
        emailSaved,
        threadId,
        errorMessage,
      });
    }

    return NextResponse.json({
      status: 'completed',
      results,
      message: 'Email processing completed.',
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error('General Error:', err.message);
    } else {
      console.error('Unknown General Error:', err);
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
