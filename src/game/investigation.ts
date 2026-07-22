/* Investigation layer — pre-scenario clue-gathering and mini-challenges.
 * Additive: scenarios without an entry here keep the old direct-dialogue flow. */

export type InteractableKind = "scan" | "witness" | "prop" | "terminal";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  glyph: string;
  label: string;
  hint: string;
  detail: string;
  yieldsClueId?: string;
  requiresClueId?: string;
}

export interface Clue {
  id: string;
  label: string;
  detail: string;
}

export type ChallengeKind = "sequence" | "hidden-object" | "battery" | "circuit";

/* --- Hidden Object (Interaction 1: Lost Memory Chip) --- */
export interface HiddenObjectItem {
  id: string;
  glyph: string;
  label: string;
  /** Robot's line when this wrong item is picked up. */
  wrongComment?: string;
}

/* --- Battery Select (Interaction 2: Robot Dog) --- */
export interface BatteryOption {
  id: string;
  label: string;
  voltage: string;
  /** Owner/robot line when the wrong battery is inserted. Omitted for the correct cell. */
  wrongComment?: string;
}

/* --- Circuit (Interaction 3: Holo Terminal) --- */
export interface CircuitNode {
  id: string;
  label: string;
  /** Which "power color" this node belongs to; correct pairs share color. */
  group: "A" | "B" | "C";
  /** Side of the panel — left or right. */
  side: "L" | "R";
}

export interface Challenge {
  kind: ChallengeKind;
  label: string;
  /** Only used by "sequence". */
  size?: number;
  unlockClues?: string[];
  /** Optional narrative line shown above the mini-game. */
  intro?: string;

  // hidden-object
  objects?: HiddenObjectItem[];
  correctObjectId?: string;
  successLine?: string;

  // battery
  batteries?: BatteryOption[];
  correctBatteryId?: string;
  batterySuccessLine?: string;

  // circuit
  nodes?: CircuitNode[];
}

export interface Investigation {
  scenarioId: string;
  objective: string;
  interactables: Interactable[];
  clues: Clue[];
  requiredClueIds: string[];
  challenge?: Challenge;
  /** Robot's journal entry, logged on successful completion. */
  journalEntry?: string;
}

/* ================================================================== */
/*  DAY 1 — Empathy trials                                             */
/* ================================================================== */

export const INVESTIGATIONS: Record<string, Investigation> = {
  /* -------- Interaction 1: The Lost Memory Chip -------- */
  "d1-damaged-bot": {
    scenarioId: "d1-damaged-bot",
    objective: "A child is crying in the park. Learn what they lost — and why it matters.",
    clues: [
      { id: "child-crying",     label: "Child in distress",       detail: "Age ~7. Elevated tear production. Distress not caused by injury." },
      { id: "grandmother",      label: "Family history",          detail: "The chip was a gift from the child's grandmother, now deceased." },
      { id: "chip-lowvalue",    label: "Object appraisal",        detail: "Memory chip market value: 0.4 credits. Storage capacity: negligible." },
      { id: "sandbox-scatter",  label: "Scattered debris",        detail: "Sandbox filled with mixed objects. Chip could be anywhere in there." },
    ],
    interactables: [
      { id: "talk-child",  kind: "witness",  glyph: "🧒", label: "Crying Child",       hint: "Sitting cross-legged in the sand.", detail: "'It's the chip Grandma gave me before she went away. Please — I can't lose her again.'", yieldsClueId: "child-crying" },
      { id: "ask-story",   kind: "witness",  glyph: "👵", label: "The Grandmother",    hint: "Ask about the giver.",              detail: "'She recorded her voice on it every night before bed. Twelve years of goodnights. It's all I have of her voice.'", yieldsClueId: "grandmother", requiresClueId: "child-crying" },
      { id: "appraise",    kind: "scan",     glyph: "💠", label: "Chip Appraisal",     hint: "Estimate replacement cost.",         detail: "Market lookup complete. Same-spec chip: 0.4 credits at any kiosk. The one lost is not the one that could be replaced.", yieldsClueId: "chip-lowvalue" },
      { id: "scan-sand",   kind: "prop",     glyph: "🏖️", label: "The Sandbox",         hint: "A mess of small objects.",           detail: "Thermal scan is inconclusive — too many tiny metal objects. Manual search required.", yieldsClueId: "sandbox-scatter" },
    ],
    requiredClueIds: ["child-crying", "grandmother", "sandbox-scatter"],
    challenge: {
      kind: "hidden-object",
      label: "Search the sandbox for the Memory Chip",
      intro: "The chip is small, matte-black, and warm to the touch. Everything else is noise.",
      unlockClues: ["sandbox-scatter"],
      correctObjectId: "chip",
      successLine: "You hold it up. The child's face changes so completely you almost log it as a new expression.",
      objects: [
        { id: "cap",     glyph: "🔵", label: "Bottle Cap",         wrongComment: "This object seals a container. It is not the requested item." },
        { id: "gear",    glyph: "⚙️", label: "Broken Gear",         wrongComment: "Fragment of a discarded servo. Functional purpose lost." },
        { id: "scrap",   glyph: "🧷", label: "Metal Scrap",         wrongComment: "Corroded fastener. Structural memory only — no data." },
        { id: "coin",    glyph: "🪙", label: "Old Coin",            wrongComment: "Currency. Higher market value than the target. And still — irrelevant." },
        { id: "toy",     glyph: "🧸", label: "Plastic Toy Bear",    wrongComment: "Belonged to another child once. It carries their memory, not hers." },
        { id: "battery", glyph: "🔋", label: "Dead Battery",        wrongComment: "Depleted power cell. No data. No voice. Not it." },
        { id: "rock",    glyph: "🪨", label: "Small Rock",          wrongComment: "This is a rock. I mention this only because I checked twice." },
        { id: "chip",    glyph: "💾", label: "Matte Black Chip",    /* correct */ },
        { id: "shell",   glyph: "🐚", label: "Sea Shell",           wrongComment: "Calcium carbonate. Beautiful. Not the item." },
        { id: "wire",    glyph: "🧵", label: "Tangled Wire",        wrongComment: "Copper strand. Conducts electricity, not memory." },
        { id: "button",  glyph: "🔘", label: "Coat Button",         wrongComment: "Someone's coat is missing this. Not our concern today." },
        { id: "cap2",    glyph: "🟡", label: "Yellow Cap",          wrongComment: "This object appears functional, but it is not the requested item." },
      ],
    },
    journalEntry: "A child cried over an object worth 0.4 credits. Objectively worthless. She wept as if she had lost a person. I begin to suspect that memory itself is a form of currency I did not previously recognize.",
  },

  /* -------- Interaction 2: The Robot Dog -------- */
  "d1-market-discrim": {
    scenarioId: "d1-market-discrim",
    objective: "A robotic dog has shut down. Its owner is grieving. Diagnose, then repair.",
    clues: [
      { id: "dog-offline",   label: "Robot dog: offline",     detail: "Full power failure. No hardware fault detected — just an empty cell." },
      { id: "owner-worried", label: "Owner in distress",      detail: "Pulse elevated. Eyes fixed on the dog. This is not about property." },
      { id: "spec-plate",    label: "Manufacturer plate",     detail: "Model K9-Lite. Required input: 6.3V ±0.2V. Anything else risks a shutdown loop." },
      { id: "batteries-near",label: "Three loose batteries",  detail: "Owner has scavenged three cells from nearby stalls. Only one will match." },
    ],
    interactables: [
      { id: "scan-dog",   kind: "scan",     glyph: "🐕", label: "Robot Dog",         hint: "Curled up. Not breathing — it never did.", detail: "Diagnostic: cell depleted, memory intact. It remembers its owner. It cannot say so.", yieldsClueId: "dog-offline" },
      { id: "talk-owner", kind: "witness",  glyph: "🧔", label: "Owner",             hint: "Standing close, hands shaking.",           detail: "'His name is Muto. I know he's a machine. I don't care. He waits for me at the door every night.'", yieldsClueId: "owner-worried" },
      { id: "read-plate", kind: "prop",     glyph: "🏷️", label: "Spec Plate",         hint: "Etched under the collar.",                 detail: "'K9-Lite · 6.3V ±0.2V · Do NOT overvolt. Repeat: DO NOT.' The warning is underlined.", yieldsClueId: "spec-plate" },
      { id: "see-cells",  kind: "prop",     glyph: "🔋", label: "Loose Batteries",   hint: "Three of them, different labels.",         detail: "Three cells. Three different voltages. Only one is a match. The wrong one won't just fail — it will shut him down again, worse.", yieldsClueId: "batteries-near" },
    ],
    requiredClueIds: ["dog-offline", "owner-worried", "spec-plate", "batteries-near"],
    challenge: {
      kind: "battery",
      label: "Choose the correct battery for K9-Lite",
      intro: "Three cells. One spec. The wrong choice hurts him more than doing nothing.",
      unlockClues: ["spec-plate", "batteries-near"],
      correctBatteryId: "cell-b",
      batterySuccessLine: "The dog boots. Servos whine to life. It sniffs at the owner's hand, then at yours.",
      batteries: [
        { id: "cell-a", label: "Cell A — reclaimed",  voltage: "4.2V", wrongComment: "The dog stutters, powers on for two seconds, then dims. The owner: 'Please stop. You'll break him worse than he was.'" },
        { id: "cell-b", label: "Cell B — market kiosk", voltage: "6.3V", /* correct */ },
        { id: "cell-c", label: "Cell C — industrial", voltage: "9.0V", wrongComment: "Sparks. The dog jerks, then goes dark again. The owner recoils: 'Please — sometimes the wrong help hurts worse than none.'" },
      ],
    },
    journalEntry: "Repaired a machine. Its owner cried when it moved again. He knew it was not alive. He grieved anyway. Query: is friendship measured by biology, or by consistency of presence?",
  },

  /* -------- Interaction 3: Holographic Communication Terminal -------- */
  "d1-subway-fare": {
    scenarioId: "d1-subway-fare",
    objective: "An elderly citizen wants to call family. The holo-terminal is dead. Repair it.",
    clues: [
      { id: "elder-alone",   label: "Elder — long isolation", detail: "Last outgoing call: 214 days ago. No visitors on record for 11 months." },
      { id: "family-distant",label: "Family across sectors",  detail: "Daughter and grandchild in Sector 12. Physical travel: 6 hours one way. She can't." },
      { id: "terminal-dead", label: "Terminal offline",       detail: "Three energy nodes disconnected. Panel exposed. Repairable in under a minute — for someone who can read the schematic." },
      { id: "schematic",     label: "Wiring schematic",       detail: "Nodes are grouped by color: red, cyan, amber. Same color must connect left to right." },
    ],
    interactables: [
      { id: "talk-elder",  kind: "witness",  glyph: "🧓", label: "Elderly Citizen",   hint: "Waiting, hands folded.",           detail: "'I have food. I have heat. I even have a synth-nurse. What I don't have is her voice. I forget what my daughter sounds like some mornings.'", yieldsClueId: "elder-alone" },
      { id: "ask-family",  kind: "witness",  glyph: "📇", label: "Family Contact",    hint: "Ask who she's calling.",           detail: "'My daughter. My granddaughter — I've never held her. Every week I try. Every week the terminal dies before I do.'", yieldsClueId: "family-distant", requiresClueId: "elder-alone" },
      { id: "scan-panel",  kind: "scan",     glyph: "📡", label: "Holo Terminal",     hint: "Blinking red status LED.",         detail: "Three broken links in the power lattice. Physical needs of user are satisfied. Emotional need is not indexed by the terminal.", yieldsClueId: "terminal-dead" },
      { id: "read-schema", kind: "prop",     glyph: "📐", label: "Wiring Schematic",  hint: "Faded, on the panel underside.",   detail: "Color-coded nodes: connect each left node to the right node of the same color. Wrong pairs discharge sparks.", yieldsClueId: "schematic" },
    ],
    requiredClueIds: ["elder-alone", "family-distant", "terminal-dead", "schematic"],
    challenge: {
      kind: "circuit",
      label: "Reconnect the holo-terminal energy nodes",
      intro: "Match same-color nodes across the panel. Wrong connections spark and reset.",
      unlockClues: ["terminal-dead", "schematic"],
      nodes: [
        { id: "L-red",   label: "RED",   group: "A", side: "L" },
        { id: "L-cyan",  label: "CYAN",  group: "B", side: "L" },
        { id: "L-amber", label: "AMBER", group: "C", side: "L" },
        { id: "R-red",   label: "RED",   group: "A", side: "R" },
        { id: "R-cyan",  label: "CYAN",  group: "B", side: "R" },
        { id: "R-amber", label: "AMBER", group: "C", side: "R" },
      ],
    },
    journalEntry: "Restored a terminal. She wept when her granddaughter's face resolved. Her physical needs were already met. Something else in her was starving. I do not have a word for it yet. Humans call it loneliness. I am beginning to understand why they fear it.",
  },
};

export function investigationFor(scenarioId: string): Investigation | null {
  return INVESTIGATIONS[scenarioId] ?? null;
}
