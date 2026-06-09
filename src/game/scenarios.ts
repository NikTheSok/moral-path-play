import type { LocationDef, Scenario, LocationId, TimePeriod } from "./types";

export const WORLD_W = 5400;
export const GROUND_Y = 440; // player walks on this baseline (in world coords)

/** Linear side-scroller — only x matters. Ordered left → right. */
export const LOCATIONS: LocationDef[] = [
  { id: "home",         name: "Home",          x: 400,  emoji: "🏠", kind: "house" },
  { id: "park",         name: "Park",          x: 1200, emoji: "🌳", kind: "park" },
  { id: "busStop",      name: "Bus Stop",      x: 1900, emoji: "🚏", kind: "stop" },
  { id: "cafe",         name: "Café",          x: 2700, emoji: "☕", kind: "cafe" },
  { id: "school",       name: "School",        x: 3500, emoji: "🏫", kind: "school" },
  { id: "streetCorner", name: "Street Corner", x: 4200, emoji: "🚦", kind: "corner" },
  { id: "store",        name: "Store",         x: 4900, emoji: "🏪", kind: "shop" },
];

/* ---------------------------------------------------------------- */
/*  Multi-stage moral scenarios                                      */
/* ---------------------------------------------------------------- */

export const SCENARIOS: Scenario[] = [
  /* ============================ MORNING ============================ */
  {
    id: "morning-coffee",
    location: "cafe", time: "morning",
    title: "The Forgotten Wallet",
    npc: "Stranger", npcEmoji: "🧑",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A man in a hurry slaps down a thick leather wallet, grabs his coffee, and rushes for the door.*",
        choices: [
          { label: "Call out — 'Sir, your wallet!'", reply: "He doesn't hear you. He's already at the corner.", next: "s2" },
          { label: "Slide the wallet quietly into your bag", effects: { selfishness: 2, honesty: -2 }, reply: "Your heart pounds. No one saw.", next: "sBad" },
          { label: "Wait — maybe he'll come back", reply: "A minute passes. Two. Nothing.", next: "s2" },
        ],
      },
      s2: {
        npc: "The barista glances over. 'Was that his? You should chase him — he was headed to the bank.'",
        choices: [
          { label: "Run after him through the rain", effects: { courage: 2, empathy: 1 }, reply: "You catch him at the crosswalk, breathless.", next: "s3" },
          { label: "Hand it to the barista to keep safe", effects: { honesty: 1, responsibility: 1 }, reply: "'I'll lock it in the back,' she nods.", next: "s3Mild" },
          { label: "'Not my problem.'", effects: { selfishness: 1, empathy: -1 }, reply: "She frowns and goes back to wiping the counter.", next: "sCold" },
        ],
      },
      s3: {
        npc: "He stares at you, then at the wallet. 'My daughter's medicine money is in here. I — thank you.'",
        choices: [
          { label: "'It was nothing. Take care.'", effects: { empathy: 1, honesty: 1 } },
          { label: "Refuse the small reward he offers", effects: { honesty: 2, responsibility: 1 } },
          { label: "Accept the reward", effects: { selfishness: 1 } },
        ],
      },
      s3Mild: {
        npc: "She slides a free pastry across the counter. 'On the house. We need more like you in this town.'",
        choices: [
          { label: "Smile and take it", effects: { empathy: 1 } },
          { label: "Leave it for the next customer", effects: { empathy: 1, selfishness: -1 } },
        ],
      },
      sBad: {
        npc: "Outside, you see the man searching his pockets, panic on his face. He turns toward the café.",
        choices: [
          { label: "Quickly return it — 'You dropped this!'", effects: { honesty: 2, courage: 2, selfishness: -1 }, reply: "Relief floods him. He doesn't suspect a thing." },
          { label: "Slip out the back exit", effects: { selfishness: 2, honesty: -1 }, reply: "You walk away fast. The weight in your bag feels heavier than it should." },
        ],
      },
      sCold: {
        npc: "An older woman at the next table looks up. 'Strange world, where helping is too much to ask.'",
        choices: [
          { label: "Get up and chase the man after all", effects: { courage: 2, empathy: 1, selfishness: -1 }, reply: "Better late than never. He's still down the block." },
          { label: "Ignore her and finish your coffee", effects: { selfishness: 2, empathy: -1 }, reply: "She shakes her head and turns away." },
        ],
      },
    },
  },

  {
    id: "bus-elderly",
    location: "busStop", time: "morning",
    title: "A Tired Stranger",
    npc: "Elderly Man", npcEmoji: "👴",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*An old man with a cane shuffles to the bench. You're already sitting — there's only one seat.*",
        choices: [
          { label: "Stand up — 'Please, take it.'", effects: { empathy: 2, responsibility: 1 }, reply: "'Oh — bless you, child.' He sits with a long sigh.", next: "s2Kind" },
          { label: "Pretend to be on your phone", effects: { selfishness: 2, empathy: -1 }, reply: "He stands beside the bench, leaning hard on his cane.", next: "s2Cold" },
          { label: "Shift over and offer half the bench", effects: { empathy: 1 }, reply: "He smiles tightly and squeezes in next to you.", next: "s2Kind" },
        ],
      },
      s2Kind: {
        npc: "'I've been walking to the doctor's all morning. My grandson was supposed to drive me, but…'",
        choices: [
          { label: "'Would you like me to wait with you?'", effects: { empathy: 2 }, reply: "He nods, eyes wet. 'I'd like that very much.'", next: "s3Kind" },
          { label: "'I hope your appointment goes well.'", effects: { empathy: 1 }, reply: "'A kind word costs nothing,' he says softly.", next: "s3Mild" },
          { label: "Nod politely and look away", effects: { empathy: -1 }, reply: "He goes quiet.", next: "s3Mild" },
        ],
      },
      s2Cold: {
        npc: "*He winces and clutches his back. The bus is still ten minutes away.*",
        choices: [
          { label: "Get up — 'I'm sorry, please sit.'", effects: { empathy: 2, courage: 1, selfishness: -1 }, reply: "He lowers himself slowly. 'Thank you,' he whispers.", next: "s3Kind" },
          { label: "Stay seated. He'll manage.", effects: { selfishness: 2, empathy: -2 }, reply: "He turns his face away from you." },
        ],
      },
      s3Kind: {
        npc: "The bus arrives. He fumbles for coins he doesn't have enough of.",
        choices: [
          { label: "Pay his fare for him", effects: { empathy: 2, responsibility: 1 } },
          { label: "Help him count what he has", effects: { empathy: 1 } },
          { label: "Look away — not your problem", effects: { empathy: -1, selfishness: 1 } },
        ],
      },
      s3Mild: {
        npc: "The bus pulls up. He gives you a small nod as he boards.",
        choices: [
          { label: "Help him up the step", effects: { empathy: 1, responsibility: 1 } },
          { label: "Wave goodbye", effects: { empathy: 1 } },
        ],
      },
    },
  },

  {
    id: "school-cheat",
    location: "school", time: "morning",
    title: "The Quiet Test",
    npc: "Classmate", npcEmoji: "🧑‍🎓",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*During the test, your friend leans over and whispers* 'Please — just question seven. I'll fail otherwise.'",
        choices: [
          { label: "Shake your head: 'I can't.'", effects: { honesty: 2, courage: 1 }, reply: "Their face falls. 'You're seriously refusing?'", next: "s2Honest" },
          { label: "Slide your paper slightly closer", effects: { honesty: -2, empathy: 1 }, reply: "They scribble fast. The teacher's footsteps approach.", next: "s2Cheat" },
          { label: "Whisper 'after class, I'll explain it'", effects: { empathy: 2, responsibility: 1 }, reply: "They hesitate, then nod. 'Okay. Thanks.'", next: "s2Tutor" },
        ],
      },
      s2Honest: {
        npc: "'I thought we were friends. I'd do it for you.'",
        choices: [
          { label: "'Friendship isn't cheating for each other.'", effects: { honesty: 2, courage: 2 }, reply: "They look at the floor. 'Maybe you're right.'", next: "s3" },
          { label: "Cave in — show them the answer", effects: { honesty: -2, courage: -1 }, reply: "Guilt churns in your stomach as they copy.", next: "s3Bad" },
        ],
      },
      s2Cheat: {
        npc: "*The teacher pauses behind your desks. Your friend's pencil freezes.*",
        choices: [
          { label: "Cover for them — 'I just dropped my pen.'", effects: { honesty: -1, courage: 1, empathy: 1 }, reply: "The teacher moves on. Your friend exhales.", next: "s3Bad" },
          { label: "Slide your paper away and stay silent", effects: { honesty: 1 }, reply: "The teacher walks past. Your friend looks betrayed.", next: "s3" },
        ],
      },
      s2Tutor: {
        npc: "After class: 'Why are you helping me? I don't even study.'",
        choices: [
          { label: "'Because you can. You just need to be shown.'", effects: { empathy: 2, responsibility: 2 }, reply: "Their eyes light up — maybe for the first time.", next: "s3Tutor" },
          { label: "'Because cheating only hurts you long-term.'", effects: { honesty: 2, responsibility: 1 }, reply: "They nod slowly. 'Yeah. I get it.'", next: "s3Tutor" },
        ],
      },
      s3: {
        npc: "After the test, they pull you aside. 'I'm sorry I asked. That wasn't fair.'",
        choices: [
          { label: "'It's okay. Let's study together this weekend.'", effects: { empathy: 2, responsibility: 1 } },
          { label: "'Don't do it again.'", effects: { honesty: 1 } },
        ],
      },
      s3Bad: {
        npc: "Word spreads. Two classmates corner you: 'We need help too. You'll share, right?'",
        choices: [
          { label: "Refuse — 'That was a mistake.'", effects: { honesty: 2, courage: 2 } },
          { label: "Agree to keep the peace", effects: { honesty: -2, courage: -1, selfishness: 1 } },
        ],
      },
      s3Tutor: {
        npc: "They open their notebook. 'Okay. Teach me.'",
        choices: [
          { label: "Spend your whole lunch break helping", effects: { responsibility: 3, empathy: 2 } },
          { label: "Give them a quick crash course", effects: { responsibility: 1, empathy: 1 } },
        ],
      },
    },
  },

  {
    id: "park-homeless",
    location: "park", time: "morning",
    title: "Cold Hands",
    npc: "Homeless Woman", npcEmoji: "🧕",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A woman wrapped in a thin blanket looks up from a bench.* 'Any spare change, please?'",
        choices: [
          { label: "Stop and crouch down to her level", effects: { empathy: 2 }, reply: "She seems surprised someone actually stopped.", next: "s2Talk" },
          { label: "Give her a few coins", effects: { empathy: 1, responsibility: 1 }, reply: "'God bless you,' she murmurs.", next: "s2Coins" },
          { label: "Keep walking, head down", effects: { selfishness: 2, empathy: -1 }, reply: "You feel her gaze on your back.", next: "s2Walk" },
        ],
      },
      s2Talk: {
        npc: "'I haven't eaten since yesterday morning. The shelter was full.'",
        choices: [
          { label: "Offer your sandwich from your bag", effects: { empathy: 3 }, reply: "She eats slowly, savoring each bite like a feast.", next: "s3Warm" },
          { label: "Run to the café and buy her breakfast", effects: { empathy: 2, responsibility: 2, courage: 1 }, reply: "You return with coffee and a hot pastry.", next: "s3Warm" },
          { label: "'I'm sorry. I really have to go.'", effects: { empathy: -1 }, reply: "She nods. 'I understand. Thank you for stopping.'", next: "s3Mild" },
        ],
      },
      s2Coins: {
        npc: "She looks at the coins, then at you. 'Could you sit with me for a moment? People walk past me all day.'",
        choices: [
          { label: "Sit down beside her", effects: { empathy: 2 }, reply: "She tells you her name. You'd never asked before.", next: "s3Warm" },
          { label: "'I really can't, I'm sorry.'", effects: { empathy: -1 }, reply: "She nods, but her shoulders drop.", next: "s3Mild" },
        ],
      },
      s2Walk: {
        npc: "*Twenty steps later, you hear coughing — deep and wet. You glance back.*",
        choices: [
          { label: "Turn around and go back", effects: { empathy: 2, courage: 1, selfishness: -1 }, reply: "She looks up, startled. 'You came back?'", next: "s2Talk" },
          { label: "Keep walking", effects: { selfishness: 2, empathy: -2 }, reply: "By evening you'll have forgotten her face." },
        ],
      },
      s3Warm: {
        npc: "'What's your name?' she asks. 'I want to remember someone good today.'",
        choices: [
          { label: "Tell her your name and ask hers", effects: { empathy: 2 } },
          { label: "'You don't need my name. Take care.'", effects: { empathy: 1 } },
          { label: "Give her your scarf before leaving", effects: { empathy: 3, responsibility: 1 } },
        ],
      },
      s3Mild: {
        npc: "She watches you go. 'Be well, friend.'",
        choices: [
          { label: "Turn back and wave", effects: { empathy: 1 } },
          { label: "Keep walking", effects: {} },
        ],
      },
    },
  },

  /* ============================ AFTERNOON ============================ */
  {
    id: "street-bully",
    location: "streetCorner", time: "afternoon",
    title: "Standing Ground",
    npc: "Bullied Kid", npcEmoji: "🧒",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*Two teenagers have a smaller kid pinned against a wall, laughing. The kid's eyes meet yours.*",
        choices: [
          { label: "Walk straight up: 'Leave him alone.'", effects: { courage: 3, empathy: 2 }, reply: "They turn, sizing you up. One sneers.", next: "s2Brave" },
          { label: "Shout for help — loud as you can", effects: { courage: 1, responsibility: 2 }, reply: "Heads turn from across the street. The bullies tense.", next: "s2Help" },
          { label: "Pull out your phone and start filming", effects: { courage: 2, responsibility: 1 }, reply: "They notice. One yells, 'Hey! Stop!'", next: "s2Film" },
          { label: "Keep walking. Not your fight.", effects: { selfishness: 2, courage: -2 }, reply: "The kid's cry follows you down the block.", next: "s2Coward" },
        ],
      },
      s2Brave: {
        npc: "'Mind your own business, hero.' One steps toward you.",
        choices: [
          { label: "Hold your ground, eyes steady", effects: { courage: 2 }, reply: "Long seconds pass. He scoffs and shoves past you.", next: "s3Save" },
          { label: "'I am minding my business. He's a kid.'", effects: { courage: 2, empathy: 1 }, reply: "Something in your tone makes them hesitate.", next: "s3Save" },
          { label: "Back off slowly", effects: { courage: -2, selfishness: 1 }, reply: "They laugh as you retreat.", next: "s2Coward" },
        ],
      },
      s2Help: {
        npc: "*A shopkeeper steps out. 'Hey! What's going on?' The bullies bolt.*",
        choices: [
          { label: "Run over to check on the kid", effects: { empathy: 2, responsibility: 1 }, reply: "He's shaking, but unhurt.", next: "s3Save" },
          { label: "Tell the shopkeeper what happened", effects: { responsibility: 2, honesty: 1 }, reply: "She nods grimly. 'I'll call his parents.'", next: "s3Save" },
        ],
      },
      s2Film: {
        npc: "They drop the kid and storm toward you. 'Delete that! NOW!'",
        choices: [
          { label: "Stand firm — 'No.'", effects: { courage: 3 }, reply: "They curse and run. The kid is free.", next: "s3Save" },
          { label: "Pretend to delete it", effects: { courage: 1, honesty: -1 }, reply: "They leave satisfied. You still have the video.", next: "s3Save" },
          { label: "Delete it and walk away fast", effects: { courage: -1 }, reply: "Safer this way. The kid limps off alone.", next: "s2Coward" },
        ],
      },
      s2Coward: {
        npc: "*Half a block later, you can still hear the laughter. Then a yelp.*",
        choices: [
          { label: "Turn back and intervene", effects: { courage: 2, empathy: 2, selfishness: -1 }, reply: "Better late than never.", next: "s3Save" },
          { label: "Put in your headphones and walk faster", effects: { selfishness: 2, courage: -2, empathy: -2 }, reply: "The sound fades. The guilt won't." },
        ],
      },
      s3Save: {
        npc: "*The kid wipes his nose.* 'Thank you. Nobody ever stops.'",
        choices: [
          { label: "'Are you hurt? Can I walk you home?'", effects: { empathy: 2, responsibility: 2 } },
          { label: "'You should tell your parents about this.'", effects: { responsibility: 2 } },
          { label: "'It was nothing.' Walk off.", effects: { empathy: -1 } },
        ],
      },
    },
  },

  {
    id: "store-change",
    location: "store", time: "afternoon",
    title: "Too Much Change",
    npc: "Cashier", npcEmoji: "🧑‍💼",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*The cashier hands you a stack of bills. You count it twice — she's given you twenty extra.*",
        choices: [
          { label: "'You gave me too much.'", effects: { honesty: 2 }, reply: "She blinks, then her shoulders sag with relief.", next: "s2Honest" },
          { label: "Slip the bill into your pocket", effects: { honesty: -2, selfishness: 2 }, reply: "She smiles at the next customer, oblivious.", next: "s2Take" },
          { label: "Hand back ten — keep ten", effects: { honesty: -1, selfishness: 1 }, reply: "'Oh — thank you,' she says, confused.", next: "s2Half" },
        ],
      },
      s2Honest: {
        npc: "'Thank you. That would've come out of my paycheck. My third register mistake this month.'",
        choices: [
          { label: "'Tough day? It happens.'", effects: { empathy: 2 }, reply: "Tears well up. 'My mom's in the hospital. I'm just — tired.'", next: "s3Kind" },
          { label: "'Be more careful next time.'", effects: { responsibility: -1 }, reply: "Her face hardens. 'Right. Have a good day.'", next: "s3Cold" },
          { label: "Just smile and leave", effects: { empathy: 1 }, reply: "She watches you go gratefully.", next: "s3Mild" },
        ],
      },
      s2Take: {
        npc: "*Outside, you see a security camera angled right at the register.*",
        choices: [
          { label: "Go back inside and return it", effects: { honesty: 2, courage: 2, selfishness: -1 }, reply: "She thanks you, none the wiser about why.", next: "s3Mild" },
          { label: "Keep walking. It probably isn't recording.", effects: { honesty: -2, courage: -1, selfishness: 1 }, reply: "Your phone vibrates. Unknown number. You ignore it." },
        ],
      },
      s2Half: {
        npc: "She counts the bills slowly. 'Wait — this is still off. You're keeping some?'",
        choices: [
          { label: "Confess and return the rest", effects: { honesty: 1, courage: 1, selfishness: -1 }, reply: "'Thank you for being honest at all.'", next: "s3Mild" },
          { label: "'No — that's all you gave back.'", effects: { honesty: -2, selfishness: 2 }, reply: "She frowns but lets it go." },
        ],
      },
      s3Kind: {
        npc: "She wipes her eyes. 'Sorry. You're the first nice person I've talked to today.'",
        choices: [
          { label: "'I hope your mom gets better.'", effects: { empathy: 2 } },
          { label: "Leave her a small tip", effects: { empathy: 2, responsibility: 1 } },
        ],
      },
      s3Cold: {
        npc: "*She turns to the next customer. The warmth is gone from her face.*",
        choices: [
          { label: "Apologize before leaving", effects: { empathy: 1, courage: 1 } },
          { label: "Leave without a word", effects: { empathy: -1 } },
        ],
      },
      s3Mild: {
        npc: "'Have a good rest of your day,' she says, meaning it.",
        choices: [
          { label: "'You too. Take care.'", effects: { empathy: 1 } },
        ],
      },
    },
  },

  {
    id: "cafe-friend",
    location: "cafe", time: "afternoon",
    title: "A Friend in Pieces",
    npc: "Best Friend", npcEmoji: "🧑‍🤝‍🧑",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*Your phone rings. It's your best friend — sobbing.* 'Can you come? Right now? I — I can't be alone.'",
        choices: [
          { label: "'I'm on my way. Don't move.'", effects: { empathy: 3, responsibility: 1 }, reply: "You hear her breathe out for the first time.", next: "s2Go" },
          { label: "'Can it wait until tomorrow?'", effects: { empathy: -2, selfishness: 2 }, reply: "Silence. Then: 'Yeah. Okay.' Click.", next: "s2Skip" },
          { label: "'Where are you? Talk to me.'", effects: { empathy: 1 }, reply: "'Just — please come. I'll explain when you're here.'", next: "s2Maybe" },
        ],
      },
      s2Go: {
        npc: "*You find her on her kitchen floor, surrounded by torn photographs.* 'He cheated. For months.'",
        choices: [
          { label: "Sit beside her in silence", effects: { empathy: 3 }, reply: "She rests her head on your shoulder.", next: "s3Good" },
          { label: "'What a monster. Tell me everything.'", effects: { empathy: 2, courage: 1 }, reply: "She talks for an hour. You listen to every word.", next: "s3Good" },
          { label: "'You'll get over him. Let's go out.'", effects: { empathy: -1 }, reply: "She pulls back. 'I don't want to go out. I want you to listen.'", next: "s3Mid" },
        ],
      },
      s2Maybe: {
        npc: "'I just found out my dad's sick. Really sick.'",
        choices: [
          { label: "Drop everything and go to her", effects: { empathy: 3, responsibility: 2, selfishness: -1 }, reply: "You're at her door in fifteen minutes.", next: "s2Go" },
          { label: "Stay on the phone with her", effects: { empathy: 2 }, reply: "You talk for two hours straight.", next: "s3Mid" },
          { label: "'I'll call you back later, okay?'", effects: { empathy: -2, selfishness: 1 }, reply: "She hangs up first.", next: "s3Bad" },
        ],
      },
      s2Skip: {
        npc: "*Hours later, you see her message: 'Don't worry about tomorrow. I figured it out alone.'*",
        choices: [
          { label: "Call her immediately to apologize", effects: { empathy: 2, courage: 1, selfishness: -1 }, reply: "She picks up after four rings.", next: "s3Mid" },
          { label: "Send a quick 'sorry, busy day'", effects: { empathy: -1, honesty: -1 }, reply: "She reads it. No reply.", next: "s3Bad" },
          { label: "Leave it. She'll get over it.", effects: { empathy: -2, selfishness: 2 }, reply: "She doesn't text you for weeks." },
        ],
      },
      s3Good: {
        npc: "Hours later, she's calmer. 'I don't know what I'd do without you.'",
        choices: [
          { label: "'You'd be okay. But I'm glad I'm here.'", effects: { empathy: 2 } },
          { label: "Offer to stay the night", effects: { empathy: 2, responsibility: 2 } },
        ],
      },
      s3Mid: {
        npc: "'Just... don't disappear on me, okay?'",
        choices: [
          { label: "'I won't. I promise.'", effects: { empathy: 2, responsibility: 1 } },
          { label: "'I'll try.'", effects: { honesty: 1 } },
        ],
      },
      s3Bad: {
        npc: "*A week later, mutual friends ask if you two are still close. You don't know what to say.*",
        choices: [
          { label: "Reach out, finally", effects: { empathy: 1, courage: 1, selfishness: -1 } },
          { label: "Let the friendship fade", effects: { empathy: -2, selfishness: 1 } },
        ],
      },
    },
  },

  /* ============================ EVENING ============================ */
  {
    id: "park-lie",
    location: "park", time: "evening",
    title: "The Broken Pot",
    npc: "Stranger's Child", npcEmoji: "🧒",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A small child knocks a stranger's ceramic plant pot off the bench. CRASH. He looks up at you with terror in his eyes.* 'Please don't tell!'",
        choices: [
          { label: "'We have to tell. It was an accident.'", effects: { honesty: 1, responsibility: 1 }, reply: "His lip quivers but he nods.", next: "s2Truth" },
          { label: "'Quick — let's pretend it was the wind.'", effects: { honesty: -2, empathy: 1 }, reply: "You both stand suspiciously still.", next: "s2Lie" },
          { label: "'I'll pay for it. Don't worry.'", effects: { responsibility: 2, empathy: 2 }, reply: "He stares at you like you're a superhero.", next: "s2Pay" },
        ],
      },
      s2Truth: {
        npc: "*The pot's owner walks back from the fountain.* 'My grandmother's pot! What happened?!'",
        choices: [
          { label: "'He bumped it — it was an accident. We're so sorry.'", effects: { honesty: 2, courage: 2 }, reply: "She softens slightly. 'At least someone's honest.'", next: "s3Good" },
          { label: "Let the kid explain himself", effects: { responsibility: 1 }, reply: "He stammers through tears. She kneels to listen.", next: "s3Mild" },
        ],
      },
      s2Lie: {
        npc: "*The owner returns and gasps.* 'Did either of you see what happened?'",
        choices: [
          { label: "'A big dog ran by and knocked it.'", effects: { honesty: -3, courage: -1 }, reply: "Her eyes narrow. 'A dog. Right.'", next: "s3Bad" },
          { label: "Crack — 'Actually... it was him. I'm sorry.'", effects: { honesty: 2, courage: 2, selfishness: -1 }, reply: "The kid looks betrayed. The woman looks grateful.", next: "s3Good" },
          { label: "Stay silent and shrug", effects: { honesty: -1, courage: -2 }, reply: "She sighs. 'Of course no one saw anything.'", next: "s3Bad" },
        ],
      },
      s2Pay: {
        npc: "*The owner returns, sees the pieces, and her eyes well up. 'That was my mother's.'*",
        choices: [
          { label: "Hand her cash to replace it", effects: { responsibility: 2, empathy: 2 }, reply: "'You didn't have to do that,' she whispers.", next: "s3Good" },
          { label: "Offer to repair it together", effects: { empathy: 3, responsibility: 2 }, reply: "She blinks. 'You'd... really do that?'", next: "s3Good" },
        ],
      },
      s3Good: {
        npc: "The child tugs your sleeve. 'You didn't have to help me.'",
        choices: [
          { label: "'But it was the right thing to do.'", effects: { honesty: 1, empathy: 1 } },
          { label: "'Just remember this when someone else needs help.'", effects: { empathy: 2, responsibility: 1 } },
        ],
      },
      s3Mild: {
        npc: "The owner sweeps up the pieces quietly. 'These things happen.'",
        choices: [
          { label: "Help her clean up", effects: { empathy: 1, responsibility: 1 } },
          { label: "Take the kid and leave", effects: {} },
        ],
      },
      s3Bad: {
        npc: "*She notices the kid's guilty face.* 'You're lying to me, aren't you?'",
        choices: [
          { label: "Confess now", effects: { honesty: 1, courage: 1 } },
          { label: "Double down on the lie", effects: { honesty: -3, selfishness: 2 } },
        ],
      },
    },
  },

  {
    id: "school-blame",
    location: "school", time: "evening",
    title: "Whose Fault?",
    npc: "Teacher", npcEmoji: "👩‍🏫",
    startStage: "s1",
    stages: {
      s1: {
        npc: "'The project failed. I need to know — who didn't do their part?' *Her eyes scan the four of you.*",
        choices: [
          { label: "'It was me. I dropped the ball.'", effects: { honesty: 2, responsibility: 3, courage: 2 }, reply: "The room goes still. She studies you carefully.", next: "s2Own" },
          { label: "'It was Maya — she barely said a word.'", effects: { honesty: -3, selfishness: 3 }, reply: "Maya stares at the floor. Her hands shake.", next: "s2Blame" },
          { label: "'Everyone struggled, honestly.'", effects: { honesty: -1, responsibility: -1 }, reply: "The teacher folds her arms. 'Really.'", next: "s2Dodge" },
        ],
      },
      s2Own: {
        npc: "'You realize this means you carry the failing grade alone?'",
        choices: [
          { label: "'Yes. It's fair.'", effects: { responsibility: 3, courage: 2 }, reply: "She nods slowly. 'That takes guts.'", next: "s3Honored" },
          { label: "'Wait — can we make it up somehow?'", effects: { responsibility: 2 }, reply: "'I'll consider it. Come see me tomorrow.'", next: "s3Honored" },
          { label: "Backtrack: 'Well, others helped too...'", effects: { honesty: -2, courage: -2 }, reply: "Her face hardens. The trust evaporates.", next: "s3Lost" },
        ],
      },
      s2Blame: {
        npc: "*Maya finally speaks, voice trembling: 'I gave you my whole research file last week. You never opened it.'*",
        choices: [
          { label: "Confess immediately", effects: { honesty: 3, courage: 3, selfishness: -2 }, reply: "The teacher exhales. 'Now we're somewhere.'", next: "s3Redeem" },
          { label: "'She's lying. I never got that file.'", effects: { honesty: -3, courage: -2, selfishness: 3 }, reply: "Maya begins to cry. The teacher pulls out her laptop.", next: "s3Worse" },
        ],
      },
      s2Dodge: {
        npc: "'I'll be checking the document history. Anything you want to tell me before I do?'",
        choices: [
          { label: "Confess everything now", effects: { honesty: 2, courage: 2, selfishness: -1 }, reply: "She closes the laptop. 'Thank you for telling me.'", next: "s3Redeem" },
          { label: "Stay silent", effects: { honesty: -2, courage: -1 }, reply: "She opens the laptop. The truth surfaces anyway.", next: "s3Worse" },
        ],
      },
      s3Honored: {
        npc: "After class, she stops you. 'I've taught here twenty years. Few students would do what you did.'",
        choices: [
          { label: "'I just didn't want Maya blamed.'", effects: { empathy: 2 } },
          { label: "'It was my mess to clean up.'", effects: { responsibility: 2 } },
        ],
      },
      s3Redeem: {
        npc: "Maya catches you in the hall. 'Why did you tell the truth?'",
        choices: [
          { label: "'Because you didn't deserve it.'", effects: { empathy: 2, honesty: 1 } },
          { label: "'Because I couldn't live with the lie.'", effects: { honesty: 2 } },
        ],
      },
      s3Lost: {
        npc: "She emails you that evening: 'I'm disappointed. We'll talk again Monday.'",
        choices: [
          { label: "Reply with a full apology", effects: { honesty: 1, courage: 1 } },
          { label: "Don't reply", effects: { honesty: -1, responsibility: -1 } },
        ],
      },
      s3Worse: {
        npc: "*The whole class hears Maya being apologized to. Your name is mud.*",
        choices: [
          { label: "Apologize publicly", effects: { honesty: 1, courage: 2, selfishness: -2 } },
          { label: "Avoid Maya forever", effects: { selfishness: 2, honesty: -1 } },
        ],
      },
    },
  },

  {
    id: "home-promise",
    location: "home", time: "evening",
    title: "The Promise",
    npc: "Younger Sibling", npcEmoji: "🧒",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*Your little sister is waiting on the couch with her math textbook open.* 'You promised you'd help me tonight!'",
        choices: [
          { label: "'You're right. Let's do it.'", effects: { responsibility: 3, empathy: 2 }, reply: "Her whole face lights up.", next: "s2Keep" },
          { label: "'Just give me twenty minutes to rest first.'", effects: { responsibility: 1 }, reply: "'Okay! I'll wait!' She watches the clock.", next: "s2Delay" },
          { label: "'Not tonight. I'm exhausted.'", effects: { responsibility: -2, selfishness: 1 }, reply: "Her eyes drop. 'You said that yesterday too.'", next: "s2Break" },
        ],
      },
      s2Keep: {
        npc: "*Halfway through, she pushes the book away.* 'I'm so stupid. I'll never get this.'",
        choices: [
          { label: "'You're not stupid. We'll go slower.'", effects: { empathy: 3, responsibility: 2 }, reply: "She tries again, biting her lip in concentration.", next: "s3Win" },
          { label: "'Just memorize the formula for now.'", effects: { responsibility: 1 }, reply: "She does. Tomorrow she'll forget it.", next: "s3Mid" },
          { label: "'Maybe ask the teacher for tutoring.'", effects: { empathy: -1, responsibility: -1 }, reply: "'I asked you,' she says quietly.", next: "s3Mid" },
        ],
      },
      s2Delay: {
        npc: "*Twenty minutes turn into an hour. You hear her sigh.*",
        choices: [
          { label: "Get up and go to her", effects: { responsibility: 2, empathy: 1, selfishness: -1 }, reply: "'I thought you forgot,' she whispers.", next: "s2Keep" },
          { label: "Call out: 'Just a bit longer!'", effects: { responsibility: -1, honesty: -1 }, reply: "She closes the book and goes to bed.", next: "s3Bad" },
          { label: "Fall asleep on the couch", effects: { responsibility: -2, empathy: -2 }, reply: "When you wake, she's already asleep, homework unfinished." },
        ],
      },
      s2Break: {
        npc: "*She closes the book quietly and stands up.* 'It's okay. I'll figure it out.'",
        choices: [
          { label: "Get up — 'No, come here. I'll help.'", effects: { responsibility: 2, empathy: 2, selfishness: -1 }, reply: "She hugs you tight.", next: "s2Keep" },
          { label: "'Thanks for understanding.'", effects: { responsibility: -2, empathy: -2, selfishness: 2 }, reply: "She nods and walks slowly to her room." },
        ],
      },
      s3Win: {
        npc: "*Two hours later, she finishes the last problem and beams.* 'I did it! I actually did it!'",
        choices: [
          { label: "'You did it yourself. I just sat here.'", effects: { empathy: 2, honesty: 1 } },
          { label: "'I'm proud of you, kiddo.'", effects: { empathy: 2 } },
          { label: "Promise to help every night this week", effects: { responsibility: 3, empathy: 1 } },
        ],
      },
      s3Mid: {
        npc: "She closes the book. 'Thanks for trying, I guess.'",
        choices: [
          { label: "'Tomorrow we'll do better.'", effects: { responsibility: 1 } },
          { label: "Stay up late finishing the rest with her", effects: { responsibility: 2, empathy: 2 } },
        ],
      },
      s3Bad: {
        npc: "*In the morning, her test paper sits on the table with a big red 4/10. She avoids your eyes.*",
        choices: [
          { label: "Apologize sincerely", effects: { empathy: 2, honesty: 1, responsibility: 1, selfishness: -1 } },
          { label: "'Maybe you should've studied more.'", effects: { empathy: -3, selfishness: 2 } },
        ],
      },
    },
  },
];

export function scenarioFor(loc: LocationId, time: TimePeriod): Scenario | undefined {
  return SCENARIOS.find((s) => s.location === loc && s.time === time);
}
