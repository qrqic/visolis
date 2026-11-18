"""Fotografije s obiteljskog dana: lica koja se ne smiju vidjeti blago se zamute.

Ulaz i izlaz su u izvori/obiteljski-dan/ (nije u gitu):
  poni.jpg           -> poni-anonimno.jpg      (dijete na poniju i posjetiteljica u zelenoj majici)
  vodenje-konja.jpg  -> vodenje-anonimno.jpg   (dječak na konju)

Fotografije se prikazuju cijele; ostale (oslikavanje, pas) idu bez izmjena.
Odluke naručitelja od 18. 11. 2026.

Pokretanje:  python3 alati/obiteljski-dan.py
"""

from pathlib import Path

import cv2
import numpy as np

MAPA = Path(__file__).resolve().parent.parent / "izvori" / "obiteljski-dan"

# Elipse oko lica (središte x, y i poluosi) u pikselima izvorne fotografije, te jačina zamućenja.
POSLOVI = {
    "poni.jpg": ("poni-anonimno.jpg", 9, [(1302, 781, 34, 40), (1598, 788, 38, 46)]),
    "vodenje-konja.jpg": ("vodenje-anonimno.jpg", 14, [(1110, 738, 78, 84)]),
}

for ulaz, (izlaz, jacina, lica) in POSLOVI.items():
    slika = cv2.imread(str(MAPA / ulaz))
    mutno = cv2.GaussianBlur(slika, (0, 0), jacina)
    maska = np.zeros(slika.shape[:2], dtype=np.float32)
    for x, y, rx, ry in lica:
        cv2.ellipse(maska, (x, y), (rx, ry), 0, 0, 360, 1.0, -1)
    # Mekani rub, da se zamućenje ne vidi kao mrlja.
    maska = cv2.GaussianBlur(maska, (0, 0), jacina)[..., None]
    rezultat = (slika * (1 - maska) + mutno * maska).astype(np.uint8)
    cv2.imwrite(str(MAPA / izlaz), rezultat, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print(izlaz)
