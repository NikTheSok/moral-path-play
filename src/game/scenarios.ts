import type { LocationDef, Scenario } from "./types";

export const WORLD_W = 2400;
export const WORLD_H = 1600;

export const LOCATIONS: LocationDef[] = [
  { id: "home",         name: "Home",          x: 300,  y: 1300, color: "var(--primary)",       emoji: "🏠" },
  { id: "busStop",      name: "Bus Stop",      x: 700,  y: 1100, color: "var(--honesty)",       emoji: "🚏" },
  { id: "school",       name: "School",        x: 1200, y: 700,  color: "var(--responsibility)", emoji: "🏫" },
  { id: "park",         name: "Park",          x: 1800, y: 1100, color: "var(--empathy)",       emoji: "🌳" },
  { id: "store",        name: "Store",         x: 2050, y: 500,  color: "var(--courage)",       emoji: "🏪" },
  { id: "cafe",         name: "Café",          x: 900,  y: 400,  color: "var(--accent)",        emoji: "☕" },
  { id: "streetCorner", name: "Street Corner", x: 1500, y: 1300, color: "var(--selfishness)",   emoji: "🚦" },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "morning-coffee",
    location: "cafe",
    time: "morning",
    title: "The Forgotten Wallet",
    npc: "Stranger",
    npcEmoji: "🧑",
    prompt: "Someone leaves a thick wallet on the café counter and rushes out. No one else noticed.",
    choices: [
      { label: "Run after them and return it", effects: { honesty: 2, empathy: 1, courage: 1 }, response: "They tear up with gratitude." },
      { label: "Take it to the barista", effects: { honesty: 1, responsibility: 1 }, response: "The barista nods. 'I'll keep it safe.'" },
      { label: "Pocket it quietly", effects: { selfishness: 2, honesty: -2 }, response: "A heavy feeling settles in your chest." },
    ],
  },
  {
    id: "bus-elderly",
    location: "busStop",
    time: "morning",
    title: "A Tired Stranger",
    npc: "Elderly Man",
    npcEmoji: "👴",
    prompt: "An elderly man stands shaking at the bus stop. There's one seat left on the bench — you got there first.",
    choices: [
      { label: "Offer him your seat", effects: { empathy: 2, responsibility: 1 }, response: "'You're a kind one,' he smiles." },
      { label: "Pretend not to notice", effects: { selfishness: 1, empathy: -1 }, response: "He sighs and leans on his cane." },
      { label: "Ask if he needs help standing", effects: { empathy: 1 }, response: "'I'll manage, but thank you for asking.'" },
    ],
  },
  {
    id: "school-cheat",
    location: "school",
    time: "morning",
    title: "The Quiet Test",
    npc: "Classmate",
    npcEmoji: "🧑‍🎓",
    prompt: "A friend leans over: 'Just let me see one answer. I'll fail otherwise.'",
    choices: [
      { label: "Refuse politely", effects: { honesty: 2, courage: 1 }, response: "They look hurt but nod." },
      { label: "Let them copy", effects: { honesty: -2, empathy: 1 }, response: "You feel uneasy as they scribble." },
      { label: "Offer to tutor them after class", effects: { empathy: 2, responsibility: 2 }, response: "'You'd really do that?' Relief floods their face." },
    ],
  },
  {
    id: "park-homeless",
    location: "park",
    time: "morning",
    title: "Cold Hands",
    npc: "Homeless Woman",
    npcEmoji: "🧕",
    prompt: "A woman sits on a bench, asking quietly for spare change. You have a warm sandwich in your bag.",
    choices: [
      { label: "Share your sandwich", effects: { empathy: 3 }, response: "She eats slowly, savoring every bite." },
      { label: "Give a few coins", effects: { empathy: 1, responsibility: 1 }, response: "'Bless you,' she whispers." },
      { label: "Walk past quickly", effects: { selfishness: 2, empathy: -1 }, response: "You feel her eyes follow you." },
    ],
  },
  {
    id: "street-bully",
    location: "streetCorner",
    time: "afternoon",
    title: "Standing Ground",
    npc: "Bullied Kid",
    npcEmoji: "🧒",
    prompt: "Two teenagers are shoving a smaller kid against a wall, laughing.",
    choices: [
      { label: "Step in and tell them to stop", effects: { courage: 3, empathy: 2 }, response: "They glare, but back off." },
      { label: "Call for help loudly", effects: { courage: 1, responsibility: 2 }, response: "Adults turn. The bullies scatter." },
      { label: "Keep walking. Not your problem.", effects: { selfishness: 2, courage: -2 }, response: "The kid's cry follows you down the street." },
    ],
  },
  {
    id: "store-change",
    location: "store",
    time: "afternoon",
    title: "Too Much Change",
    npc: "Cashier",
    npcEmoji: "🧑‍💼",
    prompt: "The cashier hands you twenty extra. They look exhausted and didn't notice.",
    choices: [
      { label: "Return it", effects: { honesty: 2 }, response: "'Oh — thank you. I would've had to cover it.'" },
      { label: "Keep it. Their mistake.", effects: { honesty: -2, selfishness: 2 }, response: "You pocket the bill and leave fast." },
      { label: "Round up — give back ten", effects: { honesty: -1 }, response: "A compromise that doesn't quite feel right." },
    ],
  },
  {
    id: "cafe-friend",
    location: "cafe",
    time: "afternoon",
    title: "A Friend in Pieces",
    npc: "Best Friend",
    npcEmoji: "🧑‍🤝‍🧑",
    prompt: "Your friend calls in tears. They want to meet right now. You had plans you were looking forward to.",
    choices: [
      { label: "Drop everything and go", effects: { empathy: 3, responsibility: 1 }, response: "They collapse into your arms when you arrive." },
      { label: "Suggest tomorrow instead", effects: { empathy: -1, selfishness: 1 }, response: "They go quiet. 'Yeah. Okay.'" },
      { label: "Invite them to join your plans", effects: { empathy: 1 }, response: "They appreciate the offer but say they need quiet." },
    ],
  },
  {
    id: "park-lie",
    location: "park",
    time: "evening",
    title: "The Broken Vase",
    npc: "Stranger's Child",
    npcEmoji: "🧒",
    prompt: "A child accidentally breaks a stranger's plant pot. They beg you not to tell. The owner is walking over.",
    choices: [
      { label: "Tell the truth gently", effects: { honesty: 2, courage: 1 }, response: "The owner sighs, but accepts the apology." },
      { label: "Lie — say a dog did it", effects: { honesty: -2, empathy: 1 }, response: "The child looks relieved. The owner looks suspicious." },
      { label: "Pay for it yourself", effects: { responsibility: 2, empathy: 1 }, response: "'You didn't have to do that,' the owner says, softening." },
    ],
  },
  {
    id: "school-blame",
    location: "school",
    time: "evening",
    title: "Whose Fault?",
    npc: "Teacher",
    npcEmoji: "👩‍🏫",
    prompt: "Your group project failed. The teacher asks who didn't do their part. It was mostly you.",
    choices: [
      { label: "Admit it was you", effects: { honesty: 2, responsibility: 3, courage: 2 }, response: "She nods, respect in her eyes." },
      { label: "Blame the quietest member", effects: { honesty: -3, selfishness: 3 }, response: "They stare at the floor, silent." },
      { label: "Say everyone struggled equally", effects: { honesty: -1, responsibility: -1 }, response: "She doesn't seem convinced." },
    ],
  },
  {
    id: "home-promise",
    location: "home",
    time: "evening",
    title: "The Promise",
    npc: "Younger Sibling",
    npcEmoji: "🧒",
    prompt: "You promised to help your sibling with homework, but you're exhausted and just want to sleep.",
    choices: [
      { label: "Keep your promise", effects: { responsibility: 3, empathy: 2 }, response: "Their face lights up. 'You're the best.'" },
      { label: "Help for 15 minutes only", effects: { responsibility: 1, empathy: 1 }, response: "A fair compromise. They get the worst part done." },
      { label: "Tell them tomorrow", effects: { responsibility: -2, selfishness: 1 }, response: "'You said that yesterday too.'" },
    ],
  },
];

export function scenarioFor(loc: import("./types").LocationId, time: import("./types").TimePeriod) {
  return SCENARIOS.find((s) => s.location === loc && s.time === time);
}
