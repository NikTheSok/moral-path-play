# Plan: End-of-game Review Panel

Add a "Field Feedback" review section to the ending screen, pointing players to the Google Forms survey (https://forms.gle/uqGG9vAADaFby4Jt8) via both a scannable QR code and a clickable neon-styled link button.

## Changes

### 1. New component: `src/components/game/ReviewPanel.tsx`
- Cyberpunk-themed panel titled `▸ TRIAL COMPLETE · LOG YOUR FIELD REVIEW` that matches the existing pixel/neon UI (Press Start 2P font, cyan/pink borders, glow).
- **QR code**: rendered as an `<img>` from the public QR image API (`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=<encoded-form-url>`) — no new npm dependency, works offline of any QR library. Framed in a glowing cyan border with a "SCAN WITH A DEVICE" caption.
- **Link button**: a pixel-styled `▶ LEAVE A REVIEW` button that opens the form URL in a new tab (`target="_blank" rel="noreferrer"`).
- Echo-9 flavor line: the drone says one friendly nudge ("unit 7 requests your honest review…") via a short pixel-font caption under the panel.

### 2. `src/components/game/EndingScreen.tsx`
- Render `<ReviewPanel />` between the ending description paragraph and the Morality Core / Choice Log grid, with a staggered fade-in (delay ~2.1s) so it appears after the cinematic and description.
- No props needed — the form URL lives as a constant in the new component so it's easy to swap later.

## Technical details
- Pure frontend; no backend, no secrets.
- QR URL is `encodeURIComponent`-encoded in code.
- The QR image API is a plain `<img>` load; if it fails (offline), the link button still works — add `onError` fallback hiding the QR box.
- Layout: centered row on desktop (QR left, text + button right), stacked on mobile (`grid md:grid-cols-[auto,1fr]`).
