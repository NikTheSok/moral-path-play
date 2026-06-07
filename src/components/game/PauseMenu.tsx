import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onResume: () => void;
  onMenu: () => void;
}

export function PauseMenu({ open, onResume, onMenu }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-8 w-80 text-center shadow-2xl"
          >
            <h2 className="text-3xl text-display mb-6 text-primary">Paused</h2>
            <div className="space-y-2">
              <button onClick={onResume} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Resume</button>
              <button onClick={onMenu} className="w-full px-4 py-3 rounded-lg border border-border hover:bg-secondary">Quit to Menu</button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">Press Esc to resume</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
