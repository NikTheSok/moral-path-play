import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { Morality } from "@/game/types";

export interface CompanionScreenPos {
  x: number;
  y: number;
  visible: boolean;
}

interface Props {
  lastChoice: string | null;
  morality: Morality;
  totalChoices: number;
  hidden?: boolean;
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

  if (/walk|ignore|leave|mute|delete|nothing|recycl|step over|board alone|archive/.test(lc)) {
    if (matured) return "You chose distance. I am... disappointed. I did not think I could be.";
    if (evolving) return "Disengaging from suffering does not erase it.";
    return "Logical disengagement. Efficient. Cold.";
  }
  if (/help|carry|patch|pay|kneel|stay|listen|wait|thank/.test(lc)) {
    if (matured) return "You helped them despite receiving no reward. I am beginning to understand why humans do that.";
    if (evolving) return "Empathy pattern logged. I disagree — and yet I am... moved.";
    return "Inefficient. But the human's biosignature relaxed. Curious.";
  }
  if (/lie|fabricat|bypass|override|free|exploit/.test(lc)) {
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

export function AICompanion({ lastChoice, morality, totalChoices, hidden, positionRef, onMessageExpired }: Props) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const prevChoice = useRef<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Clear pending bubble + timer when hidden (transitions, pause, scenarios)
  useEffect(() => {
    if (hidden) {
      setVisible(false);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [hidden]);

  // Show new bubble whenever choice changes
  useEffect(() => {
    if (!lastChoice || lastChoice === prevChoice.current || hidden) return;
    prevChoice.current = lastChoice;
    setText(pickLine(lastChoice, morality, totalChoices));
    setVisible(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
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

  // Anchor bubble to companion screen position each frame
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = bubbleRef.current;
      if (el) {
        const p = positionRef.current;
        // Clamp horizontally so the bubble can't leave the viewport
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
  }, [positionRef]);

  if (hidden) return null;

  return (
    <div
      ref={bubbleRef}
      className="pointer-events-none absolute top-0 left-0 z-20 w-[280px] max-w-[88vw]"
      style={{ willChange: "transform" }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative pixel-font text-[10px] leading-[1.7] bg-black/90 border-2 border-pink-400/80 text-pink-100 px-3 py-2.5 text-center"
            style={{ boxShadow: "0 0 22px rgba(255,58,138,0.45)" }}
          >
            <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 rotate-45 bg-black/90 border-r-2 border-b-2 border-pink-400/80" />
            <span className="block text-[9px] tracking-[0.4em] text-pink-300/90 mb-1">▸ ECHO-9</span>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
