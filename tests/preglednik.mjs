// Provjera stranice u pravom pregledniku (Chromium, preko Playwrighta).
//
// Pokretanje:  node tests/preglednik.mjs
// Treba pakete "playwright" i (za provjeru hero animacije) "sharp". Ako nisu u projektu,
// putanje se mogu zadati varijablama okoline PLAYWRIGHT_PATH i SHARP_PATH.
// Snimke zaslona se spremaju u mapu iz varijable SNIMKE (ako je zadana).

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
let sharp = null;
try {
  sharp = require(process.env.SHARP_PATH || 'sharp');
} catch {
  /* bez sharpa se preskače provjera hero animacije */
}

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const SNIMKE = process.env.SNIMKE || null;
const STRANICE = ['index.html', 'hipoterapija.html', 'fizikalna-terapija.html', 'okupacijska-terapija.html', 'logopedska-terapija.html', 'privatnost.html'];
const SIRINE = [375, 768, 1024, 1440];
const VRSTE = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff': 'font/woff' };

// --- mali poslužitelj statičnih datoteka ---
const posluzitelj = createServer(async (zahtjev, odgovor) => {
  const staza = decodeURIComponent(new URL(zahtjev.url, 'http://x').pathname);
  const datoteka = path.join(SITE, staza === '/' ? 'index.html' : staza);
  if (!datoteka.startsWith(SITE) || !existsSync(datoteka)) {
    odgovor.writeHead(404).end('Nema');
    return;
  }
  odgovor.writeHead(200, { 'Content-Type': VRSTE[path.extname(datoteka)] || 'application/octet-stream' });
  odgovor.end(await readFile(datoteka));
});
await new Promise((gotovo) => posluzitelj.listen(0, '127.0.0.1', gotovo));
const OSNOVA = `http://127.0.0.1:${posluzitelj.address().port}`;

// --- bilježenje ishoda ---
let prolaza = 0;
const padovi = [];
function provjeri(uvjet, opis) {
  if (uvjet) prolaza += 1;
  else padovi.push(opis);
  console.log(`${uvjet ? '  ok  ' : '  PAD '} ${opis}`);
}

const preglednik = await chromium.launch();

/** Otvara stranicu i skuplja greške konzole i neuspjele zahtjeve. */
async function otvori(staza, { sirina = 1440, visina = 900, kontekst = {}, priprema } = {}) {
  const ctx = await preglednik.newContext({ viewport: { width: sirina, height: visina }, ...kontekst });
  const stranica = await ctx.newPage();
  const problemi = [];
  stranica.on('console', (poruka) => poruka.type() === 'error' && problemi.push(`konzola: ${poruka.text()}`));
  stranica.on('pageerror', (greska) => problemi.push(`greška: ${greska.message}`));
  stranica.on('response', (odgovor) => odgovor.status() >= 400 && problemi.push(`${odgovor.status()} ${odgovor.url()}`));
  if (priprema) await priprema(stranica);
  await stranica.goto(`${OSNOVA}/${staza}`, { waitUntil: 'networkidle' });
  return { stranica, problemi, zatvori: () => ctx.close() };
}

/** Zamjenjuje postavke.js izmijenjenom inačicom, bez diranja datoteke na disku. */
async function sPostavkama(stranica, izmjena) {
  const izvornik = await readFile(path.join(SITE, 'js', 'postavke.js'), 'utf8');
  await stranica.route('**/js/postavke.js', (ruta) => ruta.fulfill({ contentType: 'text/javascript', body: izmjena(izvornik) }));
}

async function snimi(stranica, ime, cijela = true) {
  if (!SNIMKE) return;
  await mkdir(SNIMKE, { recursive: true });
  await stranica.screenshot({ path: path.join(SNIMKE, ime), fullPage: cijela });
}

// === 1. Sve stranice na svim širinama ===
console.log('\nStranice i širine');
for (const staza of STRANICE) {
  for (const sirina of SIRINE) {
    const { stranica, problemi, zatvori } = await otvori(staza, { sirina });
    const prelijeva = await stranica.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    provjeri(problemi.length === 0, `${staza} @${sirina}: bez grešaka i neuspjelih zahtjeva${problemi.length ? ' — ' + problemi.join('; ') : ''}`);
    provjeri(!prelijeva, `${staza} @${sirina}: nema vodoravnog pomicanja`);
    await zatvori();
  }
}

// === 2. Unutarnje poveznice ===
console.log('\nPoveznice');
for (const staza of STRANICE) {
  const { stranica, zatvori } = await otvori(staza);
  const mrtve = await stranica.evaluate(async () => {
    const lose = [];
    for (const veza of document.querySelectorAll('a[href]')) {
      const url = new URL(veza.getAttribute('href'), location.href);
      if (url.origin !== location.origin) continue;
      const odgovor = await fetch(url.pathname);
      if (!odgovor.ok) {
        lose.push(veza.getAttribute('href'));
        continue;
      }
      if (url.hash) {
        const dokument = new DOMParser().parseFromString(await odgovor.text(), 'text/html');
        if (!dokument.getElementById(url.hash.slice(1))) lose.push(veza.getAttribute('href'));
      }
    }
    return lose;
  });
  provjeri(mrtve.length === 0, `${staza}: sve unutarnje poveznice vode nekamo${mrtve.length ? ' — ' + mrtve.join(', ') : ''}`);
  await zatvori();
}

// === 3. Obrazac ===
console.log('\nObrazac');
{
  const { stranica, zatvori } = await otvori('index.html');
  await stranica.click('[data-obrazac] [type=submit]');
  const vidljivih = await stranica.locator('[data-greska]:visible').count();
  provjeri(vidljivih === 3, `prazan obrazac prikazuje tri greške (prikazano: ${vidljivih})`);
  provjeri(await stranica.evaluate(() => document.activeElement?.name === 'ime'), 'fokus ide na prvo neispravno polje');

  await stranica.fill('[name=ime]', 'Ana Anić');
  await stranica.fill('[name=kontakt]', '095 555 4789');
  await stranica.check('[name=privola]');
  await stranica.click('[data-obrazac] [type=submit]');
  const poruka = await stranica.locator('[data-obrazac-poruka]').innerText();
  provjeri(/još nije povezan/.test(poruka) && /4789/.test(poruka), 'bez adrese slanja: poruka s brojem telefona');
  provjeri((await stranica.locator('[data-greska]:visible').count()) === 0, 'ispravan unos uklanja greške');
  await zatvori();
}
for (const [opis, status] of [['uspjeh', 200], ['neuspjeh', 500]]) {
  let poslano = null;
  const { stranica, zatvori } = await otvori('index.html', {
    priprema: async (s) => {
      await sPostavkama(s, (izvor) => izvor.replace("adresaSlanja: ''", "adresaSlanja: 'https://obrasci.test/upit'"));
      await s.route('https://obrasci.test/upit', (ruta) => {
        poslano = ruta.request().postDataJSON();
        ruta.fulfill({ status, contentType: 'application/json', body: '{}', headers: { 'Access-Control-Allow-Origin': '*' } });
      });
    },
  });
  await stranica.fill('[name=ime]', 'Ana Anić');
  await stranica.fill('[name=kontakt]', 'ana@example.com');
  await stranica.fill('[name=poruka]', 'Zanima me termin.');
  await stranica.check('[name=privola]');
  await stranica.click('[data-obrazac] [type=submit]');
  if (status === 200) {
    await stranica.waitForSelector('[data-obrazac-uspjeh]:visible');
    provjeri(poslano?.ime === 'Ana Anić' && poslano?.kontakt === 'ana@example.com' && !('web' in poslano), `${opis}: poslani su ime i kontakt, bez skrivenog polja`);
    provjeri(await stranica.locator('[data-obrazac]').isHidden(), `${opis}: obrazac zamjenjuje poruka zahvale`);
    await snimi(stranica, 'obrazac-uspjeh.png', false);
  } else {
    await stranica.waitForSelector('[data-obrazac-poruka]:visible');
    provjeri(/nije poslan/.test(await stranica.locator('[data-obrazac-poruka]').innerText()), `${opis}: poruka o grešci s telefonom`);
    provjeri((await stranica.inputValue('[name=poruka]')) === 'Zanima me termin.', `${opis}: uneseni tekst ostaje u poljima`);
  }
  await zatvori();
}
{
  let zahtjeva = 0;
  const { stranica, zatvori } = await otvori('index.html', {
    priprema: async (s) => {
      await sPostavkama(s, (izvor) => izvor.replace("adresaSlanja: ''", "adresaSlanja: 'https://obrasci.test/upit'"));
      await s.route('https://obrasci.test/upit', (ruta) => {
        zahtjeva += 1;
        ruta.fulfill({ status: 200, body: '{}' });
      });
    },
  });
  await stranica.fill('[name=ime]', 'Robot');
  await stranica.fill('[name=kontakt]', 'robot@example.com');
  await stranica.check('[name=privola]');
  await stranica.evaluate(() => (document.querySelector('[name=web]').value = 'http://spam.example'));
  await stranica.click('[data-obrazac] [type=submit]');
  await stranica.waitForSelector('[data-obrazac-uspjeh]:visible');
  provjeri(zahtjeva === 0, 'ispunjeno skriveno polje: ništa se ne šalje');
  await zatvori();
}

// === 4. Aktualno ===
console.log('\nAktualno');
const sutra = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
const slucajevi = [
  ['ispravan zapis', JSON.stringify({ naslov: 'Advent na konjima', datum: sutra, prikazuj_do: sutra, tekst: 'Dođite na druženje.', poveznica: 'https://www.instagram.com/udruga_vis_solis/', poveznica_tekst: 'Više na Instagramu' }), true],
  ['prošli datum', JSON.stringify({ naslov: 'Staro', prikazuj_do: '2020-01-01' }), false],
  ['prazna datoteka', '{}', false],
  ['neispravan JSON', '{ naslov: ', false],
];
for (const [opis, tijelo, ocekivano] of slucajevi) {
  const { stranica, problemi, zatvori } = await otvori('index.html', {
    priprema: (s) => s.route('**/data/aktualno.json', (ruta) => ruta.fulfill({ contentType: 'application/json', body: tijelo })),
  });
  const vidljivo = await stranica.locator('[data-aktualno]').isVisible();
  provjeri(vidljivo === ocekivano, `${opis}: najava ${ocekivano ? 'se prikazuje' : 'se ne prikazuje'}`);
  provjeri(problemi.length === 0, `${opis}: stranica radi bez grešaka${problemi.length ? ' — ' + problemi.join('; ') : ''}`);
  if (ocekivano) {
    provjeri((await stranica.locator('[data-aktualno-naslov]').innerText()) === 'Advent na konjima', `${opis}: naslov je iz datoteke`);
    await snimi(stranica, 'aktualno.png', false);
  }
  await zatvori();
}
{
  const { stranica, problemi, zatvori } = await otvori('index.html', {
    priprema: (s) => s.route('**/data/aktualno.json', (ruta) => ruta.fulfill({ status: 404, body: '' })),
  });
  provjeri(await stranica.locator('[data-aktualno]').isHidden(), 'datoteka nedostaje: najava se ne prikazuje');
  provjeri(await stranica.locator('.kartica').first().isVisible(), 'datoteka nedostaje: ostatak stranice radi');
  // Preglednik sam ispisuje poruku o neuspjelom zahtjevu; ona se ovdje očekuje.
  provjeri(problemi.filter((p) => !p.includes('aktualno.json') && !p.includes('Failed to load resource')).length === 0, 'datoteka nedostaje: nema drugih grešaka');
  await zatvori();
}

// === 5. Hero animacija s ispitnim sličicama ===
console.log('\nHero animacija');
if (!sharp) {
  console.log('  (preskočeno: nema paketa sharp za izradu ispitnih sličica)');
} else {
  const BROJ = 120;
  const slicice = await Promise.all(
    Array.from({ length: BROJ }, (_, i) => {
      const siva = Math.round(20 + (i / (BROJ - 1)) * 200);
      return sharp({ create: { width: 320, height: 180, channels: 3, background: { r: siva, g: siva, b: siva } } }).jpeg().toBuffer();
    }),
  );
  const zatrazene = new Set();
  const priprema = async (s) => {
    await sPostavkama(s, (izvor) => izvor.replace('ukljuceno: false', 'ukljuceno: true'));
    await s.route('**/assets/frames/konj-*.jpg', (ruta) => {
      const broj = Number(/konj-(\d+)\.jpg/.exec(ruta.request().url())[1]);
      zatrazene.add(broj);
      ruta.fulfill({ contentType: 'image/jpeg', body: slicice[broj - 1] });
    });
  };
  const sredinaPlatna = (s) =>
    s.evaluate(() => {
      const platno = document.querySelector('[data-hero-platno]');
      return platno.getContext('2d').getImageData(Math.floor(platno.width / 2), Math.floor(platno.height / 2), 1, 1).data[0];
    });
  const aktivnaFaza = (s) => s.evaluate(() => [...document.querySelectorAll('[data-hero-faza]')].findIndex((e) => e.classList.contains('hero__faza--aktivna')));
  const skrolajNa = async (s, udio) => {
    await s.evaluate((u) => {
      const sekcija = document.querySelector('[data-hero]');
      window.scrollTo({ top: sekcija.offsetTop + u * (sekcija.offsetHeight - window.innerHeight), behavior: 'instant' });
    }, udio);
    await s.waitForTimeout(250);
  };

  {
    const { stranica, problemi, zatvori } = await otvori('index.html', { priprema });
    await stranica.waitForSelector('.hero--animiran');
    await stranica.waitForFunction(() => document.querySelector('[data-uvod]').hidden);
    await stranica.waitForTimeout(1500); // pozadinsko učitavanje ostalih sličica
    provjeri(zatrazene.size === BROJ, `zatraženo je svih ${BROJ} sličica (zatraženo: ${zatrazene.size})`);
    provjeri(problemi.length === 0, `animirani hero bez grešaka${problemi.length ? ' — ' + problemi.join('; ') : ''}`);

    await skrolajNa(stranica, 0);
    const naPocetku = [await sredinaPlatna(stranica), await aktivnaFaza(stranica)];
    await skrolajNa(stranica, 0.5);
    const naSredini = [await sredinaPlatna(stranica), await aktivnaFaza(stranica)];
    await snimi(stranica, 'hero-animiran-sredina.png', false);
    // Bijeli rub sličice mora se stopiti s krem podlogom stranice (#f7f2e8).
    const rub = await stranica.evaluate(() => {
      const okvir = document.querySelector('[data-hero-platno]').getBoundingClientRect();
      return { x: Math.round(okvir.right - 20), y: Math.round(okvir.top + 20) };
    });
    const tocka = await sharp(await stranica.screenshot({ clip: { ...rub, width: 1, height: 1 } })).raw().toBuffer();
    provjeri(Math.abs(tocka[0] - 0xf7) <= 2 && Math.abs(tocka[1] - 0xf2) <= 2 && Math.abs(tocka[2] - 0xe8) <= 2, `bijela pozadina sličice stapa se s podlogom (boja ruba: ${[...tocka.subarray(0, 3)]})`);
    await skrolajNa(stranica, 1);
    const naKraju = [await sredinaPlatna(stranica), await aktivnaFaza(stranica)];
    await skrolajNa(stranica, 0);
    const natrag = [await sredinaPlatna(stranica), await aktivnaFaza(stranica)];

    provjeri(naPocetku[0] < naSredini[0] && naSredini[0] < naKraju[0], `sličica prati skrolanje prema dolje (${naPocetku[0]} < ${naSredini[0]} < ${naKraju[0]})`);
    provjeri(Math.abs(natrag[0] - naPocetku[0]) <= 2, 'sličica se vraća pri skrolanju natrag');
    provjeri(naPocetku[1] === 0 && naSredini[1] === 1 && naKraju[1] === 2 && natrag[1] === 0, `naslov prolazi faze 0, 1, 2 i natrag na 0 (${[naPocetku[1], naSredini[1], naKraju[1], natrag[1]]})`);
    const zalijepljeno = await stranica.evaluate(() => {
      window.scrollTo({ top: 600, behavior: 'instant' });
      return Math.round(document.querySelector('.hero__pozornica').getBoundingClientRect().top);
    });
    const zaglavlje = await stranica.evaluate(() => document.querySelector('.zaglavlje').offsetHeight);
    provjeri(Math.abs(zalijepljeno - zaglavlje) <= 2, `pozornica stoji na mjestu ispod zaglavlja (${zalijepljeno} px)`);
    await zatvori();
  }
  {
    zatrazene.clear();
    const { stranica, zatvori } = await otvori('index.html', { sirina: 375, visina: 760, priprema });
    provjeri(!(await stranica.locator('.hero--animiran').count()) && zatrazene.size === 0, 'mobitel: nema animacije i ne učitava se nijedna sličica');
    provjeri(await stranica.locator('.hero__slika img').isVisible(), 'mobitel: prikazana je statična slika');
    await zatvori();
  }
  {
    zatrazene.clear();
    const { stranica, zatvori } = await otvori('index.html', { kontekst: { reducedMotion: 'reduce' }, priprema });
    provjeri(!(await stranica.locator('.hero--animiran').count()) && zatrazene.size === 0, 'smanjeno kretanje: nema animacije ni sličica');
    const skrivenih = await stranica.evaluate(() => [...document.querySelectorAll('[data-pojavi]')].filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e, '::after').content !== 'none').length);
    provjeri(skrivenih === 0, 'smanjeno kretanje: sav sadržaj je vidljiv odmah');
    await zatvori();
  }
  {
    // Nijedna sličica se ne učita: hero ostaje statičan, a uvodni zaslon se sklanja.
    const { stranica, zatvori } = await otvori('index.html', {
      priprema: async (s) => {
        await sPostavkama(s, (izvor) => izvor.replace('ukljuceno: false', 'ukljuceno: true'));
        await s.route('**/assets/frames/konj-*.jpg', (ruta) => ruta.abort());
      },
    });
    await stranica.waitForFunction(() => document.querySelector('[data-uvod]').hidden, null, { timeout: 6000 });
    provjeri(!(await stranica.locator('.hero--animiran').count()) && (await stranica.locator('.hero__slika img').isVisible()), 'sličice se ne učitaju: ostaje statična slika');
    await zatvori();
  }
}

// === 6. Pojavljivanje, tipkovnica, izbornik, bez JavaScripta ===
console.log('\nOstalo');
{
  const { stranica, zatvori } = await otvori('index.html');
  await stranica.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await stranica.waitForTimeout(1300);
  const skrivenih = await stranica.locator('[data-pojavi]:not(.vidljivo)').count();
  provjeri(skrivenih === 0, `nakon skrolanja svi elementi su otkriveni (skrivenih: ${skrivenih})`);
  const neucitane = await stranica.evaluate(() => [...document.querySelectorAll('main img')].filter((slika) => slika.offsetParent && !(slika.complete && slika.naturalWidth > 0)).map((slika) => slika.getAttribute('src')));
  provjeri(neucitane.length === 0, `nakon skrolanja sve su slike učitane${neucitane.length ? ' — ' + neucitane.join(', ') : ''}`);
  const pokriveno = await stranica.evaluate(() => [...document.querySelectorAll("[data-pojavi='slika']")].filter((e) => getComputedStyle(e, '::after').transform !== 'matrix(1, 0, 0, 0, 0, 0)').length);
  provjeri(pokriveno === 0, `nakon skrolanja nijedna fotografija nije pokrivena (pokrivenih: ${pokriveno})`);
  await snimi(stranica, 'pocetna-1440.png');
  await stranica.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await snimi(stranica, 'pocetna-1440-vrh.png', false);

  await stranica.keyboard.press('Tab');
  provjeri(await stranica.evaluate(() => document.activeElement.classList.contains('preskoci')), 'tipkovnica: prvi fokus je poveznica za preskakanje na sadržaj');
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('index.html', { sirina: 375, visina: 760 });
  provjeri(await stranica.locator('[data-izbornik]').isHidden(), 'mobitel: izbornik je zatvoren');
  await stranica.click('[data-izbornik-gumb]');
  provjeri(await stranica.locator('[data-izbornik]').isVisible(), 'mobitel: gumb otvara izbornik');
  await snimi(stranica, 'mobitel-izbornik.png', false);
  await stranica.keyboard.press('Escape');
  provjeri(await stranica.locator('[data-izbornik]').isHidden(), 'mobitel: Escape zatvara izbornik');
  const maleMete = await stranica.evaluate(() =>
    [...document.querySelectorAll('a, button, input:not([type=hidden]), select, textarea')]
      .filter((e) => e.offsetParent && !e.closest('.polje--zamka') && !e.closest('p, label, address'))
      // Kartica je cijela poveznica, a kućica privole dijeli površinu sa svojom oznakom.
      .map((e) => e.closest('.kartica') || (e.type === 'checkbox' && e.labels[0]) || e)
      .filter((e) => e.getBoundingClientRect().height < 43.5)
      .map((e) => `${e.tagName.toLowerCase()} "${(e.innerText || e.name || '').trim().slice(0, 24)}" ${Math.round(e.getBoundingClientRect().height)}px`),
  );
  provjeri(maleMete.length === 0, `mobitel: površine za dodir su visoke barem 44 px${maleMete.length ? ' — ' + maleMete.join('; ') : ''}`);
  await stranica.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 300) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await stranica.waitForTimeout(1300);
  await snimi(stranica, 'pocetna-375.png');
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('hipoterapija.html');
  await snimi(stranica, 'podstranica-1440.png');
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('index.html', { kontekst: { javaScriptEnabled: false } });
  provjeri(await stranica.locator('.kartica').first().isVisible(), 'bez JavaScripta: programi su vidljivi');
  provjeri(await stranica.locator('.izbornik__popis a').first().isVisible(), 'bez JavaScripta: izbornik je vidljiv');
  provjeri(await stranica.locator('.kontakt__telefon').isVisible(), 'bez JavaScripta: telefon je vidljiv');
  provjeri(await stranica.locator('noscript').count() > 0, 'bez JavaScripta: obrazac upućuje na telefon');
  await zatvori();
}

await preglednik.close();
posluzitelj.close();

console.log(`\nProšlo: ${prolaza}   Palo: ${padovi.length}`);
if (padovi.length) {
  console.log(padovi.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
