import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Clock, Trophy, CheckCircle2, XCircle, RotateCcw, Share2, LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

interface PFDType {
  id: number;
  name: string;
  shortName: string;
  description: string;
}

interface Scenario {
  id: number;
  description: string;
  correctType: number;
  explanation: string;
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
  },
  {
    id: 2,
    name: "Type II — Near-Shore Buoyant Vest",
    shortName: "Type II",
    description: "15.5 lbs buoyancy. Good for calm, inland water where quick rescue is likely.",
  },
  {
    id: 3,
    name: "Type III — Flotation Aid",
    shortName: "Type III",
    description: "15.5 lbs buoyancy. Most comfortable for extended wear. Great for supervised water sports.",
  },
  {
    id: 4,
    name: "Type IV — Throwable Device",
    shortName: "Type IV",
    description: "Not worn — thrown to someone in the water. Ring buoys and cushions. Required on boats 16+ ft.",
  },
  {
    id: 5,
    name: "Type V — Special Use Device",
    shortName: "Type V",
    description: "Designed for specific activities. Must be worn during the labeled activity to count as legal PFD.",
  },
];

const ALL_SCENARIOS: Scenario[] = [
  {
    id: 1,
    description: "You're heading out on an offshore fishing trip 20 miles into the Gulf of Mexico. The seas are choppy and help could be hours away.",
    correctType: 1,
    explanation: "Type I offshore life jackets provide the highest buoyancy (22+ lbs) and are designed to turn most unconscious wearers face-up. In remote offshore waters where rescue may be delayed, Type I is the safest choice.",
  },
  {
    id: 2,
    description: "Your 5-year-old child is joining you on a pontoon boat ride around a calm lake. The marina is nearby and the water is flat.",
    correctType: 2,
    explanation: "Type II near-shore buoyant vests are ideal for calm, inland water where rescue is expected to be quick. They provide some face-up turning ability and are a practical choice for children on calm lakes near help.",
  },
  {
    id: 3,
    description: "You're kayaking down a calm river on a sunny summer afternoon. You'll be paddling for several hours.",
    correctType: 3,
    explanation: "Type III flotation aids are the most comfortable for extended wear, making them ideal for kayaking. They provide 15.5 lbs of buoyancy and are designed for calm water where the wearer can position themselves face-up.",
  },
  {
    id: 4,
    description: "You're about to waterski behind a speedboat on an inland lake. You need a PFD that won't restrict your movement.",
    correctType: 3,
    explanation: "Type III flotation aids are the go-to choice for water sports like waterskiing. They're designed for comfort and freedom of movement during active, supervised water activities on calm water.",
  },
  {
    id: 5,
    description: "You're sailing 15 miles offshore in the Atlantic Ocean. The weather forecast calls for building seas and possible squalls.",
    correctType: 1,
    explanation: "Type I offshore life jackets are essential for open ocean sailing. With the highest buoyancy and face-up turning capability, they give you the best chance of survival if you end up in rough offshore water far from help.",
  },
  {
    id: 6,
    description: "Someone just fell overboard from your boat! They're 20 feet away in the water and struggling. You need to get flotation to them immediately.",
    correctType: 4,
    explanation: "Type IV throwable devices — ring buoys and throwable cushions — are designed to be thrown to someone in the water. They provide immediate flotation assistance without requiring anyone else to enter the water.",
  },
  {
    id: 7,
    description: "You're working as a commercial fishing crew member on a crab boat in Alaska. Conditions are extreme and you need specialized protection on deck.",
    correctType: 5,
    explanation: "Type V special use devices include commercial work vests and deck suits designed for specific professional activities. Commercial fishing crews use Type V PFDs engineered for their demanding working conditions.",
  },
  {
    id: 8,
    description: "You're going stand-up paddleboarding on a calm, sheltered bay. You want to be comfortable while paddling for an hour or two.",
    correctType: 3,
    explanation: "Type III flotation aids are perfect for paddleboarding. They offer the best comfort for extended wear during calm-water activities and provide adequate buoyancy (15.5 lbs) for a conscious wearer in sheltered water.",
  },
  {
    id: 9,
    description: "Your family is heading out for a leisurely canoe trip on a state park lake. The kids are excited and the water is calm.",
    correctType: 3,
    explanation: "Type III flotation aids are a great choice for family canoeing on calm lakes. They're comfortable enough for all-day wear and provide reliable flotation for supervised recreational activities in inland water.",
  },
  {
    id: 10,
    description: "You're boating alone on a large lake at night. Visibility is low and there are no other boats around. If something goes wrong, rescue could take a while.",
    correctType: 1,
    explanation: "Type I offshore life jackets are the best choice when boating alone at night with limited visibility. The high buoyancy and face-up turning capability are critical when you might be unconscious and rescue is not immediate.",
  },
  {
    id: 11,
    description: "You're about to ride a personal watercraft (jet ski) on a lake. You need something comfortable that lets you move freely at high speed.",
    correctType: 3,
    explanation: "Type III flotation aids are standard for PWC / jet ski riding. They allow the freedom of movement needed for active riding while providing adequate buoyancy. Most jet ski-specific PFDs are Type III rated.",
  },
  {
    id: 12,
    description: "You're joining a guided whitewater rafting expedition on a Class III-IV river. The outfitter is providing specialized safety gear.",
    correctType: 5,
    explanation: "Type V special use devices are designed for specific activities like whitewater rafting. Whitewater PFDs are purpose-built with extra features like quick-release harnesses and higher arm mobility for the demands of rapids.",
  },
  {
    id: 13,
    description: "Your 16-foot motorboat needs to comply with federal requirements for having a backup flotation device on board that can be tossed to someone in an emergency.",
    correctType: 4,
    explanation: "Federal law requires boats 16 feet and longer to carry at least one Type IV throwable device (ring buoy or throwable cushion) in addition to wearable PFDs for each person aboard.",
  },
  {
    id: 14,
    description: "You're competitive sailboat racing and wearing a harness with a quick-inflate mechanism. The PFD is designed specifically for racing and tethering to the boat.",
    correctType: 5,
    explanation: "Type V special use devices include inflatable PFDs and sailing harnesses designed for specific activities. Racing inflatables with quick-inflate mechanisms and harness attachments are Type V devices meant for that exact use.",
  },
  {
    id: 15,
    description: "You're fishing from a small aluminum john boat about 100 yards from shore on a quiet pond. The water is calm and shallow.",
    correctType: 2,
    explanation: "Type II near-shore buoyant vests are well-suited for calm, near-shore conditions where rescue is quick. Fishing close to shore on a calm pond is a textbook Type II scenario — simple, affordable, and adequate.",
  },
  {
    id: 16,
    description: "You're rowing a small dinghy about 200 yards across a harbor to reach your anchored sailboat. The harbor is calm and busy with other boaters.",
    correctType: 2,
    explanation: "Type II near-shore buoyant vests are appropriate for short trips in calm, protected harbors where help is nearby. The short distance and presence of other boaters make this a classic near-shore scenario.",
  },
  {
    id: 17,
    description: "You've been hired as a deck hand on a commercial tour boat. Your employer requires you to wear a PFD specifically approved for commercial vessel operations.",
    correctType: 5,
    explanation: "Type V special use devices include work vests approved for commercial vessel operations. Commercial crew members must wear PFDs designed and labeled for their specific professional maritime role.",
  },
];

const ROUNDS_PER_GAME = 10;
const TIMER_SECONDS = 12;

const SHARE_URL = "https://onlineboatereducation.com/games/life-jacket-picker";
const EMBED_URL = "https://onlineboatereducation.com/embed/games/life-jacket-picker";

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
          // Time's up — record as timed out
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
    const code = `<iframe src="${EMBED_URL}" width="100%" height="700" frameborder="0" title="Life Jacket Picker Game"></iframe>`;
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
              description:
                "Test your boating safety knowledge — pick the correct PFD type for each scenario in this interactive game.",
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
              Can you choose the right PFD for every boating scenario? Test your knowledge of the 5 types of
              personal flotation devices.
            </p>
          </div>

          <div className="grid gap-4 mb-10">
            <Card className="bg-white/10 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Read the Scenario</h3>
                  <p className="text-sm text-sky-200">
                    Each round describes a real boating situation — from offshore fishing to kayaking a calm river.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Pick the Right PFD</h3>
                  <p className="text-sm text-sky-200">
                    Choose from 5 PFD types: Type I through Type V. You have 12 seconds per round.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Learn &amp; Improve</h3>
                  <p className="text-sm text-sky-200">
                    After each pick, see why the correct PFD type is the right choice. Score a perfect 10 to earn
                    Master Mariner!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={startGame}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-6 text-lg rounded-xl"
            >
              Start Game
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4 text-center">The 5 PFD Types</h2>
            <div className="grid gap-3">
              {PFD_TYPES.map((pfd) => (
                <div key={pfd.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="font-semibold text-cyan-300 mb-1">{pfd.name}</div>
                  <p className="text-sm text-sky-200">{pfd.description}</p>
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
      <div className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-cyan-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="border-sky-400 text-sky-300 text-sm px-3 py-1">
              Round {currentRound + 1} / {ROUNDS_PER_GAME}
            </Badge>
            <div className="flex items-center gap-2 text-sky-300">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold text-lg">{timeLeft}s</span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 linear"
              style={{
                width: `${timerPct}%`,
                backgroundColor: timeLeft <= 3 ? "#ef4444" : timeLeft <= 6 ? "#f59e0b" : "#22d3ee",
              }}
            />
          </div>

          {/* Scenario */}
          <Card className="bg-white/10 border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <LifeBuoy className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-medium text-cyan-300 mb-2 uppercase tracking-wide">Scenario</h2>
                  <p className="text-lg text-white leading-relaxed">{currentScenario.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PFD choices */}
          <h3 className="text-sm font-medium text-sky-300 mb-3 uppercase tracking-wide">Which PFD type is best?</h3>
          <div className="grid gap-3">
            {PFD_TYPES.map((pfd) => (
              <button
                key={pfd.id}
                onClick={() => handleSelect(pfd.id)}
                className="w-full text-left rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-300 group-hover:bg-cyan-500/30">
                    {pfd.id}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm">{pfd.name}</div>
                    <p className="text-xs text-sky-300 mt-0.5 leading-relaxed">{pfd.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-400 flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
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
                    You picked {getPFDTypeName(latestResult.selectedType)} — the correct answer is{" "}
                    {correctPFD.shortName}.
                  </p>
                )}
                {wasTimedOut && (
                  <p className="text-red-200 mt-1">The correct answer is {correctPFD.shortName}.</p>
                )}
              </>
            )}
          </div>

          {/* Scenario recap */}
          <Card className="bg-white/10 border-white/10 mb-4">
            <CardContent className="p-5">
              <p className="text-sky-200 text-sm leading-relaxed">{latestResult.scenario.description}</p>
            </CardContent>
          </Card>

          {/* Correct answer + explanation */}
          <Card className="bg-cyan-500/10 border-cyan-400/20 mb-8">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <LifeBuoy className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-cyan-300 mb-1">{correctPFD.name}</h3>
                  <p className="text-sm text-sky-200 leading-relaxed">{latestResult.scenario.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score progress */}
          <div className="flex items-center justify-between mb-6 text-sm text-sky-300">
            <span>
              Score: {score} / {results.length}
            </span>
            <span>
              Round {results.length} of {ROUNDS_PER_GAME}
            </span>
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
            <Button
              onClick={startGame}
              variant="outline"
              className="border-sky-400 text-sky-300 hover:bg-sky-400/10"
            >
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
                <p className="text-sm text-sky-200 mb-3">
                  Copy this code to embed the Life Jacket Picker game on your website:
                </p>
                <pre className="bg-black/30 rounded-lg p-3 text-xs text-sky-300 overflow-x-auto mb-3">
                  {`<iframe src="${EMBED_URL}" width="100%" height="700" frameborder="0" title="Life Jacket Picker Game"></iframe>`}
                </pre>
                <Button
                  size="sm"
                  onClick={handleCopyEmbed}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white"
                >
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
                  className={`border ${
                    r.correct ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {r.correct ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-sky-400">Round {i + 1}</span>
                          {r.timedOut && (
                            <Badge variant="outline" className="border-red-400/50 text-red-300 text-xs px-1.5 py-0">
                              Timed out
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-sky-100 leading-relaxed mb-2 line-clamp-2">
                          {r.scenario.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-sky-300">
                            Correct: <strong className="text-cyan-300">{correctPFD.shortName}</strong>
                          </span>
                          {r.selectedType && !r.correct && (
                            <span className="text-red-300">
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
              <Link
                href="/games"
                className="text-sm text-sky-300 hover:text-sky-100 underline underline-offset-4"
              >
                Back to All Games
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback — should never render
  return null;
}
