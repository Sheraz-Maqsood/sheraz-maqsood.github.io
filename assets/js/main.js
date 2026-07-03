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
    try { seenBoot = sessionStorage.getItem("arcBooted") === "1"; sessionStorage.setItem("arcBooted", "1"); } catch (err) {}
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
    if (!canvas || reduceMotion || typeof window.THREE === "undefined") return;
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
    var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
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
        var cur = sections[0];
        for (var i = 0; i < sections.length; i++) { if (sections[i].offsetTop - 140 <= y) cur = sections[i]; }
        navLinks.forEach(function (a) { a.classList.toggle("active", cur && a.getAttribute("href") === "#" + cur.id); });
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
    function toggle(open) {
      m.classList.toggle("open", open);
      m.setAttribute("aria-hidden", String(!open));
      t.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    }
    t.addEventListener("click", function () { toggle(!m.classList.contains("open")); });
    $$("#mobile-nav a").forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
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
    { n: "Java/Android",ring: 3, exp: "3+ yrs", proj: "Firebase mobile apps", conf: "Proficient" }
  ];
  function initGalaxy() {
    var g = $("#galaxy"), readout = $("#skill-readout"), list = $("#skill-list");
    if (list) list.innerHTML = SKILLS.map(function (s) {
      return "<div class='si panel'><b>" + s.n + "</b><span>" + s.conf + " · " + s.exp + "</span></div>";
    }).join("");
    if (!g) return;
    var rings = { 1: 130, 2: 210, 3: 285 };
    [130, 210, 285].forEach(function (r) {
      var d = document.createElement("div"); d.className = "galaxy-ring";
      d.style.width = d.style.height = (r * 2) + "px"; g.appendChild(d);
    });
    var perRing = { 1: [], 2: [], 3: [] };
    SKILLS.forEach(function (s) { perRing[s.ring].push(s); });
    var nodes = [];
    Object.keys(perRing).forEach(function (ring) {
      var arr = perRing[ring];
      arr.forEach(function (s, i) {
        var node = document.createElement("button");
        node.className = "skill-node" + (s.gold ? " gold" : "");
        node.innerHTML = "<span class='blip'></span><span>" + s.n + "</span>";
        node.setAttribute("aria-label", s.n + ": " + s.conf + ", " + s.exp);
        var show = function () {
          if (readout) readout.innerHTML =
            "<span class='rk'>▸ " + s.n.toUpperCase() + "</span> &nbsp; EXPERIENCE: <b>" + s.exp +
            "</b> &nbsp;·&nbsp; CONFIDENCE: <b>" + s.conf + "</b><br><span class='rk'>PROJECTS:</span> " + s.proj;
          play("hover");
        };
        node.addEventListener("mouseenter", show);
        node.addEventListener("focus", show);
        g.appendChild(node);
        nodes.push({ el: node, ring: rings[ring], base: (i / arr.length) * Math.PI * 2, speed: ring === "1" ? 0.00045 : (ring === "2" ? -0.0003 : 0.0002) });
      });
    });
    var t = 0, raf;
    function frame() {
      t += reduceMotion ? 0 : 16;
      nodes.forEach(function (o) {
        var a = o.base + t * o.speed;
        o.el.style.transform = "translate(-50%,-50%) translate(" + (Math.cos(a) * o.ring) + "px," + (Math.sin(a) * o.ring * 0.78) + "px)";
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
      p.addEventListener("click", go);
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    $$(".proj").forEach(function (p) { p.addEventListener("mouseenter", function () { play("hover"); }); });
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
    var cur = [], idx = 0;

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
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; show(1);
    }
    function hide() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
    function go(d) { if (!cur.length) return; idx = (idx + d + cur.length) % cur.length; show(d); }

    nodes.forEach(function (n) {
      n.style.cursor = "zoom-in";
      n.addEventListener("click", function () {
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
    });
  }

  /* ========== 16. MISC ========== */
  function initMisc() {
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    var bt = $("#back-top");
    if (bt) {
      bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
      var onS = function () { bt.classList.toggle("show", scrollY > 400); };
      addEventListener("scroll", onS, { passive: true }); onS();
    }
  }

  /* ========== INIT ALL (deferred-safe) ========== */
  function start() {
    var mods = [initWebGL, initScroll, initMobileNav, initMouse, initMagnetic, initReveal,
                initTyper, initOrbit, initGalaxy, initProjects, initContact, initSound,
                initAssistant, initEasterEggs, initManifesto, initGallery, initMisc];
    for (var i = 0; i < mods.length; i++) { try { mods[i](); } catch (e) { /* isolate */ } }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
