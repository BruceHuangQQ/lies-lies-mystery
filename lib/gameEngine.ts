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
}
