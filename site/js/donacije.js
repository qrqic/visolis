// Prozor za donacije: barkod za plaćanje, spremanje barkoda na mobitelu
// i podaci za ručnu uplatu (prikazuju se kad je IBAN upisan u postavke).

import { postavke } from './postavke.js';

const POLJA = [
  ['primatelj', 'Primatelj'],
  ['iban', 'IBAN'],
  ['model', 'Model'],
  ['pozivNaBroj', 'Poziv na broj'],
  ['opis', 'Opis plaćanja'],
];

function jeIos() {
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function popuniRucno(prozor) {
  const podaci = postavke.donacije || {};
  const blok = prozor.querySelector('[data-donacije-rucno]');
  const popis = prozor.querySelector('[data-donacije-podaci]');
  if (!blok || !popis || !podaci.iban) return;

  for (const [kljuc, naziv] of POLJA) {
    const vrijednost = podaci[kljuc];
    if (!vrijednost) continue;
    const red = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    const tekst = document.createElement('span');
    dt.textContent = naziv;
    tekst.textContent = vrijednost;
    dd.append(tekst);

    if (navigator.clipboard) {
      const gumb = document.createElement('button');
      gumb.type = 'button';
      gumb.className = 'donacije-prozor__kopiraj';
      gumb.textContent = 'Kopiraj';
      gumb.setAttribute('aria-label', `Kopiraj: ${naziv}`);
      gumb.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(kljuc === 'iban' ? vrijednost.replace(/\s/g, '') : vrijednost);
          gumb.textContent = 'Kopirano';
        } catch {
          gumb.textContent = 'Nije uspjelo';
        }
        setTimeout(() => (gumb.textContent = 'Kopiraj'), 2000);
      });
      dd.append(gumb);
    }
    red.append(dt, dd);
    popis.append(red);
  }
  blok.hidden = false;
}

// Na iPhoneu "download" sprema u Datoteke, a ne u Fotografije.
// Izbornik za dijeljenje ondje nudi "Spremi sliku", pa ga koristimo.
// Datoteka se dohvaća unaprijed jer Safari dijeljenje dopušta samo
// izravno nakon dodira.
function pripremiSpremanje(prozor) {
  const gumb = prozor.querySelector('[data-donacije-spremi]');
  if (!gumb || !jeIos() || !navigator.canShare) return;

  let datoteka = null;
  fetch(gumb.href)
    .then((odgovor) => odgovor.blob())
    .then((blob) => {
      const kandidat = new File([blob], gumb.getAttribute('download'), { type: 'image/png' });
      if (navigator.canShare({ files: [kandidat] })) datoteka = kandidat;
    })
    .catch(() => {});

  gumb.addEventListener('click', (dogadaj) => {
    if (!datoteka) return;
    dogadaj.preventDefault();
    navigator.share({ files: [datoteka] }).catch(() => {});
  });
}

export function pokreniDonacije() {
  const prozor = document.querySelector('[data-donacije]');
  const otvaraci = document.querySelectorAll('[data-donacije-otvori]');
  if (!prozor || typeof prozor.showModal !== 'function') return;

  popuniRucno(prozor);
  pripremiSpremanje(prozor);

  for (const otvarac of otvaraci) {
    otvarac.addEventListener('click', (dogadaj) => {
      dogadaj.preventDefault();
      prozor.showModal();
    });
  }

  // Klik na zatamnjenu pozadinu zatvara prozor.
  prozor.addEventListener('click', (dogadaj) => {
    if (dogadaj.target === prozor) prozor.close();
  });
}
