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
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-black border-2 border-cyan-400 p-8 w-80 text-center"
            style={{ boxShadow: "0 0 32px rgba(60,232,255,0.5)" }}
          >
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400" />
            <h2 className="pixel-font text-lg text-cyan-200 mb-6" style={{ textShadow: "0 0 10px rgba(60,232,255,0.6)" }}>▸ PAUSED ◂</h2>
            <div className="space-y-2">
              <button
                onClick={onResume}
                className="w-full pixel-font text-[11px] tracking-widest px-4 py-3 bg-cyan-400 text-black border-2 border-cyan-200 hover:bg-cyan-300"
                style={{ boxShadow: "0 0 14px rgba(60,232,255,0.5)" }}
              >
                ▶ RESUME
              </button>
              <button
                onClick={onMenu}
                className="w-full pixel-font text-[11px] tracking-widest px-4 py-3 border-2 border-pink-400/70 text-pink-300 hover:bg-pink-400/10"
              >
                ◄ QUIT TO MENU
              </button>
            </div>
            <p className="pixel-font text-[9px] text-cyan-400/60 mt-6 tracking-widest">[ESC TO RESUME]</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
