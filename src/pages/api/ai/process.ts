import type { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from 'ai';

interface AIRequest {
  prompt: string;
  noteContent: string;
  noteTitle: string;
  action: 'continue' | 'rewrite' | 'summarize' | 'actionItems';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const body: AIRequest = req.body;
    const { prompt, noteContent, noteTitle, action } = body;

    if (!noteContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'continue':
        systemPrompt =
          'You are an intelligent writing assistant. Continue the following note naturally, maintaining the same tone, style, and context. Return only the continuation text without any markdown formatting or explanations. Just provide the natural continuation.';
        userPrompt = `Note Title: "${noteTitle}"\n\nCurrent Content:\n${noteContent}\n\nContinue writing from here naturally:`;
        break;

      case 'rewrite':
        systemPrompt =
          'You are an expert editor. Rewrite the selected text to be more clear, concise, and impactful while maintaining the original meaning and tone. Return only the rewritten text without any markdown formatting or explanations.';
        userPrompt = `Note Title: "${noteTitle}"\n\nFull Note Context:\n${noteContent}\n\nRewrite this selected text:\n${prompt}`;
        break;

      case 'summarize':
        systemPrompt =
          'You are an expert summarizer. Create a concise, clear summary of the provided text, capturing the key points and main ideas. Return only the summary as plain text without any markdown formatting.';
        userPrompt = `Note Title: "${noteTitle}"\n\nContent to Summarize:\n${noteContent}`;
        break;

      case 'actionItems':
        systemPrompt =
          'You are an expert at extracting actionable items. Identify and list the key action items from the provided text. Format as a numbered list. Start directly with the list without any introduction.';
        userPrompt = `Note Title: "${noteTitle}"\n\nContent:\n${noteContent}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 1024,
    });

    return res.status(200).json({
      success: true,
      result: text,
    });
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
