// backend/llm.js

import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateUpdatedSection(sectionText, feedbackSummary) {
  const prompt = `
You are helping a professor improve lecture notes.

Original section:
"""
${sectionText}
"""

Student feedback:
${JSON.stringify(feedbackSummary, null, 2)}

Rewrite ONLY this section to reduce confusion while preserving technical accuracy.
Return ONLY the new text.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content.trim();
}

