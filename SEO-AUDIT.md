# SEO Audit — sheraz.is-a.dev

**Date:** 2026-07-20 · **Mode:** Single-property audit (10 sitemap URLs) · **Site type:** Personal portfolio / ProfilePage

> **Tooling note.** The Bright Data CLI (`bdata`) was not installed and the sandbox has no
> outbound network to install it, so no `bdata scrape` / `bdata search` commands were run.
> Every finding below is instead evidenced by (a) direct source inspection of the repo and
> (b) live `web_fetch` responses against the production URLs. Where a check genuinely could
> not be performed, it is listed in **Out-of-Scope Notes** rather than guessed at.

---

## Executive summary

The site is not ranking for a combination of one severe technical defect and one structural
reality:

1. **9 of your 10 sitemap URLs served a blank page.** `project.html` was missing its entire
   `<main>` block. `project.js` called `$("#p-title").innerHTML = …` against a `null`, which
   threw a `TypeError` and aborted the whole script — so every project dossier rendered as
   three empty section labels and nothing else. Google was crawling 9 near-empty, mutually
   identical documents.
2. **Those 9 URLs were also indistinguishable from each other.** No `canonical`, one shared
   `<title>`, one shared `<meta description>`. Even had they rendered, Google would have
   folded them into a single result.
3. **The domain is new with effectively no authority**, and the head term you're implicitly
   targeting — your own name — is contested by several established developer sites
   (`sheraz.dev`, `sherazali.site`, `sharoz.dev`). A `site:` query returned no
   `sheraz.is-a.dev` results at all, consistent with the property never having been
   submitted to Search Console.

Items 1 and 2 are fixed in this changeset. Item 3 needs actions only you can take
(Search Console verification, sitemap submission, backlinks) — see **Your next steps**.

---

## Findings

### F-01 · Every project dossier page rendered blank — CRITICAL

**Issue.** `project.html` was truncated: `<main id="main">`, the hero `<section>` and the
overview panel were all absent. The remaining markup was structurally invalid
(`</main>` with no opener; one unclosed `<section>` and `<div>` deficit).

**Impact.** All 9 project URLs — 90% of your sitemap — delivered no indexable content, and
the "Skip to content" link pointed at a `#main` anchor that did not exist. `project.js`
aborted at its first DOM write, so the video player, screenshot gallery, PDF viewer, stack
tags and highlights never built.

**Evidence.**

```
$ python3 -c "tag balance on git HEAD:project.html"
HEAD <div>: open=20 close=21
HEAD <section>: open=2 close=3
HEAD <main>: open=0 close=1

$ web_fetch https://sheraz.is-a.dev/project.html?id=lte
title: Project Dossier — Sheraz // ARC OS
[Skip to content](#main)
HIGHLIGHTS
Visual log · Screenshots
Archive · Documentation
```

That is the complete rendered body. No title, no tagline, no media.

**Fix applied.** Reconstructed the missing markup in `project.html` using the class names
already defined in `styles.css` (`.p-hero`, `.p-info-grid`, `.p-stack-tags`, `.video-stage`)
so no new CSS was required. Additionally hardened `project.js`: the `$()` helper now returns
a detached node and logs a `console.warn` instead of returning `null`, so a single missing
mount point can never again abort the entire script.

**Priority.** P0.

---

### F-02 · 9 sitemap URLs were duplicates of one another — CRITICAL

**Issue.** `project.html` had no `<link rel="canonical">`, no `og:url`, and a single static
`<title>` / `<meta description>` shared across all `?id=` variants.

**Impact.** Google treats query-string variants of an identical document as one URL. Eight
of your nine project pages were canonicalisation casualties before the content problem was
even reached.

**Evidence.**

```
$ grep -c 'rel="canonical"' project.html   # before
0
$ curl-equivalent on ?id=lte and ?id=cms   # before
title: Project Dossier — Sheraz // ARC OS   (identical on both)
```

**Fix applied.** Added a static canonical/OG/Twitter block to `project.html`, and a
`seoMeta()` routine in `project.js` that rewrites `canonical`, `description`, `og:title`,
`og:description`, `og:url`, `og:image` and the Twitter equivalents per resolved slug. Also
emits per-page `BreadcrumbList` + `CreativeWork` JSON-LD. Unknown slugs resolve to the `lte`
canonical rather than self-canonicalising, so `?id=garbage` cannot spawn a duplicate.

**Verified** via jsdom execution of the real scripts:

```
?id=lte        | title="Linear Tree Enumeration System — Sheraz // ARC OS" | canonical=…?id=lte
?id=gis-portal | title="GIS Forestry Public Web Portal — Sheraz // ARC OS" | canonical=…?id=gis-portal
?id=does-not-exist                                                        | canonical=…?id=lte
```

**Priority.** P0.

---

### F-03 · `assets/projects/` is empty — 9 homepage images 404 — HIGH

**Issue.** Every project card on the homepage references an image under `assets/projects/`.
That directory contains zero files tracked in git.

**Evidence.**

```
$ git ls-files assets/projects | wc -l
0
$ web_fetch https://sheraz.is-a.dev/assets/projects/lte/shot-01.webp
(empty response)
```

**Impact.** Nine 404s on the primary landing page — a crawl-quality signal and nine wasted
round trips. Visually the damage was limited because `.proj-img` sits at `z-index:-2` behind
an opaque gradient, so cards looked flat rather than broken.

**Fix applied.** Added `assets/projects/_placeholder.svg` (a 1.1 KB inline-drawn HUD frame,
on-brand) and an `onerror` fallback on all nine `<img>` tags. When you drop the real
screenshots into `assets/projects/<slug>/`, they take over automatically with no code change.
Also gave each an intrinsic `width`/`height`.

**Priority.** P1.

---

### F-04 · `project.js` dummy-asset path pointed at a non-existent directory — HIGH

**Issue.** `var DUMMY = "assets/projects/_dummy/"` — the actual files live at `assets/_dummy/`.
Four projects (`gis-suite`, `jotly`, `sportseuropa`, `shopaholics`) referenced a poster and
three screenshots through that constant, so 16 asset requests 404'd.

**Fix applied.** Corrected the path to `assets/_dummy/`. `shot2.svg` and `shot3.svg` were
referenced but had never existed — generated both from the existing `shot1.svg` template.

**Priority.** P1.

---

### F-05 · Core Web Vitals proxies — MEDIUM

**Issue.** Four gallery images carried no `width`/`height` (CLS risk), and the hero portrait —
the LCP element — was marked `loading="lazy"`, which defers the very image the metric measures.

**Evidence.**

```
# before
imgs=42  missing width|height=13  loading="eager"=0  fetchpriority=0
```

**Fix applied.**

- `width`/`height` on all 42 images. Missing-dimension count is now `0`.
- Hero portrait switched to `loading="eager"` + `fetchpriority="high"` + `decoding="async"`.
- Added `<link rel="preload" as="image" href="assets/sheraz/professional.webp" type="image/webp">`
  so the 55 KB WebP starts downloading during head parse. (The existing `<picture>` already
  serves WebP ahead of the 1 MB PNG — that part was correct.)
- `404.html` was loading Google Fonts as a synchronous render-blocking stylesheet; converted
  to the async `preload`+`onload` pattern already used on the other two pages.

**Caveat.** These are HTML-level proxies only. Confirm real field data at
<https://pagespeed.web.dev/?url=https://sheraz.is-a.dev/>.

**Priority.** P2.

---

### F-06 · Meta and structured data gaps — MEDIUM

**Issue.** No `robots` directive (so no `max-image-preview:large`, which suppresses large
thumbnails in mobile SERPs), no `og:site_name` / `og:locale`, `og:type` was `website` on what
is semantically a profile page, and the JSON-LD was a bare `Person` with no `WebSite` or
`ProfilePage` context.

**Fix applied.**

- `index.html`: added `robots` (`index, follow, max-image-preview:large, max-snippet:-1,
  max-video-preview:-1`), `og:site_name`, `og:locale`, `og:type` → `profile`.
- JSON-LD rewritten as an `@graph` of `Person` + `WebSite` + `ProfilePage` with `@id`
  cross-references, `alternateName`, `worksFor`, structured `alumniOf` and `addressCountry: PK`.
- `project.html`: full canonical/robots/OG/Twitter set (see F-02).
- Validated: `valid JSON-LD, @types: ['Person', 'WebSite', 'ProfilePage']`.

**Priority.** P2.

---

### F-07 · Sitemap omitted a live project and had no `lastmod` — LOW

**Issue.** `gis-portal` exists in both `PROJECTS` and as a homepage card but was absent from
`sitemap.xml`. No `<lastmod>` on any entry.

**Fix applied.** Added the `gis-portal` URL and `<lastmod>2026-07-20</lastmod>` to all 10
entries. Validated as well-formed XML.

**Priority.** P3.

---

### F-08 · Crawl / indexation status — INFORMATIONAL

`robots.txt` is correct (`Allow: /` plus a valid `Sitemap:` reference) — nothing is blocking
the crawler. But a `site:sheraz.is-a.dev` query returned zero results from the domain, while
returning ten results for similarly-named developer sites. Combined with F-01, the most
likely reading is that the property has never been submitted to Search Console and what
little was crawled was judged thin.

**Priority.** P0 — but the remaining action is yours, not the codebase's.

---

## Not fixed — deliberately left for you

| Item | Detail | Why not auto-fixed |
|---|---|---|
| 8.3 MB of unused images | `ai-01…04.png` (~2 MB each) and `_original-do-not-use.jpeg` are referenced 0 times in any HTML/CSS/JS | Not served to visitors, so zero SEO impact — but they bloat the repo. Delete when you're sure. |
| 4.1 MB CV PDF at repo root | `Sheraz CV - Curriculum vitae 25042026.pdf`, URL-encoded spaces, duplicated at `assets/files/sheraz-cv.pdf` | Renaming changes a URL you may have shared externally. Suggest compressing to <1 MB and standardising on one copy. |
| Real project screenshots | `assets/projects/` is empty | Only you have the source images. Placeholder fallback is in place until then. |
| `professional.png` (1 MB) | The `<picture>` already serves the 55 KB WebP first, so most visitors never fetch it | Kept as the non-WebP fallback. |

---

## Your next steps (highest leverage first)

1. **Deploy this changeset**, then verify `https://sheraz.is-a.dev/project.html?id=lte`
   renders a full dossier.
2. **Add the property to [Google Search Console](https://search.google.com/search-console)**
   and submit `https://sheraz.is-a.dev/sitemap.xml`. Nothing else on this list matters until
   Google knows the site exists. Repeat for [Bing Webmaster Tools](https://www.bing.com/webmasters).
3. **Use URL Inspection → Request Indexing** on the homepage and 2–3 project URLs.
4. **Build the three easiest backlinks:** your GitHub profile README and repo homepage field,
   your LinkedIn "Website" field, and a dev.to or Hashnode post about the Linear Tree
   Enumeration platform that links back. A brand-new subdomain with zero inbound links will
   not rank for a contested personal name on merit alone.
5. **Reconsider the head term.** "Malik Sheraz Maqsood Ahmed" is winnable; "Sheraz developer"
   is not, against the incumbents above. Your realistic openings are long-tail and specific —
   *"GIS forestry web platform developer Pakistan"*, *"Laravel PostGIS government portal"*,
   *"linear tree enumeration system"*. Consider a short write-up page per project targeting one
   of those, which the dossier pages are now structurally capable of supporting.
6. **Drop the real screenshots** into `assets/projects/<slug>/` — the placeholders retire
   themselves.

---

## Out-of-scope notes

| Signal | Why not measured | Where to get it |
|---|---|---|
| Field-data Core Web Vitals (LCP/INP/CLS) | Requires real-user CrUX data; only HTML proxies measured here | [PageSpeed Insights](https://pagespeed.web.dev/?url=https://sheraz.is-a.dev/) |
| Index-coverage detail, crawl errors, impressions | Requires authenticated property access | Google Search Console |
| Backlink profile and referring domains | No backlink index available in this environment | Ahrefs / Semrush / Moz free tiers |
| True Google SERP positions | The available search tool is not a raw Google SERP; treat F-08 as directional, not exact | `bdata search` once the CLI is installed, or GSC Performance |
| Actual rendered-DOM verification in a real browser | Verified via jsdom instead — real scripts executed against the real HTML, 0 errors | Deploy, then Lighthouse / URL Inspection "View crawled page" |

---

## Verification performed

```
JS syntax        node --check ×3 files ..................... OK
HTML tag balance index/project/404 ....................... balanced
JSON-LD parse    index.html .... Person, WebSite, ProfilePage
JSON-LD parse    project.html ... BreadcrumbList, CreativeWork
XML parse        sitemap.xml ......................... well-formed
Mount points     15/15 present in project.html ............. OK
jsdom run        project.js against ?id=lte|gis-portal|
                 shopaholics|does-not-exist ...... 0 errors, all
                 sections populated (27 screenshots, 2 videos,
                 4 highlights, 6 stack tags)
Images           42 total · 0 missing alt · 0 missing dimensions
```

No CSS was modified, no DOM ids or class names were renamed, and no existing selector was
removed — the visual design is byte-for-byte unchanged apart from the reconstructed
`project.html` sections, which reuse existing styles.
