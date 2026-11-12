import test from 'node:test';
import assert from 'node:assert/strict';
import { napredakSekcije, indeksSlicice, fazaNaslova } from '../site/js/hero.js';

test('napredakSekcije: 0 na početku sekcije', () => {
  assert.equal(napredakSekcije(0, 3000, 1000), 0);
});
test('napredakSekcije: 0,5 na pola puta', () => {
  assert.equal(napredakSekcije(-1000, 3000, 1000), 0.5);
});
test('napredakSekcije: 1 na kraju i nakon kraja', () => {
  assert.equal(napredakSekcije(-2000, 3000, 1000), 1);
  assert.equal(napredakSekcije(-5000, 3000, 1000), 1);
});
test('napredakSekcije: 0 dok sekcija još nije došla do vrha', () => {
  assert.equal(napredakSekcije(500, 3000, 1000), 0);
});
test('napredakSekcije: 0 kad sekcija nije viša od prozora', () => {
  assert.equal(napredakSekcije(-100, 800, 1000), 0);
});

test('indeksSlicice: krajevi i sredina', () => {
  assert.equal(indeksSlicice(0, 120), 0);
  assert.equal(indeksSlicice(0.5, 120), 60);
  assert.equal(indeksSlicice(1, 120), 119);
});
test('indeksSlicice: bez sličica vraća 0', () => {
  assert.equal(indeksSlicice(0.5, 0), 0);
});

test('fazaNaslova: tri faze uz dvije granice', () => {
  assert.equal(fazaNaslova(0.1, [0.33, 0.66]), 0);
  assert.equal(fazaNaslova(0.5, [0.33, 0.66]), 1);
  assert.equal(fazaNaslova(0.9, [0.33, 0.66]), 2);
});
