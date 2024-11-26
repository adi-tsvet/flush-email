import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { authConfig } from "@/app/api/auth/authConfig";
import { getServerSession } from "next-auth";
import db from "../../../../database/db"; // MSSQL Connection
import sql from "mssql";

export async function POST(request: Request) {
  try {
    // Get the session with username
    const session = await getServerSession(authConfig);
    if (!session || !session.user?.id || !session.user?.username) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in first." },
        { status: 401 }
      );
    }

    const pool = await db;

    // Fetch Gmail credentials from the database
    const userResult = await pool
      .request()
      .input("userId", sql.Int, session.user.id)
      .query(`
        SELECT gmail_id, gmail_app_password 
        FROM Users 
        WHERE id = @userId
      `);

    const user = userResult.recordset[0];

    if (!user || !user.gmail_id || !user.gmail_app_password) {
      return NextResponse.json(
        { error: "Gmail credentials not found for the user." },
        { status: 400 }
      );
    }

    const { recipient, subject, content } = await request.json();

    if (!recipient || !subject || !content) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const recipients = recipient.split(",").map((email: string) => email.trim());

    // Nodemailer SMTP configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user.gmail_id, // Use Gmail ID from the database
        pass: user.gmail_app_password, // Use Gmail app password from the database
      },
    });

    const results = [];
    for (const email of recipients) {
      let emailSent = false;
      let emailSaved = false;
      let errorMessage: string | null = null;

      try {
        // Send email
        await transporter.sendMail({
          from: user.gmail_id, // Use Gmail ID from the database
          to: email, // Recipient
          subject: subject,
          text: content, // Email content
        });

        emailSent = true;

        // Save email to the database
        try {
          await pool
            .request()
            .input("userId", sql.Int, session.user.id)
            .input("recipient", sql.VarChar, email)
            .input("subject", sql.VarChar, subject)
            .input("content", sql.Text, content)
            .input("sentAt", sql.DateTime, new Date())
            .input("followUp", sql.Int, 0)
            .query(`
              INSERT INTO Emails (user_id, recipient, subject, content, sent_at, follow_up)
              VALUES (@userId, @recipient, @subject, @content, @sentAt, @followUp)
            `);

          emailSaved = true;
          console.log("Email saved to database!");
        } catch (err) {
          console.error(`Error saving email to ${email}:`, err);
          emailSaved = false;
        }
      } catch (err: any) {
        console.error(`Error sending email to ${email}:`, err.message);
        errorMessage = `Failed to send email to ${email}: ${err.message}`;
      }

      results.push({
        recipient: email,
        emailSent,
        emailSaved,
        errorMessage,
      });
    }

    return NextResponse.json({
      status: "completed",
      results,
      message: "Emails processed.",
    });
  } catch (err: any) {
    console.error("General Error:", err.message);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
