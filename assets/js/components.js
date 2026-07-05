/* ============================================================
   ARC // Shared UI components — single source of truth
   Edit NAV / BRAND here and it updates the header on EVERY page.
   Pages just include:  <div id="site-header"></div>  +  this script (before main.js)
   ============================================================ */
(function () {
  "use strict";

  /* ---- ONE place to edit navigation ---- */
  var NAV = [
    ["about", "About"],
    ["profile", "Profile"],
    ["skills", "Skills"],
    ["stack", "Stack"],
    ["experience", "Experience"],
    ["projects", "Projects"],
    ["education", "Education"],
    ["contact", "Contact"]
  ];
  var BRAND = { name: "SHERAZ", sub: "Full-Stack &middot; GIS &middot; Cloud" };
  var CV = "assets/files/sheraz-cv.pdf";

  var host = document.getElementById("site-header");
  if (!host) return;

  /* On sub-pages (project.html) section links must point back to the homepage */
  var sub = /project\.html/i.test(location.href);
  function href(id) { return sub ? "index.html#" + id : "#" + id; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var navHtml = NAV.map(function (n) { return "<a href='" + href(n[0]) + "'>" + n[1] + "</a>"; }).join("");
  var mobHtml = NAV.map(function (n, i) {
    return "<a href='" + href(n[0]) + "'><span class='idx'>" + pad(i + 1) + "</span>" + n[1] + "</a>";
  }).join("");

  host.innerHTML =
    "<header class='hud-header" + (sub ? " scrolled" : "") + "' id='header'>" +
      "<div class='wrap'>" +
        "<a href='" + (sub ? "index.html" : "#top") + "' class='brand' aria-label='ARC OS home'>" +
          "<span class='mark' aria-hidden='true'>" +
            "<svg viewBox='0 0 40 40'><polygon points='20,2 36,11 36,29 20,38 4,29 4,11' fill='none' stroke='#38e0ff' stroke-width='1.5'/></svg>" +
            "<span>S</span></span>" +
          "<span>" + BRAND.name + "<small>" + BRAND.sub + "</small></span>" +
        "</a>" +
        "<nav class='nav' aria-label='Primary'>" + navHtml + "</nav>" +
        "<a href='" + CV + "' target='_blank' rel='noopener' class='btn btn-primary header-cta'>Resume &darr;</a>" +
        "<button class='nav-toggle' id='nav-toggle' aria-label='Open menu' aria-expanded='false'><span></span><span></span><span></span></button>" +
      "</div>" +
    "</header>" +
    "<div class='mobile-nav' id='mobile-nav' aria-hidden='true'>" +
      mobHtml +
      "<a href='" + CV + "' target='_blank' rel='noopener'><span class='idx'>" + pad(NAV.length + 1) + "</span>Resume &darr;</a>" +
    "</div>";
})();
