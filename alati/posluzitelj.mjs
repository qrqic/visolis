// Mali lokalni poslužitelj za pregled stranice na vlastitom računalu.
// Pokretanje:  npm start   (ili: node alati/posluzitelj.mjs)
// Treba samo Node.js, bez dodatnih paketa. Zaustavlja se s Ctrl + C.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const VRATA = Number(process.env.PORT) || 8080;
const VRSTE = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const posluzitelj = createServer(async (zahtjev, odgovor) => {
  let staza;
  try {
    staza = decodeURIComponent(new URL(zahtjev.url, 'http://localhost').pathname);
  } catch {
    odgovor.writeHead(400).end('Neispravna adresa');
    return;
  }
  let datoteka = path.join(SITE, staza);
  // Ništa izvan mape site/ se ne poslužuje.
  if (datoteka !== SITE && !datoteka.startsWith(SITE + path.sep)) {
    odgovor.writeHead(403).end('Zabranjeno');
    return;
  }
  if (existsSync(datoteka) && statSync(datoteka).isDirectory()) datoteka = path.join(datoteka, 'index.html');
  // Adrese bez nastavka (/hipoterapija) vode na hipoterapija.html, kao na hostingu (.htaccess).
  if (!(existsSync(datoteka) && statSync(datoteka).isFile()) && existsSync(datoteka + '.html')) datoteka += '.html';
  // Adrese bez nastavka, npr. /hipoterapija, kao što će raditi nakon objave.
  if (!existsSync(datoteka) && existsSync(`${datoteka}.html`)) datoteka = `${datoteka}.html`;
  if (!existsSync(datoteka)) {
    odgovor.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Stranica nije pronađena');
    return;
  }
  odgovor.writeHead(200, {
    'Content-Type': VRSTE[path.extname(datoteka).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  odgovor.end(await readFile(datoteka));
});

posluzitelj.on('error', (greska) => {
  if (greska.code === 'EADDRINUSE') {
    console.error(`Vrata ${VRATA} su zauzeta. Zatvorite drugi program koji ih koristi ili pokrenite s drugim brojem, npr. PORT=8090 npm start`);
  } else {
    console.error(greska.message);
  }
  process.exit(1);
});

posluzitelj.listen(VRATA, () => {
  console.log(`Stranica je dostupna na  http://localhost:${VRATA}`);
  console.log('Zaustavljanje: Ctrl + C');
});
