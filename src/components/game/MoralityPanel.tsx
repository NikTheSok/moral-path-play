import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Morality, MoralityKey } from "@/game/types";

const META: Record<MoralityKey, { label: string; color: string; tip: string }> = {
  empathy:        { label: "Empathy",        color: "#ff6aa8", tip: "Willingness to help and understand others." },
  honesty:        { label: "Honesty",        color: "#3ce8ff", tip: "Truthfulness and transparency in interactions." },
  responsibility: { label: "Responsibility", color: "#6affb0", tip: "Accountability and reliability under pressure." },
  courage:        { label: "Courage",        color: "#ffd84a", tip: "Willingness to act despite personal risk." },
  selfishness:    { label: "Selfishness",    color: "#a26aff", tip: "Prioritization of self-interest over others." },
};

function reputationScore(m: Morality): number {
  const good = m.empathy + m.responsibility + m.courage * 0.5 + m.honesty * 0.5;
  const bad = m.selfishness * 1.4 + Math.max(0, -m.empathy) + Math.max(0, -m.honesty);
  return Math.max(-1, Math.min(1, (good - bad) / 14));
}

export function MoralityPanel({ morality }: { morality: Morality }) {
  const max = 14;
  const [hover, setHover] = useState<string | null>(null);
  const rep = reputationScore(morality);
  const repLabel = rep > 0.45 ? "BELOVED" : rep > 0.15 ? "TRUSTED" : rep > -0.15 ? "WATCHED" : rep > -0.45 ? "FEARED" : "NOTORIOUS";
  const repColor = rep > 0.15 ? "#6affb0" : rep > -0.15 ? "#3ce8ff" : "#ff5a5a";

  return (
    <div
      className="relative bg-black/90 border-2 border-cyan-400 p-3.5 w-[300px]"
      style={{ boxShadow: "0 0 24px rgba(60,232,255,0.4), inset 0 0 14px rgba(60,232,255,0.08)" }}
    >
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-pink-400" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-pink-400" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-pink-400" />

      <div className="flex items-center justify-between mb-2.5">
        <div className="pixel-font text-[10px] tracking-[0.3em] text-cyan-300" style={{ textShadow: "0 0 6px rgba(60,232,255,0.5)" }}>
          ▸ MORALITY CORE
        </div>
        <div className="pixel-font text-[8px] text-cyan-300/60">UNIT 7</div>
      </div>

      <div className="space-y-2">
        {(Object.keys(META) as MoralityKey[]).map((k) => {
          const v = morality[k];
          const pct = Math.max(0, Math.min(100, ((v + max) / (max * 2)) * 100));
          const meta = META[k];
          return (
            <div
              key={k}
              className="relative"
              onMouseEnter={() => setHover(k)}
              onMouseLeave={() => setHover((h) => (h === k ? null : h))}
            >
              <div className="flex justify-between pixel-font text-[10px] mb-1">
                <span className="text-cyan-100">{meta.label}</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    className="font-mono tabular-nums text-[11px]"
                    style={{ color: meta.color, textShadow: `0 0 6px ${meta.color}` }}
                  >
                    {v > 0 ? `+${v}` : v}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="h-2.5 bg-cyan-400/10 relative border border-cyan-400/30">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-400/40" />
                <motion.div
                  className="h-full"
                  style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                  initial={false}
                  animate={{
                    width: `${Math.abs(pct - 50)}%`,
                    marginLeft: pct >= 50 ? "50%" : `${pct}%`,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
              </div>
              {hover === k && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-full top-0 ml-2 z-30 w-52 bg-black/95 border-2 px-2.5 py-2 text-[10px] leading-relaxed pixel-font"
                  style={{ borderColor: meta.color, color: meta.color, boxShadow: `0 0 12px ${meta.color}55` }}
                >
                  <div className="mb-1 tracking-widest text-[9px]">{meta.label.toUpperCase()}</div>
                  <div className="text-cyan-100/90 font-sans text-[10px]">{meta.tip}</div>
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Reputation */}
        <div
          className="relative pt-2 mt-2 border-t border-cyan-400/30"
          onMouseEnter={() => setHover("reputation")}
          onMouseLeave={() => setHover((h) => (h === "reputation" ? null : h))}
        >
          <div className="flex justify-between pixel-font text-[10px] mb-1">
            <span className="text-cyan-100">Reputation</span>
            <span className="font-mono text-[11px]" style={{ color: repColor, textShadow: `0 0 6px ${repColor}` }}>
              {repLabel}
            </span>
          </div>
          <div className="h-2.5 bg-cyan-400/10 relative border border-cyan-400/30">
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-400/40" />
            <motion.div
              className="h-full"
              style={{ background: repColor, boxShadow: `0 0 8px ${repColor}` }}
              initial={false}
              animate={{
                width: `${Math.abs(rep) * 50}%`,
                marginLeft: rep >= 0 ? "50%" : `${50 - Math.abs(rep) * 50}%`,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </div>
          {hover === "reputation" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-full top-0 ml-2 z-30 w-52 bg-black/95 border-2 px-2.5 py-2 text-[10px] leading-relaxed pixel-font"
              style={{ borderColor: repColor, color: repColor, boxShadow: `0 0 12px ${repColor}55` }}
            >
              <div className="mb-1 tracking-widest text-[9px]">REPUTATION</div>
              <div className="text-cyan-100/90 font-sans text-[10px]">Public opinion of the robot — derived from your behavior across the city.</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
