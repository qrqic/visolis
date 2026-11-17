// Tim u šesterokutu: svaka članica ima svoj trokut.
// Prijelaz mišem povećava trokut (samo CSS); klik prikazuje podatke o članici pokraj šesterokuta.
// Bez JavaScripta podaci o svim članicama vide se kao popis.

export function pokreniTim() {
  for (const korijen of document.querySelectorAll('[data-tim]')) {
    const gumbi = [...korijen.querySelectorAll('[data-tim-gumb]')];
    const clanovi = [...korijen.querySelectorAll('[data-tim-clan]')];
    const uputa = korijen.querySelector('[data-tim-uputa]');
    for (const clan of clanovi) clan.hidden = true;

    const odaberi = (kljuc) => {
      for (const gumb of gumbi) {
        const odabran = gumb.dataset.timGumb === kljuc;
        gumb.setAttribute('aria-pressed', String(odabran));
        gumb.parentElement.classList.toggle('tim6__dio--odabran', odabran);
      }
      for (const clan of clanovi) clan.hidden = clan.dataset.timClan !== kljuc;
      if (uputa) uputa.hidden = true;
      korijen.classList.add('tim6--odabrano');
    };

    for (const gumb of gumbi) gumb.addEventListener('click', () => odaberi(gumb.dataset.timGumb));
  }
}

// Primjer C: stupci. Klik zadrži stupac proširenim i prikaže podatke na slici; drugi klik ih skriva.
export function pokreniStupce() {
  for (const korijen of document.querySelectorAll('[data-stupci]')) {
    const stupci = [...korijen.querySelectorAll('.stupac')];
    for (const stupac of stupci) {
      const gumb = stupac.querySelector('button');
      gumb.addEventListener('click', () => {
        const otvori = !stupac.classList.contains('stupac--odabran');
        for (const drugi of stupci) {
          const odabran = otvori && drugi === stupac;
          drugi.classList.toggle('stupac--odabran', odabran);
          drugi.querySelector('button').setAttribute('aria-pressed', String(odabran));
        }
        korijen.classList.toggle('stupci--odabrano', otvori);
      });
    }
  }
}
