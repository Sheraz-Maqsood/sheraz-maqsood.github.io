/* ============================================================
   ARC // Project Dossier engine — data-driven detail pages
   URL:  project.html?id=<slug>
   Layout order (blog-style):  Video(s) → Screenshot gallery → PDF docs
   To customize a project: edit the PROJECTS map below.
     videos: [{ src, label }]     one or more .mp4 demos (played inline)
     shots : [{ src, cap }]       screenshots (scrollable gallery + lightbox)
     docs  : [{ href, label }]    zero or more PDF documents
     poster: still image shown before a video plays
     domain: "https://..."  | null  (live site, may be offline)
   Back-compat: single `video` / `doc` still supported.
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var DUMMY = "assets/projects/_dummy/";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Helper: build an ordered list of screenshot objects for a project dir */
  function mkShots(dir, n, ext) {
    ext = ext || "webp";
    var out = [];
    for (var i = 1; i <= n; i++) {
      var nn = (i < 10 ? "0" : "") + i;
      out.push({ src: dir + "shot-" + nn + "." + ext, cap: "Frame " + nn });
    }
    return out;
  }

  /* ---------- DATA ---------- */
  var PROJECTS = {
    "lte": {
      code: "SYS-01", title: ["Linear Tree", "Enumeration System"], hl: 1,
      tagline: "A GIS-driven platform to enumerate, track and analyze linear tree plantations along roads, canals and forest boundaries — high-performance spatial queries over very large datasets.",
      year: "2025", sector: "Government / Forestry",
      domain: "https://punjabtreeenumeration.com",
      poster: "assets/projects/lte/shot-01.webp",
      videos: [
        { src: "assets/projects/lte/video-01.mp4", label: "Platform walkthrough" },
        { src: "assets/projects/lte/video-02.mp4", label: "Field & reporting flow" }
      ],
      shots: mkShots("assets/projects/lte/", 27),
      docs: [
        { href: "assets/projects/lte/doc-04.pdf", label: "Division-Wise Report" },
        { href: "assets/projects/lte/doc-05.pdf", label: "Enumeration Aggregate Report" },
        { href: "assets/projects/lte/doc-01.pdf", label: "Field Report A" },
        { href: "assets/projects/lte/doc-02.pdf", label: "Field Report B" },
        { href: "assets/projects/lte/doc-03.pdf", label: "Field Report C" }
      ],
      overview: "Built to enumerate and monitor linear plantations at provincial scale, the LTE platform combines interactive geospatial visualization with optimized spatial querying so field and admin users can track millions of records without performance loss.",
      highlights: ["Interactive map rendering with layered overlays", "High-performance spatial queries on large datasets", "Role-based access across government hierarchy", "QR-based geospatial tagging of records"],
      stack: ["Next.js", "NestJS", "PostgreSQL", "PostGIS", "Leaflet", "CI/CD"]
    },
    "cms": {
      code: "SYS-02", title: ["Complaint", "Management System"], hl: 0,
      tagline: "Multi-role routing platform for forest incidents with WhatsApp API alerts to Conservators and DFOs.",
      year: "2025", sector: "Government / Workflow",
      domain: "https://cms.gisforestry.com",
      poster: "assets/projects/cms/shot-01.webp",
      videos: [
        { src: "assets/projects/cms/video-01.mp4", label: "System demonstration" }
      ],
      shots: mkShots("assets/projects/cms/", 14),
      docs: [
        { href: "assets/projects/cms/doc-01.pdf", label: "Example Complaint Report" }
      ],
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
      poster: "assets/projects/ppms/shot-01.webp",
      videos: [
        { src: "assets/projects/ppms/video-01.mp4", label: "Platform demonstration" }
      ],
      shots: mkShots("assets/projects/ppms/", 18),
      docs: [],
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

  /* Normalize to arrays (back-compat with single video / doc) */
  var VIDEOS = (p.videos && p.videos.length) ? p.videos : (p.video ? [{ src: p.video, label: "" }] : []);
  var DOCS = (p.docs && p.docs.length) ? p.docs : (p.doc ? [p.doc] : []);

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
    "<span class='p-chip'>" + p.stack.length + " TECH MODULES</span>" +
    (VIDEOS.length ? "<span class='p-chip'>" + VIDEOS.length + " VIDEO" + (VIDEOS.length > 1 ? "S" : "") + "</span>" : "");

  /* ---------- ACTIONS ---------- */
  var actions = "";
  if (p.domain) actions += "<a class='btn btn-primary magnetic' href='" + esc(p.domain) + "' target='_blank' rel='noopener'>&#9673; Visit Live Platform</a>";
  if (DOCS.length) actions += "<a class='btn btn-ghost magnetic' href='" + esc(DOCS[0].href) + "' target='_blank' rel='noopener'>&darr; Documentation (PDF)</a>";
  actions += "<a class='btn btn-ghost magnetic' href='index.html#projects'>&larr; All systems</a>";
  $("#p-actions").innerHTML = actions;

  /* ---------- VIDEO PLAYER(S) ---------- */
  (function buildVideo() {
    var rack = $("#video-stage");
    rack.classList.remove("video-stage");
    rack.className = "video-rack";

    function corners() { return "<span class='v-corner v-tl'></span><span class='v-corner v-tr'></span><span class='v-corner v-bl'></span><span class='v-corner v-br'></span>"; }
    function timeline() { return "<div class='v-timeline'><span>00:00</span><span class='bar'><i></i></span><span>LIVE</span></div>"; }
    function topbar(label, idx) {
      return "<div class='v-hud-top'><span class='v-rec'><i></i> REC &middot; " + esc(p.code) +
        (VIDEOS.length > 1 ? " &middot; " + (idx + 1) + "/" + VIDEOS.length : "") + "</span>" +
        "<span>" + (label ? esc(label) : "CH-0" + (idx + 1) + " // DEMO REEL") + "</span></div>";
    }

    if (!VIDEOS.length) {
      var st = document.createElement("div");
      st.className = "video-stage";
      st.innerHTML = corners() + topbar("", 0) +
        "<div class='v-poster' style=\"background-image:url('" + esc(p.poster) + "')\"></div>" +
        "<button class='v-playbtn' aria-label='Video pending'><span class='ring'><span class='tri'></span></span><span class='lbl v-standby'>Video proof &middot; standby</span></button>" +
        timeline();
      st.querySelector(".v-playbtn").addEventListener("click", function () {
        st.querySelector(".lbl").textContent = "Upload pending — attach your .mp4";
      });
      rack.appendChild(st);
      return;
    }

    VIDEOS.forEach(function (vObj, idx) {
      var st = document.createElement("div");
      st.className = "video-stage";
      st.innerHTML = corners() + topbar(vObj.label, idx) +
        "<video poster='" + esc(p.poster) + "' preload='none' playsinline></video>" +
        "<button class='v-playbtn' aria-label='Play video'><span class='ring'><span class='tri'></span></span><span class='lbl'>Play " + (vObj.label ? esc(vObj.label) : "demo") + "</span></button>" +
        timeline();
      var v = st.querySelector("video");
      var src = document.createElement("source"); src.src = vObj.src; src.type = "video/mp4"; v.appendChild(src);
      var btn = st.querySelector(".v-playbtn");
      btn.addEventListener("click", function () { v.setAttribute("controls", ""); v.play(); btn.style.display = "none"; });
      rack.appendChild(st);
    });
  })();

  /* ---------- SCREENSHOT GALLERY (scrollable) + LIGHTBOX ---------- */
  (function buildGallery() {
    var host = $("#shot-grid");
    host.classList.remove("shot-grid");
    host.className = "gallery";

    var figures = p.shots.map(function (s, i) {
      var nn = (i < 9 ? "0" : "") + (i + 1);
      return "<figure class='shot' data-idx='" + i + "' data-full='" + esc(s.src) + "' tabindex='0' aria-label='" + esc(s.cap || ("View " + nn)) + "'>" +
        "<span class='zoom'>&#9974;</span>" +
        "<img src='" + esc(s.src) + "' alt='" + esc(p.title.join(" ")) + " — " + esc(s.cap || nn) + "' loading='lazy'>" +
        "<figcaption class='cap'>" + nn + " &middot; " + esc(s.cap || "View") + "</figcaption></figure>";
    }).join("");

    host.innerHTML =
      "<button class='g-nav g-prev' aria-label='Previous screenshots'>&lsaquo;</button>" +
      "<div class='g-track' id='g-track'>" + figures + "</div>" +
      "<button class='g-nav g-next' aria-label='Next screenshots'>&rsaquo;</button>" +
      "<div class='g-count' id='g-count'></div>";

    var track = $("#g-track");
    var prev = host.querySelector(".g-prev");
    var next = host.querySelector(".g-next");
    var count = $("#g-count");
    count.textContent = p.shots.length + " frames · scroll or drag";

    function step() {
      var card = track.querySelector(".shot");
      return card ? card.getBoundingClientRect().width + 16 : 320;
    }
    function updateNav() {
      var maxS = track.scrollWidth - track.clientWidth - 2;
      prev.classList.toggle("off", track.scrollLeft <= 2);
      next.classList.toggle("off", track.scrollLeft >= maxS);
    }
    prev.addEventListener("click", function () { track.scrollBy({ left: -step() * 1.5, behavior: "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step() * 1.5, behavior: "smooth" }); });
    track.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    updateNav();

    /* drag-to-scroll (mouse) */
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("mousedown", function (e) { down = true; moved = false; sx = e.pageX; sl = track.scrollLeft; track.classList.add("drag"); });
    window.addEventListener("mousemove", function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener("mouseup", function () { down = false; track.classList.remove("drag"); });

    /* ---------- LIGHTBOX with prev / next ---------- */
    var lb = $("#lightbox"), lbImg = $("#lb-img");
    var cur = 0;
    if (lb && !lb.querySelector(".lb-prev")) {
      var bp = document.createElement("button"); bp.className = "lb-nav lb-prev"; bp.setAttribute("aria-label", "Previous"); bp.innerHTML = "&lsaquo;";
      var bn = document.createElement("button"); bn.className = "lb-nav lb-next"; bn.setAttribute("aria-label", "Next"); bn.innerHTML = "&rsaquo;";
      var cc = document.createElement("div"); cc.className = "lb-count"; cc.id = "lb-count";
      lb.appendChild(bp); lb.appendChild(bn); lb.appendChild(cc);
    }
    var lbPrev = lb.querySelector(".lb-prev"), lbNext = lb.querySelector(".lb-next"), lbCount = $("#lb-count");

    function show(i) {
      cur = (i + p.shots.length) % p.shots.length;
      lbImg.src = p.shots[cur].src;
      if (lbCount) lbCount.textContent = (cur + 1) + " / " + p.shots.length;
    }
    function open(i) { show(i); lb.classList.add("open"); }
    function close() { lb.classList.remove("open"); lbImg.src = ""; }

    Array.prototype.forEach.call(track.querySelectorAll(".shot"), function (el) {
      el.addEventListener("click", function () { if (moved) return; open(parseInt(el.getAttribute("data-idx"), 10)); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(parseInt(el.getAttribute("data-idx"), 10)); } });
    });
    if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
    if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
    $("#lb-close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
    });
  })();

  /* ---------- OVERVIEW + STACK ---------- */
  $("#p-overview").textContent = p.overview;
  $("#p-highlights").innerHTML = p.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("");
  $("#p-stack").innerHTML = p.stack.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");

  /* ---------- DOCUMENTATION CARD(S) ---------- */
  (function buildDocs() {
    var host = $("#doc-card");
    host.classList.remove("panel", "hud-frame", "doc-card");
    host.className = "doc-rack";
    if (DOCS.length) {
      host.innerHTML = DOCS.map(function (d) {
        return "<div class='panel hud-frame doc-card'>" +
          "<div class='doc-icon'>PDF</div>" +
          "<div class='doc-meta'><h4>" + esc(d.label || "Project Documentation") + "</h4>" +
          "<p>" + esc(d.size || "PDF document") + "</p></div>" +
          "<a class='btn btn-primary magnetic' href='" + esc(d.href) + "' target='_blank' rel='noopener'>&darr; Open</a></div>";
      }).join("");
    } else {
      host.innerHTML = "<div class='panel hud-frame doc-card'>" +
        "<div class='doc-icon' style='opacity:.6'>PDF</div>" +
        "<div class='doc-meta'><h4>Project Documentation</h4><p>No documents attached for this system.</p></div>" +
        "<span class='btn btn-ghost disabled'>None</span></div>";
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
