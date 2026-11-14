# Što još treba

Na stranici je svako ovakvo mjesto označeno žutim blokom "Čeka sadržaj". Prije objave nijedan ne smije ostati.

## Od udruge

- [ ] **E-mail adresa za upite.** Sada stoji `upiti@example.com` (`index.html`, sekcija Kontakt). Ista adresa treba i u pravilima privatnosti.
- [ ] **Imena konja** i po jedna rečenica o svakome (`index.html`, sekcija Naše krdo). Sada piše "Ime konja".
- [ ] **Fotografije ostalih konja** iz krda. Sada su tri. Anabela nije u sekciji krda: izrez njezine prave fotografije bez djeteta postoji (`izvori/anabela-izrez.png`), ali je malen.
- [ ] **Slika u heroju je generirana**, nije fotografija (vidi `docs/higgsfield.md`). Raspored mrlja i ular mogu se razlikovati od prave Anabele; potvrditi da je udruzi to u redu. Za pravu fotografiju preko cijelog ekrana treba izvorna datoteka u punoj rezoluciji (sadašnja je široka 1377 px i nosi vodeni žig ViEdo).
- [ ] **Odluka o ostale tri terapije.** Fizikalna, okupacijska i logopedska terapija više nisu istaknute: spominju se jednom rečenicom u sekciji Hipoterapija i imaju svoje podstranice. Ako ih udruga ne želi na stranici, podstranice i rečenica se brišu.
- [ ] **Priča udruge** u nekoliko rečenica te imena i zvanja članova tima (`index.html`, sekcija O nama).
- [ ] **Potvrda** da se smiju navesti projekti „Siguran korak uz konja” i „Konj za svakoga” te suradnja sa Specijalnom bolnicom za kronične bolesti dječje dobi Gornja Bistra.
- [ ] **Potvrda podataka:** osnivanje u kolovozu 2024., "dvanaestak konja", adrese, telefon, popis aktivnosti u sekciji Aktivnosti pomoću konja.
- [ ] **Potvrda da su programi "za djecu i odrasle"** (rečenica ispod naslova na početnoj).
- [ ] **Odobrenje znaka "VS"** u zaglavlju (`site/assets/img/znak.svg`). Privremeni je.
- [ ] **Naziv domene.**
- [ ] **Pregled pravila privatnosti** (`privatnost.html`): nacrt treba odobriti odgovorna osoba; nedostaje rok čuvanja upita.

## Od terapeuta

- [ ] **Kako početi** (`index.html`): potvrditi tri koraka; treba li dokumentacija ili uputnica, kako izgleda početna procjena.
- [ ] Za svaki od četiri programa (`hipoterapija.html`, `fizikalna-terapija.html`, `okupacijska-terapija.html`, `logopedska-terapija.html`):
  - [ ] pregledati uvodnu rečenicu (napisana je kao nacrt; za hipoterapiju ista stoji i na početnoj);
  - [ ] kome je program namijenjen i kada se ne preporučuje;
  - [ ] kako izgleda termin: trajanje, što se radi, tko je prisutan, što ponijeti;
  - [ ] tko vodi program: ime, zvanje, edukacija, po mogućnosti fotografija;
  - [ ] tri do pet čestih pitanja s odgovorima (cijena, učestalost, dokumentacija, sigurnost).

## Tekstovi koje je napisao izvođač kao nacrt

Slobodno ih mijenjajte; nijedan nije preuzet iz materijala udruge.

- Naslov na početnoj: "Hipoterapija i aktivnosti pomoću konja." i rečenica ispod njega.
- Naslovi sekcija: "Terapija koja počinje korakom konja.", "Od prvog upita do prvog termina.", "Ne mora sve biti terapija.", "Dvanaestak konja, svaki sa svojom naravi.", "Vis solis: snaga sunca."
- Odlomak u O nama koji počinje "Okupili smo se oko jednostavne ideje".
- Poruka nakon slanja obrasca: "Javit ćemo vam se čim prije." Ako postoji uobičajen rok odgovora, treba ga upisati.

## Tehnički

- [ ] **Usluga za obrasce.** Odabrati uslugu, upisati adresu u `postavke.obrazac.adresaSlanja` i naziv usluge u pravila privatnosti. Do tada obrazac ne šalje nego upućuje na telefon.
- [ ] **Font naslova.** Privremeno Lora; specifikacija predviđa Fraunces, koji treba preuzeti i staviti u `site/assets/fonts/`.
- [ ] **Fontovi u WOFF2.** Sada su WOFF, koji je nešto veći.
- [ ] **Objava:** GitHub, Cloudflare Pages, domena, zatim Lighthouse provjera.

## Ideje za kasnije

- Anabeline oči prate pokazivač miša (prijedlog naručitelja, 13. 11. 2026.).

## Krdo u trku (14. 11. 2026.)

Red s konjima koji trče ugrađen je u sekciju "Naše krdo" na početnoj stranici.

- [ ] Za svakog od 12 konja u `site/data/krdo.json`: ime, jedna rečenica, oblik (`konj` ili `poni`), boja dlake i grive.
- [ ] Fotografija svakog konja (bez djece). Zasad ih imaju Anabela i tri konja; ostalima piše "Fotografija stiže".
- [ ] Boje konja 7–12 su izmišljene kao primjer i treba ih zamijeniti stvarnima.
