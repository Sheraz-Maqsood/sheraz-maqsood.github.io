/* HERO PAMPHLET v2 — micro-interactions (≈1 rAF, transform/opacity only)
   Include after main.js. */
(function () {
  var spread = document.querySelector(".pamphlet-hero-spread");
  if (!spread) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;

  // 1. Entrance choreography + pause loops when off-screen
  new IntersectionObserver(function (e) {
    var vis = e[0].isIntersecting;
    spread.classList.toggle("is-paused", !vis);
    if (vis) spread.classList.add("is-in");
  }, { threshold: 0.05 }).observe(spread);

  // 2. Pointer parallax: one CSS var pair, eased in a single rAF
  if (!reduce && fine) {
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    var hero = spread.closest(".hero") || document;
    hero.addEventListener("pointermove", function (ev) {
      tx = (ev.clientX / innerWidth - 0.5) * 2;   // -1..1
      ty = (ev.clientY / innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { tx = ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
    function tick() {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      spread.style.setProperty("--mx", x.toFixed(3));
      spread.style.setProperty("--my", y.toFixed(3));
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) ? requestAnimationFrame(tick) : 0;
    }
  }

  // 3. Tag decode on hover ("// 01 GIS ENGINE" scrambles, then resolves)
  var glyphs = "▚▞▖▗▘▝#/_01";
  spread.querySelectorAll(".pam-block").forEach(function (b) {
    var tag = b.querySelector(".pam-tag"); if (!tag) return;
    var final = tag.textContent, busy = false;
    b.addEventListener("pointerenter", function () {
      if (busy || reduce) return; busy = true;
      var f = 0, n = final.length;
      (function step() {
        var out = "";
        for (var i = 0; i < n; i++) out += (i < f || final[i] === " ") ? final[i] : glyphs[(Math.random() * glyphs.length) | 0];
        tag.textContent = out;
        f += 1.5;
        if (f <= n) requestAnimationFrame(step); else { tag.textContent = final; busy = false; }
      })();
    });
  });
})();

/* 4. Chip occlusion — add inside initOrbit()'s chips.forEach in main.js,
      replacing the existing chip.style.opacity line:

      var behind = Math.cos(a) > 0.45;              // right arc sits behind the cutout
      chip.style.opacity = behind ? 0.12 : 0.55 + 0.45 * ((Math.sin(a) + 1) / 2);
      chip.style.pointerEvents = behind ? "none" : "auto";

   0.45 = (cutout left edge 53% − reactor centre 38%) × 620px ÷ R(205px).
*/
