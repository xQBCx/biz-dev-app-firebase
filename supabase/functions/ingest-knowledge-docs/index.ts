import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const dealRoomId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

    // ── 1. Knowledge Base (services, audiences, platform, outreach templates) ──
    const knowledgeBaseContent = `# The View Pro & Seenic – Master Knowledge Base

## Company Overview
The View Pro (theviewpro.com) is a real estate visualization and marketing company that helps property owners, developers, and communities bring spaces to life — before they are built.
Seenic.io is the interactive visualization platform powering these experiences, offering immersive 3D tours, real photography tours, and rendered walkthroughs designed to close deals faster.

## Mission
To help people see, feel, and experience properties from anywhere in the world — accelerating sales, leasing, and investment decisions while preserving an authentic visual archive of the built environment.

## Core Services

### Pre-Construction Visualization
- Still Renderings – Photorealistic marketing images for ads, brochures, and websites.
- Rendered Virtual Tours (VR/3D) – Fully immersive tours that allow pre-leasing or pre-sales before completion.
- 2D/3D Floor Plans & Site Maps – Visual layouts that help buyers understand property flow.
- 3D Animations & Flythroughs – Cinematic motion videos for presentations or investor decks.
- Showcase Videos – Story-driven marketing videos for web and social platforms.

### Post-Construction Content
- Real Photography – HDR-edited professional photos and panoramas.
- Photography Virtual Tours – Interactive web-based tours hosted on The View's Tour Player.
- Virtual Staging – Digitally furnish and style empty spaces.
- Drone Filming – Aerial photography and 360° motion shots.
- Lifestyle & Social Media Videos – Humanize the property for online engagement.

### Hosting & Analytics
- Annual hosting tiers ($350–$1,100/year).
- Analytics dashboard, Google Business integration, MLS/ILS compatibility.
- Guided tour and custom control interface.

## Target Audiences & Use Cases
| Audience | Value Proposition |
|---|---|
| Hotels / Hospitality | Guests can preview amenities & rooms before booking. Increases confidence and conversions. |
| Multifamily Developers | Pre-lease 20–30% of units before completion through virtual tours. |
| Realtors / Single-Family Builders | Enhance listings with virtual staging and 3D walkthroughs. |
| Student Housing | Showcase units remotely for parents and students. |
| Government / Civic Projects | Preserve public spaces digitally and enhance community engagement. |
| Investors / Asset Managers | Visualize portfolio assets for due diligence and presentations. |

## Seenic Platform Overview

### Seenic 3D Explorer
Immersive interactive models combining aerial views, unit selection, amenity highlights, and neighborhood maps. Integrates with Engrain and Matterport.

### Seenic Tours
Professional, guided virtual tours integrating real photos or renderings, hosted online, and brand-customized.

### Interactive 3D Floor Plans
Visual, clickable layouts showing unit availability, pricing, and details — ideal for multifloor buildings or leasing kiosks.

## Agent Scripts & Outreach Templates

### Email (Hotel Prospect)
Subject: Guests Can Tour Your Property Before They Book
Hi [Name], Imagine your future guests walking through your rooms and amenities online before they arrive. The View Pro and Seenic create 3D tours and renderings that help hotels like yours stand out and book faster. Would you like to see an example from a similar property?

### Phone (Multifamily Developer)
Intro: "Hi, this is [Name] with The View Pro. We help developers lease faster by creating immersive tours and renderings."
Pain Point: "Prospects can't visualize the property until it's built — that delays pre-leasing."
Solution: "Our virtual tours let them explore online and sign earlier."
Close: "Would you like me to send you a link to a similar community we completed nearby?"

### Government / Civic
"We've helped cities and developers preserve important public projects with high-quality visual archives and community-ready 3D models. Would you like to see an example?"

## Property Type Reference
| Category | Description | Typical Clients |
|---|---|---|
| Hotel / Hospitality | Hotels, resorts, extended stays | Wyndham, Hilton, Marriott |
| Multifamily / Apartments | Residential complexes, towers, lofts | Greystar, RAM, ZRS |
| Student Housing | Near universities or campuses | Gilbane, Cardinal Group |
| Senior Living / Assisted | Communities for older adults | SRG, Sunrise |
| Government / Civic | City halls, libraries, public works | Municipal clients |
| Office / Corporate | Commercial offices | Grover Corlew |
| Retail / Shopping | Plazas, mixed retail | Various developers |
| Industrial / Logistics | Warehouses, distribution | Industrial developers |
| Healthcare / Medical | Hospitals, clinics | Health systems |
| Education | Schools, universities | Academic institutions |
| Mixed-Use Development | Blend of retail + residential | Urban infill developers |

## Common Service Tags
Virtual Staging | Photography | Video | Drone / Aerial | Rendered Tour / VR Tour | Animation | Floor Plans / Site Maps | Virtual Tour (Photography) | Lifestyle Video | Social Media Content

## Workflow & Deliverables
Typical Timeline:
1. Material Collection: 1 week
2. Draft 1: 2–4 weeks depending on scope
3. Edits: 2 days–2 weeks depending on feedback
4. Draft 2: ~1 week
5. Final Delivery: 2–5 days post-approval

Core Team: Vanessa Swendby (Account Manager), Rachel Reams (Project Manager), Sydney Heck (Support PM / QA)`;

    // ── 2. Pricing (internal only) ──
    const pricingContent = `# The View Pro – 2025 Pricing Catalog

| Service | Price Range | Notes |
|---|---|---|
| 2D Floor Plans | $70–$90 per unit | Volume-based |
| 3D Floor Plans | $140–$160 per unit | Volume-based |
| Site Maps | $550–$750 | Based on complexity |
| Still Renderings | $900–$2,300 | Depends on type (model, interior, exterior) |
| Rendered Virtual Tours | $4,400–$8,500 | Includes 1st-year hosting |
| Photography Tours | $1,950–$3,750 | Includes 1st-year hosting |
| Add-ons (Drone, Sunset, Animation) | $500–$2,000 | Per add-on |
| Annual Hosting | $350–$1,100/year | Tiered by features |

Note: These are catalog ranges. Actual pricing depends on scope, volume, and project complexity. Use these for ballpark estimates only.`;

    // ── 3. Guidelines ──
    const guidelinesContent = `# AI Agent Guidelines for The View Pro Outreach

When contacting prospects:
- Use project examples from the same property type and state.
- Reference relevant client names ("We recently worked with Gilbane on a student community in Pomona").
- Offer to send visual samples that match their asset type.
- Be conversational — not salesy.

When emailing:
- Keep under 120 words.
- Lead with their specific news or signal (acquisition, new development, expansion).
- Connect it to a real View Pro project example from a similar market.
- Close with a soft CTA: offer to share a sample, not push a meeting.

When selecting project examples:
- Prioritize same state first, then same property type.
- If no exact match, use a nearby state or similar property type.
- Always mention the client name and city for credibility.
- Never fabricate project examples — only reference real projects from the database.`;

    // ── 4. Project Locations (structured JSONB) ──
    const projectLocations = [
      { property_name: "462 Broadway", client_name: "Berman Group", product_mix: "Virtual Staging", city: "New York", state: "NY" },
      { property_name: "The Current Pomona", client_name: "Gilbane", product_mix: "Virtual Staging", city: "Pomona", state: "CA" },
      { property_name: "Kokua Hale", client_name: "Honolulu", product_mix: "Photography/Video/VS Product", city: "Honolulu", state: "HI" },
      { property_name: "Mayla Pompao", client_name: "Grover Corlew", product_mix: "Photography/Video/VS Product", city: "Pompano Beach", state: "FL" },
      { property_name: "805 Riverfront Shoot", client_name: "The View Pro", product_mix: "Photography/Video/VS Product", city: "West Sacramento", state: "CA" },
      { property_name: "Oregon", client_name: "Malick Infill Development", product_mix: "Photography/Video/VS Product", city: "San Diego", state: "CA" },
      { property_name: "Cryene at Meadowlands", client_name: "SRG Residential", product_mix: "Photography/Video/VS Product", city: "Lincoln", state: "CA" },
      { property_name: "Peak of Boone", client_name: "Cardinal Group", product_mix: "Photography/Video/VS Product", city: "Boone", state: "NC" },
      { property_name: "19th & Graf St Apartments", client_name: "RAM Partners", product_mix: "Photography/Video/VS Product", city: "Bozeman", state: "MT" },
      { property_name: "NinetyNine Photography Tour", client_name: "RKW Residential", product_mix: "Photography/Video/VS Product", city: "Raleigh", state: "NC" },
      { property_name: "REV Northgate", client_name: "Cardinal Group", product_mix: "Photography/Video/VS Product", city: "College Station", state: "TX" },
      { property_name: "Aventon Lana", client_name: "Aventon Companies", product_mix: "Photography/Video/VS Product", city: "Clearwater", state: "FL" },
      { property_name: "Aventon Gem Lake", client_name: "Aventon Companies", product_mix: "Photography/Video/VS Product", city: "Maitland", state: "FL" },
      { property_name: "Cyrene at Estrella", client_name: "Curve Development", product_mix: "Photography/Video/VS Product", city: "Goodyear", state: "AZ" },
      { property_name: "Capitol Rose", client_name: "Perseus Realty", product_mix: "Photography/Video/VS Product", city: "Washington", state: "DC" },
      { property_name: "Nolan Mains", client_name: "Saturday Properties", product_mix: "Photography/Video/VS Product", city: "St Paul", state: "MN" },
      { property_name: "Terminus Virtual Staging", client_name: "Cousins Properties", product_mix: "Photography/Video/VS Product", city: "Atlanta", state: "GA" },
      { property_name: "Marshside Virtual Staging", client_name: "Holder Properties", product_mix: "Virtual Staging", city: "Charleston", state: "SC" },
      { property_name: "Monarch Tyson's Animation", client_name: "RCTM LLC", product_mix: "Still Rendering, 3D Virtual Tour, 3D Animation", city: "McLean", state: "VA" },
      { property_name: "Bayswater", client_name: "SRG Residential", product_mix: "Still Rendering, 3D Virtual Tour", city: "Burlingame", state: "CA" },
      { property_name: "2000 Biscayne", client_name: "Ground Up Ideas", product_mix: "3D Virtual Tour, Still Rendering", city: "Miami", state: "FL" },
      { property_name: "North Tower", client_name: "Bainbridge Companies", product_mix: "3D Virtual Tour", city: "Clearwater", state: "FL" },
      { property_name: "3 Root", client_name: "Garden Communities", product_mix: "Still Rendering", city: "San Diego", state: "CA" },
      { property_name: "Birkdale Tech Rendering", client_name: "North American Properties", product_mix: "Still Rendering", city: "Huntersville", state: "NC" },
      { property_name: "15 & S", client_name: "Perseus Realty", product_mix: "Still Rendering, 3D Virtual Tour, 3D Animation", city: "Washington", state: "DC" },
      { property_name: "281 Willow", client_name: "Avenue5 Residential", product_mix: "Still Rendering", city: "Fort Collins", state: "CO" },
      { property_name: "Belmar Retail", client_name: "Bridge 33 Capital", product_mix: "Still Rendering, 3D Virtual Tour", city: "Lakewood", state: "CO" },
      { property_name: "Flats on A", client_name: "Pauls Corporation", product_mix: "3D Virtual Tour", city: "Aurora", state: "CO" },
      { property_name: "Chroma", client_name: "Fairfield", product_mix: "3D Virtual Tour", city: "Woodland Hills", state: "CA" },
      { property_name: "Marina Square", client_name: "Soundwest Group", product_mix: "Still Rendering", city: "Bremerton", state: "WA" },
      { property_name: "East Hanover", client_name: "Kushner Companies", product_mix: "Still Rendering", city: "East Hanover", state: "NJ" },
      { property_name: "Icon Fairlawn", client_name: "Kushner Companies", product_mix: "Still Rendering", city: "Bergen County", state: "NJ" },
      { property_name: "Broadway Animation", client_name: "Soundwest Group", product_mix: "3D Animation", city: "San Antonio", state: "TX" },
      { property_name: "Belhaven Apartments", client_name: "Fairfield", product_mix: "3D Virtual Tour", city: "Alexandria", state: "VA" },
      { property_name: "Mirror Lake", client_name: "HP Capital Group", product_mix: "Still Rendering", city: "St Petersburg", state: "FL" },
      { property_name: "Sully", client_name: "Toll Brothers", product_mix: "3D Animation, Still Rendering", city: "Houston", state: "TX" },
      { property_name: "Casitas Eagle's Nest", client_name: "Engel & Volker", product_mix: "Still Rendering", city: "Wimberley", state: "TX" },
      { property_name: "Wakefield Station", client_name: "Brown Investments", product_mix: "Still Rendering, 3D Animation, 3D Top View Floor Plan", city: "Raleigh", state: "NC" },
      { property_name: "Peregrine", client_name: "Toll Brothers", product_mix: "Still Rendering, 3D Animation, 3D Top View Floor Plan", city: "Irving", state: "TX" },
      { property_name: "Park on Napoli", client_name: "RPM Living", product_mix: "Still Rendering", city: "Houston", state: "TX" },
      { property_name: "Aventon Opal", client_name: "Aventon Companies", product_mix: "3D Virtual Tour, 3D Animation, Still Rendering", city: "Orlando", state: "FL" },
      { property_name: "Lapis", client_name: "Toll Brothers", product_mix: "Still Rendering, 3D Animation", city: "Miami", state: "FL" },
      { property_name: "19 & Graf St Apartments", client_name: "RAM Partners", product_mix: "3D Animation, 2D Product, 3D Top View Floor Plan, 3D Virtual Tour", city: "Bozeman", state: "MT" },
      { property_name: "Aventon Buford", client_name: "Aventon Companies", product_mix: "Still Rendering", city: "Lawrenceville", state: "GA" },
      { property_name: "Aventon Kit Creek", client_name: "Aventon Companies", product_mix: "3D Virtual Tour, Still Rendering", city: "Cary", state: "NC" },
      { property_name: "Henri", client_name: "Toll Brothers", product_mix: "Still Rendering, 3D Animation, 3D Top View Floor Plan, 2D Product", city: "Phoenix", state: "AZ" },
      { property_name: "Cascada CMV", client_name: "Garden NJ Communities", product_mix: "Still Rendering", city: "San Diego", state: "CA" },
      { property_name: "Cape Cottages", client_name: "RKW Residential", product_mix: "3D Virtual Tour, Still Rendering", city: "Leland", state: "NC" },
      { property_name: "Hudson East", client_name: "Cascadia Development Partners", product_mix: "Still Rendering", city: "Camas", state: "WA" },
      { property_name: "4001 S Willow", client_name: "Nitze-Stagen", product_mix: "Still Rendering", city: "Seattle", state: "WA" },
      { property_name: "SL4 Deep Ellum", client_name: "ZRS Management", product_mix: "Still Rendering, 3D Animation", city: "Dallas", state: "TX" },
      { property_name: "Alta Buckhead", client_name: "Wood Partners", product_mix: "3D Virtual Tour, Still Rendering", city: "Atlanta", state: "GA" },
      { property_name: "CMK Companies", client_name: "CMK Companies", product_mix: "3D Virtual Tour, 3D Top View Floor Plan", city: "Chicago", state: "IL" },
      { property_name: "Whitlow", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Lewisville", state: "TX" },
      { property_name: "Echelon City", client_name: "ZRS Management", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation", city: "St. Petersburg", state: "FL" },
      { property_name: "Lyle", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Dallas", state: "TX" },
      { property_name: "East Bend Apt", client_name: "Fairfield", product_mix: "3D Virtual Tour", city: "Houston", state: "TX" },
      { property_name: "Lumara", client_name: "Toll Brothers", product_mix: "2D Product, 3D Top View Floor Plan", city: "Phoenix", state: "AZ" },
      { property_name: "The Metropolitan", client_name: "Garden NJ Communities", product_mix: "Still Rendering", city: "Springfield", state: "NJ" },
      { property_name: "1900 Parmer", client_name: "Fairfield", product_mix: "3D Virtual Tour", city: "Austin", state: "TX" },
      { property_name: "Buffalo Grove", client_name: "Urban Street Group", product_mix: "Still Rendering", city: "Buffalo Grove", state: "IL" },
      { property_name: "Preserve", client_name: "Spy Rock Real Estate Group", product_mix: "Still Rendering", city: "Richmond", state: "VA" },
      { property_name: "The Vickery", client_name: "Trademark Property", product_mix: "Still Rendering", city: "Fort Worth", state: "TX" },
      { property_name: "Cottage at Mary's Creek", client_name: "ONM Living", product_mix: "Still Rendering", city: "Fort Worth", state: "TX" },
      { property_name: "Northern Parc", client_name: "Naiyu Design", product_mix: "Still Rendering", city: "Flushing", state: "NY" },
      { property_name: "Wilmington Aerial Tour", client_name: "Bush Watson", product_mix: "3D Virtual Tour, 3D Animation", city: "Wilmington", state: "NC" },
      { property_name: "Flats at Laurel", client_name: "Shelton McNally", product_mix: "Still Rendering, 3D Top View Floor Plan, 3D Virtual Tour, 3D Animation", city: "Nashville", state: "TN" },
      { property_name: "Mirra", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Frisco", state: "TX" },
      { property_name: "Kinetic TBAL", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Atlanta", state: "GA" },
      { property_name: "Jax South", client_name: "Aventon Companies", product_mix: "3D Virtual Tour, 3D Animation, Still Rendering", city: "Jacksonville", state: "FL" },
      { property_name: "Aventon Annapolis", client_name: "Aventon Companies", product_mix: "3D Virtual Tour, 3D Animation", city: "Annapolis", state: "MD" },
      { property_name: "Wellston Place", client_name: "Alter Development", product_mix: "3D Virtual Tour", city: "Louisville", state: "KY" },
      { property_name: "Corsair", client_name: "Wolff Co.", product_mix: "Still Rendering", city: "Grand Prairie", state: "TX" },
      { property_name: "McDowell Point", client_name: "TWG", product_mix: "3D Virtual Tour, 3D Top View Floor Plan", city: "Naperville", state: "IL" },
      { property_name: "Knightdale Apartments", client_name: "Brown Investments", product_mix: "Still Rendering, 3D Animation, 3D Top View Floor Plan", city: "Knightdale", state: "NC" },
      { property_name: "The Bergen", client_name: "Street Lights Residential", product_mix: "Still Rendering, 3D Animation", city: "Phoenix", state: "AZ" },
      { property_name: "Aventon Bees Ferry", client_name: "Aventon Companies", product_mix: "Still Rendering", city: "Charlotte", state: "NC" },
      { property_name: "The 87", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "South Bend", state: "IN" },
      { property_name: "Streams at Battery Park", client_name: "Brown Investments", product_mix: "Still Rendering, 3D Top View Floor Plan, 3D Animation", city: "Anderson", state: "SC" },
      { property_name: "Alpine Flats", client_name: "Richmark Companies", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, 3D Animation", city: "Greeley", state: "CO" },
      { property_name: "Maza", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Scottsdale", state: "AZ" },
      { property_name: "6144 Germantown", client_name: "Hightop Development", product_mix: "3D Virtual Tour, Still Rendering", city: "Philadelphia", state: "PA" },
      { property_name: "The Pace", client_name: "Landmark Properties", product_mix: "3D Virtual Tour, 3D Top View Floor Plan, 2D Product, 3D Animation, Interactive 3D Floor Plan", city: "Charlotte", state: "NC" },
      { property_name: "4th and Green Apartments", client_name: "Brown Investments", product_mix: "Still Rendering, 3D Animation, 3D Top View Floor Plan", city: "Winston-Salem", state: "NC" },
      { property_name: "Altitude", client_name: "Fairfield", product_mix: "3D Virtual Tour", city: "San Francisco", state: "CA" },
      { property_name: "Atlanta Project", client_name: "Apex Visualization", product_mix: "Still Rendering, 3D Animation", city: "Atlanta", state: "GA" },
      { property_name: "Navona", client_name: "Toll Brothers", product_mix: "Still Rendering, 3D Animation", city: "Mesa", state: "AZ" },
      { property_name: "720 Thompson", client_name: "Hightop Development", product_mix: "3D Virtual Tour, Still Rendering", city: "Philadelphia", state: "PA" },
      { property_name: "Kinetic Phase II", client_name: "Toll Brothers", product_mix: "3D Animation, Still Rendering", city: "Atlanta", state: "GA" },
      { property_name: "Mikasa", client_name: "Aventon Companies", product_mix: "Still Rendering", city: "Charleston", state: "SC" },
      { property_name: "1701 Federal", client_name: "Hightop Development", product_mix: "3D Virtual Tour, Still Rendering", city: "Philadelphia", state: "PA" },
      { property_name: "Luxury Beach Home", client_name: "Twin Companies", product_mix: "3D Virtual Tour, 3D Animation", city: "Santa Rosa Beach", state: "FL" },
      { property_name: "Luca", client_name: "Fairfield", product_mix: "3D Virtual Tour", city: "Austin", state: "TX" },
      { property_name: "Graphite", client_name: "HILLS Properties", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation, 3D Top View Floor Plan", city: "Cincinnati", state: "OH" },
      { property_name: "Hamilton", client_name: "Hankin Group", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, 2D Product", city: "Eagleview", state: "PA" },
      { property_name: "Aperture", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Orlando", state: "FL" },
      { property_name: "Huck", client_name: "Yellow Tree", product_mix: "Still Rendering, 3D Top View Floor Plan", city: "Minneapolis", state: "MN" },
      { property_name: "Legacy Place", client_name: "Garden NJ Communities", product_mix: "Still Rendering, 3D Animation", city: "East Brunswick", state: "NJ" },
      { property_name: "Bexley", client_name: "Spectrum Companies", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, 2D Product", city: "Land O' Lakes", state: "FL" },
      { property_name: "The Vickery Phase 2", client_name: "Trademark Property", product_mix: "Still Rendering", city: "Fort Worth", state: "TX" },
      { property_name: "Angeline", client_name: "Toll Brothers", product_mix: "Still Rendering, 3D Animation", city: "Philadelphia", state: "PA" },
      { property_name: "Station Two22", client_name: "RKW Residential", product_mix: "3D Virtual Tour, Still Rendering", city: "Mooresville", state: "NC" },
      { property_name: "Amano", client_name: "Wolff Co.", product_mix: "Still Rendering", city: "Murrieta", state: "CA" },
      { property_name: "The Reserve at West T-Bone", client_name: "Richmark Companies", product_mix: "Still Rendering", city: "Greeley", state: "CO" },
      { property_name: "Juliette", client_name: "Yellow Tree", product_mix: "Still Rendering, 3D Top View Floor Plan", city: "St. Paul", state: "MN" },
      { property_name: "Devon", client_name: "Toll Brothers", product_mix: "Still Rendering", city: "Washington", state: "DC" },
      { property_name: "Avery Dania East", client_name: "Accesso Partners", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation, 3D Top View Floor Plan, 2D Product", city: "Dania Beach", state: "FL" },
      { property_name: "Multi Communities", client_name: "JTG Holdings", product_mix: "Still Rendering", city: "Plano", state: "TX" },
      { property_name: "Springdale Park", client_name: "SteelHead Management", product_mix: "Still Rendering, 3D Top View Floor Plan, 2D Product", city: "Richmond", state: "VA" },
      { property_name: "Aero", client_name: "RPM Living", product_mix: "Still Rendering", city: "Austin", state: "TX" },
      { property_name: "The Aurilla", client_name: "Trilogy Residential Management", product_mix: "Still Rendering", city: "Cottage Grove", state: "MN" },
      { property_name: "Townhomes", client_name: "Gilbert Group Real Estate", product_mix: "3D Virtual Tour, Still Rendering", city: "Westerville", state: "OH" },
      { property_name: "Huntsville", client_name: "Ridgehouse Companies", product_mix: "3D Virtual Tour, Still Rendering", city: "Huntsville", state: "AL" },
      { property_name: "400 Anaheim", client_name: "Hilco Development Services", product_mix: "Still Rendering, 3D Animation", city: "Long Beach", state: "CA" },
      { property_name: "The Mustang", client_name: "American Residential Group", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation, Web & Social Product", city: "Irving", state: "TX" },
      { property_name: "7208", client_name: "TierView Development", product_mix: "Still Rendering", city: "Philadelphia", state: "PA" },
      { property_name: "The Douglas", client_name: "Urban Street Group", product_mix: "Still Rendering", city: "Goodyear", state: "AZ" },
      { property_name: "The 87 Phase II", client_name: "Toll Brothers", product_mix: "Still Rendering, 3D Animation", city: "South Bend", state: "IN" },
      { property_name: "YP Kissimmee", client_name: "Hedrick Brothers Development", product_mix: "Still Rendering", city: "Kissimmee", state: "FL" },
      { property_name: "The Junction", client_name: "Richmark Companies", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation, 2D Product, 3D Top View Floor Plan", city: "Grand Junction", state: "CO" },
      { property_name: "Seven Pines", client_name: "Spectrum Companies", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, 2D Product", city: "Jacksonville", state: "FL" },
      { property_name: "Aventon Cary Kit Creek", client_name: "Aventon Companies", product_mix: "3D Virtual Tour, 3D Animation", city: "Cary", state: "NC" },
      { property_name: "Aventon Meadow Pointe", client_name: "Aventon Companies", product_mix: "3D Animation, 3D Virtual Tour, Still Rendering", city: "Wesley Chapel", state: "FL" },
      { property_name: "Aventon Buford Exchange", client_name: "Aventon Companies", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, 3D Animation", city: "Lawrenceville", state: "GA" },
      { property_name: "The Carlyle", client_name: "TWG", product_mix: "Still Rendering, 3D Top View Floor Plan", city: "Westfield", state: "IN" },
      { property_name: "Hermantown", client_name: "Oppidan Investment", product_mix: "3D Animation, Still Rendering, 3D Virtual Tour, Web & Social Product", city: "Hermantown", state: "MN" },
      { property_name: "Argent Cottages", client_name: "RKW Residential", product_mix: "3D Virtual Tour, Still Rendering", city: "Hardeeville", state: "SC" },
      { property_name: "Foundryline", client_name: "McWhinney", product_mix: "Still Rendering", city: "Denver", state: "CO" },
      { property_name: "LVB", client_name: "Wolff Co.", product_mix: "Still Rendering", city: "Las Vegas", state: "NV" },
      { property_name: "Aventon Belle Isle", client_name: "Aventon Companies", product_mix: "Still Rendering", city: "Orlando", state: "FL" },
      { property_name: "Sante", client_name: "Wolff Co.", product_mix: "Still Rendering", city: "Henderson", state: "NV" },
      { property_name: "The Landing at Coventry", client_name: "Brown Investments", product_mix: "3D Animation, Still Rendering, 3D Top View Floor Plan", city: "Myrtle Beach", state: "SC" },
      { property_name: "Bevel Rendered Tour", client_name: "Fairfield", product_mix: "3D Virtual Tour, Web & Social Product, Still Rendering", city: "San Diego", state: "CA" },
      { property_name: "River Junction", client_name: "Blackburn Group", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, Web & Social Product", city: "Liberty Hill", state: "TX" },
      { property_name: "Twill Bailey Creek", client_name: "Tulsa Property Group", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation, 3D Top View Floor Plan", city: "Owasso", state: "OK" },
      { property_name: "Village Flats Townhomes", client_name: "Tulsa Property Group", product_mix: "3D Virtual Tour, 3D Top View Floor Plan", city: "Tulsa", state: "OK" },
      { property_name: "200 Main", client_name: "LMG", product_mix: "Still Rendering, 3D Virtual Tour", city: "Kannapolis", state: "NC" },
      { property_name: "342 Girard", client_name: "Hightop Development", product_mix: "3D Virtual Tour, Still Rendering", city: "Philadelphia", state: "PA" },
      { property_name: "Vida Floor Plans", client_name: "Cardinal Group", product_mix: "Still Rendering", city: "Aurora", state: "CO" },
      { property_name: "Kokua Hale", client_name: "The Michael's Organization", product_mix: "3D Virtual Tour", city: "Honolulu", state: "HI" },
      { property_name: "Shelby Ranch", client_name: "RPM Living", product_mix: "3D Virtual Tour, Still Rendering", city: "Austin", state: "TX" },
      { property_name: "Bishop Momo", client_name: "RPM Living", product_mix: "3D Virtual Tour", city: "Austin", state: "TX" },
      { property_name: "Signature Apartments", client_name: "Homestead Companies", product_mix: "3D Animation, 3D Top View Floor Plan, Still Rendering, Web & Social Product", city: "Lexington", state: "KY" },
      { property_name: "The Braydon", client_name: "Fairfield", product_mix: "3D Animation, 3D Virtual Tour", city: "Napa", state: "CA" },
      { property_name: "Wheelhouse", client_name: "J.C. Hart", product_mix: "Still Rendering", city: "Westfield", state: "IN" },
      { property_name: "Avery Place", client_name: "Collett Capital", product_mix: "3D Virtual Tour", city: "Charlotte", state: "NC" },
      { property_name: "Gladwen", client_name: "Spectrum Companies", product_mix: "3D Virtual Tour, Still Rendering, 3D Top View Floor Plan, 2D Product", city: "Wendell", state: "NC" },
      { property_name: "Coda", client_name: "Ridgehouse Companies", product_mix: "3D Virtual Tour, Still Rendering", city: "Nashville", state: "TN" },
      { property_name: "Mayla Pompano", client_name: "Grover Corlew", product_mix: "Still Rendering", city: "Pompano Beach", state: "FL" },
      { property_name: "200 Baker", client_name: "Hilco Development Services", product_mix: "3D Top View Floor Plan, Still Rendering", city: "Costa Mesa", state: "CA" },
      { property_name: "Miller 365", client_name: "IDI Logistics", product_mix: "Still Rendering, 3D Animation, 3D Virtual Tour, 2D Product", city: "Dallas", state: "TX" },
      { property_name: "Kent", client_name: "Pahlisch Commercial", product_mix: "Still Rendering, 2D Product, 3D Top View Floor Plan", city: "Washington", state: "WA" },
      { property_name: "Highland", client_name: "Cottonwood Residential", product_mix: "Still Rendering", city: "Millcreek", state: "UT" },
      { property_name: "Broadstone Inkwell Long Beach", client_name: "Alliance Residential", product_mix: "Still Rendering", city: "Long Beach", state: "CA" },
      { property_name: "Clocktower", client_name: "HILLS Properties", product_mix: "3D Virtual Tour, Web & Social Product, Still Rendering, 3D Animation", city: "West Chester", state: "OH" },
      { property_name: "Vance Jackson", client_name: "Lonestar Development Partners", product_mix: "Still Rendering, 3D Top View Floor Plan, 2D Product", city: "San Antonio", state: "TX" },
      { property_name: "Aventon Nora Park Rendering", client_name: "Aventon Companies", product_mix: "Still Rendering", city: "Raleigh", state: "NC" },
      { property_name: "Beltline", client_name: "Greco", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation, Photography/Video/VS Product", city: "St Louis Park", state: "MN" },
      { property_name: "Lowa Phase II", client_name: "Greco", product_mix: "3D Virtual Tour, Still Rendering, 3D Animation", city: "Minneapolis", state: "MN" },
      { property_name: "The Otto", client_name: "Greco", product_mix: "3D Virtual Tour, Still Rendering, Photography/Video/VS Product", city: "Waconia", state: "MN" },
      { property_name: "Eastpark", client_name: "Urban Street Group", product_mix: "Still Rendering", city: "Madison", state: "WI" },
      { property_name: "Oak Lake", client_name: "Collett Capital", product_mix: "3D Virtual Tour, Still Rendering", city: "Charlotte", state: "NC" },
      { property_name: "Avery Place", client_name: "Collett Capital", product_mix: "Still Rendering", city: "Charlotte", state: "NC" },
      { property_name: "Luxury Single Family", client_name: "Starfund", product_mix: "3D Virtual Tour", city: "Fort Pierce", state: "FL" },
      { property_name: "Victory Drive", client_name: "Aventon Companies", product_mix: "Still Rendering", city: "Savannah", state: "GA" },
      { property_name: "Centro East", client_name: "Riverside Resources", product_mix: "Still Rendering, 2D Product", city: "Austin", state: "TX" },
      { property_name: "Flagler", client_name: "Davis Development", product_mix: "Still Rendering", city: "Jacksonville", state: "FL" },
    ];

    // ── Delete existing docs for this deal room to avoid duplicates ──
    await supabase
      .from("client_knowledge_docs")
      .delete()
      .eq("deal_room_id", dealRoomId);

    // ── Insert all 4 records ──
    const records = [
      {
        deal_room_id: dealRoomId,
        doc_type: "knowledge_base",
        title: "The View Pro & Seenic – Master Knowledge Base",
        content: knowledgeBaseContent,
        is_internal_only: false,
      },
      {
        deal_room_id: dealRoomId,
        doc_type: "pricing",
        title: "The View Pro – 2025 Pricing Catalog",
        content: pricingContent,
        is_internal_only: true,
      },
      {
        deal_room_id: dealRoomId,
        doc_type: "guidelines",
        title: "AI Agent Guidelines for The View Pro Outreach",
        content: guidelinesContent,
        is_internal_only: false,
      },
      {
        deal_room_id: dealRoomId,
        doc_type: "project_locations",
        title: "The View Pro – Project Locations (150+ projects)",
        content: `${projectLocations.length} projects across ${[...new Set(projectLocations.map(p => p.state))].length} states`,
        structured_data: projectLocations,
        is_internal_only: false,
      },
    ];

    const { data, error } = await supabase
      .from("client_knowledge_docs")
      .insert(records)
      .select("id, doc_type, title, is_internal_only");

    if (error) throw error;

    console.log(`Successfully ingested ${data.length} knowledge docs for deal room ${dealRoomId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Ingested ${data.length} knowledge documents`,
        docs: data,
        project_count: projectLocations.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error ingesting knowledge docs:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
