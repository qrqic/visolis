import test from 'node:test';
import assert from 'node:assert/strict';
import { provjeriUnos, jeLiNezeljeno } from '../site/js/obrazac.js';

const dobar = { ime: 'Ana Anić', kontakt: 'ana@example.com', privola: true };

test('provjeriUnos: ispravan unos s e-mailom', () => {
  assert.deepEqual(provjeriUnos(dobar), { ispravno: true, greske: {} });
});
test('provjeriUnos: ispravan unos s telefonom', () => {
  assert.equal(provjeriUnos({ ...dobar, kontakt: '095 555 4789' }).ispravno, true);
  assert.equal(provjeriUnos({ ...dobar, kontakt: '+385 (95) 555-4789' }).ispravno, true);
});
test('provjeriUnos: prazno ime', () => {
  const ishod = provjeriUnos({ ...dobar, ime: '  ' });
  assert.equal(ishod.ispravno, false);
  assert.ok(ishod.greske.ime);
});
test('provjeriUnos: kontakt koji nije ni telefon ni e-mail', () => {
  for (const kontakt of ['abc', '', '12345', 'ana@', undefined]) {
    const ishod = provjeriUnos({ ...dobar, kontakt });
    assert.equal(ishod.ispravno, false, String(kontakt));
    assert.ok(ishod.greske.kontakt);
  }
});
test('provjeriUnos: bez privole', () => {
  const ishod = provjeriUnos({ ...dobar, privola: false });
  assert.equal(ishod.ispravno, false);
  assert.ok(ishod.greske.privola);
});
test('provjeriUnos: javlja sve greške odjednom', () => {
  assert.deepEqual(Object.keys(provjeriUnos({}).greske).sort(), ['ime', 'kontakt', 'privola']);
});
test('jeLiNezeljeno: ispunjeno skriveno polje', () => {
  assert.equal(jeLiNezeljeno({ web: 'http://spam.example' }), true);
  assert.equal(jeLiNezeljeno({ web: '' }), false);
  assert.equal(jeLiNezeljeno({}), false);
});
