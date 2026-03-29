import Groq from "groq-sdk";

import {
  CaseData
} from "@/lib/types/case";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function generateStory(caseData: CaseData) {

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "mixtral-8x7b-instruct",
    messages: [
      {
        role: "system",
        content: "You are an award-winning mystery novelist crafting atmospheric detective intros. Keep language vivid, tense, and grounded in the provided facts. Never reveal the culprit or resolve the crime; focus on setting the scene and hinting at motives and tensions. Maximum 4 short paragraphs. Mention the victim and each suspect exactly once if possible, weaving in their personalities, relationships, motive, and the chosen weapon/location. End with a hook that invites interrogation.",
      },
      {
        role: "user",
        content: `Generate a fresh case-story for our game using this structured data: ${JSON.stringify(caseData)}, write a tense intro paragraph for the detective case.
        Requirements:
        - Opening: establish the victim, murder scene, and the unsettling mood.
        - Middle: briefly highlight each suspect's demeanor (personality), relationship to the victim, and lurking motive.
        - Closing sentence: a cinematic call-to-action for the detective.
        - Format as plain text with newline breaks between paragraphs, no markdown, no lists.
        - Keep it under 150 words.
        - Do NOT add new facts
        - Do NOT contradict any details
        - Keep it family-friendly`,
      }
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
