"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND = {
  blue: "#7acef4",
  blueLight: "#eef9ff",
  navy: "#47778f",
  yellow: "#fcfd06",
  yellowLight: "#fffed1",
  greenLight: "#eafbf0",
  green: "#1f9d55",
  redLight: "#fff1f1",
  red: "#d9534f",
  slate: "#5c6874",
  border: "#d9ebf5",
  white: "#ffffff",
};

const STANDARD_LEVELS = [
  { label: "❌ Never done", value: 0, short: "Never" },
  { label: "🟥 Full help", value: 1, short: "Help" },
  { label: "🟨 Sometimes help", value: 3, short: "Sometimes" },
  { label: "🟩 Mostly independent", value: 4, short: "Mostly" },
  { label: "🟢 Fully independent", value: 5, short: "Ready" },
];

const MOCK_TEST_LEVELS = [
  { label: "❌ Not done", value: 0, short: "Not done" },
  { label: "🟥 Done 1", value: 1, short: "Done 1" },
  { label: "🟧 Mostly fail", value: 2, short: "Mostly fail" },
  { label: "🟨 Sometimes fail", value: 3, short: "Sometimes fail" },
  { label: "🟩 Mostly pass", value: 5, short: "Mostly pass" },
];

const PROGRESS_KEY = "dstv-pocket-progress-v6";
const PROFILE_KEY = "dstv-pocket-profile-v6";
const TICKETS_KEY = "dstv-pocket-tickets-v1";
const LOGO_URL =
  "https://yt3.ggpht.com/d2QaWKf8p8xGRm4YoIXoScEZw31UbDhyxRGo-nmkhoee34a2sddrJsrfbsySWyuU4QpfPWEUHQ=s88-c-k-c0x00ffffff-no-rj";
const FRANCIS_PHOTO_URL =
  "https://static.wixstatic.com/media/18cc8c_0ec5f02424654bfd8d472c39e8629393~mv2.jpeg/v1/crop/x_0,y_0,w_3689,h_4000/fill/w_862,h_934,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/francis_JPEG.jpeg";
const TIPS_PLAYLIST_ID = "PLWV7lt2OClXJD_ud1evtxh42kQzdvSID3";
const LEARN_PLAYLIST_ID = "PLWV7lt2OClXK8QHGz-Lxup6IXA0udWkjy";

const SYLLABUS = [
  {
    id: "cockpit-controls",
    title: "Cockpit, controls & moving off",
    description:
      "Everything that should feel normal before the car has even had a chance to embarrass you.",
    weight: 1.6,
    modules: [
      {
        title: "Car controls and instruments",
        skills: [
          {
            name: "Seat, steering and mirrors set correctly",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Warning lights and dashboard basics understood",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Driving controls used confidently",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Doors, seatbelts and vehicle safety checks",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Steering control and hand position",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Moving off & stopping",
        skills: [
          {
            name: "Move off safely with full observations",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Control speed smoothly when moving off",
            transmissions: ["manual", "automatic"],
          },
          { name: "Clutch bite and stall control", transmissions: ["manual"] },
          {
            name: "Use of automatic transmission controls",
            transmissions: ["automatic"],
          },
          {
            name: "Stop smoothly and secure the car correctly",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "observation-planning",
    title: "Observation, mirrors & planning",
    description:
      "This is the bit that quietly decides whether the test feels controlled or like a series of avoidable disasters.",
    weight: 1.8,
    modules: [
      {
        title: "Mirrors & observations understood",
        skills: [
          {
            name: "Mirror routine before changing speed or direction",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Blind spots checked when needed",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Effective observations at junctions",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Observations when reversing",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Planning & awareness",
        skills: [
          {
            name: "Plan ahead and read the road early",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Recognise hazards early",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Use signals clearly and at the right time",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Anticipate other road users properly",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Stay calm when plans change suddenly",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "junctions-turns",
    title: "Junctions, turns & emerging",
    description:
      "A very popular place for learners to discover they are either test ready or absolutely not.",
    weight: 2,
    modules: [
      {
        title: "Turning & approach",
        skills: [
          { name: "Turning left", transmissions: ["manual", "automatic"] },
          { name: "Turning right", transmissions: ["manual", "automatic"] },
          {
            name: "Approach speed for left turns",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Approach speed for right turns",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Correct road position for turning",
            transmissions: ["manual", "automatic"],
          },
          { name: "Gears selected properly for turns", transmissions: ["manual"] },
          {
            name: "Pre junction procedure (MSM / MSPSL)",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Emerging & decision making",
        skills: [
          {
            name: "Judge gaps confidently",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Know when to wait and when to go",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Stay composed under pressure from behind",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Do not roll or creep dangerously",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "position-speed-road-use",
    title: "Road position, speed & general road use",
    description:
      "The part that separates driving from simply pointing a car roughly in the correct direction.",
    weight: 1.95,
    modules: [
      {
        title: "Road positioning",
        skills: [
          {
            name: "Road position on minor roads",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Correct lane position on normal roads",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Correct clearance from parked cars and hazards",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Accurate steering at all speeds",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Judge width and space properly",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Meet oncoming traffic safely",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Speed & gears",
        skills: [
          {
            name: "Use an appropriate speed for the road and conditions",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Accelerate and brake smoothly",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Change gears smoothly and correctly",
            transmissions: ["manual"],
          },
          { name: "Know when to change gear", transmissions: ["manual"] },
          {
            name: "Use automatic gears and creep control properly",
            transmissions: ["automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "hazards-road-users",
    title: "Hazards, pedestrians & road users",
    description: "Basically: can you spot trouble before trouble spots you.",
    weight: 1.85,
    modules: [
      {
        title: "Pedestrians & crossings understood",
        skills: [
          {
            name: "Respond correctly to pedestrian crossings",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Recognise crossing types and priorities",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Manage school zones and pedestrian-heavy areas",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Other road users & hazards",
        skills: [
          {
            name: "Deal safely with cyclists and motorbikes",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Notice doors, parked vehicles and hidden risks",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Handle aggressive or impatient drivers sensibly",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Know when to be assertive vs cautious",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Respond correctly to road markings",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "roundabouts-traffic-lights",
    title: "Roundabouts, lights & controlled junctions",
    description:
      "Lovely little collection of things that ruin confidence when they are half-understood.",
    weight: 2.1,
    modules: [
      {
        title: "Roundabouts",
        skills: [
          {
            name: "Giving way correctly at roundabouts",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Choose the correct lane on roundabouts",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Signal correctly on roundabouts",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Judge a safe moment to enter",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Handle mini roundabouts",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Handle spiral roundabouts",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Traffic lights & controlled junctions",
        skills: [
          {
            name: "Traffic light controlled crossroads",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Yellow box junctions",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Respond correctly to traffic light sequences",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "manoeuvres",
    title: "Manoeuvres & slow-speed control",
    description:
      "The slow stuff that somehow still manages to produce maximum stress.",
    weight: 1.75,
    modules: [
      {
        title: "Slow-speed control & manoeuvres",
        skills: [
          {
            name: "Pull up on the left safely",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Pull up on the right and reverse safely",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Parallel park with control and observations",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Forward bay park accurately",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Reverse bay park accurately",
            transmissions: ["manual", "automatic"],
          },
          { name: "Emergency stop", transmissions: ["manual", "automatic"] },
          {
            name: "Use clutch control effectively at very low speed",
            transmissions: ["manual"],
          },
          {
            name: "Creep and brake control at very low speed",
            transmissions: ["automatic"],
          },
          {
            name: "All-round observation while manoeuvring",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "hill-starts-faster-roads",
    title: "Hill starts, dual carriageways & faster roads",
    description:
      "The section where the car is moving quickly enough to make poor planning feel really expensive.",
    weight: 1.7,
    modules: [
      {
        title: "Hill starts",
        skills: [
          {
            name: "Hill starts at junctions",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Hill start from parked",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Hill start without rolling back",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Faster roads",
        skills: [
          {
            name: "National speed limit roads",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "National speed limit country lanes",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Fast dual carriageway confidence",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Join from a slip road safely",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Lane discipline on dual carriageways",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Leave dual carriageways safely",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Basic overtaking judgement",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "independent-driving-test-day",
    title: "Independent driving, test day & examiner logic",
    description:
      "This is the bit that actually matters when you’re sat next to the examiner trying not to overthink your own existence.",
    weight: 2.25,
    modules: [
      {
        title: "Independent driving",
        skills: [
          {
            name: "Follow traffic signs independently",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Follow sat nav directions independently",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Recover safely after mistakes",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Drive consistently without prompts",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
      {
        title: "Test format understood",
        skills: [
          {
            name: "Show me / tell me questions",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Difference between driving, serious and dangerous faults",
            transmissions: ["manual", "automatic"],
          },
          {
            name: "Test-day nerves and mindset",
            transmissions: ["manual", "automatic"],
          },
        ],
      },
    ],
  },
  {
    id: "mock-tests",
    title: "Mock tests & real test readiness",
    description:
      "Where the polite little theory of your driving meets reality and starts arguing with it.",
    weight: 2.35,
    modules: [
      {
        title: "Mock test performance",
        skills: [
          {
            name: "Assisted mock test",
            transmissions: ["manual", "automatic"],
            ratingType: "mock",
          },
          {
            name: "Full mock test",
            transmissions: ["manual", "automatic"],
            ratingType: "mock",
          },
        ],
      },
    ],
  },
];

const STARTER_POSTS = [
  {
    id: 1,
    author: "Leah",
    subject: "Passed today and thought I’d ruined it",
    body: "I genuinely thought I’d messed it up at the first mini roundabout. If anyone’s spiralling after one wobble, breathe.",
    tag: "Passed",
  },
  {
    id: 2,
    author: "Mason",
    subject: "Would this hesitation be a fault?",
    body: "Mini roundabout, car approached quickly, I waited longer than I maybe needed to. Safe, but a bit hesitant.",
    tag: "Question",
  },
];

const STARTER_TICKETS = [
  {
    id: 1,
    subject: "Can hesitation at a roundabout be a fault?",
    message:
      "I’m safe, but I’m probably a bit too cautious at mini roundabouts. Is hesitation alone enough to lose marks?",
    links: "",
    status: "Awaiting reply",
    createdAt: "Today",
    replies: [],
  },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function randomIndices(count, max) {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  const picks = [];
  while (picks.length < count && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(randomIndex, 1)[0]);
  }
  return picks;
}

function playlistCardEmbed(playlistId, index) {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&index=${index}`;
}

function getLevelsForSkill(skill) {
  return skill.ratingType === "mock" ? MOCK_TEST_LEVELS : STANDARD_LEVELS;
}

function getRatingLabel(skill, value) {
  return (
    getLevelsForSkill(skill).find((level) => level.value === value)?.label ||
    "Not set"
  );
}

function buildInitialRatings() {
  const initial = {};
  SYLLABUS.forEach((section) => {
    section.modules.forEach((module) => {
      module.skills.forEach((skill) => {
        initial[slugify(skill.name)] = 0;
      });
    });
  });
  return initial;
}

function initialProfile() {
  return {
    name: "",
    email: "",
    transmission: "manual",
    isSignedIn: false,
    authProvider: "local",
  };
}

function scoreTone(score) {
  if (score >= 90) return { backgroundColor: "#22c55e" };
  if (score >= 75) return { backgroundColor: BRAND.blue };
  if (score >= 55) return { backgroundColor: BRAND.yellow };
  return { backgroundColor: "#ef4444" };
}

function statusFromScore(score, zeroCount, completedCount, totalVisibleSkills) {
  const ratio = totalVisibleSkills ? completedCount / totalVisibleSkills : 0;
  if (completedCount === 0)
    return {
      title: "Let’s get going",
      message:
        "You’re right at the start, which is actually the fun bit. Get a few things ticked off and this will start feeling properly useful.",
    };
  if (ratio < 0.12)
    return {
      title: "You’re warming up",
      message:
        "A few bits are now in motion. Keep stacking the basics and this will start getting exciting quickly.",
    };
  if (ratio < 0.25)
    return {
      title: "Nice start",
      message:
        "You’ve got the wheels turning now. A few more bits ticked off and this starts giving you a much clearer picture.",
    };
  if (ratio < 0.4)
    return {
      title: "Building momentum",
      message:
        "This is starting to look like real progress now. Keep going and it’ll begin to feel much more joined up.",
    };
  if (ratio < 0.6)
    return {
      title: "Getting properly interesting",
      message:
        "You’re well past the early wobble stage now. Keep filling the gaps and this becomes ridiculously useful.",
    };
  if (ratio < 0.8)
    return {
      title: "You’re getting there",
      message:
        "There’s a lot to like here. Keep tidying the weaker bits and this starts looking very testable.",
    };
  if (zeroCount > 0)
    return {
      title: "Nearly there",
      message:
        "Loads is already in place. Finish off the untouched bits and you’ll have a much stronger all-round picture.",
    };
  return {
    title: "Flying now",
    message:
      "This is looking seriously strong. Keep it consistent and don’t let silly mistakes creep in.",
  };
}

function calculateScoring(ratings, transmission) {
  let totalEarned = 0;
  let totalPossible = 0;
  let zeroCount = 0;
  let oneCount = 0;
  let completedCount = 0;
  const riskSkills = [];
  const strengthSkills = [];
  const sectionScores = [];
  let lastCompletedSkill = null;
  let lastCompletedSection = null;

  SYLLABUS.forEach((section, sectionIndex) => {
    let sectionEarned = 0;
    let sectionPossible = 0;
    let visibleSkills = 0;
    let sectionCompletedCount = 0;

    section.modules.forEach((module) => {
      module.skills.forEach((skill, skillIndex) => {
        if (!skill.transmissions.includes(transmission)) return;
        visibleSkills += 1;
        const id = slugify(skill.name);
        const raw = ratings[id] ?? 0;
        const positionBoost = 1 + sectionIndex * 0.05 + skillIndex * 0.01;
        const weightedPossible = section.weight * positionBoost;
        const weightedEarned = weightedPossible * Math.pow(raw / 5, 1.65);

        totalPossible += weightedPossible;
        totalEarned += weightedEarned;
        sectionPossible += weightedPossible;
        sectionEarned += weightedEarned;

        if (raw === 0) zeroCount += 1;
        if (raw === 1) oneCount += 1;
        if (raw > 0) {
          completedCount += 1;
          sectionCompletedCount += 1;
          lastCompletedSkill = {
            id,
            skill: skill.name,
            module: module.title,
            section: section.title,
          };
        }

        if (raw <= 3) {
          riskSkills.push({
            id,
            skill: skill.name,
            module: module.title,
            section: section.title,
            rating: raw,
            severity: (5 - raw) * weightedPossible,
          });
        }

        if (raw >= 4) {
          strengthSkills.push({
            id,
            skill: skill.name,
            module: module.title,
            section: section.title,
            rating: raw,
            strength: raw * weightedPossible,
          });
        }
      });
    });

    if (visibleSkills > 0) {
      sectionScores.push({
        id: section.id,
        title: section.title,
        score: Math.round((sectionEarned / sectionPossible) * 100),
        completedCount: sectionCompletedCount,
        visibleSkills,
      });
      if (sectionCompletedCount > 0) lastCompletedSection = section.title;
    }
  });

  let score =
    totalPossible === 0 ? 0 : Math.round((totalEarned / totalPossible) * 100);
  if (zeroCount > 0)
    score = Math.min(score, Math.max(8, 28 - Math.floor(zeroCount / 3)));
  else if (oneCount > 0)
    score = Math.min(score, Math.max(18, 46 - Math.floor(oneCount / 4)));

  const foundationWeak = SYLLABUS[0].modules
    .flatMap((m) => m.skills)
    .filter((skill) => skill.transmissions.includes(transmission))
    .map((skill) => ratings[slugify(skill.name)] ?? 0)
    .filter((v) => v <= 3).length;

  if (foundationWeak >= 5) score = Math.max(0, score - 10);
  else if (foundationWeak >= 2) score = Math.max(0, score - 5);

  const totalVisibleSkills = SYLLABUS.flatMap((section) => section.modules)
    .flatMap((module) => module.skills)
    .filter((skill) => skill.transmissions.includes(transmission)).length;
  const insightsUnlocked = completedCount >= 6;

  const incompleteSections = sectionScores
    .filter((section) => section.completedCount === 0)
    .map((section) => ({
      id: `section-${section.id}`,
      skill: section.title,
      module: "Whole section",
      section: section.title,
      severity: 9999,
    }));

  const needToWorkOn = [
    ...incompleteSections,
    ...riskSkills.sort((a, b) => b.severity - a.severity),
  ]
    .filter(
      (item, index, arr) => arr.findIndex((x) => x.skill === item.skill) === index
    )
    .slice(0, 2);

  const doingWell = [];
  if (lastCompletedSection) {
    doingWell.push({
      id: `section-${slugify(lastCompletedSection)}`,
      skill: lastCompletedSection,
      module: "Recently worked on",
      section: lastCompletedSection,
      strength: 1000,
    });
  }
  if (
    lastCompletedSkill &&
    !doingWell.find((item) => item.skill === lastCompletedSkill.skill)
  ) {
    doingWell.push({
      id: `skill-${lastCompletedSkill.id}`,
      skill: lastCompletedSkill.skill,
      module: lastCompletedSkill.module,
      section: lastCompletedSkill.section,
      strength: 900,
    });
  }
  strengthSkills
    .sort((a, b) => b.strength - a.strength)
    .forEach((item) => {
      if (doingWell.length < 2 && !doingWell.find((x) => x.skill === item.skill)) {
        doingWell.push(item);
      }
    });

  return {
    score,
    zeroCount,
    oneCount,
    completedCount,
    totalVisibleSkills,
    insightsUnlocked,
    riskSkills: needToWorkOn,
    strengthSkills: doingWell,
    sectionScores,
    ...statusFromScore(score, zeroCount, completedCount, totalVisibleSkills),
  };
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [search, setSearch] = useState("");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    links: "",
  });
  const [ratings, setRatings] = useState(buildInitialRatings);
  const [profile, setProfile] = useState(initialProfile);
  const [authMode, setAuthMode] = useState("signin");
  const [saveState, setSaveState] = useState("Local only");
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    SYLLABUS.forEach((section, index) => {
      initial[section.id] = index < 2;
    });
    return initial;
  });
  const [communityPosts, setCommunityPosts] = useState(STARTER_POSTS);
  const [newPost, setNewPost] = useState({
    subject: "",
    body: "",
    tag: "General",
  });
  const [tickets, setTickets] = useState(STARTER_TICKETS);
  const [tipVideoIndices, setTipVideoIndices] = useState(() =>
    randomIndices(5, 18)
  );
  const [learnVideoIndices, setLearnVideoIndices] = useState(() =>
    randomIndices(5, 18)
  );

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      const savedTickets = localStorage.getItem(TICKETS_KEY);

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile((prev) => ({ ...prev, ...parsed }));
        if (parsed?.isSignedIn) setPage("dashboard");
      }

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed?.ratings) setRatings((prev) => ({ ...prev, ...parsed.ratings }));
      }

      if (savedTickets) {
        const parsed = JSON.parse(savedTickets);
        if (Array.isArray(parsed)) setTickets(parsed);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!profile.isSignedIn) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!profile.isSignedIn) return;
    setSaveState("Saving...");
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(
          PROGRESS_KEY,
          JSON.stringify({
            ratings,
            transmission: profile.transmission,
            updatedAt: new Date().toISOString(),
          })
        );
        localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
        setSaveState("Saved locally");
      } catch (error) {
        console.error(error);
        setSaveState("Save failed");
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [ratings, profile.transmission, profile.isSignedIn, tickets]);

  const scoring = useMemo(
    () => calculateScoring(ratings, profile.transmission || "manual"),
    [ratings, profile.transmission]
  );

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SYLLABUS.map((section) => ({
      ...section,
      modules: section.modules
        .map((module) => ({
          ...module,
          skills: module.skills.filter((skill) => {
            const matchesTransmission = skill.transmissions.includes(
              profile.transmission || "manual"
            );
            const matchesSearch =
              !query ||
              skill.name.toLowerCase().includes(query) ||
              module.title.toLowerCase().includes(query) ||
              section.title.toLowerCase().includes(query);
            const ratingValue = ratings[slugify(skill.name)] ?? 0;
            const matchesRatingFilter =
              selectedRatings.length === 0 || selectedRatings.includes(ratingValue);
            return matchesTransmission && matchesSearch && matchesRatingFilter;
          }),
        }))
        .filter((module) => module.skills.length > 0),
    })).filter((section) => section.modules.length > 0);
  }, [search, profile.transmission, ratings, selectedRatings]);

  function updateRating(skillName, value) {
    setRatings((prev) => ({ ...prev, [slugify(skillName)]: value }));
  }

  function toggleSection(sectionId) {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  function toggleRatingFilter(value) {
    setSelectedRatings((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function clearRatingFilters() {
    setSelectedRatings([]);
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) return;
    const next = { ...profile, isSignedIn: true, authProvider: "local" };
    setProfile(next);
    setPage("dashboard");
  }

  function handleFakeProvider(provider) {
    const next = {
      ...profile,
      name: profile.name || "Learner",
      email: profile.email || `${provider}@example.com`,
      isSignedIn: true,
      authProvider: provider,
    };
    setProfile(next);
    setPage("dashboard");
  }

  function signOut() {
    localStorage.removeItem(PROFILE_KEY);
    setProfile(initialProfile());
    setPage("landing");
    setAuthMode("signin");
  }

  function submitPost(e) {
    e.preventDefault();
    if (!newPost.subject.trim() || !newPost.body.trim()) return;
    const post = {
      id: Date.now(),
      author: profile.name || "Learner",
      subject: newPost.subject,
      body: newPost.body,
      tag: newPost.tag,
    };
    setCommunityPosts((prev) => [post, ...prev]);
    setNewPost({ subject: "", body: "", tag: "General" });
  }

  function submitTicket(e) {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;
    const ticket = {
      id: Date.now(),
      subject: newTicket.subject,
      message: newTicket.message,
      links: newTicket.links,
      status: "Awaiting reply",
      createdAt: "Just now",
      replies: [],
    };
    setTickets((prev) => [ticket, ...prev]);
    setNewTicket({ subject: "", message: "", links: "" });
  }

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        background: `linear-gradient(180deg, ${BRAND.blueLight} 0%, ${BRAND.white} 40%, ${BRAND.yellowLight} 100%)`,
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:px-8">
        {!profile.isSignedIn ? (
          <LandingPage
            profile={profile}
            setProfile={setProfile}
            authMode={authMode}
            setAuthMode={setAuthMode}
            onSubmit={handleAuthSubmit}
            onProviderClick={handleFakeProvider}
          />
        ) : (
          <>
            <Header
              page={page}
              setPage={setPage}
              saveState={saveState}
              profile={profile}
              signOut={signOut}
            />

            {page === "dashboard" && (
              <Dashboard setPage={setPage} scoring={scoring} profile={profile} />
            )}

            {page === "progress tracker" && (
              <ProgressTrackerPage
                search={search}
                setSearch={setSearch}
                selectedRatings={selectedRatings}
                toggleRatingFilter={toggleRatingFilter}
                clearRatingFilters={clearRatingFilters}
                scoring={scoring}
                ratings={ratings}
                updateRating={updateRating}
                sections={filteredSections}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                transmission={profile.transmission}
              />
            )}

            {page === "ask" && (
              <AskFrancisPage
                profile={profile}
                tickets={tickets}
                newTicket={newTicket}
                setNewTicket={setNewTicket}
                submitTicket={submitTicket}
              />
            )}

            {page === "community" && (
              <CommunityPage
                profile={profile}
                posts={communityPosts}
                newPost={newPost}
                setNewPost={setNewPost}
                submitPost={submitPost}
              />
            )}

            {page === "resources" && (
              <ResourcesPage
                tipVideoIndices={tipVideoIndices}
                learnVideoIndices={learnVideoIndices}
                rerollTips={() => setTipVideoIndices(randomIndices(5, 18))}
                rerollLearn={() => setLearnVideoIndices(randomIndices(5, 18))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LandingPage({
  profile,
  setProfile,
  authMode,
  setAuthMode,
  onSubmit,
  onProviderClick,
}) {
  return (
    <div className="grid min-h-[88vh] items-start gap-5 lg:items-center lg:gap-8 lg:grid-cols-[1.05fr,0.95fr]">
      <section
        className="rounded-[28px] p-5 shadow-[0_20px_70px_rgba(71,119,143,0.08)] sm:rounded-[36px] sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${BRAND.white} 0%, ${BRAND.blueLight} 60%, ${BRAND.yellowLight} 100%)`,
          border: `1px solid ${BRAND.border}`,
        }}
      >
        <div
          className="inline-flex items-center gap-3 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.28em]"
          style={{
            backgroundColor: BRAND.white,
            color: BRAND.navy,
            border: `1px solid ${BRAND.border}`,
          }}
        >
          <img
            src={LOGO_URL}
            alt="Driving School TV logo"
            className="h-7 w-7 rounded-full"
          />
          <span>Driving School TV</span>
        </div>

        <h1
          className="mt-4 text-3xl font-black tracking-tight sm:mt-5 sm:text-6xl"
          style={{ color: BRAND.navy }}
        >
          Instructor In Your Pocket
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8" style={{ color: BRAND.slate }}>
          Track your driving properly, see how you’re getting on, ask me questions
          directly, and stop guessing whether you’re actually test ready.
        </p>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3">
          <FeaturePill text="Pass likelihood score" />
          <FeaturePill text="Ask Francis access" />
          <FeaturePill text="Video tips built in" />
        </div>
      </section>

      <section
        className="rounded-[28px] bg-white p-5 shadow-[0_20px_70px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[36px] sm:p-8"
        style={{ borderColor: BRAND.border }}
      >
        <div className="mb-5 grid grid-cols-2 gap-2 sm:flex">
          <button
            onClick={() => setAuthMode("signin")}
            className="rounded-2xl px-3 py-2 text-sm font-bold sm:px-4"
            style={
              authMode === "signin"
                ? { backgroundColor: BRAND.navy, color: BRAND.white }
                : { backgroundColor: BRAND.blueLight, color: BRAND.navy }
            }
          >
            Sign in
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className="rounded-2xl px-3 py-2 text-sm font-bold sm:px-4"
            style={
              authMode === "signup"
                ? { backgroundColor: BRAND.navy, color: BRAND.white }
                : { backgroundColor: BRAND.blueLight, color: BRAND.navy }
            }
          >
            Create profile
          </button>
        </div>

        <h2 className="text-3xl font-black" style={{ color: BRAND.navy }}>
          {authMode === "signin" ? "Welcome back" : "Create your learner profile"}
        </h2>

        <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
          This is a scaffold for proper accounts later. Right now it saves locally,
          but the structure is ready for proper sign-in next.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4 sm:mt-6">
          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Name
            </label>
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Francis"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
              style={{ borderColor: BRAND.border }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Email
            </label>
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="you@example.com"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
              style={{ borderColor: BRAND.border }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Transmission
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { id: "manual", label: "Manual" },
                { id: "automatic", label: "Automatic" },
              ].map((item) => {
                const selected = profile.transmission === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      setProfile((prev) => ({ ...prev, transmission: item.id }))
                    }
                    className="rounded-2xl px-4 py-3 text-sm font-bold"
                    style={
                      selected
                        ? { backgroundColor: BRAND.navy, color: BRAND.white }
                        : {
                            backgroundColor: BRAND.blueLight,
                            color: BRAND.navy,
                            border: `1px solid ${BRAND.border}`,
                          }
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
          >
            {authMode === "signin" ? "Sign in" : "Create profile"}
          </button>
        </form>
      </section>
    </div>
  );
}

function FeaturePill({ text }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm font-bold"
      style={{
        backgroundColor: BRAND.white,
        color: BRAND.navy,
        border: `1px solid ${BRAND.border}`,
      }}
    >
      {text}
    </div>
  );
}

function Header({ page, setPage, saveState, profile, signOut }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "progress tracker", label: "Progress Tracker" },
    { id: "ask", label: "Ask Francis" },
    { id: "community", label: "Community" },
    { id: "resources", label: "Video Tips" },
  ];

  return (
    <header
      className="mb-4 rounded-[24px] border bg-white/95 backdrop-blur shadow-[0_10px_40px_rgba(71,119,143,0.10)] sm:mb-6 sm:rounded-[28px]"
      style={{ borderColor: BRAND.border }}
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="mb-2 inline-flex items-center gap-3 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.25em]"
              style={{
                backgroundColor: BRAND.blueLight,
                color: BRAND.navy,
                border: `1px solid ${BRAND.border}`,
              }}
            >
              <img
                src={LOGO_URL}
                alt="Driving School TV logo"
                className="h-8 w-8 rounded-full"
              />
              <span>Driving School TV</span>
            </div>
            <h1 className="text-xl font-black tracking-tight sm:text-3xl" style={{ color: BRAND.navy }}>
              Instructor In Your Pocket
            </h1>
            <p className="mt-1 text-sm sm:text-base" style={{ color: BRAND.slate }}>
              Hello {profile.name || "learner"}
            </p>
          </div>

          <button
            className="rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0"
            style={{
              backgroundColor: BRAND.yellowLight,
              color: BRAND.navy,
              border: `1px solid ${BRAND.border}`,
            }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {navItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className="rounded-2xl px-4 py-2 text-sm font-bold transition"
                  style={
                    active
                      ? { backgroundColor: BRAND.navy, color: BRAND.white }
                      : {
                          backgroundColor: BRAND.white,
                          color: BRAND.navy,
                          border: `1px solid ${BRAND.border}`,
                        }
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <div
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: BRAND.blueLight, color: BRAND.slate }}
            >
              {saveState}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function TransmissionToggle({
  transmission,
  updateTransmission,
  compact = false,
  disabled = false,
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-2 py-2"
      style={{
        backgroundColor: BRAND.blueLight,
        border: `1px solid ${BRAND.border}`,
      }}
    >
      {[
        { id: "manual", label: "Manual" },
        { id: "automatic", label: "Automatic" },
      ].map((item) => {
        const selected = transmission === item.id;
        return (
          <button
            key={item.id}
            disabled={disabled}
            onClick={() => !disabled && updateTransmission(item.id)}
            className={`rounded-full font-bold ${
              compact ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm"
            }`}
            style={
              selected
                ? { backgroundColor: BRAND.navy, color: BRAND.white }
                : { backgroundColor: BRAND.white, color: BRAND.navy }
            }
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function InsightCard({ title, item, tone }) {
  const bg = tone === "good" ? BRAND.greenLight : BRAND.redLight;
  const accent = tone === "good" ? BRAND.green : BRAND.red;

  return (
    <div
      className="rounded-3xl p-4 ring-1"
      style={{ backgroundColor: bg, borderColor: BRAND.border }}
    >
      <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
        {title}
      </p>
      <h3 className="mt-2 font-black">{item.skill}</h3>
      <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
        {item.module}
      </p>
    </div>
  );
}

function Dashboard({ setPage, scoring, profile }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div
          className="overflow-hidden rounded-[24px] p-4 ring-1 shadow-[0_20px_60px_rgba(71,119,143,0.10)] sm:rounded-[32px] sm:p-8"
          style={{
            background: `linear-gradient(135deg, ${BRAND.white} 0%, ${BRAND.blueLight} 58%, ${BRAND.yellowLight} 100%)`,
            borderColor: BRAND.border,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.28em]" style={{ color: BRAND.navy }}>
                Learner profile
              </p>
              <p className="text-sm font-bold" style={{ color: BRAND.slate }}>
                Hello {profile.name || "learner"}
              </p>
            </div>
            <TransmissionToggle
              transmission={profile.transmission}
              updateTransmission={() => {}}
              compact
              disabled
            />
          </div>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight sm:text-7xl" style={{ color: BRAND.navy }}>
                {scoring.score}%
              </h2>
              <p className="mt-2 text-2xl font-black">{scoring.title}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 sm:text-base" style={{ color: BRAND.slate }}>
                {scoring.message}
              </p>
            </div>

            <div
              className="rounded-[22px] p-4 shadow-sm backdrop-blur ring-1 sm:rounded-[28px] sm:p-5"
              style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: BRAND.slate }}>
                Just so you know
              </p>
              <p className="mt-2 max-w-[240px] text-sm leading-6" style={{ color: BRAND.slate }}>
                {scoring.message}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold" style={{ color: BRAND.slate }}>
              <span>Pass likelihood</span>
              <span>{scoring.score}%</span>
            </div>
            <div
              className="h-4 overflow-hidden rounded-full ring-1"
              style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
            >
              <div
                className="h-full rounded-full"
                style={{ ...scoreTone(scoring.score), width: `${scoring.score}%` }}
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-6"
          style={{ borderColor: BRAND.border }}
        >
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
            Pass insights
          </p>

          {!scoring.insightsUnlocked ? (
            <div
              className="mt-4 rounded-3xl p-5 ring-1"
              style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
            >
              <p className="text-sm leading-7" style={{ color: BRAND.slate }}>
                Complete more subjects in the progress tracker to unlock this data.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scoring.riskSkills.map((item, index) => (
                <InsightCard
                  key={item.id}
                  title={`Need to work on #${index + 1}`}
                  item={item}
                  tone="bad"
                />
              ))}
              {scoring.strengthSkills.map((item, index) => (
                <InsightCard
                  key={item.id}
                  title={`Doing well #${index + 1}`}
                  item={item}
                  tone="good"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <ActionCard
          title="Progress Tracker"
          copy="Update your progress without scrolling through a giant depressing wall of stuff."
          button="Update skills"
          onClick={() => setPage("progress tracker")}
          tone="blue"
        />
        <ActionCard
          title="Ask Francis"
          copy="If you need help ask me a question, I’ll answer."
          button="Ask a question"
          onClick={() => setPage("ask")}
          tone="yellow"
        />
        <ActionCard
          title="Community"
          copy="See what other learners are posting, passing, overthinking and arguing about."
          button="Open community"
          onClick={() => setPage("community")}
          tone="white"
        />
        <ActionCard
          title="Video Tips"
          copy="Quick access to my driving test tips and learn to drive videos, built right into the app."
          button="Watch videos"
          onClick={() => setPage("resources")}
          tone="blue"
        />
      </section>
    </div>
  );
}

function ActionCard({ title, copy, button, onClick, tone }) {
  const styles = {
    blue: {
      background: `linear-gradient(135deg, ${BRAND.blueLight} 0%, ${BRAND.white} 100%)`,
    },
    yellow: {
      background: `linear-gradient(135deg, ${BRAND.yellowLight} 0%, ${BRAND.white} 100%)`,
    },
    white: { background: BRAND.white },
  };

  return (
    <div
      className="rounded-[24px] p-4 shadow-[0_20px_60px_rgba(71,119,143,0.06)] ring-1 sm:rounded-[32px] sm:p-5"
      style={{ ...styles[tone], borderColor: BRAND.border }}
    >
      <h3 className="text-xl font-black" style={{ color: BRAND.navy }}>
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
        {copy}
      </p>
      <button
        onClick={onClick}
        className="w-full sm:w-auto mt-5 rounded-2xl px-4 py-3 text-sm font-bold"
        style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
      >
        {button}
      </button>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl px-3 py-2 text-center text-xs font-black ring-1 transition"
      style={
        active
          ? {
              backgroundColor: BRAND.navy,
              color: BRAND.white,
              borderColor: BRAND.navy,
            }
          : {
              backgroundColor: BRAND.blueLight,
              color: BRAND.navy,
              borderColor: BRAND.border,
            }
      }
    >
      {label}
    </button>
  );
}

function ProgressTrackerPage({
  search,
  setSearch,
  selectedRatings,
  toggleRatingFilter,
  clearRatingFilters,
  ratings,
  updateRating,
  sections,
  expandedSections,
  toggleSection,
  scoring,
  transmission,
}) {
  return (
    <div className="space-y-6">
      <section
        className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-6"
        style={{ borderColor: BRAND.border }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
              Progress Tracker
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">
              Build your score properly
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 sm:text-base" style={{ color: BRAND.slate }}>
              Filtered for <span className="font-bold" style={{ color: BRAND.navy }}>{transmission}</span>.
              Search for something specific or click the rating chips to instantly show
              everything you’ve marked that way.
            </p>
          </div>

          <div
            className="rounded-[22px] p-4 text-white shadow-lg sm:rounded-[28px] sm:p-5"
            style={{ backgroundColor: BRAND.navy }}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">
              Current score
            </p>
            <p className="mt-1 text-4xl font-black">{scoring.score}%</p>
            <p className="text-sm opacity-90">{scoring.title}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:mt-6 lg:grid-cols-[1fr,auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills or sections"
            className="rounded-2xl border px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            style={{ borderColor: BRAND.border, backgroundColor: BRAND.white }}
          />
          <div className="flex flex-wrap gap-2">
            {STANDARD_LEVELS.map((level) => (
              <FilterChip
                key={level.value}
                label={level.short}
                active={selectedRatings.includes(level.value)}
                onClick={() => toggleRatingFilter(level.value)}
              />
            ))}
            <button
              onClick={clearRatingFilters}
              className="rounded-2xl px-3 py-2 text-xs font-black ring-1"
              style={{
                backgroundColor: BRAND.white,
                color: BRAND.navy,
                borderColor: BRAND.border,
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {sections.map((section) => {
          const open = expandedSections[section.id];
          return (
            <section
              key={section.id}
              className="overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(71,119,143,0.05)] ring-1"
              style={{ borderColor: BRAND.border }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full flex-col items-start justify-between gap-4 px-4 py-4 text-left sm:flex-row sm:items-center sm:px-6 sm:py-5"
              >
                <div>
                  <h3 className="text-xl font-black">{section.title}</h3>
                  <p className="mt-1 max-w-3xl text-sm" style={{ color: BRAND.slate }}>
                    {section.description}
                  </p>
                </div>

                <div
                  className="w-full sm:w-auto sm:min-w-[160px] rounded-2xl p-3 ring-1"
                  style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
                >
                  <SectionMiniScore
                    section={section}
                    ratings={ratings}
                    transmission={transmission}
                  />
                </div>
              </button>

              {open && (
                <div className="p-4 sm:p-6" style={{ borderTop: `1px solid ${BRAND.border}` }}>
                  <div className="space-y-4">
                    {section.modules.map((module) => (
                      <div
                        key={module.title}
                        className="rounded-[22px] p-4 ring-1 sm:rounded-[28px] sm:p-5"
                        style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
                      >
                        <h4 className="text-lg font-black" style={{ color: BRAND.navy }}>
                          {module.title}
                        </h4>

                        <div className="mt-4 space-y-3">
                          {module.skills.map((skill) => {
                            const selected = ratings[slugify(skill.name)] ?? 0;
                            const levels = getLevelsForSkill(skill);

                            return (
                              <div
                                key={skill.name}
                                className="rounded-3xl bg-white p-4 ring-1"
                                style={{ borderColor: BRAND.border }}
                              >
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                  <div>
                                    <h5 className="text-sm font-bold sm:text-lg">{skill.name}</h5>
                                    <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                                      Current rating:{" "}
                                      <span className="font-bold" style={{ color: BRAND.navy }}>
                                        {getRatingLabel(skill, selected)}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    {levels.map((level) => {
                                      const isSelected = selected === level.value;
                                      return (
                                        <button
                                          key={level.value}
                                          onClick={() => updateRating(skill.name, level.value)}
                                          className="rounded-2xl px-3 py-3 text-left text-xs font-bold transition"
                                          style={
                                            isSelected
                                              ? { backgroundColor: BRAND.navy, color: BRAND.white }
                                              : {
                                                  backgroundColor: BRAND.white,
                                                  color: BRAND.navy,
                                                  border: `1px solid ${BRAND.border}`,
                                                }
                                          }
                                        >
                                          <div className="leading-4">{level.label}</div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {sections.length === 0 && (
          <div className="rounded-[32px] bg-white p-6 ring-1" style={{ borderColor: BRAND.border }}>
            <p style={{ color: BRAND.slate }}>
              Nothing matches those filters right now. Clear a chip or change the search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionMiniScore({ section, ratings, transmission }) {
  const allSkills = section.modules
    .flatMap((module) => module.skills)
    .filter((skill) => skill.transmissions.includes(transmission));
  const values = allSkills.map((skill) => ratings[slugify(skill.name)] ?? 0);
  const avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const score = Math.round(Math.pow(avg / 5, 1.45) * 100);

  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold" style={{ color: BRAND.slate }}>
          Section
        </span>
        <span className="font-black" style={{ color: BRAND.navy }}>
          {score}%
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full ring-1"
        style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: BRAND.navy }}
        />
      </div>
    </>
  );
}

function AskFrancisPage({ profile, tickets, newTicket, setNewTicket, submitTicket }) {
  return (
    <div className="space-y-6">
      <section
        className="rounded-[24px] p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${BRAND.white} 0%, ${BRAND.blueLight} 55%, ${BRAND.yellowLight} 100%)`,
          borderColor: BRAND.border,
        }}
      >
        <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
          Ask Francis
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl" style={{ color: BRAND.navy }}>
              Need help? Ask me.
            </h2>
            <div
              className="mt-4 rounded-[22px] bg-white p-4 ring-1 sm:rounded-[28px] sm:p-5"
              style={{ borderColor: BRAND.border }}
            >
              <p className="text-sm leading-7" style={{ color: BRAND.slate }}>
                Ask me a question you need a driving instructor to answer. Yes, I’ll
                reply, not ai. If a video helps explain it, feel free to send YouTube
                or social media links, and give me up to 24 hours to get back to you.
              </p>
            </div>
          </div>

          <div
            className="mx-auto w-36 shrink-0 overflow-hidden rounded-[28px] ring-1 sm:mx-0 sm:w-40"
            style={{ borderColor: BRAND.border }}
          >
            <img src={FRANCIS_PHOTO_URL} alt="Francis" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:gap-6 xl:grid-cols-[1fr,1fr]">
        <section
          className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-6"
          style={{ borderColor: BRAND.border }}
        >
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
            Submit a question
          </p>

          <form onSubmit={submitTicket} className="mt-5 space-y-4 sm:mt-6">
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
                Question subject
              </label>
              <input
                value={newTicket.subject}
                onChange={(e) => setNewTicket((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Example: Do I lose marks for hesitation at roundabouts?"
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
                style={{ borderColor: BRAND.border }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
                Your question
              </label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket((prev) => ({ ...prev, message: e.target.value }))}
                rows={6}
                placeholder="Explain what happened, what you’re worried about, and what you want help with."
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                style={{ borderColor: BRAND.border }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
                Helpful links (optional)
              </label>
              <textarea
                value={newTicket.links}
                onChange={(e) => setNewTicket((prev) => ({ ...prev, links: e.target.value }))}
                rows={3}
                placeholder="Paste YouTube or social media links here if they help illustrate your question."
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                style={{ borderColor: BRAND.border }}
              />
            </div>

            <div
              className="rounded-2xl p-4 ring-1"
              style={{ backgroundColor: BRAND.yellowLight, borderColor: BRAND.border }}
            >
              <p className="text-sm font-semibold" style={{ color: BRAND.navy }}>
                Reply expectation
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: BRAND.slate }}>
                It can take up to 24 hours for a reply. Your question will appear below
                like a support ticket, and replies will sit underneath once answered.
              </p>
            </div>

            <button
              className="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-bold"
              style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
            >
              Submit question
            </button>
          </form>
        </section>

        <section>
          <div
            className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-6"
            style={{ borderColor: BRAND.border }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
                  Your ticket thread
                </p>
                <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                  Questions appear here underneath the box, like support tickets.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-[22px] p-4 ring-1 sm:rounded-[28px] sm:p-5"
                  style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{ticket.subject}</h3>
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.18em]"
                        style={{ color: BRAND.slate }}
                      >
                        {ticket.createdAt}
                      </p>
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-black"
                      style={{
                        backgroundColor: ticket.replies.length
                          ? BRAND.greenLight
                          : BRAND.yellowLight,
                        color: ticket.replies.length ? BRAND.green : BRAND.navy,
                        border: `1px solid ${BRAND.border}`,
                      }}
                    >
                      {ticket.replies.length ? "Answered" : ticket.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6" style={{ color: BRAND.slate }}>
                    {ticket.message}
                  </p>

                  {ticket.links && (
                    <div
                      className="mt-3 rounded-2xl p-3 ring-1"
                      style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
                    >
                      <p
                        className="text-xs font-black uppercase tracking-[0.18em]"
                        style={{ color: BRAND.navy }}
                      >
                        Links
                      </p>
                      <p className="mt-1 text-sm break-words" style={{ color: BRAND.slate }}>
                        {ticket.links}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {ticket.replies.length === 0 ? (
                      <div
                        className="rounded-2xl p-3 ring-1"
                        style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
                      >
                        <p className="text-sm" style={{ color: BRAND.slate }}>
                          No reply yet. Once answered, the response will appear directly
                          underneath this question.
                        </p>
                      </div>
                    ) : (
                      ticket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl p-3 ring-1"
                          style={{ backgroundColor: BRAND.greenLight, borderColor: BRAND.border }}
                        >
                          <p
                            className="text-xs font-black uppercase tracking-[0.18em]"
                            style={{ color: BRAND.green }}
                          >
                            Francis replied
                          </p>
                          <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                            {reply.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResourcesPage({
  tipVideoIndices,
  learnVideoIndices,
  rerollTips,
  rerollLearn,
}) {
  return (
    <div className="space-y-6">
      <section
        className="rounded-[24px] p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${BRAND.white} 0%, ${BRAND.blueLight} 55%, ${BRAND.yellowLight} 100%)`,
          borderColor: BRAND.border,
        }}
      >
        <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
          Video tips
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl" style={{ color: BRAND.navy }}>
          Loads of help, built right in
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 sm:text-base" style={{ color: BRAND.slate }}>
          Proper premium extras. Tap through random driving test tips and learn to drive videos
          from my channel without leaving the app.
        </p>
      </section>

      <PlaylistSection
        title="Driving test tips"
        copy="Quick wins, test advice, confidence boosts and the stuff people usually want right before test day."
        playlistId={TIPS_PLAYLIST_ID}
        indices={tipVideoIndices}
        onRefresh={rerollTips}
        buttonText="Show me more tips"
      />

      <PlaylistSection
        title="Learn to drive videos"
        copy="Bigger learning videos for the stuff you actually need to understand properly, not just memorise."
        playlistId={LEARN_PLAYLIST_ID}
        indices={learnVideoIndices}
        onRefresh={rerollLearn}
        buttonText="Show me more videos"
      />
    </div>
  );
}

function PlaylistSection({ title, copy, playlistId, indices, onRefresh, buttonText }) {
  return (
    <section
      className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-6"
      style={{ borderColor: BRAND.border }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
            {title}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: BRAND.slate }}>
            {copy}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRefresh}
            className="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
          >
            {buttonText}
          </button>

          <a
            href={`https://www.youtube.com/playlist?list=${playlistId}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-bold text-center"
            style={{
              backgroundColor: BRAND.blueLight,
              color: BRAND.navy,
              border: `1px solid ${BRAND.border}`,
            }}
          >
            Open full playlist
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {indices.map((index) => (
          <div
            key={`${playlistId}-${index}`}
            className="overflow-hidden rounded-[24px] bg-white ring-1"
            style={{ borderColor: BRAND.border }}
          >
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={playlistCardEmbed(playlistId, index)}
                title={`${title} video ${index}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: BRAND.navy }}>
                Playlist pick
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
                Random pick #{index}. Hit the button above for a fresh batch.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommunityPage({ profile, posts, newPost, setNewPost, submitPost }) {
  return (
    <div className="grid gap-4 xl:gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <section
        className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1 sm:rounded-[32px] sm:p-6"
        style={{ borderColor: BRAND.border }}
      >
        <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
          Community
        </p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">Learner forum</h2>
        <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
          Proper learner-driver reddit energy, just with fewer weird tangents and
          more actual driving chat.
        </p>

        <form
          onSubmit={submitPost}
          className="mt-5 rounded-[22px] p-4 ring-1 sm:mt-6 sm:rounded-[28px] sm:p-5"
          style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
        >
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Posting as
            </label>
            <input
              value={profile.name || "Learner"}
              disabled
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm"
              style={{ borderColor: BRAND.border, color: BRAND.slate }}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Post subject
            </label>
            <input
              value={newPost.subject}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Would this be a fault? / Passed today / Test next week etc"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
              style={{ borderColor: BRAND.border }}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Topic
            </label>
            <select
              value={newPost.tag}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, tag: e.target.value }))
              }
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
              style={{ borderColor: BRAND.border }}
            >
              <option>General</option>
              <option>Passed</option>
              <option>Failed</option>
              <option>Question</option>
              <option>Nerves</option>
              <option>Mock test</option>
              <option>My instructor</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
              Message
            </label>
            <textarea
              value={newPost.body}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, body: e.target.value }))
              }
              rows={5}
              placeholder="What’s happened? What are you stuck on? What are you overthinking?"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              style={{ borderColor: BRAND.border }}
            />
          </div>

          <button
            className="w-full sm:w-auto mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
          >
            Post to forum
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(71,119,143,0.06)] ring-1 sm:rounded-[32px] sm:p-5"
            style={{ borderColor: BRAND.border }}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em]"
                style={{ backgroundColor: BRAND.yellowLight, color: BRAND.navy }}
              >
                {post.tag}
              </span>
              <span className="text-xs" style={{ color: BRAND.slate }}>
                by {post.author}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-black">{post.subject}</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
              {post.body}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <button
                className="rounded-2xl px-3 py-2 font-bold ring-1"
                style={{
                  backgroundColor: BRAND.white,
                  color: BRAND.navy,
                  borderColor: BRAND.border,
                }}
              >
                Upvote
              </button>
              <button
                className="rounded-2xl px-3 py-2 font-bold ring-1"
                style={{
                  backgroundColor: BRAND.white,
                  color: BRAND.navy,
                  borderColor: BRAND.border,
                }}
              >
                Reply
              </button>
              <button
                className="rounded-2xl px-3 py-2 font-bold ring-1"
                style={{
                  backgroundColor: BRAND.white,
                  color: BRAND.navy,
                  borderColor: BRAND.border,
                }}
              >
                Save
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}