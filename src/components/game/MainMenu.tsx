import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
  onContinue: () => void;
  onInstructions: () => void;
  onCredits: () => void;
  hasSave: boolean;
}

export function MainMenu({ onStart, onContinue, onInstructions, onCredits, hasSave }: Props) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-black"
    >
      {/* grid */}
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{
        backgroundImage: "linear-gradient(rgba(60,232,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.2) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-300 particle"
            style={{
              left: `${(i * 31) % 100}%`,
              bottom: 0,
              animationDelay: `${(i * 0.5) % 6}s`,
            }}
          />
        ))}
      </div>

      {/* glow blob */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(255,58,138,0.18), transparent 60%)",
      }} />

      <div className="relative text-center max-w-md px-6 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="pixel-font text-[10px] tracking-[0.5em] text-pink-400 mb-6" style={{ textShadow: "0 0 10px rgba(255,58,138,0.7)" }}>
            ▸ HELIX CORP · PROJECT M.O.R.A.L.
          </div>
          <h1 className="pixel-font text-3xl md:text-5xl text-cyan-200 leading-[1.6]" style={{ textShadow: "0 0 18px rgba(60,232,255,0.7)" }}>
            MORAL<br />
            <span className="text-pink-400" style={{ textShadow: "0 0 18px rgba(255,58,138,0.7)" }}>JOURNEY</span>
          </h1>
          <p className="pixel-font text-[10px] md:text-[11px] text-cyan-200/70 mt-8 leading-[2]">
            FIVE DAYS · ONE ANDROID · A THOUSAND CHOICES
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 space-y-3"
        >
          {hasSave && (
            <button
              onClick={onContinue}
              className="w-full pixel-font text-[12px] tracking-widest px-6 py-4 bg-pink-400 text-black border-2 border-pink-200 hover:bg-pink-300 transition-all"
              style={{ boxShadow: "0 0 24px rgba(255,58,138,0.7)" }}
            >
              ▶ CONTINUE
            </button>
          )}
          <button
            onClick={onStart}
            className="w-full pixel-font text-[12px] tracking-widest px-6 py-4 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300 transition-all"
            style={{ boxShadow: "0 0 24px rgba(60,232,255,0.7)" }}
          >
            ▶ {hasSave ? "START FROM BEGINNING" : "INITIATE TRIAL"}
          </button>
          <button
            onClick={onInstructions}
            className="w-full pixel-font text-[10px] tracking-widest px-6 py-3 border-2 border-cyan-400/70 text-cyan-300 hover:bg-cyan-400/10"
          >
            ▶ INSTRUCTIONS
          </button>
          <button
            onClick={onCredits}
            className="w-full pixel-font text-[10px] tracking-widest px-6 py-3 border-2 border-pink-400/50 text-pink-300/90 hover:bg-pink-400/10"
          >
            ▶ CREDITS
          </button>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 pixel-font text-[9px] text-cyan-400/50 tracking-widest"
        >
          // WHAT KIND OF SOUL WILL YOU BECOME?
        </motion.div>
      </div>
    </motion.div>
  );
}
