import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AssemblePart, AssembleSlot } from "@/game/investigation";

interface Props {
  label: string;
  intro?: string;
  parts: AssemblePart[];
  slots: AssembleSlot[];
  backdrop?: string;
  successLine?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function AssembleChallenge({ label, intro, parts, slots, backdrop, successLine, onComplete, onCancel }: Props) {
  const [filled, setFilled] = useState<Record<string, string>>({}); // slotId -> partId
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(intro ?? null);
  const [tone, setTone] = useState<"neutral" | "wrong" | "success">("neutral");
  const [done, setDone] = useState(false);

  const usedParts = new Set(Object.values(filled));

  const pickPart = (id: string) => {
    if (done || usedParts.has(id)) return;
    setSelected(id);
    setMessage("Now place it on the correct slot.");
    setTone("neutral");
  };

  const placeSlot = (slot: AssembleSlot) => {
    if (done || !selected || filled[slot.id]) return;
    if (slot.expectPartId === selected) {
      const next = { ...filled, [slot.id]: selected };
      setFilled(next);
      setSelected(null);
      setMessage(slot.filledNote ?? `${slot.label}: locked in.`);
      setTone("neutral");
      if (Object.keys(next).length === slots.length) {
        setMessage(successLine ?? "Assembly complete.");
        setTone("success");
        setDone(true);
        window.setTimeout(onComplete, 1400);
      }
    } else {
      setMessage(`That part doesn't belong in ${slot.label}.`);
      setTone("wrong");
      setSelected(null);
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
      <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-1">▸ ASSEMBLE</div>
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

      {/* Backdrop + slots */}
      <div className="relative border-2 border-cyan-400/50 bg-black/60 p-4 mb-4 min-h-[160px] flex items-center justify-center">
        {backdrop && (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-15 pointer-events-none">
            {backdrop}
          </div>
        )}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {slots.map((s) => {
            const partId = filled[s.id];
            const part = parts.find((p) => p.id === partId);
            return (
              <button
                key={s.id}
                onClick={() => placeSlot(s)}
                disabled={done || !!part || !selected}
                className={`aspect-square flex flex-col items-center justify-center border-2 p-2 transition ${
                  part
                    ? "border-green-300 bg-green-400/10"
                    : selected
                    ? "border-pink-400/70 bg-pink-400/5 hover:bg-pink-400/15 animate-pulse"
                    : "border-cyan-400/40 bg-black/40"
                }`}
              >
                {part ? (
                  <>
                    <span className="text-3xl">{part.glyph}</span>
                    <span className="pixel-font text-[8px] text-green-200 mt-1">{part.label}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl opacity-40">◻</span>
                    <span className="pixel-font text-[8px] text-cyan-300/70 tracking-widest mt-1">{s.label.toUpperCase()}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parts tray */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {parts.map((p) => {
          const used = usedParts.has(p.id);
          const isSel = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => pickPart(p.id)}
              disabled={done || used}
              className={`p-2 border-2 flex flex-col items-center gap-1 transition ${
                used ? "border-cyan-400/20 opacity-30"
                : isSel ? "border-pink-400 bg-pink-400/15 scale-105"
                : "border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-400/10"
              }`}
            >
              <span className="text-2xl">{p.glyph}</span>
              <span className="pixel-font text-[8px] text-cyan-100 leading-tight text-center">{p.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <div className="pixel-font text-[9px] text-cyan-300/60 tracking-widest">
          BUILT {Object.keys(filled).length} / {slots.length}
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
