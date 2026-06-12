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

type EndingKey =
  | "Humanity's Hope"
  | "Cold Machine"
  | "Balanced Future"
  | "Broken Mirror"
  | "Silent Protector";

interface CineConfig {
  bg: string;
  accent: string;
  secondary: string;
  caption: string;
}
const CINE: Record<EndingKey, CineConfig> = {
  "Humanity's Hope":   { bg: "linear-gradient(180deg,#3a1a4a,#ff8a6a)", accent: "#ffd2a8", secondary: "#ff6aa8", caption: "the city learns to feel again" },
  "Cold Machine":      { bg: "linear-gradient(180deg,#02020a,#0a1428)", accent: "#3ce8ff", secondary: "#2a2a4a", caption: "perfect. quiet. alone." },
  "Balanced Future":   { bg: "linear-gradient(180deg,#1a2a4a,#6aa8d8)", accent: "#a26aff", secondary: "#3ce8ff", caption: "humans and machines, rebuilding together" },
  "Broken Mirror":     { bg: "linear-gradient(180deg,#1a0010,#3a0a1a)", accent: "#ff3a3a", secondary: "#a20a3a", caption: "you reflected what they feared most" },
  "Silent Protector":  { bg: "linear-gradient(180deg,#0a1a3a,#ffd84a)", accent: "#ffd84a", secondary: "#3ce8ff", caption: "they will remember a hero. not a machine." },
};


function CinematicSequence({ k }: { k: EndingKey }) {
  const cfg = CINE[k];
  return (
    <div className="relative w-full h-72 md:h-80 overflow-hidden border-2 border-cyan-400/40" style={{ background: cfg.bg, boxShadow: "0 0 30px rgba(60,232,255,0.3)" }}>
      {/* parallax skyline silhouette */}
      <div className="absolute inset-x-0 bottom-0 h-2/3">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.8 }}
            className="absolute bottom-0"
            style={{
              left: `${(i * 7.5) % 100}%`,
              width: `${14 + (i % 4) * 6}px`,
              height: `${60 + (i % 5) * 26}px`,
              background: "rgba(0,0,0,0.7)",
              borderTop: `2px solid ${cfg.accent}`,
            }}
          >
            {Array.from({ length: 4 }).map((_, w) => (
              <motion.div
                key={w}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2 + w * 0.4, repeat: Infinity, delay: (i + w) * 0.3 }}
                className="absolute w-1.5 h-1.5"
                style={{ left: 4 + w * 5, top: 14 + w * 12, background: cfg.accent, boxShadow: `0 0 4px ${cfg.accent}` }}
              />
            ))}
          </motion.div>
        ))}
      </div>

      {/* flying vehicles */}
      {[0, 1, 2].map((j) => (
        <motion.div
          key={j}
          initial={{ x: j % 2 === 0 ? -50 : 700 }}
          animate={{ x: j % 2 === 0 ? 700 : -50 }}
          transition={{ duration: 8 + j * 2, repeat: Infinity, ease: "linear", delay: j * 1.4 }}
          className="absolute"
          style={{ top: 40 + j * 30 }}
        >
          <div className="relative w-6 h-1.5 bg-black/80" style={{ boxShadow: `0 0 6px ${cfg.secondary}` }} />
          <div className="absolute top-0 right-0 w-1 h-1.5" style={{ background: cfg.secondary, boxShadow: `0 0 6px ${cfg.secondary}` }} />
        </motion.div>
      ))}

      {/* robot silhouette walking through */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 200, opacity: 1 }}
        transition={{ duration: 5, delay: 0.4 }}
        className="absolute bottom-2 w-6 h-14"
      >
        <div className="absolute inset-x-0 bottom-0 h-12 bg-black"
             style={{ clipPath: "polygon(30% 0, 70% 0, 80% 18%, 80% 50%, 95% 55%, 95% 100%, 5% 100%, 5% 55%, 20% 50%, 20% 18%)" }} />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-0.5"
          style={{ background: cfg.accent, boxShadow: `0 0 6px ${cfg.accent}` }}
        />
      </motion.div>

      {/* particle ambient */}
      {Array.from({ length: 18 }).map((_, k2) => (
        <motion.div
          key={k2}
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: -20, opacity: [0, 1, 0] }}
          transition={{ duration: 5 + (k2 % 4), repeat: Infinity, delay: (k2 * 0.3) % 5, ease: "linear" }}
          className="absolute w-1 h-1"
          style={{ left: `${(k2 * 17) % 100}%`, background: cfg.accent, boxShadow: `0 0 4px ${cfg.accent}` }}
        />
      ))}

      {/* scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.4) 2px 3px)",
      }} />

      {/* caption */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1.5 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 pixel-font text-[10px] tracking-[0.3em] text-white/90"
        style={{ textShadow: `0 0 8px ${cfg.accent}` }}
      >
        ▸ {cfg.caption.toUpperCase()}
      </motion.div>
    </div>
  );
}

export function EndingScreen({ morality, log, onRestart, onMenu }: Props) {
  const ending = computeEnding(morality);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
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
          transition={{ delay: 0.3 }}
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
        </motion.div>

        {/* CINEMATIC */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="w-full max-w-3xl mb-8"
        >
          <CinematicSequence k={ending.title as EndingKey} />
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="pixel-font text-[11px] md:text-[12px] text-cyan-100/85 leading-[2] max-w-xl mx-auto text-center"
        >
          {ending.description}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.9 }}
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
          transition={{ delay: 2.3 }}
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
