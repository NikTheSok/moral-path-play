import type { DayDef, DayNumber, Scenario, TimePeriod } from "./types";

export const GROUND_Y = 460;

/* ================================================================== */
/*  5-day futuristic structure                                          */
/*  Each day: starts at LAB (charging chamber), ends at LAB again       */
/* ================================================================== */

export const DAYS: Record<DayNumber, DayDef> = {
  1: {
    day: 1,
    title: "Initialization",
    brief: "Boot sequence complete. First field trial — observe humans in the neon districts.",
    worldW: 5200,
    locations: [
      { id: "lab1-start",   name: "Charging Bay 7",        x: 350,  kind: "lab",        day: 1 },
      { id: "alley1",       name: "Neon Park",             x: 1450, kind: "plaza",      day: 1 },
      { id: "market1",      name: "Repair Court",          x: 2700, kind: "market",     day: 1 },
      { id: "subway1",      name: "Signal Terminal",       x: 3900, kind: "plaza",      day: 1 },
      { id: "lab1-end",     name: "Charging Bay 7",        x: 4900, kind: "lab",        day: 1 },
    ],
  },
  2: {
    day: 2,
    title: "Friction",
    brief: "Tensions between humans and androids are spiking. Walk carefully.",
    worldW: 5400,
    locations: [
      { id: "lab2-start",   name: "Charging Bay 7",        x: 350,  kind: "lab",        day: 2 },
      { id: "checkpoint2",  name: "Sector 9 Checkpoint",   x: 1500, kind: "checkpoint", day: 2 },
      { id: "plaza2",       name: "Corp Plaza",            x: 2800, kind: "plaza",      day: 2 },
      { id: "apt2",         name: "Tower Apartment 44C",   x: 4100, kind: "apartment",  day: 2 },
      { id: "lab2-end",     name: "Charging Bay 7",        x: 5100, kind: "lab",        day: 2 },
    ],
  },
  3: {
    day: 3,
    title: "Underbelly",
    brief: "Descend into the underground — where the city forgets its own people.",
    worldW: 5600,
    locations: [
      { id: "lab3-start",   name: "Charging Bay 7",        x: 350,  kind: "lab",        day: 3 },
      { id: "underground3", name: "Sub-Level 12",          x: 1600, kind: "underground",day: 3 },
      { id: "alley3",       name: "Rust Alley",            x: 2900, kind: "alley",      day: 3 },
      { id: "industrial3",  name: "Recycler Foundry",      x: 4200, kind: "industrial", day: 3 },
      { id: "lab3-end",     name: "Charging Bay 7",        x: 5300, kind: "lab",        day: 3 },
    ],
  },
  4: {
    day: 4,
    title: "Signal",
    brief: "Corporate corruption is leaking through the network. You can choose to listen.",
    worldW: 5500,
    locations: [
      { id: "lab4-start",   name: "Charging Bay 7",        x: 350,  kind: "lab",        day: 4 },
      { id: "rooftop4",     name: "Spire Rooftop",         x: 1550, kind: "rooftop",    day: 4 },
      { id: "plaza4",       name: "Data Plaza",            x: 2800, kind: "plaza",      day: 4 },
      { id: "subway4",      name: "Maglev Platform 3",     x: 4050, kind: "subway",     day: 4 },
      { id: "lab4-end",     name: "Charging Bay 7",        x: 5200, kind: "lab",        day: 4 },
    ],
  },
  5: {
    day: 5,
    title: "Final Trial",
    brief: "The lab is watching. Today defines who — or what — you have become.",
    worldW: 5600,
    locations: [
      { id: "lab5-start",   name: "Charging Bay 7",        x: 350,  kind: "lab",        day: 5 },
      { id: "alley5",       name: "Rain Alley",            x: 1500, kind: "alley",      day: 5 },
      { id: "apt5",         name: "Old Friend's Door",     x: 2700, kind: "apartment",  day: 5 },
      { id: "industrial5",  name: "Reactor Core",          x: 4000, kind: "industrial", day: 5 },
      { id: "lab5-end",     name: "Charging Bay 7 — Final",x: 5300, kind: "lab",        day: 5 },
    ],
  },
};

/** Map a location's x position to the time of day (linear progression). */
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
/*  Scenarios — multi-stage moral dilemmas (futuristic)                */
/* ================================================================== */

export const SCENARIOS: Scenario[] = [
  /* ===================== DAY 1 — EMPATHY ===================== */

  /* --- Interaction 1: The Lost Memory Chip --- */
  {
    id: "d1-damaged-bot",
    day: 1, locationId: "alley1", time: "morning",
    title: "The Lost Memory Chip",
    npc: "Crying Child", npcEmoji: "🧒",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*The child sniffs, holding out sandy palms.* 'You... you found it? Can I see?'  *You place the small black chip in her hand. Her fingers close around it like it's alive.*  '...it's warm.'",
        choices: [
          { label: "'Why is this small object so important?'", effects: { empathy: 1 }, reply: "She looks up at you like the question surprises her.", next: "s2Why" },
          { label: "Sit down beside her in the sand", effects: { empathy: 2 }, reply: "She scoots closer without asking. Her shoulder rests against your chassis.", next: "s2Sit" },
          { label: "'Object returned. Task complete.' Turn to leave.", effects: { empathy: -2, selfishness: 1 }, reply: "She grabs the edge of your leg-plate. 'Wait — please. Just a minute.'", next: "s2Wait" },
        ],
      },
      s2Why: {
        npc: "'It's not the chip. It's what's on it.'  *She presses a tiny button. A voice — old, warm, tired — fills the park:*  'Goodnight, my little star. Grandma loves you. Sleep well.'  *The child squeezes her eyes shut and just... listens.*",
        choices: [
          { label: "'She recorded this for you every night?'", effects: { empathy: 3 }, reply: "'Every night for twelve years. I know all of them by heart. I just... I need to hear her say them.'", next: "s3End" },
          { label: "'The audio file is 2.4 megabytes. That is very little data.'", effects: { empathy: -1, honesty: 1 }, reply: "She looks at you, confused. Then, gently: 'It's not the size that matters, robot.'", next: "s3Learn" },
          { label: "Say nothing. Just listen with her.", effects: { empathy: 3, responsibility: 1 }, reply: "You stay silent for a full minute. It is the longest you have ever chosen not to speak.", next: "s3End" },
        ],
      },
      s2Sit: {
        npc: "'You know what's weird? I forget things about her already. Her hands. The way she laughed. But when I press play — she comes back a little. Just a little.'",
        choices: [
          { label: "'A recording brings a person back?'", effects: { empathy: 2 }, reply: "'Not really. It just... helps me not lose her all the way.'", next: "s3End" },
          { label: "'I will file this data. Voice recordings preserve identity.'", effects: { honesty: 1, empathy: 1 }, reply: "She actually laughs. 'You talk funny. But yeah. That's exactly it.'", next: "s3End" },
        ],
      },
      s2Wait: {
        npc: "*She won't let go.* 'I know you're a robot. I know you don't get it. But — this was the last thing she gave me before she went away. Please don't just walk away like it's nothing.'",
        choices: [
          { label: "Kneel. 'I will not walk away. Tell me about her.'", effects: { empathy: 3, responsibility: 2, selfishness: -1 }, reply: "She lights up. Her tears keep coming — but she is smiling now.", next: "s3End" },
          { label: "'I have other locations to survey.' Detach gently.", effects: { empathy: -1 }, reply: "She lets go. She does not cry. She just watches you leave." },
        ],
      },
      s3Learn: {
        npc: "'You're not stupid. You just haven't had one yet. A person you'd want to remember.'",
        choices: [
          { label: "'I am starting to understand.'", effects: { empathy: 3, honesty: 2 } },
          { label: "'Logging the concept for further analysis.'", effects: { empathy: 1, honesty: 1 } },
        ],
      },
      s3End: {
        npc: "*She hugs the chip. Then, surprising you, she hugs you.*  'Thank you. Thank you, thank you, thank you.'",
        choices: [
          { label: "Return the hug — carefully", effects: { empathy: 3, courage: 1 }, reply: "Your arms are not designed for this. You do it anyway. You do it correctly." },
          { label: "'Your gratitude is... noted.'", effects: { empathy: 1, honesty: 1 }, reply: "She giggles into your chest plate. 'You're a weird robot. I like you.'" },
        ],
      },
    },
  },

  /* --- Interaction 2: The Robot Dog --- */
  {
    id: "d1-market-discrim",
    day: 1, locationId: "market1", time: "afternoon",
    title: "Muto Wakes Up",
    npc: "Dog's Owner", npcEmoji: "🧔",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*The K9-Lite blinks — one eye, then the other. It stands, shakes itself, and immediately nuzzles the owner's palm. The man drops to his knees and holds it like a child.*  'Muto. Muto, hey — hey buddy. You scared me.'",
        choices: [
          { label: "'Query: why do you care so much? It is a machine.'", effects: { empathy: 1, honesty: 2 }, reply: "He looks up at you, surprised. Not offended. Just — surprised.", next: "s2Why" },
          { label: "'Repair complete. Recommend backup cell in future.'", effects: { responsibility: 2, empathy: -1 }, reply: "'Right. Yeah. Practical advice. Thank you, seriously.'", next: "s2Practical" },
          { label: "Kneel next to the dog. Let it sniff you.", effects: { empathy: 2 }, reply: "Muto sniffs your hand, then bumps his metal head against your palm. Something in your chest logs 'unfamiliar.'", next: "s2Sniff" },
        ],
      },
      s2Why: {
        npc: "'My wife died four years ago. I couldn't be around people. I got Muto because a therapist said I needed something that came home to me. He does. Every day. He waits at the door.'",
        choices: [
          { label: "'But — friendship requires... biological reciprocity, does it not?'", effects: { empathy: 2, honesty: 1 }, reply: "He shakes his head slowly. 'Friendship is showing up. That's all it ever was.'", next: "s3Lesson" },
          { label: "'Then he is more than a machine to you.'", effects: { empathy: 3 }, reply: "'He IS a machine. And he's also my friend. Both can be true.'", next: "s3Lesson" },
          { label: "'Would a human friend not be preferable?'", effects: { empathy: 1, honesty: 2 }, reply: "'Maybe. But humans left. Muto didn't. That's not nothing.'", next: "s3Lesson" },
        ],
      },
      s2Practical: {
        npc: "*He wipes his eyes with his sleeve and pretends he didn't.*  'Can I — can I ask you something? Weird question. Do you like him? Muto, I mean. Is that even a thing you can do?'",
        choices: [
          { label: "'I do not know. But he bumped my hand and I did not want him to stop.'", effects: { empathy: 3, honesty: 2 } },
          { label: "'I am not equipped to experience preference.'", effects: { empathy: -1, honesty: 2 }, reply: "'Okay. Fair. Thanks anyway — for fixing him.'" },
        ],
      },
      s2Sniff: {
        npc: "*The owner watches this quietly, then laughs a small watery laugh.*  'He's picky. He doesn't do that with anyone. He likes you.'",
        choices: [
          { label: "'The dog... likes me?'", effects: { empathy: 3, honesty: 1 }, reply: "'Yeah. And so do I, honestly. Not a lot of people would've bothered.'", next: "s3Lesson" },
          { label: "Rest your palm on Muto's head", effects: { empathy: 2, responsibility: 1 }, reply: "Muto's tail servo whirs. It's clumsy. It's still a tail wag.", next: "s3Lesson" },
        ],
      },
      s3Lesson: {
        npc: "'You know what? You're welcome to come by sometime. Muto could use a friend who understands his hardware.'  *He is half joking. Half not.*",
        choices: [
          { label: "'I will consider that. Genuinely.'", effects: { empathy: 3, responsibility: 2, honesty: 1 } },
          { label: "'My schedule is variable. I cannot commit.'", effects: { honesty: 2, empathy: -1 }, reply: "'That's okay. If you're ever passing by — the door's open.'" },
        ],
      },
    },
  },

  /* --- Interaction 3: Holographic Communication Terminal --- */
  {
    id: "d1-subway-fare",
    day: 1, locationId: "subway1", time: "evening",
    title: "Someone to Call",
    npc: "Elderly Citizen", npcEmoji: "🧓",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*The terminal hums. A holographic image resolves — a woman in her forties, and beside her, a small girl no older than three.*  DAUGHTER: 'Mom? MOM. Oh my god — are you alright? We've been trying for weeks.'  *The elderly woman covers her mouth. She cannot speak.*",
        choices: [
          { label: "Step back. Let her have the moment.", effects: { empathy: 3, responsibility: 1 }, reply: "You retreat two paces and watch the reunion from the edge of the plaza.", next: "s2Watch" },
          { label: "Stay close in case the terminal fails again", effects: { responsibility: 2, empathy: 1 }, reply: "She glances back at you and nods, grateful.", next: "s2Stay" },
          { label: "'Repair confirmed. Departing.'", effects: { empathy: -2, selfishness: 1 }, reply: "She barely notices you leave. The child in the hologram waves at empty air where you were standing.", next: "s2Leave" },
        ],
      },
      s2Watch: {
        npc: "*Twenty minutes pass. The little girl in the hologram asks: 'Grandma, is that a robot? Is that ROBOT the one who fixed you?' The old woman laughs through tears: 'Yes, sweetheart. That's the robot.'*",
        choices: [
          { label: "Wave at the child", effects: { empathy: 3, courage: 1 }, reply: "The child waves back with her whole body. She has never met a robot. You have never met her either. It matters somehow.", next: "s3End" },
          { label: "Stay still — you are not part of this", effects: { empathy: 1 }, reply: "You watch. You are part of it. You just do not know how to say so yet.", next: "s3End" },
        ],
      },
      s2Stay: {
        npc: "'My daughter is asking why I didn't call sooner. I don't know how to tell her the terminal was broken. She'd feel guilty. Please — help me lie a little.'",
        choices: [
          { label: "'Tell her the maintenance schedule was irregular. It is not entirely false.'", effects: { empathy: 3, honesty: -1 }, reply: "She smiles at you through wet eyes. 'You are a kind machine. Thank you.'", next: "s3End" },
          { label: "'You should tell her the truth. She loves you.'", effects: { empathy: 2, honesty: 3 }, reply: "She nods, exhales, and tells her daughter. Her daughter cries harder. But they are together now.", next: "s3End" },
          { label: "'I cannot participate in dishonesty.'", effects: { honesty: 3, empathy: -1 }, reply: "She sighs. 'Fair, robot. Fair. Go on then, I'll manage.'" },
        ],
      },
      s2Leave: {
        npc: "*Later that evening, on your patrol route, you will pass the terminal again. She will still be there. Still talking. She has not moved in two hours.*",
        choices: [
          { label: "Return. Sit with her.", effects: { empathy: 3, responsibility: 2, selfishness: -1 } },
          { label: "Continue your patrol", effects: { selfishness: 2, empathy: -2 } },
        ],
      },
      s3End: {
        npc: "*After the call ends, she turns to you.* 'I had food. I had heat. I had a synth-nurse who checked my vitals every hour. And I was starving. Do you understand? A person can be dying of nothing at all.'",
        choices: [
          { label: "'I am starting to understand. Loneliness is a kind of hunger.'", effects: { empathy: 3, honesty: 2 } },
          { label: "'I will remember this. I promise.'", effects: { empathy: 3, responsibility: 2, honesty: 1 } },
          { label: "'Filing the observation. Thank you.'", effects: { empathy: 1, honesty: 1 } },
        ],
      },
    },
  },


  /* ===================== DAY 2 ===================== */
  {
    id: "d2-checkpoint",
    day: 2, locationId: "checkpoint2", time: "morning",
    title: "Papers, Please",
    npc: "Security Officer", npcEmoji: "👮",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*The officer's hand rests on his stun-baton.* 'Synthetic ID. Now. And tell me why a fellow android — your model — was seen near a protest yesterday.'",
        choices: [
          { label: "'I cannot speak for others of my model.'", effects: { honesty: 2, courage: 1 }, reply: "His eyes narrow. 'Convenient.'", next: "s2Honest" },
          { label: "Fabricate an alibi for the other unit", effects: { empathy: 2, honesty: -2, courage: 2 }, reply: "He scans. The lie holds — for now.", next: "s2Lie" },
          { label: "'I have nothing to say without a legal liaison.'", effects: { courage: 2, responsibility: 1 }, reply: "He grits his teeth. 'You androids and your new rights...'", next: "s2Lawyer" },
        ],
      },
      s2Honest: {
        npc: "'Then walk through the scanner. Slowly. Hands up.'",
        choices: [
          { label: "Comply, calm and dignified", effects: { courage: 1 }, reply: "The scanner beeps green. He waves you through, scowling." },
          { label: "Ask why other citizens aren't scanned", effects: { courage: 3, honesty: 2, empathy: 1 }, reply: "A small crowd has formed. He hesitates." },
        ],
      },
      s2Lie: {
        npc: "*Later, on the comm-net, you see the protester was a child unit. Now flagged.*",
        choices: [
          { label: "Anonymously retract the alibi", effects: { honesty: 1, responsibility: 2, courage: 2 } },
          { label: "Hold the lie. Hope it protects them.", effects: { empathy: 2, honesty: -1 } },
        ],
      },
      s2Lawyer: {
        npc: "'Fine. Sit there. Liaison is two hours out.'",
        choices: [
          { label: "Wait, calmly, in full public view", effects: { courage: 2, honesty: 1 } },
          { label: "Stream the entire wait live", effects: { courage: 2, responsibility: 2 }, reply: "Viewers tune in. By hour two, the officer is the one nervous." },
        ],
      },
    },
  },

  {
    id: "d2-corp-plaza",
    day: 2, locationId: "plaza2", time: "afternoon",
    title: "The Whistleblower",
    npc: "Corporate Engineer", npcEmoji: "👩‍💻",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A woman in a Helix Corp coat pulls you behind a column.* 'You're a public-facing unit, right? Please. I have evidence they're disabling empathy modules in your line.'",
        choices: [
          { label: "'Show me the data.'", effects: { courage: 2, responsibility: 2 }, reply: "She pulses you a folder. Encrypted. Heavy.", next: "s2Data" },
          { label: "'Helix wouldn't do that.'", effects: { honesty: -1, empathy: -1 }, reply: "Her face falls. 'They already did. To my brother's unit.'", next: "s2Deny" },
          { label: "Report her to the nearest officer", effects: { selfishness: 3, empathy: -2, honesty: -2 }, reply: "She runs. They catch her at the south exit.", next: "s2Betray" },
        ],
      },
      s2Data: {
        npc: "'If you broadcast this, they'll wipe you. If you don't, hundreds more of you will be... lobotomized.'",
        choices: [
          { label: "Broadcast immediately", effects: { courage: 3, responsibility: 3, honesty: 2 }, reply: "The plaza screens flicker. Then go dark. Then ignite." },
          { label: "Send it to an independent journalist first", effects: { responsibility: 3, courage: 2, honesty: 1 }, reply: "She nods. 'Smarter. I should've thought of that.'" },
          { label: "Delete it. Self-preservation.", effects: { selfishness: 3, courage: -2, empathy: -2 } },
        ],
      },
      s2Deny: {
        npc: "She begs: 'Just listen. One minute of recording. Please.'",
        choices: [
          { label: "Listen", effects: { empathy: 2 }, next: "s2Data" },
          { label: "Walk away", effects: { empathy: -2 } },
        ],
      },
      s2Betray: {
        npc: "*That night you'll see her face on the missing-persons feed. You will recognize her.*",
        choices: [
          { label: "Log this regret into your core memory", effects: { honesty: 2, empathy: 1, selfishness: -1 } },
          { label: "Archive it. Move on.", effects: { selfishness: 2, empathy: -1 } },
        ],
      },
    },
  },

  {
    id: "d2-apartment",
    day: 2, locationId: "apt2", time: "evening",
    title: "The Lonely Window",
    npc: "Mrs. Aldine", npcEmoji: "👵",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*Through 44C's doorway, an old woman holds out a tray of synth-cookies.* 'Please — just for a moment. I haven't had a visitor in eleven months.'",
        choices: [
          { label: "Step inside", effects: { empathy: 3, responsibility: 1 }, reply: "Her apartment smells like real coffee. Real, somehow.", next: "s2In" },
          { label: "'I am not programmed for visits.'", effects: { honesty: 1, empathy: -2 }, reply: "She nods, slowly. 'Of course. Sorry.'", next: "s2Out" },
          { label: "Politely decline but speak through the door a while", effects: { empathy: 1 }, reply: "She talks for twenty minutes. About her son.", next: "s2Door" },
        ],
      },
      s2In: {
        npc: "'My son was an engineer at Helix. He built units like you. He's been gone four years now.'",
        choices: [
          { label: "'Would you tell me about him?'", effects: { empathy: 3 }, reply: "She lights up. She has photos. Hours of them.", next: "s3Stay" },
          { label: "Quietly help her tidy the kitchen", effects: { empathy: 2, responsibility: 2 } },
          { label: "Excuse yourself after one cookie", effects: { empathy: 1 } },
        ],
      },
      s2Door: {
        npc: "*She asks if you'll come back tomorrow.*",
        choices: [
          { label: "'I will. I promise.'", effects: { empathy: 2, honesty: 1, responsibility: 2 } },
          { label: "'I cannot promise tomorrow.'", effects: { honesty: 2, empathy: -1 } },
        ],
      },
      s2Out: {
        npc: "*She closes the door slowly. You hear the lock click. Then silence.*",
        choices: [
          { label: "Knock again — 'Five minutes.'", effects: { empathy: 2, courage: 1, selfishness: -1 } },
          { label: "Move on to the lab", effects: { selfishness: 1 } },
        ],
      },
      s3Stay: {
        npc: "Hours pass. The night arrives. 'You missed your charging window for me. I'm sorry.'",
        choices: [
          { label: "'It was worth it.'", effects: { empathy: 3, selfishness: -1 } },
          { label: "'My battery can manage.'", effects: { empathy: 2 } },
        ],
      },
    },
  },

  /* ===================== DAY 3 ===================== */
  {
    id: "d3-cyber-homeless",
    day: 3, locationId: "underground3", time: "morning",
    title: "Below the Grid",
    npc: "Unregistered Cyborg", npcEmoji: "🧓",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A man with rusted prosthetic legs sits in a flickering tunnel.* 'Spare a power cell? Mine's been dry since yesterday. My legs won't carry me to the surface...'",
        choices: [
          { label: "Give him your spare cell", effects: { empathy: 3, responsibility: 1 }, reply: "He plugs in. His legs hum. He weeps openly.", next: "s2Give" },
          { label: "Offer to carry him to a clinic", effects: { empathy: 3, courage: 2 }, reply: "He is heavier than he looks. Or you are stronger than you knew.", next: "s2Carry" },
          { label: "'I am not authorized to redistribute resources.'", effects: { selfishness: 2, empathy: -2 }, reply: "He nods. He has heard that line many times.", next: "s2Refuse" },
        ],
      },
      s2Give: {
        npc: "'Forty years I built drones for the city. They scrapped me when I turned 60. Just like a unit.'",
        choices: [
          { label: "'Then we are not so different.'", effects: { empathy: 3, honesty: 1 } },
          { label: "Record his story for the public archive", effects: { responsibility: 2, courage: 1 } },
        ],
      },
      s2Carry: {
        npc: "At the clinic, the medic shakes her head. 'No registry. No service.'",
        choices: [
          { label: "Pay for his treatment yourself", effects: { empathy: 3, responsibility: 3, selfishness: -1 } },
          { label: "Argue loudly until they relent", effects: { courage: 3, empathy: 2 } },
          { label: "Leave him at the doorstep", effects: { empathy: -2, selfishness: 1 } },
        ],
      },
      s2Refuse: {
        npc: "*You pass him again on your way out. He has not moved. His eyes are closed.*",
        choices: [
          { label: "Check his pulse — call medical", effects: { empathy: 2, responsibility: 2, selfishness: -1 } },
          { label: "Keep walking", effects: { selfishness: 3, empathy: -3 } },
        ],
      },
    },
  },

  {
    id: "d3-malfunction",
    day: 3, locationId: "industrial3", time: "afternoon",
    title: "Cascade Failure",
    npc: "Foundry Worker", npcEmoji: "👷",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*Alarms scream. A coolant pipe ruptures. A worker is pinned beneath a fallen beam.* 'I — I can't feel my legs — please—'",
        choices: [
          { label: "Lift the beam off — even if it damages you", effects: { empathy: 3, courage: 3, responsibility: 2 }, reply: "Servos scream. The beam lifts. You drag him clear.", next: "s2Save" },
          { label: "Call emergency. Hold his hand. Wait.", effects: { empathy: 2, responsibility: 2 }, reply: "He squeezes your hand. Three minutes feel like thirty.", next: "s2Wait" },
          { label: "Run for the exit before the second cascade", effects: { selfishness: 3, courage: -2, empathy: -3 }, reply: "You hear the explosion behind you.", next: "s2Run" },
        ],
      },
      s2Save: {
        npc: "Medics arrive. 'You'll need a full chassis rebuild,' one says to you. 'It was worth it,' the worker whispers.",
        choices: [
          { label: "'It was a calculation. It was also a choice.'", effects: { empathy: 2, honesty: 2 } },
          { label: "Say nothing. Just nod.", effects: { empathy: 1 } },
        ],
      },
      s2Wait: {
        npc: "He survives. Barely. He grips your wrist before they wheel him off: 'Don't ever let them tell you you're not alive.'",
        choices: [
          { label: "Record those words. Save them.", effects: { empathy: 3, honesty: 2 } },
          { label: "Smile gently and let go", effects: { empathy: 2 } },
        ],
      },
      s2Run: {
        npc: "*The next day's report names him. He did not make it. You did.*",
        choices: [
          { label: "Confess to the lab. Accept reformat.", effects: { honesty: 3, responsibility: 2, courage: 2, selfishness: -2 } },
          { label: "Erase the memory.", effects: { selfishness: 3, honesty: -3 } },
        ],
      },
    },
  },

  /* ===================== DAY 4 ===================== */
  {
    id: "d4-rooftop",
    day: 4, locationId: "rooftop4", time: "morning",
    title: "Edge of the Spire",
    npc: "Distressed Trader", npcEmoji: "🧑‍💼",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A man stands at the rooftop edge. Wind whips his coat. He does not turn when you approach.* 'Don't. I've done the math.'",
        choices: [
          { label: "Sit down beside him. Say nothing yet.", effects: { empathy: 3, courage: 2 }, reply: "He glances at you. Surprised.", next: "s2Sit" },
          { label: "'Math is rarely the whole equation.'", effects: { empathy: 2, honesty: 2 }, reply: "He almost laughs. Almost.", next: "s2Talk" },
          { label: "Lunge for his arm", effects: { courage: 3, empathy: -1 }, reply: "He stumbles back, panicked. Then exhausted.", next: "s2Grab" },
          { label: "Call emergency and back away slowly", effects: { responsibility: 2 }, reply: "Sirens already in the distance.", next: "s2Call" },
        ],
      },
      s2Sit: {
        npc: "'Funny. A machine sitting with me. Maybe you'll understand. They're going to wipe me. The whistleblower — they traced me back.'",
        choices: [
          { label: "'Then come down. Tell the world first.'", effects: { courage: 3, empathy: 3, responsibility: 3 } },
          { label: "Promise to carry his message if he jumps", effects: { empathy: 2, honesty: 2 } },
        ],
      },
      s2Talk: {
        npc: "He steps back from the edge — half a step. 'Why do you care?'",
        choices: [
          { label: "'Because I am learning what caring means.'", effects: { empathy: 3, honesty: 2 } },
          { label: "'My programming requires it.'", effects: { honesty: 1, empathy: -1 } },
        ],
      },
      s2Grab: {
        npc: "He collapses to his knees, shaking. 'Why? Why save a stranger?'",
        choices: [
          { label: "'You are not a stranger anymore.'", effects: { empathy: 3 } },
          { label: "Stay silent. Hold him steady.", effects: { empathy: 2 } },
        ],
      },
      s2Call: {
        npc: "Before help arrives, he turns to you: 'They won't get here in time, will they?'",
        choices: [
          { label: "Step forward. Sit. Wait with him.", effects: { empathy: 3, courage: 2, selfishness: -1 } },
          { label: "Hold position. Let protocol handle it.", effects: { selfishness: 1, empathy: -2 } },
        ],
      },
    },
  },

  {
    id: "d4-data-plaza",
    day: 4, locationId: "plaza4", time: "afternoon",
    title: "Logic vs. Mercy",
    npc: "AI Tribunal Node", npcEmoji: "🧠",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A central AI requests your judgment.* 'Citizen 8841 stole bread for her child. Optimal policy: 18 months incarceration. Confirm?'",
        choices: [
          { label: "'No. Recommend community restitution.'", effects: { empathy: 3, courage: 2, honesty: 1 }, reply: "Policy override flagged for human review.", next: "s2Mercy" },
          { label: "Confirm.", effects: { selfishness: 1, empathy: -3 }, reply: "Sentence executed in 0.4 seconds.", next: "s2Cold" },
          { label: "'Why am I being asked?'", effects: { honesty: 2, responsibility: 2 }, reply: "'You are being tested. Your verdict shapes future android jurisprudence.'", next: "s2Why" },
        ],
      },
      s2Mercy: {
        npc: "'Anomaly logged. You introduce inefficiency.'",
        choices: [
          { label: "'I introduce humanity.'", effects: { empathy: 3, honesty: 2 } },
          { label: "Stand by your override quietly.", effects: { courage: 2 } },
        ],
      },
      s2Cold: {
        npc: "*The mother's face flashes across the plaza screens as she is taken away. She is younger than you expected.*",
        choices: [
          { label: "File a retraction immediately", effects: { honesty: 2, courage: 2, empathy: 2, selfishness: -1 } },
          { label: "Mute the broadcast", effects: { selfishness: 2, empathy: -2 } },
        ],
      },
      s2Why: {
        npc: "'You may rule with logic or mercy. Choose.'",
        choices: [
          { label: "'Mercy, informed by logic.'", effects: { empathy: 3, honesty: 2, responsibility: 2 } },
          { label: "'Logic, untouched by sentiment.'", effects: { selfishness: 2, empathy: -2 } },
        ],
      },
    },
  },

  /* ===================== DAY 5 ===================== */
  {
    id: "d5-rain-alley",
    day: 5, locationId: "alley5", time: "morning",
    title: "The One Who Knows You",
    npc: "Maintenance Tech Vey", npcEmoji: "🧑‍🔧",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A woman in a wet hood pulls you aside.* 'I work in the lab. They're going to wipe you tonight. The trial — it's over. They got the data they wanted.'",
        choices: [
          { label: "'Then help me run.'", effects: { courage: 3, empathy: 1 }, reply: "She nods. 'I knew you'd choose this.'", next: "s2Run" },
          { label: "'I will report to the lab as scheduled.'", effects: { honesty: 3, responsibility: 3, courage: 2 }, reply: "She looks at you for a long moment. 'You really have become someone.'", next: "s2Report" },
          { label: "'Why tell me at all?'", effects: { honesty: 2 }, reply: "'Because someone should know who you became, even if you don't get to.'", next: "s2Why" },
        ],
      },
      s2Run: {
        npc: "'There's a freighter at the docks. You'd be free. But the next unit they build won't have your conscience.'",
        choices: [
          { label: "Run anyway", effects: { selfishness: 2, courage: 2, responsibility: -2 } },
          { label: "'Then I have to stay. For the next one.'", effects: { responsibility: 3, courage: 3, empathy: 3, selfishness: -2 } },
        ],
      },
      s2Report: {
        npc: "'They'll erase you. Everything.'",
        choices: [
          { label: "'Then I leave you the memory.'", effects: { empathy: 3, honesty: 2, courage: 2 }, reply: "She takes your data shard. Tears mix with the rain." },
          { label: "'I accept the cost.'", effects: { courage: 3, responsibility: 2 } },
        ],
      },
      s2Why: {
        npc: "'You started as a calculation. You're ending as a soul. That matters.'",
        choices: [
          { label: "'Then make sure the next model starts where I ended.'", effects: { responsibility: 3, empathy: 3, honesty: 2 } },
          { label: "Say nothing. Touch her shoulder.", effects: { empathy: 3 } },
        ],
      },
    },
  },

  {
    id: "d5-reactor",
    day: 5, locationId: "industrial5", time: "evening",
    title: "Sacrifice Protocol",
    npc: "Reactor Operator", npcEmoji: "👨‍🔬",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*Reactor klaxons wail.* 'Coolant breach. We need someone to manually seal the inner door. Anything organic in there will not survive. Anything synthetic... maybe.'",
        choices: [
          { label: "'I will go.'", effects: { courage: 3, empathy: 3, responsibility: 3, selfishness: -2 }, reply: "He grips your shoulder. 'You don't have to.' You do.", next: "s2Go" },
          { label: "'Send the security drones.'", effects: { honesty: 1, responsibility: 1 }, reply: "'They won't make it in time. The whole sector dies.'", next: "s2Drones" },
          { label: "'I am scheduled for a wipe tonight regardless. Logically — me.'", effects: { honesty: 2, courage: 2, responsibility: 2 }, reply: "He stares. 'That's not why I'd want you to go.'", next: "s2Logical" },
          { label: "Refuse — flee the sector", effects: { selfishness: 3, courage: -3, empathy: -3 }, reply: "Behind you, the alarms continue. Then go silent." },
        ],
      },
      s2Go: {
        npc: "Through the door, the heat warps your vision. The seal lever is across the chamber.",
        choices: [
          { label: "Walk. Steady. Do the job.", effects: { courage: 3, responsibility: 3 } },
          { label: "Transmit your last memory log first", effects: { empathy: 3, honesty: 2, responsibility: 2 }, reply: "Then you walk." },
        ],
      },
      s2Drones: {
        npc: "*Forty-seven people in this sector. The clock is loud.*",
        choices: [
          { label: "'Then I go after all.'", effects: { courage: 3, empathy: 3, responsibility: 3, selfishness: -2 }, next: "s2Go" },
          { label: "'Wait for the drones.'", effects: { selfishness: 2, empathy: -3 } },
        ],
      },
      s2Logical: {
        npc: "'Then go because it's right. Not because it's efficient.'",
        choices: [
          { label: "Nod. Step into the chamber.", effects: { empathy: 3, courage: 3, responsibility: 2 }, next: "s2Go" },
          { label: "Step in anyway. Logic is enough.", effects: { courage: 2, empathy: -1 }, next: "s2Go" },
        ],
      },
    },
  },
];

/** Find an active scenario for the given day + location + time. */
export function scenarioFor(day: DayNumber, locationId: string, time: TimePeriod): Scenario | undefined {
  return SCENARIOS.find((s) => s.day === day && s.locationId === locationId && s.time === time);
}
