import type { DayDef, DayNumber, Scenario, TimePeriod } from "./types";

export const GROUND_Y = 460;

/* ================================================================== */
/*  5-day futuristic structure — unchanged                              */
/* ================================================================== */

export const DAYS: Record<DayNumber, DayDef> = {
  1: {
    day: 1, title: "Empathy",
    brief: "Boot sequence complete. Learn to listen to the people of the neon districts.",
    worldW: 5200,
    locations: [
      { id: "lab1-start", name: "Charging Bay 7", x: 350,  kind: "lab",     day: 1 },
      { id: "alley1",     name: "Neon Park",       x: 1450, kind: "plaza",   day: 1 },
      { id: "market1",    name: "Fountain Court",  x: 2700, kind: "market",  day: 1 },
      { id: "subway1",    name: "Bench Plaza",     x: 3900, kind: "plaza",   day: 1 },
      { id: "lab1-end",   name: "Charging Bay 7",  x: 4900, kind: "lab",     day: 1 },
    ],
  },
  2: {
    day: 2, title: "Responsibility",
    brief: "Take care of the shared city — clean it, fix it, keep it in order.",
    worldW: 5400,
    locations: [
      { id: "lab2-start", name: "Charging Bay 7", x: 350,  kind: "lab",       day: 2 },
      { id: "checkpoint2", name: "Festival Plaza", x: 1500, kind: "plaza",    day: 2 },
      { id: "plaza2",     name: "Bike Court",     x: 2800, kind: "plaza",     day: 2 },
      { id: "apt2",       name: "Community Library", x: 4100, kind: "apartment", day: 2 },
      { id: "lab2-end",   name: "Charging Bay 7", x: 5100, kind: "lab",       day: 2 },
    ],
  },
  3: {
    day: 3, title: "Honesty",
    brief: "Check the facts. Don't accuse anyone without evidence.",
    worldW: 5600,
    locations: [
      { id: "lab3-start", name: "Charging Bay 7", x: 350,  kind: "lab",         day: 3 },
      { id: "underground3", name: "Bench Park",    x: 1600, kind: "plaza",      day: 3 },
      { id: "alley3",     name: "School Yard",     x: 2900, kind: "alley",      day: 3 },
      { id: "industrial3", name: "Window Alley",   x: 4200, kind: "industrial", day: 3 },
      { id: "lab3-end",   name: "Charging Bay 7", x: 5300, kind: "lab",         day: 3 },
    ],
  },
  4: {
    day: 4, title: "Fairness",
    brief: "Make sure everyone gets what they need — and that nobody is left out.",
    worldW: 5500,
    locations: [
      { id: "lab4-start", name: "Charging Bay 7", x: 350,  kind: "lab",     day: 4 },
      { id: "rooftop4",   name: "Swings Corner",  x: 1550, kind: "plaza",   day: 4 },
      { id: "plaza4",     name: "Snack Table",    x: 2800, kind: "plaza",   day: 4 },
      { id: "subway4",    name: "Charging Row",   x: 4050, kind: "subway",  day: 4 },
      { id: "lab4-end",   name: "Charging Bay 7", x: 5200, kind: "lab",     day: 4 },
    ],
  },
  5: {
    day: 5, title: "Courage",
    brief: "Do the hard thing. Ask for help when you need it. Celebrate together.",
    worldW: 5600,
    locations: [
      { id: "lab5-start", name: "Charging Bay 7", x: 350,  kind: "lab",         day: 5 },
      { id: "alley5",     name: "Broken Bridge",  x: 1500, kind: "alley",       day: 5 },
      { id: "apt5",       name: "Blocked Road",   x: 2700, kind: "apartment",   day: 5 },
      { id: "industrial5", name: "The Gathering", x: 4000, kind: "industrial",  day: 5 },
      { id: "lab5-end",   name: "Charging Bay 7 — Final", x: 5300, kind: "lab", day: 5 },
    ],
  },
};

export function timeForLocation(day: DayNumber, locationId: string): TimePeriod {
  const locs = DAYS[day].locations;
  const idx = locs.findIndex((l) => l.id === locationId);
  if (idx <= 0) return "morning";
  if (idx === 1) return "morning";
  if (idx === 2) return "afternoon";
  if (idx === 3) return "evening";
  return "night";
}

/* ================================================================== */
/*  Scenarios — short, warm epilogue after each Learning Challenge     */
/*  The Investigation layer owns gameplay + morality via badges.       */
/*  These stages give NPCs a chance to explain WHY it mattered.        */
/* ================================================================== */

/** Small helper: create a "warm epilogue" scenario shell. */
function epilogue(
  id: string, day: DayNumber, locationId: string, time: TimePeriod,
  title: string, npc: string, npcEmoji: string,
  openLine: string,
  choices: { label: string; effects: Partial<Record<"empathy"|"honesty"|"responsibility"|"courage"|"selfishness", number>>; reply: string }[]
): Scenario {
  return {
    id, day, locationId, time, title, npc, npcEmoji,
    startStage: "s1",
    stages: {
      s1: {
        npc: openLine,
        choices: choices.map((c) => ({ label: c.label, effects: c.effects, reply: c.reply })),
      },
    },
  };
}

export const SCENARIOS: Scenario[] = [
  /* ============ DAY 1 · EMPATHY ============ */
  epilogue(
    "d1-damaged-bot", 1, "alley1", "morning",
    "The Toy Dispute", "Mira, Sam & Lin", "🧒",
    "*The three kids look at each other, then at the little robot toy in your hand.* Mira: 'I'm sorry, Sam. I really thought it was you.' Sam: 'It's okay. You were just scared.'",
    [
      { label: "'You listened to each other. That's what matters.'", effects: { empathy: 3 }, reply: "They all nod solemnly. Lin: 'We'll ask questions first next time. Promise.'" },
      { label: "'Nobody was wrong. You just didn't have the whole story yet.'", effects: { empathy: 3, honesty: 1 }, reply: "Mira looks up at you: 'Thanks, robot. You're kind of great.'" },
      { label: "Kneel down and hand the toy to Mira", effects: { empathy: 2, responsibility: 1 }, reply: "She hugs it. Then, unexpectedly, she hugs you." },
    ],
  ),
  epilogue(
    "d1-market-discrim", 1, "market1", "afternoon",
    "Pip Comes Home", "Pip's Owner", "🧑‍🎨",
    "*The cafe owner cradles Pip, tears streaming.* 'You could have walked past. Most people did. Thank you — for helping something small.'",
    [
      { label: "'Pip was scared. It didn't matter that they were small.'", effects: { empathy: 3 }, reply: "'That's exactly it. Some folks think kindness only counts if it's for people. It counts for everyone.'" },
      { label: "'I'm glad they're safe.'", effects: { empathy: 2, responsibility: 1 }, reply: "They smile, wipe their eyes: 'Come back for coffee anytime. On the house.'" },
    ],
  ),
  epilogue(
    "d1-subway-fare", 1, "subway1", "evening",
    "Small Comforts", "Elderly Citizen", "🧓",
    "*They wrap their hands around the warm cup and exhale.* 'You know what nobody teaches young ones? That noticing is the whole thing. You noticed I was cold. You noticed I was tired. Thank you, dear.'",
    [
      { label: "'It wasn't much.'", effects: { empathy: 2, honesty: 1 }, reply: "'It was everything. Little things are big things when you have very little.'" },
      { label: "Sit beside them a while", effects: { empathy: 3, responsibility: 2 }, reply: "They rest their hand gently on yours. Neither of you speak. It's enough." },
    ],
  ),

  /* ============ DAY 2 · RESPONSIBILITY ============ */
  epilogue(
    "d2-checkpoint", 2, "checkpoint2", "morning",
    "After the Festival", "Sanitation Worker", "🧑‍🔧",
    "*The worker leans on their broom, grinning.* 'That's the fastest cleanup I've ever seen. And you sorted it RIGHT. Nothing going to landfill today.'",
    [
      { label: "'Recycling only works if we sort it properly.'", effects: { responsibility: 3, honesty: 1 }, reply: "'Preach it. Most folks don't bother. You do — that's how habits spread.'" },
      { label: "'I'd want someone else to do it for my neighborhood.'", effects: { responsibility: 3, empathy: 1 }, reply: "'That's the trick, isn't it? Take care of shared places like they're your own.'" },
    ],
  ),
  epilogue(
    "d2-corp-plaza", 2, "plaza2", "afternoon",
    "Back on the Bike", "The Kid", "🧒",
    "*The kid pedals a lazy circle around you, hair flying.* 'You did it PROPERLY. My dad always says shortcuts break twice as fast.'",
    [
      { label: "'Your dad sounds smart.'", effects: { responsibility: 3, honesty: 1 }, reply: "'He is. I'll tell him a robot fixed my bike better than he could. He'll laugh.'" },
      { label: "'If I know how to help, I should. Simple as that.'", effects: { responsibility: 3, empathy: 2 }, reply: "The kid solemnly offers a fist-bump. You match it. Tiny metal knuckles meet tiny human knuckles." },
    ],
  ),
  epilogue(
    "d2-apartment", 2, "apt2", "evening",
    "The Library Is Open", "Librarian", "🧑‍🏫",
    "*The librarian surveys the tidy shelves and lets out a long, relieved breath.* 'You just made sure a hundred kids get to read tomorrow. That's not small.'",
    [
      { label: "'It was just sorting. It matters.'", effects: { responsibility: 3, honesty: 2 }, reply: "'Quiet care runs the world. Nobody notices — until it stops.'" },
      { label: "'Anytime you need help — call.'", effects: { responsibility: 3, empathy: 2 }, reply: "'I might take you up on that. There are worse things than a robot friend.'" },
    ],
  ),

  /* ============ DAY 3 · HONESTY ============ */
  epilogue(
    "d3-cyber-homeless", 3, "underground3", "morning",
    "The Wallet Was Never Stolen", "The Owner", "😌",
    "*The owner holds the wallet, still stunned.* 'I was about to shout at those three people. I would have. And I would have been wrong.'",
    [
      { label: "'Check before you accuse. Always.'", effects: { honesty: 3, responsibility: 1 }, reply: "'I'm going to apologize to them just for THINKING it. That much I owe.'" },
      { label: "'Being wrong is fine. Refusing to check first isn't.'", effects: { honesty: 3, courage: 1 }, reply: "They nod slowly, then walk toward the group, hand extended." },
    ],
  ),
  epilogue(
    "d3-malfunction", 3, "alley3", "afternoon",
    "Right Notebook, Right Hands", "Both Students", "🧑‍🎓",
    "*The worried student exhales like they've held their breath all morning.* 'I could've kept quiet. Nobody would've known. But it would've felt awful forever.'",
    [
      { label: "'Owning a mistake is harder than hiding it. It's also lighter.'", effects: { honesty: 3, courage: 2 }, reply: "'Yeah. I feel lighter already. Weird.'" },
      { label: "'You told the truth. That's the whole thing.'", effects: { honesty: 3, empathy: 1 }, reply: "The star-doodle student joins in: 'And you didn't have to help us. But you did. Thanks.'" },
    ],
  ),
  epilogue(
    "d3-alley3", 3, "industrial3", "evening",
    "The Wind, Not the Kid", "The Accused Kid", "🧒",
    "*The crowd has dispersed. The kid stares at the ground, then at you.* 'Nobody was going to check. They already had their answer. You checked.'",
    [
      { label: "'A crowd being certain isn't the same as being right.'", effects: { honesty: 3, courage: 2 }, reply: "'I'm going to remember that. If it happens to somebody else, I'll be the one who checks.'" },
      { label: "'The evidence spoke for you. That's how it should work.'", effects: { honesty: 3, responsibility: 1 }, reply: "'Thanks. Seriously. I couldn't have proved it alone.'" },
    ],
  ),

  /* ============ DAY 4 · FAIRNESS ============ */
  epilogue(
    "d4-rooftop", 4, "rooftop4", "morning",
    "Everyone Gets a Turn", "The Swings Kids", "🎡",
    "*Three minutes each, five kids, nobody arguing. Aya swings first and shouts: 'FAIRNESS!' Everyone laughs.*",
    [
      { label: "'Rules are kinder when they're fair.'", effects: { empathy: 2, responsibility: 2, honesty: 1 }, reply: "Eli, waiting last: 'I don't even mind. I know my turn's coming.'" },
      { label: "'When rules are clear, nobody has to fight.'", effects: { responsibility: 2, courage: 1, empathy: 1 }, reply: "'You should come play with us,' Cai says. 'You're good at this.'" },
    ],
  ),
  epilogue(
    "d4-data-plaza", 4, "plaza4", "afternoon",
    "Three Muffins Each", "The Kids", "🧁",
    "*Each kid holds three muffins. Nobody checks their neighbor's hands. Ana: 'I didn't even wonder if someone got more. That's cool.'*",
    [
      { label: "'When it's fair, you don't have to worry.'", effects: { empathy: 2, responsibility: 2 }, reply: "Dax nods, mouth full: 'That's a good rule, actually.'" },
      { label: "'Sharing equally is the simplest kind of fair.'", effects: { responsibility: 2, honesty: 2 }, reply: "'Grown-ups should try it more,' Bo mutters. Everyone giggles." },
    ],
  ),
  epilogue(
    "d4-subway4", 4, "subway4", "evening",
    "Whoever Needs It Most", "Charging Bay Attendant", "🤖",
    "*Unit-5, freshly charged, wobbles upright.* Attendant: 'Some folks would've just gone by ticket number. You looked at who was hurting.'",
    [
      { label: "'Fair isn't always equal. Sometimes it's proportional to need.'", effects: { empathy: 3, responsibility: 2, honesty: 1 }, reply: "'Write that down. I want it on the wall.'" },
      { label: "'The 70% unit could wait. The 5% couldn't.'", effects: { responsibility: 3, honesty: 1 }, reply: "Unit-70, from the back: 'And I'm grateful you saw the difference.'" },
    ],
  ),

  /* ============ DAY 5 · COURAGE ============ */
  epilogue(
    "d5-rain-alley", 5, "alley5", "morning",
    "Across Together", "The Child", "🧒",
    "*Halfway across, the kid stops, looks down at the water, then at you, then keeps walking.* 'I was so scared. But I'm not scared anymore.'",
    [
      { label: "'You did the hard part. I just held your hand.'", effects: { courage: 3, empathy: 2 }, reply: "'You did more than that. Thanks, robot.'" },
      { label: "'Courage is easier when someone builds a path with you.'", effects: { courage: 3, responsibility: 2 }, reply: "They squeeze your hand tight. Neither of you lets go until the other side." },
    ],
  ),
  epilogue(
    "d5-apt5", 5, "apt5", "afternoon",
    "We Moved It Together", "The Recruited Robots", "🤖",
    "*The four of you catch your breath. Loader-04 offers a metallic high-five.* 'The hardest part wasn't the crate. It was you asking.'",
    [
      { label: "'Asking felt like admitting weakness.'", effects: { courage: 3, honesty: 3 }, reply: "'Asking is strength. Nobody moves anything real alone.'" },
      { label: "'Thanks for coming. I mean it.'", effects: { courage: 2, empathy: 3, responsibility: 1 }, reply: "Runner-11: 'Any time. Include us more.'" },
    ],
  ),
  epilogue(
    "d5-reactor", 5, "industrial5", "evening",
    "The Gathering", "Everyone", "❤️‍🔥",
    "*The crowd hushes. Every face you helped this week is here — waiting to see what you'll say.*",
    [
      { label: "'I'm not human. But I chose the same things you choose.'", effects: { empathy: 3, honesty: 3, responsibility: 3, courage: 3 }, reply: "A long, warm silence. Then applause — soft at first, then loud, then loud enough that the whole plaza turns to watch." },
      { label: "'Thank you for teaching me.'", effects: { empathy: 3, courage: 3, responsibility: 2 }, reply: "The elder steps forward and takes your hand. 'No, sweetheart. Thank YOU for choosing to learn.'" },
    ],
  ),
];

/** Find an active scenario for the given day + location + time. */
export function scenarioFor(day: DayNumber, locationId: string, time: TimePeriod): Scenario | undefined {
  return SCENARIOS.find((s) => s.day === day && s.locationId === locationId && s.time === time);
}
