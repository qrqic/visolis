# Vis Solis — web stranica: specifikacija dizajna

> **Izmjena 16. 11. 2026. (sadržaj udruge):** udruga je vratila ispunjen upitnik. Hipoterapija i aktivnosti pomoću konja imaju pune podstranice iste strukture (kome, kada ne, termin, prije prvog termina, tko vodi, česta pitanja). Rekreativne aktivnosti prešle su u novu sekciju "Ostalo u našoj ponudi". Fizikalna, okupacijska i logopedska terapija su uklonjene. Dodana je podstranica `o-nama.html` (priča, tim, edukacije, izgradnja ranča, volontiranje) i tim od pet članica na početnoj. Krdo ima 13 životinja (11 konja i 2 ponija). Fotografije koje nedostaju označene su elementom `.mjesto-slike`. Otvorena pitanja su u `docs/STO-JOS-TREBA.md`.

> **Izmjena 14. 11. 2026. (krdo u trku):** sekcija "Naše krdo" na početnoj više nije galerija triju fotografija nego red od 12 crtanih konja (jedan crtež konja i jedan ponija, obojen prema `site/data/krdo.json`). Konji trče samo dok se red pomiče lijevo-desno; okomito skrolanje se ničim ne zadržava. Klik otvara fotografiju, ime i rečenicu. Bez JavaScripta prikazuju se tri fotografije kao prije.

- **Datum:** 12. 11. 2026.
- **Status:** čeka pregled naručitelja
- **Naručitelj:** Vis Solis – udruga za terapiju i aktivnosti pomoću konja (Udruga VS), Bistra

> **Izmjena 12. 11. 2026.:** nakon pregleda na stranici naručitelj je odustao od hero animacije. Hero je sada jedna velika fotografija konja preko cijelog ekrana, s tekstom preko nje (na uskim ekranima fotografija je iznad teksta). Poglavlje 6, redak "Hero" u poglavlju 3, moduli `hero.js` i `ucitavanje.js` u poglavlju 8, mapa `assets/frames/` te točke 10.3 i 10.4 o videu više ne vrijede. Sve ostalo vrijedi.

> **Izmjena 13. 11. 2026. (povratna informacija udruge):** glavna boja je bordo `#7A1F2B`, zaštitna boja udruge, umjesto jantara; blijedožuta iz loga ostaje za isticanje. Hero je bordo ploha s naslovom i fotografijom ponija Anabele u šesterokutu sa žutim rubom. Težište sadržaja je na hipoterapiji i aktivnostima pomoću konja: početna ima sekcije Hipoterapija, Aktivnosti pomoću konja, Kako početi, Naše krdo, O nama i Kontakt. Fizikalna, okupacijska i logopedska terapija spominju se u sekciji Hipoterapija i zadržavaju podstranice. Time se mijenjaju poglavlja 3, 4.2, 4.3 i 5.1.

> **Izmjena 14. 11. 2026.:** hero je slika Anabele preko cijelog ekrana (generirana na Higgsfieldu prema fotografiji), s tekstom preko zatamnjene lijeve strane. Na uskim ekranima slika je gore i pretapa se u bordo plohu s tekstom. Šesterokut iz izmjene od 13. 11. više nije u heroju.

## 1. Cilj i publika

Udruga nema web stranicu. Stranica treba napraviti dvije stvari:

1. **Glavni cilj:** posjetitelj pošalje upit za terapiju ili nazove.
2. **Sporedni cilj:** posjetitelj sazna tko je udruga, što radi i gdje se nalazi.

Publika su roditelji i skrbnici djece s teškoćama, odrasli korisnici terapija, stručnjaci koji upućuju korisnike (bolnica, terapeuti) te partneri i donatori. Većina dolazi s mobitela.

Stranica mora u prvom ekranu odgovoriti na tri pitanja: što se nudi, kome, i koji je sljedeći korak.

## 2. Opseg

**U opsegu**

- Početna stranica kao scroll priča.
- Četiri podstranice programa: hipoterapija, fizikalna, okupacijska i logopedska terapija uz pomoć konja.
- Stranica s pravilima privatnosti.
- Obrazac za upit koji šalje poruku na e-mail udruge.
- Izborna najava "Aktualno" kojom upravlja jedna datoteka.
- Hero animacija konja koji hoda, vezana uz skrolanje.

**Izvan opsega (moguće kasnije)**

- Online rezervacija termina s kalendarom.
- Povezivanje s internim alatom tima (zaseban projekt sa svojom specifikacijom).
- Admin sučelje za unos sadržaja.
- Engleska inačica.
- Stalni popis događanja (ostaje na Instagramu i Facebooku).

## 3. Donesene odluke

| Tema | Odluka |
|---|---|
| Vizualni smjer | Svijetla, topla stranica na krem podlozi |
| Akcentna boja | Jantar |
| Dogovor termina | Obrazac za upit i gumb za poziv; kalendar kasnije |
| Struktura | Početna kao scroll priča, uz podstranicu za svaki program |
| Hero | Svijetlosmeđi konj hoda dok se skrola; zamjena: konj stoji, kamera kruži |
| Ljudi u AI videu | Ne animiraju se; prikazuju se samo na pravim fotografijama |
| Djeca na fotografijama | Ne objavljuju se nigdje na stranici |
| Događanja | Na društvenim mrežama; na stranici samo izborna najava "Aktualno" |
| Jezik | Samo hrvatski |
| Tekstovi | Opće dijelove piše izvođač; opise terapija pišu ili pregledavaju terapeuti |
| Tehnologija | Čisti HTML, CSS i JavaScript, bez alata za slaganje i bez vanjskih biblioteka |
| Smještaj | Cloudflare Pages, kod na GitHubu, vlastita .hr domena |
| Kursor, magnetni gumb, Lenis, GSAP | Izostavljeni |

## 4. Struktura stranice

### 4.1 Stranice

| Datoteka | Sadržaj |
|---|---|
| `index.html` | Početna |
| `hipoterapija.html` | Program |
| `fizikalna-terapija.html` | Program |
| `okupacijska-terapija.html` | Program |
| `logopedska-terapija.html` | Program |
| `privatnost.html` | Pravila privatnosti |

### 4.2 Zaglavlje i podnožje (na svim stranicama)

- **Zaglavlje:** pojednostavljeni znak "VS" u šesterokutu, izbornik (Programi, Krdo, O nama, Kontakt), jantarni gumb "Dogovorite termin". Ostaje vidljivo pri skrolanju. Ispod 1024 px izbornik se otvara gumbom.
- **Podnožje:** puni naziv udruge, sjedište (Krapinska ulica 2, Donja Bistra), mjesto aktivnosti (Bolnička ulica 21, Gornja Bistra), telefon, društvene mreže, poveznica na pravila privatnosti.

### 4.3 Početna, redom

1. **Hero.** Serifni naslov, jedna rečenica o tome što udruga radi i za koga, gumb "Dogovorite termin" i sporedna poveznica "Pogledajte programe". Naslov i gumb vidljivi su odmah, prije skrolanja. Animacija je opisana u poglavlju 6.
2. **Aktualno.** Uska istaknuta najava na blijedožutoj podlozi. Ne prikazuje se kad nema što prikazati (poglavlje 9.1).
3. **Programi.** Četiri kartice s nazivom, jednom rečenicom i poveznicom na podstranicu.
4. **Kako početi.** Tri koraka od prvog upita do prvog termina. Točne korake potvrđuju terapeuti.
5. **Druženje s konjima.** Rekreativno jahanje, šetnje, kampovi, obiteljski dani, s poveznicama na Instagram i Facebook.
6. **Naše krdo.** Konji s imenima i fotografijama u šesterokutnim okvirima.
7. **O nama.** Fotografije članova tima s konjima, priča udruge (osnovana u kolovozu 2024.), projekti i suradnje.
8. **Kontakt.** Obrazac za upit, telefon, adresa u Gornjoj Bistri, poveznica na kartu.

Sekcije nose numerirane oznake: "01 — Programi", "02 — Kako početi" i tako dalje.

### 4.4 Podstranica programa

Sve četiri imaju istu građu: naslov i uvod, kome je program namijenjen, kako izgleda termin, tko ga vodi, česta pitanja, poziv na dogovor termina s poveznicom na obrazac.

## 5. Vizualni sustav

### 5.1 Boje

| Uloga | Vrijednost |
|---|---|
| Podloga (krem) | `#F7F2E8` |
| Podloga izmjeničnih sekcija (pijesak) | `#EFE7D8` |
| Tekst | `#2B2420` |
| Prigušeni tekst | `#6B5F56` |
| Akcent, gumbi (jantar) | `#E0A22B`, s tamnim tekstom |
| Akcent za sitni tekst i poveznice (tamni jantar) | `#8A5A0B` |
| Tiho isticanje (blijedožuta iz loga) | `#FBF29A` |

Sve su boje definirane kao CSS varijable na jednom mjestu. Kontrast teksta i podloge je najmanje 4,5 : 1, što se provjerava pri izradi.

### 5.2 Tipografija

- Naslovi: Fraunces (serif). Tekst: Inter (sans). Najviše ta dva fonta.
- Oba moraju prikazivati č, ć, đ, š i ž.
- Datoteke fontova poslužuju se s vlastite stranice, ne s Googlea.
- Sitne oznake sekcija: velika slova, razmak između slova 0,2 em.
- Fontovi su zamjenjivi izmjenom u jednoj CSS datoteci.

### 5.3 Motiv

Šesterokut iz loga: znak u zaglavlju i okviri fotografija u sekciji krda. Nigdje drugdje.

### 5.4 Logo

Postojeći logo je fotografija u šesterokutu i nečitljiv je u malim veličinama. Za zaglavlje i ikonu kartice izrađuje se pojednostavljeni vektorski znak (šesterokut i slova "VS" u jednoj boji), koji naručitelj odobrava prije upotrebe. Izvorni logo ostaje u sekciji "O nama".

## 6. Hero animacija

### 6.1 Ponašanje

- Svijetlosmeđi konj sa svijetlom grivom gledan je s boka, okrenut udesno, i hoda na mjestu.
- Skrolanje prema dolje pomiče korak naprijed, a prema gore unatrag.
- Sekcija stoji na mjestu oko tri visine ekrana, dovoljno za dva do tri puna koraka.
- Naslov se tijekom toga mijenja u tri koraka. Tekstovi naslova su nacrt koji naručitelj odobrava.

### 6.2 Tehnika

- Video hoda izrezan je u 120 sličica. Broj sličica zapisan je u `postavke.js`.
- Sličice se crtaju na `<canvas>` element. Napredak skrolanja kroz sekciju (0 do 1) preslikava se u redni broj sličice.
- Sekcija se drži na mjestu pomoću `position: sticky`. Nema vanjskih biblioteka.
- Sličice imaju bijelu pozadinu, a canvas se s podlogom stapa načinom `multiply`, pa se rub slike ne vidi.
- Crtanje je ograničeno na jednom po osvježavanju ekrana. Ako tražena sličica još nije učitana, crta se najbliža učitana.
- Sličice su široke 1600 px i ciljano do 150 KB svaka.

### 6.3 Učitavanje

- Na širini od 1024 px naviše: kratki uvodni zaslon sa znakom i postotkom dok se ne učita prvih 20 sličica. Postotak prati stvarno učitavanje. Uvodni zaslon se sklanja najkasnije nakon 3 sekunde, bez obzira na stanje učitavanja.
- Preostalih 100 sličica učitava se u pozadini u malim skupinama.

### 6.4 Mobitel i smanjeno kretanje

- Ispod 1024 px nema canvas animacije, uvodnog zaslona ni učitavanja sličica. Prikazuje se jedna slika konja.
- Uz uključenu postavku sustava za smanjeno kretanje vrijedi isto, na svim širinama.

### 6.5 Zamjenska inačica

Ako AI video hoda ne bude dovoljno dobar (izobličene noge, treperenje), koristi se druga animacija s istim konjem: konj stoji, kamera polako kruži. Kod ostaje isti, mijenjaju se samo sličice.

## 7. Pokret izvan heroja

- Tekst i slike blago se pojavljuju pri ulasku u ekran.
- Fotografije se otkrivaju odozdo.
- Gumbi i kartice reagiraju na prelazak mišem i na fokus tipkovnicom.
- Uz smanjeno kretanje sve je vidljivo odmah, bez animacija.

## 8. Tehnologija i datoteke

Čisti HTML, CSS i JavaScript (ES moduli). Nema alata za slaganje, nema frameworka, nema vanjskih biblioteka.

```
vis-solis-web/
  site/                     objavljuje se na Cloudflare
    index.html
    hipoterapija.html
    fizikalna-terapija.html
    okupacijska-terapija.html
    logopedska-terapija.html
    privatnost.html
    css/
      osnova.css            varijable, boje, reset
      tipografija.css       fontovi i veličine
      raspored.css          mreža, zaglavlje, podnožje, sekcije
      komponente.css        gumbi, kartice, obrazac, najava
      hero.css
      podstranica.css
    js/
      postavke.js           sve podesive vrijednosti na jednom mjestu
      glavni.js             ulaz za početnu
      podstranica.js        ulaz za podstranice
      hero.js
      ucitavanje.js
      pojavljivanje.js
      izbornik.js
      aktualno.js
      obrazac.js
    data/
      aktualno.json
    assets/
      frames/               konj-001.jpg do konj-120.jpg
      img/
      fonts/
  izvori/                   izvorne fotografije i videi, ne objavljuju se
  docs/                     specifikacija i plan, ne objavljuju se
```

Prihvaćene posljedice: zaglavlje i podnožje ponavljaju se u šest HTML datoteka, a za lokalni pregled potreban je lokalni poslužitelj.

### 8.1 Moduli

| Modul | Što radi | O čemu ovisi |
|---|---|---|
| `postavke.js` | Drži broj sličica, putanju sličica, adresu za slanje obrasca, telefon, prijelomnu širinu | Ni o čemu |
| `ucitavanje.js` | Učitava sličice, javlja napredak, vodi uvodni zaslon | `postavke.js` |
| `hero.js` | Računa napredak skrolanja, crta sličicu, mijenja naslov | `postavke.js`, `ucitavanje.js` |
| `pojavljivanje.js` | Otkriva elemente pri ulasku u ekran | Ni o čemu |
| `izbornik.js` | Otvara i zatvara izbornik na mobitelu | Ni o čemu |
| `aktualno.js` | Čita `aktualno.json` i prikazuje ili skriva najavu | Ni o čemu |
| `obrazac.js` | Provjerava unos, šalje upit, prikazuje ishod | `postavke.js` |
| `glavni.js`, `podstranica.js` | Pokreću potrebne module za tu vrstu stranice | Ostali moduli |

Svaki modul radi jednu stvar i može se zamijeniti bez diranja ostalih. `obrazac.js` i `aktualno.js` su mjesta na kojima se stranica kasnije spaja s internim alatom.

## 9. Sadržaj i podaci

### 9.1 Aktualno

`site/data/aktualno.json`:

```json
{
  "naslov": "Advent na konjima",
  "datum": "2026-12-14",
  "prikazuj_do": "2026-12-21",
  "tekst": "Kratak opis u jednoj ili dvije rečenice.",
  "slika": "assets/img/aktualno/advent.jpg",
  "poveznica": "https://www.instagram.com/udruga_vis_solis/",
  "poveznica_tekst": "Više na Instagramu"
}
```

- Obavezni su `naslov` i `prikazuj_do`. Ostalo je izborno.
- Najava se prikazuje do kraja dana `prikazuj_do`, a zatim se sama skriva.
- Najava se ne prikazuje ako je datoteka prazna (`{}`), ako nedostaje obavezno polje, ako je datum prošao ili ako datoteka nije ispravan JSON.

### 9.2 Obrazac za upit

| Polje | Obavezno | Napomena |
|---|---|---|
| Ime i prezime | Da | |
| Telefon ili e-mail | Da | Dovoljno je jedno |
| Program | Ne | Padajući izbor: četiri terapije, rekreativno jahanje, nešto drugo |
| Poruka | Ne | |
| Privola za obradu podataka | Da | S poveznicom na pravila privatnosti |
| Skriveno polje | — | Zaštita od neželjene pošte; ispunjeno polje znači da se upit odbacuje |

- Obrazac ne pita za dijagnozu ni zdravstvene podatke.
- Upit se šalje na adresu zapisanu u `postavke.js`, preko vanjske usluge za obrasce. Usluga se bira pri izradi, nakon provjere trenutnih uvjeta besplatnih planova.
- Nakon uspješnog slanja obrazac zamjenjuje poruka zahvale s informacijom kad se može očekivati odgovor.

### 9.3 Tekstovi

- Izvođač piše: naslove, uvod, "O nama", "Druženje s konjima", pozive na akciju, kontakt, pravila privatnosti (nacrt).
- Terapeuti pišu ili pregledavaju: opise četiriju terapija, "Kako početi", česta pitanja. Izvođač priprema nacrt i popis pitanja.
- Cijene, imena, kvalifikacije tima, projekti i suradnje objavljuju se samo uz potvrdu naručitelja. To uključuje projekte "Siguran korak uz konja" i "Konj za svakoga" te suradnju sa Specijalnom bolnicom za kronične bolesti dječje dobi Gornja Bistra.

## 10. Slike i video

### 10.1 Pravila

- Djeca se ne prikazuju ni na jednoj fotografiji.
- Stvarne osobe ne animiraju se umjetnom inteligencijom.
- Prave fotografije nose stranicu. AI se koristi samo za hero animaciju konja.
- Izvorne datoteke ostaju netaknute u mapi `izvori/`.

### 10.2 Dostavljene fotografije

| Datoteka | Sadržaj | Namjena |
|---|---|---|
| `DSC0112.jpg` | Svijetlosmeđi konj u kasu, s boka, s jahačicom | Polazište za hero animaciju; "O nama" |
| `DSC3065.jpg` | Isti konj, portret s članicom tima i psom | "O nama" |
| `DSC0124.jpg` | Sivi konj s jahačicom | "O nama" |
| `DSC2220.jpg` | Crni konj s jahačicom | "O nama" |
| `DSC0002.jpg` | Bijeli konj u galopu s jahačicom | "O nama" ili "Druženje s konjima" |
| `0U8A8968.JPG` | Smeđi konj, krupni plan glave | "Naše krdo" |
| `0U8A8685.JPG` | Sivi konj sprijeda | "Naše krdo" |
| `0U8A8889.JPG` | Sivi konj iza trake | Rezerva |
| `0U8A8831.JPG` | Poni s djetetom | Ne koristi se |
| `463275769_…_n.jpg` | Logo | "O nama"; predložak za vektorski znak |

### 10.3 Higgsfield, redom

Svaki korak počinje provjerom cijene, a pokreće se tek nakon što naručitelj potvrdi trošak.

1. Provjera stanja kredita.
2. **Čista slika konja.** Polazište `DSC0112.jpg`. Isti konj, s boka, okrenut udesno, bez jahačice, sedla i uzde, na bijeloj podlozi, s blagom sjenom na tlu. Naručitelj potvrđuje da je to njegov konj.
3. **Video hoda.** Polazna sličica je slika iz koraka 2. Kamera miruje, konj hoda na mjestu, podloga ostaje bijela. Dvije inačice, bira se bolja.
4. **Zamjena.** Ako nijedna inačica nije dobra: konj stoji, kamera kruži.

### 10.4 Obrada

- Video se reže u 120 sličica širine 1600 px.
- Pozadina sličica ujednačava se na čistu bijelu.
- Fotografije se izrezuju i spremaju u više širina i u lakšem formatu, s izvornim formatom kao rezervom.
- Svaka slika ima opisni zamjenski tekst.

## 11. Brzina i pristupačnost

**Brzina**

- Prvi ekran na mobitelu ne učitava nijednu sličicu animacije.
- Sve ispod prvog ekrana učitava se tek pri približavanju.
- Slike imaju zadane dimenzije da se sadržaj ne pomiče pri učitavanju.
- Cilj: Lighthouse ocjena izvedbe 90 ili više na računalu i mobitelu.

**Pristupačnost**

- Stranicom se može upravljati samo tipkovnicom, uz vidljiv fokus.
- Polja obrasca imaju oznake, a greške su opisane tekstom, ne samo bojom.
- Površine za dodir su najmanje 44 × 44 px.
- Poštuje se postavka za smanjeno kretanje.

## 12. Smještaj i objava

- Kod je u GitHub repozitoriju naručitelja.
- Cloudflare Pages objavljuje mapu `site/` pri svakoj izmjeni.
- Vlastita .hr domena usmjerava se na Cloudflare. Točan postupak za .hr domenu provjerava se pri objavi.
- Tehnička adresa `pages.dev` preusmjerava se na domenu.

## 13. Rukovanje greškama

| Situacija | Ponašanje |
|---|---|
| Slanje obrasca ne uspije | Poruka o grešci uz broj telefona; uneseni tekst ostaje u poljima |
| Adresa za slanje nije upisana u `postavke.js` | Obrazac ne šalje; prikazuje poruku s brojem telefona |
| Obavezno polje je prazno | Poruka uz to polje; obrazac se ne šalje |
| `aktualno.json` nedostaje ili je neispravan | Najava se ne prikazuje; ostatak stranice radi |
| Sličica animacije se ne učita | Crta se najbliža učitana |
| Nijedna sličica se ne učita | Ostaje statična slika konja |
| JavaScript je isključen | Sav sadržaj je čitljiv, hero je statična slika, a kontakt nudi telefon |

## 14. Provjera prije predaje

- Svih šest stranica otvara se bez grešaka u konzoli i bez poveznica koje ne vode nikamo.
- Svih 120 sličica postoji i učitava se.
- Hero prati skrolanje u oba smjera, a naslov se mijenja u sva tri koraka.
- Obrazac: uspješno slanje, prazna obavezna polja, neuspjelo slanje, ispunjeno skriveno polje.
- Aktualno: ispravan zapis, prošli datum, prazna datoteka, neispravna datoteka.
- Pregled na širinama 375, 768, 1024 i 1440 px.
- Upravljanje tipkovnicom kroz cijelu početnu i obrazac.
- Smanjeno kretanje: nema animacija, sav sadržaj vidljiv.
- Lighthouse na početnoj i na jednoj podstranici.

## 15. Što čeka naručitelja

Stranica se može izraditi i pregledati prije nego ovo stigne. Bez ovoga se ne objavljuje.

| Stavka | Do tada |
|---|---|
| E-mail adresa za upite | U tekstu stoji `upiti@example.com`; obrazac ne šalje nego prikazuje telefon |
| Imena konja i pripadajuće fotografije | Sekcija krda koristi opise ("Svijetlosmeđi konj") |
| Naziv domene | Stranica radi na tehničkoj adresi |
| Opisi terapija od terapeuta | Nacrt izvođača, jasno označen kao nacrt |
| Potvrda projekata, suradnji i podataka o udruzi | Ti se dijelovi ne objavljuju |
| Odobrenje vektorskog znaka | U zaglavlju stoji naziv udruge kao tekst |
