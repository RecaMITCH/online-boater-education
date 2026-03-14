import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const boatingSnippets: Record<string, string> = {
  "alabama": "the Gulf Coast, Mobile Bay, and legendary bass fishing on Lake Guntersville",
  "alaska": "glacier-fed fjords, the Inside Passage, and remote wilderness waterways",
  "arizona": "desert lakes like Lake Powell, Lake Havasu, and the Colorado River",
  "arkansas": "over 600,000 acres of lakes including Beaver Lake and Bull Shoals",
  "california": "the Pacific coast, San Francisco Bay, Lake Tahoe, and the Sacramento Delta",
  "colorado": "stunning Rocky Mountain reservoirs and world-class whitewater rivers",
  "connecticut": "Long Island Sound, the Connecticut River, and Candlewood Lake",
  "delaware": "the Delaware Bay, Atlantic coast, and the scenic Inland Bays",
  "florida": "over 1,350 miles of coastline, the Florida Keys, and the Everglades",
  "georgia": "the Golden Isles, Lake Lanier, and Savannah's coastal waterways",
  "hawaii": "world-class ocean waters, Kona deep-sea fishing, and tropical paddling",
  "idaho": "pristine mountain lakes, the Salmon River, and Snake River jet-boating",
  "illinois": "Lake Michigan, the Chain O'Lakes, and the Mississippi River",
  "indiana": "Lake Michigan's shore, Monroe Lake, and the Ohio River",
  "iowa": "the Great Lakes of Iowa (Okoboji, Spirit Lake) and the Mississippi River",
  "kansas": "Milford Lake, Cheney Reservoir, and 24 federal reservoirs",
  "kentucky": "more navigable waterways than almost any state, plus Lake Cumberland and Kentucky Lake",
  "louisiana": "the Gulf Coast, bayou country, Lake Pontchartrain, and the Mississippi River",
  "maine": "3,500 miles of rugged coastline, Casco Bay, and Moosehead Lake",
  "maryland": "the Chesapeake Bay and Annapolis, the sailing capital of America",
  "massachusetts": "Cape Cod, Martha's Vineyard, Nantucket, and Boston Harbor",
  "michigan": "the Great Lakes, 11,000+ inland lakes, and endless coastline",
  "minnesota": "the Land of 10,000 Lakes, Boundary Waters, and Mille Lacs",
  "mississippi": "the Gulf Coast, Ross Barnett Reservoir, and the Mississippi River",
  "missouri": "Lake of the Ozarks, Table Rock Lake, and clear-water float streams",
  "montana": "Flathead Lake, Fort Peck, and legendary Montana rivers",
  "nebraska": "Lake McConaughy, Lewis and Clark Lake, and the Missouri River",
  "nevada": "Lake Mead, Lake Tahoe's Nevada shore, and Pyramid Lake",
  "new-hampshire": "Lake Winnipesaukee, Squam Lake, and the seacoast",
  "new-jersey": "the Jersey Shore, Barnegat Bay, and the Intracoastal Waterway",
  "new-mexico": "Elephant Butte Lake, Navajo Lake, and Southwest desert reservoirs",
  "new-york": "the Hudson River, Finger Lakes, Lake George, and Thousand Islands",
  "north-carolina": "the Outer Banks, Lake Norman, and the Crystal Coast",
  "north-dakota": "Lake Sakakawea, Devils Lake, and the Missouri River",
  "ohio": "Lake Erie's coastline, Put-in-Bay, and the Lake Erie Islands",
  "oklahoma": "over 200 man-made lakes including Grand Lake and Lake Texoma",
  "oregon": "Crater Lake, the Columbia River, and Pacific coast adventures",
  "pennsylvania": "Lake Erie, the Delaware River, and Raystown Lake",
  "rhode-island": "Narragansett Bay, Newport sailing, and Block Island Sound",
  "south-carolina": "Charleston's waterways, Hilton Head, Lake Murray, and the Lowcountry",
  "south-dakota": "Missouri River reservoirs, Lewis and Clark Lake, and Black Hills lakes",
  "tennessee": "TVA reservoirs, Norris Lake, Center Hill, and the Tennessee River",
  "texas": "the Gulf Coast, Lake Travis, Lake Texoma, and the Guadalupe River",
  "utah": "Lake Powell's red-rock canyons, Bear Lake, and Flaming Gorge",
  "vermont": "Lake Champlain's 120 miles of boating and the Green Mountain lakes",
  "virginia": "the Chesapeake Bay, Smith Mountain Lake, and Virginia Beach",
  "washington": "Puget Sound, San Juan Islands, and Lake Chelan",
  "west-virginia": "crystal-clear Summersville Lake and world-famous whitewater rivers",
  "wisconsin": "Door County, the Apostle Islands, Lake Geneva, and 15,000+ inland lakes",
  "wyoming": "Yellowstone Lake, Jackson Lake beneath the Tetons, and Flaming Gorge",
};

function generateGuideArticle(state: {
  name: string;
  slug: string;
  agency_name: string;
  agency_abbreviation: string | null;
  minimum_age: number | null;
  minimum_age_online_only: number | null;
  field_day_required: boolean;
  field_day_details: string | null;
  course_price: string | null;
  important_notes: string | null;
}) {
  const agency = state.agency_abbreviation || state.agency_name;
  const snippet = boatingSnippets[state.slug] || "diverse waterways and boating opportunities";
  const slug = `how-to-get-boater-education-certified-${state.slug}`;

  let intro: string;
  let certSection: string;

  if (state.minimum_age_online_only) {
    intro = `If you're looking to boat in ${state.name}, you'll need a boater education certificate. How you earn it depends on your age: boaters <strong>${state.minimum_age_online_only} and older</strong> can complete the entire course online, while younger boaters must also complete an on-water practical assessment.`;
    certSection = `
<h2>How to Get Certified in ${state.name}</h2>
<h3>Option 1: Online Only (Ages ${state.minimum_age_online_only}+)</h3>
<ol>
  <li>Enroll in a NASBLA-approved online course accepted by ${agency}</li>
  <li>Complete all course modules at your own pace (typically 4–6 hours)</li>
  <li>Pass the final exam</li>
  <li>Receive your ${state.name} Boater Education Certificate</li>
</ol>

<h3>Option 2: Online + Field Day (Ages ${state.minimum_age || "younger"} to ${state.minimum_age_online_only - 1})</h3>
<ol>
  <li>Complete the online course</li>
  <li>Register for and attend an on-water practical assessment (field day)</li>
  <li>Demonstrate safe boat handling and pass the hands-on evaluation</li>
  <li>Receive your certificate</li>
</ol>
<p>Not sure what a field day involves? Read our guide: <a href="/blog/what-to-expect-boating-safety-field-day">What to Expect at a Boating Safety Field Day</a>.</p>`;
  } else if (state.field_day_required) {
    intro = `${state.name} requires boaters to complete both a course and an in-person component to earn their boater education certificate. ${state.field_day_details || "An on-water practical assessment or proctored exam is required."} The course must be approved by the ${state.agency_name}.`;
    certSection = `
<h2>How to Get Certified in ${state.name}</h2>
<ol>
  <li>Complete the ${agency}-approved boater education course (online or classroom)</li>
  <li>Attend the required in-person component: ${state.field_day_details || "proctored exam or on-water assessment"}</li>
  <li>Pass all evaluations</li>
  <li>Receive your ${state.name} Boater Education Certificate</li>
</ol>
<p>Learn more about the in-person requirement: <a href="/blog/what-to-expect-boating-safety-field-day">What to Expect at a Boating Safety Field Day</a>.</p>`;
  } else {
    intro = `Great news for ${state.name} boaters: you can earn your boater education certificate <strong>entirely online</strong>. No in-person field day, classroom visit, or proctored exam is required. Simply complete a NASBLA-approved online course accepted by ${agency} and you're certified.`;
    certSection = `
<h2>How to Get Certified in ${state.name}</h2>
<ol>
  <li>Enroll in a NASBLA-approved online course accepted by ${agency}</li>
  <li>Complete all course modules at your own pace (typically 4–6 hours)</li>
  <li>Pass the final exam</li>
  <li>Receive your ${state.name} Boater Education Certificate — many providers offer instant digital certificates</li>
</ol>
<p>It's that simple. No field day or classroom visit required. See our list of <a href="/blog/10-states-complete-boater-education-online">states where you can complete boater education 100% online</a>.</p>`;
  }

  const content = `
<p>${intro}</p>

<h2>Who Needs Boater Education in ${state.name}?</h2>
<p>${state.important_notes || `${state.name} requires operators of motorized vessels to complete a boater education course approved by the ${state.agency_name}.`}</p>
${state.minimum_age ? `<p>The minimum age to take the boater education course is <strong>${state.minimum_age} years old</strong>.</p>` : ""}

${certSection}

<h2>What the Course Covers</h2>
<p>The ${agency}-approved boater education course covers:</p>
<ul>
  <li>Vessel types, operation, and handling</li>
  <li>Navigation rules and waterway markers</li>
  <li>${state.name}-specific boating laws and regulations</li>
  <li>Required safety equipment (life jackets, fire extinguishers, signals)</li>
  <li>Emergency procedures including man overboard and capsizing</li>
  <li>Weather awareness and trip planning</li>
  <li>Environmental responsibility and clean boating</li>
</ul>
${state.course_price ? `\n<h2>How Much Does It Cost?</h2>\n<p>The online boater education course for ${state.name} typically costs around <strong>${state.course_price}</strong>. This is a one-time fee — your certificate never expires.</p>` : ""}

<h2>Is My ${state.name} Certificate Valid in Other States?</h2>
<p>Yes! Because the course is NASBLA-approved, your ${state.name} Boater Education Certificate is <a href="/blog/boater-education-reciprocity-other-states">recognized in most other states through reciprocity</a>. This means you can boat in other states without taking a new course. Always check local regulations when boating out of state.</p>

<h2>Boating in ${state.name}</h2>
<p>${state.name} is known for ${snippet}. Whether you're fishing, cruising, wakeboarding, or exploring by kayak, getting your boater education certificate is the first step to enjoying ${state.name}'s waterways safely and legally.</p>
<p>For full details on ${state.name}'s requirements, visit our <a href="/states/${state.slug}">${state.name} boater education page</a>.</p>

<h2>Ready to Get Started?</h2>
<p>Visit our <a href="/states/${state.slug}">${state.name} boater education page</a> to find approved course providers and get certified today. The course takes just a few hours and can be completed entirely from your computer or phone.</p>
`;

  const excerpt = state.field_day_required
    ? `Learn how to get your ${state.name} boater education certificate. Find out about the ${agency}-approved course, in-person requirements, and how to get certified.`
    : `Learn how to get your ${state.name} boater education certificate online. ${agency}-approved, NASBLA-certified, and completable from home.`;

  return {
    title: `How to Get Your Boater Education Certificate in ${state.name}`,
    slug,
    excerpt,
    content,
    metaTitle: `How to Get Boater Education Certified in ${state.name} | Online Guide`,
    metaDescription: `Step-by-step guide to getting your ${state.name} boater education certificate. ${agency}-approved, NASBLA-certified course. Learn requirements, costs, and how to get certified.`,
  };
}

export async function seedStateGuideArticles(database: NodePgDatabase<any>) {
  console.log("Seeding state-specific guide articles...");

  const result = await database.execute(sql`
    SELECT slug, name, agency_name, agency_abbreviation, minimum_age,
           minimum_age_online_only, field_day_required, field_day_details,
           course_price, important_notes
    FROM states WHERE is_active = true
    ORDER BY name
  `);

  let created = 0;
  for (const row of result.rows as any[]) {
    const article = generateGuideArticle(row);

    // Check if already exists
    const existing = await database.execute(
      sql`SELECT id FROM articles WHERE slug = ${article.slug}`
    );
    if (existing.rows.length > 0) {
      continue;
    }

    await database.execute(sql`
      INSERT INTO articles (title, slug, excerpt, content, meta_title, meta_description, is_published, published_at, created_at, updated_at)
      VALUES (${article.title}, ${article.slug}, ${article.excerpt}, ${article.content}, ${article.metaTitle}, ${article.metaDescription}, true, NOW(), NOW(), NOW())
    `);
    created++;
    console.log(`  ✓ ${article.title}`);
  }

  console.log(`State guide articles seeded (${created} created).`);
}
