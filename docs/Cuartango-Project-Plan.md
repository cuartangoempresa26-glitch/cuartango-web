# Cuartango Argentina — Website Project Plan & Technical Specification

Version 1.0 · 2026-10-16 · Prepared for the Cuartango team and its developer

---

## 0. Executive summary

**Recommendation in one paragraph.** Build a static-first site with **Astro** (Tailwind CSS, content in Markdown/JSON files), kept in a **GitHub** repository and deployed automatically to **Cloudflare Pages**. Add a small **Cloudflare Workers** back end (free tier) for the three dynamic jobs: reservations (Google Calendar API), Google reviews (cached, refreshed on a schedule) and the contact form. Domain `cuartango.com` is registered at Namecheap with DNS pointed at Cloudflare. Email `info@cuartango.com` runs on Zoho Mail Free. Expected recurring cost: **about €10–15 per year (the domain)**, plus optional paid extras (see §9).

**Is GitHub Pages suitable?** Partly. It hosts the static pages well and for free, with HTTPS and a custom domain. It cannot run any server code, and the reservation system and the review feed both need server code to keep secrets (Google credentials) off the browser. You would have to add a separate serverless service anyway, so you end up with two platforms. Cloudflare Pages does the same static hosting and also gives you Workers, preview URLs per branch, and a global CDN, all in one dashboard at no cost. GitHub stays as the source of truth.

**What I could verify from the current site** (`cuartangoargentina.makro.rest`): the address, phone, email, slogan, service list, payment methods and menu categories in §3. **What I could not verify:** opening hours, prices, any video, anything on Instagram (the profile is not readable without a login), and everything about the Vecindario venue. Those are marked `TODO` below and are listed in §13 as content you need to supply.

---

## 1. Goals and success measures

| Goal | Measure (first 6 months) |
|---|---|
| Be found locally | Top-3 map pack for "restaurante argentino Las Palmas" and "parrilla argentina Vecindario" |
| Convert visits to bookings | ≥ 4% of mobile visitors start a reservation, ≥ 60% of those complete it |
| Reduce phone load | ≥ 40% of reservations arrive online |
| Social proof | Live Google rating and recent reviews on the home and both venue pages |
| Speed | Lighthouse mobile ≥ 90 performance, LCP < 2.5 s, CLS < 0.1, INP < 200 ms |
| Easy upkeep | Owner updates specials without a developer in < 5 minutes |

---

## 2. Brand and design direction

Taken from the supplied logo (dark background version and transparent version):

- **Palette:** near-black `#050705` background, flame orange to ember red gradient `#F5A623 → #E8501A → #B3200E`, mustard gold `#EDB22B` for headings (the "CUARTANGO" lettering), Argentine sky blue `#0A84FF`-ish accent `#1E90FF` used sparingly (flag ribbon), warm off-white `#F7F1E8` for text blocks.
- **Typography:** a condensed, distressed-stamp display face for headings (for example *Bebas Neue* or *Anton*; the logo's face looks like a rough slab sans) and a clean humanist sans for body (*Inter* or *Source Sans 3*). Self-host the fonts to avoid third-party requests.
- **Mood:** fire, smoke, grill grid, craft. Dark theme by default, large photography, short bursts of video. Grill-grid line pattern and flame glow as subtle background motifs. Tone of voice: warm, proud, direct ("Donde la carne es un arte y el fuego, tradición").
- **Languages:** Spanish (default) and English, with `hreflang`. The current site already has `?lang=en`. Tourists in Gran Canaria make English essential for SEO and bookings.
- **Logo files:** keep both versions. Convert to SVG if possible (ask the designer for the vector source); otherwise trace the logo. Create a favicon, an Open Graph image (1200×630) and an app icon.
- **Accessibility:** WCAG 2.2 AA. Gold-on-black contrast passes; check orange-on-black for small text. Visible focus states, reduced-motion support, alt text for every image, captions on videos.

---

## 3. Known business data (from the existing site)

| Item | Value |
|---|---|
| Name | Cuartango Argentina ("Cuartango Entrepanes" on the logo) |
| Las Palmas address | C. José Franchy Roca 9, 35007 Las Palmas de Gran Canaria |
| Phone | +34 656 441 966 (confirm whether this is shared by both venues) |
| Email in use | cuartangoargentina@gmail.com (to be replaced by info@cuartango.com) |
| Slogan | "Donde la carne es un arte y el fuego, tradición" |
| Menu | Entrepanes: Cuarteto, Cumbia, Milonga, Tango. Cortes: Parrillada. Empanadas caseras. Full menu is a PDF. |
| Services | Dine-in, takeaway, delivery, catering, buffet, private events, wedding receptions, outdoor seating, rooftop bar, smoking area, free Wi-Fi |
| Payments | Visa, Mastercard, Amex, debit, cash, contactless, Apple Pay |
| Legal operator | Gabriel Uran, tax number ESY8072792J (needed for the legal notice page) |
| Nuevo Local Vecindario | **TODO**: address, phone, hours, services, photos |
| Opening hours (both) | **TODO** |

Use the existing site's images and its logo/menu PDF as placeholders. Before launch, confirm you own or have permission to reuse every photo and video, including anything taken from Instagram.

---

## 4. Site map and page specifications

```
/                     Home
/es/ and /en/         Language roots (Spanish default at /)
/menu                 Interactive menu (location-aware)
/locales              Overview of both venues
/las-palmas           Local Las Palmas (dedicated landing page)
/vecindario           Nuevo Local Vecindario (dedicated landing page)
/reservas             Reservation journey
/eventos              Events, catering, weddings, private bookings
/galeria              Video and photo gallery
/opiniones            Reviews (live from Google)
/sobre-nosotros       Story, grill tradition, team
/contacto             Contact form, map, both venues
/aviso-legal  /privacidad  /cookies   Legal pages (required in Spain: LSSI, RGPD)
```

### 4.1 Home
Hero with looping muted video (8–12 s of grill fire, plating), logo, slogan, two buttons: "Reservar" and "Ver carta". Below: a two-card location selector (Las Palmas / Vecindario) with open-now status, today's special, live rating strip, top three dishes, a short video reel, event/catering teaser, Instagram feed, final booking call to action. Sticky mobile bar with Call · Reserve · Directions.

### 4.2 Location pages (the critical requirement)
Each venue gets its **own URL, own content, own metadata, own schema and own Google Business Profile link**. Never merge them into one page with tabs. Template, filled per venue:

- H1: "Parrilla argentina en Las Palmas de Gran Canaria" / "Parrilla argentina en Vecindario"
- Address block, click-to-call, click-to-WhatsApp, "Cómo llegar" (Google Maps directions link), embedded map
- Opening hours table including special/holiday hours, and an "Open now / Closes at" badge computed from the hours data
- Services list specific to that venue (Las Palmas lists the rooftop bar, for example; confirm which apply to Vecindario)
- High-resolution gallery of that venue only (AVIF/WebP, responsive sizes)
- Venue video
- Venue-specific promotions and event calendar (data file per venue)
- Reservation widget pre-set to the venue
- Reviews filtered to that venue's Google profile
- Local copy of 300–500 words (neighbourhood, parking, how to arrive, nearby landmarks), written naturally, not keyword-stuffed
- FAQ block (marked up with FAQ schema)
- Link to the other venue ("Also visit us in Vecindario")

### 4.3 Interactive menu
- Source of truth: one `menu.json` (or CMS collection) with categories, items, descriptions (ES/EN), price, photo, tags, **allergens (the 14 EU allergens)**, dietary flags (gluten-free option, vegetarian), per-venue availability and a `special` flag.
- UI: sticky category tabs, search, filters by allergen ("hide items containing…") and diet, item detail drawer, add to "my favourites" (local storage, no account needed).
- Today's specials: a separate `specials.json` with `venue`, `valid_from`, `valid_to`. The home and venue pages read it at build time and the client refreshes it on load (see §6.3).
- Downloadable PDF menu kept as a fallback.
- Prices: the current site lists none. Decide whether to publish them. Local SEO and trust favour showing them.
- Legal note: Spanish and EU rules require allergen information be available to customers. Treat the website as a convenience layer, not a replacement for the in-venue declaration, and keep the data reviewed by the kitchen.

### 4.4 Reservations
See §7. Journey: choose venue → date → party size → available time slots → contact details → confirm → on-screen confirmation, email, calendar invite, reminder.

### 4.5 Events and catering
Packages (weddings, private events, buffet, catering) with an enquiry form. Enquiries are not instant bookings; they go to email and a calendar "hold".

### 4.6 Gallery and video
See §6.4.

### 4.7 Reviews
See §8.

### 4.8 Legal and consent
Cookie banner (decline-by-default for analytics and marketing), privacy policy covering reservation data (name, phone, email, retention period), legal notice with operator details, terms for reservations (no-show/deposit policy if any). Use a privacy-friendly analytics tool to minimise consent friction (see §10).

---

## 5. Recommended technology stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 5** | Ships almost no JavaScript, excellent Lighthouse scores, built-in i18n routing, image optimisation, content collections, easy for a moderately technical developer |
| Styling | Tailwind CSS | Fast iteration, consistent design tokens |
| Interactive parts | Small Astro "islands" (Preact or Svelte) for the menu filters and booking form | Hydrates only where needed |
| Content | Markdown/JSON in the repo, edited via **Decap CMS** (free, Git-based) or **Sveltia CMS** | Owner gets a friendly editor at `/admin`; every change is a Git commit that triggers a deploy |
| Hosting | **Cloudflare Pages** | Free, unlimited bandwidth on static assets, automatic HTTPS, preview deploys per branch |
| Server code | **Cloudflare Workers** (or Pages Functions) | Free tier of 100,000 requests/day, no servers to patch |
| Storage | Workers **KV** (cache, rate limits) and **D1** (SQLite, booking records) | Free tiers are ample for one restaurant |
| Scheduled jobs | Workers **Cron Triggers** | Refresh reviews, send reminders |
| Video | Short clips self-hosted as MP4/WebM via **Cloudflare R2** or **Cloudflare Stream**; longer videos on YouTube (privacy-enhanced embed) | See §6.4 |
| Email (site → customer) | **Resend** or **Brevo** free tier, sending from `reservas@cuartango.com` | Transactional confirmations need authenticated sending (SPF, DKIM, DMARC) |
| Mailbox | **Zoho Mail Free** | See §11 |
| Source control | GitHub (private repo) | Branches, PRs, Actions |
| Analytics | Cloudflare Web Analytics or Plausible; Google Search Console; GA4 optional | See §10 |

### Why not a different CMS?
- **WordPress** (shared hosting or managed): familiar and plugin-rich, with booking plugins available. Cost is real (hosting €5–15/month plus premium plugins), it needs constant updates and is the most attacked platform. Page speed requires effort. Reasonable only if the owner insists on WordPress admin.
- **Wix / Squarespace / Webflow**: fastest to launch and include booking tools, but monthly fees (€15–40), limited control over schema and speed, and migrating away is hard. Good if no developer will be involved.
- **Headless CMS (Sanity, Storyblok)**: more power than needed here; free tiers exist but add another account to manage.

---

## 6. Feature specifications

### 6.1 Responsive, mobile-first UI
Design at 360 px first, then scale up. Breakpoints 640 / 1024 / 1440. Touch targets ≥ 44 px. Test on real mid-range Android and iPhone. Most restaurant traffic is mobile, and Google indexes the mobile version.

### 6.2 Performance budget
- HTML + critical CSS < 50 KB per page; total JS < 100 KB on content pages.
- Images: AVIF/WebP with `srcset`, explicit width/height, lazy-load below the fold, hero image preloaded.
- Hero video: under 2.5 MB, muted, `playsinline`, poster image, not loaded on slow connections (`navigator.connection.saveData`) or when reduced motion is on.
- Fonts: self-hosted WOFF2, subset, `font-display: swap`.
- No third-party widgets above the fold. Maps and Instagram embeds load on interaction (facade pattern).

### 6.3 Real-time specials
Two workable options:
1. **Simple:** owner edits `specials` in the CMS; saving triggers a rebuild that finishes in about a minute. Good enough for daily specials.
2. **Instant:** specials stored in Workers KV and fetched by the page on load (`/api/specials`), edited through a small password-protected admin page. Use only if updates must appear in seconds.
Start with option 1.

### 6.4 Video strategy
- **Hero loop:** 8–12 s, 1080p H.264 MP4 plus WebM, ≤ 2.5 MB, no audio track.
- **Gallery videos (30–60 s):** upload to Cloudflare Stream (about $5 per 1,000 minutes stored, plus delivery; adaptive bitrate, no player to build) or YouTube/Vimeo for zero cost. For a small restaurant YouTube with privacy-enhanced mode is the cheapest option; Stream is the cleanest if branding without YouTube chrome matters.
- **Instagram reels:** reuse the same clips. The Instagram embed is heavy and unreliable, so prefer uploading the original files to your own hosting and linking to Instagram.
- **"Regularly updated" workflow:** a `videos.json` collection in the CMS (title, venue, file or ID, poster, date). The owner uploads a clip and adds one entry; the gallery sorts by date. Replace the placeholder videos when you send the new ones.
- Capture each video's transcript or captions (accessibility and SEO).

### 6.5 Contact form
Posts to a Worker that validates, rate-limits, blocks bots with **Cloudflare Turnstile** (free, privacy-friendly) and emails `info@cuartango.com`. No data stored beyond a short log.

### 6.6 Maps
Static map image linking to Google Maps (fast, no key exposure) or an interactive embed loaded on click. Add "Get directions" deep links to each venue's Google Maps place URL.

---

## 7. Online reservation system

### 7.1 Options compared

| Approach | How it works | Setup | Cost | Real-time availability | Branding / UX | Data ownership | Risks |
|---|---|---|---|---|---|---|---|
| **A. Embedded third-party widget** (TheFork, CoverManager, Resy, OpenTable, Quandoo, Tablein, Dish Reservations) | Paste a script/iframe | Hours | Free to ~€50+/month; some charge per cover or commission | Yes, built-in table management | Limited styling; extra weight; separate cookie consent | Vendor holds the data | Commission models, lock-in, widgets slow the page |
| **B. Calendar-scheduling tool** (Google Calendar *appointment schedules*, Cal.com, Calendly, Tidycal) | Embed a booking page tied to Google Calendar | 1–2 days | Google: included with Workspace paid plans; Cal.com/Calendly free tier is limited | Yes (against calendar busy times) | Decent, some styling | Calendar holds it | Built for 1:1 appointments, not table capacity or party size; awkward for "6 people at 21:00" |
| **C. Custom booking on Google Calendar API via serverless** (recommended) | Your form → Worker → checks capacity → writes Google Calendar event → sends emails | 1–2 weeks | €0 hosting | Yes, from your own capacity rules | Fully on-brand, fastest | You hold the data (D1 + Calendar) | You maintain it; need careful testing |
| **D. Full custom back end (VPS + database + admin)** | Your own server app | 4+ weeks | VPS €5–10/month plus maintenance | Yes | Fully custom | You | Highest maintenance and security burden; overkill |
| **E. Phone/WhatsApp only** | Click-to-chat | Minutes | €0 | No | Poor | n/a | Doesn't meet the brief |

**Recommendation: C**, with **A as the pragmatic fallback** if the restaurant wants floor-plan/table management or a no-show deposit. Be explicit with the client about one limitation: **Google Calendar is a record of events, not an inventory system.** A calendar cannot natively say "20 seats free at 21:00". Your Worker must hold that logic.

### 7.2 Architecture for option C

```
Browser (booking form, Astro island)
   │ GET /api/availability?venue=lp&date=2026-11-02&party=4
   ▼
Cloudflare Worker ── reads rules (KV/JSON): seats, slot length, opening hours, closed dates
   │               ── reads D1: confirmed bookings for that venue/date → computes free seats per slot
   │               ── (optional) reads Google Calendar freeBusy for manual blocks (private events)
   ▼
Browser shows free slots
   │ POST /api/book {venue, date, time, party, name, phone, email, notes, turnstileToken}
   ▼
Worker: verify Turnstile → re-check capacity inside a D1 transaction (prevents double-booking)
   → insert booking (status=confirmed, cancel token)
   → Google Calendar API: events.insert on the venue's calendar (service account)
   → email confirmation (Resend) with .ics attachment and a signed cancel/modify link
   → respond 201 with confirmation
Cron Trigger (hourly): find bookings 24 h away → send reminder email (and SMS/WhatsApp if added later)
```

**Key design decisions**
- **One Google Calendar per venue** ("Cuartango – Las Palmas", "Cuartango – Vecindario") owned by a Google account created with the Zoho address **info@cuartango.com** (client decision; replaces the earlier idea of a Gmail account). Google allows this: on sign-up choose "Use my existing email address" instead of creating a Gmail; the verification code arrives in the Zoho mailbox. Order of set-up: buy domain → configure Zoho and create the mailbox → create the Google account with that address. That Google account owns both calendars (and ideally the Business Profiles and Google Cloud project); staff log in to it or are shared the calendars. Use 2-step verification and keep recovery details under the owner's control. Share each calendar with the **service account** email, "Make changes to events" permission. The service account key is stored as an encrypted Worker secret, never in the repo or the browser.
- **The database is the source of truth for capacity; the calendar is the staff-facing view.** The calendar stays readable on the owner's phone, and "blocked" events (private event, closed) created manually in the calendar are respected through `freeBusy`.
- **Capacity rules** in a config file: seats per venue, slot interval (15/30 min), average dining duration (e.g. 90 min), max party size for online booking (larger parties go to the enquiry form), lead time (e.g. not less than 2 h ahead), cut-off, closed dates, different rules per venue.
- **Concurrency:** wrap the "check then insert" in a single D1 transaction so two people cannot take the last table at the same moment.
- **Automated reminders:** Google Calendar's own invitation reminders only reach guests if they are added as attendees; adding customers as attendees sends them Google invites and exposes them to Google's sharing rules. Safer: do not add customers as attendees; send your own confirmation and reminder emails with an `.ics` file ("Add to calendar").
- **Self-service cancel/modify:** signed token link in every email; cancelling frees capacity and updates the calendar event.
- **Anti-abuse:** Turnstile, rate limit per IP and per email via KV, honeypot field, limit of N upcoming bookings per phone number.
- **Notifications to staff:** email to `info@cuartango.com` and optionally a Telegram or WhatsApp message through a Worker call.
- **Admin:** to begin, staff use Google Calendar on their phones (cancel by deleting the event; a Calendar push/watch webhook or a nightly sync marks the booking cancelled). Phase 2: a small protected admin page listing bookings.
- **Data protection:** store only what is needed, state retention (e.g. delete personal data 6 months after the booking date, via cron), record consent to contact, provide a deletion route. Required by the RGPD/LOPDGDD.
- **Time zones:** use `Atlantic/Canary` (UTC+0/+1) explicitly. Canary Islands differ from mainland Spain, a classic source of off-by-one-hour bugs.

### 7.3 Effect on time, UX and budget

| | Widget (A) | Scheduler (B) | Custom serverless (C) |
|---|---|---|---|
| Build time | 0.5–1 day | 1–2 days | 8–12 days incl. testing |
| Monthly cost | €0–60 | €0–15 | €0 (domain only; email sender free tier up to ~3,000 emails/month) |
| User experience | Acceptable, off-brand | Awkward for parties | Best, one consistent flow, venue-aware |
| Maintenance | Vendor | Vendor | You (small, but real) |
| Table/floor management | Often included | No | Only seat-count capacity unless you build more |

---

## 8. Google reviews, automatic and self-sustaining

### 8.1 The constraint you need to know
Two official sources exist, with different limits:

1. **Google Places API (New)**, Place Details: returns the rating, review count and **only up to 5 reviews** (the "most relevant"), and requires you to show Google attribution. Easy, needs just an API key. Free monthly credit covers this volume easily, but you must enable billing on the Google Cloud project.
2. **Google Business Profile API** (My Business Account/Reviews API): returns **all** reviews and lets you reply, but you must be an owner/manager of the profile and **request API access** from Google (approval can take days to weeks). This is the correct route for "aggregate all reviews".

Avoid scraping or unofficial "free review widget" scripts: they break, can violate Google's terms and may endanger the Business Profile.

### 8.2 Recommended design
```
Cron Trigger (every 6 h) → Worker → Business Profile API (OAuth refresh token as secret)
   → fetch reviews per location (Las Palmas, Vecindario)
   → store normalised JSON in KV: {rating, total, reviews[{author, stars, text, date, reply}]}
Website → GET /api/reviews?venue=lp   (cached at the edge for 1 h)
```
- **Phase 1 (launch):** Places API (New) for rating + 5 reviews per venue, so the feature is live immediately.
- **Phase 2:** switch the Worker to Business Profile API once approved; the front end does not change because it only reads the Worker's JSON.
- **Resilience:** if Google fails, serve the last cached copy and never show an error. Cache must be refreshed automatically, with an alert email if the cron fails three times in a row.
- **Compliance:** display Google attribution and link to "Leave a review" (`https://search.google.com/local/writereview?placeid=<ID>`) for each venue. Only show text that Google returns; do not edit reviews. Filter by minimum rating only if the policy allows (curating selectively can be seen as misleading, so show the genuine average).
- **Schema:** add `aggregateRating` to the LocalBusiness JSON-LD **only if** the reviews shown are of the business itself and the numbers match what is visible. Google restricts self-serving review markup for local businesses, so test with the Rich Results tool and be ready to drop it.
- **Setup steps (owner involvement):** the owner must be the verified manager of both Google Business Profiles, grant access to the developer's Google account as a manager, and approve the OAuth consent once. Place IDs are found with the Place ID finder.

---

## 9. Hosting comparison and cost analysis

### 9.1 Options

| Option | Setup complexity | Running cost | Scalability | Security burden | Fit |
|---|---|---|---|---|---|
| **GitHub Pages** | Very low | €0 | CDN-backed; soft limits (1 GB site, 100 GB/month bandwidth); no server code | Low (static only); no secrets possible | Static brochure only. Needs a separate serverless service for booking/reviews |
| **Cloudflare Pages + Workers (recommended)** | Low–moderate | €0 on free tier | Global edge, automatic | Low: no servers, DDoS protection and TLS included; you manage Worker secrets | Best fit: static site + serverless API |
| **Netlify / Vercel** | Low | €0 hobby tier (Vercel's hobby tier is non-commercial only, so a business needs a paid plan, about $20/month; Netlify's free tier permits commercial use but has bandwidth credit limits) | Excellent | Low | Equivalent technical fit; watch the licence terms and quota |
| **Firebase Hosting + Cloud Functions** | Moderate | Free tier, but functions require a billing account | Excellent | Low | Good if the team already lives in Google Cloud; slightly more setup |
| **Shared hosting (cPanel) + WordPress** | Low (installers) | €3–10/month + plugins | Limited, slows under load | **High**: constant updates, plugin vulnerabilities, backups are on you | Only if WordPress is mandatory |
| **Managed WordPress** | Low | €15–35/month | Good | Medium (host patches core) | Easier than shared, still costly |
| **VPS (Hetzner, DigitalOcean, etc.)** | High | €5–12/month | Manual scaling | **Highest**: OS updates, firewall, backups, TLS | Overkill; only for a fully custom back end |
| **Website builder (Wix, Squarespace)** | Lowest | €15–40/month | Handled | Handled by vendor | Fastest launch, least control and SEO flexibility |
| **Specialised restaurant platform** (the current Dish/makro-style builder) | Lowest | Monthly subscription | Handled | Handled | What the client has today; limited design and custom booking logic |

### 9.2 Cost projection (first year)

| Item | Cost |
|---|---|
| `cuartango.com` at Namecheap (first year is usually discounted; renewal about €12–17) | €10–17 |
| WHOIS privacy | Free with Namecheap |
| Cloudflare Pages/Workers/KV/D1/Turnstile | €0 |
| GitHub private repo | €0 |
| Zoho Mail Free (one mailbox) | €0 |
| Transactional email (Resend/Brevo free tier) | €0 |
| Google Calendar | €0 (a free Google account is enough) |
| Google Places API | €0 within the monthly credit; billing must be enabled |
| Video: YouTube €0, or Cloudflare Stream roughly €5–10/month for a handful of videos | €0–120 |
| **Realistic total** | **about €10–17 per year**, up to ~€140 with hosted video |

Development labour is separate. Estimated effort is in §12.

---

## 10. SEO and GEO specification

### 10.1 Keyword research (starting list, to be validated with Google Keyword Planner and Search Console data)

| Intent | Spanish | English |
|---|---|---|
| Core | restaurante argentino Las Palmas, parrilla argentina Las Palmas de Gran Canaria, asado argentino Gran Canaria | Argentinian restaurant Las Palmas, Argentine steakhouse Gran Canaria |
| Vecindario | restaurante argentino Vecindario, parrilla Vecindario, carne a la brasa Santa Lucía de Tirajana | Argentinian grill Vecindario, steakhouse south Gran Canaria |
| Product | entrepanes argentinos, choripán Las Palmas, empanadas argentinas Las Palmas, vacío y entraña, parrillada para dos | Argentine sandwiches, empanadas Gran Canaria |
| Service | reservar mesa restaurante Las Palmas, catering argentino Gran Canaria, eventos y bodas con parrilla, azotea / rooftop Las Palmas | wedding catering Gran Canaria, rooftop bar Las Palmas |
| Near me | restaurante cerca de mí, parrilla abierta ahora | restaurant near me, open now |

Cross-check with competitors' pages in both towns, and use "People also ask" for FAQ content. Spanish content is primary because that is where most volume sits; English captures tourists.

### 10.2 On-page
- One H1 per page, unique `<title>` (≤ 60 characters) and meta description (≤ 155), clean URLs, canonical tags, `hreflang` pairs (es/en/x-default), breadcrumbs.
- Title pattern: `Parrilla argentina en Las Palmas | Cuartango Entrepanes`.
- Descriptive image file names and alt text, 'NAP' (name, address, phone) identical everywhere.
- Internal linking between home → venues → menu → reservations.
- Auto-generated `sitemap.xml`, `robots.txt`, human-readable 404.
- Open Graph and Twitter cards with a per-page image.
- Optional: `llms.txt` summarising the business for AI assistants, and keep the facts (hours, addresses, menu) in plain HTML so AI answer engines can quote them.

### 10.3 Structured data (JSON-LD)
- Site-wide: `Organization` with logo and `sameAs` (Instagram, Google Business Profile, Facebook if any).
- **Per venue page:** `Restaurant` (subtype of `LocalBusiness`) with `name`, `image`, `address` (PostalAddress), `geo`, `telephone`, `servesCuisine: "Argentine"`, `priceRange`, `openingHoursSpecification`, `hasMenu` (URL), `acceptsReservations`, `url`, `sameAs`, `paymentAccepted`, `amenityFeature`.
- Menu page: `Menu`, `MenuSection`, `MenuItem` with `suitableForDiet` where applicable.
- FAQ pages: `FAQPage`. Events: `Event`. Videos: `VideoObject`. Breadcrumbs: `BreadcrumbList`.
- Generate the JSON-LD from the same data files as the visible content so they cannot drift apart. Validate with Schema Markup Validator and Rich Results Test in CI.

### 10.4 GEO (local) optimisation
1. **Google Business Profile for each venue**, verified, with the right primary category ("Restaurante argentino" or "Parrilla") and secondary categories, full hours with special hours, attributes (rooftop, outdoor seating, delivery, takeaway), menu link, **reservation link to the venue-specific booking page**, appointment/booking URL, photos and videos, weekly posts (promotions, specials), Q&A, review replies. Use `UTM` parameters on the profile links to track traffic.
2. Link the website to each profile (`sameAs`) and each profile to its own landing page (never to the home page).
3. **Citations and directories**, consistent NAP everywhere: TripAdvisor, TheFork, Yelp, Apple Business Connect, Bing Places, Páginas Amarillas, Facebook, Instagram, Foursquare, plus local Gran Canaria tourism and food directories. Claim the existing listings rather than creating duplicates.
4. Local content: a blog/news section with a few useful pages (e.g. "Dónde comer asado argentino en Las Palmas", "How to order an Argentine parrillada", events). Quality over volume.
5. Backlinks: local food bloggers, Gran Canaria tourism sites, event partners, wedding and event planners.
6. Review velocity: place a QR code and link inviting guests to review each venue; reply to every review within a few days.

### 10.5 Technical SEO and measurement
- Mobile-first rendering, Core Web Vitals field data monitored through Search Console.
- Set up **Search Console** (domain property via DNS), **Bing Webmaster Tools**, and one analytics tool (Plausible or Cloudflare Web Analytics, cookieless; GA4 only with consent).
- Track events: reserve start, reserve complete, phone click, directions click, menu view, review-link click, per venue.

---

## 11. Domain, DNS and email

### 11.1 Domain (Namecheap)
1. Confirm `cuartango.com` is available (the owner may already hold it, or someone else may; check before building around it). If taken, alternatives are `cuartango.es`, `cuartangoargentina.com`, `cuartango.eu`.
2. Register with the **owner as registrant** (not the developer), with strong account password, 2FA on, auto-renew on, WHOIS privacy on, and a lock on the domain.
3. **DNS:** either keep Namecheap's DNS or change nameservers to Cloudflare. Cloudflare DNS is recommended for Pages hosting (apex CNAME flattening), analytics and DDoS protection. Both work.
4. Redirect `www` → apex (or the reverse), force HTTPS, enable HSTS once stable.
5. SSL: automatic and free through Cloudflare. Nothing to buy.

### 11.2 Email: Zoho Mail free tier
- Add the domain in Zoho, verify via a TXT record, add the **MX records** (`mx.zoho.eu`, `mx2.zoho.eu`, `mx3.zoho.eu`; use the `.eu` data centre if the account is created in Europe, otherwise `.com`), plus **SPF** (`v=spf1 include:zoho.eu ~all`, extended to include the transactional sender), **DKIM** and **DMARC** (`p=none` at first, then tighten) records.
- Create `info@cuartango.com`, and aliases such as `reservas@` and `info@` that route to it.
- Limits to be aware of (check Zoho's current plan page before relying on them): the free tier is typically for a small number of users with limited storage and has been **web and mobile app access only, without IMAP/POP or external client access**, and it can restrict some domain features. If the owner wants Outlook/Apple Mail, a paid plan (about €1 per user per month) is the upgrade path.
- The transactional email provider (Resend/Brevo) must also be authenticated on the domain, otherwise booking confirmations land in spam.
- Migration: forward `cuartangoargentina@gmail.com` to the new address for a transition period, and update Google Business Profile, Instagram and the legal pages.

---

## 12. Development workflow and roadmap

### 12.1 Tools and practices (for a moderately technical developer)
- **Git/GitHub:** `main` is production; work on feature branches; open a pull request for each change. Cloudflare creates a **preview URL per branch/PR** so the client can approve before publishing.
- **CI/CD:** Cloudflare Pages builds on every push (no pipeline to write). Add one **GitHub Actions** workflow that runs on PRs: lint, type check, build, link checker, Lighthouse CI against the performance budget, and schema validation.
- **Environments:** `main` → cuartango.com; PR previews; local dev via `npm run dev` and `wrangler dev` for the Worker. Secrets live in Cloudflare (`wrangler secret put`), never in Git; a `.env.example` documents them.
- **Content updates without code:** Decap/Sveltia CMS at `/admin` with GitHub login for the owner; editorial workflow creates a PR, preview, then publishes.
- **Rollback:** every deploy is immutable; roll back in one click in the Cloudflare dashboard.
- **Backups:** the Git repo is the content backup; export D1 bookings weekly with a cron to an R2 bucket.
- **Monitoring:** UptimeRobot/Better Stack (free) pinging the home page and `/api/availability`; email alerts on Worker errors; Search Console alerts.
- **Dependency hygiene:** Dependabot or Renovate, monthly merge.
- **Documentation:** a README with "How to add a special / a video / a venue / change opening hours".

### 12.2 Phased roadmap (about 8 weeks part-time, elapsed time depends on content arrival)

| Phase | Weeks | Deliverables |
|---|---|---|
| **0. Discovery and set-up** | 0–1 | Content inventory (§13), domain purchase, Cloudflare/GitHub/Zoho/Google accounts, brand tokens from the logo, sitemap approval, Google Business Profile ownership confirmed for both venues |
| **1. Design** | 1–2 | Mobile and desktop mockups (home, venue, menu, booking) in Figma or straight in code; client approval |
| **2. Core build** | 2–4 | Astro project, layouts, home, both venue pages, menu with allergens, gallery, contact, i18n ES/EN, legal pages, placeholder media from the current site |
| **3. Integrations** | 4–6 | Booking Worker + Google Calendar + emails + reminders; reviews Worker; Turnstile; Zoho email and DNS authentication |
| **4. SEO/GEO** | 5–7 | Schema, metadata, sitemap, redirects from the old URLs, Search Console, citations, Google Business Profile updates with new links |
| **5. QA and launch** | 7–8 | Device testing, accessibility audit, load/booking race-condition tests, Lighthouse ≥ 90, privacy review, DNS cut-over, 301 redirects, launch announcement |
| **6. Post-launch** | 9–12 | Replace placeholder videos with the new ones, review Search Console data, tune keywords, start review-request campaign, decide on admin dashboard |

### 12.3 Testing checklist
Two people booking the last table simultaneously; party size limits; closed days; Canary time zone around the March/October clock changes; booking cancel/modify links; email deliverability (Gmail, Outlook, Apple Mail); Google API outage behaviour (cached reviews still show); mobile Safari video autoplay; keyboard-only navigation; screen reader pass; cookie banner honours refusal.

---

## 13. Content and access checklist (what the client must provide)

**Content**
- [ ] Vecindario: address, phone, hours, services, photos, opening date, any launch offer
- [ ] Opening hours for Las Palmas (current site shows none), holiday hours
- [ ] Full menu with prices (or a decision not to publish them), descriptions, photos, **allergen data per dish**
- [ ] The new videos you mentioned (preferred: 1080p vertical and horizontal versions), plus permission to use them
- [ ] Photos with usage rights for the Instagram material
- [ ] Brand story text, team names/photos if wanted
- [ ] Event and catering packages, wedding information
- [ ] Reservation rules: seats per venue, slot length, max party size, deposit/no-show policy
- [ ] Legal details: operator name and tax ID (Gabriel Uran, ESY8072792J per the current site, confirm), registered address

**Access (owner-controlled accounts)**
- [ ] Namecheap account (registrant = owner)
- [ ] Google account registered with **info@cuartango.com** (Zoho mailbox): owns the two calendars (and ideally the Google Business Profiles and Google Cloud project); the developer gets manager access, not the password
- [ ] GitHub organisation or repo ownership and Cloudflare account under the business, not a personal account of the developer
- [ ] Instagram handle (@cuartango_argentina) for the feed link

---

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Business Profile API approval is slow | Launch with Places API (5 reviews), switch when approved |
| Google restricts review rich snippets for local businesses | Display reviews visibly; treat `aggregateRating` markup as optional |
| Calendar treated as inventory causes double bookings | Capacity in D1 with transactional check; calendar is a view |
| Zoho free tier limits (no external mail client) | Document it; paid plan is a small upgrade |
| `cuartango.com` unavailable | Pre-check; fallback names listed |
| Developer-only knowledge | Owner-owned accounts, README, CMS for routine edits |
| Copyright on photos/videos from Instagram | Written permission; keep a source log |
| Migration drops rankings | Keep URL map, 301 redirects, keep old site online until indexed |
| Spam bookings | Turnstile, rate limits, honeypot, phone/email verification if abuse grows |

---

## 15. Decisions needed from you

1. Confirm **Astro + Cloudflare Pages/Workers + GitHub** as the stack.
2. Choose the booking approach: **C custom (recommended)** or **A widget** (faster, possible fees, less control).
3. Publish prices on the menu: yes or no.
4. Spanish as the default language with English second: confirm.
5. Provide the Vecindario details and the opening hours.
