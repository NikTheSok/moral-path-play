import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MultiPickItem } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  items: MultiPickItem[];
  targetIds: string[];
  successLine?: string;
  onComplete: () => void;
  onCancel: () => void;
}

/** Deterministic-per-mount shuffle. */
function useShuffled<T>(items: T[]): T[] {
  return useMemo(() => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [items]);
}

export function MultiPickChallenge({ label, intro, items, targetIds, successLine, onComplete, onCancel }: Props) {
  const shuffled = useShuffled(items);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(intro ?? null);
  const [tone, setTone] = useState<"neutral" | "wrong" | "success">("neutral");
  const [done, setDone] = useState(false);

  const targets = new Set(targetIds);
  const correctCount = [...picked].filter((id) => targets.has(id)).length;

  const pick = (item: MultiPickItem) => {
    if (done || picked.has(item.id) || wrong.has(item.id)) return;
    if (targets.has(item.id)) {
      const next = new Set(picked);
      next.add(item.id);
      setPicked(next);
      setMessage(item.comment ?? "Good pick.");
      setTone("neutral");
      if (next.size === targetIds.length) {
        setMessage(successLine ?? "You did it.");
        setTone("success");
        setDone(true);
        window.setTimeout(onComplete, 1600);
      }
    } else {
      const next = new Set(wrong);
      next.add(item.id);
      setWrong(next);
      setMessage(item.comment ?? "Not that one.");
      setTone("wrong");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-2xl w-full"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ CHOOSE</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-3">{label.toUpperCase()}</div>

      {message && (
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`pixel-font text-[10px] leading-[1.7] mb-4 border-l-2 pl-3 py-1 ${
              tone === "success" ? "border-green-400 text-green-200"
              : tone === "wrong" ? "border-pink-400 text-pink-200"
              : "border-cyan-400/70 text-cyan-100"
            }`}
          >
            {message}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {shuffled.map((it) => {
          const on = picked.has(it.id);
          const bad = wrong.has(it.id);
          return (
            <button
              key={it.id}
              onClick={() => pick(it)}
              disabled={done || on || bad}
              className={`text-left pixel-font p-3 border-2 flex items-center gap-2 transition ${
                on ? "border-green-300 bg-green-400/10"
                : bad ? "border-pink-400/50 bg-pink-400/5 opacity-60"
                : "border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-400/10"
              }`}
            >
              <span className="text-2xl">{it.glyph}</span>
              <span className="text-[10px] text-cyan-100 leading-tight flex-1">{it.label}</span>
              {on && <span className="text-green-300 text-[9px]">✓</span>}
              {bad && <span className="text-pink-300 text-[9px]">✗</span>}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
          FOUND {correctCount} / {targetIds.length}
        </div>
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
