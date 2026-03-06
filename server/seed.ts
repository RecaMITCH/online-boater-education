import { db } from "./db";
import { states, articles } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  const existingStates = await db.select().from(states).limit(1);
  if (existingStates.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding boater education database...");

  const stateData = [
    {
      name: "Alabama",
      abbreviation: "AL",
      slug: "alabama",
      description: "Online-only boater education course approved by the Alabama Marine Police Division and NASBLA.",
      agencyName: "Alabama Marine Police Division",
      agencyAbbreviation: "AMPD",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/alabama/",
      isActive: true,
    },
    {
      name: "Alaska",
      abbreviation: "AK",
      slug: "alaska",
      description: "Online boater education course. No boating safety education requirement for most operators.",
      agencyName: "Alaska Office of Boating Safety",
      agencyAbbreviation: "OBS",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/alaska/",
      isActive: true,
    },
    {
      name: "Arizona",
      abbreviation: "AZ",
      slug: "arizona",
      description: "Online-only boater education course for Arizona's lakes and waterways. Fully online, no practical component required.",
      agencyName: "Arizona Game and Fish Department",
      agencyAbbreviation: "AZGFD",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/arizona/",
      isActive: true,
    },
    {
      name: "Arkansas",
      abbreviation: "AR",
      slug: "arkansas",
      description: "Online-only boater education course approved by the Arkansas Game and Fish Commission and NASBLA.",
      agencyName: "Arkansas Game and Fish Commission",
      agencyAbbreviation: "AGFC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/arkansas/",
      isActive: true,
    },
    {
      name: "California",
      abbreviation: "CA",
      slug: "california",
      description: "Online-only boater education course approved by California Division of Boating and Waterways and NASBLA.",
      agencyName: "California Division of Boating and Waterways",
      agencyAbbreviation: "DBW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/california/",
      isActive: true,
    },
    {
      name: "Colorado",
      abbreviation: "CO",
      slug: "colorado",
      description: "Online-only boater education course approved by Colorado Parks and Wildlife and NASBLA.",
      agencyName: "Colorado Parks and Wildlife",
      agencyAbbreviation: "CPW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/colorado/",
      isActive: true,
    },
    {
      name: "Connecticut",
      abbreviation: "CT",
      slug: "connecticut",
      description: "Online-only boater education course approved by Connecticut DEEP and NASBLA. Required for all boat operators.",
      agencyName: "Connecticut Department of Energy and Environmental Protection",
      agencyAbbreviation: "DEEP",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/connecticut/",
      isActive: true,
    },
    {
      name: "Delaware",
      abbreviation: "DE",
      slug: "delaware",
      description: "Online-only boater education course approved by Delaware DNREC and NASBLA.",
      agencyName: "Delaware Department of Natural Resources and Environmental Control",
      agencyAbbreviation: "DNREC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/delaware/",
      isActive: true,
    },
    {
      name: "Florida",
      abbreviation: "FL",
      slug: "florida",
      description: "Online-only boater education course approved by Florida FWC and NASBLA. Required for boaters born after January 1, 1988.",
      agencyName: "Florida Fish and Wildlife Conservation Commission",
      agencyAbbreviation: "FWC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/florida/",
      importantNotes: "Florida requires boater education for anyone operating a motorized vessel born after January 1, 1988.",
      isActive: true,
    },
    {
      name: "Georgia",
      abbreviation: "GA",
      slug: "georgia",
      description: "Online-only boater education course approved by Georgia Department of Natural Resources and NASBLA.",
      agencyName: "Georgia Department of Natural Resources",
      agencyAbbreviation: "DNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/georgia/",
      isActive: true,
    },
    {
      name: "Hawaii",
      abbreviation: "HI",
      slug: "hawaii",
      description: "Online boater education course approved by Hawaii Department of Land and Natural Resources and NASBLA.",
      agencyName: "Hawaii Department of Land and Natural Resources",
      agencyAbbreviation: "DLNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/hawaii/",
      importantNotes: "Hawaii requires boating safety education for all vessel operators.",
      isActive: true,
    },
    {
      name: "Idaho",
      abbreviation: "ID",
      slug: "idaho",
      description: "Online boater education course. No statewide boating safety education requirement.",
      agencyName: "Idaho Department of Fish and Game",
      agencyAbbreviation: "IDFG",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/idaho/",
      isActive: true,
    },
    {
      name: "Illinois",
      abbreviation: "IL",
      slug: "illinois",
      description: "Online-only boater education course approved by Illinois Department of Natural Resources and NASBLA.",
      agencyName: "Illinois Department of Natural Resources",
      agencyAbbreviation: "IDNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/illinois/",
      importantNotes: "Illinois requires boating safety education for operators under age 16.",
      isActive: true,
    },
    {
      name: "Indiana",
      abbreviation: "IN",
      slug: "indiana",
      description: "Online-only boater education course approved by Indiana Division of Fish and Wildlife and NASBLA.",
      agencyName: "Indiana Division of Fish and Wildlife",
      agencyAbbreviation: "DFW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/indiana/",
      isActive: true,
    },
    {
      name: "Iowa",
      abbreviation: "IA",
      slug: "iowa",
      description: "Online-only boater education course approved by Iowa Department of Natural Resources and NASBLA.",
      agencyName: "Iowa Department of Natural Resources",
      agencyAbbreviation: "IDNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/iowa/",
      importantNotes: "Iowa requires boating safety education for operators under age 18.",
      isActive: true,
    },
    {
      name: "Kansas",
      abbreviation: "KS",
      slug: "kansas",
      description: "Online-only boater education course approved by Kansas Department of Wildlife and Parks and NASBLA.",
      agencyName: "Kansas Department of Wildlife and Parks",
      agencyAbbreviation: "KDWP",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/kansas/",
      isActive: true,
    },
    {
      name: "Kentucky",
      abbreviation: "KY",
      slug: "kentucky",
      description: "Online-only boater education course approved by Kentucky Department of Fish and Wildlife Resources and NASBLA.",
      agencyName: "Kentucky Department of Fish and Wildlife Resources",
      agencyAbbreviation: "FWR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/kentucky/",
      isActive: true,
    },
    {
      name: "Louisiana",
      abbreviation: "LA",
      slug: "louisiana",
      description: "Online-only boater education course approved by Louisiana Department of Wildlife and Fisheries and NASBLA.",
      agencyName: "Louisiana Department of Wildlife and Fisheries",
      agencyAbbreviation: "LDWF",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/louisiana/",
      isActive: true,
    },
    {
      name: "Maine",
      abbreviation: "ME",
      slug: "maine",
      description: "Online-only boater education course approved by Maine Department of Inland Fisheries and Wildlife and NASBLA.",
      agencyName: "Maine Department of Inland Fisheries and Wildlife",
      agencyAbbreviation: "DIFW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/maine/",
      importantNotes: "Maine requires boating safety education for operators under age 16.",
      isActive: true,
    },
    {
      name: "Maryland",
      abbreviation: "MD",
      slug: "maryland",
      description: "Online-only boater education course approved by Maryland Department of Natural Resources and NASBLA.",
      agencyName: "Maryland Department of Natural Resources",
      agencyAbbreviation: "DNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/maryland/",
      isActive: true,
    },
    {
      name: "Massachusetts",
      abbreviation: "MA",
      slug: "massachusetts",
      description: "Online-only boater education course approved by Massachusetts Division of Marine Fisheries and NASBLA.",
      agencyName: "Massachusetts Division of Marine Fisheries",
      agencyAbbreviation: "DMF",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/massachusetts/",
      isActive: true,
    },
    {
      name: "Michigan",
      abbreviation: "MI",
      slug: "michigan",
      description: "Online-only boater education course approved by Michigan Department of Natural Resources and NASBLA.",
      agencyName: "Michigan Department of Natural Resources",
      agencyAbbreviation: "MDNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/michigan/",
      importantNotes: "Michigan requires boating safety education for operators under age 16.",
      isActive: true,
    },
    {
      name: "Minnesota",
      abbreviation: "MN",
      slug: "minnesota",
      description: "Online-only boater education course approved by Minnesota Department of Natural Resources and NASBLA.",
      agencyName: "Minnesota Department of Natural Resources",
      agencyAbbreviation: "DNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/minnesota/",
      importantNotes: "Minnesota requires boating safety education for operators under age 13.",
      isActive: true,
    },
    {
      name: "Mississippi",
      abbreviation: "MS",
      slug: "mississippi",
      description: "Online-only boater education course approved by Mississippi Department of Wildlife, Fisheries and Parks and NASBLA.",
      agencyName: "Mississippi Department of Wildlife, Fisheries and Parks",
      agencyAbbreviation: "MDWFP",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/mississippi/",
      isActive: true,
    },
    {
      name: "Missouri",
      abbreviation: "MO",
      slug: "missouri",
      description: "Online-only boater education course approved by Missouri Department of Conservation and NASBLA.",
      agencyName: "Missouri Department of Conservation",
      agencyAbbreviation: "MDC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/missouri/",
      isActive: true,
    },
    {
      name: "Montana",
      abbreviation: "MT",
      slug: "montana",
      description: "Online-only boater education course approved by Montana Fish, Wildlife and Parks and NASBLA.",
      agencyName: "Montana Fish, Wildlife and Parks",
      agencyAbbreviation: "FWP",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/montana/",
      isActive: true,
    },
    {
      name: "Nebraska",
      abbreviation: "NE",
      slug: "nebraska",
      description: "Online-only boater education course approved by Nebraska Game and Parks Commission and NASBLA.",
      agencyName: "Nebraska Game and Parks Commission",
      agencyAbbreviation: "NGPC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/nebraska/",
      isActive: true,
    },
    {
      name: "Nevada",
      abbreviation: "NV",
      slug: "nevada",
      description: "Online-only boater education course approved by Nevada Department of Wildlife and NASBLA.",
      agencyName: "Nevada Department of Wildlife",
      agencyAbbreviation: "NDOW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/nevada/",
      isActive: true,
    },
    {
      name: "New Hampshire",
      abbreviation: "NH",
      slug: "new-hampshire",
      description: "Online-only boater education course approved by New Hampshire Fish and Game Department and NASBLA.",
      agencyName: "New Hampshire Fish and Game Department",
      agencyAbbreviation: "NHFG",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/new-hampshire/",
      importantNotes: "New Hampshire requires boating safety education for operators under age 16.",
      isActive: true,
    },
    {
      name: "New Jersey",
      abbreviation: "NJ",
      slug: "new-jersey",
      description: "Online-only boater education course approved by New Jersey Division of Fish and Wildlife and NASBLA.",
      agencyName: "New Jersey Division of Fish and Wildlife",
      agencyAbbreviation: "NJDFW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/new-jersey/",
      importantNotes: "New Jersey requires boating safety education for operators under age 14.",
      isActive: true,
    },
    {
      name: "New Mexico",
      abbreviation: "NM",
      slug: "new-mexico",
      description: "Online-only boater education course approved by New Mexico Department of Game and Fish and NASBLA.",
      agencyName: "New Mexico Department of Game and Fish",
      agencyAbbreviation: "NMDGF",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/new-mexico/",
      importantNotes: "New Mexico requires boating safety education for operators under age 18.",
      isActive: true,
    },
    {
      name: "New York",
      abbreviation: "NY",
      slug: "new-york",
      description: "Online-only boater education course approved by New York State Parks and NASBLA.",
      agencyName: "New York State Parks",
      agencyAbbreviation: "NYSP",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/new-york/",
      importantNotes: "New York requires boating safety education for all operators under age 15.",
      isActive: true,
    },
    {
      name: "North Carolina",
      abbreviation: "NC",
      slug: "north-carolina",
      description: "Online-only boater education course approved by North Carolina Wildlife Resources Commission and NASBLA.",
      agencyName: "North Carolina Wildlife Resources Commission",
      agencyAbbreviation: "NCWRC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/north-carolina/",
      isActive: true,
    },
    {
      name: "North Dakota",
      abbreviation: "ND",
      slug: "north-dakota",
      description: "Online boater education course. No statewide boating safety education requirement.",
      agencyName: "North Dakota Game and Fish Department",
      agencyAbbreviation: "NDGF",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/north-dakota/",
      isActive: true,
    },
    {
      name: "Ohio",
      abbreviation: "OH",
      slug: "ohio",
      description: "Online-only boater education course approved by Ohio Division of Wildlife and NASBLA.",
      agencyName: "Ohio Division of Wildlife",
      agencyAbbreviation: "ODW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/ohio/",
      importantNotes: "Ohio requires boating safety education for all operators.",
      isActive: true,
    },
    {
      name: "Oklahoma",
      abbreviation: "OK",
      slug: "oklahoma",
      description: "Online-only boater education course approved by Oklahoma Department of Wildlife Conservation and NASBLA.",
      agencyName: "Oklahoma Department of Wildlife Conservation",
      agencyAbbreviation: "ODWC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/oklahoma/",
      isActive: true,
    },
    {
      name: "Oregon",
      abbreviation: "OR",
      slug: "oregon",
      description: "Online-only boater education course approved by Oregon Department of Fish and Wildlife and NASBLA.",
      agencyName: "Oregon Department of Fish and Wildlife",
      agencyAbbreviation: "ODFW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/oregon/",
      importantNotes: "Oregon requires boating safety education for operators under age 16.",
      isActive: true,
    },
    {
      name: "Pennsylvania",
      abbreviation: "PA",
      slug: "pennsylvania",
      description: "Online-only boater education course approved by Pennsylvania Fish and Boat Commission and NASBLA.",
      agencyName: "Pennsylvania Fish and Boat Commission",
      agencyAbbreviation: "PFBC",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/pennsylvania/",
      importantNotes: "Pennsylvania requires boating safety education for operators under age 12.",
      isActive: true,
    },
    {
      name: "Rhode Island",
      abbreviation: "RI",
      slug: "rhode-island",
      description: "Online-only boater education course approved by Rhode Island Department of Environmental Management and NASBLA.",
      agencyName: "Rhode Island Department of Environmental Management",
      agencyAbbreviation: "RIDEM",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/rhode-island/",
      isActive: true,
    },
    {
      name: "South Carolina",
      abbreviation: "SC",
      slug: "south-carolina",
      description: "Online-only boater education course approved by South Carolina Department of Natural Resources and NASBLA.",
      agencyName: "South Carolina Department of Natural Resources",
      agencyAbbreviation: "SCDNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/south-carolina/",
      isActive: true,
    },
    {
      name: "South Dakota",
      abbreviation: "SD",
      slug: "south-dakota",
      description: "Online boater education course. No statewide boating safety education requirement.",
      agencyName: "South Dakota Game, Fish and Parks",
      agencyAbbreviation: "SDGFP",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/south-dakota/",
      isActive: true,
    },
    {
      name: "Tennessee",
      abbreviation: "TN",
      slug: "tennessee",
      description: "Online-only boater education course approved by Tennessee Wildlife Resources Agency and NASBLA.",
      agencyName: "Tennessee Wildlife Resources Agency",
      agencyAbbreviation: "TWRA",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/tennessee/",
      isActive: true,
    },
    {
      name: "Texas",
      abbreviation: "TX",
      slug: "texas",
      description: "Online-only boater education course approved by Texas Parks and Wildlife Department and NASBLA.",
      agencyName: "Texas Parks and Wildlife Department",
      agencyAbbreviation: "TPWD",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/texas/",
      importantNotes: "Texas requires boating safety education for all boat operators.",
      isActive: true,
    },
    {
      name: "Utah",
      abbreviation: "UT",
      slug: "utah",
      description: "Online-only boater education course approved by Utah Division of Wildlife Resources and NASBLA.",
      agencyName: "Utah Division of Wildlife Resources",
      agencyAbbreviation: "UDWR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/utah/",
      isActive: true,
    },
    {
      name: "Vermont",
      abbreviation: "VT",
      slug: "vermont",
      description: "Online-only boater education course approved by Vermont Fish and Wildlife Department and NASBLA.",
      agencyName: "Vermont Fish and Wildlife Department",
      agencyAbbreviation: "VFWD",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/vermont/",
      importantNotes: "Vermont requires boating safety education for operators under age 16.",
      isActive: true,
    },
    {
      name: "Virginia",
      abbreviation: "VA",
      slug: "virginia",
      description: "Online-only boater education course approved by Virginia Department of Wildlife Resources and NASBLA.",
      agencyName: "Virginia Department of Wildlife Resources",
      agencyAbbreviation: "DWR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/virginia/",
      isActive: true,
    },
    {
      name: "Washington",
      abbreviation: "WA",
      slug: "washington",
      description: "Online-only boater education course approved by Washington Department of Fish and Wildlife and NASBLA.",
      agencyName: "Washington Department of Fish and Wildlife",
      agencyAbbreviation: "WDFW",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/washington/",
      isActive: true,
    },
    {
      name: "West Virginia",
      abbreviation: "WV",
      slug: "west-virginia",
      description: "Online-only boater education course approved by West Virginia Division of Natural Resources and NASBLA.",
      agencyName: "West Virginia Division of Natural Resources",
      agencyAbbreviation: "WVDNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/west-virginia/",
      isActive: true,
    },
    {
      name: "Wisconsin",
      abbreviation: "WI",
      slug: "wisconsin",
      description: "Online-only boater education course approved by Wisconsin Department of Natural Resources and NASBLA.",
      agencyName: "Wisconsin Department of Natural Resources",
      agencyAbbreviation: "WDNR",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/wisconsin/",
      importantNotes: "Wisconsin requires boating safety education for operators under age 12.",
      isActive: true,
    },
    {
      name: "Wyoming",
      abbreviation: "WY",
      slug: "wyoming",
      description: "Online boater education course. No statewide boating safety education requirement.",
      agencyName: "Wyoming Game and Fish Department",
      agencyAbbreviation: "WGFD",
      fieldDayRequired: false,
      courseUrl: "https://recademics.com/boating/wyoming/",
      isActive: true,
    },
  ];

  await db.insert(states).values(stateData);

  const articleData = [
    {
      title: "What to Expect from Your Online Boater Education Course",
      slug: "what-to-expect-online-boater-education",
      excerpt: "A complete guide to what you'll learn in your online boater education course, from navigation rules to safe boat operation and water safety.",
      content: `<h2>Getting Started with Online Boater Education</h2>
<p>Online boater education courses are designed to teach you everything you need to know to become a safe and responsible boat operator. Whether you're a first-time boater or looking to get certified in a new state, here's what to expect.</p>

<h3>Course Topics</h3>
<p>Most state-approved online boater education courses cover these essential topics:</p>
<ul>
<li><strong>Navigation Rules</strong> - Learn the rules of the water, including right-of-way, proper signaling, and collision avoidance.</li>
<li><strong>Boat Operation</strong> - Understand how to safely operate different types of boats and manage vessel controls.</li>
<li><strong>Personal Flotation Devices (PFDs)</strong> - Learn why life jackets are essential and how to choose and wear them properly.</li>
<li><strong>Boating Laws and Regulations</strong> - Each state has specific rules about licensing, age requirements, and safety regulations.</li>
<li><strong>Water Safety</strong> - Weather awareness, emergency procedures, and what to do if someone falls overboard.</li>
<li><strong>Alcohol and Boating Laws</strong> - Understand the dangers of operating a vessel under the influence.</li>
</ul>

<h3>How Long Does It Take?</h3>
<p>Most online courses take between 3-4 hours to complete. The great thing about online courses is that you can work at your own pace and save your progress along the way.</p>

<h3>Practical Component Requirements</h3>
<p>Most boating safety courses are entirely online with no in-person practical component required. This makes it convenient to get certified quickly and easily.</p>

<h3>Getting Your Certificate</h3>
<p>Once you've completed the course, you'll receive your boater education certificate. This certificate is typically valid for life and is recognized by all 50 states under reciprocity agreements managed by NASBLA.</p>`,
      coverImageUrl: "/images/water-bg.png",
      isPublished: true,
      publishedAt: new Date("2025-12-15"),
    },
    {
      title: "Understanding Life Jackets and Personal Flotation Devices",
      slug: "life-jackets-pfd-guide",
      excerpt: "Life jackets are the most important piece of safety equipment for any boater. Learn why they save lives and how to choose the right PFD for your needs.",
      content: `<h2>Why Life Jackets Matter</h2>
<p>Personal Flotation Devices (PFDs), commonly known as life jackets, are the single most important safety tool for boaters. Statistics show that PFDs save lives every single day on America's waterways.</p>

<h3>Types of PFDs</h3>
<p>There are five different types of approved PFDs, each designed for different boating activities:</p>
<ul>
<li><strong>Type I</strong> - Offshore Life Jackets: Highest flotation, turns most unconscious wearers face-up in water</li>
<li><strong>Type II</strong> - Near-Shore Buoyant Vests: Good flotation, some turning capability</li>
<li><strong>Type III</strong> - Flotation Aids: Comfortable for extended wear, popular for recreational boating</li>
<li><strong>Type IV</strong> - Throwable Devices: Seat cushions and ring buoys, not meant to be worn</li>
<li><strong>Type V</strong> - Special Use Devices: Designed for specific water sports like wakeboarding</li>
</ul>

<h3>Choosing the Right PFD</h3>
<p>The best PFD is the one you'll actually wear. Consider comfort, fit, and the type of boating you'll be doing. Make sure your PFD is Coast Guard approved and is in good condition before every trip.</p>

<h3>Making PFDs a Habit</h3>
<p>Wear your PFD every time you're on the water, regardless of your swimming ability or how calm the conditions seem. Many boating accidents happen to experienced boaters who weren't wearing proper safety equipment.</p>`,
      isPublished: true,
      publishedAt: new Date("2026-01-10"),
    },
    {
      title: "Top 5 Tips for New Boaters",
      slug: "top-5-tips-new-boaters",
      excerpt: "Starting your boating journey? These five essential tips will help you prepare for a safe and enjoyable experience on the water.",
      content: `<h2>Essential Tips for New Boaters</h2>
<p>Boating is a wonderful outdoor recreational activity that connects you with family and friends. If you're just getting started, these tips will help set you up for success and safety on the water.</p>

<h3>1. Complete Your Boater Education First</h3>
<p>Before you head out on the water, make sure you've completed your state-required boater education course. This isn't just a legal requirement - it's genuinely valuable training that will make you a safer, more confident boat operator.</p>

<h3>2. Always Wear Your Life Jacket</h3>
<p>Make it a habit to wear your PFD every time you're on the water. It's the single most important safety device on your boat. Ensure everyone aboard, including children, has a properly fitting, Coast Guard-approved life jacket.</p>

<h3>3. Know the Rules of the Water</h3>
<p>Just like drivers follow traffic laws, boaters must follow Navigation Rules. Learn right-of-way situations, proper signaling, and how to communicate with other vessels. Understanding these rules prevents collisions and keeps everyone safe.</p>

<h3>4. Check Weather and Plan Your Route</h3>
<p>Always check the weather forecast before heading out. Be aware of water conditions, currents, and wind. File a float plan with someone on shore so they know where you're going and when to expect you back.</p>

<h3>5. Maintain Your Vessel and Equipment</h3>
<p>Regular maintenance keeps your boat running safely and reliably. Check fuel, water, and safety equipment before each trip. Keep your boat properly registered and documented, and familiarize yourself with all safety equipment aboard.</p>

<p>Remember, boating is about enjoying time on the water responsibly. Prioritize safety, and you'll create wonderful memories for years to come.</p>`,
      isPublished: true,
      publishedAt: new Date("2026-02-01"),
    },
  ];

  await db.insert(articles).values(articleData);

  console.log("Boater education database seeded successfully!");
}
