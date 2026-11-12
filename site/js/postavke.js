// Sve podesive vrijednosti stranice na jednom mjestu.

export const postavke = {
  telefon: '+385955554789',
  telefonPrikaz: '+385 95 555 4789',

  // Širina (px) od koje se prikazuje hero animacija i puni izbornik.
  // Ista vrijednost stoji u CSS datotekama kao 64rem (1024 px).
  prijelom: 1024,

  obrazac: {
    // Adresa usluge za obrasce na koju se šalje upit.
    // Dok je prazna, obrazac ne šalje nego upućuje posjetitelja na telefon.
    adresaSlanja: '',
    // Polja koja usluga traži uz svaki upit (npr. pristupni ključ).
    dodatnaPolja: {},
  },

  hero: {
    // Isključiti (false) ako sličica u assets/frames/ nema; hero tada prikazuje statičnu sliku.
    ukljuceno: true,
    brojSlicica: 120,
    putanja: (redniBroj) => `assets/frames/konj-${String(redniBroj).padStart(3, '0')}.jpg`,
    // Koliko se sličica učita prije nego se uvodni zaslon skloni.
    prvaSkupina: 20,
    // Koliko se sličica odjednom učitava u pozadini.
    velicinaSkupine: 10,
    // Uvodni zaslon se sklanja najkasnije nakon ovoliko milisekundi.
    najduljeCekanjeMs: 3000,
    // Napredak skrolanja (0 do 1) na kojem naslov prelazi u sljedeću fazu.
    graniceFaza: [0.33, 0.66],
  },
};
