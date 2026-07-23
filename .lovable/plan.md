# Redesign — Educational Adventure (Days 1–5)

Goal: replace the "walk → talk → pick answer" loop with hands-on Learning Challenges, one per interaction, three per day. Preserve every existing system (world, robot, save, morality, reputation, companion, charging chamber, endings, UI, animations, menus, music, maps).

## What stays untouched
- `GameWorld.tsx`, `RobotSprite`, `AICompanion`, `MoralityPanel`, `TimeIndicator`, `InfoPanel`, `PauseMenu`, `MainMenu`, `IntroCutscene`, `ChargingScreen`, `EndingScreen`, `Credits`, save keys, morality math, reputation, ending computation, day/time progression.
- Scenario IDs and their world positions/day slots — only the content and interaction type change.

## What changes
- `src/game/investigation.ts` — add new challenge kinds and data schemas.
- `src/game/scenarios.ts` — rewrite dialogue for all 15 interactions to be warm/age-10-25, remove "quiz" tone, add positive NPC reactions.
- `src/components/game/InvestigationOverlay.tsx` — route new challenge components + badge award flow.
- New challenge components under `src/components/game/challenges/`, one per unique mechanic (see below).
- New `BadgeAward.tsx` — short success animation + Moral Badge popup, journal line.
- `useGameState.ts` — add `badges: string[]` to state + save; helper `awardBadge(kind)`.

## Per-day mechanic map (each mechanic used only once per day)

**Day 1 — Empathy**
1. Toy dispute — *Observation & Search*: talk to 3 kids (branching testimony), then click hotspots on a playground scene to find the toy stuck under equipment.
2. Lost robot pet — *Clue Trail*: follow a chain of small clues across a mini-scene (paw prints → dropped ribbon → owner), each click reveals next.
3. Lonely elder — *Helpful Fetch*: pick 3 comforting items from a grid of ~10 (chair, warm drink, book) — wrong picks give gentle "not quite" feedback.

**Day 2 — Responsibility**
1. Festival cleanup — *Sorting*: drag trash items into Plastic / Paper / Glass / Organic bins; wrong drop explains why recycling matters.
2. Broken bike — *Assembly*: drag chain/wheel/pedal/handlebars into correct slots on a bike silhouette.
3. Library — *Categorize*: return books to shelves by color/category tag.

**Day 3 — Honesty**
1. Missing wallet — *Investigation*: question 3 citizens, inspect 3 spots; wallet found under bench, no one accused.
2. Copied homework — *Return the Notebook*: locate original notebook in a room scene, hand it back.
3. Broken window — *Fact-check*: examine footprints, ball trajectory, wind flag — deduce it was the wind (multiple-evidence puzzle).

**Day 4 — Fairness**
1. Swings queue — *Ordering*: drag children into a fair rotation queue.
2. Snack share — *Distribution*: divide N snacks across M kids equally (numeric drag).
3. Charging priority — *Triage*: sort robots by battery level (lowest first).

**Day 5 — Courage**
1. Damaged bridge — *Path building*: place planks across gaps to form a safe crossing.
2. Blocked road — *Cooperation*: recruit nearby robots (click to ask), then a combined push mini-action.
3. Final celebration — *Recap*: returning NPCs from Days 1–4 thank you; short cutscene, no puzzle — awards final "Human Heart" badge and feeds into existing ending computation.

## Rewards
- On each success: 1.2s success burst (Framer motion, sparkles + badge icon), morality delta applied via existing `applyChoice`, journal entry appended, badge added to `badges[]`.
- Badge list surfaced in `InfoPanel` (new "Badges" tab) and in `ChargingScreen` day recap.

## Dialogue tone
- Rewrite all Day 1–5 NPC/robot lines: friendly, natural, positive, 10–25 audience, no dark themes, no "which is more moral" prompts. NPCs explain *why* after the challenge resolves.

## Technical notes
- Reuse existing `InvestigationOverlay` shell (title bar, clue log, cancel). Add a `challenge.kind` switch that renders the appropriate challenge component.
- All new challenges share a common `ChallengeProps { onComplete(result); onCancel() }` contract; overlay handles morality delta + badge + journal on `onComplete`.
- Drag-and-drop uses HTML5 DnD (no new deps).
- Type-check with `tsgo` after each day's wiring.

## Delivery order
1. Schema + shared success/badge component + state changes.
2. Day 1 (3 challenges + dialogue rewrite).
3. Day 2, then 3, 4, 5 in the same shape.
4. InfoPanel badges tab, ChargingScreen recap update.
5. Final typecheck pass.

Scope is large — expect this to be built across multiple turns.
