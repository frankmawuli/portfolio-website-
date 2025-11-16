/* Basic interactive features: theme toggle, mobile nav, smooth scroll,
   counters, scroll reveal, testimonial slider, and project filter. */

document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTS
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const yearEl = document.getElementById('year');
  const scrollTopBtn = document.getElementById('scrollTop');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');
  const testimonialSlider = document.getElementById('testimonialSlider');
  const prevTest = document.getElementById('prevTest');
  const nextTest = document.getElementById('nextTest');

  // SET YEAR
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // THEME (persist in localStorage)
  const setTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme','dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme','light');
    }
  };
  // initial
  setTheme(localStorage.getItem('theme') === 'dark');

  themeToggle.addEventListener('click', () => {
    setTheme(!document.documentElement.classList.contains('dark'));
  });

  // MOBILE NAV
  menuToggle.addEventListener('click', () => {
    if (nav.style.display === 'block') {
      nav.style.display = '';
    } else {
      nav.style.display = 'block';
    }
  });

  // Smooth internal link scrolling and active nav highlight
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        // close mobile nav on selection
        if (window.innerWidth < 720 && nav) nav.style.display = '';
      }
    });
  });

  // Active nav link on scroll
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks).map(l => document.querySelector(l.getAttribute('href')));
  const obsOptions = {root:null, rootMargin: '0px 0px -40% 0px', threshold:0};
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, obsOptions);
  sections.forEach(s => { if (s) sectionObserver.observe(s); });

  // COUNTERS animation
  const counters = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target || 0;
        animateNumber(el, target, 1200);
        observer.unobserve(el);
      }
    });
  }, {threshold:0.6});

  counters.forEach(c => counterObserver.observe(c));

  function animateNumber(el, target, duration){
    const start = 0;
    const range = target - start;
    const startTime = performance.now();
    function step(now){
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      el.textContent = Math.floor(start + range * eased) + (target >= 100 ? '+' : '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + (target >= 100 ? '+' : '');
    }
    requestAnimationFrame(step);
  }
  function easeOutCubic(t){ return (--t)*t*t+1 }

  // Scroll to top button
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) scrollTopBtn.style.display = 'block';
    else scrollTopBtn.style.display = 'none';
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Scroll reveal using IntersectionObserver
  const revealEls = document.querySelectorAll('.section, .card, .service-card, .project-card, .testimonial');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'transform 600ms var(--transition), opacity 600ms var(--transition)';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.opacity = '1';
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealEls.forEach(el => {
    el.style.transform = 'translateY(20px)';
    el.style.opacity = '0';
    revealObserver.observe(el);
  });

  // Project filtering
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projects.forEach(p => {
      const type = p.dataset.type;
      if (filter === '*' || filter === type) {
        p.style.display = '';
        p.style.opacity = '1';
      } else {
        p.style.display = 'none';
        p.style.opacity = '0';
      }
    });
  }));

  // Testimonials slider (simple)
  let tIndex = 0;
  const slides = Array.from(testimonialSlider.children);
  const updateTestimonials = () => {
    slides.forEach((s,i) => s.style.transform = `translateX(${100 * (i - tIndex)}%)`);
  };
  updateTestimonials();
  prevTest.addEventListener('click', () => { tIndex = (tIndex - 1 + slides.length) % slides.length; updateTestimonials(); });
  nextTest.addEventListener('click', () => { tIndex = (tIndex + 1) % slides.length; updateTestimonials(); });

  // Autoplay testimonials
  let autoTest = setInterval(() => { tIndex = (tIndex + 1) % slides.length; updateTestimonials(); }, 4200);
  [prevTest, nextTest, testimonialSlider].forEach(el => el.addEventListener('mouseenter', () => clearInterval(autoTest)));
  [prevTest, nextTest, testimonialSlider].forEach(el => el.addEventListener('mouseleave', () => autoTest = setInterval(() => { tIndex = (tIndex + 1) % slides.length; updateTestimonials(); }, 4200)));

  // Contact form demo handler
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! This is a demo contact form (no backend).');
    contactForm.reset();
  });

  // ensure nav hides on resize appropriately
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) nav.style.display = '';
  });

  // small helper: set initial scroll reveal for top sections visible
  setTimeout(() => revealEls.forEach(el => el.style.transition = ''), 1200);
});
