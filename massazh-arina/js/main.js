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

// ===== Фото кабинета крупно =====
const lightbox = document.querySelector('.lightbox');
const shots = [...document.querySelectorAll('.gallery__item')];

if (lightbox && shots.length && typeof lightbox.showModal === 'function') {
  const big = lightbox.querySelector('.lightbox__img');
  const text = lightbox.querySelector('.lightbox__text');
  const count = lightbox.querySelector('.lightbox__count');
  let current = 0;

  const show = (i) => {
    current = (i + shots.length) % shots.length;   // после последнего – снова первое
    const small = shots[current].querySelector('img');
    big.src = small.getAttribute('src');
    big.alt = small.alt;
    text.textContent = small.alt;
    count.textContent = `${current + 1} из ${shots.length}`;
    big.classList.remove('is-in');
    void big.offsetWidth;                          // перезапуск мягкого появления
    big.classList.add('is-in');
  };

  shots.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      show(i);
      document.body.classList.add('has-lightbox');
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());

  // Клик по тёмному фону (мимо фото и кнопок) закрывает
  lightbox.addEventListener('click', (e) => {
    if (!e.target.closest('.lightbox__img, .lightbox__btn, .lightbox__caption')) lightbox.close();
  });
  // Стрелки на клавиатуре листают, Escape браузер закрывает сам
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // Свайп пальцем влево-вправо
  let startX = null;
  big.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  big.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  lightbox.addEventListener('close', () => {
    document.body.classList.remove('has-lightbox');
    shots[current].focus();                        // возвращаемся к тому фото, на котором остановились
    shots[current].scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
  const hoverTargets = 'a, button, summary, .t-card, .seal';

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
