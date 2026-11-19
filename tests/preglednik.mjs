// Provjera stranice u pravom pregledniku (Chromium, preko Playwrighta).
//
// Pokretanje:  node tests/preglednik.mjs
// Treba paket "playwright". Ako nije u projektu, putanja se može zadati
// varijablom okoline PLAYWRIGHT_PATH.
// Snimke zaslona se spremaju u mapu iz varijable SNIMKE (ako je zadana).

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const SNIMKE = process.env.SNIMKE || null;
const STRANICE = ['index.html', 'hipoterapija.html', 'aktivnosti-pomocu-konja.html', 'o-nama.html', 'dokumenti.html', 'novosti.html', 'privatnost.html'];
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
  const { stranica, zatvori } = await otvori('index.html', {
    priprema: (s) => sPostavkama(s, (izvor) => izvor.replace(/adresaSlanja: '[^']*'/, "adresaSlanja: ''")),
  });
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
for (const [opis, status, tijelo] of [['uspjeh', 200, '{"success":"true"}'], ['neuspjeh', 500, '{}'], ['odbijen upit', 200, '{"success":false,"message":"Nedostaje ime, kontakt ili privola."}']]) {
  let poslano = null;
  const { stranica, zatvori } = await otvori('index.html', {
    priprema: async (s) => {
      await sPostavkama(s, (izvor) => izvor.replace(/adresaSlanja: '[^']*'/, "adresaSlanja: 'https://obrasci.test/upit'"));
      await s.route('https://obrasci.test/upit', (ruta) => {
        poslano = ruta.request().postDataJSON();
        ruta.fulfill({ status, contentType: 'application/json', body: tijelo, headers: { 'Access-Control-Allow-Origin': '*' } });
      });
    },
  });
  await stranica.fill('[name=ime]', 'Ana Anić');
  await stranica.fill('[name=kontakt]', 'ana@example.com');
  await stranica.fill('[name=poruka]', 'Zanima me termin.');
  await stranica.check('[name=privola]');
  await stranica.click('[data-obrazac] [type=submit]');
  if (opis === 'uspjeh') {
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
      await sPostavkama(s, (izvor) => izvor.replace(/adresaSlanja: '[^']*'/, "adresaSlanja: 'https://obrasci.test/upit'"));
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
  provjeri(await stranica.locator('#hipoterapija h2').isVisible(), 'datoteka nedostaje: ostatak stranice radi');
  // Preglednik sam ispisuje poruku o neuspjelom zahtjevu; ona se ovdje očekuje.
  provjeri(problemi.filter((p) => !p.includes('aktualno.json') && !p.includes('Failed to load resource')).length === 0, 'datoteka nedostaje: nema drugih grešaka');
  await zatvori();
}

// === 5. Hero ===
console.log('\nHero');
for (const [sirina, visina] of [[375, 650], [390, 760], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [2560, 1080]]) {
  const { stranica, zatvori } = await otvori('index.html', { sirina, visina });
  const stanje = await stranica.evaluate(() => {
    const slika = document.querySelector('.hero__slika img');
    const okvir = (birac) => document.querySelector(birac).getBoundingClientRect();
    const naslov = okvir('.hero h1');
    const gumb = okvir('.hero .gumb');
    const redovi = [...document.querySelectorAll('.hero__red')].map((red) => red.getClientRects().length);
    return {
      ucitana: slika.complete && slika.naturalWidth > 0,
      izvor: slika.currentSrc.split('/').pop(),
      naslovURubu: naslov.left >= 0 && naslov.right <= window.innerWidth,
      gumbDno: Math.round(gumb.bottom),
      visina: window.innerHeight,
      prelomljenihRedova: redovi.filter((broj) => broj > 1).length,
    };
  });
  provjeri(stanje.ucitana, `hero @${sirina}: fotografija je učitana (${stanje.izvor})`);
  provjeri(stanje.naslovURubu && stanje.prelomljenihRedova === 0, `hero @${sirina}: svaki red naslova stane u jedan redak`);
  provjeri(stanje.gumbDno <= stanje.visina, `hero @${sirina}: gumb "Dogovorite termin" vidljiv je bez skrolanja (dno na ${stanje.gumbDno} od ${stanje.visina} px)`);
  await snimi(stranica, `hero-${sirina}.png`, false);
  const ostrina = await stranica.evaluate(async () => {
    const slika = document.querySelector('.hero__slika img');
    const prikaz = slika.getBoundingClientRect();
    // Stvarna veličina odabrane datoteke (naturalWidth slike sa srcset-om nije u pikselima datoteke).
    const datoteka = await new Promise((gotovo) => {
      const proba = new Image();
      proba.onload = () => gotovo({ sirina: proba.naturalWidth, visina: proba.naturalHeight });
      proba.src = slika.currentSrc;
    });
    // Kod "object-fit: cover" slika se crta u mjerilu veće od dvije stranice.
    return Math.round(Math.max(prikaz.width / datoteka.sirina, prikaz.height / datoteka.visina) * 100);
  });
  provjeri(ostrina <= 105, `hero @${sirina}: slika se ne povećava iznad izvorne veličine (mjerilo ${ostrina} %)`);
  await zatvori();
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
      // Kućica privole dijeli površinu sa svojom oznakom.
      .map((e) => (e.type === 'checkbox' && e.labels[0]) || e)
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
  provjeri(await stranica.locator('#hipoterapija h2').isVisible() && await stranica.locator('#aktivnosti h2').isVisible(), 'bez JavaScripta: sadržaj je vidljiv');
  provjeri(await stranica.locator('.izbornik__popis a').first().isVisible(), 'bez JavaScripta: izbornik je vidljiv');
  provjeri(await stranica.locator('.kontakt__telefon').first().isVisible(), 'bez JavaScripta: telefon je vidljiv');
  provjeri(await stranica.locator('noscript').count() > 0, 'bez JavaScripta: obrazac upućuje na telefon');
  await zatvori();
}

// === 7. Krdo u trku (sekcija Naše krdo na početnoj) ===
console.log('\nKrdo u trku');
{
  const nogeKonja = (s) =>
    s.evaluate(() => [...document.querySelectorAll('.trk__konj')].slice(0, 3).map((gumb) => [...gumb.querySelectorAll('.konj__noga')].map((crta) => crta.getAttribute('x2') + ',' + crta.getAttribute('y2')).join(' ')).join(' | '));
  const pomakniRed = (s, pomak) =>
    s.evaluate(async (p) => {
      const staza = document.querySelector('[data-krdo-staza]');
      // U malim koracima, kao kod povlačenja.
      for (let i = 0; i < 12; i++) {
        staza.scrollLeft += p / 12;
        await new Promise((r) => requestAnimationFrame(r));
      }
    }, pomak);

  const { stranica, problemi, zatvori } = await otvori('index.html');
  await stranica.waitForSelector('.trk__konj');
  await stranica.locator('[data-krdo-staza]').scrollIntoViewIfNeeded();
  const broj = await stranica.locator('.trk__konj').count();
  provjeri(broj === 13, `u redu je trinaest konja i ponija (ima ih ${broj})`);
  provjeri(await stranica.evaluate(() => { const s = document.querySelector('[data-krdo-staza]'); return s.scrollWidth > s.clientWidth; }), 'red je širi od ekrana i može se pomicati');

  const mirno = await nogeKonja(stranica);
  await pomakniRed(stranica, 360);
  const uTrku = await nogeKonja(stranica);
  provjeri(uTrku !== mirno, 'dok se red pomiče, noge se miču');
  provjeri(!(await stranica.locator('.trk--udesno').count()), 'pri pomaku naprijed konji gledaju ulijevo');
  await stranica.waitForTimeout(1600);
  provjeri((await nogeKonja(stranica)) === mirno, 'kad red stane, konji se vrate u stajanje');
  await pomakniRed(stranica, -200);
  provjeri((await stranica.locator('.trk--udesno').count()) === 1, 'pri pomaku natrag konji se okrenu udesno');
  await stranica.waitForTimeout(1600);

  // Okomito skrolanje preko reda mora pomicati stranicu, a ne red.
  await stranica.setViewportSize({ width: 1440, height: 500 });
  await stranica.locator('[data-krdo-staza]').scrollIntoViewIfNeeded();
  const okvirReda = await stranica.locator('[data-krdo-staza]').boundingBox();
  await stranica.mouse.move(okvirReda.x + 400, okvirReda.y + 60);
  const prije = await stranica.evaluate(() => ({ y: window.scrollY, x: document.querySelector('[data-krdo-staza]').scrollLeft }));
  await stranica.mouse.wheel(0, 240);
  await stranica.waitForTimeout(300);
  const poslije = await stranica.evaluate(() => ({ y: window.scrollY, x: document.querySelector('[data-krdo-staza]').scrollLeft }));
  provjeri(poslije.y > prije.y && poslije.x === prije.x, `kotačić miša preko reda pomiče stranicu, a ne red (stranica ${prije.y} → ${poslije.y} px)`);
  await stranica.setViewportSize({ width: 1440, height: 900 });

  // Strelice i odabir konja.
  await stranica.evaluate(() => window.scrollTo(0, 0));
  await stranica.evaluate(() => (document.querySelector('[data-krdo-staza]').scrollLeft = 0));
  await stranica.waitForTimeout(300);
  provjeri(await stranica.locator('[data-krdo-natrag]').isDisabled(), 'na početku reda strelica natrag je isključena');
  await stranica.click('[data-krdo-naprijed]');
  await stranica.waitForTimeout(900);
  provjeri(await stranica.evaluate(() => document.querySelector('[data-krdo-staza]').scrollLeft > 200), 'strelica naprijed pomiče red');
  provjeri((await stranica.locator('[data-krdo-ime]').innerText()) === 'Anabela', 'kartica na početku prikazuje prvog konja');
  await stranica.evaluate(() => (document.querySelector('[data-krdo-staza]').scrollLeft = 0));
  await stranica.waitForTimeout(1500);
  await stranica.locator('.trk__konj').nth(2).click();
  provjeri((await stranica.locator('[data-krdo-ime]').innerText()) === 'Vihor', 'klik na konja otvara njegovu karticu');
  provjeri((await stranica.locator('.trk__konj[aria-pressed="true"]').count()) === 1, 'označen je samo odabrani konj');
  provjeri(await stranica.locator('[data-krdo-slika]').evaluate((slika) => !slika.hidden && slika.src.includes('krdo-vihor')), 'Vihorova kartica prikazuje njegovu fotografiju');
  provjeri((await stranica.locator('[data-krdo-podaci] dt').count()) === 6, 'kartica prikazuje šest podataka o konju');
  provjeri((await stranica.locator('[data-krdo-podaci]').innerText()).includes('haflinger'), 'kartica prikazuje pasminu odabranog konja');
  provjeri(await stranica.evaluate(async () => (await (await fetch('data/krdo.json')).json()).every((k) => k.fotografija)), 'svi konji u krdu imaju fotografiju');
  await stranica.locator('.trk__konj').first().click();
  provjeri(await stranica.locator('[data-krdo-slika]').evaluate((slika) => slika.complete && slika.naturalWidth > 0), 'fotografija Anabele je učitana');
  await stranica.locator('.trk__konj').nth(2).click();

  // Povlačenje mišem pomiče red i ne odabire konja.
  const peti = await stranica.locator('.trk__konj').nth(4).boundingBox();
  await stranica.mouse.move(peti.x + peti.width / 2, peti.y + peti.height / 2);
  await stranica.mouse.down();
  await stranica.mouse.move(peti.x + peti.width / 2 - 260, peti.y + peti.height / 2, { steps: 12 });
  await snimi(stranica, 'krdo-u-trku.png', false);
  await stranica.mouse.up();
  await stranica.waitForTimeout(100);
  provjeri(await stranica.evaluate(() => document.querySelector('[data-krdo-staza]').scrollLeft > 200), 'povlačenje mišem pomiče red');
  provjeri((await stranica.locator('[data-krdo-ime]').innerText()) === 'Vihor', 'povlačenje ne mijenja odabranog konja');
  provjeri(problemi.length === 0, `krdo radi bez grešaka${problemi.length ? ' — ' + problemi.join('; ') : ''}`);
  await stranica.waitForTimeout(1500);
  await snimi(stranica, 'krdo-stoji.png', false);
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('index.html', { kontekst: { reducedMotion: 'reduce' } });
  await stranica.waitForSelector('.trk__konj');
  await stranica.locator('[data-krdo-staza]').scrollIntoViewIfNeeded();
  const noge = () => stranica.evaluate(() => [...document.querySelectorAll('.trk__konj .konj__noga')].map((crta) => crta.getAttribute('x2') + crta.getAttribute('y2')).join(''));
  const prije = await noge();
  await stranica.evaluate(() => (document.querySelector('[data-krdo-staza]').scrollLeft = 400));
  await stranica.waitForTimeout(300);
  provjeri((await noge()) === prije, 'smanjeno kretanje: konji ostaju mirni dok se red pomiče');
  provjeri(await stranica.evaluate(() => document.querySelector('[data-krdo-staza]').scrollLeft === 400), 'smanjeno kretanje: red se i dalje može pomicati');
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('index.html', { sirina: 390, visina: 760, kontekst: { hasTouch: true, isMobile: true } });
  await stranica.waitForSelector('.trk__konj');
  await stranica.locator('[data-krdo-staza]').scrollIntoViewIfNeeded();
  await stranica.evaluate(async () => {
    const staza = document.querySelector('[data-krdo-staza]');
    for (let i = 0; i < 10; i++) {
      staza.scrollLeft += 22;
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  await snimi(stranica, 'krdo-mobitel.png', false);
  const vidljivih = await stranica.evaluate(() => [...document.querySelectorAll('.trk__konj')].filter((g) => { const o = g.getBoundingClientRect(); return o.right > 0 && o.left < window.innerWidth; }).length);
  provjeri(vidljivih >= 2 && vidljivih <= 4, `mobitel: na ekranu su dva do četiri konja odjednom (${vidljivih})`);
  await zatvori();
}

// === Mobitel: u svakoj sekciji s tekstom i slikom tekst je iznad slike ===
{
  const { stranica, zatvori } = await otvori('index.html', { sirina: 390, visina: 844 });
  const redoslijed = await stranica.evaluate(() => [...document.querySelectorAll('.dva-stupca')].map((s) => {
    const slika = s.querySelector(':scope > picture, :scope > .mjesto-slike');
    const tekst = s.querySelector(':scope > :not(picture):not(.mjesto-slike)');
    return !slika || !tekst || tekst.getBoundingClientRect().top < slika.getBoundingClientRect().top;
  }));
  provjeri(redoslijed.every(Boolean), `mobitel: u sekcijama s tekstom i slikom tekst je uvijek iznad slike (${redoslijed.filter(Boolean).length}/${redoslijed.length})`);
  await zatvori();
}

// === 8. Sadržaj udruge: poveznice, tim, česta pitanja ===
console.log('\nSadržaj');
for (const staza of STRANICE) {
  const { stranica, zatvori } = await otvori(staza);
  // Svaka unutarnja poveznica mora voditi na postojeću stranicu i, ako ima sidro, na postojeći dio stranice.
  const pokvarene = await stranica.evaluate(async () => {
    const lose = [];
    const dokumenti = new Map();
    for (const veza of document.querySelectorAll('a[href]')) {
      const href = veza.getAttribute('href');
      if (/^(https?:|tel:|mailto:)/.test(href)) continue;
      const cilj = new URL(href, location.href);
      const adresa = cilj.origin + cilj.pathname;
      if (!dokumenti.has(adresa)) {
        const odgovor = await fetch(adresa);
        dokumenti.set(adresa, odgovor.ok ? new DOMParser().parseFromString(await odgovor.text(), 'text/html') : null);
      }
      const dokument = dokumenti.get(adresa);
      if (!dokument) lose.push(href);
      else if (cilj.hash && !dokument.getElementById(decodeURIComponent(cilj.hash.slice(1)))) lose.push(href);
    }
    return [...new Set(lose)];
  });
  provjeri(pokvarene.length === 0, `${staza}: unutarnje poveznice vode na postojeće stranice i dijelove${pokvarene.length ? ' — ' + pokvarene.join(', ') : ''}`);
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('index.html');
  provjeri((await stranica.locator('#o-nama a[href="o-nama.html#tim"]').count()) === 1, 'početna: O nama vodi na tim');
  provjeri((await stranica.locator('#kontakt a[href="mailto:udrugavissolis@gmail.com"]').count()) === 1, 'početna: u kontaktu je prava e-mail adresa');
  provjeri((await stranica.locator('#ponuda .popis-crtice li').count()) === 5, 'početna: "Ostalo u našoj ponudi" ima pet aktivnosti');
  provjeri((await stranica.locator('#ponuda .ponuda-dan img').count()) === 4, 'početna: uz ponudu su četiri fotografije s obiteljskog dana');
  provjeri(!(await stranica.content()).includes('example.com'), 'početna: nema izmišljene e-mail adrese');
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('o-nama.html');
  provjeri((await stranica.locator('#tim .tim6__gumb').count()) === 6, 'o nama: šesterokut tima ima šest trokuta');
  provjeri(await stranica.locator('#tim [data-tim-uputa]').isVisible(), 'tim: prije klika vidi se uputa');
  await stranica.locator('#tim [data-tim-gumb="lorena"]').scrollIntoViewIfNeeded();
  await stranica.locator('#tim [data-tim-gumb="lorena"]').click();
  provjeri((await stranica.locator('#tim .tim6__clan:visible').count()) === 1 && (await stranica.locator('#tim .tim6__clan:visible h3').innerText()) === 'Lorena', 'tim: klik na trokut prikazuje podatke te članice');
  provjeri((await stranica.locator('#tim [aria-pressed="true"]').getAttribute('data-tim-gumb')) === 'lorena', 'tim: odabrani trokut je označen');
  const vrhLorene = await stranica.locator('#tim [data-tim-gumb="viktorija"]').evaluate((g) => { const o = g.getBoundingClientRect(); return document.elementFromPoint(o.left + o.width / 2, o.top + 4)?.closest('[data-tim-gumb]')?.dataset.timGumb; });
  provjeri(vrhLorene === 'viktorija', 'tim: gornji trokut prima klik na svom području');
  await zatvori();
}
for (const staza of ['hipoterapija.html', 'aktivnosti-pomocu-konja.html']) {
  const { stranica, zatvori } = await otvori(staza);
  const prvo = stranica.locator('.pitanja details').first();
  provjeri(!(await prvo.locator('p').isVisible()), `${staza}: odgovori na česta pitanja u početku su zatvoreni`);
  await prvo.locator('summary').click();
  provjeri(await prvo.locator('p').isVisible(), `${staza}: klik na pitanje otvara odgovor`);
  await zatvori();
}

// === 9. Donacije (o-nama.html) ===
{
  const { stranica, zatvori } = await otvori('o-nama.html');
  const prozor = stranica.locator('[data-donacije]');
  provjeri(!(await prozor.isVisible()), 'donacije: prozor je u početku zatvoren');
  await stranica.locator('[data-donacije-otvori]').click();
  provjeri(await prozor.isVisible(), 'donacije: klik na gumb otvara prozor');
  provjeri(await stranica.locator('.donacije-prozor__barkod img').evaluate((s) => s.complete && s.naturalWidth > 0), 'donacije: barkod se učitao');
  provjeri(await stranica.locator('[data-donacije-rucno]').isHidden(), 'donacije: bez IBAN-a nema podataka za ručnu uplatu');
  await stranica.keyboard.press('Escape');
  provjeri(!(await prozor.isVisible()), 'donacije: tipka Esc zatvara prozor');
  await zatvori();
}
{
  const { stranica, zatvori } = await otvori('o-nama.html', {
    priprema: (s) => sPostavkama(s, (izvor) => izvor.replace("iban: ''", "iban: 'HR12 3456 7890 1234 5678 9'")),
  });
  await stranica.locator('[data-donacije-otvori]').click();
  provjeri((await stranica.locator('[data-donacije-podaci] > div').count()) >= 2, 'donacije: s IBAN-om se prikazuju podaci za ručnu uplatu');
  await zatvori();
}

await preglednik.close();
posluzitelj.close();

console.log(`\nProšlo: ${prolaza}   Palo: ${padovi.length}`);
if (padovi.length) {
  console.log(padovi.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
