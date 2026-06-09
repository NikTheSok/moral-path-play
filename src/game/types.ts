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
  x: number; // world X coord (linear side-scroller)
  emoji: string;
  /** Visual building style for the pixel art */
  kind: "house" | "shop" | "school" | "park" | "stop" | "corner" | "cafe";
}

export interface StageChoice {
  label: string;
  effects?: Partial<Morality>;
  /** NPC's reaction line after picking this choice */
  reply?: string;
  /** Next stage id. If undefined, this choice ends the scenario. */
  next?: string;
}

export interface DialogueStage {
  /** What the NPC says at the start of this stage */
  npc: string;
  choices: StageChoice[];
}

export interface Scenario {
  id: string;
  location: LocationId;
  time: TimePeriod;
  title: string;
  npc: string;
  npcEmoji: string;
  startStage: string;
  stages: Record<string, DialogueStage>;
}

export type Screen = "menu" | "instructions" | "playing" | "stats" | "ending";
