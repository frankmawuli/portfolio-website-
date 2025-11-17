/* Modern portfolio with smooth animations, theme toggle, mobile nav,
   counters, scroll reveal, testimonial slider, project filter, and parallax effects. */

document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const yearEl = document.getElementById("year");
  const scrollTopBtn = document.getElementById("scrollTop");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projects = document.querySelectorAll(".project-card");
  const testimonialSlider = document.getElementById("testimonialSlider");
  const prevTest = document.getElementById("prevTest");
  const nextTest = document.getElementById("nextTest");

  // SET YEAR
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // THEME (persist in localStorage with icon update)
  const setTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
    }
  };
  // initial
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme === "dark" || (!savedTheme && prefersDark));

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(!isDark);
    // Add bounce animation
    themeToggle.style.transform = "scale(1.2) rotate(20deg)";
    setTimeout(() => (themeToggle.style.transform = ""), 300);
  });

  // MOBILE NAV with smooth transitions
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.style.display === "block";
    nav.style.display = isOpen ? "" : "block";
    menuToggle.textContent = isOpen ? "☰" : "✕";
    menuToggle.style.transform = isOpen ? "" : "rotate(90deg)";
  });

  // Smooth internal link scrolling and active nav highlight
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80; // Account for fixed header
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
        // close mobile nav on selection
        if (window.innerWidth < 720 && nav) {
          nav.style.display = "";
          menuToggle.textContent = "☰";
          menuToggle.style.transform = "";
        }
      }
    });
  });

  // Active nav link on scroll with smooth transitions
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = Array.from(navLinks)
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter((s) => s);
  const obsOptions = {
    root: null,
    rootMargin: "-80px 0px -60% 0px",
    threshold: 0,
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        const link = document.querySelector(
          `.nav a[href="#${entry.target.id}"]`
        );
        if (link) link.classList.add("active");
      }
    });
  }, obsOptions);
  sections.forEach((s) => {
    if (s) sectionObserver.observe(s);
  });

  // COUNTERS animation
  const counters = document.querySelectorAll(".stat-num");
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = +el.dataset.target || 0;
          animateNumber(el, target, 1200);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((c) => counterObserver.observe(c));

  function animateNumber(el, target, duration) {
    const start = 0;
    const range = target - start;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      el.textContent =
        Math.floor(start + range * eased) + (target >= 100 ? "+" : "");
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + (target >= 100 ? "+" : "");
    }
    requestAnimationFrame(step);
  }
  function easeOutCubic(t) {
    return --t * t * t + 1;
  }

  // Scroll to top button with enhanced visibility
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    // Show/hide scroll to top
    if (currentScroll > 600) {
      scrollTopBtn.style.display = "flex";
      scrollTopBtn.style.opacity = "1";
    } else {
      scrollTopBtn.style.opacity = "0";
      setTimeout(() => {
        if (window.scrollY <= 600) scrollTopBtn.style.display = "none";
      }, 300);
    }

    lastScroll = currentScroll;
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Scroll reveal using IntersectionObserver with stagger effect
  const revealEls = document.querySelectorAll(
    ".section, .card, .service-card, .project-card, .testimonial"
  );
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.transition =
              "transform 700ms cubic-bezier(0.4, 0, 0.2, 1), opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)";
            entry.target.style.transform = "translateY(0)";
            entry.target.style.opacity = "1";
          }, index * 50); // Stagger effect
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  revealEls.forEach((el) => {
    el.style.transform = "translateY(30px)";
    el.style.opacity = "0";
    revealObserver.observe(el);
  });

  // Project filtering with smooth animations
  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      projects.forEach((p, index) => {
        const type = p.dataset.type;
        const shouldShow = filter === "*" || filter === type;

        if (shouldShow) {
          setTimeout(() => {
            p.style.display = "";
            setTimeout(() => {
              p.style.opacity = "1";
              p.style.transform = "scale(1)";
            }, 10);
          }, index * 50);
        } else {
          p.style.opacity = "0";
          p.style.transform = "scale(0.8)";
          setTimeout(() => (p.style.display = "none"), 300);
        }
      });
    })
  );

  // Testimonials slider with enhanced transitions
  let tIndex = 0;
  const slides = Array.from(testimonialSlider.children);
  const updateTestimonials = () => {
    slides.forEach((s, i) => {
      s.style.transform = `translateX(${100 * (i - tIndex)}%)`;
      s.style.opacity = i === tIndex ? "1" : "0";
      s.style.transition =
        "transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease";
    });
  };
  updateTestimonials();

  prevTest.addEventListener("click", () => {
    tIndex = (tIndex - 1 + slides.length) % slides.length;
    updateTestimonials();
  });

  nextTest.addEventListener("click", () => {
    tIndex = (tIndex + 1) % slides.length;
    updateTestimonials();
  });

  // Autoplay testimonials with pause on interaction
  let autoTest = setInterval(() => {
    tIndex = (tIndex + 1) % slides.length;
    updateTestimonials();
  }, 5000);

  const pauseAutoplay = () => clearInterval(autoTest);
  const resumeAutoplay = () => {
    clearInterval(autoTest);
    autoTest = setInterval(() => {
      tIndex = (tIndex + 1) % slides.length;
      updateTestimonials();
    }, 5000);
  };

  [prevTest, nextTest, testimonialSlider].forEach((el) => {
    el.addEventListener("mouseenter", pauseAutoplay);
    el.addEventListener("mouseleave", resumeAutoplay);
  });

  // Contact form demo handler with better UX
  const contactForm = document.getElementById("contactForm");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    // Simulate sending
    setTimeout(() => {
      submitBtn.textContent = "✓ Message Sent!";
      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert(
          "Thanks for reaching out! This is a demo form (no backend connected)."
        );
      }, 1500);
    }, 1000);
  });

  // Ensure nav hides on resize appropriately
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      nav.style.display = "";
      menuToggle.textContent = "☰";
      menuToggle.style.transform = "";
    }
  });

  // Add subtle parallax effect to hero
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector(".hero");
    if (hero && scrolled < 800) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      hero.style.opacity = 1 - scrolled / 1000;
    }
  });

  // Add hover effect to project cards
  projects.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-12px) scale(1.02)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
    });
  });

  // Small helper: remove initial transitions after page load
  setTimeout(() => {
    revealEls.forEach((el) => {
      if (el.style.opacity === "0") return;
      el.style.transition = "";
    });
  }, 1500);
});
