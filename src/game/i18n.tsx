import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MK } from "./locales/mk";

export type Lang = "en" | "mk";

const STORAGE_KEY = "moral-journey-lang";

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Translate an English source string (falls back to the original). */
  t: (en: string) => string;
}

const Ctx = createContext<I18n | null>(null);

/* Decorations that wrap UI strings (arrows, bullets, brackets). */
const LEAD = /^[\s▸▶◄◂◃►·•\-–—\[\(\/>]+/;
const TRAIL = /[\s▸▶◄◂◃►·•\-–—\]\)\/<]+$/;

/** Look a string up in the MK map, tolerating decorative prefixes/suffixes and case. */
export function translateString(src: string, dict: Record<string, string>): string | null {
  const raw = src;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const tryKey = (k: string): string | undefined => {
    if (dict[k] !== undefined) return dict[k];
    const upper = dict[k.toUpperCase()];
    if (upper !== undefined) return upper;
    const lower = dict[k.toLowerCase()];
    if (lower !== undefined) return lower;
    // case-insensitive fallback via a lazily built index
    const idx = ciIndex(dict);
    return idx[k.toLowerCase()];
  };

  const direct = tryKey(trimmed);
  if (direct !== undefined) {
    return raw.replace(trimmed, direct);
  }

  const lead = (trimmed.match(LEAD)?.[0] ?? "");
  const trail = (trimmed.match(TRAIL)?.[0] ?? "");
  const core = trimmed.slice(lead.length, trimmed.length - trail.length);
  if (!core || core === trimmed) return null;
  const hit = tryKey(core);
  if (hit === undefined) return null;
  return raw.replace(trimmed, `${lead}${hit}${trail}`);
}

let CI_CACHE: { dict: Record<string, string>; idx: Record<string, string> } | null = null;
function ciIndex(dict: Record<string, string>) {
  if (CI_CACHE && CI_CACHE.dict === dict) return CI_CACHE.idx;
  const idx: Record<string, string> = {};
  for (const [k, v] of Object.entries(dict)) idx[k.toLowerCase()] = v;
  CI_CACHE = { dict, idx };
  return idx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "mk" || saved === "en") setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => setLang(lang === "en" ? "mk" : "en"), [lang, setLang]);

  const t = useCallback(
    (en: string) => {
      if (lang !== "mk" || !en) return en;
      return translateString(en, MK) ?? en;
    },
    [lang],
  );

  const value = useMemo<I18n>(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const NOOP: I18n = { lang: "en", setLang: () => {}, toggle: () => {}, t: (s) => s };

export function useI18n(): I18n {
  return useContext(Ctx) ?? NOOP;
}

/** Convenience: just the translate function. */
export function useT() {
  return useI18n().t;
}
