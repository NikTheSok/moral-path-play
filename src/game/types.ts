export type MoralityKey = "empathy" | "honesty" | "responsibility" | "courage" | "selfishness";

export type Morality = Record<MoralityKey, number>;

export type TimePeriod = "morning" | "afternoon" | "evening";

export type LocationId =
  | "home"
  | "busStop"
  | "school"
  | "park"
  | "store"
  | "cafe"
  | "streetCorner";

export interface LocationDef {
  id: LocationId;
  name: string;
  x: number; // world coords
  y: number;
  color: string; // css var
  emoji: string;
}

export interface Choice {
  label: string;
  effects: Partial<Morality>;
  response: string;
}

export interface Scenario {
  id: string;
  location: LocationId;
  time: TimePeriod;
  title: string;
  npc: string;
  npcEmoji: string;
  prompt: string;
  choices: Choice[];
}

export type Screen = "menu" | "instructions" | "playing" | "stats" | "ending";
