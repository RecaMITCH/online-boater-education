import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Calendar,
  AlertTriangle,
  User,
  DollarSign,
  Shield,
  FileText,
  Info,
  Globe,
  ChevronRight,
} from "lucide-react";
import type { State } from "@shared/schema";
import { useEffect } from "react";

export default function StateDetail() {
  // Scroll to top when navigating to this page
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [, params] = useRoute("/states/:slug");
  const slug = params?.slug;

  const { data: state, isLoading } = useQuery<State>({
    queryKey: ["/api/states", slug],
    enabled: !!slug,
  });

  const { data: resources = [] } = useQuery<Array<{id: number; title: string; url: string; description: string | null; resourceType: string}>>({
    queryKey: ['/api/states', state?.id, 'resources'],
    queryFn: async () => {
      if (!state?.id) return [];
      const res = await fetch(`/api/states/${state.id}/resources`);
      return res.json();
    },
    enabled: !!state?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="bg-card border-b py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">State Not Found</h1>
          <p className="text-muted-foreground mb-4">
            We couldn't find information for this state.
          </p>
          <Link href="/states">
            <Button data-testid="button-back-to-states">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All States
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
            title={state.metaTitle || `${state.name} Boater Education Course Online | State-Approved`}
            description={state.metaDescription || `Get your ${state.name} Boater Education Certificate online. ${state.agencyAbbreviation || state.agencyName}-approved and NASBLA-approved courses available. Learn requirements, vessel rules, costs, and how to get certified in ${state.name}.`}
            canonical={`https://onlineboatereducation.com/states/${state.slug}`}
            ogImage={state.heroImageUrl || undefined}
            structuredData={[
              {
                "@context": "https://schema.org",
                "@type": "Course",
                "name": `${state.name} Online Boater Education Course`,
                "description": state.description,
                "provider": {
                  "@type": "Organization",
                  "name": "OnlineBoaterEducation.com",
                  "url": "https://onlineboatereducation.com"
                },
                "url": `https://onlineboatereducation.com/states/${state.slug}`,
                "educationalCredentialAwarded": `${state.name} Boater Education Certificate`,
                "hasCourseInstance": {
                  "@type": "CourseInstance",
                  "courseMode": "online",
                  "courseWorkload": "PT4H"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is a boating license?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `While many people refer to it as a "boating license," what most states actually issue is a boater education card or boating safety certificate. This card proves you've completed a state-approved boating safety course. Unlike a driver's license, it never expires and doesn't require renewal — once you earn your boater education certificate in ${state.name}, it's yours for life.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `How do I get my boater education certificate in ${state.name}?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": state.fieldDayRequired
                        ? `In ${state.name}, you need to complete an online course and attend an on-water practical assessment.`
                        : `In ${state.name}, you can complete the entire course online with no in-person assessment required.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `How much does boater education cost in ${state.name}?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": state.coursePrice ? `The online course typically costs around ${state.coursePrice}.` : "Course pricing varies by provider. Visit the official course page for current pricing."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is the certificate valid in other states?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. NASBLA-approved certificates are reciprocal across most U.S. states."
                    }
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
                  { "@type": "ListItem", "position": 2, "name": "Find Your State", "item": "https://onlineboatereducation.com/states" },
                  { "@type": "ListItem", "position": 3, "name": state.name }
                ]
              }
            ]}
          />
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="section-state-hero">
        <div className="absolute inset-0">
          <img
            src={state.heroImageUrl || "/images/hero-boating.png"}
            alt={`${state.name} landscape`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm">
            <ol className="flex items-center gap-1 text-white/70">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li><Link href="/states" className="hover:text-white transition-colors">States</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white font-medium">{state.name}</li>
            </ol>
          </nav>

          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl" data-testid="text-state-name">
              {state.name}
            </h1>
            <Badge variant="secondary" className="bg-white/15 text-white border-white/20 text-sm mt-1">
              {state.abbreviation}
            </Badge>
          </div>

          <p className="mt-4 text-lg text-white/80 max-w-2xl leading-relaxed" data-testid="text-state-description">
            {state.description}
          </p>

          {state.courseUrl && (
            <div className="mt-6">
              <a href={state.courseUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" data-testid="button-get-certified">
                  Find Your Course
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* NASBLA Reciprocity Banner */}
      <section className="border-b" data-testid="section-nasbla-reciprocity">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium" data-testid="text-reciprocity-heading">
                NASBLA-Approved &mdash; Valid Across the U.S.
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Courses must be approved by the National Association of State Boating Law Administrators (NASBLA) to be recognized nationwide.
                For example, a NASBLA-approved certificate earned in Texas is reciprocal in most other states. We only link to NASBLA-approved course providers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Certification Path */}
            <Card data-testid="card-course-type">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Certification Path</h2>
                </div>
                {state.minimumAgeOnlineOnly ? (
                  <div className="space-y-0">
                    <div className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/15">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Ages {state.minimumAgeOnlineOnly}+: Online Only</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Complete the entire course online and receive your certification. No in-person attendance needed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 mt-2 rounded-md bg-card border">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Under {state.minimumAgeOnlineOnly}: Online + On-Water Assessment</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {state.fieldDayDetails || "Youth boaters must complete the online course plus an on-water practical assessment for certification."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : state.fieldDayRequired ? (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-card border">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Online + On-Water Assessment</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {state.fieldDayDetails || "You must complete an on-water practical assessment after finishing the online course to receive your certification."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/15">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{state.minimumAge ? `Online Only for Ages ${state.minimumAge}+` : 'Online Only'}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {state.fieldDayDetails || (state.minimumAge ? `No on-water assessment is required for ages ${state.minimumAge}+. Complete the entire course online and receive your certification.` : "No on-water assessment is required. Complete the entire course online and receive your certification.")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Age Requirements */}
            <Card data-testid="card-age-requirements">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Age Requirements</h2>
                </div>
                <div className="space-y-2">
                  {state.minimumAge != null && (
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm" data-testid="text-minimum-age">
                        Minimum age: <span className="font-medium">{state.minimumAge} years old</span>
                      </p>
                    </div>
                  )}
                  {state.minimumAgeOnlineOnly != null && (
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm" data-testid="text-online-only-age">
                        Online-only certification for ages <span className="font-medium">{state.minimumAgeOnlineOnly}+</span>.
                        Younger students require online course + in-person field day.
                      </p>
                    </div>
                  )}
                  {state.minimumAge == null && state.minimumAgeOnlineOnly == null && (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-age-restriction">
                      No specific age restrictions listed. Check with your state agency for details.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Approving Agency */}
            <Card data-testid="card-agency">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Approving Agency</h2>
                </div>
                <p className="text-sm">
                  <span className="font-medium">{state.agencyName}</span>
                  {state.agencyAbbreviation && (
                    <span className="text-muted-foreground"> ({state.agencyAbbreviation})</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Look for courses approved by {state.agencyAbbreviation || state.agencyName} and NASBLA.
                </p>
              </CardContent>
            </Card>

            {/* Price */}
            {state.coursePrice && (
              <Card data-testid="card-price">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">Course Price</h2>
                  </div>
                  <p className="text-sm font-medium">{state.coursePrice}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Requirements */}
          {state.additionalRequirements && (
            <Card className="mt-6" data-testid="card-additional-requirements">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Additional Requirements</h2>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {state.additionalRequirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          {state.importantNotes && (
            <Card className="mt-6 border-primary/20" data-testid="card-important-notes">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-chart-4" />
                  <h2 className="font-semibold text-lg">Important Notes</h2>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {state.importantNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Extended Content */}
          {state.extendedContent && (
            <div
              className="mt-8 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: state.extendedContent }}
            />
          )}

          {/* Resources Section */
          }
          {resources.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-5">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-green-700" />
                  Helpful Resources
                </h2>
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-green-800 flex items-center gap-1">
                        {resource.title}
                        <ExternalLink className="h-3 w-3" />
                      </div>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      )}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* FAQ Section */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">What is a boating license?</h3>
                <p className="text-muted-foreground">
                  While many people refer to it as a "boating license," there is technically no such thing. What most states actually issue is a <strong>boater education card</strong> or <strong>boating safety certificate</strong>. This card proves you've completed a state-approved boating safety course. Unlike a driver's license, it never expires and doesn't require renewal — once you earn your boater education certificate in {state.name}, it's yours for life.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">How do I get my boater education certificate in {state.name}?</h3>
                <p className="text-muted-foreground">
                  {state.fieldDayRequired
                    ? `You'll need to complete a NASBLA-approved online course and attend an on-water practical assessment. The online portion covers vessel operation safety, waterway safety, and boating laws specific to ${state.name}.`
                    : `${state.name} allows you to complete the entire boater education course online.`
                  }
                </p>
              </div>
              
              {state.coursePrice && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">How much does it cost?</h3>
                  <p className="text-muted-foreground">
                    The online boater education course for {state.name} typically costs around {state.coursePrice}. This is a one-time fee and your certificate never expires.
                  </p>
                </div>
              )}
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Is my {state.name} certificate valid in other states?</h3>
                <p className="text-muted-foreground">
                  Yes! NASBLA-approved boater education certificates are recognized across most U.S. states through reciprocity agreements. Once certified in {state.name}, you can typically use your certificate to boat in other states as well.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">How long does the course take?</h3>
                <p className="text-muted-foreground">
                  Most online boater education courses take 4-6 hours to complete. You can work at your own pace, saving progress and returning whenever it's convenient.
                </p>
              </div>
              
              {state.minimumAge && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Is there a minimum age requirement?</h3>
                  <p className="text-muted-foreground">
                    {state.name} requires students to be at least {state.minimumAge} years old to take the boater education course.{state.minimumAgeOnlineOnly ? ` For online-only courses, the minimum age is ${state.minimumAgeOnlineOnly}.` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* CTA */}
          {state.courseUrl && (
            <div className="mt-8 text-center">
              <a href={state.courseUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" data-testid="button-get-certified-bottom">
                  Find Your {state.name} Course
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
