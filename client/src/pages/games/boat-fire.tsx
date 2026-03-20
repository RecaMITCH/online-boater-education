import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Clock, Trophy, CheckCircle2, XCircle, RotateCcw, Share2, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Scenario {
  title: string;
  situation: string;
  choices: string[];
  correctIndex: number;
  explanation: string[];
}

const ALL_SCENARIOS: Scenario[] = [
  {
    title: "Engine Fire While Underway",
    situation: "You're cruising at speed when you notice flames coming from the engine. Smoke is filling the stern. What is your FIRST action?",
    choices: [
      "Grab the fire extinguisher and spray the engine",
      "Stop the engine immediately",
      "Jump overboard",
      "Radio for help on Channel 16",
    ],
    correctIndex: 1,
    explanation: [
      "Stop the engine immediately to cut fuel flow to the fire.",
      "Position the boat so wind blows flames away from passengers.",
      "Use a fire extinguisher aimed at the BASE of the fire, not the flames.",
      "If the fire cannot be controlled, prepare to evacuate and call for help.",
    ],
  },
  {
    title: "Galley Grease Fire",
    situation: "A pot of oil on the galley stove ignites into a grease fire. Flames are rising quickly. What is your FIRST action?",
    choices: [
      "Throw water on the fire",
      "Blow on the flames to put them out",
      "Smother the fire with a lid or use a fire extinguisher",
      "Open the portholes to ventilate the smoke",
    ],
    correctIndex: 2,
    explanation: [
      "Smother the fire by covering the pot with a lid or using a Type B extinguisher.",
      "NEVER use water on a grease fire — it causes a violent flare-up.",
      "Type B extinguishers are rated for flammable liquids like cooking oil.",
      "Turn off the stove burner once it is safe to do so.",
    ],
  },
  {
    title: "Electrical Fire at the Helm",
    situation: "Sparks fly from the helm console and a small electrical fire starts among the wiring. What is your FIRST action?",
    choices: [
      "Pour your water bottle on the console",
      "Disconnect the battery / kill the electrical system",
      "Keep driving to the nearest dock",
      "Cover it with a towel",
    ],
    correctIndex: 1,
    explanation: [
      "Disconnect the battery or kill the main electrical switch to cut power to the fire.",
      "Use a Type C or ABC fire extinguisher on the electrical fire.",
      "NEVER use water on an electrical fire — risk of electrocution.",
      "Once power is cut, assess the damage before restoring any electrical systems.",
    ],
  },
  {
    title: "Enclosed Engine Compartment Fire",
    situation: "You see smoke pouring from the seams of the enclosed engine compartment hatch. What is your FIRST action?",
    choices: [
      "Open the hatch to see how bad the fire is",
      "Close the engine hatch to starve the fire of oxygen",
      "Start the bilge blower to clear the smoke",
      "Pour water into the compartment",
    ],
    correctIndex: 1,
    explanation: [
      "Keep the engine compartment hatch CLOSED to starve the fire of oxygen.",
      "Discharge the fire extinguisher through the access port without fully opening the hatch.",
      "Opening the hatch feeds fresh oxygen to the fire, causing it to grow rapidly.",
      "After discharging the extinguisher, wait before checking — do not open immediately.",
    ],
  },
  {
    title: "Bow Fire with Passengers",
    situation: "A small fire breaks out on the bow of your boat. You have four passengers aboard, including children. What is your FIRST action?",
    choices: [
      "Tell passengers to jump overboard",
      "Run to the bow and stamp out the fire",
      "Position the boat so wind blows fire AWAY from passengers",
      "Drop anchor immediately",
    ],
    correctIndex: 2,
    explanation: [
      "Position the boat so the wind carries flames and smoke away from passengers (fire downwind).",
      "Ensure all passengers put on PFDs while you maneuver.",
      "Once the boat is positioned safely, fight the fire with an extinguisher.",
      "If the fire grows out of control, prepare for an orderly evacuation.",
    ],
  },
  {
    title: "Fire Extinguisher Runs Out",
    situation: "You've been fighting an engine fire, but your fire extinguisher is now empty. The fire is still burning. What is your FIRST action?",
    choices: [
      "Try to scoop water from the lake onto the fire",
      "Keep squeezing the empty extinguisher",
      "Evacuate — prepare to abandon ship and signal distress",
      "Try to disconnect fuel lines by hand",
    ],
    correctIndex: 2,
    explanation: [
      "Evacuate immediately — never fight a fire without proper equipment.",
      "Ensure all passengers are wearing PFDs.",
      "Deploy distress signals (flares, VHF radio Mayday on Channel 16).",
      "Move everyone upwind and away from the burning vessel.",
    ],
  },
  {
    title: "Gas Fumes in the Cabin",
    situation: "You step below deck and smell strong gasoline fumes in the cabin. No fire yet, but the danger is extreme. What is your FIRST action?",
    choices: [
      "Turn on the cabin lights to inspect for leaks",
      "Start the engine to ventilate through forward motion",
      "Evacuate everyone topside and ventilate all compartments",
      "Light a match to see if gas is pooling anywhere",
    ],
    correctIndex: 2,
    explanation: [
      "Evacuate everyone to the open deck immediately.",
      "Ventilate all compartments — open hatches and ports.",
      "Do NOT turn on any electrical switches — even a small spark can ignite fumes.",
      "Run the bilge blower for at least 4 minutes before restarting the engine.",
    ],
  },
  {
    title: "Fire Near the Fuel Tank",
    situation: "Flames erupt dangerously close to the boat's fuel tank. The fire is growing fast. What is your FIRST action?",
    choices: [
      "Try to fight the fire with your extinguisher",
      "Evacuate immediately — fuel tank fires can explode",
      "Drive the boat at full speed to blow out the fire",
      "Throw the fuel tank overboard",
    ],
    correctIndex: 1,
    explanation: [
      "Evacuate immediately — a fuel tank explosion is catastrophic and unpredictable.",
      "Get everyone into PFDs and prepare to abandon ship.",
      "Move as far away from the vessel as possible once in the water.",
      "Call Mayday on VHF Channel 16 and deploy distress signals.",
    ],
  },
  {
    title: "Person's Clothing on Fire",
    situation: "A passenger's shirt catches fire from a stove flare-up. They start to panic and run. What is your FIRST action?",
    choices: [
      "Chase them and tell them to stop, drop, and roll",
      "Throw them overboard into the water",
      "Spray them with the fire extinguisher from far away",
      "Let them run — the wind will put it out",
    ],
    correctIndex: 0,
    explanation: [
      "Stop the person from running — running fans the flames.",
      "Have them drop to the ground and roll to smother the flames.",
      "You can also smother the fire with a blanket, towel, or jacket.",
      "Once the fire is out, cool the burn with water and seek medical attention.",
    ],
  },
  {
    title: "Smoke From Under the Deck",
    situation: "You notice thin smoke rising from under a deck hatch. You're not sure where it's coming from. What is your FIRST action?",
    choices: [
      "Throw open the hatch to find the source",
      "Ignore it — it's probably just engine heat",
      "Feel the hatch for heat before opening and locate the source carefully",
      "Pour water over the hatch",
    ],
    correctIndex: 2,
    explanation: [
      "Feel the hatch for heat — a hot hatch means fire below.",
      "Opening a hatch to a fire can create a backdraft, feeding oxygen to the flames.",
      "If the hatch is cool, open it carefully and cautiously inspect.",
      "Have a fire extinguisher ready before opening any compartment with suspected fire.",
    ],
  },
  {
    title: "Fire on a Boat at the Dock",
    situation: "Your boat catches fire while tied up at a busy marina dock. Other boats are nearby. What is your FIRST action?",
    choices: [
      "Stay aboard and fight the fire alone",
      "Evacuate everyone, then cast off dock lines if safe to prevent spread",
      "Do nothing and wait for the fire department",
      "Drive the boat away from the dock at full speed",
    ],
    correctIndex: 1,
    explanation: [
      "Evacuate all persons from the boat immediately.",
      "If safe, cast off dock lines to prevent the fire from spreading to other boats.",
      "Call 911 and alert the marina / harbormaster.",
      "Do NOT re-board the vessel. Let fire professionals handle it.",
    ],
  },
  {
    title: "Choosing the Right Extinguisher",
    situation: "You're equipping your boat with a fire extinguisher. Which type is CORRECT for marine use?",
    choices: [
      "Type A only (ordinary combustibles)",
      "Type B or ABC (flammable liquids / multi-purpose)",
      "Type D (combustible metals)",
      "A bucket of sand is sufficient",
    ],
    correctIndex: 1,
    explanation: [
      "Boats require Type B (flammable liquids — gas, oil) or ABC (multi-purpose) extinguishers.",
      "Type A alone is insufficient — boat fires often involve fuel and electrical systems.",
      "The USCG requires marine-rated extinguishers that meet specific B-rating minimums.",
      "Check expiration dates and ensure gauges are in the green zone regularly.",
    ],
  },
  {
    title: "PASS Technique",
    situation: "You need to use a fire extinguisher. What is the CORRECT sequence for the PASS technique?",
    choices: [
      "Push trigger, Aim high, Spray fast, Step back",
      "Pull pin, Aim at base of fire, Squeeze handle, Sweep side to side",
      "Point at flames, Activate, Spray upward, Shake canister",
      "Press handle, Aim at flames, Shoot in bursts, Stand close",
    ],
    correctIndex: 1,
    explanation: [
      "P — Pull the safety pin from the handle.",
      "A — Aim the nozzle at the BASE of the fire, not at the flames.",
      "S — Squeeze the handle firmly to discharge the agent.",
      "S — Sweep the nozzle side to side across the base of the fire.",
    ],
  },
  {
    title: "Fire While Anchored",
    situation: "Your boat is anchored in a cove when a fire breaks out in the cabin. What is your FIRST action?",
    choices: [
      "Pull up the anchor before doing anything else",
      "Try to fight the fire with available equipment",
      "Jump overboard immediately",
      "Radio your marina for a tow",
    ],
    correctIndex: 1,
    explanation: [
      "Attempt to fight the fire using your extinguisher and the PASS technique.",
      "If the fire cannot be controlled, prepare to abandon ship.",
      "Deploy an anchor ball or other distress signal to alert nearby boats.",
      "Do not waste time pulling anchor — fire response is the priority.",
    ],
  },
  {
    title: "Post-Fire Procedure",
    situation: "You've just extinguished a small engine fire. The flames are out and the smoke is clearing. What is your FIRST action?",
    choices: [
      "Restart the engine and continue your trip",
      "Check for re-ignition, ventilate, and inspect for structural damage",
      "Go swimming to cool off",
      "Spray the extinguisher again for good measure until it's empty",
    ],
    correctIndex: 1,
    explanation: [
      "Monitor the area closely for re-ignition — fires can restart from hot spots.",
      "Ventilate the area thoroughly to clear smoke and fumes.",
      "Inspect for structural damage to the hull, wiring, and fuel lines.",
      "Head to the nearest port for a professional inspection before continuing.",
    ],
  },
  {
    title: "Flare Storage Area Fire",
    situation: "You notice flames licking at the compartment where your emergency flares are stored. What is your FIRST action?",
    choices: [
      "Open the compartment and remove the flares",
      "Spray water into the compartment",
      "Evacuate immediately — flares can ignite explosively",
      "Use a Type A extinguisher on the compartment",
    ],
    correctIndex: 2,
    explanation: [
      "Evacuate immediately — flares contain pyrotechnic compounds that burn intensely.",
      "Flares can ignite explosively, launching burning material in all directions.",
      "Get all passengers into PFDs and into the water, clear of the vessel.",
      "Call Mayday on VHF Channel 16 and move upwind of the vessel.",
    ],
  },
];

const ROUNDS_PER_GAME = 10;
const SECONDS_PER_ROUND = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGrade(score: number, total: number): { letter: string; label: string; color: string } {
  const pct = (score / total) * 100;
  if (pct >= 90) return { letter: "A", label: "Fire Safety Expert", color: "text-green-400" };
  if (pct >= 80) return { letter: "B", label: "Well Prepared", color: "text-blue-400" };
  if (pct >= 70) return { letter: "C", label: "Needs Practice", color: "text-yellow-400" };
  if (pct >= 60) return { letter: "D", label: "At Risk", color: "text-orange-400" };
  return { letter: "F", label: "Dangerously Unprepared", color: "text-red-400" };
}

type GamePhase = "intro" | "playing" | "feedback" | "results";

interface RoundResult {
  scenario: Scenario;
  selectedIndex: number;
  correct: boolean;
  timeLeft: number;
  timedOut: boolean;
}

export default function BoatFire() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ROUND);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

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
    setSelectedIndex(null);
    setTimeLeft(SECONDS_PER_ROUND);
    setExpandedRound(null);
    setPhase("playing");
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "playing") {
      clearTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          // Time's up — record as timed out
          setSelectedIndex(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, currentRound, clearTimer]);

  // Handle timeout selection
  useEffect(() => {
    if (selectedIndex === -1 && phase === "playing") {
      const scenario = scenarios[currentRound];
      setResults((prev) => [
        ...prev,
        { scenario, selectedIndex: -1, correct: false, timeLeft: 0, timedOut: true },
      ]);
      setPhase("feedback");
    }
  }, [selectedIndex, phase, scenarios, currentRound]);

  const handleChoice = useCallback(
    (index: number) => {
      if (selectedIndex !== null) return;
      clearTimer();
      const scenario = scenarios[currentRound];
      const correct = index === scenario.correctIndex;
      setSelectedIndex(index);
      setResults((prev) => [
        ...prev,
        { scenario, selectedIndex: index, correct, timeLeft, timedOut: false },
      ]);
      setPhase("feedback");
    },
    [selectedIndex, clearTimer, scenarios, currentRound, timeLeft],
  );

  const nextRound = useCallback(() => {
    if (currentRound + 1 >= ROUNDS_PER_GAME) {
      setPhase("results");
    } else {
      setCurrentRound((r) => r + 1);
      setSelectedIndex(null);
      setTimeLeft(SECONDS_PER_ROUND);
      setPhase("playing");
    }
  }, [currentRound]);

  const score = results.filter((r) => r.correct).length;
  const grade = getGrade(score, ROUNDS_PER_GAME);
  const timerPct = (timeLeft / SECONDS_PER_ROUND) * 100;
  const timerColor = timeLeft <= 3 ? "bg-red-500" : timeLeft <= 6 ? "bg-orange-400" : "bg-green-500";

  const shareUrl = "https://onlineboatereducation.com/games/boat-fire";
  const embedCode = `<iframe src="https://onlineboatereducation.com/embed/games/boat-fire" width="100%" height="700" frameborder="0"></iframe>`;

  const handleShare = useCallback(async () => {
    const text = `I scored ${score}/${ROUNDS_PER_GAME} (${grade.letter}) on the Boat Fire Emergency game! Test your fire safety knowledge:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Boat Fire Emergency", text, url: shareUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      toast({ title: "Link copied!", description: "Share it with fellow boaters." });
    }
  }, [score, grade.letter, toast]);

  const handleCopyEmbed = useCallback(async () => {
    await navigator.clipboard.writeText(embedCode);
    toast({ title: "Embed code copied!", description: "Paste it into your website's HTML." });
  }, [toast, embedCode]);

  // ── Intro Screen ──
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20 mb-6">
              <Flame className="w-10 h-10 text-orange-400" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Boat Fire Emergency</h1>
            <p className="text-gray-400 text-lg">
              Do you know what to do when fire breaks out on a boat? Every second counts.
            </p>
          </div>

          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold text-orange-300">How to Play</h2>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex gap-2">
                  <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>Each round presents a fire emergency scenario on a boat.</span>
                </li>
                <li className="flex gap-2">
                  <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>You have <strong>10 seconds</strong> to pick the correct first action — fire emergencies are urgent!</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{ROUNDS_PER_GAME} rounds total. After each, you'll see the full correct procedure.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 border-gray-700 mb-8">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-orange-300 mb-3">Remember: P.A.S.S.</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="font-bold text-orange-400 text-lg">P</span>
                  <span className="text-gray-300 ml-2">Pull the pin</span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="font-bold text-orange-400 text-lg">A</span>
                  <span className="text-gray-300 ml-2">Aim at base</span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="font-bold text-orange-400 text-lg">S</span>
                  <span className="text-gray-300 ml-2">Squeeze handle</span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="font-bold text-orange-400 text-lg">S</span>
                  <span className="text-gray-300 ml-2">Sweep side to side</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-3">
            <Button
              onClick={startGame}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 text-lg"
            >
              Start Emergency Drill <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div>
              <Link href="/games">
                <span className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer">
                  Back to Games
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing Screen ──
  if (phase === "playing") {
    const scenario = scenarios[currentRound];
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="border-orange-500/50 text-orange-300">
              <Flame className="w-3 h-3 mr-1" /> Round {currentRound + 1} / {ROUNDS_PER_GAME}
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              <Trophy className="w-3 h-3 mr-1" /> {score} / {currentRound}
            </Badge>
          </div>

          {/* Timer */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time
              </span>
              <span className={`font-mono font-bold ${timeLeft <= 3 ? "text-red-400" : timeLeft <= 6 ? "text-orange-400" : "text-green-400"}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>

          {/* Scenario */}
          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-orange-300 mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                {scenario.title}
              </h2>
              <p className="text-gray-300 leading-relaxed">{scenario.situation}</p>
            </CardContent>
          </Card>

          {/* Choices */}
          <div className="space-y-3">
            {scenario.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className="w-full text-left p-4 rounded-lg border border-gray-700 bg-gray-800/40 hover:bg-orange-600/20 hover:border-orange-500/50 transition-all duration-150 text-gray-200 hover:text-white"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-700 text-sm font-bold mr-3 shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Feedback Screen ──
  if (phase === "feedback") {
    const result = results[results.length - 1];
    const { scenario } = result;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Result badge */}
          <div className="text-center mb-6">
            {result.correct ? (
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-5 py-2 text-lg font-semibold">
                <CheckCircle2 className="w-5 h-5" /> Correct!
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-5 py-2 text-lg font-semibold">
                <XCircle className="w-5 h-5" /> {result.timedOut ? "Time's Up!" : "Incorrect"}
              </div>
            )}
          </div>

          {/* Scenario recap */}
          <Card className="bg-gray-800/60 border-gray-700 mb-4">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold text-orange-300 mb-2">{scenario.title}</h2>
              <p className="text-gray-400 text-sm mb-4">{scenario.situation}</p>

              {/* Show selected vs correct */}
              <div className="space-y-2 mb-4">
                {scenario.choices.map((choice, i) => {
                  const isCorrect = i === scenario.correctIndex;
                  const isSelected = i === result.selectedIndex;
                  let style = "border-gray-700/50 bg-gray-800/30 text-gray-500";
                  if (isCorrect) style = "border-green-500/50 bg-green-500/10 text-green-300";
                  else if (isSelected && !isCorrect) style = "border-red-500/50 bg-red-500/10 text-red-300";
                  return (
                    <div key={i} className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${style}`}>
                      <span className="font-bold shrink-0">{String.fromCharCode(65 + i)}.</span>
                      {choice}
                      {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-green-400" />}
                      {isSelected && !isCorrect && <XCircle className="w-4 h-4 ml-auto shrink-0 text-red-400" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Full procedure */}
          <Card className="bg-gray-800/60 border-orange-500/20 mb-6">
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-3">
                Correct Procedure
              </h3>
              <ol className="space-y-2">
                {scenario.explanation.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={nextRound}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8"
            >
              {currentRound + 1 >= ROUNDS_PER_GAME ? "See Results" : "Next Scenario"}{" "}
              <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Grade */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/20 mb-4">
            <span className={`text-5xl font-black ${grade.color}`}>{grade.letter}</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">
            {score} / {ROUNDS_PER_GAME}
          </h1>
          <p className={`text-lg font-semibold ${grade.color}`}>{grade.label}</p>
        </div>

        {/* Round-by-round review */}
        <Card className="bg-gray-800/60 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Round-by-Round Review
            </h2>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i}>
                  <button
                    onClick={() => setExpandedRound(expandedRound === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {r.correct ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                      <span className="text-sm text-gray-200">
                        <span className="text-gray-500 mr-2">R{i + 1}</span>
                        {r.scenario.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-500 transition-transform ${expandedRound === i ? "rotate-90" : ""}`}
                    />
                  </button>
                  {expandedRound === i && (
                    <div className="mt-1 ml-8 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm space-y-2">
                      <p className="text-gray-400">{r.scenario.situation}</p>
                      {r.timedOut ? (
                        <p className="text-red-400">You ran out of time.</p>
                      ) : (
                        <p className={r.correct ? "text-green-400" : "text-red-400"}>
                          Your answer: {r.scenario.choices[r.selectedIndex]}
                        </p>
                      )}
                      <p className="text-green-300">
                        Correct: {r.scenario.choices[r.scenario.correctIndex]}
                      </p>
                      <ol className="space-y-1 mt-2 text-gray-400">
                        {r.scenario.explanation.map((step, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-orange-400 font-bold">{j + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button onClick={startGame} className="bg-orange-600 hover:bg-orange-700 text-white">
            <RotateCcw className="w-4 h-4 mr-2" /> Play Again
          </Button>
          <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800">
            <Share2 className="w-4 h-4 mr-2" /> Share Score
          </Button>
        </div>

        {/* Embed */}
        <Card className="bg-gray-800/60 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Embed This Game</h3>
            <div className="relative">
              <pre className="text-xs bg-gray-900 rounded-lg p-3 overflow-x-auto text-gray-400 border border-gray-700">
                {embedCode}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-xs text-gray-400 hover:text-white"
                onClick={handleCopyEmbed}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/games">
            <span className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer">
              Back to Games
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
