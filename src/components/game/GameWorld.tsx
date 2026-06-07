import { useEffect, useRef, useState } from "react";
import { LOCATIONS, WORLD_H, WORLD_W } from "@/game/scenarios";
import type { LocationId, TimePeriod } from "@/game/types";

interface Props {
  time: TimePeriod;
  paused: boolean;
  onEnterLocation: (id: LocationId) => void;
  blockInput: boolean;
}

const SPEED = 260; // px/sec
const TRIGGER_RADIUS = 80;

const timeTint: Record<TimePeriod, string> = {
  morning: "rgba(255, 200, 140, 0.05)",
  afternoon: "rgba(255, 230, 180, 0.0)",
  evening: "rgba(40, 30, 90, 0.28)",
};

const skyColor: Record<TimePeriod, string> = {
  morning: "#3d3220",
  afternoon: "#2a2418",
  evening: "#1a1730",
};

export function GameWorld({ time, paused, onEnterLocation, blockInput }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({ x: 320, y: 1320 });
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
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
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
    };
    resize();
    window.addEventListener("resize", resize);

    // Pre-generate ambient particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * WORLD_W,
      y: Math.random() * WORLD_H,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 8 + 4),
      vx: (Math.random() - 0.5) * 4,
      a: Math.random() * 0.5 + 0.2,
    }));

    // Pre-place trees
    const trees = Array.from({ length: 60 }, (_, i) => ({
      x: (i * 137) % WORLD_W,
      y: ((i * 211) % (WORLD_H - 100)) + 50,
      s: 0.7 + ((i * 13) % 10) / 20,
    }));

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      animTime += dt;

      if (!pausedRef.current && !blockRef.current) {
        let dx = 0, dy = 0;
        const k = keysRef.current;
        if (k.has("w") || k.has("arrowup")) dy -= 1;
        if (k.has("s") || k.has("arrowdown")) dy += 1;
        if (k.has("a") || k.has("arrowleft")) dx -= 1;
        if (k.has("d") || k.has("arrowright")) dx += 1;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
          dx /= len; dy /= len;
          playerRef.current.x = Math.max(40, Math.min(WORLD_W - 40, playerRef.current.x + dx * SPEED * dt));
          playerRef.current.y = Math.max(40, Math.min(WORLD_H - 40, playerRef.current.y + dy * SPEED * dt));
        }

        // Check location proximity
        let near: LocationId | null = null;
        for (const loc of LOCATIONS) {
          const d = Math.hypot(loc.x - playerRef.current.x, loc.y - playerRef.current.y);
          if (d < TRIGGER_RADIUS) { near = loc.id; break; }
        }
        const nearName = near ? LOCATIONS.find(l => l.id === near)!.name : null;
        setNearLocation((prev) => (prev === nearName ? prev : nearName));

        if (near && near !== lastTriggeredRef.current) {
          lastTriggeredRef.current = near;
          onEnterRef.current(near);
        } else if (!near) {
          lastTriggeredRef.current = null;
        }

        // particles
        for (const p of particles) {
          p.y += p.vy * dt;
          p.x += p.vx * dt;
          if (p.y < 0) { p.y = WORLD_H; p.x = Math.random() * WORLD_W; }
        }
      }

      // Render
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const camX = playerRef.current.x - W / 2;
      const camY = playerRef.current.y - H / 2;

      // Sky/ground
      ctx.fillStyle = skyColor[timeRef.current];
      ctx.fillRect(0, 0, W, H);

      // Ground grid
      ctx.save();
      ctx.translate(-camX, -camY);

      // Soft ground gradient circles
      for (let gx = 0; gx < WORLD_W; gx += 200) {
        for (let gy = 0; gy < WORLD_H; gy += 200) {
          const wx = gx, wy = gy;
          if (wx < camX - 200 || wx > camX + W + 200 || wy < camY - 200 || wy > camY + H + 200) continue;
          ctx.fillStyle = (gx + gy) % 400 === 0 ? "rgba(255,255,255,0.012)" : "rgba(255,255,255,0.006)";
          ctx.fillRect(wx, wy, 200, 200);
        }
      }

      // Paths between locations
      ctx.strokeStyle = "rgba(180,150,110,0.12)";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      const path = ["home","busStop","streetCorner","park","school","cafe","store"];
      for (let i = 0; i < path.length - 1; i++) {
        const a = LOCATIONS.find(l => l.id === path[i])!;
        const b = LOCATIONS.find(l => l.id === path[i+1])!;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();

      // Trees
      for (const t of trees) {
        if (t.x < camX - 50 || t.x > camX + W + 50 || t.y < camY - 50 || t.y > camY + H + 50) continue;
        const sway = Math.sin(animTime * 1.5 + t.x) * 1.5;
        ctx.fillStyle = "rgba(20,30,20,0.5)";
        ctx.beginPath();
        ctx.ellipse(t.x + sway, t.y, 14 * t.s, 22 * t.s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(70,90,60,0.85)";
        ctx.beginPath();
        ctx.arc(t.x + sway, t.y - 6, 12 * t.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Locations
      for (const loc of LOCATIONS) {
        if (loc.x < camX - 100 || loc.x > camX + W + 100 || loc.y < camY - 100 || loc.y > camY + H + 100) continue;
        const pulse = 1 + Math.sin(animTime * 2 + loc.x) * 0.04;

        // Glow
        const grad = ctx.createRadialGradient(loc.x, loc.y, 10, loc.x, loc.y, 90);
        grad.addColorStop(0, "rgba(255, 200, 130, 0.25)");
        grad.addColorStop(1, "rgba(255, 200, 130, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(loc.x - 90, loc.y - 90, 180, 180);

        // Building base
        ctx.fillStyle = "rgba(50,42,32,0.95)";
        ctx.fillRect(loc.x - 38 * pulse, loc.y - 38 * pulse, 76 * pulse, 76 * pulse);
        ctx.strokeStyle = "rgba(220,180,120,0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(loc.x - 38 * pulse, loc.y - 38 * pulse, 76 * pulse, 76 * pulse);

        // Window
        ctx.fillStyle = timeRef.current === "evening" ? "rgba(255,210,130,0.9)" : "rgba(255,230,180,0.35)";
        ctx.fillRect(loc.x - 14, loc.y - 14, 28, 28);

        // Emoji icon
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(loc.emoji, loc.x, loc.y);

        // Label
        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "rgba(240,225,200,0.85)";
        ctx.fillText(loc.name, loc.x, loc.y + 58);
      }

      // Particles
      for (const p of particles) {
        if (p.x < camX - 20 || p.x > camX + W + 20 || p.y < camY - 20 || p.y > camY + H + 20) continue;
        ctx.fillStyle = `rgba(255, 220, 160, ${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      const bob = Math.sin(animTime * 6) * 2;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(px, py + 18, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      ctx.fillStyle = "#d8b890";
      ctx.beginPath();
      ctx.arc(px, py + bob, 12, 0, Math.PI * 2);
      ctx.fill();
      // hood/scarf
      ctx.fillStyle = "#a64a3a";
      ctx.fillRect(px - 12, py + bob + 4, 24, 10);
      // face dot
      ctx.fillStyle = "#2a2018";
      ctx.fillRect(px - 4, py + bob - 2, 2, 2);
      ctx.fillRect(px + 2, py + bob - 2, 2, 2);

      ctx.restore();

      // Vignette + time tint
      const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      if (timeRef.current === "evening") {
        ctx.fillStyle = timeTint.evening;
        ctx.fillRect(0, 0, W, H);
      } else if (timeRef.current === "morning") {
        ctx.fillStyle = timeTint.morning;
        ctx.fillRect(0, 0, W, H);
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
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full block" />
      {nearLocation && !blockInput && (
        <div className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 text-sm text-primary/90 bg-background/70 backdrop-blur px-3 py-1.5 rounded-full border border-border">
          {nearLocation}
        </div>
      )}
    </div>
  );
}
