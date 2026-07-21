# PRD — Landing Page Header Improvements

| | |
|---|---|
| **Status** | Draft |
| **Author** | Gatherloop Team |
| **Last updated** | 2026-07-21 |
| **Parent doc** | [PRD.md](./PRD.md) — landing page (§ Hero / header) |
| **Related** | [PRD-i18n-language-switch.md](./PRD-i18n-language-switch.md) — all new copy must be bilingual |
| **Target platform** | Web (static site, Astro, deployed on GitHub Pages) |
| **Primary surface** | Landing page header (`src/components/Hero.astro`) on `/` and `/en/` |

---

## 1. Background

The landing page header (the "hero" section) is the first thing a visitor
sees. Today it is defined by `src/components/Hero.astro` and renders, top to
bottom:

1. A full-bleed hero image (`hero.webp`).
2. The Gatherloop logo (250px wide, centered).
3. An `<h1>` tagline.
4. A `<p>` sub-tagline.

Above it, the page separately renders a right-aligned language switch row
(`src/pages/index.astro`).

Two problems motivate this work:

### 1.1 No call to action

The header describes what Gatherloop is but gives the visitor **nothing to
do**. The single most valuable action — reserving a table — is buried: a
visitor has to scroll to the footer, find the Instagram/social links, or open
Google Maps and figure out how to contact the cafe. There is no direct
"reserve now" path from the first screen.

### 1.2 The header looks messy

The current layout has weak visual hierarchy and inconsistent structure:

- **Mixed layout widths.** The hero image is full-bleed (`100vw`, escapes the
  content column on ≥720px) while the logo, tagline, and subtitle sit in the
  narrow content column. The result reads as two unrelated blocks rather than
  one composed header.
- **Oversized, floating logo.** The 250px logo sits alone with `1.25rem` of
  top margin and no grouping, so it floats between the image and the text
  instead of anchoring them.
- **Loose, ad-hoc vertical rhythm.** Spacing between the image, logo, tagline,
  and subtitle uses one-off margins (`1.25rem`, `1rem`, `0.5rem`) with no
  shared scale, so the elements feel scattered rather than deliberately
  stacked.
- **Detached language switch.** The switch is a separate flex row in the page,
  visually disconnected from the header it sits above.
- **Dead CSS.** `.brand-name` is styled but never rendered, a small sign the
  component has drifted.

This PRD adds the missing reservation action and restructures the header into
a single, clean, clearly-hierarchical unit.

## 2. Goals

1. A prominent **"Reserve Table"** call-to-action button lives in the header,
   visible without scrolling, that opens a WhatsApp chat to the cafe's
   reservation number.
2. The header reads as **one cohesive, well-composed block** with clear
   hierarchy (image → brand → tagline → action) and consistent spacing.
3. The change is **bilingual** — the button label and any new copy exist in
   both `id` and `en` dictionaries (enforced by the existing typed-dictionary
   mechanism).
4. The header stays **fast and static** — no new runtime dependencies; the CTA
   is a plain `<a>` link that works without JavaScript.
5. Each change ships as a **small, independently reviewable PR** that leaves
   the deployed site working.

### Non-Goals (out of scope)

- A full reservation/booking **form or system** (date/time/party-size picker,
  availability). The CTA hands off to WhatsApp, which is how the cafe already
  takes bookings. A structured booking flow is future work (§8).
- A **sticky/floating** reserve button that follows the page on scroll. This
  PRD scopes the CTA to the header only; a persistent button can be a
  follow-up (§8).
- Changing the **hero image**, logo asset, or brand copy (tagline text).
- Redesigning any section **below** the header (Activities, Harga Main, Info
  Links, FAQ, Footer).
- Adding phone-call or email contact channels — WhatsApp only for now.

## 3. Target Users

- **Prospective visitors on mobile** (primary; 360px baseline, Instagram
  in-app browser included) who found Gatherloop via Instagram/Maps and want to
  book a table *right now* — they should see and tap "Reserve Table" within the
  first screen.
- **Returning locals** who just need the fastest path to WhatsApp the cafe.
- **Non-Indonesian visitors** on `/en/` — the button and its behavior must
  work identically in English.

## 4. The Reservation Action

### 4.1 Destination

| | |
|---|---|
| Reservation phone (display) | `0822-2150-4125` |
| International (E.164, no `+`) | `6282221504125` (Indonesia country code `62`, leading `0` dropped) |
| Link | `https://wa.me/6282221504125` |
| Prefilled message (optional) | e.g. "Halo Gatherloop, saya mau reservasi meja." (id) / "Hi Gatherloop, I'd like to reserve a table." (en), URL-encoded via `?text=` |

- The `wa.me` universal link opens the WhatsApp app on mobile and WhatsApp Web
  on desktop, with the cafe's number pre-selected — no digits for the visitor
  to copy.
- The link opens in a **new tab** (`target="_blank"` + `rel="noopener"`), so
  the visitor doesn't lose the landing page.
- The number and (optional) prefilled text live as a constant in
  `src/consts.ts` — a single source of truth, mirroring the existing
  `GOOGLE_MAPS_URL` / `SOCIAL_LINKS` pattern — so the number is never
  hardcoded inside a component.

### 4.2 Label & copy (bilingual)

| Key | Indonesian (`id`) | English (`en`) |
|---|---|---|
| `hero.reserveButton` | `Reservasi Meja` | `Reserve a Table` |
| `hero.reserveAriaLabel` | `Reservasi meja lewat WhatsApp` | `Reserve a table via WhatsApp` |

Exact wording is owner-confirmable (§8); the keys and mechanism are fixed. A
WhatsApp glyph (inline SVG, matching the Footer's icon approach) may prefix the
label to signal the channel.

## 5. Visual Redesign

Goal: turn the four loosely-stacked elements into **one composed header
block** with a deliberate hierarchy and shared spacing scale.

### 5.1 Structure & hierarchy

Top to bottom, grouped as a single `hero` unit:

1. **Hero image** — kept, but its full-bleed treatment is reconciled with the
   content column so image and content read as one block (e.g. constrain the
   image to the content max-width with consistent `border-radius`/shadow, or
   keep full-bleed but visually tie the content beneath it with matched
   horizontal rhythm). Decide during Phase 2; either way, no "two unrelated
   blocks" effect.
2. **Brand** — logo sized down to a balanced, non-floating scale and anchored
   directly under the image with tighter, intentional spacing.
3. **Tagline (`<h1>`) + sub-tagline** — unchanged copy, tightened vertical
   rhythm using a shared spacing scale rather than one-off margins.
4. **Primary CTA — "Reserve Table"** — a filled accent button (using
   `--color-accent` / `--color-accent-contrast`, `--radius-sm/lg`,
   `--shadow-card` from `global.css`), ≥44px tap target, centered, with clear
   separation from the subtitle above.

Optionally, a **secondary action** (ghost/outline style) such as "Lihat Lokasi"
→ Google Maps can sit beside the primary CTA. This is a nice-to-have; the
primary reserve button is the requirement.

### 5.2 Consistency & cleanup

- Replace one-off margins with a consistent spacing rhythm.
- Remove dead `.brand-name` CSS.
- Reuse existing design tokens (colors, radii, shadow) — introduce no new
  color values beyond what the token set already provides.
- Keep the language switch legible relative to the header; if it reads as
  detached, tuck it into the header's top rhythm (visual only — no change to
  its behavior, which the i18n PRD owns).

### 5.3 Mockup — landing header, mobile (target)

```
┌─────────────────────────────┐
│                  [ID | EN]  │
│ ╔═════════════════════════╗ │
│ ║      [ HERO IMAGE ]     ║ │
│ ╚═════════════════════════╝ │
│         (◎) Gatherloop      │   ← logo, tighter, anchored
│                             │
│   Main Board Game Bareng    │   ← h1 tagline
│   Keluarga, Teman, atau     │
│         Pasangan            │
│   Gatherloop adalah board   │   ← sub-tagline
│   game pertama di …         │
│                             │
│  ┌───────────────────────┐  │
│  │  💬  Reservasi Meja   │  │   ← primary CTA → WhatsApp
│  └───────────────────────┘  │
│  [ 📍 Lihat Lokasi ]        │   ← optional secondary (ghost)
└─────────────────────────────┘
```

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Tech | Pure Astro + CSS. No JS framework, no reservation library. CTA is a native `<a>`. |
| Performance | No new network requests on load; `wa.me` is a plain outbound link. Parent-PRD Lighthouse target (≥90 mobile) must hold. |
| Accessibility | CTA is a real link with an accessible name (`hero.reserveAriaLabel`); tap target ≥44px; visible focus state; sufficient contrast (accent on contrast token already meets AA). |
| i18n | Button label + aria copy added to **both** `id.ts` and `en.ts` and the `Dictionary` interface — a missing translation fails `astro build` (existing mechanism). |
| Responsive | Works cleanly from 360px up through the desktop breakpoints already used in `Hero.astro` (480px, 720px). |
| No-JS / crawlers | Button works and is indexable without JavaScript. |
| Single source of truth | Reservation number/link defined once in `consts.ts`; components import it. |
| Base path | Any internal secondary link (e.g. Maps) respects existing URL helpers; `wa.me` is absolute and unaffected. |

## 7. Implementation Phases

Each phase is one small, independently reviewable PR. Every PR leaves the
deployed site working and shippable. Phases land in order.

### Phase 1 — "Reserve Table" CTA button (functional)
**PR: `feat: add reserve table whatsapp CTA to landing header`**
- Add a reservation constant to `src/consts.ts` (e.g. `WHATSAPP_RESERVATION`
  = `https://wa.me/6282221504125`, plus an optional prefilled-message helper),
  documented with the display number in a comment.
- Add `hero.reserveButton` + `hero.reserveAriaLabel` to the `Dictionary`
  interface and to both `id.ts` and `en.ts` (§4.2).
- Render the CTA in `Hero.astro` as an `<a href={WHATSAPP_RESERVATION}>` with
  `target="_blank" rel="noopener"`, accessible label, and a minimal accent
  button style reusing existing tokens.
- **Done when:** the button appears in the header on both `/` and `/en/`;
  clicking it opens a WhatsApp chat to `0822-2150-4125`; the label is correct
  per locale; `astro build` passes (and would fail if either translation were
  missing).

### Phase 2 — Header visual redesign (polish)
**PR: `refactor: restructure and polish landing header layout`**
- Restructure `Hero.astro` into a single composed block per §5.1: reconcile
  the image width with the content column, resize/anchor the logo, and apply a
  consistent spacing scale to image → brand → tagline → CTA.
- Promote the Phase 1 CTA to the primary styled button; optionally add the
  ghost secondary "Lihat Lokasi" → `GOOGLE_MAPS_URL` action.
- Remove dead `.brand-name` CSS and any other drift.
- Verify responsive behavior at 360 / 480 / 720px and focus/hover states.
- **Done when:** the header reads as one clean, hierarchical unit on both
  locales at all breakpoints; no visual "two-block" split; the reserve CTA is
  prominent; copy is unchanged from Phase 1.

> Phases are split so the **actionable outcome (the reserve button) ships
> first and small**, and the purely visual refactor is reviewed on its own
> without functional risk. Phase 2 can be skipped or deferred without losing
> the reservation feature.

## 8. Open Questions (owner input needed)

1. **Button copy** — confirm `Reservasi Meja` / `Reserve a Table` (vs.
   alternatives like `Pesan Tempat` / `Book a Table`).
2. **Prefilled WhatsApp message** — include a default reservation message, or
   open an empty chat? If included, confirm the id/en wording.
3. **Secondary action** — do we want the optional ghost "Lihat Lokasi" button
   beside the primary CTA, or keep the header to a single action?
4. **Reservation number** — confirm `0822-2150-4125` is the correct, monitored
   WhatsApp line for bookings.

## 9. Future Enhancements (post-launch backlog)

- A **sticky/floating** reserve button that stays reachable while scrolling.
- A structured **reservation form** (date, time, party size) that composes a
  richer prefilled WhatsApp message — or a real booking backend.
- Additional contact channels (call, Instagram DM) grouped in the header.
- Reusing the CTA component on the `/games` and `/menu` subpages.
