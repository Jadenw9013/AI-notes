import OpenAI from "openai";

export const config = { runtime: "edge" }; // faster streaming

const systemPrompt =
  "You are a concise writing assistant. When asked to continue, write in the user's current style. When asked to rewrite, preserve meaning.";

export default async function handler(req: Request) {
  const { mode, text, selection, instruction } = await req.json();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const user = (() => {
    switch (mode) {
      case "continue":
        return `Continue this note naturally from the cursor:\n---\n${text}\n---`;
      case "rewrite":
        return `Rewrite the SELECTED text with this style guide: "${instruction ?? "improve clarity"}". 
                Original:\n"""${selection}"""\nReturn only the rewritten text.`;
      case "summarize":
        return `Summarize the following into 3–5 bullets with verbs first:\n"""${selection || text}"""`;
      case "todos":
        return `Extract action items as a bullet list with checkboxes:\n"""${selection || text}"""`;
      default:
        return instruction ?? "Help with this note:";
    }
  })();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: user },
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const token = chunk.choices[0]?.delta?.content ?? "";
        if (token) controller.enqueue(encoder.encode(token));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
