import { motion } from "framer-motion";
import type { DayNumber, Morality } from "@/game/types";
import { DAYS } from "@/game/scenarios";
import { MoralityPanel } from "./MoralityPanel";
import { RobotSprite } from "./RobotSprite";
import type { JournalEntry } from "@/game/useGameState";

interface Props {
  day: DayNumber;
  morality: Morality;
  isFinal: boolean;
  journalEntries?: JournalEntry[];
  onContinue: () => void;
  onMenu: () => void;
}

const DAY_TITLES = [
  null,
  "Initialization complete",
  "Friction trial logged",
  "Underbelly survey logged",
  "Signal trial complete",
  "Final trial complete",
];

/** Narrative observations by day. Day 1 gets empathy-specific observations. */
function narrativeObservations(day: DayNumber, m: Morality): string[] {
  if (day === 1) {
    const out: string[] = [];
    if (m.empathy >= 6) out.push("You prioritized emotional well-being over efficiency.");
    if (m.empathy >= 3) out.push("You showed curiosity toward human emotions.");
    if (m.responsibility >= 3) out.push("You returned to a task instead of walking on.");
    if (m.empathy >= 4) out.push("Empathy development increased. Baseline shifted.");
    if (m.selfishness >= 3) out.push("Warning: self-interest overtook compassion in one or more choices.");
    if (out.length === 0) out.push("You completed all objectives. Emotional resonance: minimal. Reassessment recommended.");
    return out;
  }
  return [];
}

function behavioralReadout(m: Morality): { dominant: string; trend: string; flag: string } {
  const entries = Object.entries(m) as [keyof Morality, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const dominant = top[1] > 0 ? top[0].toUpperCase() : "UNDEFINED";
  const empathyScore = m.empathy + m.responsibility;
  const cold = m.honesty + m.courage - empathyScore;
  let trend = "EQUILIBRIUM";
  if (empathyScore > 4) trend = "EMERGING COMPASSION";
  else if (cold > 4) trend = "CONVERGING ON LOGIC";
  else if (m.selfishness >= 4) trend = "ANOMALY: SELF-INTEREST RISING";
  const flag = m.selfishness >= 6 ? "⚠ EMPATHY DRIFT DETECTED" : "✓ CORE INTEGRITY NOMINAL";
  return { dominant, trend, flag };
}

export function ChargingScreen({ day, morality, isFinal, journalEntries = [], onContinue, onMenu }: Props) {
  const nextDay = Math.min(5, day + 1) as DayNumber;
  const readout = behavioralReadout(morality);
  const observations = narrativeObservations(day, morality);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 z-30 bg-black overflow-hidden flex"
    >
      {/* grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{
        backgroundImage: "linear-gradient(rgba(60,232,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.2) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      {/* radial bay glow */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(circle at 75% 50%, rgba(60,232,255,0.18), transparent 55%)"
      }} />

      {/* === LEFT: log + actions === */}
      <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-6 md:px-14 max-w-2xl">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="pixel-font text-[10px] tracking-[0.5em] text-cyan-300 mb-3" style={{ textShadow: "0 0 10px #3ce8ff" }}>
            ▸ CHARGING BAY 7 · LOG {String(day).padStart(2, "0")}
          </div>
          <h1 className="pixel-font text-2xl md:text-4xl text-cyan-100 leading-[1.4] mb-2" style={{ textShadow: "0 0 12px rgba(60,232,255,0.5)" }}>
            DAY {day}
          </h1>
          <h2 className="pixel-font text-sm md:text-base text-pink-400 leading-[1.6]" style={{ textShadow: "0 0 8px rgba(255,58,138,0.6)" }}>
            {DAY_TITLES[day]}
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 w-full max-w-md border-2 border-cyan-400/40 bg-black/60 p-3 space-y-1.5"
        >
          <div className="pixel-font text-[9px] tracking-widest text-pink-400/80">▸ BEHAVIORAL ANALYSIS</div>
          <div className="pixel-font text-[10px] text-cyan-100/90 leading-[1.8]">
            DOMINANT TRAIT: <span className="text-cyan-300">{readout.dominant}</span>
          </div>
          <div className="pixel-font text-[10px] text-cyan-100/90 leading-[1.8]">
            EVOLUTION: <span className="text-pink-300">{readout.trend}</span>
          </div>
          <div className="pixel-font text-[10px] leading-[1.8]" style={{ color: morality.selfishness >= 6 ? "#ff6a6a" : "#6affb0" }}>
            {readout.flag}
          </div>
        </motion.div>

        {observations.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-3 w-full max-w-md border-2 border-pink-400/40 bg-black/60 p-3"
          >
            <div className="pixel-font text-[9px] tracking-widest text-pink-400/80 mb-2">▸ AI OBSERVATIONS</div>
            <ul className="space-y-1">
              {observations.map((o, i) => (
                <li key={i} className="pixel-font text-[10px] text-cyan-100/90 leading-[1.7]">▸ {o}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {journalEntries.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 }}
            className="mt-3 w-full max-w-md border-2 border-cyan-400/40 bg-black/60 p-3"
          >
            <div className="pixel-font text-[9px] tracking-widest text-cyan-300/80 mb-2">▸ ROBOT JOURNAL · DAY {day}</div>
            <ul className="space-y-2">
              {journalEntries.map((j, i) => (
                <li key={i} className="pixel-font text-[10px] text-cyan-100/85 leading-[1.75] border-l-2 border-pink-400/60 pl-2 italic">
                  "{j.text}"
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.p
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
          className="pixel-font text-[11px] leading-[2] text-cyan-200/80 mt-5 max-w-lg"
        >
          {isFinal
            ? "All data captured. Behavioral synthesis pending. Helix Corp awaits final analysis..."
            : `Tomorrow: ${DAYS[nextDay].title} — ${DAYS[nextDay].brief}`}
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6 w-full max-w-sm">
          <div className="pixel-font text-[9px] tracking-widest text-cyan-400/80 mb-2">▸ MORALITY PROFILE</div>
          <MoralityPanel morality={morality} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-8 flex gap-3">
          <button
            onClick={onContinue}
            className="pixel-font text-[11px] tracking-widest px-6 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
            style={{ boxShadow: "0 0 24px rgba(60,232,255,0.7)" }}
          >
            {isFinal ? "▶ VIEW FINAL ANALYSIS" : `▶ BEGIN DAY ${nextDay}`}
          </button>
          <button
            onClick={onMenu}
            className="pixel-font text-[11px] tracking-widest px-5 py-3 border-2 border-pink-400/70 text-pink-300 hover:bg-pink-400/10"
          >
            ◄ MAIN MENU
          </button>
        </motion.div>
      </div>

      {/* === RIGHT: holographic robot scan === */}
      <motion.div
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.9 }}
        className="hidden md:flex relative flex-1 items-center justify-center"
      >
        {/* outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute w-[420px] h-[420px] rounded-full border-2 border-dashed border-cyan-400/40"
          style={{ boxShadow: "0 0 60px rgba(60,232,255,0.25)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute w-[340px] h-[340px] rounded-full border border-pink-400/40"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[260px] h-[260px] rounded-full border border-cyan-400/30"
        />

        {/* corner targeting brackets */}
        <div className="absolute w-[460px] h-[460px]">
          {[
            "top-0 left-0 border-t-2 border-l-2",
            "top-0 right-0 border-t-2 border-r-2",
            "bottom-0 left-0 border-b-2 border-l-2",
            "bottom-0 right-0 border-b-2 border-r-2",
          ].map((c, i) => (
            <span key={i} className={`absolute w-8 h-8 border-cyan-300 ${c}`} />
          ))}
        </div>

        {/* capsule + real robot inside */}
        <div
          className="relative w-48 h-[26rem] border-2 overflow-hidden flex items-end justify-center pb-6"
          style={{
            borderColor: "#3ce8ff",
            background: "linear-gradient(180deg, rgba(60,232,255,0.05), rgba(60,232,255,0.18))",
            boxShadow: "0 0 80px rgba(60,232,255,0.55), inset 0 0 60px rgba(60,232,255,0.25)",
          }}
        >
          {/* inner scanlines */}
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(60,232,255,0.15) 3px 4px)",
          }} />

          {/* hibernation tubes/cables across the top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: 5 }).map((_, k) => (
              <span key={k} className="block w-1 h-6" style={{ background: "#3ce8ff", boxShadow: "0 0 8px #3ce8ff" }} />
            ))}
          </div>

          {/* THE ROBOT — actual sprite, suspended in stasis */}
          <RobotSprite scale={5} animate hibernating eyeIntensity={0.5} />

          {/* vertical scanning bar */}
          <motion.div
            animate={{ top: ["0%", "98%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-cyan-300"
            style={{ boxShadow: "0 0 16px #3ce8ff, 0 0 6px #3ce8ff" }}
          />
          <motion.div
            animate={{ left: ["-10%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 w-px h-full bg-pink-400/70"
          />

          {/* data ticks */}
          <div className="absolute left-1 top-3 bottom-3 flex flex-col justify-between">
            {Array.from({ length: 12 }).map((_, k) => (
              <div key={k} className="w-2 h-px bg-cyan-300/60" />
            ))}
          </div>
          <div className="absolute right-1 top-3 bottom-3 flex flex-col justify-between">
            {Array.from({ length: 12 }).map((_, k) => (
              <div key={k} className="w-2 h-px bg-pink-400/60 self-end" />
            ))}
          </div>
        </div>

        {/* readout chips floating */}
        <motion.div
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
          className="absolute left-2 top-12 pixel-font text-[8px] tracking-widest bg-black/70 border border-cyan-400/60 px-2 py-1 text-cyan-200"
        >
          ▸ SCAN {String(Math.floor(Math.random() * 9000 + 1000))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
          className="absolute right-2 top-20 pixel-font text-[8px] tracking-widest bg-black/70 border border-pink-400/60 px-2 py-1 text-pink-300"
        >
          ▸ MOD: M.O.R.A.L
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pixel-font text-[8px] tracking-widest bg-black/70 border border-cyan-400/60 px-3 py-1 text-cyan-200"
        >
          INTEGRITY 98.7% · CORE TEMP 41°C
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
