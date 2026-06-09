import { motion } from "framer-motion";

export function Instructions({ onBack }: { onBack: () => void }) {
  const items = [
    { k: "Walk", v: "← A · D → (or Arrow keys) — left and right only" },
    { k: "Meet", v: "Approach a person to start a conversation" },
    { k: "Talk", v: "Each scenario unfolds across several dialogue stages" },
    { k: "Choose", v: "Your replies branch the conversation and shape your morality" },
    { k: "Day", v: "Morning → Afternoon → Evening as you finish scenes" },
    { k: "Pause", v: "Press Esc anytime" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full bg-card/90 backdrop-blur border border-border rounded-2xl p-8 shadow-2xl">
        <h2 className="text-display text-4xl text-primary mb-2">How to Play</h2>
        <p className="text-muted-foreground text-sm mb-6">A short day. Real choices. No right answer — only consequences.</p>
        <div className="space-y-3">
          {items.map((it, i) => (
            <motion.div
              key={it.k}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 items-start border-l-2 border-primary/50 pl-4"
            >
              <div className="w-24 text-xs uppercase tracking-widest text-primary mt-1">{it.k}</div>
              <div className="flex-1 text-foreground/90">{it.v}</div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="mt-8 w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Back
        </button>
      </div>
    </motion.div>
  );
}
