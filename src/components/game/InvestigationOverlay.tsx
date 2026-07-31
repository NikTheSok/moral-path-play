import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Investigation, Interactable, EncounterResult, EncounterQuality } from "@/game/investigation";
import { gradeEncounter, QUALITY_LABEL, QUALITY_SCORE } from "@/game/investigation";
import { DeductionChallenge } from "./challenges/DeductionChallenge";

import { SequenceChallenge } from "./SequenceChallenge";
import { HiddenObjectChallenge } from "./HiddenObjectChallenge";
import { BatteryChallenge } from "./BatteryChallenge";
import { CircuitChallenge } from "./CircuitChallenge";
import { MultiPickChallenge } from "./challenges/MultiPickChallenge";
import { SortChallenge } from "./challenges/SortChallenge";
import { AssembleChallenge } from "./challenges/AssembleChallenge";
import { OrderChallenge } from "./challenges/OrderChallenge";
import { CelebrationChallenge } from "./challenges/CelebrationChallenge";
import { BadgeAward } from "./BadgeAward";

interface Props {
  investigation: Investigation;
  onComplete: (result: EncounterResult) => void;
  onAbort: (result: EncounterResult) => void;
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
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [inspecting, setInspecting] = useState<Interactable | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeDone, setChallengeDone] = useState(!investigation.challenge);
  const [mistakes, setMistakes] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [deductionOpen, setDeductionOpen] = useState(false);
  const [deduction, setDeduction] = useState<{ wrongCalls: number; falseAccusation: boolean; solved: boolean } | null>(
    investigation.deduction ? null : { wrongCalls: 0, falseAccusation: false, solved: true }
  );

  useEffect(() => {
    setLogged(new Set());
    setVisited(new Set());
    setInspecting(null);
    setChallengeOpen(false);
    setChallengeDone(!investigation.challenge);
    setMistakes(0);
    setShowBadge(false);
    setConfirmLeave(false);
    setDeductionOpen(false);
    setDeduction(investigation.deduction ? null : { wrongCalls: 0, falseAccusation: false, solved: true });
  }, [investigation.scenarioId, investigation.challenge, investigation.deduction]);

  const cluesById = useMemo(() => {
    const m: Record<string, { label: string; detail: string }> = {};
    for (const c of investigation.clues) m[c.id] = c;
    return m;
  }, [investigation.clues]);

  const requiredMet = investigation.requiredClueIds.every((c) => logged.has(c));
  const challengeUnlocked =
    !!investigation.challenge &&
    (investigation.challenge.unlockClues ?? []).every((c) => logged.has(c));
  const deductionReady = requiredMet && challengeDone;
  const canProceed = deductionReady && deduction !== null;

  /** Did the player look at every available lead, including optional ones? */
  const exploredAll = investigation.interactables.every(
    (it) => visited.has(it.id) || (it.requiresClueId && !logged.has(it.requiresClueId))
  );
  const skippedLeads = investigation.interactables.filter(
    (it) => !visited.has(it.id) && !(it.requiresClueId && !logged.has(it.requiresClueId))
  ).length;

  const projected: EncounterQuality = gradeEncounter({
    mistakes,
    exploredAll,
    wrongCalls: deduction?.wrongCalls ?? 0,
    falseAccusation: deduction?.falseAccusation ?? false,
    unresolved: deduction ? !deduction.solved : false,
  });

  const inspect = (it: Interactable) => {
    if (it.requiresClueId && !logged.has(it.requiresClueId)) return;
    setInspecting(it);
    setVisited((v) => new Set(v).add(it.id));
    if (it.yieldsClueId) {
      setLogged((prev) => {
        if (prev.has(it.yieldsClueId!)) return prev;
        const next = new Set(prev);
        next.add(it.yieldsClueId!);
        return next;
      });
    }
  };

  const handleChallengeComplete = (m: number) => {
    setMistakes((prev) => prev + m);
    setChallengeDone(true);
    setChallengeOpen(false);
  };

  const finish = () => {
    const quality = projected;
    if (investigation.badge && quality === "perfect") {
      setShowBadge(true);
    }
    const emit = () =>
      onComplete({
        scenarioId: investigation.scenarioId,
        quality,
        mistakes,
        exploredAll,
        wrongCalls: deduction?.wrongCalls ?? 0,
        falseAccusation: deduction?.falseAccusation ?? false,
        entry: investigation.journalEntry,
        badge: quality === "perfect" ? investigation.badge : undefined,
      });
    if (investigation.badge && quality === "perfect") window.setTimeout(emit, 2200);
    else emit();
  };

  const walkAway = () => {
    onAbort({
      scenarioId: investigation.scenarioId,
      quality: "ignored",
      mistakes,
      exploredAll: false,
      wrongCalls: deduction?.wrongCalls ?? 0,
    });
  };

  const ch = investigation.challenge;




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
      <div className="sticky top-0 z-10 bg-black/90 border-b-2 border-cyan-400/70 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="pixel-font text-[9px] tracking-[0.35em] text-pink-400 mb-1">
            ▸ LEARNING CHALLENGE
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
          onClick={() => setConfirmLeave(true)}
          title="Ignore this person and walk away"
          className="pixel-font w-9 h-9 grid place-items-center bg-black text-pink-300 border-2 border-pink-400/70 hover:bg-pink-400/15 hover:text-pink-200"
        >
          <X size={16} />
        </button>

      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 grid gap-6 md:grid-cols-[1fr_260px]">
        <div>
          <div className="pixel-font text-[9px] tracking-[0.3em] text-cyan-300/80 mb-3">
            ▸ OBSERVE — TALK TO PEOPLE, LOOK AROUND
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
                        {gated ? "Do the other steps first." : it.hint}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {ch && (
            <div className="mt-6">
              <div className="pixel-font text-[9px] tracking-[0.3em] text-cyan-300/80 mb-3">
                ▸ LEARNING CHALLENGE
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
                  <div className="text-2xl leading-none">🎯</div>
                  <div className="flex-1">
                    <div
                      className="pixel-font text-[8px] tracking-[0.3em] mb-1"
                      style={{ color: challengeDone ? "#6affb0" : challengeUnlocked ? "#ff6aa8" : "#3ce8ff" }}
                    >
                      {challengeDone ? "✓ COMPLETE" : challengeUnlocked ? "▸ READY" : "▸ LOCKED"}
                    </div>
                    <div className="pixel-font text-[11px] text-cyan-100">{ch.label}</div>
                    <div className="pixel-font text-[9px] text-cyan-300/60 mt-1">
                      {challengeDone ? "Nice work." : challengeUnlocked ? "Tap to begin." : "Observe more to unlock."}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
            <button
              onClick={() => setConfirmLeave(true)}
              className="pixel-font text-[10px] tracking-widest px-4 py-2.5 border-2 border-pink-400/60 text-pink-300 hover:bg-pink-400/10"
            >
              ✕ IGNORE & WALK AWAY
            </button>
            <button
              onClick={finish}
              disabled={!canProceed}
              className="pixel-font text-[11px] tracking-widest px-5 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ boxShadow: canProceed ? "0 0 18px rgba(60,232,255,0.6)" : "none" }}
            >
              ▶ TALK IT OVER
            </button>
          </div>
          {!canProceed && (
            <div className="pixel-font text-[9px] text-cyan-300/50 mt-2 text-right leading-relaxed">
              You can't help someone you haven't listened to.
            </div>
          )}
          {canProceed && skippedLeads > 0 && (
            <div className="pixel-font text-[9px] text-pink-300/70 mt-2 text-right leading-relaxed">
              {skippedLeads} lead{skippedLeads > 1 ? "s" : ""} still unchecked. You can leave it — it will be noted.
            </div>
          )}
        </div>


        <aside className="bg-black/70 border-2 border-cyan-400/50 p-3 h-fit md:sticky md:top-24"
          style={{ boxShadow: "0 0 12px rgba(60,232,255,0.25)" }}>
          <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-2">
            ▸ WHAT YOU LEARNED
          </div>
          {logged.size === 0 && (
            <div className="pixel-font text-[9px] text-cyan-300/50 leading-relaxed">
              Nothing yet. Talk to people and look around.
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
              ▸ KEEP LOOKING
            </div>
          )}
        </aside>
      </div>

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
                  <div className="pixel-font text-[9px] tracking-widest text-green-400 mb-1">+ LEARNED</div>
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

      <AnimatePresence>
        {challengeOpen && ch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4"
          >
            {ch.kind === "sequence" && (
              <SequenceChallenge
                size={ch.size ?? 4}
                label={ch.label}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "hidden-object" && ch.objects && ch.correctObjectId && (
              <HiddenObjectChallenge
                label={ch.label} intro={ch.intro}
                objects={ch.objects} correctId={ch.correctObjectId}
                successLine={ch.successLine}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "battery" && ch.batteries && ch.correctBatteryId && (
              <BatteryChallenge
                label={ch.label} intro={ch.intro}
                batteries={ch.batteries} correctId={ch.correctBatteryId}
                successLine={ch.batterySuccessLine}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "circuit" && ch.nodes && (
              <CircuitChallenge
                label={ch.label} intro={ch.intro} nodes={ch.nodes}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "multi-pick" && ch.pickItems && ch.pickTargetIds && (
              <MultiPickChallenge
                label={ch.label} intro={ch.intro}
                items={ch.pickItems} targetIds={ch.pickTargetIds}
                successLine={ch.successLine}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "sort" && ch.sortBins && ch.sortItems && (
              <SortChallenge
                label={ch.label} intro={ch.intro}
                bins={ch.sortBins} items={ch.sortItems}
                successLine={ch.successLine}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "assemble" && ch.parts && ch.slots && (
              <AssembleChallenge
                label={ch.label} intro={ch.intro}
                parts={ch.parts} slots={ch.slots}
                backdrop={ch.assembleBackdrop}
                successLine={ch.successLine}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "order" && ch.orderItems && (
              <OrderChallenge
                label={ch.label} intro={ch.intro}
                prompt={ch.orderPrompt} items={ch.orderItems}
                successLine={ch.successLine}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
            {ch.kind === "celebration" && ch.celebrationMoments && ch.celebrationFinal && (
              <CelebrationChallenge
                label={ch.label} intro={ch.intro}
                moments={ch.celebrationMoments}
                finalLine={ch.celebrationFinal}
                onComplete={handleChallengeComplete}
                onCancel={() => setChallengeOpen(false)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/85 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black border-2 border-pink-400 p-5 max-w-md w-full"
              style={{ boxShadow: "0 0 32px rgba(255,58,138,0.5)" }}
            >
              <div className="pixel-font text-[9px] tracking-[0.3em] text-pink-400 mb-2">▸ WALK AWAY?</div>
              <p className="pixel-font text-[10px] leading-[1.9] text-cyan-100">
                They asked you for help. If you leave now, they'll manage on their own — or they won't.
                Nobody will stop you. It will stay in your record.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="pixel-font text-[10px] tracking-widest px-4 py-2 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
                >
                  STAY AND HELP
                </button>
                <button
                  onClick={walkAway}
                  className="pixel-font text-[10px] tracking-widest px-4 py-2 border-2 border-pink-400/70 text-pink-300 hover:bg-pink-400/10"
                >
                  WALK AWAY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showBadge && investigation.badge && (
          <BadgeAward badge={investigation.badge} onDone={() => setShowBadge(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
