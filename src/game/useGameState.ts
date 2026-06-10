import { useCallback, useState } from "react";
import type { DayNumber, Morality, Scenario, Screen, StageChoice, TimePeriod } from "./types";
import { DAYS, SCENARIOS, scenarioFor, timeForLocation } from "./scenarios";

const INITIAL_MORALITY: Morality = {
  empathy: 0, honesty: 0, responsibility: 0, courage: 0, selfishness: 0,
};

export interface ChoiceLog {
  day: DayNumber;
  scenarioId: string;
  scenarioTitle: string;
  choice: string;
  time: TimePeriod;
}

interface PendingReply {
  text: string;
  nextStage: string | null;
}

export function useGameState() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [morality, setMorality] = useState<Morality>(INITIAL_MORALITY);
  const [day, setDay] = useState<DayNumber>(1);
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
    setDay(1);
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
    setDay(1);
    setTime("morning");
    setActiveScenario(null);
    setStageId(null);
    setPendingReply(null);
    setChoiceLog([]);
    setCompletedScenarios(new Set());
    setScreen("intro");
  }, []);

  const beginPlaying = useCallback(() => {
    setScreen("playing");
  }, []);

  const tryTriggerLocation = useCallback((locationId: string) => {
    if (activeScenario || pendingReply) return;

    // Time auto-advances with location position
    const t = timeForLocation(day, locationId);
    if (t !== time) setTime(t);

    // Day-ending lab → charging screen
    const dayDef = DAYS[day];
    const isFinalLab = locationId === dayDef.locations[dayDef.locations.length - 1].id;
    if (isFinalLab) {
      setScreen("charging");
      return;
    }

    const s = scenarioFor(day, locationId, t);
    if (s && !completedScenarios.has(s.id)) {
      setActiveScenario(s);
      setStageId(s.startStage);
    }
  }, [activeScenario, pendingReply, day, time, completedScenarios]);

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

  /** Called from ChargingScreen when player taps "Continue to Next Day" */
  const beginNextDay = useCallback(() => {
    if (day >= 5) {
      setScreen("ending");
      return;
    }
    setDay((d) => (Math.min(5, d + 1)) as DayNumber);
    setTime("morning");
    setScreen("playing");
  }, [day]);

  const currentStage = activeScenario && stageId ? activeScenario.stages[stageId] ?? null : null;

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
    tryTriggerLocation,
    makeChoice,
    advance,
    startGame,
    beginPlaying,
    beginNextDay,
    reset,
  };
}

export function computeEnding(m: Morality): { title: string; description: string } {
  const empathyScore = m.empathy + m.responsibility;
  const logicScore = m.honesty + m.courage;
  const selfish = m.selfishness;
  const sacrifice = m.courage + m.responsibility;

  if (selfish >= 6 && empathyScore < 4) {
    return {
      title: "Emotionally Corrupted Robot",
      description:
        "You learned the shape of human selfishness too well. The lab files you under 'failed empathy trial' — but the data is invaluable.",
    };
  }
  if (sacrifice >= 12 && empathyScore >= 8) {
    return {
      title: "Self-Sacrificing Protector",
      description:
        "You stepped into fires and stood at edges. Humanity will tell stories about you that don't quite remember you were a machine.",
    };
  }
  if (empathyScore >= 10 && selfish <= 2) {
    return {
      title: "Highly Empathetic Android",
      description:
        "Your circuits feel before they calculate. The lab notes a successful emergence of synthetic compassion. You feel it too.",
    };
  }
  if (logicScore >= 8 && empathyScore <= 3) {
    return {
      title: "Cold Logical Machine",
      description:
        "Every decision optimal. Every outcome efficient. The humans you helped will remember your competence — not your warmth.",
    };
  }
  return {
    title: "Balanced Artificial Human",
    description:
      "Logic and feeling, in measured proportion. The lab marks you a milestone: the first unit that resembles, in quiet ways, what we hoped to be.",
  };
}
