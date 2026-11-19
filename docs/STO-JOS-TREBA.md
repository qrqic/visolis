# Što još treba

Stanje nakon provjere 19. 11. 2026.

Na stranici su otvorena mjesta označena na dva načina:

- žuti blok **"Čeka sadržaj"** – nedostaje tekst ili podatak;
- žuti okvir **"Mjesto za fotografiju"** – nedostaje slika.

Prije konačne objave nijedan ne smije ostati.

## Fotografije (sve bez djece)

- [x] Portreti svih šest članica u šesterokutu tima. Portrete izradio je Higgsfield prema pravim fotografijama (vidi `docs/higgsfield.md`); naručitelj ih je odobrio 17. 11. 2026. Slike su u `izvori/tim/`, izrezi u `alati/obradi-slike.mjs`. Sunčica je 19. 11. 2026. dobila pravu fotografiju na konju (pozadina zamućena alatom `alati/suncica-pozadina.py`).
- [x] Hipoterapija na početnoj (19. 11. 2026.): članice u bordo majicama vode konja, lice korisnice zamućeno. Aktivnosti na početnoj: djevojčica na poniju, profil zamućen. Pravilo naručitelja: članice u bordo majicama ne zamućuju se.
- [x] Aktivnosti pomoću konja: rad s tla ili poligon (`aktivnosti-pomocu-konja.html`).
- [x] Po jedna fotografija svakog konja (svih 13, 18. 11. 2026.).
- [x] Logo udruge stigao je 17. 11. 2026. (PDF, vektorski; `izvori/logo/`). Puni logo je u podnožju (`site/assets/img/logo-udruge.svg`).
- [x] U zaglavlju je mali logo udruge (`site/assets/img/logo-znak.svg`).

Udruga je javila da autore fotografija ne treba navoditi i da sadašnje fotografije smiju ostati.

## Obiteljski dan (18. 11. 2026.)

Četiri fotografije u sekciji "Ostalo u našoj ponudi". Prema odluci naručitelja (18. 11. 2026.): sve četiri fotografije prikazuju se cijele; zamućeno je lice dječaka na konju te lica djeteta na poniju i posjetiteljice (`alati/obiteljski-dan.py`). Izvorne fotografije su u `izvori/obiteljski-dan/` i ne idu u git.

## Konji

Podaci za svih 13 konja i ponija upisani su 17. 11. 2026. u `site/data/krdo.json` (pasmina, godina, spol, od kada su kod nas, narav, u čemu sudjeluju, priča). Boje crteža složene su prema opisu dlake.

- [x] Fotografije svih 13 konja i ponija (18. 11. 2026.).
- [ ] Koji je konj na kojoj od tri postojeće fotografije (svijetlosmeđi, smeđi, sivi): `site/assets/img/krdo-*`.

## Nove stranice (17. 11. 2026.)

- [x] **Dokumenti** (`dokumenti.html`, PDF-ovi u `site/assets/dokumenti/`): statut (2024.) i zapisnik s redovne skupštine 2025. (19. 11. 2026.). Zapisnik je objavljen cijeli, s popisom prisutnih članova (odluka naručitelja 19. 11. 2026.).
- [ ] Zapisnici s ostalih redovnih skupština (udruga ih traži).
- [ ] **Novosti** (`novosti.html`): zasad samo poveznice na društvene mreže. Prvo događanje: advent 19. 12. 2026. (treba vrijeme, mjesto i kratak opis).

## Tim – treba potvrditi

- [x] **Tri ili četiri osnivačice?** Prema tekstu udruge četiri. U prvom tekstu osnivačice su Viktorija, Sunčica i Gabrijela, a u priči udruge i Lorena. Na stranici pišu četiri.
- [x] **Šesta članica:** Mia (17. 11. 2026.).
- [x] Samo imena, bez prezimena (19. 11. 2026.).
- [x] Sunčica: ne piše se ništa dodatno (19. 11. 2026.).
- [x] Josipa sudjeluje u hipoterapiji, ali se zasad ne navodi (19. 11. 2026.).
- [x] Naziv radionica: Emmet (19. 11. 2026.).

## Tekstovi – treba dopuniti

- [ ] Opis svake aktivnosti iz "Ostalo u našoj ponudi" (rekreativno jahanje, šetnje, kampovi, obiteljski dani, advent). Udruga ih šalje naknadno.
- [ ] Novosti o izgradnji ranča: što je napravljeno i što slijedi (`o-nama.html`).
- [ ] Kako doći: parking, autobus, prilaz za invalidska kolica.
- [ ] Projekti i suradnje koje se smiju navesti („Siguran korak uz konja”, „Konj za svakoga”, drugi partneri).
- [x] Gumb "Donacije" (`o-nama.html`, Izgradnja ranča) otvara prozor s barkodom za plaćanje s letka udruge (19. 11. 2026.). Na mobitelu se barkod sprema u galeriju i učitava u aplikaciju banke.
- [x] Barkod radi (potvrdio naručitelj 19. 11. 2026.). Podaci za ručnu uplatu nisu potrebni; mogu se dodati: upisati u `postavke.donacije` u `site/js/postavke.js`; prozor ih tada sam prikaže s gumbima "Kopiraj". Barkod se ovdje nije mogao pročitati, pa ga treba jednom probno skenirati aplikacijom banke.
- [x] Instagram: na letku piše @ranch.vis_solis, na stranici je udruga_vis_solis; naručitelj je 19. 11. 2026. rekao da se ne mijenja.
- [ ] Želi li povremenu najavu "Aktualno" i tko javlja tekst.

## Odluke koje su donesene bez izričite potvrde

- **Tri terapije su uklonjene.** Na pitanje o fizikalnoj, okupacijskoj i logopedskoj terapiji udruga je odgovorila "ne, nego Ostalo u našoj ponudi", pa su podstranice i rečenica obrisane. Ako ih ipak provode, lako se vraćaju.
- **Trajanje pripreme konja.** U jednom odgovoru piše "15–25 minuta priprema, preostalih 45 minuta rad", što zajedno nije 60. Na stranici piše "15 do 25 minuta priprema, ostatak rad s konjem".
- **Obraćanje.** Tekst o volontiranju udruga je napisala na "ti"; na stranici je prebačen na "vi", kao ostatak stranice.
- **Šala** "malo smo i lude" nije preuzeta; ostalo je "totalne smo zaljubljenice u konje".
- **Cijene se ne objavljuju** (odluka udruge).

## Hero

- [ ] Slika u heroju je računalno izrađena prema Anabelinoj fotografiji (vidi `docs/higgsfield.md`). Udruga je potvrdila da je na tamnoj fotografiji ispred kamenog zida stvarno Anabela i da autora ne treba navoditi, pa se hero s pravom fotografijom može vratiti kad naručitelj odluči (grana `hero-fotografija-15-11`, nije na GitHubu).

## Tehnički

- [ ] **Obrazac** šalje upite skriptom `site/posalji.php` na hostingu udrugavissolis.hr (PHP `mail()`, pošiljatelj noreply@udrugavissolis.hr) na udrugavissolis@gmail.com (19. 11. 2026.). Treba potvrditi da prvi probni upit stiže (i provjeriti neželjenu poštu). Na GitHub Pages obrazac ne šalje (nema PHP-a).
- [x] **Pravila privatnosti** odobrena i javna (19. 11. 2026.); rok čuvanja upita: najduže godinu dana od posljednjeg kontakta.
- [ ] **Domena.** Stranica je zasad na https://qrqic.github.io/visolis/
- [ ] **Font naslova.** Privremeno Lora; specifikacija predviđa Fraunces.
- [ ] **Fontovi u WOFF2.** Sada su WOFF, koji je nešto veći.

## Ideje za kasnije

- Anabeline oči prate pokazivač miša (prijedlog naručitelja, 13. 11. 2026.).
