/* ============================================================
   ARC // Shared UI components — single source of truth
   Edit NAV / BRAND here and it updates the header on EVERY page.
   Pages just include:  <div id="site-header"></div>  +  this script (before main.js)
   ============================================================ */
(function () {
  "use strict";

  /* ---- ONE place to edit navigation ---- */
  var NAV = [
    ["network", "Explore"],
    ["about", "About"],
    ["stack", "Skills"],
    ["experience", "Experience"],
    ["projects", "Projects"],
    ["education", "Education"],
    ["contact", "Contact"]
  ];
  var BRAND = { name: "SHERAZ", sub: "Full-Stack &middot; GIS &middot; Cloud" };
  var CV = "Sheraz%20CV%20-%20Curriculum%20vitae%2025042026.pdf";
  var LOGO = "assets/brand/logo-mark-96.webp";   /* SM monogram — used in the header on every page */

  var host = document.getElementById("site-header");
  if (!host) return;

  /* On sub-pages (project.html) section links must point back to the homepage */
  var sub = /(?:project|404)\.html/i.test(location.pathname);
  function href(id) { return sub ? "index.html#" + id : "#" + id; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var navHtml = NAV.map(function (n) { return "<a href='" + href(n[0]) + "'>" + n[1] + "</a>"; }).join("");
  var mobHtml = NAV.map(function (n, i) {
    return "<a href='" + href(n[0]) + "'><span class='idx'>" + pad(i + 1) + "</span>" + n[1] + "</a>";
  }).join("");

  host.innerHTML =
    "<header class='hud-header" + (sub ? " scrolled" : "") + "' id='header'>" +
      "<div class='wrap'>" +
        "<a href='" + (sub ? "index.html" : "#top") + "' class='brand' aria-label='Sheraz — home'>" +
          "<span class='mark' aria-hidden='true'>" +
            "<img src='" + LOGO + "' alt='' width='42' height='42' decoding='async'></span>" +
          "<span>" + BRAND.name + "<small>" + BRAND.sub + "</small></span>" +
        "</a>" +
        "<nav class='nav' aria-label='Primary'>" + navHtml + "</nav>" +
        "<a href='" + CV + "' target='_blank' rel='noopener' class='btn btn-primary header-cta'>Resume &darr;</a>" +
        "<button class='nav-toggle' id='nav-toggle' aria-label='Open menu' aria-expanded='false' aria-controls='mobile-nav'><span></span><span></span><span></span></button>" +
      "</div>" +
    "</header>" +
    "<div class='mobile-nav' id='mobile-nav' aria-label='Mobile navigation' aria-hidden='true' inert>" +
      mobHtml +
      "<a href='" + CV + "' target='_blank' rel='noopener'><span class='idx'>" + pad(NAV.length + 1) + "</span>Resume &darr;</a>" +
    "</div>";
})();
