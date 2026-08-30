import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CircuitNode } from "@/game/investigation";
import { useEcho, pickEchoLine } from "@/game/echo";

interface Props {
  label: string;
  intro?: string;
  nodes: CircuitNode[];
  onComplete: (mistakes: number) => void;
  onCancel: () => void;
}

const GROUP_COLOR: Record<CircuitNode["group"], string> = {
  A: "#ff5a5a", // red
  B: "#3ce8ff", // cyan
  C: "#ffd84a", // amber
};

interface Wire {
  from: string;
  to: string;
  correct: boolean;
}

export function CircuitChallenge({ label, intro, nodes, onComplete, onCancel }: Props) {
  const left = nodes.filter((n) => n.side === "L");
  const right = nodes.filter((n) => n.side === "R");
  const echo = useEcho();

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [spark, setSpark] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    echo.say(intro ?? "Link matching colors. A bad wire burns out for good.", "neutral");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeById = (id: string) => nodes.find((n) => n.id === id)!;
  const leftConnected = (id: string) => wires.some((w) => w.from === id && w.correct);
  const rightConnected = (id: string) => wires.some((w) => w.to === id && w.correct);

  const clickLeft = (id: string) => {
    if (done || leftConnected(id)) return;
    setSelectedLeft(id);
  };

  const clickRight = (id: string) => {
    if (done || rightConnected(id) || !selectedLeft) return;
    const from = nodeById(selectedLeft);
    const to = nodeById(id);
    const correct = from.group === to.group;
    const newWire: Wire = { from: selectedLeft, to: id, correct };
    if (correct) {
      const nextWires = [...wires, newWire];
      setWires(nextWires);
      setSelectedLeft(null);
      if (nextWires.filter((w) => w.correct).length === left.length) {
        echo.say("Terminal restored. A hologram flickers into life. " + pickEchoLine("praise"), "good");
        setDone(true);
        window.setTimeout(() => onComplete(wrongs), 1600);
      } else {
        echo.say("Node linked. Power flows.", "neutral", 2200);
      }
    } else {
      setSpark((n) => n + 1);
      setWrongs((n) => n + 1);
      setSelectedLeft(null);
      echo.say("Spark! Same-color links only — that wire is gone. " + pickEchoLine("scold"), "bad");
    }
  };

  const reset = () => {
    if (done) return;
    setWires([]);
    setSelectedLeft(null);
    echo.say("Panel cleared. Try again — carefully this time.", "warn", 2400);
  };

  return (
    <motion.div
      key={spark}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, x: spark > 0 ? [0, -4, 4, -3, 3, 0] : 0 }}
      exit={{ opacity: 0 }}
      transition={{ x: { duration: 0.3 } }}
      className="relative bg-black/95 border-2 border-cyan-400 p-5 max-w-lg w-full"
      style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
    >
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ REPAIR</div>
      <div className="pixel-font text-[12px] text-cyan-100 mb-3">{label.toUpperCase()}</div>

      {/* Panel */}
      <div className="relative border-2 border-cyan-400/50 bg-black/70 p-4" style={{ boxShadow: "inset 0 0 24px rgba(60,232,255,0.15)" }}>
        <div className="grid grid-cols-2 gap-8 relative z-10">
          <div className="flex flex-col gap-3">
            {left.map((n) => {
              const connected = leftConnected(n.id);
              const selected = selectedLeft === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => clickLeft(n.id)}
                  disabled={done || connected}
                  className={`pixel-font text-[10px] tracking-widest px-3 py-2 border-2 transition ${
                    connected ? "opacity-60 cursor-default" : selected ? "scale-[1.03]" : "hover:brightness-125"
                  }`}
                  style={{
                    borderColor: GROUP_COLOR[n.group],
                    color: GROUP_COLOR[n.group],
                    background: selected ? `${GROUP_COLOR[n.group]}22` : "rgba(0,0,0,0.6)",
                    boxShadow: connected
                      ? `0 0 14px ${GROUP_COLOR[n.group]}`
                      : selected
                      ? `0 0 18px ${GROUP_COLOR[n.group]}`
                      : `0 0 6px ${GROUP_COLOR[n.group]}88`,
                  }}
                >
                  ● {n.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {right.map((n) => {
              const connected = rightConnected(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => clickRight(n.id)}
                  disabled={done || connected || !selectedLeft}
                  className={`pixel-font text-[10px] tracking-widest px-3 py-2 border-2 transition ${
                    connected ? "opacity-60 cursor-default" : "hover:brightness-125"
                  } ${!selectedLeft && !connected ? "opacity-70" : ""}`}
                  style={{
                    borderColor: GROUP_COLOR[n.group],
                    color: GROUP_COLOR[n.group],
                    background: "rgba(0,0,0,0.6)",
                    boxShadow: connected ? `0 0 14px ${GROUP_COLOR[n.group]}` : `0 0 6px ${GROUP_COLOR[n.group]}88`,
                  }}
                >
                  {n.label} ●
                </button>
              );
            })}
          </div>
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {wires.filter((w) => w.correct).map((w, i) => (
            <line
              key={i}
              x1="35%" y1={`${((left.findIndex((n) => n.id === w.from) + 0.5) / left.length) * 100}%`}
              x2="65%" y2={`${((right.findIndex((n) => n.id === w.to) + 0.5) / right.length) * 100}%`}
              stroke={GROUP_COLOR[nodeById(w.from).group]}
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 4px ${GROUP_COLOR[nodeById(w.from).group]})` }}
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={reset}
          disabled={done || wires.length === 0}
          className="pixel-font text-[9px] tracking-widest text-cyan-300 hover:text-cyan-100 border-2 border-cyan-400/50 hover:border-cyan-400 px-3 py-1.5 bg-black disabled:opacity-40"
        >
          ↺ RESET PANEL
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
