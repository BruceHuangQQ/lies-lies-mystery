import { NextResponse } from "next/server";
import { GameEngine } from "@/lib/gameEngine";
import { generateCaseEvidence, generateStory } from "@/lib/aiModel";

export async function POST() {
  try {
    const engine = new GameEngine();
    const caseData = engine.generateCase();
    const story = await generateStory(caseData);
    const evidence = await generateCaseEvidence({ caseData, story });

    const caseId = crypto.randomUUID();

    return NextResponse.json({ caseData, story, caseId, evidence });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
