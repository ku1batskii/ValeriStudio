/**
 * main.js — Core page behaviors
 * - Scroll-triggered reveal animations (IntersectionObserver)
 * - Animated number counters
 * - Динамическое изменение контента (динамические подписи)
 */

(function () {
  'use strict';

  // ─── Scroll Reveal ──────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  }

  // ─── Animated Counter ──────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(el => counterObserver.observe(el));
  }

  // ─── Dynamic Content: live year ─────────────────────────
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ─── Dynamic Content: dynamic greeting ──────────────────
  const greetEl = document.querySelector('[data-greeting]');
  if (greetEl) {
    const hour = new Date().getHours();
    let msg = 'Добро пожаловать';
    if (hour >= 5  && hour < 12) msg = 'Доброе утро';
    if (hour >= 12 && hour < 18) msg = 'Добрый день';
    if (hour >= 18 && hour < 23) msg = 'Добрый вечер';
    greetEl.textContent = msg;
  }

  // ─── Dynamic Content: live clock in footer ───────────────
  const clockEl = document.querySelector('[data-clock]');
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${s}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ─── Staggered card reveals ─────────────────────────────
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  staggerContainers.forEach(container => {
    const children = Array.from(container.children);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
      child.classList.add('reveal');
    });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Array.from(entry.target.children).forEach(child => {
            child.classList.add('in-view');
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    obs.observe(container);
  });

  // ─── Cursor accent dot ─────────────────────────────────
  // Subtle custom cursor enhancement on desktop
  if (window.matchMedia('(pointer: fine)').matches) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed; pointer-events: none; z-index: 99999;
      width: 6px; height: 6px; background: var(--accent, #d4f54a);
      border-radius: 50%; top: 0; left: 0;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease, opacity 0.3s ease;
      will-change: transform;
    `;
    document.body.appendChild(dot);

    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function moveDot() {
      cx += (mx - cx) * 0.25;
      cy += (my - cy) * 0.25;
      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      requestAnimationFrame(moveDot);
    }
    moveDot();

    // Scale up on interactive elements
    document.querySelectorAll('a, button, .service-card, .preview-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(3)';
        dot.style.opacity = '0.4';
      });
      el.addEventListener('mouseleave', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
        dot.style.opacity = '1';
      });
    });
  }

})();