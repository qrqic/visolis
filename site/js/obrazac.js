// Obrazac za upit: provjera unosa, slanje i poruke posjetitelju.

import { postavke } from './postavke.js';

const OBLIK_EPOSTE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZNAKOVI_TELEFONA = /^[\d\s+()/-]+$/;

/** Provjerava obavezna polja. Vraća sve greške odjednom, po nazivu polja. */
export function provjeriUnos({ ime, kontakt, privola } = {}) {
  const greske = {};

  if (!String(ime ?? '').trim()) greske.ime = 'Upišite ime i prezime.';

  const kontaktTekst = String(kontakt ?? '').trim();
  const brojZnamenki = kontaktTekst.replace(/\D/g, '').length;
  const jeTelefon = ZNAKOVI_TELEFONA.test(kontaktTekst) && brojZnamenki >= 6;
  if (!OBLIK_EPOSTE.test(kontaktTekst) && !jeTelefon) {
    greske.kontakt = 'Upišite broj telefona ili e-mail adresu na koju vam se možemo javiti.';
  }

  if (privola !== true) greske.privola = 'Za slanje upita potrebna je vaša privola.';

  return { ispravno: Object.keys(greske).length === 0, greske };
}

/** Skriveno polje "web" ljudi ne vide; ispunjavaju ga samo automati. */
export function jeLiNezeljeno(podaci = {}) {
  return String(podaci.web ?? '').trim() !== '';
}

export function pokreniObrazac() {
  const obrazac = document.querySelector('[data-obrazac]');
  if (!obrazac) return;

  const poruka = obrazac.querySelector('[data-obrazac-poruka]');
  const uspjeh = document.querySelector('[data-obrazac-uspjeh]');
  const gumb = obrazac.querySelector('[type="submit"]');
  const telefon = `<a href="tel:${postavke.telefon}">${postavke.telefonPrikaz}</a>`;
  const email = `<a href="mailto:${postavke.email}">${postavke.email}</a>`;

  const prikaziPoruku = (html) => {
    poruka.innerHTML = html; // Sadržaj su samo stalni tekstovi iz ove datoteke.
    poruka.hidden = false;
  };

  const prikaziGreske = (greske) => {
    let prvoNeispravno = null;
    for (const polje of ['ime', 'kontakt', 'privola']) {
      const unos = obrazac.elements[polje];
      const opis = obrazac.querySelector(`[data-greska="${polje}"]`);
      const tekst = greske[polje];
      opis.textContent = tekst ?? '';
      opis.hidden = !tekst;
      unos.setAttribute('aria-invalid', String(Boolean(tekst)));
      if (tekst && !prvoNeispravno) prvoNeispravno = unos;
    }
    prvoNeispravno?.focus();
  };

  const prikaziUspjeh = () => {
    obrazac.hidden = true;
    uspjeh.hidden = false;
    uspjeh.focus();
  };

  obrazac.addEventListener('submit', async (dogadaj) => {
    dogadaj.preventDefault();
    poruka.hidden = true;

    const polja = new FormData(obrazac);
    const podaci = {
      ime: String(polja.get('ime') ?? '').trim(),
      kontakt: String(polja.get('kontakt') ?? '').trim(),
      program: String(polja.get('program') ?? ''),
      poruka: String(polja.get('poruka') ?? '').trim(),
      privola: polja.get('privola') === 'da',
      web: String(polja.get('web') ?? ''),
    };

    const { ispravno, greske } = provjeriUnos(podaci);
    prikaziGreske(greske);
    if (!ispravno) return;

    // Automatu se prikazuje uspjeh, ali se ništa ne šalje.
    if (jeLiNezeljeno(podaci)) {
      prikaziUspjeh();
      return;
    }

    const { adresaSlanja, dodatnaPolja } = postavke.obrazac;
    if (!adresaSlanja) {
      prikaziPoruku(`Obrazac još nije povezan s našim sandučićem. Nazovite nas na ${telefon} ili pišite na ${email} i rado ćemo se dogovoriti.`);
      return;
    }

    gumb.disabled = true;
    try {
      const { web, privola, ...zaSlanje } = podaci;
      const odgovor = await fetch(adresaSlanja, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...dodatnaPolja, ...zaSlanje, privola: 'da' }),
      });
      if (!odgovor.ok) throw new Error(`Usluga je odgovorila statusom ${odgovor.status}`);
      prikaziUspjeh();
    } catch {
      prikaziPoruku(`Upit nije poslan. Pokušajte ponovno ili nas nazovite na ${telefon}. Vaš tekst je ostao u obrascu.`);
    } finally {
      gumb.disabled = false;
    }
  });
}
