import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { DAYS, GROUND_Y, timeForLocation } from "@/game/scenarios";
import type { DayNumber, LocationDef, LocationKind, Morality, TimePeriod } from "@/game/types";
import type { CompanionScreenPos } from "./AICompanion";

interface Props {
  day: DayNumber;
  time: TimePeriod;
  paused: boolean;
  onEnterLocation: (locationId: string) => void;
  blockInput: boolean;
  cinematic: boolean;
  morality: Morality;
  fameLevel: number;
  /** Live screen-space position of the companion drone — written to each frame. */
  companionScreenRef?: MutableRefObject<CompanionScreenPos>;
}

const SPEED = 230;
const TRIGGER_RADIUS = 95;
const PLAYER_W = 14;
const PLAYER_H = 20;
const PIXEL = 3;

/* === Cyberpunk sky palettes === */
const SKY: Record<TimePeriod, [string, string]> = {
  morning:   ["#2a2554", "#d97a8f"],
  afternoon: ["#3a4a7a", "#8aa8d8"],
  evening:   ["#1a0e3a", "#7a2a6a"],
  night:     ["#06061a", "#1a0a3a"],
};
const GROUND_COLOR: Record<TimePeriod, [string, string]> = {
  morning:   ["#22203a", "#15132a"],
  afternoon: ["#2a2848", "#181630"],
  evening:   ["#150b2a", "#0a0518"],
  night:     ["#08081a", "#03030a"],
};
const TINT: Record<TimePeriod, [number, number, number, number]> = {
  morning:   [200, 100, 160, 0.08],
  afternoon: [255, 255, 255, 0.0],
  evening:   [40, 10, 80, 0.28],
  night:     [8, 4, 30, 0.45],
};
function hexRGB(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const SKY_RGB: Record<TimePeriod, [number, number, number, number, number, number]> = {
  morning:   [...hexRGB(SKY.morning[0]),   ...hexRGB(SKY.morning[1])]   as [number,number,number,number,number,number],
  afternoon: [...hexRGB(SKY.afternoon[0]), ...hexRGB(SKY.afternoon[1])] as [number,number,number,number,number,number],
  evening:   [...hexRGB(SKY.evening[0]),   ...hexRGB(SKY.evening[1])]   as [number,number,number,number,number,number],
  night:     [...hexRGB(SKY.night[0]),     ...hexRGB(SKY.night[1])]     as [number,number,number,number,number,number],
};
const GROUND_RGB: Record<TimePeriod, [number, number, number, number, number, number]> = {
  morning:   [...hexRGB(GROUND_COLOR.morning[0]),   ...hexRGB(GROUND_COLOR.morning[1])]   as [number,number,number,number,number,number],
  afternoon: [...hexRGB(GROUND_COLOR.afternoon[0]), ...hexRGB(GROUND_COLOR.afternoon[1])] as [number,number,number,number,number,number],
  evening:   [...hexRGB(GROUND_COLOR.evening[0]),   ...hexRGB(GROUND_COLOR.evening[1])]   as [number,number,number,number,number,number],
  night:     [...hexRGB(GROUND_COLOR.night[0]),     ...hexRGB(GROUND_COLOR.night[1])]     as [number,number,number,number,number,number],
};
const rgb = (r: number, g: number, b: number) => `rgb(${r|0},${g|0},${b|0})`;

/* === Robot player sprite (14x20) === */
type C = number;
const _ = 0, S = 1, M = 2, E = 3, B = 4, T = 5, A = 6, V = 7;
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
  1: "#c8d8e8",
  2: "#2a2440",
  3: "#3ce8ff",
  4: "#3a4a8a",
  5: "#8a6aff",
  6: "#ffd84a",
  7: "#0a0420",
};
const WALK_FRAMES = 2;

/* === District flavor per day === */
type District = "neon" | "corporate" | "underground" | "spire" | "final";
function districtForDay(day: DayNumber): District {
  if (day === 1) return "neon";
  if (day === 2) return "corporate";
  if (day === 3) return "underground";
  if (day === 4) return "spire";
  return "final";
}

/** Reputation: -1 (notorious) .. 0 (neutral) .. +1 (beloved) */
function reputationScore(m: Morality): number {
  const good = m.empathy + m.responsibility + m.courage * 0.5 + m.honesty * 0.5;
  const bad = m.selfishness * 1.4 + Math.max(0, -m.empathy) + Math.max(0, -m.honesty);
  const net = good - bad;
  return Math.max(-1, Math.min(1, net / 14));
}

export function GameWorld({ day, time, paused, onEnterLocation, blockInput, cinematic, morality, fameLevel, companionScreenRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({ x: 360, vx: 0, facing: 1 as 1 | -1, walking: false, bob: 0 });
  const companionRef = useRef({ x: 280, y: GROUND_Y - 90, vx: 0, vy: 0 });
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
  const moralityRef = useRef(morality);
  const fameRef = useRef(fameLevel);

  useEffect(() => { onEnterRef.current = onEnterLocation; }, [onEnterLocation]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { blockRef.current = blockInput; }, [blockInput]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { cinematicRef.current = cinematic; }, [cinematic]);
  useEffect(() => { moralityRef.current = morality; }, [morality]);
  useEffect(() => { fameRef.current = fameLevel; }, [fameLevel]);

  useEffect(() => {
    dayRef.current = day;
    playerRef.current.x = 360;
    playerRef.current.facing = 1;
    companionRef.current.x = 280;
    companionRef.current.y = GROUND_Y - 90;
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
    const curSky: [number, number, number, number, number, number] = [42, 37, 84, 217, 122, 143];
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

    // hash for deterministic per-position variation
    const h = (n: number) => {
      let x = Math.sin(n * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    /* ============ World generation per day ============ */
    const makeWorldData = () => {
      const W = DAYS[dayRef.current].worldW;
      const dist = districtForDay(dayRef.current);

      // Far parallax skyline — 3 layers, district-flavored
      const farTowers = Array.from({ length: 60 }, (_, i) => {
        const r = h(i + dayRef.current * 100);
        const type = Math.floor(r * 5); // 0..4 different silhouettes
        return {
          x: (i * 160 + r * 80) % W,
          h: 90 + Math.floor(r * 220),
          w: 28 + Math.floor(h(i * 3.1) * 50),
          type,
        };
      });

      const midTowers = Array.from({ length: 36 }, (_, i) => {
        const r = h(i + dayRef.current * 200 + 13);
        const type = Math.floor(r * 6);
        return {
          x: (i * 240 + r * 120) % W,
          h: 130 + Math.floor(r * 180),
          w: 50 + Math.floor(h(i * 5.7) * 60),
          type,
          accent: Math.floor(h(i * 11.3) * 4),
        };
      });

      // Mid-ground neon ad billboards (now with text variants)
      const billboards = Array.from({ length: 22 }, (_, i) => ({
        x: (i * 320 + 200) % W,
        y: 80 + Math.floor(h(i * 7.2) * 110),
        w: 90 + Math.floor(h(i * 4.4) * 40),
        color: i % 4,
        msgSlot: i % 6,
      }));

      // Holographic floating signs
      const holos = Array.from({ length: 26 }, (_, i) => ({
        x: (i * 250 + 150) % W,
        y: 170 + Math.floor(h(i * 9.1) * 90),
        phase: h(i * 1.7) * Math.PI * 2,
      }));

      // Rain
      const rain = Array.from({ length: 110 }, (_, i) => ({
        x: (i * 71) % 1600,
        y: (i * 53) % 800,
        s: 0.5 + (i % 10) / 10,
      }));

      // Ground neon strips
      const strips = Array.from({ length: 40 }, (_, i) => ({
        x: i * 170,
        phase: h(i * 0.9) * Math.PI * 2,
      }));

      // Flying vehicles (more variety, multiple lanes)
      const vehicles = Array.from({ length: 10 }, (_, i) => ({
        y: 50 + Math.floor(h(i * 5.3) * 180),
        speed: 35 + Math.floor(h(i * 2.7) * 60),
        phase: h(i * 1.1) * 6 * W / 3,
        dir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
        colorIdx: i % 4,
        size: 0.7 + h(i * 3.3) * 0.8,
      }));

      // Steam vents
      const vents = Array.from({ length: 16 }, (_, i) => ({
        x: (i * 420 + 240) % W,
        phase: h(i * 0.6) * Math.PI * 2,
      }));

      // Service drones — small, hover near buildings
      const drones = Array.from({ length: 14 }, (_, i) => ({
        cx: (i * 380 + 200) % W,
        cy: 200 + Math.floor(h(i * 7.7) * 120),
        radius: 30 + Math.floor(h(i * 3.1) * 40),
        phase: h(i * 2.3) * Math.PI * 2,
        speed: 0.6 + h(i * 5.5) * 0.8,
        kind: i % 3, // delivery / police / civilian
      }));

      // Bridges / elevated road segments
      const bridges = Array.from({ length: 4 }, (_, i) => ({
        x: (i * 1400 + 600) % W,
        w: 380 + Math.floor(h(i * 4.4) * 200),
        y: 240 + (i % 2) * 60,
      }));

      // Maglev train rail height (constant per day) & a moving train
      const railY = 290;
      const train = { offset: h(dayRef.current * 13.3) * W, speed: 110 };

      // Ambient pedestrian NPCs — wander along the street
      const peds = Array.from({ length: 22 }, (_, i) => ({
        x: (i * 280 + 400) % W,
        speed: 12 + h(i * 1.9) * 20,
        dir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
        skin: ["#e8b88a", "#c8967a", "#d8a888", "#a87a5a"][i % 4],
        outfit: ["#3a2a6a", "#2a3a5a", "#4a2a3a", "#1a3a4a", "#3a3a1a"][i % 5],
        hair: ["#1a1024", "#3a2a1a", "#5a4030", "#2a2a3a"][i % 4],
        chatter: i % 7, // background line index
        kind: (i % 5 === 0 ? "android" : "human") as "human" | "android",
      }));

      // Antennas & pipes on rooftops
      const antennas = Array.from({ length: 30 }, (_, i) => ({
        x: (i * 200 + 90) % W,
        h: 30 + Math.floor(h(i * 6.6) * 50),
      }));

      return { farTowers, midTowers, billboards, holos, rain, strips, vehicles, vents, drones, bridges, railY, train, peds, antennas, district: dist };
    };
    let world = makeWorldData();
    let lastDay = dayRef.current;

    const NEON_COLORS = ["#ff3a8a", "#3ce8ff", "#a26aff", "#ffd84a"];

    /* ===== Billboard message system (reactive to reputation) ===== */
    const BILLBOARD_MSGS = {
      positive: [
        "ANDROID RESTORES HOPE",
        "THE CITY'S GUARDIAN",
        "MORALITY INDEX RISING",
        "UNIT 7 INSPIRES CITIZENS",
        "EMPATHY PROTOCOL: ACTIVE",
        "A MACHINE WITH A HEART",
      ],
      neutral: [
        "ANDROID ACTIVITY CONTINUES",
        "PUBLIC OPINION DIVIDED",
        "HELIX CORP: TRIAL IN PROGRESS",
        "BUY NEO-NOODLES NOW",
        "SECTOR 9 — STAY ALERT",
        "PROJECT M.O.R.A.L. ONLINE",
      ],
      negative: [
        "ANDROID UNDER INVESTIGATION",
        "PUBLIC TRUST DECLINING",
        "UNIT 7 — INCIDENT REVIEW",
        "CITIZENS QUESTION HELIX",
        "MORALITY DRIFT DETECTED",
        "REPORT SUSPICIOUS UNITS",
      ],
    };
    const billboardMessage = (slot: number): string => {
      const r = reputationScore(moralityRef.current);
      const bank =
        r > 0.25 ? BILLBOARD_MSGS.positive :
        r < -0.25 ? BILLBOARD_MSGS.negative :
        BILLBOARD_MSGS.neutral;
      return bank[slot % bank.length];
    };

    /* ===== Robot sprite renderer ===== */
    const drawRobotSprite = (cx: number, cy: number, facing: 1 | -1, frame: number, bob: number) => {
      ctx.save();
      const w = PLAYER_W * PIXEL;
      const hgt = PLAYER_H * PIXEL;
      const ox = cx - w / 2;
      const oy = cy - hgt + bob;
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

      const eyeY = oy + 4 * PIXEL;
      const glow = ctx.createRadialGradient(cx, eyeY, 1, cx, eyeY, 28);
      glow.addColorStop(0, "rgba(60,232,255,0.35)");
      glow.addColorStop(1, "rgba(60,232,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 30, eyeY - 28, 60, 56);
    };

    /* ===== Companion drone — small floating AI orb ===== */
    const drawCompanion = (cx: number, cy: number) => {
      const wob = Math.sin(animTime * 2.4) * 2;
      const y = cy + wob;
      // glow halo
      const g = ctx.createRadialGradient(cx, y, 1, cx, y, 30);
      g.addColorStop(0, "rgba(255,58,138,0.45)");
      g.addColorStop(1, "rgba(255,58,138,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - 30, y - 30, 60, 60);

      // body
      ctx.fillStyle = "#0a0420";
      ctx.fillRect(cx - 8, y - 6, 16, 12);
      ctx.fillStyle = "#2a2440";
      ctx.fillRect(cx - 8, y - 6, 16, 2);
      // visor
      const eyeBlink = (Math.sin(animTime * 3.2) + 1) * 0.5;
      ctx.fillStyle = `rgba(60,232,255,${0.6 + eyeBlink * 0.4})`;
      ctx.fillRect(cx - 6, y - 3, 12, 3);
      // side lights
      const pulse = (Math.sin(animTime * 5) + 1) * 0.5;
      ctx.fillStyle = `rgba(255,58,138,${0.5 + pulse * 0.5})`;
      ctx.fillRect(cx - 10, y, 2, 2);
      ctx.fillRect(cx + 8, y, 2, 2);
      // thruster sparkle
      ctx.fillStyle = "rgba(60,232,255,0.6)";
      ctx.fillRect(cx - 1, y + 7, 2, 2 + Math.sin(animTime * 8) * 1.2);
    };

    /* ===== Background tower variants ===== */
    const drawFarTower = (sx: number, gy: number, t: { x: number; h: number; w: number; type: number }, isDark: boolean) => {
      const colors = ["#0a0a1a", "#10102a", "#080814", "#141022", "#0a1220"];
      ctx.fillStyle = colors[t.type % colors.length];
      // silhouettes vary by type
      if (t.type === 0) {
        // simple slab
        ctx.fillRect(sx, gy - t.h, t.w, t.h);
      } else if (t.type === 1) {
        // stepped tower
        ctx.fillRect(sx, gy - t.h, t.w, t.h);
        ctx.fillRect(sx + 6, gy - t.h - 18, t.w - 12, 18);
        ctx.fillRect(sx + t.w / 2 - 2, gy - t.h - 36, 4, 18);
      } else if (t.type === 2) {
        // pyramid top
        ctx.fillRect(sx, gy - t.h, t.w, t.h);
        ctx.beginPath();
        ctx.moveTo(sx, gy - t.h);
        ctx.lineTo(sx + t.w / 2, gy - t.h - 24);
        ctx.lineTo(sx + t.w, gy - t.h);
        ctx.fill();
      } else if (t.type === 3) {
        // double tower
        const half = t.w / 2 - 4;
        ctx.fillRect(sx, gy - t.h, half, t.h);
        ctx.fillRect(sx + half + 8, gy - t.h + 14, half, t.h - 14);
      } else {
        // dome top
        ctx.fillRect(sx, gy - t.h, t.w, t.h);
        ctx.beginPath();
        ctx.arc(sx + t.w / 2, gy - t.h, t.w / 2 - 2, Math.PI, 0);
        ctx.fill();
      }
      // window grid
      for (let yy = 6; yy < t.h - 8; yy += 9) {
        for (let xx = 4; xx < t.w - 4; xx += 7) {
          if ((xx * 13 + yy * 7 + t.x) % 5 < (isDark ? 3 : 1)) {
            ctx.fillStyle = "rgba(255,220,160,0.7)";
            ctx.fillRect(sx + xx, gy - t.h + yy, 2, 3);
          }
        }
      }
      // antenna
      ctx.fillStyle = "rgba(60,232,255,0.4)";
      ctx.fillRect(sx + t.w / 2 - 1, gy - t.h - 16, 2, 16);
    };

    const drawMidTower = (sx: number, gy: number, t: { x: number; h: number; w: number; type: number; accent: number }, district: District, isDark: boolean) => {
      // base color by district
      const districtBase: Record<District, string[]> = {
        neon:        ["#1a0e2a", "#241638", "#180a26"],
        corporate:   ["#0e1a2a", "#16243a", "#10202e"],
        underground: ["#0a0a14", "#120c18", "#080812"],
        spire:       ["#1a1432", "#241a40", "#140a28"],
        final:       ["#0a0414", "#180a24", "#0e0820"],
      };
      const wall = districtBase[district][t.type % 3];
      ctx.fillStyle = wall;
      ctx.fillRect(sx, gy - t.h, t.w, t.h);

      // district-specific silhouettes
      if (district === "corporate") {
        // glass tower: vertical metallic stripes + crowning hologram
        ctx.fillStyle = "#1a3a5a";
        for (let xx = 4; xx < t.w - 4; xx += 6) ctx.fillRect(sx + xx, gy - t.h, 2, t.h);
        // holographic facade glow
        ctx.globalAlpha = 0.4 + Math.sin(animTime * 1.5 + t.x) * 0.2;
        ctx.fillStyle = "#3ce8ff";
        ctx.fillRect(sx + 4, gy - t.h + 12, t.w - 8, 18);
        ctx.globalAlpha = 1;
        // crown
        ctx.fillStyle = NEON_COLORS[t.accent];
        ctx.fillRect(sx + t.w / 2 - 3, gy - t.h - 22, 6, 22);
      } else if (district === "underground") {
        // improvised: layered makeshift roofs + signs
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i % 2 === 0 ? "#1a1020" : "#241432";
          ctx.fillRect(sx - 2 + i * 2, gy - t.h - i * 6, t.w + 4 - i * 4, 6);
        }
        ctx.fillStyle = NEON_COLORS[t.accent];
        ctx.fillRect(sx + 6, gy - t.h + 24, 4, t.h - 30);
      } else if (district === "neon") {
        // many small lit windows + giant vertical neon strip
        ctx.fillStyle = NEON_COLORS[t.accent];
        ctx.globalAlpha = 0.7 + Math.sin(animTime * 4 + t.x) * 0.2;
        ctx.fillRect(sx + 4, gy - t.h + 8, 3, t.h - 16);
        ctx.fillRect(sx + t.w - 7, gy - t.h + 8, 3, t.h - 16);
        ctx.globalAlpha = 1;
      } else if (district === "spire") {
        // tall thin with antenna mast
        ctx.fillStyle = "#3ce8ff";
        ctx.fillRect(sx + t.w / 2 - 1, gy - t.h - 38, 2, 38);
        ctx.fillRect(sx + t.w / 2 - 5, gy - t.h - 36, 10, 2);
      } else {
        // final — dark, ominous slab with red eye
        ctx.fillStyle = "#ff3a3a";
        ctx.globalAlpha = (Math.sin(animTime * 2 + t.x) + 1) * 0.4;
        ctx.fillRect(sx + t.w / 2 - 4, gy - t.h + 20, 8, 4);
        ctx.globalAlpha = 1;
      }

      // window grid (mid layer brighter)
      const cols = Math.floor(t.w / 6);
      const rows = Math.floor(t.h / 9);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = sx + 3 + c * 6;
          const wy = gy - t.h + 6 + r * 9;
          const lit = ((r * 7 + c * 13 + t.x) % 5) < (isDark ? 3 : 1);
          if (lit) {
            // occasional animated window (silhouette movement)
            const flicker = (Math.sin(animTime * 3 + r * 4 + c) > 0.7) ? 0.4 : 1;
            ctx.globalAlpha = 0.6 * flicker;
            ctx.fillStyle = "#ffe2a8";
            ctx.fillRect(wx, wy, 3, 4);
            ctx.globalAlpha = 1;
          }
        }
      }

      // rooftop details: pipes/AC
      ctx.fillStyle = "#1a1a2a";
      ctx.fillRect(sx + 4, gy - t.h - 6, 12, 6);
      ctx.fillRect(sx + t.w - 16, gy - t.h - 4, 8, 4);
    };

    /* ===== Foreground location buildings (district variants) ===== */
    const drawLocation = (loc: LocationDef, baseY: number, t: TimePeriod, district: District) => {
      const x = loc.x;
      const kind: LocationKind = loc.kind;
      const isDark = t === "evening" || t === "night";

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

      ctx.fillStyle = pal.wall;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#06060e";
      ctx.fillRect(bx - 6, by - 10, bw + 12, 10);

      // district-flavored facade overlay
      if (kind === "apartment") {
        // balconies
        for (let r = 0; r < 3; r++) {
          ctx.fillStyle = "#0a0816";
          ctx.fillRect(bx + 4, by + 30 + r * 36, bw - 8, 4);
          ctx.fillStyle = pal.trim;
          for (let c = 0; c < 8; c++) ctx.fillRect(bx + 6 + c * 22, by + 26 + r * 36, 2, 8);
        }
      } else if (kind === "industrial") {
        // chimneys + smoke
        ctx.fillStyle = "#0a0a10";
        ctx.fillRect(bx + 20, by - 40, 14, 40);
        ctx.fillRect(bx + bw - 34, by - 30, 12, 30);
        for (let k = 0; k < 3; k++) {
          const a = (animTime * 0.5 + k * 0.4) % 1;
          ctx.fillStyle = `rgba(80,80,90,${(1 - a) * 0.4})`;
          ctx.fillRect(bx + 24 - a * 6, by - 40 - a * 24, 8 + a * 6, 8 + a * 4);
        }
      } else if (kind === "rooftop" || kind === "lab") {
        // antenna cluster
        ctx.fillStyle = pal.trim;
        for (let k = 0; k < 4; k++) ctx.fillRect(bx + 20 + k * 32, by - 30 - k * 6, 2, 30 + k * 6);
      }

      // neon pipes
      ctx.fillStyle = pal.trim;
      ctx.fillRect(bx + 6, by + 6, 3, bh - 12);
      ctx.fillRect(bx + bw - 9, by + 6, 3, bh - 12);

      // window grid
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
            // occasional silhouette of person
            if ((r + c + x) % 4 === 0 && Math.sin(animTime * 1.2 + x + r + c) > 0.3) {
              ctx.fillStyle = "rgba(0,0,0,0.55)";
              ctx.fillRect(wx + cellW / 2 - 2, wy + 4, 4, cellH - 4);
            }
          }
        }
      }

      // door
      ctx.fillStyle = "#02020a";
      ctx.fillRect(bx + bw / 2 - 16, by + bh - 46, 32, 46);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(bx + bw / 2 - 16, by + bh - 46, 32, 3);
      ctx.fillRect(bx + bw / 2 - 16, by + bh - 4, 32, 3);

      // sign banner
      ctx.fillStyle = "#02020a";
      ctx.fillRect(bx + 14, by + bh - 78, bw - 28, 22);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(bx + 14, by + bh - 78, bw - 28, 2);
      ctx.fillRect(bx + 14, by + bh - 58, bw - 28, 2);
      ctx.font = "bold 10px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const flick = 0.7 + Math.sin(animTime * 6 + x) * 0.2 + (Math.random() < 0.02 ? -0.3 : 0);
      ctx.fillStyle = pal.trim;
      ctx.globalAlpha = flick;
      ctx.fillText(pal.label, bx + bw / 2, by + bh - 67);
      ctx.globalAlpha = 1;

      if (isDark) {
        const g = ctx.createRadialGradient(x, by + bh - 67, 4, x, by + bh - 67, 90);
        g.addColorStop(0, `${pal.glow}55`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(bx - 60, by + bh - 130, bw + 120, 120);
      }

      if (kind === "lab") {
        ctx.fillStyle = "#02020a";
        ctx.fillRect(x + 30, by + bh - 90, 28, 90);
        for (let i = 0; i < 6; i++) {
          const a = (Math.sin(animTime * 4 + i) + 1) * 0.5;
          ctx.fillStyle = `rgba(60,232,255,${0.25 + a * 0.6})`;
          ctx.fillRect(x + 34, by + bh - 84 + i * 14, 20, 4);
        }
      } else if (kind === "checkpoint") {
        const a = (Math.sin(animTime * 5) + 1) * 0.5;
        ctx.fillStyle = `rgba(255,58,58,${0.5 + a * 0.5})`;
        ctx.fillRect(bx + bw / 2 - 4, by - 18, 8, 8);
      } else if (kind === "subway") {
        ctx.fillStyle = pal.trim;
        ctx.fillRect(x - 12, by + bh - 26, 24, 4);
        ctx.fillRect(x - 8, by + bh - 22, 16, 4);
        ctx.fillRect(x - 4, by + bh - 18, 8, 4);
      }
    };

    /* ===== NPC with reputation-driven reaction ===== */
    const drawNPC = (loc: LocationDef, baseY: number, t: TimePeriod) => {
      const x = loc.x + 70;
      const y = baseY;
      const bob = Math.floor(Math.sin(animTime * 1.5 + x) * 1) * PIXEL;

      ctx.fillStyle = "#3a2a6a";
      ctx.fillRect(x - 12, y - 30 + bob, 24, 22);
      ctx.fillStyle = "#ff3a8a";
      ctx.fillRect(x - 12, y - 30 + bob, 24, 3);
      ctx.fillStyle = "#e8b88a";
      ctx.fillRect(x - 9, y - 48 + bob, 18, 18);
      ctx.fillStyle = "#1a1024";
      ctx.fillRect(x - 9, y - 48 + bob, 18, 5);
      ctx.fillStyle = "#3ce8ff";
      ctx.fillRect(x - 9, y - 40 + bob, 18, 2);
      ctx.fillStyle = "#181020";
      ctx.fillRect(x - 10, y - 8, 8, 8);
      ctx.fillRect(x + 2, y - 8, 8, 8);

      // interaction marker — color depends on reputation
      const r = reputationScore(moralityRef.current);
      const markerColor = r > 0.25 ? "rgba(106,255,176," : r < -0.25 ? "rgba(255,90,90," : "rgba(60,232,255,";
      const pulse = (Math.sin(animTime * 4) + 1) * 0.5;
      const my = y - 70 + Math.sin(animTime * 2 + x) * 2;
      ctx.fillStyle = `${markerColor}${0.7 + pulse * 0.3})`;
      ctx.fillRect(x - 2, my - 4, 4, 10);
      ctx.fillRect(x - 2, my + 8, 4, 4);

      if (t === "evening" || t === "night") {
        const g = ctx.createRadialGradient(x, my, 2, x, my, 26);
        g.addColorStop(0, `${markerColor}0.4)`);
        g.addColorStop(1, `${markerColor}0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - 26, my - 26, 52, 52);
      }
    };

    /* ===== Ambient pedestrian (reputation-aware) ===== */
    const drawPedestrian = (p: { x: number; speed: number; dir: 1 | -1; skin: string; outfit: string; hair: string; chatter: number; kind: "human" | "android" }, baseY: number, playerX: number) => {
      const moveX = (animTime * p.speed * p.dir + p.x) % (DAYS[dayRef.current].worldW + 200) - 100;
      const x = moveX;
      const bob = Math.floor(Math.sin(animTime * 4 + p.x) * 1.2) * 2;
      const distToPlayer = Math.abs(x - playerX);
      const r = reputationScore(moralityRef.current);
      const fame = fameRef.current;

      // body
      ctx.fillStyle = p.outfit;
      ctx.fillRect(x - 7, baseY - 24 + bob, 14, 16);
      // head
      ctx.fillStyle = p.kind === "android" ? "#3a3a4a" : p.skin;
      ctx.fillRect(x - 5, baseY - 36 + bob, 10, 10);
      // hair / visor
      if (p.kind === "android") {
        ctx.fillStyle = "#3ce8ff";
        ctx.fillRect(x - 5, baseY - 32 + bob, 10, 1);
      } else {
        ctx.fillStyle = p.hair;
        ctx.fillRect(x - 5, baseY - 36 + bob, 10, 3);
      }
      // legs
      ctx.fillStyle = "#0a0814";
      const legPhase = Math.sin(animTime * 8 + p.x) > 0;
      ctx.fillRect(x - 5, baseY - 8, 4, 8 + (legPhase ? 0 : -1));
      ctx.fillRect(x + 1, baseY - 8, 4, 8 + (legPhase ? -1 : 0));

      // reaction bubble when near player
      if (distToPlayer < 90 && !cinematicRef.current) {
        let emoji = "?";
        let color = "#3ce8ff";
        if (r > 0.4) { emoji = fame > 4 ? "★" : "♥"; color = "#6affb0"; }
        else if (r > 0.1) { emoji = "·"; color = "#3ce8ff"; }
        else if (r < -0.4) { emoji = "!"; color = "#ff5a5a"; }
        else if (r < -0.1) { emoji = "?"; color = "#ffb05a"; }
        const by = baseY - 50 + Math.sin(animTime * 3 + p.x) * 2;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(x - 7, by - 8, 14, 12);
        ctx.fillStyle = color;
        ctx.font = "bold 10px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, x, by - 2);
      }
    };

    /* ===== Service drone (background) ===== */
    const drawServiceDrone = (cx: number, cy: number, kind: number) => {
      const colors = ["#3ce8ff", "#ff3a3a", "#ffd84a"];
      const col = colors[kind % 3];
      ctx.fillStyle = "#0a0420";
      ctx.fillRect(cx - 5, cy - 3, 10, 6);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.7 + Math.sin(animTime * 6 + cx) * 0.3;
      ctx.fillRect(cx - 3, cy - 1, 6, 2);
      ctx.globalAlpha = 1;
      ctx.fillRect(cx - 7, cy, 2, 1);
      ctx.fillRect(cx + 5, cy, 2, 1);
    };

    /* ===== Bridge ===== */
    const drawBridge = (sx: number, w: number, y: number, isDark: boolean) => {
      // deck
      ctx.fillStyle = "#0a0a18";
      ctx.fillRect(sx, y, w, 8);
      // support cables
      ctx.fillStyle = "rgba(60,232,255,0.4)";
      for (let i = 0; i < w; i += 24) ctx.fillRect(sx + i, y - 18, 1, 18);
      // tiny vehicles crossing
      const vx = (animTime * 60) % w;
      ctx.fillStyle = "#ff3a8a";
      ctx.fillRect(sx + vx, y - 3, 6, 2);
      ctx.fillStyle = "#3ce8ff";
      ctx.fillRect(sx + ((vx + w / 2) % w), y - 3, 6, 2);
      if (isDark) {
        ctx.fillStyle = "rgba(255,210,160,0.15)";
        ctx.fillRect(sx, y - 1, w, 1);
      }
    };

    /* ===== Maglev train ===== */
    const drawTrain = (railY: number, train: { offset: number; speed: number }, W: number, camX: number) => {
      // elevated rail
      ctx.fillStyle = "#1a1a2a";
      ctx.fillRect(0, railY, W, 4);
      ctx.fillStyle = "rgba(60,232,255,0.4)";
      ctx.fillRect(0, railY - 1, W, 1);

      // pylons
      ctx.fillStyle = "#0a0a18";
      for (let x = -((camX * 0.5) % 200); x < W; x += 200) {
        ctx.fillRect(x, railY + 4, 6, 60);
      }

      // train (screen space — periodic pass-through)
      const cycle = 18000; // ms-ish
      const period = cycle / 1000;
      const t = ((animTime + train.offset) % period) / period;
      if (t < 0.7) {
        const tx = -200 + t * (W + 400) * 1.4;
        ctx.fillStyle = "#0e0e1c";
        ctx.fillRect(tx, railY - 18, 180, 18);
        ctx.fillStyle = "#3ce8ff";
        ctx.fillRect(tx, railY - 18, 180, 2);
        // windows
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = "rgba(255,220,160,0.85)";
          ctx.fillRect(tx + 8 + i * 22, railY - 14, 14, 8);
        }
        // headlight
        ctx.fillStyle = "rgba(60,232,255,0.7)";
        ctx.fillRect(tx + 178, railY - 12, 8, 4);
        // motion blur
        ctx.fillStyle = "rgba(60,232,255,0.3)";
        ctx.fillRect(tx - 40, railY - 8, 40, 2);
      }
    };

    /* ===== Billboard with framed, auto-fitted text ===== */
    const wrapBillboardText = (msg: string, maxChars: number): string[] => {
      const words = msg.split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        if (!cur.length) { cur = w; continue; }
        if (cur.length + 1 + w.length <= maxChars) cur += " " + w;
        else { lines.push(cur); cur = w; }
      }
      if (cur) lines.push(cur);
      return lines.slice(0, 2); // hard cap at 2 lines
    };

    const drawBillboard = (sx: number, bb: { x: number; y: number; w: number; color: number; msgSlot: number }, groundScreenY: number) => {
      const color = NEON_COLORS[bb.color];
      // Larger billboard for safe text margins
      const BW = Math.max(160, bb.w + 60);
      const BH = 64;
      const FRAME = 4;
      const PAD_X = 14;
      const PAD_Y = 8;
      const screenX = sx - (BW - bb.w) / 2;

      // pole
      ctx.fillStyle = "#1a1a2a";
      ctx.fillRect(screenX + BW / 2 - 3, bb.y + BH, 6, groundScreenY - bb.y - BH);
      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(screenX + BW / 2 - 4, bb.y + BH + 2, 8, 4);

      // outer frame (dark)
      ctx.fillStyle = "#02020a";
      ctx.fillRect(screenX, bb.y, BW, BH);
      // neon border
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85 + Math.sin(animTime * 3 + bb.x) * 0.15;
      // top/bottom
      ctx.fillRect(screenX, bb.y, BW, 2);
      ctx.fillRect(screenX, bb.y + BH - 2, BW, 2);
      // sides
      ctx.fillRect(screenX, bb.y, 2, BH);
      ctx.fillRect(screenX + BW - 2, bb.y, 2, BH);
      // inner glow strip
      ctx.globalAlpha = 0.18;
      ctx.fillRect(screenX + FRAME, bb.y + FRAME, BW - FRAME * 2, BH - FRAME * 2);
      ctx.globalAlpha = 1;

      // corner brackets
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.6;
      const cb = 4;
      ctx.fillRect(screenX + 2, bb.y + 2, cb, 1); ctx.fillRect(screenX + 2, bb.y + 2, 1, cb);
      ctx.fillRect(screenX + BW - 2 - cb, bb.y + 2, cb, 1); ctx.fillRect(screenX + BW - 3, bb.y + 2, 1, cb);
      ctx.fillRect(screenX + 2, bb.y + BH - 3, cb, 1); ctx.fillRect(screenX + 2, bb.y + BH - 2 - cb, 1, cb);
      ctx.fillRect(screenX + BW - 2 - cb, bb.y + BH - 3, cb, 1); ctx.fillRect(screenX + BW - 3, bb.y + BH - 2 - cb, 1, cb);
      ctx.globalAlpha = 1;

      // scanlines on screen area
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let yy = bb.y + FRAME; yy < bb.y + BH - FRAME; yy += 3) {
        ctx.fillRect(screenX + FRAME, yy, BW - FRAME * 2, 1);
      }

      // text — auto-fit by reducing size + wrapping
      const msg = billboardMessage(bb.msgSlot);
      const innerW = BW - PAD_X * 2;
      const innerH = BH - PAD_Y * 2;
      // pick font size based on length & width
      let fontSize = 9;
      let maxChars = Math.floor(innerW / 6.5);
      if (msg.length > maxChars * 2) { fontSize = 7; maxChars = Math.floor(innerW / 5.2); }
      if (msg.length > maxChars * 2) { fontSize = 6; maxChars = Math.floor(innerW / 4.5); }
      const lines = wrapBillboardText(msg, Math.max(6, maxChars));
      ctx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineH = fontSize + 4;
      const totalH = lines.length * lineH;
      const startY = bb.y + PAD_Y + (innerH - totalH) / 2 + lineH / 2;
      // text shadow for legibility
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      for (let li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], screenX + BW / 2 + 1, startY + li * lineH + 1);
      }
      ctx.fillStyle = color;
      for (let li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], screenX + BW / 2, startY + li * lineH);
      }

      // halo
      const gg = ctx.createRadialGradient(screenX + BW / 2, bb.y + BH / 2, 4, screenX + BW / 2, bb.y + BH / 2, 140);
      gg.addColorStop(0, `${color}44`);
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(screenX - 50, bb.y - 50, BW + 100, BH + 100);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      animTime += dt;

      if (lastDay !== dayRef.current) {
        world = makeWorldData();
        lastDay = dayRef.current;
      }

      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const dayDef = DAYS[dayRef.current];
      const district = world.district;

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

      // Companion follows behind the player with spring-ish smoothing
      const comp = companionRef.current;
      const wantX = p.x - p.facing * 38;
      const wantY = GROUND_Y - 78 + Math.sin(animTime * 1.8) * 4;
      comp.vx += (wantX - comp.x) * 6 * dt;
      comp.vy += (wantY - comp.y) * 6 * dt;
      comp.vx *= Math.pow(0.001, dt);
      comp.vy *= Math.pow(0.001, dt);
      comp.x += comp.vx * dt;
      comp.y += comp.vy * dt;

      const rawSegIdx = Math.min(dayDef.locations.length - 1, Math.max(0, dayDef.locations.findIndex((l, i) => {
        const nextL = dayDef.locations[i + 1];
        return !nextL || p.x < (l.x + nextL.x) / 2;
      })));
      if (rawSegIdx > maxSegRef.current) maxSegRef.current = rawSegIdx;
      const segLoc = dayDef.locations[maxSegRef.current];
      const t: TimePeriod = timeForLocation(dayRef.current, segLoc.id);

      camTarget = Math.max(0, Math.min(dayDef.worldW - W, p.x - W / 2));
      camX += (camTarget - camX) * Math.min(1, dt * 6);

      const groundScreenY = Math.min(GROUND_Y, H - 120);

      // smooth lerp palettes
      const targetSky = SKY_RGB[t];
      const targetGround = GROUND_RGB[t];
      const targetTint = TINT[t];
      const lerpRate = Math.min(1, dt * 0.6);
      for (let i = 0; i < 6; i++) {
        curSky[i] += (targetSky[i] - curSky[i]) * lerpRate;
        curGround[i] += (targetGround[i] - curGround[i]) * lerpRate;
      }
      curTintR += (targetTint[0] - curTintR) * lerpRate;
      curTintG += (targetTint[1] - curTintG) * lerpRate;
      curTintB += (targetTint[2] - curTintB) * lerpRate;
      curTintA += (targetTint[3] - curTintA) * lerpRate;

      /* === Sky === */
      const sg = ctx.createLinearGradient(0, 0, 0, groundScreenY);
      sg.addColorStop(0, rgb(curSky[0], curSky[1], curSky[2]));
      sg.addColorStop(1, rgb(curSky[3], curSky[4], curSky[5]));
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, groundScreenY);

      const isDark = t === "evening" || t === "night";

      // Stars / moon / sun
      if (isDark) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        for (let i = 0; i < 80; i++) {
          const sx = (i * 91 + 7) % W;
          const sy = (i * 53) % (groundScreenY - 80);
          const tw = 0.4 + ((Math.sin(animTime * 2 + i) + 1) / 2) * 0.6;
          ctx.globalAlpha = tw;
          ctx.fillRect(sx, sy, 2, 2);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = t === "night" ? "#e8e8ff" : "#ffd2a8";
        ctx.beginPath();
        ctx.arc(W - 110, 80, 22, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = t === "morning" ? "#ffb070" : "#ffe8a8";
        ctx.beginPath();
        ctx.arc(W - 110, 90, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // City glow on horizon
      const glow = ctx.createLinearGradient(0, groundScreenY - 60, 0, groundScreenY);
      glow.addColorStop(0, "rgba(0,0,0,0)");
      glow.addColorStop(1, district === "underground" ? "rgba(90,58,255,0.25)" : "rgba(255,58,138,0.18)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, groundScreenY - 60, W, 60);

      /* === FAR towers (deep parallax) === */
      for (const tw of world.farTowers) {
        const sx = tw.x - camX * 0.15;
        if (sx < -100 || sx > W + 100) continue;
        drawFarTower(sx, groundScreenY, tw, isDark);
      }

      /* === Maglev train rail (deep mid) === */
      drawTrain(world.railY, world.train, W, camX);

      /* === MID towers === */
      for (const tw of world.midTowers) {
        const sx = tw.x - camX * 0.4;
        if (sx < -120 || sx > W + 120) continue;
        drawMidTower(sx, groundScreenY, tw, district, isDark);
      }

      /* === Bridges (mid parallax) === */
      for (const b of world.bridges) {
        const sx = b.x - camX * 0.5;
        if (sx + b.w < -20 || sx > W + 20) continue;
        drawBridge(sx, b.w, b.y, isDark);
      }

      /* === Antennas across roofs === */
      for (const a of world.antennas) {
        const sx = a.x - camX * 0.45;
        if (sx < -10 || sx > W + 10) continue;
        ctx.fillStyle = "rgba(60,232,255,0.5)";
        ctx.fillRect(sx, groundScreenY - 240, 1, a.h);
        // blinking light
        if (Math.sin(animTime * 3 + a.x) > 0.5) {
          ctx.fillStyle = "#ff3a3a";
          ctx.fillRect(sx - 1, groundScreenY - 240 - 2, 3, 3);
        }
      }

      /* === Service drones (mid parallax) === */
      for (const d of world.drones) {
        const cx = d.cx - camX * 0.6 + Math.cos(animTime * d.speed + d.phase) * d.radius;
        const cy = d.cy + Math.sin(animTime * d.speed + d.phase) * 8;
        if (cx < -20 || cx > W + 20) continue;
        drawServiceDrone(cx, cy, d.kind);
      }

      /* === Billboards (with reactive text) === */
      for (const bb of world.billboards) {
        const sx = bb.x - camX * 0.55;
        if (sx < -160 || sx > W + 160) continue;
        drawBillboard(sx, bb, groundScreenY);
      }

      /* === Flying vehicles === */
      for (const v of world.vehicles) {
        const travel = (animTime * v.speed + v.phase) % (W + 200);
        const vx = v.dir > 0 ? travel - 100 : W - travel + 100;
        const color = NEON_COLORS[v.colorIdx];
        const sz = v.size;
        ctx.fillStyle = "#0a0a18";
        ctx.fillRect(vx, v.y, 22 * sz, 6 * sz);
        ctx.fillRect(vx + 4, v.y - 2, 14 * sz, 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(v.dir > 0 ? vx + 22 * sz : vx - 2, v.y + 1, 2, 4);
        ctx.globalAlpha = 0.25;
        ctx.fillRect(v.dir > 0 ? vx + 24 * sz : vx - 14, v.y + 2, 12, 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(v.dir > 0 ? vx - 14 : vx + 22 * sz, v.y + 2, 14, 2);
        ctx.globalAlpha = 1;
      }

      /* === Steam vents === */
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
      ctx.fillStyle = rgb(curGround[0], curGround[1], curGround[2]);
      ctx.fillRect(0, groundScreenY, W, H - groundScreenY);
      ctx.fillStyle = rgb(curGround[3], curGround[4], curGround[5]);
      ctx.fillRect(0, groundScreenY + 14, W, H - groundScreenY - 14);

      ctx.fillStyle = "rgba(60,232,255,0.05)";
      for (let i = 0; i < W; i += 4) {
        ctx.fillRect(i, groundScreenY + 14 + ((i * 7) % 4), 2, 1);
      }
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      const tileOff = Math.floor(camX) % 32;
      for (let i = -tileOff; i < W; i += 32) {
        ctx.fillRect(i, groundScreenY + 8, 16, 2);
      }

      /* === World layer === */
      ctx.save();
      ctx.translate(-camX, 0);

      // Holographic floating signs
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
        drawLocation(loc, groundScreenY, t, district);
        if (loc.kind !== "lab") drawNPC(loc, groundScreenY, t);
      }

      // Ambient pedestrians
      for (const ped of world.peds) {
        const wx = (animTime * ped.speed * ped.dir + ped.x) % (dayDef.worldW + 200) - 100;
        if (wx < camX - 30 || wx > camX + W + 30) continue;
        drawPedestrian(ped, groundScreenY, p.x);
      }

      // Player shadow
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(p.x - 18, groundScreenY - 3, 36, 3);

      // Player
      const frame = p.walking ? Math.floor(animTime * 8) % WALK_FRAMES : 0;
      drawRobotSprite(p.x, groundScreenY, p.facing, frame, p.bob);

      // Companion drone (in world space)
      drawCompanion(comp.x, comp.y);

      // Expose companion screen-space position for UI bubble anchoring
      if (companionScreenRef) {
        const sx = comp.x - camX;
        companionScreenRef.current.x = sx;
        companionScreenRef.current.y = comp.y + Math.sin(animTime * 2.4) * 2;
        companionScreenRef.current.visible = sx > -40 && sx < W + 40;
      }

      ctx.restore();

      /* === Rain === */
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

      /* === Time-of-day tint === */
      if (curTintA > 0.005) {
        ctx.fillStyle = `rgba(${curTintR|0},${curTintG|0},${curTintB|0},${curTintA.toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Cinematic
      if (cinematicRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);
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
