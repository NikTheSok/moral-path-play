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
      className="absolute inset-0 z-30 overflow-y-auto bg-black"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{
        backgroundImage: "linear-gradient(rgba(60,232,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.2) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="relative min-h-full flex flex-col items-center justify-center p-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-2xl"
        >
          <div className="pixel-font text-[10px] tracking-[0.5em] text-pink-400 mb-4" style={{ textShadow: "0 0 8px rgba(255,58,138,0.6)" }}>
            ▸ FINAL ANALYSIS · TRIAL COMPLETE
          </div>
          <h1 className="pixel-font text-2xl md:text-3xl text-cyan-200 mb-4 leading-[1.6]" style={{ textShadow: "0 0 14px rgba(60,232,255,0.6)" }}>
            UNIT 7 EVOLVED INTO
          </h1>
          <h2 className="pixel-font text-xl md:text-2xl text-pink-300 mb-6 leading-[1.7]" style={{ textShadow: "0 0 14px rgba(255,58,138,0.6)" }}>
            ▸ {ending.title.toUpperCase()}
          </h2>
          <p className="pixel-font text-[11px] md:text-[12px] text-cyan-100/85 leading-[2] max-w-xl mx-auto">
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
            <h3 className="pixel-font text-[10px] tracking-widest text-cyan-300 mb-3">▸ MORALITY CORE</h3>
            <MoralityPanel morality={morality} />
          </div>
          <div>
            <h3 className="pixel-font text-[10px] tracking-widest text-pink-400 mb-3">▸ CHOICE LOG</h3>
            <div
              className="relative bg-black/85 border-2 border-cyan-400 p-4 max-h-72 overflow-y-auto space-y-3"
              style={{ boxShadow: "0 0 18px rgba(60,232,255,0.3)" }}
            >
              {log.map((l, i) => (
                <div key={i} className="border-l-2 border-pink-400/50 pl-3">
                  <div className="pixel-font text-[8px] uppercase tracking-widest text-cyan-400/70">
                    DAY {l.day} · {l.time} · {l.scenarioTitle}
                  </div>
                  <div className="pixel-font text-[10px] text-cyan-100 leading-[1.6] mt-0.5">"{l.choice}"</div>
                </div>
              ))}
              {log.length === 0 && <div className="pixel-font text-[10px] text-cyan-400/60">No choices logged.</div>}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex gap-3"
        >
          <button
            onClick={onRestart}
            className="pixel-font text-[11px] tracking-widest px-6 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
            style={{ boxShadow: "0 0 18px rgba(60,232,255,0.6)" }}
          >
            ▶ RUN NEW TRIAL
          </button>
          <button
            onClick={onMenu}
            className="pixel-font text-[11px] tracking-widest px-6 py-3 border-2 border-pink-400/70 text-pink-300 hover:bg-pink-400/10"
          >
            ◄ MAIN MENU
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
