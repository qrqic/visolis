// Iz videa hoda radi sličice hero animacije i statičnu sliku konja.
//
// Pokretanje:  node alati/izrezi-slicice.mjs izvori/higgsfield/hod-kling-std.mp4
// Treba ffmpeg i paket "sharp" (putanja se može zadati varijablom okoline SHARP_PATH).
//
// Što radi:
//  1. ffmpeg izdvaja sve sličice videa.
//  2. Bira se BROJ sličica ravnomjerno raspoređenih kroz video. Prva sličica videa se
//     preskače: ona je izvorna slika s čisto bijelom pozadinom, a sve ostale imaju
//     malo tamniju pozadinu, pa bi prijelaz s prve na drugu zatreperio.
//  3. Svakoj se pozadina podiže na čistu bijelu (ista korekcija za sve sličice),
//     jer se platno s podlogom stranice stapa množenjem i svaka siva nijansa bi se vidjela.
//  4. Iz prve sličice videa nastaje statična slika za mobitel i za smanjeno kretanje.

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, statSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_PATH || 'sharp');

const BROJ = 120; // mora odgovarati postavke.hero.brojSlicica
const BIJELA_TOCKA = 244; // pozadina videa je oko 246–251; sve od 244 naviše postaje 255
const KVALITETA = 82;
const NAJVISE_KB = 150;
// Statična slika: desni dio kadra, bez prazne lijeve četvrtine.
const STATICNA = { sirina: 960, sirine: [640, 960] };

const video = process.argv[2];
if (!video) {
  console.error('Upotreba: node alati/izrezi-slicice.mjs <video.mp4>');
  process.exit(1);
}

const korijen = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const izlazSlicice = path.join(korijen, 'site', 'assets', 'frames');
const izlazSlike = path.join(korijen, 'site', 'assets', 'img');
const privremeno = mkdtempSync(path.join(tmpdir(), 'slicice-'));

try {
  execFileSync('ffmpeg', ['-v', 'error', '-i', video, '-start_number', '0', path.join(privremeno, 's-%04d.png')]);
  const sve = readdirSync(privremeno).filter((ime) => ime.endsWith('.png')).sort();
  if (sve.length < BROJ + 1) throw new Error(`Video ima samo ${sve.length} sličica, a treba ih barem ${BROJ + 1}.`);

  rmSync(izlazSlicice, { recursive: true, force: true });
  mkdirSync(izlazSlicice, { recursive: true });

  const pojacanje = 255 / BIJELA_TOCKA;
  let najveca = 0;
  let ukupno = 0;
  let najtamnijaPozadina = 255;

  for (let i = 0; i < BROJ; i++) {
    // Ravnomjerno kroz sličice 1 .. zadnja (nulta se preskače).
    const izvorna = 1 + Math.round((i * (sve.length - 2)) / (BROJ - 1));
    const izlaz = path.join(izlazSlicice, `konj-${String(i + 1).padStart(3, '0')}.jpg`);
    await sharp(path.join(privremeno, sve[izvorna]))
      .linear(pojacanje, 0)
      .jpeg({ quality: KVALITETA, mozjpeg: true })
      .toFile(izlaz);

    const velicina = statSync(izlaz).size;
    najveca = Math.max(najveca, velicina);
    ukupno += velicina;

    // Provjera: sva četiri kuta gotove sličice moraju biti (gotovo) čisto bijela.
    const { width, height } = await sharp(izlaz).metadata();
    for (const [left, top] of [[8, 8], [width - 40, 8], [8, height - 40], [width - 40, height - 40]]) {
      const tocke = await sharp(izlaz).extract({ left, top, width: 32, height: 32 }).raw().toBuffer();
      najtamnijaPozadina = Math.min(najtamnijaPozadina, Math.min(...tocke));
    }
  }

  const { width, height } = await sharp(path.join(izlazSlicice, 'konj-001.jpg')).metadata();
  console.log(`Sličice: ${BROJ} komada, ${width}x${height}, ukupno ${(ukupno / 1048576).toFixed(1)} MB, najveća ${Math.round(najveca / 1024)} KB`);
  console.log(`Najtamnija točka u kutovima: ${najtamnijaPozadina} (255 je čista bijela)`);
  if (najveca > NAJVISE_KB * 1024) throw new Error(`Najveća sličica prelazi ${NAJVISE_KB} KB.`);
  if (najtamnijaPozadina < 252) throw new Error('Pozadina nije dovoljno bijela; povećati korekciju (smanjiti BIJELA_TOCKA).');

  // Statična slika iz prve sličice videa.
  const prva = path.join(privremeno, sve[0]);
  const izrez = { left: width - STATICNA.sirina, top: 0, width: STATICNA.sirina, height };
  for (const sirina of STATICNA.sirine) {
    await sharp(prva).extract(izrez).resize({ width: sirina }).webp({ quality: 82 }).toFile(path.join(izlazSlike, `hero-konj-${sirina}.webp`));
  }
  await sharp(prva).extract(izrez).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(izlazSlike, `hero-konj-${STATICNA.sirina}.jpg`));
  console.log(`Statična slika: hero-konj-{${STATICNA.sirine.join(',')}}.webp i hero-konj-${STATICNA.sirina}.jpg, ${STATICNA.sirina}x${height}`);
} finally {
  rmSync(privremeno, { recursive: true, force: true });
}
