# Vis Solis — web stranica

Statična stranica udruge Vis Solis. Čisti HTML, CSS i JavaScript, bez alata za slaganje i bez vanjskih biblioteka.

## Mape

| Mapa | Što je unutra |
|---|---|
| `site/` | Stranica. Samo ova mapa ide na internet. |
| `site/css/` | Stilovi, podijeljeni po cjelinama |
| `site/js/` | JavaScript moduli, svaki radi jednu stvar |
| `site/data/aktualno.json` | Izborna najava na početnoj |
| `site/assets/` | Slike i fontovi |
| `izvori/` | Izvorne fotografije (ne ulaze u git ni na internet) |
| `alati/` | Skripta za pripremu fotografija |
| `tests/` | Testovi |
| `docs/` | Specifikacija, plan i popis onoga što još treba |

## Pregled na vlastitom računalu

Treba samo [Node.js](https://nodejs.org) (inačica 18 ili novija).

1. Otvoriti terminal u ovoj mapi (onoj u kojoj je `package.json`).
   - Windows: otvoriti mapu u Exploreru, u adresnu traku upisati `cmd` i pritisnuti Enter.
   - macOS: desni klik na mapu u Finderu, zatim "New Terminal at Folder".
2. Upisati `npm start` i pritisnuti Enter.
3. U pregledniku otvoriti http://localhost:8080.

Zaustavljanje: Ctrl + C u terminalu.

Stranica se ne može pregledati dvoklikom na `index.html`, jer preglednik tako ne učitava JavaScript module.

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

**Telefon i adresa za slanje obrasca.** U `site/js/postavke.js`.

**Boje.** Varijable na vrhu `site/css/osnova.css`.

**Fontovi.** `site/css/tipografija.css` i datoteke u `site/assets/fonts/`.

**Zaglavlje i podnožje.** Ponavljaju se u svih šest HTML datoteka, pa se izmjena radi u svakoj.

**Nova fotografija.** Staviti izvornik u `izvori/`, dodati red u popis u `alati/obradi-slike.mjs` i pokrenuti `node alati/obradi-slike.mjs` (treba paket `sharp`).

**Slika u heroju.** Izvornik je `izvori/higgsfield/anabela-hero.png` (21:9). Nakon zamjene pokrenuti `node alati/obradi-slike.mjs`. Položaj ponija na ekranu određuje `--zariste` u `site/css/hero.css`.

## Testovi

```
npm test                    # logika: aktualno, obrazac
node tests/preglednik.mjs   # provjera u Chromiumu (treba paket playwright)
```

## Objava

Cloudflare Pages, povezan s GitHub repozitorijem. Naredba za izgradnju ostaje prazna, a izlazna mapa je `site`.

Prije objave nijedan blok s oznakom "Čeka sadržaj" ne smije ostati na stranici. Popis je u `docs/STO-JOS-TREBA.md`.

## Objava (GitHub Pages)

Stranica se objavljuje sama nakon svakog slanja na granu `main`: postupak u `.github/workflows/pages.yml` objavljuje sadržaj mape `site/`.

- Adresa: https://qrqic.github.io/visolis/
- Jednokratno u postavkama repozitorija: Settings → Pages → Source: **GitHub Actions**.
- Tijek objave vidi se na kartici Actions; traje oko minute.
- Vlastita domena upisuje se kasnije pod Settings → Pages → Custom domain.
