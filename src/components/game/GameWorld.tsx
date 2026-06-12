import { useEffect, useRef, useState } from "react";
import { DAYS, GROUND_Y, timeForLocation } from "@/game/scenarios";
import type { DayNumber, LocationDef, LocationKind, TimePeriod } from "@/game/types";

interface Props {
  day: DayNumber;
  time: TimePeriod;
  paused: boolean;
  onEnterLocation: (locationId: string) => void;
  blockInput: boolean;
  /** When true, world is dimmed/desaturated for cinematic dialogue */
  cinematic: boolean;
}

const SPEED = 230;
const TRIGGER_RADIUS = 95;
const PLAYER_W = 14;
const PLAYER_H = 20;
const PIXEL = 3;

/* === Cyberpunk sky palettes === */
const SKY: Record<TimePeriod, [string, string]> = {
  morning:   ["#2a2554", "#d97a8f"], // smoggy dawn
  afternoon: ["#3a4a7a", "#8aa8d8"], // hazy day
  evening:   ["#1a0e3a", "#7a2a6a"], // neon dusk
  night:     ["#06061a", "#1a0a3a"], // deep cyber night
};
const GROUND_COLOR: Record<TimePeriod, [string, string]> = {
  morning:   ["#22203a", "#15132a"],
  afternoon: ["#2a2848", "#181630"],
  evening:   ["#150b2a", "#0a0518"],
  night:     ["#08081a", "#03030a"],
};

/* === Robot player sprite (14x20) === */
type C = number;
const _ = 0, S = 1, M = 2, E = 3, B = 4, T = 5, A = 6, V = 7;
// S = chrome plate, M = dark metal, E = glowing eye/cyan, B = body blue, T = trim, A = accent yellow, V = visor dark
const ROBOT_SPRITE: C[][] = [
  [_,_,_,_,M,M,M,M,M,M,_,_,_,_],
  [_,_,_,M,S,S,S,S,S,S,M,_,_,_],
  [_,_,M,S,S,S,S,S,S,S,S,M,_,_],
  [_,_,M,V,V,V,V,V,V,V,V,M,_,_],
  [_,_,M,V,E,V,V,V,V,E,V,M,_,_],
  [_,_,M,V,V,V,V,V,V,V,V,M,_,_],
  [_,_,M,S,S,S,S,S,S,S,S,M,_,_],
  [_,_,_,M,A,M,M,M,M,A,M,_,_,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [B,B,T,B,B,B,E,E,B,B,B,T,B,B],
  [B,B,T,B,B,B,E,E,B,B,B,T,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,M,M,S,_,_,_,_,S,M,M,_,_],
  [_,_,M,M,S,_,_,_,_,S,M,M,_,_],
  [_,_,M,M,S,_,_,_,_,S,M,M,_,_],
  [_,_,M,M,S,_,_,_,_,S,M,M,_,_],
  [_,M,M,M,_,_,_,_,_,_,M,M,M,_],
  [_,T,T,T,T,_,_,_,_,T,T,T,T,_],
];
const PALETTE: Record<C, string> = {
  0: "transparent",
  1: "#c8d8e8",   // chrome
  2: "#2a2440",   // dark metal
  3: "#3ce8ff",   // cyan glow
  4: "#3a4a8a",   // body blue
  5: "#8a6aff",   // purple trim
  6: "#ffd84a",   // yellow accent
  7: "#0a0420",   // visor dark
};

const WALK_FRAMES = 2;

export function GameWorld({ day, time, paused, onEnterLocation, blockInput, cinematic }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({ x: 360, vx: 0, facing: 1 as 1 | -1, walking: false, bob: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const lastTriggeredRef = useRef<string | null>(null);
  const cinematicRef = useRef(cinematic);
  const dayRef = useRef(day);
  const maxSegRef = useRef(0);
  const [nearLocation, setNearLocation] = useState<string | null>(null);
  const onEnterRef = useRef(onEnterLocation);
  const pausedRef = useRef(paused);
  const blockRef = useRef(blockInput);
  const timeRef = useRef(time);

  useEffect(() => { onEnterRef.current = onEnterLocation; }, [onEnterLocation]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { blockRef.current = blockInput; }, [blockInput]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { cinematicRef.current = cinematic; }, [cinematic]);

  // Reset player position when day changes
  useEffect(() => {
    dayRef.current = day;
    playerRef.current.x = 360;
    playerRef.current.facing = 1;
    lastTriggeredRef.current = null;
    maxSegRef.current = 0;
    setNearLocation(null);
  }, [day]);

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
    let camTarget = 0;
    let camX = 0;
    // smooth color state (lerped each frame toward target time palette)
    const curSky: [number, number, number, number, number, number] = [42, 37, 84, 217, 122, 143]; // morning
    const curGround: [number, number, number, number, number, number] = [34, 32, 58, 21, 19, 42];
    let curTintR = 200, curTintG = 100, curTintB = 160, curTintA = 0.08;


    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pre-generate parallax data per current world width
    const makeWorldData = () => {
      const W = DAYS[dayRef.current].worldW;
      return {
        // Distant towers — far parallax
        towers: Array.from({ length: 40 }, (_, i) => ({
          x: (i * 220 + (i * 37) % 100) % W,
          h: 120 + ((i * 53) % 180),
          w: 50 + ((i * 19) % 50),
          color: (i % 3) as 0 | 1 | 2,
        })),
        // Mid-ground neon ad billboards
        billboards: Array.from({ length: 18 }, (_, i) => ({
          x: (i * 380 + 200) % W,
          y: 100 + ((i * 71) % 100),
          w: 70 + ((i * 13) % 40),
          color: (i % 4) as 0 | 1 | 2 | 3,
        })),
        // Holographic floating signs
        holos: Array.from({ length: 22 }, (_, i) => ({
          x: (i * 290 + 150) % W,
          y: 180 + ((i * 41) % 80),
          phase: (i * 0.7) % (Math.PI * 2),
        })),
        // Rain drops
        rain: Array.from({ length: 90 }, (_, i) => ({
          x: (i * 71) % 1600,
          y: (i * 53) % 800,
          s: 0.5 + ((i * 7) % 10) / 10,
        })),
        // Ground neon strip flicker
        strips: Array.from({ length: 30 }, (_, i) => ({
          x: i * 200,
          phase: (i * 0.9) % (Math.PI * 2),
        })),
        // Flying vehicles in the distance
        vehicles: Array.from({ length: 6 }, (_, i) => ({
          y: 60 + ((i * 53) % 140),
          speed: 40 + ((i * 17) % 50),
          phase: ((i * 1.3) % 6) * W / 3,
          dir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
          colorIdx: i % 4,
        })),
        // Steam vents
        vents: Array.from({ length: 12 }, (_, i) => ({
          x: (i * 470 + 240) % W,
          phase: (i * 0.6) % (Math.PI * 2),
        })),
      };
    };
    let world = makeWorldData();
    let lastDay = dayRef.current;

    const TOWER_COLORS = ["#0a0a1a", "#10102a", "#080814"];
    const NEON_COLORS = ["#ff3a8a", "#3ce8ff", "#a26aff", "#ffd84a"];

    const drawRobotSprite = (cx: number, cy: number, facing: 1 | -1, frame: number, bob: number) => {
      ctx.save();
      const w = PLAYER_W * PIXEL;
      const h = PLAYER_H * PIXEL;
      const ox = cx - w / 2;
      const oy = cy - h + bob;
      if (facing === -1) {
        ctx.translate(ox + w, oy);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(ox, oy);
      }
      for (let row = 0; row < PLAYER_H; row++) {
        for (let col = 0; col < PLAYER_W; col++) {
          let c = ROBOT_SPRITE[row][col];
          if (frame === 1 && row >= 14 && row <= 19) {
            c = ROBOT_SPRITE[row][PLAYER_W - 1 - col];
          }
          if (c === 0) continue;
          ctx.fillStyle = PALETTE[c];
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }
      ctx.restore();

      // Glow halo from eyes + chest
      const eyeY = oy + 4 * PIXEL;
      const glow = ctx.createRadialGradient(cx, eyeY, 1, cx, eyeY, 28);
      glow.addColorStop(0, "rgba(60,232,255,0.35)");
      glow.addColorStop(1, "rgba(60,232,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 30, eyeY - 28, 60, 56);
    };

    const drawLocation = (loc: LocationDef, baseY: number, t: TimePeriod) => {
      const x = loc.x;
      const kind: LocationKind = loc.kind;
      const isDark = t === "evening" || t === "night";

      // Building styling per kind
      const styles: Record<LocationKind, { wall: string; trim: string; glow: string; label: string }> = {
        lab:         { wall: "#1a2440", trim: "#3ce8ff", glow: "#3ce8ff", label: "CHARGE BAY" },
        alley:       { wall: "#1a1424", trim: "#ff3a8a", glow: "#ff3a8a", label: "ALLEY" },
        market:      { wall: "#241a30", trim: "#ffd84a", glow: "#ffd84a", label: "MARKET" },
        subway:      { wall: "#0e1828", trim: "#3ce8ff", glow: "#3ce8ff", label: "MAGLEV" },
        apartment:   { wall: "#1e1a2c", trim: "#a26aff", glow: "#a26aff", label: "RESIDENCE" },
        industrial:  { wall: "#241a14", trim: "#ff6a2a", glow: "#ff6a2a", label: "FOUNDRY" },
        underground: { wall: "#0a0a16", trim: "#5a3aff", glow: "#5a3aff", label: "SUB-LEVEL" },
        rooftop:     { wall: "#181430", trim: "#3ce8ff", glow: "#3ce8ff", label: "SPIRE" },
        plaza:       { wall: "#1c1830", trim: "#ffd84a", glow: "#ffd84a", label: "PLAZA" },
        checkpoint:  { wall: "#2a1a1a", trim: "#ff3a3a", glow: "#ff3a3a", label: "CHECKPOINT" },
      };
      const pal = styles[kind];

      const bw = 180, bh = 170;
      const bx = x - bw / 2;
      const by = baseY - bh;

      // Main wall
      ctx.fillStyle = pal.wall;
      ctx.fillRect(bx, by, bw, bh);

      // Roof slab
      ctx.fillStyle = "#06060e";
      ctx.fillRect(bx - 6, by - 10, bw + 12, 10);

      // Vertical neon pipes
      ctx.fillStyle = pal.trim;
      ctx.fillRect(bx + 6, by + 6, 3, bh - 12);
      ctx.fillRect(bx + bw - 9, by + 6, 3, bh - 12);

      // Windows — grid of dim/bright cells
      const cols = 5, rows = 4;
      const wpad = 22, wgap = 6;
      const cellW = (bw - wpad * 2 - wgap * (cols - 1)) / cols;
      const cellH = 16;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = bx + wpad + c * (cellW + wgap);
          const wy = by + 18 + r * (cellH + 6);
          const lit = ((r * 7 + c * 13 + x) % 5) < (isDark ? 3 : 1);
          ctx.fillStyle = lit ? pal.trim : "#0a0a16";
          ctx.fillRect(wx, wy, cellW, cellH);
          if (lit) {
            ctx.fillStyle = "rgba(255,255,255,0.18)";
            ctx.fillRect(wx, wy, cellW, 2);
          }
        }
      }

      // Door
      ctx.fillStyle = "#02020a";
      ctx.fillRect(bx + bw / 2 - 16, by + bh - 46, 32, 46);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(bx + bw / 2 - 16, by + bh - 46, 32, 3);
      ctx.fillRect(bx + bw / 2 - 16, by + bh - 4, 32, 3);

      // Neon sign banner
      ctx.fillStyle = "#02020a";
      ctx.fillRect(bx + 14, by + bh - 78, bw - 28, 22);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(bx + 14, by + bh - 78, bw - 28, 2);
      ctx.fillRect(bx + 14, by + bh - 58, bw - 28, 2);
      ctx.font = "bold 10px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Sign glow flicker
      const flick = 0.7 + Math.sin(animTime * 6 + x) * 0.2 + (Math.random() < 0.02 ? -0.3 : 0);
      ctx.fillStyle = pal.trim;
      ctx.globalAlpha = flick;
      ctx.fillText(pal.label, bx + bw / 2, by + bh - 67);
      ctx.globalAlpha = 1;

      // Sign halo
      if (isDark) {
        const g = ctx.createRadialGradient(x, by + bh - 67, 4, x, by + bh - 67, 90);
        g.addColorStop(0, `${pal.glow}55`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(bx - 60, by + bh - 130, bw + 120, 120);
      }

      // Specialized accents
      if (kind === "lab") {
        // Charging chamber slot — neon vertical capsule next to door
        ctx.fillStyle = "#02020a";
        ctx.fillRect(x + 30, by + bh - 90, 28, 90);
        for (let i = 0; i < 6; i++) {
          const a = (Math.sin(animTime * 4 + i) + 1) * 0.5;
          ctx.fillStyle = `rgba(60,232,255,${0.25 + a * 0.6})`;
          ctx.fillRect(x + 34, by + bh - 84 + i * 14, 20, 4);
        }
      } else if (kind === "checkpoint") {
        // Red beacon on top
        const a = (Math.sin(animTime * 5) + 1) * 0.5;
        ctx.fillStyle = `rgba(255,58,58,${0.5 + a * 0.5})`;
        ctx.fillRect(bx + bw / 2 - 4, by - 18, 8, 8);
      } else if (kind === "subway") {
        // Down-arrow indicator
        ctx.fillStyle = pal.trim;
        ctx.fillRect(x - 12, by + bh - 26, 24, 4);
        ctx.fillRect(x - 8, by + bh - 22, 16, 4);
        ctx.fillRect(x - 4, by + bh - 18, 8, 4);
      } else if (kind === "rooftop") {
        // Antenna
        ctx.fillStyle = pal.trim;
        ctx.fillRect(bx + bw / 2 - 1, by - 60, 2, 60);
        ctx.fillRect(bx + bw / 2 - 8, by - 60, 16, 2);
      }
    };

    const drawNPC = (loc: LocationDef, baseY: number, t: TimePeriod) => {
      // Human (or human-ish) NPC silhouette near door
      const x = loc.x + 70;
      const y = baseY;
      const bob = Math.floor(Math.sin(animTime * 1.5 + x) * 1) * PIXEL;

      // body
      ctx.fillStyle = "#3a2a6a";
      ctx.fillRect(x - 12, y - 30 + bob, 24, 22);
      // jacket trim
      ctx.fillStyle = "#ff3a8a";
      ctx.fillRect(x - 12, y - 30 + bob, 24, 3);
      // head
      ctx.fillStyle = "#e8b88a";
      ctx.fillRect(x - 9, y - 48 + bob, 18, 18);
      // hair
      ctx.fillStyle = "#1a1024";
      ctx.fillRect(x - 9, y - 48 + bob, 18, 5);
      // visor strip
      ctx.fillStyle = "#3ce8ff";
      ctx.fillRect(x - 9, y - 40 + bob, 18, 2);
      // legs
      ctx.fillStyle = "#181020";
      ctx.fillRect(x - 10, y - 8, 8, 8);
      ctx.fillRect(x + 2, y - 8, 8, 8);

      // floating "!" interaction marker
      const pulse = (Math.sin(animTime * 4) + 1) * 0.5;
      const my = y - 70 + Math.sin(animTime * 2 + x) * 2;
      ctx.fillStyle = `rgba(60,232,255,${0.7 + pulse * 0.3})`;
      ctx.fillRect(x - 2, my - 4, 4, 10);
      ctx.fillRect(x - 2, my + 8, 4, 4);

      // halo
      if (t === "evening" || t === "night") {
        const g = ctx.createRadialGradient(x, my, 2, x, my, 26);
        g.addColorStop(0, "rgba(60,232,255,0.4)");
        g.addColorStop(1, "rgba(60,232,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - 26, my - 26, 52, 52);
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      animTime += dt;

      // Regenerate world data when day changes
      if (lastDay !== dayRef.current) {
        world = makeWorldData();
        lastDay = dayRef.current;
      }

      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const dayDef = DAYS[dayRef.current];

      // Update player
      if (!pausedRef.current && !blockRef.current && !cinematicRef.current) {
        let dx = 0;
        const k = keysRef.current;
        if (k.has("a") || k.has("arrowleft")) dx -= 1;
        if (k.has("d") || k.has("arrowright")) dx += 1;
        const p = playerRef.current;
        p.walking = dx !== 0;
        if (dx !== 0) p.facing = dx > 0 ? 1 : -1;
        p.x = Math.max(60, Math.min(dayDef.worldW - 60, p.x + dx * SPEED * dt));
        p.bob = p.walking ? Math.sin(animTime * 12) * 1.5 : Math.sin(animTime * 2) * 0.5;

        // Trigger nearby location
        let near: string | null = null;
        for (const loc of dayDef.locations) {
          if (Math.abs(loc.x - p.x) < TRIGGER_RADIUS) { near = loc.id; break; }
        }
        const nearName = near ? dayDef.locations.find((l) => l.id === near)!.name : null;
        setNearLocation((prev) => (prev === nearName ? prev : nearName));
        if (near && near !== lastTriggeredRef.current) {
          lastTriggeredRef.current = near;
          onEnterRef.current(near);
        } else if (!near) {
          lastTriggeredRef.current = null;
        }
      }

      const p = playerRef.current;

      // Time auto-derived from player x — LOCKED forward only
      const rawSegIdx = Math.min(dayDef.locations.length - 1, Math.max(0, dayDef.locations.findIndex((l, i) => {
        const nextL = dayDef.locations[i + 1];
        return !nextL || p.x < (l.x + nextL.x) / 2;
      })));
      if (rawSegIdx > maxSegRef.current) maxSegRef.current = rawSegIdx;
      const segLoc = dayDef.locations[maxSegRef.current];
      const t: TimePeriod = timeForLocation(dayRef.current, segLoc.id);

      // Smooth camera
      camTarget = Math.max(0, Math.min(dayDef.worldW - W, p.x - W / 2));
      camX += (camTarget - camX) * Math.min(1, dt * 6);

      const groundScreenY = Math.min(GROUND_Y, H - 120);

      /* === Sky === */
      const sky = SKY[t];
      const g = ctx.createLinearGradient(0, 0, 0, groundScreenY);
      g.addColorStop(0, sky[0]);
      g.addColorStop(1, sky[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, groundScreenY);

      // Stars / moon for night and evening
      if (t === "evening" || t === "night") {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        for (let i = 0; i < 60; i++) {
          const sx = (i * 91 + 7) % W;
          const sy = (i * 53) % (groundScreenY - 80);
          const tw = 0.4 + ((Math.sin(animTime * 2 + i) + 1) / 2) * 0.6;
          ctx.globalAlpha = tw;
          ctx.fillRect(sx, sy, 2, 2);
        }
        ctx.globalAlpha = 1;
        // Moon
        ctx.fillStyle = t === "night" ? "#e8e8ff" : "#ffd2a8";
        ctx.beginPath();
        ctx.arc(W - 110, 80, 22, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sun disc through smog
        ctx.fillStyle = t === "morning" ? "#ffb070" : "#ffe8a8";
        ctx.beginPath();
        ctx.arc(W - 110, 90, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      /* === Background skyline (far parallax) === */
      for (const tw of world.towers) {
        const sx = tw.x - camX * 0.25;
        if (sx < -100 || sx > W + 100) continue;
        ctx.fillStyle = TOWER_COLORS[tw.color];
        ctx.fillRect(sx, groundScreenY - tw.h, tw.w, tw.h);
        // window dots
        for (let yy = 4; yy < tw.h - 10; yy += 10) {
          for (let xx = 4; xx < tw.w - 4; xx += 8) {
            if ((xx * 13 + yy * 7 + tw.x) % 5 < (t === "night" ? 3 : 1)) {
              ctx.fillStyle = "rgba(255,220,160,0.7)";
              ctx.fillRect(sx + xx, groundScreenY - tw.h + yy, 3, 4);
            }
          }
        }
        // antenna
        ctx.fillStyle = "rgba(60,232,255,0.5)";
        ctx.fillRect(sx + tw.w / 2 - 1, groundScreenY - tw.h - 14, 2, 14);
      }

      /* === Mid-ground billboards (mid parallax) === */
      for (const bb of world.billboards) {
        const sx = bb.x - camX * 0.55;
        if (sx < -120 || sx > W + 120) continue;
        const color = NEON_COLORS[bb.color];
        // Pole
        ctx.fillStyle = "#1a1a2a";
        ctx.fillRect(sx + bb.w / 2 - 2, bb.y + 40, 4, groundScreenY - bb.y - 40);
        // Frame
        ctx.fillStyle = "#02020a";
        ctx.fillRect(sx, bb.y, bb.w, 40);
        // Sign content
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85 + Math.sin(animTime * 3 + bb.x) * 0.15;
        ctx.fillRect(sx + 3, bb.y + 3, bb.w - 6, 34);
        ctx.globalAlpha = 1;
        // Pixel "text" stripes
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(sx + 8, bb.y + 8 + i * 7, bb.w - 16, 3);
        }
        // Halo
        const gg = ctx.createRadialGradient(sx + bb.w / 2, bb.y + 20, 4, sx + bb.w / 2, bb.y + 20, 80);
        gg.addColorStop(0, `${color}55`);
        gg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gg;
        ctx.fillRect(sx - 40, bb.y - 40, bb.w + 80, 120);
      }

      /* === Flying vehicles (screen-space, slow drift) === */
      for (const v of world.vehicles) {
        const travel = (animTime * v.speed + v.phase) % (W + 200);
        const vx = v.dir > 0 ? travel - 100 : W - travel + 100;
        const color = NEON_COLORS[v.colorIdx];
        // body
        ctx.fillStyle = "#0a0a18";
        ctx.fillRect(vx, v.y, 22, 6);
        ctx.fillRect(vx + 4, v.y - 2, 14, 2);
        // headlight beam
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(v.dir > 0 ? vx + 22 : vx - 2, v.y + 1, 2, 4);
        ctx.globalAlpha = 0.25;
        ctx.fillRect(v.dir > 0 ? vx + 24 : vx - 14, v.y + 2, 12, 2);
        // trail
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(v.dir > 0 ? vx - 14 : vx + 22, v.y + 2, 14, 2);
        ctx.globalAlpha = 1;
      }

      /* === Steam vents (above ground) === */
      for (const sv of world.vents) {
        const sx = sv.x - camX * 0.9;
        if (sx < -40 || sx > W + 40) continue;
        for (let k = 0; k < 4; k++) {
          const a = (animTime * 0.7 + sv.phase + k * 0.3) % 1;
          ctx.fillStyle = `rgba(180,200,220,${(1 - a) * 0.25})`;
          const sy = groundScreenY - 8 - a * 50;
          const sz = 4 + a * 10;
          ctx.fillRect(sx - sz / 2, sy, sz, sz);
        }
      }


      /* === Ground === */
      const gc = GROUND_COLOR[t];
      ctx.fillStyle = gc[0];
      ctx.fillRect(0, groundScreenY, W, H - groundScreenY);
      ctx.fillStyle = gc[1];
      ctx.fillRect(0, groundScreenY + 14, W, H - groundScreenY - 14);

      // Wet street reflection scanlines
      ctx.fillStyle = "rgba(60,232,255,0.05)";
      for (let i = 0; i < W; i += 4) {
        ctx.fillRect(i, groundScreenY + 14 + ((i * 7) % 4), 2, 1);
      }
      // Tile dashes
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      const tileOff = Math.floor(camX) % 32;
      for (let i = -tileOff; i < W; i += 32) {
        ctx.fillRect(i, groundScreenY + 8, 16, 2);
      }

      /* === World layer (translate by -camX) === */
      ctx.save();
      ctx.translate(-camX, 0);

      // Holographic floating signs (in world space)
      for (const ho of world.holos) {
        if (ho.x < camX - 60 || ho.x > camX + W + 60) continue;
        const float = Math.sin(animTime * 1.5 + ho.phase) * 3;
        ctx.globalAlpha = 0.6 + Math.sin(animTime * 4 + ho.phase) * 0.2;
        ctx.fillStyle = "#3ce8ff";
        ctx.fillRect(ho.x, ho.y + float, 26, 4);
        ctx.fillRect(ho.x + 4, ho.y + float + 6, 18, 3);
        ctx.fillRect(ho.x + 2, ho.y + float + 12, 22, 3);
        ctx.globalAlpha = 1;
      }

      // Ground neon strips
      for (const st of world.strips) {
        if (st.x < camX - 200 || st.x > camX + W + 200) continue;
        const flick = 0.5 + Math.sin(animTime * 4 + st.phase) * 0.3;
        ctx.fillStyle = `rgba(255,58,138,${flick})`;
        ctx.fillRect(st.x, groundScreenY + 12, 60, 2);
        ctx.fillStyle = `rgba(60,232,255,${flick * 0.6})`;
        ctx.fillRect(st.x + 80, groundScreenY + 16, 80, 1);
      }

      // Locations
      for (const loc of dayDef.locations) {
        if (loc.x < camX - 220 || loc.x > camX + W + 220) continue;
        drawLocation(loc, groundScreenY, t);
        // No NPC at lab start/end
        if (loc.kind !== "lab") {
          drawNPC(loc, groundScreenY, t);
        }
      }

      // Player shadow
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(p.x - 18, groundScreenY - 3, 36, 3);

      // Player
      const frame = p.walking ? Math.floor(animTime * 8) % WALK_FRAMES : 0;
      drawRobotSprite(p.x, groundScreenY, p.facing, frame, p.bob);

      ctx.restore();

      /* === Rain (screen-space, always for cyberpunk mood) === */
      if (t === "evening" || t === "night" || dayRef.current >= 3) {
        ctx.strokeStyle = "rgba(140,180,220,0.35)";
        ctx.lineWidth = 1;
        for (const r of world.rain) {
          const rx = (r.x + animTime * 220 * r.s) % (W + 40) - 20;
          const ry = (r.y + animTime * 600 * r.s) % H;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 8 * r.s);
          ctx.stroke();
        }
      }

      /* === Time-of-day tint overlay === */
      if (t === "night") {
        ctx.fillStyle = "rgba(8,4,30,0.45)";
        ctx.fillRect(0, 0, W, H);
      } else if (t === "evening") {
        ctx.fillStyle = "rgba(40,10,80,0.28)";
        ctx.fillRect(0, 0, W, H);
      } else if (t === "morning") {
        ctx.fillStyle = "rgba(200,100,160,0.08)";
        ctx.fillRect(0, 0, W, H);
      }

      // Cinematic darkening for dialogue
      if (cinematicRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);
        // Vignette spotlight on player
        const sx = p.x - camX;
        const grd = ctx.createRadialGradient(sx, groundScreenY - 30, 40, sx, groundScreenY - 30, 280);
        grd.addColorStop(0, "rgba(0,0,0,0)");
        grd.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Scanline
      ctx.fillStyle = "rgba(0,0,0,0.08)";
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
      {nearLocation && !blockInput && !cinematic && (
        <div className="pointer-events-none absolute left-1/2 bottom-24 -translate-x-1/2 px-3 py-1.5 text-[10px] tracking-widest pixel-font bg-black/80 text-cyan-300 border-2 border-cyan-400/70 shadow-[0_0_18px_rgba(60,232,255,0.45)]">
          ◆ {nearLocation.toUpperCase()} ◆
        </div>
      )}
    </div>
  );
}
