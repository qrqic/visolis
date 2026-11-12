import test from 'node:test';
import assert from 'node:assert/strict';
import { najblizaUcitana } from '../site/js/ucitavanje.js';

test('najblizaUcitana: tražena je učitana', () => {
  assert.equal(najblizaUcitana(2, [true, true, true]), 2);
});
test('najblizaUcitana: bira bližeg susjeda', () => {
  assert.equal(najblizaUcitana(4, [true, false, false, false, false, true]), 5);
  assert.equal(najblizaUcitana(1, [true, false, false, false, false, true]), 0);
});
test('najblizaUcitana: pri istoj udaljenosti bira nižu', () => {
  assert.equal(najblizaUcitana(2, [false, true, false, true, false]), 1);
});
test('najblizaUcitana: -1 kad nijedna nije učitana', () => {
  assert.equal(najblizaUcitana(1, [false, false, false]), -1);
  assert.equal(najblizaUcitana(0, []), -1);
});
