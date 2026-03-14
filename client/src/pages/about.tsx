import { Link } from "wouter";
import { SEO } from "@/components/seo";
import { ChevronRight, Shield, BookOpen, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen">
      <SEO
        title="About Online Boater Education | Our Mission & Team"
        description="Learn about OnlineBoaterEducation.com — a free resource helping boaters in all 50 states find NASBLA-approved, state-approved boating safety courses and certification information."
        canonical="https://onlineboatereducation.com/about"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Online Boater Education",
            "url": "https://onlineboatereducation.com/about",
            "description": "Learn about OnlineBoaterEducation.com — a free resource helping boaters in all 50 states find NASBLA-approved, state-approved boating safety courses.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Online Boater Education",
              "url": "https://onlineboatereducation.com",
              "description": "Online Boater Education is a free resource helping boaters in all 50 states find NASBLA-approved, state-approved boating safety courses online.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "email": "info@onlineboatereducation.com"
              }
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
              { "@type": "ListItem", "position": 2, "name": "About" }
            ]
          }
        ]}
      />

      <section className="bg-card border-b py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
            <ol className="flex items-center gap-1">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-foreground font-medium">About</li>
            </ol>
          </nav>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">
            About Online Boater Education
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed text-lg">
            We're a free resource helping boaters across all 50 states navigate boater education requirements and find approved courses.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif">
            <h2>Our Mission</h2>
            <p>
              Boating safety education saves lives. Every year, thousands of boating accidents occur on U.S. waterways, and the majority involve operators who have never taken a boating safety course. Our mission is to make it easy for every boater to find and complete a NASBLA-approved safety course for their state.
            </p>
            <p>
              We believe that understanding your state's requirements shouldn't be complicated. That's why we've built a comprehensive, free resource that covers boater education rules, age requirements, vessel regulations, and approved course providers for all 50 states.
            </p>

            <h2>What We Do</h2>
            <p>
              OnlineBoaterEducation.com is not a course provider itself. Instead, we serve as a trusted directory and information hub that helps you:
            </p>
            <ul>
              <li>Understand your state's boater education requirements</li>
              <li>Find NASBLA-approved online courses accepted by your state</li>
              <li>Learn about age requirements, vessel rules, and certification paths</li>
              <li>Access official state agency resources and links</li>
              <li>Stay informed through our boating safety blog</li>
            </ul>

            <h2>Why NASBLA Approval Matters</h2>
            <p>
              The National Association of State Boating Law Administrators (NASBLA) sets the standard for boating safety education in the United States. A NASBLA-approved course means it meets national standards and is recognized through reciprocity agreements across most states. When you complete a NASBLA-approved course, your certification is portable — you can typically use it to boat in other states as well.
            </p>
            <p>
              We only link to course providers that hold NASBLA approval, so you can be confident that any course you find through our site meets the highest standards for boating safety education.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">All 50 States</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive coverage of boater education requirements for every U.S. state.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">NASBLA-Approved Only</h3>
                <p className="text-sm text-muted-foreground">
                  We only link to courses that hold NASBLA certification and state approval.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Free Resource</h3>
                <p className="text-sm text-muted-foreground">
                  Our directory and state information is always free. No sign-up required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Built for Boaters</h3>
                <p className="text-sm text-muted-foreground">
                  Created by boating enthusiasts who understand the importance of water safety education.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <h2 className="font-serif text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Find your state's boater education requirements and get certified today.
            </p>
            <Link href="/states">
              <Button size="lg">
                Find Your State
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
