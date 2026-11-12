// Elementi s atributom data-pojavi dobivaju klasu "vidljivo" kad uđu u ekran.
// Početno skrivanje radi CSS, i to samo kad <html> ima klasu "pokret" (vidi rano.js).

export function pokreniPojavljivanje() {
  const korijen = document.documentElement;
  const elementi = document.querySelectorAll('[data-pojavi]');
  const prikaziSve = () => elementi.forEach((element) => element.classList.add('vidljivo'));

  if (!korijen.classList.contains('pokret') || !('IntersectionObserver' in window)) {
    prikaziSve();
    return;
  }

  const promatrac = new IntersectionObserver(
    (unosi) => {
      for (const unos of unosi) {
        if (!unos.isIntersecting) continue;
        unos.target.classList.add('vidljivo');
        promatrac.unobserve(unos.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  elementi.forEach((element) => promatrac.observe(element));
}
