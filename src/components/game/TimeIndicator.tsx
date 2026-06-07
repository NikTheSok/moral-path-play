import { motion } from "framer-motion";
import type { TimePeriod } from "@/game/types";

const META: Record<TimePeriod, { label: string; icon: string; color: string }> = {
  morning:   { label: "Morning",   icon: "☀", color: "oklch(0.8 0.15 70)" },
  afternoon: { label: "Afternoon", icon: "🌤", color: "oklch(0.78 0.13 50)" },
  evening:   { label: "Evening",   icon: "🌙", color: "oklch(0.7 0.1 280)" },
};

export function TimeIndicator({ time }: { time: TimePeriod }) {
  const m = META[time];
  return (
    <motion.div
      key={time}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-md border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-xl"
    >
      <span className="text-xl" style={{ filter: `drop-shadow(0 0 8px ${m.color})` }}>{m.icon}</span>
      <span className="text-sm tracking-wide text-display" style={{ color: m.color }}>{m.label}</span>
    </motion.div>
  );
}
