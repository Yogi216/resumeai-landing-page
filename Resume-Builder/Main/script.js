/**
 * ResumeAI — script.js
 * Handles:
 *   1. Mobile navigation toggle
 *   2. FAQ accordion
 *   3. Pricing period toggle (monthly / annual)
 *   4. Smooth scrolling for anchor links
 *   5. Scroll-reveal animations (Intersection Observer)
 *   6. Newsletter form feedback
 *   7. Active nav link highlighting on scroll
 */

/* ── Utility: DOM selector shortcuts ─────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================= */
/*  1. MOBILE NAVIGATION TOGGLE                                   */
/* ============================================================= */
(function initMobileNav() {
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.hidden = false;
    hamburger.setAttribute('aria-expanded', 'true');
    // Trap focus inside menu on open
    mobileMenu.querySelector('a')?.focus();
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on any nav-close link click
  $$('[data-nav-close]').forEach(link =>
    link.addEventListener('click', closeMenu)
  );

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    const header = e.target.closest('.site-header');
    if (!header && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
})();

/* ============================================================= */
/*  2. FAQ ACCORDION                                              */
/* ============================================================= */
(function initFAQ() {
  const faqButtons = $$('.faq__question');
  if (!faqButtons.length) return;

  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = $('#' + answerId);
      if (!answer) return;

      if (expanded) {
        // Collapse
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        // Close any other open item first (accordion behaviour)
        faqButtons.forEach(other => {
          if (other !== btn && other.getAttribute('aria-expanded') === 'true') {
            other.setAttribute('aria-expanded', 'false');
            const otherId = other.getAttribute('aria-controls');
            const otherAns = $('#' + otherId);
            if (otherAns) otherAns.hidden = true;
          }
        });
        // Open this one
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });
})();

/* ============================================================= */
/*  3. PRICING TOGGLE (Monthly ↔ Annual)                          */
/* ============================================================= */
(function initPricingToggle() {
  const monthlyBtn = $('#toggle-monthly');
  const annualBtn  = $('#toggle-annual');
  const amounts    = $$('.price-amount');
  if (!monthlyBtn || !annualBtn) return;

  function setActive(mode) {
    // mode: 'monthly' | 'annual'
    const isAnnual = mode === 'annual';

    monthlyBtn.classList.toggle('active', !isAnnual);
    annualBtn.classList.toggle('active',   isAnnual);
    monthlyBtn.setAttribute('aria-pressed', String(!isAnnual));
    annualBtn.setAttribute('aria-pressed',  String(isAnnual));

    // Animate price numbers
    amounts.forEach(el => {
      const target = isAnnual
        ? el.dataset.annual
        : el.dataset.monthly;

      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';

      setTimeout(() => {
        el.textContent = target === '0' ? 'Free' : `$${target}`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 180);
    });
  }

  monthlyBtn.addEventListener('click', () => setActive('monthly'));
  annualBtn.addEventListener('click',  () => setActive('annual'));
})();

/* ============================================================= */
/*  4. SMOOTH SCROLLING (respects prefers-reduced-motion)         */
/* ============================================================= */
(function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = $('.site-header')?.offsetHeight || 68;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    // Update URL without page jump
    history.pushState(null, '', `#${targetId}`);

    // Move focus to section for screen readers
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();

/* ============================================================= */
/*  5. SCROLL-REVEAL ANIMATIONS (Intersection Observer)           */
/* ============================================================= */
(function initScrollReveal() {
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Add .reveal to section headers
  $$('.section-header').forEach(el => el.classList.add('reveal'));

  // Add .reveal-stagger to grids
  $$('.features__grid, .testimonials__grid, .pricing__grid, .steps, .trusted__logos').forEach(
    el => el.classList.add('reveal-stagger')
  );

  // Add .reveal to standalone cards
  $$('.about__inner > *, .cta-banner__inner').forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
})();

/* ============================================================= */
/*  6. NEWSLETTER FORM FEEDBACK                                   */
/* ============================================================= */
(function initNewsletter() {
  const form = $('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('.neu-input');
    const btn   = form.querySelector('button[type="submit"]');
    if (!input || !btn) return;

    const email = input.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRe.test(email)) {
      input.style.boxShadow = 'inset 4px 4px 10px #f8b4b4, inset -4px -4px 10px #ffffff, 0 0 0 2px #ef4444';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    // Reset error state
    input.style.boxShadow = '';
    input.setAttribute('aria-invalid', 'false');

    // Success feedback
    btn.textContent = '✓ Subscribed!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    input.value = '';
    input.disabled = true;
    btn.disabled = true;

    // Re-enable after 3 s
    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
      input.disabled = false;
      btn.disabled = false;
    }, 3000);
  });
})();

/* ============================================================= */
/*  7. ACTIVE NAV HIGHLIGHTING ON SCROLL                          */
/* ============================================================= */
(function initActiveNav() {
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const headerH = $('.site-header')?.offsetHeight || 68;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.style.color = isActive
              ? 'var(--accent)'
              : '';
          });
        }
      });
    },
    {
      rootMargin: `-${headerH + 20}px 0px -60% 0px`,
      threshold: 0
    }
  );

  sections.forEach(sec => observer.observe(sec));
})();

/* ============================================================= */
/*  8. HEADER SCROLL SHADOW                                        */
/* ============================================================= */
(function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;

  const handler = () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(0,0,0,0.1)'
      : '0 2px 12px rgba(0,0,0,0.06)';
  };

  window.addEventListener('scroll', handler, { passive: true });
})();
