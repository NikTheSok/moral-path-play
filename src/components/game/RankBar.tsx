import { motion, AnimatePresence } from "framer-motion";
import { rankFor, nextRank, rankProgress, streakMultiplier } from "@/game/progression";

interface Props {
  xp: number;
  streak: number;
  lastXpGain?: number | null;
  streakLost?: boolean;
  compact?: boolean;
}

export function RankBar({ xp, streak, lastXpGain, streakLost, compact }: Props) {
  const rank = rankFor(xp);
  const next = nextRank(xp);
  const pct = rankProgress(xp) * 100;

  return (
    <div
      className="relative bg-black/80 border-2 border-cyan-400/70 px-3 py-2 w-56"
      style={{ boxShadow: "0 0 14px rgba(60,232,255,0.35)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{rank.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="pixel-font text-[9px] tracking-[0.25em] text-cyan-200 truncate">
            {rank.name.toUpperCase()}
          </div>
        </div>
        <span className="pixel-font text-[9px] text-pink-300">{xp} XP</span>
      </div>

      <div className="mt-2 h-2 border border-cyan-400/50 bg-black overflow-hidden">
        <motion.div
          className="h-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{ background: "linear-gradient(90deg,#3ce8ff,#ff3a8a)", boxShadow: "0 0 10px rgba(60,232,255,0.7)" }}
        />
      </div>

      {!compact && (
        <div className="pixel-font text-[8px] text-cyan-300/60 mt-1 leading-relaxed">
          {next ? `NEXT: ${next.name.toUpperCase()} · ${next.minXp - xp} XP` : "MAX RANK REACHED"}
        </div>
      )}

      {streak >= 2 && (
        <div
          className="pixel-font text-[8px] tracking-widest mt-1 text-yellow-300"
          style={{ textShadow: "0 0 8px rgba(255,216,74,0.7)" }}
        >
          ▸ STREAK ×{streak} · +{Math.round((streakMultiplier(streak) - 1) * 100)}% XP
        </div>
      )}

      <AnimatePresence>
        {typeof lastXpGain === "number" && lastXpGain !== 0 && (
          <motion.div
            key={`xp-${lastXpGain}-${xp}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: -14 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pixel-font text-[10px] absolute -top-3 right-2"
            style={{ color: lastXpGain > 0 ? "#6affb0" : "#ff6aa8" }}
          >
            {lastXpGain > 0 ? `+${lastXpGain}` : lastXpGain} XP
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {streakLost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pixel-font text-[8px] tracking-widest text-pink-300 mt-1"
          >
            ✗ STREAK LOST
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
