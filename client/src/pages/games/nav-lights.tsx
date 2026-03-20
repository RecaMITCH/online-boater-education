import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Clock, Trophy, CheckCircle2, XCircle, RotateCcw, Share2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type VesselType = "powerboat" | "sailboat" | "anchored" | "large_commercial" | "fishing" | "nav_aid";
type Direction = "toward" | "away" | "port_to_starboard" | "starboard_to_port" | "stationary";

interface LightConfig {
  color: string;
  x: number;
  y: number;
  label: string;
}

interface Scenario {
  id: number;
  name: string;
  lights: LightConfig[];
  vesselType: VesselType;
  direction: Direction;
  explanation: string;
}

const VESSEL_TYPE_LABELS: Record<VesselType, string> = {
  powerboat: "Powerboat",
  sailboat: "Sailboat",
  anchored: "Anchored Vessel",
  large_commercial: "Large Commercial Vessel",
  fishing: "Fishing Vessel",
  nav_aid: "Navigation Aid",
};

const DIRECTION_LABELS: Record<Direction, string> = {
  toward: "Heading Toward You",
  away: "Moving Away",
  port_to_starboard: "Crossing Port-to-Starboard (Right to Left)",
  starboard_to_port: "Crossing Starboard-to-Port (Left to Right)",
  stationary: "Stationary",
};

const ALL_SCENARIOS: Scenario[] = [
  {
    id: 1,
    name: "Red + Green + White Masthead",
    lights: [
      { color: "#ff3333", x: 170, y: 180, label: "Red (Port)" },
      { color: "#33ff33", x: 230, y: 180, label: "Green (Starboard)" },
      { color: "#ffffff", x: 200, y: 140, label: "White (Masthead)" },
    ],
    vesselType: "powerboat",
    direction: "toward",
    explanation:
      "Red on the left, green on the right, with a white masthead light above. This is a powerboat heading directly toward you. The masthead light indicates it is a power-driven vessel.",
  },
  {
    id: 2,
    name: "Red Light Only",
    lights: [{ color: "#ff3333", x: 200, y: 175, label: "Red (Port)" }],
    vesselType: "powerboat",
    direction: "port_to_starboard",
    explanation:
      "A single red light means you are seeing the port (left) side of a vessel. It is crossing from your right to your left. You are the give-way vessel and should alter course to pass astern.",
  },
  {
    id: 3,
    name: "Green Light Only",
    lights: [{ color: "#33ff33", x: 200, y: 175, label: "Green (Starboard)" }],
    vesselType: "powerboat",
    direction: "starboard_to_port",
    explanation:
      "A single green light means you are seeing the starboard (right) side of a vessel. It is crossing from your left to your right. You are the stand-on vessel and should maintain course and speed.",
  },
  {
    id: 4,
    name: "White Stern Light Only",
    lights: [{ color: "#ffffff", x: 200, y: 175, label: "White (Stern)" }],
    vesselType: "powerboat",
    direction: "away",
    explanation:
      "A single white light from the stern means the vessel is moving away from you. You are the overtaking vessel and must keep clear.",
  },
  {
    id: 5,
    name: "Red + Green (No Masthead)",
    lights: [
      { color: "#ff3333", x: 175, y: 175, label: "Red (Port)" },
      { color: "#33ff33", x: 225, y: 175, label: "Green (Starboard)" },
    ],
    vesselType: "sailboat",
    direction: "toward",
    explanation:
      "Red and green sidelights with NO white masthead light above indicates a sailboat heading toward you. Sailboats under sail do not display a masthead light.",
  },
  {
    id: 6,
    name: "Single All-Around White",
    lights: [{ color: "#ffffff", x: 200, y: 165, label: "White (All-around)" }],
    vesselType: "anchored",
    direction: "stationary",
    explanation:
      "A single all-around white light can indicate a vessel at anchor or a small powerboat under 39 feet using a combined lantern. In this context, it represents an anchored vessel that is stationary.",
  },
  {
    id: 7,
    name: "Red + Green + Two White (Stacked)",
    lights: [
      { color: "#ff3333", x: 170, y: 185, label: "Red (Port)" },
      { color: "#33ff33", x: 230, y: 185, label: "Green (Starboard)" },
      { color: "#ffffff", x: 200, y: 120, label: "White (Forward Masthead)" },
      { color: "#ffffff", x: 200, y: 150, label: "White (Aft Masthead)" },
    ],
    vesselType: "large_commercial",
    direction: "toward",
    explanation:
      "Red and green sidelights plus two white masthead lights stacked vertically indicates a large power-driven vessel over 50 meters heading toward you. The higher light is the forward masthead; the lower is the aft masthead.",
  },
  {
    id: 8,
    name: "Red + White Masthead",
    lights: [
      { color: "#ff3333", x: 195, y: 180, label: "Red (Port)" },
      { color: "#ffffff", x: 210, y: 145, label: "White (Masthead)" },
    ],
    vesselType: "powerboat",
    direction: "port_to_starboard",
    explanation:
      "A red sidelight with a white masthead light visible above it means you see the port side of a power-driven vessel. It is crossing from your right to your left.",
  },
  {
    id: 9,
    name: "Green + White Masthead",
    lights: [
      { color: "#33ff33", x: 205, y: 180, label: "Green (Starboard)" },
      { color: "#ffffff", x: 190, y: 145, label: "White (Masthead)" },
    ],
    vesselType: "powerboat",
    direction: "starboard_to_port",
    explanation:
      "A green sidelight with a white masthead light visible above it means you see the starboard side of a power-driven vessel. It is crossing from your left to your right.",
  },
  {
    id: 10,
    name: "Red + Green + Stern (No Masthead)",
    lights: [
      { color: "#ff3333", x: 178, y: 175, label: "Red (Port)" },
      { color: "#33ff33", x: 222, y: 175, label: "Green (Starboard)" },
      { color: "#ffffcc", x: 200, y: 185, label: "White (Stern glow)" },
    ],
    vesselType: "sailboat",
    direction: "toward",
    explanation:
      "Red and green sidelights with a faint white stern glow but no masthead light indicates a sailboat under sail heading toward you at a slight angle, making part of the stern light visible.",
  },
  {
    id: 11,
    name: "Two All-Around White (Vertical)",
    lights: [
      { color: "#ffffff", x: 200, y: 145, label: "White (Forward)" },
      { color: "#ffffff", x: 200, y: 185, label: "White (Aft / Lower)" },
    ],
    vesselType: "anchored",
    direction: "stationary",
    explanation:
      "Two all-around white lights displayed vertically indicates a vessel at anchor that is over 50 meters in length. The forward light is higher than the aft light.",
  },
  {
    id: 12,
    name: "White + Red + White (Vertical)",
    lights: [
      { color: "#ffffff", x: 200, y: 135, label: "White (Upper)" },
      { color: "#ff3333", x: 200, y: 165, label: "Red (Middle)" },
      { color: "#ffffff", x: 200, y: 195, label: "White (Lower)" },
    ],
    vesselType: "fishing",
    direction: "stationary",
    explanation:
      "A white light over a red light with another white below indicates a vessel engaged in fishing or constrained by its draft. These vessels have restricted maneuverability and other vessels should keep clear.",
  },
  {
    id: 13,
    name: "Green + White Stern",
    lights: [
      { color: "#33ff33", x: 190, y: 175, label: "Green (Starboard)" },
      { color: "#ffffff", x: 210, y: 180, label: "White (Stern)" },
    ],
    vesselType: "sailboat",
    direction: "away",
    explanation:
      "Seeing a green starboard light together with a white stern light means the vessel is angled away from you, showing its stern and starboard side. With no masthead light, this is likely a sailboat moving away.",
  },
  {
    id: 14,
    name: "Red + Green Close + White Above",
    lights: [
      { color: "#ff3333", x: 192, y: 180, label: "Red (Port)" },
      { color: "#33ff33", x: 208, y: 180, label: "Green (Starboard)" },
      { color: "#ffffff", x: 200, y: 155, label: "White (Masthead)" },
    ],
    vesselType: "powerboat",
    direction: "toward",
    explanation:
      "Red and green sidelights very close together with a white masthead light above indicates a small powerboat approaching you head-on. The close spacing of the sidelights suggests the vessel is small.",
  },
  {
    id: 15,
    name: "White Flashing Light",
    lights: [{ color: "#ffffaa", x: 200, y: 175, label: "White (Flashing)" }],
    vesselType: "nav_aid",
    direction: "stationary",
    explanation:
      "A single flashing white light is most likely a buoy or aid to navigation, not a vessel. Navigation aids use specific flash patterns to convey information about channels and hazards.",
  },
];

const TOTAL_ROUNDS = 10;
const ROUND_TIME = 15;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGrade(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct >= 90) return { letter: "A", label: "Captain's License Material!", color: "text-green-400" };
  if (pct >= 80) return { letter: "B", label: "Solid Night Navigation Skills", color: "text-blue-400" };
  if (pct >= 70) return { letter: "C", label: "Needs More Night Practice", color: "text-yellow-400" };
  if (pct >= 60) return { letter: "D", label: "Review Light Rules Carefully", color: "text-orange-400" };
  return { letter: "F", label: "Study Navigation Lights Before Going Out at Night", color: "text-red-400" };
}

function LightsSVG({ lights, isFlashing }: { lights: LightConfig[]; isFlashing?: boolean }) {
  const [flashOn, setFlashOn] = useState(true);

  useEffect(() => {
    if (!isFlashing) return;
    const interval = setInterval(() => setFlashOn((p) => !p), 600);
    return () => clearInterval(interval);
  }, [isFlashing]);

  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      x: 15 + ((i * 137) % 370),
      y: 5 + ((i * 73) % 70),
      r: 0.5 + (i % 3) * 0.4,
      opacity: 0.3 + (i % 5) * 0.15,
    }))
  );

  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto rounded-xl border border-slate-700">
      <defs>
        {lights.map((light, i) => (
          <radialGradient key={`glow-${i}`} id={`light-glow-${i}`}>
            <stop offset="0%" stopColor={light.color} stopOpacity="0.9" />
            <stop offset="40%" stopColor={light.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={light.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0e1a" />
          <stop offset="60%" stopColor="#0f1729" />
          <stop offset="100%" stopColor="#111d35" />
        </linearGradient>
        <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="100%" stopColor="#060d1a" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="400" height="200" fill="url(#sky-gradient)" />

      {/* Stars */}
      {stars.current.map((star, i) => (
        <circle key={`star-${i}`} cx={star.x} cy={star.y} r={star.r} fill="#ffffff" opacity={star.opacity} />
      ))}

      {/* Water */}
      <rect x="0" y="200" width="400" height="100" fill="url(#water-gradient)" />

      {/* Water wave lines */}
      {[210, 230, 250, 270].map((y, i) => (
        <path
          key={`wave-${i}`}
          d={`M0,${y} Q50,${y - 2} 100,${y} T200,${y} T300,${y} T400,${y}`}
          stroke="#1a2a44"
          strokeWidth="0.5"
          fill="none"
          opacity={0.5 - i * 0.1}
        />
      ))}

      {/* Horizon line */}
      <line x1="0" y1="200" x2="400" y2="200" stroke="#1a2a44" strokeWidth="1" opacity="0.6" />

      {/* Lights */}
      {lights.map((light, i) => {
        const show = isFlashing ? flashOn : true;
        return (
          <g key={`light-group-${i}`} opacity={show ? 1 : 0.05}>
            {/* Outer glow */}
            <circle cx={light.x} cy={light.y} r="24" fill={`url(#light-glow-${i})`} />
            {/* Inner bright core */}
            <circle cx={light.x} cy={light.y} r="5" fill={light.color} opacity="0.95" />
            <circle cx={light.x} cy={light.y} r="3" fill="#ffffff" opacity="0.6" />

            {/* Water reflection */}
            <ellipse
              cx={light.x}
              cy={200 + (light.y - 130) * 0.6}
              rx="8"
              ry="18"
              fill={light.color}
              opacity="0.12"
            />
            <ellipse
              cx={light.x}
              cy={200 + (light.y - 130) * 0.4}
              rx="3"
              ry="8"
              fill={light.color}
              opacity="0.08"
            />
          </g>
        );
      })}
    </svg>
  );
}

function ExplanationDiagram({ scenario }: { scenario: Scenario }) {
  return (
    <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-400">Light Configuration Explained</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {scenario.lights.map((light, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block border border-slate-600"
              style={{ backgroundColor: light.color, boxShadow: `0 0 6px ${light.color}` }}
            />
            <span className="text-xs text-slate-300">{light.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{scenario.explanation}</p>
    </div>
  );
}

export default function NavLights() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"intro" | "playing" | "feedback" | "results">("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [selectedVessel, setSelectedVessel] = useState<VesselType | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [vesselCorrect, setVesselCorrect] = useState<boolean | null>(null);
  const [directionCorrect, setDirectionCorrect] = useState<boolean | null>(null);
  const [answeredRounds, setAnsweredRounds] = useState<
    { scenario: Scenario; vesselCorrect: boolean; directionCorrect: boolean; timedOut: boolean }[]
  >([]);
  const [answerPhase, setAnswerPhase] = useState<"vessel" | "direction">("vessel");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentScenario = scenarios[currentRound] ?? null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    const picked = shuffleArray(ALL_SCENARIOS).slice(0, TOTAL_ROUNDS);
    setScenarios(picked);
    setCurrentRound(0);
    setScore(0);
    setAnsweredRounds([]);
    setSelectedVessel(null);
    setSelectedDirection(null);
    setVesselCorrect(null);
    setDirectionCorrect(null);
    setAnswerPhase("vessel");
    setTimeLeft(ROUND_TIME);
    setGameState("playing");
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") {
      clearTimer();
      return;
    }
    clearTimer();
    setTimeLeft(ROUND_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [gameState, currentRound, clearTimer]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing" && currentScenario) {
      clearTimer();
      setVesselCorrect(false);
      setDirectionCorrect(false);
      setAnsweredRounds((prev) => [
        ...prev,
        { scenario: currentScenario, vesselCorrect: false, directionCorrect: false, timedOut: true },
      ]);
      setGameState("feedback");
    }
  }, [timeLeft, gameState, currentScenario, clearTimer]);

  const handleVesselSelect = useCallback(
    (vessel: VesselType) => {
      if (!currentScenario || answerPhase !== "vessel") return;
      setSelectedVessel(vessel);
      const correct = vessel === currentScenario.vesselType;
      setVesselCorrect(correct);
      setAnswerPhase("direction");
    },
    [currentScenario, answerPhase]
  );

  const handleDirectionSelect = useCallback(
    (direction: Direction) => {
      if (!currentScenario || answerPhase !== "direction") return;
      clearTimer();
      setSelectedDirection(direction);
      const dirCorrect = direction === currentScenario.direction;
      setDirectionCorrect(dirCorrect);

      const vCorrect = vesselCorrect === true;
      const bothCorrect = vCorrect && dirCorrect;
      if (bothCorrect) {
        setScore((s) => s + 1);
      }

      setAnsweredRounds((prev) => [
        ...prev,
        { scenario: currentScenario, vesselCorrect: vCorrect, directionCorrect: dirCorrect, timedOut: false },
      ]);
      setGameState("feedback");
    },
    [currentScenario, answerPhase, vesselCorrect, clearTimer]
  );

  const nextRound = useCallback(() => {
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setGameState("results");
    } else {
      setCurrentRound((r) => r + 1);
      setSelectedVessel(null);
      setSelectedDirection(null);
      setVesselCorrect(null);
      setDirectionCorrect(null);
      setAnswerPhase("vessel");
      setGameState("playing");
    }
  }, [currentRound]);

  const handleShare = useCallback(async () => {
    const grade = getGrade(score, TOTAL_ROUNDS);
    const text = `I scored ${score}/${TOTAL_ROUNDS} (${grade.letter}) on the Navigation Lights at Night game! Can you identify vessels by their lights? Try it:`;
    const url = "https://onlineboatereducation.com/games/nav-lights";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Navigation Lights at Night", text, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast({ title: "Copied to clipboard!", description: "Share link has been copied." });
    }
  }, [score, toast]);

  // --- INTRO ---
  if (gameState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/games">
              <span className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1">
                <ChevronRight className="w-3 h-3 rotate-180" /> Back to Games
              </span>
            </Link>
          </div>

          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🔴🟢⚪</div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Navigation Lights at Night</h1>
                <p className="text-slate-400 text-lg">
                  Can you identify vessels by their navigation lights in the dark?
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-5 mb-6 space-y-3">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" /> How to Play
                </h2>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">1.</span>
                    You will see navigation light patterns on a dark background
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">2.</span>
                    First, identify the <strong className="text-white">vessel type</strong> (powerboat, sailboat, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">3.</span>
                    Then, identify <strong className="text-white">which direction</strong> it is heading relative to you
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">4.</span>
                    Both answers must be correct to score the point
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">5.</span>
                    You have <strong className="text-white">15 seconds</strong> per round
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-5 mb-8 space-y-2">
                <h3 className="font-semibold text-white text-sm">Quick Light Reference</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    Red = Port (Left) Side
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    Green = Starboard (Right) Side
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white inline-block border border-slate-600" />
                    White Masthead = Power Vessel
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white inline-block border border-slate-600" />
                    White Stern = Visible from Behind
                  </div>
                </div>
              </div>

              <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                Start Game <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- PLAYING ---
  if (gameState === "playing" && currentScenario) {
    const isFlashing = currentScenario.id === 15;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              Round {currentRound + 1} / {TOTAL_ROUNDS}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              <Trophy className="w-3 h-3 mr-1 text-yellow-400" /> {score}
            </Badge>
            <Badge
              variant="outline"
              className={`border-slate-600 ${timeLeft <= 5 ? "text-red-400 border-red-500" : "text-slate-300"}`}
            >
              <Clock className="w-3 h-3 mr-1" /> {timeLeft}s
            </Badge>
          </div>

          {/* Timer bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ${
                timeLeft <= 5 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${(timeLeft / ROUND_TIME) * 100}%` }}
            />
          </div>

          {/* Lights Display */}
          <Card className="bg-slate-900/80 border-slate-700 mb-6">
            <CardContent className="p-4">
              <p className="text-center text-slate-400 text-sm mb-3">
                What do you see ahead in the darkness?
              </p>
              <LightsSVG lights={currentScenario.lights} isFlashing={isFlashing} />
            </CardContent>
          </Card>

          {/* Answer Buttons */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-4">
              {answerPhase === "vessel" ? (
                <>
                  <p className="text-center text-white font-semibold mb-4">
                    Step 1: What type of vessel is this?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(VESSEL_TYPE_LABELS) as [VesselType, string][]).map(([key, label]) => (
                      <Button
                        key={key}
                        variant="outline"
                        className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white py-3 h-auto text-sm"
                        onClick={() => handleVesselSelect(key)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 text-center">
                    <span className="text-sm text-slate-400">Vessel type: </span>
                    <Badge
                      className={`${
                        vesselCorrect ? "bg-green-600/20 text-green-400 border-green-600" : "bg-red-600/20 text-red-400 border-red-600"
                      }`}
                    >
                      {vesselCorrect ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {selectedVessel ? VESSEL_TYPE_LABELS[selectedVessel] : ""}
                    </Badge>
                    {!vesselCorrect && (
                      <span className="text-xs text-slate-500 ml-2">
                        (Correct: {VESSEL_TYPE_LABELS[currentScenario.vesselType]})
                      </span>
                    )}
                  </div>
                  <p className="text-center text-white font-semibold mb-4">
                    Step 2: What direction is it heading?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.entries(DIRECTION_LABELS) as [Direction, string][]).map(([key, label]) => (
                      <Button
                        key={key}
                        variant="outline"
                        className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white py-3 h-auto text-sm"
                        onClick={() => handleDirectionSelect(key)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- FEEDBACK ---
  if (gameState === "feedback" && currentScenario) {
    const lastRound = answeredRounds[answeredRounds.length - 1];
    const bothCorrect = lastRound?.vesselCorrect && lastRound?.directionCorrect;
    const timedOut = lastRound?.timedOut;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              Round {currentRound + 1} / {TOTAL_ROUNDS}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              <Trophy className="w-3 h-3 mr-1 text-yellow-400" /> {score}
            </Badge>
          </div>

          <Card className="bg-slate-900/80 border-slate-700 mb-4">
            <CardContent className="p-4">
              <LightsSVG lights={currentScenario.lights} isFlashing={currentScenario.id === 15} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-5">
              {timedOut ? (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-bold">Time's Up!</span>
                  </div>
                  <p className="text-slate-400 text-sm">You ran out of time on this round.</p>
                </div>
              ) : bothCorrect ? (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-lg font-bold">Both Correct!</span>
                  </div>
                  <p className="text-slate-400 text-sm">Excellent identification of the vessel and heading.</p>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                    <XCircle className="w-5 h-5" />
                    <span className="text-lg font-bold">
                      {lastRound?.vesselCorrect
                        ? "Direction Incorrect"
                        : lastRound?.directionCorrect
                        ? "Vessel Type Incorrect"
                        : "Both Incorrect"}
                    </span>
                  </div>
                </div>
              )}

              {/* Result details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
                  <span className="text-sm text-slate-400">Vessel Type</span>
                  <div className="flex items-center gap-2">
                    {!timedOut && selectedVessel && (
                      <span className={`text-sm ${lastRound?.vesselCorrect ? "text-green-400" : "text-red-400"}`}>
                        {VESSEL_TYPE_LABELS[selectedVessel]}
                      </span>
                    )}
                    {(!lastRound?.vesselCorrect || timedOut) && (
                      <span className="text-sm text-green-400">
                        {timedOut || !lastRound?.vesselCorrect ? `→ ${VESSEL_TYPE_LABELS[currentScenario.vesselType]}` : ""}
                      </span>
                    )}
                    {lastRound?.vesselCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
                  <span className="text-sm text-slate-400">Direction</span>
                  <div className="flex items-center gap-2">
                    {!timedOut && selectedDirection && (
                      <span className={`text-sm ${lastRound?.directionCorrect ? "text-green-400" : "text-red-400"}`}>
                        {DIRECTION_LABELS[selectedDirection]}
                      </span>
                    )}
                    {(!lastRound?.directionCorrect || timedOut) && (
                      <span className="text-sm text-green-400">
                        {timedOut || !lastRound?.directionCorrect ? `→ ${DIRECTION_LABELS[currentScenario.direction]}` : ""}
                      </span>
                    )}
                    {lastRound?.directionCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              <ExplanationDiagram scenario={currentScenario} />

              <Button onClick={nextRound} className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white">
                {currentRound + 1 >= TOTAL_ROUNDS ? "See Results" : "Next Round"}{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  if (gameState === "results") {
    const grade = getGrade(score, TOTAL_ROUNDS);
    const pct = Math.round((score / TOTAL_ROUNDS) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Complete!</h2>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div>
                    <div className={`text-6xl font-bold ${grade.color}`}>{grade.letter}</div>
                    <div className="text-sm text-slate-400 mt-1">{pct}%</div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">
                      {score} / {TOTAL_ROUNDS}
                    </div>
                    <div className="text-sm text-slate-400">correct identifications</div>
                  </div>
                </div>
                <p className={`text-lg font-medium ${grade.color}`}>{grade.label}</p>
              </div>

              {/* Round breakdown */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Round Breakdown</h3>
                <div className="space-y-2">
                  {answeredRounds.map((round, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                        <span className="text-sm text-slate-300">{round.scenario.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {round.timedOut ? (
                          <Badge variant="outline" className="text-orange-400 border-orange-500 text-xs">
                            <Clock className="w-3 h-3 mr-1" /> Timed Out
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                round.vesselCorrect
                                  ? "text-green-400 border-green-600"
                                  : "text-red-400 border-red-600"
                              }`}
                            >
                              Vessel {round.vesselCorrect ? "✓" : "✗"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                round.directionCorrect
                                  ? "text-green-400 border-green-600"
                                  : "text-red-400 border-red-600"
                              }`}
                            >
                              Dir {round.directionCorrect ? "✓" : "✗"}
                            </Badge>
                          </>
                        )}
                        {round.vesselCorrect && round.directionCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share Your Score
                </Button>
                <Link href="/games">
                  <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-200">
                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Back to Games
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
