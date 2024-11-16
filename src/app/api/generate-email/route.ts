// src/app/api/generate-email/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { jobDescription, resumeSummary } = await request.json();

  if (!jobDescription || !resumeSummary) {
    return NextResponse.json(
      { error: 'Job description and resume summary are required.' },
      { status: 400 }
    );
  }

  const prompt = `
Write a professional and personalized cold email to a company representative to inquire about a job opportunity or to request a referral for a suitable position. The email should be polite, engaging, and professional.

Job Title: ${jobDescription}
Resume Summary: ${resumeSummary}

`;

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.MODEL_NAME}`,
      {
        inputs: prompt,
        parameters: {
          max_length: 500, // Adjust as necessary
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`, // Use your Hugging Face API Token
        },
      }
    );

    const generatedEmail = response.data[0]?.generated_text?.trim() || 'Error: No email generated.';
    return NextResponse.json({ email: generatedEmail });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: 'Failed to generate email.' }, { status: 500 });
  }
}
