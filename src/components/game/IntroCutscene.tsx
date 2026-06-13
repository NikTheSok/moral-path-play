import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { RobotSprite } from "./RobotSprite";

interface Props {
  onComplete: () => void;
}

const SLIDES = [
  {
    label: "YEAR 2147",
    body: "The cities have grown vertical. The sky is no longer blue.",
    tone: "#3ce8ff",
  },
  {
    label: "HUMANITY",
    body: "Connected to everything. Close to no one. Empathy has become a forgotten protocol.",
    tone: "#ff3a8a",
  },
  {
    label: "PROJECT M.O.R.A.L.",
    body: "Helix Corp built me to study them. To learn what they have lost.",
    tone: "#a26aff",
  },
  {
    label: "UNIT 7",
    body: "An android. A mirror. A student of the species that made me.",
    tone: "#ffd84a",
  },
  {
    label: "FIVE DAYS",
    body: "Five days to walk among them. Five days to decide what kind of soul a machine can become.",
    tone: "#3ce8ff",
  },
];

export function IntroCutscene({ onComplete }: Props) {
  const [i, setI] = useState(0);

  const advance = () => {
    if (i < SLIDES.length - 1) setI(i + 1);
    else onComplete();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") {
        onComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // re-bind each render so `i` is current

  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-hidden bg-black flex flex-col"
    >
      {/* animated scan grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(60,232,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(60,232,255,0.18) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      {/* particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 40 }).map((_, k) => (
          <span
            key={k}
            className="absolute w-1 h-1 rounded-full bg-cyan-300 particle"
            style={{
              left: `${(k * 23) % 100}%`,
              bottom: 0,
              animationDelay: `${(k * 0.35) % 8}s`,
            }}
          />
        ))}
      </div>

      {/* lab silhouette / holographic chamber with the REAL robot */}
      <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
        <motion.div
          key={`chamber-${i}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="relative w-44 h-80 flex items-end justify-center pb-3"
          style={{
            background: `linear-gradient(180deg, transparent, ${slide.tone}33)`,
            border: `2px solid ${slide.tone}`,
            boxShadow: `0 0 80px ${slide.tone}66, inset 0 0 40px ${slide.tone}33`,
          }}
        >
          {/* scan lines inside the chamber */}
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(60,232,255,0.12) 3px 4px)",
          }} />
          {/* the robot itself */}
          <RobotSprite scale={5} animate hibernating={i < 2} eyeIntensity={Math.min(1, 0.2 + i * 0.25)} />
          {/* charging connectors */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1" style={{ background: slide.tone, boxShadow: `0 0 10px ${slide.tone}` }} />
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-1" style={{ background: slide.tone, boxShadow: `0 0 10px ${slide.tone}` }} />
        </motion.div>
      </div>

      {/* main text */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl"
          >
            <div
              className="pixel-font text-[11px] tracking-[0.5em] mb-6"
              style={{ color: slide.tone, textShadow: `0 0 12px ${slide.tone}` }}
            >
              ▸ {slide.label} ◂
            </div>
            <p
              className="pixel-font text-[14px] md:text-[16px] leading-[2.2] text-cyan-50"
              style={{ textShadow: "0 0 12px rgba(60,232,255,0.5)" }}
            >
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* progress dots + skip/begin */}
      <div className="relative z-10 pb-10 flex flex-col items-center gap-4">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="pixel-font text-[9px] tracking-[0.4em] text-cyan-300/80"
        >
          ▸ PRESS [SPACE] TO CONTINUE
        </motion.div>
        <div className="flex gap-2">
          {SLIDES.map((_, k) => (
            <div
              key={k}
              className="w-6 h-1.5 transition-colors"
              style={{ background: k === i ? slide.tone : "rgba(60,232,255,0.2)", boxShadow: k === i ? `0 0 8px ${slide.tone}` : "none" }}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {isLast ? (
            <button
              onClick={onComplete}
              className="pixel-font text-[11px] tracking-widest px-6 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
              style={{ boxShadow: "0 0 24px rgba(60,232,255,0.7)" }}
            >
              ▶ INITIATE TRIAL
            </button>
          ) : (
            <>
              <button
                onClick={() => setI(i + 1)}
                className="pixel-font text-[10px] tracking-widest px-4 py-2 border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10"
              >
                ▶ NEXT
              </button>
              <button
                onClick={onComplete}
                className="pixel-font text-[10px] tracking-widest px-4 py-2 border-2 border-cyan-400/30 text-cyan-300/70 hover:text-cyan-300"
              >
                SKIP
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
