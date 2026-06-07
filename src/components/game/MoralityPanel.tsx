import { motion, AnimatePresence } from "framer-motion";
import type { Morality, MoralityKey } from "@/game/types";

const META: Record<MoralityKey, { label: string; color: string }> = {
  empathy:        { label: "Empathy",        color: "var(--empathy)" },
  honesty:        { label: "Honesty",        color: "var(--honesty)" },
  responsibility: { label: "Responsibility", color: "var(--responsibility)" },
  courage:        { label: "Courage",        color: "var(--courage)" },
  selfishness:    { label: "Selfishness",    color: "var(--selfishness)" },
};

export function MoralityPanel({ morality }: { morality: Morality }) {
  const max = 12;
  return (
    <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-3 w-56 shadow-2xl">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 text-display">Morality</div>
      <div className="space-y-1.5">
        {(Object.keys(META) as MoralityKey[]).map((k) => {
          const v = morality[k];
          const pct = Math.max(0, Math.min(100, ((v + max) / (max * 2)) * 100));
          return (
            <div key={k}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-foreground/80">{META[k].label}</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    className="font-mono tabular-nums"
                    style={{ color: META[k].color }}
                  >
                    {v > 0 ? `+${v}` : v}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: META[k].color }}
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
