## Goal

Keep every existing system (world, investigations, deductions, challenges, morality, endings). Add the missing *reward loop* so good play visibly pays off, and make progression feel earned rather than just scored.

## 1. Progression: XP + Rank

- Each encounter already produces a score (FLAWLESS +10 → FAILED −15). Feed that into a persistent `xp` value in game state and save.
- Six ranks: `Prototype → Apprentice → Assistant → Guardian → Paragon → Human Heart`. Rank shown in the HUD next to the morality panel, with an animated bar that fills after each encounter.
- Rank-up plays a short cinematic burst (reuse the BadgeAward animation shell) and Echo-9 comments on it.

## 2. Streaks and combos

- Track a `streak` of consecutive clean encounters (no wrong deduction calls, no ignored NPCs).
- Streak 2 = +25% XP, streak 3 = +50% and a "PERFECT DAY" bonus at the charging bay.
- Any ignore, failure, or false accusation breaks the streak with an on-screen "STREAK LOST" beat — mistakes cost something visible, not just an invisible number.

## 3. Unlockable robot upgrades (the real carrot)

Spend earned XP at the Charging Bay between days on 1 of 3 offered modules:

| Module | Effect |
| --- | --- |
| Deep Scan | Reveals one extra detail per interactable |
| Empathy Core | One free "gut feeling" hint per deduction |
| Stabilizer | One free retry in a mini-game without counting a mistake |
| Memory Buffer | Clue log stays visible during the challenge |
| Rapid Servo | Extra time on timed challenges |

Only 4 picks across 5 days, so choices matter and replays differ. Upgrades affect the existing challenge components through simple props — no rebuild.

## 4. Make badges mean something

- Badges currently require perfect play; keep that but add a **Badge Gallery** tab in the Info Panel showing earned/locked badges with silhouettes and the criteria for each.
- Collecting all 3 badges in a day unlocks a bonus journal "insight" entry written from the robot's perspective — the emotional payoff for mastery.
- Collecting 12+ badges overall unlocks a secret 6th ending: **Emergent Soul**.

## 5. Better end-of-day payoff

At the Charging Bay, replace the flat recap with a scored day report:
- Per-encounter row: title, grade chip (FLAWLESS/SOLVED/MESSY/BOTCHED/FAILED), XP earned, badge icon.
- Day totals: XP, streak bonus, badges, rank progress bar animating up.
- One "what you learned" line tied to the day's virtue, plus one "what you missed" line if any lead went unexplored — so failure teaches instead of just punishing.

## 6. Make challenges make more sense

- Every challenge gets a visible **objective banner** ("Return 3 comforting items — pick wisely, wrong picks cost trust") and a **mistake meter** (3 pips) so consequences are legible before committing.
- Wrong actions always print the *reason* in the clue log, not just "not quite".
- Clues gathered before the challenge now actually change it: unexplored leads mean one option in the deduction is unavailable/greyed, giving exploration a mechanical purpose rather than just a score modifier.

## 7. Ending strengthened

Ending computation additionally weighs rank, badge count, streaks, and ignored-NPC count, and the ending screen shows a final scorecard (rank, XP, badges, ignored count, best streak) before the cinematic — so the 5 days visibly add up to the outcome.

## Technical notes

- New state in `useGameState.ts`: `xp`, `rank`, `streak`, `bestStreak`, `upgrades: string[]`; all added to the existing save object (backwards compatible with optional fields).
- New files: `src/game/progression.ts` (XP tables, ranks, upgrade defs), `src/components/game/RankBar.tsx`, `src/components/game/UpgradeChoice.tsx`, `src/components/game/DayReport.tsx`, badge gallery tab inside `InfoPanel.tsx`.
- Edits: `ChargingScreen.tsx` (day report + upgrade pick), `InvestigationOverlay.tsx` (objective banner, mistake pips, upgrade effects), `DeductionChallenge.tsx` (gating by explored clues, Empathy Core hint), `EndingScreen.tsx` (scorecard + 6th ending).
- Also fix the current main-menu hydration mismatch (saved-game check runs during SSR) while in these files.
- Typecheck with `tsgo` after each phase.

## Delivery order

1. `progression.ts` + state/save + RankBar in HUD.
2. Streaks, XP awards, grade→XP wiring in the overlay.
3. Day report + upgrade choice at the Charging Bay.
4. Upgrade effects inside challenges + objective banners/mistake pips.
5. Badge gallery, bonus insights, secret ending, ending scorecard.
