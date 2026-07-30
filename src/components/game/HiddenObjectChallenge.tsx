import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HiddenObjectItem } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  objects: HiddenObjectItem[];
  correctId: string;
  successLine?: string;
  onComplete: (mistakes: number) => void;
  onCancel: () => void;
}

/** Shuffled fixed layout — deterministic per mount so the player can search. */
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

export function HiddenObjectChallenge({ label, intro, objects, correctId, successLine, onComplete, onCancel }: Props) {
  const shuffled = useShuffled(objects);
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(intro ?? null);
  const [messageTone, setMessageTone] = useState<"neutral" | "wrong" | "success">("neutral");
  const [done, setDone] = useState(false);
  const [wrongs, setWrongs] = useState(0);

  const pick = (item: HiddenObjectItem) => {
    if (done || inspected.has(item.id)) return;
    setInspected((s) => new Set(s).add(item.id));
    if (item.id === correctId) {
      setMessage(successLine ?? "You found it.");
      setMessageTone("success");
      setDone(true);
      window.setTimeout(() => onComplete(wrongs), 1400);
    } else {
      const w = wrongs + 1;
      setWrongs(w);
      setMessage(
        (item.wrongComment ?? "Not the item they described.") +
          (w >= 2 ? " Slow down — re-read what they asked for." : "")
      );
      setMessageTone("wrong");
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
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ SEARCH</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-3">{label.toUpperCase()}</div>

      {message && (
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`pixel-font text-[10px] leading-[1.7] mb-4 border-l-2 pl-3 py-1 ${
              messageTone === "success"
                ? "border-green-400 text-green-200"
                : messageTone === "wrong"
                ? "border-pink-400 text-pink-200"
                : "border-cyan-400/70 text-cyan-100"
            }`}
          >
            {message}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Sandbox grid */}
      <div
        className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-[#1a1204] border-2 border-yellow-700/50"
        style={{ boxShadow: "inset 0 0 24px rgba(0,0,0,0.6)" }}
      >
        {shuffled.map((obj) => {
          const seen = inspected.has(obj.id);
          const isCorrect = done && obj.id === correctId;
          return (
            <button
              key={obj.id}
              onClick={() => pick(obj)}
              disabled={done}
              className={`aspect-square flex flex-col items-center justify-center pixel-font transition ${
                isCorrect
                  ? "bg-green-400/20 border-2 border-green-300"
                  : seen
                  ? "bg-black/40 border-2 border-pink-400/40 opacity-60"
                  : "bg-black/60 border-2 border-cyan-400/40 hover:bg-cyan-400/15 hover:border-cyan-300"
              }`}
              style={{
                boxShadow: isCorrect
                  ? "0 0 18px rgba(106,255,176,0.6)"
                  : seen
                  ? "none"
                  : "0 0 8px rgba(60,232,255,0.2)",
              }}
              title={obj.label}
            >
              <span className="text-2xl leading-none">{obj.glyph}</span>
              <span className="text-[7px] tracking-widest text-cyan-300/70 mt-1 text-center leading-tight px-1">
                {obj.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
          INSPECTED {inspected.size} / {shuffled.length}
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
