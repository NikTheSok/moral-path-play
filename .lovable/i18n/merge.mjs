import fs from "fs";

const merged = {};
for (let i = 0; i < 6; i++) {
  const p = `.lovable/i18n/out${i}.json`;
  if (!fs.existsSync(p)) { console.log("missing", p); continue; }
  const obj = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && v.trim() && v !== k) merged[k] = v;
  }
}
const entries = Object.entries(merged).sort((a, b) => a[0].localeCompare(b[0]));
const body = entries.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
fs.writeFileSync(
  "src/game/locales/mk.story.ts",
  `/* Auto-generated Macedonian translations, keyed by the exact English source string. */\nexport const MK_STORY: Record<string, string> = {\n${body}\n};\n`,
);
console.log("entries:", entries.length);
