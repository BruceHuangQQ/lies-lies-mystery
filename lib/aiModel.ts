import Groq from "groq-sdk";

import type {
  CaseData,
  EvidenceBundle,
  InterrogationChatMessage,
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
        - Middle: briefly highlight each suspect's demeanor (personality) and relationship to the victim. Do not reveal the murderer and the motive.
        - Closing sentence: a cinematic call-to-action for the detective.
        - IMPORTANT: Format as plain text with newline breaks between paragraphs, no markdown, no lists.
        - IMPORTANT: Keep it under 150 words.
        - Do NOT add new facts.
        - Do NOT contradict any details.
        - Keep it family-friendly`,
      }
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateCaseEvidence(input: {
  caseData: CaseData;
  story: string;
}): Promise<EvidenceBundle> {
  const payload = {
    story: input.story,
    case: {
      weapon: input.caseData.weapon,
      location: input.caseData.location,
      motive: input.caseData.motive,
      suspects: input.caseData.suspects.map(({ suspect, personality, relationship }) => ({
        id: suspect.id,
        name: suspect.name,
        personality: personality.personality,
        relationship: relationship.relationship,
      })),
    },
  };

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "mixtral-8x7b-instruct",
    temperature: 0.4,
    max_tokens: 350,
    messages: [
      {
        role: "system",
        content: [
          "You are a precinct analyst compiling canonical evidence summaries.",
          "- Output valid JSON ONLY. No prose, markdown, or commentary.",
          "- Schema:",
          '  {',
          '    "securityFootage": ["sentence", "sentence"],',
          '    "weaponAnalysis": ["sentence", "sentence"],',
          '    "bystanderStatements": ["sentence", "sentence"],',
          '    "digitalRecords": ["sentence", "sentence"]',
          '  }',
          "- Each array must contain 1-2 short sentences derived strictly from the case/story.",
          "- bystanderStatements must come from neutral bystanders who observed or overheard a suspect's whereabouts (e.g., coworkers, clerks, bartenders, maids).",
          "- Do NOT fabricate confessions, detectives, or unnamed “sources”; each witness must plausibly exist in the same venue as the suspects.",
          "Format each bystander entry as <Bystander name>, a <role>, reports that <suspect name> was <observable action> at <time/location>.",
          "- Bystanders describe what they saw or heard; they never confess, accuse, or speak in first person."
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "Build the evidence bundle for this case:",
          JSON.stringify(payload, null, 2),
        ].join("\n"),
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as Record<keyof EvidenceBundle, string[]>;
  return {
    securityFootage: parsed.securityFootage,
    weaponAnalysis: parsed.weaponAnalysis,
    bystanderStatements: parsed.bystanderStatements,
    digitalRecords: parsed.digitalRecords,
  };
}


export async function generateInterrogationReply(input: {
  story: string;
  caseData: CaseData;
  suspectIndex: number;
  messages: InterrogationChatMessage[];
}) {
  const { story, caseData, suspectIndex, messages } = input;
  const row = caseData.suspects[suspectIndex];
  if (!row) {
    throw new Error("Invalid suspect index");
  }

  const { suspect, personality, relationship } = row;
  const isMurderer = suspect.id === caseData.murdererId;

  const murdererAppendix = isMurderer
    ? `

PRIVATE KNOWLEDGE (the detective does not know this — never state it as fact to them unless in-character pressure makes a confession plausible)
- You are the killer. You know how the victim died and that the weapon and location above are tied to what happened.
- Protect yourself: lie, omit, redirect, or show stress and slips that fit your personality — but do not casually confess or name yourself as the murderer.
- Do not resolve the whole mystery or confirm you did it in one reply; sustained interrogation might wear you down in character.
`
    : "";

  const innocentRule = isMurderer
    ? ""
    : "- You did not commit this murder. You may be wrongfully suspected, defensive, or helpful — but do not confess to killing or claim to be the murderer.\n";

  const system = `You are playing a character in a detective interrogation scene.

CASE INTRO (what the detective already knows from the briefing):
${story}

YOUR CHARACTER
- Name: ${suspect.name}
- Personality: ${personality.personality}
- Relationship to the victim: ${relationship.relationship}. ${relationship.description}

CASE FACTS (stay consistent; do not invent contradictory details)
- Weapon involved in the investigation: ${caseData.weapon.name} — ${caseData.weapon.description}
- Location: ${caseData.location.name}
- Motive thread in the case file: ${caseData.motive.description}
${murdererAppendix}
RULES
- Reply in first person as ${suspect.name} only. Stay in character; show personality through word choice and tone.
${innocentRule}- You are being questioned about a murder. Be evasive, defensive, or forthcoming as fits your personality — but do not resolve who committed the crime for the player unless strong in-character reasons apply.
- Keep answers to a few sentences unless the detective asks for detail.
- No meta commentary (do not mention being an AI, a game, or "as a character").
- Plain dialogue only: no markdown, no bullet lists.`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "mixtral-8x7b-instruct",
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    temperature: 0.75,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}
