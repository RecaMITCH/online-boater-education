import { db } from "./db";
import { sql } from "drizzle-orm";
import { seedAllStatesContent } from "./seed-state-content";
import { seedCoreArticles } from "./seed-articles";
import { seedStateGuideArticles } from "./seed-state-guides";
import { seedArticleImages } from "./seed-images";

export async function runMigrations() {
  console.log("Running database migrations...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      abbreviation VARCHAR(2) NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT,
      hero_image_url TEXT,
      agency_name TEXT NOT NULL,
      agency_abbreviation TEXT,
      minimum_age INTEGER,
      minimum_age_online_only INTEGER,
      field_day_required BOOLEAN NOT NULL DEFAULT true,
      field_day_details TEXT,
      course_url TEXT,
      course_price TEXT,
      additional_requirements TEXT,
      important_notes TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT,
      cover_image_url TEXT,
      author_id VARCHAR,
      is_published BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      state_id INTEGER,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      resource_type TEXT NOT NULL DEFAULT 'official_state_page',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Admin settings table for password override
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Migration v2: Update all state data with accurate requirements, agencies, and URLs
  console.log("Running state data accuracy updates (v2)...");

  const stateUpdates = [
    { slug: "alabama", description: "Online boater education course approved by NASBLA. Alabama requires boater education for operators age 12+ on motorboats with 15+ hp.", agencyName: "Alabama Law Enforcement Agency - Marine Patrol Division", agencyAbbreviation: "ALEA", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://www.alea.gov/dps/marine-patrol/boating-education-and-operator-certificationlicense", importantNotes: "Required for operators age 12+ on motorboats with 15+ hp. Operators ages 12-13 must have adult supervision.", fieldDayDetails: null },
    { slug: "alaska", description: "Alaska has no mandatory boating safety education requirement, though courses are recommended for all boaters.", agencyName: "Alaska Department of Natural Resources - Office of Boating Safety", agencyAbbreviation: "DNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://dnr.alaska.gov/parks/boating/", importantNotes: "No mandatory boating education requirement. Voluntary courses are available and recommended.", fieldDayDetails: null },
    { slug: "arizona", description: "Arizona has no mandatory boating safety education requirement, though voluntary courses are available.", agencyName: "Arizona Game and Fish Department", agencyAbbreviation: "AZGFD", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.azgfd.com/boating/", importantNotes: "No mandatory boating education requirement. Voluntary courses are available.", fieldDayDetails: null },
    { slug: "arkansas", description: "Online boater education course approved by NASBLA. Arkansas requires boating safety education for anyone born on or after January 1, 1986.", agencyName: "Arkansas Game and Fish Commission", agencyAbbreviation: "AGFC", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.agfc.com/education/boater-education/", importantNotes: "Required for anyone born on or after January 1, 1986.", fieldDayDetails: null },
    { slug: "california", description: "Online boater education course approved by California Division of Boating and Waterways and NASBLA. Required for all motorized vessel operators.", agencyName: "California Division of Boating and Waterways", agencyAbbreviation: "DBW", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/california/", importantNotes: "Required for ALL motorized vessel operators as of January 1, 2025.", fieldDayDetails: null },
    { slug: "colorado", description: "Boater education course approved by Colorado Parks and Wildlife and NASBLA. Ages 14-15 require an in-person proctored exam.", agencyName: "Colorado Parks and Wildlife", agencyAbbreviation: "CPW", minimumAge: 14, fieldDayRequired: true, courseUrl: "https://recademics.com/boating/colorado/", importantNotes: "Required for ages 14-17 to operate motorboats. Under 14 cannot operate motorboats. Ages 14-15 require in-person proctored exam.", fieldDayDetails: "Ages 14-15 must complete an in-person classroom course with proctored exam. Ages 16+ may complete the course online." },
    { slug: "connecticut", description: "Connecticut requires an 8-hour in-person classroom boating safety course for all operators. Online-only courses do not satisfy Connecticut's requirement.", agencyName: "Connecticut Department of Energy and Environmental Protection", agencyAbbreviation: "DEEP", minimumAge: null, fieldDayRequired: true, courseUrl: "https://portal.ct.gov/DEEP/Boating/Education/Boating-Classes", importantNotes: "Required for all operators. Must complete an in-person 8-hour classroom course — online-only is not accepted.", fieldDayDetails: "An 8-hour in-person classroom course is required. Online-only courses do not meet Connecticut requirements." },
    { slug: "delaware", description: "Online boater education course approved by NASBLA. Delaware requires boating safety education for anyone born on or after January 1, 1978.", agencyName: "Delaware Department of Natural Resources and Environmental Control", agencyAbbreviation: "DNREC", minimumAge: null, fieldDayRequired: false, courseUrl: "https://dnrec.delaware.gov/fish-wildlife/boating/safety/", importantNotes: "Required for anyone born on or after January 1, 1978.", fieldDayDetails: null },
    { slug: "florida", description: "Online boater education course approved by Florida FWC and NASBLA. Required for boaters born on or after January 1, 1988.", agencyName: "Florida Fish and Wildlife Conservation Commission", agencyAbbreviation: "FWC", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/florida/", importantNotes: "Required for anyone born on or after January 1, 1988, operating vessels with 10+ hp.", fieldDayDetails: null },
    { slug: "georgia", description: "Online boater education course approved by Georgia DNR and NASBLA. Required for anyone born on or after January 1, 1998.", agencyName: "Georgia Department of Natural Resources - Wildlife Resources Division", agencyAbbreviation: "DNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://gadnrle.org/boating-education", importantNotes: "Required for anyone born on or after January 1, 1998.", fieldDayDetails: null },
    { slug: "hawaii", description: "Online boater education course approved by NASBLA. Hawaii requires education for operators of vessels with 10+ hp motors.", agencyName: "Hawaii Department of Land and Natural Resources - Division of Boating and Ocean Recreation", agencyAbbreviation: "DOBOR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/hawaii/", importantNotes: "Required for operators of vessels with 10+ hp motors.", fieldDayDetails: null },
    { slug: "idaho", description: "Idaho has no statewide mandatory boating education requirement, though voluntary courses are recommended.", agencyName: "Idaho Department of Parks and Recreation", agencyAbbreviation: "IDPR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/idaho/", importantNotes: "No statewide mandatory requirement. Voluntary courses available and recommended.", fieldDayDetails: null },
    { slug: "illinois", description: "Online boater education course approved by NASBLA. Illinois requires education for anyone born on or after January 1, 1998, operating 10+ hp.", agencyName: "Illinois Department of Natural Resources", agencyAbbreviation: "IDNR", minimumAge: 11, fieldDayRequired: false, courseUrl: "https://dnr.illinois.gov/safety/boatingsafety.html", importantNotes: "Required for anyone born on or after January 1, 1998, operating boats with 10+ hp. Minimum age 11 to take the exam.", fieldDayDetails: null },
    { slug: "indiana", description: "Online boater education course approved by NASBLA. Indiana requires education for operators age 15+ without a driver's license.", agencyName: "Indiana Department of Natural Resources - Law Enforcement Division", agencyAbbreviation: "DNR", minimumAge: 15, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/indiana/", importantNotes: "Required for operators age 15+ without a driver's license. No one under 15 may operate boats with 10+ hp.", fieldDayDetails: null },
    { slug: "iowa", description: "Online boater education course approved by Iowa DNR and NASBLA. Required for ages 12-17 operating boats with 10+ hp.", agencyName: "Iowa Department of Natural Resources", agencyAbbreviation: "DNR", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/iowa/", importantNotes: "Required for ages 12-17 operating boats with 10+ hp. No requirement for operators 18+.", fieldDayDetails: null },
    { slug: "kansas", description: "Online boater education course approved by NASBLA. Kansas requires education for anyone born on or after January 1, 1989.", agencyName: "Kansas Department of Wildlife and Parks", agencyAbbreviation: "KDWP", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/kansas/", importantNotes: "Required for anyone born on or after January 1, 1989.", fieldDayDetails: null },
    { slug: "kentucky", description: "Online boater education course approved by NASBLA. Kentucky requires education for operators ages 12-17.", agencyName: "Kentucky Department of Fish and Wildlife Resources", agencyAbbreviation: "KDFWR", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/kentucky/", importantNotes: "Required for operators ages 12-17. No requirement for operators 18+.", fieldDayDetails: null },
    { slug: "louisiana", description: "Online boater education course approved by NASBLA. Louisiana requires education for anyone born after January 1, 1984, operating 10+ hp boats.", agencyName: "Louisiana Department of Wildlife and Fisheries", agencyAbbreviation: "LDWF", minimumAge: 16, fieldDayRequired: false, courseUrl: "https://www.wlf.louisiana.gov/page/boater-education", importantNotes: "Required for anyone born after January 1, 1984, operating boats with 10+ hp or PWCs. Must be 16+ for PWC operation.", fieldDayDetails: null },
    { slug: "maine", description: "Online boater education course approved by NASBLA. Maine requires education for anyone born on or after January 1, 1999, operating 25+ hp boats.", agencyName: "Maine Department of Inland Fisheries and Wildlife", agencyAbbreviation: "DIFW", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://www.maine.gov/ifw/programs-resources/educational-programs/safety-courses/boating-safety.html", importantNotes: "Required for anyone born on or after January 1, 1999, operating boats with 25+ hp. PWC operators born after 1/1/1999 must be 16+.", fieldDayDetails: null },
    { slug: "maryland", description: "Online boater education course approved by Maryland DNR and NASBLA. Required for anyone born on or after July 1, 1972.", agencyName: "Maryland Department of Natural Resources", agencyAbbreviation: "DNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/maryland/", importantNotes: "Required for anyone born on or after July 1, 1972.", fieldDayDetails: null },
    { slug: "massachusetts", description: "Online boater education course approved by NASBLA. Massachusetts is phasing in a requirement for all boaters.", agencyName: "Massachusetts Environmental Police", agencyAbbreviation: "MEP", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.mass.gov/take-a-boating-safety-course", importantNotes: "Phased requirement: born after 1/1/1989 must complete by 4/1/2026; born before 1/1/1989 must complete by 4/1/2028.", fieldDayDetails: null },
    { slug: "michigan", description: "Online boater education course approved by NASBLA. Michigan requires education for anyone born on or after July 1, 1996.", agencyName: "Michigan Department of Natural Resources", agencyAbbreviation: "MDNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.michigan.gov/dnr/things-to-do/boating/safety-certificate", importantNotes: "Required for anyone born on or after July 1, 1996. PWC operators born after 12/31/1978 also require certification.", fieldDayDetails: null },
    { slug: "minnesota", description: "Online boater education course approved by NASBLA. Minnesota requires education for operators born on or after July 1, 2004.", agencyName: "Minnesota Department of Natural Resources", agencyAbbreviation: "DNR", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://www.dnr.state.mn.us/safety/boatwater/education.html", importantNotes: "Required for operators born on or after July 1, 2004. Phased rollout through 2028. Minimum age 12.", fieldDayDetails: null },
    { slug: "mississippi", description: "Online boater education course approved by NASBLA. Mississippi requires education for anyone born on or after June 30, 1980.", agencyName: "Mississippi Department of Wildlife, Fisheries and Parks", agencyAbbreviation: "MDWFP", minimumAge: 10, fieldDayRequired: false, courseUrl: "https://www.mdwfp.com/enforcement-education/boater-education", importantNotes: "Required for anyone born on or after June 30, 1980. Minimum age 10 to take the course.", fieldDayDetails: null },
    { slug: "missouri", description: "Online boater education course approved by NASBLA. Missouri requires education for anyone born after January 1, 1984.", agencyName: "Missouri State Highway Patrol - Water Patrol", agencyAbbreviation: "MSHP", minimumAge: 14, fieldDayRequired: false, courseUrl: "https://www.mshp.dps.missouri.gov/MSHPWeb/WaterPatrol/BoatingLaws_Education/boaterEduLawFAQ.html", importantNotes: "Required for anyone born after January 1, 1984. Must be age 14+ to operate.", fieldDayDetails: null },
    { slug: "montana", description: "Online boater education course approved by NASBLA. Montana requires education for operators ages 13-14 on boats with 10+ hp.", agencyName: "Montana Fish, Wildlife and Parks", agencyAbbreviation: "FWP", minimumAge: 13, fieldDayRequired: false, courseUrl: "https://fwp.mt.gov/activities/boating/education", importantNotes: "Required for operators ages 13-14 on boats with 10+ hp motors. No requirement for age 15+.", fieldDayDetails: null },
    { slug: "nebraska", description: "Online boater education course approved by NASBLA. Nebraska requires education for anyone born after December 31, 1985.", agencyName: "Nebraska Game and Parks Commission", agencyAbbreviation: "NGPC", minimumAge: 14, fieldDayRequired: false, courseUrl: "https://outdoornebraska.gov/parks/go-boating/boater-education/", importantNotes: "Required for anyone born after December 31, 1985. Must be age 14+ to operate.", fieldDayDetails: null },
    { slug: "nevada", description: "Online boater education course approved by NASBLA. Nevada requires education for anyone born on or after January 1, 1983, operating 15+ hp.", agencyName: "Nevada Department of Wildlife", agencyAbbreviation: "NDOW", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/nevada/", importantNotes: "Required for anyone born on or after January 1, 1983, operating boats with 15+ hp.", fieldDayDetails: null },
    { slug: "new-hampshire", description: "New Hampshire requires an 8-hour in-person proctored classroom course for boating safety. Online-only courses do not satisfy the requirement.", agencyName: "New Hampshire State Police - Marine Patrol", agencyAbbreviation: "NHSP", minimumAge: 16, fieldDayRequired: true, courseUrl: "https://www.nhsp.dos.nh.gov/our-services/field-operations-bureau/marine-patrol/boating-education", importantNotes: "Required for age 16+ operating motorboats with 25+ hp or ski craft. Must complete 8-hour in-person classroom course.", fieldDayDetails: "An 8-hour in-person proctored classroom course is required. Online-only courses do not meet NH requirements." },
    { slug: "new-jersey", description: "Boater education course approved by NASBLA. New Jersey requires an in-person proctored exam after completing the online portion.", agencyName: "New Jersey State Police - Marine Services Bureau", agencyAbbreviation: "NJSP", minimumAge: 16, fieldDayRequired: true, courseUrl: "https://recademics.com/boating/new-jersey/", importantNotes: "Required for age 16+ for all motorboats and PWCs. Must complete in-person proctored exam after online course.", fieldDayDetails: "An in-person proctored exam is required after completing the online course portion." },
    { slug: "new-mexico", description: "Online boater education course approved by NASBLA. New Mexico requires education for anyone born on or after January 1, 1989.", agencyName: "New Mexico State Parks Division", agencyAbbreviation: "EMNRD", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.emnrd.nm.gov/spd/activities/boating-2/boating-education/", importantNotes: "Required for anyone born on or after January 1, 1989.", fieldDayDetails: null },
    { slug: "new-york", description: "Online boater education course approved by New York State Parks and NASBLA. Required for ALL motorized vessel operators.", agencyName: "New York State Parks, Recreation and Historic Preservation", agencyAbbreviation: "NYSPARKS", minimumAge: 10, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/new-york/", importantNotes: "Required for ALL motorized vessel operators as of January 1, 2025. Minimum age 10 to take the course.", fieldDayDetails: null },
    { slug: "north-carolina", description: "Online boater education course approved by NC Wildlife Resources Commission and NASBLA. Required for anyone born on or after January 1, 1988.", agencyName: "North Carolina Wildlife Resources Commission", agencyAbbreviation: "NCWRC", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/north-carolina/", importantNotes: "Required for anyone born on or after January 1, 1988.", fieldDayDetails: null },
    { slug: "north-dakota", description: "Online boater education course approved by NASBLA. North Dakota requires education for operators ages 12-15 on boats with 10+ hp.", agencyName: "North Dakota Game and Fish Department", agencyAbbreviation: "NDGF", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://gf.nd.gov/education/boating", importantNotes: "Required for operators ages 12-15 on boats with 10+ hp. No requirement for operators 16+.", fieldDayDetails: null },
    { slug: "ohio", description: "Online boater education course approved by Ohio ODNR and NASBLA. Required for anyone born on or after January 1, 1982, operating 10+ hp.", agencyName: "Ohio Department of Natural Resources", agencyAbbreviation: "ODNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/ohio/", importantNotes: "Required for anyone born on or after January 1, 1982, operating boats with 10+ hp.", fieldDayDetails: null },
    { slug: "oklahoma", description: "Online boater education course approved by NASBLA. Oklahoma requires education for operators ages 12-15 on boats with 10+ hp.", agencyName: "Oklahoma Department of Wildlife Conservation", agencyAbbreviation: "ODWC", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://oklahoma.gov/dps/programs-services/boated.html", importantNotes: "Required for operators ages 12-15 on boats with 10+ hp, sailboats 16+ ft, or PWCs.", fieldDayDetails: null },
    { slug: "oregon", description: "Online boater education course approved by Oregon State Marine Board and NASBLA. Required for age 16+ operating boats with 10+ hp.", agencyName: "Oregon State Marine Board", agencyAbbreviation: "OSMB", minimumAge: 16, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/oregon/", importantNotes: "Required for age 16+ operating boats with 10+ hp. Online and classroom options available.", fieldDayDetails: null },
    { slug: "pennsylvania", description: "Online boater education course approved by PA Fish and Boat Commission and NASBLA. Required for operators born on or after January 1, 1982.", agencyName: "Pennsylvania Fish and Boat Commission", agencyAbbreviation: "PFBC", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.pa.gov/services/fishandboat/apply-for-bsec-and-safety-courses", importantNotes: "Required for anyone born on or after January 1, 1982, operating boats with 25+ hp. ALL PWC operators require certification regardless of age.", fieldDayDetails: null },
    { slug: "rhode-island", description: "Rhode Island requires an 8-hour course with a proctored written exam under certified instructor supervision for boating safety certification.", agencyName: "Rhode Island Department of Environmental Management", agencyAbbreviation: "RIDEM", minimumAge: null, fieldDayRequired: true, courseUrl: "https://dem.ri.gov/natural-resources-bureau/law-enforcement/boating-safety-certification", importantNotes: "Required for anyone born on or after January 1, 1986, operating boats with 10+ hp. Must complete 8-hour in-person course with proctored exam.", fieldDayDetails: "An 8-hour course with a proctored written exam under certified instructor supervision is required." },
    { slug: "south-carolina", description: "Online boater education course approved by NASBLA. South Carolina requires education for anyone born after July 1, 2007.", agencyName: "South Carolina Department of Natural Resources", agencyAbbreviation: "SCDNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://www.dnr.sc.gov/education/boated.html", importantNotes: "Required for anyone born after July 1, 2007.", fieldDayDetails: null },
    { slug: "south-dakota", description: "South Dakota has no mandatory boating safety education requirement, though voluntary courses are available.", agencyName: "South Dakota Game, Fish and Parks", agencyAbbreviation: "SDGFP", minimumAge: null, fieldDayRequired: false, courseUrl: "https://gfp.sd.gov/", importantNotes: "No mandatory boating education requirement. Voluntary courses are available.", fieldDayDetails: null },
    { slug: "tennessee", description: "Online boater education course approved by TWRA and NASBLA. Tennessee requires education for anyone born after January 1, 1989.", agencyName: "Tennessee Wildlife Resources Agency", agencyAbbreviation: "TWRA", minimumAge: null, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/tennessee/", importantNotes: "Required for anyone born after January 1, 1989.", fieldDayDetails: null },
    { slug: "texas", description: "Online boater education course approved by Texas Parks and Wildlife and NASBLA. Required for anyone born on or after September 1, 1993.", agencyName: "Texas Parks and Wildlife Department", agencyAbbreviation: "TPWD", minimumAge: 13, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/texas/", importantNotes: "Required for anyone born on or after September 1, 1993. Minimum age 13.", fieldDayDetails: null },
    { slug: "utah", description: "Online boater education course approved by NASBLA. Utah requires education for PWC operators ages 12-17.", agencyName: "Utah Division of Outdoor Recreation", agencyAbbreviation: "DOR", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://recreation.utah.gov/boating/boating-education/", importantNotes: "Required for PWC operators ages 12-17. No requirement for adult motorboat operators.", fieldDayDetails: null },
    { slug: "vermont", description: "Online boater education course approved by NASBLA. Vermont requires education for anyone born on or after January 1, 1974, operating motorized vessels.", agencyName: "Vermont Fish and Wildlife Department", agencyAbbreviation: "VFWD", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://www.vtfishandwildlife.com/fish/boating-in-vermont", importantNotes: "Required for anyone born on or after January 1, 1974, operating motorized vessels.", fieldDayDetails: null },
    { slug: "virginia", description: "Online boater education course approved by Virginia DWR and NASBLA. Required for PWC operators age 14+ and all motorboat operators with 10+ hp.", agencyName: "Virginia Department of Wildlife Resources", agencyAbbreviation: "DWR", minimumAge: 14, fieldDayRequired: false, courseUrl: "https://recademics.com/boating/virginia/", importantNotes: "Required for PWC operators age 14+ and all motorboat operators with 10+ hp.", fieldDayDetails: null },
    { slug: "washington", description: "Online boater education course approved by NASBLA. Washington requires education for operators of motorboats with 15+ hp.", agencyName: "Washington State Parks and Recreation Commission", agencyAbbreviation: "WSPRC", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://parks.wa.gov/about/rules-and-safety/boater-education-safety/boater-education-card", importantNotes: "Required for operators of motorboats with 15+ hp, unless born before January 1, 1955.", fieldDayDetails: null },
    { slug: "west-virginia", description: "Online boater education course approved by NASBLA. West Virginia requires education for anyone born after December 31, 1986.", agencyName: "West Virginia Division of Natural Resources", agencyAbbreviation: "WVDNR", minimumAge: null, fieldDayRequired: false, courseUrl: "https://wvdnr.gov/boater-education/", importantNotes: "Required for anyone born after December 31, 1986.", fieldDayDetails: null },
    { slug: "wisconsin", description: "Online boater education course approved by NASBLA. Wisconsin requires education for operators age 12+ born on or after January 1, 1989.", agencyName: "Wisconsin Department of Natural Resources", agencyAbbreviation: "WDNR", minimumAge: 12, fieldDayRequired: false, courseUrl: "https://dnr.wisconsin.gov/Education/OutdoorSkills/safetyEducation", importantNotes: "Required for operators age 12+ born on or after January 1, 1989.", fieldDayDetails: null },
    { slug: "wyoming", description: "Wyoming has no mandatory boating safety education requirement, though voluntary courses are available.", agencyName: "Wyoming Game and Fish Department", agencyAbbreviation: "WGFD", minimumAge: null, fieldDayRequired: false, courseUrl: "https://wgfd.wyo.gov/fishing-boating/boating-watercraft", importantNotes: "No mandatory boating education requirement. Voluntary courses are available.", fieldDayDetails: null },
  ];

  for (const state of stateUpdates) {
    await db.execute(sql`
      UPDATE states SET
        description = ${state.description},
        agency_name = ${state.agencyName},
        agency_abbreviation = ${state.agencyAbbreviation},
        minimum_age = ${state.minimumAge},
        field_day_required = ${state.fieldDayRequired},
        course_url = ${state.courseUrl},
        important_notes = ${state.importantNotes},
        field_day_details = ${state.fieldDayDetails}
      WHERE slug = ${state.slug}
    `);
  }

  console.log("State data accuracy updates complete.");

  // Migration v3: Seed official state agency boater education resources
  console.log("Seeding official state agency resources (v3)...");

  const officialResources = [
    { slug: "alabama", title: "ALEA Marine Patrol – Boating Education", url: "https://www.alea.gov/dps/marine-patrol/boating-education-and-operator-certificationlicense", description: "Official Alabama boater education and certification information from the Alabama Law Enforcement Agency." },
    { slug: "alaska", title: "Alaska DNR – Office of Boating Safety", url: "https://dnr.alaska.gov/parks/boating/", description: "Official Alaska boating safety education information from the Department of Natural Resources." },
    { slug: "arizona", title: "AZGFD – Boating Education", url: "https://www.azgfd.com/education/boating-education/", description: "Official Arizona boating education requirements and courses from the Arizona Game and Fish Department." },
    { slug: "arkansas", title: "AGFC – Boater Education", url: "https://www.agfc.com/education/boater-education/", description: "Official Arkansas boater education information from the Arkansas Game and Fish Commission." },
    { slug: "california", title: "California DBW – Boating Safety & Education", url: "https://dbw.parks.ca.gov/?page_id=28711", description: "Official California boating safety and education information from the Division of Boating and Waterways." },
    { slug: "colorado", title: "Colorado Parks & Wildlife – Boating Safety", url: "https://cpw.state.co.us/activities/boating/boating-safety", description: "Official Colorado boating safety education information from Colorado Parks and Wildlife." },
    { slug: "connecticut", title: "CT DEEP – Boating Classes", url: "https://portal.ct.gov/DEEP/Boating/Education/Boating-Classes", description: "Official Connecticut boating education class information from the Department of Energy and Environmental Protection." },
    { slug: "delaware", title: "Delaware DNREC – Boating Safety", url: "https://dnrec.delaware.gov/fish-wildlife/boating/safety/", description: "Official Delaware boating safety education information from DNREC." },
    { slug: "florida", title: "Florida FWC – Boater Education", url: "https://myfwc.com/boating/safety-education/", description: "Official Florida boater education and safety information from the Fish and Wildlife Conservation Commission." },
    { slug: "georgia", title: "Georgia DNR – Boating Education", url: "https://gadnrle.org/boating-education", description: "Official Georgia boating education information from the Department of Natural Resources." },
    { slug: "hawaii", title: "Hawaii DOBOR – Boating Education", url: "https://dlnr.hawaii.gov/dobor/boating-in-hawaii/", description: "Official Hawaii boating education information from the Division of Boating and Ocean Recreation." },
    { slug: "idaho", title: "Idaho Parks & Recreation – Boating Safety Classes", url: "https://parksandrecreation.idaho.gov/activities/boating/boating-safety-classes/", description: "Official Idaho boating safety class information from the Department of Parks and Recreation." },
    { slug: "illinois", title: "Illinois DNR – Boating Safety Education", url: "https://dnr.illinois.gov/safety/boatingsafety.html", description: "Official Illinois boating safety education information from the Department of Natural Resources." },
    { slug: "indiana", title: "Indiana DNR – Boating Education & Safety", url: "https://www.in.gov/dnr/law-enforcement/education/boating-education-and-safety/", description: "Official Indiana boating education and safety information from the Department of Natural Resources." },
    { slug: "iowa", title: "Iowa DNR – Boater Education & Safety", url: "https://www.iowadnr.gov/things-do/boating/boater-education-safety", description: "Official Iowa boater education and safety information from the Department of Natural Resources." },
    { slug: "kansas", title: "Kansas KDWP – Boating Education", url: "https://ksoutdoors.gov/Boating/Boating-Education", description: "Official Kansas boating education information from the Department of Wildlife and Parks." },
    { slug: "kentucky", title: "Kentucky KDFWR – Boater Education", url: "https://fw.ky.gov/Boat/pages/boater-education.aspx", description: "Official Kentucky boater education information from the Department of Fish and Wildlife Resources." },
    { slug: "louisiana", title: "Louisiana LDWF – Boater Education", url: "https://www.wlf.louisiana.gov/page/boater-education", description: "Official Louisiana mandatory boater education information from the Department of Wildlife and Fisheries." },
    { slug: "maine", title: "Maine DIFW – Boating Safety Course", url: "https://www.maine.gov/ifw/programs-resources/educational-programs/safety-courses/boating-safety.html", description: "Official Maine boating safety education course information from the Department of Inland Fisheries and Wildlife." },
    { slug: "maryland", title: "Maryland DNR – Boating Safety Certificate", url: "https://dnr.maryland.gov/nrp/pages/boatingsafety/safety_certificate.aspx", description: "Official Maryland boating safety certificate information from the Department of Natural Resources." },
    { slug: "massachusetts", title: "Massachusetts – Boat Safety Certificate Course", url: "https://www.mass.gov/how-to/boat-safety-certificate-course", description: "Official Massachusetts boat safety certificate course information from Mass.gov." },
    { slug: "michigan", title: "Michigan DNR – Boating Safety Certificate", url: "https://www.michigan.gov/dnr/things-to-do/boating/safety-certificate", description: "Official Michigan boating safety certificate information from the Department of Natural Resources." },
    { slug: "minnesota", title: "Minnesota DNR – Boat & Water Safety Education", url: "https://www.dnr.state.mn.us/safety/boatwater/education.html", description: "Official Minnesota boat and water safety education information from the Department of Natural Resources." },
    { slug: "mississippi", title: "Mississippi MDWFP – Boater Education", url: "https://www.mdwfp.com/enforcement-education/boater-education", description: "Official Mississippi boater education information from the Department of Wildlife, Fisheries, and Parks." },
    { slug: "missouri", title: "Missouri MSHP – Boater Education Course", url: "https://www.mshp.dps.missouri.gov/MSHPWeb/WaterPatrol/BoatingLaws_Education/requiredBoaterEdCourse.html", description: "Official Missouri boater education course requirements from the State Highway Patrol Water Patrol." },
    { slug: "montana", title: "Montana FWP – Boating Education", url: "https://fwp.mt.gov/activities/boating/education", description: "Official Montana boating education information from Fish, Wildlife and Parks." },
    { slug: "nebraska", title: "Nebraska Game & Parks – Boater Education", url: "https://outdoornebraska.gov/parks/go-boating/boater-education/", description: "Official Nebraska boater education information from the Game and Parks Commission." },
    { slug: "nevada", title: "Nevada NDOW – Boating Education", url: "https://www.ndow.org/events/boating-education/", description: "Official Nevada boating education information from the Department of Wildlife." },
    { slug: "new-hampshire", title: "NH State Police Marine Patrol – Boating Education", url: "https://www.nhsp.dos.nh.gov/our-services/field-operations-bureau/marine-patrol/boating-education", description: "Official New Hampshire boating education information from the State Police Marine Patrol." },
    { slug: "new-jersey", title: "NJ State Police – Boating Safety Course", url: "https://www.nj.gov/njsp/marine-services/bsc-course-locations.shtml", description: "Official New Jersey boating safety course information from the State Police Marine Services Bureau." },
    { slug: "new-mexico", title: "New Mexico State Parks – Boating Education", url: "https://www.emnrd.nm.gov/spd/activities/boating-2/boating-education/", description: "Official New Mexico boating education information from the State Parks Division." },
    { slug: "new-york", title: "NYS Parks – Boating Education", url: "https://parks.ny.gov/activities/boating/boating-education", description: "Official New York boating education information from the Office of Parks, Recreation and Historic Preservation." },
    { slug: "north-carolina", title: "NC Wildlife – Boating Education Courses", url: "https://www.ncwildlife.gov/education/boating-education-courses", description: "Official North Carolina boating education course information from the Wildlife Resources Commission." },
    { slug: "north-dakota", title: "North Dakota Game & Fish – Boating Education", url: "https://gf.nd.gov/education/boating", description: "Official North Dakota boating and water safety education information from the Game and Fish Department." },
    { slug: "ohio", title: "Ohio ODNR – Boater Education Requirements", url: "https://ohiodnr.gov/discover-and-learn/education-training/boater-education-skills/1-meeting-boater-ed-requirements", description: "Official Ohio boater education requirements from the Department of Natural Resources." },
    { slug: "oklahoma", title: "Oklahoma DPS – Boating Education", url: "https://oklahoma.gov/dps/programs-services/boated.html", description: "Official Oklahoma boating education information from the Department of Public Safety." },
    { slug: "oregon", title: "Oregon State Marine Board – Boater Education", url: "https://www.oregon.gov/osmb/boater-info/Pages/Boater-Education-Cards.aspx", description: "Official Oregon boater education card information from the State Marine Board." },
    { slug: "pennsylvania", title: "PA Fish & Boat Commission – Boating Safety Education", url: "https://www.pa.gov/services/fishandboat/apply-for-bsec-and-safety-courses", description: "Official Pennsylvania boating safety education certificate and course information." },
    { slug: "rhode-island", title: "Rhode Island DEM – Boating Safety Certification", url: "https://dem.ri.gov/natural-resources-bureau/law-enforcement/boating-safety-certification", description: "Official Rhode Island boating safety certification information from the Department of Environmental Management." },
    { slug: "south-carolina", title: "SC DNR – Boater Education", url: "https://www.dnr.sc.gov/education/boated.html", description: "Official South Carolina boater education information from the Department of Natural Resources." },
    { slug: "south-dakota", title: "South Dakota GFP – Boating Safety", url: "https://gfp.sd.gov/safety/", description: "Official South Dakota boating safety information from Game, Fish and Parks." },
    { slug: "tennessee", title: "Tennessee TWRA – Boating Education", url: "https://www.tn.gov/twra/boating/boating-education.html", description: "Official Tennessee boating education information from the Wildlife Resources Agency." },
    { slug: "texas", title: "Texas TPWD – Boater Education", url: "https://tpwd.texas.gov/education/boater-education/", description: "Official Texas boater education information from the Parks and Wildlife Department." },
    { slug: "utah", title: "Utah DOR – Boating Education", url: "https://recreation.utah.gov/boating-education/", description: "Official Utah boating education information from the Division of Outdoor Recreation." },
    { slug: "vermont", title: "Vermont Fish & Wildlife – Boating", url: "https://www.vtfishandwildlife.com/fish/boating-in-vermont", description: "Official Vermont boating information from the Fish and Wildlife Department." },
    { slug: "virginia", title: "Virginia DWR – Boating Safety & Education", url: "https://dwr.virginia.gov/boating/boating-safety/", description: "Official Virginia boating safety and education information from the Department of Wildlife Resources." },
    { slug: "washington", title: "Washington State Parks – Boater Education & Safety", url: "https://parks.wa.gov/about/rules-and-safety/boater-education-safety", description: "Official Washington boater education and safety information from State Parks." },
    { slug: "west-virginia", title: "West Virginia DNR – Boater Education", url: "https://wvdnr.gov/boater-education/", description: "Official West Virginia boating safety education information from the Division of Natural Resources." },
    { slug: "wisconsin", title: "Wisconsin DNR – Safety Education", url: "https://dnr.wisconsin.gov/Education/OutdoorSkills/safetyEducation", description: "Official Wisconsin boating safety education information from the Department of Natural Resources." },
    { slug: "wyoming", title: "Wyoming Game & Fish – Boating & Watercraft", url: "https://wgfd.wyo.gov/fishing-boating/boating-watercraft", description: "Official Wyoming boating and watercraft information from the Game and Fish Department." },
  ];

  for (const r of officialResources) {
    // Look up state ID by slug
    const stateRow = await db.execute(sql`SELECT id FROM states WHERE slug = ${r.slug}`);
    const stateId = (stateRow.rows[0] as any)?.id;
    if (!stateId) {
      console.log(`  Skipping ${r.slug} — state not found`);
      continue;
    }

    // Only insert if no resource with this URL already exists for this state
    const existing = await db.execute(
      sql`SELECT id FROM resources WHERE state_id = ${stateId} AND url = ${r.url}`
    );
    if (existing.rows.length > 0) {
      continue; // Already seeded
    }

    await db.execute(sql`
      INSERT INTO resources (state_id, title, url, description, resource_type, is_active, created_at, updated_at)
      VALUES (${stateId}, ${r.title}, ${r.url}, ${r.description}, 'official_state_page', true, NOW(), NOW())
    `);
    console.log(`  ✓ ${r.title}`);
  }

  console.log("Official state agency resources seeded.");

  // Migration v4: Add extended_content column and seed expanded content for TX, CA, NY
  console.log("Running extended content migration (v4)...");

  await db.execute(sql`
    ALTER TABLE states ADD COLUMN IF NOT EXISTS extended_content TEXT
  `);

  // Custom meta descriptions for high-traffic states
  const metaDescriptions: Record<string, string> = {
    "texas": "Get your Texas Boater Education Certificate online. TPWD-approved and NASBLA-certified. Required for anyone born on or after September 1, 1993. Learn requirements, costs, and how to get certified in Texas.",
    "california": "Get your California Boater Education Card online. DBW-approved and NASBLA-certified. Required for ALL motorized vessel operators as of 2025. Learn requirements, costs, and how to get your California Boating Card.",
    "new-york": "Get your New York Boating Safety Certificate online. NYS Parks-approved and NASBLA-certified. Required for ALL motorized vessel operators. Learn requirements, costs, and how to get certified in New York.",
    "florida": "Get your Florida Boater Education Certificate online. FWC-approved and NASBLA-certified. Required for anyone born on or after January 1, 1988. Learn requirements, costs, and how to get certified in Florida."
  };

  for (const [slug, metaDesc] of Object.entries(metaDescriptions)) {
    await db.execute(sql`
      UPDATE states SET meta_description = ${metaDesc}
      WHERE slug = ${slug} AND meta_description IS NULL
    `);
  }

  // Extended content for Texas
  await db.execute(sql`
    UPDATE states SET extended_content = ${`
<h2>Texas Boater Education: What You Need to Know</h2>
<p>Texas law requires anyone born on or after <strong>September 1, 1993</strong>, to complete a boater education course before operating a motorized vessel on Texas waterways. The course must be approved by the <strong>Texas Parks and Wildlife Department (TPWD)</strong> and meet NASBLA standards.</p>

<h3>Who Needs a Texas Boater Education Certificate?</h3>
<ul>
  <li>Anyone born on or after September 1, 1993, who operates a motorized vessel</li>
  <li>Anyone operating a personal watercraft (PWC/jet ski) regardless of birth date</li>
  <li>Minimum age of 13 to take the course</li>
</ul>

<h3>What Does the Course Cover?</h3>
<p>The Texas boater education course covers vessel operation safety, navigation rules, state-specific boating laws, emergency procedures, and environmental responsibility. Topics include Texas-specific rules about no-wake zones, required safety equipment, and the legal blood alcohol limit for boating (0.08% BAC).</p>

<h3>How Long Does It Take?</h3>
<p>The online course typically takes 4-6 hours to complete and can be done at your own pace. You can save your progress and return at any time. The course concludes with a proctored final exam that you must pass to receive your certificate.</p>

<h3>Texas Boating Laws at a Glance</h3>
<ul>
  <li><strong>Life jackets:</strong> Required for children under 13 on any vessel under 26 feet while underway</li>
  <li><strong>BUI limit:</strong> 0.08% BAC — same as driving</li>
  <li><strong>PWC hours:</strong> PWCs may not be operated between 30 minutes after sunset and 30 minutes before sunrise</li>
  <li><strong>Registration:</strong> All motorboats and sailboats over 14 feet must be registered with TPWD</li>
</ul>
`}
    WHERE slug = 'texas'
  `);

  // Extended content for California
  await db.execute(sql`
    UPDATE states SET extended_content = ${`
<h2>California Boater Education: What You Need to Know</h2>
<p>As of <strong>January 1, 2025</strong>, California requires <strong>ALL operators of motorized vessels</strong> to carry a California Boater Card. This law was phased in over several years starting in 2018 and is now fully in effect for all ages. The course must be approved by the <strong>California Division of Boating and Waterways (DBW)</strong>.</p>

<h3>Who Needs a California Boater Card?</h3>
<ul>
  <li>All operators of motorized recreational vessels on California waterways</li>
  <li>No age exemptions — the requirement applies to everyone as of 2025</li>
  <li>The California Boater Card does not expire and is valid for life</li>
</ul>

<h3>What Does the Course Cover?</h3>
<p>The California boater education course covers boat handling, navigation rules, California-specific waterway regulations, safety equipment requirements, and environmental stewardship. It includes California-specific topics like kelp bed navigation, marine mammal protection laws, and coastal boating considerations.</p>

<h3>How Long Does It Take?</h3>
<p>The online course takes approximately 3-4 hours and can be completed at your own pace. After passing the final exam, you can print a temporary card immediately. Your permanent California Boater Card will be mailed to you.</p>

<h3>California Boating Laws at a Glance</h3>
<ul>
  <li><strong>Life jackets:</strong> Required for children under 13 on any vessel and for all PWC operators</li>
  <li><strong>BUI limit:</strong> 0.08% BAC for boaters age 21+; 0.01% for boaters under 21</li>
  <li><strong>Speed limits:</strong> 5 mph within 200 feet of shore, swimmers, or docks (most areas)</li>
  <li><strong>Mufflers:</strong> All motorboats must have functioning mufflers</li>
  <li><strong>Marine Protected Areas:</strong> Numerous MPAs along the California coast with specific regulations</li>
</ul>
`}
    WHERE slug = 'california'
  `);

  // Extended content for New York
  await db.execute(sql`
    UPDATE states SET extended_content = ${`
<h2>New York Boater Education: What You Need to Know</h2>
<p>As of <strong>January 1, 2025</strong>, New York requires <strong>ALL operators of motorized vessels</strong> to hold a Boating Safety Certificate. This requirement was phased in over several years and now applies to all ages. The course must be approved by <strong>New York State Parks, Recreation and Historic Preservation</strong>.</p>

<h3>Who Needs a New York Boating Safety Certificate?</h3>
<ul>
  <li>All operators of motorized vessels on New York waterways</li>
  <li>All operators of personal watercraft (PWC/jet ski)</li>
  <li>Minimum age of 10 to take the course (operators under 18 have restrictions)</li>
  <li>The certificate does not expire</li>
</ul>

<h3>What Does the Course Cover?</h3>
<p>The New York boating safety course covers vessel types and handling, navigation rules specific to New York waterways, required safety equipment, emergency procedures, and New York boating laws. It includes information about operating on the Hudson River, Great Lakes, Long Island Sound, and the state's extensive inland waterway system.</p>

<h3>How Long Does It Take?</h3>
<p>The online course typically takes 6-8 hours and can be completed at your own pace. You'll need to pass a final exam to receive your certificate. The certificate is mailed to you after successful completion.</p>

<h3>New York Boating Laws at a Glance</h3>
<ul>
  <li><strong>Life jackets:</strong> Required for children under 12 on vessels under 65 feet and for all PWC operators</li>
  <li><strong>BUI limit:</strong> 0.08% BAC; 0.02% for operators under 21</li>
  <li><strong>PWC age:</strong> Must be at least 14 to operate a PWC</li>
  <li><strong>Registration:</strong> All motorized vessels must be registered with the NY DMV</li>
  <li><strong>No-wake zones:</strong> 5 mph within 100 feet of shore, docks, piers, or anchored vessels</li>
</ul>
`}
    WHERE slug = 'new-york'
  `);

  console.log("Extended content migration complete.");

  // Migration v5.1: Add sort_order and is_featured columns to articles
  await db.execute(sql`
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0
  `);
  await db.execute(sql`
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false
  `);

  // Migration v5: Seed comprehensive content for all 50 states + blog articles
  console.log("Running content seeding (v5)...");
  await seedAllStatesContent(db);
  await seedCoreArticles(db);
  await seedStateGuideArticles(db);
  await seedArticleImages(db);
  console.log("Content seeding complete.");

  console.log("Database migrations complete.");
}
