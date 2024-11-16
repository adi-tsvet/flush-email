import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('threadId');

  if (!threadId) {
    return NextResponse.json({ error: 'Missing threadId parameter' }, { status: 400 });
  }

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

  try {
    const threadResponse = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const messages = threadResponse.data.messages || [];
    const thread = messages.map((message) => {
      const payload = message.payload?.headers || [];
      const subject = payload.find((h) => h.name === 'Subject')?.value || '';
      const from = payload.find((h) => h.name === 'From')?.value || '';
      const date = payload.find((h) => h.name === 'Date')?.value || '';
      const snippet = message.snippet || '';

      return { subject, from, date, snippet };
    });

    return NextResponse.json({ thread });
  } catch (error: any) {
    console.error('Error fetching thread:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch thread. Check permissions or thread ID.' },
      { status: 500 }
    );
  }
}
