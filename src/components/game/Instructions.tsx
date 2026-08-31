import { motion } from "framer-motion";

export function Instructions({ onBack }: { onBack: () => void }) {
  const items = [
    { k: "MOVE", v: "◄ A / D ► — walk the strip. Time only moves forward" },
    { k: "MEET", v: "Approach a glowing human to open a Learning Challenge" },
    { k: "OBSERVE", v: "Talk, scan and inspect every lead. Locked leads need a clue you don't have yet" },
    { k: "SOLVE", v: "Each site has a hands-on task — repair, sort, search, assemble. Mistakes are counted" },
    { k: "CONCLUDE", v: "Three calls only. A wrong call hurts; blaming an innocent person hurts more" },
    { k: "IGNORE", v: "You may always walk away. It costs morality and people remember" },
    { k: "RECORD", v: "Your grade per encounter = clues found + clean solving + a correct call" },
    { k: "ECHO-9", v: "Your drone narrates everything: hints, praise, warnings and failures" },
    { k: "XP", v: "Clean encounters build streaks, XP and rank. Perfect runs earn badges" },
    { k: "MODULES", v: "Each night at the Charging Bay you pick one upgrade — they change how challenges play" },
    { k: "DAYS", v: "Five trial days: Empathy, Responsibility, Honesty, Fairness, Courage" },
    { k: "PAUSE", v: "Press Esc anytime · ? opens the Field Manual in-game" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{
        backgroundImage: "linear-gradient(rgba(60,232,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.2) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div
        className="relative max-w-lg w-full max-h-[88vh] overflow-y-auto scrollbar-cyan bg-black/90 border-2 border-cyan-400 p-8"
        style={{ boxShadow: "0 0 32px rgba(60,232,255,0.4), inset 0 0 24px rgba(60,232,255,0.08)" }}
      >
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-400" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-400" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pink-400" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-400" />

        <h2 className="pixel-font text-xl text-cyan-200 mb-2" style={{ textShadow: "0 0 10px rgba(60,232,255,0.6)" }}>▸ PROTOCOL MANUAL</h2>
        <p className="pixel-font text-[10px] text-cyan-300/70 mb-6 tracking-widest">// YOU CAN FAIL · EVERY MISTAKE IS RECORDED</p>
        <div className="space-y-2">
          {items.map((it, i) => (
            <motion.div
              key={it.k}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-4 items-start border-l-2 border-pink-400/60 pl-4"
            >
              <div className="w-24 shrink-0 pixel-font text-[10px] text-pink-400 mt-1">{it.k}</div>
              <div className="flex-1 pixel-font text-[11px] text-cyan-100 leading-[1.7]">{it.v}</div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="mt-8 w-full pixel-font text-[11px] tracking-widest px-4 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
          style={{ boxShadow: "0 0 18px rgba(60,232,255,0.5)" }}
        >
          ◄ BACK
        </button>
      </div>
    </motion.div>
  );
}
