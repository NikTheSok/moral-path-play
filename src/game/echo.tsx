import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type EchoTone = "good" | "bad" | "warn" | "neutral";

export interface EchoMessage {
  id: number;
  text: string;
  tone: EchoTone;
}

interface EchoBus {
  /** Make Echo-9 say something. Later messages replace earlier ones. */
  say: (text: string, tone?: EchoTone, ttl?: number) => void;
  /** Silence the drone immediately. */
  hush: () => void;
  current: EchoMessage | null;
}

const EchoContext = createContext<EchoBus | null>(null);

const DEFAULT_TTL: Record<EchoTone, number> = {
  good: 4200,
  bad: 5200,
  warn: 5000,
  neutral: 4600,
};

/** Small flavour pools so the drone never repeats itself twice in a row. */
const POOLS: Record<"praise" | "scold" | "nudge", string[]> = {
  praise: [
    "Clean read. I logged that one as a good one.",
    "That tracked with the evidence. Nice.",
    "See? You're getting better at people than I am.",
    "Confidence rising. Mine, in you.",
  ],
  scold: [
    "That one stung. Shake it off — we adapt.",
    "Wrong branch. Don't spiral, just re-read what they told you.",
    "Noted, and not fatal. Slow down on the next call.",
    "Ouch. I felt that in my rotor housing.",
  ],
  nudge: [
    "Take your time. The facts are already in your buffer.",
    "Look at what they *asked* for, not what's convenient.",
    "One more pass over the evidence before you commit.",
  ],
};

export function pickEchoLine(kind: keyof typeof POOLS, seed = Math.random()) {
  const pool = POOLS[kind];
  return pool[Math.floor(seed * pool.length) % pool.length];
}

export function EchoProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<EchoMessage | null>(null);
  const idRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const hush = useCallback(() => {
    clearTimer();
    setCurrent(null);
  }, []);

  const say = useCallback((text: string, tone: EchoTone = "neutral", ttl?: number) => {
    if (!text) return;
    clearTimer();
    const id = ++idRef.current;
    setCurrent({ id, text, tone });
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setCurrent((c) => (c && c.id === id ? null : c));
    }, ttl ?? DEFAULT_TTL[tone]);
  }, []);

  useEffect(() => clearTimer, []);

  const value = useMemo<EchoBus>(() => ({ say, hush, current }), [say, hush, current]);
  return <EchoContext.Provider value={value}>{children}</EchoContext.Provider>;
}

/** Safe outside the provider — falls back to a no-op bus. */
export function useEcho(): EchoBus {
  const ctx = useContext(EchoContext);
  return ctx ?? NOOP;
}

const NOOP: EchoBus = { say: () => {}, hush: () => {}, current: null };
