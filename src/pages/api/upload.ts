import type { NextApiRequest, NextApiResponse } from "next";
import pdf from "pdf-parse";

export const config = { api: { bodyParser: { sizeLimit: "15mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const buf = Buffer.from(await req.body); // if using raw body, otherwise use formidable/multer
  try {
    const data = await pdf(buf);
    return res.status(200).json({ text: data.text });
  } catch (e) {
      return res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
   }
}
