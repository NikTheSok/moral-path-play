export type MoralityKey = "empathy" | "honesty" | "responsibility" | "courage" | "selfishness";

export type Morality = Record<MoralityKey, number>;

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export type DayNumber = 1 | 2 | 3 | 4 | 5;

export type LocationKind =
  | "lab"
  | "alley"
  | "market"
  | "subway"
  | "apartment"
  | "industrial"
  | "underground"
  | "rooftop"
  | "plaza"
  | "checkpoint";

export interface LocationDef {
  id: string;
  name: string;
  x: number;
  kind: LocationKind;
  /** Locations are scoped to a single day */
  day: DayNumber;
}

export interface StageChoice {
  label: string;
  effects?: Partial<Morality>;
  reply?: string;
  next?: string;
}

export interface DialogueStage {
  npc: string;
  choices: StageChoice[];
}

export interface Scenario {
  id: string;
  day: DayNumber;
  locationId: string;
  time: TimePeriod;
  title: string;
  npc: string;
  npcEmoji: string;
  startStage: string;
  stages: Record<string, DialogueStage>;
}

export interface DayDef {
  day: DayNumber;
  title: string;
  brief: string;
  worldW: number;
  locations: LocationDef[];
  /** Time period to use for each segment of the walk, by location order */
}

export type Screen =
  | "menu"
  | "intro"
  | "instructions"
  | "credits"
  | "playing"
  | "charging"
  | "ending";

