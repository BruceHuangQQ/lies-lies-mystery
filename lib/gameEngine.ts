import gameData from "@/data/game-data.json";
import fs from "fs";
import path from "path";

import {
  CaseData,
  Suspect,
  Personality,
  Relationship
} from "@/lib/types/case";

type CaseFileContent = {
        title: string;
        description: string;
        storyBadge: string;
        story: string;
        instructionBadge: string;
        howToPlay: string;
        ctaLabel: string;
        ctaHref: string;
        suspects: Array<{ id: string; name: string; image: string }>;
};

export class GameEngine {
    private data = gameData;
    private currentCase: CaseData | null = null;

    private getRandomItem<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }

    private assignDetailsToSuspects(suspects: Suspect[]): Array<{
        suspect: Suspect;
        personality: Personality;
        relationship: Relationship;
    }> {
        return suspects.map((suspect) => ({
            suspect,
            personality: this.getRandomItem(this.data.personalities),
            relationship: this.getRandomItem(this.data.relationship_with_victim),
        }));
    }

    public generateCase() {
        const suspects = this.data.suspects;
        const suspectsWithDetails = this.assignDetailsToSuspects(suspects);
        const weapon = this.getRandomItem(this.data.weapons);
        const location = this.getRandomItem(this.data.locations);
        const motive = this.getRandomItem(this.data.motives);

        this.currentCase = {
            suspects: suspectsWithDetails,
            weapon,
            location,
            motive,
        };

        return this.currentCase;
    }

    public getCaseData(): CaseData | null {
        return this.currentCase;
    }

    public resetCase(): CaseData {
        return this.generateCase();
    }

    public updateCaseStory(story: string) {
        const filePath = path.join(process.cwd(), "data", "case-file.json");
        const fileContents = fs.readFileSync(filePath, "utf8");
        let json: CaseFileContent;
        try {
            json = JSON.parse(fileContents);
        } catch (err) {
            throw new Error("Failed to parse case-file.json");
        }

        json.story = story;

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");

        return json;
    }
}
