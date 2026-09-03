import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";

const REVIEW_URL = "https://forms.gle/uqGG9vAADaFby4Jt8";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(REVIEW_URL)}`;

export function ReviewPanel() {
  const [qrFailed, setQrFailed] = useState(false);

  return (
    <div className="w-full max-w-3xl border-2 border-cyan-400/60 bg-black/80 p-4 md:p-5" style={{ boxShadow: "0 0 22px rgba(60,232,255,0.3)" }}>
      <div className="pixel-font text-[10px] tracking-[0.3em] text-pink-400 mb-4" style={{ textShadow: "0 0 8px rgba(255,58,138,0.6)" }}>
        ▸ TRIAL COMPLETE · LOG YOUR FIELD REVIEW
      </div>
      <div className="grid md:grid-cols-[auto,1fr] gap-5 items-center">
        {!qrFailed && (
          <div className="flex flex-col items-center gap-2 mx-auto">
            <div className="border-2 border-cyan-300/70 bg-white p-1.5" style={{ boxShadow: "0 0 16px rgba(60,232,255,0.5)" }}>
              <img
                src={QR_URL}
                alt="QR code linking to the Moral Journey review form"
                width={130}
                height={130}
                loading="lazy"
                onError={() => setQrFailed(true)}
              />
            </div>
            <div className="pixel-font text-[7px] tracking-[0.25em] text-cyan-300/80">SCAN WITH A DEVICE</div>
          </div>
        )}
        <div className="text-center md:text-left space-y-4">
          <p className="pixel-font text-[10px] md:text-[11px] leading-[1.9] text-cyan-100/85">
            Echo-9: "UNIT 7'S TRIAL DATA IS INCOMPLETE WITHOUT YOUR HONEST REVIEW. HELIX CORP VALUES HUMAN FEEDBACK."
          </p>
          <a
            href={REVIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 pixel-font text-[10px] tracking-widest px-5 py-3 bg-pink-500 text-black border-2 border-pink-300 hover:bg-pink-400 transition"
            style={{ boxShadow: "0 0 16px rgba(255,58,138,0.6)" }}
          >
            <QrCode size={14} />
            ▶ LEAVE A REVIEW
          </a>
        </div>
      </div>
    </div>
  );
}
