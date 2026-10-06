# ARC OS v2.0 — Sheraz Maqsood Portfolio

Personal portfolio for **Malik Sheraz Maqsood Ahmed** — Principal Full-Stack & GIS Engineer.  
Hosted at [sheraz.is-a.dev](https://sheraz.is-a.dev).

## Structure

- `index.html` — main portfolio homepage
- `project.html` — data-driven project detail page (dossier)
- `404.html` — custom "Signal Lost" page
- `assets/css/styles.css` — complete design system (ARC HUD theme)
- `assets/js/main.js` — boot sequence, WebGL, interactions, easter eggs
- `assets/js/components.js` — shared header/nav (single source of truth)
- `assets/js/project.js` — project data + dossier rendering engine
- `assets/sheraz/` — profile photos, field ops images
- `assets/projects/` — per-project screenshots, videos, PDF documents

## Tech

Vanilla HTML/CSS/JS — no frameworks. Three.js (WebGL background). Anime.js (scroll reveals).

## Publishing

Run `npm ci` once, then `npm run build` after changing CSS or JavaScript. Edit the
readable files in `assets/css/` and `assets/js/`, not their generated `.min` siblings.
The build regenerates minified assets and updates all three HTML pages with
content-based cache keys. Commit the generated files and updated HTML along with
the sources so GitHub Pages serves the latest version. No runtime server is needed.

Push `main` branch to `sheraz-maqsood.github.io` — GitHub Pages serves from root.
