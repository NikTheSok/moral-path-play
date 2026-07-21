# Gameplay Redesign — From Quiz to Investigation

## Goal

Keep everything visible today (pixel-art city, robot, drone, 5 days, morality, reputation, save, endings, menus). Change **how a scenario plays out**: instead of walking up to an NPC and immediately picking a dialogue option, the player must scan, interact with props, talk to multiple sources, and complete a short challenge before the moral choice unlocks.

## New per-scenario loop

```text
Enter location  →  Objective posted
   ↓
Explore & Scan (S key)  →  clues logged
Interact with props (E key)  →  more clues / mini-challenge
Talk to 2–3 NPCs (witness / victim / bystander)  →  perspectives
   ↓
Short challenge (30–90s): hack / rewire / repair / lockpick
   ↓
Moral choice unlocks in existing DialogueBox
   ↓
Immediate reply  +  flag stored for later days
```

The moral-decision UI itself stays the same, so the "quiz" is now the last beat of a real investigation, not the whole scenario.

## What changes in the codebase

Preserves current architecture; extends types and adds a small investigation layer alongside `stages`.

### 1. Data model (`src/game/types.ts`, `src/game/scenarios.ts`)

Extend `Scenario` with an optional `investigation` block. Scenarios without it keep working (backwards compatible), so we can migrate day-by-day.

```ts
interface Clue { id: string; label: string; detail: string; }
interface Interactable {
  id: string; kind: "scan" | "prop" | "npc";
  x: number;                  // world-space, relative to location
  sprite: "terminal" | "body" | "camera" | "panel" | "drone" | "crate" | "npc";
  label: string;              // "Broken drone", "Security cam"
  yieldsClueId?: string;
  requiresClueId?: string;    // gated interactions
  npcStageId?: string;        // opens a short info dialogue (not the moral one)
}
interface Challenge {
  kind: "rewire" | "hack" | "sequence" | "align";
  unlockAfterClues: number;   // min clues before challenge appears
}
interface Investigation {
  objective: string;
  interactables: Interactable[];
  requiredClues: string[];    // must be collected to unlock moral stage
  challenge?: Challenge;
  moralStageId: string;       // the existing dialogue stage to open at the end
}
```

`Scenario.startStage` becomes optional; new scenarios use `investigation.moralStageId` instead. Existing stages/choices/effects/reply chain is untouched — the moral decision still flows through `makeChoice` → morality delta → `pendingReply`.

### 2. State (`src/game/useGameState.ts`)

Add investigation state without disturbing the current flow:

- `activeInvestigation: { scenarioId, cluesFound: Set<string>, challengeDone: boolean } | null`
- `worldFlags: Record<string, string>` — e.g. `alley1_outcome: "helped"` — persisted with the save; consumed by later scenarios to gate NPC lines and reputation reactions.
- `tryTriggerLocation` opens the investigation overlay if the scenario has one; the moral `DialogueBox` only opens once `cluesFound ⊇ requiredClues` **and** `challengeDone`.
- All new state is in the existing `SaveState` so Continue keeps working.

### 3. Scanner (new `ScannerOverlay.tsx`)

- Press **S** to toggle. Dark radial mask + scan line over the current viewport.
- Nearby `Interactable`s highlight; the closest shows a readout ("Emotional stress: high", "Power cell: 12%", "Footprint: size 42, wet"). Readouts describe facts only — never say which choice is right.
- Companion drone can spend a "query" to add analysis ("Probability of deception: 61%"). Optional, never prescriptive; sometimes the drone's logical read conflicts with what NPCs say.

### 4. Interaction system (`GameWorld.tsx` + new `Interactable.tsx`)

- Render `Interactable`s at their world positions inside each location.
- When the player is within radius, show a floating "▸ E · INSPECT" prompt (matches existing pixel-font style).
- Pressing **E** either:
  - logs a clue (toast + entry in the objective panel),
  - opens a short NPC info dialogue via the existing `DialogueBox` but with `effects` disabled (info-only stages, no morality delta), or
  - launches the mini-challenge.

### 5. Mini-challenges (new `Challenge*.tsx`, reused across scenarios)

Four small, reusable minigames — all pixel-art, keyboard-only, 30–90s:

- **Rewire** — connect matching colored nodes on a grid without crossing.
- **Hack** — Simon-style sequence you replay from a scanned pattern.
- **Align** — rotate signal dishes so waveforms match.
- **Lockpick** — timed rhythm press when a moving marker hits the sweet spot.

Each challenge exports the same `{ onComplete, onFail }` interface so scenarios can slot any of them.

### 6. Objective / clue HUD (new `ObjectivePanel.tsx`)

Top-center holographic strip: current objective + clue counter `2 / 4`. Clicking (or pressing **Tab**) expands a log of clues with their descriptions. Uses existing cyan/pink pixel styling.

### 7. Consequences & reputation (`useGameState.ts` + scenarios)

- After a moral choice, write a `worldFlags[scenarioId] = outcomeTag` and, when relevant, an NPC memory entry `npcMemory[npcId] = "helped" | "ignored" | "lied"`.
- New scenarios read those flags:
  - Gated dialogue lines (`stage.choices` filtered by a `showIf(flags)` predicate — additive, existing choices keep rendering).
  - Cameo NPCs return in later days with lines that reference the past.
- Reputation already exists; extend its effect: NPCs with `trust < threshold` hide some `Interactable`s (their `requiresClueId` becomes `requiresReputation`).

### 8. World immersion (extend `GameWorld.tsx`)

Small additions to make the city feel active without new systems:

- Ambient NPC sprites that walk, pause at stalls, and react (turn head) when the player passes.
- Idle animations on existing props (sparking wires, flickering signs already exist — reuse).
- Emergency events (siren sweep + red tint) triggered when a scenario's `worldFlags` demand it.

### 9. Content migration plan

- **Day 1** rewritten fully to the new loop as the vertical slice (Neon Alley = broken drone investigation with rewire challenge; Hologram Market = discrimination scene with witness + camera scan; Maglev Station = fare-bypass with hack challenge).
- **Days 2–5** migrate one location at a time; any scenario still using the old `stages`-only flow keeps working via the compatibility path.
- Two Day-1 flags (`helped_drone`, `outed_cyborg`) are consumed by Day 3 and Day 5 respectively to prove long-term consequences end-to-end.

## Files touched

- **New**: `src/components/game/ScannerOverlay.tsx`, `Interactable.tsx`, `ObjectivePanel.tsx`, `challenges/Rewire.tsx`, `challenges/Hack.tsx`, `challenges/Align.tsx`, `challenges/Lockpick.tsx`, `src/game/investigation.ts` (helpers).
- **Edited**: `src/game/types.ts`, `src/game/scenarios.ts` (Day 1 rewrite + optional field for others), `src/game/useGameState.ts` (investigation state + flags + save shape v3 with migration from v2), `src/components/game/GameWorld.tsx` (render interactables, ambient NPCs, event tint), `src/components/game/Game.tsx` (wire overlays), `src/components/game/InfoPanel.tsx` (document S / E / Tab), `src/components/game/AICompanion.tsx` (drone "analyze" action).

## Explicitly unchanged

Story beats, endings and their names, morality math, reputation math, save/continue, menus, credits, intro/charging/ending cutscenes, pixel-art robot & drone sprites, day structure, dialogue box visuals, and existing scenario texts (dialogue text is reused as the final "moral decision" stage inside the new loop).

## Out of scope

Combat, enemies, weapons, open world, platforming, inventory economy, new art direction.

## Open questions

1. Ship the redesign to **all 5 days at once**, or land Day 1 as a playable vertical slice first and migrate Days 2–5 in a follow-up?
2. Should the scanner be **always-on passive** (highlights when near) or **manual toggle with S** (more game-feel, slightly more friction)?
3. For the mini-challenges: **all four** kinds, or start with **rewire + hack** only and add the others later?
