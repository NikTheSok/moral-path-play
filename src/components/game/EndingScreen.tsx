import { motion } from "framer-motion";
import type { Morality } from "@/game/types";
import { computeEnding } from "@/game/useGameState";
import type { ChoiceLog } from "@/game/useGameState";
import { MoralityPanel } from "./MoralityPanel";

interface Props {
  morality: Morality;
  log: ChoiceLog[];
  onRestart: () => void;
  onMenu: () => void;
}

export function EndingScreen({ morality, log, onRestart, onMenu }: Props) {
  const ending = computeEnding(morality);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 overflow-y-auto bg-background"
    >
      <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-2xl"
        >
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-4">The day is over</div>
          <h1 className="text-display text-5xl md:text-6xl text-foreground mb-4">
            You are a <span className="italic text-primary">{ending.title}</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed italic max-w-xl mx-auto">
            {ending.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 w-full max-w-3xl grid md:grid-cols-2 gap-6"
        >
          <div>
            <h3 className="text-display text-xl text-primary mb-3">Final Morality</h3>
            <MoralityPanel morality={morality} />
          </div>
          <div>
            <h3 className="text-display text-xl text-primary mb-3">Your Choices</h3>
            <div className="bg-card/80 border border-border rounded-xl p-4 max-h-72 overflow-y-auto space-y-3">
              {log.map((l, i) => (
                <div key={i} className="text-sm border-l-2 border-primary/40 pl-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{l.time} · {l.scenarioTitle}</div>
                  <div className="text-foreground/90 italic">"{l.choice}"</div>
                </div>
              ))}
              {log.length === 0 && <div className="text-muted-foreground text-sm">No choices made.</div>}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex gap-3"
        >
          <button onClick={onRestart} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Live Another Day</button>
          <button onClick={onMenu} className="px-6 py-3 border border-border rounded-lg hover:bg-secondary">Main Menu</button>
        </motion.div>
      </div>
    </motion.div>
  );
}
