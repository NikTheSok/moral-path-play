import { useI18n } from "@/game/i18n";

interface Props { className?: string; }

/** Small neon EN / MK switch. */
export function LangToggle({ className = "" }: Props) {
  const { lang, setLang } = useI18n();

  const btn = (active: boolean) =>
    `pixel-font text-[10px] tracking-widest px-3 py-2 border-2 transition ${
      active
        ? "bg-cyan-400 text-black border-cyan-200"
        : "bg-black/70 text-cyan-300 border-cyan-400/50 hover:bg-cyan-400/10"
    }`;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} translate="no">
      <button type="button" onClick={() => setLang("en")} className={btn(lang === "en")} aria-pressed={lang === "en"}>
        EN
      </button>
      <button type="button" onClick={() => setLang("mk")} className={btn(lang === "mk")} aria-pressed={lang === "mk"}>
        MK
      </button>
    </div>
  );
}
