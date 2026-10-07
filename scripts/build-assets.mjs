/* ============================================================
   Site build — `npm run build`  (also runs in .github/workflows/build.yml)
   1. Minifies the readable sources into .min siblings with content hashes.
   2. Pre-renders the shared header (assets/js/components.js) into every page.
   3. Generates one static page per project: /projects/<id>/index.html
      from scripts/templates/project.html + scripts/projects-data.mjs.
   4. Rewrites asset references to "<file>.min.<ext>?v=<hash>".
   5. Writes sitemap.xml (lastmod changes only when a page's HTML changes).
   Sources stay readable; never hand-edit the .min files or the generated projects/<id>/index.html.
   ============================================================ */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { transform } from 'esbuild';
import { PROJECTS } from './projects-data.mjs';
import { imageSize } from './image-size.mjs';

const SITE = 'https://sheraz.is-a.dev/';
const MEDIA_REV = 'media-20260928';            /* bump to bust cached project media */
const STATE_FILE = 'scripts/.build-state.json';
const today = new Date().toISOString().slice(0, 10);

/* Content-Security-Policy shared by every page (meta tag; GitHub Pages cannot send headers). */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  "frame-src 'self'",
  "connect-src 'self' https://formsubmit.co",
  "form-action 'self' https://formsubmit.co",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  'upgrade-insecure-requests'
].join('; ');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const exists = (f) => access(f).then(() => true, () => false);
const hash = (s, n = 10) => createHash('sha256').update(s).digest('hex').slice(0, n);

/* ---------- 1. minify ---------- */
const files = [
  'assets/css/site.css',
  'assets/js/components.js', 'assets/js/main.js', 'assets/js/project.js',
  'assets/js/living-network.js', 'assets/js/project-redirect.js'
];
const outputs = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const loader = file.endsWith('.css') ? 'css' : 'js';
  const result = await transform(source, { loader, minify: true, target: 'es2020', legalComments: 'inline' });
  const output = file.replace(/\.(css|js)$/, '.min.$1');
  await writeFile(output, result.code);
  outputs.push({ file, output, hash: hash(result.code) });
  console.log(`${file}: ${Buffer.byteLength(source)} -> ${Buffer.byteLength(result.code)} bytes`);
}
function rewriteRefs(html) {
  for (const { file, output, hash: h } of outputs) {
    const pattern = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\.(css|js)$/, '(?:\\.min)?\\.$1');
    html = html.replace(new RegExp(`(["'])${pattern}(?:\\?[^"']*)?\\1`, 'g'), `"${output}?v=${h}"`);
  }
  return html;
}

/* ---------- 2. shared header, rendered by the same code the browser would run ---------- */
const componentsSrc = await readFile('assets/js/components.js', 'utf8');
function renderHeader(pathname) {
  const host = { innerHTML: '', children: [] };
  vm.runInNewContext(componentsSrc, {
    document: { getElementById: (id) => (id === 'site-header' ? host : null) },
    location: { pathname }
  });
  return host.innerHTML;
}
function injectHeader(html, pathname) {
  return html.replace(/<div id="site-header">(?:<!--header-->[\s\S]*?<!--\/header-->)?<\/div>/,
    `<div id="site-header"><!--header-->${renderHeader(pathname)}<!--/header--></div>`);
}

/* ---------- 3. project pages ---------- */
const media = (src) => (src && src.startsWith('assets/projects/') && !src.includes('?') ? `${src}?v=${MEDIA_REV}` : src);
async function dims(src) { try { return await imageSize(src); } catch { return null; } }
function trimDesc(s, max = 158) {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length <= max ? s : s.slice(0, max - 1).replace(/[\s,;:—-]+\S*$/, '') + '…';
}
const corners = '<span class="v-corner v-tl"></span><span class="v-corner v-tr"></span><span class="v-corner v-bl"></span><span class="v-corner v-br"></span>';
const timeline = '<div class="v-timeline" aria-hidden="true"><span>00:00</span><span class="bar"><i></i></span><span>LIVE</span></div>';

const ids = Object.keys(PROJECTS);
const template = await readFile('scripts/templates/project.html', 'utf8');
const pages = [];

for (const [i, id] of ids.entries()) {
  const p = PROJECTS[id];
  const name = p.title.join(p.title[1].startsWith('.') ? '' : ' ');
  const url = `${SITE}projects/${id}/`;
  const videos = p.videos || [];
  const docs = p.docs || [];
  const shots = p.shots || [];
  const coverOnly = !videos.length && shots.length <= 1;
  const description = trimDesc(p.tagline || p.overview);
  const ogFile = `assets/projects/${id}/og.jpg`;
  const ogImage = SITE + ((await exists(ogFile)) ? ogFile : 'assets/sheraz/og-card.jpg');
  const posterDims = await dims(p.poster);

  const titleHtml = `<span>${esc(p.title[0])}</span>${p.title[1].startsWith('.') ? '' : ' '}` + (p.hl === 1
    ? `<span class="glitch hl-word" data-text="${esc(p.title[1])}">${esc(p.title[1])}</span>`
    : `<span class="hl-word">${esc(p.title[1])}</span>`);
  const chips = [
    `<span class="p-chip gold">${esc(p.sector)}</span>`,
    `<span class="p-chip">Year ${esc(p.year)}</span>`,
    `<span class="p-chip">${p.stack.length} tech modules</span>`,
    videos.length ? `<span class="p-chip">${videos.length} video${videos.length > 1 ? 's' : ''}</span>` : '',
    docs.length ? `<span class="p-chip">${docs.length} document${docs.length > 1 ? 's' : ''}</span>` : ''
  ].join('');
  const actions = [
    p.domain ? `<a class="btn btn-primary magnetic" href="${esc(p.domain)}" target="_blank" rel="noopener">&#9673; Visit live platform<span class="sr-only"> (opens in a new tab)</span></a>` : '',
    docs.length ? `<a class="btn btn-ghost magnetic" href="${esc(media(docs[0].href))}" target="_blank" rel="noopener">&darr; Documentation (PDF)</a>` : '',
    !p.domain ? `<a class="btn btn-primary magnetic" href="./#contact">Request a walkthrough</a>` : '',
    `<a class="btn btn-ghost magnetic" href="./#projects">&larr; All projects</a>`
  ].join('');

  let mediaHtml;
  if (videos.length) {
    mediaHtml = `
    <section class="wrap" data-reveal aria-labelledby="p-video-h">
      <h2 class="p-section-label" id="p-video-h">Signal &middot; Video proof</h2>
      <div class="video-rack">${videos.map((v, k) => `
        <div class="video-stage">${corners}<div class="v-hud-top" aria-hidden="true"><span class="v-rec"><i></i> REC &middot; ${esc(p.code)}${videos.length > 1 ? ` &middot; ${k + 1}/${videos.length}` : ''}</span><span>${esc(v.label || `CH-0${k + 1} // Demo reel`)}</span></div>
          <video poster="${esc(media(p.poster))}" preload="none" playsinline controls><source src="${esc(media(v.src))}" type="video/mp4"></video>
          <button class="v-playbtn" type="button"><span class="ring" aria-hidden="true"><span class="tri"></span></span><span class="lbl">Play ${esc(v.label || 'demo')}</span></button>
          ${timeline}
        </div>`).join('')}
      </div>
    </section>
`;
  } else {
    mediaHtml = '';
  }
  const heroCover = videos.length ? '' : `
      <figure class="p-hero-cover hud-frame">
        <img src="${esc(media(p.poster))}" alt="${esc(shots[0]?.cap || `${name} — project cover`)}"${posterDims ? ` width="${posterDims.width}" height="${posterDims.height}"` : ''} fetchpriority="high" decoding="async">
      </figure>`;

  let galleryHtml = '';
  if (!coverOnly && shots.length) {
    const figs = [];
    for (const [k, s] of shots.entries()) {
      const nn = String(k + 1).padStart(2, '0');
      const d = await dims(s.src);
      const cap = s.cap || `Frame ${nn}`;
      figs.push(`
          <figure class="shot">
            <img src="${esc(media(s.src))}" alt="${esc(name)} — ${esc(cap)}" loading="lazy" decoding="async"${d ? ` width="${d.width}" height="${d.height}"` : ''}>
            <span class="zoom" aria-hidden="true">&#9974;</span>
            <a class="shot-hit" href="${esc(media(s.src))}" data-idx="${k}" aria-label="View full size: ${esc(cap)}"></a>
            <figcaption class="cap">${nn} &middot; ${esc(cap)}</figcaption>
          </figure>`);
    }
    galleryHtml = `
    <section class="wrap" data-reveal aria-labelledby="p-shots-h">
      <h2 class="p-section-label" id="p-shots-h">Visual log &middot; Screenshots</h2>
      <div class="gallery">
        <button class="g-nav g-prev" type="button" aria-label="Previous screenshots">&lsaquo;</button>
        <div class="g-track" id="g-track">${figs.join('')}
        </div>
        <button class="g-nav g-next" type="button" aria-label="Next screenshots">&rsaquo;</button>
        <div class="g-count">${shots.length} frames &middot; scroll or drag</div>
      </div>
    </section>
`;
  }

  let docsHtml = '';
  if (docs.length) {
    const cards = [];
    for (const d of docs) {
      const th = d.thumb || d.href.replace(/\.pdf$/i, '-thumb.webp');
      const hasThumb = await exists(th);
      const td = hasThumb ? await dims(th) : null;
      cards.push(`
        <figure class="doc-preview">
          <div class="dp-thumb">${hasThumb ? `<img src="${esc(media(th))}" alt="First page of ${esc(d.label)}" loading="lazy" decoding="async"${td ? ` width="${td.width}" height="${td.height}"` : ''}>` : '<span class="dp-ph">PDF</span>'}<span class="dp-badge">PDF</span><span class="dp-open" aria-hidden="true">&#9672; View</span></div>
          <a class="dp-hit" href="${esc(media(d.href))}" target="_blank" rel="noopener" data-label="${esc(d.label)}" aria-label="Open ${esc(d.label)} (PDF)"></a>
          <figcaption><b>${esc(d.label)}</b><span>Page 1 preview &middot; click to read</span></figcaption>
        </figure>`);
    }
    docsHtml = `
    <section class="wrap" data-reveal aria-labelledby="p-docs-h">
      <h2 class="p-section-label" id="p-docs-h">Archive &middot; Documentation</h2>
      <div class="doc-rack">${cards.join('')}
      </div>
    </section>
`;
  }

  const walkthrough = videos.length ? '' : `
    <section class="wrap" data-reveal aria-label="Walkthrough">
      <div class="p-walkthrough panel hud-frame">
        <p><b>Want to see ${esc(name)} in action?</b> I can walk you through the architecture, data model and the decisions behind it on a short call.</p>
        <a class="btn btn-primary magnetic" href="./#contact">Book a walkthrough &rarr;</a>
      </div>
    </section>
`;

  const lightbox = (!coverOnly && shots.length) ? `
  <div class="lightbox" id="lightbox">
    <button class="lb-close" id="lb-close" type="button" aria-label="Close">&times;</button>
  </div>
` : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE}#projects` },
          { '@type': 'ListItem', position: 3, name, item: url }
        ]
      },
      {
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        name,
        headline: name,
        description: (p.overview || p.tagline).replace(/\s+/g, ' '),
        url,
        image: ogImage,
        dateCreated: String(p.year || ''),
        genre: p.sector || '',
        keywords: (p.stack || []).join(', '),
        inLanguage: 'en',
        ...(p.domain ? { sameAs: p.domain } : {}),
        creator: { '@type': 'Person', '@id': `${SITE}#person`, name: 'Malik Sheraz Maqsood Ahmed', url: SITE },
        isPartOf: { '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE }
      }
    ]
  }).replace(/</g, '\\u003c');

  const prevId = ids[(i - 1 + ids.length) % ids.length], nextId = ids[(i + 1) % ids.length];
  const nameOf = (k) => PROJECTS[k].title.join(PROJECTS[k].title[1].startsWith('.') ? '' : ' ');
  const preloadLcp = coverOnly ? `  <link rel="preload" as="image" href="${esc(media(p.poster))}" fetchpriority="high">` : '';

  const vars = {
    id, name: esc(name), title: esc(`${name} — Case study | Sheraz Maqsood`), description: esc(description),
    url, ogTitle: esc(`${name} — case study by Malik Sheraz Maqsood Ahmed`), ogImage, ogImageAlt: esc(`${name} — project dossier card`),
    csp: CSP, code: esc(p.code), titleHtml, tagline: esc(p.tagline), chips, actions,
    overview: esc(p.overview), stack: p.stack.map((t) => `<li>${esc(t)}</li>`).join(''),
    highlights: p.highlights.map((h) => `<li>${esc(h)}</li>`).join(''),
    media: mediaHtml, heroCover, heroClass: videos.length ? '' : ' has-cover', gallery: galleryHtml, docs: docsHtml, walkthrough, lightbox, jsonLd, preloadLcp,
    prevId, nextId, prevName: esc(nameOf(prevId)), nextName: esc(nameOf(nextId)),
    year: String(new Date().getFullYear())
  };
  let html = template.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
  html = rewriteRefs(injectHeader(html, `/projects/${id}/`));
  await mkdir(`projects/${id}`, { recursive: true });
  await writeFile(`projects/${id}/index.html`, html);
  pages.push({ loc: url, html, priority: i < 4 || id === 'gis-portal' ? '0.8' : '0.7' });
}

/* ---------- 4. hand-written pages ---------- */
for (const page of ['index.html', '404.html', 'project.html']) {
  let html = await readFile(page, 'utf8');
  if (page === 'index.html') html = injectHeader(html, '/');
  html = rewriteRefs(html);
  await writeFile(page, html);
  if (page === 'index.html') pages.unshift({ loc: SITE, html, priority: '1.0' });
}

/* ---------- 5. sitemap (lastmod only moves when the page really changed) ---------- */
let state = {};
try { state = JSON.parse(await readFile(STATE_FILE, 'utf8')); } catch { /* first run */ }
const next = {};
const urls = pages.map(({ loc, html, priority }) => {
  const h = hash(html, 16);
  const prev = state[loc];
  const lastmod = prev && prev.hash === h ? prev.lastmod : today;
  next[loc] = { hash: h, lastmod };
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`;
});
await writeFile(STATE_FILE, JSON.stringify(next, null, 2) + '\n');
await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`);
console.log(`Generated ${ids.length} project pages + sitemap.xml (${pages.length} URLs).`);
