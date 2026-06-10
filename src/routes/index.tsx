import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moral Journey — A Futuristic Pixel-Art Narrative Game" },
      { name: "description", content: "Play as an android sent to learn human morality across five days of a neon cyberpunk future." },
      { property: "og:title", content: "Moral Journey" },
      { property: "og:description", content: "Five days. One android. A thousand moral choices in a neon future." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Orbitron:wght@400;600;800&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Game />;
}
