import { useEffect } from "react";
import { MK } from "@/game/locales/mk";
import { translateString, useI18n } from "@/game/i18n";

/**
 * Live UI translation layer.
 *
 * Every rendered text node is looked up in the Macedonian dictionary and swapped
 * in place; switching back to English restores the original text. This keeps the
 * whole game bilingual without threading a translate call through every screen.
 */
export function Translator() {
  const { lang } = useI18n();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const seen = new WeakMap<Text, { src: string; out: string }>();

    const visit = (node: Text) => {
      const value = node.nodeValue;
      if (!value || !value.trim()) return;
      const prev = seen.get(node);

      if (lang === "mk") {
        if (prev && prev.out === value) return; // already translated
        const src = value;
        const out = translateString(src, MK);
        if (out && out !== src) {
          node.nodeValue = out;
          seen.set(node, { src, out });
        }
      } else if (prev && prev.out === value) {
        node.nodeValue = prev.src;
        seen.delete(node);
      }
    };

    const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CANVAS"]);

    const sweep = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        visit(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      if (SKIP.has(el.tagName)) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          n.parentElement && SKIP.has(n.parentElement.tagName)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      });
      let n = walker.nextNode();
      while (n) {
        visit(n as Text);
        n = walker.nextNode();
      }
    };

    sweep(document.body);

    let queued = false;
    const observer = new MutationObserver((records) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        for (const r of records) {
          if (r.type === "characterData") visit(r.target as Text);
          else r.addedNodes.forEach(sweep);
        }
        // Catch anything React re-rendered between frames.
        sweep(document.body);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [lang]);

  return null;
}
