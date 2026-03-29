import gameData from "@/data/game-data.json";

import {
  CaseData,
  Suspect,
  Personality,
  Relationship
} from "@/lib/types/case";

// Must match the number of lineup slots in `app/game/page.tsx`
const SUSPECTS_PER_CASE = 3;

export class GameEngine {
    private data = gameData;
    private currentCase: CaseData | null = null;

    private getRandomItem<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }

    private shuffle<T>(items: readonly T[]): T[] {
        const arr = [...items];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Random subset, shuffled order (who appears left / center / right). */
    private pickRandomSuspects(pool: Suspect[], count: number): Suspect[] {
        const n = Math.min(Math.max(1, count), pool.length);
        return this.shuffle(pool).slice(0, n);
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
        const pool = this.data.suspects;
        const suspects = this.pickRandomSuspects(pool, SUSPECTS_PER_CASE);
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
