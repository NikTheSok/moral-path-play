import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameState } from "@/game/useGameState";
import { MainMenu } from "./MainMenu";
import { Instructions } from "./Instructions";
import { Credits } from "./Credits";
import { IntroCutscene } from "./IntroCutscene";
import { ChargingScreen } from "./ChargingScreen";
import { GameWorld } from "./GameWorld";
import { DialogueBox } from "./DialogueBox";
import { MoralityPanel } from "./MoralityPanel";
import { TimeIndicator } from "./TimeIndicator";
import { PauseMenu } from "./PauseMenu";
import { EndingScreen } from "./EndingScreen";
import { AICompanion } from "./AICompanion";
import { DAYS } from "@/game/scenarios";


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

  const inWorld = g.screen === "playing" || g.screen === "charging";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {inWorld && (
        <GameWorld
          day={g.day}
          time={g.time}
          paused={g.paused}
          onEnterLocation={g.tryTriggerLocation}
          blockInput={!!g.activeScenario || g.paused || g.screen !== "playing"}
          cinematic={!!g.activeScenario}
        />
      )}

      {g.screen === "playing" && (
        <>
          <div className="absolute top-4 left-4 z-20">
            <MoralityPanel morality={g.morality} />
          </div>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <div className="pixel-font text-[10px] tracking-widest bg-black/70 border-2 border-cyan-400/70 px-3 py-2 text-cyan-300" style={{ boxShadow: "0 0 16px rgba(60,232,255,0.4)" }}>
              DAY {g.day} · {DAYS[g.day].title.toUpperCase()}
            </div>
            <TimeIndicator time={g.time} />
            <button
              onClick={() => g.setPaused(true)}
              className="pixel-font text-[10px] bg-cyan-400 text-black border-2 border-black px-3 py-2 shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
            >
              II
            </button>
          </div>

          {!g.activeScenario && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pixel-font text-[10px] text-cyan-300 bg-black/80 border-2 border-cyan-400/60 px-3 py-1.5" style={{ boxShadow: "0 0 12px rgba(60,232,255,0.3)" }}>
              ◄ A / D ► · WALK FORWARD TO MEET HUMANS
            </div>
          )}

          <DialogueBox
            scenario={g.activeScenario}
            stage={g.currentStage}
            pendingReply={g.pendingReply}
            onChoose={g.makeChoice}
            onContinue={g.advance}
          />

          <AICompanion lastChoice={g.lastChoiceLabel} morality={g.morality} hidden={!!g.activeScenario || g.paused} />


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
            onContinue={g.continueGame}
            onInstructions={() => g.setScreen("instructions")}
            onCredits={() => g.setScreen("credits")}
            hasSave={g.hasSave}
          />
        )}
        {g.screen === "instructions" && (
          <Instructions key="ins" onBack={() => g.setScreen("menu")} />
        )}
        {g.screen === "credits" && (
          <Credits key="credits" onBack={() => g.setScreen("menu")} />
        )}

        {g.screen === "intro" && (
          <IntroCutscene key="intro" onComplete={g.beginPlaying} />
        )}
        {g.screen === "charging" && (
          <ChargingScreen
            key={`charge-${g.day}`}
            day={g.day}
            morality={g.morality}
            isFinal={g.day >= 5}
            onContinue={g.beginNextDay}
            onMenu={g.reset}
          />
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
