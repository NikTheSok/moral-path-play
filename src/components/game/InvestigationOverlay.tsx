import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Investigation, Interactable } from "@/game/investigation";
import { SequenceChallenge } from "./SequenceChallenge";

interface Props {
  investigation: Investigation;
  onComplete: () => void;
  onAbort: () => void;
}

const KIND_LABEL: Record<Interactable["kind"], string> = {
  scan: "SCAN",
  witness: "TALK",
  prop: "INSPECT",
  terminal: "INTERFACE",
};

const KIND_COLOR: Record<Interactable["kind"], string> = {
  scan: "#3ce8ff",
  witness: "#ff6aa8",
  prop: "#ffd84a",
  terminal: "#6affb0",
};

export function InvestigationOverlay({ investigation, onComplete, onAbort }: Props) {
  const [logged, setLogged] = useState<Set<string>>(new Set());
  const [inspecting, setInspecting] = useState<Interactable | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeDone, setChallengeDone] = useState(!investigation.challenge);

  // Reset when the investigation changes
  useEffect(() => {
    setLogged(new Set());
    setInspecting(null);
    setChallengeOpen(false);
    setChallengeDone(!investigation.challenge);
  }, [investigation.scenarioId, investigation.challenge]);

  const cluesById = useMemo(() => {
    const m: Record<string, { label: string; detail: string }> = {};
    for (const c of investigation.clues) m[c.id] = c;
    return m;
  }, [investigation.clues]);

  const requiredMet = investigation.requiredClueIds.every((c) => logged.has(c));
  const challengeUnlocked =
    !!investigation.challenge &&
    (investigation.challenge.unlockClues ?? []).every((c) => logged.has(c));
  const canProceed = requiredMet && challengeDone;

  const inspect = (it: Interactable) => {
    if (it.requiresClueId && !logged.has(it.requiresClueId)) return;
    setInspecting(it);
    if (it.yieldsClueId) {
      setLogged((prev) => {
        if (prev.has(it.yieldsClueId!)) return prev;
        const next = new Set(prev);
        next.add(it.yieldsClueId!);
        return next;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm overflow-y-auto"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0 2px, rgba(60,232,255,0.05) 2px 3px)",
      }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-black/90 border-b-2 border-cyan-400/70 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="pixel-font text-[9px] tracking-[0.35em] text-pink-400 mb-1">
            ▸ INVESTIGATION MODE
          </div>
          <div className="pixel-font text-[11px] md:text-[12px] text-cyan-100 leading-relaxed">
            {investigation.objective}
          </div>
        </div>
        <div className="pixel-font text-[10px] tracking-widest bg-black border-2 border-cyan-400 text-cyan-300 px-3 py-2 whitespace-nowrap"
          style={{ boxShadow: "0 0 12px rgba(60,232,255,0.4)" }}>
          CLUES {logged.size}/{investigation.requiredClueIds.length}
        </div>
        <button
          onClick={onAbort}
          title="Leave — walk away without confronting"
          className="pixel-font w-9 h-9 grid place-items-center bg-black text-pink-300 border-2 border-pink-400/70 hover:bg-pink-400/15 hover:text-pink-200"
        >
          <X size={16} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 grid gap-6 md:grid-cols-[1fr_260px]">
        {/* Interactables */}
        <div>
          <div className="pixel-font text-[9px] tracking-[0.3em] text-cyan-300/80 mb-3">
            ▸ SCENE — INSPECT ELEMENTS
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {investigation.interactables.map((it) => {
              const gated = it.requiresClueId && !logged.has(it.requiresClueId);
              const done = it.yieldsClueId && logged.has(it.yieldsClueId);
              return (
                <button
                  key={it.id}
                  onClick={() => inspect(it)}
                  disabled={!!gated}
                  className={`text-left relative bg-black/80 border-2 p-3 transition ${
                    gated
                      ? "border-cyan-400/20 opacity-40 cursor-not-allowed"
                      : done
                      ? "border-green-400/70 hover:bg-green-400/10"
                      : "border-cyan-400/60 hover:bg-cyan-400/10 hover:border-cyan-300"
                  }`}
                  style={{ boxShadow: done ? "0 0 12px rgba(106,255,176,0.35)" : "0 0 10px rgba(60,232,255,0.25)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl leading-none">{it.glyph}</div>
                    <div className="flex-1 min-w-0">
                      <div className="pixel-font text-[8px] tracking-[0.3em] mb-1" style={{ color: KIND_COLOR[it.kind] }}>
                        {done ? "✓ LOGGED" : gated ? "▸ LOCKED" : `▸ ${KIND_LABEL[it.kind]}`}
                      </div>
                      <div className="pixel-font text-[11px] text-cyan-100 leading-snug mb-1">
                        {it.label}
                      </div>
                      <div className="pixel-font text-[9px] text-cyan-300/60 leading-relaxed">
                        {gated ? "Requires more information." : it.hint}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Challenge slot */}
          {investigation.challenge && (
            <div className="mt-6">
              <div className="pixel-font text-[9px] tracking-[0.3em] text-cyan-300/80 mb-3">
                ▸ CHALLENGE
              </div>
              <button
                onClick={() => challengeUnlocked && !challengeDone && setChallengeOpen(true)}
                disabled={!challengeUnlocked || challengeDone}
                className={`w-full text-left relative bg-black/80 border-2 p-3 transition ${
                  challengeDone
                    ? "border-green-400/70 cursor-default"
                    : challengeUnlocked
                    ? "border-pink-400/70 hover:bg-pink-400/10"
                    : "border-cyan-400/20 opacity-40 cursor-not-allowed"
                }`}
                style={{
                  boxShadow: challengeDone
                    ? "0 0 14px rgba(106,255,176,0.4)"
                    : challengeUnlocked
                    ? "0 0 14px rgba(255,58,138,0.4)"
                    : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl leading-none">⚙️</div>
                  <div className="flex-1">
                    <div
                      className="pixel-font text-[8px] tracking-[0.3em] mb-1"
                      style={{ color: challengeDone ? "#6affb0" : challengeUnlocked ? "#ff6aa8" : "#3ce8ff" }}
                    >
                      {challengeDone ? "✓ COMPLETE" : challengeUnlocked ? "▸ READY" : "▸ LOCKED"}
                    </div>
                    <div className="pixel-font text-[11px] text-cyan-100">
                      {investigation.challenge.label}
                    </div>
                    <div className="pixel-font text-[9px] text-cyan-300/60 mt-1">
                      {challengeDone
                        ? "Objective met."
                        : challengeUnlocked
                        ? "Match the transmitted pattern."
                        : "Gather more clues to unlock."}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Proceed */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onComplete}
              disabled={!canProceed}
              className="pixel-font text-[11px] tracking-widest px-5 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ boxShadow: canProceed ? "0 0 18px rgba(60,232,255,0.6)" : "none" }}
            >
              ▶ CONFRONT — MAKE YOUR CHOICE
            </button>
          </div>
        </div>

        {/* Clue log sidebar */}
        <aside className="bg-black/70 border-2 border-cyan-400/50 p-3 h-fit md:sticky md:top-24"
          style={{ boxShadow: "0 0 12px rgba(60,232,255,0.25)" }}>
          <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-2">
            ▸ CLUE LOG
          </div>
          {logged.size === 0 && (
            <div className="pixel-font text-[9px] text-cyan-300/50 leading-relaxed">
              Nothing logged yet. Inspect the scene to record evidence.
            </div>
          )}
          <ul className="space-y-2">
            {investigation.clues.map((c) => {
              const on = logged.has(c.id);
              const required = investigation.requiredClueIds.includes(c.id);
              if (!on) return null;
              return (
                <li key={c.id} className="border-l-2 pl-2" style={{ borderColor: required ? "#3ce8ff" : "#6affb0" }}>
                  <div className="pixel-font text-[10px] text-cyan-100">{c.label}</div>
                  <div className="pixel-font text-[9px] text-cyan-300/70 leading-relaxed">{c.detail}</div>
                </li>
              );
            })}
          </ul>
          {logged.size > 0 && logged.size < investigation.requiredClueIds.length && (
            <div className="pixel-font text-[8px] text-pink-300/70 tracking-widest mt-3">
              ▸ MORE EVIDENCE REQUIRED
            </div>
          )}
        </aside>
      </div>

      {/* Inspect modal */}
      <AnimatePresence>
        {inspecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setInspecting(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black border-2 border-cyan-400 p-5 max-w-md w-full"
              style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
            >
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{inspecting.glyph}</div>
                <div>
                  <div className="pixel-font text-[8px] tracking-[0.3em]" style={{ color: KIND_COLOR[inspecting.kind] }}>
                    ▸ {KIND_LABEL[inspecting.kind]}
                  </div>
                  <div className="pixel-font text-[11px] text-cyan-100">{inspecting.label}</div>
                </div>
              </div>
              <p className="pixel-font text-[11px] leading-[1.8] text-cyan-50" style={{ textShadow: "0 0 6px rgba(60,232,255,0.35)" }}>
                {inspecting.detail}
              </p>
              {inspecting.yieldsClueId && cluesById[inspecting.yieldsClueId] && (
                <div className="mt-3 border-t-2 border-cyan-400/30 pt-3">
                  <div className="pixel-font text-[9px] tracking-widest text-green-400 mb-1">
                    + CLUE LOGGED
                  </div>
                  <div className="pixel-font text-[10px] text-cyan-100">
                    {cluesById[inspecting.yieldsClueId].label}
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setInspecting(null)}
                  className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge modal */}
      <AnimatePresence>
        {challengeOpen && investigation.challenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4"
          >
            <SequenceChallenge
              size={investigation.challenge.size}
              label={investigation.challenge.label}
              onComplete={() => {
                setChallengeDone(true);
                setChallengeOpen(false);
              }}
              onCancel={() => setChallengeOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
