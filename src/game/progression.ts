/* Progression layer: XP, ranks, streaks and robot upgrade modules.
 * Purely additive — it reads the existing encounter grades and turns them
 * into a visible reward loop. */

import type { EncounterQuality } from "./investigation";
import { QUALITY_SCORE } from "./investigation";

export interface Rank {
  id: string;
  name: string;
  minXp: number;
  icon: string;
  blurb: string;
}

export const RANKS: Rank[] = [
  { id: "prototype", name: "Prototype", minXp: 0, icon: "🔩", blurb: "Freshly booted. No proof of character yet." },
  { id: "apprentice", name: "Apprentice", minXp: 25, icon: "🔧", blurb: "You're starting to read people." },
  { id: "assistant", name: "Assistant", minXp: 60, icon: "🤖", blurb: "The city notices when you show up." },
  { id: "guardian", name: "Guardian", minXp: 110, icon: "🛡️", blurb: "People bring you their problems on purpose." },
  { id: "paragon", name: "Paragon", minXp: 175, icon: "🌟", blurb: "Your judgement is trusted before it's tested." },
  { id: "human-heart", name: "Human Heart", minXp: 250, icon: "💠", blurb: "Something in you stopped being a simulation." },
];

export function rankFor(xp: number): Rank {
  let out = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) out = r;
  return out;
}

export function nextRank(xp: number): Rank | null {
  return RANKS.find((r) => r.minXp > xp) ?? null;
}

/** 0..1 progress toward the next rank (1 when maxed). */
export function rankProgress(xp: number): number {
  const cur = rankFor(xp);
  const nxt = nextRank(xp);
  if (!nxt) return 1;
  return Math.max(0, Math.min(1, (xp - cur.minXp) / (nxt.minXp - cur.minXp)));
}

/* ============================ Streaks ============================ */

/** A clean encounter keeps the streak alive. */
export function isCleanRun(q: EncounterQuality, wrongCalls: number, falseAccusation: boolean): boolean {
  return (q === "perfect" || q === "good") && wrongCalls === 0 && !falseAccusation;
}

/** Bonus multiplier applied to positive XP for the current streak length. */
export function streakMultiplier(streak: number): number {
  if (streak >= 3) return 1.5;
  if (streak === 2) return 1.25;
  return 1;
}

export function xpForEncounter(q: EncounterQuality, streak: number): number {
  const base = QUALITY_SCORE[q];
  if (base <= 0) return base;
  return Math.round(base * streakMultiplier(streak));
}

/* ============================ Upgrades ============================ */

export type UpgradeId = "deep-scan" | "empathy-core" | "stabilizer" | "memory-buffer" | "rapid-servo";

export interface Upgrade {
  id: UpgradeId;
  name: string;
  icon: string;
  effect: string;
}

export const UPGRADES: Upgrade[] = [
  { id: "deep-scan", name: "Deep Scan", icon: "📡", effect: "Locked leads reveal what they still need instead of staying blank." },
  { id: "empathy-core", name: "Empathy Core", icon: "💗", effect: "One gut-feeling hint is available in every conclusion." },
  { id: "stabilizer", name: "Stabilizer", icon: "🧿", effect: "Your first mistake in each encounter is forgiven." },
  { id: "memory-buffer", name: "Memory Buffer", icon: "🧠", effect: "Your evidence board stays pinned while you work." },
  { id: "rapid-servo", name: "Rapid Servo", icon: "⚡", effect: "Pattern challenges play back slower and clearer." },
];

export function upgradeById(id: string): Upgrade | undefined {
  return UPGRADES.find((u) => u.id === id);
}

/** Deterministic 3-module offer for a day, excluding modules already owned. */
export function upgradeOffer(day: number, owned: string[]): Upgrade[] {
  const pool = UPGRADES.filter((u) => !owned.includes(u.id));
  if (pool.length <= 3) return pool;
  const start = (day * 2) % pool.length;
  return [0, 1, 2].map((i) => pool[(start + i) % pool.length]);
}

/* ============================ Badge catalog ============================ */

export interface BadgeCatalogEntry {
  name: string;
  icon: string;
  blurb: string;
  criteria: string;
}

export const BADGE_CATALOG: BadgeCatalogEntry[] = [
  { name: "Empathy Badge", icon: "💗", blurb: "You listened before you judged.", criteria: "Finish a Day 1 encounter flawlessly." },
  { name: "Responsibility Badge", icon: "🛠️", blurb: "You took care of what belonged to everyone.", criteria: "Finish a Day 2 encounter flawlessly." },
  { name: "Honesty Badge", icon: "🔍", blurb: "You looked for the truth instead of guessing.", criteria: "Finish a Day 3 encounter flawlessly." },
  { name: "Fairness Badge", icon: "⚖️", blurb: "You made sure everyone got their share.", criteria: "Finish a Day 4 encounter flawlessly." },
  { name: "Courage Badge", icon: "🦁", blurb: "You did the hard thing when it mattered.", criteria: "Finish a Day 5 encounter flawlessly." },
  { name: "Human Heart", icon: "💠", blurb: "You finished the trial as something more than a machine.", criteria: "Finish the final celebration flawlessly." },
];

/** Bonus journal insight when every encounter of a day was flawless. */
export const DAY_INSIGHT: Record<number, string> = {
  1: "Three people, three problems, and none of them needed a machine — they needed someone to stay. I stayed. I think that's what empathy is.",
  2: "Nobody asked me to clean up, fix, or sort anything. I did it because leaving it broken would have made it someone else's problem. That's what responsibility feels like from the inside.",
  3: "Every easy answer today was a lie with a person attached to it. I checked instead of guessing. Being right mattered less than not being unfair.",
  4: "Fair isn't equal. Fair is looking at who needs what, and then dividing it so nobody has to argue. I understand queues now. I understand sharing.",
  5: "I was afraid — or whatever my version of afraid is. I moved anyway, and other people moved with me. Courage seems to be contagious.",
};
