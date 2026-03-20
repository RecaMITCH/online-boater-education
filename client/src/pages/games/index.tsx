import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, LifeBuoy, Flame, Fuel, Lightbulb, ClipboardCheck, ArrowRight } from "lucide-react";

const GAMES = [
  {
    slug: "right-of-way",
    title: "Right of Way",
    description: "Face real-time boating encounters and decide: turn, slow down, or hold course? Vessels move and collide if you don't act.",
    icon: Navigation,
    category: "Navigation Rules",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/right-of-way",
  },
  {
    slug: "life-jacket-picker",
    title: "Life Jacket Picker",
    description: "Given a boating scenario, pick the correct PFD type. Learn when to use Type I through Type V life jackets.",
    icon: LifeBuoy,
    category: "Safety Equipment",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    href: "/games/life-jacket-picker",
  },
  {
    slug: "boat-fire",
    title: "Boat Fire Emergency",
    description: "A fire breaks out on your boat. Pick the correct first action before the flames spread. Learn the PASS technique.",
    icon: Flame,
    category: "Emergency Response",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    href: "/games/boat-fire",
  },
  {
    slug: "fueling-safety",
    title: "Fueling Safety",
    description: "Put the boat fueling steps in the correct order, then answer quick-fire quiz questions. One wrong step could mean disaster.",
    icon: Fuel,
    category: "Boat Operations",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    href: "/games/fueling-safety",
  },
  {
    slug: "nav-lights",
    title: "Navigation Lights at Night",
    description: "You see lights approaching in the dark. Identify the vessel type and heading from its light configuration.",
    icon: Lightbulb,
    category: "Navigation Rules",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    href: "/games/nav-lights",
  },
  {
    slug: "pre-departure",
    title: "Pre-Departure Checklist",
    description: "You're at the dock about to launch. Check all required safety items and skip the ones that aren't needed.",
    icon: ClipboardCheck,
    category: "Boat Operations",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    href: "/games/pre-departure",
  },
];

export default function GamesIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">
            <Navigation className="h-3 w-3 mr-1" />
            Free Interactive Games
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Boating Safety Games
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your boating knowledge with interactive games covering navigation rules,
            safety equipment, emergency procedures, and more. Learn while you play.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <Link key={game.slug} href={game.href}>
              <Card className="group cursor-pointer h-full transition-all hover:shadow-lg hover:-translate-y-1" data-testid={`game-card-${game.slug}`}>
                <CardContent className="pt-6">
                  <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${game.bgColor}`}>
                    <game.icon className={`h-6 w-6 ${game.color}`} />
                  </div>
                  <Badge variant="secondary" className="mb-2 text-xs">{game.category}</Badge>
                  <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    Play Now
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All games are based on NASBLA-approved boating safety curriculum and U.S. Inland Navigation Rules.{" "}
            <Link href="/quiz" className="text-primary underline">Check if you need boater education</Link> or{" "}
            <Link href="/states" className="text-primary underline">find your state's requirements</Link>.
          </p>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Boating Safety Games",
            "url": "https://onlineboatereducation.com/games",
            "description": "Free interactive boating safety games covering navigation rules, life jackets, fire emergencies, fueling procedures, navigation lights, and pre-departure checklists.",
          }),
        }}
      />
    </div>
  );
}
