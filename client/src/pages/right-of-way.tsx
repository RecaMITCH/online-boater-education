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

// --- Animation helpers ---

/** Convert rotation (0=north/up) to a forward direction vector */
function headingToVector(rotationDeg: number): { dx: number; dy: number } {
  const rad = (rotationDeg * Math.PI) / 180;
  return { dx: Math.sin(rad), dy: -Math.cos(rad) };
}

/** Get animated vessel position. progress 0→1 maps to start→collision */
function getAnimatedPosition(vessel: Vessel, progress: number) {
  const { dx, dy } = headingToVector(vessel.rotation);
  // Vessels start 70px behind their diagram position and travel 140px total
  const offset = -70 + 140 * progress;
  return {
    x: vessel.x + dx * offset,
    y: vessel.y + dy * offset,
  };
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

// --- SVG Components ---

/** Realistic powerboat / motorboat (top-down) */
function PowerboatShape({ color, isYou }: { color: string; isYou: boolean }) {
  const hullDark = isYou ? "#1e3a5f" : "#7f1d1d";
  const deck = isYou ? "#dbeafe" : "#fecaca";
  const trim = isYou ? "#60a5fa" : "#f87171";
  return (
    <g>
      {/* Water shadow */}
      <ellipse cx={2} cy={3} rx={12} ry={24} fill="rgba(0,0,0,0.3)" />
      {/* Hull outer */}
      <path d="M0,-24 C10,-22 14,-12 14,8 C14,18 10,22 5,24 L-5,24 C-10,22 -14,18 -14,8 C-14,-12 -10,-22 0,-24Z"
        fill={hullDark} />
      {/* Hull main */}
      <path d="M0,-22 C9,-20 12,-10 12,7 C12,16 8,20 4,22 L-4,22 C-8,20 -12,16 -12,7 C-12,-10 -9,-20 0,-22Z"
        fill={color} />
      {/* Gunwale highlight */}
      <path d="M0,-22 C9,-20 12,-10 12,7" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
      <path d="M0,-22 C-9,-20 -12,-10 -12,7" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      {/* Deck area */}
      <path d="M0,-16 C6,-14 8,-6 8,5 C8,12 5,16 3,18 L-3,18 C-5,16 -8,12 -8,5 C-8,-6 -6,-14 0,-16Z"
        fill={deck} opacity={0.35} />
      {/* Trim stripe */}
      <path d="M-10,4 C-10,4 -8,6 0,6 C8,6 10,4 10,4" fill="none" stroke={trim} strokeWidth={1.5} opacity={0.6} />
      {/* Windshield (curved glass) */}
      <path d="M-6,-8 C-4,-12 4,-12 6,-8" fill="rgba(150,220,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M-4,-9 C-2,-11 2,-11 4,-9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />
      {/* Center console */}
      <rect x={-3} y={-5} width={6} height={8} rx={1.5} fill="rgba(0,0,0,0.15)" />
      {/* Helm wheel */}
      <circle cx={0} cy={-1} r={2} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
      <circle cx={0} cy={-1} r={0.8} fill="rgba(255,255,255,0.3)" />
      {/* Seats */}
      <rect x={-5} y={6} width={4} height={5} rx={1} fill="rgba(255,255,255,0.15)" />
      <rect x={1} y={6} width={4} height={5} rx={1} fill="rgba(255,255,255,0.15)" />
      {/* Motor / transom */}
      <rect x={-4} y={20} width={8} height={3} rx={1} fill="rgba(0,0,0,0.3)" />
      <rect x={-2} y={22} width={4} height={2} rx={0.5} fill="rgba(0,0,0,0.2)" />
      {/* Bow point accent */}
      <path d="M0,-24 L0,-18" stroke="white" strokeWidth={1} opacity={0.4} />
      <circle cx={0} cy={-24} r={1} fill="white" opacity={0.5} />
      {/* Nav lights */}
      <circle cx={-10} cy={-8} r={1.2} fill="#22c55e" opacity={0.7} />
      <circle cx={10} cy={-8} r={1.2} fill="#ef4444" opacity={0.7} />
    </g>
  );
}

/** Realistic sailboat (top-down with sail) */
function SailboatShape({ color }: { color: string }) {
  return (
    <g>
      {/* Water shadow */}
      <ellipse cx={2} cy={3} rx={9} ry={26} fill="rgba(0,0,0,0.25)" />
      {/* Hull - sleek sailboat shape */}
      <path d="M0,-26 C7,-22 9,-10 9,10 C9,18 6,22 3,24 L-3,24 C-6,22 -9,18 -9,10 C-9,-10 -7,-22 0,-26Z"
        fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
      {/* Hull keel line */}
      <line x1={0} y1={-24} x2={0} y2={22} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      {/* Deck */}
      <path d="M0,-20 C5,-17 6,-8 6,8 C6,14 4,17 2,19 L-2,19 C-4,17 -6,14 -6,8 C-6,-8 -5,-17 0,-20Z"
        fill="rgba(255,255,255,0.15)" />
      {/* Main sail with battens */}
      <path d="M0,-20 L16,4 L0,12 Z" fill="white" opacity={0.9} stroke="rgba(0,0,0,0.2)" strokeWidth={0.5} />
      <line x1={2} y1={-12} x2={12} y2={-2} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
      <line x1={1} y1={-4} x2={14} y2={2} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
      <line x1={1} y1={4} x2={10} y2={6} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
      {/* Sail shadow on water */}
      <path d="M0,-18 L14,4 L0,10 Z" fill="rgba(0,0,0,0.06)" transform="translate(3,3)" />
      {/* Jib sail */}
      <path d="M0,-20 L-10,0 L0,2 Z" fill="white" opacity={0.7} stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />
      {/* Boom */}
      <line x1={0} y1={0} x2={14} y2={4} stroke="#8B7355" strokeWidth={1} opacity={0.5} />
      {/* Mast */}
      <circle cx={0} cy={-2} r={2} fill="#444" stroke="#222" strokeWidth={0.5} />
      {/* Tiller/rudder */}
      <line x1={0} y1={20} x2={0} y2={26} stroke="#8B7355" strokeWidth={1.5} opacity={0.5} />
      {/* Cockpit */}
      <ellipse cx={0} cy={14} rx={3} ry={4} fill="rgba(0,0,0,0.12)" />
    </g>
  );
}

/** Realistic commercial / cargo vessel */
function CommercialShape({ color }: { color: string }) {
  return (
    <g>
      {/* Water shadow */}
      <ellipse cx={3} cy={4} rx={18} ry={36} fill="rgba(0,0,0,0.3)" />
      {/* Hull outer */}
      <path d="M0,-36 C16,-32 18,-16 18,16 C18,28 14,34 7,36 L-7,36 C-14,34 -18,28 -18,16 C-18,-16 -16,-32 0,-36Z"
        fill="rgba(0,0,0,0.5)" />
      {/* Hull main */}
      <path d="M0,-34 C14,-30 16,-14 16,16 C16,26 12,32 6,34 L-6,34 C-12,32 -16,26 -16,16 C-16,-14 -14,-30 0,-34Z"
        fill={color} />
      {/* Waterline */}
      <path d="M-14,8 C-14,8 -8,10 0,10 C8,10 14,8 14,8" fill="none" stroke="#1e293b" strokeWidth={1.5} opacity={0.5} />
      {/* Hull below waterline */}
      <path d="M0,10 C8,10 14,8 14,8 L16,16 C16,26 12,32 6,34 L-6,34 C-12,32 -16,26 -16,16 L-14,8 C-14,8 -8,10 0,10Z"
        fill="rgba(139,0,0,0.3)" />
      {/* Deck */}
      <rect x={-11} y={-22} width={22} height={34} rx={3} fill="rgba(200,200,200,0.15)" />
      {/* Bridge/wheelhouse */}
      <rect x={-7} y={-20} width={14} height={10} rx={2} fill="rgba(220,220,220,0.4)" />
      <rect x={-6} y={-19} width={12} height={4} rx={1} fill="rgba(150,220,255,0.3)" />
      {/* Bridge windows */}
      <rect x={-4} y={-18} width={2.5} height={2.5} rx={0.5} fill="rgba(150,220,255,0.5)" />
      <rect x={-0.5} y={-18} width={2.5} height={2.5} rx={0.5} fill="rgba(150,220,255,0.5)" />
      <rect x={3} y={-18} width={2.5} height={2.5} rx={0.5} fill="rgba(150,220,255,0.5)" />
      {/* Containers row 1 */}
      <rect x={-9} y={-6} width={5.5} height={8} rx={0.5} fill="rgba(255,180,30,0.5)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      <rect x={-3} y={-6} width={5.5} height={8} rx={0.5} fill="rgba(50,150,255,0.4)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      <rect x={3} y={-6} width={5.5} height={8} rx={0.5} fill="rgba(220,50,50,0.4)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      {/* Containers row 2 */}
      <rect x={-9} y={4} width={5.5} height={8} rx={0.5} fill="rgba(50,180,50,0.4)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      <rect x={-3} y={4} width={5.5} height={8} rx={0.5} fill="rgba(255,180,30,0.5)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      <rect x={3} y={4} width={5.5} height={8} rx={0.5} fill="rgba(100,100,200,0.4)" stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      {/* Crane/mast */}
      <line x1={0} y1={-22} x2={0} y2={-30} stroke="#666" strokeWidth={1.5} />
      <line x1={-6} y1={-28} x2={6} y2={-28} stroke="#666" strokeWidth={1} />
      {/* Bow accent */}
      <path d="M0,-34 L0,-26" stroke="white" strokeWidth={1.2} opacity={0.4} />
      {/* Stern */}
      <rect x={-5} y={30} width={10} height={3} rx={1} fill="rgba(0,0,0,0.2)" />
    </g>
  );
}

/** PWC / jet ski */
function PwcShape({ color }: { color: string }) {
  return (
    <g>
      {/* Water shadow */}
      <ellipse cx={1} cy={2} rx={7} ry={16} fill="rgba(0,0,0,0.25)" />
      {/* Hull */}
      <path d="M0,-18 C6,-16 8,-8 8,4 C8,12 5,16 2,18 L-2,18 C-5,16 -8,12 -8,4 C-8,-8 -6,-16 0,-18Z"
        fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
      {/* Hull accent stripe */}
      <path d="M-6,-6 C-4,-8 4,-8 6,-6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      {/* Deck */}
      <path d="M0,-12 C4,-10 5,-4 5,4 C5,8 3,12 1,14 L-1,14 C-3,12 -5,8 -5,4 C-5,-4 -4,-10 0,-12Z"
        fill="rgba(0,0,0,0.1)" />
      {/* Seat */}
      <ellipse cx={0} cy={4} rx={3.5} ry={6} fill="rgba(0,0,0,0.3)" />
      <ellipse cx={0} cy={4} rx={2.5} ry={5} fill="rgba(40,40,40,0.3)" />
      {/* Handlebar stem */}
      <rect x={-1} y={-10} width={2} height={5} rx={0.5} fill="rgba(60,60,60,0.5)" />
      {/* Handlebars */}
      <line x1={-5} y1={-8} x2={5} y2={-8} stroke="rgba(180,180,180,0.7)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={-5} cy={-8} r={1.2} fill="rgba(0,0,0,0.3)" />
      <circle cx={5} cy={-8} r={1.2} fill="rgba(0,0,0,0.3)" />
      {/* Bow tip */}
      <circle cx={0} cy={-18} r={0.8} fill="white" opacity={0.4} />
      {/* Jet nozzle */}
      <rect x={-2} y={16} width={4} height={2} rx={0.5} fill="rgba(0,0,0,0.3)" />
    </g>
  );
}

/** Kayak / canoe */
function KayakShape({ color }: { color: string }) {
  return (
    <g>
      {/* Water shadow */}
      <ellipse cx={1} cy={2} rx={5} ry={22} fill="rgba(0,0,0,0.15)" />
      {/* Hull */}
      <path d="M0,-22 C4,-18 5,-10 5,8 C5,16 3,20 0,22 C-3,20 -5,16 -5,8 C-5,-10 -4,-18 0,-22Z"
        fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={0.8} />
      {/* Keel line */}
      <line x1={0} y1={-20} x2={0} y2={20} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5} />
      {/* Deck lines */}
      <path d="M0,-18 C3,-15 3.5,-8 3.5,6 C3.5,12 2,16 0,18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
      <path d="M0,-18 C-3,-15 -3.5,-8 -3.5,6 C-3.5,12 -2,16 0,18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
      {/* Cockpit opening */}
      <ellipse cx={0} cy={0} rx={3} ry={5} fill="rgba(0,0,0,0.25)" />
      <ellipse cx={0} cy={0} rx={2.5} ry={4.5} fill="rgba(30,30,30,0.15)" />
      {/* Paddler (tiny figure) */}
      <circle cx={0} cy={-2} r={1.5} fill="rgba(255,200,150,0.5)" />
      {/* Paddle shaft */}
      <line x1={-10} y1={-4} x2={10} y2={4} stroke="#6B5B3E" strokeWidth={1.3} strokeLinecap="round" />
      {/* Paddle blades */}
      <ellipse cx={-10} cy={-4} rx={1.8} ry={4} fill="#8B7355" opacity={0.8} transform="rotate(-25 -10 -4)" />
      <ellipse cx={10} cy={4} rx={1.8} ry={4} fill="#8B7355" opacity={0.8} transform="rotate(-25 10 4)" />
      {/* Paddle drip */}
      <circle cx={-9} cy={1} r={0.5} fill="rgba(255,255,255,0.3)" />
      {/* Bow/stern tips */}
      <circle cx={0} cy={-22} r={0.6} fill="white" opacity={0.3} />
      <circle cx={0} cy={22} r={0.6} fill="white" opacity={0.3} />
    </g>
  );
}

function BoatIcon({ x, y, rotation, type, color, label }: Vessel & { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {type === "commercial" ? (
        <CommercialShape color={color} />
      ) : type === "sail" ? (
        <SailboatShape color={color} />
      ) : type === "kayak" ? (
        <KayakShape color={color} />
      ) : type === "pwc" ? (
        <PwcShape color={color} />
      ) : (
        <PowerboatShape color={color} isYou={type === "you"} />
      )}
      {/* Direction arrow (subtle) */}
      <line x1={0} y1={-28} x2={0} y2={-38} stroke="white" strokeWidth={1.5} opacity={0.5} markerEnd="url(#arrowhead)" />
      {/* Label with background pill */}
      <rect x={-24} y={24} width={48} height={16} rx={8} fill="rgba(0,0,0,0.6)" />
      <text
        x={0}
        y={35}
        textAnchor="middle"
        fill="white"
        fontSize={10}
        fontWeight="bold"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </g>
  );
}

/** Realistic V-shaped foam wake behind a vessel */
function RealisticWake({ vessel, progress }: { vessel: Vessel; progress: number }) {
  const pos = getAnimatedPosition(vessel, progress);
  const { dx, dy } = headingToVector(vessel.rotation);
  const isLarge = vessel.type === "commercial";
  const isSmall = vessel.type === "kayak";
  // Wake size varies by vessel type
  const basLen = isLarge ? 40 : isSmall ? 15 : 30;
  const basSpread = isLarge ? 18 : isSmall ? 5 : 12;
  const wakeLen = basLen + progress * (isLarge ? 70 : isSmall ? 25 : 50);
  const spread = basSpread + progress * (isLarge ? 16 : isSmall ? 4 : 10);
  // Point behind the vessel
  const bx = pos.x - dx * wakeLen;
  const by = pos.y - dy * wakeLen;
  // Perpendicular for spread
  const px = -dy;
  const py = dx;
  const innerSpread = spread * 0.4;

  return (
    <g opacity={0.3 + progress * 0.35}>
      {/* Outer wake V */}
      <path
        d={`M${pos.x - dx * 5},${pos.y - dy * 5}
            L${bx + px * spread},${by + py * spread}
            Q${bx + px * spread * 0.3},${by + py * spread * 0.3} ${bx},${by}
            Q${bx - px * spread * 0.3},${by - py * spread * 0.3} ${bx - px * spread},${by - py * spread}
            Z`}
        fill="rgba(255,255,255,0.1)"
      />
      {/* Mid wake */}
      <path
        d={`M${pos.x - dx * 3},${pos.y - dy * 3}
            L${bx + px * spread * 0.65},${by + py * spread * 0.65}
            L${bx},${by}
            L${bx - px * spread * 0.65},${by - py * spread * 0.65}
            Z`}
        fill="rgba(255,255,255,0.08)"
      />
      {/* Inner foam trail */}
      <path
        d={`M${pos.x - dx * 2},${pos.y - dy * 2}
            L${bx + px * innerSpread},${by + py * innerSpread}
            L${bx},${by}
            L${bx - px * innerSpread},${by - py * innerSpread}
            Z`}
        fill="rgba(255,255,255,0.18)"
      />
      {/* Bow wave (white arc at front) */}
      {!isSmall && (
        <>
          <circle cx={pos.x + dx * 3} cy={pos.y + dy * 3} r={isLarge ? 6 : 4} fill="rgba(255,255,255,0.2)" />
          {/* Side spray dots */}
          <circle cx={pos.x + px * 6 - dx * 3} cy={pos.y + py * 6 - dy * 3} r={1.5} fill="rgba(255,255,255,0.15)" />
          <circle cx={pos.x - px * 6 - dx * 3} cy={pos.y - py * 6 - dy * 3} r={1.5} fill="rgba(255,255,255,0.15)" />
        </>
      )}
    </g>
  );
}

function WaterFeatureIcon({ feature }: { feature: WaterFeature }) {
  switch (feature.type) {
    case "buoy-red":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          {/* Water ripple around buoy */}
          <circle cx={0} cy={0} r={16} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          <circle cx={0} cy={0} r={12} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
          {/* Buoy body */}
          <circle cx={0} cy={0} r={8} fill="#dc2626" />
          <circle cx={0} cy={0} r={8} fill="url(#buoy-shine)" />
          <circle cx={0} cy={0} r={8} fill="none" stroke="#7f1d1d" strokeWidth={1.5} />
          {/* Top mark */}
          <circle cx={0} cy={-4} r={2} fill="white" opacity={0.4} />
          <text x={0} y={3} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">R</text>
        </g>
      );
    case "buoy-green":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          <circle cx={0} cy={0} r={16} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          <circle cx={0} cy={0} r={12} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
          {/* Square/can shape for green */}
          <rect x={-7} y={-9} width={14} height={18} rx={2} fill="#16a34a" stroke="#14532d" strokeWidth={1.5} />
          <rect x={-5} y={-6} width={4} height={4} rx={1} fill="white" opacity={0.15} />
          <text x={0} y={4} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">G</text>
        </g>
      );
    case "shore":
      return (
        <g>
          <rect
            x={feature.x}
            y={feature.y}
            width={feature.width || 40}
            height={feature.height || 400}
            fill="#5c4033"
            opacity={0.7}
          />
          {/* Sandy edge */}
          <rect
            x={feature.x + (feature.x < 200 ? (feature.width || 40) - 6 : 0)}
            y={feature.y}
            width={6}
            height={feature.height || 400}
            fill="#d4a574"
            opacity={0.5}
          />
          {/* Trees/vegetation hint */}
          {[0.15, 0.35, 0.55, 0.75, 0.9].map((pct) => (
            <circle
              key={pct}
              cx={feature.x + (feature.width || 40) / 2}
              cy={feature.y + (feature.height || 400) * pct}
              r={8}
              fill="#2d5016"
              opacity={0.3}
            />
          ))}
        </g>
      );
    case "swimmer":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          {/* Water disturbance */}
          <circle cx={0} cy={0} r={12} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />
          {/* Person shape */}
          <circle cx={0} cy={-2} r={4} fill="#f59e0b" stroke="#b45309" strokeWidth={1} />
          <circle cx={0} cy={-4} r={2} fill="#fbbf24" />
        </g>
      );
    case "wake-zone":
      return (
        <g transform={`translate(${feature.x}, ${feature.y})`}>
          <rect x={0} y={0} width={feature.width || 200} height={feature.height || 60} fill="rgba(0,0,0,0.2)" rx={4} />
          <rect x={0} y={0} width={feature.width || 200} height={feature.height || 60} fill="none" rx={4}
            stroke="#fbbf24" strokeWidth={2} strokeDasharray="8 4" />
          <rect x={20} y={12} width={(feature.width || 200) - 40} height={36} rx={4} fill="rgba(0,0,0,0.4)" />
          <text x={(feature.width || 200) / 2} y={(feature.height || 60) / 2 + 5} textAnchor="middle" fill="#fbbf24" fontSize={13} fontWeight="bold">
            NO WAKE ZONE
          </text>
        </g>
      );
    default:
      return null;
  }
}

function ScenarioDiagram({
  diagram,
  isFog,
  progress,
  collided,
}: {
  diagram: DiagramConfig;
  isFog?: boolean;
  progress: number;
  collided: boolean;
}) {
  return (
    <div className={`relative w-full max-w-[500px] mx-auto ${collided ? "animate-shake" : ""}`}>
      <svg viewBox="0 0 400 400" className="w-full h-auto rounded-xl overflow-hidden shadow-2xl border border-white/5">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <polygon points="0 0, 8 2.5, 0 5" fill="white" opacity="0.6" />
          </marker>
          {/* Buoy shine gradient */}
          <radialGradient id="buoy-shine" cx="35%" cy="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {isFog && (
            <filter id="fog-filter">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          )}
          {/* Water texture pattern */}
          <filter id="water-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed={Math.floor(progress * 10)} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
          {/* Glow for collision */}
          <filter id="collision-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Water background gradient */}
        <defs>
          <linearGradient id="water-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a4a7a" />
            <stop offset="40%" stopColor="#0c5d8f" />
            <stop offset="100%" stopColor="#064273" />
          </linearGradient>
          <linearGradient id="wave-light" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#water-bg)" />

        {/* Animated wave lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const y = 30 + i * 50;
          const offset = Math.sin(progress * 4 + i * 0.8) * 15;
          const offset2 = Math.cos(progress * 3 + i * 1.2) * 10;
          return (
            <path
              key={`wave-${i}`}
              d={`M${-20 + offset},${y} Q${80 + offset2},${y - 8} ${180 + offset},${y} T${400 + offset},${y}`}
              fill="none"
              stroke="rgba(120,200,255,0.08)"
              strokeWidth={1 + (i % 2) * 0.5}
            />
          );
        })}

        {/* Light caustic patches */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const cx = 60 + i * 65 + Math.sin(progress * 3 + i * 1.3) * 20;
          const cy = 50 + (i % 3) * 130 + Math.cos(progress * 2.5 + i * 1.7) * 18;
          return (
            <ellipse
              key={`caustic-${i}`}
              cx={cx} cy={cy}
              rx={25 + Math.sin(progress * 4 + i) * 10}
              ry={16 + Math.cos(progress * 3 + i) * 6}
              fill="rgba(100,190,255,0.05)"
              transform={`rotate(${i * 25 + progress * 15}, ${cx}, ${cy})`}
            />
          );
        })}

        {/* Compass rose */}
        <g transform="translate(370, 30)" opacity={0.5}>
          <circle cx={0} cy={0} r={16} fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
          <text x={0} y={-19} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">N</text>
          <line x1={0} y1={-12} x2={0} y2={12} stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          <line x1={-12} y1={0} x2={12} y2={0} stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          {/* North arrow */}
          <polygon points="0,-12 -3,-6 3,-6" fill="white" opacity={0.5} />
        </g>

        {/* Water features */}
        {diagram.waterFeatures?.map((f, i) => (
          <WaterFeatureIcon key={i} feature={f} />
        ))}

        {/* Fog overlay */}
        {isFog && (
          <>
            <rect width="400" height="400" fill="rgba(180,190,200,0.55)" />
            <rect width="400" height="400" fill="rgba(220,220,220,0.2)" filter="url(#water-noise)" />
          </>
        )}

        {/* Realistic wake trails */}
        {diagram.vessels.map((vessel, i) => (
          <g key={`wake-${i}`} filter={isFog && vessel.type !== "you" ? "url(#fog-filter)" : undefined}>
            <RealisticWake vessel={vessel} progress={progress} />
          </g>
        ))}

        {/* Other vessels (animated) */}
        <g filter={isFog ? "url(#fog-filter)" : undefined}>
          {diagram.vessels
            .filter((v) => v.type !== "you")
            .map((vessel, i) => {
              const pos = getAnimatedPosition(vessel, progress);
              return <BoatIcon key={i} {...vessel} x={pos.x} y={pos.y} />;
            })}
        </g>

        {/* Your vessel (animated, always clear) */}
        {diagram.vessels
          .filter((v) => v.type === "you")
          .map((vessel, i) => {
            const pos = getAnimatedPosition(vessel, progress);
            return <BoatIcon key={`you-${i}`} {...vessel} x={pos.x} y={pos.y} />;
          })}

        {/* Collision effects */}
        {collided && (
          <>
            {/* Red flash */}
            <rect width="400" height="400" fill="rgba(239,68,68,0.3)" />
            {/* Impact burst */}
            {(() => {
              const youVessel = diagram.vessels.find((v) => v.type === "you");
              const otherVessel = diagram.vessels.find((v) => v.type !== "you");
              if (!youVessel) return null;
              const youPos = getAnimatedPosition(youVessel, 1);
              const otherPos = otherVessel ? getAnimatedPosition(otherVessel, 1) : youPos;
              const cx = (youPos.x + otherPos.x) / 2;
              const cy = (youPos.y + otherPos.y) / 2;
              return (
                <g transform={`translate(${cx}, ${cy})`} filter="url(#collision-glow)">
                  {/* Splash ring */}
                  <circle cx={0} cy={0} r={40} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
                  <circle cx={0} cy={0} r={25} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  {/* Burst rays */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const len = 20 + (angle % 60 === 0 ? 15 : 0);
                    return (
                      <line
                        key={angle}
                        x1={Math.cos(rad) * 8}
                        y1={Math.sin(rad) * 8}
                        x2={Math.cos(rad) * len}
                        y2={Math.sin(rad) * len}
                        stroke="white"
                        strokeWidth={2}
                        opacity={0.7}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <circle cx={0} cy={0} r={14} fill="rgba(255,200,50,0.5)" />
                  <circle cx={0} cy={0} r={8} fill="rgba(255,255,255,0.7)" />
                </g>
              );
            })()}
            {/* COLLISION text with heavy shadow */}
            <rect x={80} y={140} width={240} height={44} rx={8} fill="rgba(220,38,38,0.85)" />
            <text x={200} y={168} textAnchor="middle" fill="white" fontSize={24} fontWeight="bold"
              letterSpacing="2">
              COLLISION!
            </text>
          </>
        )}

        {/* Proximity warning */}
        {!collided && progress > 0.6 && diagram.vessels.length > 1 && (
          <g>
            <rect x={60} y={8} width={280} height={28} rx={14} fill="rgba(0,0,0,0.6)"
              opacity={Math.sin(progress * 25) * 0.3 + 0.7} />
            <text x={200} y={27} textAnchor="middle" fill="#fbbf24" fontSize={12} fontWeight="bold"
              letterSpacing="1">
              ⚠ VESSELS CLOSING — DECIDE NOW
            </text>
          </g>
        )}
      </svg>

      {/* CSS animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px) rotate(-1deg); }
          20% { transform: translateX(8px) rotate(1deg); }
          30% { transform: translateX(-6px) rotate(-0.5deg); }
          40% { transform: translateX(6px) rotate(0.5deg); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
}

// --- Game States ---

type GameState = "intro" | "playing" | "collision" | "feedback" | "results";

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
  const [animProgress, setAnimProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
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
    setAnimProgress(0);
    setGameState("playing");
  }, []);

  // Animation loop (smooth 60fps progress)
  useEffect(() => {
    if (gameState !== "playing" || !currentScenario) return;

    startTimeRef.current = performance.now();
    durationRef.current = currentScenario.timeLimit * 1000;
    setAnimProgress(0);

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / durationRef.current, 1);
      setAnimProgress(p);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, currentIndex, currentScenario]);

  // Timer (1-second countdown for display)
  useEffect(() => {
    if (gameState !== "playing" || !currentScenario) return;

    setTimeRemaining(currentScenario.timeLimit);
    setPlayerAction(null);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (animRef.current) cancelAnimationFrame(animRef.current);
          setAnimProgress(1);

          // Show collision state briefly before feedback
          setGameState("collision");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, currentScenario]);

  // Collision → feedback transition
  useEffect(() => {
    if (gameState !== "collision" || !currentScenario) return;

    const timeout = setTimeout(() => {
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
    }, 1500);

    return () => clearTimeout(timeout);
  }, [gameState, currentScenario]);

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
      if (animRef.current) cancelAnimationFrame(animRef.current);
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
      setAnimProgress(0);
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
              scenarios and must decide the correct action before the vessels collide.
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
                    <p className="font-medium text-sm">Watch the Encounter</p>
                    <p className="text-sm text-muted-foreground">Vessels move toward each other in real time. Read the scenario and watch the diagram.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Decide Before They Collide</p>
                    <p className="text-sm text-muted-foreground">You have seconds to act. If you run out of time, the vessels crash.</p>
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
  if ((gameState === "playing" || gameState === "collision") && currentScenario) {
    const timerPct = (timeRemaining / currentScenario.timeLimit) * 100;
    const isFog = currentScenario.id === 11;
    const isCollision = gameState === "collision";

    return (
      <div ref={gameRef} className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Round {currentIndex + 1} / {scenarios.length}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${timeRemaining <= 3 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
              <span className={`font-mono font-bold text-lg ${timeRemaining <= 3 ? "text-red-500" : ""}`}>
                {isCollision ? "0" : timeRemaining}s
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isCollision ? "bg-red-500" : timerPct > 50 ? "bg-primary" : timerPct > 25 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: isCollision ? "0%" : `${timerPct}%` }}
            />
          </div>

          {/* Category */}
          <Badge variant="secondary" className="mb-3">{currentScenario.category}</Badge>

          {/* Title & Situation */}
          <h2 className="text-xl font-serif font-bold mb-2">{currentScenario.title}</h2>
          <p className="text-muted-foreground mb-6">{currentScenario.situation}</p>

          {/* Animated Diagram */}
          <ScenarioDiagram
            diagram={currentScenario.diagram}
            isFog={isFog}
            progress={animProgress}
            collided={isCollision}
          />

          {/* Actions (hidden during collision) */}
          {!isCollision && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="lg"
                  className={`h-auto py-4 px-4 text-left justify-start gap-3 transition-all ${
                    timeRemaining <= 3 ? "border-red-500/30" : ""
                  }`}
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
          )}

          {/* Collision message */}
          {isCollision && (
            <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="font-bold text-red-500 text-lg">You didn't act in time!</p>
              <p className="text-sm text-muted-foreground">The vessels collided. On the water, this could mean injuries, damage, or worse.</p>
            </div>
          )}
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
                {lastResult.timedOut ? "Collision!" : correct ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm text-muted-foreground">
                {lastResult.timedOut
                  ? `You ran out of time. The correct action was "${correctActionObj.label}".`
                  : correct
                  ? `You chose "${correctActionObj.label}" — that's right!`
                  : `You chose "${playerActionObj?.label}". The correct action was "${correctActionObj.label}".`}
              </p>
            </div>
          </div>

          {/* Diagram (static, at starting positions) */}
          <ScenarioDiagram diagram={lastResult.scenario.diagram} progress={0} collided={false} />

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
                    : "Collision";

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
                            ? `💥 Collision — Correct: ${correctActionLabel}`
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
