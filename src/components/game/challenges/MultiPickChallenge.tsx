import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MultiPickItem } from "@/game/investigation";
import { useEcho, pickEchoLine } from "@/game/echo";

interface Props {
  label: string;
  intro?: string;
  items: MultiPickItem[];
  targetIds: string[];
  successLine?: string;
  onComplete: (mistakes: number) => void;
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

const MAX_ATTEMPTS = 3;

export function MultiPickChallenge({ label, intro, items, targetIds, successLine, onComplete, onCancel }: Props) {
  const shuffled = useShuffled(items);
  const echo = useEcho();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);

  const targets = useMemo(() => new Set(targetIds), [targetIds]);
  const need = targetIds.length;

  useEffect(() => {
    echo.say(intro ?? `Choose ${need}. You only get ${MAX_ATTEMPTS} tries — think first.`, "neutral");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (item: MultiPickItem) => {
    if (done) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else if (next.size < need) next.add(item.id);
      return next;
    });
  };

  const confirm = () => {
    if (done || selected.size !== need) return;
    const hits = [...selected].filter((id) => targets.has(id)).length;
    if (hits === need) {
      echo.say(successLine ?? `That was the right call. ${pickEchoLine("praise")}`, "good");
      setDone(true);
      window.setTimeout(() => onComplete(attempts), 1600);
      return;
    }
    const used = attempts + 1;
    setAttempts(used);
    if (used >= MAX_ATTEMPTS) {
      echo.say(
        `${hits} of ${need} were right. Time's up — you go with what you have. That will be remembered.`,
        "bad",
        3000
      );
      setDone(true);
      window.setTimeout(() => onComplete(used + (need - hits)), 2200);
      return;
    }
    // Subtle hint only — never name the answer.
    const hintSource = shuffled.find((it) => selected.has(it.id) && !targets.has(it.id));
    const hint =
      used >= 2 && hintSource?.comment
        ? ` Something you chose felt off: ${hintSource.comment}`
        : ` ${pickEchoLine("nudge")}`;
    echo.say(`${hits} of ${need} are right — but I won't say which.${hint}`, "warn");
    setSelected(new Set());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-cyan"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ CHOOSE</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-4">{label.toUpperCase()}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {shuffled.map((it) => {
          const on = selected.has(it.id);
          return (
            <button
              key={it.id}
              onClick={() => toggle(it)}
              disabled={done}
              className={`text-left pixel-font p-3 border-2 flex items-center gap-2 transition disabled:opacity-60 ${
                on
                  ? "border-cyan-200 bg-cyan-400/15"
                  : "border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-400/10"
              }`}
            >
              <span className="text-2xl">{it.glyph}</span>
              <span className="text-[10px] text-cyan-100 leading-tight flex-1">{it.label}</span>
              {on && <span className="text-cyan-200 text-[9px]">●</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
        <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
          SELECTED {selected.size}/{need} · TRIES LEFT {Math.max(0, MAX_ATTEMPTS - attempts)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={confirm}
            disabled={done || selected.size !== need}
            className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300 disabled:opacity-30"
          >
            ✓ COMMIT
          </button>
          <button
            onClick={onCancel}
            disabled={done}
            className="pixel-font text-[9px] tracking-widest text-pink-300 hover:text-pink-200 border-2 border-pink-400/50 hover:border-pink-400 px-3 py-1.5 bg-black disabled:opacity-40"
          >
            STEP AWAY
          </button>
        </div>
      </div>
    </motion.div>
  );
}
