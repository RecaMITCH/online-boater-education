import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Calendar,
  Globe,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import type { State } from "@shared/schema";

const BASE_URL = "https://onlineboatereducation.com";

function parseQueryParams(): { state?: string; age?: number } {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state") || undefined;
  const ageStr = params.get("age");
  const age = ageStr ? parseInt(ageStr) : undefined;
  return { state, age: age && age >= 1 && age <= 120 ? age : undefined };
}

export default function QuizEmbed() {
  const { data: states = [] } = useQuery<State[]>({
    queryKey: ["/api/states"],
  });

  const queryParams = useMemo(() => parseQueryParams(), []);

  type Step = "state" | "age" | "result";
  const [step, setStep] = useState<Step>("state");
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [stateSearch, setStateSearch] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || states.length === 0) return;
    const { state: stateParam, age: ageParam } = queryParams;
    if (stateParam) {
      const match = states.find(
        (s) => s.isActive && (s.slug === stateParam || s.abbreviation.toLowerCase() === stateParam.toLowerCase())
      );
      if (match) {
        setSelectedState(match);
        if (ageParam) {
          setAge(ageParam);
          setStep("result");
        } else {
          setStep("age");
        }
      }
    }
    setInitialized(true);
  }, [states, queryParams, initialized]);

  const filteredStates = states
    .filter((s) => s.isActive)
    .filter((s) =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      s.abbreviation.toLowerCase().includes(stateSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  function selectState(state: State) {
    setSelectedState(state);
    setStep("age");
  }

  function submitAge(a: number) {
    setAge(a);
    setStep("result");
  }

  function reset() {
    setSelectedState(null);
    setAge(null);
    setStep("state");
    setStateSearch("");
  }

  function goBack() {
    if (step === "age") setStep("state");
    else if (step === "result") setStep("age");
  }

  return (
    <div className="font-sans p-4 sm:p-6 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mb-4 pb-3 border-b flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Do I Need a Boating License?</h1>
        <a
          href={`${BASE_URL}/quiz`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          OnlineBoaterEducation.com
        </a>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <StepDot number={1} label="State" active={step === "state"} done={step !== "state"} />
        <div className={`h-0.5 flex-1 ${step !== "state" ? "bg-blue-500" : "bg-gray-200"}`} />
        <StepDot number={2} label="Age" active={step === "age"} done={step === "result"} />
        <div className={`h-0.5 flex-1 ${step === "result" ? "bg-blue-500" : "bg-gray-200"}`} />
        <StepDot number={3} label="Result" active={step === "result"} done={false} />
      </div>

      {step === "state" && (
        <div>
          <p className="text-sm text-gray-600 mb-3">Select the state where you plan to boat:</p>
          <input
            type="text"
            placeholder="Search states..."
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            autoFocus
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[400px] overflow-y-auto">
            {filteredStates.map((state) => (
              <button
                key={state.id}
                onClick={() => selectState(state)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-md border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left text-sm"
              >
                <span className="text-xs text-gray-400 font-mono">{state.abbreviation}</span>
                <span className="font-medium text-gray-800 truncate">{state.name}</span>
              </button>
            ))}
          </div>
          {filteredStates.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">No states match your search.</p>
          )}
        </div>
      )}

      {step === "age" && selectedState && (
        <div>
          <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
          <p className="text-sm text-gray-600 mb-1">
            How old is the boater? <span className="font-medium text-gray-800">({selectedState.name})</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-3">
            {[
              { label: "Under 10", value: 8 },
              { label: "10-12", value: 11 },
              { label: "13-16", value: 15 },
              { label: "17", value: 17 },
              { label: "18-25", value: 21 },
              { label: "26+", value: 30 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => submitAge(p.value)}
                className="px-2 py-2.5 rounded-md border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center text-sm font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "result" && selectedState && age !== null && (
        <EmbedResult state={selectedState} age={age} onReset={reset} onBack={goBack} />
      )}

      <div className="mt-6 pt-3 border-t text-center">
        <a
          href={`${BASE_URL}/quiz`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          Powered by OnlineBoaterEducation.com
        </a>
      </div>
    </div>
  );
}

function StepDot({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
        done ? "bg-blue-500 text-white" :
        active ? "bg-blue-500 text-white" :
        "bg-gray-200 text-gray-500"
      }`}>
        {done ? <CheckCircle className="h-3.5 w-3.5" /> : number}
      </div>
      <span className={`text-xs hidden sm:inline ${active ? "font-medium text-gray-800" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

function EmbedResult({ state, age, onReset, onBack }: {
  state: State;
  age: number;
  onReset: () => void;
  onBack: () => void;
}) {
  const minAge = state.minimumAge;
  const onlineOnlyAge = state.minimumAgeOnlineOnly;
  const fieldDayRequired = state.fieldDayRequired;
  const tooYoung = minAge !== null && minAge !== undefined && age < minAge;

  let canDoOnlineOnly = false;
  let heading = "";
  let description = "";
  let type: "success" | "partial" | "warning" = "success";

  if (tooYoung) {
    type = "warning";
    heading = `Too young to certify in ${state.name}`;
    description = `${state.name} requires boaters to be at least ${minAge} years old. Younger boaters may still operate a vessel when accompanied by a certified adult.`;
  } else if (fieldDayRequired) {
    type = "partial";
    heading = "Yes — online course + on-water assessment";
    description = `${state.name} requires an online course and a mandatory on-water practical assessment.`;
  } else if (onlineOnlyAge && age < onlineOnlyAge) {
    type = "partial";
    heading = "Yes — online course + on-water assessment";
    description = `In ${state.name}, boaters under ${onlineOnlyAge} must attend an on-water assessment after the online course.`;
  } else {
    canDoOnlineOnly = true;
    type = "success";
    heading = "Yes — 100% online";
    description = `In ${state.name}, ${onlineOnlyAge ? `boaters ${onlineOnlyAge}+` : "boaters"} can complete boater education entirely online.`;
  }

  const colors = {
    success: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
    partial: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600" },
    warning: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" },
  };
  const c = colors[type];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3">
        <ArrowLeft className="h-3 w-3" /> Back
      </button>

      <div className={`rounded-lg border-2 p-4 ${c.bg} ${c.border}`}>
        <div className="flex items-start gap-2">
          {type === "success" && <CheckCircle className={`h-5 w-5 ${c.icon} mt-0.5 shrink-0`} />}
          {type === "partial" && <Calendar className={`h-5 w-5 ${c.icon} mt-0.5 shrink-0`} />}
          {type === "warning" && <AlertTriangle className={`h-5 w-5 ${c.icon} mt-0.5 shrink-0`} />}
          <div>
            <h2 className="font-semibold text-gray-900">{heading}</h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
          <span className="text-gray-500">State</span>
          <span className="font-medium text-gray-800">{state.name}</span>
          <span className="text-gray-500">Age</span>
          <span className="font-medium text-gray-800">{age}</span>
          <span className="text-gray-500">Agency</span>
          <span className="font-medium text-gray-800">{state.agencyAbbreviation || state.agencyName}</span>
          {state.coursePrice && (
            <>
              <span className="text-gray-500">Cost</span>
              <span className="font-medium text-gray-800">{state.coursePrice}</span>
            </>
          )}
          <span className="text-gray-500">Format</span>
          <span className="font-medium text-gray-800">
            {tooYoung ? "Not eligible" : canDoOnlineOnly ? "Online only" : "Online + on-water assessment"}
          </span>
        </div>
      </div>

      {!tooYoung && (
        <div className="mt-3 rounded-lg border border-gray-200 p-3 flex items-start gap-2">
          <Globe className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600">
            NASBLA-approved certificates are accepted in most U.S. states. Your {state.name} certificate works nationwide.
          </p>
        </div>
      )}

      {!tooYoung && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <a
            href={`${BASE_URL}/states/${state.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View {state.name} Courses
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <div className="mt-4 text-center">
        <button onClick={onReset} className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Try a different state
        </button>
      </div>
    </div>
  );
}
