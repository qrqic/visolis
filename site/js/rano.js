// Učitava se u <head>, prije prikaza stranice, da se elementi koji se
// pojavljuju pri skrolanju ne bi prvo prikazali pa sakrili.
// Ako se glavni moduli ne učitaju, klasa "pokret" se miče i sve ostaje vidljivo.
(function (korijen) {
  korijen.classList.add('js');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    korijen.classList.add('pokret');
    window.setTimeout(function () {
      if (!korijen.classList.contains('spremno')) korijen.classList.remove('pokret');
    }, 2500);
  }
})(document.documentElement);
