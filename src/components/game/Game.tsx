import { useEffect } from "react";
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && g.screen === "playing" && !g.activeScenario) {
        g.setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [g]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
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
          <div className="absolute top-4 left-4 z-20">
            <MoralityPanel morality={g.morality} />
          </div>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <TimeIndicator time={g.time} />
            <button
              onClick={() => g.setPaused(true)}
              className="pixel-font text-[10px] bg-yellow-300 text-black border-2 border-black px-3 py-2 shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
              aria-label="Pause"
            >
              II
            </button>
          </div>
          {!g.activeScenario && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pixel-font text-[10px] text-yellow-200 bg-black/70 border-2 border-yellow-200/60 px-3 py-1.5">
              ← A / D → · WALK TO MEET PEOPLE
            </div>
          )}

          <DialogueBox
            scenario={g.activeScenario}
            stage={g.currentStage}
            pendingReply={g.pendingReply}
            onChoose={g.makeChoice}
            onContinue={g.advance}
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
          <MainMenu key="menu" onStart={g.startGame} onInstructions={() => g.setScreen("instructions")} />
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
