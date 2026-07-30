import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SortBin, SortItem } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  bins: SortBin[];
  items: SortItem[];
  successLine?: string;
  onComplete: (mistakes: number) => void;
  onCancel: () => void;
}

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

export function SortChallenge({ label, intro, bins, items, successLine, onComplete, onCancel }: Props) {
  const queue = useShuffled(items);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string | null>(
    intro ?? "Every choice is final. Read the label before you drop it."
  );
  const [tone, setTone] = useState<"neutral" | "wrong" | "success">("neutral");
  const [done, setDone] = useState(false);

  const current = idx < queue.length ? queue[idx] : null;

  const drop = (binId: string) => {
    if (!current || done) return;
    const correct = current.binId === binId;
    const nextMistakes = correct ? mistakes : mistakes + 1;
    if (!correct) setMistakes(nextMistakes);
    setCounts((c) => ({ ...c, [binId]: (c[binId] ?? 0) + 1 }));

    const nextIdx = idx + 1;
    setIdx(nextIdx);

    if (nextIdx >= queue.length) {
      const score = queue.length - nextMistakes;
      setDone(true);
      if (nextMistakes === 0) {
        setMessage(successLine ?? "Everything in its place. Flawless.");
        setTone("success");
      } else {
        setMessage(
          `${score}/${queue.length} sorted correctly. ${nextMistakes} item${nextMistakes > 1 ? "s" : ""} ended up in the wrong place — someone will have to redo that.`
        );
        setTone("wrong");
      }
      window.setTimeout(() => onComplete(nextMistakes), 2000);
      return;
    }

    if (correct) {
      setMessage("Placed.");
      setTone("neutral");
    } else {
      setMessage(current.wrongNote ?? "That didn't feel right... but it's done now.");
      setTone("wrong");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ SORT · NO UNDO</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-3">{label.toUpperCase()}</div>

      {message && (
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`pixel-font text-[10px] leading-[1.7] mb-3 border-l-2 pl-3 py-1 ${
              tone === "success" ? "border-green-400 text-green-200"
              : tone === "wrong" ? "border-pink-400 text-pink-200"
              : "border-cyan-400/70 text-cyan-100"
            }`}
          >
            {message}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Current item */}
      <div className="border-2 border-cyan-400/50 bg-black/60 p-4 mb-4 flex items-center justify-center min-h-[80px]">
        {current ? (
          <motion.div
            key={current.id}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-4xl">{current.glyph}</span>
            <span className="pixel-font text-[10px] text-cyan-100">{current.label}</span>
          </motion.div>
        ) : (
          <span className="pixel-font text-[10px] text-green-300 tracking-widest">✓ DONE</span>
        )}
      </div>

      {/* Bins */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {bins.map((b) => (
          <button
            key={b.id}
            onClick={() => drop(b.id)}
            disabled={done || !current}
            className="p-3 border-2 flex flex-col items-center gap-1 bg-black/70 hover:brightness-125 disabled:opacity-50"
            style={{ borderColor: b.color, boxShadow: `0 0 10px ${b.color}66` }}
          >
            <div className="text-2xl">🗑️</div>
            <div className="pixel-font text-[10px]" style={{ color: b.color }}>{b.label}</div>
            {b.hint && <div className="pixel-font text-[8px] text-cyan-300/60 text-center leading-tight">{b.hint}</div>}
            <div className="pixel-font text-[8px] text-cyan-300/50">{counts[b.id] ?? 0}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
          {idx} / {queue.length}
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
