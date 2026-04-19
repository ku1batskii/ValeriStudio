/**
 * nav.js — Site navigation behavior
 * - Header scroll effect
 * - Mobile menu toggle
 * - Active link detection
 * - Динамическое изменение контента: показ/скрытие overlay при открытии меню
 */

(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // ─── Header scroll state ───────────────────────────────
  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ─── Mobile menu toggle ────────────────────────────────
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    toggle.classList.add('open');
    navLinks.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    toggle.classList.remove('open');
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (menuOpen) closeMenu();
      else openMenu();
    });
  }

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // ─── Active link detection ─────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (
      href === currentPath ||
      (currentPath === '' && href === 'index.html') ||
      (currentPath === 'index.html' && href === 'index.html')
    ) {
      link.classList.add('active');
    }
  });

  // ─── Динамическое изменение: плавный header-tint ───────
  // При скролле меняем opacity logo и nav links
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const direction = y > lastY ? 'down' : 'up';
    lastY = y;

    // Hide header slightly on quick scroll down (> 200px from top)
    if (direction === 'down' && y > 200) {
      header.style.transform = 'translateY(-2px)';
    } else {
      header.style.transform = 'translateY(0)';
    }
  }, { passive: true });

})();