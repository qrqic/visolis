// Učitavanje sličica hero animacije.

/**
 * Redni broj učitane sličice najbliže traženoj.
 * Pri istoj udaljenosti bira nižu. Vraća -1 ako nijedna nije učitana.
 */
export function najblizaUcitana(indeks, ucitano) {
  for (let odmak = 0; odmak < ucitano.length; odmak++) {
    if (ucitano[indeks - odmak]) return indeks - odmak;
    if (ucitano[indeks + odmak]) return indeks + odmak;
  }
  return -1;
}

const cekajMirovanje = () =>
  new Promise((gotovo) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => gotovo(), { timeout: 500 });
    else window.setTimeout(gotovo, 60);
  });

/**
 * Učitava prvu skupinu sličica odmah, a ostale u pozadini, skupinu po skupinu.
 *
 * naNapredak(udio) javlja udio (0 do 1) obrađene prve skupine.
 * naSlicicu(indeks) javlja svaku uspješno učitanu sličicu.
 * prvaSkupinaGotova daje broj uspješno učitanih sličica prve skupine.
 */
export function ucitajSlicice({ ukupno, putanja, prvaSkupina, velicinaSkupine, naNapredak = () => {}, naSlicicu = () => {} }) {
  const slike = new Array(ukupno).fill(null);
  const ucitano = new Array(ukupno).fill(false);

  const ucitaj = (indeks) =>
    new Promise((gotovo) => {
      const slika = new Image();
      slika.decoding = 'async';
      slika.onload = () => {
        slike[indeks] = slika;
        ucitano[indeks] = true;
        naSlicicu(indeks);
        gotovo(true);
      };
      slika.onerror = () => gotovo(false);
      slika.src = putanja(indeks + 1);
    });

  const prvih = Math.min(prvaSkupina, ukupno);
  let obradeno = 0;
  const prvaSkupinaGotova = Promise.all(
    Array.from({ length: prvih }, (_, indeks) =>
      ucitaj(indeks).then((uspjelo) => {
        obradeno += 1;
        naNapredak(obradeno / prvih);
        return uspjelo;
      }),
    ),
  ).then((ishodi) => ishodi.filter(Boolean).length);

  prvaSkupinaGotova.then(async () => {
    for (let pocetak = prvih; pocetak < ukupno; pocetak += velicinaSkupine) {
      await cekajMirovanje();
      const kraj = Math.min(pocetak + velicinaSkupine, ukupno);
      await Promise.all(Array.from({ length: kraj - pocetak }, (_, i) => ucitaj(pocetak + i)));
    }
  });

  return { slike, ucitano, prvaSkupinaGotova };
}
