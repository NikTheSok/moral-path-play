import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { Morality } from "@/game/types";
import { useEcho, type EchoTone } from "@/game/echo";

export interface CompanionScreenPos {
  x: number;
  y: number;
  visible: boolean;
}

interface Props {
  lastChoice: string | null;
  morality: Morality;
  totalChoices: number;
  /** Fully hide the drone (pause menu, cutscenes, manual). */
  hidden?: boolean;
  /**
   * An overlay covers the world — the drone can't hover over its body any more,
   * so it pins its speech to the bottom-left corner instead.
   */
  pinned?: boolean;
  /** Live screen-space position of the companion drone, updated each frame by GameWorld. */
  positionRef: MutableRefObject<CompanionScreenPos>;
  /** Notifies parent that the current message has expired (so it can clear lastChoice). */
  onMessageExpired?: () => void;
}

function pickLine(choice: string, m: Morality, stage: number): string {
  const lc = choice.toLowerCase();
  const empathy = m.empathy + m.responsibility;
  const cold = m.honesty + m.courage - empathy;
  const evolving = stage > 5;
  const matured = stage > 10;

  // Day-1 empathy-specific analytical lines — companion analyzes facts, robot learns emotion.
  if (/chip|memory|grandma|listen|hug|sit down|sit beside/.test(lc)) {
    return "Emotional attachment probability: HIGH. Object market value: negligible. Value discrepancy logged.";
  }
  if (/muto|dog|sniff|nuzzle|kneel next|pet/.test(lc)) {
    return "Biological reciprocity: absent. Behavioral bond: measurable. Reclassifying 'friendship'.";
  }
  if (/wave|terminal|call|hologram|hospital|daughter|granddaughter|sit with her/.test(lc)) {
    return "Physical needs: satisfied. Emotional index: critical. Loneliness registers as measurable deficit.";
  }
  if (/query.*machine|why do you care|not equipped|not programmed/.test(lc)) {
    return "Curiosity subroutine engaged. This is a good question. I do not have an answer yet.";
  }

  if (/walk|ignore|leave|mute|delete|nothing|recycl|step over|board alone|archive|departing|not part/.test(lc)) {
    if (matured) return "You chose distance. I am... disappointed. I did not think I could be.";
    if (evolving) return "Disengaging from suffering does not erase it.";
    return "Logical disengagement. Efficient. Cold.";
  }
  if (/help|carry|patch|pay|kneel|stay|listen|wait|thank|return|sit/.test(lc)) {
    if (matured) return "You helped them despite receiving no reward. I am beginning to understand why humans do that.";
    if (evolving) return "Empathy pattern logged. I disagree — and yet I am... moved.";
    return "Inefficient. But the human's biosignature relaxed. Curious.";
  }
  if (/lie|fabricat|bypass|override|free|exploit|maintenance schedule/.test(lc)) {
    if (matured) return "A protective untruth. Humans call this kindness. I am updating my dictionary.";
    return "A useful lie. The humans would call it kindness. Or treason.";
  }
  if (/broadcast|report|stream|public|protest|stand/.test(lc)) {
    if (matured) return "You are louder than I anticipated. Helix Corp will notice. So will the city.";
    return "Courage subroutine engaged. Helix Corp will not be pleased.";
  }
  if (/sacrifice|protect|step in|hold/.test(lc)) {
    if (matured) return "You acted against your own preservation. I am detecting emotional growth — in both of us.";
    return "You acted against your own preservation. Why?";
  }
  if (empathy >= 10) return "I am detecting emotional growth. I did not predict this trajectory.";
  if (empathy >= 6) return "You are becoming something the lab did not predict.";
  if (cold >= 6) return "Logic dominant. Warmth: declining. Are you afraid to feel?";
  if (m.selfishness >= 5) return "I disagree with your decision. The lab will too.";
  return "Logging interaction. Pattern unclear.";
}

const TONE_STYLE: Record<EchoTone, { border: string; text: string; glow: string; tag: string }> = {
  good: { border: "border-green-400/80", text: "text-green-100", glow: "0 0 22px rgba(106,255,176,0.45)", tag: "text-green-300/90" },
  bad: { border: "border-red-400/80", text: "text-red-100", glow: "0 0 22px rgba(255,90,90,0.45)", tag: "text-red-300/90" },
  warn: { border: "border-yellow-400/80", text: "text-yellow-100", glow: "0 0 22px rgba(255,216,74,0.45)", tag: "text-yellow-300/90" },
  neutral: { border: "border-pink-400/80", text: "text-pink-100", glow: "0 0 22px rgba(255,58,138,0.45)", tag: "text-pink-300/90" },
};

export function AICompanion({
  lastChoice,
  morality,
  totalChoices,
  hidden,
  pinned,
  positionRef,
  onMessageExpired,
}: Props) {
  const echo = useEcho();
  const [localText, setLocalText] = useState<string | null>(null);
  const prevChoice = useRef<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Clear pending bubble + timer when hidden (transitions, pause, cutscenes)
  useEffect(() => {
    if (hidden) {
      setLocalText(null);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [hidden]);

  // React to dialogue choices in the world
  useEffect(() => {
    if (!lastChoice || lastChoice === prevChoice.current || hidden) return;
    prevChoice.current = lastChoice;
    setLocalText(pickLine(lastChoice, morality, totalChoices));
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setLocalText(null);
      timerRef.current = null;
      onMessageExpired?.();
    }, 5500);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [lastChoice, morality, totalChoices, hidden, onMessageExpired]);

  // Bus messages take priority over the ambient choice line
  const busMsg = echo.current;
  const text = busMsg?.text ?? localText;
  const tone: EchoTone = busMsg?.tone ?? "neutral";
  const visible = !hidden && !!text;

  // Anchor bubble to companion screen position each frame (world mode only)
  useEffect(() => {
    if (pinned) return;
    let raf = 0;
    const tick = () => {
      const el = bubbleRef.current;
      if (el) {
        const p = positionRef.current;
        const w = el.offsetWidth || 280;
        const half = w / 2;
        const vw = window.innerWidth;
        const cx = Math.max(half + 12, Math.min(vw - half - 12, p.x));
        const cy = Math.max(80, p.y - 70);
        el.style.transform = `translate3d(${cx - half}px, ${cy - el.offsetHeight}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [positionRef, pinned]);

  if (hidden) return null;

  const st = TONE_STYLE[tone];

  return (
    <div
      ref={bubbleRef}
      className={
        pinned
          ? "pointer-events-none fixed bottom-4 left-4 z-[70] w-[300px] max-w-[88vw]"
          : "pointer-events-none absolute top-0 left-0 z-[70] w-[280px] max-w-[88vw]"
      }
      style={pinned ? undefined : { willChange: "transform" }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`relative pixel-font text-[10px] leading-[1.7] bg-black/90 border-2 px-3 py-2.5 ${st.border} ${st.text} ${
              pinned ? "text-left" : "text-center"
            }`}
            style={{ boxShadow: st.glow }}
          >
            {!pinned && (
              <span className={`absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 rotate-45 bg-black/90 border-r-2 border-b-2 ${st.border}`} />
            )}
            <span className={`flex items-center gap-2 text-[9px] tracking-[0.4em] mb-1 ${st.tag}`}>
              {pinned && <span className="text-base leading-none">🤖</span>}
              ▸ ECHO-9
            </span>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
