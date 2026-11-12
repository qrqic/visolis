# Higgsfield: što je generirano i koliko je koštalo

Stanje 12. 11. 2026. Cijene su iz provjere prije pokretanja (`get_cost`).

| Što | Model i postavke | Krediti | Ishod |
|---|---|---|---|
| Čista slika konja, 2 inačice | GPT Image 2.6, kvaliteta high, 2k, 16:9, predložak `DSC0112.jpg` | 5,5 | Odabrana prva (posao `11575f2b-492a-40cf-8d2d-beef77dfe75b`) |
| Video hoda, 6 s | Seedance 2.5, 1080p | 0 | Odbijeno: traži plan Plus |
| Video hoda, 6 s | Kling 3.0, način pro | 0 | Odbijeno: traži plan Plus |
| Video hoda, 6 s | Kling 3.0, način std, bez zvuka | 9 | Korišten (posao `ef1a54ad-eae1-49e7-8abc-cb2cf1316b59`), 1276 × 720, 24 sličice u sekundi |

Ukupno potrošeno: 14,5 kredita.

**Napomena:** animacija hoda je 12. 11. 2026. izbačena sa stranice na zahtjev naručitelja; hero je sada velika fotografija. Video ostaje u `izvori/higgsfield/`, a kod animacije i skripta za rezanje sličica u povijesti gita (commit `a22e89f`).

## Upit za sliku

> Using the reference photo, show the exact same horse alone: the same light chestnut Haflinger-type horse with the same long flaxen mane, forelock and tail, same white blaze on the face, same build and proportions. Remove the rider, the saddle, the saddle pad, the bridle, the reins and the leg wraps completely, so the horse is bare. Strict side view, horse facing right, whole body in frame with generous margin, captured mid-stride in a calm natural walk with all four legs clearly separated and visible. Place the horse in the right two thirds of the frame, leaving the left third empty. Pure seamless white studio background (#FFFFFF), no horizon, no grass, no scenery, only a very soft faint contact shadow under the hooves. Soft even natural daylight, true-to-life coat colour, razor sharp, photorealistic professional equine photography.

## Upit za video (početna sličica: odabrana slika)

> Locked-off static camera, strict side view. Starting from this exact frame, the horse walks calmly in place at a slow, steady, natural four-beat walk, as if on an invisible treadmill: it stays at exactly the same position and the same size in the frame the whole time while its legs step in a correct, realistic walking gait with clear footfalls. Its head nods gently with each stride, the flaxen mane and tail sway softly. Pure seamless white background throughout, only a soft contact shadow under the hooves. No camera movement, no zoom, no pan, no cuts, no change of lighting or exposure. The horse stays bare the whole time: no rider, no saddle, no bridle, no people. Soft even daylight. Photorealistic, razor sharp, no text. The final frame returns to a pose close to the starting frame.
