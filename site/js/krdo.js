// Krdo u trku: vodoravni red crtanih konja koji trče dok se red pomiče.
// Red se pomiče povlačenjem, strelicama, tipkovnicom ili vodoravnim skrolanjem.
// Okomito skrolanje stranice se ne zadržava. Podaci o konjima su u data/krdo.json.

import { OBLICI, fazaNakonPomaka } from './konj-kretanje.js';
import { napraviKonja } from './konj-crtez.js';

const OBLIK_BOJE = /^#[0-9a-f]{6}$/i;
// Koliko dugo nakon zadnjeg pomaka reda konji još "trče" (ms).
const TRAJANJE_POMAKA = 110;

/** Konj se prikazuje ako ima ime te boju dlake i grive u obliku #rrggbb. */
export function jeLiIspravanKonj(konj) {
  if (!konj || typeof konj !== 'object') return false;
  if (typeof konj.ime !== 'string' || !konj.ime.trim()) return false;
  return OBLIK_BOJE.test(konj.dlaka ?? '') && OBLIK_BOJE.test(konj.griva ?? '');
}

/** Težina trka (0 = stoji, 1 = trči) nakon dtMs: u trk ulazi brže nego što se zaustavlja. */
export function novaTezina(tezina, trci, dtMs) {
  const cilj = trci ? 1 : 0;
  const udio = 1 - Math.exp(-dtMs / (trci ? 120 : 240));
  return Math.min(1, Math.max(0, tezina + (cilj - tezina) * udio));
}

export async function pokreniKrdo() {
  const korijen = document.querySelector('[data-krdo]');
  if (!korijen) return;
  const staza = korijen.querySelector('[data-krdo-staza]');
  const red = korijen.querySelector('[data-krdo-red]');
  const natrag = korijen.querySelector('[data-krdo-natrag]');
  const naprijed = korijen.querySelector('[data-krdo-naprijed]');
  const kartica = document.querySelector('[data-krdo-kartica]');

  let podaci;
  try {
    const odgovor = await fetch('data/krdo.json', { cache: 'no-cache' });
    if (!odgovor.ok) return;
    podaci = await odgovor.json();
  } catch {
    return; // Bez podataka red ostaje prazan i skriven.
  }
  if (!Array.isArray(podaci)) return;
  const konji = podaci.filter(jeLiIspravanKonj);
  if (konji.length === 0) return;

  const smanjenoKretanje = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- crtanje reda ---
  const stanja = konji.map((konj, redniBroj) => {
    const stavka = document.createElement('li');
    const gumb = document.createElement('button');
    gumb.type = 'button';
    gumb.className = 'trk__konj';
    gumb.setAttribute('aria-pressed', 'false');
    const crtez = document.createElement('span');
    crtez.className = 'trk__crtez';
    const { svg, postavi } = napraviKonja(konj);
    crtez.append(svg);
    const ime = document.createElement('span');
    ime.className = 'trk__ime';
    ime.textContent = konj.ime.trim();
    gumb.append(crtez, ime);
    stavka.append(gumb);
    red.append(stavka);
    // Svaki konj kreće iz druge faze, da krdo ne trči u korak.
    return { konj, gumb, svg, postavi, faza: (redniBroj * 0.37) % 1, ciklus: 1 };
  });

  const izmjeriCikluse = () => {
    for (const stanje of stanja) {
      const mjerilo = stanje.svg.getBoundingClientRect().width / 240;
      const mjere = OBLICI[stanje.konj.oblik === 'poni' ? 'poni' : 'konj'];
      stanje.ciklus = Math.max(1, mjere.duljinaCiklusa * mjerilo);
    }
  };

  // --- kartica odabranog konja ---
  const dio = (naziv) => kartica?.querySelector(`[data-krdo-${naziv}]`);
  function odaberi(redniBroj) {
    stanja.forEach((stanje, i) => stanje.gumb.setAttribute('aria-pressed', String(i === redniBroj)));
    if (!kartica) return;
    const { konj } = stanja[redniBroj];
    dio('ime').textContent = konj.ime.trim();
    dio('opis').textContent = typeof konj.opis === 'string' ? konj.opis : '';
    const imaSliku = typeof konj.fotografija === 'string' && /^[a-z0-9-]+$/.test(konj.fotografija);
    dio('slika').hidden = !imaSliku;
    dio('bez-slike').hidden = imaSliku;
    if (imaSliku) {
      dio('slika').src = `assets/img/${konj.fotografija}-480.webp`;
      dio('slika').alt = typeof konj.opisFotografije === 'string' ? konj.opisFotografije : konj.ime.trim();
    }
    kartica.classList.toggle('konj-kartica--ceka', konj.ceka === true);
    kartica.hidden = false;
  }

  // --- trk ---
  let zadnjiPolozaj = staza.scrollLeft;
  let zadnjiPomak = -Infinity;
  let tezina = 0;
  let prethodniOkvir = 0;
  let petljaRadi = false;

  const okvir = (sada) => {
    const trci = sada - zadnjiPomak < TRAJANJE_POMAKA;
    tezina = novaTezina(tezina, trci, Math.min(sada - prethodniOkvir, 64));
    prethodniOkvir = sada;
    if (!trci && tezina < 0.002) tezina = 0;
    for (const stanje of stanja) stanje.postavi(stanje.faza, tezina);
    if (trci || tezina > 0) window.requestAnimationFrame(okvir);
    else petljaRadi = false;
  };

  const osvjeziStrelice = () => {
    const kraj = staza.scrollWidth - staza.clientWidth;
    natrag.disabled = staza.scrollLeft <= 1;
    naprijed.disabled = staza.scrollLeft >= kraj - 1;
  };

  staza.addEventListener(
    'scroll',
    () => {
      const pomak = staza.scrollLeft - zadnjiPolozaj;
      zadnjiPolozaj = staza.scrollLeft;
      osvjeziStrelice();
      if (pomak === 0 || smanjenoKretanje) return;
      // Kad red ide ulijevo, konji trče ulijevo; kad se vraća, okreću se.
      korijen.classList.toggle('trk--udesno', pomak < 0);
      for (const stanje of stanja) stanje.faza = fazaNakonPomaka(stanje.faza, pomak, stanje.ciklus);
      zadnjiPomak = performance.now();
      if (!petljaRadi) {
        petljaRadi = true;
        prethodniOkvir = zadnjiPomak;
        window.requestAnimationFrame(okvir);
      }
    },
    { passive: true },
  );

  const pomakni = (smjer) => staza.scrollBy({ left: smjer * staza.clientWidth * 0.8, behavior: smanjenoKretanje ? 'auto' : 'smooth' });
  natrag.addEventListener('click', () => pomakni(-1));
  naprijed.addEventListener('click', () => pomakni(1));

  // --- povlačenje mišem (dodir i dodirna pločica pomiču red sami) ---
  let povlacenje = null;
  let zanemariKlik = false;
  staza.addEventListener('pointerdown', (dogadaj) => {
    if (dogadaj.pointerType !== 'mouse' || dogadaj.button !== 0) return;
    povlacenje = { x: dogadaj.clientX, pocetak: staza.scrollLeft, pomaknuto: false };
  });
  window.addEventListener('pointermove', (dogadaj) => {
    if (!povlacenje) return;
    const dx = dogadaj.clientX - povlacenje.x;
    if (Math.abs(dx) > 5) {
      povlacenje.pomaknuto = true;
      korijen.classList.add('trk--povlacenje');
    }
    if (povlacenje.pomaknuto) staza.scrollLeft = povlacenje.pocetak - dx;
  });
  const zavrsiPovlacenje = () => {
    if (!povlacenje) return;
    if (povlacenje.pomaknuto) {
      // Klik koji slijedi nakon povlačenja ne smije odabrati konja.
      zanemariKlik = true;
      window.setTimeout(() => {
        zanemariKlik = false;
      }, 0);
    }
    povlacenje = null;
    korijen.classList.remove('trk--povlacenje');
  };
  window.addEventListener('pointerup', zavrsiPovlacenje);
  window.addEventListener('pointercancel', zavrsiPovlacenje);

  stanja.forEach((stanje, redniBroj) => {
    stanje.gumb.addEventListener('click', () => {
      if (!zanemariKlik) odaberi(redniBroj);
    });
  });

  window.addEventListener('resize', () => {
    izmjeriCikluse();
    osvjeziStrelice();
  });

  korijen.hidden = false;
  izmjeriCikluse();
  osvjeziStrelice();
  odaberi(0);
}
