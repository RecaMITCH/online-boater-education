import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Clock, Trophy, CheckCircle2, XCircle, RotateCcw, Share2, ClipboardCheck, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  name: string;
  required: boolean;
  explanation: string;
}

interface Round {
  title: string;
  scenario: string;
  items: ChecklistItem[];
}

const ROUNDS: Round[] = [
  {
    title: "Round 1: Powerboat on the Great Lakes",
    scenario:
      "You're about to launch your 22-foot powerboat on Lake Michigan with 4 passengers for a day of fishing. Check all REQUIRED safety items before departure.",
    items: [
      { id: "r1-pfds", name: "USCG-approved PFDs (one per person + child sizes)", required: true, explanation: "Federal law requires one wearable PFD for each person on board." },
      { id: "r1-throwable", name: "Throwable flotation device (Type IV)", required: true, explanation: "Required on all boats 16 feet and longer." },
      { id: "r1-fire", name: "Fire extinguisher (Type B)", required: true, explanation: "Required on boats with enclosed engines, fuel compartments, or enclosed living spaces." },
      { id: "r1-flares", name: "Visual distress signals (flares)", required: true, explanation: "Required on coastal and Great Lakes waters for boats 16 feet and longer." },
      { id: "r1-horn", name: "Sound-producing device (horn or whistle)", required: true, explanation: "Required on all vessels to signal intentions and warnings." },
      { id: "r1-lights", name: "Navigation lights (checked and working)", required: true, explanation: "Required equipment — must be operational even for daytime trips." },
      { id: "r1-registration", name: "Boat registration and documentation", required: true, explanation: "Must be on board at all times when the vessel is in operation." },
      { id: "r1-weather", name: "Check weather forecast", required: true, explanation: "Essential pre-departure safety step recommended by the USCG." },
      { id: "r1-floatplan", name: "File a float plan with someone on shore", required: true, explanation: "Critical safety practice so rescuers know where to look if you don't return." },
      { id: "r1-drainplug", name: "Drain plug installed", required: true, explanation: "Forgetting the drain plug is a leading cause of boat sinkings at the ramp." },
      { id: "r1-fuel", name: "Sufficient fuel (1/3 out, 1/3 back, 1/3 reserve)", required: true, explanation: "The 1/3 fuel rule is a fundamental boating safety practice." },
      { id: "r1-bilge", name: "Working bilge pump", required: true, explanation: "Required safety equipment to remove water from the bilge." },
      { id: "r1-anchorlight", name: "Anchor light", required: false, explanation: "Only required when anchored at night — not a pre-departure checklist item." },
      { id: "r1-radar", name: "Radar reflector", required: false, explanation: "Not required for recreational vessels of this size." },
      { id: "r1-epirb", name: "EPIRB", required: false, explanation: "Not required for recreational boats on inland or Great Lakes waters." },
      { id: "r1-liferaft", name: "Life raft", required: false, explanation: "Not required for a day trip on a lake." },
      { id: "r1-towing", name: "Towing insurance paperwork", required: false, explanation: "Nice to have but not a safety equipment requirement." },
      { id: "r1-fishing", name: "Fishing license", required: false, explanation: "Important for fishing legally, but not a boating safety item." },
    ],
  },
  {
    title: "Round 2: Jon Boat on the River",
    scenario:
      "You're heading out early morning on a 14-foot aluminum jon boat with 1 passenger on a small river for bass fishing. Check all REQUIRED safety items.",
    items: [
      { id: "r2-pfds", name: "PFDs (one per person)", required: true, explanation: "Required on every vessel regardless of size — one wearable PFD per person." },
      { id: "r2-whistle", name: "Sound-producing device (whistle)", required: true, explanation: "Required on all vessels to signal in restricted visibility or emergencies." },
      { id: "r2-drainplug", name: "Drain plug installed", required: true, explanation: "Essential check before every launch to prevent swamping." },
      { id: "r2-weather", name: "Check weather forecast", required: true, explanation: "Weather changes fast on rivers — always check before heading out." },
      { id: "r2-floatplan", name: "Tell someone your plan (float plan)", required: true, explanation: "Someone on shore should always know where you're going and when you'll return." },
      { id: "r2-fuel", name: "Sufficient fuel", required: true, explanation: "Running out of fuel on a river can be dangerous with current and limited cell service." },
      { id: "r2-registration", name: "Boat registration on board", required: true, explanation: "Must be carried on board whenever the vessel is in use." },
      { id: "r2-lights", name: "Navigation lights (early morning launch)", required: true, explanation: "Required when operating between sunset and sunrise — early morning counts." },
      { id: "r2-throwable", name: "Type IV throwable device", required: false, explanation: "Not required on boats under 16 feet in length." },
      { id: "r2-fire", name: "Fire extinguisher", required: false, explanation: "Not required on open boats under 26 feet without enclosed engine or fuel compartments." },
      { id: "r2-flares", name: "Visual distress signals / flares", required: false, explanation: "Not required on inland waters for boats under 16 feet." },
      { id: "r2-vhf", name: "VHF radio", required: false, explanation: "Recommended but not legally required on small inland vessels." },
      { id: "r2-anchor", name: "Anchor", required: false, explanation: "Recommended but not a legal requirement." },
      { id: "r2-epirb", name: "EPIRB", required: false, explanation: "Not required for small boats on inland waters." },
      { id: "r2-firstaid", name: "First aid kit", required: false, explanation: "Strongly recommended but not required by federal law." },
      { id: "r2-compass", name: "Compass", required: false, explanation: "Not required on small inland vessels." },
    ],
  },
  {
    title: "Round 3: Cabin Cruiser on Coastal Waters",
    scenario:
      "You're preparing your 30-foot cabin cruiser for an overnight trip on coastal waters with 6 passengers, including children. Check all REQUIRED safety items.",
    items: [
      { id: "r3-pfds", name: "PFDs for all passengers (including child sizes)", required: true, explanation: "One wearable PFD per person — children must have properly fitted child PFDs." },
      { id: "r3-throwable", name: "Type IV throwable device", required: true, explanation: "Required on all boats 16 feet and longer." },
      { id: "r3-fire", name: "Fire extinguisher(s) — multiple for larger vessel", required: true, explanation: "Boats 26–40 feet require at least two B-I or one B-II fire extinguishers." },
      { id: "r3-flares", name: "Visual distress signals (day AND night)", required: true, explanation: "Required on coastal waters — must carry both day and night signals." },
      { id: "r3-horn", name: "Sound-producing device (horn)", required: true, explanation: "Boats 39.4 feet+ need a whistle AND bell; this vessel needs at minimum a horn." },
      { id: "r3-lights", name: "Navigation lights (checked and working)", required: true, explanation: "Essential for overnight trip — must have proper running and anchor lights." },
      { id: "r3-registration", name: "Registration / documentation", required: true, explanation: "Must be on board at all times during operation." },
      { id: "r3-weather", name: "Check weather AND marine forecast", required: true, explanation: "Coastal weather is unpredictable — check NOAA marine forecasts before departure." },
      { id: "r3-floatplan", name: "File a float plan", required: true, explanation: "Especially critical for overnight coastal trips — file with the Coast Guard or a contact." },
      { id: "r3-drainplug", name: "Drain plug installed", required: true, explanation: "Always verify before every single launch." },
      { id: "r3-fuel", name: "Sufficient fuel (1/3 rule)", required: true, explanation: "The 1/3 rule is even more important on coastal waters where fuel stops are scarce." },
      { id: "r3-vhf", name: "VHF marine radio", required: true, explanation: "Required for monitoring Channel 16 in coastal areas — essential for safety communication." },
      { id: "r3-anchor", name: "Anchor and line", required: true, explanation: "Required for overnight trips and as emergency equipment on coastal waters." },
      { id: "r3-bilge", name: "Bilge pump working", required: true, explanation: "Required on vessels with enclosed compartments — test before departure." },
      { id: "r3-co", name: "Carbon monoxide detector (enclosed cabin)", required: true, explanation: "Required on boats with enclosed accommodations — CO poisoning is a serious risk." },
      { id: "r3-ventilation", name: "Ventilation system working", required: true, explanation: "Required on boats with enclosed engine or fuel compartments to prevent gas buildup." },
      { id: "r3-epirb", name: "EPIRB", required: false, explanation: "Recommended for offshore but not required for coastal recreational vessels." },
      { id: "r3-liferaft", name: "Life raft", required: false, explanation: "Not required for coastal recreational trips." },
      { id: "r3-radarunit", name: "Radar", required: false, explanation: "Not required for recreational vessels, though recommended for coastal night travel." },
      { id: "r3-satphone", name: "Satellite phone", required: false, explanation: "Nice to have for offshore, but not a legal requirement." },
    ],
  },
];

const ROUND_TIME = 60;

type GamePhase = "intro" | "playing" | "review" | "results";

function getGrade(pct: number) {
  if (pct >= 97) return { letter: "A+", label: "Harbor Master", color: "text-yellow-400" };
  if (pct >= 93) return { letter: "A", label: "Expert Captain", color: "text-yellow-400" };
  if (pct >= 90) return { letter: "A-", label: "Skilled Skipper", color: "text-yellow-400" };
  if (pct >= 87) return { letter: "B+", label: "Competent Boater", color: "text-blue-400" };
  if (pct >= 83) return { letter: "B", label: "Solid Sailor", color: "text-blue-400" };
  if (pct >= 80) return { letter: "B-", label: "Decent Deckhand", color: "text-blue-400" };
  if (pct >= 77) return { letter: "C+", label: "Needs Practice", color: "text-orange-400" };
  if (pct >= 73) return { letter: "C", label: "Risky Operator", color: "text-orange-400" };
  if (pct >= 70) return { letter: "C-", label: "Barely Passing", color: "text-orange-400" };
  if (pct >= 60) return { letter: "D", label: "Unsafe Captain", color: "text-red-400" };
  return { letter: "F", label: "Stay on Shore", color: "text-red-500" };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PreDeparture() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [currentRound, setCurrentRound] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [roundTotals, setRoundTotals] = useState<number[]>([]);
  const [shuffledItems, setShuffledItems] = useState<ChecklistItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const round = ROUNDS[currentRound];

  const startRound = useCallback((roundIndex: number) => {
    setCurrentRound(roundIndex);
    setCheckedItems(new Set());
    setTimeLeft(ROUND_TIME);
    setSubmitted(false);
    setShuffledItems(shuffleArray(ROUNDS[roundIndex].items));
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase === "playing" && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && phase === "playing" && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, phase, submitted]);

  const toggleItem = useCallback(
    (id: string) => {
      if (submitted) return;
      setCheckedItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const items = ROUNDS[currentRound].items;
    let score = 0;
    items.forEach((item) => {
      const isChecked = checkedItems.has(item.id);
      if ((item.required && isChecked) || (!item.required && !isChecked)) {
        score++;
      }
    });

    setRoundScores((prev) => [...prev, score]);
    setRoundTotals((prev) => [...prev, items.length]);
    setPhase("review");
  }, [submitted, currentRound, checkedItems]);

  const handleNextRound = useCallback(() => {
    if (currentRound < ROUNDS.length - 1) {
      startRound(currentRound + 1);
    } else {
      setPhase("results");
    }
  }, [currentRound, startRound]);

  const handleRestart = useCallback(() => {
    setPhase("intro");
    setCurrentRound(0);
    setCheckedItems(new Set());
    setTimeLeft(ROUND_TIME);
    setRoundScores([]);
    setRoundTotals([]);
    setShuffledItems([]);
    setSubmitted(false);
  }, []);

  const handleShare = useCallback(async () => {
    const totalScore = roundScores.reduce((a, b) => a + b, 0);
    const totalItems = roundTotals.reduce((a, b) => a + b, 0);
    const pct = Math.round((totalScore / totalItems) * 100);
    const grade = getGrade(pct);
    const text = `I scored ${pct}% (${grade.letter}) on the Pre-Departure Checklist game! Can you identify all the required safety items before launching? Try it:`;
    const url = "https://onlineboatereducation.com/games/pre-departure";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Pre-Departure Checklist", text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast({ title: "Copied to clipboard!", description: "Share your score with friends." });
    }
  }, [roundScores, roundTotals, toast]);

  const totalScore = roundScores.reduce((a, b) => a + b, 0);
  const totalItems = roundTotals.reduce((a, b) => a + b, 0);
  const overallPct = totalItems > 0 ? Math.round((totalScore / totalItems) * 100) : 0;
  const grade = getGrade(overallPct);

  const timerPct = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft > 20 ? "bg-green-500" : timeLeft > 10 ? "bg-yellow-500" : "bg-red-500";

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-950 text-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-4">
              <ClipboardCheck className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Pre-Departure Checklist</h1>
            <p className="text-cyan-200 text-lg">Do you know what's required before you launch?</p>
          </div>

          <Card className="bg-white/10 border-white/20 text-white mb-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                How to Play
              </h2>
              <div className="space-y-3 text-cyan-100">
                <p>
                  You'll face <strong>3 boat scenarios</strong>, each with different vessels, waters, and passengers.
                  For each scenario, you'll see a list of items — some are <strong>legally required</strong> for a safe
                  departure, and some are <strong>not required</strong> or irrelevant.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-start gap-2 bg-green-500/10 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm">
                      <strong>Check</strong> all items that are required for safe, legal departure.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                    <XCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm">
                      <strong>Leave unchecked</strong> items that are NOT required for this scenario.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-yellow-500/10 rounded-lg p-3">
                  <Clock className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                  <span className="text-sm">
                    You have <strong>60 seconds</strong> per round. Every correct check or uncheck earns a point.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">The 3 Scenarios</h3>
              <div className="space-y-2">
                {ROUNDS.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                    <Badge variant="outline" className="border-cyan-400 text-cyan-300 shrink-0">
                      {i + 1}
                    </Badge>
                    <span className="text-sm text-cyan-100">{r.scenario.split(".")[0]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => startRound(0)}
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg"
            >
              Start Inspection
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/games">
              <span className="text-cyan-300 hover:text-white text-sm cursor-pointer">Back to All Games</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Playing or Review phase
  if (phase === "playing" || phase === "review") {
    const displayItems = phase === "playing" ? shuffledItems : shuffledItems;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-950 text-white">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="border-cyan-400 text-cyan-300">
              Round {currentRound + 1} / {ROUNDS.length}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className={timeLeft <= 10 && !submitted ? "text-red-400 font-bold animate-pulse" : ""}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
              style={{ width: `${submitted ? 0 : timerPct}%` }}
            />
          </div>

          {/* Scenario */}
          <Card className="bg-white/10 border-white/20 text-white mb-4">
            <CardContent className="p-4">
              <h2 className="font-bold text-lg mb-1">{round.title}</h2>
              <p className="text-cyan-200 text-sm">{round.scenario}</p>
            </CardContent>
          </Card>

          {phase === "review" && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4 text-center">
              <p className="text-lg font-semibold">
                Round Score:{" "}
                <span className="text-cyan-300">
                  {roundScores[roundScores.length - 1]} / {roundTotals[roundTotals.length - 1]}
                </span>
                <span className="text-sm text-cyan-200 ml-2">
                  ({Math.round(
                    (roundScores[roundScores.length - 1] / roundTotals[roundTotals.length - 1]) * 100
                  )}%)
                </span>
              </p>
              {timeLeft === 0 && (
                <p className="text-yellow-400 text-sm mt-1">Time's up! Unchecked items were submitted as-is.</p>
              )}
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {displayItems.map((item) => {
              const isChecked = checkedItems.has(item.id);
              const isCorrect =
                (item.required && isChecked) || (!item.required && !isChecked);
              const showResult = phase === "review";

              let borderClass = "border-white/10";
              let bgClass = "bg-white/5 hover:bg-white/10";

              if (!showResult && isChecked) {
                borderClass = "border-green-500/60";
                bgClass = "bg-green-500/10";
              }
              if (showResult) {
                if (isCorrect) {
                  borderClass = "border-green-500/60";
                  bgClass = "bg-green-500/10";
                } else {
                  borderClass = "border-red-500/60";
                  bgClass = "bg-red-500/10";
                }
              }

              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  disabled={submitted}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${borderClass} ${bgClass} ${
                    submitted ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? showResult
                          ? isCorrect
                            ? "bg-green-500 border-green-500"
                            : "bg-red-500 border-red-500"
                          : "bg-cyan-500 border-cyan-500"
                        : showResult
                        ? isCorrect
                          ? "border-green-500/50"
                          : "border-red-500 bg-red-500/20"
                        : "border-white/30"
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 text-white" />}
                    {showResult && !isChecked && !isCorrect && <X className="w-3 h-3 text-red-300" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium leading-tight block">{item.name}</span>
                    {showResult && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          {item.required ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-1.5 py-0">
                              Required
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs px-1.5 py-0">
                              Not Required
                            </Badge>
                          )}
                          {isCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>
                        <p className="text-xs text-cyan-200/70 leading-snug">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 pb-8">
            {phase === "playing" && (
              <Button
                onClick={handleSubmit}
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
              >
                <ClipboardCheck className="w-5 h-5 mr-2" />
                Launch!
              </Button>
            )}
            {phase === "review" && (
              <Button
                onClick={handleNextRound}
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
              >
                {currentRound < ROUNDS.length - 1 ? (
                  <>
                    Next Scenario
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                ) : (
                  <>
                    See Final Results
                    <Trophy className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Inspection Complete</h1>
          <p className="text-cyan-200">Here's how you did across all 3 scenarios</p>
        </div>

        {/* Overall grade */}
        <Card className="bg-white/10 border-white/20 text-white mb-6">
          <CardContent className="p-6 text-center">
            <div className={`text-7xl font-bold mb-1 ${grade.color}`}>{grade.letter}</div>
            <div className="text-xl text-cyan-200 mb-2">{grade.label}</div>
            <div className="text-3xl font-bold">{overallPct}%</div>
            <div className="text-sm text-cyan-300 mt-1">
              {totalScore} / {totalItems} items correct
            </div>
          </CardContent>
        </Card>

        {/* Round breakdown */}
        <Card className="bg-white/10 border-white/20 text-white mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Round Breakdown</h3>
            <div className="space-y-3">
              {ROUNDS.map((r, i) => {
                const pct = Math.round((roundScores[i] / roundTotals[i]) * 100);
                return (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{r.title}</span>
                      <span className="text-sm font-bold text-cyan-300">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-cyan-200/70 mt-1">
                      {roundScores[i]} / {roundTotals[i]} items
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key takeaways */}
        <Card className="bg-white/10 border-white/20 text-white mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Key Takeaways</h3>
            <ul className="space-y-2 text-sm text-cyan-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>
                  PFDs and a sound-producing device are required on <strong>every</strong> vessel regardless of size.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>
                  Requirements scale with boat size — fire extinguishers, throwables, and flares kick in at 16+ and 26+ feet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>
                  Coastal waters have stricter requirements than inland waters, including visual distress signals and VHF radio.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>
                  Always check the drain plug, weather forecast, and file a float plan — no matter the vessel.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button
            onClick={handleRestart}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Score
          </Button>
          <Link href="/games">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white w-full sm:w-auto">
              More Games
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="text-center text-xs text-cyan-300/50 pb-8">
          <p>
            Learn more about boating safety at{" "}
            <Link href="/">
              <span className="underline cursor-pointer">OnlineBoaterEducation.com</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
