import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderItem } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  prompt?: string;
  items: OrderItem[];
  successLine?: string;
  onComplete: () => void;
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

export function OrderChallenge({ label, intro, prompt, items, successLine, onComplete, onCancel }: Props) {
  const shuffled = useShuffled(items);
  const [remaining, setRemaining] = useState<OrderItem[]>(shuffled);
  const [ordered, setOrdered] = useState<OrderItem[]>([]);
  const [message, setMessage] = useState<string | null>(intro ?? null);
  const [tone, setTone] = useState<"neutral" | "wrong" | "success">("neutral");
  const [done, setDone] = useState(false);

  const nextExpectedRank = ordered.length + 1;

  const pick = (item: OrderItem) => {
    if (done) return;
    if (item.rank === nextExpectedRank) {
      const next = [...ordered, item];
      setOrdered(next);
      setRemaining(remaining.filter((r) => r.id !== item.id));
      setMessage(`${item.label} — ${item.caption ?? "correct"}.`);
      setTone("neutral");
      if (next.length === items.length) {
        setMessage(successLine ?? "Perfect order.");
        setTone("success");
        setDone(true);
        window.setTimeout(onComplete, 1500);
      }
    } else {
      setMessage(`Not next in order — try again. (Looking for position ${nextExpectedRank}.)`);
      setTone("wrong");
    }
  };

  const undo = () => {
    if (done || ordered.length === 0) return;
    const last = ordered[ordered.length - 1];
    setOrdered(ordered.slice(0, -1));
    setRemaining([...remaining, last]);
    setMessage("Undone. Try a different pick.");
    setTone("neutral");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-2xl w-full"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ ORDER</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-1">{label.toUpperCase()}</div>
      {prompt && <div className="pixel-font text-[9px] text-cyan-300/70 tracking-widest mb-3">{prompt}</div>}

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

      {/* Ordered lineup */}
      <div className="border-2 border-cyan-400/50 bg-black/60 p-3 mb-4 min-h-[70px]">
        <div className="pixel-font text-[8px] tracking-widest text-cyan-300/70 mb-2">▸ LINEUP</div>
        <div className="flex gap-2 flex-wrap">
          {ordered.length === 0 && (
            <div className="pixel-font text-[9px] text-cyan-300/50">Pick position 1 first.</div>
          )}
          {ordered.map((it, i) => (
            <div key={it.id} className="flex flex-col items-center border-2 border-green-400/60 bg-green-400/5 p-2">
              <span className="pixel-font text-[8px] text-green-300">#{i + 1}</span>
              <span className="text-2xl">{it.glyph}</span>
              <span className="pixel-font text-[8px] text-cyan-100">{it.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Remaining pool */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {remaining.map((it) => (
          <button
            key={it.id}
            onClick={() => pick(it)}
            disabled={done}
            className="text-left p-3 border-2 border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-400/10 flex items-center gap-2"
          >
            <span className="text-2xl">{it.glyph}</span>
            <div className="flex-1 min-w-0">
              <div className="pixel-font text-[10px] text-cyan-100">{it.label}</div>
              {it.caption && <div className="pixel-font text-[8px] text-cyan-300/60">{it.caption}</div>}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={undo}
          disabled={done || ordered.length === 0}
          className="pixel-font text-[9px] tracking-widest text-cyan-300 hover:text-cyan-100 border-2 border-cyan-400/50 px-3 py-1.5 bg-black disabled:opacity-40"
        >
          ↺ UNDO
        </button>
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
