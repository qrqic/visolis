// Izborna najava "Aktualno". Sadržaj dolazi iz data/aktualno.json.

const OBLIK_DATUMA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Pretvara "GGGG-MM-DD" u lokalni datum. Vraća null ako zapis nije stvaran datum. */
function procitajDatum(tekst) {
  if (typeof tekst !== 'string') return null;
  const dijelovi = OBLIK_DATUMA.exec(tekst);
  if (!dijelovi) return null;
  const [godina, mjesec, dan] = dijelovi.slice(1).map(Number);
  const datum = new Date(godina, mjesec - 1, dan);
  const stvaran = datum.getFullYear() === godina && datum.getMonth() === mjesec - 1 && datum.getDate() === dan;
  return stvaran ? datum : null;
}

/** Najava se prikazuje ako ima naslov i ako dan "prikazuj_do" još nije prošao. */
export function jeLiAktualno(zapis, danas = new Date()) {
  if (!zapis || typeof zapis !== 'object') return false;
  if (typeof zapis.naslov !== 'string' || !zapis.naslov.trim()) return false;
  const zadnjiDan = procitajDatum(zapis.prikazuj_do);
  if (!zadnjiDan) return false;
  const pocetakDanasnjegDana = new Date(danas.getFullYear(), danas.getMonth(), danas.getDate());
  return zadnjiDan >= pocetakDanasnjegDana;
}

/** Dopušta samo poveznice na web i putanje unutar stranice. */
function sigurnaAdresa(adresa) {
  if (typeof adresa !== 'string' || !adresa.trim()) return null;
  try {
    const url = new URL(adresa, window.location.href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export async function pokreniAktualno() {
  const sekcija = document.querySelector('[data-aktualno]');
  if (!sekcija) return;

  let zapis;
  try {
    const odgovor = await fetch('data/aktualno.json', { cache: 'no-cache' });
    if (!odgovor.ok) return;
    zapis = await odgovor.json();
  } catch {
    return; // Datoteka nedostaje ili nije ispravan JSON: najava se ne prikazuje.
  }
  if (!jeLiAktualno(zapis)) return;

  const dio = (naziv) => sekcija.querySelector(`[data-aktualno-${naziv}]`);

  dio('naslov').textContent = zapis.naslov.trim();

  const datum = procitajDatum(zapis.datum);
  dio('datum').hidden = !datum;
  if (datum) {
    dio('datum').textContent = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(datum);
    dio('datum').dateTime = zapis.datum;
  }

  const imaTekst = typeof zapis.tekst === 'string' && zapis.tekst.trim();
  dio('tekst').hidden = !imaTekst;
  if (imaTekst) dio('tekst').textContent = zapis.tekst.trim();

  const slika = sigurnaAdresa(zapis.slika);
  dio('slika').hidden = !slika;
  if (slika) dio('slika').src = slika;

  const poveznica = sigurnaAdresa(zapis.poveznica);
  dio('poveznica').hidden = !poveznica;
  if (poveznica) {
    dio('poveznica').href = poveznica;
    dio('poveznica').textContent = (typeof zapis.poveznica_tekst === 'string' && zapis.poveznica_tekst.trim()) || 'Saznajte više';
  }

  sekcija.hidden = false;
}
