/* ============================================================
   ARC // JARVIS-class HUD Portfolio — Engine
   Boot · WebGL background · Anime.js · interactions · sound · easter eggs
   Defensive: every module guarded so one failure never blocks the rest.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  function hasAnime() { return typeof window.anime === "function"; }

  var state = { mx: 0.5, my: 0.5, soundOn: false, booted: false };

  /* ========== 1. BOOT SEQUENCE ========== */
  var boot = (function () {
    var el = $("#boot"), log = $("#boot-log"), bar = $("#boot-bar-fill"), skip = $("#boot-skip");
    if (!el) return { finish: function () {} };

    var lines = [
      ["INITIALIZING ARC OPERATING SYSTEM"],
      ["Booting kernel ............ <span class='ok'>OK</span>"],
      ["Loading neural modules .... <span class='ok'>OK</span>"],
      ["Mounting GIS subsystems ... <span class='ok'>OK</span>"],
      ["Scanning developer ........ <span class='ok'>IDENTIFIED</span>"],
      ["Identity: <span class='hl'>MALIK SHERAZ MAQSOOD AHMED</span>"],
      ["Clearance: <span class='hl'>PRINCIPAL ENGINEER</span>"],
      ["Neural network ............ <span class='ok'>CONNECTED</span>"],
      ["<span class='ok'>ACCESS GRANTED — ASSEMBLING HUD</span>"]
    ];

    var done = false;
    function finish() {
      if (done) return; done = true;
      el.classList.add("done");
      state.booted = true;
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("arc:booted"));
      setTimeout(function () { el.remove(); }, 520);
    }

    /* Repeat visitors skip the boot — instant access on return */
    var seenBoot = false;
    try { seenBoot = localStorage.getItem("arcBooted") === "1"; localStorage.setItem("arcBooted", "1"); } catch (err) {}
    if (seenBoot) {
      if (bar) bar.style.width = "100%";
      if (skip) skip.style.display = "none";
      setTimeout(finish, 120);
      return { finish: finish };
    }

    if (reduceMotion) {
      log.innerHTML = lines.map(function (l) { return "<div class='line' style='opacity:1'>" + l[0] + "</div>"; }).join("");
      if (bar) bar.style.width = "100%";
      if (skip) skip.style.display = "none";
      setTimeout(finish, 200);
      return { finish: finish };
    }

    document.body.style.overflow = "hidden";
    var i = 0;
    function next() {
      if (done) return;
      if (i >= lines.length) { setTimeout(finish, 240); return; }
      var d = document.createElement("div");
      d.className = "line";
      d.innerHTML = "› " + lines[i][0];
      log.appendChild(d);
      if (hasAnime()) anime({ targets: d, opacity: [0, 1], translateX: [-10, 0], duration: 150, easing: "easeOutQuad" });
      else d.style.opacity = 1;
      var pct = Math.round(((i + 1) / lines.length) * 100);
      if (bar) { if (hasAnime()) anime({ targets: bar, width: pct + "%", duration: 200, easing: "easeOutQuad" }); else bar.style.width = pct + "%"; }
      i++;
      setTimeout(next, 55 + Math.random() * 45);
    }
    setTimeout(next, 120);
    if (skip) skip.addEventListener("click", finish);
    setTimeout(finish, 3200);
    return { finish: finish };
  })();

  /* ========== 2. WEBGL PARTICLE UNIVERSE ========== */
  function initWebGL() {
    var canvas = $("#webgl-bg");
    if (!canvas || reduceMotion || innerWidth < 700) return;   /* skip decorative 3D on phones */
    if (typeof window.THREE !== "undefined") { try { buildWebGL(canvas); } catch (e) {} return; }
    var sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    sc.async = true;
    sc.onload = function () { try { buildWebGL(canvas); } catch (e) {} };
    document.head.appendChild(sc);
  }
  function buildWebGL(canvas) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 1, 1400);
    camera.position.z = 420;

    var COUNT = innerWidth < 700 ? 900 : 1700;
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(COUNT * 3);
    var col = new Float32Array(COUNT * 3);
    var cyan = new THREE.Color(0x38e0ff), gold = new THREE.Color(0xffc46b), blue = new THREE.Color(0x1d6fff);
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 1600;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1200;
      var c = Math.random() < 0.12 ? gold : (Math.random() < 0.4 ? blue : cyan);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(260, 2, 8, 90),
      new THREE.MeshBasicMaterial({ color: 0x38e0ff, wireframe: true, transparent: true, opacity: 0.08 })
    );
    ring.position.z = -300; scene.add(ring);

    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    }
    resize();
    addEventListener("resize", resize, { passive: true });

    var raf, running = true, t = 0;
    function render() {
      if (!running) return;
      t += 0.0016;
      points.rotation.y = t * 0.5;
      points.rotation.x = Math.sin(t * 0.3) * 0.08;
      ring.rotation.x = t * 0.6; ring.rotation.y = t * 0.4;
      camera.position.x += ((state.mx - 0.5) * 160 - camera.position.x) * 0.04;
      camera.position.y += (-(state.my - 0.5) * 120 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    }
    render();
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) render(); else cancelAnimationFrame(raf);
    });
  }

  /* ========== 3. HEADER + SCROLL PROGRESS + ACTIVE NAV ========== */
  function initScroll() {
    var header = $("#header"), prog = $("#scroll-progress");
    var navLinks = $$(".nav a");
    var sections = navLinks.map(function (a) { var h = a.getAttribute("href"); return (h && h.charAt(0) === "#") ? $(h) : null; }).filter(Boolean);
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = scrollY;
        if (header) header.classList.toggle("scrolled", y > 40);
        if (prog) {
          var h = document.documentElement.scrollHeight - innerHeight;
          prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
        }
        var cur = null;
        for (var i = 0; i < sections.length; i++) { if (sections[i].offsetTop - 140 <= y) cur = sections[i]; }
        navLinks.forEach(function (a) {
          var active = !!cur && a.getAttribute("href") === "#" + cur.id;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
        ticking = false;
      });
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ========== 4. MOBILE NAV ========== */
  function initMobileNav() {
    var t = $("#nav-toggle"), m = $("#mobile-nav");
    if (!t || !m) return;
    var page = $("#main"), foot = $(".foot"), previousOverflow = "";
    function toggle(open, restoreFocus) {
      if (open) previousOverflow = document.body.style.overflow;
      m.classList.toggle("open", open);
      m.setAttribute("aria-hidden", String(!open));
      m.inert = !open;
      t.setAttribute("aria-expanded", String(open));
      t.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (page) page.inert = open;
      if (foot) foot.inert = open;
      document.body.style.overflow = open ? "hidden" : previousOverflow;
      if (open) m.querySelector("a").focus();
      else if (restoreFocus !== false) t.focus();
    }
    t.addEventListener("click", function () { toggle(!m.classList.contains("open")); });
    $$("#mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle(false, false);
        var href = a.getAttribute("href");
        var target = href.charAt(0) === "#" ? $(href) : null;
        if (target) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
        else t.focus();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (!m.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); toggle(false); }
      if (e.key === "Tab") {
        var items = [t].concat($$("a", m));
        var index = items.indexOf(document.activeElement);
        e.preventDefault();
        items[(index + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
      }
    });
    addEventListener("resize", function () {
      if (innerWidth > 1180 && m.classList.contains("open")) toggle(false, false);
    });
  }

  /* ========== 5. MOUSE: cursor reticle + panel sheen + parallax vars ========== */
  function initMouse() {
    document.documentElement.style.setProperty("--mx", "0.5");
    if (isTouch) { var cc = $(".cursor-reticle"); if (cc) cc.style.display = "none"; }
    var reticle = $(".cursor-reticle");
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", function (e) {
      state.mx = e.clientX / innerWidth; state.my = e.clientY / innerHeight;
      document.documentElement.style.setProperty("--mx", state.mx.toFixed(3));
      document.documentElement.style.setProperty("--my", state.my.toFixed(3));
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    if (reticle && !isTouch && !reduceMotion) {
      (function loop() {
        cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
        reticle.style.setProperty("--cx", cx + "px");
        reticle.style.setProperty("--cy0", cy + "px");
        requestAnimationFrame(loop);
      })();
      var hot = "a,button,.proj,.skill-node,.assistant-orb,[tabindex],[data-gallery]";
      document.addEventListener("mouseover", function (e) { if (e.target.closest(hot)) document.body.classList.add("cursor-hot"); });
      document.addEventListener("mouseout",  function (e) { if (e.target.closest(hot)) document.body.classList.remove("cursor-hot"); });
    }

    $$(".panel").forEach(function (p) {
      p.addEventListener("mousemove", function (e) {
        var r = p.getBoundingClientRect();
        p.style.setProperty("--px", ((e.clientX - r.left) / r.width) * 100 + "%");
        p.style.setProperty("--py", ((e.clientY - r.top) / r.height) * 100 + "%");
      }, { passive: true });
    });
  }

  /* ========== 6. MAGNETIC BUTTONS ========== */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + (mx * 0.25) + "px," + (my * 0.35) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ========== 7. REVEAL ON SCROLL + COUNTERS ========== */
  function initReveal() {
    var items = $$("[data-reveal], [data-stagger]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("in");
        if (el.hasAttribute("data-stagger") && hasAnime()) {
          anime({ targets: el.children, translateY: [24, 0], opacity: [0, 1], delay: anime.stagger(80), duration: 620, easing: "easeOutCubic" });
        }
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });

    $$("[data-count]").forEach(function (el) {
      var target = +el.getAttribute("data-count");
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (hasAnime()) {
            var o = { v: 0 };
            anime({ targets: o, v: target, duration: 1600, easing: "easeOutExpo", round: 1, update: function () { el.textContent = o.v; } });
          } else el.textContent = target;
          cio.unobserve(el);
        });
      }, { threshold: 0.6 });
      cio.observe(el);
    });
  }

  /* ========== 8. ROLE TYPEWRITER ========== */
  function initTyper() {
    var el = $("#role-type");
    if (!el) return;
    var roles = ["Principal Full-Stack Engineer", "Cloud & DevOps Architect", "Laravel · NestJS Specialist", "React · Next.js Engineer", "GIS / Geospatial Systems", "Linux / Ubuntu Server Admin", "I love programming — ready to start now"];
    if (reduceMotion) { el.textContent = roles[0]; return; }
    var r = 0, c = 0, del = false;
    (function tick() {
      var word = roles[r];
      el.textContent = word.slice(0, c);
      if (!del && c < word.length) { c++; setTimeout(tick, 55); }
      else if (!del && c === word.length) { del = true; setTimeout(tick, 1600); }
      else if (del && c > 0) { c--; setTimeout(tick, 28); }
      else { del = false; r = (r + 1) % roles.length; setTimeout(tick, 300); }
    })();
  }

  /* ========== 9. HERO ORBIT CHIPS ========== */
  function initOrbit() {
    var reactor = $(".reactor");
    var chips = $$(".orbit-chip");
    if (!reactor || !chips.length) return;
    var N = chips.length, t = 0, raf;
    function frame() {
      var R = reactor.clientWidth * 0.46;
      t += reduceMotion ? 0 : 0.0024;
      chips.forEach(function (chip, i) {
        var a = (i / N) * Math.PI * 2 + t;
        var x = Math.cos(a) * R, y = Math.sin(a) * R * 0.62;
        chip.style.transform = "translate(-50%,-50%) translate(" + x + "px," + y + "px)";
        chip.style.opacity = 0.55 + 0.45 * ((Math.sin(a) + 1) / 2);
      });
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduceMotion) frame(); else cancelAnimationFrame(raf); });
  }

  /* ========== 10. SKILLS GALAXY ========== */
  var SKILLS = [
    { n: "Laravel",     ring: 1, exp: "6+ yrs", proj: "AMS · Shopaholics · CMH portals", conf: "Expert", gold: true },
    { n: "PHP 8.x",     ring: 1, exp: "6+ yrs", proj: "Enterprise back-ends", conf: "Expert" },
    { n: "React",       ring: 1, exp: "4+ yrs", proj: "Complaint Mgmt · dashboards", conf: "Advanced", gold: true },
    { n: "Next.js",     ring: 2, exp: "3+ yrs", proj: "Linear Tree Enumeration", conf: "Advanced" },
    { n: "Node.js",     ring: 2, exp: "4+ yrs", proj: "CMS · realtime services", conf: "Advanced" },
    { n: "NestJS",      ring: 2, exp: "2+ yrs", proj: "LTE back-end", conf: "Advanced", gold: true },
    { n: "PostgreSQL",  ring: 1, exp: "5+ yrs", proj: "PostGIS spatial datasets", conf: "Expert" },
    { n: "MySQL",       ring: 2, exp: "6+ yrs", proj: "Most production DBs", conf: "Expert" },
    { n: "MongoDB",     ring: 3, exp: "3+ yrs", proj: "Complaint Management", conf: "Proficient" },
    { n: "Leaflet GIS", ring: 1, exp: "2+ yrs", proj: "Forestry spatial suite", conf: "Advanced", gold: true },
    { n: "AWS",         ring: 3, exp: "3+ yrs", proj: "Cloud deployments", conf: "Proficient" },
    { n: "CI/CD",       ring: 2, exp: "4+ yrs", proj: "GitHub Actions pipelines", conf: "Advanced" },
    { n: "Docker",      ring: 3, exp: "3+ yrs", proj: "Containerized services", conf: "Proficient" },
    { n: "Vue.js",      ring: 3, exp: "2+ yrs", proj: "Client SPAs", conf: "Proficient" },
    { n: "Electron",    ring: 3, exp: "3+ yrs", proj: "Desktop tools", conf: "Proficient" },
    { n: "Java/Android",ring: 3, exp: "3+ yrs", proj: "Firebase mobile apps", conf: "Proficient" },
    { n: "FastAPI",     ring: 2, exp: "Production", proj: "Python REST services & integrations", conf: "Advanced", gold: true },
    { n: "C# WinForms/WPF", ring: 3, exp: "Since 2018", proj: "POS · Restaurant · Institute management apps", conf: "Proficient" },
    { n: "Arduino",     ring: 3, exp: "Hands-on", proj: "Sensors · I/O · embedded C/C++", conf: "Foundational" }
  ];
  /* Official logos for the constellation nodes (devicon / simple-icons CDN). inv = mono-dark logo, shown white */
  var DV = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";
  var SKILL_ICONS = {
    "Laravel": DV + "laravel/laravel-original.svg",
    "PHP 8.x": DV + "php/php-original.svg",
    "React": DV + "react/react-original.svg",
    "Next.js": [DV + "nextjs/nextjs-original.svg", 1],
    "Node.js": DV + "nodejs/nodejs-original.svg",
    "NestJS": DV + "nestjs/nestjs-original.svg",
    "PostgreSQL": DV + "postgresql/postgresql-original.svg",
    "MySQL": DV + "mysql/mysql-original.svg",
    "MongoDB": DV + "mongodb/mongodb-original.svg",
    "Leaflet GIS": ["https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/leaflet.svg", 1],
    "AWS": [DV + "amazonwebservices/amazonwebservices-original-wordmark.svg", 1],
    "CI/CD": DV + "githubactions/githubactions-original.svg",
    "Docker": DV + "docker/docker-original.svg",
    "Vue.js": DV + "vuejs/vuejs-original.svg",
    "Electron": DV + "electron/electron-original.svg",
    "Java/Android": DV + "android/android-original.svg",
    "FastAPI": DV + "fastapi/fastapi-original.svg",
    "C# WinForms/WPF": DV + "csharp/csharp-original.svg",
    "Arduino": DV + "arduino/arduino-original.svg"
  };
  function initGalaxy() {
    var g = $("#galaxy"), readout = $("#skill-readout"), list = $("#skill-list");
    if (list) list.innerHTML = SKILLS.map(function (s) {
      return "<div class='si panel'><b>" + s.n + "</b><span>" + s.conf + " · " + s.exp + "</span></div>";
    }).join("");
    if (!g) return;
    var hovered = false;
    g.addEventListener("mouseenter", function () { hovered = true; });
    g.addEventListener("mouseleave", function () { hovered = false; });
    var rings = { 1: 130, 2: 210, 3: 285 };
    /* --gscale (CSS) shrinks the orbit radii so the section fits short viewports */
    var gk = 1, ringEls = [];
    function readScale() { gk = parseFloat(getComputedStyle(g).getPropertyValue("--gscale")) || 1; }
    readScale();
    [130, 210, 285].forEach(function (r) {
      var d = document.createElement("div"); d.className = "galaxy-ring";
      d.style.width = (r * 2 * gk) + "px"; d.style.height = (r * 2 * gk * 0.78) + "px"; g.appendChild(d); ringEls.push([d, r]);
    });
    window.addEventListener("resize", function () {
      readScale();
      ringEls.forEach(function (x) { x[0].style.width = (x[1] * 2 * gk) + "px"; x[0].style.height = (x[1] * 2 * gk * 0.78) + "px"; });
      if (reduceMotion) frame();
    }, { passive: true });
    var perRing = { 1: [], 2: [], 3: [] };
    SKILLS.forEach(function (s) { perRing[s.ring].push(s); });
    var nodes = [];
    Object.keys(perRing).forEach(function (ring) {
      var arr = perRing[ring];
      arr.forEach(function (s, i) {
        var node = document.createElement("button");
        node.className = "skill-node" + (s.gold ? " gold" : "");
        var ic = SKILL_ICONS[s.n], icSrc = Array.isArray(ic) ? ic[0] : ic, icInv = Array.isArray(ic) && ic[1];
        node.innerHTML = "<span class='blip" + (icSrc ? " has-logo" : "") + "'>" +
          (icSrc ? "<img src='" + icSrc + "' alt='' width='22' height='22' loading='lazy' decoding='async'" + (icInv ? " class='inv'" : "") + ">" : "") +
          "</span><span class='sn-label'>" + s.n + "</span>";
        node.setAttribute("aria-label", s.n + ": " + s.conf + ", " + s.exp);
        var show = function () {
          if (readout) readout.innerHTML =
            "<span class='rk'>▸ " + s.n.toUpperCase() + "</span> &nbsp; EXPERIENCE: <b>" + s.exp +
            "</b> &nbsp;·&nbsp; CONFIDENCE: <b>" + s.conf + "</b><br><span class='rk'>PROJECTS:</span> " + s.proj;
          play("hover");
        };
        node.addEventListener("mouseenter", show);
        node.addEventListener("focus", show);
        node.addEventListener("click", show);
        g.appendChild(node);
        nodes.push({ el: node, ring: rings[ring], base: (i / arr.length) * Math.PI * 2, speed: ring === "1" ? 0.00045 : (ring === "2" ? -0.0003 : 0.0002) });
      });
    });
    var t = 0, raf;
    function frame() {
      /* Keep the constellation steady while someone reads or selects a node. */
      t += reduceMotion || hovered || g.contains(document.activeElement) ? 0 : 16;
      nodes.forEach(function (o) {
        var a = o.base + t * o.speed;
        o.el.style.transform = "translate(-50%,-50%) translate(" + (Math.cos(a) * o.ring * gk) + "px," + (Math.sin(a) * o.ring * gk * 0.78) + "px)";
      });
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduceMotion) frame(); else cancelAnimationFrame(raf); });
  }

  /* ========== 11. PROJECT NAV ========== */
  function initProjects() {
    $$(".proj[data-href]").forEach(function (p) {
      var go = function () { play("select"); var href = p.getAttribute("data-href"); if (/^https?:/i.test(href)) window.open(href, "_blank", "noopener"); else window.location.href = href; };
      p.addEventListener("click", function (e) { if (!e.target.closest("a, button, input")) go(); });
      p.addEventListener("keydown", function (e) { if (e.target === p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(); } });
    });
    $$(".proj").forEach(function (p) { p.addEventListener("mouseenter", function () { play("hover"); }); });
  }

  /* ========== 11b. EXPERIENCE role tabs (desktop: one role at a time, fits one viewport) ========== */
  function initExpTabs() {
    var sec = $("#experience"), rail = sec && $(".rail", sec);
    if (!rail) return;
    var stations = $$(".station", rail);
    if (stations.length < 2) return;
    /* The "Worldwide client missions" panel becomes the last tab */
    var wo = $(".world-ops", sec);
    if (wo) stations.push(wo);
    var mq = window.matchMedia("(min-width: 1100px)");
    var nav = document.createElement("div");
    nav.className = "rail-tabs-nav";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Experience roles");
    var tabs = stations.map(function (st, i) {
      var h = $(".exp-head h3", st), org = $(".exp-head .org", st), when = $(".exp-head .when", st);
      if (!st.id) st.id = "exp-station-" + (i + 1);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rt-tab" + (st.classList.contains("now") ? " now" : "");
      b.id = "exp-tab-" + (i + 1);
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", st.id);
      var isWo = st === wo;
      b.innerHTML = "<span class='rt-when'>" + (isWo ? "2020 — 2025 · Remote" : (when ? when.textContent : "")) + "</span><b>" +
        (isWo ? "Worldwide client missions" : (h ? h.textContent : "")) + "</b><span class='rt-org'>" +
        (isWo ? "Italy · Canada · USA · India · Pakistan" : (org ? org.textContent : "")) + "</span>";
      b.addEventListener("click", function () { select(i, true); play("select"); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = stations.length, j = -1;
        if (k === "ArrowDown" || k === "ArrowRight") j = (i + 1) % n;
        else if (k === "ArrowUp" || k === "ArrowLeft") j = (i - 1 + n) % n;
        else if (k === "Home") j = 0; else if (k === "End") j = n - 1;
        if (j < 0) return;
        e.preventDefault(); select(j, true); tabs[j].focus();
      });
      nav.appendChild(b);
      return b;
    });
    rail.parentNode.insertBefore(nav, rail);
    function select(i) {
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      stations.forEach(function (s, j) { s.classList.toggle("rt-active", j === i); });
      stations[i].scrollTop = 0;
    }
    function apply() {
      var on = mq.matches;
      sec.classList.toggle("exp-tabs", on);
      stations.forEach(function (s, i) {
        if (on) { s.setAttribute("role", "tabpanel"); s.setAttribute("aria-labelledby", tabs[i].id); }
        else { s.removeAttribute("role"); s.removeAttribute("aria-labelledby"); }
      });
    }
    if (mq.addEventListener) mq.addEventListener("change", apply); else if (mq.addListener) mq.addListener(apply);
    apply();
    select(0);
  }

  /* ========== 11c. SECTION RAIL (right-side 00–08 index) ========== */
  function initSectionRail() {
    var defs = [
      [".hero", "Intro"], ["#about", "Identity"], ["#profile", "Profile"], ["#skills", "Constellation"],
      ["#stack", "Arsenal"], ["#experience", "Experience"], ["#projects", "Projects"],
      ["#education", "Education"], ["#contact", "Contact"]
    ];
    var items = defs.map(function (d) { return { el: $(d[0]), label: d[1] }; }).filter(function (x) { return x.el; });
    if (items.length < 3) return;
    var nav = document.createElement("nav");
    nav.className = "sec-rail";
    nav.setAttribute("aria-label", "Section index");
    var ol = document.createElement("ol");
    items.forEach(function (it, i) {
      var num = (i < 10 ? "0" : "") + i;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = it.el.id ? "#" + it.el.id : "#";
      a.innerHTML = "<span class='sr-label'>" + it.label + "</span><span class='sr-num'>" + num + "</span><span class='sr-dash' aria-hidden='true'></span>";
      a.setAttribute("aria-label", num + " " + it.label);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (i === 0) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        else it.el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        play("select");
      });
      it.a = a;
      li.appendChild(a); ol.appendChild(li);
    });
    nav.appendChild(ol);
    document.body.appendChild(nav);
    var current = -1, ticking = false;
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.4, idx = 0;
      items.forEach(function (it, i) { if (it.el.getBoundingClientRect().top <= line) idx = i; });
      if (idx === current) return;
      current = idx;
      items.forEach(function (it, i) {
        it.a.classList.toggle("on", i === idx);
        if (i === idx) it.a.setAttribute("aria-current", "true"); else it.a.removeAttribute("aria-current");
      });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ========== 11d. SECTION PAGER — one wheel gesture = next / previous section (desktop) ========== */
  function initSectionPager() {
    var mq = window.matchMedia("(min-width: 1100px) and (min-height: 600px)");
    var sels = [".hero", "#about", "#profile", "#skills", "#stack", "#experience", "#projects", "#education", "#contact"];
    var secs = sels.map(function (q) { return $(q); }).filter(Boolean);
    var foot = $(".foot");
    if (secs.length < 3) return;
    var OFFSET = 100;                 /* matches html { scroll-padding-top } (fixed nav) */
    var busy = false, quietTimer = 0, acc = 0, accTimer = 0;

    /* layout position (ignores reveal transforms, unlike getBoundingClientRect) */
    function docTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
    function targetY(i) {
      if (i <= 0) return 0;
      if (i >= secs.length) return document.documentElement.scrollHeight - window.innerHeight;
      return Math.max(0, docTop(secs[i]) - OFFSET);
    }
    function currentIndex() {
      var line = OFFSET + 40, idx = 0;
      secs.forEach(function (s, i) { if (docTop(s) - window.pageYOffset <= line) idx = i; });
      return idx;
    }
    function animateTo(y) {
      busy = true;
      var root = document.documentElement, prevSB = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";          /* CSS smooth-scroll would fight the per-frame steps */
      var start = window.pageYOffset, dist = y - start, t0 = performance.now();
      var dur = reduceMotion ? 0 : Math.min(900, 520 + Math.abs(dist) * 0.12);
      function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      function step(now) {
        var t = dur ? Math.min(1, (now - t0) / dur) : 1;
        window.scrollTo(0, start + dist * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else {
          root.style.scrollBehavior = prevSB;
          clearTimeout(quietTimer); quietTimer = setTimeout(function () { busy = false; }, 220);
        }
      }
      requestAnimationFrame(step);
    }
    /* Let inner scrollers (experience panel, modals, galleries) keep their own scroll */
    function innerCanScroll(el, dy) {
      while (el && el !== document.body && el !== document.documentElement) {
        var cs = getComputedStyle(el), oy = cs.overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
          if (dy < 0 && el.scrollTop > 0) return true;
        }
        el = el.parentElement;
      }
      return false;
    }
    function go(dir) {
      var i = currentIndex(), cur = secs[i], vh = window.innerHeight;
      var top = docTop(cur) - window.pageYOffset, r = { top: top, bottom: top + cur.offsetHeight };
      var contentBottom = r.bottom - (parseFloat(getComputedStyle(cur).paddingBottom) || 0);
      /* a section taller than the screen scrolls natively until its content edge is reached */
      if (dir > 0 && contentBottom > vh + 40 && i < secs.length) return false;
      if (dir < 0 && r.top < OFFSET - 40 && i > 0) {
        /* section start is above the fold: tall sections scroll natively, others snap back to their own start */
        if (contentBottom - r.top > vh - OFFSET + 40) return false;
        animateTo(targetY(i)); return true;
      }
      var next = i + dir;
      if (next < 0) return true;
      if (next >= secs.length) {               /* past contact: reveal the footer */
        if (!foot) return true;
        var end = document.documentElement.scrollHeight - vh;
        if (window.pageYOffset >= end - 2) return true;
        animateTo(end); return true;
      }
      animateTo(targetY(next));
      return true;
    }
    window.addEventListener("wheel", function (e) {
      if (!mq.matches || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (document.body.style.overflow === "hidden") return;      /* boot screen / modal open */
      if (innerCanScroll(e.target, e.deltaY)) return;
      var dir = e.deltaY > 0 ? 1 : -1;
      /* past contact the footer scrolls freely */
      if (dir > 0 && currentIndex() === secs.length - 1 && secs[secs.length - 1].getBoundingClientRect().bottom <= window.innerHeight + 8 &&
          window.pageYOffset >= document.documentElement.scrollHeight - window.innerHeight - 2) return;
      e.preventDefault();
      if (busy) { clearTimeout(quietTimer); quietTimer = setTimeout(function () { busy = false; }, 220); return; }
      acc += e.deltaY;
      clearTimeout(accTimer); accTimer = setTimeout(function () { acc = 0; }, 160);
      if (Math.abs(acc) < 30) return;
      acc = 0;
      if (!go(dir)) window.scrollBy({ top: e.deltaY, behavior: "auto" });
    }, { passive: false });
    document.addEventListener("keydown", function (e) {
      if (!mq.matches || busy || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      if (document.body.style.overflow === "hidden") return;
      var dir = (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) ? 1 :
                (e.key === "PageUp" || (e.key === " " && e.shiftKey)) ? -1 : 0;
      if (!dir) return;
      if (go(dir)) e.preventDefault();
    });
  }

  /* ========== 12. CONTACT terminal typer + waveform ========== */
  function initContact() {
    var wave = $("#contact-wave");
    if (wave) for (var i = 0; i < 40; i++) { var b = document.createElement("i"); b.style.animationDelay = (i * 0.04) + "s"; wave.appendChild(b); }
    var t = $("#contact-type");
    if (t) {
      var msg = 'reply --to "sherii55055@gmail.com" --priority high';
      if (reduceMotion) { t.textContent = msg; return; }
      var c = 0;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          (function tick() { t.textContent = msg.slice(0, c); if (c++ < msg.length) setTimeout(tick, 45); })();
          io.disconnect();
        });
      }, { threshold: 0.4 });
      io.observe(t.closest("section"));
    }

    var copyBtn = $("#copy-email-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var email = copyBtn.getAttribute("data-email") || "sherii55055@gmail.com";
        navigator.clipboard.writeText(email);
        var txt = $("#copy-email-text");
        if (txt) {
          var orig = txt.textContent;
          txt.textContent = "COPIED TO CLIPBOARD!";
          setTimeout(function () { txt.textContent = orig; }, 2200);
        }
      });
    }
  }

  /* ========== 13. SOUND (Web Audio, synth, muted by default) ========== */
  var actx = null;
  function ensureCtx() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return actx; }
  function play(type) {
    if (!state.soundOn) return;
    var ctx = ensureCtx(); if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    var map = {
      hover:  { f: 880,  type: "sine",     v: 0.04, d: 0.07 },
      select: { f: 540,  type: "triangle", v: 0.07, d: 0.14 },
      ping:   { f: 1200, type: "sine",     v: 0.05, d: 0.25 },
      boot:   { f: 320,  type: "sawtooth", v: 0.06, d: 0.4 }
    };
    var cfg = map[type] || { f: 700, type: "sine", v: 0.04, d: 0.08 };
    o.type = cfg.type; o.frequency.setValueAtTime(cfg.f, now);
    o.frequency.exponentialRampToValueAtTime(cfg.f * 1.5, now + cfg.d);
    g.gain.setValueAtTime(cfg.v, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + cfg.d);
    o.start(now); o.stop(now + cfg.d);
  }
  function initSound() {
    var btn = $("#sound-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      state.soundOn = !state.soundOn;
      btn.classList.toggle("active", state.soundOn);
      btn.setAttribute("aria-pressed", String(state.soundOn));
      if (state.soundOn) { ensureCtx(); play("ping"); }
    });
  }

  /* ========== 14. AI ASSISTANT ========== */
  function initAssistant() {
    var orb = $("#assistant-orb"), bubble = $("#assistant-bubble"), text = $("#assistant-text"), close = $("#assistant-close");
    if (!orb || !bubble) return;
    var greetings = [
      "Greetings, operator. I'm ARC — Sheraz's interface guide. Scroll to explore his deployed systems.",
      "Tip: hover the tech constellation to query experience on any technology.",
      "Looking for government-scale GIS work? The Linear Tree Enumeration System is his flagship.",
      "Need to reach Sheraz? Open the transmission terminal below — email or WhatsApp, encrypted and ready.",
      "Psst… try the Konami code (up up down down left right left right B A) for dark protocol."
    ];
    var idx = 0, open = false;
    function typeInto(str) {
      orb.classList.add("speaking");
      if (reduceMotion) { text.textContent = str; orb.classList.remove("speaking"); return; }
      var c = 0; text.textContent = "";
      (function tick() {
        text.textContent = str.slice(0, c);
        if (c++ < str.length) setTimeout(tick, 22);
        else setTimeout(function () { orb.classList.remove("speaking"); }, 200);
      })();
    }
    function speak(str) { bubble.classList.remove("hidden"); open = true; play("ping"); typeInto(str); }
    orb.addEventListener("click", function () {
      if (open && bubble.classList.contains("hidden") === false) { idx = (idx + 1) % greetings.length; speak(greetings[idx]); }
      else speak(greetings[idx]);
    });
    if (close) close.addEventListener("click", function (e) { e.stopPropagation(); bubble.classList.add("hidden"); open = false; });
    window.addEventListener("arc:booted", function () { setTimeout(function () { speak(greetings[0]); }, 1400); }, { once: true });
  }

  /* ========== 15. EASTER EGGS: Konami -> matrix + console ========== */
  function initEasterEggs() {
    var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var pos = 0;
    var BACKTICK = String.fromCharCode(96);
    addEventListener("keydown", function (e) {
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (k === seq[pos]) ? pos + 1 : (k === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; activateDark(); }
      if (e.key === BACKTICK || (e.ctrlKey && e.key === "~")) toggleConsole();
    });

    var darkOn = false, rainRAF;
    var rain = $("#matrix-rain");
    function activateDark() {
      darkOn = !darkOn;
      if (!rain) return;
      rain.classList.toggle("on", darkOn);
      play("boot");
      if (darkOn) startRain(); else cancelAnimationFrame(rainRAF);
      assistantSay("⚠ DARK PROTOCOL ENGAGED. Welcome to the grid, operator.");
    }
    function startRain() {
      var ctx = rain.getContext("2d");
      var dpr = Math.min(devicePixelRatio, 1.5);
      function size() { rain.width = innerWidth * dpr; rain.height = innerHeight * dpr; }
      size(); addEventListener("resize", size, { passive: true });
      var fs = 16 * dpr, cols = Math.floor(rain.width / fs);
      var drops = []; for (var d0 = 0; d0 < cols; d0++) drops[d0] = Math.random() * -50;
      var chars = "アァカサタナハマヤラワ0123456789ABCDEF<>/".split("");
      (function draw() {
        ctx.fillStyle = "rgba(2,4,10,0.12)"; ctx.fillRect(0, 0, rain.width, rain.height);
        ctx.font = fs + "px monospace";
        for (var i = 0; i < cols; i++) {
          ctx.fillStyle = Math.random() < 0.04 ? "#ffc46b" : "#38e0ff";
          ctx.fillText(chars[(Math.random() * chars.length) | 0], i * fs, drops[i] * fs);
          if (drops[i] * fs > rain.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
        if (darkOn) rainRAF = requestAnimationFrame(draw);
      })();
    }

    var box = $("#console-eg"), out = $("#console-out"), input = $("#console-input");
    var cOpen = false;
    function toggleConsole() {
      if (!box) return;
      cOpen = !cOpen;
      box.classList.toggle("open", cOpen);
      box.setAttribute("aria-hidden", String(!cOpen));
      if (cOpen) { if (input) input.focus(); play("select"); }
    }
    function print(s, cls) {
      if (!out) return;
      var d = document.createElement("div"); d.className = cls || ""; d.innerHTML = s; out.appendChild(d); out.scrollTop = out.scrollHeight;
    }
    var cmds = {
      help: function () { print("Commands: <span class='out'>about · skills · projects · contact · matrix · clear · whoami</span>"); },
      about: function () { print("<span class='out'>Malik Sheraz Maqsood Ahmed — Principal Full-Stack & GIS Engineer.</span>"); },
      skills: function () { print("<span class='out'>Laravel · NestJS · React · Next.js · Node · PostgreSQL/PostGIS · AWS · CI/CD</span>"); },
      projects: function () { print("<span class='out'>LTE · Complaint Mgmt · Asset Mgmt · PPMS · GIS Suite · Jotly.ai</span>"); },
      contact: function () { print("<span class='out'>sherii55055@gmail.com · wa.me/+923481655055</span>"); },
      whoami: function () { print("<span class='out'>operator@arc — clearance: guest</span>"); },
      matrix: function () { activateDark(); print("<span class='out'>Toggling matrix rain…</span>"); },
      clear: function () { if (out) out.innerHTML = ""; }
    };
    if (input) input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var v = input.value.trim().toLowerCase(); input.value = "";
      if (!v) return;
      print("<span style='color:var(--cy)'>$ " + v + "</span>");
      (cmds[v] || function () { print("Unknown command. Type <span class='out'>help</span>."); })();
    });

    function assistantSay(s) {
      var b = $("#assistant-bubble"), t = $("#assistant-text");
      if (b && t) { b.classList.remove("hidden"); t.textContent = s; }
    }
  }

  /* ========== 16a. AI DEVELOPER PROFILE (typed readout + live ticker) ========== */
  function initManifesto() {
    var term = $("#sys-readout");
    if (term) {
      var lines = $$(".sys-line", term);
      if (reduceMotion || !("IntersectionObserver" in window)) {
        lines.forEach(function (l) { l.classList.add("in"); });
      } else {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return; io.disconnect();
            lines.forEach(function (ln, i) { setTimeout(function () { ln.classList.add("in"); }, i * 200); });
          });
        }, { threshold: 0.3 });
        io.observe(term);
      }
    }
    var live = $("#live-status-text");
    if (live) {
      var acts = ["Programming...", "Designing system architecture...", "Solving complex problems...",
        "Building scalable solutions...", "Optimizing performance...", "Learning something new...",
        "Exploring Linux...", "Managing servers...", "Deploying applications...",
        "Automating infrastructure...", "Debugging until it works...", "Making it faster..."];
      if (reduceMotion) { live.textContent = acts[0]; return; }
      var ai = 0, ci = 0, del = false;
      (function tick() {
        var w = acts[ai];
        live.textContent = w.slice(0, ci);
        if (!del && ci < w.length) { ci++; setTimeout(tick, 42); }
        else if (!del && ci === w.length) { del = true; setTimeout(tick, 1100); }
        else if (del && ci > 0) { ci--; setTimeout(tick, 22); }
        else { del = false; ai = (ai + 1) % acts.length; setTimeout(tick, 240); }
      })();
    }
  }

  /* ========== 16b. GALLERY CAROUSEL (multi-image, animated) ========== */
  function initGallery() {
    var nodes = $$("[data-gallery]");
    if (!nodes.length) return;
    var groups = {};
    nodes.forEach(function (n) {
      var g = n.getAttribute("data-gallery");
      if (!groups[g]) groups[g] = [];
      groups[g].push({ node: n, src: n.getAttribute("data-full") || n.getAttribute("src") || "", cap: n.getAttribute("data-cap") || n.getAttribute("alt") || "" });
    });

    var lb = document.createElement("div");
    lb.className = "gallery-lb"; lb.setAttribute("aria-hidden", "true"); lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo gallery");
    lb.innerHTML =
      '<button class="glb-close" aria-label="Close gallery">&times;</button>' +
      '<div class="glb-stage">' +
        '<button class="glb-nav glb-prev" aria-label="Previous image">&#8249;</button>' +
        '<img class="glb-img" alt="">' +
        '<button class="glb-nav glb-next" aria-label="Next image">&#8250;</button>' +
      '</div>' +
      '<div class="glb-cap"></div><div class="glb-count"></div>';
    document.body.appendChild(lb);
    var img = lb.querySelector(".glb-img"), cap = lb.querySelector(".glb-cap"), cnt = lb.querySelector(".glb-count");
    var bPrev = lb.querySelector(".glb-prev"), bNext = lb.querySelector(".glb-next"), bClose = lb.querySelector(".glb-close");
    var cur = [], idx = 0, previousFocus = null, previousOverflow = "";
    var background = [$("#main"), $("#site-header"), $(".foot")].filter(Boolean);

    function show(dir) {
      var it = cur[idx]; if (!it) return;
      img.style.setProperty("--dir", (dir < 0 ? -34 : 34) + "px");
      img.classList.remove("anim"); void img.offsetWidth; img.classList.add("anim");
      img.src = it.src; img.alt = it.cap; cap.textContent = it.cap;
      var multi = cur.length > 1;
      cnt.textContent = multi ? (idx + 1) + " / " + cur.length : "";
      bPrev.hidden = !multi; bNext.hidden = !multi;
    }
    function open(group, start) {
      cur = groups[group] || []; if (!cur.length) return;
      idx = start || 0;
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      background.forEach(function (el) { el.inert = true; });
      document.body.style.overflow = "hidden"; show(1);
      bClose.focus();
    }
    function hide() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      background.forEach(function (el) { el.inert = false; });
      document.body.style.overflow = previousOverflow;
      if (previousFocus) previousFocus.focus({ preventScroll: true });
    }
    function go(d) { if (!cur.length) return; idx = (idx + d + cur.length) % cur.length; show(d); }

    nodes.forEach(function (n) {
      n.style.cursor = "zoom-in";
      n.setAttribute("tabindex", "0");
      n.setAttribute("role", "button");
      n.setAttribute("aria-label", "Open photo: " + (n.getAttribute("data-cap") || n.getAttribute("alt") || "Gallery image"));
      n.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); n.click(); }
      });
      n.addEventListener("click", function () {
        n.focus({ preventScroll: true });
        var g = n.getAttribute("data-gallery"); var arr = groups[g], start = 0;
        for (var k = 0; k < arr.length; k++) { if (arr[k].node === n) { start = k; break; } }
        open(g, start);
      });
    });
    bPrev.addEventListener("click", function () { go(-1); });
    bNext.addEventListener("click", function () { go(1); });
    bClose.addEventListener("click", hide);
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") hide();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Tab") {
        var buttons = [bClose, bPrev, bNext].filter(function (b) { return !b.hidden; });
        var current = buttons.indexOf(document.activeElement);
        e.preventDefault();
        buttons[(current + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    });
  }

  /* ========== 16d. PROJECT FILTERS ========== */
  function initFilters() {
    var bar = $("#proj-filters"); if (!bar) return;
    var cards = $$(".proj-grid .proj");
    var chips = $$(".pf-chip", bar);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("on"); c.setAttribute("aria-pressed", "false"); });
        chip.classList.add("on"); chip.setAttribute("aria-pressed", "true");
        var f = chip.getAttribute("data-filter");
        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-cat") || "").split(" ");
          var show = (f === "all") || cats.indexOf(f) !== -1;
          card.classList.toggle("hide", !show);
        });
        var result = $("#project-result-count");
        if (result) {
          var count = cards.filter(function (card) { return !card.classList.contains("hide"); }).length;
          result.textContent = f === "all" ? "Showing all " + count + " projects" :
            "Showing " + count + " " + chip.textContent.trim() + " project" + (count === 1 ? "" : "s");
        }
        play("select");
      });
    });
  }

  /* ========== 16e. FIRST-VISIT HINT ========== */
  function initHint() {
    var hint = $("#first-hint"); if (!hint) return;
    var seen = false; try { seen = localStorage.getItem("arcHint") === "1"; } catch (e) {}
    if (seen) { hint.parentNode && hint.parentNode.removeChild(hint); return; }
    var timer;
    function dismiss() {
      hint.classList.remove("show");
      try { localStorage.setItem("arcHint", "1"); } catch (e) {}
      clearTimeout(timer);
      setTimeout(function () { hint.parentNode && hint.parentNode.removeChild(hint); }, 500);
    }
    function reveal() { hint.classList.add("show"); timer = setTimeout(dismiss, 13000); }
    if (state.booted) setTimeout(reveal, 900);
    else window.addEventListener("arc:booted", function () { setTimeout(reveal, 1800); }, { once: true });
    var x = $("#first-hint-x"); if (x) x.addEventListener("click", dismiss);
  }

  /* ========== 16c. CONTACT FORM submission feedback ========== */
  function initForm() {
    var form = document.querySelector(".comm-form");
    if (!form) return;
    var btn = form.querySelector("#cf-send");
    var status = form.querySelector("#cf-status");
    if (!status) return;
    var sending = false;

    function setState(state, msg) {
      status.className = "cf-status show " + state;
      status.textContent = msg;
      if (btn) btn.disabled = state === "sending";
      form.setAttribute("aria-busy", String(state === "sending"));
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || !form.reportValidity()) return;
      sending = true;
      setState("sending", "▶ Transmitting…");
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 20000);
      var endpoint = form.action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");
      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" },
        signal: controller.signal
      }).then(function (r) {
        if (!r.ok) throw new Error("Message service rejected the request");
        return r.json();
      }).then(function (result) {
        if (result.success === true || result.success === "true") {
          setState("success", "✓ Message accepted. I'll get back to you shortly.");
          form.reset();
        } else {
          setState("error", "Transmission could not be confirmed. Your message is still here; try again or use Send Email below.");
        }
      }).catch(function () {
        setState("error", "Connection failed or timed out. Your message is still here; try again or use Send Email below.");
      }).finally(function () {
        clearTimeout(timeout);
        sending = false;
      });
    });
  }

  /* ========== 16d. MISC ========== */
  function initMisc() {
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    var bt = $("#back-top");
    if (bt) {
      bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
      var onS = function () { bt.classList.toggle("show", scrollY > 400); };
      addEventListener("scroll", onS, { passive: true }); onS();
    }
  }

  /* ========== 16e. OPERATOR // LIVE cursor-scan reveal ========== */
  function initPortraitReveal() {
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (isTouch || !fine) return;                          // touch/coarse: static clean image
    var media  = document.querySelector(".portrait-media");
    if (!media) return;
    var reveal = media.querySelector(".p-reveal");
    var spot   = media.querySelector(".p-spot");
    if (!reveal || !spot) return;

    var HALF_W = 86, HALF_H = 107;                         // half of the 172x214 oval
    var LERP = reduceMotion ? 1 : 0.22;
    var tx = 0, ty = 0, cx = 0, cy = 0;
    var active = false, first = true, raf = 0;

    function place() {
      reveal.style.webkitMaskPosition = (cx - HALF_W) + "px " + (cy - HALF_H) + "px";
      reveal.style.maskPosition        = (cx - HALF_W) + "px " + (cy - HALF_H) + "px";
      spot.style.transform             = "translate(" + cx + "px," + cy + "px)";
    }
    function loop() {
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      place();
      if (Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
    }
    media.addEventListener("mousemove", function (e) {
      var r = media.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (first) {                                         // snap on first move, then fade in
        cx = tx; cy = ty; first = false;
        place();
        reveal.style.opacity = "1";
        spot.style.opacity = "1";
      }
      active = true;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    media.addEventListener("mouseleave", function () {
      active = false; first = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      reveal.style.opacity = "0";
      spot.style.opacity = "0";
    });
  }

  /* ========== INIT ALL (deferred-safe) ========== */
  function start() {
    var mods = [initWebGL, initScroll, initMobileNav, initMouse, initMagnetic, initReveal,
                initTyper, initOrbit, initGalaxy, initProjects, initExpTabs, initSectionRail, initSectionPager, initContact, initSound,
                initAssistant, initEasterEggs, initManifesto, initGallery, initFilters, initHint, initForm, initMisc,
                initPortraitReveal];
    for (var i = 0; i < mods.length; i++) { try { mods[i](); } catch (e) { /* isolate */ } }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
