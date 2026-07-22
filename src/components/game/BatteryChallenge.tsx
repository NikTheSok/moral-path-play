import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BatteryOption } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  batteries: BatteryOption[];
  correctId: string;
  successLine?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function BatteryChallenge({ label, intro, batteries, correctId, successLine, onComplete, onCancel }: Props) {
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(intro ?? null);
  const [tone, setTone] = useState<"neutral" | "wrong" | "success">("neutral");
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);

  const insert = (b: BatteryOption) => {
    if (done) return;
    setTried((s) => new Set(s).add(b.id));
    if (b.id === correctId) {
      setMessage(successLine ?? "The dog boots up.");
      setTone("success");
      setDone(true);
      window.setTimeout(onComplete, 1500);
    } else {
      setMessage(b.wrongComment ?? "The dog stutters, then goes dark again.");
      setTone("wrong");
      setShake((n) => n + 1);
    }
  };

  return (
    <motion.div
      key={shake}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, x: shake > 0 ? [0, -6, 6, -4, 4, 0] : 0 }}
      exit={{ opacity: 0 }}
      transition={{ x: { duration: 0.35 } }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-lg w-full"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ REPAIR</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-3">{label.toUpperCase()}</div>

      {/* Robot dog visual */}
      <div className="flex items-center justify-center py-4 mb-3 border-2 border-cyan-400/40 bg-black/60">
        <motion.div
          animate={done ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] } : {}}
          transition={{ duration: 0.9 }}
          className="text-6xl"
          style={{ filter: done ? "drop-shadow(0 0 12px #6affb0)" : "grayscale(0.6) brightness(0.7)" }}
        >
          🐕
        </motion.div>
      </div>

      {message && (
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`pixel-font text-[10px] leading-[1.7] mb-4 border-l-2 pl-3 py-1 ${
              tone === "success"
                ? "border-green-400 text-green-200"
                : tone === "wrong"
                ? "border-pink-400 text-pink-200"
                : "border-cyan-400/70 text-cyan-100"
            }`}
          >
            {message}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="grid gap-2">
        {batteries.map((b) => {
          const used = tried.has(b.id);
          const isCorrect = done && b.id === correctId;
          return (
            <button
              key={b.id}
              onClick={() => insert(b)}
              disabled={done}
              className={`text-left pixel-font p-3 border-2 flex items-center gap-3 transition ${
                isCorrect
                  ? "border-green-300 bg-green-400/10"
                  : used
                  ? "border-pink-400/50 bg-pink-400/5 opacity-60"
                  : "border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-400/10"
              }`}
              style={{
                boxShadow: isCorrect ? "0 0 18px rgba(106,255,176,0.55)" : "0 0 8px rgba(60,232,255,0.2)",
              }}
            >
              <span className="text-2xl">🔋</span>
              <div className="flex-1">
                <div className="text-[11px] text-cyan-100">{b.label}</div>
                <div className="text-[9px] tracking-widest text-cyan-300/70">OUTPUT: {b.voltage}</div>
              </div>
              {used && !isCorrect && (
                <span className="pixel-font text-[8px] tracking-widest text-pink-300">✗ TRIED</span>
              )}
              {isCorrect && (
                <span className="pixel-font text-[8px] tracking-widest text-green-300">✓ MATCH</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onCancel}
          disabled={done}
          className="pixel-font text-[9px] tracking-widest text-pink-300 hover:text-pink-200 border-2 border-pink-400/50 hover:border-pink-400 px-3 py-1.5 bg-black disabled:opacity-40"
        >
          STEP AWAY
        </button>
      </div>
    </motion.div>
  );
}
