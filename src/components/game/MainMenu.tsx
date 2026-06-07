import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
  onInstructions: () => void;
}

export function MainMenu({ onStart, onInstructions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
    >
      {/* ambient particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/60 particle"
            style={{
              left: `${(i * 37) % 100}%`,
              bottom: 0,
              animationDelay: `${(i * 0.7) % 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center max-w-md px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-4">An educational game</div>
          <h1 className="text-display text-6xl md:text-7xl font-light text-foreground leading-none">
            Moral<br/>
            <span className="italic text-primary">Journey</span>
          </h1>
          <p className="text-muted-foreground mt-6 text-sm md:text-base leading-relaxed italic">
            One ordinary day. Seven places. A hundred small decisions that quietly shape who you are.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 space-y-3"
        >
          <button
            onClick={onStart}
            className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(220,180,120,0.3)]"
          >
            Begin the Day
          </button>
          <button
            onClick={onInstructions}
            className="w-full px-6 py-3 border border-border text-foreground/80 rounded-lg hover:bg-secondary transition-colors"
          >
            How to Play
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-xs text-muted-foreground/70"
        >
          What kind of person will you be today?
        </motion.div>
      </div>
    </motion.div>
  );
}
