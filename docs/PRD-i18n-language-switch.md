# PRD — Indonesian / English Language Switch (i18n)

| | |
|---|---|
| **Status** | Draft |
| **Author** | Gatherloop Team |
| **Last updated** | 2026-07-16 |
| **Parent doc** | [PRD.md](./PRD.md) — §2 Non-Goals ("Multi-language support") is hereby superseded |
| **Target platform** | Web (static site, deployed on GitHub Pages) |
| **Languages** | Bahasa Indonesia (default) + English |

---

## 1. Background

The site is currently Indonesian-only (`lang="id"`, all copy hardcoded in
components and data files). The v1 PRD explicitly deferred multi-language
support. Two things changed:

1. Gatherloop gets visitors from outside Indonesia — tourists and expats in
   East Java who find the cafe via Google Maps — and they currently land on a
   page they cannot read.
2. The site is shared internationally (board game community links,
   Instagram), where an English version makes the cafe accessible.

This feature adds an **English version of every page** and a **visible
language switch**, with the site **defaulting to English when opened from
outside Indonesia** and to Indonesian otherwise.

### 1.1 Constraint: no server, no IP geolocation

The site is static (GitHub Pages) — there is no server to read the visitor's
IP or `Accept-Language` header. "Opened outside Indonesia" is therefore
**approximated client-side** using signals the browser already exposes:

1. **Browser language** (`navigator.languages`): any entry starting with
   `id` → Indonesian.
2. **Timezone** (`Intl.DateTimeFormat().resolvedOptions().timeZone`): one of
   `Asia/Jakarta`, `Asia/Pontianak`, `Asia/Makassar`, `Asia/Jayapura` →
   Indonesian (covers Indonesian devices set to English).
3. Otherwise → English.

*Alternative considered and rejected:* a free IP-geolocation API (e.g.
ipapi.co). Adds an external runtime dependency, a privacy concern, latency
before the page can settle on a language, and rate limits — while browser
language + timezone already answer the actual question ("can this visitor
read Indonesian?") more directly than geography does.

## 2. Goals

1. Every page (`/`, `/games`, `/menu`) is available in full English.
2. Visitors outside Indonesia (per §1.1 heuristic) get English by default,
   without any interaction; visitors in Indonesia keep seeing Indonesian.
3. A visible ID/EN switch on every page lets anyone override the default;
   the choice is remembered across visits.
4. Both language versions are static, crawlable, and correctly annotated for
   SEO (`hreflang`, `og:locale`, sitemap) — no client-side translation.
5. Content maintenance stays simple: all UI copy lives in per-language
   dictionary files; adding a string means adding it to both dictionaries.

### Non-Goals (out of scope)

- Translating **images** (harga main poster, menu images) — they remain
  Indonesian; English pages show the same images. Producing English image
  variants is an owner/content task that can slot in later with no code
  change (see §9).
- Translating **game titles** (they are proper names) or the underlying
  data values in `games.json` (tags get display-label translations, not data
  changes — see §5.4).
- Languages beyond Indonesian and English.
- Machine/auto-translation at build or runtime.
- Region-specific content differences (prices, menu) — only the language
  changes.

## 3. Target Users

- **Non-Indonesian visitors** (tourists/expats via Google Maps or shared
  links): must be able to read price info, FAQ, and game collection without
  hunting for a language toggle.
- **Indonesian majority** (80%+ of traffic, mobile): must notice **no
  change** — same URLs, same content, no redirect flicker.
- **Mixed groups / Indonesian devices set to English**: the timezone signal
  keeps them on Indonesian; the switch lets them opt into English.

Primary device remains **smartphone** (360px baseline, Instagram in-app
browser included).

## 4. URL Structure & Routing

Path-prefix strategy using Astro's built-in i18n routing:

| Indonesian (default) | English |
|---|---|
| `/` | `/en/` |
| `/games` | `/en/games` |
| `/menu` | `/en/menu` |

- Indonesian keeps its **current unprefixed URLs** (`prefixDefaultLocale:
  false`) — no existing link, QR code, or Google index entry breaks.
- English lives under `/en/` — both versions are real prebuilt pages, so
  they work without JavaScript and are independently indexable/shareable.
- All URL handling goes through a locale-aware helper built on the existing
  `withBase` (`src/utils/url.ts`), so GitHub Pages base-path behavior (parent
  PRD §6) is preserved.
- `/games` query-string filters (`?tag=…&pemain=…`) keep their existing
  Indonesian parameter names **in both languages** — they are a shared API
  surface for already-shared links, not visible UI copy.

## 5. Functional Requirements

### 5.1 Translation dictionaries

- New module `src/i18n/`:
  - `Locale` type: `"id" | "en"`; constants for default locale and locale list.
  - `id.ts` and `en.ts` dictionaries with an identical, typed key set — a
    missing key in either language is a **build-time type error**.
  - `t(locale)` accessor used by all components; components never hardcode
    user-facing copy after migration.
- Localizable **data** (FAQ) moves from flat Indonesian JSON to a per-language
  shape (e.g. `{ "id": [...], "en": [...] }` in `src/data/faq.json`), typed so
  both languages are required.
- `src/consts.ts` strings that are copy (`SITE_TITLE`, `SITE_DESCRIPTION`)
  become per-locale; identity/data constants (`SITE_NAME`, `ADDRESS`, URLs)
  stay as-is.
- `src/utils/format.ts` (`menit`/`pemain`) becomes locale-aware
  (`min`/`players` in English).

### 5.2 Language switch UI

- A compact, always-visible toggle — two options **ID | EN** — placed at the
  top of every page (above the hero on `/`, next to the back link on
  subpages) and repeated in the footer.
- Switching navigates to the **same page** in the other language
  (`/games` ↔ `/en/games`), preserving the query string on `/games` so active
  filters survive the switch.
- The switch is plain `<a>` links (works without JS); a small script
  additionally records the choice (§5.3) on click.
- Current language is visually marked (`aria-current="true"`); tap target
  ≥44px; labeled for screen readers ("Ganti bahasa" / "Change language").

### 5.3 Default-language detection & persistence

Decision order on page load (inline `<head>` script, runs before paint):

1. **Saved preference** (`localStorage["gatherloop-lang"]`) — set whenever the
   user uses the switch. Always wins.
2. **Explicit URL** — a visitor who opens an `/en/…` link stays on English
   (and vice versa); a shared link is an explicit choice, never redirected.
3. **First visit on a default-locale (Indonesian) URL with no saved
   preference** — apply the §1.1 heuristic; if it resolves to English,
   `location.replace()` to the `/en/` equivalent of the current path
   (query string preserved).

Rules:

- Redirect uses `location.replace()` — no extra history entry, back button
  stays sane.
- The heuristic can only redirect **id → en** on first visit; it never
  redirects away from `/en/` (rule 2 covers that direction), so a loop is
  impossible.
- The detection script is tiny (<500 bytes), inlined in `<head>` before CSS
  so a redirected visitor never sees an Indonesian flash.
- No-JS visitors and crawlers simply get the page they requested; `hreflang`
  annotations (§5.5) tell search engines about the alternative, so no
  cloaking/SEO penalty.
- The saved preference is a single locale string in `localStorage` — no
  cookies, no consent banner needed.

### 5.4 Page-by-page content scope

| Surface | Indonesian source today | English treatment |
|---|---|---|
| Layout meta (title, description, OG) | `consts.ts` | Translated per locale; `lang` and `og:locale` follow the page locale (`id` / `id_ID`, `en` / `en_US`) |
| Hero tagline | `Hero.astro` | Translated |
| Harga Main section | `HargaMain.astro` + poster image | Heading/alt translated ("Play Rates"); **image stays Indonesian** with an English caption line "Prices shown in the poster apply to everyone." (exact copy TBD, §8) |
| Info links + address | `InfoLinks.astro` | Labels translated; address unchanged (proper noun) |
| FAQ | `faq.json` | Fully translated Q&A (draft by team, confirmed by owner, §8) |
| Footer | `Footer.astro` | Translated |
| Games page + cards | `games.astro`, `GameCard.astro`, `format.ts` | Translated (title, back link, `menit`→`min`, `pemain`→`players`) |
| Game filters | `GameFilters.astro` | All labels, placeholders, result count, empty state translated |
| Game **tags** | `games.json` (`adu strategi`, …) | Data values unchanged; a tag→label map in the dictionaries renders English chip labels (`adu strategi` → "strategy"). URLs keep the canonical Indonesian tag values in both languages (§4) |
| Menu page | `menu.astro` + menu images | Title/alt translated; **images stay Indonesian** (see Non-Goals) |
| Back link | `BackLink.astro` | "Kembali" → "Back" |

### 5.5 SEO

- Every page emits `hreflang` alternates for `id`, `en`, and `x-default`
  (`x-default` → Indonesian, the site's home market default).
- `og:locale` per page + `og:locale:alternate`.
- Sitemap includes both language versions (`@astrojs/sitemap` i18n support).
- Canonical URL is each page's own URL (no cross-language canonicals).

### 5.6 Mockup — landing page top, mobile

```
┌─────────────────────────────┐
│                  [ID | EN]  │   ← switch, top-right
│ ╔═════════════════════════╗ │
│ ║      [ HERO IMAGE ]     ║ │
│ ╚═════════════════════════╝ │
│         (o) Gatherloop      │
│                             │
│   A Fun Hangout Spot for    │   ← /en/ shown
│   Playing Board Games       │
│   Hundreds of games, great  │
│   coffee, and new friends…  │
│  ── Play Rates ───────────  │
│           ...               │
│ ┌─────────────────────────┐ │
│ │ 🎲  Game Collection   › │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

Subpages: `‹ Back        [ID | EN]` on one row above the page title.

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Tech | Astro built-in i18n routing (no i18n library, no framework). Detection script is inline vanilla JS, <500 bytes, zero dependencies. |
| Performance | Both language versions fully prerendered; the only new JS is the detection snippet and the switch's preference-saving handler. Lighthouse targets from parent PRD (≥90 mobile) hold for `/en/` pages. |
| No flash / no loop | Redirect (if any) fires before first paint; redirect is one-directional (id→en, first visit only) making loops structurally impossible. |
| Type safety | Dictionary key parity and FAQ locale completeness enforced by TypeScript at build time — an untranslated string fails `astro build`. |
| Accessibility | Switch is native links with `aria-current` and accessible name; `<html lang>` correct per page so screen readers pick the right voice. |
| Base path | All locale-aware URLs respect the Astro `base` (parent PRD §6), including the redirect target computation. |
| Browser support | Evergreen + Android WebView (Instagram in-app). `Intl.DateTimeFormat().resolvedOptions().timeZone` is supported there; if unavailable, detection degrades to browser-language only. `localStorage` access wrapped in try/catch (private mode). |
| Analytics-free | No tracking added; preference stored locally only. |

## 7. Implementation Phases

Each phase is one small, independently reviewable PR. Every PR leaves the
deployed site working and shippable. Phases must land in order (each builds
on the previous), except Phases 3 and 4, which are independent of each other
and can be parallelized after Phase 2.

### Phase 1 — i18n foundation (no visible change)
**PR: `feat: i18n foundation with typed translation dictionaries`**
- Enable Astro i18n routing: `defaultLocale: "id"`, `locales: ["id", "en"]`,
  `prefixDefaultLocale: false`.
- Create `src/i18n/` with the `Locale` type, `id.ts` + `en.ts` dictionaries
  (typed key parity per §5.1), and the `t(locale)` helper.
- Locale-aware URL helper (`localizePath(locale, path)`) on top of `withBase`.
- `Layout.astro` accepts a `locale` prop driving `<html lang>`, `og:locale`,
  and per-locale title/description from restructured `consts.ts`.
- Migrate **`format.ts` and `BackLink.astro`** to the dictionary as the
  proof-of-mechanism (Indonesian output unchanged).
- **Done when:** `astro build` output is byte-equivalent for visitors
  (Indonesian everywhere, same URLs); removing a dictionary key from one
  language fails the build.

### Phase 2 — English landing page
**PR: `feat: english landing page at /en`**
- Extract all landing copy (Hero, HargaMain, InfoLinks, Faq, Footer) into the
  dictionaries; restructure `faq.json` to the per-language shape (§5.1) with
  draft English translations.
- Add `/en/index.astro` rendering the same components with `locale="en"`;
  internal links on it point at `/en/…` targets (games/menu may 404 until
  Phases 3–4 land — acceptable, mirrors parent PRD Phase 4 precedent).
- Harga Main caption line for English (§5.4).
- **Done when:** `/en/` renders the fully English landing page; `/` is
  unchanged; both build statically.

### Phase 3 — English games page
**PR: `feat: english games page at /en/games`**
- Extract `games.astro`, `GameCard.astro`, and all `GameFilters.astro` UI
  strings (labels, placeholders, chips, result count, empty state) into the
  dictionaries; add the tag→English-label map (§5.4).
- Add `/en/games` reusing the same components/data with `locale="en"`;
  filter query parameters stay canonical (§4).
- **Done when:** `/en/games` filters work identically to `/games` with fully
  English UI; a filtered URL works in both languages.

### Phase 4 — English menu page
**PR: `feat: english menu page at /en/menu`**
- Extract `menu.astro` strings; add `/en/menu` (Indonesian menu images, per
  Non-Goals).
- **Done when:** `/en/menu` renders with English title/alt text and back link.

### Phase 5 — Language switch UI
**PR: `feat: language switch on all pages`**
- `LanguageSwitch.astro` component per §5.2: ID | EN links to the equivalent
  page in the other locale, query string preserved on `/games`,
  `aria-current` on the active language.
- Placed on all six pages (landing top-right, subpage header row, footer).
- Click handler saves the choice to `localStorage` (§5.3 rule 1 data source;
  detection itself comes in Phase 6).
- **Done when:** every page can round-trip id↔en to the equivalent page,
  filters intact, ≥44px tap targets at 360px.

### Phase 6 — Auto-detection, persistence & SEO polish
**PR: `feat: default to english outside indonesia + hreflang`**
- Inline `<head>` detection script implementing the §5.3 decision order and
  the §1.1 language/timezone heuristic, with `location.replace()`, base-path
  awareness, and try/catch around `localStorage`.
- `hreflang` alternates (+ `x-default`), `og:locale:alternate`, and
  dual-language sitemap entries (§5.5).
- Verification pass: no redirect flash on a throttled connection; no loop
  with storage disabled; Instagram in-app browser; Lighthouse ≥90 on `/en/`.
- **Done when:** a browser with English language + non-Indonesian timezone
  opening `/` lands on `/en/` before first paint; an Indonesian device sees
  no redirect; the choice made via the switch sticks across visits.

## 8. Open Questions (owner input needed)

1. **English copy review** — tagline, FAQ answers, and Harga Main caption
   will ship as team drafts; owner should review tone (casual, matching the
   Indonesian "nongkrong" voice).
2. **Tag display labels** — confirm the English label per tag
   (e.g. `adu cepat` → "speed", `kerja sama tim` → "co-op").
3. **English image variants** — are English versions of the harga main
   poster and menu planned? (Not blocking; slots already exist — replacing
   files per locale can be a follow-up.)
4. **`x-default`** — PRD proposes Indonesian (home market). Confirm, or
   switch to English if international discoverability matters more.

## 9. Future Enhancements (post-launch backlog)

- Per-locale images (English harga main poster / menu) once produced.
- English game tag values surfaced in shareable URLs (`?tag=strategy`)
  with bidirectional aliasing.
- Additional locales if warranted (the dictionary structure generalizes).
- A one-time dismissible banner ("View this page in English?") as a softer
  alternative to auto-redirect, if redirect behavior confuses users.
