import { UPGRADES } from "@/game/progression";

interface Props {
  upgrades: string[];
}

/** HUD strip showing every installed module so their effects are visible in play. */
export function ModuleStrip({ upgrades }: Props) {
  const owned = UPGRADES.filter((u) => upgrades.includes(u.id));
  if (owned.length === 0) return null;

  return (
    <div
      className="bg-black/80 border-2 border-pink-400/60 px-2 py-1.5 w-56"
      style={{ boxShadow: "0 0 12px rgba(255,58,138,0.3)" }}
    >
      <div className="pixel-font text-[8px] tracking-[0.3em] text-pink-400/90 mb-1">▸ MODULES</div>
      <div className="flex flex-wrap gap-1.5">
        {owned.map((u) => (
          <span
            key={u.id}
            title={`${u.name} — ${u.effect}`}
            className="w-7 h-7 grid place-items-center text-sm border border-cyan-400/60 bg-black/70 cursor-help"
            style={{ boxShadow: "0 0 8px rgba(60,232,255,0.3)" }}
          >
            {u.icon}
          </span>
        ))}
      </div>
    </div>
  );
}
