import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moral Journey — An Educational Narrative Game" },
      { name: "description", content: "A small indie game about empathy, honesty, and the quiet choices that shape who you are." },
      { property: "og:title", content: "Moral Journey" },
      { property: "og:description", content: "One day. Seven places. A hundred small decisions." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Game />;
}
