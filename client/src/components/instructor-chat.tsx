import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Anchor,
  MapPin,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import type { State } from "@shared/schema";

type ChatStep =
  | "greeting"
  | "ask_residence"
  | "ask_boating_state"
  | "show_results"
  | "show_single_state";

interface Message {
  id: number;
  role: "instructor" | "user";
  content: string;
  options?: { label: string; value: string }[];
  stateResult?: State;
  resources?: Array<{id: number; title: string; url: string; description: string | null; resourceType: string}>;
}

interface InstructorChatProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstructorChat({ isOpen, onOpenChange }: InstructorChatProps) {
  const [step, setStep] = useState<ChatStep>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [residenceState, setResidenceState] = useState<State | null>(null);
  const msgIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTargetIdRef = useRef<number | null>(null);
  const hasScrolledThisTurnRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: states } = useQuery<State[]>({
    queryKey: ["/api/states"],
  });

  const nextId = () => {
    msgIdRef.current += 1;
    return msgIdRef.current;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const addMessages = useCallback((...msgs: Omit<Message, "id">[]) => {
    const newMsgs = msgs.map((m) => ({ ...m, id: nextId() }));
    // Only scroll to the first INSTRUCTOR message of this turn — skip user messages
    // This ensures we scroll to the start of the captain's response, not the user's bubble
    if (!hasScrolledThisTurnRef.current && scrollTargetIdRef.current === null) {
      const firstInstructor = newMsgs.find((m) => m.role === "instructor");
      if (firstInstructor) {
        scrollTargetIdRef.current = firstInstructor.id;
      }
    }
    setMessages((prev) => [...prev, ...newMsgs]);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollTargetIdRef.current !== null) {
      const targetId = scrollTargetIdRef.current;
      scrollTargetIdRef.current = null;
      hasScrolledThisTurnRef.current = true;
      // Use a short delay to let the DOM render the new messages
      setTimeout(() => {
        const targetEl = document.querySelector(`[data-msg-id="${targetId}"]`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  }, [messages]);


  const fetchResources = async (stateId: number): Promise<Array<{id: number; title: string; url: string; description: string | null; resourceType: string}>> => {
    try {
      const res = await fetch(`/api/states/${stateId}/resources`);
      if (res.ok) return await res.json();
    } catch (e) { /* silently fail */ }
    return [];
  };

  const startConversation = () => {
    setResidenceState(null);
    setStep("ask_residence");
    const id = nextId();
    setMessages([{
      id,
      role: "instructor",
      content:
        "Hi there! I'm your digital boating safety captain. I can help you understand what you need to get certified.\n\nFirst, which state do you live in?",
    }]);
    scrollToBottom();
  };

  const commonTwoLetterWords = new Set([
    "in", "or", "me", "oh", "ok", "hi", "al", "an", "as", "at",
    "be", "by", "do", "go", "he", "if", "is", "it", "my", "no",
    "of", "on", "so", "to", "up", "us", "we", "am", "id",
  ]);

  const hasVagueReference = (query: string): boolean => {
    const vaguePatterns = [
      /other\s+(western|eastern|southern|northern|midwest|central)\s+states/i,
      /other\s+states/i,
      /various\s+states/i,
      /multiple\s+states/i,
      /several\s+states/i,
      /a\s+few\s+states/i,
    ];
    return vaguePatterns.some((p) => p.test(query));
  };

  const isUnsureResponse = (query: string): boolean => {
    const q = query.toLowerCase().trim();
    const unsurePatterns = [
      /not sure/i,
      /don'?t know/i,
      /no idea/i,
      /haven'?t decided/i,
      /undecided/i,
      /anywhere/i,
      /wherever/i,
      /doesn'?t matter/i,
      /no preference/i,
      /not decided/i,
      /haven'?t picked/i,
      /still deciding/i,
      /thinking about it/i,
      /not certain/i,
      /idk/i,
      /dunno/i,
      /maybe/i,
      /unsure/i,
      /no particular/i,
      /open to/i,
      /flexible/i,
      /all over/i,
      /different places/i,
      /travel/i,
      /lots of states/i,
    ];
    return unsurePatterns.some((p) => p.test(q));
  };


  const findAllStates = (query: string): State[] => {
    if (!states) return [];
    const original = query.trim();
    const q = original.toLowerCase();
    const found: State[] = [];
    const foundIds = new Set<number>();

    const addState = (s: State) => {
      if (!foundIds.has(s.id)) {
        foundIds.add(s.id);
        found.push(s);
      }
    };

    const exact = states.find(
      (s) =>
        s.name.toLowerCase() === q ||
        s.abbreviation.toLowerCase() === q ||
        s.slug === q
    );
    if (exact) {
      addState(exact);
      return found;
    }

    const sortedByNameLength = [...states].sort(
      (a, b) => b.name.length - a.name.length
    );
    for (const s of sortedByNameLength) {
      const name = s.name.toLowerCase();
      if (name.length > 2 && q.includes(name)) {
        addState(s);
      }
    }

    const originalWords = original.split(/[\s,]+/);
    for (const w of originalWords) {
      const cleaned = w.replace(/[^a-zA-Z]/g, "");
      if (cleaned.length !== 2) continue;

      const isUpperCase = cleaned === cleaned.toUpperCase();
      const isCommonWord = commonTwoLetterWords.has(cleaned.toLowerCase());

      if (isUpperCase || !isCommonWord) {
        const byAbbr = states.find(
          (s) => s.abbreviation.toLowerCase() === cleaned.toLowerCase()
        );
        if (byAbbr) addState(byAbbr);
      }
    }

    return found;
  };

  const findState = (query: string): State | undefined => {
    const all = findAllStates(query);
    return all.length > 0 ? all[0] : undefined;
  };

  const filterStates = (query: string): State[] => {
    if (!states || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return states.filter(
      (s) =>
        s.isActive &&
        (s.name.toLowerCase().includes(q) ||
          q.includes(s.name.toLowerCase()) ||
          s.abbreviation.toLowerCase() === q)
    );
  };

  const buildCertDescription = (state: State): string => {
    const lines: string[] = [];

    if (state.minimumAgeOnlineOnly) {
      lines.push(
        `In ${state.name}, students aged ${state.minimumAgeOnlineOnly} and older can complete their certification entirely online.`
      );
      lines.push(
        `Students under ${state.minimumAgeOnlineOnly} will need to complete the online course plus an on-water practical assessment.`
      );
    } else if (state.fieldDayRequired) {
      lines.push(
        `In ${state.name}, all students need to complete the online course plus an on-water practical assessment to get certified.`
      );
    } else {
      lines.push(
        `Great news! In ${state.name}, you can complete your boater education certification entirely online. No in-person requirement!`
      );
    }

    lines.push(
      `\nYou can also choose to take the course fully in-person if you prefer a classroom setting. Check with ${state.agencyAbbreviation || state.agencyName} for in-person class schedules near you.`
    );

    if (state.minimumAge) {
      lines.push(
        `\nNote: The minimum age to take this course is ${state.minimumAge}.`
      );
    }

    if (state.coursePrice) {
      lines.push(`Course fee: ${state.coursePrice}.`);
    }

    return lines.join("\n");
  };

  const handleSelectState = (state: State, isResidence: boolean) => {
    scrollTargetIdRef.current = null;
    hasScrolledThisTurnRef.current = false;
    addMessages({ role: "user", content: state.name });

    if (isResidence) {
      setResidenceState(state);
      setStep("ask_boating_state");

      setTimeout(() => {
        addMessages({
          role: "instructor",
          content: `Got it, you're in ${state.name}!\n\nAre you planning to boat in ${state.name}, or somewhere else? You can name one or more states.`,
          options: [
            { label: `Boat in ${state.name}`, value: "same" },
            { label: "A different state", value: "different" },
          ],
        });
      }, 400);
    } else {
      const boatingState = state;
      const homeState = residenceState;

      // If boating in the same state as residence, use the same-state flow
      if (homeState && homeState.id === boatingState.id) {
        setStep("show_single_state");
        setTimeout(async () => {
          addMessages(
            {
              role: "instructor",
              content: `Here's what you need to get certified in ${homeState.name}:`,
            },
            {
              role: "instructor",
              content: buildCertDescription(homeState),
              stateResult: homeState,
            },
          );
          const resources = await fetchResources(homeState.id);
          if (resources.length > 0) {
            addMessages({ role: "instructor", content: "Here are some helpful official resources:", resources });
          }
          addMessages({
            role: "instructor",
            content: "Would you like to explore requirements for another state?",
            options: [
              { label: "Yes, another state", value: "another_state" },
              { label: "Start over", value: "restart" },
              { label: "That's all, thanks!", value: "done" },
            ],
          });
        }, 400);
      } else {
        setStep("show_results");
        setTimeout(async () => {
          if (homeState) {
            addMessages(
              {
                role: "instructor",
                content: `Here's what you need to know about boating in ${boatingState.name} while living in ${homeState.name}:`,
              },
              {
                role: "instructor",
                content: `Since NASBLA-approved certificates are recognized across most U.S. states, you have two main options:\n\n**Option 1:** Get certified in your home state (${homeState.name})  -- your NASBLA-approved certificate will typically be honored in the other state.\n\n**Option 2:** Get certified directly through the other state's program.`,
              },
              {
                role: "instructor",
                content: buildCertDescription(homeState),
                stateResult: homeState,
              },
              {
                role: "instructor",
                content: buildCertDescription(boatingState),
                stateResult: boatingState,
              }
            );
            const [homeRes, boatingRes] = await Promise.all([
              fetchResources(homeState.id),
              fetchResources(boatingState.id),
            ]);
            if (homeRes.length > 0) {
              addMessages({ role: "instructor", content: `Official resources for ${homeState.name}:`, resources: homeRes });
            }
            if (boatingRes.length > 0) {
              addMessages({ role: "instructor", content: `Official resources for ${boatingState.name}:`, resources: boatingRes });
            }
            addMessages(
              {
                role: "instructor",
                content: "Either way, your NASBLA-approved certificate is typically valid nationwide. Would you like to explore another state?",
                options: [
                  { label: "Yes, another state", value: "another_state" },
                  { label: "Start over", value: "restart" },
                  { label: "That's all, thanks!", value: "done" },
                ],
              }
            );
          } else {
            // No residence state set, just show boating state info
            addMessages(
              {
                role: "instructor",
                content: `Here are the requirements for ${boatingState.name}:`,
              },
              {
                role: "instructor",
                content: buildCertDescription(boatingState),
                stateResult: boatingState,
              },
            );
            const resources = await fetchResources(boatingState.id);
            if (resources.length > 0) {
              addMessages({ role: "instructor", content: `Official resources for ${boatingState.name}:`, resources });
            }
            addMessages({
              role: "instructor",
              content: "Would you like to explore another state?",
              options: [
                { label: "Yes, another state", value: "another_state" },
                { label: "Start over", value: "restart" },
                { label: "That's all, thanks!", value: "done" },
              ],
            });
          }
        }, 400);
      }
    }
  };

  const handleSameState = () => {
    if (!residenceState) return;
    addMessages({ role: "user", content: `Boat in ${residenceState.name}` });
    setStep("show_single_state");

    setTimeout(async () => {
        addMessages(
          {
            role: "instructor",
            content: `Here's what you need to get certified in ${residenceState.name}:`,
          },
          {
            role: "instructor",
            content: buildCertDescription(residenceState),
            stateResult: residenceState,
          },
        );
        const resources = await fetchResources(residenceState.id);
        if (resources.length > 0) {
          addMessages({ role: "instructor", content: "Here are some helpful official resources:", resources });
        }
        addMessages(
          {
              role: "instructor",
              content: "Would you like to explore requirements for another state?",
              options: [
                { label: "Yes, another state", value: "another_state" },
                { label: "Start over", value: "restart" },
                { label: "That's all, thanks!", value: "done" },
              ],
            }
        );
      }, 400);
  };

  const handleMultipleBoatingStates = (boatingStates: State[], mentionedOtherStates: boolean) => {
    const homeState = residenceState;
    setStep("show_results");

    const otherStates = homeState
      ? boatingStates.filter((s) => s.id !== homeState.id)
      : boatingStates;
    const boatingInHome = homeState
      ? boatingStates.some((s) => s.id === homeState.id)
      : false;

    const stateNames = otherStates.map((s) => s.name);
    const stateListText =
      stateNames.length === 0
        ? ""
        : stateNames.length === 1
          ? stateNames[0]
          : stateNames.length === 2
            ? stateNames.join(" and ")
            : stateNames.slice(0, -1).join(", ") + ", and " + stateNames[stateNames.length - 1];

    const msgs: Omit<Message, "id">[] = [];

    if (homeState) {
      const recContent = [`**My recommendation:** Get certified in your home state (${homeState.name}). Since NASBLA-approved certificates are recognized across most U.S. states, your ${homeState.name} certification will typically be honored in ${stateListText}${boatingInHome ? " as well" : ""}${mentionedOtherStates ? " and any other states you visit" : ""}.`];

      if (otherStates.length > 0) {
        recContent.push(`\nYou could also get certified directly through ${otherStates.length === 1 ? otherStates[0].name + "'s program" : "a program in " + stateListText}. Just be sure to check their laws and any residency restrictions before enrolling.`);
      } else if (mentionedOtherStates) {
        recContent.push(`\nYou could also get certified directly in the state you plan to visit. Just be sure to check their laws and any residency restrictions before enrolling.`);
      }

      msgs.push({
        role: "instructor",
        content: recContent.join(""),
      });

      msgs.push({
        role: "instructor",
        content: `Here's what certification looks like in ${homeState.name} (your home state):`,
      });
      msgs.push({
        role: "instructor",
        content: buildCertDescription(homeState),
        stateResult: homeState,
      });

      for (const hs of otherStates) {
        msgs.push({
          role: "instructor",
          content: `And here are the requirements if you certify directly in ${hs.name}:`,
        });
        msgs.push({
          role: "instructor",
          content: buildCertDescription(hs),
          stateResult: hs,
        });
      }

      if (mentionedOtherStates) {
        msgs.push({
          role: "instructor",
          content: `For the other states you plan to visit, you can look up their specific requirements on our site. Your ${homeState.name} certification should cover you in most cases.`,
        });
      }
    } else {
      for (const hs of boatingStates) {
        msgs.push({
          role: "instructor",
          content: `Here are the requirements for ${hs.name}:`,
        });
        msgs.push({
          role: "instructor",
          content: buildCertDescription(hs),
          stateResult: hs,
        });
      }
    }

    msgs.push({
              role: "instructor",
              content: "Would you like to explore another state?",
              options: [
                { label: "Yes, another state", value: "another_state" },
                { label: "Start over", value: "restart" },
                { label: "That's all, thanks!", value: "done" },
              ],
            });

    setTimeout(async () => {
      addMessages(...msgs);
      const allStates = homeState ? [homeState, ...otherStates] : otherStates;
      for (const s of allStates) {
        const resources = await fetchResources(s.id);
        if (resources.length > 0) {
          addMessages({ role: "instructor", content: `Official resources for ${s.name}:`, resources });
        }
      }
    }, 400);
  };

  const handleDifferentState = () => {
    addMessages({ role: "user", content: "A different state" });
    setStep("ask_boating_state");

    setTimeout(() => {
      addMessages({
        role: "instructor",
        content: "Which state(s) are you planning to boat in? You can name more than one.",
      });
    }, 400);
  };

  const handleOption = (value: string) => {
    if (value === "same") {
      handleSameState();
    } else if (value === "different") {
      handleDifferentState();
    } else if (value === "another_state") {
      addMessages({ role: "user", content: "Yes, another state" });
      setStep("ask_boating_state");
      setTimeout(() => {
        addMessages({
          role: "instructor",
          content: "Sure! Which state are you interested in?",
        });
      }, 400);
    } else if (value === "texas_option") {
      addMessages({ role: "user", content: "Look at Texas too" });
      const texas = states?.find((s) => s.abbreviation === "TX");
      if (texas) {
        setStep("show_results");
        setTimeout(async () => {
          addMessages(
            {
              role: "instructor",
              content: buildCertDescription(texas),
              stateResult: texas,
            }
          );
          const resources = await fetchResources(texas.id);
          if (resources.length > 0) {
            addMessages({ role: "instructor", content: "Official resources for Texas:", resources });
          }
          addMessages({
              role: "instructor",
              content: "Would you like to explore another state?",
              options: [
                { label: "Yes, another state", value: "another_state" },
                { label: "Start over", value: "restart" },
                { label: "That's all, thanks!", value: "done" },
              ],
            });
        }, 400);
      }
    } else if (value === "restart") {
      addMessages({ role: "user", content: "Start over" });
      setTimeout(() => startConversation(), 300);
    } else if (value === "done") {
      addMessages(
        { role: "user", content: "That's all, thanks!" },
        {
          role: "instructor",
          content:
            "Happy to help! Good luck getting your boating safety certificate! See you on the water.",
        }
      );
    }
  };

  const handleSend = () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchQuery("");
    // Reset scroll state so the next instructor response scrolls to its top
    scrollTargetIdRef.current = null;
    hasScrolledThisTurnRef.current = false;

    const vague = hasVagueReference(query);

    if (step === "ask_boating_state") {
      const allFound = findAllStates(query);

      if (allFound.length >= 1 && vague) {
        addMessages({ role: "user", content: query });
        handleMultipleBoatingStates(allFound, true);
        return;
      }
      if (allFound.length > 1) {
        addMessages({ role: "user", content: query });
        handleMultipleBoatingStates(allFound, false);
        return;
      }
      if (allFound.length === 1) {
        handleSelectState(allFound[0], false);
        return;
      }

      if (vague && residenceState) {
        addMessages({ role: "user", content: query });
        handleMultipleBoatingStates([], true);
        return;
      }

      // Handle unsure/vague responses about where to boat
      if (isUnsureResponse(query)) {
        addMessages({ role: "user", content: query });
        setTimeout(async () => {
          if (residenceState) {
            addMessages(
              {
                role: "instructor",
                content: `No worries! If you\'re not sure where you\'ll be boating, **the best approach is to get certified in your home state (${residenceState.name})**. Since NASBLA-approved certificates are recognized across most of the U.S., your ${residenceState.name} certification will typically be honored wherever you decide to boat.\n\nAnother popular option: states like **Texas** allow non-residents to complete their course entirely online, and that certificate is reciprocal with most other states \u2014 including ${residenceState.name}.\n\nEither way, you only need to get certified once!`,
              },
              {
                role: "instructor",
                content: `Here\'s what certification looks like in ${residenceState.name}:`,
              },
              {
                role: "instructor",
                content: buildCertDescription(residenceState),
                stateResult: residenceState,
              }
            );
            const resources = await fetchResources(residenceState.id);
            if (resources.length > 0) {
              addMessages({ role: "instructor", content: `Official resources for ${residenceState.name}:`, resources });
            }
            addMessages({
              role: "instructor",
              content: "Would you like to look at another state\'s requirements, or is that helpful?",
              options: [
                { label: "Look at Texas too", value: "texas_option" },
                { label: "Start over", value: "restart" },
                { label: "That\'s all, thanks!", value: "done" },
              ],
            });
          } else {
            addMessages({
              role: "instructor",
              content: "That\'s okay! The best starting point is to **get certified in the state where you live**. Your home state\'s NASBLA-approved certificate will be recognized in most other states, so you\'ll be covered wherever you decide to boat.\n\nWhich state do you live in?",
            });
            setStep("ask_residence");
          }
        }, 400);
        return;
      }
    } else if (step === "show_results" || step === "show_single_state") {
    // User typed while viewing results - treat as searching for another state
    const allFound = findAllStates(query);
    if (allFound.length >= 1) {
      addMessages({ role: "user", content: query });
      handleMultipleBoatingStates(allFound, false);
      return;
    }
    // No state found - prompt them
    addMessages({ role: "user", content: query });
    setTimeout(() => {
      addMessages({
        role: "instructor",
        content: `I couldn't find a state matching "${query}". Try typing a state name like "Texas" or an abbreviation like "TX".`,
      });
    }, 300);
    return;
  } else if (step === "ask_residence") {
      const state = findState(query);
      if (state) {
        handleSelectState(state, true);
        return;
      }

      // Handle unsure responses about residence
      if (isUnsureResponse(query)) {
        addMessages(
          { role: "user", content: query },
        );
        setTimeout(() => {
          addMessages({
            role: "instructor",
            content: "No problem! To give you the best guidance, I just need to know which state you currently live in. Your home state is the easiest place to get certified, and that certificate is recognized across most of the U.S.\n\nWhat state are you in right now?",
          });
        }, 400);
        return;
      }
    }

    const allFound = findAllStates(query);
    if (allFound.length === 1) {
      if (step === "ask_residence") {
        handleSelectState(allFound[0], true);
      } else if (step === "ask_boating_state") {
        handleSelectState(allFound[0], false);
      }
      return;
    }

    addMessages({ role: "user", content: query });

    if (allFound.length > 1 && step === "ask_residence") {
      setTimeout(() => {
        addMessages({
          role: "instructor",
          content: "I found a few states in your message. Which one do you live in?",
          options: allFound.map((s) => ({
            label: s.name,
            value: s.slug,
          })),
        });
      }, 300);
      return;
    }

    const matches = filterStates(query);
    if (matches.length === 0) {
      setTimeout(() => {
        addMessages({
          role: "instructor",
          content: `I couldn't find a state matching "${query}". Try typing a state name like "Texas" or an abbreviation like "TX".`,
        });
      }, 300);
    } else if (matches.length <= 5) {
      setTimeout(() => {
        addMessages({
          role: "instructor",
          content: "Did you mean one of these?",
          options: matches.map((s) => ({
            label: s.name,
            value: s.slug,
          })),
        });
      }, 300);
    } else {
      setTimeout(() => {
        addMessages({
          role: "instructor",
          content: `I found ${matches.length} matches. Try being more specific , or type the full state name.`,
        });
      }, 300);
    }
  };

  const handleOptionClick = (value: string) => {
    // Reset scroll state so the next instructor response scrolls to its top
    scrollTargetIdRef.current = null;
    hasScrolledThisTurnRef.current = false;
    if (
      value === "same" ||
      value === "different" ||
      value === "restart" ||
      value === "done" ||
      value === "texas_option" ||
      value === "another_state"
    ) {
      handleOption(value);
      return;
    }
    const state = states?.find((s) => s.slug === value);
    if (state) {
      if (step === "ask_residence") {
        handleSelectState(state, true);
      } else if (step === "ask_boating_state") {
        handleSelectState(state, false);
      }
    }
  };

  const isInputStep = true; // Always show input so users can type at any point

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          data-testid="button-open-instructor-chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium text-sm hidden sm:inline">
            Ask a Captain
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed z-50 flex flex-col shadow-xl border bg-background overflow-hidden inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[360px] sm:max-w-[calc(100vw-2rem)] sm:rounded-md sm:max-h-[calc(100vh-6rem)] sm:h-[520px]"
          data-testid="panel-instructor-chat"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5" />
              <div>
                <div className="font-semibold text-sm">Ask a Captain</div>
                <div className="text-xs opacity-80">
                  Boating Safety Guide
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-primary-foreground no-default-hover-elevate"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-instructor-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} data-msg-id={msg.id}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    data-testid={`chat-message-${msg.role}-${msg.id}`}
                  >
                    {msg.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i}>{part}</strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                </div>

                {msg.stateResult && (
                  <div className="mt-2 ml-1">
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">
                              {msg.stateResult.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {msg.stateResult.abbreviation}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href={`/states/${msg.stateResult.slug}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              data-testid={`button-view-state-${msg.stateResult.slug}`}
                            >
                              View Full Details
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                          {msg.stateResult.courseUrl && (
                            <a
                              href={msg.stateResult.courseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                className="w-full"
                                data-testid={`button-find-course-${msg.stateResult.slug}`}
                              >
                                Find Your Course
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {msg.resources && msg.resources.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {msg.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        {resource.title}
                      </a>
                    ))}
                  </div>
                )}

                {msg.options && (
                  <div className="mt-2 ml-1 flex flex-wrap gap-2">
                    {msg.options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptionClick(opt.value)}
                        data-testid={`button-option-${opt.value}`}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isInputStep && (
            <div className="flex-shrink-0 border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={step === "ask_residence" ? "Type your state (e.g. Texas)..." : "Type a state name or ask a question..."}
                  className="flex-1"
                  data-testid="input-instructor-chat"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!searchQuery.trim()}
                  data-testid="button-send-instructor-chat"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
