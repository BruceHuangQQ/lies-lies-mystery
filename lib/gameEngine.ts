import gameData from "@/data/game-data.json";

import {
  CaseData,
  Suspect,
  Personality,
  Relationship
} from "@/lib/types/case";

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
            murdererId: this.getRandomItem(suspects).id,
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
}
