// Priprema fotografija za stranicu: iz mape izvori/ radi manje inačice u site/assets/img/.
// Pokretanje:  node alati/obradi-slike.mjs
// Treba paket "sharp". Ako nije instaliran u projektu, putanja se može zadati
// varijablom okoline SHARP_PATH.
//
// Izvorne datoteke se ne mijenjaju. Fotografije s djecom se ne obrađuju.

import { createRequire } from 'node:module';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_PATH || 'sharp');

const korijen = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ULAZ = path.join(korijen, 'izvori');
const IZLAZ = path.join(korijen, 'site', 'assets', 'img');

// Omjer šesterokuta s vrhom gore: širina je 0,866 visine.
const SESTEROKUT = { omjer: 0.866, sirine: [480, 800], jpg: 800 };
const FOTOGRAFIJA = { sirine: [640, 1024, 1600], jpg: 1280 };

/** izrez: { left, top, width, height } u pikselima izvorne slike (izborno). */
const slike = [
  // Hero: široka slika Anabele (21:9) s Higgsfielda; vidi docs/higgsfield.md.
  { izvor: 'higgsfield/anabela-hero.png', ime: 'anabela-hero', sirine: [960, 1600, 2400, 3168], jpg: 1920 },
  { izvor: 'DSC0112.jpg', ime: 'hipoterapija-kas', ...FOTOGRAFIJA },
  { izvor: 'DSC3065.jpg', ime: 'o-nama-portret', ...FOTOGRAFIJA },
  { izvor: 'DSC0124.jpg', ime: 'o-nama-sivi', ...FOTOGRAFIJA },
  { izvor: 'DSC2220.jpg', ime: 'o-nama-crni', ...FOTOGRAFIJA },
  { izvor: 'DSC0002.jpg', ime: 'aktivnosti-galop', ...FOTOGRAFIJA },
  // Anabela: izrez bez djeteta (alati/retus-anabela.py), širok samo 560 px.
  { izvor: 'anabela-izrez.png', ime: 'krdo-anabela', omjer: 0.866, sirine: [480], jpg: 480 },
  { izvor: 'DSC3065.jpg', ime: 'krdo-svijetlosmedi', ...SESTEROKUT, izrez: { left: 690, top: 0, width: 1484, height: 1714 } },
  { izvor: '0U8A8968.JPG', ime: 'krdo-smedi', ...SESTEROKUT, izrez: { left: 250, top: 0, width: 1487, height: 1717 } },
  { izvor: '0U8A8685.JPG', ime: 'krdo-sivi', ...SESTEROKUT, izrez: { left: 200, top: 420, width: 1300, height: 1501 } },
  // Tim: portreti s Higgsfielda (docs/higgsfield.md), izrezani za trokute šesterokuta (širina : visina = 1,1547).
  // Trokuti s vrhom dolje: lice u gornjoj trećini; s vrhom gore: lice niže. Logo na majici ostaje izvan kadra.
  { izvor: 'tim/hf-viktorija.png', ime: 'tim-viktorija', omjer: 1.1547, sirine: [400, 600], jpg: 600, izrez: { left: 187, top: 90, width: 646, height: 560 } },
  { izvor: 'tim/hf-suncica.png', ime: 'tim-suncica', omjer: 1.1547, sirine: [400, 600], jpg: 600, izrez: { left: 192, top: 75, width: 646, height: 560 } },
  { izvor: 'tim/hf-josipa.png', ime: 'tim-josipa', omjer: 1.1547, sirine: [400, 600], jpg: 600, izrez: { left: 207, top: 85, width: 646, height: 560 } },
  { izvor: 'tim/hf-gabrijela.png', ime: 'tim-gabrijela', omjer: 1.1547, sirine: [400, 600], jpg: 600, izrez: { left: 220, top: 5, width: 600, height: 520 } },
  { izvor: 'tim/hf-lorena.png', ime: 'tim-lorena', omjer: 1.1547, sirine: [400, 600], jpg: 600, izrez: { left: 195, top: 5, width: 600, height: 520 } },
  // Prava grupna fotografija tima s konjem (O nama).
  { izvor: 'tim/grupa-izvornik.jpg', ime: 'tim-skupa', ...FOTOGRAFIJA },
  { izvor: '463275769_1228874608150361_1008652529814843723_n.jpg', ime: 'logo', sirine: [540], jpg: 540 },
];

await mkdir(IZLAZ, { recursive: true });

for (const slika of slike) {
  const ulaz = path.join(ULAZ, slika.izvor);
  const osnova = () => {
    let cjevovod = sharp(ulaz).rotate();
    if (slika.izrez) cjevovod = cjevovod.extract(slika.izrez);
    return cjevovod;
  };
  const visina = (sirina) => (slika.omjer ? Math.round(sirina / slika.omjer) : null);
  const promijeniVelicinu = (sirina) =>
    osnova().resize({ width: sirina, height: visina(sirina) ?? undefined, fit: 'cover', withoutEnlargement: true });

  for (const sirina of slika.sirine) {
    const izlaz = path.join(IZLAZ, `${slika.ime}-${sirina}.webp`);
    await promijeniVelicinu(sirina).webp({ quality: 76 }).toFile(izlaz);
    await ispisi(izlaz);
  }
  const jpg = path.join(IZLAZ, `${slika.ime}-${slika.jpg}.jpg`);
  await promijeniVelicinu(slika.jpg).jpeg({ quality: 78, mozjpeg: true }).toFile(jpg);
  await ispisi(jpg);
}

async function ispisi(datoteka) {
  const { size } = await stat(datoteka);
  const meta = await sharp(datoteka).metadata();
  console.log(`${path.basename(datoteka).padEnd(34)} ${meta.width}x${meta.height}  ${Math.round(size / 1024)} KB`);
}
