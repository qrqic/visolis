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

## Slika Anabele za hero (14. 11. 2026.)

Hero na početnoj je slika generirana na Higgsfieldu prema fotografiji ponija Anabele. Nije fotografija.

| Što | Model i postavke | Krediti | Ishod |
|---|---|---|---|
| Anabela bez djeteta, poluprofil, 2 inačice | GPT Image 2.6, kvaliteta high, 2k, 8:9, predložak `izvori/anabela-predlozak.png` | 5,5 | Poslovi `7efdbbf7-aed0-4a55-9fca-329556b6f919` i `c18e6694-a11e-419b-a8f8-66e4aa0a5d11` |
| Proširenje obje inačice na 21:9 | Outpaint | 4 | Odabrana druga (posao `4bd4298f-dc48-43b7-a6ec-a7cce4419349`), 3168 × 1344, spremljena kao `izvori/higgsfield/anabela-hero.png` |

Predložak je izrez izvorne fotografije bez djeteta (`alati/retus-anabela.py`), da djetetova slika ne ode na Higgsfield.

Upit za sliku:

> Using the reference photo, show the exact same pony alone: the same small Shetland-type pony with the same chestnut-and-white pinto coat (chestnut head, neck and chest, large white patches on the shoulders and flanks), the same thick, long, wind-blown flaxen-orange mane and forelock, the same small white star on the forehead, and the same dark navy rope halter with a woven pink-and-turquoise noseband. No lead rope, no people, no hands, no rider, nothing attached to the halter. Change the angle slightly: a three-quarter view, the pony's body turned about 30 degrees to the side while its head and eyes look towards the camera, both eyes visible, ears pricked. The pony walks calmly through the same tall bright green spring meadow with a few blades of grass in its mouth, warm sunny backlight, softly blurred dark green forest in the background. Compose with the pony's head and chest centred and generous empty margin on all sides, nothing cut off at the frame edges. Photorealistic telephoto photograph, shallow depth of field, razor-sharp eyes and coat, natural true-to-life colours, no text, no watermark.

Ukupno potrošeno do sada: 24 kredita.


## Portreti tima (17. 11. 2026.)

Model `gpt_image_2_6`, 1:1, 0,25 kredita po slici. Predlošci: grupna fotografija (media `52107905-a252-4467-9f6a-c131d021457a`) i Josipina fotografija (media `97cb0a1d-e03a-4f65-9d24-2fee012216f4`). Upute: ista cura, sama, do struka, ista crvena majica s logom, pozadina s rascvjetanim drvećem kao na grupnoj fotografiji, bez mijenjanja lica.

| Cura | Posao |
| --- | --- |
| Viktorija | `5e0de0a2-ffa3-4524-b24a-862a92d5e293` |
| Sunčica | `ca81b9ff-8fd2-4e8f-8104-ab7cb697ff24` |
| Gabrijela | `a62d5ae0-4ddd-4195-abf3-291a4998a762` |
| Lorena | `282ae16f-7da0-4947-81e0-7f99a89097a4` |
| Josipa | `cfadde47-75f4-419c-9aa8-bb4d0a016e24` |
