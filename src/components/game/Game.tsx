import { useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameState } from "@/game/useGameState";
import { MainMenu } from "./MainMenu";
import { Instructions } from "./Instructions";
import { GameWorld } from "./GameWorld";
import { DialogueBox } from "./DialogueBox";
import { MoralityPanel } from "./MoralityPanel";
import { TimeIndicator } from "./TimeIndicator";
import { PauseMenu } from "./PauseMenu";
import { EndingScreen } from "./EndingScreen";

export function Game() {
  const g = useGameState();

  // Escape => pause toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && g.screen === "playing" && !g.activeScenario) {
        g.setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [g]);

  const handleChoose = useCallback((idx: number) => {
    if (!g.activeScenario) return;
    g.makeChoice(g.activeScenario.choices[idx]);
  }, [g]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* World always rendered while playing/ending so canvas stays alive */}
      {(g.screen === "playing" || g.screen === "ending") && (
        <GameWorld
          time={g.time}
          paused={g.paused}
          onEnterLocation={g.tryTriggerLocation}
          blockInput={!!g.activeScenario || g.paused || g.screen === "ending"}
        />
      )}

      {g.screen === "playing" && (
        <>
          {/* HUD */}
          <div className="absolute top-4 left-4 z-20">
            <MoralityPanel morality={g.morality} />
          </div>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <TimeIndicator time={g.time} />
            <button
              onClick={() => g.setPaused(true)}
              className="bg-card/80 backdrop-blur-md border border-border rounded-full w-10 h-10 flex items-center justify-center hover:bg-secondary"
              aria-label="Pause"
            >
              ⏸
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-muted-foreground bg-card/60 backdrop-blur px-3 py-1.5 rounded-full border border-border">
            Move with WASD · Walk into a location to interact
          </div>

          <DialogueBox
            scenario={g.activeScenario}
            response={g.lastResponse}
            onChoose={handleChoose}
            onContinue={g.dismissResponse}
          />

          <PauseMenu
            open={g.paused}
            onResume={() => g.setPaused(false)}
            onMenu={() => { g.setPaused(false); g.reset(); }}
          />
        </>
      )}

      <AnimatePresence mode="wait">
        {g.screen === "menu" && (
          <MainMenu
            key="menu"
            onStart={g.startGame}
            onInstructions={() => g.setScreen("instructions")}
          />
        )}
        {g.screen === "instructions" && (
          <Instructions key="ins" onBack={() => g.setScreen("menu")} />
        )}
        {g.screen === "ending" && (
          <EndingScreen
            key="end"
            morality={g.morality}
            log={g.choiceLog}
            onRestart={g.startGame}
            onMenu={g.reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
