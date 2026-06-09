import { useCallback, useState } from "react";
import type { LocationId, Morality, Scenario, Screen, StageChoice, TimePeriod } from "./types";
import { SCENARIOS, scenarioFor } from "./scenarios";

const INITIAL_MORALITY: Morality = {
  empathy: 0, honesty: 0, responsibility: 0, courage: 0, selfishness: 0,
};

const TIME_ORDER: TimePeriod[] = ["morning", "afternoon", "evening"];

export interface ChoiceLog {
  scenarioId: string;
  scenarioTitle: string;
  choice: string;
  time: TimePeriod;
}

/** Pending NPC reaction shown after a player choice. */
interface PendingReply {
  text: string;
  nextStage: string | null; // null => scenario ends after Continue
}

export function useGameState() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [morality, setMorality] = useState<Morality>(INITIAL_MORALITY);
  const [time, setTime] = useState<TimePeriod>("morning");

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [stageId, setStageId] = useState<string | null>(null);
  const [pendingReply, setPendingReply] = useState<PendingReply | null>(null);

  const [choiceLog, setChoiceLog] = useState<ChoiceLog[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);

  const reset = useCallback(() => {
    setScreen("menu");
    setMorality(INITIAL_MORALITY);
    setTime("morning");
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setChoiceLog([]);
    setCompletedScenarios(new Set());
    setPaused(false);
  }, []);

  const startGame = useCallback(() => {
    setMorality(INITIAL_MORALITY);
    setTime("morning");
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setChoiceLog([]);
    setCompletedScenarios(new Set());
    setScreen("playing");
  }, []);

  const tryTriggerLocation = useCallback((loc: LocationId) => {
    if (activeScenario || pendingReply) return;
    const s = scenarioFor(loc, time);
    if (s && !completedScenarios.has(s.id)) {
      setActiveScenario(s);
      setStageId(s.startStage);
    }
  }, [activeScenario, pendingReply, time, completedScenarios]);

  const makeChoice = useCallback((choice: StageChoice) => {
    if (!activeScenario) return;

    // Apply morality effects
    if (choice.effects) {
      setMorality((m) => {
        const next = { ...m };
        (Object.keys(choice.effects!) as (keyof Morality)[]).forEach((k) => {
          next[k] = (next[k] ?? 0) + (choice.effects![k] ?? 0);
        });
        return next;
      });
    }

    // Log this choice
    setChoiceLog((log) => [...log, {
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      choice: choice.label,
      time,
    }]);

    // Either show NPC reply, jump directly to next stage, or end scenario
    if (choice.reply) {
      setPendingReply({ text: choice.reply, nextStage: choice.next ?? null });
    } else if (choice.next) {
      setStageId(choice.next);
    } else {
      finishScenario();
    }
  }, [activeScenario, time]); // eslint-disable-line react-hooks/exhaustive-deps

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

    if (!s) return;
    // Check time advancement
    const periodScenarios = SCENARIOS.filter((sc) => sc.time === time);
    const doneInPeriod = periodScenarios.every((sc) =>
      sc.id === s.id || completedScenarios.has(sc.id)
    );
    if (doneInPeriod) {
      const idx = TIME_ORDER.indexOf(time);
      if (idx < TIME_ORDER.length - 1) {
        setTimeout(() => setTime(TIME_ORDER[idx + 1]), 700);
      } else {
        setTimeout(() => setScreen("ending"), 900);
      }
    }
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

  const currentStage = activeScenario && stageId ? activeScenario.stages[stageId] ?? null : null;

  return {
    screen, setScreen,
    morality,
    time,
    activeScenario,
    currentStage,
    pendingReply,
    paused, setPaused,
    choiceLog,
    completedScenarios,
    tryTriggerLocation,
    makeChoice,
    advance,
    startGame,
    reset,
  };
}

export function computeEnding(m: Morality): { title: string; description: string } {
  const empathyScore = m.empathy + m.responsibility;
  const honestyScore = m.honesty + m.courage;
  const selfish = m.selfishness;

  if (selfish >= 5 && empathyScore < 3) {
    return { title: "Self-Centered Survivor", description: "You navigated the day on your own terms. The world bent to you — or you bent away from it. Power has its cost." };
  }
  if (empathyScore >= 8 && selfish <= 2) {
    return { title: "Compassionate Soul", description: "You met every stranger as someone worth your time. Kindness left a quiet trail behind you." };
  }
  if (honestyScore >= 8) {
    return { title: "Honest Citizen", description: "Truth cost you comfort more than once. You chose it anyway." };
  }
  if (m.courage < 0 && m.empathy < 2) {
    return { title: "Fearful Observer", description: "You saw much, said little. The day passed around you like weather." };
  }
  return { title: "Balanced Spirit", description: "You moved through the day with measured steps — some bold, some quiet, all human." };
}
