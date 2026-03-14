import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import fs from "fs";
import path from "path";

// Ocean/water-themed color palettes for boating
const palettes = [
  { from: "#0c3547", to: "#1a5276", accent: "#2980b9" }, // deep ocean
  { from: "#0d3b4f", to: "#1b6b7a", accent: "#2eafc2" }, // teal bay
  { from: "#0b2e3e", to: "#164a5f", accent: "#2d7d9a" }, // maritime blue
  { from: "#10375a", to: "#1e5f8a", accent: "#3498db" }, // bright sea
  { from: "#0f2b3c", to: "#1a4a5e", accent: "#2c7da0" }, // harbor blue
  { from: "#0a3049", to: "#185a6e", accent: "#2193b0" }, // coastal
  { from: "#122742", to: "#1e4566", accent: "#2b6ea8" }, // navy depth
  { from: "#0e3350", to: "#1c5a78", accent: "#2e86ab" }, // pacific
  { from: "#0b2940", to: "#174d68", accent: "#247ba0" }, // lake blue
  { from: "#0d2f45", to: "#1b556a", accent: "#2a7f9e" }, // inlet blue
];

function generateStateSvg(name: string, abbreviation: string, paletteIndex: number): string {
  const p = palettes[paletteIndex % palettes.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" width="900" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${p.from}"/>
      <stop offset="100%" style="stop-color:${p.to}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="300" fill="url(#bg)"/>
  <!-- Wave shapes -->
  <path d="M0 220 Q150 190 300 220 T600 220 T900 220 V300 H0Z" fill="${p.accent}" opacity="0.12"/>
  <path d="M0 240 Q150 210 300 240 T600 240 T900 240 V300 H0Z" fill="${p.accent}" opacity="0.15"/>
  <path d="M0 260 Q150 230 300 260 T600 260 T900 260 V300 H0Z" fill="${p.accent}" opacity="0.10"/>
  <!-- Boat silhouette -->
  <g transform="translate(720, 160)" opacity="0.08">
    <polygon points="0,40 80,40 90,20 70,0 10,0 -10,20" fill="white"/>
    <rect x="35" y="-30" width="4" height="30" fill="white"/>
    <polygon points="39,-30 39,0 70,-10" fill="white"/>
  </g>
  <!-- State abbreviation background -->
  <text x="50" y="140" font-family="Arial,sans-serif" font-size="120" font-weight="bold" fill="white" opacity="0.06">${abbreviation}</text>
  <!-- Semi-transparent bar -->
  <rect y="190" width="900" height="110" fill="${p.accent}" opacity="0.18"/>
  <!-- State name -->
  <text x="450" y="240" font-family="Georgia,serif" font-size="36" font-weight="bold" fill="white" opacity="0.95" text-anchor="middle">${name}</text>
  <!-- Subtitle -->
  <text x="450" y="270" font-family="Arial,sans-serif" font-size="16" fill="white" opacity="0.70" text-anchor="middle">Boater Education Certification Guide</text>
</svg>`;
}

function generateTopicSvg(title: string, iconType: string, paletteIndex: number): string {
  const p = palettes[paletteIndex % palettes.length];

  // Simple icon shapes based on topic
  let iconSvg = "";
  switch (iconType) {
    case "license":
      iconSvg = `<rect x="380" y="40" width="140" height="90" rx="8" fill="white" opacity="0.12"/>
        <rect x="395" y="55" width="50" height="50" rx="4" fill="white" opacity="0.08"/>
        <rect x="455" y="60" width="50" height="8" rx="2" fill="white" opacity="0.08"/>
        <rect x="455" y="78" width="40" height="6" rx="2" fill="white" opacity="0.06"/>
        <rect x="455" y="94" width="45" height="6" rx="2" fill="white" opacity="0.06"/>`;
      break;
    case "map":
      iconSvg = `<circle cx="450" cy="80" r="50" fill="white" opacity="0.08" stroke="white" stroke-opacity="0.12" stroke-width="2"/>
        <circle cx="450" cy="80" r="6" fill="white" opacity="0.15"/>
        <path d="M450 74 L450 50" stroke="white" stroke-opacity="0.12" stroke-width="2"/>
        <path d="M430 95 L470 65" stroke="white" stroke-opacity="0.06" stroke-width="1"/>`;
      break;
    case "clipboard":
      iconSvg = `<rect x="405" y="30" width="90" height="110" rx="6" fill="white" opacity="0.10"/>
        <rect x="425" y="24" width="50" height="16" rx="4" fill="white" opacity="0.12"/>
        <rect x="420" y="60" width="60" height="6" rx="2" fill="white" opacity="0.06"/>
        <rect x="420" y="78" width="50" height="6" rx="2" fill="white" opacity="0.06"/>
        <rect x="420" y="96" width="55" height="6" rx="2" fill="white" opacity="0.06"/>
        <rect x="420" y="114" width="40" height="6" rx="2" fill="white" opacity="0.06"/>`;
      break;
    case "shield":
      iconSvg = `<path d="M450 30 L500 55 L500 100 Q500 130 450 150 Q400 130 400 100 L400 55 Z" fill="white" opacity="0.10"/>
        <path d="M450 60 L435 85 L445 85 L440 110 L470 78 L458 78 L468 60 Z" fill="white" opacity="0.08"/>`;
      break;
    case "lifejacket":
      iconSvg = `<ellipse cx="450" cy="85" rx="40" ry="50" fill="white" opacity="0.08"/>
        <ellipse cx="450" cy="85" rx="20" ry="30" fill="${p.from}" opacity="0.3"/>
        <rect x="430" y="50" width="40" height="12" rx="6" fill="white" opacity="0.10"/>`;
      break;
    case "warning":
      iconSvg = `<polygon points="450,30 510,130 390,130" fill="none" stroke="white" stroke-opacity="0.12" stroke-width="3"/>
        <rect x="446" y="60" width="8" height="40" rx="2" fill="white" opacity="0.10"/>
        <circle cx="450" cy="115" r="5" fill="white" opacity="0.10"/>`;
      break;
    case "wave":
      iconSvg = `<path d="M370 70 Q410 40 450 70 T530 70" fill="none" stroke="white" stroke-opacity="0.15" stroke-width="4"/>
        <path d="M370 95 Q410 65 450 95 T530 95" fill="none" stroke="white" stroke-opacity="0.10" stroke-width="3"/>
        <path d="M380 120 Q420 90 460 120 T540 120" fill="none" stroke="white" stroke-opacity="0.07" stroke-width="2"/>`;
      break;
    default:
      iconSvg = `<circle cx="450" cy="80" r="40" fill="white" opacity="0.08"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" width="900" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${p.from}"/>
      <stop offset="100%" style="stop-color:${p.to}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="300" fill="url(#bg)"/>
  <!-- Wave shapes -->
  <path d="M0 220 Q150 190 300 220 T600 220 T900 220 V300 H0Z" fill="${p.accent}" opacity="0.12"/>
  <path d="M0 240 Q150 210 300 240 T600 240 T900 240 V300 H0Z" fill="${p.accent}" opacity="0.15"/>
  <!-- Topic icon -->
  ${iconSvg}
  <!-- Semi-transparent bar -->
  <rect y="190" width="900" height="110" fill="${p.accent}" opacity="0.18"/>
  <!-- Title -->
  <text x="450" y="245" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="white" opacity="0.95" text-anchor="middle">${title}</text>
  <!-- Subtitle -->
  <text x="450" y="275" font-family="Arial,sans-serif" font-size="14" fill="white" opacity="0.65" text-anchor="middle">Online Boater Education</text>
</svg>`;
}

const coreArticleImages: Record<string, { title: string; icon: string; palette: number }> = {
  "do-i-need-a-boating-license": { title: "Do I Need a Boating License?", icon: "license", palette: 0 },
  "boater-education-reciprocity-other-states": { title: "Boater Education Reciprocity", icon: "map", palette: 1 },
  "what-to-expect-boating-safety-field-day": { title: "Boating Safety Field Day Guide", icon: "clipboard", palette: 2 },
  "10-states-complete-boater-education-online": { title: "States With 100% Online Boater Ed", icon: "shield", palette: 3 },
  "boating-safety-101-essential-tips": { title: "Boating Safety 101", icon: "wave", palette: 4 },
  "pwc-jet-ski-safety-guide": { title: "PWC & Jet Ski Safety", icon: "wave", palette: 5 },
  "how-to-choose-right-life-jacket-pfd": { title: "Choosing the Right Life Jacket", icon: "lifejacket", palette: 6 },
  "boating-under-the-influence-bui-laws": { title: "BUI Laws & Penalties", icon: "warning", palette: 7 },
};

export async function seedArticleImages(database: NodePgDatabase<any>) {
  console.log("Generating article cover images...");

  const statesDir = path.resolve(process.cwd(), "client/public/images/states");
  const topicsDir = path.resolve(process.cwd(), "client/public/images/topics");

  if (!fs.existsSync(statesDir)) fs.mkdirSync(statesDir, { recursive: true });
  if (!fs.existsSync(topicsDir)) fs.mkdirSync(topicsDir, { recursive: true });

  // Generate state SVGs
  const statesResult = await database.execute(sql`
    SELECT id, slug, name, abbreviation FROM states WHERE is_active = true ORDER BY name
  `);

  let stateCount = 0;
  for (let i = 0; i < statesResult.rows.length; i++) {
    const state = statesResult.rows[i] as any;
    const svgPath = path.join(statesDir, `${state.slug}.svg`);
    const svgContent = generateStateSvg(state.name, state.abbreviation, i);
    fs.writeFileSync(svgPath, svgContent);

    // Update the state guide article
    const articleSlug = `how-to-get-boater-education-certified-${state.slug}`;
    const imageUrl = `/images/states/${state.slug}.svg`;
    const result = await database.execute(sql`
      UPDATE articles SET cover_image_url = ${imageUrl}
      WHERE slug = ${articleSlug} AND (cover_image_url IS NULL OR cover_image_url = '')
    `);
    if ((result as any).rowCount > 0) stateCount++;
  }
  console.log(`  ✓ ${statesResult.rows.length} state SVGs generated, ${stateCount} articles updated`);

  // Generate topic SVGs for core articles
  let topicCount = 0;
  for (const [slug, info] of Object.entries(coreArticleImages)) {
    const svgPath = path.join(topicsDir, `${slug}.svg`);
    const svgContent = generateTopicSvg(info.title, info.icon, info.palette);
    fs.writeFileSync(svgPath, svgContent);

    const imageUrl = `/images/topics/${slug}.svg`;
    const result = await database.execute(sql`
      UPDATE articles SET cover_image_url = ${imageUrl}
      WHERE slug = ${slug} AND (cover_image_url IS NULL OR cover_image_url = '')
    `);
    if ((result as any).rowCount > 0) topicCount++;
  }
  console.log(`  ✓ ${Object.keys(coreArticleImages).length} topic SVGs generated, ${topicCount} articles updated`);

  console.log("Article cover images complete.");
}
