/* Deliberate project exploration. No wheel interception or automatic rotation. */
(function () {
  "use strict";
  var stage = document.getElementById("network-scene");
  if (!stage) return;
  var cards = Array.from(stage.querySelectorAll("[data-project]")),
    selected = 0,
    pointer = null,
    suppressClick = false;
  var projects = [
    [
      "lte",
      "GIS / GOVERNMENT",
      "Linear Tree Enumeration",
      "How do you make plantation records useful on a map?",
      "Interactive mapping, spatial queries and role-based access bring field records into one platform for tracking trees along roads, canals and forest boundaries.",
      "Next.js · NestJS · PostgreSQL · PostGIS · Leaflet",
      "2 video walkthroughs · 27 screenshots · 5 reports",
    ],
    [
      "cms",
      "WORKFLOWS / GOVERNMENT",
      "Complaint Management",
      "How does an incident reach the officer who can act?",
      "Multi-role routing moves forest complaints through the administrative chain, with WhatsApp notifications, status tracking and an audit trail.",
      "React · Node.js · MongoDB · WhatsApp API",
      "Video walkthrough · 14 screenshots · Example report",
    ],
    [
      "ppms",
      "PUBLIC REPORTING / GIS",
      "Pakistan Plantation Management",
      "How can citizens contribute verifiable field data?",
      "GPS-tagged plantation records and photographic evidence connect citizens and departments through a shared geospatial platform.",
      "Laravel · Leaflet · GIS · MySQL",
      "Video walkthrough · 18 screenshots",
    ],
  ];
  function select(index) {
    selected = (index + cards.length) % cards.length;
    var spacing = Math.min(stage.clientWidth * 0.32, 220);
    cards.forEach(function (card, i) {
      var offset = (i - selected + cards.length) % cards.length;
      if (offset > 1) offset -= cards.length;
      card.style.setProperty("--x", offset * spacing + "px");
      card.style.setProperty(
        "--z",
        (offset === 0 ? 60 : -180) + "px",
      );
      card.style.setProperty(
        "--angle",
        (offset === 0 ? 0 : -offset * 28) + "deg",
      );
      card.style.setProperty(
        "--opacity",
        offset === 0 ? "1" : ".8",
      );
      card.style.setProperty(
        "--order",
        offset === 0 ? "4" : "2",
      );
      card.setAttribute("aria-pressed", String(i === selected));
    });
    var p = projects[selected];
    ["sector", "title", "question", "description", "stack", "evidence"].forEach(
      function (field, i) {
        document.getElementById("explorer-" + field).textContent = p[i + 1];
      },
    );
    document.getElementById("explorer-link").href = "project.html?id=" + p[0];
    document.getElementById("explorer-position").textContent =
      "0" + (selected + 1) + " / 03";
  }
  cards.forEach(function (card, i) {
    card.addEventListener("click", function (event) {
      if (suppressClick && event.detail !== 0) return;
      select(i);
    });
    card.addEventListener("focus", function () {
      if (!pointer) select(i);
    });
    card.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });
  });
  document
    .getElementById("explorer-prev")
    .addEventListener("click", function () {
      select(selected - 1);
    });
  document
    .getElementById("explorer-next")
    .addEventListener("click", function () {
      select(selected + 1);
    });
  stage.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(selected + (event.key === "ArrowRight" ? 1 : -1));
    cards[selected].focus();
  });
  stage.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    suppressClick = false;
  });
  stage.addEventListener("pointermove", function (event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (
      Math.abs(event.clientX - pointer.x) > 12 &&
      Math.abs(event.clientX - pointer.x) > Math.abs(event.clientY - pointer.y)
    ) {
      stage.classList.add("dragging");
      stage.setPointerCapture(event.pointerId);
    }
  });
  stage.addEventListener("pointerup", function (event) {
    if (!pointer) return;
    var dx = event.clientX - pointer.x,
      dy = event.clientY - pointer.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true;
      select(selected + (dx < 0 ? 1 : -1));
    }
    pointer = null;
    stage.classList.remove("dragging");
  });
  stage.addEventListener("pointercancel", function () {
    pointer = null;
    stage.classList.remove("dragging");
  });
  new ResizeObserver(function () {
    select(selected);
  }).observe(stage);
  new IntersectionObserver(function (entries) {
    document.body.classList.toggle(
      "network-in-view",
      entries[0].isIntersecting,
    );
  }).observe(document.getElementById("network"));
  select(0);
})();
