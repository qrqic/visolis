<?php
// Prima upit iz obrasca (js/obrazac.js) i šalje ga e-mailom udruzi.
// Radi na hostingu udrugavissolis.hr (PHP); na GitHub Pages ne radi, ondje obrazac
// pokaže poruku s brojem telefona.
//
// Odgovor je uvijek JSON: {"success": true} ili {"success": false, "message": "..."}.

declare(strict_types=1);

const PRIMATELJ = 'udrugavissolis@gmail.com';
const POSILJATELJ = 'noreply@udrugavissolis.hr';
const NASLOV = 'Novi upit s web stranice Vis Solis';
// Najviše upita s iste adrese u zadanom razdoblju (zaštita od zatrpavanja).
const NAJVISE_UPITA = 5;
const RAZDOBLJE_SEKUNDI = 600;

date_default_timezone_set('Europe/Zagreb');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function odgovori(int $status, bool $uspjeh, string $poruka = ''): void
{
    http_response_code($status);
    echo json_encode($uspjeh ? ['success' => true] : ['success' => false, 'message' => $poruka], JSON_UNESCAPED_UNICODE);
    exit;
}

function tekst($vrijednost, int $najvise, bool $jedanRed = true): string
{
    $t = is_string($vrijednost) ? trim($vrijednost) : '';
    if ($jedanRed) {
        $t = preg_replace('/\s+/u', ' ', $t) ?? '';
    }
    $t = preg_replace('/[^\P{C}\n\t]/u', '', $t) ?? '';
    return mb_substr($t, 0, $najvise);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    odgovori(405, false, 'Dopušteno je samo slanje obrasca.');
}

// Obrazac šalje JSON; obično slanje obrasca (bez JavaScripta) također je podržano.
$sirovo = file_get_contents('php://input') ?: '';
$podaci = json_decode($sirovo, true);
if (!is_array($podaci)) {
    $podaci = $_POST;
}

// Skriveno polje "web" ispunjavaju samo automati: tiho "uspjeh", bez slanja.
if (tekst($podaci['web'] ?? '', 200) !== '') {
    odgovori(200, true);
}

$ime = tekst($podaci['ime'] ?? '', 200);
$kontakt = tekst($podaci['kontakt'] ?? '', 200);
$program = tekst($podaci['program'] ?? '', 100);
$poruka = tekst($podaci['poruka'] ?? '', 5000, false);
$privola = ($podaci['privola'] ?? '') === 'da';

$jeEmail = (bool) filter_var($kontakt, FILTER_VALIDATE_EMAIL);
$jeTelefon = preg_match('/^[\d\s+()\/-]+$/', $kontakt) === 1 && strlen(preg_replace('/\D/', '', $kontakt) ?? '') >= 6;

if ($ime === '' || (!$jeEmail && !$jeTelefon) || !$privola) {
    odgovori(400, false, 'Nedostaje ime, kontakt ili privola.');
}

// Jednostavno ograničenje broja upita po adresi (IP se ne sprema, samo njegov sažetak).
$datoteka = sys_get_temp_dir() . '/vissolis-upiti.json';
$sada = time();
$kljuc = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$zapis = [];
if (is_readable($datoteka)) {
    $zapis = json_decode((string) file_get_contents($datoteka), true) ?: [];
}
foreach ($zapis as $k => $vremena) {
    $zapis[$k] = array_values(array_filter((array) $vremena, fn ($v) => $v > $sada - RAZDOBLJE_SEKUNDI));
    if (!$zapis[$k]) {
        unset($zapis[$k]);
    }
}
if (count($zapis[$kljuc] ?? []) >= NAJVISE_UPITA) {
    odgovori(429, false, 'Previše upita u kratkom vremenu. Pokušajte malo kasnije.');
}
$zapis[$kljuc][] = $sada;
@file_put_contents($datoteka, json_encode($zapis), LOCK_EX);

$tijelo = "Novi upit s web stranice udrugavissolis.hr\n\n"
    . "Ime i prezime: {$ime}\n"
    . "Telefon ili e-mail: {$kontakt}\n"
    . 'Što ga zanima: ' . ($program !== '' ? $program : 'Još ne zna') . "\n"
    . "Privola za obradu podataka: da\n"
    . 'Poslano: ' . date('d. m. Y. H:i') . "\n\n"
    . "Poruka:\n" . ($poruka !== '' ? $poruka : '(bez poruke)') . "\n";

$zaglavlja = [
    'From' => 'Vis Solis web <' . POSILJATELJ . '>',
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
];
// Odgovor iz Gmaila ide izravno posjetitelju, ako je upisao e-mail.
// filter_var već odbija prijelome reda, pa nema umetanja zaglavlja.
if ($jeEmail) {
    $zaglavlja['Reply-To'] = $kontakt;
}

$naslov = '=?UTF-8?B?' . base64_encode(NASLOV . ': ' . $ime) . '?=';
$poslano = mail(PRIMATELJ, $naslov, $tijelo, $zaglavlja, '-f' . POSILJATELJ);

if (!$poslano) {
    odgovori(500, false, 'Poslužitelj nije uspio poslati e-mail.');
}
odgovori(200, true);
