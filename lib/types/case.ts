export type Suspect = { id: number; name: string };
export type Personality = { id: number; personality: string };
export type Relationship = { id: number; relationship: string; description: string };
export type Weapon = { id: number; name: string; description: string };
export type Location = { id: number; name: string };
export type Motive = { id: number; description: string };

export type CaseData = {
  suspects: Array<{
    suspect: Suspect;
    personality: Personality;
    relationship: Relationship;
  }>;
  weapon: Weapon;
  location: Location;
  motive: Motive;
};

export type StoryPayload = {
  caseData: CaseData;
  story: string;
};
