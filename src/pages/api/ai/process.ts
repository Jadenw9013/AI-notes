import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIRequest {
  prompt: string;
  noteContent: string;
  noteTitle: string;
  action: 'continue' | 'rewrite' | 'summarize' | 'actionItems';
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { prompt, noteContent, noteTitle, action } = body;

    if (!prompt || !noteContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'continue':
        systemPrompt =
          'You are an intelligent writing assistant. Continue the following note naturally, maintaining the same tone, style, and context. Return only the continuation text without any markdown formatting.';
        userPrompt = `Note Title: "${noteTitle}"\n\nCurrent Content:\n${noteContent}\n\nContinue from here:`;
        break;

      case 'rewrite':
        systemPrompt =
          'You are an expert editor. Rewrite the selected text to be more clear, concise, and impactful while maintaining the original meaning and tone. Return only the rewritten text without any markdown formatting.';
        userPrompt = `Note Title: "${noteTitle}"\n\nFull Note Context:\n${noteContent}\n\nRewrite this text:\n${prompt}`;
        break;

      case 'summarize':
        systemPrompt =
          'You are an expert summarizer. Create a concise, clear summary of the provided text, capturing the key points and main ideas. Return only the summary without any markdown formatting.';
        userPrompt = `Note Title: "${noteTitle}"\n\nContent to Summarize:\n${noteContent}`;
        break;

      case 'actionItems':
        systemPrompt =
          'You are an expert at extracting actionable items. Identify and list the key action items from the provided text in a clear, numbered format. Start directly with the list.';
        userPrompt = `Note Title: "${noteTitle}"\n\nContent:\n${noteContent}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      success: true,
      result: content.text,
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
