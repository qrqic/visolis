// Kretanje crtanog konja: gdje su zglobovi i kopita u svakom trenutku trka.
// Samo račun, bez crtanja. Crtež je u konj-crtez.js.
//
// Koordinate su u jedinicama crteža (viewBox 240 x 170), konj gleda udesno, os y ide prema dolje.

const PUNI_KRUG = Math.PI * 2;
const ostatak = (broj) => broj - Math.floor(broj);
const izmedju = (a, b, t) => a + (b - a) * t;

/** Mjere jednog oblika. mjerilo skraćuje noge i korak; spust spušta trup da kopita ostanu na tlu. */
function oblik(mjerilo, spust) {
  const korak = (naprijed, natrag, podizanje) => ({
    naprijed: naprijed * mjerilo,
    natrag: natrag * mjerilo,
    podizanje: podizanje * mjerilo,
    udioOslonca: 0.28,
  });
  const prednji = korak(22, 18, 26);
  return {
    tlo: 158,
    visinaKopita: 3,
    spust,
    // Točka oko koje se trup njiše.
    srediste: { x: 113, y: 80 + spust },
    rame: { x: 146, y: 96 + spust },
    kuk: { x: 80, y: 94 + spust },
    prednja: { d1: 30 * mjerilo, d2: 30 * mjerilo, smjer: 1 },
    straznja: { d1: 32 * mjerilo, d2: 31 * mjerilo, smjer: -1 },
    korakPrednji: prednji,
    korakStraznji: korak(24, 16, 17),
    // Položaj kopita u mirovanju, vodoravno u odnosu na zglob.
    stajanje: { straznjaDaleka: -1 * mjerilo, straznjaBliza: -8 * mjerilo, prednjaDaleka: 6 * mjerilo, prednjaBliza: 0 },
    poskok: 3.5 * mjerilo,
    cucanj: 3.5 * mjerilo,
    njihanje: 3.5,
    // Put koji konj prijeđe u jednom ciklusu trka, da kopita na tlu ne klize.
    duljinaCiklusa: (prednji.naprijed + prednji.natrag) / prednji.udioOslonca,
  };
}

export const OBLICI = {
  konj: oblik(1, 0),
  poni: oblik(0.74, 15),
};

// Redoslijed doskoka u galopu: stražnje noge, zatim prednje, pa let.
const NOGE = [
  { ime: 'straznjaDaleka', prednja: false, daleka: true, pomakFaze: 0 },
  { ime: 'straznjaBliza', prednja: false, daleka: false, pomakFaze: 0.12 },
  { ime: 'prednjaDaleka', prednja: true, daleka: true, pomakFaze: 0.34 },
  { ime: 'prednjaBliza', prednja: true, daleka: false, pomakFaze: 0.46 },
];

/**
 * Noga od dva segmenta: iz položaja zgloba i cilja kopita računa položaj koljena.
 * smjer 1 savija koljeno naprijed (prednja noga), -1 natrag (skočni zglob stražnje).
 * Ako je cilj predaleko, kopito se vraća na doseg noge.
 */
export function rijesiNogu(zglob, cilj, d1, d2, smjer) {
  let dx = cilj.x - zglob.x;
  let dy = cilj.y - zglob.y;
  let d = Math.hypot(dx, dy);
  if (d === 0) {
    dx = 0;
    dy = 1;
    d = 1;
  }
  const doseg = Math.min(Math.max(d, Math.abs(d1 - d2) + 0.001), d1 + d2 - 0.001);
  const kopito = doseg === d ? { x: cilj.x, y: cilj.y } : { x: zglob.x + (dx / d) * doseg, y: zglob.y + (dy / d) * doseg };
  const kosinus = (d1 * d1 + doseg * doseg - d2 * d2) / (2 * d1 * doseg);
  const kut = Math.atan2(dy, dx) - smjer * Math.acos(Math.min(1, Math.max(-1, kosinus)));
  return { koljeno: { x: zglob.x + d1 * Math.cos(kut), y: zglob.y + d1 * Math.sin(kut) }, kopito };
}

/**
 * Položaj kopita u jednom ciklusu trka, u odnosu na točku na tlu ispod zgloba.
 * s je udio ciklusa (0 do 1): prvo oslonac (kopito na tlu ide unatrag), zatim zamah (podignuto se vraća naprijed).
 */
export function kopitoUTrku(s, korak) {
  const raspon = korak.naprijed + korak.natrag;
  if (s < korak.udioOslonca) {
    return { x: korak.naprijed - raspon * (s / korak.udioOslonca), y: 0 };
  }
  const u = (s - korak.udioOslonca) / (1 - korak.udioOslonca);
  const glatko = u * u * (3 - 2 * u);
  return { x: -korak.natrag + raspon * glatko, y: -korak.podizanje * Math.sin(Math.PI * u) };
}

/** Faza trka nakon što se konj pomaknuo za zadani put (u bilo kojem smjeru). */
export function fazaNakonPomaka(faza, pomak, duljinaCiklusa) {
  return ostatak(faza + Math.abs(pomak) / duljinaCiklusa);
}

/**
 * Cijela poza konja.
 * faza: udio ciklusa trka (0 do 1). tezina: 0 = stoji, 1 = trči; između se poze pretapaju.
 */
export function poza(faza, tezina, mjere) {
  const pomakY = (-mjere.poskok * Math.cos(PUNI_KRUG * (faza - 0.8)) + mjere.cucanj) * tezina || 0;
  const nagib = -mjere.njihanje * Math.cos(PUNI_KRUG * (faza - 0.06)) * tezina || 0;
  const kosinus = Math.cos((nagib * Math.PI) / 180);
  const sinus = Math.sin((nagib * Math.PI) / 180);
  const pomakni = (tocka) => {
    const dx = tocka.x - mjere.srediste.x;
    const dy = tocka.y - mjere.srediste.y;
    return { x: mjere.srediste.x + dx * kosinus - dy * sinus, y: mjere.srediste.y + dx * sinus + dy * kosinus + pomakY };
  };
  const tloKopita = mjere.tlo - mjere.visinaKopita;

  const noge = NOGE.map((noga) => {
    const pocetak = noga.prednja ? mjere.rame : mjere.kuk;
    // Daleke noge su malo pomaknute naprijed, da se vide iza bližih.
    const osnova = { x: pocetak.x + (noga.daleka ? 3 : 0), y: pocetak.y };
    const duljine = noga.prednja ? mjere.prednja : mjere.straznja;
    const trk = kopitoUTrku(ostatak(faza - noga.pomakFaze), noga.prednja ? mjere.korakPrednji : mjere.korakStraznji);
    const cilj = {
      x: osnova.x + izmedju(mjere.stajanje[noga.ime], trk.x, tezina),
      y: tloKopita + trk.y * tezina,
    };
    const zglob = pomakni(osnova);
    return { ime: noga.ime, prednja: noga.prednja, daleka: noga.daleka, zglob, ...rijesiNogu(zglob, cilj, duljine.d1, duljine.d2, duljine.smjer) };
  });

  return {
    trup: { pomakY, nagib },
    // U trku se vrat ispruži naprijed i glava kima u ritmu; rep se diže i vijori.
    vrat: (9 + 3.5 * Math.sin(PUNI_KRUG * (faza - 0.3))) * tezina || 0,
    rep: (56 + 9 * Math.sin(PUNI_KRUG * (faza - 0.15))) * tezina || 0,
    noge,
  };
}
