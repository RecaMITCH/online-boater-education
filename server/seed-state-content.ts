import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const boatingHighlights: Record<string, string> = {
  "alabama": "Alabama offers exceptional boating on the Gulf Coast, Mobile Bay, and over 500,000 acres of public water. Lake Guntersville, Wheeler Lake, and the Tennessee River system provide outstanding freshwater boating, while Gulf Shores and Orange Beach offer saltwater adventures.",
  "alaska": "Alaska is a boater's paradise with over 33,000 miles of coastline, glacier-fed fjords, and thousands of remote lakes and rivers. From Prince William Sound to the Inside Passage, boating in Alaska ranges from ocean kayaking to salmon-fishing expeditions on world-class rivers.",
  "arizona": "Arizona's desert lakes — including Lake Powell, Lake Havasu, and Roosevelt Lake — offer spectacular boating amid red-rock canyon scenery. Lake Havasu is particularly popular for houseboating, while the Colorado River provides miles of water recreation.",
  "arkansas": "Arkansas boasts over 600,000 acres of lakes and 9,700 miles of streams. Beaver Lake, Bull Shoals, Greers Ferry Lake, and the Buffalo National River offer diverse boating experiences from bass fishing to whitewater paddling in the Natural State.",
  "california": "California's boating scene is unmatched: the Pacific coastline, San Francisco Bay, Lake Tahoe, the Sacramento-San Joaquin Delta, and hundreds of inland lakes. From whale-watching off Monterey to wakeboarding on Lake Shasta, California has it all.",
  "colorado": "Colorado's mountain reservoirs — Blue Mesa, Dillon, Grand Lake, and Navajo — offer high-altitude boating surrounded by stunning Rocky Mountain scenery. Whitewater rafting on the Arkansas, Colorado, and Gunnison rivers is also world-class.",
  "connecticut": "Connecticut provides diverse boating on Long Island Sound, the Connecticut River, and numerous inland lakes. Mystic, Stonington, and the Thimble Islands are popular coastal destinations, while Candlewood Lake and Lake Zoar offer freshwater recreation.",
  "delaware": "Delaware's boating centers on the Delaware Bay, Atlantic coast beaches, and the Inland Bays (Rehoboth, Indian River, and Little Assawoman). The Chesapeake & Delaware Canal and Indian River Inlet are popular waterways for both fishing and cruising.",
  "florida": "Florida is the boating capital of the United States, with over 1,350 miles of coastline, the Florida Keys, the Intracoastal Waterway, the Everglades, and thousands of freshwater lakes. From deep-sea fishing to manatee-watching, Florida offers year-round boating.",
  "georgia": "Georgia offers boating on the Atlantic coast, including the Golden Isles and Savannah waterways, plus major inland lakes like Lanier, Oconee, Sinclair, and Hartwell. The Chattahoochee River and Okefenokee Swamp provide unique paddling experiences.",
  "hawaii": "Hawaii offers unparalleled ocean boating — from snorkeling Molokini Crater to deep-sea fishing off Kona. The islands provide world-class sailing, whale-watching (November–April), and paddling in tropical waters surrounded by volcanic landscapes.",
  "idaho": "Idaho's waterways include pristine mountain lakes like Coeur d'Alene, Payette Lake, and Priest Lake, plus the Salmon River (the River of No Return) and Snake River. Idaho offers some of the best whitewater rafting and jet-boating in the country.",
  "illinois": "Illinois boating centers on Lake Michigan's Chicago waterfront, the Illinois and Mississippi Rivers, and popular inland lakes like Carlyle Lake, Rend Lake, and Lake Shelbyville. The Chain O'Lakes area near Chicago is a major recreational boating hub.",
  "indiana": "Indiana offers boating on Lake Michigan's southern shore, major reservoirs like Monroe, Patoka, and Brookville, and the Ohio River. Indiana Dunes National Park provides stunning lakefront access, while inland lakes offer fishing and watersports.",
  "iowa": "Iowa's boating includes the Mississippi and Missouri Rivers, plus popular lakes like Okoboji, Clear Lake, Saylorville, and Rathbun. The Great Lakes of Iowa (Spirit Lake and West Okoboji) are premier summer boating destinations.",
  "kansas": "Kansas offers boating on 24 federal reservoirs and numerous state lakes. Milford Lake (the state's largest), Cheney Reservoir, Clinton Lake, and El Dorado Lake provide excellent fishing, sailing, and watersports opportunities across the Sunflower State.",
  "kentucky": "Kentucky is home to more miles of navigable waterways than any other state except Alaska. Kentucky Lake, Lake Barkley, Lake Cumberland, and Dale Hollow Lake provide world-class bass fishing and houseboating in beautiful Appalachian settings.",
  "louisiana": "Louisiana's waterways are legendary: the Gulf Coast, Mississippi River, Atchafalaya Basin, Lake Pontchartrain, and the bayou system. From offshore fishing in the Gulf to exploring Cajun country by airboat, Louisiana offers unique boating experiences.",
  "maine": "Maine's rugged coastline stretches over 3,500 miles with thousands of islands, coves, and harbors. Casco Bay, Penobscot Bay, Acadia's waters, and the Maine Island Trail offer spectacular cruising. Moosehead Lake and Sebago Lake lead inland boating.",
  "maryland": "Maryland is defined by the Chesapeake Bay — the largest estuary in the U.S. Annapolis is the sailing capital of the nation. The Bay, its tributaries, Deep Creek Lake, and the Atlantic coast at Ocean City provide diverse boating year-round.",
  "massachusetts": "Massachusetts offers world-class boating from Cape Cod and the Islands (Martha's Vineyard, Nantucket) to Boston Harbor, Buzzards Bay, and the Berkshire lakes. The Cape Cod Canal, Plymouth Harbor, and Gloucester are iconic New England boating destinations.",
  "michigan": "Michigan, the Great Lakes State, has more coastline than any other state except Alaska. Lake Michigan, Lake Huron, Lake Superior, and Lake Erie surround the state, plus over 11,000 inland lakes. Michigan is truly a boater's paradise.",
  "minnesota": "Minnesota — the Land of 10,000 Lakes (actually 11,842) — is one of America's top boating states. Lake Mille Lacs, Leech Lake, Lake Vermilion, and the Boundary Waters Canoe Area Wilderness offer everything from fishing to wilderness paddling.",
  "mississippi": "Mississippi offers boating on the Gulf Coast, Ross Barnett Reservoir, Sardis Lake, Grenada Lake, and the Mississippi River itself. The Gulf Islands National Seashore and Biloxi Back Bay are popular coastal boating areas.",
  "missouri": "Missouri's boating scene includes the Lake of the Ozarks (one of America's top party lakes), Table Rock Lake, Truman Lake, and the Missouri and Mississippi Rivers. The Ozark region's clear-water streams offer excellent float trips.",
  "montana": "Montana's boating features Flathead Lake (the largest natural freshwater lake west of the Mississippi), Canyon Ferry Lake, Fort Peck Lake, and legendary rivers like the Missouri, Yellowstone, and Bighorn. Crystal-clear mountain lakes abound.",
  "nebraska": "Nebraska offers boating on Lake McConaughy (the state's largest reservoir), Lewis and Clark Lake, Harlan County Lake, and the Missouri and Platte Rivers. Branched Oak and Calamus Reservoir are popular local boating spots.",
  "nevada": "Nevada's desert waters include Lake Mead (the largest U.S. reservoir), Lake Tahoe's Nevada shore, Pyramid Lake, and Lake Mohave. Houseboating on Lake Mead and watersports on Lake Tahoe are signature Nevada experiences.",
  "new-hampshire": "New Hampshire offers boating on Lake Winnipesaukee (the state's crown jewel), Squam Lake, Lake Sunapee, and the seacoast around Portsmouth and the Isles of Shoals. The Connecticut River and mountain lakes complete the picture.",
  "new-jersey": "New Jersey provides boating on the Atlantic coast, Barnegat Bay, the Jersey Shore, Delaware Bay, and the Intracoastal Waterway. Cape May, Long Beach Island, and the Pine Barrens waterways offer diverse boating opportunities.",
  "new-mexico": "New Mexico's boating centers on Elephant Butte Lake (the state's largest), Navajo Lake, Conchas Lake, and Cochiti Lake. The Rio Grande and desert reservoir boating offer a unique Southwest experience.",
  "new-york": "New York boating spans the Hudson River, Long Island Sound, the Finger Lakes, Lake George, the Erie Canal, Lake Champlain, and the Adirondack waterways. The Great Lakes coastline and Thousand Islands region add to the incredible diversity.",
  "north-carolina": "North Carolina offers boating from the Outer Banks and Crystal Coast to Lake Norman, Falls Lake, and the Great Smoky Mountains' streams. The Intracoastal Waterway, Cape Fear River, and Kerr Lake provide excellent boating year-round.",
  "north-dakota": "North Dakota boating centers on Lake Sakakawea (one of the largest man-made lakes in the U.S.), Devils Lake, Lake Oahe, and the Missouri River. These waters offer excellent walleye fishing and summer recreation.",
  "ohio": "Ohio boating includes Lake Erie's 312-mile coastline, Put-in-Bay and the Lake Erie Islands, and major inland lakes like Alum Creek, Salt Fork, and Indian Lake. The Ohio River and Cuyahoga River Valley add variety.",
  "oklahoma": "Oklahoma has more man-made lakes than almost any other state — over 200. Grand Lake, Lake Texoma (shared with Texas), Broken Bow Lake, and Lake Eufaula offer outstanding bass fishing, wakeboarding, and family boating.",
  "oregon": "Oregon boating ranges from the Pacific coast and Columbia River to Crater Lake (the deepest lake in the U.S.), the Willamette River, and high-desert reservoirs. The Rogue, Deschutes, and John Day Rivers offer world-class rafting.",
  "pennsylvania": "Pennsylvania boating includes Lake Erie's shoreline, the Delaware River, Raystown Lake, Lake Wallenpaupack, and Pymatuning Lake. The Susquehanna River and Allegheny Reservoir provide additional freshwater boating options.",
  "rhode-island": "Rhode Island, the Ocean State, offers boating on Narragansett Bay, Block Island Sound, and the Atlantic coast. Newport is a world-renowned sailing destination, and the Bay provides excellent cruising among historic harbors.",
  "south-carolina": "South Carolina boating spans the Lowcountry coast (Charleston, Hilton Head, Beaufort), Lake Murray, Lake Hartwell, and Lake Marion. The Intracoastal Waterway and ACE Basin offer both saltwater and estuarine boating.",
  "south-dakota": "South Dakota offers boating on Lewis and Clark Lake, Lake Oahe, Lake Sharpe, and the Missouri River reservoirs. The Black Hills lakes (Pactola, Sheridan) provide scenic mountain boating in the western part of the state.",
  "tennessee": "Tennessee is a top boating state with huge TVA reservoirs: Norris Lake, Douglas Lake, Cherokee Lake, and Center Hill Lake. The Tennessee and Cumberland Rivers plus Percy Priest Lake near Nashville offer year-round boating.",
  "texas": "Texas boating is massive: the Gulf Coast, Lake Travis, Lake Texoma, Toledo Bend, Sam Rayburn, and the Rio Grande. From saltwater fishing off Galveston to tubing the Guadalupe River, Texas offers incredible variety across its waterways.",
  "utah": "Utah's boating features Lake Powell (one of America's most iconic houseboating destinations), Bear Lake, Utah Lake, Flaming Gorge, and Jordanelle Reservoir. Red-rock canyon boating on Lake Powell is a bucket-list experience.",
  "vermont": "Vermont boating centers on Lake Champlain (shared with New York), plus Lake Memphremagog, Lake Bomoseen, and the Connecticut River. Lake Champlain offers 120 miles of sailing, fishing, and cruising with stunning mountain backdrops.",
  "virginia": "Virginia boating includes the Chesapeake Bay, Smith Mountain Lake, Lake Anna, Kerr Lake, and the Blue Ridge Parkway lakes. Virginia Beach, the James River, and the Intracoastal Waterway provide diverse coastal and inland options.",
  "washington": "Washington boating spans Puget Sound, the San Juan Islands, the Columbia River, Lake Chelan, and the Pacific coast. The San Juan Islands offer world-class cruising and whale-watching, while Lake Washington and Lake Union anchor Seattle's boating culture.",
  "west-virginia": "West Virginia offers boating on Summersville Lake (known for its crystal-clear water), Stonewall Jackson Lake, Burnsville Lake, and the Kanawha and New Rivers. Whitewater rafting on the New and Gauley Rivers is world-famous.",
  "wisconsin": "Wisconsin boating includes Lake Michigan, Lake Superior, the Door County peninsula, the Wisconsin River, and over 15,000 inland lakes. The Apostle Islands, Lake Geneva, and the Northwoods lake chains are premier boating destinations.",
  "wyoming": "Wyoming boating features Yellowstone Lake (the largest high-altitude lake in North America), Jackson Lake beneath the Tetons, Flaming Gorge Reservoir, and the Snake River. Mountain reservoir boating amid stunning wilderness is Wyoming's hallmark.",
};

function generateStateContent(state: {
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
}): string {
  const agency = state.agency_abbreviation || state.agency_name;
  const highlights = boatingHighlights[state.slug] || "";

  let html = `<h2>Boater Education in ${state.name}: Complete Guide</h2>\n`;

  // Who needs it
  html += `<h3>Who Needs Boater Education in ${state.name}?</h3>\n`;
  html += `<p>${state.important_notes || `${state.name} requires boater education for operators of motorized vessels. The course must be approved by the ${state.agency_name}${state.agency_abbreviation ? ` (${state.agency_abbreviation})` : ""} and certified by NASBLA.`}</p>\n`;

  // Age & certification path
  html += `<h3>Age and Certification Requirements</h3>\n`;
  if (state.minimum_age_online_only) {
    html += `<p>In ${state.name}, how you earn your boater education certificate depends on your age:</p>\n`;
    html += `<ul>\n`;
    html += `  <li><strong>Ages ${state.minimum_age_online_only}+:</strong> Complete the entire course online — no in-person component required.</li>\n`;
    html += `  <li><strong>Ages ${state.minimum_age || "younger"} to ${state.minimum_age_online_only - 1}:</strong> Complete the online course plus an on-water practical assessment (field day).</li>\n`;
    html += `</ul>\n`;
  } else if (state.field_day_required) {
    html += `<p>${state.name} requires all students to complete both an online (or classroom) course and an in-person component. ${state.field_day_details || "An on-water practical assessment or proctored exam is required after finishing the online portion."}</p>\n`;
    if (state.minimum_age) {
      html += `<p>The minimum age to take the boater education course in ${state.name} is <strong>${state.minimum_age} years old</strong>.</p>\n`;
    }
  } else {
    html += `<p>${state.name} allows eligible students to complete the entire boater education course online — no in-person field day or on-water assessment is required.</p>\n`;
    if (state.minimum_age) {
      html += `<p>The minimum age to take the course is <strong>${state.minimum_age} years old</strong>.</p>\n`;
    }
  }

  // Course cost
  if (state.course_price) {
    html += `<h3>Course Cost</h3>\n`;
    html += `<p>The ${state.name} online boater education course typically costs around <strong>${state.course_price}</strong>. This is a one-time fee, and your certificate does not expire. Some providers may offer additional study materials or rush processing for an extra charge.</p>\n`;
  }

  // What the course covers
  html += `<h3>What the Course Covers</h3>\n`;
  html += `<p>The ${agency}-approved boater education course covers essential topics including:</p>\n`;
  html += `<ul>\n`;
  html += `  <li><strong>Vessel operation and handling</strong> — throttle control, docking, anchoring, and trailering</li>\n`;
  html += `  <li><strong>Navigation rules</strong> — right-of-way, buoys, markers, and channel navigation</li>\n`;
  html += `  <li><strong>${state.name} boating laws</strong> — registration requirements, speed limits, no-wake zones, and BUI (Boating Under the Influence) laws</li>\n`;
  html += `  <li><strong>Safety equipment</strong> — life jackets (PFDs), fire extinguishers, visual distress signals, and sound-producing devices</li>\n`;
  html += `  <li><strong>Emergency procedures</strong> — man overboard, capsizing, flooding, and distress calls</li>\n`;
  html += `  <li><strong>Environmental responsibility</strong> — clean boating practices, invasive species prevention, and wildlife protection</li>\n`;
  html += `</ul>\n`;

  // Field day details
  if (state.field_day_required && state.field_day_details) {
    html += `<h3>What to Expect at the In-Person Component</h3>\n`;
    html += `<p>${state.field_day_details}</p>\n`;
    html += `<p>The in-person component typically covers hands-on skills like vessel operation, safety equipment demonstration, and emergency procedures that can't be fully taught online.</p>\n`;
  }

  // Reciprocity
  html += `<h3>Is My ${state.name} Certificate Valid in Other States?</h3>\n`;
  html += `<p>Yes. NASBLA-approved boater education certificates are recognized across most U.S. states through reciprocity agreements. Once you earn your certificate in ${state.name}, you can typically use it to legally operate a boat in other states as well. Always check the specific requirements of the state where you plan to boat, as some states may have additional local rules.</p>\n`;

  // Boating highlights
  if (highlights) {
    html += `<h3>Boating in ${state.name}</h3>\n`;
    html += `<p>${highlights}</p>\n`;
    html += `<p>Whether you're a first-time boater or an experienced captain, having your boater education certificate ensures you're prepared to enjoy ${state.name}'s waterways safely and legally.</p>\n`;
  }

  return html;
}

export async function seedAllStatesContent(database: NodePgDatabase<any>) {
  console.log("Seeding extended content for all 50 states...");

  const result = await database.execute(sql`
    SELECT slug, name, agency_name, agency_abbreviation, minimum_age,
           minimum_age_online_only, field_day_required, field_day_details,
           course_price, important_notes
    FROM states WHERE is_active = true
  `);

  for (const row of result.rows as any[]) {
    const content = generateStateContent(row);
    await database.execute(sql`
      UPDATE states SET extended_content = ${content}
      WHERE slug = ${row.slug}
    `);
    console.log(`  ✓ ${row.name}`);
  }

  console.log("All state content seeded.");
}
