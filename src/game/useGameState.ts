import { useCallback, useEffect, useRef, useState } from "react";
import type { Choice, LocationId, Morality, Scenario, Screen, TimePeriod } from "./types";
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

export function useGameState() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [morality, setMorality] = useState<Morality>(INITIAL_MORALITY);
  const [time, setTime] = useState<TimePeriod>("morning");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [choiceLog, setChoiceLog] = useState<ChoiceLog[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const reset = useCallback(() => {
    setScreen("menu");
    setMorality(INITIAL_MORALITY);
    setTime("morning");
    setActiveScenario(null);
    setChoiceLog([]);
    setCompletedScenarios(new Set());
    setPaused(false);
    setLastResponse(null);
  }, []);

  const startGame = useCallback(() => {
    setMorality(INITIAL_MORALITY);
    setTime("morning");
    setActiveScenario(null);
    setChoiceLog([]);
    setCompletedScenarios(new Set());
    setLastResponse(null);
    setScreen("playing");
  }, []);

  const tryTriggerLocation = useCallback((loc: LocationId) => {
    if (activeScenario || lastResponse) return;
    const s = scenarioFor(loc, time);
    if (s && !completedScenarios.has(s.id)) {
      setActiveScenario(s);
    }
  }, [activeScenario, lastResponse, time, completedScenarios]);

  const makeChoice = useCallback((choice: Choice) => {
    if (!activeScenario) return;
    setMorality((m) => {
      const next = { ...m };
      (Object.keys(choice.effects) as (keyof Morality)[]).forEach((k) => {
        next[k] = (next[k] ?? 0) + (choice.effects[k] ?? 0);
      });
      return next;
    });
    setChoiceLog((log) => [...log, {
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      choice: choice.label,
      time,
    }]);
    setCompletedScenarios((c) => new Set(c).add(activeScenario.id));
    setLastResponse(choice.response);
  }, [activeScenario, time]);

  const dismissResponse = useCallback(() => {
    setLastResponse(null);
    setActiveScenario(null);

    // Advance time if all scenarios in this period done
    const periodScenarios = SCENARIOS.filter((s) => s.time === time);
    const doneInPeriod = periodScenarios.every((s) => completedScenarios.has(s.id) || s.id === activeScenario?.id);
    if (doneInPeriod) {
      const idx = TIME_ORDER.indexOf(time);
      if (idx < TIME_ORDER.length - 1) {
        setTimeout(() => setTime(TIME_ORDER[idx + 1]), 600);
      } else {
        setTimeout(() => setScreen("ending"), 800);
      }
    }
  }, [time, completedScenarios, activeScenario]);

  return {
    screen, setScreen,
    morality,
    time,
    activeScenario,
    lastResponse,
    paused, setPaused,
    choiceLog,
    completedScenarios,
    tryTriggerLocation,
    makeChoice,
    dismissResponse,
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
  if (empathyScore >= 6 && selfish <= 2) {
    return { title: "Compassionate Soul", description: "You met every stranger as someone worth your time. Kindness left a quiet trail behind you." };
  }
  if (honestyScore >= 6) {
    return { title: "Honest Citizen", description: "Truth cost you comfort more than once. You chose it anyway." };
  }
  if (m.courage < 0 && m.empathy < 2) {
    return { title: "Fearful Observer", description: "You saw much, said little. The day passed around you like weather." };
  }
  return { title: "Balanced Spirit", description: "You moved through the day with measured steps — some bold, some quiet, all human." };
}
