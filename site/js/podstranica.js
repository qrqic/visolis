// Ulazna točka podstranica (programi, pravila privatnosti).

import { pokreniIzbornik } from './izbornik.js';
import { pokreniPojavljivanje } from './pojavljivanje.js';
import { pokreniTim, pokreniStupce } from './tim.js';

pokreniIzbornik();
pokreniPojavljivanje();
pokreniTim();
pokreniStupce();
document.documentElement.classList.add('spremno');
