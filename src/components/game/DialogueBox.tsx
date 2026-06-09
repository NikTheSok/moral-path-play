import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { DialogueStage, Scenario, StageChoice } from "@/game/types";

interface Props {
  scenario: Scenario | null;
  stage: DialogueStage | null;
  pendingReply: { text: string; nextStage: string | null } | null;
  onChoose: (choice: StageChoice) => void;
  onContinue: () => void;
}

/** Typewriter hook for retro vibe */
function useTypewriter(text: string, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return out;
}

export function DialogueBox({ scenario, stage, pendingReply, onChoose, onContinue }: Props) {
  const showing = scenario && (stage || pendingReply);
  const text = pendingReply ? pendingReply.text : stage?.npc ?? "";
  const typed = useTypewriter(text);
  const isComplete = typed.length === text.length;

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          key="dialogue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-center p-4 pointer-events-none"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="w-full max-w-2xl pointer-events-auto"
          >
            {/* NPC name plate */}
            <div className="flex items-end gap-2 mb-1">
              <div className="pixel-panel pixel-font text-xs px-3 py-1.5 bg-yellow-300 text-black border-black">
                <span className="mr-1">{scenario.npcEmoji}</span>
                {scenario.npc.toUpperCase()}
              </div>
              <div className="pixel-font text-[9px] text-yellow-200/90 tracking-widest mb-1">
                {scenario.title.toUpperCase()}
              </div>
            </div>

            {/* Main dialogue panel */}
            <div className="pixel-panel bg-[#1a1428] text-yellow-50 border-yellow-100 p-4 md:p-5">
              <p className="pixel-font text-[12px] md:text-[13px] leading-[1.9] min-h-[64px]">
                {typed}
                {!isComplete && <span className="animate-pulse">▌</span>}
              </p>

              {/* Choices OR continue */}
              {pendingReply ? (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={onContinue}
                    disabled={!isComplete}
                    className="pixel-font text-[10px] tracking-widest px-3 py-2 bg-yellow-300 text-black border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ▶ CONTINUE
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-1.5">
                  {isComplete && stage?.choices.map((c, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => onChoose(c)}
                      className="group w-full text-left pixel-font text-[11px] md:text-[12px] leading-[1.7] px-3 py-2 bg-[#2a2040] text-yellow-50 border-2 border-yellow-100/40 hover:bg-yellow-300 hover:text-black hover:border-black transition-colors"
                    >
                      <span className="text-yellow-300 group-hover:text-black mr-2">▶</span>
                      {c.label}
                    </motion.button>
                  ))}
                  {!isComplete && (
                    <div className="text-[10px] pixel-font text-yellow-200/60 tracking-widest pt-2">
                      [press space to skip]
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
