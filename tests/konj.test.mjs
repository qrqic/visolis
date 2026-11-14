import test from 'node:test';
import assert from 'node:assert/strict';
import { OBLICI, rijesiNogu, kopitoUTrku, fazaNakonPomaka, poza } from '../site/js/konj-kretanje.js';

const udaljenost = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const blizu = (a, b, dopusteno = 0.01) => assert.ok(Math.abs(a - b) <= dopusteno, `${a} nije blizu ${b}`);

test('rijesiNogu: koljeno je na udaljenosti prvog segmenta od zgloba i drugog od kopita', () => {
  const zglob = { x: 100, y: 50 };
  const cilj = { x: 110, y: 100 };
  const { koljeno, kopito } = rijesiNogu(zglob, cilj, 30, 31, 1);
  blizu(udaljenost(zglob, koljeno), 30);
  blizu(udaljenost(koljeno, kopito), 31);
  assert.deepEqual(kopito, cilj);
});
test('rijesiNogu: smjer određuje savija li se koljeno naprijed ili natrag', () => {
  const zglob = { x: 100, y: 50 };
  const cilj = { x: 100, y: 100 };
  assert.ok(rijesiNogu(zglob, cilj, 30, 31, 1).koljeno.x > 100);
  assert.ok(rijesiNogu(zglob, cilj, 30, 31, -1).koljeno.x < 100);
});
test('rijesiNogu: nedostižan cilj se skraćuje na doseg noge', () => {
  const zglob = { x: 0, y: 0 };
  const { koljeno, kopito } = rijesiNogu(zglob, { x: 0, y: 500 }, 30, 31, 1);
  assert.ok(udaljenost(zglob, kopito) <= 61);
  blizu(udaljenost(zglob, koljeno), 30);
  blizu(udaljenost(koljeno, kopito), 31);
});

test('kopitoUTrku: u osloncu je kopito na tlu i ide od naprijed prema natrag', () => {
  const korak = { naprijed: 26, natrag: 20, podizanje: 24, udioOslonca: 0.28 };
  assert.deepEqual(kopitoUTrku(0, korak), { x: 26, y: 0 });
  const kraj = kopitoUTrku(0.2799, korak);
  blizu(kraj.x, -20, 0.1);
  assert.equal(kraj.y, 0);
});
test('kopitoUTrku: u zamahu je kopito podignuto i vraća se naprijed', () => {
  const korak = { naprijed: 26, natrag: 20, podizanje: 24, udioOslonca: 0.28 };
  const sredina = kopitoUTrku(0.64, korak);
  assert.ok(sredina.y <= -0.9 * 24, `kopito je na ${sredina.y}`);
  const predKraj = kopitoUTrku(0.9999, korak);
  blizu(predKraj.x, 26, 0.1);
  blizu(predKraj.y, 0, 0.1);
});

test('fazaNakonPomaka: pola ciklusa za pola duljine, u oba smjera, uz prelazak preko 1', () => {
  blizu(fazaNakonPomaka(0, 82, 164), 0.5);
  blizu(fazaNakonPomaka(0, -82, 164), 0.5);
  blizu(fazaNakonPomaka(0.75, 82, 164), 0.25);
});

for (const [naziv, oblik] of Object.entries(OBLICI)) {
  test(`poza (${naziv}): u mirovanju su sva četiri kopita na tlu, a trup je ravan`, () => {
    const p = poza(0.37, 0, oblik);
    assert.equal(p.noge.length, 4);
    for (const noga of p.noge) blizu(noga.kopito.y, oblik.tlo - oblik.visinaKopita, 0.01);
    assert.equal(p.trup.nagib, 0);
    assert.equal(p.trup.pomakY, 0);
  });
  test(`poza (${naziv}): u trku nijedno kopito ne ide ispod tla i segmenti zadržavaju duljinu`, () => {
    for (let korak = 0; korak < 40; korak++) {
      const p = poza(korak / 40, 1, oblik);
      for (const noga of p.noge) {
        assert.ok(noga.kopito.y <= oblik.tlo - oblik.visinaKopita + 0.01, `${noga.ime} @${korak / 40}: ${noga.kopito.y}`);
        const mjere = noga.prednja ? oblik.prednja : oblik.straznja;
        blizu(udaljenost(noga.zglob, noga.koljeno), mjere.d1, 0.01);
        blizu(udaljenost(noga.koljeno, noga.kopito), mjere.d2, 0.01);
      }
    }
  });
  test(`poza (${naziv}): u trku postoji trenutak leta, kad nijedno kopito ne dira tlo`, () => {
    const tlo = oblik.tlo - oblik.visinaKopita;
    const letovi = Array.from({ length: 40 }, (_, k) => poza(k / 40, 1, oblik)).filter((p) => p.noge.every((n) => n.kopito.y < tlo - 1));
    assert.ok(letovi.length > 0);
  });
}
