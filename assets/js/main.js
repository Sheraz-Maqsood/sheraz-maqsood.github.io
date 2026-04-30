const revealItems = document.querySelectorAll(".section, .hero-copy, .hero-panel, .project-card, .timeline-item, .showcase-card, .contact-card");

for (const item of revealItems) {
  item.setAttribute("data-reveal", "");
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  },
  {
    threshold: 0.12
  }
);

for (const item of revealItems) {
  observer.observe(item);
}

const yearNode = document.getElementById("current-year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}
