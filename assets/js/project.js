/* ============================================================
   ARC // Project Dossier engine — data-driven detail pages
   URL:  project.html?id=<slug>
   To customize a project: edit the PROJECTS map below.
     video : path to your .mp4  (null = standby placeholder)
     poster: still image shown before play
     shots : [{ src, cap }]  screenshots
     doc   : { href, label, size } | null  (PDF documentation)
     domain: "https://..."   | null  (live site, may be offline)
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var DUMMY = "assets/projects/_dummy/";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- DATA ---------- */
  var PROJECTS = {
    "lte": {
      code: "SYS-01", title: ["Linear Tree", "Enumeration System"], hl: 1,
      tagline: "A GIS-driven platform to enumerate, track and analyze linear tree plantations along roads, canals and forest boundaries — high-performance spatial queries over very large datasets.",
      year: "2025", sector: "Government / Forestry",
      domain: "https://punjabtreeenumeration.com",
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Spatial dashboard" }, { src: DUMMY + "shot2.svg", cap: "Enumeration map" }, { src: DUMMY + "shot3.svg", cap: "Analytics module" }],
      doc: null,
      overview: "Built to enumerate and monitor linear plantations at provincial scale, the LTE platform combines interactive geospatial visualization with optimized spatial querying so field and admin users can track millions of records without performance loss.",
      highlights: ["Interactive map rendering with layered overlays", "High-performance spatial queries on large datasets", "Role-based access across government hierarchy", "QR-based geospatial tagging of records"],
      stack: ["Next.js", "NestJS", "PostgreSQL", "PostGIS", "Leaflet", "CI/CD"]
    },
    "cms": {
      code: "SYS-02", title: ["Complaint", "Management System"], hl: 0,
      tagline: "Multi-role routing platform for forest incidents with WhatsApp API alerts to Conservators and DFOs.",
      year: "2025", sector: "Government / Workflow",
      domain: "https://cms.gisforestry.com",
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Complaint intake" }, { src: DUMMY + "shot2.svg", cap: "Routing console" }, { src: DUMMY + "shot3.svg", cap: "Status tracking" }],
      doc: null,
      overview: "A routing system that moves forest incident complaints through the right administrative chain, with automated WhatsApp notifications so officers are alerted the moment action is required.",
      highlights: ["Multi-role complaint routing", "WhatsApp API notifications", "Audit trail and status tracking", "Mongo-backed flexible records"],
      stack: ["React", "Node.js", "MongoDB", "WhatsApp API"]
    },
    "ams": {
      code: "SYS-03", title: ["Asset", "Management System"], hl: 0,
      tagline: "Internal IT / consumables tracking with QR generation, low-stock alerts and role-based assignment.",
      year: "2025", sector: "Government / Operations",
      domain: "https://ams.gisforestry.com",
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Asset registry" }, { src: DUMMY + "shot2.svg", cap: "QR tagging" }, { src: DUMMY + "shot3.svg", cap: "Stock alerts" }],
      doc: null,
      overview: "Tracks assets and consumables across departments, generating QR codes for every item, raising low-stock alerts, and enforcing role-based assignment so accountability is always clear.",
      highlights: ["QR code generation per asset", "Low-stock threshold alerts", "Role-based assignment & accountability", "Laravel 11 + MySQL backend"],
      stack: ["Laravel 11", "MySQL", "Blade", "QR"]
    },
    "ppms": {
      code: "SYS-04", title: ["Pakistan Plantation", "Management System"], hl: 1,
      tagline: "Nationwide GIS platform letting citizens and departments record plantation activity with GPS precision and photographic evidence to support environmental policy.",
      year: "2024", sector: "Government / Public",
      domain: "https://ppms.gisforestry.com",
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Public reporting" }, { src: DUMMY + "shot2.svg", cap: "GPS capture" }, { src: DUMMY + "shot3.svg", cap: "National map" }],
      doc: null,
      overview: "A public-facing geospatial platform that lets citizens and departments log tree plantation activity with GPS coordinates and photo evidence, feeding national environmental policy with verifiable field data.",
      highlights: ["Nationwide GPS-tagged reporting", "Photographic evidence capture", "Citizen + department workflows", "Policy-grade data aggregation"],
      stack: ["Laravel", "GIS", "Leaflet", "MySQL"]
    },
    "gis-suite": {
      code: "SYS-05", title: ["GIS Spatial", "Monitoring Suite"], hl: 0,
      tagline: "A suite of spatial systems — Fire Management, Nursery Tracking and Forest Change Analysis — built on Leaflet mapping with QR markers.",
      year: "2025", sector: "Government / GIS",
      domain: null,
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Fire management" }, { src: DUMMY + "shot2.svg", cap: "Nursery tracking" }, { src: DUMMY + "shot3.svg", cap: "Change analysis" }],
      doc: null,
      overview: "A connected family of spatial monitoring tools covering fire incidents, nursery inventory and forest change detection — all sharing a Leaflet-based mapping core and QR-marker tagging.",
      highlights: ["Fire management mapping", "Nursery inventory tracking", "Forest change analysis", "Shared Leaflet + PostGIS core"],
      stack: ["Leaflet", "PostGIS", "PostgreSQL", "Node.js"]
    },
    "jotly": {
      code: "SYS-06", title: ["Jotly", ".ai"], hl: 1,
      tagline: "Full-stack AI application offering image generation, voiceovers and AI chat.",
      year: "2024", sector: "AI / SaaS · Canada",
      domain: null,
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "AI chat" }, { src: DUMMY + "shot2.svg", cap: "Image generation" }, { src: DUMMY + "shot3.svg", cap: "Voiceover studio" }],
      doc: null,
      overview: "An AI SaaS product bundling generative image creation, text-to-speech voiceovers and conversational AI chat into a single full-stack experience.",
      highlights: ["AI image generation", "Voiceover / TTS pipeline", "Conversational AI chat", "Full-stack SaaS architecture"],
      stack: ["React", "Node.js", "AI APIs", "PostgreSQL"]
    },
    "sportseuropa": {
      code: "SYS-07", title: ["Sportseuropa", "Suite"], hl: 0,
      tagline: "Team registration and live scoring apps for Olympic-level games, managing judges and championships.",
      year: "2023", sector: "Sports Management · Italy",
      domain: null,
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Registration" }, { src: DUMMY + "shot2.svg", cap: "Live scoring" }, { src: DUMMY + "shot3.svg", cap: "Judge console" }],
      doc: null,
      overview: "A suite handling team registration and real-time scoring for championship-level sporting events, coordinating judges, brackets and live results.",
      highlights: ["Team registration workflows", "Real-time live scoring", "Judge & championship management", "Event bracket handling"],
      stack: ["Laravel", "PHP", "MySQL", "Realtime"]
    },
    "shopaholics": {
      code: "SYS-08", title: ["Global Shopaholics", "& Ship6"], hl: 0,
      tagline: "Core international shipping, package forwarding and e-commerce logistics platform infrastructure.",
      year: "2024", sector: "Logistics SaaS",
      domain: null,
      video: null, poster: DUMMY + "poster.svg",
      shots: [{ src: DUMMY + "shot1.svg", cap: "Shipment dashboard" }, { src: DUMMY + "shot2.svg", cap: "Package forwarding" }, { src: DUMMY + "shot3.svg", cap: "Logistics ops" }],
      doc: null,
      overview: "Logistics infrastructure for international shipping and package forwarding, with performance optimization and CI/CD deployment to production servers.",
      highlights: ["International shipping flows", "Package forwarding engine", "Speed & code optimization", "SSH / CI-CD deployments"],
      stack: ["Laravel", "PHP", "MySQL", "CI/CD"]
    }
  };

  function getId() {
    var m = location.search.match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "lte";
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var p = PROJECTS[getId()] || PROJECTS["lte"];
  document.title = p.title.join(" ") + " — Sheraz // ARC OS";

  /* ---------- HEADER ---------- */
  var titleHtml = "<span>" + esc(p.title[0]) + "</span> " +
    (p.hl === 1 ? "<span class='glitch hl-word' data-text='" + esc(p.title[1]) + "'>" + esc(p.title[1]) + "</span>"
                : "<span class='hl-word'>" + esc(p.title[1]) + "</span>");
  $("#p-title").innerHTML = titleHtml;
  $("#p-tagline").textContent = p.tagline;
  $("#p-code").textContent = p.code + " // DOSSIER";
  $("#p-meta").innerHTML =
    "<span class='p-chip gold'>" + esc(p.sector) + "</span>" +
    "<span class='p-chip'>YEAR " + esc(p.year) + "</span>" +
    "<span class='p-chip'>" + p.stack.length + " TECH MODULES</span>";

  /* ---------- ACTIONS ---------- */
  var actions = "";
  if (p.domain) actions += "<a class='btn btn-primary magnetic' href='" + esc(p.domain) + "' target='_blank' rel='noopener'>&#9673; Visit Live Platform</a>";
  if (p.doc) actions += "<a class='btn btn-ghost magnetic' href='" + esc(p.doc.href) + "' target='_blank' rel='noopener'>&darr; Documentation (PDF)</a>";
  actions += "<a class='btn btn-ghost magnetic' href='index.html#projects'>&larr; All systems</a>";
  $("#p-actions").innerHTML = actions;

  /* ---------- VIDEO PLAYER ---------- */
  (function buildVideo() {
    var stage = $("#video-stage");
    var top = "<div class='v-hud-top'><span class='v-rec'><i></i> REC &middot; " + esc(p.code) + "</span><span>CH-01 // DEMO REEL</span></div>";
    var corners = "<span class='v-corner v-tl'></span><span class='v-corner v-tr'></span><span class='v-corner v-bl'></span><span class='v-corner v-br'></span>";
    var timeline = "<div class='v-timeline'><span>00:00</span><span class='bar'><i></i></span><span>LIVE</span></div>";
    if (p.video) {
      stage.innerHTML = corners + top +
        "<video id='v-el' poster='" + esc(p.poster) + "' preload='none' playsinline></video>" +
        "<button class='v-playbtn' id='v-play' aria-label='Play video'><span class='ring'><span class='tri'></span></span><span class='lbl'>Play demo</span></button>" +
        timeline;
      var v = $("#v-el"); var src = document.createElement("source"); src.src = p.video; src.type = "video/mp4"; v.appendChild(src);
      var btn = $("#v-play");
      btn.addEventListener("click", function () { v.setAttribute("controls", ""); v.play(); btn.style.display = "none"; });
    } else {
      stage.innerHTML = corners + top +
        "<div class='v-poster' style=\"background-image:url('" + esc(p.poster) + "')\"></div>" +
        "<button class='v-playbtn' id='v-play' aria-label='Video pending'><span class='ring'><span class='tri'></span></span><span class='lbl v-standby'>Video proof &middot; standby</span></button>" +
        timeline;
      $("#v-play").addEventListener("click", function () {
        var lbl = $("#v-play .lbl"); lbl.textContent = "Upload pending — attach your .mp4";
      });
    }
  })();

  /* ---------- SCREENSHOTS + LIGHTBOX ---------- */
  (function buildShots() {
    var grid = $("#shot-grid");
    grid.innerHTML = p.shots.map(function (s, i) {
      return "<figure class='shot' data-full='" + esc(s.src) + "' tabindex='0' aria-label='" + esc(s.cap) + "'>" +
        "<span class='zoom'>&#9974;</span>" +
        "<img src='" + esc(s.src) + "' alt='" + esc(p.title.join(" ")) + " — " + esc(s.cap) + "' loading='lazy'>" +
        "<figcaption class='cap'>0" + (i + 1) + " &middot; " + esc(s.cap) + "</figcaption></figure>";
    }).join("");
    var lb = $("#lightbox"), lbImg = $("#lb-img");
    function open(src) { lbImg.src = src; lb.classList.add("open"); }
    function close() { lb.classList.remove("open"); lbImg.src = ""; }
    Array.prototype.forEach.call(grid.querySelectorAll(".shot"), function (el) {
      el.addEventListener("click", function () { open(el.getAttribute("data-full")); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el.getAttribute("data-full")); } });
    });
    $("#lb-close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  })();

  /* ---------- OVERVIEW + STACK ---------- */
  $("#p-overview").textContent = p.overview;
  $("#p-highlights").innerHTML = p.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("");
  $("#p-stack").innerHTML = p.stack.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");

  /* ---------- DOCUMENTATION CARD ---------- */
  (function buildDoc() {
    var el = $("#doc-card");
    if (p.doc) {
      el.innerHTML = "<div class='doc-icon'>PDF</div><div class='doc-meta'><h4>" + esc(p.doc.label || "Project Documentation") +
        "</h4><p>" + esc(p.doc.size || "PDF document") + "</p></div>" +
        "<a class='btn btn-primary magnetic' href='" + esc(p.doc.href) + "' target='_blank' rel='noopener'>&darr; Download</a>";
    } else {
      el.innerHTML = "<div class='doc-icon' style='opacity:.6'>PDF</div><div class='doc-meta'><h4>Project Documentation</h4>" +
        "<p>Standby — PDF documentation will be attached.</p></div><span class='btn btn-ghost disabled'>Pending</span>";
    }
  })();

  /* ---------- REVEAL (self-contained) ---------- */
  (function reveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (reduceMotion || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- year ---------- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
