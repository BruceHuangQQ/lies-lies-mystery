import gameData from "@/data/game-data.json";
import fs from "fs";
import path from "path";

type Suspect = {
    id: number;
    name: string;
};

type Personality = {
    id: number;
    personality: string;
};

type Relationship = {
    id: number;
    relationship: string;
    description: string;
};

type Weapon = {
    id: number;
    name: string;
    description: string;
};

type Location = {
    id: number;
    name: string;
};

type Motive = {
    id: number;
    description: string;
};

type CaseData = {
    suspects: Array<{
        suspect: Suspect;
        personality: Personality;
        relationship: Relationship;
    }>;
    weapon: Weapon;
    location: Location;
    motive: Motive;
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

        const filePath = path.join(process.cwd(), "data", "generated-case.json");
        fs.writeFileSync(filePath, JSON.stringify(this.currentCase, null, 2), "utf8");

        return this.currentCase;
    }

    public getCaseData(): CaseData | null {
        return this.currentCase;
    }

    public resetCase(): CaseData {
        return this.generateCase();
    }
}
