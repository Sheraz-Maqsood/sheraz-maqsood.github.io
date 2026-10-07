/* ============================================================
   Project dossiers — single source of truth.
   `npm run build` turns every entry into its own static page at
   /projects/<id>/  (unique title, description, canonical, OG and
   JSON-LD, fully readable without JavaScript) and refreshes sitemap.xml.

   Fields
     code, title[2], hl        heading (hl: 1 = glitch accent on 2nd word)
     tagline, overview         copy (tagline doubles as meta description)
     year, sector, domain      facts; domain = live URL or null
     poster                    still image (video poster + social card)
     videos: [{ src, label }]  optional .mp4 demos   (section hidden if empty)
     shots : [{ src, cap }]    screenshots (gallery + lightbox)
     docs  : [{ href, label }] optional PDFs (section hidden if empty);
                               a "<name>-thumb.webp" next to each PDF is its preview
     highlights, stack         bullet lists
   Order of keys = order of prev/next links on the dossier pages.
   ============================================================ */

function shots(dir, n, ext = 'webp') {
  return Array.from({ length: n }, (_, i) => {
    const nn = String(i + 1).padStart(2, '0');
    return { src: `${dir}shot-${nn}.${ext}`, cap: `Frame ${nn}` };
  });
}

export const PROJECTS = {
  lte: {
    code: 'SYS-01', title: ['Linear Tree', 'Enumeration System'], hl: 1,
    tagline: 'A GIS-driven platform to enumerate, track and analyze linear tree plantations along roads, canals and forest boundaries — high-performance spatial queries over very large datasets.',
    year: '2025', sector: 'Government / Forestry',
    domain: 'https://punjabtreeenumeration.com',
    poster: 'assets/projects/lte/shot-01.webp',
    videos: [
      { src: 'assets/projects/lte/video-01.mp4', label: 'Platform walkthrough' },
      { src: 'assets/projects/lte/video-02.mp4', label: 'Field & reporting flow' }
    ],
    shots: shots('assets/projects/lte/', 27),
    docs: [
      { href: 'assets/projects/lte/doc-04.pdf', label: 'Division-Wise Report' },
      { href: 'assets/projects/lte/doc-05.pdf', label: 'Enumeration Aggregate Report' },
      { href: 'assets/projects/lte/doc-01.pdf', label: 'Field Report A' },
      { href: 'assets/projects/lte/doc-02.pdf', label: 'Field Report B' },
      { href: 'assets/projects/lte/doc-03.pdf', label: 'Field Report C' }
    ],
    overview: 'Built to enumerate and monitor linear plantations at provincial scale, the LTE platform combines interactive geospatial visualization with optimized spatial querying so field and admin users can track millions of records without performance loss.',
    highlights: ['Interactive map rendering with layered overlays', 'High-performance spatial queries on large datasets', 'Role-based access across government hierarchy', 'QR-based geospatial tagging of records'],
    stack: ['Next.js', 'NestJS', 'PostgreSQL', 'PostGIS', 'Leaflet', 'CI/CD']
  },
  cms: {
    code: 'SYS-02', title: ['Complaint', 'Management System'], hl: 0,
    tagline: 'Multi-role routing platform for forest incidents with WhatsApp API alerts to Conservators and DFOs.',
    year: '2025', sector: 'Government / Workflow',
    domain: 'https://cms.gisforestry.com',
    poster: 'assets/projects/cms/shot-01.webp',
    videos: [{ src: 'assets/projects/cms/video-01.mp4', label: 'System demonstration' }],
    shots: shots('assets/projects/cms/', 14),
    docs: [{ href: 'assets/projects/cms/doc-01.pdf', label: 'Example Complaint Report' }],
    overview: 'A routing system that moves forest incident complaints through the right administrative chain, with automated WhatsApp notifications so officers are alerted the moment action is required.',
    highlights: ['Multi-role complaint routing', 'WhatsApp API notifications', 'Audit trail and status tracking', 'Mongo-backed flexible records'],
    stack: ['React', 'Node.js', 'MongoDB', 'WhatsApp API']
  },
  ams: {
    code: 'SYS-03', title: ['Asset', 'Management System'], hl: 0,
    tagline: 'Internal IT / consumables tracking with QR generation, low-stock alerts and role-based assignment.',
    year: '2025', sector: 'Government / Operations',
    domain: 'https://ams.gisforestry.com',
    poster: 'assets/projects/ams/preview.webp',
    videos: [],
    shots: [{ src: 'assets/projects/ams/preview.webp', cap: 'Asset Management System — project cover' }],
    docs: [],
    overview: 'Tracks assets and consumables across departments, generating QR codes for every item, raising low-stock alerts, and enforcing role-based assignment so accountability is always clear.',
    highlights: ['QR code generation per asset', 'Low-stock threshold alerts', 'Role-based assignment & accountability', 'Laravel 11 + MySQL backend'],
    stack: ['Laravel 11', 'MySQL', 'Blade', 'QR']
  },
  ppms: {
    code: 'SYS-04', title: ['Pakistan Plantation', 'Management System'], hl: 1,
    tagline: 'Nationwide GIS platform letting citizens and departments record plantation activity with GPS precision and photographic evidence to support environmental policy.',
    year: '2024', sector: 'Government / Public',
    domain: 'https://ppms.gisforestry.com',
    poster: 'assets/projects/ppms/shot-01.webp',
    videos: [{ src: 'assets/projects/ppms/video-01.mp4', label: 'Platform demonstration' }],
    shots: shots('assets/projects/ppms/', 18),
    docs: [],
    overview: 'A public-facing geospatial platform that lets citizens and departments log tree plantation activity with GPS coordinates and photo evidence, feeding national environmental policy with verifiable field data.',
    highlights: ['Nationwide GPS-tagged reporting', 'Photographic evidence capture', 'Citizen + department workflows', 'Policy-grade data aggregation'],
    stack: ['Laravel', 'GIS', 'Leaflet', 'MySQL']
  },
  'gis-suite': {
    code: 'SYS-05', title: ['GIS Spatial', 'Monitoring Suite'], hl: 0,
    tagline: 'A suite of spatial systems — Fire Management, Nursery Tracking and Forest Change Analysis — built on Leaflet mapping with QR markers.',
    year: '2025', sector: 'Government / GIS',
    domain: null,
    poster: 'assets/projects/gis-suite/preview.webp',
    videos: [],
    shots: [{ src: 'assets/projects/gis-suite/preview.webp', cap: 'GIS Spatial Monitoring Suite — project cover' }],
    docs: [],
    overview: 'A connected family of spatial monitoring tools covering fire incidents, nursery inventory and forest change detection — all sharing a Leaflet-based mapping core and QR-marker tagging.',
    highlights: ['Fire management mapping', 'Nursery inventory tracking', 'Forest change analysis', 'Shared Leaflet + PostGIS core'],
    stack: ['Leaflet', 'PostGIS', 'PostgreSQL', 'Node.js']
  },
  jotly: {
    code: 'SYS-06', title: ['Jotly', '.ai'], hl: 1,
    tagline: 'Full-stack AI application offering image generation, voiceovers and AI chat.',
    year: '2024', sector: 'AI / SaaS · Canada',
    domain: null,
    poster: 'assets/projects/jotly/preview.webp',
    videos: [],
    shots: [{ src: 'assets/projects/jotly/preview.webp', cap: 'Jotly.ai — project cover' }],
    docs: [],
    overview: 'An AI SaaS product bundling generative image creation, text-to-speech voiceovers and conversational AI chat into a single full-stack experience.',
    highlights: ['AI image generation', 'Voiceover / TTS pipeline', 'Conversational AI chat', 'Full-stack SaaS architecture'],
    stack: ['React', 'Node.js', 'AI APIs', 'PostgreSQL']
  },
  sportseuropa: {
    code: 'SYS-07', title: ['Sportseuropa', 'Suite'], hl: 0,
    tagline: 'Team registration and live scoring apps for Olympic-level games, managing judges and championships.',
    year: '2023', sector: 'Sports Management · Italy',
    domain: null,
    poster: 'assets/projects/sportseuropa/preview.webp',
    videos: [],
    shots: [{ src: 'assets/projects/sportseuropa/preview.webp', cap: 'Sportseuropa Suite — project cover' }],
    docs: [],
    overview: 'A suite handling team registration and real-time scoring for championship-level sporting events, coordinating judges, brackets and live results.',
    highlights: ['Team registration workflows', 'Real-time live scoring', 'Judge & championship management', 'Event bracket handling'],
    stack: ['Laravel', 'PHP', 'MySQL', 'Realtime']
  },
  shopaholics: {
    code: 'SYS-08', title: ['Global Shopaholics', '& Ship6'], hl: 0,
    tagline: 'Core international shipping, package forwarding and e-commerce logistics platform infrastructure.',
    year: '2024', sector: 'Logistics SaaS',
    domain: null,
    poster: 'assets/projects/shopaholics/preview.webp',
    videos: [],
    shots: [{ src: 'assets/projects/shopaholics/preview.webp', cap: 'Global Shopaholics & Ship6 — project cover' }],
    docs: [],
    overview: 'Logistics infrastructure for international shipping and package forwarding, with performance optimization and CI/CD deployment to production servers.',
    highlights: ['International shipping flows', 'Package forwarding engine', 'Speed & code optimization', 'SSH / CI-CD deployments'],
    stack: ['Laravel', 'PHP', 'MySQL', 'CI/CD']
  },
  'gis-portal': {
    code: 'SYS-09', title: ['GIS Forestry', 'Public Web Portal'], hl: 1,
    tagline: 'Public-facing Next.js portal for the Punjab Forest, Wildlife & Fisheries Department — showcasing forests, national parks and zoos, drone echo-tech and citizen e-services, backed by a custom admin panel.',
    year: '2026', sector: 'Government / Public Portal',
    domain: 'https://gisforestry.com',
    poster: 'assets/sheraz/gislab-forest-iucn.webp',
    videos: [],
    shots: [{ src: 'assets/sheraz/gislab-forest-iucn.webp', cap: 'GIS Lab forestry technology showcase' }],
    docs: [],
    overview: "The public web presence for the Punjab Forest, Wildlife & Fisheries Department (GIS Lab, F&W Lahore), served on gisforestry.com and punjabeforest.gop.pk. Built with Next.js, it presents the department's forests, national parks and zoos alongside an 'Echo-Tech' section on drone-based multi-spectral, LiDAR and thermal forest monitoring, plus citizen e-services — all managed through a custom admin panel.",
    highlights: ['Server-rendered Next.js front end', 'Echo-Tech: multi-spectral, LiDAR & thermal drone monitoring', 'Forests, national parks & zoo showcase', 'Citizen e-services & social integration', 'Custom secure admin panel'],
    stack: ['Next.js', 'React', 'Node.js', 'Tailwind']
  }
};
