import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Trophy, CheckCircle2, XCircle, RotateCcw, Share2, LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

interface PFDType {
  id: number;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
}

type SceneType = "offshore" | "lake" | "river" | "watersports" | "overboard" | "commercial" | "harbor" | "night" | "rapids";

interface Scenario {
  id: number;
  description: string;
  correctType: number;
  explanation: string;
  scene: SceneType;
}

interface RoundResult {
  scenario: Scenario;
  selectedType: number | null;
  correct: boolean;
  timedOut: boolean;
}

type GameScreen = "intro" | "playing" | "feedback" | "results";

// --- Data ---

const PFD_TYPES: PFDType[] = [
  {
    id: 1,
    name: "Type I — Offshore Life Jacket",
    shortName: "Type I",
    description: "Highest buoyancy (22+ lbs). Best for rough, remote, or open water. Turns unconscious wearers face-up.",
    color: "#f97316",
    bgColor: "bg-orange-500/20",
  },
  {
    id: 2,
    name: "Type II — Near-Shore Buoyant Vest",
    shortName: "Type II",
    description: "15.5 lbs buoyancy. Good for calm, inland water where quick rescue is likely.",
    color: "#ef4444",
    bgColor: "bg-red-500/20",
  },
  {
    id: 3,
    name: "Type III — Flotation Aid",
    shortName: "Type III",
    description: "15.5 lbs buoyancy. Most comfortable for extended wear. Great for supervised water sports.",
    color: "#3b82f6",
    bgColor: "bg-blue-500/20",
  },
  {
    id: 4,
    name: "Type IV — Throwable Device",
    shortName: "Type IV",
    description: "Not worn — thrown to someone in the water. Ring buoys and cushions. Required on boats 16+ ft.",
    color: "#ffffff",
    bgColor: "bg-white/20",
  },
  {
    id: 5,
    name: "Type V — Special Use Device",
    shortName: "Type V",
    description: "Designed for specific activities. Must be worn during the labeled activity to count as legal PFD.",
    color: "#eab308",
    bgColor: "bg-yellow-500/20",
  },
];

const ALL_SCENARIOS: Scenario[] = [
  {
    id: 1,
    description: "You're heading out on an offshore fishing trip 20 miles into the Gulf of Mexico. The seas are choppy and help could be hours away.",
    correctType: 1,
    explanation: "Type I offshore life jackets provide the highest buoyancy (22+ lbs) and are designed to turn most unconscious wearers face-up. In remote offshore waters where rescue may be delayed, Type I is the safest choice.",
    scene: "offshore",
  },
  {
    id: 2,
    description: "Your 5-year-old child is joining you on a pontoon boat ride around a calm lake. The marina is nearby and the water is flat.",
    correctType: 2,
    explanation: "Type II near-shore buoyant vests are ideal for calm, inland water where rescue is expected to be quick. They provide some face-up turning ability and are a practical choice for children on calm lakes near help.",
    scene: "lake",
  },
  {
    id: 3,
    description: "You're kayaking down a calm river on a sunny summer afternoon. You'll be paddling for several hours.",
    correctType: 3,
    explanation: "Type III flotation aids are the most comfortable for extended wear, making them ideal for kayaking. They provide 15.5 lbs of buoyancy and are designed for calm water where the wearer can position themselves face-up.",
    scene: "river",
  },
  {
    id: 4,
    description: "You're about to waterski behind a speedboat on an inland lake. You need a PFD that won't restrict your movement.",
    correctType: 3,
    explanation: "Type III flotation aids are the go-to choice for water sports like waterskiing. They're designed for comfort and freedom of movement during active, supervised water activities on calm water.",
    scene: "watersports",
  },
  {
    id: 5,
    description: "You're sailing 15 miles offshore in the Atlantic Ocean. The weather forecast calls for building seas and possible squalls.",
    correctType: 1,
    explanation: "Type I offshore life jackets are essential for open ocean sailing. With the highest buoyancy and face-up turning capability, they give you the best chance of survival if you end up in rough offshore water far from help.",
    scene: "offshore",
  },
  {
    id: 6,
    description: "Someone just fell overboard from your boat! They're 20 feet away in the water and struggling. You need to get flotation to them immediately.",
    correctType: 4,
    explanation: "Type IV throwable devices — ring buoys and throwable cushions — are designed to be thrown to someone in the water. They provide immediate flotation assistance without requiring anyone else to enter the water.",
    scene: "overboard",
  },
  {
    id: 7,
    description: "You're working as a commercial fishing crew member on a crab boat in Alaska. Conditions are extreme and you need specialized protection on deck.",
    correctType: 5,
    explanation: "Type V special use devices include commercial work vests and deck suits designed for specific professional activities. Commercial fishing crews use Type V PFDs engineered for their demanding working conditions.",
    scene: "commercial",
  },
  {
    id: 8,
    description: "You're going stand-up paddleboarding on a calm, sheltered bay. You want to be comfortable while paddling for an hour or two.",
    correctType: 3,
    explanation: "Type III flotation aids are perfect for paddleboarding. They offer the best comfort for extended wear during calm-water activities and provide adequate buoyancy (15.5 lbs) for a conscious wearer in sheltered water.",
    scene: "lake",
  },
  {
    id: 9,
    description: "Your family is heading out for a leisurely canoe trip on a state park lake. The kids are excited and the water is calm.",
    correctType: 3,
    explanation: "Type III flotation aids are a great choice for family canoeing on calm lakes. They're comfortable enough for all-day wear and provide reliable flotation for supervised recreational activities in inland water.",
    scene: "lake",
  },
  {
    id: 10,
    description: "You're boating alone on a large lake at night. Visibility is low and there are no other boats around. If something goes wrong, rescue could take a while.",
    correctType: 1,
    explanation: "Type I offshore life jackets are the best choice when boating alone at night with limited visibility. The high buoyancy and face-up turning capability are critical when you might be unconscious and rescue is not immediate.",
    scene: "night",
  },
  {
    id: 11,
    description: "You're about to ride a personal watercraft (jet ski) on a lake. You need something comfortable that lets you move freely at high speed.",
    correctType: 3,
    explanation: "Type III flotation aids are standard for PWC / jet ski riding. They allow the freedom of movement needed for active riding while providing adequate buoyancy. Most jet ski-specific PFDs are Type III rated.",
    scene: "watersports",
  },
  {
    id: 12,
    description: "You're joining a guided whitewater rafting expedition on a Class III-IV river. The outfitter is providing specialized safety gear.",
    correctType: 5,
    explanation: "Type V special use devices are designed for specific activities like whitewater rafting. Whitewater PFDs are purpose-built with extra features like quick-release harnesses and higher arm mobility for the demands of rapids.",
    scene: "rapids",
  },
  {
    id: 13,
    description: "Your 16-foot motorboat needs to comply with federal requirements for having a backup flotation device on board that can be tossed to someone in an emergency.",
    correctType: 4,
    explanation: "Federal law requires boats 16 feet and longer to carry at least one Type IV throwable device (ring buoy or throwable cushion) in addition to wearable PFDs for each person aboard.",
    scene: "harbor",
  },
  {
    id: 14,
    description: "You're competitive sailboat racing and wearing a harness with a quick-inflate mechanism. The PFD is designed specifically for racing and tethering to the boat.",
    correctType: 5,
    explanation: "Type V special use devices include inflatable PFDs and sailing harnesses designed for specific activities. Racing inflatables with quick-inflate mechanisms and harness attachments are Type V devices meant for that exact use.",
    scene: "offshore",
  },
  {
    id: 15,
    description: "You're fishing from a small aluminum jon boat about 100 yards from shore on a quiet pond. The water is calm and shallow.",
    correctType: 2,
    explanation: "Type II near-shore buoyant vests are well-suited for calm, near-shore conditions where rescue is quick. Fishing close to shore on a calm pond is a textbook Type II scenario — simple, affordable, and adequate.",
    scene: "lake",
  },
  {
    id: 16,
    description: "You're rowing a small dinghy about 200 yards across a harbor to reach your anchored sailboat. The harbor is calm and busy with other boaters.",
    correctType: 2,
    explanation: "Type II near-shore buoyant vests are appropriate for short trips in calm, protected harbors where help is nearby. The short distance and presence of other boaters make this a classic near-shore scenario.",
    scene: "harbor",
  },
  {
    id: 17,
    description: "You've been hired as a deck hand on a commercial tour boat. Your employer requires you to wear a PFD specifically approved for commercial vessel operations.",
    correctType: 5,
    explanation: "Type V special use devices include work vests approved for commercial vessel operations. Commercial crew members must wear PFDs designed and labeled for their specific professional maritime role.",
    scene: "commercial",
  },
];

const ROUNDS_PER_GAME = 10;
const TIMER_SECONDS = 15;

const SHARE_URL = "https://onlineboatereducation.com/games/life-jacket-picker";

// --- SVG Scene Illustrations ---

function SceneIllustration({ scene }: { scene: SceneType }) {
  const w = 400;
  const h = 200;

  const scenes: Record<SceneType, JSX.Element> = {
    offshore: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-off" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#2d6a9f" />
          </linearGradient>
          <linearGradient id="sea-off" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a5276" />
            <stop offset="100%" stopColor="#0e2f44" />
          </linearGradient>
        </defs>
        <rect width={w} height="110" fill="url(#sky-off)" />
        <rect y="110" width={w} height="90" fill="url(#sea-off)" />
        {/* waves */}
        <path d="M0,120 Q50,108 100,120 T200,120 T300,120 T400,120" fill="none" stroke="#3b82f680" strokeWidth="2" />
        <path d="M0,135 Q50,125 100,135 T200,135 T300,135 T400,135" fill="none" stroke="#3b82f650" strokeWidth="1.5" />
        <path d="M0,150 Q50,142 100,150 T200,150 T300,150 T400,150" fill="none" stroke="#3b82f640" strokeWidth="1" />
        {/* sun */}
        <circle cx="340" cy="40" r="22" fill="#fbbf24" opacity="0.8" />
        <circle cx="340" cy="40" r="30" fill="#fbbf24" opacity="0.15" />
        {/* distant boat silhouette */}
        <path d="M80,108 L85,95 L120,95 L125,108 Z" fill="#1e293b" opacity="0.6" />
        <line x1="100" y1="95" x2="100" y2="75" stroke="#1e293b" strokeWidth="1.5" opacity="0.6" />
        {/* clouds */}
        <ellipse cx="100" cy="30" rx="40" ry="12" fill="white" opacity="0.15" />
        <ellipse cx="250" cy="50" rx="50" ry="10" fill="white" opacity="0.1" />
      </svg>
    ),
    lake: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="sea-lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <rect width={w} height="120" fill="url(#sky-lake)" />
        <rect y="120" width={w} height="80" fill="url(#sea-lake)" />
        {/* sun */}
        <circle cx="320" cy="35" r="24" fill="#fde047" opacity="0.9" />
        {/* treeline */}
        <path d="M0,120 L20,100 L35,120 L50,95 L65,120 L80,90 L95,120 L110,98 L130,120 L145,92 L160,120 L175,96 L195,120 L210,88 L230,120 L250,94 L270,120 L285,90 L300,120 L315,96 L335,120 L355,92 L375,120 L390,98 L400,120" fill="#166534" opacity="0.5" />
        {/* gentle waves */}
        <path d="M0,135 Q80,130 160,135 T320,135 T400,135" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3" />
        {/* clouds */}
        <ellipse cx="80" cy="30" rx="35" ry="10" fill="white" opacity="0.5" />
        <ellipse cx="200" cy="45" rx="45" ry="12" fill="white" opacity="0.3" />
      </svg>
    ),
    river: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-riv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
        </defs>
        <rect width={w} height="100" fill="url(#sky-riv)" />
        {/* riverbanks */}
        <path d="M0,100 Q60,85 120,100 Q180,108 240,95 Q300,85 360,100 L400,100 L400,200 L0,200 Z" fill="#166534" opacity="0.4" />
        {/* river */}
        <path d="M0,120 Q100,100 200,115 Q300,130 400,110 L400,200 L0,200 Z" fill="#0ea5e9" opacity="0.7" />
        {/* current lines */}
        <path d="M30,140 Q80,135 130,142" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        <path d="M200,130 Q250,125 300,132" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        {/* trees */}
        <circle cx="50" cy="82" r="14" fill="#15803d" opacity="0.6" />
        <circle cx="80" cy="78" r="16" fill="#166534" opacity="0.5" />
        <circle cx="340" cy="85" r="13" fill="#15803d" opacity="0.6" />
        <circle cx="370" cy="80" r="15" fill="#166534" opacity="0.5" />
      </svg>
    ),
    watersports: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-ws" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="sea-ws" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
        </defs>
        <rect width={w} height="110" fill="url(#sky-ws)" />
        <rect y="110" width={w} height="90" fill="url(#sea-ws)" />
        {/* sun */}
        <circle cx="350" cy="35" r="22" fill="#fde047" opacity="0.9" />
        {/* speedboat silhouette */}
        <path d="M140,105 L180,95 L220,95 L235,105 Z" fill="#1e293b" opacity="0.7" />
        <rect x="185" y="88" width="20" height="8" rx="2" fill="#1e293b" opacity="0.7" />
        {/* wake spray */}
        <path d="M140,108 Q120,115 90,112" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
        <path d="M140,108 Q115,120 85,118" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />
        {/* water skier silhouette */}
        <circle cx="85" cy="104" r="4" fill="#1e293b" opacity="0.6" />
        <line x1="85" y1="108" x2="85" y2="118" stroke="#1e293b" strokeWidth="2" opacity="0.6" />
        <line x1="85" y1="108" x2="140" y2="106" stroke="#475569" strokeWidth="1" opacity="0.4" strokeDasharray="3,3" />
        {/* waves */}
        <path d="M0,125 Q50,118 100,125 T200,125 T300,125 T400,125" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3" />
      </svg>
    ),
    overboard: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-ob" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="sea-ob" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a5f" />
          </linearGradient>
        </defs>
        <rect width={w} height="100" fill="url(#sky-ob)" />
        <rect y="100" width={w} height="100" fill="url(#sea-ob)" />
        {/* waves */}
        <path d="M0,110 Q40,102 80,110 T160,110 T240,110 T320,110 T400,110" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.4" />
        <path d="M0,125 Q50,118 100,125 T200,125 T300,125 T400,125" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />
        {/* person in water */}
        <circle cx="200" cy="108" r="7" fill="#fbbf24" opacity="0.9" />
        <path d="M193,115 Q200,120 207,115" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />
        {/* hand waving */}
        <line x1="207" y1="106" x2="214" y2="96" stroke="#fbbf24" strokeWidth="2.5" opacity="0.9" />
        {/* splash rings */}
        <ellipse cx="200" cy="118" rx="20" ry="5" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        <ellipse cx="200" cy="118" rx="30" ry="7" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
        {/* ! alert */}
        <circle cx="200" cy="70" r="12" fill="#ef4444" opacity="0.8" />
        <text x="200" y="75" textAnchor="middle" fill="white" fontWeight="bold" fontSize="16">!</text>
      </svg>
    ),
    commercial: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-com" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="sea-com" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect width={w} height="100" fill="url(#sky-com)" />
        <rect y="100" width={w} height="100" fill="url(#sea-com)" />
        {/* commercial vessel */}
        <path d="M100,100 L110,75 L290,75 L300,100 Z" fill="#334155" />
        <rect x="130" y="55" width="140" height="20" rx="3" fill="#475569" />
        <rect x="160" y="40" width="80" height="16" rx="2" fill="#64748b" />
        {/* windows */}
        <rect x="170" y="44" width="8" height="8" rx="1" fill="#fde047" opacity="0.6" />
        <rect x="185" y="44" width="8" height="8" rx="1" fill="#fde047" opacity="0.6" />
        <rect x="200" y="44" width="8" height="8" rx="1" fill="#fde047" opacity="0.6" />
        {/* mast */}
        <line x1="200" y1="40" x2="200" y2="25" stroke="#94a3b8" strokeWidth="2" />
        {/* waves */}
        <path d="M0,110 Q50,104 100,110 T200,110 T300,110 T400,110" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />
        {/* rain */}
        <line x1="50" y1="10" x2="45" y2="30" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <line x1="150" y1="5" x2="145" y2="25" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <line x1="320" y1="15" x2="315" y2="35" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <line x1="370" y1="8" x2="365" y2="28" stroke="white" strokeWidth="0.5" opacity="0.2" />
      </svg>
    ),
    harbor: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-har" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="sea-har" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width={w} height="110" fill="url(#sky-har)" />
        <rect y="110" width={w} height="90" fill="url(#sea-har)" />
        {/* dock */}
        <rect x="0" y="105" width="80" height="8" fill="#92400e" opacity="0.8" />
        <rect x="15" y="105" width="4" height="25" fill="#78350f" opacity="0.7" />
        <rect x="55" y="105" width="4" height="25" fill="#78350f" opacity="0.7" />
        {/* boats in harbor */}
        <path d="M120,108 L130,100 L155,100 L160,108 Z" fill="#e2e8f0" opacity="0.7" />
        <line x1="142" y1="100" x2="142" y2="85" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M260,106 L268,98 L290,98 L295,106 Z" fill="#e2e8f0" opacity="0.6" />
        <line x1="278" y1="98" x2="278" y2="82" stroke="#94a3b8" strokeWidth="1.5" />
        {/* buildings */}
        <rect x="340" y="75" width="25" height="35" fill="#cbd5e1" opacity="0.5" />
        <rect x="370" y="85" width="30" height="25" fill="#94a3b8" opacity="0.5" />
        {/* calm water */}
        <path d="M0,130 Q100,127 200,130 T400,130" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
      </svg>
    ),
    night: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="sea-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1929" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>
        <rect width={w} height="110" fill="url(#sky-night)" />
        <rect y="110" width={w} height="90" fill="url(#sea-night)" />
        {/* moon */}
        <circle cx="320" cy="35" r="16" fill="#fef9c3" opacity="0.9" />
        <circle cx="328" cy="30" r="14" fill="#0f172a" />
        {/* moon reflection */}
        <ellipse cx="320" cy="140" rx="8" ry="25" fill="#fef9c3" opacity="0.08" />
        {/* stars */}
        <circle cx="50" cy="20" r="1.2" fill="white" opacity="0.6" />
        <circle cx="120" cy="35" r="0.8" fill="white" opacity="0.4" />
        <circle cx="180" cy="15" r="1" fill="white" opacity="0.5" />
        <circle cx="250" cy="28" r="0.8" fill="white" opacity="0.4" />
        <circle cx="380" cy="20" r="1" fill="white" opacity="0.5" />
        <circle cx="80" cy="50" r="0.6" fill="white" opacity="0.3" />
        <circle cx="200" cy="45" r="0.7" fill="white" opacity="0.3" />
        {/* boat silhouette */}
        <path d="M150,108 L165,95 L210,95 L220,108 Z" fill="#1e293b" opacity="0.8" />
        <rect x="175" y="87" width="15" height="8" rx="1" fill="#1e293b" opacity="0.8" />
        {/* nav light */}
        <circle cx="165" cy="93" r="2" fill="#22c55e" opacity="0.8" />
        <circle cx="210" cy="93" r="2" fill="#ef4444" opacity="0.8" />
        {/* dark water */}
        <path d="M0,120 Q80,115 160,120 T320,120 T400,120" fill="none" stroke="#1e40af" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
    rapids: (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="sky-rap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
        </defs>
        <rect width={w} height="80" fill="url(#sky-rap)" />
        {/* rocky banks */}
        <path d="M0,80 Q30,70 60,80 Q80,75 100,82 L100,200 L0,200 Z" fill="#57534e" opacity="0.6" />
        <path d="M300,80 Q330,72 360,82 Q380,76 400,80 L400,200 L300,200 Z" fill="#57534e" opacity="0.6" />
        {/* whitewater */}
        <rect x="100" y="80" width="200" height="120" fill="#0ea5e9" opacity="0.6" />
        {/* foam/rapids */}
        <path d="M100,95 Q150,85 200,95 T300,95" fill="none" stroke="white" strokeWidth="3" opacity="0.5" />
        <path d="M110,110 Q160,100 200,112 T290,108" fill="none" stroke="white" strokeWidth="2.5" opacity="0.4" />
        <path d="M105,130 Q150,122 200,130 T295,128" fill="none" stroke="white" strokeWidth="2" opacity="0.35" />
        <path d="M115,150 Q170,140 210,150 T285,148" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
        {/* rocks */}
        <ellipse cx="160" cy="100" rx="10" ry="6" fill="#78716c" opacity="0.7" />
        <ellipse cx="240" cy="120" rx="8" ry="5" fill="#78716c" opacity="0.6" />
        <ellipse cx="180" cy="145" rx="7" ry="4" fill="#78716c" opacity="0.5" />
        {/* spray particles */}
        <circle cx="155" cy="92" r="2" fill="white" opacity="0.4" />
        <circle cx="165" cy="88" r="1.5" fill="white" opacity="0.3" />
        <circle cx="238" cy="112" r="2" fill="white" opacity="0.4" />
      </svg>
    ),
  };

  return (
    <div className="rounded-xl overflow-hidden bg-slate-900" style={{ aspectRatio: "2/1" }}>
      {scenes[scene]}
    </div>
  );
}

// --- PFD Type Icon SVGs ---

function PFDIcon({ typeId, size = 48 }: { typeId: number; size?: number }) {
  const s = size;
  const icons: Record<number, JSX.Element> = {
    // Type I — Bulky offshore jacket (orange)
    1: (
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <path d="M14,14 Q14,8 24,8 Q34,8 34,14 L36,36 Q36,40 30,42 L18,42 Q12,40 12,36 Z" fill="#f97316" opacity="0.9" />
        <path d="M14,14 L12,36 Q12,40 18,42 L24,42 L24,8 Q14,8 14,14" fill="#ea580c" opacity="0.4" />
        <rect x="22" y="18" width="4" height="20" rx="1" fill="#fbbf24" opacity="0.5" />
        <path d="M16,14 Q16,10 24,10 Q32,10 32,14" fill="none" stroke="#fdba74" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="2" fill="#fbbf24" opacity="0.7" />
        <circle cx="24" cy="30" r="2" fill="#fbbf24" opacity="0.7" />
      </svg>
    ),
    // Type II — Horse-collar vest (red)
    2: (
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <path d="M18,12 Q18,7 24,7 Q30,7 30,12 L30,16 Q34,18 34,24 L32,38 L16,38 L14,24 Q14,18 18,16 Z" fill="#ef4444" opacity="0.9" />
        <path d="M18,12 Q18,7 24,7 L24,38 L16,38 L14,24 Q14,18 18,16 Z" fill="#dc2626" opacity="0.3" />
        <path d="M18,12 Q18,9 24,9 Q30,9 30,12 L30,16 L18,16 Z" fill="#fca5a5" opacity="0.5" />
        <rect x="22" y="20" width="4" height="14" rx="1" fill="#fbbf24" opacity="0.4" />
      </svg>
    ),
    // Type III — Comfortable vest (blue)
    3: (
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <path d="M16,12 L14,38 Q14,42 24,42 Q34,42 34,38 L32,12 Q32,8 24,8 Q16,8 16,12" fill="#3b82f6" opacity="0.9" />
        <path d="M16,12 L14,38 Q14,42 24,42 L24,8 Q16,8 16,12" fill="#2563eb" opacity="0.3" />
        <rect x="22" y="14" width="4" height="22" rx="1" fill="#93c5fd" opacity="0.4" />
        <path d="M18,12 L16,16 L20,16 L20,12" fill="#60a5fa" opacity="0.5" />
        <path d="M30,12 L32,16 L28,16 L28,12" fill="#60a5fa" opacity="0.5" />
        <rect x="19" y="20" width="3" height="3" rx="0.5" fill="#1d4ed8" opacity="0.3" />
        <rect x="26" y="20" width="3" height="3" rx="0.5" fill="#1d4ed8" opacity="0.3" />
        <rect x="19" y="26" width="3" height="3" rx="0.5" fill="#1d4ed8" opacity="0.3" />
        <rect x="26" y="26" width="3" height="3" rx="0.5" fill="#1d4ed8" opacity="0.3" />
      </svg>
    ),
    // Type IV — Ring buoy (white/red)
    4: (
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <circle cx="24" cy="24" r="16" fill="white" opacity="0.9" />
        <circle cx="24" cy="24" r="8" fill="#0ea5e9" opacity="0.3" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        {/* red stripes */}
        <path d="M24,8 A16,16 0 0,1 38.3,16.7 L30.3,20.7 A8,8 0 0,0 24,16 Z" fill="#ef4444" opacity="0.8" />
        <path d="M38.3,31.3 A16,16 0 0,1 24,40 L24,32 A8,8 0 0,0 30.3,27.3 Z" fill="#ef4444" opacity="0.8" />
        <path d="M24,40 A16,16 0 0,1 9.7,31.3 L17.7,27.3 A8,8 0 0,0 24,32 Z" fill="#ef4444" opacity="0.8" />
        <path d="M9.7,16.7 A16,16 0 0,1 24,8 L24,16 A8,8 0 0,0 17.7,20.7 Z" fill="#ef4444" opacity="0.8" />
        {/* rope */}
        <path d="M8,24 Q4,24 4,20" fill="none" stroke="#d4a574" strokeWidth="1.5" opacity="0.6" />
      </svg>
    ),
    // Type V — Special use / harness (yellow)
    5: (
      <svg viewBox="0 0 48 48" width={s} height={s}>
        <path d="M16,10 L14,36 Q14,40 24,40 Q34,40 34,36 L32,10 Q32,7 24,7 Q16,7 16,10" fill="#eab308" opacity="0.9" />
        <path d="M16,10 L14,36 Q14,40 24,40 L24,7 Q16,7 16,10" fill="#ca8a04" opacity="0.3" />
        {/* harness straps */}
        <line x1="18" y1="10" x2="14" y2="20" stroke="#a16207" strokeWidth="2" opacity="0.6" />
        <line x1="30" y1="10" x2="34" y2="20" stroke="#a16207" strokeWidth="2" opacity="0.6" />
        <line x1="14" y1="20" x2="14" y2="30" stroke="#a16207" strokeWidth="2" opacity="0.6" />
        <line x1="34" y1="20" x2="34" y2="30" stroke="#a16207" strokeWidth="2" opacity="0.6" />
        {/* buckle */}
        <rect x="20" y="22" width="8" height="6" rx="1" fill="#78350f" opacity="0.6" />
        <rect x="22" y="23" width="4" height="4" rx="0.5" fill="#a16207" opacity="0.5" />
        {/* special label */}
        <rect x="18" y="32" width="12" height="4" rx="1" fill="white" opacity="0.3" />
      </svg>
    ),
  };

  return icons[typeId] || null;
}

// --- Helpers ---

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGrade(score: number, total: number): { label: string; color: string } {
  const pct = (score / total) * 100;
  if (pct === 100) return { label: "Master Mariner", color: "text-yellow-400" };
  if (pct >= 90) return { label: "Safety Expert", color: "text-green-400" };
  if (pct >= 80) return { label: "Well Prepared", color: "text-blue-400" };
  if (pct >= 70) return { label: "Needs Practice", color: "text-orange-400" };
  if (pct >= 50) return { label: "Study Up", color: "text-red-400" };
  return { label: "Take the Course", color: "text-red-500" };
}

function getPFDTypeName(id: number): string {
  return PFD_TYPES.find((p) => p.id === id)?.shortName ?? `Type ${id}`;
}

// --- Component ---

export default function LifeJacketPicker() {
  const { toast } = useToast();
  const [screen, setScreen] = useState<GameScreen>("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Drag state
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dropHighlight, setDropHighlight] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentScenario = scenarios[currentRound] ?? null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    const picked = shuffleArray(ALL_SCENARIOS).slice(0, ROUNDS_PER_GAME);
    setScenarios(picked);
    setCurrentRound(0);
    setResults([]);
    setSelectedType(null);
    setTimeLeft(TIMER_SECONDS);
    setScreen("playing");
  }, []);

  // Timer effect
  useEffect(() => {
    if (screen !== "playing") {
      clearTimer();
      return;
    }

    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setResults((r) => [
            ...r,
            {
              scenario: scenarios[currentRound],
              selectedType: null,
              correct: false,
              timedOut: true,
            },
          ]);
          setScreen("feedback");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [screen, currentRound, clearTimer, scenarios]);

  const handleSelect = useCallback(
    (typeId: number) => {
      if (selectedType !== null || screen !== "playing" || !currentScenario) return;
      clearTimer();
      setSelectedType(typeId);
      const correct = typeId === currentScenario.correctType;
      setResults((r) => [
        ...r,
        {
          scenario: currentScenario,
          selectedType: typeId,
          correct,
          timedOut: false,
        },
      ]);
      setScreen("feedback");
    },
    [selectedType, screen, currentScenario, clearTimer],
  );

  // Pointer-based drag and drop (works on both desktop and mobile)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, typeId: number) => {
      if (selectedType !== null || screen !== "playing") return;
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      };
      setDraggingId(typeId);
      setDragPos({ x: e.clientX, y: e.clientY });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [selectedType, screen],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingId === null) return;
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });

      // Check if over drop zone
      if (dropZoneRef.current) {
        const dzRect = dropZoneRef.current.getBoundingClientRect();
        const over =
          e.clientX >= dzRect.left &&
          e.clientX <= dzRect.right &&
          e.clientY >= dzRect.top &&
          e.clientY <= dzRect.bottom;
        setDropHighlight(over);
      }
    },
    [draggingId],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (draggingId === null) return;
      e.preventDefault();

      // Check if dropped on drop zone
      if (dropZoneRef.current) {
        const dzRect = dropZoneRef.current.getBoundingClientRect();
        const over =
          e.clientX >= dzRect.left &&
          e.clientX <= dzRect.right &&
          e.clientY >= dzRect.top &&
          e.clientY <= dzRect.bottom;
        if (over) {
          handleSelect(draggingId);
        }
      }

      setDraggingId(null);
      setDragPos(null);
      setDropHighlight(false);
    },
    [draggingId, handleSelect],
  );

  const handleNext = useCallback(() => {
    const nextRound = currentRound + 1;
    if (nextRound >= ROUNDS_PER_GAME) {
      setScreen("results");
    } else {
      setCurrentRound(nextRound);
      setSelectedType(null);
      setTimeLeft(TIMER_SECONDS);
      setScreen("playing");
    }
  }, [currentRound]);

  const score = results.filter((r) => r.correct).length;
  const grade = getGrade(score, ROUNDS_PER_GAME);
  const latestResult = results[results.length - 1] ?? null;

  const handleShare = useCallback(async () => {
    const text = `I scored ${score}/${ROUNDS_PER_GAME} (${grade.label}) on the Life Jacket Picker game! Can you pick the right PFD for every scenario? ${SHARE_URL}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Life Jacket Picker", text, url: SHARE_URL });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!", description: "Share your score with friends." });
    }
  }, [score, grade.label, toast]);

  const handleCopyEmbed = useCallback(async () => {
    const code = `<iframe src="https://onlineboatereducation.com/embed/games/life-jacket-picker" width="100%" height="700" frameborder="0" title="Life Jacket Picker Game"></iframe>`;
    await navigator.clipboard.writeText(code);
    toast({ title: "Embed code copied!", description: "Paste it into your website HTML." });
  }, [toast]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;

  // --- Intro Screen ---
  if (screen === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-900 text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Life Jacket Picker",
              description: "Test your boating safety knowledge — pick the correct PFD type for each scenario in this interactive drag-and-drop game.",
              url: SHARE_URL,
              applicationCategory: "Game",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
              <LifeBuoy className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Life Jacket Picker</h1>
            <p className="text-lg text-sky-200">
              Drag the correct PFD type onto each boating scenario. Learn when to use all 5 types of personal flotation devices.
            </p>
          </div>

          <div className="grid gap-4 mb-10">
            <Card className="bg-white/10 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Read the Scenario</h3>
                  <p className="text-sm text-sky-200">Each round shows a boating situation with an illustration — from offshore storms to calm lakes.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Drag the Right PFD</h3>
                  <p className="text-sm text-sky-200">Drag the correct life jacket type from the bottom onto the drop zone. You have {TIMER_SECONDS} seconds per round.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Learn & Improve</h3>
                  <p className="text-sm text-sky-200">See why the correct PFD type is the right choice after each pick. Score a perfect 10 for Master Mariner!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-12">
            <Button
              size="lg"
              onClick={startGame}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-6 text-lg rounded-xl"
            >
              Start Game
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">The 5 PFD Types</h2>
            <div className="grid gap-3">
              {PFD_TYPES.map((pfd) => (
                <div key={pfd.id} className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <PFDIcon typeId={pfd.id} size={48} />
                  </div>
                  <div>
                    <div className="font-semibold text-cyan-300 mb-1">{pfd.name}</div>
                    <p className="text-sm text-sky-200">{pfd.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Playing Screen ---
  if (screen === "playing" && currentScenario) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-900 text-white select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="border-sky-400 text-sky-300 text-sm px-3 py-1">
              Round {currentRound + 1} / {ROUNDS_PER_GAME}
            </Badge>
            <div className="flex items-center gap-2 text-sky-300">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold text-lg">{timeLeft}s</span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 linear"
              style={{
                width: `${timerPct}%`,
                backgroundColor: timeLeft <= 3 ? "#ef4444" : timeLeft <= 6 ? "#f59e0b" : "#22d3ee",
              }}
            />
          </div>

          {/* Scene illustration */}
          <div className="mb-4">
            <SceneIllustration scene={currentScenario.scene} />
          </div>

          {/* Scenario text */}
          <Card className="bg-white/10 border-white/10 mb-4">
            <CardContent className="p-4">
              <p className="text-base text-white leading-relaxed">{currentScenario.description}</p>
            </CardContent>
          </Card>

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            className={`rounded-xl border-2 border-dashed p-6 mb-5 text-center transition-all ${
              dropHighlight
                ? "border-cyan-400 bg-cyan-400/20 scale-[1.02]"
                : "border-white/20 bg-white/5"
            }`}
          >
            <LifeBuoy className={`w-8 h-8 mx-auto mb-2 ${dropHighlight ? "text-cyan-300" : "text-sky-400/50"}`} />
            <p className={`text-sm font-medium ${dropHighlight ? "text-cyan-200" : "text-sky-300/70"}`}>
              {dropHighlight ? "Release to select!" : "Drag a PFD type here"}
            </p>
          </div>

          {/* PFD type cards — draggable */}
          <div className="grid grid-cols-5 gap-2">
            {PFD_TYPES.map((pfd) => (
              <button
                key={pfd.id}
                onPointerDown={(e) => handlePointerDown(e, pfd.id)}
                onClick={() => handleSelect(pfd.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all cursor-grab active:cursor-grabbing ${
                  draggingId === pfd.id
                    ? "opacity-40 border-white/10 bg-white/5"
                    : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50"
                }`}
                style={{ touchAction: "none" }}
              >
                <PFDIcon typeId={pfd.id} size={36} />
                <span className="text-xs font-semibold text-white leading-tight text-center">{pfd.shortName}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-sky-400/60 text-center mt-2">Drag onto the drop zone above, or tap to select</p>
        </div>

        {/* Drag ghost */}
        {draggingId !== null && dragPos && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: dragPos.x - 30,
              top: dragPos.y - 30,
            }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-cyan-400/50 shadow-xl shadow-cyan-500/20">
              <PFDIcon typeId={draggingId} size={44} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Feedback Screen ---
  if (screen === "feedback" && latestResult) {
    const wasCorrect = latestResult.correct;
    const wasTimedOut = latestResult.timedOut;
    const correctPFD = PFD_TYPES.find((p) => p.id === latestResult.scenario.correctType)!;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Result banner */}
          <div
            className={`rounded-xl p-6 mb-6 text-center ${
              wasCorrect ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"
            }`}
          >
            {wasCorrect ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-green-300">Correct!</h2>
              </>
            ) : (
              <>
                <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-red-300">{wasTimedOut ? "Time's Up!" : "Incorrect"}</h2>
                {latestResult.selectedType && (
                  <p className="text-red-200 mt-1">
                    You picked {getPFDTypeName(latestResult.selectedType)} — the correct answer is {correctPFD.shortName}.
                  </p>
                )}
                {wasTimedOut && (
                  <p className="text-red-200 mt-1">The correct answer is {correctPFD.shortName}.</p>
                )}
              </>
            )}
          </div>

          {/* Scene + scenario recap */}
          <div className="mb-4">
            <SceneIllustration scene={latestResult.scenario.scene} />
          </div>
          <Card className="bg-white/10 border-white/10 mb-4">
            <CardContent className="p-5">
              <p className="text-sky-200 text-sm leading-relaxed">{latestResult.scenario.description}</p>
            </CardContent>
          </Card>

          {/* Correct answer + explanation */}
          <Card className="bg-cyan-500/10 border-cyan-400/20 mb-8">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <PFDIcon typeId={correctPFD.id} size={48} />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300 mb-1">{correctPFD.name}</h3>
                  <p className="text-sm text-sky-200 leading-relaxed">{latestResult.scenario.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score progress */}
          <div className="flex items-center justify-between mb-6 text-sm text-sky-300">
            <span>Score: {score} / {results.length}</span>
            <span>Round {results.length} of {ROUNDS_PER_GAME}</span>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-5 rounded-xl"
            >
              {results.length >= ROUNDS_PER_GAME ? "See Results" : "Next Scenario"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Results Screen ---
  if (screen === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Trophy section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Game Complete!</h1>
            <p className="text-5xl font-bold text-white my-4">
              {score} <span className="text-2xl text-sky-300">/ {ROUNDS_PER_GAME}</span>
            </p>
            <p className={`text-xl font-semibold ${grade.color}`}>{grade.label}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button onClick={startGame} variant="outline" className="border-sky-400 text-sky-300 hover:bg-sky-400/10">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={handleShare} variant="outline" className="border-sky-400 text-sky-300 hover:bg-sky-400/10">
              <Share2 className="w-4 h-4 mr-2" />
              Share Score
            </Button>
            <Button
              onClick={() => setShowEmbedCode(!showEmbedCode)}
              variant="outline"
              className="border-sky-400 text-sky-300 hover:bg-sky-400/10"
            >
              Embed Game
            </Button>
          </div>

          {showEmbedCode && (
            <Card className="bg-white/10 border-white/10 mb-8">
              <CardContent className="p-5">
                <p className="text-sm text-sky-200 mb-3">Copy this code to embed the Life Jacket Picker game on your website:</p>
                <pre className="bg-black/30 rounded-lg p-3 text-xs text-sky-300 overflow-x-auto mb-3">
                  {`<iframe src="https://onlineboatereducation.com/embed/games/life-jacket-picker" width="100%" height="700" frameborder="0" title="Life Jacket Picker Game"></iframe>`}
                </pre>
                <Button size="sm" onClick={handleCopyEmbed} className="bg-cyan-500 hover:bg-cyan-400 text-white">
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Round-by-round review */}
          <h2 className="text-lg font-semibold mb-4">Round-by-Round Review</h2>
          <div className="grid gap-3 mb-10">
            {results.map((r, i) => {
              const correctPFD = PFD_TYPES.find((p) => p.id === r.scenario.correctType)!;
              return (
                <Card
                  key={i}
                  className={`border ${r.correct ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {r.correct ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-sky-400">Round {i + 1}</span>
                          {r.timedOut && (
                            <Badge variant="outline" className="border-red-400/50 text-red-300 text-xs px-1.5 py-0">Timed out</Badge>
                          )}
                        </div>
                        <p className="text-sm text-sky-100 leading-relaxed mb-2 line-clamp-2">{r.scenario.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-sky-300 flex items-center gap-1.5">
                            <PFDIcon typeId={correctPFD.id} size={20} />
                            Correct: <strong className="text-cyan-300">{correctPFD.shortName}</strong>
                          </span>
                          {r.selectedType && !r.correct && (
                            <span className="text-red-300 flex items-center gap-1.5">
                              <PFDIcon typeId={r.selectedType} size={20} />
                              Your pick: <strong>{getPFDTypeName(r.selectedType)}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer links */}
          <div className="text-center space-y-3">
            <Button
              onClick={startGame}
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-5 rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            <div>
              <Link href="/games" className="text-sm text-sky-300 hover:text-sky-100 underline underline-offset-4">
                Back to All Games
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
