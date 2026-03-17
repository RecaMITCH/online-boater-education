import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo";
import { Breadcrumbs, breadcrumbSchema } from "@/components/breadcrumbs";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Calendar,
  Globe,
  ExternalLink,
  AlertTriangle,
  Code,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import type { State } from "@shared/schema";

type Step = "state" | "age" | "result";

interface QuizState {
  selectedState: State | null;
  birthYear: number | null;
  age: number | null;
}

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Do I Need a Boating License?" },
];

const BASE_URL = "https://onlineboatereducation.com";

function getResult(state: State, age: number) {
  const minAge = state.minimumAge;
  const onlineOnlyAge = state.minimumAgeOnlineOnly;
  const fieldDayRequired = state.fieldDayRequired;
  const tooYoung = minAge !== null && minAge !== undefined && age < minAge;

  let canDoOnlineOnly = false;
  let needsFieldDay = false;
  let resultHeading = "";
  let resultDescription = "";
  let resultIcon: "success" | "partial" | "warning" = "success";

  if (tooYoung) {
    resultIcon = "warning";
    resultHeading = `Too young to certify in ${state.name}`;
    resultDescription = `${state.name} requires students to be at least ${minAge} years old to take the boater education course. However, younger boaters may still operate a vessel when accompanied by a certified adult. Check your state's supervision rules for details.`;
  } else if (fieldDayRequired) {
    needsFieldDay = true;
    resultIcon = "partial";
    resultHeading = "Yes — online course + on-water assessment";
    resultDescription = `${state.name} requires all students to complete an online course and attend a mandatory on-water practical assessment. The online course alone does not certify you. You'll need to schedule and attend an assessment after finishing the online portion.`;
  } else if (onlineOnlyAge && age < onlineOnlyAge) {
    needsFieldDay = true;
    resultIcon = "partial";
    resultHeading = "Yes — online course + on-water assessment";
    resultDescription = `In ${state.name}, students under ${onlineOnlyAge} must complete the online course and attend an on-water practical assessment. Once you turn ${onlineOnlyAge}, you'll be eligible for the online-only option.`;
  } else {
    canDoOnlineOnly = true;
    resultIcon = "success";
    resultHeading = "Yes — and you can do it 100% online";
    resultDescription = `Great news! In ${state.name}, ${onlineOnlyAge ? `boaters ${onlineOnlyAge} and older` : "boaters"} can complete boater education entirely online — no on-water assessment, no classroom, no scheduling. Finish from home at your own pace.`;
  }

  return { tooYoung, canDoOnlineOnly, needsFieldDay, resultHeading, resultDescription, resultIcon };
}

function parseQueryParams(): { state?: string; age?: number } {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state") || undefined;
  const ageStr = params.get("age");
  const age = ageStr ? parseInt(ageStr) : undefined;
  return { state, age: age && age >= 1 && age <= 120 ? age : undefined };
}

function buildShareUrl(stateSlug: string, age: number) {
  return `${BASE_URL}/quiz?state=${encodeURIComponent(stateSlug)}&age=${age}`;
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need a boating license?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most U.S. states require boater education for anyone operating a motorized vessel. While many people call it a \"boating license,\" it's technically a boater education card or certificate. Requirements vary by state and age — some states let you complete it entirely online, while others require an on-water assessment. Use our free quiz tool to find out exactly what you need."
      }
    },
    {
      "@type": "Question",
      "name": "Can I complete boater education online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many states allow boaters to complete boater education 100% online with no in-person component. States like Texas, Florida, Alabama, Georgia, and Tennessee offer fully online certification for adults. Some states require an on-water assessment in addition to the online course, especially for younger students."
      }
    },
    {
      "@type": "Question",
      "name": "What is NASBLA reciprocity for boater education?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The National Association of State Boating Law Administrators (NASBLA) ensures that a boater education certificate earned in any U.S. state is recognized in most other states. This means you can earn your certificate in a state that offers online-only completion and use it to boat in your home state, even if your state normally requires an on-water assessment."
      }
    },
    {
      "@type": "Question",
      "name": "How old do you have to be to take boater education?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Minimum age requirements vary by state, typically ranging from no minimum to age 16. Most states allow students as young as 10 or 12 to take the course. Younger boaters can typically still operate a vessel when accompanied by a certified adult. Online-only completion usually requires the student to be at least 16 or 18, depending on the state."
      }
    },
    {
      "@type": "Question",
      "name": "Is boater education free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Course costs vary by state and provider, typically ranging from $20 to $50. Some states offer free courses through their wildlife or natural resources agency. Commercial online providers generally charge between $25 and $50."
      }
    }
  ]
};

export default function Quiz() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();

  const { data: states = [] } = useQuery<State[]>({
    queryKey: ["/api/states"],
  });

  const queryParams = useMemo(() => parseQueryParams(), []);

  const [step, setStep] = useState<Step>("state");
  const [quiz, setQuiz] = useState<QuizState>({
    selectedState: null,
    birthYear: null,
    age: null,
  });
  const [stateSearch, setStateSearch] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Deep-link: if URL has ?state=texas&age=25, jump to result
  useEffect(() => {
    if (initialized || states.length === 0) return;
    const { state: stateParam, age: ageParam } = queryParams;
    if (stateParam) {
      const match = states.find(
        (s) => s.isActive && (s.slug === stateParam || s.abbreviation.toLowerCase() === stateParam.toLowerCase())
      );
      if (match) {
        if (ageParam) {
          setQuiz({ selectedState: match, birthYear: null, age: ageParam });
          setStep("result");
        } else {
          setQuiz({ selectedState: match, birthYear: null, age: null });
          setStep("age");
        }
      }
    }
    setInitialized(true);
  }, [states, queryParams, initialized]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const filteredStates = states
    .filter((s) => s.isActive)
    .filter((s) =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      s.abbreviation.toLowerCase().includes(stateSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  function selectState(state: State) {
    setQuiz({ ...quiz, selectedState: state });
    setStep("age");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitAge(age: number) {
    const state = quiz.selectedState!;
    setQuiz({ ...quiz, age });
    setStep("result");
    window.history.replaceState({}, "", `/quiz?state=${state.slug}&age=${age}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setQuiz({ selectedState: null, birthYear: null, age: null });
    setStep("state");
    setStateSearch("");
    window.history.replaceState({}, "", "/quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (step === "age") {
      setStep("state");
      window.history.replaceState({}, "", "/quiz");
    } else if (step === "result") {
      setStep("age");
      if (quiz.selectedState) {
        window.history.replaceState({}, "", `/quiz?state=${quiz.selectedState.slug}`);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const seoTitle = quiz.selectedState && quiz.age !== null && step === "result"
    ? `Do I Need a Boating License in ${quiz.selectedState.name}? — Result`
    : "Do I Need a Boating License? Free Quiz Tool";

  const seoDescription = quiz.selectedState && quiz.age !== null && step === "result"
    ? `Boater education requirements for a ${quiz.age}-year-old in ${quiz.selectedState.name}. Find out if you can complete it online, what it costs, and how to get started.`
    : "Answer 2 quick questions to find out if you need boater education, what course format to take, and whether you can complete it online in your state.";

  const seoCanonical = `${BASE_URL}/quiz`;

  return (
    <div className="min-h-screen">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={seoCanonical}
        structuredData={[
          breadcrumbSchema(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Do I Need a Boating License? Quiz",
            "url": `${BASE_URL}/quiz`,
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All",
            "description": "Free interactive tool to determine if you need boater education and find the best course option for your state and age.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          },
          faqSchema,
        ]}
      />

      {/* Header */}
      <section className="bg-card border-b py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-4">
            <Breadcrumbs items={crumbs} />
          </div>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">
            Do I Need a Boating License?
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Answer 2 quick questions and we'll tell you exactly what you need — your course format, whether you can do it online, and how to get started.
          </p>

          {/* Progress */}
          <div className="mt-6 flex items-center gap-2">
            <StepIndicator number={1} label="State" active={step === "state"} done={step !== "state"} />
            <div className={`h-0.5 flex-1 ${step !== "state" ? "bg-primary" : "bg-border"}`} />
            <StepIndicator number={2} label="Age" active={step === "age"} done={step === "result"} />
            <div className={`h-0.5 flex-1 ${step === "result" ? "bg-primary" : "bg-border"}`} />
            <StepIndicator number={3} label="Result" active={step === "result"} done={false} />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {step === "state" && (
            <StateStep
              states={filteredStates}
              search={stateSearch}
              onSearchChange={setStateSearch}
              onSelect={selectState}
            />
          )}

          {step === "age" && quiz.selectedState && (
            <AgeStep
              state={quiz.selectedState}
              onSubmit={submitAge}
              onBack={goBack}
            />
          )}

          {step === "result" && quiz.selectedState && quiz.age !== null && (
            <ResultStep
              state={quiz.selectedState}
              age={quiz.age}
              onReset={reset}
              onBack={goBack}
            />
          )}
        </div>
      </section>

      {/* Embed CTA */}
      {step === "state" && (
        <section className="border-t bg-muted/30 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <EmbedSection />
          </div>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
        done ? "bg-primary text-primary-foreground" :
        active ? "bg-primary text-primary-foreground" :
        "bg-muted text-muted-foreground"
      }`}>
        {done ? <CheckCircle className="h-4 w-4" /> : number}
      </div>
      <span className={`text-sm hidden sm:inline ${active ? "font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function StateStep({ states, search, onSearchChange, onSelect }: {
  states: State[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (s: State) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Where will you be boating?</h2>
      <p className="text-muted-foreground mb-4">Select the state where you plan to boat. Requirements vary by state.</p>

      <input
        type="text"
        placeholder="Search states..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
        autoFocus
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => onSelect(state)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
          >
            <Badge variant="outline" className="shrink-0 text-xs">{state.abbreviation}</Badge>
            <span className="text-sm font-medium truncate">{state.name}</span>
          </button>
        ))}
      </div>

      {states.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No states match your search.</p>
      )}
    </div>
  );
}

function AgeStep({ state, onSubmit, onBack }: {
  state: State;
  onSubmit: (age: number) => void;
  onBack: () => void;
}) {
  const [ageInput, setAgeInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const age = parseInt(ageInput);
    if (age >= 1 && age <= 120) {
      onSubmit(age);
    }
  }

  const agePresets = [
    { label: "Under 10", value: 8 },
    { label: "10-12", value: 11 },
    { label: "13-16", value: 15 },
    { label: "17", value: 17 },
    { label: "18-25", value: 21 },
    { label: "26+", value: 30 },
  ];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to state selection
      </button>

      <h2 className="text-xl font-semibold mb-1">
        How old is the boater?
      </h2>
      <p className="text-muted-foreground mb-6">
        We're checking requirements for <span className="font-medium text-foreground">{state.name}</span>. Age determines which course format is available.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {agePresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSubmit(preset.value)}
            className="px-3 py-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-center"
          >
            <span className="text-sm font-medium">{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or enter exact age</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="number"
          min="1"
          max="120"
          placeholder="Enter age"
          value={ageInput}
          onChange={(e) => setAgeInput(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button type="submit" disabled={!ageInput || parseInt(ageInput) < 1}>
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function ResultStep({ state, age, onReset, onBack }: {
  state: State;
  age: number;
  onReset: () => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<"share" | "embed" | null>(null);
  const { tooYoung, canDoOnlineOnly, needsFieldDay, resultHeading, resultDescription, resultIcon } = getResult(state, age);

  const shareUrl = buildShareUrl(state.slug, age);
  const embedCode = `<iframe src="${BASE_URL}/embed/quiz?state=${state.slug}&age=${age}" width="100%" height="700" style="border:none;border-radius:8px;" title="Boater Education Requirements — ${state.name}"></iframe>`;

  function copyToClipboard(text: string, type: "share" | "embed") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Change age
      </button>

      {/* Result Card */}
      <Card className={`border-2 ${
        resultIcon === "success" ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" :
        resultIcon === "partial" ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20" :
        "border-red-500/30 bg-red-50/50 dark:bg-red-950/20"
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            {resultIcon === "success" && <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 shrink-0" />}
            {resultIcon === "partial" && <Calendar className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />}
            {resultIcon === "warning" && <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />}
            <div>
              <h2 className="text-xl font-semibold">{resultHeading}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{resultDescription}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Your Details</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">State</span>
              <span className="font-medium">{state.name}</span>
              <span className="text-muted-foreground">Boater age</span>
              <span className="font-medium">{age} years old</span>
              <span className="text-muted-foreground">Approving agency</span>
              <span className="font-medium">{state.agencyAbbreviation || state.agencyName}</span>
              {state.coursePrice && (
                <>
                  <span className="text-muted-foreground">Estimated cost</span>
                  <span className="font-medium">{state.coursePrice}</span>
                </>
              )}
              <span className="text-muted-foreground">Course format</span>
              <span className="font-medium">
                {tooYoung ? "Not eligible yet" :
                 canDoOnlineOnly ? "Online only (no on-water assessment)" :
                 "Online + on-water assessment"}
              </span>
              <span className="text-muted-foreground">Certificate validity</span>
              <span className="font-medium">Lifetime — never expires</span>
            </div>
          </CardContent>
        </Card>

        {/* NASBLA Reciprocity note */}
        {!tooYoung && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">Your certificate works nationwide</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A NASBLA-approved certificate earned in {state.name} is accepted in most U.S. states through reciprocity. You only need to certify once — it's valid for life.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Field day alternative tip */}
        {needsFieldDay && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">Want to skip the on-water assessment?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Some states allow fully online completion for your age — and their certificates work in {state.name} through NASBLA reciprocity.{" "}
                    <Link href="/blog/10-states-complete-boater-education-online" className="text-primary hover:underline">
                      See which states offer 100% online certification
                    </Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share & Embed buttons */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Share this result</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => copyToClipboard(shareUrl, "share")}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors text-sm"
              >
                {copied === "share" ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                {copied === "share" ? "Link copied!" : "Copy share link"}
              </button>
              <button
                onClick={() => copyToClipboard(embedCode, "embed")}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors text-sm"
              >
                {copied === "embed" ? <Check className="h-4 w-4 text-green-600" /> : <Code className="h-4 w-4" />}
                {copied === "embed" ? "Embed code copied!" : "Copy embed code"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Embed this tool on your website — it's free. The embed code adds an interactive boater education quiz to any page.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        {!tooYoung && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/states/${state.slug}`} className="flex-1">
              <Button size="lg" className="w-full">
                View {state.name} Course Options
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {state.courseUrl && (
              <a href={state.courseUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  Find a Course
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Start over */}
        <div className="text-center pt-2">
          <button onClick={onReset} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Start over with a different state
          </button>
        </div>
      </div>
    </div>
  );
}

function EmbedSection() {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="${BASE_URL}/embed/quiz" width="100%" height="700" style="border:none;border-radius:8px;" title="Do I Need a Boating License? Quiz"></iframe>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <Code className="h-6 w-6 text-primary mt-1 shrink-0" />
        <div>
          <h2 className="text-lg font-semibold">Add this tool to your website</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Embed this free boater education quiz on your blog, marina website, or boating forum. Copy the code below and paste it into any HTML page.
          </p>
        </div>
      </div>
      <div className="mt-4 relative">
        <pre className="bg-background border rounded-lg p-4 text-xs overflow-x-auto font-mono text-muted-foreground">
          {embedCode}
        </pre>
        <button
          onClick={copyEmbed}
          className="absolute top-2 right-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Free to use. The embed links back to OnlineBoaterEducation.com for full state details.
      </p>
    </div>
  );
}
