import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const CREDITS = [
  { role: "DIRECTION & DESIGN", name: "PROJECT M.O.R.A.L." },
  { role: "WRITING", name: "NARRATIVE CORE v7" },
  { role: "PIXEL ART", name: "CANVAS RASTER UNIT" },
  { role: "AI COMPANION", name: "ECHO-9 HOLO-DRONE" },
  { role: "MUSIC (PLACEHOLDER)", name: "AMBIENT SUBROUTINES" },
  { role: "SPECIAL THANKS", name: "EVERY HUMAN WHO STILL TRIES" },
];

export function Credits({ onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-hidden bg-black flex items-center justify-center"
    >
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{
        backgroundImage: "linear-gradient(rgba(60,232,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.2) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(60,232,255,0.18), transparent 60%)" }} />

      <div className="relative z-10 max-w-xl w-full px-6 py-10 text-center">
        <div className="pixel-font text-[10px] tracking-[0.5em] text-pink-400 mb-2" style={{ textShadow: "0 0 10px rgba(255,58,138,0.6)" }}>
          ▸ ARCHIVE · TRIAL DOCUMENTATION
        </div>
        <h1 className="pixel-font text-2xl md:text-3xl text-cyan-200 mb-8" style={{ textShadow: "0 0 14px rgba(60,232,255,0.6)" }}>
          CREDITS
        </h1>

        <div className="space-y-4 mb-10">
          {CREDITS.map((c, i) => (
            <motion.div
              key={c.role}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <div className="pixel-font text-[9px] tracking-[0.3em] text-cyan-400/70">{c.role}</div>
              <div className="pixel-font text-[11px] tracking-widest text-pink-300 mt-1" style={{ textShadow: "0 0 6px rgba(255,58,138,0.5)" }}>
                ▸ {c.name}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="pixel-font text-[10px] text-cyan-200/70 leading-[2] mb-8"
        >
          A FUTURISTIC PIXEL-ART NARRATIVE GAME ABOUT WHAT IT MEANS TO STAY HUMAN — EVEN IF YOU ARE NOT ONE.
        </motion.p>

        <button
          onClick={onBack}
          className="pixel-font text-[11px] tracking-widest px-6 py-3 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
          style={{ boxShadow: "0 0 18px rgba(60,232,255,0.3)" }}
        >
          ◄ BACK TO MENU
        </button>
      </div>
    </motion.div>
  );
}
