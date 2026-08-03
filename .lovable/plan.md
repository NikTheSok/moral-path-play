# Fix XP popup + make installed modules real

Two confirmed problems:

1. **The "+X XP" popup never disappears.** The state that drives it (`lastXpGain`) is set when an encounter ends but nothing ever resets it — the clear function exists in game state but is never called anywhere.
2. **Modules you pick at the Charging Bay mostly do nothing and are invisible during play.** Only two of the five are actually wired into gameplay (Deep Scan and Stabilizer), and even those give no on-screen feedback. Empathy Core, Memory Buffer and Rapid Servo currently have no effect at all. The only place modules appear is a list inside the field manual.

## What changes

### XP popup
- The floating "+X XP" and "STREAK LOST" flashes auto-dismiss about 1.5s after they appear, then the popup is gone until the next encounter.

### Modules visible during play
- A small module strip sits under the rank bar in the HUD, showing the icon of every installed module. Hovering shows its name and effect.
- When a module actually does something in an encounter, it says so: e.g. "STABILIZER ABSORBED ONE MISTAKE", "EMPATHY CORE HINT USED", "RAPID SERVO +15s".

### Modules that actually work
- **Deep Scan** (already partly working) — locked leads also get a "scan" tint in the lead list so the effect is noticeable.
- **Stabilizer** — already forgives the first mistake; the mistake pips now show the forgiven pip in a different colour with a "STABILIZER" tag.
- **Empathy Core** — adds a one-use "GUT FEELING" button in the conclusion step that eliminates one wrong option (not the accusation-free easy path — it removes a plainly wrong one).
- **Memory Buffer** — the evidence/clue board stays open and pinned during the mini-game and the conclusion step instead of collapsing.
- **Rapid Servo** — timed challenges start with extra seconds on the clock.

## Technical notes

- `src/components/game/RankBar.tsx`: `useEffect` timer keyed on the flash value, calling a new `onFlashDone` prop; `Game.tsx` passes `g.clearXpFlash`.
- `src/components/game/Game.tsx`: render a `ModuleStrip` (new small component in `src/components/game/ModuleStrip.tsx`) below `RankBar`, fed by `g.upgrades` and `UPGRADES` from `src/game/progression.ts`.
- `src/components/game/InvestigationOverlay.tsx`: pass `upgrades` down into the challenge components and `DeductionChallenge`; add module-activation toast text; keep evidence panel mounted when `memory-buffer` is owned.
- `src/components/game/challenges/DeductionChallenge.tsx`: optional `empathyCore` prop enabling the one-use eliminate-a-wrong-option action.
- Timed challenges (`SequenceChallenge`, `BatteryChallenge`, `CircuitChallenge`, `HiddenObjectChallenge` where a timer exists): accept a `bonusSeconds` prop, set from `rapid-servo`.
- No changes to scoring formulas, save format, or scenario data.
