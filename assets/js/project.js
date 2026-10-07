/* ============================================================
   Project dossier — behaviour only.
   Every page under /projects/<id>/ is pre-rendered by `npm run build`
   (scripts/build-assets.mjs + scripts/projects-data.mjs), so the content,
   title and SEO tags exist without JavaScript. This file only adds:
     · inline video playback (custom play button)
     · screenshot strip: prev/next, drag-to-scroll, lightbox with arrows
     · in-page PDF viewer (desktop; phones open the PDF natively)
   Shared effects (reveal, header, sound, year) come from main.js.
   ============================================================ */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* Modal helper: focus moves in, stays in, and returns to the opener on close. */
  function dialogFocus(lb, label, closeSelector) {
    var previousFocus = null, previousOverflow = "";
    var background = $$("#main, #site-header, .foot, .back-top, .sound-toggle");
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", label);
    lb.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = $$("button, a[href], iframe", lb).filter(function (el) { return !el.hidden && !el.disabled && !el.closest("[hidden]"); });
      if (!items.length) return;
      var i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    });
    return {
      open: function () {
        previousFocus = document.activeElement; previousOverflow = document.body.style.overflow;
        lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
        background.forEach(function (el) { el.inert = true; });
        var close = $(closeSelector, lb); if (close) close.focus();
      },
      close: function () {
        lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = previousOverflow;
        background.forEach(function (el) { el.inert = false; });
        if (previousFocus) previousFocus.focus({ preventScroll: true });
      }
    };
  }

  /* ---------- VIDEO: native controls stay for no-JS visitors; the HUD button takes over here ---------- */
  $$(".video-stage").forEach(function (st) {
    var v = $("video", st), btn = $(".v-playbtn", st);
    if (!v || !btn) return;
    v.removeAttribute("controls");
    btn.addEventListener("click", function () {
      v.setAttribute("controls", "");
      var playback = v.play();
      if (playback && playback.then) {
        playback.then(function () { btn.hidden = true; v.focus({ preventScroll: true }); }).catch(function () {
          btn.hidden = false;
          $(".lbl", btn).textContent = "Recording unavailable — retry or visit the live platform above.";
        });
      } else btn.hidden = true;
    });
  });

  /* ---------- SCREENSHOT STRIP + LIGHTBOX ---------- */
  (function gallery() {
    var track = $("#g-track"), lb = $("#lightbox");
    if (!track) return;
    var host = track.parentNode, prev = $(".g-prev", host), next = $(".g-next", host);
    var links = $$(".shot-hit", track);
    var shots = links.map(function (a) {
      var img = $("img", a.parentNode);
      return { src: a.getAttribute("href"), alt: img ? img.alt : "" };
    });

    function step() { var card = $(".shot", track); return card ? card.getBoundingClientRect().width + 16 : 320; }
    function updateNav() {
      var maxS = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.classList.toggle("off", track.scrollLeft <= 2);
      if (next) next.classList.toggle("off", track.scrollLeft >= maxS);
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step() * 1.5, behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step() * 1.5, behavior: reduceMotion ? "auto" : "smooth" }); });
    track.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav, { passive: true });
    updateNav();

    /* drag-to-scroll with a mouse; a drag never opens the lightbox */
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("mousedown", function (e) { if (e.button !== 0) return; down = true; moved = false; sx = e.pageX; sl = track.scrollLeft; track.classList.add("drag"); e.preventDefault(); });
    window.addEventListener("mousemove", function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener("mouseup", function () { down = false; track.classList.remove("drag"); });

    if (!lb) return;
    var lbImg = document.createElement("img");
    lbImg.id = "lb-img"; lbImg.alt = ""; lbImg.decoding = "async";
    var bp = document.createElement("button"); bp.type = "button"; bp.className = "lb-nav lb-prev"; bp.setAttribute("aria-label", "Previous screenshot"); bp.innerHTML = "&lsaquo;";
    var bn = document.createElement("button"); bn.type = "button"; bn.className = "lb-nav lb-next"; bn.setAttribute("aria-label", "Next screenshot"); bn.innerHTML = "&rsaquo;";
    var cc = document.createElement("div"); cc.className = "lb-count"; cc.setAttribute("aria-live", "polite");
    lb.appendChild(lbImg); lb.appendChild(bp); lb.appendChild(bn); lb.appendChild(cc);
    bp.hidden = bn.hidden = shots.length < 2;
    var focus = dialogFocus(lb, "Project screenshots", ".lb-close");
    var cur = 0;

    function show(i) {
      cur = (i + shots.length) % shots.length;
      lbImg.src = shots[cur].src;
      lbImg.alt = shots[cur].alt;
      cc.textContent = (cur + 1) + " / " + shots.length;
    }
    function open(i) { show(i); lb.classList.add("open"); focus.open(); }
    function close() { lb.classList.remove("open"); lbImg.removeAttribute("src"); focus.close(); }

    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (moved) { moved = false; return; }
        a.focus({ preventScroll: true });
        open(i);
      });
    });
    bp.addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
    bn.addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
    $(".lb-close", lb).addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
    });
  })();

  /* ---------- PDF VIEWER (desktop). Phones keep the plain link: mobile browsers can't show PDFs in a frame. ---------- */
  (function docs() {
    var links = $$(".dp-hit");
    if (!links.length) return;
    var DOCS = links.map(function (a, i) { return { href: a.getAttribute("href"), label: a.getAttribute("data-label") || ("Document " + (i + 1)) }; });
    var inline = window.matchMedia("(min-width: 760px) and (pointer: fine)");

    var lb = document.createElement("div");
    lb.className = "pdf-lb"; lb.setAttribute("aria-hidden", "true");
    lb.innerHTML =
      "<div class='pdf-head'>" +
        "<span class='pdf-title'></span>" +
        "<span class='pdf-count'></span>" +
        "<a class='pdf-btn pdf-dl' target='_blank' rel='noopener' download>&darr; Download</a>" +
        "<button class='pdf-btn pdf-x' type='button' aria-label='Close viewer'>&times;</button>" +
      "</div>" +
      "<div class='pdf-stage'>" +
        "<button class='pdf-nav pdf-prev' type='button' aria-label='Previous document'>&#8249;</button>" +
        "<div class='pdf-frame-wrap'><div class='pdf-load'>Loading document&hellip;</div><iframe class='pdf-frame' title='PDF document'></iframe></div>" +
        "<button class='pdf-nav pdf-next' type='button' aria-label='Next document'>&#8250;</button>" +
      "</div>" +
      "<div class='pdf-dots'></div>";
    document.body.appendChild(lb);

    var frame = $(".pdf-frame", lb), titleEl = $(".pdf-title", lb), countEl = $(".pdf-count", lb),
        dlEl = $(".pdf-dl", lb), prevB = $(".pdf-prev", lb), nextB = $(".pdf-next", lb),
        dots = $(".pdf-dots", lb), loadEl = $(".pdf-load", lb);
    var idx = 0, focus = dialogFocus(lb, "Project documents", ".pdf-x");
    dlEl.setAttribute("href", DOCS[0].href);

    dots.innerHTML = DOCS.map(function (d, i) { return "<button class='pdf-dot' type='button' data-i='" + i + "' aria-label='Document " + (i + 1) + "'></button>"; }).join("");
    var dotEls = $$(".pdf-dot", dots);

    function show(i) {
      idx = (i + DOCS.length) % DOCS.length;
      var d = DOCS[idx];
      loadEl.style.display = "grid";
      frame.style.opacity = "0";
      frame.src = d.href + "#view=FitH&toolbar=1";
      titleEl.textContent = d.label;
      countEl.textContent = (idx + 1) + " / " + DOCS.length;
      dlEl.setAttribute("href", d.href);
      var multi = DOCS.length > 1;
      prevB.hidden = !multi; nextB.hidden = !multi; dots.style.display = multi ? "flex" : "none";
      dotEls.forEach(function (el, k) { el.classList.toggle("on", k === idx); el.setAttribute("aria-current", k === idx ? "true" : "false"); });
    }
    frame.addEventListener("load", function () { loadEl.style.display = "none"; frame.style.opacity = "1"; });
    function open(i) { show(i); lb.classList.add("open"); focus.open(); }
    function close() { lb.classList.remove("open"); frame.src = "about:blank"; focus.close(); }

    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        if (!inline.matches || e.ctrlKey || e.metaKey || e.shiftKey) return;   /* new tab / phone: native PDF */
        e.preventDefault(); a.focus({ preventScroll: true }); open(i);
      });
    });
    prevB.addEventListener("click", function () { show(idx - 1); });
    nextB.addEventListener("click", function () { show(idx + 1); });
    $(".pdf-x", lb).addEventListener("click", close);
    dotEls.forEach(function (el) { el.addEventListener("click", function () { show(parseInt(el.getAttribute("data-i"), 10)); }); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    });
  })();
})();
