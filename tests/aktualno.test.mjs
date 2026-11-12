import test from 'node:test';
import assert from 'node:assert/strict';
import { jeLiAktualno } from '../site/js/aktualno.js';

const danas = new Date(2026, 11, 14, 15, 30); // 14. 12. 2026. u 15:30, lokalno vrijeme
const zapis = { naslov: 'Advent na konjima', prikazuj_do: '2026-12-14' };

test('jeLiAktualno: prikazuje se do kraja zadanog dana', () => {
  assert.equal(jeLiAktualno(zapis, danas), true);
  assert.equal(jeLiAktualno({ ...zapis, prikazuj_do: '2026-12-31' }, danas), true);
});
test('jeLiAktualno: ne prikazuje se nakon zadanog dana', () => {
  assert.equal(jeLiAktualno({ ...zapis, prikazuj_do: '2026-12-13' }, danas), false);
});
test('jeLiAktualno: ne prikazuje se bez obaveznih polja', () => {
  assert.equal(jeLiAktualno({ prikazuj_do: '2026-12-31' }, danas), false);
  assert.equal(jeLiAktualno({ naslov: '   ', prikazuj_do: '2026-12-31' }, danas), false);
  assert.equal(jeLiAktualno({ naslov: 'Advent' }, danas), false);
  assert.equal(jeLiAktualno({}, danas), false);
  assert.equal(jeLiAktualno(null, danas), false);
  assert.equal(jeLiAktualno('tekst', danas), false);
});
test('jeLiAktualno: ne prikazuje se uz neispravan datum', () => {
  assert.equal(jeLiAktualno({ ...zapis, prikazuj_do: '31.12.2026.' }, danas), false);
  assert.equal(jeLiAktualno({ ...zapis, prikazuj_do: '2026-13-40' }, danas), false);
});
