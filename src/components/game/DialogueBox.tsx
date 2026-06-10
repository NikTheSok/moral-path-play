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
          className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-center p-4 md:p-6 pointer-events-none"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="w-full max-w-2xl pointer-events-auto"
          >
            {/* NPC portrait + name plate */}
            <div className="flex items-end gap-3 mb-2">
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl bg-black border-2 border-cyan-400"
                style={{ boxShadow: "0 0 18px rgba(60,232,255,0.6), inset 0 0 12px rgba(60,232,255,0.3)" }}
              >
                {scenario.npcEmoji}
              </div>
              <div className="flex-1">
                <div
                  className="pixel-font text-[10px] tracking-widest px-3 py-1.5 inline-block bg-black border-2 border-cyan-400 text-cyan-300"
                  style={{ boxShadow: "0 0 12px rgba(60,232,255,0.4)" }}
                >
                  {scenario.npc.toUpperCase()}
                </div>
                <div className="pixel-font text-[9px] text-pink-400/90 tracking-widest mt-1" style={{ textShadow: "0 0 6px rgba(255,58,138,0.5)" }}>
                  ▸ {scenario.title.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Holographic dialogue panel */}
            <div
              className="relative bg-black/85 border-2 border-cyan-400 p-4 md:p-5"
              style={{
                boxShadow: "0 0 32px rgba(60,232,255,0.45), inset 0 0 24px rgba(60,232,255,0.08)",
                backdropFilter: "blur(2px)",
              }}
            >
              {/* corner brackets */}
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

              {/* scanline */}
              <div className="pointer-events-none absolute inset-0 opacity-30" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(60,232,255,0.07) 2px 3px)",
              }} />

              <p className="relative pixel-font text-[12px] md:text-[13px] leading-[1.9] min-h-[64px] text-cyan-50" style={{ textShadow: "0 0 8px rgba(60,232,255,0.4)" }}>
                {typed}
                {!isComplete && <span className="text-cyan-300 animate-pulse">▌</span>}
              </p>

              {pendingReply ? (
                <div className="relative mt-4 flex justify-end">
                  <button
                    onClick={onContinue}
                    disabled={!isComplete}
                    className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: "0 0 14px rgba(60,232,255,0.6)" }}
                  >
                    ▶ CONTINUE
                  </button>
                </div>
              ) : (
                <div className="relative mt-4 space-y-1.5">
                  {isComplete && stage?.choices.map((c, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => onChoose(c)}
                      className="group w-full text-left pixel-font text-[11px] md:text-[12px] leading-[1.7] px-3 py-2 bg-cyan-400/5 text-cyan-100 border-2 border-cyan-400/40 hover:bg-cyan-400 hover:text-black hover:border-cyan-200 transition-colors"
                    >
                      <span className="text-pink-400 group-hover:text-black mr-2">▶</span>
                      {c.label}
                    </motion.button>
                  ))}
                  {!isComplete && (
                    <div className="text-[10px] pixel-font text-cyan-300/50 tracking-widest pt-2">
                      [transmitting...]
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
