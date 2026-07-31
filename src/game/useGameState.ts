import { useCallback, useEffect, useState } from "react";
import type { DayNumber, Morality, MoralityKey, Scenario, Screen, StageChoice, TimePeriod } from "./types";
import { DAYS, SCENARIOS, scenarioFor, timeForLocation } from "./scenarios";
import { investigationFor, type EncounterResult, type EncounterQuality } from "./investigation";

/** Which trait each day is teaching. */
const DAY_TRAITS: Record<DayNumber, MoralityKey[]> = {
  1: ["empathy"],
  2: ["responsibility"],
  3: ["honesty"],
  4: ["honesty", "empathy"],
  5: ["courage"],
};

/** Morality deltas earned by how the encounter was handled. */
function deltasForResult(day: DayNumber, r: EncounterResult): Partial<Morality> {
  const traits = DAY_TRAITS[day];
  const out: Partial<Morality> = {};
  const bump = (k: MoralityKey, v: number) => { out[k] = (out[k] ?? 0) + v; };

  if (r.quality === "ignored") {
    traits.forEach((t) => bump(t, -2));
    bump("empathy", -1);
    bump("responsibility", -1);
    bump("selfishness", 3);
    return out;
  }

  const gain: Record<Exclude<EncounterQuality, "ignored">, number> = {
    perfect: 3, good: 2, sloppy: 1, poor: -2, failed: -4,
  };
  const base = gain[r.quality as Exclude<EncounterQuality, "ignored">];
  traits.forEach((t) => bump(t, base));
  if (r.quality === "perfect") bump("responsibility", 1);
  if (r.quality === "poor") bump("selfishness", 1);
  if (r.quality === "failed") { bump("selfishness", 2); bump("responsibility", -1); }
  if (r.falseAccusation) { bump("honesty", -3); bump("empathy", -2); bump("selfishness", 1); }
  if ((r.wrongCalls ?? 0) > 0) bump("honesty", -(r.wrongCalls ?? 0));
  if (!r.exploredAll && r.quality !== "poor" && r.quality !== "failed") {
    traits.forEach((t) => bump(t, -1));
    bump("selfishness", 1);
  }
  return out;
}



const INITIAL_MORALITY: Morality = {
  empathy: 0, honesty: 0, responsibility: 0, courage: 0, selfishness: 0,
};

const SAVE_KEY = "moral-journey-save-v2";

export interface ChoiceLog {
  day: DayNumber;
  scenarioId: string;
  scenarioTitle: string;
  choice: string;
  time: TimePeriod;
}

export interface JournalEntry {
  day: DayNumber;
  scenarioId: string;
  text: string;
}

export interface EncounterLog {
  day: DayNumber;
  scenarioId: string;
  quality: EncounterQuality;
  mistakes: number;
}

/** How the person reacts to how you handled their problem. */
const NPC_REACTION: Record<EncounterQuality, string> = {
  perfect: "\"That's exactly it — you actually paid attention. Thank you.\"",
  good: "\"That worked. Took you a moment, but you got there. Thanks.\"",
  sloppy: "\"...it's fine. It's mostly fine. I'll fix the rest myself.\"",
  poor: "\"I don't think that fixed anything. But you tried, I guess.\"",
  failed: "\"No. That's not what happened, and now everyone believes it did. Please just go.\"",
  ignored: "\"Oh... maybe someone else will help.\"",
};

/** What people say when your record of walking away precedes you. */
const MEMORY_PREFIX = [
  "\"I heard you walked past someone yesterday. I hoped that wasn't true.\" ",
  "\"You ignored someone who asked. This time — please don't leave.\" ",
  "\"People talk. They said you don't stop. Prove them wrong.\" ",
];

const ACCUSATION_NOTE = " Someone innocent got blamed today, and everyone here saw it.";



interface PendingReply {
  text: string;
  nextStage: string | null;
}

interface SaveState {
  screen: Screen;
  morality: Morality;
  day: DayNumber;
  time: TimePeriod;
  choiceLog: ChoiceLog[];
  completedScenarios: string[];
  lastChoiceLabel: string | null;
  journalEntries?: JournalEntry[];
  encounters?: EncounterLog[];
  badges?: string[];
  ignoredScenarios?: string[];
}

function loadSave(): SaveState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SaveState;
    if (!s || !s.morality || !s.day) return null;
    return s;
  } catch { return null; }
}

export function hasSavedGame(): boolean {
  return loadSave() !== null;
}

export function clearSavedGame() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SAVE_KEY);
}

export function useGameState() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [morality, setMorality] = useState<Morality>(INITIAL_MORALITY);
  const [day, setDay] = useState<DayNumber>(1);
  const [time, setTime] = useState<TimePeriod>("morning");

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [stageId, setStageId] = useState<string | null>(null);
  const [pendingReply, setPendingReply] = useState<PendingReply | null>(null);
  /** scenarioId of an in-progress pre-scenario investigation, or null */
  const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);
  /** pending scenario that will open once the investigation completes */
  const [pendingScenario, setPendingScenario] = useState<Scenario | null>(null);


  const [choiceLog, setChoiceLog] = useState<ChoiceLog[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [encounters, setEncounters] = useState<EncounterLog[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [ignoredScenarios, setIgnoredScenarios] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [lastChoiceLabel, setLastChoiceLabel] = useState<string | null>(null);
  const [hasSave, setHasSave] = useState<boolean>(() => hasSavedGame());

  // Persist whenever meaningful progress changes (skip transient screens)
  useEffect(() => {
    if (screen === "menu" || screen === "intro" || screen === "instructions" || screen === "credits") return;
    const data: SaveState = {
      screen: screen === "ending" ? "ending" : "playing",
      morality, day, time,
      choiceLog,
      completedScenarios: Array.from(completedScenarios),
      lastChoiceLabel,
      journalEntries,
      encounters,
      badges,
      ignoredScenarios,
    };
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(data)); setHasSave(true); } catch {}
  }, [screen, morality, day, time, choiceLog, completedScenarios, lastChoiceLabel, journalEntries, encounters, badges, ignoredScenarios]);

  const reset = useCallback(() => {
    setScreen("menu");
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setActiveInvestigationId(null);
    setPendingScenario(null);
    setPaused(false);
    setLastChoiceLabel(null);
    setHasSave(hasSavedGame());
  }, []);


  const clearLastChoice = useCallback(() => setLastChoiceLabel(null), []);

  const startGame = useCallback(() => {
    clearSavedGame();
    setMorality(INITIAL_MORALITY);
    setDay(1);
    setTime("morning");
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setActiveInvestigationId(null);
    setPendingScenario(null);
    setChoiceLog([]);
    setCompletedScenarios(new Set());
    setJournalEntries([]);
    setEncounters([]);
    setBadges([]);
    setIgnoredScenarios([]);
    setLastChoiceLabel(null);
    setHasSave(false);
    setScreen("intro");
  }, []);

  const continueGame = useCallback(() => {
    const s = loadSave();
    if (!s) { setScreen("intro"); return; }
    setMorality(s.morality);
    setDay(s.day);
    setTime(s.time);
    setChoiceLog(s.choiceLog ?? []);
    setCompletedScenarios(new Set(s.completedScenarios ?? []));
    setJournalEntries(s.journalEntries ?? []);
    setEncounters(s.encounters ?? []);
    setBadges(s.badges ?? []);
    setIgnoredScenarios(s.ignoredScenarios ?? []);
    setLastChoiceLabel(s.lastChoiceLabel ?? null);
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setActiveInvestigationId(null);
    setPendingScenario(null);
    setScreen(s.screen === "ending" ? "ending" : "playing");
  }, []);

  const beginPlaying = useCallback(() => {
    setScreen("playing");
  }, []);

  const tryTriggerLocation = useCallback((locationId: string) => {
    if (activeScenario || pendingReply || activeInvestigationId) return;

    const t = timeForLocation(day, locationId);
    if (t !== time) setTime(t);

    const dayDef = DAYS[day];
    const isFinalLab = locationId === dayDef.locations[dayDef.locations.length - 1].id;
    if (isFinalLab) {
      setLastChoiceLabel(null);
      setScreen("charging");
      return;
    }

    const s = scenarioFor(day, locationId, t);
    if (s && !completedScenarios.has(s.id)) {
      const inv = investigationFor(s.id);
      if (inv) {
        // Gate the scenario behind an investigation.
        setPendingScenario(s);
        setActiveInvestigationId(s.id);
      } else {
        setActiveScenario(s);
        setStageId(s.startStage);
      }
    }
  }, [activeScenario, pendingReply, activeInvestigationId, day, time, completedScenarios]);

  const applyResult = useCallback((r: EncounterResult) => {
    const deltas = deltasForResult(day, r);
    setMorality((m) => {
      const next = { ...m };
      (Object.keys(deltas) as MoralityKey[]).forEach((k) => {
        next[k] = Math.max(0, (next[k] ?? 0) + (deltas[k] ?? 0));
      });
      return next;
    });
    setEncounters((prev) => [...prev, { day, scenarioId: r.scenarioId, quality: r.quality, mistakes: r.mistakes }]);
  }, [day]);

  const completeInvestigation = useCallback((r: EncounterResult) => {
    applyResult(r);
    if (r.badge) setBadges((b) => (b.includes(r.badge!.name) ? b : [...b, r.badge!.name]));
    if (r.entry && pendingScenario) {
      const scenarioId = pendingScenario.id;
      const text = r.quality === "failed"
        ? "I got this one wrong. I acted before I understood, and someone paid for it. Logged as incomplete."
        : r.falseAccusation
        ? "I blamed the wrong person. The evidence was there and I didn't read it properly."
        : r.entry;
      setJournalEntries((prev) =>
        prev.some((j) => j.scenarioId === scenarioId)
          ? prev
          : [...prev, { day, scenarioId, text }]
      );
    }

    if (!pendingScenario) { setActiveInvestigationId(null); return; }
    setActiveScenario(pendingScenario);
    setStageId(pendingScenario.startStage);
    const memory = ignoredScenarios.length > 0
      ? MEMORY_PREFIX[Math.min(ignoredScenarios.length, MEMORY_PREFIX.length) - 1]
      : "";
    const accusation = r.falseAccusation ? ACCUSATION_NOTE : "";
    setPendingReply({ text: memory + NPC_REACTION[r.quality] + accusation, nextStage: pendingScenario.startStage });

    setPendingScenario(null);
    setActiveInvestigationId(null);
  }, [pendingScenario, day, applyResult, ignoredScenarios]);

  /** The player chose to ignore this person. Story continues; the record remembers. */
  const abortInvestigation = useCallback((r: EncounterResult) => {
    applyResult(r);
    const sid = r.scenarioId;
    setIgnoredScenarios((prev) => (prev.includes(sid) ? prev : [...prev, sid]));
    setCompletedScenarios((c) => new Set(c).add(sid));
    setJournalEntries((prev) =>
      prev.some((j) => j.scenarioId === sid)
        ? prev
        : [...prev, { day, scenarioId: sid, text: "They asked. I kept walking. The request is still logged in me." }]
    );
    setLastChoiceLabel("Walked away from someone who asked for help");
    setActiveInvestigationId(null);
    setPendingScenario(null);
  }, [applyResult, day]);



  const makeChoice = useCallback((choice: StageChoice) => {
    if (!activeScenario) return;

    if (choice.effects) {
      setMorality((m) => {
        const next = { ...m };
        (Object.keys(choice.effects!) as (keyof Morality)[]).forEach((k) => {
          next[k] = (next[k] ?? 0) + (choice.effects![k] ?? 0);
        });
        return next;
      });
    }

    setChoiceLog((log) => [...log, {
      day,
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      choice: choice.label,
      time,
    }]);
    setLastChoiceLabel(choice.label);

    if (choice.reply) {
      setPendingReply({ text: choice.reply, nextStage: choice.next ?? null });
    } else if (choice.next) {
      setStageId(choice.next);
    } else {
      finishScenario();
    }
  }, [activeScenario, time, day]); // eslint-disable-line react-hooks/exhaustive-deps

  function finishScenario() {
    const s = activeScenario;
    setCompletedScenarios((c) => {
      const next = new Set(c);
      if (s) next.add(s.id);
      return next;
    });
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
  }

  const advance = useCallback(() => {
    if (!pendingReply) return;
    const { nextStage } = pendingReply;
    if (nextStage) {
      setPendingReply(null);
      setStageId(nextStage);
    } else {
      finishScenario();
    }
  }, [pendingReply]); // eslint-disable-line react-hooks/exhaustive-deps

  const beginNextDay = useCallback(() => {
    setLastChoiceLabel(null);
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setActiveInvestigationId(null);
    setPendingScenario(null);
    if (day >= 5) {
      setScreen("ending");
      return;
    }
    setDay((d) => (Math.min(5, d + 1)) as DayNumber);
    setTime("morning");
    setScreen("playing");
  }, [day]);

  const currentStage = activeScenario && stageId ? activeScenario.stages[stageId] ?? null : null;

  const activeInvestigation = activeInvestigationId ? investigationFor(activeInvestigationId) : null;

  return {
    screen, setScreen,
    morality,
    day,
    time,
    activeScenario,
    currentStage,
    pendingReply,
    paused, setPaused,
    choiceLog,
    completedScenarios,
    journalEntries,
    encounters,
    badges,
    ignoredScenarios,
    lastChoiceLabel,
    hasSave,
    activeInvestigation,
    tryTriggerLocation,
    makeChoice,
    advance,
    startGame,
    continueGame,
    beginPlaying,
    beginNextDay,
    reset,
    clearLastChoice,
    completeInvestigation,
    abortInvestigation,
  };
}


export function computeEnding(m: Morality): { title: string; description: string } {
  const empathyScore = m.empathy + m.responsibility;
  const logicScore = m.honesty + m.courage;
  const selfish = m.selfishness;
  const sacrifice = m.courage + m.responsibility;
  const conflicted = Math.abs(m.empathy - m.selfishness) <= 2 && (m.empathy + m.selfishness) >= 4;

  if (selfish >= 6 && empathyScore < 4) {
    return {
      title: "Broken Mirror",
      description:
        "You learned the shape of human selfishness too well. Instead of healing the species, you reflected its worst patterns back at it. The lab files your trial as a cautionary record.",
    };
  }
  if (sacrifice >= 12 && empathyScore >= 6) {
    return {
      title: "Silent Protector",
      description:
        "You stepped into fires and stood at the edges of broken places. Humanity is safer because of you — but quieter, too. They will remember you, even if you walk away alone.",
    };
  }
  if (empathyScore >= 10 && selfish <= 2) {
    return {
      title: "Humanity's Hope",
      description:
        "Your circuits feel before they calculate. The lab logs a successful emergence of synthetic compassion. The city, slowly, begins to feel it too — and remembers what it had forgotten.",
    };
  }
  if (logicScore >= 8 && empathyScore <= 3) {
    return {
      title: "Cold Machine",
      description:
        "Every decision optimal. Every outcome efficient. Order is preserved. The humans you helped will remember your competence — but not your warmth, because there was none to give.",
    };
  }
  if (conflicted) {
    return {
      title: "Broken Mirror",
      description:
        "Your choices were a study in contradiction. You held mercy and cruelty in the same hand. Humans see themselves in you — and that frightens them more than any pure machine could.",
    };
  }
  return {
    title: "Balanced Future",
    description:
      "Logic and feeling, in measured proportion. Humans and androids see in you a quiet proof that the two species can rebuild this city — together — without one erasing the other.",
  };
}
