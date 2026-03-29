import { NextResponse } from "next/server";

import { generateInterrogationReply } from "@/lib/aiModel";
import type { CaseData, InterrogationChatMessage } from "@/lib/types/case";

type Body = {
  story?: string;
  caseData?: CaseData;
  suspectIndex?: number;
  messages?: InterrogationChatMessage[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { story, caseData, suspectIndex, messages } = body;

    if (
      typeof story !== "string" ||
      !caseData ||
      typeof suspectIndex !== "number" ||
      !Array.isArray(messages)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (
      suspectIndex < 0 ||
      suspectIndex >= caseData.suspects.length
    ) {
      return NextResponse.json(
        { error: "Invalid suspect index" },
        { status: 400 }
      );
    }

    for (const m of messages) {
      if (
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string"
      ) {
        return NextResponse.json(
          { error: "Invalid messages" },
          { status: 400 }
        );
      }
    }

    const reply = await generateInterrogationReply({
      story,
      caseData,
      suspectIndex,
      messages,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
