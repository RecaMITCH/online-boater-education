import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Anchor,
  ArrowRight,
  ChevronRight,
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Code2,
  Ship,
  Navigation,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

type Action = "turn-port" | "turn-starboard" | "maintain" | "slow-stop" | "sound-signal";

interface ActionOption {
  id: Action;
  label: string;
  icon: string;
  shortLabel: string;
}

const ACTIONS: ActionOption[] = [
  { id: "turn-port", label: "Turn to Port (Left)", icon: "↰", shortLabel: "Port" },
  { id: "turn-starboard", label: "Turn to Starboard (Right)", icon: "↱", shortLabel: "Starboard" },
  { id: "maintain", label: "Maintain Course & Speed", icon: "↑", shortLabel: "Maintain" },
  { id: "slow-stop", label: "Slow Down or Stop", icon: "⏸", shortLabel: "Slow/Stop" },
  { id: "sound-signal", label: "Sound Danger Signal (5+ Blasts)", icon: "📢", shortLabel: "Signal" },
];

interface Scenario {
  id: number;
  title: string;
  situation: string;
  category: string;
  timeLimit: number;
  correctAction: Action;
  ruleName: string;
  ruleExplanation: string;
  diagram: DiagramConfig;
}

interface Vessel {
  x: number;
  y: number;
  rotation: number; // degrees, 0 = up/north
  label: string;
  type: "power" | "sail" | "pwc" | "commercial" | "kayak" | "you";
  color: string;
}

interface DiagramConfig {
  vessels: Vessel[];
  waterFeatures?: WaterFeature[];
}

interface WaterFeature {
  type: "buoy-red" | "buoy-green" | "channel" | "shore" | "swimmer" | "wake-zone";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
}

// --- Scenarios ---

const ALL_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Head-On Encounter",
    situation: "You're operating a powerboat and see another powerboat approaching you head-on. Both vessels are traveling at moderate speed in open water. What should you do?",
    category: "Meeting Head-On",
    timeLimit: 12,
    correctAction: "turn-starboard",
    ruleName: "Head-On Rule (Rule 14)",
    ruleExplanation: "When two power-driven vessels are meeting head-on, BOTH vessels must alter course to starboard (right) so they pass port-to-port. This is one of the most fundamental navigation rules. Think of it like driving on the road — stay to the right.",
    diagram: {
      vessels: [
        { x: 200, y: 320, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 200, y: 80, rotation: 180, label: "Other", type: "power", color: "#ef4444" },
      ],
    },
  },
  {
    id: 2,
    title: "Crossing from Starboard",
    situation: "You're heading north in your powerboat. Another powerboat is approaching from your starboard (right) side and will cross your path. What should you do?",
    category: "Crossing Situation",
    timeLimit: 12,
    correctAction: "slow-stop",
    ruleName: "Crossing Rule — Give-Way Vessel (Rule 15)",
    ruleExplanation: "When two power-driven vessels are crossing, the vessel that has the other on its STARBOARD (right) side must give way. You are the give-way vessel here. You should slow down, stop, or turn to starboard to pass behind the other vessel. The key rule: if you see a vessel on your right, give way.",
    diagram: {
      vessels: [
        { x: 200, y: 280, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 340, y: 200, rotation: 270, label: "Other", type: "power", color: "#ef4444" },
      ],
    },
  },
  {
    id: 3,
    title: "Crossing from Port",
    situation: "You're heading east in your powerboat. Another powerboat is approaching from your port (left) side. It appears you will cross paths. What should you do?",
    category: "Crossing Situation",
    timeLimit: 12,
    correctAction: "maintain",
    ruleName: "Crossing Rule — Stand-On Vessel (Rule 17)",
    ruleExplanation: "When a vessel is approaching from your PORT (left) side, YOU are the stand-on vessel. Your responsibility is to maintain your course and speed so the give-way vessel can predict your movement and avoid you. Do not turn or slow down unpredictably — the other vessel is required to give way to you.",
    diagram: {
      vessels: [
        { x: 160, y: 200, rotation: 90, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 80, y: 100, rotation: 135, label: "Other", type: "power", color: "#ef4444" },
      ],
    },
  },
  {
    id: 4,
    title: "Overtaking Another Vessel",
    situation: "You're approaching a slower powerboat from behind and want to pass. You are overtaking this vessel. What should you do?",
    category: "Overtaking",
    timeLimit: 12,
    correctAction: "turn-starboard",
    ruleName: "Overtaking Rule (Rule 13)",
    ruleExplanation: "The overtaking vessel must keep clear of the vessel being overtaken. You may pass on either side, but starboard is generally preferred in open water. The critical point: ANY vessel overtaking ANY other vessel must keep clear, regardless of vessel type. Even a sailboat overtaking a powerboat must give way.",
    diagram: {
      vessels: [
        { x: 200, y: 300, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 200, y: 160, rotation: 0, label: "Slower", type: "power", color: "#ef4444" },
      ],
    },
  },
  {
    id: 5,
    title: "Sailboat Under Sail",
    situation: "You're driving a powerboat and a sailboat under sail (no motor) is crossing your path from the right. The sailboat is not overtaking you. What should you do?",
    category: "Sail vs. Power",
    timeLimit: 12,
    correctAction: "slow-stop",
    ruleName: "Power Gives Way to Sail (Rule 18)",
    ruleExplanation: "A power-driven vessel must give way to a sailing vessel (under sail, not using its engine). This is a fundamental hierarchy: sail has right of way over power. You should slow down, stop, or alter course to avoid the sailboat. Exceptions: sailboats must still give way if they are overtaking, and commercial vessels in narrow channels have special priority.",
    diagram: {
      vessels: [
        { x: 180, y: 280, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 310, y: 170, rotation: 240, label: "Sailboat", type: "sail", color: "#ef4444" },
      ],
    },
  },
  {
    id: 6,
    title: "Narrow Channel Navigation",
    situation: "You're traveling through a narrow channel. A large commercial vessel is approaching from ahead in the same channel. What should you do?",
    category: "Narrow Channels",
    timeLimit: 12,
    correctAction: "turn-starboard",
    ruleName: "Narrow Channel Rule (Rule 9)",
    ruleExplanation: "In a narrow channel, vessels must keep to the starboard (right) side of the channel. Small recreational vessels must not impede the passage of vessels that can only safely navigate within the channel. Move to the right side and give the commercial vessel room to pass safely.",
    diagram: {
      vessels: [
        { x: 200, y: 320, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 200, y: 80, rotation: 180, label: "Commercial", type: "commercial", color: "#ef4444" },
      ],
      waterFeatures: [
        { type: "shore", x: 80, y: 0, width: 40, height: 400 },
        { type: "shore", x: 280, y: 0, width: 40, height: 400 },
      ],
    },
  },
  {
    id: 7,
    title: "PWC Approaching Swimmers",
    situation: "You're operating a PWC (jet ski) and see swimmers in the water ahead, marked by a swim area buoy line. You're approaching at speed. What should you do?",
    category: "Safety & Speed",
    timeLimit: 10,
    correctAction: "slow-stop",
    ruleName: "Safe Speed & Swim Areas",
    ruleExplanation: "Every vessel must operate at a safe speed at all times (Rule 6). When approaching swimmers, a designated swim area, or any situation where people may be in the water, you must slow to idle speed or stop. PWC operators are particularly responsible because jet ski injuries are a leading cause of boating accidents. Many states require staying at least 100-200 feet from swimmers.",
    diagram: {
      vessels: [
        { x: 200, y: 320, rotation: 0, label: "YOU", type: "pwc", color: "#3b82f6" },
      ],
      waterFeatures: [
        { type: "swimmer", x: 170, y: 100 },
        { type: "swimmer", x: 210, y: 120 },
        { type: "swimmer", x: 230, y: 90 },
      ],
    },
  },
  {
    id: 8,
    title: "Vessel Not Responding",
    situation: "You're on a crossing course with another powerboat that should be giving way to you (it's on your port side). But the other vessel is NOT altering course and the distance is closing fast. What should you do?",
    category: "Emergency Action",
    timeLimit: 10,
    correctAction: "sound-signal",
    ruleName: "Danger Signal & Stand-On Vessel Action (Rules 34 & 17)",
    ruleExplanation: "When a give-way vessel is not taking action, the stand-on vessel should first sound the danger signal: FIVE or more short, rapid blasts on the horn. This alerts the other vessel that you're concerned about collision. If the situation becomes critical, Rule 17 allows the stand-on vessel to take any action necessary to avoid collision. But the first step is always the danger signal.",
    diagram: {
      vessels: [
        { x: 200, y: 260, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 100, y: 140, rotation: 120, label: "Not Giving Way!", type: "power", color: "#ef4444" },
      ],
    },
  },
  {
    id: 9,
    title: "Red and Green Buoys",
    situation: "You're returning to port (heading inland) through a marked channel. You see a red buoy on your left and a green buoy on your right. Are you on the correct side of the channel?",
    category: "Navigation Aids",
    timeLimit: 15,
    correctAction: "maintain",
    ruleName: "Red Right Returning",
    ruleExplanation: "The rule is 'Red Right Returning' — when returning to port (heading inland/upstream), keep RED buoys on your RIGHT (starboard) side. In this scenario, red is on your LEFT, which means you are correctly positioned with red on the correct side... wait — actually, red should be on your RIGHT when returning. Since red is on your LEFT, you're in the correct position in the channel! The red buoy to your left means it's marking the right side of the channel as you return. You're maintaining the correct course.",
    diagram: {
      vessels: [
        { x: 200, y: 300, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
      ],
      waterFeatures: [
        { type: "buoy-red", x: 130, y: 180 },
        { type: "buoy-green", x: 270, y: 180 },
      ],
    },
  },
  {
    id: 10,
    title: "Kayak in Your Path",
    situation: "You're driving a motorboat at cruising speed and see a kayaker paddling across your path about 200 feet ahead. The kayak is moving slowly. What should you do?",
    category: "Vessel Hierarchy",
    timeLimit: 12,
    correctAction: "slow-stop",
    ruleName: "Power Gives Way to Paddle (Rule 18)",
    ruleExplanation: "Power-driven vessels must give way to vessels under oars or paddles (kayaks, canoes, rowboats). Even though you're larger and faster, the kayak has the right of way. You should slow down and alter course to pass safely. Additionally, your wake could capsize a small vessel like a kayak, so reducing speed protects the paddler.",
    diagram: {
      vessels: [
        { x: 200, y: 320, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 240, y: 150, rotation: 270, label: "Kayak", type: "kayak", color: "#ef4444" },
      ],
    },
  },
  {
    id: 11,
    title: "Restricted Visibility (Fog)",
    situation: "Thick fog has rolled in and visibility is very limited. You can barely see 50 feet ahead. You hear a horn signal from somewhere ahead but can't see the vessel. What should you do?",
    category: "Restricted Visibility",
    timeLimit: 10,
    correctAction: "slow-stop",
    ruleName: "Conduct in Restricted Visibility (Rule 19)",
    ruleExplanation: "In restricted visibility (fog, rain, snow), every vessel must proceed at a safe speed adapted to the conditions. If you detect another vessel by sound alone and cannot determine if a risk of collision exists, you must reduce speed to the minimum at which you can maintain course, or stop entirely. You should also sound appropriate fog signals.",
    diagram: {
      vessels: [
        { x: 200, y: 300, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
      ],
    },
  },
  {
    id: 12,
    title: "Two Sailboats Meeting",
    situation: "You're sailing with the wind coming from your port (left) side. Another sailboat is approaching from ahead with the wind on its starboard (right) side. You're on a collision course. What should you do?",
    category: "Sail vs. Sail",
    timeLimit: 15,
    correctAction: "turn-starboard",
    ruleName: "Sail vs. Sail — Wind on Port Gives Way (Rule 12)",
    ruleExplanation: "When two sailboats meet: the vessel with the wind on the PORT side must give way to the vessel with the wind on the STARBOARD side. Since your wind is on your port side, you are the give-way vessel. You should alter course to starboard to avoid the other sailboat. An easy way to remember: 'port wine is red, and red means stop — give way.'",
    diagram: {
      vessels: [
        { x: 180, y: 300, rotation: 20, label: "YOU (wind on port)", type: "sail", color: "#3b82f6" },
        { x: 230, y: 100, rotation: 200, label: "Wind on starboard", type: "sail", color: "#ef4444" },
      ],
    },
  },
  {
    id: 13,
    title: "Vessel Aground",
    situation: "You see a vessel ahead displaying three black balls in a vertical line (or at night, three red lights). This vessel appears to be stationary in the channel. What should you do?",
    category: "Special Signals",
    timeLimit: 12,
    correctAction: "slow-stop",
    ruleName: "Vessel Aground Signals (Rule 30)",
    ruleExplanation: "Three black balls (day) or three red lights (night) indicate a vessel that is aground. You should slow down significantly and keep well clear. Your wake could cause further damage to the grounded vessel or injure people aboard. Pass at a safe distance and at minimal speed.",
    diagram: {
      vessels: [
        { x: 200, y: 320, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 200, y: 100, rotation: 45, label: "AGROUND", type: "commercial", color: "#ef4444" },
      ],
    },
  },
  {
    id: 14,
    title: "No-Wake Zone",
    situation: "You're cruising at 30 mph and see a sign indicating you're entering a No-Wake Zone near a marina. Several boats are docked in the area. What should you do?",
    category: "Safety & Speed",
    timeLimit: 10,
    correctAction: "slow-stop",
    ruleName: "No-Wake Zones",
    ruleExplanation: "No-Wake Zones (also called Idle Speed zones) require you to reduce speed so your vessel produces no wake. This typically means slowing to 5 mph or less. These zones exist near marinas, docks, anchored vessels, swimming areas, and shorelines where wakes can cause damage to property, capsize small boats, or endanger swimmers. Violations can result in fines.",
    diagram: {
      vessels: [
        { x: 200, y: 320, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
      ],
      waterFeatures: [
        { type: "wake-zone", x: 100, y: 40, width: 200, height: 60 },
      ],
    },
  },
  {
    id: 15,
    title: "Emergency Vessel Approaching",
    situation: "You hear a siren and see flashing blue lights. A law enforcement or emergency vessel is approaching from behind at high speed. What should you do?",
    category: "Emergency",
    timeLimit: 10,
    correctAction: "slow-stop",
    ruleName: "Emergency Vessels",
    ruleExplanation: "Just like on the road, you must give way to emergency vessels (law enforcement, fire rescue, Coast Guard). Slow down, move to the right side of the waterway, and stop if necessary. Allow the emergency vessel to pass safely. Creating a wake that affects the emergency vessel or failing to yield can result in citations.",
    diagram: {
      vessels: [
        { x: 200, y: 240, rotation: 0, label: "YOU", type: "you", color: "#3b82f6" },
        { x: 200, y: 360, rotation: 0, label: "EMERGENCY", type: "power", color: "#dc2626" },
      ],
    },
  },
];

// --- Scoring ---

function getGrade(score: number, total: number): { grade: string; label: string; color: string } {
  const pct = (score / total) * 100;
  if (pct === 100) return { grade: "Perfect", label: "Master Captain", color: "text-yellow-500" };
  if (pct >= 90) return { grade: "A", label: "Expert Navigator", color: "text-green-500" };
  if (pct >= 80) return { grade: "B", label: "Skilled Boater", color: "text-blue-500" };
  if (pct >= 70) return { grade: "C", label: "Needs Practice", color: "text-orange-500" };
  if (pct >= 50) return { grade: "D", label: "Study the Rules", color: "text-red-400" };
  return { grade: "F", label: "Take the Course", color: "text-red-600" };
}

// --- SVG Diagram ---

function BoatIcon({ x, y, rotation, type, color, label }: Vessel) {
  const size = type === "commercial" ? 28 : type === "pwc" ? 16 : type === "kayak" ? 20 : 22;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {type === "commercial" ? (
        <>
          <rect x={-size / 2} y={-size} width={size} height={size * 2} rx={4} fill={color} opacity={0.9} />
          <rect x={-size / 2 + 3} y={-size + 4} width={size - 6} height={8} rx={2} fill="white" opacity={0.3} />
        </>
      ) : type === "sail" ? (
        <>
          <path d={`M0,${-size} L${size / 2},${size * 0.7} L${-size / 2},${size * 0.7} Z`} fill={color} opacity={0.9} />
          <line x1={0} y1={-size * 0.3} x2={size * 0.6} y2={0} stroke="white" strokeWidth={1.5} opacity={0.6} />
        </>
      ) : type === "kayak" ? (
        <>
          <ellipse cx={0} cy={0} rx={size / 4} ry={size} fill={color} opacity={0.9} />
          <line x1={-size * 0.4} y1={-2} x2={size * 0.4} y2={2} stroke="white" strokeWidth={1.5} opacity={0.5} />
        </>
      ) : type === "pwc" ? (
        <>
          <path d={`M0,${-size} L${size / 2.5},${size * 0.6} L0,${size * 0.4} L${-size / 2.5},${size * 0.6} Z`} fill={color} opacity={0.9} />
        </>
      ) : (
        <>
          <path d={`M0,${-size} L${size / 2},${size * 0.7} L${size / 3},${size} L${-size / 3},${size} L${-size / 2},${size * 0.7} Z`} fill={color} opacity={0.9} />
          {type === "you" && (
            <circle cx={0} cy={0} r={3} fill="white" opacity={0.8} />
          )}
        </>
      )}
      {/* Direction arrow */}
      <line x1={0} y1={-size - 4} x2={0} y2={-size - 14} stroke={color} strokeWidth={2} markerEnd="url(#arrowhead)" opacity={0.7} />
      {/* Label */}
      <text
        x={0}
        y={size + 16}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontWeight="bold"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
      >
        {label}
      </text>
    </g>
  );
}

function WaterFeatureIcon({ feature }: { feature: WaterFeature }) {
  switch (feature.type) {
    case "buoy-red":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          <circle cx={0} cy={0} r={10} fill="#dc2626" stroke="#991b1b" strokeWidth={2} />
          <text x={0} y={4} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">R</text>
        </g>
      );
    case "buoy-green":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          <rect x={-9} y={-12} width={18} height={24} fill="#16a34a" stroke="#15803d" strokeWidth={2} />
          <text x={0} y={4} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">G</text>
        </g>
      );
    case "shore":
      return (
        <rect
          x={feature.x}
          y={feature.y}
          width={feature.width || 40}
          height={feature.height || 400}
          fill="#92400e"
          opacity={0.5}
          rx={4}
        />
      );
    case "swimmer":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          <circle cx={0} cy={0} r={8} fill="#f59e0b" stroke="#d97706" strokeWidth={1.5} />
          <text x={0} y={4} textAnchor="middle" fill="white" fontSize={8}>🏊</text>
        </g>
      );
    case "wake-zone":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          <rect x={0} y={0} width={feature.width || 200} height={feature.height || 60} fill="#1e3a5f" opacity={0.5} rx={4} stroke="#60a5fa" strokeWidth={1} strokeDasharray="6 3" />
          <text x={(feature.width || 200) / 2} y={(feature.height || 60) / 2 + 4} textAnchor="middle" fill="#93c5fd" fontSize={12} fontWeight="bold">NO WAKE ZONE</text>
        </g>
      );
    default:
      return null;
  }
}

function ScenarioDiagram({ diagram, isFog }: { diagram: DiagramConfig; isFog?: boolean }) {
  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-auto rounded-lg border border-white/10">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" opacity="0.5" />
          </marker>
          <radialGradient id="water-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          {isFog && (
            <filter id="fog-filter">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          )}
        </defs>

        {/* Water background */}
        <rect width="400" height="400" fill="url(#water-gradient)" />

        {/* Subtle wave lines */}
        {[60, 130, 200, 270, 340].map((y) => (
          <path
            key={y}
            d={`M0,${y} Q100,${y - 6} 200,${y} Q300,${y + 6} 400,${y}`}
            fill="none"
            stroke="rgba(96,165,250,0.1)"
            strokeWidth={1}
          />
        ))}

        {/* Compass rose (small, top-right) */}
        <g transform="translate(365, 35)" opacity={0.4}>
          <circle cx={0} cy={0} r={16} fill="none" stroke="white" strokeWidth={0.5} />
          <text x={0} y={-18} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">N</text>
          <line x1={0} y1={-12} x2={0} y2={12} stroke="white" strokeWidth={0.5} />
          <line x1={-12} y1={0} x2={12} y2={0} stroke="white" strokeWidth={0.5} />
        </g>

        {/* Water features */}
        {diagram.waterFeatures?.map((f, i) => (
          <WaterFeatureIcon key={i} feature={f} />
        ))}

        {/* Fog overlay */}
        {isFog && (
          <rect width="400" height="400" fill="rgba(200,200,200,0.4)" />
        )}

        {/* Vessels */}
        <g filter={isFog ? "url(#fog-filter)" : undefined}>
          {diagram.vessels
            .filter((v) => v.type !== "you")
            .map((vessel, i) => (
              <BoatIcon key={i} {...vessel} />
            ))}
        </g>

        {/* Your vessel (always clear, even in fog) */}
        {diagram.vessels
          .filter((v) => v.type === "you")
          .map((vessel, i) => (
            <BoatIcon key={`you-${i}`} {...vessel} />
          ))}
      </svg>
    </div>
  );
}

// --- Game States ---

type GameState = "intro" | "playing" | "feedback" | "results";

interface RoundResult {
  scenario: Scenario;
  playerAction: Action | null;
  correct: boolean;
  timeRemaining: number;
  timedOut: boolean;
}

// --- Main Component ---

export default function RightOfWay() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [playerAction, setPlayerAction] = useState<Action | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentScenario = scenarios[currentIndex];

  // Shuffle and pick 10 scenarios
  const startGame = useCallback(() => {
    const shuffled = [...ALL_SCENARIOS].sort(() => Math.random() - 0.5);
    setScenarios(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setResults([]);
    setPlayerAction(null);
    setGameState("playing");
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || !currentScenario) return;

    setTimeRemaining(currentScenario.timeLimit);
    setPlayerAction(null);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time's up — record as wrong
          setResults((r) => [
            ...r,
            {
              scenario: currentScenario,
              playerAction: null,
              correct: false,
              timeRemaining: 0,
              timedOut: true,
            },
          ]);
          setGameState("feedback");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, currentScenario]);

  // Scroll to top on state change
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [gameState, currentIndex]);

  const handleAction = useCallback(
    (action: Action) => {
      if (gameState !== "playing" || !currentScenario || playerAction) return;

      if (timerRef.current) clearInterval(timerRef.current);
      setPlayerAction(action);

      const correct = action === currentScenario.correctAction;
      setResults((r) => [
        ...r,
        {
          scenario: currentScenario,
          playerAction: action,
          correct,
          timeRemaining,
          timedOut: false,
        },
      ]);
      setGameState("feedback");
    },
    [gameState, currentScenario, playerAction, timeRemaining]
  );

  const nextScenario = useCallback(() => {
    if (currentIndex + 1 >= scenarios.length) {
      setGameState("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setGameState("playing");
    }
  }, [currentIndex, scenarios.length]);

  const correctCount = results.filter((r) => r.correct).length;
  const lastResult = results[results.length - 1];

  const shareResults = useCallback(() => {
    const grade = getGrade(correctCount, scenarios.length);
    const text = `I scored ${correctCount}/${scenarios.length} (${grade.grade}) on the Right of Way boating game! ⚓\n\nTest your navigation knowledge: https://onlineboatereducation.com/right-of-way`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!", description: "Share your results with friends." });
  }, [correctCount, scenarios.length, toast]);

  const copyEmbed = useCallback(() => {
    const code = `<iframe src="https://onlineboatereducation.com/embed/right-of-way" width="100%" height="800" style="border:none;border-radius:8px;" title="Right of Way — Boating Navigation Game"></iframe>`;
    navigator.clipboard.writeText(code);
    toast({ title: "Embed code copied!", description: "Paste into your website HTML." });
  }, [toast]);

  // --- INTRO ---
  if (gameState === "intro") {
    return (
      <div ref={gameRef} className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <Navigation className="h-3 w-3 mr-1" />
              Interactive Game
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Right of Way
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Test your knowledge of boating navigation rules. You'll face 10 real-world
              scenarios and must decide the correct action — just like on the water.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-4">How It Works</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Ship className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Read the Scenario</p>
                    <p className="text-sm text-muted-foreground">Each round describes a boating encounter with a bird's-eye diagram.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Beat the Clock</p>
                    <p className="text-sm text-muted-foreground">You have 10–15 seconds to choose your action. On the water, hesitation can be dangerous.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Navigation className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Choose Your Action</p>
                    <p className="text-sm text-muted-foreground">Turn port, turn starboard, maintain course, slow down, or sound the danger signal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Learn the Rules</p>
                    <p className="text-sm text-muted-foreground">After each round, get a detailed explanation of the correct navigation rule.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button size="lg" onClick={startGame} data-testid="button-start-game">
              Start Game
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              Based on the U.S. Inland Navigation Rules (USCG COLREGS). Not sure if you need boater education?{" "}
              <Link href="/quiz" className="text-primary underline">Take the quiz</Link>.
            </p>
          </div>
        </div>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Right of Way — Boating Navigation Game",
              url: "https://onlineboatereducation.com/right-of-way",
              applicationCategory: "GameApplication",
              operatingSystem: "All",
              description:
                "Free interactive game to test your knowledge of boating right-of-way rules and navigation encounters.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </div>
    );
  }

  // --- PLAYING ---
  if (gameState === "playing" && currentScenario) {
    const timerPct = (timeRemaining / currentScenario.timeLimit) * 100;
    const isFog = currentScenario.id === 11;

    return (
      <div ref={gameRef} className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Round {currentIndex + 1} / {scenarios.length}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${timeRemaining <= 3 ? "text-red-500" : "text-muted-foreground"}`} />
              <span className={`font-mono font-bold text-lg ${timeRemaining <= 3 ? "text-red-500" : ""}`}>
                {timeRemaining}s
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                timerPct > 50 ? "bg-primary" : timerPct > 25 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>

          {/* Category */}
          <Badge variant="secondary" className="mb-3">{currentScenario.category}</Badge>

          {/* Title & Situation */}
          <h2 className="text-xl font-serif font-bold mb-2">{currentScenario.title}</h2>
          <p className="text-muted-foreground mb-6">{currentScenario.situation}</p>

          {/* Diagram */}
          <ScenarioDiagram diagram={currentScenario.diagram} isFog={isFog} />

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="lg"
                className="h-auto py-4 px-4 text-left justify-start gap-3"
                onClick={() => handleAction(action.id)}
                data-testid={`action-${action.id}`}
              >
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <div className="font-medium">{action.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- FEEDBACK ---
  if (gameState === "feedback" && lastResult) {
    const correct = lastResult.correct;
    const correctActionObj = ACTIONS.find((a) => a.id === lastResult.scenario.correctAction)!;
    const playerActionObj = lastResult.playerAction ? ACTIONS.find((a) => a.id === lastResult.playerAction) : null;

    return (
      <div ref={gameRef} className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {/* Result banner */}
          <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${correct ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
            {correct ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p className={`font-bold ${correct ? "text-green-500" : "text-red-500"}`}>
                {lastResult.timedOut ? "Time's Up!" : correct ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm text-muted-foreground">
                {lastResult.timedOut
                  ? "You ran out of time to make a decision."
                  : correct
                  ? `You chose "${correctActionObj.label}" — that's right!`
                  : `You chose "${playerActionObj?.label}". The correct action was "${correctActionObj.label}".`}
              </p>
            </div>
          </div>

          {/* Diagram replay */}
          <ScenarioDiagram diagram={lastResult.scenario.diagram} />

          {/* Rule explanation */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                {lastResult.scenario.ruleName}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {lastResult.scenario.ruleExplanation}
              </p>
            </CardContent>
          </Card>

          {/* Score so far */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Score: {correctCount} / {results.length} correct
          </div>

          {/* Next button */}
          <div className="mt-6 text-center">
            <Button size="lg" onClick={nextScenario} data-testid="button-next">
              {currentIndex + 1 >= scenarios.length ? "See Results" : "Next Scenario"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  if (gameState === "results") {
    const grade = getGrade(correctCount, scenarios.length);
    const pct = Math.round((correctCount / scenarios.length) * 100);

    return (
      <div ref={gameRef} className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="text-center mb-8">
            <Trophy className={`h-12 w-12 mx-auto mb-4 ${grade.color}`} />
            <h1 className="text-3xl font-serif font-bold mb-1">
              {correctCount} / {scenarios.length}
            </h1>
            <p className={`text-xl font-bold ${grade.color}`}>
              {grade.grade === "Perfect" ? "Perfect Score!" : `Grade: ${grade.grade}`}
            </p>
            <p className="text-muted-foreground">{grade.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{pct}% correct</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button onClick={startGame} data-testid="button-play-again">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <Button variant="outline" onClick={shareResults}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" onClick={copyEmbed}>
              <Code2 className="mr-2 h-4 w-4" />
              Embed
            </Button>
          </div>

          {/* Round-by-round */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-4">Round-by-Round Review</h2>
              <div className="space-y-3">
                {results.map((r, i) => {
                  const correctActionLabel = ACTIONS.find((a) => a.id === r.scenario.correctAction)?.shortLabel;
                  const playerActionLabel = r.playerAction
                    ? ACTIONS.find((a) => a.id === r.playerAction)?.shortLabel
                    : "No answer";

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-lg p-3 ${
                        r.correct ? "bg-green-500/5" : "bg-red-500/5"
                      }`}
                    >
                      {r.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.scenario.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.timedOut
                            ? `Timed out — Correct: ${correctActionLabel}`
                            : r.correct
                            ? `${playerActionLabel}`
                            : `${playerActionLabel} → Correct: ${correctActionLabel}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {r.scenario.category}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/quiz">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-1">Do I Need a Boating License?</h3>
                  <p className="text-sm text-muted-foreground">
                    Take our quick quiz to find out if you need boater education in your state.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/states">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-1">Find Your State</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse boater education requirements and approved courses for your state.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
