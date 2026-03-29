import { NextResponse } from "next/server";
import { GameEngine } from "@/lib/gameEngine";
import { generateStory } from "@/lib/aiModel";

export async function POST() {
  try {
    const engine = new GameEngine();
    const caseData = engine.generateCase();
    const story = await generateStory(caseData);

    engine.updateCaseStory(story); // writes to data/case-file.json
    return NextResponse.json({ caseData, story });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
