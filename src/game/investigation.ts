/* Investigation layer — pre-scenario clue-gathering and challenges.
 * Additive: scenarios without an entry here keep the old direct-dialogue flow. */

export type InteractableKind = "scan" | "witness" | "prop" | "terminal";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  glyph: string;          // emoji/pixel glyph shown on the card
  label: string;          // short name, e.g. "Broken drone"
  hint: string;           // one-line tease before inspection
  detail: string;         // narrative readout revealed when inspected
  yieldsClueId?: string;  // clue logged on inspect
  requiresClueId?: string;// gate: only available after this clue is found
}

export interface Clue {
  id: string;
  label: string;
  detail: string;
}

export type ChallengeKind = "sequence" | "rewire";

export interface Challenge {
  kind: ChallengeKind;
  label: string;
  /** Difficulty knob: sequence length or rewire pair count. */
  size: number;
  /** Optional: challenge only appears after these clues are logged. */
  unlockClues?: string[];
}

export interface Investigation {
  scenarioId: string;
  objective: string;
  interactables: Interactable[];
  clues: Clue[];
  requiredClueIds: string[];   // all must be logged before proceeding
  challenge?: Challenge;
}

/* Day-1 investigations. Days 2-5 fall through to the old flow (unchanged). */
export const INVESTIGATIONS: Record<string, Investigation> = {
  "d1-damaged-bot": {
    scenarioId: "d1-damaged-bot",
    objective: "A service drone is failing in the alley. Assess the situation before deciding.",
    clues: [
      { id: "coolant-leak",  label: "Coolant leak",        detail: "Blue fluid pools beneath its joint. Repairable — barely." },
      { id: "no-owner",      label: "Registry: orphaned",  detail: "Its owner-tag was manually severed. Deliberate abandonment." },
      { id: "eye-flicker",   label: "Failing eye-light",   detail: "Distress loop cycling at 0.4Hz. Twelve iterations logged." },
      { id: "signal-fixed",  label: "Rerouted signal",     detail: "Its distress ping now reaches a repair stall two blocks over." },
    ],
    interactables: [
      { id: "scan-body",   kind: "scan",     glyph: "🤖", label: "Damaged Service Unit", hint: "Twitching, rain-slick.",        detail: "Scan complete: coolant hemorrhage from left-hip joint. Core intact.", yieldsClueId: "coolant-leak" },
      { id: "read-tag",    kind: "prop",     glyph: "🏷️", label: "Chassis Tag",           hint: "Barcode partially scratched.",    detail: "Owner field wiped by human hand. This drone was thrown away.",         yieldsClueId: "no-owner" },
      { id: "listen-loop", kind: "prop",     glyph: "📶", label: "Distress Beacon",       hint: "Faint audio loop.",              detail: "'P-please... my owner...' Twelve loops. No one has heard it but you.", yieldsClueId: "eye-flicker" },
      { id: "reroute",     kind: "terminal", glyph: "🛠️", label: "Repair Signal Relay",   hint: "Requires a live diagnostic.",     detail: "You reroute its distress ping to a nearby repair stall.", yieldsClueId: "signal-fixed", requiresClueId: "coolant-leak" },
    ],
    requiredClueIds: ["coolant-leak", "no-owner", "eye-flicker"],
    challenge: {
      kind: "sequence",
      label: "Rewire coolant relay",
      size: 4,
      unlockClues: ["coolant-leak"],
    },
  },

  "d1-market-discrim": {
    scenarioId: "d1-market-discrim",
    objective: "The vendor is refusing service. Gather perspectives before you respond.",
    clues: [
      { id: "policy-poster", label: "Company policy poster",  detail: "'SYNTHETIC SERVICE PENDING BOARD REVIEW.' Vague. Legally void." },
      { id: "vendor-fear",   label: "Vendor is scared",       detail: "His hands shake. He glances at a corporate-liaison badge under the counter." },
      { id: "witness-woman", label: "Shopper — sympathetic",  detail: "'This is embarrassing. He's been told to do this. He didn't invent it.'" },
      { id: "child-watches", label: "Child is watching",      detail: "A small human, six or seven, tracks your every move. They will remember this." },
    ],
    interactables: [
      { id: "scan-vendor",  kind: "scan",    glyph: "🧑‍💼", label: "Holo-Vendor",       hint: "Elevated stress signature.",   detail: "Pulse 118bpm. Cortisol spike. He is performing hostility, not choosing it.", yieldsClueId: "vendor-fear" },
      { id: "read-poster",  kind: "prop",    glyph: "📜", label: "Store Notice",       hint: "Behind the counter.",          detail: "Policy citation with no signature. A rumor made official.", yieldsClueId: "policy-poster" },
      { id: "talk-woman",   kind: "witness", glyph: "👩", label: "Shopper (Coexist)",  hint: "Waiting to speak.",            detail: "'Just serve them. This is embarrassing. He's not evil — he's just scared of losing his badge.'", yieldsClueId: "witness-woman" },
      { id: "see-child",    kind: "witness", glyph: "🧒", label: "Watching Child",     hint: "Silent. Staring.",             detail: "The child studies you like you're an exhibit. Whatever you do here, they inherit.", yieldsClueId: "child-watches" },
    ],
    requiredClueIds: ["vendor-fear", "policy-poster", "witness-woman"],
  },

  "d1-subway-fare": {
    scenarioId: "d1-subway-fare",
    objective: "A commuter is stranded at the last train. Learn why before you act.",
    clues: [
      { id: "hospital-msg", label: "Hospital message",     detail: "Her wristband shows a pending visitor pass — Sector 4 General, expires tonight." },
      { id: "gate-exploit", label: "Gate exploit",         detail: "The turnstile firmware has a 300ms latency window. Trivially bypassable." },
      { id: "camera-live",  label: "Live security camera", detail: "The camera is actively transmitting. Whatever happens will be seen." },
      { id: "coins",        label: "Her coin count",       detail: "She's three credits short. Not thirty. Not thirty thousand. Three." },
    ],
    interactables: [
      { id: "talk-woman", kind: "witness",  glyph: "🧑", label: "Stranded Commuter", hint: "Counting coins.",                 detail: "'My mother is in the hospital one stop over. I only have three credits short. Please —'", yieldsClueId: "hospital-msg" },
      { id: "count",      kind: "scan",     glyph: "🪙", label: "Loose Credits",     hint: "In her palm.",                    detail: "Exactly three credits below fare. She isn't scamming — she's just short.", yieldsClueId: "coins" },
      { id: "gate",       kind: "terminal", glyph: "🚪", label: "Fare Turnstile",    hint: "Firmware readable to your kind.", detail: "Latency window: 300ms. A bypass would work. It would also be logged as tampering.", yieldsClueId: "gate-exploit" },
      { id: "cam",        kind: "prop",     glyph: "📷", label: "Security Camera",   hint: "Blinking red.",                   detail: "Live feed to Sector 4 transit security. Everything you do here is on record.", yieldsClueId: "camera-live" },
    ],
    requiredClueIds: ["hospital-msg", "coins", "gate-exploit"],
    challenge: {
      kind: "sequence",
      label: "Read the turnstile firmware",
      size: 5,
      unlockClues: ["gate-exploit"],
    },
  },
};

export function investigationFor(scenarioId: string): Investigation | null {
  return INVESTIGATIONS[scenarioId] ?? null;
}
