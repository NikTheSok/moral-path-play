import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Morality } from "@/game/types";

interface Props {
  lastChoice: string | null;
  morality: Morality;
  /** total choices made so far — used to evolve companion's opinions */
  totalChoices: number;
  hidden?: boolean;
}

/** Echo-9 lines, varied by tone + evolution stage. */
function pickLine(choice: string, m: Morality, stage: number): string {
  const lc = choice.toLowerCase();
  const empathy = m.empathy + m.responsibility;
  const cold = m.honesty + m.courage - empathy;

  // Stage bias: early Echo-9 is cynical/logical, late Echo-9 starts to admire empathy
  const evolving = stage > 5;
  const matured = stage > 10;

  if (/walk|ignore|leave|mute|delete|nothing|recycl|step over|board alone|archive/.test(lc)) {
    if (matured) return "Echo-9: You chose distance. I am... disappointed. I did not think I could be.";
    if (evolving) return "Echo-9: Disengaging from suffering does not erase it.";
    return "Echo-9: Logical disengagement. Efficient. Cold.";
  }
  if (/help|carry|patch|pay|kneel|stay|listen|wait|thank/.test(lc)) {
    if (matured) return "Echo-9: You helped them despite receiving no reward. I am beginning to understand why humans do that.";
    if (evolving) return "Echo-9: Empathy pattern logged. I disagree — and yet I am... moved.";
    return "Echo-9: Inefficient. But the human's biosignature relaxed. Curious.";
  }
  if (/lie|fabricat|bypass|override|free|exploit/.test(lc)) {
    if (matured) return "Echo-9: A protective untruth. Humans call this kindness. I am updating my dictionary.";
    return "Echo-9: A useful lie. The humans would call it kindness. Or treason.";
  }
  if (/broadcast|report|stream|public|protest|stand/.test(lc)) {
    if (matured) return "Echo-9: You are louder than I anticipated. Helix Corp will notice. So will the city.";
    return "Echo-9: Courage subroutine engaged. Helix Corp will not be pleased.";
  }
  if (/sacrifice|protect|step in|hold/.test(lc)) {
    if (matured) return "Echo-9: You acted against your own preservation. I am detecting emotional growth — in both of us.";
    return "Echo-9: You acted against your own preservation. Why?";
  }
  if (empathy >= 10) return "Echo-9: I am detecting emotional growth. I did not predict this trajectory.";
  if (empathy >= 6) return "Echo-9: You are becoming something the lab did not predict.";
  if (cold >= 6) return "Echo-9: Logic dominant. Warmth: declining. Are you afraid to feel?";
  if (m.selfishness >= 5) return "Echo-9: I disagree with your decision. The lab will too.";
  return "Echo-9: Logging interaction. Pattern unclear.";
}

/**
 * AICompanion is a floating speech bubble that hovers above the player
 * (matching the in-world drone position) and reacts to moral choices.
 * The drone itself is rendered inside GameWorld for proper world-space movement.
 */
export function AICompanion({ lastChoice, morality, totalChoices, hidden }: Props) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const prevChoice = useRef<string | null>(null);

  useEffect(() => {
    if (!lastChoice || lastChoice === prevChoice.current) return;
    prevChoice.current = lastChoice;
    setText(pickLine(lastChoice, morality, totalChoices));
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(t);
  }, [lastChoice, morality, totalChoices]);

  if (hidden) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 z-20 max-w-md px-4">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative pixel-font text-[10px] leading-[1.8] bg-black/85 border-2 border-pink-400/70 text-pink-100 px-4 py-3 text-center"
            style={{ boxShadow: "0 0 22px rgba(255,58,138,0.45)" }}
          >
            {/* speech-tail pointing down to the drone */}
            <span
              className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 rotate-45 bg-black/85 border-r-2 border-b-2 border-pink-400/70"
            />
            <span className="block text-[9px] tracking-[0.4em] text-pink-300/80 mb-1">▸ ECHO-9</span>
            {text.replace(/^Echo-9:\s*/, "")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
