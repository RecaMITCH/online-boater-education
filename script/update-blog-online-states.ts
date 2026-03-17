/**
 * Update the "10 States Where You Can Complete Boater Education 100% Online" blog article
 * Adds state-by-state tables with agency, age, residency, and law details.
 *
 * Run with: DATABASE_URL=... npx tsx script/update-blog-online-states.ts
 */
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const title = "States Where You Can Complete Boater Education Entirely Online";

const metaTitle = "States Where You Can Complete Boater Education Entirely Online";
const metaDescription =
  "Find out which states let you earn your boater education certificate 100% online — no field day, no classroom, no proctored exam. Covers ages, laws, and how NASBLA reciprocity works.";

const excerpt =
  "A state-by-state breakdown of where you can complete boater education entirely online — including age requirements, who needs it, vessel rules, and how NASBLA reciprocity lets you use your certificate in any state.";

const content = `
<p>The majority of U.S. states allow boaters to complete their boating safety certification entirely online — no classroom time, no field day, and no proctored exam. But the details matter: who is required to get certified, minimum ages, and vessel horsepower thresholds vary widely from state to state.</p>

<p>This guide breaks down <strong>10 popular states</strong> that offer a clear, fully online path to boater education certification. We also include a summary of every other state with online-only options and explain how NASBLA reciprocity lets you use a certificate earned in one state to boat in another.</p>

<h2>How Online Boater Education Works</h2>

<ul>
  <li><strong>NASBLA-approved certificates are widely recognized.</strong> The National Association of State Boating Law Administrators (NASBLA) sets the standard. A certificate earned in one state is recognized in most other states through reciprocity agreements.</li>
  <li><strong>Requirements vary by state.</strong> Some states require all motorized vessel operators to be certified, while others only require it for certain age groups or vessel types. Always check the state agency page before signing up.</li>
  <li><strong>Certificates typically never expire.</strong> Once you earn your boater education certificate, it is valid for life in most states.</li>
  <li><strong>Course fees vary.</strong> Prices typically range from free to around $50, depending on the state and provider.</li>
</ul>

<h2>10 States with Fully Online Boater Education</h2>

<h3>1. <a href="/states/florida">Florida</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Florida Fish and Wildlife Conservation Commission (FWC)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day or classroom required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after January 1, 1988, operating vessels with 10+ hp</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels with 10+ hp</td></tr>
  </tbody>
</table>
<p>Florida — the boating capital of the U.S. — lets you complete your boater education entirely online. The FWC-approved course takes about 4–6 hours and covers Florida-specific waterway rules, navigation, and safety. With more registered boats than any other state, Florida makes certification convenient and accessible. <a href="/states/florida">See Florida course options</a>.</p>

<h3>2. <a href="/states/texas">Texas</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Texas Parks and Wildlife Department (TPWD)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — ages 13 and older</td></tr>
    <tr><td><strong>Minimum Age</strong></td><td>13 years old</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after September 1, 1993</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels and PWCs</td></tr>
  </tbody>
</table>
<p>Texas allows 100% online completion for boaters age 13 and older. The TPWD-approved course covers Texas-specific boating laws, Gulf Coast navigation, and PWC operation. Texas is one of the most popular states for online boater education. <a href="/states/texas">See Texas course options</a>.</p>

<h3>3. <a href="/states/california">California</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>California Division of Boating and Waterways (DBW)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day or classroom required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>ALL motorized vessel operators (as of January 1, 2025)</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>All motorized vessels</td></tr>
  </tbody>
</table>
<p>California now requires ALL motorized vessel operators to carry a California Boater Card. The phase-in is complete as of 2025 — no age exemptions remain. The DBW-approved course is entirely online, and your California Boater Card never expires. <a href="/states/california">See California course options</a>.</p>

<h3>4. <a href="/states/new-york">New York</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>New York State Parks, Recreation and Historic Preservation (NYSPARKS)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day required</td></tr>
    <tr><td><strong>Minimum Age</strong></td><td>10 years old</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>ALL motorized vessel operators (as of January 1, 2025)</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>All motorized vessels</td></tr>
  </tbody>
</table>
<p>New York requires ALL motorized vessel operators to hold a Boating Safety Certificate as of 2025. The NYS Parks-approved course is available entirely online with no in-person requirement. Students as young as 10 can take the course. <a href="/states/new-york">See New York course options</a>.</p>

<h3>5. <a href="/states/michigan">Michigan</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Michigan Department of Natural Resources (MDNR)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day or classroom required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after July 1, 1996</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels; PWC operators born after 12/31/1978 also require certification</td></tr>
  </tbody>
</table>
<p>Michigan, with more coastline than any state except Alaska, offers full online boater education. Required for anyone born on or after July 1, 1996. Michigan also separately requires PWC certification for operators born after December 31, 1978. With 11,000+ inland lakes, getting certified opens up incredible boating opportunities. <a href="/states/michigan">See Michigan course options</a>.</p>

<h3>6. <a href="/states/ohio">Ohio</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Ohio Department of Natural Resources (ODNR)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day or classroom required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after January 1, 1982, operating boats with 10+ hp</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels with 10+ hp</td></tr>
  </tbody>
</table>
<p>Ohio allows complete online certification with no in-person component. Required for anyone born on or after January 1, 1982, operating boats with 10+ hp. Lake Erie and Ohio's many reservoirs offer great boating — and getting certified is straightforward. <a href="/states/ohio">See Ohio course options</a>.</p>

<h3>7. <a href="/states/georgia">Georgia</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Georgia Department of Natural Resources (DNR)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after January 1, 1998</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels</td></tr>
  </tbody>
</table>
<p>Georgia offers fully online boater education through several DNR-approved providers, with no in-person component required. From the Golden Isles to Lake Lanier, Georgia's waters are accessible to anyone who completes the online course. <a href="/states/georgia">See Georgia course options</a>.</p>

<h3>8. <a href="/states/oregon">Oregon</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Oregon State Marine Board (OSMB)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — ages 16 and older</td></tr>
    <tr><td><strong>Minimum Age</strong></td><td>16 years old</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone age 16+ operating boats with 10+ hp</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels with 10+ hp</td></tr>
  </tbody>
</table>
<p>Oregon allows online completion for boaters age 16 and older. Required for operators of boats with 10+ hp. With Crater Lake, the Columbia River, and the Pacific coast, Oregon offers incredible boating diversity — and the certification process is fully online. <a href="/states/oregon">See Oregon course options</a>.</p>

<h3>9. <a href="/states/maryland">Maryland</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>Maryland Department of Natural Resources (DNR)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day or classroom required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after July 1, 1972</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels</td></tr>
  </tbody>
</table>
<p>Maryland — home to the Chesapeake Bay and the sailing capital of Annapolis — offers full online certification. Required for anyone born on or after July 1, 1972. The course covers Maryland-specific navigation rules and Chesapeake Bay safety. <a href="/states/maryland">See Maryland course options</a>.</p>

<h3>10. <a href="/states/north-carolina">North Carolina</a></h3>
<table>
  <tbody>
    <tr><td><strong>Agency</strong></td><td>North Carolina Wildlife Resources Commission (NCWRC)</td></tr>
    <tr><td><strong>Online-Only</strong></td><td>Yes — no field day required</td></tr>
    <tr><td><strong>Who Needs It</strong></td><td>Anyone born on or after January 1, 1988</td></tr>
    <tr><td><strong>Vessel Rule</strong></td><td>Motorized vessels</td></tr>
  </tbody>
</table>
<p>North Carolina allows complete online boater education with no field day. Required for anyone born on or after January 1, 1988. From the Outer Banks to Lake Norman, NC has incredible boating diversity and a straightforward online certification process. <a href="/states/north-carolina">See North Carolina course options</a>.</p>

<h2>More States with Online-Only Boater Education</h2>

<p>Beyond the 10 states above, many additional states offer online-only boater education. Click any state for full details on requirements and approved course options.</p>

<table>
  <thead>
    <tr><th>State</th><th>Who Needs It</th><th>Vessel Rule</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="/states/alabama">Alabama</a></td><td>Operators age 12+ on motorboats with 15+ hp</td><td>15+ hp motorboats</td></tr>
    <tr><td><a href="/states/arkansas">Arkansas</a></td><td>Born on or after January 1, 1986</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/delaware">Delaware</a></td><td>Born on or after January 1, 1978</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/hawaii">Hawaii</a></td><td>Operators of vessels with 10+ hp</td><td>10+ hp motorboats</td></tr>
    <tr><td><a href="/states/illinois">Illinois</a></td><td>Born on or after January 1, 1998, operating 10+ hp</td><td>10+ hp motorboats</td></tr>
    <tr><td><a href="/states/indiana">Indiana</a></td><td>Age 15+ without a driver's license</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/iowa">Iowa</a></td><td>Ages 12-17 operating boats with 10+ hp</td><td>10+ hp motorboats</td></tr>
    <tr><td><a href="/states/kansas">Kansas</a></td><td>Born on or after January 1, 1989</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/kentucky">Kentucky</a></td><td>Operators ages 12-17</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/louisiana">Louisiana</a></td><td>Born after January 1, 1984, operating 10+ hp or PWCs</td><td>10+ hp or PWCs</td></tr>
    <tr><td><a href="/states/maine">Maine</a></td><td>Born on or after January 1, 1999, operating 25+ hp</td><td>25+ hp motorboats</td></tr>
    <tr><td><a href="/states/massachusetts">Massachusetts</a></td><td>Phased: born after 1/1/1989 by 4/1/2026; born before by 4/1/2028</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/minnesota">Minnesota</a></td><td>Born on or after July 1, 2004 (phased through 2028)</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/mississippi">Mississippi</a></td><td>Born on or after June 30, 1980</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/missouri">Missouri</a></td><td>Born after January 1, 1984</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/montana">Montana</a></td><td>Operators ages 13-14 on boats with 10+ hp</td><td>10+ hp motorboats</td></tr>
    <tr><td><a href="/states/nebraska">Nebraska</a></td><td>Born after December 31, 1985</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/nevada">Nevada</a></td><td>Born on or after January 1, 1983, operating 15+ hp</td><td>15+ hp motorboats</td></tr>
    <tr><td><a href="/states/new-mexico">New Mexico</a></td><td>Born on or after January 1, 1989</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/north-dakota">North Dakota</a></td><td>Operators ages 12-15 on boats with 10+ hp</td><td>10+ hp motorboats</td></tr>
    <tr><td><a href="/states/oklahoma">Oklahoma</a></td><td>Operators ages 12-15 on boats with 10+ hp, sailboats 16+ ft, or PWCs</td><td>10+ hp, sailboats 16+ ft, PWCs</td></tr>
    <tr><td><a href="/states/pennsylvania">Pennsylvania</a></td><td>Born on or after January 1, 1982, operating 25+ hp; ALL PWC operators</td><td>25+ hp or any PWC</td></tr>
    <tr><td><a href="/states/south-carolina">South Carolina</a></td><td>Born after July 1, 2007</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/tennessee">Tennessee</a></td><td>Born after January 1, 1989</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/utah">Utah</a></td><td>PWC operators ages 12-17</td><td>PWCs only</td></tr>
    <tr><td><a href="/states/vermont">Vermont</a></td><td>Born on or after January 1, 1974, operating motorized vessels</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/virginia">Virginia</a></td><td>PWC operators age 14+ and all motorboat operators with 10+ hp</td><td>10+ hp or PWCs</td></tr>
    <tr><td><a href="/states/washington">Washington</a></td><td>Operators of motorboats with 15+ hp (unless born before 1/1/1955)</td><td>15+ hp motorboats</td></tr>
    <tr><td><a href="/states/west-virginia">West Virginia</a></td><td>Born after December 31, 1986</td><td>Motorized vessels</td></tr>
    <tr><td><a href="/states/wisconsin">Wisconsin</a></td><td>Age 12+ born on or after January 1, 1989</td><td>Motorized vessels</td></tr>
  </tbody>
</table>

<h2>States That Don't Require Boater Education</h2>

<p>A handful of states have no mandatory boating safety education requirement, though voluntary courses are available and recommended:</p>

<ul>
  <li><a href="/states/alaska">Alaska</a> — No mandatory requirement</li>
  <li><a href="/states/arizona">Arizona</a> — No mandatory requirement</li>
  <li><a href="/states/idaho">Idaho</a> — No statewide mandatory requirement</li>
  <li><a href="/states/south-dakota">South Dakota</a> — No mandatory requirement</li>
  <li><a href="/states/wyoming">Wyoming</a> — No mandatory requirement</li>
</ul>

<p>Even if your state doesn't require it, completing a boater education course is strongly recommended. It makes you a safer boater and your NASBLA-approved certificate will be recognized if you boat in other states that do require certification.</p>

<h2>States That Require an In-Person Component</h2>

<p>A small number of states require an in-person classroom course, proctored exam, or field day component in addition to (or instead of) online coursework:</p>

<ul>
  <li><a href="/states/colorado">Colorado</a> — Ages 14-15 require an in-person proctored exam (16+ can complete online)</li>
  <li><a href="/states/connecticut">Connecticut</a> — Requires an 8-hour in-person classroom course; online-only is not accepted</li>
  <li><a href="/states/new-hampshire">New Hampshire</a> — Requires an 8-hour in-person proctored classroom course</li>
  <li><a href="/states/new-jersey">New Jersey</a> — Requires an in-person proctored exam after the online course</li>
  <li><a href="/states/rhode-island">Rhode Island</a> — Requires an 8-hour in-person course with proctored written exam</li>
</ul>

<p>If you live in one of these states and would prefer to complete everything online, you have an option: <strong>earn your certificate from a state that allows 100% online completion</strong>. As long as the course is NASBLA-approved, your certificate will be accepted in your home state through reciprocity.</p>

<h2>How NASBLA Reciprocity Works</h2>

<p>The National Association of State Boating Law Administrators (NASBLA) maintains reciprocity agreements across states:</p>

<ol>
  <li><strong>Complete a NASBLA-approved course</strong> in any state — online or in-person.</li>
  <li><strong>Receive your certificate</strong> from that state's boating agency.</li>
  <li><strong>Use it in other states.</strong> When you're boating in another state, your NASBLA-approved certificate satisfies the boater education requirement in most cases.</li>
</ol>

<p>This means a Florida certificate is recognized in Texas. A California Boater Card is recognized in New York. The key requirement is that the course must be <strong>NASBLA-approved</strong> — which all courses linked from our <a href="/states">state pages</a> are.</p>

<h2>How to Choose the Right Course</h2>

<p>When selecting your boater education course, consider:</p>

<ul>
  <li><strong>Start with your home state.</strong> <a href="/states">Find your state</a> to see the specific requirements and approved course providers.</li>
  <li><strong>Check if you even need it.</strong> Use our <a href="/quiz">Do I Need a Boating License?</a> quiz to find out based on your state and age.</li>
  <li><strong>Look for NASBLA approval.</strong> This ensures your certificate is recognized through reciprocity if you boat in other states.</li>
  <li><strong>Compare providers and prices.</strong> Fees typically range from free to $50 depending on the state and provider.</li>
</ul>

<p>Ready to get started? <a href="/states">Find your state</a> to see the specific requirements and approved course options, or take the <a href="/quiz">quick quiz</a> to find out what you need.</p>
`.trim();

async function main() {
  try {
    const result = await pool.query(
      `UPDATE articles SET
        title = $1,
        excerpt = $2,
        content = $3,
        meta_title = $4,
        meta_description = $5,
        updated_at = NOW()
      WHERE slug = '10-states-complete-boater-education-online'
      RETURNING title`,
      [title, excerpt, content, metaTitle, metaDescription]
    );

    if (result.rowCount === 0) {
      console.error("Article not found!");
      process.exit(1);
    }

    console.log(`✅ Updated: ${result.rows[0].title}`);
    console.log(`Content length: ${content.length} chars`);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
