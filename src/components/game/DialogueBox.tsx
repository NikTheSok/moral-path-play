import { motion, AnimatePresence } from "framer-motion";
import type { Scenario } from "@/game/types";

interface Props {
  scenario: Scenario | null;
  response: string | null;
  onChoose: (idx: number) => void;
  onContinue: () => void;
}

export function DialogueBox({ scenario, response, onChoose, onContinue }: Props) {
  return (
    <AnimatePresence>
      {scenario && (
        <motion.div
          key="dialogue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-end md:items-center justify-center bg-background/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center text-2xl">
                {scenario.npcEmoji}
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{scenario.npc}</div>
                <h2 className="text-xl text-display text-primary">{scenario.title}</h2>
              </div>
            </div>

            <motion.p
              key={response ? "resp" : "prompt"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-foreground/90 leading-relaxed text-base md:text-lg mb-6 italic"
            >
              {response ?? scenario.prompt}
            </motion.p>

            {!response ? (
              <div className="space-y-2">
                {scenario.choices.map((c, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ x: 4, backgroundColor: "var(--secondary)" }}
                    onClick={() => onChoose(i)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border bg-background/40 hover:border-primary/60 transition-colors group"
                  >
                    <span className="text-muted-foreground mr-2 group-hover:text-primary">›</span>
                    {c.label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.4 } }}
                onClick={onContinue}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Continue
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
