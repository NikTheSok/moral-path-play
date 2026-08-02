import { motion } from "framer-motion";
import type { DayNumber } from "@/game/types";
import type { EncounterQuality } from "@/game/investigation";
import { QUALITY_LABEL, QUALITY_SCORE } from "@/game/investigation";
import { rankFor, nextRank, rankProgress, streakMultiplier } from "@/game/progression";
import type { EncounterLog } from "@/game/useGameState";
import { SCENARIOS } from "@/game/scenarios";

interface Props {
  day: DayNumber;
  encounters: EncounterLog[];
  xp: number;
  streak: number;
  bestStreak: number;
  badgesToday: number;
}

const GRADE_COLOR: Record<EncounterQuality, string> = {
  perfect: "#6affb0",
  good: "#3ce8ff",
  sloppy: "#ffd84a",
  poor: "#ff9a6a",
  failed: "#ff5a5a",
  ignored: "#a26aff",
};

const VIRTUE_LESSON: Record<number, string> = {
  1: "Empathy is staying long enough to understand what someone actually needs.",
  2: "Responsibility is fixing what's broken even when nobody assigned it to you.",
  3: "Honesty is checking before you accuse.",
  4: "Fairness is dividing by need, not just by number.",
  5: "Courage is moving first so others can follow.",
};

function titleFor(scenarioId: string): string {
  return SCENARIOS.find((s) => s.id === scenarioId)?.title ?? scenarioId;
}

export function DayReport({ day, encounters, xp, streak, bestStreak, badgesToday }: Props) {
  const runs = encounters.filter((e) => e.day === day);
  const dayXp = runs.reduce((t, r) => t + QUALITY_SCORE[r.quality], 0);
  const flawless = runs.filter((r) => r.quality === "perfect").length;
  const missed = runs.filter((r) => r.quality === "ignored" || r.quality === "failed").length;
  const rank = rankFor(xp);
  const next = nextRank(xp);
  const pct = rankProgress(xp) * 100;
  const perfectDay = runs.length >= 3 && flawless === runs.length;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.45 }}
      className="mt-4 w-full max-w-md border-2 border-cyan-400/50 bg-black/70 p-3"
      style={{ boxShadow: "0 0 16px rgba(60,232,255,0.25)" }}
    >
      <div className="pixel-font text-[9px] tracking-widest text-pink-400/80 mb-2">▸ DAY {day} REPORT</div>

      <ul className="space-y-1.5">
        {runs.length === 0 && (
          <li className="pixel-font text-[10px] text-cyan-300/50">No encounters logged today.</li>
        )}
        {runs.map((r, i) => (
          <motion.li
            key={`${r.scenarioId}-${i}`}
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.55 + i * 0.12 }}
            className="flex items-center gap-2"
          >
            <span className="pixel-font text-[10px] text-cyan-100/90 flex-1 truncate">{titleFor(r.scenarioId)}</span>
            <span
              className="pixel-font text-[8px] tracking-widest border px-1.5 py-0.5"
              style={{ color: GRADE_COLOR[r.quality], borderColor: GRADE_COLOR[r.quality] }}
            >
              {QUALITY_LABEL[r.quality]}
            </span>
            <span
              className="pixel-font text-[9px] w-10 text-right"
              style={{ color: QUALITY_SCORE[r.quality] >= 0 ? "#6affb0" : "#ff6aa8" }}
            >
              {QUALITY_SCORE[r.quality] > 0 ? "+" : ""}
              {QUALITY_SCORE[r.quality]}
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-3 border-t border-cyan-400/30 pt-2 space-y-1">
        <div className="pixel-font text-[9px] text-cyan-100/85">
          DAY XP: <span className="text-cyan-300">{dayXp > 0 ? "+" : ""}{dayXp}</span>
          {streak >= 2 && (
            <span className="text-yellow-300"> · STREAK ×{streak} (+{Math.round((streakMultiplier(streak) - 1) * 100)}%)</span>
          )}
        </div>
        <div className="pixel-font text-[9px] text-cyan-100/85">
          BADGES: <span className="text-pink-300">{badgesToday}</span> · FLAWLESS:{" "}
          <span className="text-green-300">{flawless}/{runs.length}</span> · BEST STREAK:{" "}
          <span className="text-cyan-300">{bestStreak}</span>
        </div>

        <div className="pt-1">
          <div className="pixel-font text-[8px] tracking-widest text-cyan-300/70 mb-1">
            {rank.icon} {rank.name.toUpperCase()} · {xp} XP{" "}
            {next ? `· NEXT ${next.name.toUpperCase()} @ ${next.minXp}` : "· MAX"}
          </div>
          <div className="h-2 border border-cyan-400/50 bg-black overflow-hidden">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.9, duration: 1 }}
              style={{ background: "linear-gradient(90deg,#3ce8ff,#ff3a8a)" }}
            />
          </div>
        </div>
      </div>

      {perfectDay && (
        <div
          className="pixel-font text-[9px] text-yellow-300 mt-2 leading-relaxed"
          style={{ textShadow: "0 0 8px rgba(255,216,74,0.6)" }}
        >
          ★ PERFECT DAY — a bonus insight was written into your journal.
        </div>
      )}
      <div className="pixel-font text-[9px] text-cyan-200/80 mt-2 leading-[1.7]">▸ LEARNED: {VIRTUE_LESSON[day]}</div>
      {missed > 0 && (
        <div className="pixel-font text-[9px] text-pink-300/80 mt-1 leading-[1.7]">
          ▸ MISSED: {missed} encounter{missed > 1 ? "s" : ""} ended badly. Those people remember.
        </div>
      )}
    </motion.div>
  );
}
