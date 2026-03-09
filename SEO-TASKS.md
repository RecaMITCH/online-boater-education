# SEO Task List — onlineboatereducation.com

## Rendering & Crawlability (P0)

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| Validate JS rendering with Google Search Console URL Inspection tool on `/`, `/states`, `/states/florida`, `/blog`, `/blog/{slug}` | P0 | Dev | Easy | Screenshot of rendered HTML from GSC shows full page content, all links, and H1 for each template |
| Add SSR or pre-rendered HTML for homepage state links | P0 | Dev | Hard | `curl https://www.onlineboatereducation.com/` returns crawlable `<a href="/states/florida">` etc. in raw HTML without JS execution |
| Add SSR or pre-rendered HTML for state detail page body content (FAQ, details) | P0 | Dev | Hard | `curl /states/florida` returns FAQ questions, certification details, and CTA links in raw HTML |
| Add SSR or pre-rendered HTML for blog detail page body content | P0 | Dev | Medium | `curl /blog/{slug}` returns article body, heading, and related article links in raw HTML |
| Verify all internal `<Link>` components render as crawlable `<a href="">` in rendered DOM | P0 | Dev | Easy | Puppeteer/Playwright script confirms every internal link is a standard `<a>` with `href` attribute after render |
| Add `<noscript>` fallback with critical links for crawlers that fail JS | P0 | Dev | Easy | Homepage `<noscript>` block contains plain HTML links to `/states`, `/blog`, and top 10 state pages |

## Metadata & Head Tags (P1) — DONE

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| ~~Fix sitemap: `/articles/` → `/blog/`~~ | P1 | Dev | Easy | ✅ Sitemap contains `/blog/{slug}` URLs only |
| ~~Add `/states` and `/blog` to sitemap~~ | P1 | Dev | Easy | ✅ Both index pages in sitemap |
| ~~Add server-side meta injection for `/states`, `/blog`, `/blog/:slug`~~ | P1 | Dev | Medium | ✅ `curl` returns `<title>`, description, canonical, OG in raw HTML |
| ~~Add canonical URLs to states list, blog list, blog detail~~ | P1 | Dev | Easy | ✅ All pages have `<link rel="canonical">` |
| ~~Add Twitter card tags~~ | P1 | Dev | Easy | ✅ All pages have `twitter:card`, `twitter:title`, `twitter:description` |
| ~~Update title tag templates per spec~~ | P1 | Dev | Easy | ✅ State: "[State] Boater Education Course Online \| State-Approved" |

## Structured Data (P1) — DONE

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| ~~Add Article JSON-LD to blog detail~~ | P1 | Dev | Easy | ✅ Google Rich Results Test validates Article schema |
| ~~Add BreadcrumbList JSON-LD to state, blog list, blog detail~~ | P1 | Dev | Easy | ✅ Rich Results Test validates BreadcrumbList |
| ~~Add Course JSON-LD to state pages (client-side)~~ | P1 | Dev | Easy | ✅ Schema includes Course + FAQPage + BreadcrumbList |
| ~~Support multiple JSON-LD `<script>` blocks (not array)~~ | P1 | Dev | Easy | ✅ Each schema in its own `<script type="application/ld+json">` |

## UX & Internal Linking (P1) — DONE

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| ~~Add visible breadcrumbs to state detail, blog list, blog detail~~ | P1 | Dev | Easy | ✅ `<nav aria-label="Breadcrumb">` with links visible on page |
| ~~Add related articles module to blog detail~~ | P1 | Dev | Easy | ✅ "More Articles" section with up to 3 links at bottom of post |
| ~~Reduce hero height so below-fold content is visible~~ | P1 | Dev | Easy | ✅ Features section peeks above the fold on standard viewports |

## Content & Link Equity (P2)

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| Add crawlable static HTML list of all state links to homepage (not JS-rendered) | P2 | Dev | Medium | Raw HTML source contains 50 `<a href="/states/{slug}">` links without JS |
| Add unique intro paragraph per state page (not just DB description) | P2 | Content | Medium | Each state page has 2-3 sentences of unique editorial content above the fold |
| Add internal cross-links between related state pages (e.g. neighboring states) | P2 | Dev | Medium | State detail pages link to 3-5 related states in a "Nearby States" section |
| Add descriptive anchor text to all internal links (not "Click here" or "Read More") | P2 | Dev | Easy | All `<a>` tags use descriptive text that includes target page keywords |
| Ensure blog articles internally link to relevant state pages | P2 | Content | Easy | Each blog post links to at least 1 state page where contextually relevant |

## Technical Debt (P2)

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| Add `sitemap.xml` lastmod from actual DB `updated_at` for states | P2 | Dev | Easy | State entries use real last-modified dates, not current date |
| Add `robots` meta tag to admin/404 pages (`noindex`) | P2 | Dev | Easy | `curl /admin` and 404 pages contain `<meta name="robots" content="noindex">` |
| Add image `alt` text audit — ensure all images have descriptive alt | P2 | Dev | Easy | No `<img>` tag has empty or missing `alt` attribute |
| Set up Google Search Console and submit sitemap | P2 | Owner | Easy | GSC shows sitemap submitted, coverage report available |

## QA & Monitoring (P3)

| Task | Priority | Owner | Difficulty | Acceptance Criteria |
|------|----------|-------|------------|---------------------|
| ~~Create automated SEO QA script (`script/seo-qa.sh`)~~ | P3 | Dev | Easy | ✅ Script checks all meta tags, schemas, sitemap, HTTP codes |
| Add rendering validation to QA script (Puppeteer check) | P3 | Dev | Medium | Script fetches page with headless Chrome, validates H1, link count, content presence |
| Add pre-deploy CI check: no page ships without title, description, canonical, H1, schema | P3 | Dev | Medium | CI pipeline fails if any page template missing required SEO elements |
| Monitor Google Search Console crawl stats weekly | P3 | Owner | Easy | Weekly review of coverage, crawl errors, indexing status |

---

## Key Architectural Decision Needed

**The #1 risk is that Google's JS renderer doesn't reliably see the full page content.** The current architecture injects `<head>` tags server-side but serves an empty `<body>` for all routes. Options:

1. **Full SSR migration** (e.g., switch to Next.js or add React SSR to Express) — highest impact, highest effort
2. **Pre-rendering / static generation** for key pages (homepage, state pages) — medium effort, good ROI
3. **Server-side HTML injection for body content** (extend current `injectMetaTags` to also inject key body content like state links, FAQ text) — lowest effort, partial coverage
4. **Dynamic rendering** (serve pre-rendered HTML to bot user-agents via Rendertron/Puppeteer middleware) — medium effort, proven pattern for SPAs

**Recommendation:** Start with option 3 (inject critical body content server-side for homepage + state pages) as a quick win, then evaluate option 2 or 4 based on GSC crawl data.
