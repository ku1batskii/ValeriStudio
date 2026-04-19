/**
 * slider.js — Hero slider
 * - Auto-play with configurable interval
 * - Prev / Next buttons
 * - Dot indicators
 * - Progress bar
 * - Touch / swipe support
 * - Keyboard left/right arrows
 * - Pause on hover
 */

(function () {
  'use strict';

  const track   = document.querySelector('.slides-track');
  if (!track) return;

  const slides    = Array.from(document.querySelectorAll('.slide'));
  const dots      = Array.from(document.querySelectorAll('.dot'));
  const prevBtn   = document.querySelector('.slider-btn.prev');
  const nextBtn   = document.querySelector('.slider-btn.next');
  const progressBar = document.querySelector('.slider-progress');

  const INTERVAL = 5000;
  let current  = 0;
  let timer    = null;
  let paused   = false;

  // ─── Show a specific slide ─────────────────────────────
  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');

    resetProgress();
  }

  // ─── Progress bar ──────────────────────────────────────
  function resetProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    // Force reflow
    progressBar.offsetWidth; // eslint-disable-line
    if (!paused) {
      progressBar.classList.add('animating');
      progressBar.style.width = '100%';
      progressBar.style.transition = `width ${INTERVAL}ms linear`;
    }
  }

  // ─── Auto-play ─────────────────────────────────────────
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused) goTo(current + 1);
    }, INTERVAL);
  }

  function pauseSlider() {
    paused = true;
    if (progressBar) {
      const computed = getComputedStyle(progressBar).width;
      progressBar.style.transition = 'none';
      progressBar.style.width = computed;
    }
  }

  function resumeSlider() {
    paused = false;
    resetProgress();
  }

  // ─── Init ──────────────────────────────────────────────
  goTo(0);
  startTimer();

  // ─── Controls ──────────────────────────────────────────
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startTimer(); });
  });

  // ─── Keyboard ──────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startTimer(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startTimer(); }
  });

  // ─── Pause on hover ────────────────────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', pauseSlider);
    hero.addEventListener('mouseleave', resumeSlider);
  }

  // ─── Touch / Swipe ─────────────────────────────────────
  let touchStartX = null;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    pauseSlider();
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) {
      goTo(dx < 0 ? current + 1 : current - 1);
      startTimer();
    } else {
      resumeSlider();
    }
    touchStartX = null;
  }, { passive: true });

})();