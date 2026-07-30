/* Investigation & Learning-Challenge layer.
 * Redesigned: gameplay teaches the lesson. Each interaction gates a moral
 * dialogue behind an interactive Learning Challenge and awards a Moral Badge. */

export type InteractableKind = "scan" | "witness" | "prop" | "terminal";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  glyph: string;
  label: string;
  hint: string;
  detail: string;
  yieldsClueId?: string;
  requiresClueId?: string;
}

export interface Clue {
  id: string;
  label: string;
  detail: string;
}

/* ================== Challenge shapes ================== */

export type ChallengeKind =
  | "sequence"
  | "hidden-object"
  | "battery"
  | "circuit"
  | "multi-pick"
  | "sort"
  | "assemble"
  | "order"
  | "celebration";

export interface HiddenObjectItem {
  id: string;
  glyph: string;
  label: string;
  wrongComment?: string;
}

export interface BatteryOption {
  id: string;
  label: string;
  voltage: string;
  wrongComment?: string;
}

export interface CircuitNode {
  id: string;
  label: string;
  group: "A" | "B" | "C";
  side: "L" | "R";
}

/** Pick N correct items from a grid — each pick shows feedback. */
export interface MultiPickItem {
  id: string;
  glyph: string;
  label: string;
  /** Line shown when this item is picked (right OR wrong). */
  comment?: string;
}

/** Drag/click items into the correct bin. */
export interface SortItem {
  id: string;
  glyph: string;
  label: string;
  /** id of the bin this belongs in. */
  binId: string;
  /** Educational note shown on incorrect drop. */
  wrongNote?: string;
}
export interface SortBin {
  id: string;
  label: string;
  color: string; // hex
  hint?: string;
}

/** Place labeled parts into their labeled slots. */
export interface AssemblePart {
  id: string;
  glyph: string;
  label: string;
}
export interface AssembleSlot {
  id: string;
  label: string;
  expectPartId: string;
  /** Fun blurb once filled. */
  filledNote?: string;
}

/** Arrange items into correct sequence (rank low → high). */
export interface OrderItem {
  id: string;
  glyph: string;
  label: string;
  rank: number;
  /** Small caption to justify order (e.g. "5% battery"). */
  caption?: string;
}

/** Cinematic thank-you sequence — no puzzle, just heart. */
export interface CelebrationMoment {
  who: string;
  emoji: string;
  line: string;
}

export interface Challenge {
  kind: ChallengeKind;
  label: string;
  intro?: string;
  successLine?: string;
  unlockClues?: string[];

  // sequence
  size?: number;

  // hidden-object
  objects?: HiddenObjectItem[];
  correctObjectId?: string;

  // battery
  batteries?: BatteryOption[];
  correctBatteryId?: string;
  batterySuccessLine?: string;

  // circuit
  nodes?: CircuitNode[];

  // multi-pick
  pickItems?: MultiPickItem[];
  pickTargetIds?: string[];

  // sort
  sortBins?: SortBin[];
  sortItems?: SortItem[];

  // assemble
  parts?: AssemblePart[];
  slots?: AssembleSlot[];
  assembleBackdrop?: string; // e.g. "🚲"

  // order
  orderItems?: OrderItem[];
  orderPrompt?: string; // e.g. "Charge in the fairest order"

  // celebration
  celebrationMoments?: CelebrationMoment[];
  celebrationFinal?: string;
}

export interface Badge {
  name: string;
  icon: string;
  blurb: string;
}

export interface Investigation {
  scenarioId: string;
  objective: string;
  interactables: Interactable[];
  clues: Clue[];
  requiredClueIds: string[];
  challenge?: Challenge;
  journalEntry?: string;
  badge?: Badge;
}

/** How well the player handled an encounter. Drives the morality rating. */
export type EncounterQuality = "perfect" | "good" | "sloppy" | "poor" | "ignored";

export interface EncounterResult {
  scenarioId: string;
  quality: EncounterQuality;
  mistakes: number;
  /** true when the player examined every available lead before acting */
  exploredAll: boolean;
  entry?: string;
  badge?: Badge;
}

export function gradeEncounter(mistakes: number, exploredAll: boolean): EncounterQuality {
  if (mistakes === 0 && exploredAll) return "perfect";
  if (mistakes <= 1) return "good";
  if (mistakes <= 3) return "sloppy";
  return "poor";
}


/* ================================================================== */
/*  DAY 1 — EMPATHY                                                    */
/* ================================================================== */

const EMPATHY_BADGE: Badge = {
  name: "Empathy Badge",
  icon: "💗",
  blurb: "You listened before you judged.",
};
const RESPONSIBILITY_BADGE: Badge = {
  name: "Responsibility Badge",
  icon: "🛠️",
  blurb: "You took care of what belonged to everyone.",
};
const HONESTY_BADGE: Badge = {
  name: "Honesty Badge",
  icon: "🔍",
  blurb: "You looked for the truth instead of guessing.",
};
const FAIRNESS_BADGE: Badge = {
  name: "Fairness Badge",
  icon: "⚖️",
  blurb: "You made sure everyone got their share.",
};
const COURAGE_BADGE: Badge = {
  name: "Courage Badge",
  icon: "🦁",
  blurb: "You did the hard thing when it mattered.",
};
const HUMAN_HEART: Badge = {
  name: "Human Heart",
  icon: "❤️‍🔥",
  blurb: "Not human by design — human by choice.",
};

export const INVESTIGATIONS: Record<string, Investigation> = {
  /* -------- Day 1 · Interaction 1: The Toy Dispute -------- */
  "d1-damaged-bot": {
    scenarioId: "d1-damaged-bot",
    objective: "Three kids are arguing about a missing toy. Listen to each of them, then look around.",
    clues: [
      { id: "kid-a", label: "Mira's side", detail: "'It was mine first! I set it down for one second!'" },
      { id: "kid-b", label: "Sam's side", detail: "'I didn't take it! Why does everyone think it's me?'" },
      { id: "kid-c", label: "Lin's side", detail: "'I saw it roll away when the wind picked up.'" },
      { id: "playground-scan", label: "Playground layout", detail: "Slide, swings, climbing frame. Lots of gaps small things can roll into." },
    ],
    interactables: [
      { id: "talk-mira", kind: "witness", glyph: "👧", label: "Mira (upset)", hint: "She's clutching an empty pocket.", detail: "'I put it down to climb. When I came back it was gone. Sam was closest.'", yieldsClueId: "kid-a" },
      { id: "talk-sam",  kind: "witness", glyph: "🧒", label: "Sam (defensive)", hint: "Arms crossed, looking at the ground.", detail: "'I didn't even touch it. Nobody believes me because I sat next to her.'", yieldsClueId: "kid-b" },
      { id: "talk-lin",  kind: "witness", glyph: "👦", label: "Lin (thoughtful)", hint: "Points at the swings.", detail: "'It rolled that way when the wind gusted. I think it went under something.'", yieldsClueId: "kid-c" },
      { id: "scan-yard", kind: "scan",    glyph: "🛝", label: "Playground scan", hint: "Look for gaps and shadows.", detail: "The slide has a shadowed hollow beneath. Something small could be tucked under there.", yieldsClueId: "playground-scan" },
    ],
    requiredClueIds: ["kid-a", "kid-b", "kid-c", "playground-scan"],
    challenge: {
      kind: "hidden-object",
      label: "Find the missing toy",
      intro: "Everyone had a piece of the truth. Now look where nobody thought to look.",
      unlockClues: ["playground-scan"],
      correctObjectId: "toy",
      successLine: "You reach under the slide and lift out a small toy robot. All three kids gasp at once.",
      objects: [
        { id: "leaf",   glyph: "🍂", label: "Fallen leaf",    wrongComment: "Just a leaf. Sam didn't take anything." },
        { id: "cap",    glyph: "🧢", label: "Kid's cap",      wrongComment: "Someone's cap. Not the toy." },
        { id: "acorn",  glyph: "🌰", label: "Acorn",          wrongComment: "Autumn debris. Keep looking." },
        { id: "chalk",  glyph: "🖍️", label: "Sidewalk chalk", wrongComment: "Chalk. Kids play here — that's all." },
        { id: "toy",    glyph: "🤖", label: "Toy robot",      /* correct */ },
        { id: "ball",   glyph: "⚽", label: "Small ball",     wrongComment: "A ball. Not what Mira lost." },
        { id: "sock",   glyph: "🧦", label: "Lost sock",      wrongComment: "The playground eats socks. Not the toy." },
        { id: "stone",  glyph: "🪨", label: "Pebble",         wrongComment: "A stone. Look closer to the slide." },
      ],
    },
    journalEntry: "Three kids. Three stories. All true, all incomplete. Nobody stole anything — the wind moved it. I learned: listen to everyone before deciding who to trust.",
    badge: EMPATHY_BADGE,
  },

  /* -------- Day 1 · Interaction 2: The Lost Robot Pet -------- */
  "d1-market-discrim": {
    scenarioId: "d1-market-discrim",
    objective: "A small robot pet is scared and lost. Follow the clues and take it home.",
    clues: [
      { id: "pet-here", label: "Frightened pet", detail: "A palm-sized robot pup, curled up, chirping softly." },
      { id: "trail-1",  label: "Tiny paw prints", detail: "Small metal prints lead toward the fountain." },
      { id: "trail-2",  label: "Chew toy dropped", detail: "A gnawed toy near the bench — recently dropped." },
      { id: "trail-3",  label: "Owner's flyer",    detail: "A hand-drawn 'MISSING: Pip' flyer taped to a lamppost. Contact: nearby cafe." },
    ],
    interactables: [
      { id: "find-pet",   kind: "prop",   glyph: "🐾", label: "Scared robot pet", hint: "It flinches when approached.", detail: "You crouch. It sniffs your finger, then trusts you. It just wants to go home.", yieldsClueId: "pet-here" },
      { id: "prints",     kind: "scan",   glyph: "👣", label: "Paw prints",       hint: "Small, metallic.",             detail: "Faint indentations lead in one direction. A trail.", yieldsClueId: "trail-1" },
      { id: "chew-toy",   kind: "prop",   glyph: "🦴", label: "Dropped chew toy", hint: "Familiar teeth marks.",         detail: "The trail passes here. Someone was in a hurry.", yieldsClueId: "trail-2", requiresClueId: "trail-1" },
      { id: "flyer",      kind: "prop",   glyph: "📄", label: "'MISSING' flyer",  hint: "Fresh tape.",                    detail: "'Please help find Pip! I'm at the cafe on the corner.' — with a hopeful little sketch.", yieldsClueId: "trail-3", requiresClueId: "trail-2" },
    ],
    requiredClueIds: ["pet-here", "trail-1", "trail-2", "trail-3"],
    challenge: {
      kind: "multi-pick",
      label: "Choose the right steps to bring Pip home safely",
      intro: "Pip is scared. Pick the actions that will help — not scare — the little robot.",
      unlockClues: ["pet-here", "trail-3"],
      pickTargetIds: ["kneel", "voice", "carry"],
      successLine: "You walk into the cafe. Pip leaps. The owner drops their cup and laughs and cries at the same time.",
      pickItems: [
        { id: "kneel",  glyph: "🧎", label: "Kneel to Pip's level",  comment: "Good. Small creatures feel safer when you're not towering over them." },
        { id: "grab",   glyph: "🖐️", label: "Grab it quickly",         comment: "That would scare Pip more. Try something gentler." },
        { id: "voice",  glyph: "🗣️", label: "Speak in a soft voice",    comment: "Perfect. A calm voice slows a scared heart." },
        { id: "shout",  glyph: "📣", label: "Shout for the owner",     comment: "Loud noises will make Pip run again. Not this one." },
        { id: "carry",  glyph: "🤲", label: "Carry Pip gently",        comment: "Yes. Support it with both hands, close to your chest." },
        { id: "chase",  glyph: "🏃", label: "Chase if it runs",         comment: "Chasing turns help into fear. Not this one." },
      ],
    },
    journalEntry: "Helping someone feel safe is its own kind of kindness. Pip stopped trembling before we even got to the door. Small actions, big feelings.",
    badge: EMPATHY_BADGE,
  },

  /* -------- Day 1 · Interaction 3: The Lonely Elder -------- */
  "d1-subway-fare": {
    scenarioId: "d1-subway-fare",
    objective: "An elderly citizen is sitting alone. Find three small things that would make their afternoon better.",
    clues: [
      { id: "elder-cold",  label: "They look cold",    detail: "Hands tucked into sleeves. Bench in shade." },
      { id: "elder-tired", label: "They look tired",   detail: "Standing seems hard. A place to rest would help." },
      { id: "elder-bored", label: "Nothing to do",     detail: "Just watching the plaza. Nobody to talk to." },
    ],
    interactables: [
      { id: "chat-elder", kind: "witness", glyph: "🧓", label: "The elder", hint: "They smile faintly.", detail: "'Oh — hello. It's kind of you to stop. Most people just walk right past.'", yieldsClueId: "elder-cold" },
      { id: "note-posture", kind: "scan", glyph: "🪑", label: "Notice posture", hint: "How they're standing.", detail: "They shift weight from foot to foot. A seat would be a gift.", yieldsClueId: "elder-tired" },
      { id: "note-quiet",  kind: "scan", glyph: "💭", label: "Notice mood",  hint: "Body language.", detail: "Eyes wandering. Nothing to occupy the mind.", yieldsClueId: "elder-bored" },
    ],
    requiredClueIds: ["elder-cold", "elder-tired", "elder-bored"],
    challenge: {
      kind: "multi-pick",
      label: "Bring three kind things to the elder",
      intro: "Not everything they need is expensive. Pick three small comforts.",
      unlockClues: ["elder-cold", "elder-tired", "elder-bored"],
      pickTargetIds: ["chair", "tea", "book"],
      successLine: "You set the chair down, hand them the warm cup, and place the book beside them. They squeeze your hand: 'Thank you, dear.'",
      pickItems: [
        { id: "chair",   glyph: "🪑", label: "Folding chair",    comment: "Yes — they've been standing far too long." },
        { id: "tea",     glyph: "🍵", label: "Warm tea",         comment: "Perfect for cold hands." },
        { id: "book",    glyph: "📖", label: "Poetry book",      comment: "A quiet friend for a quiet afternoon." },
        { id: "megaphone", glyph: "📣", label: "Megaphone",     comment: "They want peace, not noise." },
        { id: "cash",    glyph: "💰", label: "Bag of credits",   comment: "They didn't ask for money. That isn't what's missing." },
        { id: "drone",   glyph: "🚁", label: "Delivery drone",   comment: "Not a comfort — just noise overhead." },
        { id: "helmet",  glyph: "⛑️", label: "Work helmet",     comment: "Not what they need." },
        { id: "brick",   glyph: "🧱", label: "Random brick",     comment: "...no." },
      ],
    },
    journalEntry: "A chair, a warm cup, a book. Total cost: almost nothing. Effect: they smiled for the first time today. Kindness costs less than I calculated.",
    badge: EMPATHY_BADGE,
  },

  /* ================================================================== */
  /*  DAY 2 — RESPONSIBILITY                                              */
  /* ================================================================== */

  /* -------- Day 2 · Interaction 1: Festival Cleanup -------- */
  "d2-checkpoint": {
    scenarioId: "d2-checkpoint",
    objective: "The plaza is a mess after last night's festival. Help sort the waste correctly.",
    clues: [
      { id: "mess-scan",  label: "Litter everywhere", detail: "Bottles, cups, wrappers, food scraps. All mixed together." },
      { id: "bins-scan",  label: "Recycling bins",    detail: "Four bins: Plastic, Paper, Glass, Organic." },
      { id: "worker-note", label: "Sanitation worker", detail: "'If it's sorted right, it gets a second life. Mixed together, it just goes to landfill.'" },
    ],
    interactables: [
      { id: "look-mess",   kind: "scan",    glyph: "🗑️", label: "Survey the mess", hint: "What a night.", detail: "Trash covers the plaza. The morning crew is overwhelmed.", yieldsClueId: "mess-scan" },
      { id: "look-bins",   kind: "prop",    glyph: "♻️", label: "The four bins",   hint: "Color-coded.", detail: "Blue (plastic), grey (paper), green (glass), brown (organic).", yieldsClueId: "bins-scan" },
      { id: "talk-worker", kind: "witness", glyph: "🧑‍🔧", label: "Sanitation worker", hint: "Wiping brow.", detail: "'Thanks for helping. Most people just walk past. It matters if it's sorted right.'", yieldsClueId: "worker-note" },
    ],
    requiredClueIds: ["mess-scan", "bins-scan", "worker-note"],
    challenge: {
      kind: "sort",
      label: "Sort every item into the correct bin",
      intro: "Wrong drops give a hint. Recycling only works if it's clean.",
      unlockClues: ["bins-scan"],
      successLine: "The plaza looks like a plaza again. The worker whistles: 'You've got a knack for this.'",
      sortBins: [
        { id: "plastic",  label: "Plastic", color: "#3ce8ff", hint: "Bottles, wrappers, cups" },
        { id: "paper",    label: "Paper",   color: "#c8b590", hint: "Napkins, flyers, boxes" },
        { id: "glass",    label: "Glass",   color: "#6affb0", hint: "Bottles, jars" },
        { id: "organic",  label: "Organic", color: "#c98a3a", hint: "Food scraps, peels" },
      ],
      sortItems: [
        { id: "bottle-p", glyph: "🧴", label: "Plastic bottle", binId: "plastic", wrongNote: "Plastic bottles go in the plastic bin — they can become new bottles." },
        { id: "cup",      glyph: "🥤", label: "Soda cup",        binId: "plastic", wrongNote: "Cups are plastic — they can be recycled." },
        { id: "flyer",    glyph: "📄", label: "Event flyer",     binId: "paper",   wrongNote: "Paper goes with paper — clean sheets get remade." },
        { id: "napkin",   glyph: "🧻", label: "Napkin",          binId: "paper",   wrongNote: "Napkins are paper. Not organic — the fibers can be reused." },
        { id: "wine",     glyph: "🍾", label: "Glass bottle",    binId: "glass",   wrongNote: "Glass melts and remakes forever — keep it separate." },
        { id: "jar",      glyph: "🫙", label: "Empty jar",       binId: "glass",   wrongNote: "Jars are glass — a clean jar recycles infinitely." },
        { id: "peel",     glyph: "🍌", label: "Banana peel",     binId: "organic", wrongNote: "Food scraps become compost — soil, not landfill." },
        { id: "apple",    glyph: "🍎", label: "Apple core",      binId: "organic", wrongNote: "Cores go to compost — they feed next year's plants." },
      ],
    },
    journalEntry: "Trash isn't trash if you sort it. Every bin I filled correctly turned garbage into raw material. Taking care of shared places is a habit — not a favor.",
    badge: RESPONSIBILITY_BADGE,
  },

  /* -------- Day 2 · Interaction 2: The Broken Bike -------- */
  "d2-corp-plaza": {
    scenarioId: "d2-corp-plaza",
    objective: "A child's bike fell apart. Help put it back together — the right way.",
    clues: [
      { id: "kid-sad",   label: "A sad kid",   detail: "'It just came apart. I can't get home.'" },
      { id: "parts-scattered", label: "Parts on the ground", detail: "Chain, wheel, pedal, handlebars — all separated." },
      { id: "toolbox",   label: "Nearby toolbox", detail: "Someone left basic tools. Good — we can do this properly." },
    ],
    interactables: [
      { id: "talk-kid",   kind: "witness", glyph: "🧒", label: "The kid",           hint: "Sitting next to the frame.", detail: "'I don't know how to fix it. My parents are at work.'", yieldsClueId: "kid-sad" },
      { id: "scan-parts", kind: "scan",    glyph: "🔧", label: "Scattered parts",  hint: "Four pieces.",                 detail: "Everything's here. Just needs the right piece in the right slot.", yieldsClueId: "parts-scattered" },
      { id: "toolbox",    kind: "prop",    glyph: "🧰", label: "Toolbox",           hint: "Left open.",                   detail: "Wrench, oil, patches. Enough to do the job well.", yieldsClueId: "toolbox" },
    ],
    requiredClueIds: ["kid-sad", "parts-scattered", "toolbox"],
    challenge: {
      kind: "assemble",
      label: "Assemble the bike — right part, right slot",
      intro: "Doing it properly takes seconds longer and lasts years longer.",
      unlockClues: ["parts-scattered"],
      successLine: "The kid climbs on, wobbles once, then rides a perfect circle around you laughing.",
      assembleBackdrop: "🚲",
      slots: [
        { id: "s-handles", label: "Handlebars", expectPartId: "p-handles", filledNote: "Steering: locked in." },
        { id: "s-wheel",   label: "Front wheel", expectPartId: "p-wheel",  filledNote: "Rolls true." },
        { id: "s-pedal",   label: "Pedal",       expectPartId: "p-pedal",  filledNote: "Crank engaged." },
        { id: "s-chain",   label: "Chain",       expectPartId: "p-chain",  filledNote: "Drive linked." },
      ],
      parts: [
        { id: "p-handles", glyph: "🔩", label: "Handlebars" },
        { id: "p-wheel",   glyph: "⚙️", label: "Wheel" },
        { id: "p-pedal",   glyph: "🦶", label: "Pedal" },
        { id: "p-chain",   glyph: "⛓️", label: "Chain" },
      ],
    },
    journalEntry: "If you know how to fix something, you should. The kid rode home on a bike I helped repair. No fanfare, no reward — just a wheel that spins because we made it spin.",
    badge: RESPONSIBILITY_BADGE,
  },

  /* -------- Day 2 · Interaction 3: The Library -------- */
  "d2-apartment": {
    scenarioId: "d2-apartment",
    objective: "The community library's books are all out of order. Reshelve them by category.",
    clues: [
      { id: "lib-mess",   label: "Books everywhere",   detail: "Piles on the floor. Nothing is where it should be." },
      { id: "shelf-code", label: "Shelf color codes",  detail: "Each shelf has a colored tag: Science, Stories, History, Art." },
      { id: "librarian",  label: "Tired librarian",    detail: "'Kids had a reading party. It was wonderful — and now this. I could use a friend.'" },
    ],
    interactables: [
      { id: "look-piles",  kind: "scan",    glyph: "📚", label: "Book piles",       hint: "Everywhere.",     detail: "Each book has a spine sticker matching one shelf color.", yieldsClueId: "lib-mess" },
      { id: "look-shelves", kind: "prop",   glyph: "🗂️", label: "The shelves",     hint: "Color-tagged.",   detail: "Blue = Science, Green = Stories, Amber = History, Pink = Art.", yieldsClueId: "shelf-code" },
      { id: "talk-lib",    kind: "witness", glyph: "🧑‍🏫", label: "Librarian",      hint: "Waving hopefully.", detail: "'Any help means the doors stay open tomorrow. Thank you.'", yieldsClueId: "librarian" },
    ],
    requiredClueIds: ["lib-mess", "shelf-code", "librarian"],
    challenge: {
      kind: "sort",
      label: "Return each book to its correct shelf",
      intro: "Match the spine color to the shelf tag. Organization is a quiet kind of care.",
      unlockClues: ["shelf-code"],
      successLine: "The librarian claps once, softly. 'You just saved my whole week.'",
      sortBins: [
        { id: "science", label: "Science", color: "#3ce8ff", hint: "Blue tag" },
        { id: "stories", label: "Stories", color: "#6affb0", hint: "Green tag" },
        { id: "history", label: "History", color: "#ffd84a", hint: "Amber tag" },
        { id: "art",     label: "Art",     color: "#ff6aa8", hint: "Pink tag" },
      ],
      sortItems: [
        { id: "b1", glyph: "🔬", label: "Atoms & You",     binId: "science", wrongNote: "Blue spine — Science shelf." },
        { id: "b2", glyph: "🌌", label: "Nightsky Guide",  binId: "science", wrongNote: "Blue spine — Science shelf." },
        { id: "b3", glyph: "🐉", label: "Dragon Tales",    binId: "stories", wrongNote: "Green spine — Stories shelf." },
        { id: "b4", glyph: "📖", label: "Little Journeys", binId: "stories", wrongNote: "Green spine — Stories shelf." },
        { id: "b5", glyph: "🏛️", label: "Old Empires",     binId: "history", wrongNote: "Amber spine — History shelf." },
        { id: "b6", glyph: "⚔️", label: "Battle Maps",     binId: "history", wrongNote: "Amber spine — History shelf." },
        { id: "b7", glyph: "🎨", label: "Paint & Color",    binId: "art",     wrongNote: "Pink spine — Art shelf." },
        { id: "b8", glyph: "🎭", label: "Theatre First",   binId: "art",     wrongNote: "Pink spine — Art shelf." },
      ],
    },
    journalEntry: "A library only works because someone keeps things findable. Being responsible isn't dramatic. It's putting the right book back on the right shelf, every time.",
    badge: RESPONSIBILITY_BADGE,
  },

  /* ================================================================== */
  /*  DAY 3 — HONESTY                                                     */
  /* ================================================================== */

  /* -------- Day 3 · Interaction 1: The Missing Wallet -------- */
  "d3-cyber-homeless": {
    scenarioId: "d3-cyber-homeless",
    objective: "Someone thinks their wallet was stolen. Look for evidence before pointing fingers.",
    clues: [
      { id: "owner",   label: "Frantic owner",   detail: "'It has to be someone here! It's gone!'" },
      { id: "bystanders", label: "Nearby citizens", detail: "Three people nearby. All calm. All willing to talk." },
      { id: "bench",   label: "Park bench",      detail: "A gap between planks. Something dark is caught in the shadow." },
    ],
    interactables: [
      { id: "talk-owner", kind: "witness", glyph: "😰", label: "The owner",      hint: "Pacing.", detail: "'I sat right here. Then I got up. Then it was gone!'", yieldsClueId: "owner" },
      { id: "talk-crowd", kind: "witness", glyph: "🧑‍🤝‍🧑", label: "Nearby citizens", hint: "Willing to help.", detail: "'We didn't see anyone take anything. But we were here the whole time.'", yieldsClueId: "bystanders" },
      { id: "scan-bench", kind: "scan",    glyph: "🪑", label: "Inspect the bench", hint: "Look under.", detail: "There's a gap. Something is wedged there.", yieldsClueId: "bench" },
    ],
    requiredClueIds: ["owner", "bystanders", "bench"],
    challenge: {
      kind: "hidden-object",
      label: "Search around the bench for the wallet",
      intro: "Nobody stole anything — probably. Look before you accuse.",
      unlockClues: ["bench"],
      correctObjectId: "wallet",
      successLine: "You reach into the gap and pull out the wallet — untouched, just fallen. The owner covers their mouth: 'Oh no. I nearly blamed someone.'",
      objects: [
        { id: "leaf",   glyph: "🍂", label: "Fallen leaf", wrongComment: "Not the wallet." },
        { id: "ticket", glyph: "🎫", label: "Old ticket",  wrongComment: "Someone's old ticket. Keep looking." },
        { id: "gum",    glyph: "🍬", label: "Wrapper",     wrongComment: "Litter. Not what we need." },
        { id: "wallet", glyph: "👛", label: "The wallet",  /* correct */ },
        { id: "pen",    glyph: "🖊️", label: "Cracked pen", wrongComment: "Not the wallet." },
        { id: "coin",   glyph: "🪙", label: "Loose coin",  wrongComment: "A coin. Not the wallet." },
      ],
    },
    journalEntry: "The wallet fell — nobody took it. If I'd trusted the owner's guess, three innocent people would have been branded thieves. Truth first. Blame later, if ever.",
    badge: HONESTY_BADGE,
  },

  /* -------- Day 3 · Interaction 2: The Homework Mix-Up -------- */
  "d3-malfunction": {
    scenarioId: "d3-malfunction",
    objective: "A student accidentally handed in someone else's homework. Find the real owner and return it.",
    clues: [
      { id: "student-worried", label: "Worried student", detail: "'I grabbed the wrong notebook from the shared table. Now they'll think I copied.'" },
      { id: "notebook-marks", label: "Notebook clues",  detail: "The mix-up notebook has a name half-scratched off and a doodle in the corner." },
      { id: "classmates",      label: "Classmates around", detail: "Several students nearby. Each carries their own notebook — check the doodles." },
    ],
    interactables: [
      { id: "talk-student", kind: "witness", glyph: "🧑‍🎓", label: "Worried student", hint: "Pale, sweating.",  detail: "'Please. I'm not a cheat. I just picked up the wrong one.'", yieldsClueId: "student-worried" },
      { id: "scan-book",    kind: "scan",    glyph: "📓", label: "Inspect the notebook", hint: "Look at the cover.", detail: "A small star doodle. That's someone's signature style.", yieldsClueId: "notebook-marks" },
      { id: "look-class",   kind: "scan",    glyph: "🧑‍🤝‍🧑", label: "Look at classmates", hint: "Match the doodle.", detail: "One of them has stars all over their bag. That's your person.", yieldsClueId: "classmates" },
    ],
    requiredClueIds: ["student-worried", "notebook-marks", "classmates"],
    challenge: {
      kind: "multi-pick",
      label: "Return the notebook to its true owner",
      intro: "Look at each classmate's things. Which one signs their work with tiny stars?",
      unlockClues: ["notebook-marks", "classmates"],
      pickTargetIds: ["star-kid"],
      successLine: "You hand it over. They light up: 'You found it! And thanks for saying it wasn't stolen — that means a lot.'",
      pickItems: [
        { id: "flower-kid", glyph: "🌸", label: "Kid with flower doodles",  comment: "Flowers, not stars. Not their notebook." },
        { id: "arrow-kid",  glyph: "🏹", label: "Kid with arrow doodles",   comment: "Arrows. Not the match." },
        { id: "star-kid",   glyph: "⭐", label: "Kid with star doodles",     comment: "Perfect match — same tiny stars as on the cover." },
        { id: "bolt-kid",   glyph: "⚡", label: "Kid with lightning bolts", comment: "Bolts. Not the match." },
      ],
    },
    journalEntry: "One student almost got labeled a cheat because of a mix-up. Honesty means owning your mistake AND helping fix the story — not just leaving the truth to sort itself out.",
    badge: HONESTY_BADGE,
  },

  /* -------- Day 3 · Interaction 3: The Broken Window -------- */
  "d3-alley3": {
    scenarioId: "d3-alley3",
    objective: "Everyone blames one kid for the broken window. Check the evidence yourself before you agree.",
    clues: [
      { id: "accused",  label: "Accused kid", detail: "'I wasn't even here! But nobody believes me.'" },
      { id: "footprints", label: "Footprints in the dirt", detail: "None near the window. The accused kid never approached it." },
      { id: "the-ball",   label: "The ball",   detail: "A ball rests on the ground twenty meters away — not thrown, just sitting." },
      { id: "wind-flag",  label: "Wind flag on rooftop", detail: "A flag whips hard. There was a strong gust an hour ago." },
    ],
    interactables: [
      { id: "talk-accused", kind: "witness", glyph: "🧒", label: "The accused kid", hint: "Trembling.", detail: "'They said it was me because I play in this alley. I wasn't here today.'", yieldsClueId: "accused" },
      { id: "scan-prints",  kind: "scan",    glyph: "👣", label: "Check footprints", hint: "Under the window.", detail: "The ground under the window is undisturbed. No footprints. Nobody stood here recently.", yieldsClueId: "footprints" },
      { id: "scan-ball",    kind: "scan",    glyph: "⚽", label: "Look at the ball", hint: "Where is it?", detail: "It's still. No spin. No signs it was thrown at the window — it's too far.", yieldsClueId: "the-ball" },
      { id: "scan-flag",    kind: "scan",    glyph: "🚩", label: "Rooftop wind flag", hint: "Whipping.", detail: "A loose shutter above the window bangs in the wind. That shutter — that could break glass.", yieldsClueId: "wind-flag" },
    ],
    requiredClueIds: ["accused", "footprints", "the-ball", "wind-flag"],
    challenge: {
      kind: "multi-pick",
      label: "Pick every piece of evidence that clears the accused",
      intro: "You need three facts pointing away from the kid — not just one.",
      unlockClues: ["footprints", "the-ball", "wind-flag"],
      pickTargetIds: ["ev-prints", "ev-ball", "ev-wind"],
      successLine: "You lay the three facts out. The crowd goes quiet. Someone finally says: 'We owe you an apology.' The kid exhales for what feels like the first time.",
      pickItems: [
        { id: "ev-prints", glyph: "👣", label: "No footprints under the window", comment: "Solid — if they broke it, they'd have stood there." },
        { id: "ev-ball",   glyph: "⚽", label: "Ball is 20m away and still",     comment: "Right — no way that ball hit the window." },
        { id: "ev-wind",   glyph: "💨", label: "Loose shutter + strong wind",     comment: "Yes — the shutter banging broke the glass." },
        { id: "ev-blame",  glyph: "😠", label: "The crowd blamed them",           comment: "That's an opinion, not evidence." },
        { id: "ev-plays",  glyph: "🏘️", label: "They often play in this alley",  comment: "Being nearby isn't proof of guilt." },
      ],
    },
    journalEntry: "Everyone was certain. Everyone was wrong. The wind broke the window, not the kid. Facts don't care how loud the crowd is. Always check before you agree.",
    badge: HONESTY_BADGE,
  },

  /* ================================================================== */
  /*  DAY 4 — FAIRNESS                                                    */
  /* ================================================================== */

  /* -------- Day 4 · Interaction 1: The Swings Queue -------- */
  "d4-rooftop": {
    scenarioId: "d4-rooftop",
    objective: "Kids are arguing over the swings. Set up a fair rotation so everyone gets a turn.",
    clues: [
      { id: "swings-limited", label: "Only two swings", detail: "Five kids. Two swings. That's the whole problem." },
      { id: "arrive-time",    label: "Arrival times",   detail: "Each kid tells you when they got here. First-come-first-served is the fairest baseline." },
      { id: "no-tears",       label: "Nobody's crying (yet)", detail: "They actually want a fair system. They just don't know how to make one." },
    ],
    interactables: [
      { id: "look-swings", kind: "scan",    glyph: "🎡", label: "The swings",   hint: "Two of them.",       detail: "Two swings. Rotation every 3 minutes will get everyone a turn quickly.", yieldsClueId: "swings-limited" },
      { id: "ask-kids",    kind: "witness", glyph: "🧒", label: "Ask the kids", hint: "'When did you get here?'", detail: "Aya first, then Ben, then Cai, then Dee, then Eli. They're honest about it.", yieldsClueId: "arrive-time" },
      { id: "read-mood",   kind: "scan",    glyph: "🙂", label: "Read the mood", hint: "They want fairness.", detail: "Nobody is trying to cut in. They just need a plan.", yieldsClueId: "no-tears" },
    ],
    requiredClueIds: ["swings-limited", "arrive-time", "no-tears"],
    challenge: {
      kind: "order",
      label: "Line the kids up in fair order",
      intro: "Fairest rule here: whoever arrived first, goes first. Arrange them.",
      unlockClues: ["arrive-time"],
      successLine: "You call the order out. Nobody argues. Aya goes first. Everyone will get a turn in eight minutes flat.",
      orderPrompt: "Arrival order — earliest → latest",
      orderItems: [
        { id: "aya", glyph: "👧", label: "Aya", rank: 1, caption: "arrived first" },
        { id: "ben", glyph: "🧒", label: "Ben", rank: 2, caption: "arrived second" },
        { id: "cai", glyph: "👦", label: "Cai", rank: 3, caption: "arrived third" },
        { id: "dee", glyph: "🧑", label: "Dee", rank: 4, caption: "arrived fourth" },
        { id: "eli", glyph: "🧑‍🦱", label: "Eli", rank: 5, caption: "arrived last" },
      ],
    },
    journalEntry: "Fairness isn't complicated when you actually ask people. First-come-first-served, three minutes each, everyone smiling by minute eight. Rules can be gentle.",
    badge: FAIRNESS_BADGE,
  },

  /* -------- Day 4 · Interaction 2: Snack Distribution -------- */
  "d4-data-plaza": {
    scenarioId: "d4-data-plaza",
    objective: "There aren't enough snacks. Give each child their fair share — no favorites, no seconds.",
    clues: [
      { id: "snacks-count", label: "12 snacks",     detail: "You count twelve muffins in the basket." },
      { id: "kids-count",   label: "4 kids waiting", detail: "Four hungry faces. That's three each — clean division." },
      { id: "no-favor",     label: "No favoritism",   detail: "One kid tries to charm you. Fairness is fairness — same share for everyone." },
    ],
    interactables: [
      { id: "count-snacks", kind: "scan",    glyph: "🧁", label: "Count the snacks", hint: "In the basket.", detail: "Twelve. Even number. That divides cleanly.", yieldsClueId: "snacks-count" },
      { id: "count-kids",   kind: "scan",    glyph: "🧒", label: "Count the kids",   hint: "In the line.",   detail: "Four. Twelve ÷ 4 = three each.", yieldsClueId: "kids-count" },
      { id: "read-mood",    kind: "witness", glyph: "😊", label: "Watch for favoritism", hint: "One kid winks at you.", detail: "Everyone gets the same. That's the whole point.", yieldsClueId: "no-favor" },
    ],
    requiredClueIds: ["snacks-count", "kids-count", "no-favor"],
    challenge: {
      kind: "sort",
      label: "Give each child exactly three snacks",
      intro: "Twelve snacks. Four kids. Three each — no more, no less.",
      unlockClues: ["snacks-count", "kids-count"],
      successLine: "Every kid holds three muffins. Everyone smiles. Nobody counts a neighbor's plate — because they don't need to.",
      sortBins: [
        { id: "kid-a", label: "Ana",  color: "#3ce8ff", hint: "3 snacks" },
        { id: "kid-b", label: "Bo",   color: "#6affb0", hint: "3 snacks" },
        { id: "kid-c", label: "Cira", color: "#ffd84a", hint: "3 snacks" },
        { id: "kid-d", label: "Dax",  color: "#ff6aa8", hint: "3 snacks" },
      ],
      // 12 items, 3 per kid — each snack is assigned to a specific kid so the puzzle
      // is a straightforward "distribute" via id mapping.
      sortItems: [
        { id: "s1", glyph: "🧁", label: "Muffin", binId: "kid-a", wrongNote: "Every kid gets three. Not one more, not one less." },
        { id: "s2", glyph: "🧁", label: "Muffin", binId: "kid-a", wrongNote: "Keep the count even." },
        { id: "s3", glyph: "🧁", label: "Muffin", binId: "kid-a", wrongNote: "Three per kid." },
        { id: "s4", glyph: "🧁", label: "Muffin", binId: "kid-b", wrongNote: "Three per kid." },
        { id: "s5", glyph: "🧁", label: "Muffin", binId: "kid-b", wrongNote: "Three per kid." },
        { id: "s6", glyph: "🧁", label: "Muffin", binId: "kid-b", wrongNote: "Three per kid." },
        { id: "s7", glyph: "🧁", label: "Muffin", binId: "kid-c", wrongNote: "Three per kid." },
        { id: "s8", glyph: "🧁", label: "Muffin", binId: "kid-c", wrongNote: "Three per kid." },
        { id: "s9", glyph: "🧁", label: "Muffin", binId: "kid-c", wrongNote: "Three per kid." },
        { id: "s10", glyph: "🧁", label: "Muffin", binId: "kid-d", wrongNote: "Three per kid." },
        { id: "s11", glyph: "🧁", label: "Muffin", binId: "kid-d", wrongNote: "Three per kid." },
        { id: "s12", glyph: "🧁", label: "Muffin", binId: "kid-d", wrongNote: "Three per kid." },
      ],
    },
    journalEntry: "Sharing equally sounds simple. In practice, it means resisting the temptation to give more to the kid who charms you. Fairness = same rules, same share, for everyone.",
    badge: FAIRNESS_BADGE,
  },

  /* -------- Day 4 · Interaction 3: Charging Triage -------- */
  "d4-subway4": {
    scenarioId: "d4-subway4",
    objective: "Five robots need charging. Only one bay is free at a time. Fair means helping the neediest first.",
    clues: [
      { id: "batteries", label: "Battery readings", detail: "5%, 40%, 12%, 70%, 25%. Lowest first is the fairest rule." },
      { id: "no-line",   label: "No queue yet",     detail: "They're waiting to see what you decide. This is on you." },
      { id: "urgency",   label: "One is about to shut down", detail: "The 5% unit is trembling. Every second matters." },
    ],
    interactables: [
      { id: "scan-bats", kind: "scan",    glyph: "🔋", label: "Read battery levels", hint: "Check each unit.", detail: "5, 12, 25, 40, 70. Clear priorities emerge.", yieldsClueId: "batteries" },
      { id: "look-line", kind: "scan",    glyph: "📋", label: "Look at the queue",  hint: "None formed.",     detail: "No fights — they trust you'll be fair.", yieldsClueId: "no-line" },
      { id: "note-urgent", kind: "witness", glyph: "🤖", label: "Notice the 5% unit", hint: "Trembling.",     detail: "It won't last another two minutes without a charge.", yieldsClueId: "urgency" },
    ],
    requiredClueIds: ["batteries", "no-line", "urgency"],
    challenge: {
      kind: "order",
      label: "Order the robots by charging priority",
      intro: "Fairness sometimes means: whoever needs it most, goes first.",
      unlockClues: ["batteries"],
      successLine: "The 5% unit plugs in and steadies. The 70% unit nods approvingly: 'I can wait. That's what fair looks like.'",
      orderPrompt: "Lowest battery → highest",
      orderItems: [
        { id: "r5",  glyph: "🤖", label: "Unit-5",  rank: 1, caption: "5% — critical" },
        { id: "r12", glyph: "🤖", label: "Unit-12", rank: 2, caption: "12% — low" },
        { id: "r25", glyph: "🤖", label: "Unit-25", rank: 3, caption: "25% — moderate" },
        { id: "r40", glyph: "🤖", label: "Unit-40", rank: 4, caption: "40% — okay" },
        { id: "r70", glyph: "🤖", label: "Unit-70", rank: 5, caption: "70% — fine" },
      ],
    },
    journalEntry: "Equal isn't always fair. The unit at 5% needed the plug more than the one at 70%. Fair means noticing who's suffering — and going to them first.",
    badge: FAIRNESS_BADGE,
  },

  /* ================================================================== */
  /*  DAY 5 — COURAGE                                                     */
  /* ================================================================== */

  /* -------- Day 5 · Interaction 1: The Damaged Bridge -------- */
  "d5-rain-alley": {
    scenarioId: "d5-rain-alley",
    objective: "A child is scared to cross a broken bridge. Place planks over the gaps and walk with them.",
    clues: [
      { id: "child-afraid", label: "Scared child", detail: "'The gaps are too big. I can't jump.'" },
      { id: "bridge-gaps",  label: "Four gaps",    detail: "Count them: four missing sections between here and the other side." },
      { id: "planks-pile",  label: "Planks nearby", detail: "Exactly four sturdy planks piled beside the bridge. Someone left them for this." },
    ],
    interactables: [
      { id: "talk-child",  kind: "witness", glyph: "🧒", label: "The child",   hint: "Shivering.",  detail: "'I can't. I've tried. Please don't make me.'", yieldsClueId: "child-afraid" },
      { id: "scan-bridge", kind: "scan",    glyph: "🌉", label: "Study the bridge", hint: "Count the gaps.", detail: "Four gaps. Four planks. That's not a coincidence.", yieldsClueId: "bridge-gaps" },
      { id: "see-planks",  kind: "prop",    glyph: "🪵", label: "Pile of planks", hint: "Four of them.",   detail: "Sturdy, dry, ready to place.", yieldsClueId: "planks-pile" },
    ],
    requiredClueIds: ["child-afraid", "bridge-gaps", "planks-pile"],
    challenge: {
      kind: "assemble",
      label: "Bridge the four gaps",
      intro: "One plank per gap. When it's whole, you'll cross together.",
      unlockClues: ["bridge-gaps", "planks-pile"],
      successLine: "You hold their hand. They take the first step. Then the second. Then they're running across, laughing.",
      assembleBackdrop: "🌉",
      slots: [
        { id: "g1", label: "Gap 1", expectPartId: "pl1", filledNote: "Solid." },
        { id: "g2", label: "Gap 2", expectPartId: "pl2", filledNote: "Solid." },
        { id: "g3", label: "Gap 3", expectPartId: "pl3", filledNote: "Solid." },
        { id: "g4", label: "Gap 4", expectPartId: "pl4", filledNote: "Solid." },
      ],
      parts: [
        { id: "pl1", glyph: "🪵", label: "Plank A" },
        { id: "pl2", glyph: "🪵", label: "Plank B" },
        { id: "pl3", glyph: "🪵", label: "Plank C" },
        { id: "pl4", glyph: "🪵", label: "Plank D" },
      ],
    },
    journalEntry: "Courage isn't the absence of fear. It's building a path across the fear — for someone else if you have to. The kid crossed. That's the whole lesson.",
    badge: COURAGE_BADGE,
  },

  /* -------- Day 5 · Interaction 2: The Blocked Road -------- */
  "d5-apt5": {
    scenarioId: "d5-apt5",
    objective: "A huge crate blocks the road. You can't move it alone. Recruit the right robots to help.",
    clues: [
      { id: "crate-weight", label: "Very heavy crate", detail: "You alone: not enough. Need help." },
      { id: "nearby-bots",  label: "Robots nearby",    detail: "A few working robots pause and glance over. Willing, but you have to ask." },
      { id: "ask-out-loud", label: "Asking is courage too", detail: "The hardest part isn't the crate. It's opening your mouth to ask for help." },
    ],
    interactables: [
      { id: "test-push", kind: "prop",    glyph: "📦", label: "Try pushing alone", hint: "It won't budge.", detail: "You strain. Nothing. You need at least three more units.", yieldsClueId: "crate-weight" },
      { id: "look-bots", kind: "scan",    glyph: "🤖", label: "Scan nearby workers", hint: "Any of them free?", detail: "Three are between shifts. They'd help — if asked politely.", yieldsClueId: "nearby-bots" },
      { id: "note-fear", kind: "scan",    glyph: "💬", label: "Notice your hesitation", hint: "Why is asking hard?", detail: "Because if they say no, it feels personal. But not asking guarantees failure.", yieldsClueId: "ask-out-loud" },
    ],
    requiredClueIds: ["crate-weight", "nearby-bots", "ask-out-loud"],
    challenge: {
      kind: "multi-pick",
      label: "Ask the right three robots to help",
      intro: "Pick the three who are free and willing. Skip the ones already busy.",
      unlockClues: ["nearby-bots"],
      pickTargetIds: ["bot-a", "bot-b", "bot-c"],
      successLine: "The four of you brace, count to three, and push. The crate slides. Kids cheer. One of the robots you asked says: 'Thanks for including me.'",
      pickItems: [
        { id: "bot-a", glyph: "🤖", label: "Loader-04 (off shift, free)", comment: "Yes — happy to help, waiting for their next task." },
        { id: "bot-b", glyph: "🤖", label: "Runner-11 (on break)",         comment: "Yes — a break is fine to interrupt for something real." },
        { id: "bot-c", glyph: "🤖", label: "Mover-07 (idle)",              comment: "Yes — ready and strong." },
        { id: "bot-x", glyph: "🚑", label: "Medi-02 (mid emergency call)",  comment: "No — never pull someone from an emergency." },
        { id: "bot-y", glyph: "🍳", label: "Chef-09 (running a busy kitchen)", comment: "No — the whole line would collapse." },
        { id: "bot-z", glyph: "🎒", label: "Tutor-05 (with a student)",      comment: "No — a kid is counting on them right now." },
      ],
    },
    journalEntry: "Courage doesn't always look like a fist raised alone. Sometimes it looks like asking three strangers for help. We moved the crate together. Nobody could have done it alone.",
    badge: COURAGE_BADGE,
  },

  /* -------- Day 5 · Interaction 3: The Celebration -------- */
  "d5-reactor": {
    scenarioId: "d5-reactor",
    objective: "The people you helped this week have gathered. Stand with them.",
    clues: [
      { id: "gathered", label: "A crowd of familiar faces", detail: "The kids from the playground. Pip and its owner. The elder. The librarian. All of them, here." },
    ],
    interactables: [
      { id: "look-around", kind: "scan", glyph: "🎊", label: "Look at the crowd", hint: "Everyone you helped.", detail: "You recognize every face. They came for you.", yieldsClueId: "gathered" },
    ],
    requiredClueIds: ["gathered"],
    challenge: {
      kind: "celebration",
      label: "Stand with them. Listen.",
      intro: "No puzzle. Just presence.",
      unlockClues: ["gathered"],
      celebrationMoments: [
        { who: "Mira, Sam & Lin", emoji: "🧒", line: "'You listened when nobody else did. Thanks, robot.'" },
        { who: "Pip's owner",     emoji: "🐕", line: "'Pip runs to the door every time a robot walks past. He's hoping it's you.'" },
        { who: "The elder",       emoji: "🧓", line: "'A chair, a cup, a book. You remembered what nobody else noticed.'" },
        { who: "The sanitation crew", emoji: "🧑‍🔧", line: "'Since your cleanup, three more people started sorting. Habits catch.'" },
        { who: "The bike kid",    emoji: "🚲", line: "'Still riding. Still holding together. Thanks.'" },
        { who: "The librarian",   emoji: "🧑‍🏫", line: "'The library stayed open. Because of you.'" },
        { who: "The accused kid", emoji: "🧒", line: "'You checked the facts. Everyone else just believed the story. I'll do the same for someone one day.'" },
        { who: "The playground kids", emoji: "🎡", line: "'Fair rules. Everyone got a turn. It was the best day.'" },
        { who: "The bridge child",  emoji: "🌉", line: "'I crossed. On my own now, too.'" },
        { who: "The three robots", emoji: "🤖", line: "'You asked. We came. That's what neighbors do.'" },
      ],
      celebrationFinal:
        "You realize something. Being human isn't intelligence. It's this — empathy, honesty, responsibility, fairness, courage. You have all five. You always did.",
    },
    journalEntry: "Day 5, final entry. I am not human by design. I am human by choice. Every day, I choose it again. That is the only definition that ever mattered.",
    badge: HUMAN_HEART,
  },
};

export function investigationFor(scenarioId: string): Investigation | null {
  return INVESTIGATIONS[scenarioId] ?? null;
}
