import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Simon-style sequence challenge.
 * Watch the pattern flash, then replay it with 1/2/3/4 keys (or click).
 * ~30-60s. Fail → reshuffle, no penalty.
 */
interface Props {
  size: number;                 // number of steps in the pattern
  label: string;
  onComplete: (mistakes: number) => void;
  onCancel: () => void;
}

const PADS = [
  { key: "1", color: "#3ce8ff", glow: "rgba(60,232,255,0.7)"  }, // cyan
  { key: "2", color: "#ff3a8a", glow: "rgba(255,58,138,0.7)"  }, // pink
  { key: "3", color: "#ffd84a", glow: "rgba(255,216,74,0.7)"  }, // yellow
  { key: "4", color: "#6affb0", glow: "rgba(106,255,176,0.7)" }, // green
];

export function SequenceChallenge({ size, label, onComplete, onCancel }: Props) {
  const pattern = useMemo(
    () => Array.from({ length: size }, () => Math.floor(Math.random() * 4)),
    // regenerate whenever size changes or after a fail
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size]
  );
  const [phase, setPhase] = useState<"watch" | "input" | "fail" | "done">("watch");
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Play the pattern
  useEffect(() => {
    if (phase !== "watch") return;
    let i = 0;
    const step = () => {
      if (i >= pattern.length) {
        setFlashIdx(null);
        setPhase("input");
        return;
      }
      setFlashIdx(pattern[i]);
      timerRef.current = window.setTimeout(() => {
        setFlashIdx(null);
        timerRef.current = window.setTimeout(() => {
          i++;
          step();
        }, 140);
      }, 420);
    };
    // small opening pause
    timerRef.current = window.setTimeout(step, 600);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [pattern, phase, attempt]);

  const press = (padIdx: number) => {
    if (phase !== "input") return;
    setFlashIdx(padIdx);
    window.setTimeout(() => setFlashIdx(null), 160);
    if (padIdx === pattern[progress]) {
      const nextProg = progress + 1;
      if (nextProg >= pattern.length) {
        setPhase("done");
        window.setTimeout(() => onComplete(attempt), 700);
      } else {
        setProgress(nextProg);
      }
    } else {
      setPhase("fail");
      window.setTimeout(() => {
        setProgress(0);
        setAttempt((a) => a + 1);
        setPhase("watch");
      }, 900);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCancel(); return; }
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0) press(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, progress]);

  const status =
    phase === "watch" ? "▸ OBSERVE PATTERN"
    : phase === "input" ? `▸ REPLAY [${progress}/${pattern.length}]`
    : phase === "fail" ? "✗ MISMATCH — RETRY"
    : "✓ SEQUENCE MATCHED";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-md w-full"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ CHALLENGE</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-3">{label.toUpperCase()}</div>
      <div className={`pixel-font text-[10px] tracking-widest mb-4 ${phase === "fail" ? "text-red-400" : phase === "done" ? "text-green-400" : "text-cyan-300"}`}>
        {status}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PADS.map((p, i) => {
          const active = flashIdx === i;
          return (
            <button
              key={p.key}
              onClick={() => press(i)}
              disabled={phase !== "input"}
              className="pixel-font relative aspect-square border-2 transition-all disabled:cursor-default"
              style={{
                borderColor: p.color,
                background: active ? p.color : "rgba(0,0,0,0.6)",
                boxShadow: active ? `0 0 28px ${p.glow}, inset 0 0 20px ${p.glow}` : `0 0 6px ${p.glow}`,
              }}
            >
              <span
                className="text-[24px]"
                style={{ color: active ? "#000" : p.color, textShadow: active ? "none" : `0 0 8px ${p.glow}` }}
              >
                {p.key}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
          KEYS 1 · 2 · 3 · 4
        </div>
        <button
          onClick={onCancel}
          className="pixel-font text-[9px] tracking-widest text-pink-300 hover:text-pink-200 border-2 border-pink-400/50 hover:border-pink-400 px-3 py-1.5 bg-black"
        >
          ABORT
        </button>
      </div>
    </motion.div>
  );
}
