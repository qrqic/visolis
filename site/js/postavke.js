// Sve podesive vrijednosti stranice na jednom mjestu.

export const postavke = {
  telefon: '+385955554789',
  telefonPrikaz: '+385 95 555 4789',
  email: 'udrugavissolis@gmail.com',

  // Podaci za ručnu uplatu u prozoru "Donacije" (o-nama.html).
  // Dok je IBAN prazan, prozor prikazuje samo barkod.
  donacije: {
    primatelj: 'Vis Solis – udruga za terapiju i aktivnosti pomoću konja',
    iban: '',
    model: '',
    pozivNaBroj: '',
    opis: 'Donacija za izgradnju ranča',
  },

  obrazac: {
    // Adresa usluge za obrasce na koju se šalje upit (FormSubmit prosljeđuje upit na e-mail udruge).
    // Prvi upit pošalje na taj e-mail poveznicu "Activate Form" koju treba jednom kliknuti.
    // Ako je adresa prazna, obrazac ne šalje nego upućuje posjetitelja na telefon.
    adresaSlanja: 'https://formsubmit.co/ajax/udrugavissolis@gmail.com',
    // Polja koja usluga traži uz svaki upit: naslov e-maila i izgled tablice.
    dodatnaPolja: {
      _subject: 'Novi upit s web stranice Vis Solis',
      _template: 'table',
      _captcha: 'false',
    },
  },
};
