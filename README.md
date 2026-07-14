# Gatherloop

Landing page for Gatherloop, a board game cafe in Kraksaan, Probolinggo. See
[`docs/PRD.md`](docs/PRD.md) for the full product requirements.

## Tech stack

Static site built with [Astro](https://astro.build/) and deployed to GitHub
Pages.

## Local development

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:4321/gatherloop/` (the `/gatherloop`
base path matches the GitHub Pages deployment).

## Other commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Deployment

Pushes to `main` are built and deployed to GitHub Pages automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). GitHub Pages
must be enabled once in the repo settings with source **GitHub Actions**.

## Launch checklist

Tracking PRD §9 Phase 8 ("Content & launch polish").

Done:

- [x] `sitemap.xml` generated at build time (`@astrojs/sitemap`)
- [x] `robots.txt` pointing at the sitemap
- [x] Open Graph + Twitter Card meta tags, with a real 1200×630 preview image
      (`public/images/og-image.png`) so links unfurl correctly on
      WhatsApp/Instagram
- [x] GitHub Pages deploy workflow (was missing since Phase 1 — added here)
- [x] Lighthouse mobile: 100 Performance / 100 Accessibility / 100 Best
      Practices / 100 SEO (local `astro preview` run)

Still needs owner input before real launch (see PRD §10 — placeholders remain
in `src/consts.ts`, page images, and `src/data/faq.json` until these are
confirmed):

- [ ] Real hero photo and Harga Main poster image
- [ ] Real menu image(s)
- [ ] Final Google Maps pin URL
- [ ] Real Instagram/WhatsApp/TikTok links
- [ ] Final tagline wording and FAQ copy
- [ ] Decision: custom domain vs. default `github.io` URL (CNAME setup)
- [ ] Decision: show operating hours on the page, or keep pointing to
      Instagram

Once the owner supplies the items above, swap the placeholders directly (no
code changes needed beyond editing `src/consts.ts`, replacing files under
`public/images/`, and editing `src/data/faq.json`) and re-run the Lighthouse
check.
