// Прячем нижнюю кнопку «Записаться», когда человек уже дошёл до блока записи
const sticky = document.querySelector('.sticky');
const contact = document.querySelector('#zapis');

if (sticky && contact && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    sticky.classList.toggle('is-hidden', entry.isIntersecting);
  }, { threshold: 0.1 }).observe(contact);
}

// Подгоняем огромное «АРИНА» точно под ширину экрана
const mast = document.querySelector('.mast__word');

const fitMast = () => {
  if (!mast) return;
  mast.style.fontSize = '100px';
  const inner = document.createRange();
  inner.selectNodeContents(mast);
  const textWidth = inner.getBoundingClientRect().width;
  mast.style.fontSize = (100 * mast.clientWidth * 0.94 / textWidth) + 'px';
};

document.fonts.ready.then(fitMast);
window.addEventListener('resize', fitMast);
