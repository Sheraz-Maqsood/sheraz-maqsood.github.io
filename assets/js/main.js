document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for reveal animations
  const revealItems = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  for (const item of revealItems) {
    observer.observe(item);
  }

  // Mouse tracking spotlight effect for cards
  const cards = document.querySelectorAll(".spotlight-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // Set current year
  const yearNode = document.getElementById("current-year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  // Navbar scroll effect and Parallax Hero
  const header = document.querySelector(".site-header");
  const heroContent = document.querySelector('.hero-parallax');
  
  window.addEventListener("scroll", () => {
    // Navbar styling
    if (window.scrollY > 20) {
      if(header) {
        header.classList.add("navbar-scrolled");
        header.classList.remove("border-transparent");
      }
    } else {
      if(header) {
        header.classList.remove("navbar-scrolled");
        header.classList.add("border-transparent");
      }
    }
    
    // Parallax hero effect
    if (heroContent && window.scrollY < window.innerHeight) {
        const scrollY = window.scrollY;
        const opacity = 1 - (scrollY / 500);
        const yPos = scrollY * 0.2;
        const scale = Math.max(0.95, 1 - (scrollY / 2000));
        
        heroContent.style.opacity = Math.max(0, opacity);
        heroContent.style.transform = `translateY(${yPos}px) scale(${scale})`;
    }
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = mobileMenuBtn?.querySelector('.menu-icon');
  const closeIcon = mobileMenuBtn?.querySelector('.close-icon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      mobileMenu.classList.toggle("active");
      menuIcon?.classList.toggle("hidden");
      closeIcon?.classList.toggle("hidden");
    });
    
    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("active");
            menuIcon?.classList.remove("hidden");
            closeIcon?.classList.add("hidden");
        });
    });
  }
});
