import { motion } from "framer-motion";
import { upgradeOffer, type Upgrade } from "@/game/progression";

interface Props {
  day: number;
  owned: string[];
  onPick: (id: string) => void;
}

/** One free module upgrade between days — a permanent, chosen reward. */
export function UpgradeChoice({ day, owned, onPick }: Props) {
  const offer: Upgrade[] = upgradeOffer(day, owned);
  const alreadyPicked = owned.length >= day; // one pick per completed day

  if (offer.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.75 }}
      className="mt-4 w-full max-w-md border-2 border-pink-400/50 bg-black/70 p-3"
      style={{ boxShadow: "0 0 16px rgba(255,58,138,0.25)" }}
    >
      <div className="pixel-font text-[9px] tracking-widest text-pink-400/90 mb-2">
        ▸ MODULE INSTALL {alreadyPicked ? "· COMPLETE" : "· CHOOSE ONE"}
      </div>

      {alreadyPicked ? (
        <div className="space-y-1">
          {owned.map((id) => {
            const u = offer.find((o) => o.id === id);
            return (
              <div key={id} className="pixel-font text-[9px] text-green-300">
                ✓ {(u?.name ?? id).toUpperCase()}
              </div>
            );
          })}
          <div className="pixel-font text-[9px] text-cyan-300/60 leading-relaxed">
            Installed modules are listed in your field manual.
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {offer.map((u) => (
            <button
              key={u.id}
              onClick={() => onPick(u.id)}
              className="text-left flex gap-3 items-start border-2 border-cyan-400/50 bg-black/60 p-2 hover:bg-cyan-400/10 hover:border-cyan-300 transition"
            >
              <span className="text-xl leading-none">{u.icon}</span>
              <span className="min-w-0">
                <span className="block pixel-font text-[10px] text-cyan-100">{u.name}</span>
                <span className="block pixel-font text-[9px] text-cyan-300/70 leading-[1.7]">{u.effect}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
