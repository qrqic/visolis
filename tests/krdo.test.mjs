import test from 'node:test';
import assert from 'node:assert/strict';
import { novaTezina, jeLiIspravanKonj } from '../site/js/krdo.js';

test('novaTezina: dok se red pomiče, raste prema 1', () => {
  const nakon = novaTezina(0, true, 16);
  assert.ok(nakon > 0 && nakon < 1);
  assert.ok(novaTezina(nakon, true, 16) > nakon);
  assert.ok(novaTezina(0, true, 5000) > 0.99);
});
test('novaTezina: kad red stane, pada prema 0 i ne prelazi granice', () => {
  const nakon = novaTezina(1, false, 16);
  assert.ok(nakon < 1 && nakon > 0);
  assert.ok(novaTezina(1, false, 5000) < 0.01);
  assert.ok(novaTezina(0, false, 16) >= 0);
  assert.ok(novaTezina(1, true, 16) <= 1);
});

test('jeLiIspravanKonj: treba ime i dvije boje', () => {
  assert.equal(jeLiIspravanKonj({ ime: 'Anabela', dlaka: '#a8572a', griva: '#dd9a4e' }), true);
  assert.equal(jeLiIspravanKonj({ ime: 'Anabela', dlaka: '#a8572a' }), false);
  assert.equal(jeLiIspravanKonj({ ime: ' ', dlaka: '#a8572a', griva: '#dd9a4e' }), false);
  assert.equal(jeLiIspravanKonj({ ime: 'Anabela', dlaka: 'crvena', griva: '#dd9a4e' }), false);
  assert.equal(jeLiIspravanKonj(null), false);
});
