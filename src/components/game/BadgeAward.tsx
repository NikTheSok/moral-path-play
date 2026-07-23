import { motion } from "framer-motion";
import type { Badge } from "@/game/investigation";

interface Props {
  badge: Badge;
  onDone: () => void;
}

export function BadgeAward({ badge, onDone }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 grid place-items-center bg-black/70"
      onClick={onDone}
    >
      <motion.div
        initial={{ scale: 0.4, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="relative bg-black border-2 border-cyan-400 px-8 py-6 text-center max-w-sm"
        style={{ boxShadow: "0 0 60px rgba(255,58,138,0.6), 0 0 30px rgba(60,232,255,0.6)" }}
      >
        {/* sparkles */}
        {Array.from({ length: 12 }).map((_, k) => (
          <motion.span
            key={k}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((k / 12) * Math.PI * 2) * 90,
              y: Math.sin((k / 12) * Math.PI * 2) * 90,
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.4, delay: 0.2 + k * 0.05, repeat: Infinity, repeatDelay: 0.8 }}
            className="absolute top-1/2 left-1/2 text-xl pointer-events-none"
          >
            ✨
          </motion.span>
        ))}

        <div className="pixel-font text-[9px] tracking-[0.4em] text-pink-400 mb-2">▸ CHALLENGE COMPLETE</div>
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: [0.6, 1.15, 1] }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-7xl mb-3"
          style={{ filter: "drop-shadow(0 0 12px #ff6aa8)" }}
        >
          {badge.icon}
        </motion.div>
        <div className="pixel-font text-[13px] text-cyan-100 mb-2"
          style={{ textShadow: "0 0 8px rgba(60,232,255,0.6)" }}>
          {badge.name.toUpperCase()}
        </div>
        <div className="pixel-font text-[10px] text-cyan-300/80 leading-[1.7] mb-4">
          "{badge.blurb}"
        </div>
        <button
          onClick={onDone}
          className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
        >
          ▶ CONTINUE
        </button>
      </motion.div>
    </motion.div>
  );
}
