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
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
