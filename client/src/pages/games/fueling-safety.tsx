import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Trophy, CheckCircle2, XCircle, RotateCcw, Share2, Fuel, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FUELING_STEPS = [
  "Dock the boat securely at the fuel dock",
  "Turn off the engine and all electrical equipment",
  "Extinguish all open flames (cigarettes, grills, etc.)",
  "Close all windows, hatches, and doors",
  "Remove all passengers from the boat",
  "Determine fuel type and locate fuel fill",
  "Keep the fuel nozzle in contact with the fill pipe (prevent static spark)",
  "Fill the tank — don't overfill (leave room for expansion)",
  "Wipe up any spilled fuel immediately",
  "Open all windows, hatches, and doors",
  "Run the exhaust blower for at least 4 minutes",
  "Sniff the engine compartment and bilge for fumes",
  "If no fumes detected, start the engine",
  "Re-board passengers",
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What should you do if you smell gas fumes after fueling?",
    options: [
      "Start the engine to clear the fumes",
      "Run the blower for 4 more minutes and sniff again",
      "Light a match to check for leaks",
      "Ignore it, fumes are normal",
    ],
    correctIndex: 1,
  },
  {
    question: "Why must you keep the fuel nozzle in contact with the fill pipe?",
    options: [
      "To prevent the nozzle from falling out",
      "To ground the connection and prevent static electricity sparks",
      "To measure the fuel flow rate",
      "It's just a recommendation, not required",
    ],
    correctIndex: 1,
  },
  {
    question: "How long should you run the exhaust blower after fueling?",
    options: [
      "30 seconds",
      "1 minute",
      "At least 4 minutes",
      "10 minutes",
    ],
    correctIndex: 2,
  },
  {
    question: "What's the biggest danger of overfilling your fuel tank?",
    options: [
      "It wastes money",
      "Fuel can expand in heat, overflow, and create explosive vapors",
      "It makes the boat too heavy",
      "It clogs the fuel filter",
    ],
    correctIndex: 1,
  },
];

const ORDERING_TIME = 90;
const QUIZ_TIME = 12;
const POINTS_PER_STEP = 70 / 14; // ~5 points each, 70 total
const POINTS_PER_QUIZ = 30 / 4;  // 7.5 points each, 30 total

type GamePhase = "intro" | "ordering" | "ordering-results" | "quiz" | "quiz-feedback" | "final";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGrade(score: number): { letter: string; color: string } {
  if (score >= 93) return { letter: "A", color: "text-emerald-400" };
  if (score >= 85) return { letter: "B", color: "text-blue-400" };
  if (score >= 75) return { letter: "C", color: "text-yellow-400" };
  if (score >= 65) return { letter: "D", color: "text-orange-400" };
  return { letter: "F", color: "text-red-400" };
}

export default function FuelingSafety() {
  const { toast } = useToast();

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [shuffledSteps, setShuffledSteps] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [orderingCorrect, setOrderingCorrect] = useState<boolean[]>([]);
  const [orderingScore, setOrderingScore] = useState(0);

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);

  const [timeLeft, setTimeLeft] = useState(ORDERING_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [totalScore, setTotalScore] = useState(0);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      setIsEmbedded(true);
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((seconds: number, onExpire: () => void) => {
    clearTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleOrderingTimeUp = useCallback(() => {
    submitOrdering();
  }, []);

  // We need a ref to hold the latest selectedOrder for the timer callback
  const selectedOrderRef = useRef(selectedOrder);
  selectedOrderRef.current = selectedOrder;

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(FUELING_STEPS);
    setShuffledSteps(shuffled);
    setSelectedOrder([]);
    setOrderingCorrect([]);
    setOrderingScore(0);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizCorrectCount(0);
    setQuizAnswers([]);
    setTotalScore(0);
    setPhase("ordering");

    startTimer(ORDERING_TIME, () => {
      // Auto-submit with whatever they have
      submitOrderingFromRef();
    });
  }, [startTimer]);

  const selectStep = useCallback((step: string) => {
    setSelectedOrder((prev) => {
      if (prev.includes(step)) return prev;
      return [...prev, step];
    });
  }, []);

  const undoLastStep = useCallback(() => {
    setSelectedOrder((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  const submitOrderingFromRef = useCallback(() => {
    const current = selectedOrderRef.current;
    // Fill remaining unselected slots with empty to mark wrong
    const fullOrder = [...current];
    // Pad to 14 if not all selected
    while (fullOrder.length < FUELING_STEPS.length) {
      fullOrder.push("__missing__");
    }

    const correctArr = fullOrder.map((step, i) => step === FUELING_STEPS[i]);
    const correctCount = correctArr.filter(Boolean).length;
    const score = Math.round(correctCount * POINTS_PER_STEP);

    setSelectedOrder(fullOrder);
    setOrderingCorrect(correctArr);
    setOrderingScore(score);
    setPhase("ordering-results");
  }, []);

  const submitOrdering = useCallback(() => {
    clearTimer();
    submitOrderingFromRef();
  }, [clearTimer, submitOrderingFromRef]);

  const proceedToQuiz = useCallback(() => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setPhase("quiz");
    startTimer(QUIZ_TIME, () => {
      // Time up — treat as no answer
      handleQuizAnswer(null);
    });
  }, [startTimer]);

  const handleQuizAnswerRef = useRef<(answer: number | null) => void>();

  const handleQuizAnswer = useCallback((answer: number | null) => {
    clearTimer();
    const question = QUIZ_QUESTIONS[currentQuizIndex];
    const isCorrect = answer === question.correctIndex;

    setSelectedAnswer(answer);
    setQuizAnswers((prev) => [...prev, answer]);
    if (isCorrect) {
      setQuizCorrectCount((prev) => prev + 1);
    }
    setPhase("quiz-feedback");
  }, [clearTimer, currentQuizIndex]);

  handleQuizAnswerRef.current = handleQuizAnswer;

  const nextQuizQuestion = useCallback(() => {
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex >= QUIZ_QUESTIONS.length) {
      // Calculate final score
      const quizScore = Math.round(
        (quizCorrectCount + (selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctIndex ? 0 : 0)) * POINTS_PER_QUIZ
      );
      // The quizCorrectCount already includes the current answer via the state update
      // We need to recalculate properly
      const allAnswers = [...quizAnswers, selectedAnswer];
      let finalQuizCorrect = 0;
      allAnswers.forEach((ans, i) => {
        if (ans === QUIZ_QUESTIONS[i].correctIndex) finalQuizCorrect++;
      });
      const finalQuizScore = Math.round(finalQuizCorrect * POINTS_PER_QUIZ);
      const final = orderingScore + finalQuizScore;
      setTotalScore(Math.min(100, final));
      setPhase("final");
    } else {
      setCurrentQuizIndex(nextIndex);
      setSelectedAnswer(null);
      setPhase("quiz");
      startTimer(QUIZ_TIME, () => {
        handleQuizAnswerRef.current?.(null);
      });
    }
  }, [currentQuizIndex, quizCorrectCount, selectedAnswer, quizAnswers, orderingScore, startTimer]);

  const handleShare = useCallback(async () => {
    const url = "https://onlineboatereducation.com/games/fueling-safety";
    const text = `I scored ${totalScore}/100 on the Fueling Safety game! Can you beat my score?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Fueling Safety Game", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast({ title: "Copied to clipboard!", description: "Share your score with friends." });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast({ title: "Copied to clipboard!", description: "Share your score with friends." });
      } catch {
        toast({ title: "Share this link", description: url });
      }
    }
  }, [totalScore, toast]);

  const timerPercent = phase === "ordering"
    ? (timeLeft / ORDERING_TIME) * 100
    : phase === "quiz"
      ? (timeLeft / QUIZ_TIME) * 100
      : 100;

  const timerColor = timeLeft <= 5 ? "bg-red-500" : timeLeft <= 15 ? "bg-yellow-500" : "bg-emerald-500";

  const availableSteps = shuffledSteps.filter((s) => !selectedOrder.includes(s));

  // --- RENDER ---

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {!isEmbedded && (
            <Link href="/games">
              <span className="text-sm text-gray-400 hover:text-white transition cursor-pointer mb-6 inline-flex items-center gap-1">
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Games
              </span>
            </Link>
          )}

          <div className="text-center mt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-lg shadow-orange-500/20">
              <Fuel className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Fueling Safety
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Can you put the boat fueling steps in the correct order?
            </p>
          </div>

          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-white mb-4 text-lg">How It Works</h2>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex gap-3">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 shrink-0">Round 1</Badge>
                  <span>Put 14 fueling steps in the correct order. You have <strong className="text-white">90 seconds</strong>. Tap each step in the order you think is right.</span>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 shrink-0">Rounds 2-5</Badge>
                  <span>4 quick-fire multiple choice questions. <strong className="text-white">12 seconds</strong> each.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 border-gray-700 mb-8">
            <CardContent className="p-6">
              <h2 className="font-semibold text-white mb-3 text-lg">Scoring</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <p className="text-gray-500 mb-1">Ordering Round</p>
                  <p className="text-white font-medium">~5 pts per correct step (70 pts)</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Quiz Rounds</p>
                  <p className="text-white font-medium">7.5 pts each (30 pts)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-6 text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30"
          >
            Start Game <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "ordering") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Round 1 of 5</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-mono font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full ${timerColor} rounded-full transition-all duration-1000 ease-linear`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          <h2 className="text-xl font-bold mb-2">Put These Fueling Steps in Order</h2>
          <p className="text-gray-400 text-sm mb-4">
            Tap each step in the correct order. {selectedOrder.length}/{FUELING_STEPS.length} selected.
          </p>

          {/* Selected steps */}
          {selectedOrder.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 font-medium">Your Order:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undoLastStep}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-3"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Undo
                </Button>
              </div>
              <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1">
                {selectedOrder.map((step, i) => (
                  <div
                    key={`selected-${i}`}
                    className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-blue-200">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available steps */}
          {availableSteps.length > 0 && (
            <div className="mb-4">
              <span className="text-sm text-gray-400 font-medium mb-2 block">Available Steps:</span>
              <div className="space-y-1.5">
                {availableSteps.map((step) => (
                  <button
                    key={step}
                    onClick={() => selectStep(step)}
                    className="w-full flex items-center gap-3 bg-gray-800/60 border border-gray-700 hover:border-orange-500/50 hover:bg-gray-800 rounded-lg px-3 py-2.5 text-sm text-left transition-all group"
                  >
                    <GripVertical className="w-4 h-4 text-gray-600 group-hover:text-orange-400 shrink-0 transition-colors" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">{step}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          {selectedOrder.length === FUELING_STEPS.length && (
            <Button
              onClick={submitOrdering}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-5 text-lg rounded-xl mt-2 shadow-lg shadow-orange-500/20"
            >
              Submit Order <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "ordering-results") {
    const correctCount = orderingCorrect.filter(Boolean).length;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Ordering Results</h2>
            <p className="text-gray-400">
              You got <span className="text-white font-bold">{correctCount}</span> out of <span className="text-white font-bold">{FUELING_STEPS.length}</span> steps in the correct position
            </p>
            <p className="text-orange-400 font-semibold mt-1">+{orderingScore} points</p>
          </div>

          <div className="space-y-1.5 mb-6 max-h-[60vh] overflow-y-auto pr-1">
            {FUELING_STEPS.map((correctStep, i) => {
              const playerStep = selectedOrder[i];
              const isCorrect = orderingCorrect[i];
              const isMissing = playerStep === "__missing__";

              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm border ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isCorrect ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-200">{correctStep}</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-red-300 line-through">
                            {isMissing ? "(not selected)" : playerStep}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-6">
                          <span className="text-emerald-400 text-xs">Correct:</span>
                          <span className="text-gray-300 text-xs">{correctStep}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            onClick={proceedToQuiz}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-5 text-lg rounded-xl shadow-lg shadow-blue-500/20"
          >
            Continue to Quiz Rounds <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const question = QUIZ_QUESTIONS[currentQuizIndex];
    const roundNumber = currentQuizIndex + 2;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Round {roundNumber} of 5
            </Badge>
            <span className={`text-lg font-mono font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Timer bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-8 overflow-hidden">
            <div
              className={`h-full ${timerColor} rounded-full transition-all duration-1000 ease-linear`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          {/* Question */}
          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Fuel className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                <h2 className="text-lg font-semibold text-white leading-relaxed">
                  {question.question}
                </h2>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={i}
                  onClick={() => handleQuizAnswer(i)}
                  className="w-full flex items-center gap-4 bg-gray-800/60 border border-gray-700 hover:border-orange-500/50 hover:bg-gray-800 rounded-xl px-5 py-4 text-left transition-all group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-700 group-hover:bg-orange-500/20 text-gray-400 group-hover:text-orange-400 font-bold text-sm flex items-center justify-center shrink-0 transition-colors">
                    {letter}
                  </span>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "quiz-feedback") {
    const question = QUIZ_QUESTIONS[currentQuizIndex];
    const isCorrect = selectedAnswer === question.correctIndex;
    const isTimeout = selectedAnswer === null;
    const roundNumber = currentQuizIndex + 2;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Round {roundNumber} of 5
            </Badge>
            {isCorrect ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                +{Math.round(POINTS_PER_QUIZ)} pts
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                +0 pts
              </Badge>
            )}
          </div>

          {/* Result banner */}
          <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
            isCorrect ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 shrink-0" />
            )}
            <span className={`font-semibold ${isCorrect ? "text-emerald-300" : "text-red-300"}`}>
              {isCorrect ? "Correct!" : isTimeout ? "Time's up!" : "Incorrect"}
            </span>
          </div>

          {/* Question */}
          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white leading-relaxed mb-1">
                {question.question}
              </h2>
            </CardContent>
          </Card>

          {/* Options with results */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const isCorrectAnswer = i === question.correctIndex;
              const wasSelected = i === selectedAnswer;

              let borderColor = "border-gray-700";
              let bgColor = "bg-gray-800/40";
              let textColor = "text-gray-500";
              let badgeEl = null;

              if (isCorrectAnswer) {
                borderColor = "border-emerald-500/50";
                bgColor = "bg-emerald-500/10";
                textColor = "text-emerald-200";
                badgeEl = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
              } else if (wasSelected && !isCorrectAnswer) {
                borderColor = "border-red-500/50";
                bgColor = "bg-red-500/10";
                textColor = "text-red-300";
                badgeEl = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
              }

              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 ${bgColor} border ${borderColor} rounded-xl px-5 py-4`}
                >
                  <span className={`w-8 h-8 rounded-lg ${isCorrectAnswer ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-700 text-gray-500"} font-bold text-sm flex items-center justify-center shrink-0`}>
                    {letter}
                  </span>
                  <span className={`flex-1 ${textColor}`}>{option}</span>
                  {badgeEl}
                </div>
              );
            })}
          </div>

          <Button
            onClick={nextQuizQuestion}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-5 text-lg rounded-xl shadow-lg shadow-blue-500/20"
          >
            {currentQuizIndex < QUIZ_QUESTIONS.length - 1 ? (
              <>Next Question <ArrowRight className="ml-2 w-5 h-5" /></>
            ) : (
              <>See Final Results <Trophy className="ml-2 w-5 h-5" /></>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    const grade = getGrade(totalScore);
    const correctOrderCount = orderingCorrect.filter(Boolean).length;
    const allQuizAnswers = quizAnswers;
    let quizCorrectFinal = 0;
    allQuizAnswers.forEach((ans, i) => {
      if (ans === QUIZ_QUESTIONS[i]?.correctIndex) quizCorrectFinal++;
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-lg shadow-orange-500/20">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Game Complete!</h1>
            <p className="text-gray-400">Here's how you did on fueling safety</p>
          </div>

          {/* Score card */}
          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="p-8 text-center">
              <div className={`text-7xl font-bold mb-2 ${grade.color}`}>
                {totalScore}
              </div>
              <p className="text-gray-400 text-lg mb-4">out of 100</p>
              <div className={`text-5xl font-bold ${grade.color}`}>
                {grade.letter}
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card className="bg-gray-800/60 border-gray-700 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Step Ordering</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">{correctOrderCount}/14 correct</span>
                    <span className="text-gray-500 text-sm ml-2">(+{orderingScore} pts)</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-700" />
                {QUIZ_QUESTIONS.map((q, i) => {
                  const wasCorrect = allQuizAnswers[i] === q.correctIndex;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {wasCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-gray-300 text-sm truncate max-w-[250px]">
                          Q{i + 1}: {q.question.slice(0, 45)}...
                        </span>
                      </div>
                      <span className={`font-semibold text-sm ${wasCorrect ? "text-emerald-400" : "text-red-400"}`}>
                        {wasCorrect ? `+${Math.round(POINTS_PER_QUIZ)}` : "+0"} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-5 text-lg rounded-xl shadow-lg shadow-orange-500/20"
            >
              <RotateCcw className="mr-2 w-5 h-5" /> Play Again
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full border-gray-700 bg-gray-800/60 hover:bg-gray-800 text-white py-5 text-lg rounded-xl"
            >
              <Share2 className="mr-2 w-5 h-5" /> Share Your Score
            </Button>
            {!isEmbedded && (
              <Link href="/games">
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-800 py-5 text-lg rounded-xl"
                >
                  <ChevronRight className="mr-2 w-4 h-4 rotate-180" /> Back to Games
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
