// Crtež konja: SVG od pokretnih dijelova. Položaje dijelova računa konj-kretanje.js.
// Boje dolaze iz CSS varijabli (--dlaka, --griva, --noge) koje se postavljaju po konju; vidi css/krdo.css.

import { OBLICI, poza } from './konj-kretanje.js';

const SVG = 'http://www.w3.org/2000/svg';
let brojac = 0;

// Obrisi dijelova, konj gleda udesno. Koordinate su u viewBoxu 240 x 170.
const TRUP = 'M152,56 C138,60 112,61 92,55 C74,50 60,58 60,74 C60,88 68,98 82,100 C98,99 114,102 134,103 C152,104 168,100 170,83 C171,68 164,58 152,56 Z';
const VRAT = 'M136,66 C150,48 166,34 180,20 L198,42 C187,55 180,70 176,86 C174,94 168,99 160,101 C150,94 140,80 136,66 Z';
const GLAVA = 'M176,22 C182,13 194,16 199,25 L215,46 C219,52 217,59 210,60 C204,60 200,57 197,53 L186,46 C180,40 176,30 176,22 Z';
const OBRAZ = { cx: 189.5, cy: 37.5, r: 9.5 };
const UHO = 'M180,22 L184,6 L190,20 Z';
const GRIVA = 'M186,16 C172,26 156,42 140,64 C146,68 152,66 156,60 C160,50 170,40 178,36 C184,32 188,26 190,20 Z';
const SISKE = 'M184,16 C190,16 196,22 197,31 C192,27 188,25 184,24 Z';
const LISA = 'M193,23 C197,27 207,39 212,47 L208,49 C203,42 195,32 190,27 Z';
const REP = 'M68,58 C56,58 48,74 48,100 C48,122 52,134 58,142 C60,128 62,112 64,98 C66,84 70,72 72,64 Z';
const HVATISTE_REPA = { x: 66, y: 60 };
const HVATISTE_VRATA = { x: 146, y: 70 };

function element(naziv, atributi = {}, roditelj = null) {
  const el = document.createElementNS(SVG, naziv);
  for (const [ime, vrijednost] of Object.entries(atributi)) el.setAttribute(ime, vrijednost);
  roditelj?.append(el);
  return el;
}

/**
 * Stvara crtež jednog konja.
 * opis: { oblik: 'konj' | 'poni', dlaka, griva, noge?, mrlje?, lisa? }
 * Vraća { svg, postavi(faza, tezina) }.
 */
export function napraviKonja(opis) {
  const naziv = opis.oblik === 'poni' ? 'poni' : 'konj';
  const mjere = OBLICI[naziv];
  const poni = naziv === 'poni';
  const debljina = poni ? 0.94 : 1;

  const svg = element('svg', { viewBox: '0 0 240 170', class: `konj konj--${naziv}`, 'aria-hidden': 'true', focusable: 'false' });
  svg.style.setProperty('--dlaka', opis.dlaka);
  svg.style.setProperty('--griva', opis.griva);
  if (opis.noge) svg.style.setProperty('--noge', opis.noge);

  const crteNoge = (roditelj, noga) => {
    const dodatak = noga.daleka ? ' konj__noga--daleka' : '';
    return {
      gornja: element('line', { class: `konj__noga${dodatak}`, 'stroke-width': (noga.prednja ? 11 : 15) * debljina }, roditelj),
      donja: element('line', { class: `konj__noga konj__noga--donja${dodatak}`, 'stroke-width': (noga.prednja ? 6.5 : 7) * debljina }, roditelj),
      kopito: element('line', { class: 'konj__kopito', 'stroke-width': 8 * debljina }, roditelj),
    };
  };

  // Redoslijed crtanja: daleke noge, trup s vratom i repom, bliže noge.
  const pocetna = poza(0, 0, mjere);
  const daleke = element('g', {}, svg);
  const trup = element('g', {}, svg);
  const blize = element('g', {}, svg);
  const noge = pocetna.noge.map((noga) => crteNoge(noga.daleka ? daleke : blize, noga));

  const rep = element('path', { d: REP, class: 'konj__griva' }, trup);
  element('path', { d: TRUP, class: 'konj__dlaka' }, trup);
  if (opis.mrlje) {
    const isjecak = `konj-trup-${++brojac}`;
    element('path', { d: TRUP }, element('clipPath', { id: isjecak }, trup));
    const mrlje = element('g', { 'clip-path': `url(#${isjecak})`, class: 'konj__mrlja' }, trup);
    element('ellipse', { cx: 126, cy: 66, rx: 19, ry: 30, transform: 'rotate(18 126 66)' }, mrlje);
    element('ellipse', { cx: 76, cy: 68, rx: 15, ry: 17 }, mrlje);
  }
  const vrat = element('g', {}, trup);
  // Poni ima veću glavu u odnosu na tijelo.
  const glava = element('g', poni ? { transform: `translate(${HVATISTE_VRATA.x} ${HVATISTE_VRATA.y}) scale(1.1) translate(${-HVATISTE_VRATA.x} ${-HVATISTE_VRATA.y})` } : {}, vrat);
  element('path', { d: VRAT, class: 'konj__dlaka' }, glava);
  element('path', { d: UHO, class: 'konj__dlaka' }, glava);
  element('path', { d: GLAVA, class: 'konj__dlaka' }, glava);
  element('circle', { ...OBRAZ, class: 'konj__dlaka' }, glava);
  if (opis.lisa) element('path', { d: LISA, class: 'konj__mrlja' }, glava);
  element('circle', { cx: 197, cy: 30, r: 1.9, class: 'konj__oko' }, glava);
  element('path', { d: GRIVA, class: 'konj__griva' }, glava);
  element('path', { d: SISKE, class: 'konj__griva' }, glava);

  const zaokruzi = (broj) => Math.round(broj * 100) / 100;

  function postavi(faza, tezina) {
    const p = poza(faza, tezina, mjere);
    trup.setAttribute(
      'transform',
      `translate(0 ${zaokruzi(p.trup.pomakY)}) rotate(${zaokruzi(p.trup.nagib)} ${mjere.srediste.x} ${mjere.srediste.y}) translate(0 ${mjere.spust})`,
    );
    vrat.setAttribute('transform', `rotate(${zaokruzi(p.vrat)} ${HVATISTE_VRATA.x} ${HVATISTE_VRATA.y})`);
    rep.setAttribute('transform', `rotate(${zaokruzi(p.rep)} ${HVATISTE_REPA.x} ${HVATISTE_REPA.y})`);

    p.noge.forEach((noga, redniBroj) => {
      const crte = noge[redniBroj];
      const postaviCrtu = (crta, a, b) => {
        crta.setAttribute('x1', zaokruzi(a.x));
        crta.setAttribute('y1', zaokruzi(a.y));
        crta.setAttribute('x2', zaokruzi(b.x));
        crta.setAttribute('y2', zaokruzi(b.y));
      };
      postaviCrtu(crte.gornja, noga.zglob, noga.koljeno);
      postaviCrtu(crte.donja, noga.koljeno, noga.kopito);
      // Kopito nastavlja smjer donjeg dijela noge.
      const duljina = Math.hypot(noga.kopito.x - noga.koljeno.x, noga.kopito.y - noga.koljeno.y) || 1;
      const visina = mjere.visinaKopita + 1;
      postaviCrtu(crte.kopito, noga.kopito, {
        x: noga.kopito.x + ((noga.kopito.x - noga.koljeno.x) / duljina) * visina,
        y: noga.kopito.y + ((noga.kopito.y - noga.koljeno.y) / duljina) * visina,
      });
    });
  }

  postavi(0, 0);
  return { svg, postavi };
}
