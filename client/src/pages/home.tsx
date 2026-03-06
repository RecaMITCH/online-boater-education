import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/state-card";
import { SEO } from "@/components/seo";
import { useQuery } from "@tanstack/react-query";
import type { State, Article } from "@shared/schema";
import {
  ArrowRight,
  BookOpen,
  Shield,
  MapPin,
  Search,
  ChevronRight,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { InstructorChat } from "@/components/instructor-chat";

export default function Home() {
  const { data: states, isLoading: statesLoading } = useQuery<State[]>({
    queryKey: ["/api/states"],
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", "recent"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const filteredStates = states?.filter(
    (s) =>
      s.isActive &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
        <SEO
          title="Online Boater Education - Find NASBLA-Approved Courses"
          description="Find NASBLA-approved online boater education courses for your state. Get certified from home and boat legally across the U.S. with a nationally recognized certificate."
          canonical="https://www.onlineboatereducation.com"
          ogType="website"
          structuredData={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Online Boater Ed",
            "url": "https://www.onlineboatereducation.com",
            "description": "Find NASBLA-approved online boater education courses for every U.S. state.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.onlineboatereducation.com/states?q={search_term}",
              "query-input": "required name=search_term"
            }
          }}
        />
      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0">
          <img
            src="/images/hero-boating.png"
            alt="Water landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Find NASBLA-Approved Courses
            </Badge>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              Get Your Boater Education
              <span className="block text-primary-foreground/90"> Certification Online</span>
            </h1>
            <p className="mt-5 text-lg text-white/80 leading-relaxed max-w-xl">
              Find NASBLA-approved online boater education courses for your state. Certificates are
              recognized across the U.S., so you can get certified and boat legally in your state.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/states">
                <Button size="lg" data-testid="button-find-state">
                  Find Your State
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline" className="bg-white/5 text-white border-white/20 backdrop-blur-sm" data-testid="button-read-blog">
                  Read Our Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20" data-testid="section-features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Why Choose Online Boater Education?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Complete your boating safety course from the comfort of home with NASBLA-approved online programs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card data-testid="card-feature-approved">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">NASBLA Approved</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We link you to courses approved by your state's boating agency and the National Association of State Boating Law Administrators (NASBLA).
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-flexible">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Learn at Your Pace</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Study whenever it suits you. Save your progress and pick up right where you left off.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-coverage">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Valid Across the U.S.</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  NASBLA-approved certificates are reciprocal in most states. Get certified in one state and it's typically honored nationwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ask a Captain CTA */}
      <section className="py-12 sm:py-16 bg-primary/5 border-y" data-testid="section-ask-instructor">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h2 className="font-serif text-xl font-bold sm:text-2xl">
                Not Sure Where to Start?
              </h2>
              <p className="mt-2 text-muted-foreground max-w-lg">
                Our digital captain can walk you through your options based on where you live and where you want to boat — including in-person course alternatives.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setChatOpen(true)}
              data-testid="button-ask-instructor-cta"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask a Captain
            </Button>
          </div>
        </div>
      </section>

      {/* State Search Section */}
      <section className="py-16 sm:py-20 bg-card" data-testid="section-states">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Find Your State
            </h2>
            <p className="mt-3 text-muted-foreground">
              Select your state to view requirements and get started with your boating safety course.
            </p>
          </div>

          <div className="mx-auto max-w-md mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search states..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-states"
              />
            </div>
          </div>

          {statesLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                    <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredStates?.slice(0, 10).map((state) => (
                  <StateCard key={state.id} state={state} />
                ))}
              </div>
              {filteredStates && filteredStates.length > 10 && (
                <div className="text-center mt-8">
                  <Link href="/states">
                    <Button variant="outline" data-testid="button-view-all-states">
                      View All States
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
              {filteredStates?.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No states found matching "{searchQuery}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Recent Articles Section */}
      <section className="py-16 sm:py-20" data-testid="section-articles">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">Latest Articles</h2>
              <p className="mt-2 text-muted-foreground">
                Tips, guides, and news about boater education.
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline" data-testid="link-view-all-articles">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {articlesLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-44 w-full rounded-t-md" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <Card className="group hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-article-${article.slug}`}>
                <CardContent className="p-0">
                  <div className="w-full h-48 overflow-hidden">
                    {article.coverImageUrl ? (
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-green-300 opacity-50" />
                      </div>
                    )}
                  </div>
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <h3 className="font-semibold line-clamp-2" data-testid={`text-article-title-${article.id}`}>
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                          {article.excerpt}
                        </p>
                        {article.publishedAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(article.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <InstructorChat isOpen={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
