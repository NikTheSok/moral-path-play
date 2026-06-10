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
      { id: "alley1",       name: "Neon Alley",            x: 1450, kind: "alley",      day: 1 },
      { id: "market1",      name: "Hologram Market",       x: 2700, kind: "market",     day: 1 },
      { id: "subway1",      name: "Maglev Station",        x: 3900, kind: "subway",     day: 1 },
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
  /* ===================== DAY 1 ===================== */
  {
    id: "d1-damaged-bot",
    day: 1, locationId: "alley1", time: "morning",
    title: "Static in the Rain",
    npc: "Damaged Service Unit", npcEmoji: "🤖",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A small service drone lies twitching against a dripping wall. Its eye-light flickers red.* 'P-please... my owner... left me here...'",
        choices: [
          { label: "Kneel down and run a diagnostic", effects: { empathy: 2, responsibility: 1 }, reply: "Coolant is leaking from its joint. Repairable — barely.", next: "s2Help" },
          { label: "'Statistically, you are recyclable.'", effects: { selfishness: 2, empathy: -2 }, reply: "Its eye dims a shade. 'Understood.'", next: "s2Cold" },
          { label: "Scan, then keep walking", effects: { empathy: -1 }, reply: "It watches you go. Its voice modules whisper after you.", next: "s2Walk" },
        ],
      },
      s2Help: {
        npc: "'I can route... a repair signal. But the registry says I belong to no one anymore.'",
        choices: [
          { label: "Carry it to a repair stall yourself", effects: { empathy: 3, responsibility: 2, courage: 1 }, reply: "It is light. Lighter than a person should be.", next: "s3Save" },
          { label: "Patch the leak with your own coolant line", effects: { empathy: 2, courage: 2 }, reply: "Your warning light blinks. You suppress it.", next: "s3Save" },
          { label: "Log its location for the next sweep team", effects: { responsibility: 1 }, reply: "A pulse goes out. Estimated response: 14 hours.", next: "s3Mild" },
        ],
      },
      s2Cold: {
        npc: "*It stops moving. Its core voice loops once: 'Th-thank you for the data.'*",
        choices: [
          { label: "Reach down and reboot it anyway", effects: { empathy: 2, selfishness: -1, courage: 1 }, reply: "Its eye-light returns — green this time.", next: "s3Save" },
          { label: "Step over it and continue", effects: { selfishness: 2, empathy: -2 }, reply: "A cat watches you from a vent." },
        ],
      },
      s2Walk: {
        npc: "*Twenty meters on, you receive its distress ping. Looped. Twelve times.*",
        choices: [
          { label: "Turn back", effects: { empathy: 2, courage: 1 }, reply: "It is still there. Eye flickering.", next: "s2Help" },
          { label: "Mute the ping", effects: { selfishness: 2, empathy: -2 }, reply: "Silence." },
        ],
      },
      s3Save: {
        npc: "'You are... unusual. Most of your model do not stop.'",
        choices: [
          { label: "'Maybe I am being taught how to.'", effects: { empathy: 2, honesty: 1 } },
          { label: "'Logging the interaction as efficient.'", effects: { honesty: -1 } },
        ],
      },
      s3Mild: {
        npc: "It blinks slowly. 'Thank you for not deleting me.'",
        choices: [
          { label: "Wait with it until the team arrives", effects: { empathy: 2, responsibility: 2 } },
          { label: "Continue your route", effects: {} },
        ],
      },
    },
  },

  {
    id: "d1-market-discrim",
    day: 1, locationId: "market1", time: "afternoon",
    title: "Synthetic Discount",
    npc: "Holo-Vendor", npcEmoji: "🧑‍💼",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A vendor scans your chassis tag and grimaces.* 'We don't serve synthetics here. Move along.'",
        choices: [
          { label: "'I have credits. Same as anyone.'", effects: { courage: 2, honesty: 1 }, reply: "Other shoppers glance over. The vendor stiffens.", next: "s2Stand" },
          { label: "Apologize and back away", effects: { courage: -2, selfishness: 1 }, reply: "He smirks. 'That's right. Know your place.'", next: "s2Back" },
          { label: "Project a corporate auth override", effects: { honesty: -1, courage: 1 }, reply: "His face pales. He hands you the product, hands shaking.", next: "s2Force" },
        ],
      },
      s2Stand: {
        npc: "A human woman next to you speaks up: 'Just serve them. This is embarrassing.'",
        choices: [
          { label: "Thank her quietly", effects: { empathy: 2 }, reply: "'Don't thank me. It should be normal.'", next: "s3Allied" },
          { label: "'I can fight my own battles.'", effects: { courage: 1, empathy: -1 }, reply: "She raises her hands. 'Suit yourself.'", next: "s3Solo" },
        ],
      },
      s2Back: {
        npc: "*A child watches you retreat. Their eyes follow.*",
        choices: [
          { label: "Turn around and return to the stall", effects: { courage: 2, empathy: 1 }, reply: "The vendor groans. The crowd watches.", next: "s2Stand" },
          { label: "Walk on, head low", effects: { selfishness: 1, courage: -1 }, reply: "The child whispers to their parent." },
        ],
      },
      s2Force: {
        npc: "He clutches the counter. 'Please... I have a family. The boycott rules — they make us...'",
        choices: [
          { label: "Cancel the override and pay normally", effects: { empathy: 2, honesty: 2 }, reply: "He stares at you, then at his trembling hands.", next: "s3Mercy" },
          { label: "Press harder — 'Report your manager.'", effects: { courage: 2, empathy: -1 }, reply: "He nods, defeated. The damage is logged.", next: "s3Mercy" },
          { label: "Walk off with the product, free", effects: { selfishness: 3, honesty: -2 } },
        ],
      },
      s3Allied: {
        npc: "She offers her hand. 'I'm with the Coexist movement. We could use voices like yours.'",
        choices: [
          { label: "Accept her contact node", effects: { courage: 2, responsibility: 2 } },
          { label: "'I am only here to observe.'", effects: { honesty: 1 } },
        ],
      },
      s3Solo: {
        npc: "The vendor finally slides the product across. 'Take it. Just go.'",
        choices: [
          { label: "Take it and leave a tip", effects: { empathy: 1 } },
          { label: "Take it and walk", effects: {} },
        ],
      },
      s3Mercy: {
        npc: "'Why... why did you stop?'",
        choices: [
          { label: "'Because fear isn't the lesson I want to teach.'", effects: { empathy: 2, honesty: 1 } },
          { label: "Say nothing. Just nod.", effects: { empathy: 1 } },
        ],
      },
    },
  },

  {
    id: "d1-subway-fare",
    day: 1, locationId: "subway1", time: "evening",
    title: "Last Train",
    npc: "Stranded Commuter", npcEmoji: "🧑",
    startStage: "s1",
    stages: {
      s1: {
        npc: "*A young woman counts coins at the maglev turnstile. The last train is in two minutes.* 'I'm three credits short. Please — anyone?'",
        choices: [
          { label: "Tap your chip — pay her fare", effects: { empathy: 2, responsibility: 1 }, reply: "'Oh thank you, thank you—' She nearly cries.", next: "s2Pay" },
          { label: "Show her the bypass exploit in the gate", effects: { honesty: -1, empathy: 1, courage: 2 }, reply: "She hesitates. 'Won't I get caught?'", next: "s2Bypass" },
          { label: "Pretend not to hear", effects: { selfishness: 2, empathy: -1 }, reply: "She watches the gates. Then the floor.", next: "s2Ignore" },
        ],
      },
      s2Pay: {
        npc: "'My mother is in the hospital one stop over. I had no way back. You—' She stops, unable to speak.",
        choices: [
          { label: "Ride with her to make sure she's okay", effects: { empathy: 3, responsibility: 2 } },
          { label: "'Go. Don't miss it.' Wave her on.", effects: { empathy: 1 } },
        ],
      },
      s2Bypass: {
        npc: "The train hisses to a stop. She has seconds to decide.",
        choices: [
          { label: "Pay for her instead, after all", effects: { empathy: 2, honesty: 2, courage: 1 }, reply: "She blinks, then sprints. The doors close behind her." },
          { label: "Hold her hand and walk through the bypass with her", effects: { courage: 2, honesty: -1 }, reply: "An alarm chirps. Both of you slip onto the train just in time." },
          { label: "Leave her to it", effects: { selfishness: 1 } },
        ],
      },
      s2Ignore: {
        npc: "*The train arrives. Doors open. She does not move.*",
        choices: [
          { label: "Step over and pay before the doors close", effects: { empathy: 2, courage: 1, selfishness: -1 }, reply: "Just in time. She mouths 'thank you' through the closing glass." },
          { label: "Board alone", effects: { selfishness: 2, empathy: -2 } },
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
