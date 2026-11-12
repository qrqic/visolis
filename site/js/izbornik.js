// Otvaranje i zatvaranje izbornika na uskim ekranima.

export function pokreniIzbornik() {
  const gumb = document.querySelector('[data-izbornik-gumb]');
  const izbornik = document.querySelector('[data-izbornik]');
  if (!gumb || !izbornik) return;

  const postavi = (otvoren) => {
    gumb.setAttribute('aria-expanded', String(otvoren));
    izbornik.classList.toggle('izbornik--otvoren', otvoren);
  };

  gumb.addEventListener('click', () => postavi(gumb.getAttribute('aria-expanded') !== 'true'));

  izbornik.addEventListener('click', (dogadaj) => {
    if (dogadaj.target.closest('a')) postavi(false);
  });

  document.addEventListener('keydown', (dogadaj) => {
    if (dogadaj.key === 'Escape' && gumb.getAttribute('aria-expanded') === 'true') {
      postavi(false);
      gumb.focus();
    }
  });
}
