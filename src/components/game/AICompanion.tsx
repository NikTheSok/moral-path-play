import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Morality } from "@/game/types";

interface Props {
  lastChoice: string | null;
  morality: Morality;
  hidden?: boolean;
}

function reactTo(choice: string, m: Morality): string {
  const lc = choice.toLowerCase();
  const empathy = m.empathy + m.responsibility;
  const cold = m.honesty + m.courage - empathy;

  if (/walk|ignore|leave|mute|delete|nothing|recycl|step over|board alone|archive/.test(lc))
    return "Echo-9: Human morality remains inconsistent. So does yours.";
  if (/help|carry|patch|pay|kneel|stay|listen|wait|thank/.test(lc))
    return "Echo-9: Empathy pattern detected. Inefficient. Beautiful.";
  if (/lie|fabricat|bypass|override|free|exploit/.test(lc))
    return "Echo-9: A useful untruth. The humans would call it kindness. Or treason.";
  if (/broadcast|report|stream|public|protest|stand/.test(lc))
    return "Echo-9: Courage subroutine engaged. Helix Corp will not be pleased.";
  if (/sacrifice|carry|protect|step in|hold/.test(lc))
    return "Echo-9: You acted against your own preservation. Why?";
  if (empathy >= 8) return "Echo-9: You are becoming something the lab did not predict.";
  if (cold >= 6) return "Echo-9: Logic dominant. Warmth: declining.";
  return "Echo-9: Logging interaction. Pattern unclear.";
}

export function AICompanion({ lastChoice, morality, hidden }: Props) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!lastChoice) return;
    setText(reactTo(lastChoice, morality));
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 5200);
    return () => window.clearTimeout(t);
  }, [lastChoice, morality]);

  if (hidden) return null;

  return (
    <div className="pointer-events-none absolute right-4 bottom-44 z-20 flex items-end gap-2 max-w-xs">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4 }}
            className="pixel-font text-[10px] leading-[1.7] bg-black/85 border-2 border-pink-400/70 text-pink-200 px-3 py-2 mb-1"
            style={{ boxShadow: "0 0 16px rgba(255,58,138,0.45)" }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hovering drone */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-10 h-10"
      >
        <div className="absolute inset-1 bg-black border-2 border-cyan-400 rounded-sm"
             style={{ boxShadow: "0 0 14px rgba(60,232,255,0.6)" }} />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1"
          style={{ background: "#3ce8ff", boxShadow: "0 0 8px #3ce8ff" }}
        />
        <div className="absolute -bottom-1 left-1 w-1 h-1 bg-pink-400" style={{ boxShadow: "0 0 6px #ff3a8a" }} />
        <div className="absolute -bottom-1 right-1 w-1 h-1 bg-pink-400" style={{ boxShadow: "0 0 6px #ff3a8a" }} />
      </motion.div>
    </div>
  );
}
