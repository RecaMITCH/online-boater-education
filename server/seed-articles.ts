import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

interface ArticleSeed {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
}

const coreArticles: ArticleSeed[] = [
  {
    title: "Do I Need a Boating License? What Boater Education Really Is",
    slug: "do-i-need-a-boating-license",
    excerpt: "Most states don't issue a 'boating license' — they require a boater education certificate. Learn the difference, who needs one, and how to get certified.",
    metaTitle: "Do I Need a Boating License? Boater Education Explained",
    metaDescription: "Learn whether you need a boating license or boater education certificate. Find out your state's requirements, who's exempt, and how to get certified online.",
    content: `
<p>One of the most common questions new boaters ask is: <strong>"Do I need a boating license?"</strong> The short answer is that most states don't issue a traditional license the way they do for driving a car. Instead, they require a <strong>boater education certificate</strong> (sometimes called a boating safety certificate or boater card).</p>

<h2>Boating License vs. Boater Education Certificate</h2>
<p>Unlike a driver's license, a boater education certificate doesn't expire, doesn't require renewal, and you don't need to visit a DMV. It's a one-time certification that proves you've completed an approved boating safety course. Once you have it, you're certified for life in most states.</p>
<p>The certificate is issued after you complete a course approved by your state's boating agency and the <strong>National Association of State Boating Law Administrators (NASBLA)</strong>.</p>

<h2>Who Needs Boater Education?</h2>
<p>Requirements vary by state, but generally fall into these categories:</p>
<ul>
  <li><strong>All operators:</strong> Some states (like California, New York, and Alabama) require ALL motorized vessel operators to have certification, regardless of age.</li>
  <li><strong>Birth-date cutoff:</strong> Many states require certification for anyone born after a certain date (e.g., Florida requires it for anyone born on or after January 1, 1988).</li>
  <li><strong>Age-based:</strong> Some states only require youth operators (typically under 16 or 18) to be certified.</li>
  <li><strong>No requirement:</strong> A handful of states have no mandatory boater education, though courses are always recommended.</li>
</ul>
<p>Not sure about your state? <a href="/states">Find your state's specific requirements here</a>.</p>

<h2>What Does the Course Cover?</h2>
<p>A NASBLA-approved boater education course typically covers:</p>
<ul>
  <li>Boat types, parts, and engine basics</li>
  <li>Navigation rules (right-of-way, buoys, markers)</li>
  <li>Required safety equipment (life jackets, fire extinguishers, flares)</li>
  <li>State-specific boating laws and regulations</li>
  <li>Emergency procedures (man overboard, capsizing, calling for help)</li>
  <li>Weather awareness and trip planning</li>
  <li>Environmental responsibility and clean boating</li>
</ul>

<h2>How Long Does It Take?</h2>
<p>Most online courses take <strong>4–6 hours</strong> to complete. You can work at your own pace — save your progress, take breaks, and come back whenever you're ready. There's a final exam at the end that you must pass to receive your certificate.</p>

<h2>Is It Really Worth It?</h2>
<p>Absolutely. According to the U.S. Coast Guard, <strong>77% of boating fatalities</strong> occur on boats where the operator had no boating safety education. Taking a course doesn't just satisfy a legal requirement — it could save your life or the lives of your passengers.</p>
<p>Many insurance companies also offer discounts to boaters who have completed an approved safety course, so your certificate can pay for itself.</p>

<h2>How to Get Started</h2>
<p>Getting your boater education certificate is simple:</p>
<ol>
  <li><a href="/states">Find your state</a> to see your specific requirements</li>
  <li>Choose a NASBLA-approved online course</li>
  <li>Complete the course at your own pace</li>
  <li>Pass the final exam</li>
  <li>Receive your certificate (many providers offer instant digital certificates)</li>
</ol>
<p>Ready to get certified? <a href="/states">Browse all 50 states</a> to find your approved course.</p>
`
  },
  {
    title: "Can I Boat in Another State With My Boater Education Certificate?",
    slug: "boater-education-reciprocity-other-states",
    excerpt: "Your NASBLA-approved boater education certificate is recognized in most states through reciprocity. Here's what you need to know about boating across state lines.",
    metaTitle: "Boater Education Reciprocity: Using Your Certificate in Other States",
    metaDescription: "Learn how NASBLA boater education reciprocity works. Your certificate is valid in most U.S. states. Find out which states honor your certification and what to know.",
    content: `
<p>Planning to boat in a different state? Good news: if you hold a <strong>NASBLA-approved boater education certificate</strong>, it's recognized in most other states through reciprocity agreements. Here's everything you need to know.</p>

<h2>What Is Boater Education Reciprocity?</h2>
<p>Reciprocity means that states agree to honor boater education certificates issued by other states — as long as the course was NASBLA-approved. It's similar to how your driver's license from one state is valid when you drive in another.</p>
<p>The <strong>National Association of State Boating Law Administrators (NASBLA)</strong> sets the standard for boating safety education nationwide. When a course meets NASBLA standards, it's widely accepted across the country.</p>

<h2>Which States Honor My Certificate?</h2>
<p>Most states with boater education requirements honor NASBLA-approved certificates from other states. This includes major boating destinations like <a href="/states/florida">Florida</a>, <a href="/states/california">California</a>, <a href="/states/michigan">Michigan</a>, and <a href="/states/texas">Texas</a>.</p>
<p>However, there are a few important caveats:</p>
<ul>
  <li><strong>Some states have additional requirements:</strong> A few states may require you to carry your out-of-state certificate and possibly additional documentation.</li>
  <li><strong>Age rules still apply:</strong> If a state has minimum age requirements for boat operators, those apply regardless of where your certificate was issued.</li>
  <li><strong>State-specific rules:</strong> You must still follow the boating laws of the state where you're operating — speed limits, equipment requirements, BUI laws, etc.</li>
</ul>

<h2>Tips for Boating in Another State</h2>
<ol>
  <li><strong>Carry your certificate:</strong> Always have your boater education certificate (physical card or digital copy) on board.</li>
  <li><strong>Research local laws:</strong> Each state has unique boating regulations. Check <a href="/states">our state pages</a> for details.</li>
  <li><strong>Check equipment requirements:</strong> Safety equipment requirements (life jackets, fire extinguishers, visual distress signals) may differ by state.</li>
  <li><strong>Know local speed and no-wake zones:</strong> These vary significantly from state to state and even lake to lake.</li>
  <li><strong>Understand registration:</strong> If you're trailering your boat to another state, check whether you need temporary registration.</li>
</ol>

<h2>What If My State Doesn't Require Boater Education?</h2>
<p>Even if your home state doesn't mandate boater education, you may need a certificate to legally operate a boat in states that do require it. For example, if you live in a state without mandatory education but want to boat in <a href="/states/new-york">New York</a> or <a href="/states/california">California</a>, you'll need to get certified first.</p>
<p>Getting certified is always recommended regardless — it improves your safety on the water and often qualifies you for insurance discounts.</p>

<h2>Get Certified Today</h2>
<p>The easiest way to ensure you can boat legally anywhere in the U.S. is to complete a NASBLA-approved course. <a href="/states">Find your state's requirements</a> and get started with an approved online course today.</p>
`
  },
  {
    title: "What to Expect at a Boating Safety Field Day",
    slug: "what-to-expect-boating-safety-field-day",
    excerpt: "Some states require an on-water practical assessment after completing your online course. Here's what happens at a boating safety field day and how to prepare.",
    metaTitle: "What to Expect at a Boating Safety Field Day | On-Water Assessment Guide",
    metaDescription: "Preparing for your boating safety field day? Learn what happens at the on-water practical assessment, what to bring, and how to pass on your first try.",
    content: `
<p>Some states require boaters to attend an <strong>on-water practical assessment</strong> (often called a "field day") after completing their online course. If your state requires one, here's everything you need to know to prepare and pass.</p>

<h2>What Is a Boating Safety Field Day?</h2>
<p>A field day is a hands-on component of your boater education. While the online course teaches you the rules and theory, the field day gives you practical experience on the water under the supervision of certified instructors. Not all states require a field day — <a href="/blog/10-states-complete-boater-education-online">many states allow 100% online completion</a>.</p>

<h2>States That Require a Field Day</h2>
<p>Field day requirements vary by state. Some common scenarios:</p>
<ul>
  <li><strong>Required for all ages:</strong> States like <a href="/states/connecticut">Connecticut</a>, <a href="/states/new-hampshire">New Hampshire</a>, and <a href="/states/rhode-island">Rhode Island</a> require in-person components for all students.</li>
  <li><strong>Required for younger boaters:</strong> States like <a href="/states/colorado">Colorado</a> require field days only for younger operators (e.g., ages 14–15), while older students can complete everything online.</li>
  <li><strong>Not required:</strong> Many states allow full online completion. <a href="/states">Check your state</a> for details.</li>
</ul>

<h2>What Happens at a Field Day</h2>
<p>A typical boating safety field day includes:</p>
<ul>
  <li><strong>Safety equipment check:</strong> You'll learn to inspect and use life jackets, fire extinguishers, and visual distress signals.</li>
  <li><strong>Pre-departure checklist:</strong> Instructors walk you through the complete pre-launch and safety check process.</li>
  <li><strong>On-water operation:</strong> You'll get hands-on time operating a boat, including starting, steering, docking, and anchoring.</li>
  <li><strong>Navigation practice:</strong> Reading buoys, following channel markers, and understanding right-of-way on the water.</li>
  <li><strong>Emergency drills:</strong> Man overboard procedures, emergency stops, and distress signal use.</li>
  <li><strong>Written or oral exam:</strong> Some states include a proctored test during the field day.</li>
</ul>

<h2>How to Prepare</h2>
<ol>
  <li><strong>Complete the online course first.</strong> The field day builds on what you learned online.</li>
  <li><strong>Review key topics:</strong> Navigation rules, safety equipment, and emergency procedures are heavily tested.</li>
  <li><strong>Dress appropriately:</strong> Wear weather-appropriate clothing, closed-toe shoes with good grip, and bring sunscreen.</li>
  <li><strong>Bring required documents:</strong> Your online course completion certificate, photo ID, and any forms required by your state.</li>
  <li><strong>Arrive early:</strong> Give yourself time to check in and review materials before the session starts.</li>
</ol>

<h2>How Long Does It Take?</h2>
<p>Most field days run <strong>4–8 hours</strong>, depending on the state and program. Some states have half-day sessions for students who completed the online portion first, while others require a full-day classroom and on-water experience.</p>

<h2>What If I Fail?</h2>
<p>Don't worry — most students pass on their first attempt. If you don't pass, you can usually retake the assessment. Focus on demonstrating safe boat handling, knowledge of navigation rules, and proper use of safety equipment.</p>

<p>Not sure if your state requires a field day? <a href="/states">Check your state's requirements</a> to find out.</p>
`
  },
  {
    title: "10 States Where You Can Complete Boater Education 100% Online",
    slug: "10-states-complete-boater-education-online",
    excerpt: "These states let you earn your boater education certificate entirely online — no field day, no classroom, no in-person exam required.",
    metaTitle: "10 States Where Boater Education Is 100% Online | No Field Day Required",
    metaDescription: "Complete your boater education entirely online in these states. No field day, classroom visit, or in-person exam required. Get certified from home.",
    content: `
<p>Many boaters prefer the convenience of completing their entire certification online. The good news: <strong>the majority of U.S. states</strong> allow you to earn your boater education certificate 100% online with no in-person component required. Here are 10 popular states where you can get certified from your couch.</p>

<h2>1. Florida</h2>
<p><a href="/states/florida">Florida</a> — the boating capital of the U.S. — lets you complete your boater education entirely online. Required for anyone born on or after January 1, 1988, operating vessels with 10+ hp. The FWC-approved online course takes about 4–6 hours.</p>

<h2>2. Texas</h2>
<p><a href="/states/texas">Texas</a> allows 100% online completion for boaters age 13+. Required for anyone born on or after September 1, 1993. The TPWD-approved course covers Texas-specific boating laws and the Gulf Coast.</p>

<h2>3. California</h2>
<p><a href="/states/california">California</a> now requires ALL motorized vessel operators to carry a California Boater Card (as of 2025). The DBW-approved course is entirely online, and your card never expires.</p>

<h2>4. New York</h2>
<p><a href="/states/new-york">New York</a> requires ALL motorized vessel operators to hold a Boating Safety Certificate (as of 2025). The NYS Parks-approved course is available online with no in-person requirement for most boaters.</p>

<h2>5. Michigan</h2>
<p><a href="/states/michigan">Michigan</a>, with more coastline than any state except Alaska, offers full online boater education. Required for anyone born on or after July 1, 1996. Michigan's 11,000+ inland lakes await.</p>

<h2>6. Ohio</h2>
<p><a href="/states/ohio">Ohio</a> allows complete online certification. Required for anyone born on or after January 1, 1982, operating boats with 10+ hp. Lake Erie and Ohio's many reservoirs are perfect for certified boaters.</p>

<h2>7. Georgia</h2>
<p><a href="/states/georgia">Georgia</a> offers full online completion for boater education. Required for anyone born on or after January 1, 1998. From the Golden Isles to Lake Lanier, Georgia's waters are waiting.</p>

<h2>8. Oregon</h2>
<p><a href="/states/oregon">Oregon</a> allows online completion for boaters age 16+. Required for operators of boats with 10+ hp. With Crater Lake, the Columbia River, and the Pacific coast, Oregon is a boater's dream.</p>

<h2>9. Maryland</h2>
<p><a href="/states/maryland">Maryland</a> — home to the Chesapeake Bay and the sailing capital of Annapolis — offers full online certification. Required for anyone born on or after July 1, 1972.</p>

<h2>10. North Carolina</h2>
<p><a href="/states/north-carolina">North Carolina</a> allows complete online boater education. Required for anyone born on or after January 1, 1988. From the Outer Banks to Lake Norman, NC has incredible boating diversity.</p>

<h2>What About the Other States?</h2>
<p>Most states allow online completion. Only a handful require an in-person component (field day or proctored exam). <a href="/states">Browse all 50 states</a> to find your specific requirements.</p>
<p>If your state does require a field day, don't worry — <a href="/blog/what-to-expect-boating-safety-field-day">here's what to expect</a> and how to prepare.</p>

<h2>Get Certified Today</h2>
<p>All courses linked from our site are NASBLA-approved, meaning your certificate is <a href="/blog/boater-education-reciprocity-other-states">recognized in most states through reciprocity</a>. <a href="/states">Find your state</a> and get started.</p>
`
  },
  {
    title: "Boating Safety 101: Essential Tips Every Boater Should Know",
    slug: "boating-safety-101-essential-tips",
    excerpt: "From pre-departure checklists to emergency procedures, these essential boating safety tips will keep you and your passengers safe on the water.",
    metaTitle: "Boating Safety 101: Essential Tips for Every Boater",
    metaDescription: "Essential boating safety tips for beginners and experienced boaters. Learn about life jackets, weather awareness, navigation rules, and emergency procedures.",
    content: `
<p>Whether you're a first-time boater or have years of experience on the water, reviewing boating safety fundamentals saves lives. The U.S. Coast Guard reports over 4,000 boating accidents annually — and most are preventable with proper education and preparation.</p>

<h2>Before You Leave the Dock</h2>
<h3>1. File a Float Plan</h3>
<p>Tell someone on shore where you're going, who's on board, and when you expect to return. If something goes wrong, this information helps rescuers find you quickly.</p>

<h3>2. Check the Weather</h3>
<p>Review the marine forecast before every trip. Watch for:</p>
<ul>
  <li>Wind speed and direction</li>
  <li>Wave height predictions</li>
  <li>Thunderstorm warnings</li>
  <li>Small craft advisories</li>
</ul>
<p>If conditions look questionable, postpone your trip. No day on the water is worth risking lives.</p>

<h3>3. Complete a Pre-Departure Checklist</h3>
<ul>
  <li>Enough life jackets (PFDs) for every person on board — and they must be the right size</li>
  <li>Fire extinguisher(s) charged and accessible</li>
  <li>Navigation lights working (if boating near dusk/dawn/night)</li>
  <li>Horn or whistle functioning</li>
  <li>Visual distress signals (flares) current and accessible</li>
  <li>Fuel level checked — follow the "one-third rule" (one-third out, one-third back, one-third reserve)</li>
  <li>Bilge pump working</li>
  <li>Anchor and line in good condition</li>
</ul>

<h2>On the Water</h2>
<h3>4. Always Wear Your Life Jacket</h3>
<p>Life jackets save lives — period. The U.S. Coast Guard reports that <strong>86% of drowning victims in boating accidents were not wearing a life jacket</strong>. Modern inflatable PFDs are comfortable enough to wear all day. Children should always wear a properly fitted life jacket while on board.</p>

<h3>5. Never Boat Under the Influence</h3>
<p>BUI (Boating Under the Influence) is illegal in every state, with a legal limit of 0.08% BAC in most states. Alcohol impairs judgment, balance, and reaction time — all critical skills on the water. Sun, wind, and waves amplify the effects of alcohol.</p>

<h3>6. Know the Navigation Rules</h3>
<p>Understanding right-of-way prevents collisions:</p>
<ul>
  <li><strong>Meeting head-on:</strong> Both boats steer to starboard (right)</li>
  <li><strong>Crossing:</strong> The boat on the right has right-of-way (the "stand-on" vessel)</li>
  <li><strong>Overtaking:</strong> The boat being passed has right-of-way</li>
  <li><strong>Sailboats:</strong> Generally have right-of-way over powerboats</li>
</ul>

<h3>7. Watch Your Speed</h3>
<p>Observe posted speed limits and no-wake zones. Reduce speed in congested areas, near docks, around swimmers, and in poor visibility. Remember that wake damage is your responsibility.</p>

<h2>Emergency Preparedness</h2>
<h3>8. Man Overboard (MOB) Procedure</h3>
<ol>
  <li>Shout "MAN OVERBOARD!" and point at the person in the water</li>
  <li>Throw a flotation device immediately</li>
  <li>Assign someone to keep eyes on the person at all times</li>
  <li>Circle back slowly and approach from downwind</li>
  <li>Kill the engine before bringing anyone alongside the boat</li>
</ol>

<h3>9. Know How to Call for Help</h3>
<p>VHF Channel 16 is the universal distress frequency. Know how to make a Mayday call:</p>
<ul>
  <li>"MAYDAY, MAYDAY, MAYDAY" — life-threatening emergency</li>
  <li>"PAN-PAN, PAN-PAN, PAN-PAN" — urgent but not life-threatening</li>
</ul>
<p>Include your vessel name, location, nature of emergency, and number of people on board.</p>

<h2>Get Educated, Stay Safe</h2>
<p>The best thing you can do for your safety is to <a href="/do-i-need-a-boating-license">complete a boater education course</a>. It's required in most states and covers all of these topics in detail. <a href="/states">Find your state's requirements</a> and get certified today.</p>
`
  },
  {
    title: "PWC & Jet Ski Safety: What Every Rider Needs to Know",
    slug: "pwc-jet-ski-safety-guide",
    excerpt: "Personal watercraft come with unique risks. Learn the safety rules, age requirements, and laws that apply specifically to PWC and jet ski operators.",
    metaTitle: "PWC & Jet Ski Safety Guide: Rules, Age Requirements & Tips",
    metaDescription: "Essential PWC and jet ski safety tips, state age requirements, and legal rules. Learn what every personal watercraft rider needs to know before hitting the water.",
    content: `
<p><strong>Personal watercraft (PWC)</strong> — including brands like Jet Ski, WaveRunner, and Sea-Doo — are some of the most thrilling and popular vessels on the water. They're also involved in a disproportionate number of boating accidents. Understanding PWC-specific safety rules is critical.</p>

<h2>PWC-Specific Boater Education Requirements</h2>
<p>Most states treat PWCs the same as other motorized vessels when it comes to boater education requirements. However, some states have <strong>additional rules</strong> specifically for PWC operators:</p>
<ul>
  <li><strong>Higher age requirements:</strong> Many states set a higher minimum age for PWC operation (often 14 or 16) than for regular motorboats.</li>
  <li><strong>Mandatory education:</strong> Some states that don't require boater education for regular boats DO require it for PWC operators (e.g., <a href="/states/pennsylvania">Pennsylvania</a>).</li>
  <li><strong>Operating hours:</strong> Most states prohibit PWC operation between sunset and sunrise.</li>
</ul>
<p><a href="/states">Check your state's specific PWC requirements here.</a></p>

<h2>Essential PWC Safety Rules</h2>

<h3>1. Always Wear a Life Jacket</h3>
<p>Every PWC operator and passenger must wear a U.S. Coast Guard-approved life jacket at all times. This is the law in every state. Choose a Type III or inflatable PFD rated for PWC use.</p>

<h3>2. Attach the Engine Cut-Off Lanyard</h3>
<p>The engine cut-off lanyard (kill switch) attaches to your wrist or life jacket. If you fall off, it kills the engine immediately, preventing the PWC from circling back and striking you — a leading cause of PWC injuries.</p>

<h3>3. Keep a Safe Distance</h3>
<p>Maintain at least 200 feet from other vessels, docks, swimmers, and shorelines when operating at speed. PWCs are fast and highly maneuverable, but they need distance to stop safely.</p>

<h3>4. No Wake-Jumping or Spray</h3>
<p>Jumping the wake of other boats or intentionally spraying other vessels is dangerous and illegal in most states. It can cause collisions, injuries, and significant property damage.</p>

<h3>5. Watch for Swimmers and Divers</h3>
<p>PWCs sit low in the water, making it hard to see swimmers. Always watch for dive flags, swimming areas, and people in the water. Reduce speed near any area where people might be swimming.</p>

<h3>6. Know Your Throttle</h3>
<p>Unlike traditional boats, most PWCs require throttle to steer. If you release the throttle, <strong>you lose steering control</strong>. This is the opposite of what most people expect. In an emergency, maintain some throttle to steer away from obstacles rather than letting go.</p>

<h2>Common PWC Laws by State</h2>
<ul>
  <li><strong>Operating hours:</strong> Most states: sunrise to sunset only</li>
  <li><strong>Age requirements:</strong> Typically 14–16 years old minimum, varies by state</li>
  <li><strong>Passengers:</strong> Never exceed the manufacturer's capacity rating</li>
  <li><strong>BUI laws:</strong> 0.08% BAC limit applies, same as all boats</li>
  <li><strong>Registration:</strong> PWCs must be registered like any other motorized vessel</li>
</ul>

<h2>PWC Maintenance for Safety</h2>
<ul>
  <li>Check the hull for cracks or damage before every ride</li>
  <li>Ensure the jet intake grate is clear of debris</li>
  <li>Test the steering and throttle response at low speed first</li>
  <li>Verify the engine cut-off lanyard functions properly</li>
  <li>Check fuel level — PWCs burn fuel faster than you might expect</li>
</ul>

<h2>Get Your PWC Certification</h2>
<p>Most states require boater education for PWC operators. The course covers PWC-specific topics in addition to general boating safety. <a href="/states">Find your state's requirements</a> and get certified before you ride.</p>
<p>New to boating entirely? Start with our <a href="/blog/boating-safety-101-essential-tips">Boating Safety 101 guide</a> for the fundamentals.</p>
`
  },
  {
    title: "How to Choose the Right Life Jacket (PFD) for Boating",
    slug: "how-to-choose-right-life-jacket-pfd",
    excerpt: "Life jackets save lives, but only if they fit properly and match your activity. Learn about PFD types, sizing, and when each type is required.",
    metaTitle: "How to Choose the Right Life Jacket (PFD) for Boating",
    metaDescription: "Guide to choosing the right life jacket for boating. Learn about Type I, II, III, and inflatable PFDs, proper sizing, and U.S. Coast Guard requirements.",
    content: `
<p>A life jacket — officially called a <strong>Personal Flotation Device (PFD)</strong> — is the single most important piece of safety equipment on any boat. The U.S. Coast Guard reports that <strong>86% of drowning victims</strong> in recreational boating accidents were not wearing a life jacket. Choosing the right one can save your life.</p>

<h2>Types of Life Jackets</h2>

<h3>Type I: Offshore Life Jackets</h3>
<p>Best for: Open water, rough seas, remote areas where rescue may be slow. These provide the most buoyancy (22+ lbs) and are designed to turn unconscious wearers face-up in the water. Bulky but lifesaving in extreme conditions.</p>

<h3>Type II: Near-Shore Buoyant Vests</h3>
<p>Best for: Calm inland waters where quick rescue is likely. Less bulky than Type I with moderate buoyancy (15.5 lbs). May turn some unconscious wearers face-up. Common on rental boats and commercial vessels.</p>

<h3>Type III: Flotation Aids</h3>
<p>Best for: General recreational boating, water sports, fishing. Most comfortable for all-day wear with the same buoyancy as Type II (15.5 lbs). <strong>Will not turn an unconscious person face-up</strong> — the wearer must position themselves. This is the most popular type for recreational boaters.</p>

<h3>Type V: Special-Use Devices</h3>
<p>Best for: Specific activities like kayaking, windsurfing, or commercial use. Must be worn to count as your PFD. Includes deck suits, hybrid inflatables, and commercial work vests.</p>

<h3>Inflatable PFDs</h3>
<p>Modern inflatable life jackets are comfortable enough to wear all day — they look like a collar or belt pack when not inflated. They inflate automatically when submerged or manually with a pull cord. <strong>Important:</strong> Inflatable PFDs are only approved for persons 16 and older and are not allowed for PWC use in most states.</p>

<h2>Sizing and Fit</h2>
<p>A life jacket only works if it fits properly:</p>
<ul>
  <li><strong>Adults:</strong> Choose based on chest size. The jacket should be snug but allow full arm movement. When you lift your arms, it shouldn't ride up above your chin or ears.</li>
  <li><strong>Children:</strong> NEVER buy a life jacket for a child to "grow into." It must fit now. Check the weight range on the label. For infants and small children, choose a PFD with a crotch strap and head support.</li>
  <li><strong>Test the fit:</strong> Put it on, buckle all straps, and have someone pull up on the shoulder straps. If it slides up significantly, it's too loose.</li>
</ul>

<h2>Legal Requirements</h2>
<ul>
  <li>You must have <strong>one U.S. Coast Guard-approved PFD per person</strong> on board</li>
  <li>Vessels 16 feet and longer must also carry a <strong>Type IV throwable device</strong> (ring buoy or seat cushion)</li>
  <li><strong>Children</strong> (typically under 12 or 13, varies by state) must wear a PFD at all times while underway</li>
  <li>All <strong>PWC operators and passengers</strong> must wear PFDs at all times</li>
  <li>PFDs must be <strong>readily accessible</strong> — not locked in a compartment</li>
</ul>

<h2>Maintenance Tips</h2>
<ul>
  <li>Rinse with fresh water after each use in saltwater</li>
  <li>Dry thoroughly before storing</li>
  <li>Store in a well-ventilated area, never in a sealed plastic bag</li>
  <li>Check for rips, tears, and broken buckles regularly</li>
  <li>Replace CO2 cartridges on inflatables per manufacturer guidelines</li>
  <li>Replace any PFD that shows signs of deterioration</li>
</ul>

<p>For more boating safety essentials, check out our <a href="/blog/boating-safety-101-essential-tips">Boating Safety 101</a> guide. And make sure you're certified — <a href="/states">find your state's boater education requirements</a>.</p>
`
  },
  {
    title: "Boating Under the Influence (BUI): Laws, Penalties & Why It Matters",
    slug: "boating-under-the-influence-bui-laws",
    excerpt: "BUI is illegal in every state and just as dangerous as drunk driving. Learn about BUI laws, penalties, and why alcohol and boating don't mix.",
    metaTitle: "Boating Under the Influence (BUI): Laws & Penalties by State",
    metaDescription: "BUI laws, penalties, and facts every boater should know. Learn why boating under the influence is dangerous, the legal BAC limits, and state-by-state penalties.",
    content: `
<p><strong>Boating Under the Influence (BUI)</strong> is a federal offense and is illegal in every U.S. state. Yet alcohol use remains the leading contributing factor in fatal boating accidents, according to the U.S. Coast Guard. Here's what every boater needs to know.</p>

<h2>The Law</h2>
<p>Operating a vessel while impaired is against the law nationwide:</p>
<ul>
  <li><strong>Federal law:</strong> It is illegal to operate a vessel while under the influence of alcohol or drugs on all U.S. waters.</li>
  <li><strong>BAC limit:</strong> The legal limit is <strong>0.08% BAC</strong> in most states — the same as for driving a car.</li>
  <li><strong>Under 21:</strong> Many states have zero-tolerance or lower BAC limits (0.02%) for boaters under 21.</li>
  <li><strong>Enforcement:</strong> U.S. Coast Guard, state marine patrol, and local law enforcement actively patrol for BUI, especially on holidays and weekends.</li>
</ul>

<h2>Why BUI Is Even More Dangerous Than DUI</h2>
<p>Boating under the influence can be even more dangerous than drunk driving because of environmental "stressors" that amplify impairment on the water:</p>
<ul>
  <li><strong>Sun exposure:</strong> Heat and UV rays accelerate the effects of alcohol and cause fatigue.</li>
  <li><strong>Wind and spray:</strong> Dehydration from wind and water spray intensifies intoxication.</li>
  <li><strong>Boat motion:</strong> The rocking motion of a boat affects balance and inner ear function, compounding alcohol's effects.</li>
  <li><strong>Glare:</strong> Sunlight reflecting off water impairs vision, which alcohol worsens.</li>
  <li><strong>Noise:</strong> Engine noise and wind reduce situational awareness.</li>
</ul>
<p>The Coast Guard estimates that a boater with a 0.10% BAC is <strong>10 times more likely</strong> to die in a boating accident than a sober boater.</p>

<h2>Penalties</h2>
<p>BUI penalties vary by state but typically include:</p>
<ul>
  <li><strong>First offense:</strong> Fines of $500–$2,000+, possible jail time (up to 6 months in some states), boating privileges suspended</li>
  <li><strong>Second offense:</strong> Higher fines, mandatory jail time in many states, longer suspension</li>
  <li><strong>Third offense:</strong> Felony charges in some states, significant jail time, permanent revocation of boating privileges</li>
  <li><strong>Causing injury or death:</strong> Felony charges, prison time, and civil liability</li>
</ul>
<p>A BUI conviction can also affect your driver's license and car insurance rates in many states.</p>

<h2>Safe Alternatives</h2>
<ul>
  <li><strong>Designate a sober operator</strong> — just like a designated driver</li>
  <li><strong>Wait until you're docked</strong> — enjoy beverages at the marina, not underway</li>
  <li><strong>Drink water and eat food</strong> — stay hydrated throughout the day</li>
  <li><strong>Know your limits</strong> — remember that environmental factors make you feel effects faster on the water</li>
</ul>

<p>BUI laws are covered in detail in every <a href="/do-i-need-a-boating-license">boater education course</a>. Getting certified helps you understand the risks and your legal obligations. <a href="/states">Find your state's course requirements</a>.</p>
`
  },
];

export async function seedCoreArticles(database: NodePgDatabase<any>) {
  console.log("Seeding core blog articles...");

  for (const article of coreArticles) {
    // Check if article already exists
    const existing = await database.execute(
      sql`SELECT id FROM articles WHERE slug = ${article.slug}`
    );
    if (existing.rows.length > 0) {
      console.log(`  - Skipping "${article.title}" (already exists)`);
      continue;
    }

    await database.execute(sql`
      INSERT INTO articles (title, slug, excerpt, content, meta_title, meta_description, is_published, published_at, created_at, updated_at)
      VALUES (${article.title}, ${article.slug}, ${article.excerpt}, ${article.content}, ${article.metaTitle}, ${article.metaDescription}, true, NOW(), NOW(), NOW())
    `);
    console.log(`  ✓ ${article.title}`);
  }

  console.log("Core blog articles seeded.");
}
