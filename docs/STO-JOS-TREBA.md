# Što još treba

Na stranici je svako ovakvo mjesto označeno žutim blokom "Čeka sadržaj". Prije objave nijedan ne smije ostati.

## Od udruge

- [ ] **E-mail adresa za upite.** Sada stoji `upiti@example.com` (`index.html`, sekcija Kontakt). Ista adresa treba i u pravilima privatnosti.
- [ ] **Imena konja** i po jedna rečenica o svakome (`index.html`, sekcija Naše krdo). Sada piše "Ime konja".
- [ ] **Fotografije ostalih konja** iz krda. Sada su tri.
- [ ] **Priča udruge** u nekoliko rečenica te imena i zvanja članova tima (`index.html`, sekcija O nama).
- [ ] **Potvrda** da se smiju navesti projekti „Siguran korak uz konja” i „Konj za svakoga” te suradnja sa Specijalnom bolnicom za kronične bolesti dječje dobi Gornja Bistra.
- [ ] **Potvrda podataka:** osnivanje u kolovozu 2024., "dvanaestak konja", adrese, telefon, popis aktivnosti u sekciji Druženje s konjima.
- [ ] **Potvrda da su programi "za djecu i odrasle"** (rečenica ispod naslova na početnoj).
- [ ] **Odobrenje znaka "VS"** u zaglavlju (`site/assets/img/znak.svg`). Privremeni je.
- [ ] **Naziv domene.**
- [ ] **Pregled pravila privatnosti** (`privatnost.html`): nacrt treba odobriti odgovorna osoba; nedostaje rok čuvanja upita.

## Od terapeuta

- [ ] **Kako početi** (`index.html`): potvrditi tri koraka; treba li dokumentacija ili uputnica, kako izgleda početna procjena.
- [ ] Za svaki od četiri programa (`hipoterapija.html`, `fizikalna-terapija.html`, `okupacijska-terapija.html`, `logopedska-terapija.html`):
  - [ ] pregledati uvodnu rečenicu i rečenicu na kartici na početnoj (napisane su kao nacrt);
  - [ ] kome je program namijenjen i kada se ne preporučuje;
  - [ ] kako izgleda termin: trajanje, što se radi, tko je prisutan, što ponijeti;
  - [ ] tko vodi program: ime, zvanje, edukacija, po mogućnosti fotografija;
  - [ ] tri do pet čestih pitanja s odgovorima (cijena, učestalost, dokumentacija, sigurnost).

## Tekstovi koje je napisao izvođač kao nacrt

Slobodno ih mijenjajte; nijedan nije preuzet iz materijala udruge.

- Naslov na početnoj: "Terapija uz konje. Korak po korak. U vašem ritmu."
- Naslovi sekcija: "Četiri terapije, jedan suradnik na četiri noge.", "Od prvog upita do prvog termina.", "Ne mora sve biti terapija.", "Dvanaestak konja, svaki sa svojom naravi.", "Vis solis: snaga sunca."
- Odlomak u O nama koji počinje "Okupili smo se oko jednostavne ideje".
- Poruka nakon slanja obrasca: "Javit ćemo vam se čim prije." Ako postoji uobičajen rok odgovora, treba ga upisati.

## Tehnički

- [x] **Hero animacija.** 120 sličica iz videa hoda je u `site/assets/frames/`, animacija je uključena.
- [ ] **Oštrina animacije.** Video je 1276 × 720 (Kling 3.0, standardni način). Na običnim ekranima je oštar; na ekranima visoke gustoće (Retina) konj je blago mekši jer se sličica povećava. Oštrija inačica traži Higgsfield plan Plus (Kling pro ili Seedance 1080p). Nakon novog videa dovoljno je ponovno pokrenuti `alati/izrezi-slicice.mjs`.
- [ ] **Statična slika konja** (mobitel, smanjeno kretanje) izrezana je iz prve sličice videa, 960 × 720. Izvorna slika s Higgsfielda je veće rezolucije; ako je priložite, statična slika može biti oštrija.
- [ ] **Usluga za obrasce.** Odabrati uslugu, upisati adresu u `postavke.obrazac.adresaSlanja` i naziv usluge u pravila privatnosti. Do tada obrazac ne šalje nego upućuje na telefon.
- [ ] **Font naslova.** Privremeno Lora; specifikacija predviđa Fraunces, koji treba preuzeti i staviti u `site/assets/fonts/`.
- [ ] **Fontovi u WOFF2.** Sada su WOFF, koji je nešto veći.
- [ ] **Objava:** GitHub, Cloudflare Pages, domena, zatim Lighthouse provjera.
