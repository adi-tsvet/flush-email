// src/app/api/reframe-email/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Missing email content' }, { status: 400 });
    }

    // Use Hugging Face API for email reframing
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt/gpt2',
      { inputs: content },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const reframedContent = response.data.generated_text;

    return NextResponse.json({ reframedContent });
  } catch (error) {
    console.error('Error reframing email:', error);
    return NextResponse.json({ error: 'Failed to reframe email' }, { status: 500 });
  }
}
