const cards = document.querySelectorAll('.memory-card');
const backdrop = document.createElement('div');
backdrop.className = 'letter-backdrop';
document.body.appendChild(backdrop);
let openCard = null;

function loadMedia(card) {
  card.querySelectorAll('[data-src]').forEach(element => {
    element.src = element.dataset.src;
    element.removeAttribute('data-src');
  });
  card.querySelectorAll('video, audio').forEach(media => media.load());
}

function unlockCard(card) {
  loadMedia(card);
  card.classList.add('unlocked');
  openCard = card;
  backdrop.classList.add('show');
  document.body.classList.add('modal-open');
  const letter = card.querySelector('.memory-content');
  letter.tabIndex = -1;
  letter.focus();
  const media = card.querySelector('video, audio');
  if (media) {
    document.querySelectorAll('video, audio').forEach(otherMedia => {
      if (otherMedia !== media && !otherMedia.paused) otherMedia.pause();
    });
    media.play().catch(() => media.classList.add('autoplay-blocked'));
  }
}

function closeLetter() {
  if (!openCard) return;
  openCard.querySelectorAll('video, audio').forEach(media => media.pause());
  const input = openCard.querySelector('input');
  openCard.classList.remove('unlocked');
  openCard.querySelector('.code-status').textContent = '';
  backdrop.classList.remove('show');
  document.body.classList.remove('modal-open');
  openCard = null;
  input.focus();
}

cards.forEach(card => {
  const form = card.querySelector('.unlock-form');
  const input = form.querySelector('input');
  const status = form.querySelector('.code-status');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const entered = input.value.trim().toUpperCase();
    if (entered === card.dataset.code.toUpperCase()) {
      status.textContent = 'Unlocked with love.';
      status.className = 'code-status success';
      unlockCard(card);
      input.value = '';
    } else {
      status.textContent = 'That code does not match. Try again.';
      status.className = 'code-status error';
      input.select();
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  });

  const closeButton = card.querySelector('.close-memory');
  closeButton.setAttribute('aria-label', 'Close this letter');
  closeButton.addEventListener('click', closeLetter);
});

backdrop.addEventListener('click', closeLetter);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLetter();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video, audio').forEach(media => media.pause());
});
