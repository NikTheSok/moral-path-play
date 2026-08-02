import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { BADGE_CATALOG, UPGRADES } from "@/game/progression";
import type { EncounterLog } from "@/game/useGameState";

interface SymbolEntry {
  glyph: string;
  color: string;
  name: string;
  meaning: string;
  when: string;
}

const NPC_SYMBOLS: SymbolEntry[] = [
  { glyph: "!", color: "#3ce8ff", name: "Exclamation", meaning: "Important interaction. Main story event available.", when: "Floats above an NPC at a key story moment." },
  { glyph: "?", color: "#ffb05a", name: "Question Mark", meaning: "Optional dialogue. NPC may share story context or hints.", when: "Appears on neutral or uncertain bystanders." },
  { glyph: "♥", color: "#6affb0", name: "Heart", meaning: "Positive opinion. Trust, friendliness, or admiration.", when: "Citizens show this when your reputation is high." },
  { glyph: "★", color: "#6affb0", name: "Star", meaning: "Fame. The city recognizes you as a public figure.", when: "Appears when you are widely admired after many scenarios." },
  { glyph: "!", color: "#ff5a5a", name: "Warning", meaning: "Negative opinion. Fear, suspicion or disapproval.", when: "Appears when citizens distrust the robot." },
  { glyph: "·", color: "#3ce8ff", name: "Dot", meaning: "Neutral. The citizen has no strong feelings.", when: "Default state for ambient pedestrians." },
];

const MORALITY_INFO = [
  { label: "Empathy", color: "#ff6aa8", desc: "Willingness to help and understand others." },
  { label: "Honesty", color: "#3ce8ff", desc: "Truthfulness and transparency in interactions." },
  { label: "Responsibility", color: "#6affb0", desc: "Accountability and reliability under pressure." },
  { label: "Courage", color: "#ffd84a", desc: "Willingness to act despite personal risk." },
  { label: "Selfishness", color: "#a26aff", desc: "Prioritization of self-interest over others." },
  { label: "Reputation", color: "#ffffff", desc: "Aggregate public opinion of the robot in the city." },
];

interface Props {
  open: boolean;
  onClose: () => void;
  badges?: string[];
  upgrades?: string[];
  encounters?: EncounterLog[];
}

export function InfoPanel({ open, onClose, badges = [], upgrades = [], encounters = [] }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-black/95 border-2 border-cyan-400 p-5"
        style={{ boxShadow: "0 0 40px rgba(60,232,255,0.5), inset 0 0 20px rgba(60,232,255,0.08)" }}
      >
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-cyan-300 hover:text-pink-400 transition pixel-font text-xs"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="pixel-font text-[11px] tracking-[0.3em] text-cyan-300 mb-1" style={{ textShadow: "0 0 6px rgba(60,232,255,0.6)" }}>
          ▸ FIELD MANUAL
        </div>
        <h2 className="pixel-font text-base text-pink-300 mb-4" style={{ textShadow: "0 0 8px rgba(255,58,138,0.5)" }}>
          UNIT 7 — INTERFACE GUIDE
        </h2>

        <section className="mb-6">
          <h3 className="pixel-font text-[10px] tracking-widest text-cyan-300 mb-3 border-b border-cyan-400/30 pb-1">
            NPC SYMBOLS
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {NPC_SYMBOLS.map((s, i) => (
              <div key={i} className="flex gap-3 bg-cyan-400/5 border border-cyan-400/20 p-2">
                <div
                  className="shrink-0 w-10 h-10 grid place-items-center border-2 pixel-font text-base"
                  style={{ borderColor: s.color, color: s.color, textShadow: `0 0 6px ${s.color}` }}
                >
                  {s.glyph}
                </div>
                <div className="min-w-0">
                  <div className="pixel-font text-[10px] mb-1" style={{ color: s.color }}>{s.name}</div>
                  <div className="text-[11px] text-cyan-100/90 leading-relaxed">{s.meaning}</div>
                  <div className="text-[10px] text-cyan-300/60 mt-1 italic">{s.when}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="pixel-font text-[10px] tracking-widest text-cyan-300 mb-3 border-b border-cyan-400/30 pb-1">
            BADGE GALLERY — {badges.length}/{BADGE_CATALOG.length} EARNED
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {BADGE_CATALOG.map((b) => {
              const earned = badges.includes(b.name);
              return (
                <div
                  key={b.name}
                  className="flex gap-3 border-2 p-2"
                  style={{
                    borderColor: earned ? "rgba(106,255,176,0.6)" : "rgba(60,232,255,0.15)",
                    background: earned ? "rgba(106,255,176,0.06)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    className="shrink-0 w-10 h-10 grid place-items-center text-xl"
                    style={{ filter: earned ? "drop-shadow(0 0 8px #6affb0)" : "grayscale(1) brightness(0.35)" }}
                  >
                    {earned ? b.icon : "❔"}
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[10px] mb-1" style={{ color: earned ? "#6affb0" : "#3ce8ff88" }}>
                      {earned ? b.name : "LOCKED"}
                    </div>
                    <div className="text-[11px] text-cyan-100/90 leading-relaxed">
                      {earned ? b.blurb : b.criteria}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-cyan-300/60 mt-2 italic">
            Flawless encounters so far: {encounters.filter((e) => e.quality === "perfect").length}. Badges only come from flawless work.
          </div>
        </section>

        <section className="mb-6">
          <h3 className="pixel-font text-[10px] tracking-widest text-cyan-300 mb-3 border-b border-cyan-400/30 pb-1">
            INSTALLED MODULES
          </h3>
          {upgrades.length === 0 ? (
            <div className="text-[11px] text-cyan-300/60">No modules yet — you pick one at the charging bay each night.</div>
          ) : (
            <div className="space-y-2">
              {UPGRADES.filter((u) => upgrades.includes(u.id)).map((u) => (
                <div key={u.id} className="flex gap-3 items-start">
                  <span className="text-base leading-none">{u.icon}</span>
                  <div className="min-w-0">
                    <span className="pixel-font text-[10px] text-pink-300">{u.name}:</span>
                    <span className="text-[11px] text-cyan-100/90 ml-2">{u.effect}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h3 className="pixel-font text-[10px] tracking-widest text-cyan-300 mb-3 border-b border-cyan-400/30 pb-1">
            MORALITY VALUES
          </h3>
          <div className="space-y-2">
            {MORALITY_INFO.map((m) => (
              <div key={m.label} className="flex gap-3 items-start">
                <div className="shrink-0 w-3 h-3 mt-1" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                <div className="min-w-0">
                  <span className="pixel-font text-[10px]" style={{ color: m.color }}>{m.label}:</span>
                  <span className="text-[11px] text-cyan-100/90 ml-2">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-2">
          <h3 className="pixel-font text-[10px] tracking-widest text-cyan-300 mb-3 border-b border-cyan-400/30 pb-1">
            CONTROLS
          </h3>
          <div className="text-[11px] text-cyan-100/90 space-y-1">
            <div><span className="pixel-font text-[10px] text-pink-300">A / ←</span> &nbsp; Walk left</div>
            <div><span className="pixel-font text-[10px] text-pink-300">D / →</span> &nbsp; Walk right</div>
            <div><span className="pixel-font text-[10px] text-pink-300">ESC</span> &nbsp; Pause menu</div>
            <div><span className="pixel-font text-[10px] text-pink-300">SPACE</span> &nbsp; Advance dialogue</div>
          </div>
        </section>

        <div className="text-[9px] text-cyan-300/50 pixel-font tracking-widest text-center mt-4">
          ESC TO CLOSE · GAME CONTINUES IN BACKGROUND
        </div>
      </motion.div>
    </div>
  );
}
