# PRD — Game Collection Filter (`/games`)

| | |
|---|---|
| **Status** | Draft |
| **Author** | Gatherloop Team |
| **Last updated** | 2026-07-14 |
| **Parent doc** | [PRD.md](./PRD.md) — §5.2 Game Collection Page, §11 Future Enhancements |
| **Target platform** | Web (static site, deployed on GitHub Pages) |
| **Language** | Bahasa Indonesia (all customer-facing content) |

---

## 1. Background

The Koleksi Game page (`/games`) currently renders the full game collection as a
static grid with no way to narrow it down. The v1 PRD explicitly deferred
search/filter (§5.2: *"v1 has no search/filter/sort"*) because the collection was
small. As the collection grows toward "ratusan pilihan game", visitors can no longer
scan the list to answer their real questions:

- *"Kami berlima, game apa yang bisa dimainkan 5 orang?"*
- *"Ada game strategi yang durasinya di bawah satu jam?"*
- *"Game apa yang cocok untuk anak 8 tahun / main bareng keluarga?"*
- *"Game X ada di rak mana?"* — customers at the cafe (and staff) want to locate the
  physical box quickly.

This feature adds client-side filtering to `/games` by **title**, **tags**,
**number of players**, **duration**, **age**, and **location (shelf name)**.

## 2. Goals

1. Let visitors narrow the collection to games that fit their group (size, age,
   available time) and taste (tags) in a few taps.
2. Help in-cafe customers and staff find the physical box via the shelf name.
3. Keep the page static and fast: all filtering happens client-side over
   build-time-rendered cards; no backend, no framework.
4. Keep content maintenance simple: tags and shelf name are just new fields in
   `src/data/games.json`.

### Non-Goals (out of scope)

- Sorting (by name, duration, etc.) — can be layered on later.
- Full-text search across descriptions (games have no descriptions yet).
- Game detail pages, availability/borrowed status, favorites.
- Server-side or search-engine-indexed filter result pages (filters are a
  client-side view of one static page).
- An admin UI for editing tags — editing JSON remains the workflow.

## 3. Target Users

- **Pre-visit planners (mobile)**: deciding whether Gatherloop has games for their
  group before coming. Primary flow: set player count + duration + tag.
- **In-cafe customers**: standing at the shelves, phone in hand, looking for where a
  game is or what else is on a shelf. Primary flow: title search or shelf filter.
- **Staff**: quickly answering "game untuk 6 orang yang gampang diajarin" — same UI.

Primary device remains **smartphone** (360px baseline); the filter UI must be
one-hand usable.

## 4. Data Model Changes

Extend the `Game` schema (`src/types.ts` and `src/data/games.json`) with two fields:

```jsonc
// src/data/games.json — schema (additions marked NEW)
[
  {
    "title": "Splendor",
    "image": "/images/games/splendor.jpg",
    "minDurationMinutes": 30,
    "maxDurationMinutes": 60,
    "minPlayers": 2,
    "maxPlayers": 4,
    "minAge": 10,
    "tags": ["adu strategi"],      // NEW — 1..n tags, lowercase Indonesian
    "shelfName": "Rak A"           // NEW — physical shelf label
  }
]
```

- **`tags`** — required, non-empty array of strings. The tag vocabulary is free-form
  but curated by convention (see §4.1); the filter UI derives the chip list from the
  data at build time, so a typo in JSON produces a visible stray chip — easy to spot,
  no code change needed to add a tag.
- **`shelfName`** — required string matching the physical label on the shelf
  (e.g. `"Rak A"`). The shelf dropdown is likewise derived from the data at build
  time.

### 4.1 Initial tag vocabulary (draft, to be confirmed by owner)

| Tag | Meaning |
|---|---|
| `adu cepat` | Speed/reflex games (e.g. Uno, Jenga) |
| `adu ketelitian` | Precision/observation games (e.g. Jenga, Codenames) |
| `adu strategi` | Strategy games (e.g. Splendor, Catan, Monopoli) |
| `game keluarga` | Family-friendly (e.g. Uno, Monopoli, Dixit) |
| `party game` | Big-group social games (e.g. Werewolf, Codenames) |
| `kerja sama tim` | Team/co-op play (e.g. Codenames) |

Rules: tags are lowercase, Indonesian, and reused rather than invented — check the
existing set before adding a new one. A game should have 1–3 tags.

## 5. Functional Requirements

### 5.1 Filter controls

A filter panel appears between the page title and the game grid. Controls, in order:

| # | Filter | Control | Matching rule |
|---|---|---|---|
| 1 | **Judul** | Text input, placeholder *"Cari judul game…"* | Case-insensitive substring match on `title`. Applied as the user types (debounced ~150ms). |
| 2 | **Tag** | Multi-select chips (one chip per tag found in the data) | Game matches if it has **at least one** selected tag (OR within tags). |
| 3 | **Jumlah pemain** | Number input (or stepper), label *"Jumlah pemain"* | Game matches if `minPlayers ≤ n ≤ maxPlayers`. Empty = no constraint. |
| 4 | **Durasi** | Single-select chips: *≤ 30 menit* / *30–60 menit* / *> 60 menit* | Game matches if its `[minDuration, maxDuration]` range **overlaps** the selected bucket. |
| 5 | **Usia** | Number input, label *"Usia pemain termuda"* | Game matches if `minAge ≤ n`. Empty = no constraint. |
| 6 | **Lokasi rak** | `<select>` dropdown: *Semua rak* + one option per distinct `shelfName` | Exact match on `shelfName`. |

Cross-filter combination is **AND**: a game must satisfy every active filter.
All filters are optional; the default state (nothing set) shows the full collection.

### 5.2 Results behavior

- Filtering toggles card visibility on the already-rendered grid (cards are all
  rendered at build time; no client-side templating). No page reload, no layout jump
  beyond the grid reflow.
- A **result count** line above the grid: *"Menampilkan 12 dari 48 game"*. With no
  active filter it reads *"48 game"*.
- **Empty state** when nothing matches: *"Tidak ada game yang cocok dengan filternya.
  Coba ubah atau reset filternya ya."* plus the reset button.
- A **"Reset filter"** button clears all controls; it is only visible when at least
  one filter is active.
- Game cards additionally display their **tags** (small badges) and **shelf name**
  (e.g. `📍 Rak A`) so the filtered result is self-explanatory.

### 5.3 Shareable filter state (URL sync)

- Active filters are reflected in the URL query string
  (e.g. `/games?tag=adu+strategi&pemain=5&durasi=30-60`), replacing history state
  (no back-button spam — one history entry per visit).
- On page load, filters initialize from the query string, so a filtered view can be
  shared via WhatsApp ("ini list game buat 6 orang") or linked from Instagram.
- Unknown/invalid parameter values are ignored silently.

### 5.4 Progressive enhancement / no-JS fallback

- The full game grid is rendered at build time and visible without JavaScript —
  identical to today's behavior.
- The filter panel is rendered with the `hidden` attribute and revealed by the
  script on load, so a no-JS visitor never sees dead controls.

### 5.5 Mobile layout

- On mobile the filter panel is collapsed by default inside a
  `<details>`-style disclosure labeled **"Filter"** (with an active-filter count
  badge, e.g. *"Filter (2)"*), keeping the game list above the fold.
- Title search stays visible outside the disclosure — it is the most-used control.
- On ≥768px viewports the panel is expanded by default.

### 5.6 Mockup — mobile

```
┌─────────────────────────────┐
│ ‹ Kembali                   │
│      Koleksi Game           │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔍 Cari judul game…     │ │
│ └─────────────────────────┘ │
│ ▸ Filter (2)         Reset  │
│ ┈┈┈ (expanded) ┈┈┈┈┈┈┈┈┈┈┈┈ │
│  Tag:                       │
│  (adu cepat) (adu strategi)*│
│  (game keluarga)* (party…)  │
│  Jumlah pemain: [ 5 ]       │
│  Durasi:                    │
│  (≤30) (30–60)* (>60) menit │
│  Usia pemain termuda: [   ] │
│  Lokasi rak: [Semua rak ▾]  │
│ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ │
│  Menampilkan 3 dari 48 game │
│                             │
│ ┌─────────────────────────┐ │
│ │ ┌───────┐ Splendor      │ │
│ │ │ box   │ ⏱ 30–60 menit │ │
│ │ │ art   │ 👥 2–4 pemain │ │
│ │ └───────┘ 🎂 10+  📍Rak A│ │
│ │ [adu strategi]          │ │
│ └─────────────────────────┘ │
│           ...               │
└─────────────────────────────┘
```
`*` = selected chip (filled with accent color).

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Tech | Vanilla JS in a single `<script>` on `/games` only — no framework, no new dependencies. Filter metadata carried on each card as `data-*` attributes rendered at build time. |
| Performance | Filtering a few hundred pre-rendered cards must feel instant (<16ms per keystroke after debounce); no network requests during filtering. Landing and menu pages ship zero additional JS. |
| Accessibility | All controls are native elements with visible `<label>`s; chips are toggle buttons with `aria-pressed`; result count updates announced via `aria-live="polite"`; empty state readable by screen readers; tap targets ≥44px. |
| Responsiveness | Mobile-first per §5.5; filter panel never causes horizontal scroll at 360px. |
| Base path | URL sync and all links respect the configured Astro `base` (per parent PRD §6). |
| Data integrity | `Game` type updated so a JSON entry missing `tags`/`shelfName` fails `astro build` (type error), keeping content editors honest. |
| Browser support | Evergreen browsers + Android WebView (Instagram in-app browser) — no syntax/APIs beyond what these support. |

## 7. Implementation Phases

Each phase is one small, independently reviewable PR. Every PR leaves the deployed
site working and shippable — filters appear incrementally. Phases must land in
order (each builds on the previous), except Phases 3 and 4 which are independent
of each other and can be parallelized after Phase 2.

### Phase 1 — Data model: tags & shelf name
**PR: `feat: add tags and shelf name to game data`**
- Add `tags: string[]` and `shelfName: string` to the `Game` interface in `src/types.ts`.
- Backfill both fields for every game in `src/data/games.json` using the draft
  vocabulary in §4.1 (placeholder shelf names until the owner confirms — see §8).
- Show tags (badges) and shelf name on `GameCard.astro` per §5.2.
- No filter UI yet.
- **Done when:** every card displays its tags and shelf; `astro build` fails if a
  game entry omits either field.

### Phase 2 — Filter infrastructure & title search
**PR: `feat: client-side title search on games page`**
- Render filter metadata as `data-*` attributes on each card (title, tags, players,
  duration, age, shelf) — the single mechanism all later filters reuse.
- Filter panel skeleton (hidden until JS loads, §5.4) containing only the title
  search input; debounced case-insensitive matching toggles card visibility.
- Result count line with `aria-live`, empty state, and "Reset filter" button (§5.2)
  — built once here, reused by every later phase.
- **Done when:** typing narrows the grid instantly; clearing restores all cards;
  page without JS looks like today.

### Phase 3 — Tag & shelf filters
**PR: `feat: tag chips and shelf filter on games page`**
- Tag chip row (multi-select, OR semantics) derived from distinct tags in the data
  at build time; `aria-pressed` toggle buttons.
- Shelf `<select>` derived from distinct `shelfName` values, with "Semua rak" default.
- Both combine (AND) with title search via the Phase-2 mechanism.
- **Done when:** chips + shelf + title compose correctly; reset clears all three.

### Phase 4 — Player count, duration & age filters
**PR: `feat: player count, duration, and age filters on games page`**
- "Jumlah pemain" number input (range containment rule, §5.1 #3).
- Duration single-select bucket chips with range-overlap matching (§5.1 #4).
- "Usia pemain termuda" number input (§5.1 #5).
- All combine (AND) with previously shipped filters.
- **Done when:** all six filters compose correctly per §5.1's matching rules.

### Phase 5 — Mobile disclosure, URL sync & polish
**PR: `feat: collapsible filter panel and shareable filter URLs`**
- Mobile collapsed disclosure with active-filter count badge; expanded by default
  on ≥768px; title search kept outside the disclosure (§5.5).
- Read filters from the query string on load; write them back via
  `history.replaceState` on change (§5.3), respecting the Astro `base` path.
- Accessibility pass (§6): labels, focus states, tap targets, aria-live behavior;
  verify no horizontal scroll at 360px and inside the Instagram in-app browser.
- **Done when:** a filtered URL shared via WhatsApp reopens with the same filters
  applied, and the panel behaves per §5.5 on mobile and desktop.

## 8. Open Questions (owner input needed)

1. **Real shelf names/labels** — what is physically written on the shelves
   ("Rak A", "Rak Strategi", …)? Phase 1 ships placeholders.
2. **Final tag vocabulary** — confirm/extend the draft list in §4.1 and the tag
   assignment for the current collection.
3. Should staff-facing info (e.g. shelf) be visually de-emphasized for customers, or
   is showing it on every card fine? (Assumed fine — it also helps customers.)

## 9. Future Enhancements (post-launch backlog)

- Sorting (A–Z, shortest duration first).
- "Cocok untuk berapa pun" quick presets (e.g. "Berdua", "Ramean 6+").
- Game detail page (description, rules video link) reachable from a card.
- Availability status (game sedang dipinjam/dimainkan).
