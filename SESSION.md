# Seematra pSEO Engine — Session Checkpoint

> **Last Updated:** 2026-05-29  
> **Status:** Phase 1 Complete — Engine Infrastructure Built  
> **Branch:** main  

---

## 🏗️ What Was Built

A complete **Programmatic SEO engine** for Uttarakhand travel that generates search-intent-targeted pages from structured seed data and renders them via Next.js 16 ISR.

### Architecture
```
Seed Data → pseo:seed → MongoDB (pseo_seeds)
                              ↓
                    Playbook Engine (7 generators)
                              ↓
                    MongoDB (pseo_pages) → /explore/[...slug] (ISR 24h)
                              ↓
                    PageRenderer → 10 page type UIs
```

### Core Concepts
- **Circuit-based SEO silos**: 7 Uttarakhand travel circuits as topical authority hubs
- **Intent pages**: Pages targeting real Google search queries (best time, budget trip, weekend trip, etc.)
- **Entity SEO**: Every page tagged with structured entities for cross-linking
- **Weighted internal linking**: Same circuit=high, same persona=medium, cross circuit=low
- **CTR optimization**: Titles validated for number + intent keyword + outcome promise

---

## 📁 File Map

### Types & Models
- `types/pseo.ts` — All TypeScript definitions (page types, entities, intents, weighted links)
- `models/PseoPage.ts` — Mongoose model for generated pages (8 indexes)
- `models/PseoSeed.ts` — Mongoose model for seed data (discriminated by seed_type)

### Seed Data (`scripts/pseo/seeds/`)
- `circuits.ts` — 7 circuit definitions with destinations, activities, seasons
- `destinations.ts` — 12 core destinations (Rishikesh, Shivpuri, Mussoorie, Kanatal, Haridwar, Chopta, Tungnath, Auli, Joshimath, Kedarkantha, Mukteshwar, Kausani)
- `activities.ts` — 20 activities (rafting, trekking, skiing, yoga, camping, etc.)
- `intents.ts` — 10 intent templates (best_time, budget_trip, weekend_trip, how_to_reach, hidden_places, couple_trip, adventure, family_trip, things_to_do, travel_tips)
- `entities.ts` — 33 entities (treks, attractions, activities, destinations)
- `seedPseo.ts` — CLI seeder script

### Playbook Engine (`lib/pseo/`)
- `types.ts` — Re-exports from types/pseo.ts
- `generator.ts` — Orchestrator: runs all playbooks → entity tag → link → CTR validate → dedup
- `linkEngine.ts` — Weighted internal linking (parent/child/sibling/cross × high/medium/low)
- `ctrOptimizer.ts` — CTR validation, title/meta builders, slug generators
- `entityTagger.ts` — Auto-tags pages with known entities from content

### Playbooks (`lib/pseo/playbooks/`)
| Playbook | Output | Count |
|----------|--------|-------|
| `circuitHub.ts` | Circuit hub pages | 7 |
| `destinationGuide.ts` | Destination guide pages | 12+ |
| `intentPage.ts` | Intent SEO pages | ~100+ |
| `comparison.ts` | A vs B comparison pages | 15 |
| `seasonal.ts` | Season-specific guides | 21 |
| `faqHub.ts` | FAQ hub pages | 7 |
| `nearbyPlaces.ts` | Nearby places pages | ~5-10 |

### Rendering Layer
- `app/explore/[...slug]/page.tsx` — ISR catch-all route (revalidate=86400)
- `lib/pseo/queries.ts` — Server-side query helpers (slug, circuit, entity, intent, sitemap)

### UI Components (`components/pseo/`)
| Component | Purpose |
|-----------|---------|
| `PageRenderer.tsx` | Routes page_type → correct renderer |
| `CircuitHubPage.tsx` | Premium hub layout (destinations grid, seasons, budget, transport) |
| `DestinationGuidePage.tsx` | Full guide (how-to-reach, activities, nearby, hotels) |
| `IntentPage.tsx` | Adaptive layout per intent category with themed gradients |
| `ComparisonPage.tsx` | Side-by-side table, verdict, persona recommendations |
| `GenericPage.tsx` | Handles seasonal, persona, FAQ hub, nearby, activity pages |
| `Breadcrumbs.tsx` | SEO breadcrumbs with BreadcrumbList JSON-LD |
| `FaqAccordion.tsx` | Client-side accessible accordion |
| `WeightedLinkGrid.tsx` | Priority-ordered internal link grid |
| `SeasonBadge.tsx` | Color-coded season indicators |
| `BudgetIndicator.tsx` | Visual budget range bar chart |
| `JsonLd.tsx` | Generic JSON-LD script injector |

### CLI Tooling
- `scripts/pseo/generate.ts` — Generator CLI (--type, --dry-run, --clear)
- `package.json` scripts: `pseo:seed`, `pseo:generate`, `pseo:generate:all`, `pseo:generate:dry`

---

## 🏃 How to Run

```bash
# 1. Seed the database
npm run pseo:seed

# 2. Preview pages (dry run — no MongoDB writes)
npm run pseo:generate:dry

# 3. Generate and save to MongoDB
npm run pseo:generate:all

# 4. Generate specific type
npm run pseo:generate -- --type=circuit_hub
npm run pseo:generate -- --type=intent

# 5. Regenerate with clear
npm run pseo:generate:all -- --clear

# 6. Start dev server
npm run dev
```

### Sample URLs
```
/explore/rishikesh-circuit                          → Circuit Hub
/explore/destination/rishikesh-travel-guide          → Destination Guide
/explore/intent/best-time-to-visit-rishikesh         → Intent Page
/explore/intent/weekend-trip-from-delhi-to-mussoorie  → Intent Page
/explore/compare/chopta-vs-auli                      → Comparison
/explore/rishikesh-circuit/winter-travel-guide        → Seasonal
/explore/rishikesh-circuit/faqs                      → FAQ Hub
/explore/destination/rishikesh/nearby-places          → Nearby Places
```

---

## 🔧 Tech Stack

- **Next.js 16** (App Router, ISR, async params)
- **MongoDB + Mongoose** (pseo_seeds, pseo_pages collections)
- **Tailwind CSS v4** (consistent with existing Seematra design system)
- **TypeScript** (strict types throughout)
- **JSON-LD** (TouristDestination, Place, FAQPage, Article, BreadcrumbList schemas)

---

## ⚠️ Known Issues

1. **Stale `.next/dev/types/validator.ts`**: References a previously deleted `app/explore/page.tsx`. Auto-resolves when dev server runs.
2. **Images**: Currently using placeholder paths (`/images/pseo/...`). Need real Cloudinary URLs.
3. **MongoDB required**: Pages are stored in MongoDB. Must seed + generate before viewing.

---

## 📋 What's Next (Phase 2)

### High Priority
- [ ] Add 40+ more destinations to `destinations.ts` (expand seed data)
- [ ] Build `itinerary.ts` playbook (day-by-day itineraries with route validation)
- [ ] Build `activity.ts` playbook (activity hub pages)
- [ ] Build `persona.ts` playbook (persona-specific pages)
- [ ] Add pSEO pages to `app/sitemap.ts`
- [ ] Replace placeholder images with Cloudinary URLs

### Medium Priority
- [ ] Add pSEO JSON-LD generators to `lib/jsonld.ts`
- [ ] Build admin API at `app/api/admin/pseo/route.ts`
- [ ] Add `EntityTagStrip.tsx` component (clickable entity badges)
- [ ] Add `TableOfContents.tsx` component (sticky sidebar with scroll-spy)
- [ ] Explore index page at `app/explore/page.tsx`

### Low Priority
- [ ] A/B test title patterns for CTR optimization
- [ ] Content quality scoring (automated word count + entity density check)
- [ ] Cross-circuit linking optimization
- [ ] Analytics integration for page performance tracking
- [ ] Scale to 500+ pages with expanded seed data

---

## 📊 Current Page Estimates

| Page Type | Formula | Count |
|-----------|---------|-------|
| Circuit Hub | 7 circuits | 7 |
| Destination Guide | 12 destinations | 12 |
| Intent Page | 10 intents × applicable targets | ~100+ |
| Comparison | 15 sensible pairs | 15 |
| Seasonal | 7 circuits × 3 seasons | 21 |
| FAQ Hub | 7 circuits | 7 |
| Nearby Places | destinations with 3+ nearby | ~5-10 |
| **Total (Phase 1)** | | **~170+** |

---

## 🗄️ Database Collections

### `pseo_seeds`
| seed_type | Count | Indexed By |
|-----------|-------|------------|
| circuit | 7 | seed_type + slug (unique) |
| destination | 12 | seed_type + slug (unique) |
| activity | 20 | seed_type + slug (unique) |
| intent_template | 10 | seed_type + slug (unique) |
| entity | 33 | seed_type + slug (unique) |

### `pseo_pages`
| Index | Fields | Purpose |
|-------|--------|---------|
| Primary | `slug` (unique) | Page lookup |
| Type filter | `page_type + status` | List by type |
| Keyword dedup | `seo.primary_keyword` | Avoid duplicate keywords |
| Intent dedup | `seo.target_intent` | Avoid duplicate intent targeting |
| Circuit silo | `circuit + page_type` | Circuit-scoped queries |
| Entity graph | `entity_tags.slug` | Find pages by entity |
| Chronological | `generated_at` (desc) | Latest pages |
| Similarity | `content_hash` | Detect duplicate content |
