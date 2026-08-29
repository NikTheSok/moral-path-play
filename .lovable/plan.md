# Echo-9 as the Game's Voice

Echo-9 (the drone) becomes the single narrator for everything that isn't spoken by the robot protagonist or an NPC: challenge feedback, mistake warnings, praise, hints, and system notices. Plus refreshed instructions and themed scrollbars.

## 1. One Echo-9 voice channel

Add a small shared "Echo-9 bus" (a React context + hook) that any component can call to make the drone say something, with a tone: `good`, `bad`, `warn`, or `neutral`.

- No second companion is introduced: the existing `AICompanion` (Echo-9) component stays the only drone and speaks every line.
- In the open world, the line appears in its existing bubble anchored to the flying drone.
- When an overlay or challenge covers the world, the same component keeps rendering above the overlay, with its bubble pinned to a corner instead of tracking the drone's off-screen position — same drone, same voice, just repositioned.
- Bubble color follows tone (cyan neutral, green good, pink/red bad, amber warn). A new line replaces the old one; short lines auto-dismiss (~4s).


## 2. Move all non-character messages to Echo-9

Every challenge currently renders its own local feedback banner. Those banners are removed and their text is sent to Echo-9 instead, rewritten in his voice (analytical but warm, lightly sarcastic, encouraging):

- Hidden Object, Battery, Circuit, Sequence challenges
- Sort, Order, MultiPick, Assemble, Deduction, Celebration challenges
- Investigation overlay: scan results, locked deduction, evidence hints, ignore warnings

## 3. Constant friendly feedback

Echo-9 reacts to events, not just challenge text, with a rotating pool of lines per event so he doesn't repeat himself:

- Correct action / clue found / challenge solved → praise ("Correct. I logged that one twice, for pride.")
- Wrong action → soft negative ("That was not it. Two attempts left. Breathe — you do not breathe. Ignore that.")
- Last attempt remaining → tension warning
- Challenge failed → sympathetic, not punishing
- Badge earned, rank up, streak broken
- Ignoring an NPC → disapproval
- Idle for a while in the world → small ambient remark
- Day start / day end → framing line

## 4. Instructions update

Rewrite the Protocol Manual (`Instructions.tsx`) to match the current game: investigation and clue gathering, learning challenges with limited attempts and consequences, deduction calls, Echo-9's role as support, morality traits, badges, XP/rank, nightly modules, and the ignore option. Keep the same cyberpunk panel styling.

## 5. Themed scrollbars

Add themed scrollbar utilities in `src/styles.css` (thin, square, neon track + glowing thumb, `scrollbar-color` fallback for Firefox) and apply per surface:

- Cyan variant — investigation overlay, info panel, evidence list, most challenges
- Pink variant — deduction challenge
- Amber/warm variant — charging screen, day report, ending screen

## Technical notes

- New: `src/game/echo.tsx` only (context, provider, `useEcho()`, tone typing). No new companion component.
- `AICompanion.tsx` is extended, not replaced: it reads from the Echo bus in addition to `lastChoice`, gains tone-based styling, and switches between drone-anchored and corner-pinned placement depending on whether an overlay is open.
- Provider mounts in `Game.tsx` above the world and all overlays; the single `AICompanion` instance moves up in the tree so it renders over overlays too.
- Challenge components drop their local `message`/`messageTone` state and call `echo.say(text, tone)`; their JSX banners are removed.
- Line pools live in one file so wording stays consistent and easy to extend.
- No gameplay balance, scoring, or save-format changes.
