import { motion, AnimatePresence } from "framer-motion";
import type { Morality, MoralityKey } from "@/game/types";

const META: Record<MoralityKey, { label: string; color: string }> = {
  empathy:        { label: "Empathy",        color: "#ff6aa8" },
  honesty:        { label: "Honesty",        color: "#3ce8ff" },
  responsibility: { label: "Responsibility", color: "#6affb0" },
  courage:        { label: "Courage",        color: "#ffd84a" },
  selfishness:    { label: "Selfishness",    color: "#a26aff" },
};

export function MoralityPanel({ morality }: { morality: Morality }) {
  const max = 14;
  return (
    <div
      className="relative bg-black/85 border-2 border-cyan-400 p-3 w-60"
      style={{ boxShadow: "0 0 20px rgba(60,232,255,0.35), inset 0 0 12px rgba(60,232,255,0.08)" }}
    >
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-pink-400" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-pink-400" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-pink-400" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-pink-400" />
      <div className="pixel-font text-[9px] tracking-widest text-cyan-300 mb-2" style={{ textShadow: "0 0 6px rgba(60,232,255,0.5)" }}>
        ▸ MORALITY CORE
      </div>
      <div className="space-y-1.5">
        {(Object.keys(META) as MoralityKey[]).map((k) => {
          const v = morality[k];
          const pct = Math.max(0, Math.min(100, ((v + max) / (max * 2)) * 100));
          return (
            <div key={k}>
              <div className="flex justify-between pixel-font text-[9px] mb-0.5">
                <span className="text-cyan-100/90">{META[k].label}</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    className="font-mono tabular-nums"
                    style={{ color: META[k].color, textShadow: `0 0 6px ${META[k].color}` }}
                  >
                    {v > 0 ? `+${v}` : v}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="h-1.5 bg-cyan-400/10 relative border border-cyan-400/30">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-400/40" />
                <motion.div
                  className="h-full"
                  style={{ background: META[k].color, boxShadow: `0 0 6px ${META[k].color}` }}
                  initial={false}
                  animate={{
                    width: `${Math.abs(pct - 50)}%`,
                    marginLeft: pct >= 50 ? "50%" : `${pct}%`,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
