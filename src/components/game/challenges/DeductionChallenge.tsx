import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Deduction, DeductionOption } from "@/game/investigation";
import { useEcho, pickEchoLine } from "@/game/echo";

interface Props {
  deduction: Deduction;
  /** clue labels the player actually gathered — shown as their evidence board */
  evidence: { label: string; detail: string }[];
  /** Empathy Core module: one-use gut feeling that removes a plainly wrong option. */
  empathyCore?: boolean;
  onResolve: (r: { wrongCalls: number; falseAccusation: boolean; solved: boolean }) => void;
}

const MAX_CALLS = 3;

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

export function DeductionChallenge({ deduction, evidence, empathyCore, onResolve }: Props) {
  const options = useShuffled(deduction.options);
  const echo = useEcho();
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [hintedIds, setHintedIds] = useState<string[]>([]);
  const [accused, setAccused] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    echo.say(
      "Read your evidence. Three calls — a wrong one costs you, and blaming an innocent person costs more.",
      "neutral"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Empathy Core: cross out one plainly wrong option (never a false accusation) — free, once. */
  const useGutFeeling = () => {
    if (hintUsed || done) return;
    const taken = [...wrongIds, ...hintedIds];
    const target =
      options.find((o) => !o.correct && !o.accusation && !taken.includes(o.id)) ??
      options.find((o) => !o.correct && !taken.includes(o.id));
    if (!target) return;
    setHintUsed(true);
    setHintedIds((h) => [...h, target.id]);
    if (selected === target.id) setSelected(null);
    echo.say("💗 Empathy Core: something about that option feels wrong to you. It's off the table.", "warn");
  };

  const commit = () => {
    if (done || !selected) return;
    const opt = options.find((o) => o.id === selected) as DeductionOption;
    if (opt.correct) {
      echo.say(`${deduction.successNote} ${pickEchoLine("praise")}`, "good", 3000);
      setDone(true);
      window.setTimeout(
        () => onResolve({ wrongCalls: wrongIds.length, falseAccusation: accused, solved: true }),
        2000
      );
      return;
    }
    const nextWrong = [...wrongIds, opt.id];
    const nextAccused = accused || !!opt.accusation;
    setWrongIds(nextWrong);
    setAccused(nextAccused);
    setSelected(null);

    if (nextWrong.length >= MAX_CALLS) {
      echo.say(
        `${opt.wrongNote ?? "That wasn't it."} You're out of calls. The case closes wrong, and everyone here knows it.`,
        "bad",
        3400
      );
      setDone(true);
      window.setTimeout(
        () => onResolve({ wrongCalls: nextWrong.length, falseAccusation: nextAccused, solved: false }),
        2600
      );
      return;
    }
    const nudge = nextWrong.length >= 2 && deduction.hint ? ` ${deduction.hint}` : ` ${pickEchoLine("scold")}`;
    echo.say(`${opt.wrongNote ?? "That wasn't it."}${nudge}`, "bad");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-black/95 border-2 border-pink-400 p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-pink"
      style={{ boxShadow: "0 0 32px rgba(255,58,138,0.5)" }}
    >
      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ DRAW YOUR CONCLUSION</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-4 leading-relaxed">{deduction.question}</div>

      {evidence.length > 0 && (
        <div className="border-2 border-cyan-400/40 bg-black/60 p-3 mb-4">
          <div className="pixel-font text-[8px] tracking-[0.3em] text-cyan-300/70 mb-2">▸ YOUR EVIDENCE</div>
          <ul className="space-y-1">
            {evidence.map((e) => (
              <li key={e.label} className="pixel-font text-[9px] text-cyan-200/90 leading-relaxed">
                • <span className="text-cyan-100">{e.label}</span> — {e.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-2">
        {options.map((o) => {
          const dead = wrongIds.includes(o.id) || hintedIds.includes(o.id);
          const on = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => !dead && !done && setSelected(o.id)}
              disabled={dead || done}
              className={`text-left pixel-font text-[10px] leading-snug p-3 border-2 transition ${
                dead
                  ? "border-pink-400/25 text-pink-300/40 line-through cursor-not-allowed"
                  : on
                  ? "border-cyan-200 bg-cyan-400/15 text-cyan-50"
                  : "border-cyan-400/60 text-cyan-100 hover:border-cyan-300 hover:bg-cyan-400/10"
              }`}
            >
              {hintedIds.includes(o.id) && <span className="text-pink-300/70 mr-1">💗</span>}
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
        <div className="pixel-font text-[9px] text-pink-300/70 tracking-widest">
          CALLS LEFT {Math.max(0, MAX_CALLS - wrongIds.length)}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {empathyCore && (
            <button
              onClick={useGutFeeling}
              disabled={hintUsed || done}
              title="Empathy Core: rules out one wrong option, free of charge"
              className="pixel-font text-[9px] tracking-widest px-3 py-2 border-2 border-pink-400/70 text-pink-200 hover:bg-pink-400/10 disabled:opacity-30"
            >
              💗 {hintUsed ? "GUT FEELING USED" : "GUT FEELING"}
            </button>
          )}
          <button
            onClick={commit}
            disabled={!selected || done}
            className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-pink-400 text-black border-2 border-pink-200 hover:bg-pink-300 disabled:opacity-30"
          >
            ✓ STATE IT OUT LOUD
          </button>
        </div>
      </div>
    </motion.div>
  );
}
