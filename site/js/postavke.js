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
    // Skripta na našem hostingu koja upit šalje e-mailom na udrugavissolis@gmail.com (posalji.php).
    // Ako je adresa prazna, obrazac ne šalje nego upućuje posjetitelja na telefon.
    adresaSlanja: 'posalji.php',
    // Dodatna polja koja se šalju uz svaki upit (zasad nijedno).
    dodatnaPolja: {},
  },
};
