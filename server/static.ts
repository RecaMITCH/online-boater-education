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
        "url": "https://www.onlineboatereducation.com",
        "description": "State-approved online boating safety courses. NASBLA certified. Complete your boater education certification online at your own pace.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.onlineboatereducation.com/states/{search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };

      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Online Boater Education",
        "url": "https://www.onlineboatereducation.com",
        "description": "State-approved online boater education and boating safety certification courses."
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Online Boater Education | State-Approved Boating Safety Courses | OnlineBoaterEducation.com",
        description: "Complete your boater education course online. State-approved, NASBLA certified boating safety courses available for all 50 states. Get certified at your own pace.",
        canonical: "https://www.onlineboatereducation.com/",
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
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Find Your State" }
        ]
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Online Boater Education by State | Find Your State-Approved Course",
        description: "Browse all U.S. states to find NASBLA-approved online boater education courses. View requirements, costs, and certification paths for your state.",
        canonical: "https://www.onlineboatereducation.com/states",
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
        const description = state.metaDescription || state.description;
        const canonical = `https://www.onlineboatereducation.com/states/${state.slug}`;

        const structuredData = {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": `${state.name} Online Boater Education Course`,
          "description": description,
          "provider": {
            "@type": "Organization",
            "name": "OnlineBoaterEducation.com",
            "url": "https://www.onlineboatereducation.com"
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
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.onlineboatereducation.com/" },
            { "@type": "ListItem", "position": 2, "name": "Find Your State", "item": "https://www.onlineboatereducation.com/states" },
            { "@type": "ListItem", "position": 3, "name": state.name }
          ]
        };

        const enriched = injectMetaTags(indexHtml, {
          title,
          description,
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
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.onlineboatereducation.com/" },
          { "@type": "ListItem", "position": 2, "name": "Blog" }
        ]
      };

      const enriched = injectMetaTags(indexHtml, {
        title: "Boating Safety Blog | Tips, Guides & Resources | Online Boater Ed",
        description: "Expert tips, guides, and resources for boater education. Stay informed about boating safety practices, state requirements, and certification updates.",
        canonical: "https://www.onlineboatereducation.com/blog",
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
        const canonical = `https://www.onlineboatereducation.com/blog/${article.slug}`;

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
            "url": "https://www.onlineboatereducation.com"
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
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.onlineboatereducation.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.onlineboatereducation.com/blog" },
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

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
