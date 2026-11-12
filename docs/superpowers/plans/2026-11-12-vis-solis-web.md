# Vis Solis web — plan izrade

> **Za izvršitelje:** plan se izvršava zadatak po zadatak (superpowers:executing-plans). Koraci koriste kućice (`- [ ]`) za praćenje.

**Cilj:** statična web stranica udruge Vis Solis: početna kao scroll priča, četiri podstranice programa, pravila privatnosti, obrazac za upit i izborna najava "Aktualno".

**Arhitektura:** čisti HTML, CSS i JavaScript (ES moduli) u mapi `site/`, bez alata za slaganje i bez vanjskih biblioteka. Svaki JS modul radi jednu stvar; računska logika je u čistim funkcijama koje se testiraju Nodeovim ugrađenim alatom za testove. Hero animacija crta sličice na canvas prema napretku skrolanja.

**Tehnologija:** HTML5, CSS (varijable, grid, `position: sticky`, `clip-path`), JavaScript ES moduli, `node --test` za testove, Playwright (Chromium) za provjeru u pregledniku, ffmpeg i sharp za obradu slika.

**Specifikacija:** `docs/superpowers/specs/2026-11-12-vis-solis-web-design.md`

## Opća pravila

- Jezik sadržaja i naziva u kodu: hrvatski.
- Nema vanjskih biblioteka ni vanjskih fontova; sve se poslužuje iz `site/`.
- Boje: `#F7F2E8` krem, `#EFE7D8` pijesak, `#2B2420` tekst, `#6B5F56` prigušeni tekst, `#E0A22B` jantar, `#8A5A0B` tamni jantar, `#FBF29A` blijedožuta.
- Prijelomna širina za animaciju i puni izbornik: 1024 px.
- Djeca se ne prikazuju ni na jednoj fotografiji. Stvarne osobe ne animiraju se umjetnom inteligencijom.
- Sav sadržaj mora biti čitljiv i bez JavaScripta.
- Sadržaj koji čeka naručitelja označava se vidljivim blokom klase `ceka` i upisuje u `docs/STO-JOS-TREBA.md`.
- Potrošnja Higgsfield kredita samo uz potvrdu naručitelja, nakon prikaza cijene.

## Odstupanja od specifikacije

| Specifikacija | Plan | Razlog |
|---|---|---|
| Naslovi u fontu Fraunces | Privremeno Lora | Fraunces nije dostupan u radnom prostoru, a mrežno preuzimanje je isključeno. Lora je topli serif slobodne licence. Zamjena je izmjena u `tipografija.css`. |
| Fontovi u formatu po izboru | WOFF umjesto WOFF2 | Alat za WOFF2 sažimanje nije dostupan. |
| Hero animacija od prve objave | `postavke.hero.ukljuceno = false` dok sličice ne postoje | Sličice ovise o Higgsfield kreditima i potvrdi troška. Do tada hero prikazuje fotografiju. |

## Datoteke

```
package.json                 "type": "module", skripta "test"
README.md                    pokretanje, uređivanje, objava
docs/STO-JOS-TREBA.md        popis onoga što čeka naručitelja
alati/obradi-slike.mjs       priprema fotografija (pokreće se ručno)
tests/hero.test.mjs
tests/ucitavanje.test.mjs
tests/aktualno.test.mjs
tests/obrazac.test.mjs
tests/preglednik.mjs         provjera u Chromiumu
site/…                       kao u specifikaciji, poglavlje 8
```

## Sučelja modula

| Modul | Izvozi |
|---|---|
| `postavke.js` | `postavke` (objekt): `telefon`, `telefonPrikaz`, `prijelom`, `obrazac.{adresaSlanja, dodatnaPolja}`, `hero.{ukljuceno, brojSlicica, putanja(n), prvaSkupina, velicinaSkupine, najduljeCekanjeMs, graniceFaza}` |
| `hero.js` | `napredakSekcije(vrh, visinaSekcije, visinaProzora) → 0..1`; `indeksSlicice(napredak, ukupno) → 0..ukupno-1`; `fazaNaslova(napredak, granice) → 0..granice.length`; `pokreniHero()` |
| `ucitavanje.js` | `najblizaUcitana(indeks, ucitano: boolean[]) → number` (−1 kad nijedna nije učitana); `ucitajSlicice({ukupno, putanja, prvaSkupina, velicinaSkupine, naNapredak, naSlicicu}) → {slike, ucitano, prvaSkupinaGotova: Promise}` |
| `aktualno.js` | `jeLiAktualno(zapis, danas: Date) → boolean`; `pokreniAktualno()` |
| `obrazac.js` | `provjeriUnos({ime, kontakt, privola}) → {ispravno, greske}`; `jeLiNezeljeno(podaci) → boolean`; `pokreniObrazac()` |
| `pojavljivanje.js` | `pokreniPojavljivanje()` |
| `izbornik.js` | `pokreniIzbornik()` |

Moduli ne smiju dirati `document` ni `window` pri uvozu, samo unutar funkcija `pokreni…`, da se čiste funkcije mogu testirati u Nodeu.

---

### Zadatak 1: Kostur projekta, fontovi, fotografije

**Datoteke:** `package.json`, `README.md`, `.gitignore`, `alati/obradi-slike.mjs`, `site/assets/fonts/*`, `site/assets/img/*`, `izvori/*`

- [ ] `package.json` s `"type": "module"` i skriptom `"test": "node --test tests/"`.
- [ ] Kopirati izvorne fotografije u `izvori/` (ne ulaze u git).
- [ ] Fontovi: Inter (400, 500) i Lora (500, 600, kurziv 500) suziti na latinicu s hrvatskim znakovima i spremiti kao WOFF u `site/assets/fonts/`.
- [ ] `alati/obradi-slike.mjs`: za svaku fotografiju iz tablice u specifikaciji 10.2 (osim `0U8A8831.JPG`) napraviti WebP u širinama 640, 1024 i 1600 px te JPEG 1280 px.
- [ ] Provjera: nijedna izlazna slika nije veća od 400 KB; `0U8A8831` ne postoji u `site/`.
- [ ] Commit.

### Zadatak 2: Čista logika, test pa kod

**Datoteke:** `tests/*.test.mjs`, `site/js/postavke.js`, `site/js/hero.js`, `site/js/ucitavanje.js`, `site/js/aktualno.js`, `site/js/obrazac.js`

- [ ] Napisati testove (slučajevi ispod), pokrenuti `npm test` i potvrditi da padaju jer funkcije ne postoje.
- [ ] Napisati funkcije, pokrenuti `npm test` i potvrditi da svi prolaze.
- [ ] Commit.

Slučajevi:

| Funkcija | Ulaz | Očekivano |
|---|---|---|
| `napredakSekcije` | vrh 0, sekcija 3000, prozor 1000 | 0 |
| | vrh −1000 | 0,5 |
| | vrh −2000 i niže | 1 |
| | vrh 500 (sekcija još nije došla) | 0 |
| | sekcija nije viša od prozora | 0 |
| `indeksSlicice` | 0 od 120 | 0 |
| | 0,5 od 120 | 60 |
| | 1 od 120 | 119 |
| `fazaNaslova` | 0,1 uz granice [0,33; 0,66] | 0 |
| | 0,5 | 1 |
| | 0,9 | 2 |
| `najblizaUcitana` | tražena je učitana | ona sama |
| | tražena nije, susjedi jesu | bliži susjed; pri istoj udaljenosti niži |
| | nijedna | −1 |
| `jeLiAktualno` | ispravan zapis, `prikazuj_do` danas | da |
| | `prikazuj_do` jučer | ne |
| | bez naslova, `{}`, `null`, neispravan datum | ne |
| `provjeriUnos` | ime, e-mail, privola | ispravno |
| | ime, telefon, privola | ispravno |
| | prazno ime | greška `ime` |
| | kontakt "abc" | greška `kontakt` |
| | bez privole | greška `privola` |
| `jeLiNezeljeno` | skriveno polje `web` ispunjeno | da |

### Zadatak 3: Početna stranica — HTML i CSS

**Datoteke:** `site/index.html`, `site/css/*.css`, `site/assets/img/znak.svg`, `site/data/aktualno.json`

- [ ] `osnova.css`: varijable boja i razmaka, reset, fokus, klasa `ceka`.
- [ ] `tipografija.css`: `@font-face`, ljestvica veličina, oznake sekcija.
- [ ] `raspored.css`: spremnik širine do 90 rem, zaglavlje, podnožje, sekcije, izmjenična podloga.
- [ ] `komponente.css`: gumbi, kartice programa, koraci, krdo u šesterokutima, najava, obrazac.
- [ ] `hero.css`: statični i animirani raspored, uvodni zaslon.
- [ ] `index.html`: svih osam sekcija iz specifikacije 4.3, redom.
- [ ] Provjera: stranica je čitljiva s isključenim JavaScriptom; nema vodoravnog pomicanja na 375 px.
- [ ] Commit.

### Zadatak 4: Ponašanje u pregledniku

**Datoteke:** `site/js/glavni.js`, `izbornik.js`, `pojavljivanje.js`, dijelovi `aktualno.js`, `obrazac.js`, `ucitavanje.js`, `hero.js` koji rade s DOM-om

- [ ] `izbornik.js`: gumb otvara i zatvara izbornik, `aria-expanded` prati stanje, Escape zatvara.
- [ ] `pojavljivanje.js`: elementi s `data-pojavi` dobivaju klasu `vidljivo` pri ulasku u ekran; uz smanjeno kretanje ne radi ništa.
- [ ] `aktualno.js`: čita `data/aktualno.json`; prikazuje sekciju samo kad je `jeLiAktualno` istinit.
- [ ] `obrazac.js`: provjera, slanje, poruke za uspjeh, grešku i neupisanu adresu slanja.
- [ ] `ucitavanje.js` i `hero.js`: učitavanje sličica, uvodni zaslon, crtanje na canvas, izmjena naslova.
- [ ] Commit.

### Zadatak 5: Podstranice

**Datoteke:** `site/hipoterapija.html`, `fizikalna-terapija.html`, `okupacijska-terapija.html`, `logopedska-terapija.html`, `privatnost.html`, `site/js/podstranica.js`, `site/css/podstranica.css`

- [ ] Četiri podstranice iste građe (specifikacija 4.4). Dijelovi koji čekaju terapeute označeni su blokom `ceka`.
- [ ] `privatnost.html`: nacrt pravila privatnosti.
- [ ] Commit.

### Zadatak 6: Provjera u pregledniku

**Datoteke:** `tests/preglednik.mjs`

- [ ] Svih šest stranica: nema grešaka u konzoli, nema neuspjelih zahtjeva, nema mrtvih unutarnjih poveznica.
- [ ] Širine 375, 768, 1024, 1440 px: nema vodoravnog pomicanja.
- [ ] Obrazac: prazna polja, neupisana adresa slanja, uspjeh i neuspjeh uz lažnu adresu.
- [ ] Aktualno: ispravan zapis, prošli datum, `{}`, neispravan JSON.
- [ ] Hero animacija na kopiji stranice s ispitnim sličicama: canvas se mijenja pri skrolanju, naslov prolazi sve tri faze.
- [ ] Smanjeno kretanje: sav sadržaj vidljiv.
- [ ] Commit.

### Zadatak 7: Hero sličice (uz potvrdu troška)

- [ ] Provjeriti cijenu čiste slike konja i videa hoda; prikazati naručitelju.
- [ ] Nakon potvrde: slika, potvrda sličnosti, dvije inačice videa, izbor.
- [ ] Rezanje u 120 sličica širine 1600 px, bijela pozadina, do 150 KB po sličici.
- [ ] `postavke.hero.ukljuceno = true`; ponoviti provjeru heroja iz zadatka 6 s pravim sličicama.
- [ ] Commit.

### Zadatak 8: Objava (uz naručitelja)

- [ ] GitHub repozitorij, Cloudflare Pages s izlaznom mapom `site`.
- [ ] Usluga za obrasce i adresa slanja u `postavke.js`.
- [ ] Domena i preusmjeravanje.
- [ ] Lighthouse na početnoj i jednoj podstranici.
