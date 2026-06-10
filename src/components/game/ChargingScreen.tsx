import { motion } from "framer-motion";
import type { DayNumber, Morality } from "@/game/types";
import { DAYS } from "@/game/scenarios";
import { MoralityPanel } from "./MoralityPanel";

interface Props {
  day: DayNumber;
  morality: Morality;
  isFinal: boolean;
  onContinue: () => void;
}

const DAY_TITLES = [
  null,
  "Initialization complete",
  "Friction trial logged",
  "Underbelly survey logged",
  "Signal trial complete",
  "Final trial complete",
];

export function ChargingScreen({ day, morality, isFinal, onContinue }: Props) {
  const nextDay = Math.min(5, day + 1) as DayNumber;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-black overflow-hidden flex flex-col"
    >
      {/* grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{
        backgroundImage: "linear-gradient(rgba(60,232,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.2) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {/* charging capsule visual */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:block">
        <div
          className="relative w-48 h-96 border-2"
          style={{
            borderColor: "#3ce8ff",
            background: "linear-gradient(180deg, transparent, rgba(60,232,255,0.15))",
            boxShadow: "0 0 80px rgba(60,232,255,0.45), inset 0 0 50px rgba(60,232,255,0.25)",
          }}
        >
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-56 bg-black/80"
               style={{ clipPath: "polygon(30% 0, 70% 0, 80% 18%, 80% 50%, 95% 55%, 95% 100%, 5% 100%, 5% 55%, 20% 50%, 20% 18%)" }} />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-16 left-1/2 -translate-x-1/2 w-10 h-2"
            style={{ background: "#3ce8ff", boxShadow: "0 0 12px #3ce8ff" }}
          />
          {/* scanning bar */}
          <motion.div
            animate={{ top: ["0%", "98%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-cyan-300"
            style={{ boxShadow: "0 0 12px #3ce8ff" }}
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-8 md:px-16 max-w-3xl">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="pixel-font text-[10px] tracking-[0.5em] text-cyan-300 mb-3" style={{ textShadow: "0 0 10px #3ce8ff" }}>
            ▸ CHARGING BAY 7 · LOG ENTRY {String(day).padStart(2, "0")}
          </div>
          <h1 className="pixel-font text-2xl md:text-4xl text-cyan-100 leading-[1.4] mb-2" style={{ textShadow: "0 0 12px rgba(60,232,255,0.5)" }}>
            DAY {day}
          </h1>
          <h2 className="pixel-font text-sm md:text-base text-pink-400 leading-[1.6]" style={{ textShadow: "0 0 8px rgba(255,58,138,0.6)" }}>
            {DAY_TITLES[day]}
          </h2>
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="pixel-font text-[11px] md:text-[12px] leading-[2] text-cyan-200/80 mt-8 max-w-xl"
        >
          {isFinal
            ? "All data captured. Behavioral synthesis pending. Helix Corp awaits final analysis..."
            : `Behavioral analysis updated. Tomorrow: ${DAYS[nextDay].title} — ${DAYS[nextDay].brief}`}
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 w-full max-w-sm">
          <div className="pixel-font text-[9px] tracking-widest text-cyan-400/80 mb-2">▸ MORALITY PROFILE</div>
          <MoralityPanel morality={morality} />
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          onClick={onContinue}
          className="mt-10 pixel-font text-[11px] tracking-widest px-6 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
          style={{ boxShadow: "0 0 24px rgba(60,232,255,0.7)" }}
        >
          {isFinal ? "▶ VIEW FINAL ANALYSIS" : `▶ BEGIN DAY ${nextDay}`}
        </motion.button>
      </div>
    </motion.div>
  );
}
