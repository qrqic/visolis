// Ulazna točka početne stranice.

import { pokreniIzbornik } from './izbornik.js';
import { pokreniPojavljivanje } from './pojavljivanje.js';
import { pokreniAktualno } from './aktualno.js';
import { pokreniObrazac } from './obrazac.js';

pokreniIzbornik();
pokreniPojavljivanje();
document.documentElement.classList.add('spremno');
pokreniAktualno();
pokreniObrazac();
