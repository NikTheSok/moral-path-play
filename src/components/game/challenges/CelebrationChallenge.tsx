import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CelebrationMoment } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  moments: CelebrationMoment[];
  finalLine: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function CelebrationChallenge({ label, intro, moments, finalLine, onComplete, onCancel }: Props) {
  const [i, setI] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  const advance = () => {
    if (showFinal) { onComplete(); return; }
    if (i + 1 >= moments.length) {
      setShowFinal(true);
    } else {
      setI(i + 1);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const m = moments[i];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-cyan-400 p-6 max-w-2xl w-full text-center"
      style={{ boxShadow: "0 0 40px rgba(60,232,255,0.6)" }}
    >
      {/* confetti glimmers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, k) => (
          <motion.span
            key={k}
            initial={{ y: -20, x: Math.random() * 500, opacity: 0 }}
            animate={{ y: 400, opacity: [0, 1, 0] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
            className="absolute text-lg"
          >
            {["✨", "🎊", "💫", "⭐"][k % 4]}
          </motion.span>
        ))}
      </div>

      <div className="relative">
        <div className="pixel-font text-[9px] tracking-[0.35em] text-pink-400 mb-2">▸ FINAL CELEBRATION</div>
        <div className="pixel-font text-[12px] text-cyan-100 mb-5">{label.toUpperCase()}</div>
        {intro && !showFinal && i === 0 && (
          <div className="pixel-font text-[9px] text-cyan-300/70 mb-4 italic">{intro}</div>
        )}

        <AnimatePresence mode="wait">
          {!showFinal ? (
            <motion.div
              key={i}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="py-6"
            >
              <div className="text-6xl mb-3">{m.emoji}</div>
              <div className="pixel-font text-[10px] tracking-widest text-pink-300 mb-3">▸ {m.who.toUpperCase()}</div>
              <div className="pixel-font text-[12px] leading-[1.8] text-cyan-100">{m.line}</div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="py-8"
            >
              <div className="text-7xl mb-4">❤️‍🔥</div>
              <div className="pixel-font text-[11px] leading-[2] text-cyan-100 max-w-xl mx-auto"
                style={{ textShadow: "0 0 10px rgba(60,232,255,0.5)" }}>
                {finalLine}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-between items-center">
          <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
            {showFinal ? "END" : `${i + 1} / ${moments.length}`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="pixel-font text-[9px] tracking-widest text-pink-300 hover:text-pink-200 border-2 border-pink-400/50 hover:border-pink-400 px-3 py-1.5 bg-black"
            >
              LATER
            </button>
            <button
              onClick={advance}
              className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
              style={{ boxShadow: "0 0 14px rgba(60,232,255,0.6)" }}
            >
              {showFinal ? "▶ FINISH" : "▶ NEXT"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
