import { useEffect, useRef, useState } from "react";
import { GROUND_Y, LOCATIONS, WORLD_W } from "@/game/scenarios";
import type { LocationDef, LocationId, TimePeriod } from "@/game/types";

interface Props {
  time: TimePeriod;
  paused: boolean;
  onEnterLocation: (id: LocationId) => void;
  blockInput: boolean;
}

const SPEED = 220; // px/sec
const TRIGGER_RADIUS = 90;
const PLAYER_W = 14; // sprite pixel cells
const PLAYER_H = 20;
const PIXEL = 3; // each "pixel" of art = this many screen pixels

/* Sky palettes per time of day */
const SKY: Record<TimePeriod, [string, string]> = {
  morning:   ["#f8c98a", "#fde4b3"],
  afternoon: ["#8ec5ff", "#cfe7ff"],
  evening:   ["#2a1f55", "#7a3a72"],
};
const GROUND_COLOR: Record<TimePeriod, [string, string]> = {
  morning:   ["#5a8a3a", "#3a5e25"],
  afternoon: ["#5a8a3a", "#3a5e25"],
  evening:   ["#324028", "#1d2718"],
};

/* Player sprite — 14x20 grid (0 = transparent) */
type C = number;
const _ = 0, S = 1, H = 2, F = 3, B = 4, R = 5, P = 6; // skin, hair, face/eye, boots, body(red), red-dark, pants
const PLAYER_SPRITE: C[][] = [
  [_,_,_,_,H,H,H,H,H,H,_,_,_,_],
  [_,_,_,H,H,H,H,H,H,H,H,_,_,_],
  [_,_,H,H,H,H,H,H,H,H,H,H,_,_],
  [_,_,H,H,S,S,S,S,S,S,H,H,_,_],
  [_,_,_,S,F,S,S,S,S,F,S,_,_,_],
  [_,_,_,S,S,S,S,S,S,S,S,_,_,_],
  [_,_,_,S,S,F,F,F,F,S,S,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,_,_,_,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [B,B,R,B,B,B,B,B,B,B,B,R,B,B],
  [B,B,R,B,B,B,B,B,B,B,B,R,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,P,P,P,_,_,_,_,P,P,P,_,_],
  [_,_,P,P,P,_,_,_,_,P,P,P,_,_],
  [_,_,P,P,P,_,_,_,_,P,P,P,_,_],
  [_,_,P,P,P,_,_,_,_,P,P,P,_,_],
  [_,F,F,F,_,_,_,_,_,_,F,F,F,_],
  [_,F,F,F,F,_,_,_,_,F,F,F,F,_],
];
const PALETTE: Record<C, string> = {
  0: "transparent",
  1: "#f6c898", // skin
  2: "#3b2a1a", // hair
  3: "#2a1c10", // face/boot dark
  4: "#d24a3a", // body red
  5: "#8a2a22", // body shadow
  6: "#2b3a6e", // pants
};

const WALK_FRAMES = 2;

export function GameWorld({ time, paused, onEnterLocation, blockInput }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({ x: 280, vx: 0, facing: 1 as 1 | -1, walking: false });
  const keysRef = useRef<Set<string>>(new Set());
  const lastTriggeredRef = useRef<LocationId | null>(null);
  const [nearLocation, setNearLocation] = useState<string | null>(null);
  const onEnterRef = useRef(onEnterLocation);
  const pausedRef = useRef(paused);
  const blockRef = useRef(blockInput);
  const timeRef = useRef(time);
  useEffect(() => { onEnterRef.current = onEnterLocation; }, [onEnterLocation]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { blockRef.current = blockInput; }, [blockInput]);
  useEffect(() => { timeRef.current = time; }, [time]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["a", "d", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        keysRef.current.add(k);
      }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let animTime = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pre-place parallax clouds & background hills
    const clouds = Array.from({ length: 12 }, (_, i) => ({
      x: (i * 580) % (WORLD_W * 1.5),
      y: 60 + ((i * 53) % 80),
      w: 60 + ((i * 17) % 40),
    }));
    const hills = Array.from({ length: 30 }, (_, i) => ({
      x: i * 230,
      h: 80 + ((i * 47) % 90),
    }));
    // Trees scattered between locations (avoid overlapping building tiles)
    const trees = Array.from({ length: 50 }, (_, i) => {
      const x = (i * 167 + 120) % WORLD_W;
      return { x, s: 0.85 + ((i * 13) % 8) / 20 };
    });

    const drawPlayerSprite = (cx: number, cy: number, facing: 1 | -1, frame: number) => {
      ctx.save();
      // baseline cy is the feet position
      const w = PLAYER_W * PIXEL;
      const h = PLAYER_H * PIXEL;
      const ox = cx - w / 2;
      const oy = cy - h;
      if (facing === -1) {
        ctx.translate(ox + w, oy);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(ox, oy);
      }
      for (let row = 0; row < PLAYER_H; row++) {
        for (let col = 0; col < PLAYER_W; col++) {
          let c = PLAYER_SPRITE[row][col];
          // Simple walk anim: swap leg pixels on alternating frames
          if (frame === 1 && row >= 14 && row <= 18) {
            // shift legs slightly for walking
            const mirror = PLAYER_SPRITE[row][PLAYER_W - 1 - col];
            c = mirror;
          }
          if (c === 0) continue;
          ctx.fillStyle = PALETTE[c];
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }
      ctx.restore();
    };

    const drawBuilding = (loc: LocationDef, baseY: number) => {
      const x = loc.x;
      const t = timeRef.current;
      const windowLit = t === "evening";
      const palettes: Record<string, { wall: string; roof: string; accent: string }> = {
        house:  { wall: "#c98a5c", roof: "#7a3a2a", accent: "#3a2a1a" },
        cafe:   { wall: "#b97a4a", roof: "#4a2a1a", accent: "#f4d28a" },
        shop:   { wall: "#7aa2c4", roof: "#3a4a6a", accent: "#f0e0a0" },
        school: { wall: "#b04030", roof: "#5a1a14", accent: "#f0e0a0" },
        stop:   { wall: "#7a7a8a", roof: "#3a3a4a", accent: "#f0e0a0" },
        corner: { wall: "#5a5a6a", roof: "#2a2a3a", accent: "#f0a040" },
        park:   { wall: "#3a6a3a", roof: "#1a3a1a", accent: "#f0d050" },
      };
      const pal = palettes[loc.kind];

      // building footprint sits ON the ground line
      const bw = 160;
      const bh = loc.kind === "park" ? 70 : 130;
      const bx = x - bw / 2;
      const by = baseY - bh;

      if (loc.kind === "park") {
        // Big tree trunk + canopy + sign
        ctx.fillStyle = "#3a2510";
        ctx.fillRect(x - 12, by + 30, 24, 60);
        ctx.fillStyle = t === "evening" ? "#1f3520" : "#3a7a3a";
        ctx.beginPath();
        ctx.arc(x, by + 20, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = t === "evening" ? "#2a4a2a" : "#5aa05a";
        ctx.beginPath();
        ctx.arc(x - 20, by + 10, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 25, by + 15, 34, 0, Math.PI * 2);
        ctx.fill();
      } else if (loc.kind === "stop") {
        // bus stop pole + sign
        ctx.fillStyle = pal.wall;
        ctx.fillRect(x - 4, baseY - 100, 8, 100);
        ctx.fillStyle = pal.accent;
        ctx.fillRect(x - 30, baseY - 110, 60, 30);
        ctx.fillStyle = pal.accent;
        ctx.fillRect(x - 60, baseY - 30, 120, 6); // bench
        ctx.fillStyle = pal.roof;
        ctx.fillRect(x - 60, baseY - 30 + 6, 6, 24);
        ctx.fillRect(x + 54, baseY - 30 + 6, 6, 24);
      } else if (loc.kind === "corner") {
        // street corner — lamp + signpost
        ctx.fillStyle = pal.wall;
        ctx.fillRect(x - 3, baseY - 120, 6, 120);
        ctx.fillStyle = pal.accent;
        ctx.beginPath();
        ctx.arc(x, baseY - 120, 10, 0, Math.PI * 2);
        ctx.fill();
        if (t === "evening") {
          const g = ctx.createRadialGradient(x, baseY - 120, 4, x, baseY - 120, 80);
          g.addColorStop(0, "rgba(255,220,140,0.55)");
          g.addColorStop(1, "rgba(255,220,140,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - 80, baseY - 200, 160, 200);
        }
        // small building behind
        ctx.fillStyle = pal.wall;
        ctx.fillRect(bx + 30, by + 30, bw - 60, bh - 30);
        ctx.fillStyle = pal.roof;
        ctx.fillRect(bx + 20, by + 20, bw - 40, 14);
      } else {
        // generic building
        // roof
        ctx.fillStyle = pal.roof;
        ctx.fillRect(bx - 6, by - 14, bw + 12, 14);
        ctx.fillRect(bx, by, bw, bh);
        // wall
        ctx.fillStyle = pal.wall;
        ctx.fillRect(bx + 4, by + 4, bw - 8, bh - 4);
        // windows
        const wins = 3;
        const winW = 22, winH = 22;
        for (let i = 0; i < wins; i++) {
          const wx = bx + 20 + i * 42;
          const wy = by + 20;
          ctx.fillStyle = windowLit ? "#ffd970" : "#a8c8e8";
          ctx.fillRect(wx, wy, winW, winH);
          ctx.fillStyle = pal.accent;
          ctx.fillRect(wx, wy + winH / 2 - 1, winW, 2);
          ctx.fillRect(wx + winW / 2 - 1, wy, 2, winH);
        }
        // door
        ctx.fillStyle = pal.accent;
        ctx.fillRect(bx + bw / 2 - 14, by + bh - 44, 28, 44);
        ctx.fillStyle = pal.roof;
        ctx.fillRect(bx + bw / 2 + 6, by + bh - 24, 4, 4);
        // sign banner
        ctx.fillStyle = "#1a1208";
        ctx.fillRect(bx + 10, by + bh - 70, bw - 20, 16);
        ctx.fillStyle = pal.accent;
        ctx.font = "bold 11px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(loc.name.toUpperCase(), bx + bw / 2, by + bh - 62);
      }
    };

    const drawNPC = (loc: LocationDef, baseY: number) => {
      // Simple distinct NPC silhouette next to door
      const x = loc.x + 90;
      const y = baseY;
      const palettes: Record<string, [string, string, string]> = {
        cafe:   ["#f6c898", "#d24a3a", "#1a1a1a"],
        house:  ["#f6c898", "#4a7ab0", "#2a2a3a"],
        school: ["#e8b88a", "#5a4030", "#3a2a1a"],
        park:   ["#f6c898", "#7a5a3a", "#3a2a1a"],
        shop:   ["#f6c898", "#4a8a4a", "#2a3a2a"],
        stop:   ["#e8b88a", "#7a7a7a", "#3a3a3a"],
        corner: ["#f6c898", "#5a3a3a", "#2a1a1a"],
      };
      const [skin, body, hair] = palettes[loc.kind];
      const bob = Math.floor(Math.sin(animTime * 1.5 + x) * 1) * PIXEL;
      // body
      ctx.fillStyle = body;
      ctx.fillRect(x - 12, y - 30 + bob, 24, 22);
      // head
      ctx.fillStyle = skin;
      ctx.fillRect(x - 9, y - 48 + bob, 18, 18);
      // hair
      ctx.fillStyle = hair;
      ctx.fillRect(x - 9, y - 48 + bob, 18, 6);
      // legs
      ctx.fillStyle = "#2a2030";
      ctx.fillRect(x - 10, y - 8, 8, 8);
      ctx.fillRect(x + 2, y - 8, 8, 8);
      // floating "!" marker
      const pulse = (Math.sin(animTime * 4) + 1) * 0.5;
      ctx.fillStyle = `rgba(255,220,120,${0.6 + pulse * 0.4})`;
      ctx.fillRect(x - 2, y - 70 - 4, 4, 10);
      ctx.fillRect(x - 2, y - 70 + 8, 4, 4);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      animTime += dt;

      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      // Update
      if (!pausedRef.current && !blockRef.current) {
        let dx = 0;
        const k = keysRef.current;
        if (k.has("a") || k.has("arrowleft")) dx -= 1;
        if (k.has("d") || k.has("arrowright")) dx += 1;
        const p = playerRef.current;
        p.walking = dx !== 0;
        if (dx !== 0) p.facing = dx > 0 ? 1 : -1;
        p.x = Math.max(60, Math.min(WORLD_W - 60, p.x + dx * SPEED * dt));

        // Trigger nearby location
        let near: LocationId | null = null;
        for (const loc of LOCATIONS) {
          if (Math.abs(loc.x - p.x) < TRIGGER_RADIUS) { near = loc.id; break; }
        }
        const nearName = near ? LOCATIONS.find(l => l.id === near)!.name : null;
        setNearLocation((prev) => (prev === nearName ? prev : nearName));
        if (near && near !== lastTriggeredRef.current) {
          lastTriggeredRef.current = near;
          onEnterRef.current(near);
        } else if (!near) {
          lastTriggeredRef.current = null;
        }
      }

      const t = timeRef.current;
      const p = playerRef.current;

      // Camera follows horizontally only
      const camX = Math.max(0, Math.min(WORLD_W - W, p.x - W / 2));
      const baseY = Math.min(GROUND_Y, H - 120); // ground baseline in screen coords
      const groundScreenY = baseY;

      /* === Sky === */
      const sky = SKY[t];
      const g = ctx.createLinearGradient(0, 0, 0, groundScreenY);
      g.addColorStop(0, sky[0]);
      g.addColorStop(1, sky[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, groundScreenY);

      // Sun/Moon
      if (t === "evening") {
        ctx.fillStyle = "#fdf6c2";
        ctx.beginPath();
        ctx.arc(W - 100, 90, 26, 0, Math.PI * 2);
        ctx.fill();
        // stars
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        for (let i = 0; i < 30; i++) {
          const sx = (i * 91) % W;
          const sy = (i * 53) % (groundScreenY - 60);
          ctx.fillRect(sx, sy, 2, 2);
        }
      } else {
        ctx.fillStyle = t === "morning" ? "#fff2b0" : "#ffffff";
        ctx.beginPath();
        ctx.arc(W - 110, 80, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Clouds — parallax slow
      ctx.fillStyle = t === "evening" ? "rgba(60,40,80,0.6)" : "rgba(255,255,255,0.85)";
      for (const c of clouds) {
        const cx = (c.x - camX * 0.25) % (W + 200);
        const wrapped = cx < -200 ? cx + WORLD_W : cx;
        const cy = c.y;
        ctx.fillRect(wrapped, cy, c.w, 12);
        ctx.fillRect(wrapped + 8, cy - 8, c.w - 16, 12);
        ctx.fillRect(wrapped + 20, cy - 14, c.w - 40, 8);
      }

      // Distant hills — parallax mid
      ctx.fillStyle = t === "evening" ? "#1a2438" : "#6a8a5a";
      for (const hill of hills) {
        const hx = hill.x - camX * 0.5;
        if (hx < -200 || hx > W + 200) continue;
        ctx.beginPath();
        ctx.moveTo(hx, groundScreenY);
        ctx.lineTo(hx + 110, groundScreenY - hill.h);
        ctx.lineTo(hx + 220, groundScreenY);
        ctx.closePath();
        ctx.fill();
      }

      /* === Ground === */
      const gc = GROUND_COLOR[t];
      ctx.fillStyle = gc[0];
      ctx.fillRect(0, groundScreenY, W, H - groundScreenY);
      // ground darker stripe
      ctx.fillStyle = gc[1];
      ctx.fillRect(0, groundScreenY + 14, W, H - groundScreenY - 14);
      // pixel tile dashes on the path
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      const tileOff = Math.floor(camX) % 32;
      for (let i = -tileOff; i < W; i += 32) {
        ctx.fillRect(i, groundScreenY + 8, 16, 3);
      }

      /* === World layer (translate by -camX) === */
      ctx.save();
      ctx.translate(-camX, 0);

      // Trees (in world space)
      for (const tr of trees) {
        if (tr.x < camX - 80 || tr.x > camX + W + 80) continue;
        ctx.fillStyle = "#3a2510";
        ctx.fillRect(tr.x - 4, groundScreenY - 36, 8, 36);
        ctx.fillStyle = t === "evening" ? "#1f3520" : "#3a7a3a";
        ctx.beginPath();
        ctx.arc(tr.x, groundScreenY - 46, 22 * tr.s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = t === "evening" ? "#2a4a2a" : "#5aa05a";
        ctx.beginPath();
        ctx.arc(tr.x - 8, groundScreenY - 52, 16 * tr.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Locations / buildings
      for (const loc of LOCATIONS) {
        if (loc.x < camX - 200 || loc.x > camX + W + 200) continue;
        drawBuilding(loc, groundScreenY);
        drawNPC(loc, groundScreenY);
      }

      // Player (in world space, position on baseline)
      const frame = p.walking ? Math.floor(animTime * 8) % WALK_FRAMES : 0;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(p.x - 18, groundScreenY - 4, 36, 4);
      drawPlayerSprite(p.x, groundScreenY, p.facing, frame);

      ctx.restore();

      /* === Time-of-day tint overlay === */
      if (t === "evening") {
        ctx.fillStyle = "rgba(20,10,40,0.35)";
        ctx.fillRect(0, 0, W, H);
      } else if (t === "morning") {
        ctx.fillStyle = "rgba(255,180,100,0.08)";
        ctx.fillRect(0, 0, W, H);
      }

      // Scanline vibe (subtle)
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 select-none">
      <canvas ref={canvasRef} className="h-full w-full block pixelated" />
      {nearLocation && !blockInput && (
        <div className="pointer-events-none absolute left-1/2 bottom-24 -translate-x-1/2 px-3 py-1.5 text-[10px] tracking-widest pixel-font bg-black/80 text-yellow-200 border-2 border-yellow-300/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)]">
          ▼ {nearLocation.toUpperCase()}
        </div>
      )}
    </div>
  );
}
