import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    return NextResponse.json({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
  } catch (error) {
    console.error("Error in callback:", error.message || error);
    return NextResponse.json({ error: "Failed to handle callback" }, { status: 500 });
  }
}
