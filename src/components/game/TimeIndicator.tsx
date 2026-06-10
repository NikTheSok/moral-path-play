import { motion } from "framer-motion";
import type { TimePeriod } from "@/game/types";

const META: Record<TimePeriod, { label: string; icon: string; color: string }> = {
  morning:   { label: "Morning",   icon: "☀", color: "#ffb070" },
  afternoon: { label: "Afternoon", icon: "◐", color: "#8aa8d8" },
  evening:   { label: "Evening",   icon: "◑", color: "#ff3a8a" },
  night:     { label: "Night",     icon: "☾", color: "#3ce8ff" },
};

export function TimeIndicator({ time }: { time: TimePeriod }) {
  const m = META[time];
  return (
    <motion.div
      key={time}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pixel-font text-[10px] tracking-widest bg-black/70 border-2 border-cyan-400/70 px-3 py-2 flex items-center gap-2"
      style={{ boxShadow: `0 0 16px ${m.color}55` }}
    >
      <span style={{ color: m.color, filter: `drop-shadow(0 0 6px ${m.color})` }}>{m.icon}</span>
      <span style={{ color: m.color }}>{m.label.toUpperCase()}</span>
    </motion.div>
  );
}
