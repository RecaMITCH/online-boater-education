/**
 * Seed official state agency boater education resources.
 *
 * Usage:
 *   ADMIN_COOKIE="connect.sid=..." npx tsx script/seed-state-resources.ts [base_url]
 *
 * base_url defaults to https://onlineboatereducation.com
 *
 * Set ADMIN_COOKIE to your authenticated session cookie from the admin panel.
 * You can grab it from browser DevTools → Application → Cookies after logging in.
 */

const BASE = process.argv[2] || "https://onlineboatereducation.com";
const COOKIE = process.env.ADMIN_COOKIE || "";

if (!COOKIE) {
  console.error("ERROR: Set ADMIN_COOKIE environment variable to your session cookie.");
  console.error('Example: ADMIN_COOKIE="connect.sid=s%3A..." npx tsx script/seed-state-resources.ts');
  process.exit(1);
}

interface Resource {
  stateId: number;
  title: string;
  url: string;
  description: string;
  resourceType: string;
  isActive: boolean;
}

const resources: Resource[] = [
  // 1 - Alabama
  { stateId: 1, title: "ALEA Marine Patrol – Boating Education", url: "https://www.alea.gov/dps/marine-patrol/boating-education-and-operator-certificationlicense", description: "Official Alabama boater education and certification information from the Alabama Law Enforcement Agency.", resourceType: "official_state_page", isActive: true },
  // 2 - Alaska
  { stateId: 2, title: "Alaska DNR – Office of Boating Safety", url: "https://dnr.alaska.gov/parks/boating/", description: "Official Alaska boating safety education information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 3 - Arizona
  { stateId: 3, title: "AZGFD – Boating Education", url: "https://www.azgfd.com/education/boating-education/", description: "Official Arizona boating education requirements and courses from the Arizona Game and Fish Department.", resourceType: "official_state_page", isActive: true },
  // 4 - Arkansas
  { stateId: 4, title: "AGFC – Boater Education", url: "https://www.agfc.com/education/boater-education/", description: "Official Arkansas boater education information from the Arkansas Game and Fish Commission.", resourceType: "official_state_page", isActive: true },
  // 5 - California
  { stateId: 5, title: "California DBW – Boating Safety & Education", url: "https://dbw.parks.ca.gov/?page_id=28711", description: "Official California boating safety and education information from the Division of Boating and Waterways.", resourceType: "official_state_page", isActive: true },
  // 6 - Colorado
  { stateId: 6, title: "Colorado Parks & Wildlife – Boating Safety", url: "https://cpw.state.co.us/activities/boating/boating-safety", description: "Official Colorado boating safety education information from Colorado Parks and Wildlife.", resourceType: "official_state_page", isActive: true },
  // 7 - Connecticut
  { stateId: 7, title: "CT DEEP – Boating Classes", url: "https://portal.ct.gov/DEEP/Boating/Education/Boating-Classes", description: "Official Connecticut boating education class information from the Department of Energy and Environmental Protection.", resourceType: "official_state_page", isActive: true },
  // 8 - Delaware
  { stateId: 8, title: "Delaware DNREC – Boating Safety", url: "https://dnrec.delaware.gov/fish-wildlife/boating/safety/", description: "Official Delaware boating safety education information from DNREC.", resourceType: "official_state_page", isActive: true },
  // 9 - Florida
  { stateId: 9, title: "Florida FWC – Boater Education", url: "https://myfwc.com/boating/safety-education/", description: "Official Florida boater education and safety information from the Fish and Wildlife Conservation Commission.", resourceType: "official_state_page", isActive: true },
  // 10 - Georgia
  { stateId: 10, title: "Georgia DNR – Boating Education", url: "https://gadnrle.org/boating-education", description: "Official Georgia boating education information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 11 - Hawaii
  { stateId: 11, title: "Hawaii DOBOR – Boating Education", url: "https://dlnr.hawaii.gov/dobor/boating-in-hawaii/", description: "Official Hawaii boating education information from the Division of Boating and Ocean Recreation.", resourceType: "official_state_page", isActive: true },
  // 12 - Idaho
  { stateId: 12, title: "Idaho Parks & Recreation – Boating Safety Classes", url: "https://parksandrecreation.idaho.gov/activities/boating/boating-safety-classes/", description: "Official Idaho boating safety class information from the Department of Parks and Recreation.", resourceType: "official_state_page", isActive: true },
  // 13 - Illinois
  { stateId: 13, title: "Illinois DNR – Boating Safety Education", url: "https://dnr.illinois.gov/safety/boatingsafety.html", description: "Official Illinois boating safety education information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 14 - Indiana
  { stateId: 14, title: "Indiana DNR – Boating Education & Safety", url: "https://www.in.gov/dnr/law-enforcement/education/boating-education-and-safety/", description: "Official Indiana boating education and safety information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 15 - Iowa
  { stateId: 15, title: "Iowa DNR – Boater Education & Safety", url: "https://www.iowadnr.gov/things-do/boating/boater-education-safety", description: "Official Iowa boater education and safety information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 16 - Kansas
  { stateId: 16, title: "Kansas KDWP – Boating Education", url: "https://ksoutdoors.gov/Boating/Boating-Education", description: "Official Kansas boating education information from the Department of Wildlife and Parks.", resourceType: "official_state_page", isActive: true },
  // 17 - Kentucky
  { stateId: 17, title: "Kentucky KDFWR – Boater Education", url: "https://fw.ky.gov/Boat/pages/boater-education.aspx", description: "Official Kentucky boater education information from the Department of Fish and Wildlife Resources.", resourceType: "official_state_page", isActive: true },
  // 18 - Louisiana
  { stateId: 18, title: "Louisiana LDWF – Boater Education", url: "https://www.wlf.louisiana.gov/page/boater-education", description: "Official Louisiana mandatory boater education information from the Department of Wildlife and Fisheries.", resourceType: "official_state_page", isActive: true },
  // 19 - Maine
  { stateId: 19, title: "Maine DIFW – Boating Safety Course", url: "https://www.maine.gov/ifw/programs-resources/educational-programs/safety-courses/boating-safety.html", description: "Official Maine boating safety education course information from the Department of Inland Fisheries and Wildlife.", resourceType: "official_state_page", isActive: true },
  // 20 - Maryland
  { stateId: 20, title: "Maryland DNR – Boating Safety Certificate", url: "https://dnr.maryland.gov/nrp/pages/boatingsafety/safety_certificate.aspx", description: "Official Maryland boating safety certificate information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 21 - Massachusetts
  { stateId: 21, title: "Massachusetts – Boat Safety Certificate Course", url: "https://www.mass.gov/how-to/boat-safety-certificate-course", description: "Official Massachusetts boat safety certificate course information from Mass.gov.", resourceType: "official_state_page", isActive: true },
  // 22 - Michigan
  { stateId: 22, title: "Michigan DNR – Boating Safety Certificate", url: "https://www.michigan.gov/dnr/things-to-do/boating/safety-certificate", description: "Official Michigan boating safety certificate information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 23 - Minnesota
  { stateId: 23, title: "Minnesota DNR – Boat & Water Safety Education", url: "https://www.dnr.state.mn.us/safety/boatwater/education.html", description: "Official Minnesota boat and water safety education information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 24 - Mississippi
  { stateId: 24, title: "Mississippi MDWFP – Boater Education", url: "https://www.mdwfp.com/enforcement-education/boater-education", description: "Official Mississippi boater education information from the Department of Wildlife, Fisheries, and Parks.", resourceType: "official_state_page", isActive: true },
  // 25 - Missouri
  { stateId: 25, title: "Missouri MSHP – Boater Education Course", url: "https://www.mshp.dps.missouri.gov/MSHPWeb/WaterPatrol/BoatingLaws_Education/requiredBoaterEdCourse.html", description: "Official Missouri boater education course requirements from the State Highway Patrol Water Patrol.", resourceType: "official_state_page", isActive: true },
  // 26 - Montana
  { stateId: 26, title: "Montana FWP – Boating Education", url: "https://fwp.mt.gov/activities/boating/education", description: "Official Montana boating education information from Fish, Wildlife and Parks.", resourceType: "official_state_page", isActive: true },
  // 27 - Nebraska
  { stateId: 27, title: "Nebraska Game & Parks – Boater Education", url: "https://outdoornebraska.gov/parks/go-boating/boater-education/", description: "Official Nebraska boater education information from the Game and Parks Commission.", resourceType: "official_state_page", isActive: true },
  // 28 - Nevada
  { stateId: 28, title: "Nevada NDOW – Boating Education", url: "https://www.ndow.org/events/boating-education/", description: "Official Nevada boating education information from the Department of Wildlife.", resourceType: "official_state_page", isActive: true },
  // 29 - New Hampshire
  { stateId: 29, title: "NH State Police Marine Patrol – Boating Education", url: "https://www.nhsp.dos.nh.gov/our-services/field-operations-bureau/marine-patrol/boating-education", description: "Official New Hampshire boating education information from the State Police Marine Patrol.", resourceType: "official_state_page", isActive: true },
  // 30 - New Jersey
  { stateId: 30, title: "NJ State Police – Boating Safety Course", url: "https://www.nj.gov/njsp/marine-services/bsc-course-locations.shtml", description: "Official New Jersey boating safety course information from the State Police Marine Services Bureau.", resourceType: "official_state_page", isActive: true },
  // 31 - New Mexico
  { stateId: 31, title: "New Mexico State Parks – Boating Education", url: "https://www.emnrd.nm.gov/spd/activities/boating-2/boating-education/", description: "Official New Mexico boating education information from the State Parks Division.", resourceType: "official_state_page", isActive: true },
  // 32 - New York
  { stateId: 32, title: "NYS Parks – Boating Education", url: "https://parks.ny.gov/activities/boating/boating-education", description: "Official New York boating education information from the Office of Parks, Recreation and Historic Preservation.", resourceType: "official_state_page", isActive: true },
  // 33 - North Carolina
  { stateId: 33, title: "NC Wildlife – Boating Education Courses", url: "https://www.ncwildlife.gov/education/boating-education-courses", description: "Official North Carolina boating education course information from the Wildlife Resources Commission.", resourceType: "official_state_page", isActive: true },
  // 34 - North Dakota
  { stateId: 34, title: "North Dakota Game & Fish – Boating Education", url: "https://gf.nd.gov/education/boating", description: "Official North Dakota boating and water safety education information from the Game and Fish Department.", resourceType: "official_state_page", isActive: true },
  // 35 - Ohio
  { stateId: 35, title: "Ohio ODNR – Boater Education Requirements", url: "https://ohiodnr.gov/discover-and-learn/education-training/boater-education-skills/1-meeting-boater-ed-requirements", description: "Official Ohio boater education requirements from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 36 - Oklahoma
  { stateId: 36, title: "Oklahoma DPS – Boating Education", url: "https://oklahoma.gov/dps/programs-services/boated.html", description: "Official Oklahoma boating education information from the Department of Public Safety.", resourceType: "official_state_page", isActive: true },
  // 37 - Oregon
  { stateId: 37, title: "Oregon State Marine Board – Boater Education", url: "https://www.oregon.gov/osmb/boater-info/Pages/Boater-Education-Cards.aspx", description: "Official Oregon boater education card information from the State Marine Board.", resourceType: "official_state_page", isActive: true },
  // 38 - Pennsylvania
  { stateId: 38, title: "PA Fish & Boat Commission – Boating Safety Education", url: "https://www.pa.gov/services/fishandboat/apply-for-bsec-and-safety-courses", description: "Official Pennsylvania boating safety education certificate and course information from the Fish and Boat Commission.", resourceType: "official_state_page", isActive: true },
  // 39 - Rhode Island
  { stateId: 39, title: "Rhode Island DEM – Boating Safety Certification", url: "https://dem.ri.gov/natural-resources-bureau/law-enforcement/boating-safety-certification", description: "Official Rhode Island boating safety certification information from the Department of Environmental Management.", resourceType: "official_state_page", isActive: true },
  // 40 - South Carolina
  { stateId: 40, title: "SC DNR – Boater Education", url: "https://www.dnr.sc.gov/education/boated.html", description: "Official South Carolina boater education information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 41 - South Dakota
  { stateId: 41, title: "South Dakota GFP – Boating Safety", url: "https://gfp.sd.gov/safety/", description: "Official South Dakota boating safety information from Game, Fish and Parks.", resourceType: "official_state_page", isActive: true },
  // 42 - Tennessee
  { stateId: 42, title: "Tennessee TWRA – Boating Education", url: "https://www.tn.gov/twra/boating/boating-education.html", description: "Official Tennessee boating education information from the Wildlife Resources Agency.", resourceType: "official_state_page", isActive: true },
  // 43 - Texas
  { stateId: 43, title: "Texas TPWD – Boater Education", url: "https://tpwd.texas.gov/education/boater-education/", description: "Official Texas boater education information from the Parks and Wildlife Department.", resourceType: "official_state_page", isActive: true },
  // 44 - Utah
  { stateId: 44, title: "Utah DOR – Boating Education", url: "https://recreation.utah.gov/boating-education/", description: "Official Utah boating education information from the Division of Outdoor Recreation.", resourceType: "official_state_page", isActive: true },
  // 45 - Vermont
  { stateId: 45, title: "Vermont Fish & Wildlife – Boating", url: "https://www.vtfishandwildlife.com/fish/boating-in-vermont", description: "Official Vermont boating information from the Fish and Wildlife Department.", resourceType: "official_state_page", isActive: true },
  // 46 - Virginia
  { stateId: 46, title: "Virginia DWR – Boating Safety & Education", url: "https://dwr.virginia.gov/boating/boating-safety/", description: "Official Virginia boating safety and education information from the Department of Wildlife Resources.", resourceType: "official_state_page", isActive: true },
  // 47 - Washington
  { stateId: 47, title: "Washington State Parks – Boater Education & Safety", url: "https://parks.wa.gov/about/rules-and-safety/boater-education-safety", description: "Official Washington boater education and safety information from State Parks.", resourceType: "official_state_page", isActive: true },
  // 48 - West Virginia
  { stateId: 48, title: "West Virginia DNR – Boater Education", url: "https://wvdnr.gov/boater-education/", description: "Official West Virginia boating safety education information from the Division of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 49 - Wisconsin
  { stateId: 49, title: "Wisconsin DNR – Safety Education", url: "https://dnr.wisconsin.gov/Education/OutdoorSkills/safetyEducation", description: "Official Wisconsin boating safety education information from the Department of Natural Resources.", resourceType: "official_state_page", isActive: true },
  // 50 - Wyoming
  { stateId: 50, title: "Wyoming Game & Fish – Boating & Watercraft", url: "https://wgfd.wyo.gov/fishing-boating/boating-watercraft", description: "Official Wyoming boating and watercraft information from the Game and Fish Department.", resourceType: "official_state_page", isActive: true },
];

async function main() {
  console.log(`Seeding ${resources.length} state resources to ${BASE}...\n`);

  let success = 0;
  let fail = 0;

  for (const resource of resources) {
    try {
      const res = await fetch(`${BASE}/api/admin/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": COOKIE,
        },
        body: JSON.stringify(resource),
      });

      if (res.ok) {
        console.log(`  ✓ ${resource.title}`);
        success++;
      } else {
        const body = await res.text();
        console.log(`  ✗ ${resource.title} — ${res.status}: ${body}`);
        fail++;
      }
    } catch (err: any) {
      console.log(`  ✗ ${resource.title} — ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${success} created, ${fail} failed.`);
}

main();
