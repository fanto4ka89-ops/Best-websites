// Прячем нижнюю кнопку «Записаться», когда человек уже дошёл до блока записи
const cta = document.querySelector('.sticky-cta');
const contact = document.querySelector('#zapis');

if (cta && contact && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    cta.classList.toggle('is-hidden', entry.isIntersecting);
  }, { threshold: 0.15 }).observe(contact);
}

// ===== Карусель отзывов =====
const track = document.querySelector('.carousel__track');
const arrows = document.querySelectorAll('.carousel__btn');

if (track) {
  // Включаем и выключаем стрелки: в начале нельзя назад, в конце – вперёд
  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    arrows.forEach((btn) => {
      btn.disabled = btn.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= maxScroll;
    });
  };

  arrows.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = track.querySelector('.t-card');
      const step = card ? card.offsetWidth + 16 : 300;
      track.scrollBy({ left: step * Number(btn.dataset.dir) });
    });
  });

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}

// ===== Отзыв целиком в окне =====
const modal = document.querySelector('.t-modal');

if (modal && typeof modal.showModal === 'function') {
  const fill = (cls, text) => { modal.querySelector(cls).textContent = text; };
  let lastCard = null;

  document.querySelectorAll('.t-card').forEach((card) => {
    card.addEventListener('click', () => {
      lastCard = card;
      fill('.t-modal__meta', card.querySelector('.t-card__meta').textContent);
      fill('.t-modal__name', card.querySelector('.t-card__name').textContent);
      fill('.t-modal__text', card.querySelector('.t-card__text').textContent);
      document.body.classList.add('has-modal');
      modal.showModal();
    });
  });

  const close = () => modal.close();
  modal.querySelector('.t-modal__close').addEventListener('click', close);
  // Клик мимо карточки закрывает окно; Escape браузер закрывает сам
  modal.addEventListener('click', (e) => {
    if (!e.target.closest('.t-modal__box')) close();
  });
  modal.addEventListener('close', () => {
    document.body.classList.remove('has-modal');
    if (lastCard) lastCard.focus();
  });
}

// ===== Анимированный курсор =====
// Работает только там, где есть мышь; на телефонах и при «уменьшить движение» – обычный курсор
const fineMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fineMouse && !calm) {
  const root = document.documentElement;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  root.classList.add('has-cursor');

  let x = innerWidth / 2, y = innerHeight / 2;   // где мышь
  let rx = x, ry = y;                            // где кольцо (догоняет мягко)
  let scale = 1, targetScale = 1;
  const hoverTargets = 'a, button, summary, .t-card';

  document.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    root.classList.add('cursor-visible');
    const overButton = e.target.closest(hoverTargets);
    root.classList.toggle('cursor-hover', !!overButton);
    targetScale = overButton ? 1.7 : 1;
  });
  document.addEventListener('mousedown', () => { targetScale *= 0.7; });
  document.addEventListener('mouseup', () => { targetScale /= 0.7; });
  document.documentElement.addEventListener('mouseleave', () => root.classList.remove('cursor-visible'));

  const tick = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    scale += (targetScale - scale) * 0.2;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) scale(${scale})`;

    // Окно с отзывом показывается поверх всего – переносим курсор внутрь него
    const openDialog = document.querySelector('dialog[open]');
    const home = openDialog || document.body;
    if (dot.parentNode !== home) home.append(dot, ring);

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
