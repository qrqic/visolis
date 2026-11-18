// Ulazna točka podstranica (programi, pravila privatnosti).

import { pokreniIzbornik } from './izbornik.js';
import { pokreniPojavljivanje } from './pojavljivanje.js';
import { pokreniTim } from './tim.js';
import { pokreniDonacije } from './donacije.js';

pokreniIzbornik();
pokreniPojavljivanje();
pokreniTim();
pokreniDonacije();
document.documentElement.classList.add('spremno');
