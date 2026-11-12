# Vis Solis — web stranica

Statična stranica udruge Vis Solis. Čisti HTML, CSS i JavaScript, bez alata za slaganje i bez vanjskih biblioteka.

## Mape

| Mapa | Što je unutra |
|---|---|
| `site/` | Stranica. Samo ova mapa ide na internet. |
| `site/css/` | Stilovi, podijeljeni po cjelinama |
| `site/js/` | JavaScript moduli, svaki radi jednu stvar |
| `site/data/aktualno.json` | Izborna najava na početnoj |
| `site/assets/` | Slike, fontovi, sličice hero animacije |
| `izvori/` | Izvorne fotografije (ne ulaze u git ni na internet) |
| `alati/` | Skripta za pripremu fotografija |
| `tests/` | Testovi |
| `docs/` | Specifikacija, plan i popis onoga što još treba |

## Pregled na vlastitom računalu

```
npm start
```

Zatim otvoriti http://localhost:8080. Stranica se ne može pregledati dvoklikom na `index.html`, jer preglednik tako ne učitava JavaScript module.

## Česte izmjene

**Najava "Aktualno".** Urediti `site/data/aktualno.json`:

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

Obavezni su `naslov` i `prikazuj_do`. Nakon dana `prikazuj_do` najava se sama skriva. Za uklanjanje najave upisati `{}`.

**Telefon, adresa za slanje obrasca, hero animacija.** Sve je u `site/js/postavke.js`.

**Boje.** Varijable na vrhu `site/css/osnova.css`.

**Fontovi.** `site/css/tipografija.css` i datoteke u `site/assets/fonts/`.

**Zaglavlje i podnožje.** Ponavljaju se u svih šest HTML datoteka, pa se izmjena radi u svakoj.

**Nova fotografija.** Staviti izvornik u `izvori/`, dodati red u popis u `alati/obradi-slike.mjs` i pokrenuti `node alati/obradi-slike.mjs` (treba paket `sharp`).

## Testovi

```
npm test                    # logika: hero, učitavanje, aktualno, obrazac
node tests/preglednik.mjs   # provjera u Chromiumu (trebaju paketi playwright i sharp)
```

## Objava

Cloudflare Pages, povezan s GitHub repozitorijem. Naredba za izgradnju ostaje prazna, a izlazna mapa je `site`.

Prije objave nijedan blok s oznakom "Čeka sadržaj" ne smije ostati na stranici. Popis je u `docs/STO-JOS-TREBA.md`.
