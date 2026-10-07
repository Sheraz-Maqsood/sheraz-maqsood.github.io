/* ============================================================
   Portfolio engine — Malik Sheraz Maqsood Ahmed
   Starfield · reveal · header · tabs · section pager · sound · easter eggs
   Defensive: every module guarded so one failure never blocks the rest.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  // Preserve animations while avoiding per-frame work for invisible sections.
  function animateWhenVisible(el, draw) {
    var visible = false, raf = 0;
    function tick() { draw(); raf = requestAnimationFrame(tick); }
    function sync() {
      cancelAnimationFrame(raf); raf = 0;
      if (visible && !document.hidden) {
        draw();
        if (!reduceMotion) raf = requestAnimationFrame(tick);
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(el);
    } else { visible = true; sync(); }
    document.addEventListener("visibilitychange", sync);
  }

  /* Video posters load shortly before they scroll into view (images use native loading="lazy"). */
  function initDeferredMedia() {
    var targets = $$("video[data-poster], img[data-src]");
    function load(el) {
      if (el.dataset.poster) { el.poster = el.dataset.poster; delete el.dataset.poster; }
      if (el.dataset.src) { el.src = el.dataset.src; delete el.dataset.src; }
    }
    if (!("IntersectionObserver" in window)) { targets.forEach(load); return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { load(entry.target); observer.unobserve(entry.target); } });
    }, { rootMargin: "600px 0px" });
    targets.forEach(function (el) { observer.observe(el); });
    var portrait = $(".portrait-media");
    if (portrait) portrait.classList.add("media-ready");
  }

  var state = { mx: 0.5, my: 0.5, soundOn: false };

  /* ========== 2. STARFIELD (project pages) ==========
     Replaces the old three.js particle scene: same drifting cyan/gold points,
     ~2 KB of code instead of a 600 KB library. Desktop only, paused when hidden. */
  function initStarfield() {
    var canvas = $("#bg-stars");
    if (!canvas || !canvas.getContext || innerWidth < 900 || isTouch) return;
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, stars = [], raf = 0, t = 0;
    var COLORS = ["#38e0ff", "#38e0ff", "#1d6fff", "#ffc46b"];
    function resize() {
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / 9000);
      stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: 0.3 + Math.random() * 0.7, c: COLORS[(Math.random() * COLORS.length) | 0] });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var px = (state.mx - 0.5) * 24, py = (state.my - 0.5) * 16;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var x = (s.x + t * 6 * s.z + px * s.z) % W, y = s.y + py * s.z;
        ctx.globalAlpha = 0.35 + 0.5 * s.z;
        ctx.fillStyle = s.c;
        ctx.fillRect(x < 0 ? x + W : x, y, 1.6 * s.z, 1.6 * s.z);
      }
      ctx.globalAlpha = 1;
    }
    function loop() { t += 0.016; draw(); raf = requestAnimationFrame(loop); }
    function sync() { cancelAnimationFrame(raf); raf = 0; if (!document.hidden && !reduceMotion) loop(); else draw(); }
    resize(); sync();
    addEventListener("resize", function () { resize(); draw(); }, { passive: true });
    document.addEventListener("visibilitychange", sync);
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
        var items = [t].concat($$("a, button", m));
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
    var cursorRAF = 0;
    function moveCursor() {
      cursorRAF = 0;
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      reticle.style.setProperty("--cx", cx + "px");
      reticle.style.setProperty("--cy0", cy + "px");
      if (!document.hidden && (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1)) cursorRAF = requestAnimationFrame(moveCursor);
    }
    addEventListener("mousemove", function (e) {
      state.mx = e.clientX / innerWidth; state.my = e.clientY / innerHeight;
      document.documentElement.style.setProperty("--mx", state.mx.toFixed(3));
      document.documentElement.style.setProperty("--my", state.my.toFixed(3));
      tx = e.clientX; ty = e.clientY;
      if (reticle && !isTouch && !reduceMotion && !cursorRAF) cursorRAF = requestAnimationFrame(moveCursor);
    }, { passive: true });

    if (reticle && !isTouch && !reduceMotion) {
      moveCursor();
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
        if (el.hasAttribute("data-stagger") && el.animate) {
          Array.prototype.forEach.call(el.children, function (child, index) {
            child.animate(
              [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 620, delay: index * 80, easing: "cubic-bezier(.22,.61,.36,1)", fill: "both" }
            );
          });
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
          var start = performance.now();
          (function count(now) {
            var progress = Math.min(1, (now - start) / 1600);
            var eased = 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.round(target * (progress === 1 ? 1 : eased));
            if (progress < 1) requestAnimationFrame(count);
          })(start);
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
    var roles = ["Principal Full-Stack & GIS Engineer", "Government GIS Platform Builder", "Laravel · NestJS · FastAPI", "React · Next.js Engineer", "CI/CD & Linux Production Ops", "C# Desktop & Embedded Systems"];
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
  /* Official logos for the constellation nodes (devicon / simple-icons, self-hosted). inv = mono-dark logo, shown white */
  var DV = "assets/vendor/devicon/";   /* self-hosted (was jsDelivr CDN) */
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
    "Leaflet GIS": ["assets/vendor/simple-icons/leaflet.svg", 1],
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
    }
    animateWhenVisible(g, frame);
  }

  /* ========== 11. PROJECT NAV ========== */
  function initProjects() {
    $$("img.proj-img").forEach(function (img) {
      function fallback() { img.removeEventListener("error", fallback); img.src = "assets/projects/_placeholder.svg"; }
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) fallback();
      else img.addEventListener("error", fallback);
    });
    $$(".proj[data-href]").forEach(function (p) {
      var go = function () { play("select"); var href = p.getAttribute("data-href"); if (/^https?:/i.test(href)) window.open(href, "_blank", "noopener"); else window.location.href = href; };
      p.addEventListener("click", function (e) { if (!e.target.closest("a, button, input")) go(); });
      p.addEventListener("keydown", function (e) { if (e.target === p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(); } });
    });
    $$(".proj").forEach(function (p) { p.addEventListener("mouseenter", function () { play("hover"); }); });
  }

  /* ========== 11b. EXPERIENCE — accessible tabs on every screen size ==========
     Without JavaScript every role stays visible as a timeline. With it:
       · one role at a time: tabs on the left (desktop) or a swipeable chip row (tablet / phone)
       · arrow keys, Home / End, plus "previous / next role" buttons under every role
       · deep links: /#exp-cmh opens that role, and the address follows the selected tab
       · long roles show a "more below" fade on desktop, where the panel scrolls inside */
  function initExpTabs() {
    var sec = $("#experience"), rail = sec && $(".rail", sec);
    if (!rail) return;
    var panels = $$(".station", rail);
    var wo = $(".world-ops", sec);
    if (wo) panels.push(wo);
    if (panels.length < 2) return;
    var wide = window.matchMedia("(min-width: 1100px)");
    var n = panels.length, current = -1;

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }
    function txt(scope, q) { var e = $(q, scope); return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; }
    var meta = panels.map(function (st) {
      if (st === wo) return { title: "Worldwide client missions", org: "Italy · Canada · USA · India · Pakistan", when: "2020 — 2025 · Remote" };
      return { title: txt(st, ".exp-head h3"), org: txt(st, ".exp-head .org"), when: txt(st, ".exp-head .when") };
    });

    var nav = el("div", "rail-tabs-nav");
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Experience roles");
    var tabs = panels.map(function (st, i) {
      var b = el("button", "rt-tab" + (st.classList.contains("now") ? " now" : ""));
      b.type = "button";
      b.id = "tab-" + st.id;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", st.id);
      b.appendChild(el("span", "rt-idx", (i < 9 ? "0" : "") + (i + 1))).setAttribute("aria-hidden", "true");
      b.appendChild(el("span", "rt-when", meta[i].when));
      b.appendChild(el("b", "", meta[i].title));
      b.appendChild(el("span", "rt-org", meta[i].org));
      b.addEventListener("click", function () { select(i, { hash: true }); play("select"); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowRight" || k === "ArrowDown") j = (i + 1) % n;
        else if (k === "ArrowLeft" || k === "ArrowUp") j = (i - 1 + n) % n;
        else if (k === "Home") j = 0;
        else if (k === "End") j = n - 1;
        if (j < 0) return;
        e.preventDefault(); select(j, { hash: true }); tabs[j].focus();
      });
      nav.appendChild(b);
      return b;
    });
    rail.parentNode.insertBefore(nav, rail);

    panels.forEach(function (st, i) {
      st.setAttribute("role", "tabpanel");
      st.setAttribute("aria-labelledby", tabs[i].id);
      st.tabIndex = 0;
      var pager = el("div", "rt-pager");
      if (i > 0) {
        var prev = el("button", "rt-step rt-prev");
        prev.type = "button";
        prev.appendChild(el("span", "rt-step-k", "← Previous role"));
        prev.appendChild(el("b", "", meta[i - 1].title));
        prev.addEventListener("click", function () { select(i - 1, { hash: true, scroll: true, focusTab: true }); });
        pager.appendChild(prev);
      }
      pager.appendChild(el("span", "rt-count", (i + 1) + " / " + n));
      if (i < n - 1) {
        var next = el("button", "rt-step rt-next");
        next.type = "button";
        next.appendChild(el("span", "rt-step-k", "Next role →"));
        next.appendChild(el("b", "", meta[i + 1].title));
        next.addEventListener("click", function () { select(i + 1, { hash: true, scroll: true, focusTab: true }); });
        pager.appendChild(next);
      }
      st.appendChild(pager);
      st.addEventListener("scroll", updateFade, { passive: true });
    });

    function updateFade() {
      panels.forEach(function (p, j) {
        var more = j === current && wide.matches && p.scrollHeight - p.clientHeight - p.scrollTop > 24;
        p.classList.toggle("has-more", more);
      });
    }
    function select(i, o) {
      o = o || {};
      if (i < 0 || i >= n) return;
      current = i;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, j) { var on = j === i; p.classList.toggle("rt-active", on); p.hidden = !on; });
      panels[i].scrollTop = 0;
      if (!wide.matches && nav.scrollWidth > nav.clientWidth) {
        var t = tabs[i];
        nav.scrollTo({ left: t.offsetLeft - (nav.clientWidth - t.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
      if (o.hash && history.replaceState) history.replaceState(null, "", "#" + panels[i].id);
      if (o.scroll) {
        var top = nav.getBoundingClientRect().top;
        if (top < 60 || top > innerHeight * 0.6) {
          window.scrollTo({ top: Math.max(0, top + window.pageYOffset - 110), behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
      if (o.focusTab) tabs[i].focus({ preventScroll: true });
      updateFade();
    }
    function fromHash(scroll) {
      var id = decodeURIComponent(location.hash.slice(1));
      for (var i = 0; i < n; i++) {
        if (panels[i].id === id) {
          select(i);
          if (scroll) {
            var jump = function () { if (location.hash.slice(1) === id) sec.scrollIntoView({ block: "start", behavior: "instant" }); };
            jump();
            /* lazily rendered sections above can change height while the page settles */
            if (document.readyState !== "complete") window.addEventListener("load", function () { setTimeout(jump, 60); }, { once: true });
            setTimeout(jump, 450);
          }
          return true;
        }
      }
      return false;
    }
    function layout() { nav.setAttribute("aria-orientation", wide.matches ? "vertical" : "horizontal"); updateFade(); }

    sec.classList.add("exp-tabs");
    if (wide.addEventListener) wide.addEventListener("change", layout); else if (wide.addListener) wide.addListener(layout);
    window.addEventListener("resize", updateFade, { passive: true });
    window.addEventListener("hashchange", function () { fromHash(true); });
    layout();
    if (!fromHash(true)) select(0);
  }

  /* ========== 11c. SECTION RAIL (right-side 00–08 index) ========== */
  function initSectionRail() {
    var defs = [
      [".hero", "Intro"], ["#network", "Explore"], ["#about", "About"], ["#profile", "Profile"], ["#skills", "Skills"],
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

  /* ========== 11d. SECTION PAGER — one mouse-wheel notch = next / previous section (desktop) ==========
     Only classic notched mouse wheels are paged. Trackpads, touch and free-spin wheels send
     small or fractional deltas — they keep native, smooth scrolling (and PageUp/PageDown/Space page). */
  function initSectionPager() {
    var mq = window.matchMedia("(min-width: 1100px) and (min-height: 600px)");
    var sels = [".hero", "#network", "#about", "#profile", "#skills", "#stack", "#experience", "#projects", "#education", "#contact"];
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
    var trackpadUntil = 0;
    function isMouseWheel(e) {
      if (e.deltaMode === 1 || e.deltaMode === 2) return true;               /* line / page units: classic wheel */
      if (e.deltaX !== 0) return false;                                       /* two-finger diagonal = trackpad */
      var w = e.wheelDeltaY;
      if (typeof w === "number" && w !== 0) {
        if (Math.abs(w) === Math.abs(e.deltaY) * 3) return false;              /* Chromium / Safari trackpad signature */
        return Math.abs(w) % 120 === 0;                                       /* whole notches (Windows, Linux, most Macs) */
      }
      return Math.abs(e.deltaY) >= 50 && e.deltaY % 1 === 0;                   /* Firefox pixel mode */
    }
    window.addEventListener("wheel", function (e) {
      if (!mq.matches || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      var now = performance.now();
      if (now < trackpadUntil) return;
      if (!isMouseWheel(e)) { trackpadUntil = now + 1200; return; }
      if (document.body.style.overflow === "hidden") return;      /* boot screen / modal open */
      if (innerCanScroll(e.target, e.deltaY)) return;
      var dir = e.deltaY > 0 ? 1 : -1;
      /* past contact the footer scrolls freely */
      if (dir > 0 && currentIndex() === secs.length - 1 && secs[secs.length - 1].getBoundingClientRect().bottom <= window.innerHeight + 8 &&
          window.pageYOffset >= document.documentElement.scrollHeight - window.innerHeight - 2) return;
      e.preventDefault();
      if (busy) { clearTimeout(quietTimer); quietTimer = setTimeout(function () { busy = false; }, 220); return; }
      acc += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
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
    /* phones: the floating toggle is hidden by CSS, the same switch lives in the menu */
    var menu = $("#mobile-nav"), mBtn = null;
    if (menu) {
      mBtn = document.createElement("button");
      mBtn.type = "button"; mBtn.className = "mn-sound"; mBtn.setAttribute("aria-pressed", "false");
      mBtn.innerHTML = "<span class='idx' aria-hidden='true'>&#9835;</span><span class='mn-sound-l'>UI sound: off</span>";
      mBtn.addEventListener("click", toggle);
      menu.appendChild(mBtn);
    }
    function toggle() {
      state.soundOn = !state.soundOn;
      btn.classList.toggle("active", state.soundOn);
      btn.setAttribute("aria-pressed", String(state.soundOn));
      if (mBtn) { mBtn.setAttribute("aria-pressed", String(state.soundOn)); $(".mn-sound-l", mBtn).textContent = "UI sound: " + (state.soundOn ? "on" : "off"); }
      if (state.soundOn) { ensureCtx(); play("ping"); }
    }
    btn.addEventListener("click", toggle);
  }

  /* Run fn once, the first time the page is scrolled past most of the hero */
  function afterHero(fn) {
    var done = false;
    function check() {
      if (done || window.scrollY < window.innerHeight * 0.6) return;
      done = true; window.removeEventListener("scroll", check); fn();
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
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
    // On the homepage, keep project and contact links clear until the guide is requested.
    if (!document.body.hasAttribute("data-instant-entry")) {
      afterHero(function () { setTimeout(function () { speak(greetings[0]); }, 600); });
    }
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
      if (cOpen) {
        box.hidden = false;
        void box.offsetWidth;                       /* let the open transition run */
        box.classList.add("open");
        if (input) input.focus();
        play("select");
      } else {
        box.classList.remove("open");
        box.hidden = true;
      }
    }
    if (input) input.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); if (cOpen) toggleConsole(); } });
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
      print("<span class='text-cy'>$ " + v + "</span>");
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
      var acts = ["Routing a fire complaint...", "Indexing PostGIS geometry...", "Shipping via GitHub Actions",
        "Fixing an N+1 query...", "Designing an API contract...", "Reviewing a pull request...",
        "Renewing an SSL cert...", "Reading logs, not guessing", "Closing a TODO from 2019...",
        "Not deploying on a Friday", "Explaining 'just a button'"];
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
      if (n.closest("[hidden]")) return;
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
    if (document.body.hasAttribute("data-instant-entry")) return;
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
    // Shown a few seconds after the ARC greeting, so the two never stack
    afterHero(function () { setTimeout(reveal, 7000); });
    var x = $("#first-hint-x"); if (x) x.addEventListener("click", dismiss);
  }

  /* ========== 16c. CONTACT FORM submission feedback ========== */
  function initForm() {
    var form = document.querySelector(".comm-form");
    if (!form) return;
    var btn = form.querySelector("#cf-send");
    var status = form.querySelector("#cf-status");
    if (!status) return;
    var sending = false, shownAt = Date.now();
    var honey = form.querySelector("[name='_honey']");

    function setState(state, msg) {
      status.className = "cf-status show " + state;
      status.textContent = msg;
      if (btn) btn.disabled = state === "sending";
      form.setAttribute("aria-busy", String(state === "sending"));
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || !form.reportValidity()) return;
      if ((honey && honey.value) || Date.now() - shownAt < 3000) {   /* spam bot: pretend success, send nothing */
        setState("success", "✓ Message accepted. I'll get back to you shortly.");
        form.reset();
        return;
      }
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

  /* ========== PERF: pause hero backdrop animations while the hero is off-screen ========== */
  function initHeroPause() {
    var hero = $(".hero");
    if (!hero || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      hero.classList.toggle("is-offscreen", !entries[0].isIntersecting);
    }).observe(hero);
  }

  /* ========== INIT ALL (deferred-safe) ========== */
  function start() {
    var mods = [initDeferredMedia, initStarfield, initScroll, initMobileNav, initMouse, initMagnetic, initReveal,
                initTyper, initGalaxy, initProjects, initExpTabs, initSectionRail, initSectionPager, initContact, initSound,
                initAssistant, initEasterEggs, initManifesto, initGallery, initFilters, initHint, initForm, initMisc,
                initPortraitReveal, initHeroPause];
    for (var i = 0; i < mods.length; i++) { try { mods[i](); } catch (e) { /* isolate */ } }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
