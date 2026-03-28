import gameData from "@/data/game-data.json";

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
}
