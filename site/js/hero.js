// Hero animacija: konj hoda dok se stranica skrola.
// Sličice se crtaju na canvas prema napretku skrolanja kroz sekciju.

import { postavke } from './postavke.js';
import { ucitajSlicice, najblizaUcitana } from './ucitavanje.js';

/**
 * Napredak skrolanja kroz sekciju, od 0 do 1.
 * vrh je udaljenost vrha sekcije od vrha prozora (negativna kad je sekcija otišla gore).
 */
export function napredakSekcije(vrh, visinaSekcije, visinaProzora) {
  const put = visinaSekcije - visinaProzora;
  if (put <= 0) return 0;
  return Math.min(1, Math.max(0, -vrh / put));
}

/** Redni broj sličice (od 0) za zadani napredak. */
export function indeksSlicice(napredak, ukupno) {
  if (ukupno <= 0) return 0;
  return Math.min(ukupno - 1, Math.floor(napredak * ukupno));
}

/** Faza naslova: broj granica koje je napredak prešao. */
export function fazaNaslova(napredak, granice) {
  return granice.filter((granica) => napredak >= granica).length;
}

export function pokreniHero() {
  const sekcija = document.querySelector('[data-hero]');
  const platno = sekcija?.querySelector('[data-hero-platno]');
  if (!sekcija || !platno) return;

  const { hero, prijelom } = postavke;
  const smanjenoKretanje = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dovoljnoSiroko = window.matchMedia(`(min-width: ${prijelom}px)`).matches;
  if (!hero.ukljuceno || hero.brojSlicica <= 0 || smanjenoKretanje || !dovoljnoSiroko) return;

  const uvod = document.querySelector('[data-uvod]');
  const postotak = uvod?.querySelector('[data-uvod-postotak]');
  const faze = sekcija.querySelectorAll('[data-hero-faza]');
  const kist = platno.getContext('2d');

  let trazena = 0;
  let nacrtana = -1;
  let cekaCrtanje = false;

  const prilagodiPlatno = () => {
    const gustoca = Math.min(window.devicePixelRatio || 1, 2);
    platno.width = Math.round(platno.clientWidth * gustoca);
    platno.height = Math.round(platno.clientHeight * gustoca);
    nacrtana = -1;
  };

  const nacrtaj = () => {
    cekaCrtanje = false;
    const indeks = najblizaUcitana(trazena, slicice.ucitano);
    if (indeks < 0 || indeks === nacrtana) return;
    const slika = slicice.slike[indeks];
    const omjer = Math.min(platno.width / slika.naturalWidth, platno.height / slika.naturalHeight);
    const sirina = slika.naturalWidth * omjer;
    const visina = slika.naturalHeight * omjer;
    // Bijela podloga: platno se s podlogom stranice stapa načinom "multiply".
    kist.fillStyle = '#fff';
    kist.fillRect(0, 0, platno.width, platno.height);
    kist.drawImage(slika, (platno.width - sirina) / 2, (platno.height - visina) / 2, sirina, visina);
    nacrtana = indeks;
  };

  const zatraziCrtanje = () => {
    if (cekaCrtanje) return;
    cekaCrtanje = true;
    window.requestAnimationFrame(nacrtaj);
  };

  const uskladiSaSkrolanjem = () => {
    const napredak = napredakSekcije(sekcija.getBoundingClientRect().top, sekcija.offsetHeight, window.innerHeight);
    trazena = indeksSlicice(napredak, hero.brojSlicica);
    const faza = fazaNaslova(napredak, hero.graniceFaza);
    faze.forEach((element, redniBroj) => element.classList.toggle('hero__faza--aktivna', redniBroj === faza));
    zatraziCrtanje();
  };

  if (uvod) uvod.hidden = false;

  const slicice = ucitajSlicice({
    ukupno: hero.brojSlicica,
    putanja: hero.putanja,
    prvaSkupina: hero.prvaSkupina,
    velicinaSkupine: hero.velicinaSkupine,
    naNapredak: (udio) => {
      if (postotak) postotak.textContent = String(Math.round(udio * 100));
    },
    // Kad stigne nova sličica, možda je bliža traženoj od one koja je nacrtana.
    naSlicicu: () => {
      if (sekcija.classList.contains('hero--animiran')) zatraziCrtanje();
    },
  });

  const istekVremena = new Promise((gotovo) => window.setTimeout(gotovo, hero.najduljeCekanjeMs));

  Promise.race([slicice.prvaSkupinaGotova, istekVremena]).then(() => {
    // Bez ijedne učitane sličice hero ostaje statična slika.
    if (slicice.ucitano.some(Boolean)) {
      sekcija.classList.add('hero--animiran');
      platno.hidden = false;
      prilagodiPlatno();
      uskladiSaSkrolanjem();
      window.addEventListener('scroll', uskladiSaSkrolanjem, { passive: true });
      window.addEventListener('resize', () => {
        prilagodiPlatno();
        uskladiSaSkrolanjem();
      });
    }
    if (uvod) {
      uvod.classList.add('uvod--odlazi');
      window.setTimeout(() => {
        uvod.hidden = true;
      }, 600);
    }
  });
}
