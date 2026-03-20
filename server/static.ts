import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function injectMetaTags(html: string, meta: {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  structuredData?: object | object[];
}): string {
  // Build meta tags to inject before </head>
  let tags = `
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${meta.canonical}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Online Boater Ed" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`;

  if (meta.ogImage) {
    tags += `
    <meta property="og:image" content="${meta.ogImage}" />
    <meta name="twitter:image" content="${meta.ogImage}" />`;
  }

  if (meta.structuredData) {
    const items = Array.isArray(meta.structuredData) ? meta.structuredData : [meta.structuredData];
    for (const item of items) {
      tags += `
    <script type="application/ld+json">${JSON.stringify(item)}</script>`;
    }
  }

  html = html.replace("</head>", tags + "\n  </head>");
  return html;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // SEO: Server-side meta tag injection for home page
  app.get("/", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Online Boater Education",
        "url": "https://onlineboatereducation.com",
        "description": "State-approved online boating safety courses. NASBLA certified. Complete your boater education certification online at your own pace.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://onlineboatereducation.com/states/{search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };

      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Online Boater Education",
        "url": "https://onlineboatereducation.com",
        "description": "Online Boater Education is a free resource helping boaters in all 50 states find NASBLA-approved, state-approved boating safety courses online.",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support"
        }
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Online Boater Education | State-Approved Boating Safety Courses",
        description: "Online Boater Education helps boaters in all 50 states find NASBLA-approved, state-approved boating safety courses online. Find your state's requirements, approved providers, and get certified.",
        canonical: "https://onlineboatereducation.com/",
        structuredData: [structuredData, orgSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting home SEO:", error);
    }

    res.sendFile(path.resolve(distPath, "index.html"));
  });


  app.use(express.static(distPath));

  // SEO: Server-side meta tag injection for states list
  app.get("/states", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Find Your State" }
        ]
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Boater Education Requirements by State | All 50 States",
        description: "Browse boater education requirements for all 50 U.S. states. Find NASBLA-approved online courses, age requirements, vessel rules, and approved providers by state.",
        canonical: "https://onlineboatereducation.com/states",
        structuredData: [breadcrumbSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting states list SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for state pages
  app.get("/states/:slug", async (req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
      const state = await storage.getStateBySlug(req.params.slug);

      if (state) {
        const title = state.metaTitle || `${state.name} Boater Education Course Online | State-Approved`;
        const metaDesc = state.metaDescription || `Get your ${state.name} Boater Education Certificate online. ${state.agencyAbbreviation || state.agencyName}-approved and NASBLA-approved courses available. Learn requirements, vessel rules, costs, and how to get certified in ${state.name}.`;
        const schemaDescription = state.metaDescription || state.description;
        const canonical = `https://onlineboatereducation.com/states/${state.slug}`;

        const structuredData = {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": `${state.name} Online Boater Education Course`,
          "description": schemaDescription,
          "provider": {
            "@type": "Organization",
            "name": "OnlineBoaterEducation.com",
            "url": "https://onlineboatereducation.com"
          },
          "url": canonical,
          "coursePrerequisites": state.minimumAge ? `Minimum age: ${state.minimumAge}` : undefined,
          "educationalCredentialAwarded": `${state.name} Boater Education Certificate`,
          "isAccessibleForFree": false,
          "offers": state.coursePrice ? {
            "@type": "Offer",
            "price": state.coursePrice,
            "priceCurrency": "USD"
          } : undefined,
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": "PT4H"
          }
        };

        // Build FAQ structured data
        const faqs = [];
        faqs.push({
          "@type": "Question",
          "name": `How do I get my boater education certificate in ${state.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": state.fieldDayRequired
              ? `Complete the online boater education course and then attend an on-water practical component to receive your ${state.name} Boater Education Certificate.`
              : `Complete the online boater education course entirely online to receive your ${state.name} Boater Education Certificate. No on-water practical component is required.`
          }
        });
        if (state.minimumAge) {
          faqs.push({
            "@type": "Question",
            "name": `What is the minimum age for boater education in ${state.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The minimum age to take boater education in ${state.name} is ${state.minimumAge} years old.${state.minimumAgeOnlineOnly ? ` The online-only option (no practical component) is available for boaters ${state.minimumAgeOnlineOnly} and older.` : ""}`
            }
          });
        }
        faqs.push({
          "@type": "Question",
          "name": `Is the ${state.name} online boater education course approved by ${state.agencyAbbreviation || state.agencyName}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes, this course is approved by the ${state.agencyName}${state.agencyAbbreviation ? ` (${state.agencyAbbreviation})` : ""} and certified by NASBLA.`
          }
        });

        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs
        };

        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
            { "@type": "ListItem", "position": 2, "name": "Find Your State", "item": "https://onlineboatereducation.com/states" },
            { "@type": "ListItem", "position": 3, "name": state.name }
          ]
        };

        const enriched = injectMetaTags(indexHtml, {
          title,
          description: metaDesc,
          canonical,
          ogImage: state.heroImageUrl || undefined,
          structuredData: [structuredData, faqSchema, breadcrumbSchema]
        });

        return res.send(enriched);
      }
    } catch (error) {
      console.error("Error injecting state SEO:", error);
    }

    // Fallback to regular index.html
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for blog list
  app.get("/blog", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Blog" }
        ]
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Boating Safety Blog | Tips, Guides & Resources | Online Boater Ed",
        description: "Expert tips, guides, and resources for boater education. Stay informed about boating safety practices, state requirements, and certification updates.",
        canonical: "https://onlineboatereducation.com/blog",
        structuredData: [breadcrumbSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting blog list SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for blog detail
  app.get("/blog/:slug", async (req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
      const article = await storage.getArticleBySlug(req.params.slug);

      if (article) {
        const title = article.metaTitle || article.title;
        const description = article.metaDescription || article.excerpt || "";
        const canonical = `https://onlineboatereducation.com/blog/${article.slug}`;

        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": article.title,
          "description": description,
          "url": canonical,
          "datePublished": article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
          "dateModified": article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
          "image": article.coverImageUrl || undefined,
          "publisher": {
            "@type": "Organization",
            "name": "Online Boater Education",
            "url": "https://onlineboatereducation.com"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical
          }
        };

        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://onlineboatereducation.com/blog" },
            { "@type": "ListItem", "position": 3, "name": article.title }
          ]
        };

        const enriched = injectMetaTags(indexHtml, {
          title,
          description,
          canonical,
          ogImage: article.coverImageUrl || undefined,
          structuredData: [articleSchema, breadcrumbSchema]
        });

        return res.send(enriched);
      }
    } catch (error) {
      console.error("Error injecting blog detail SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for about page
  app.get("/about", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "About" }
        ]
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "About Online Boater Education | Our Mission & Team",
        description: "Learn about OnlineBoaterEducation.com — a free resource helping boaters in all 50 states find NASBLA-approved, state-approved boating safety courses and certification information.",
        canonical: "https://onlineboatereducation.com/about",
        structuredData: [breadcrumbSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting about SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for quiz page
  app.get("/quiz", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Do I Need a Boating License?" }
        ]
      };

      const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Do I Need a Boating License? Quiz",
        "url": "https://onlineboatereducation.com/quiz",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "description": "Free interactive tool to determine if you need boater education and find the best course option for your state and age.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Do I Need a Boating License? Free Quiz Tool | Online Boater Ed",
        description: "Answer 2 quick questions to find out if you need boater education, what course format to take, and whether you can complete it online in your state.",
        canonical: "https://onlineboatereducation.com/quiz",
        structuredData: [breadcrumbSchema, webAppSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting quiz SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for right-of-way game
  app.get("/right-of-way", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Right of Way Game" }
        ]
      };

      const gameSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Right of Way — Boating Navigation Game",
        "url": "https://onlineboatereducation.com/right-of-way",
        "applicationCategory": "GameApplication",
        "operatingSystem": "All",
        "description": "Free interactive game to test your knowledge of boating right-of-way rules. Face 10 real-world navigation encounters and learn the correct action for each.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };

      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What are boating right-of-way rules?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Boating right-of-way rules (Navigation Rules or COLREGS) determine which vessel must give way in an encounter. Key rules include: vessels crossing from your starboard have right of way, power gives way to sail, and overtaking vessels must keep clear."
            }
          },
          {
            "@type": "Question",
            "name": "What happens when two boats meet head-on?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "When two power-driven vessels meet head-on, both must alter course to starboard (right) so they pass port-to-port. This is similar to driving on the right side of the road."
            }
          }
        ]
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Right of Way: Boating Navigation Game | Test Your Knowledge",
        description: "Test your knowledge of boating right-of-way rules with our free interactive game. Face 10 real-world navigation encounters and learn the correct action for each scenario.",
        canonical: "https://onlineboatereducation.com/right-of-way",
        structuredData: [breadcrumbSchema, gameSchema, faqSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting game SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for games hub
  app.get("/games", async (_req, res) => {
    try {
      const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Boating Safety Games" }
        ]
      };

      const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Boating Safety Games",
        "url": "https://onlineboatereducation.com/games",
        "description": "Free interactive boating safety games covering navigation rules, life jackets, fire emergencies, fueling procedures, navigation lights, and pre-departure checklists."
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Free Boating Safety Games | Learn Navigation Rules & Safety Skills",
        description: "Play free interactive boating safety games. Test your knowledge of navigation rules, life jackets, fire emergencies, fueling procedures, navigation lights, and pre-departure checklists.",
        canonical: "https://onlineboatereducation.com/games",
        structuredData: [breadcrumbSchema, collectionSchema]
      });

      return res.send(enriched);
    } catch (error) {
      console.error("Error injecting games hub SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // SEO: Server-side meta tag injection for individual game pages
  const gamesMeta: Record<string, { title: string; description: string; name: string }> = {
    "life-jacket-picker": {
      title: "Life Jacket Picker Game | Choose the Right PFD Type",
      description: "Given a boating scenario, pick the correct PFD type. Learn when to use Type I through Type V life jackets with this free interactive game.",
      name: "Life Jacket Picker"
    },
    "boat-fire": {
      title: "Boat Fire Emergency Game | Learn Fire Safety on a Boat",
      description: "A fire breaks out on your boat — what do you do first? Practice emergency fire response and learn the PASS technique with this free interactive game.",
      name: "Boat Fire Emergency"
    },
    "fueling-safety": {
      title: "Fueling Safety Game | Learn Safe Boat Fueling Steps",
      description: "Put the boat fueling steps in the correct order and answer quiz questions. Learn safe fueling procedures with this free interactive boating safety game.",
      name: "Fueling Safety"
    },
    "nav-lights": {
      title: "Navigation Lights at Night Game | Identify Vessels by Lights",
      description: "You see lights approaching in the dark — identify the vessel type and heading from its light configuration. Free interactive boating navigation game.",
      name: "Navigation Lights at Night"
    },
    "pre-departure": {
      title: "Pre-Departure Checklist Game | Boating Safety Check",
      description: "You're at the dock about to launch. Check all required safety items and skip the ones that aren't needed. Free interactive pre-departure checklist game.",
      name: "Pre-Departure Checklist"
    }
  };

  app.get("/games/:slug", async (req, res) => {
    try {
      const meta = gamesMeta[req.params.slug];
      if (meta) {
        const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlineboatereducation.com/" },
            { "@type": "ListItem", "position": 2, "name": "Games", "item": "https://onlineboatereducation.com/games" },
            { "@type": "ListItem", "position": 3, "name": meta.name }
          ]
        };

        const gameSchema = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": meta.name,
          "url": `https://onlineboatereducation.com/games/${req.params.slug}`,
          "applicationCategory": "GameApplication",
          "operatingSystem": "All",
          "description": meta.description,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        };

        const enriched = injectMetaTags(indexHtml, {
          title: meta.title,
          description: meta.description,
          canonical: `https://onlineboatereducation.com/games/${req.params.slug}`,
          structuredData: [breadcrumbSchema, gameSchema]
        });

        return res.send(enriched);
      }
    } catch (error) {
      console.error("Error injecting game SEO:", error);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // Embed routes - serve index.html without header/footer injection
  app.get("/embed/quiz", async (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
