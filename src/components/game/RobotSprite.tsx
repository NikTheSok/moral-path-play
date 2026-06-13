import { motion } from "framer-motion";

/**
 * Reusable pixel-art robot sprite (Unit 7). Renders as a CSS pixel grid so it
 * matches the in-game canvas sprite. Used in cutscenes, charging chamber,
 * endings, billboards — anywhere the robot needs to be visually recognized.
 */

// Same matrix as the canvas sprite in GameWorld.tsx (kept in sync visually)
// 0 transparent | 1 chrome | 2 dark metal | 3 cyan glow | 4 body blue | 5 trim | 6 yellow | 7 visor dark
const SPR: number[][] = [
  [0,0,0,0,2,2,2,2,2,2,0,0,0,0],
  [0,0,0,2,1,1,1,1,1,1,2,0,0,0],
  [0,0,2,1,1,1,1,1,1,1,1,2,0,0],
  [0,0,2,7,7,7,7,7,7,7,7,2,0,0],
  [0,0,2,7,3,7,7,7,7,3,7,2,0,0],
  [0,0,2,7,7,7,7,7,7,7,7,2,0,0],
  [0,0,2,1,1,1,1,1,1,1,1,2,0,0],
  [0,0,0,2,6,2,2,2,2,6,2,0,0,0],
  [0,4,4,4,4,4,4,4,4,4,4,4,4,0],
  [4,4,5,4,4,4,3,3,4,4,4,5,4,4],
  [4,4,5,4,4,4,3,3,4,4,4,5,4,4],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [0,4,4,4,4,4,4,4,4,4,4,4,4,0],
  [0,0,4,4,4,4,4,4,4,4,4,4,0,0],
  [0,0,2,2,1,0,0,0,0,1,2,2,0,0],
  [0,0,2,2,1,0,0,0,0,1,2,2,0,0],
  [0,0,2,2,1,0,0,0,0,1,2,2,0,0],
  [0,0,2,2,1,0,0,0,0,1,2,2,0,0],
  [0,2,2,2,0,0,0,0,0,0,2,2,2,0],
  [0,5,5,5,5,0,0,0,0,5,5,5,5,0],
];

const PAL: Record<number, string> = {
  0: "transparent",
  1: "#c8d8e8",
  2: "#2a2440",
  3: "#3ce8ff",
  4: "#3a4a8a",
  5: "#8a6aff",
  6: "#ffd84a",
  7: "#0a0420",
};

interface Props {
  /** Size of each pixel in CSS px. Default 6. */
  scale?: number;
  /** Apply a subtle hover/breathing motion. */
  animate?: boolean;
  /** Render at reduced brightness for hibernation/charging scenes. */
  hibernating?: boolean;
  /** Dim the eyes (waking up / shutting down). */
  eyeIntensity?: number; // 0..1
  className?: string;
}

export function RobotSprite({
  scale = 6,
  animate = true,
  hibernating = false,
  eyeIntensity = 1,
  className = "",
}: Props) {
  const W = SPR[0].length * scale;
  const H = SPR.length * scale;

  const body = (
    <div
      className="relative"
      style={{
        width: W,
        height: H,
        imageRendering: "pixelated",
        filter: hibernating ? "brightness(0.55) saturate(0.7)" : "none",
      }}
    >
      {SPR.map((row, ri) =>
        row.map((c, ci) => {
          if (c === 0) return null;
          const isEye = c === 3 && ri <= 6;
          const color = PAL[c];
          const eyeGlow = isEye
            ? `0 0 ${6 * eyeIntensity}px #3ce8ff, 0 0 ${12 * eyeIntensity}px #3ce8ff`
            : c === 3
            ? "0 0 4px #3ce8ff"
            : "none";
          return (
            <span
              key={`${ri}-${ci}`}
              className="absolute"
              style={{
                left: ci * scale,
                top: ri * scale,
                width: scale,
                height: scale,
                background: color,
                opacity: isEye ? 0.4 + 0.6 * eyeIntensity : 1,
                boxShadow: eyeGlow,
              }}
            />
          );
        })
      )}
      {/* aura */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: -scale * 4,
          top: -scale * 2,
          width: W + scale * 8,
          height: H + scale * 4,
          background:
            "radial-gradient(ellipse at center, rgba(60,232,255,0.25), transparent 70%)",
        }}
      />
    </div>
  );

  if (!animate) return <div className={className}>{body}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {body}
    </motion.div>
  );
}
