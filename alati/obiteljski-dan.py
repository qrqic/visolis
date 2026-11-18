"""Fotografije s obiteljskog dana: lica koja se ne smiju vidjeti blago se zamute.

Ulaz: izvori/obiteljski-dan/poni.jpg (izvorna fotografija, nije u gitu).
Izlaz: izvori/obiteljski-dan/poni-anonimno.jpg

Zamućuju se lice djeteta na poniju i lice odrasle osobe u zelenoj majici.
Cura u bordo majici koja vodi ponija smije se vidjeti (potvrda naručitelja, 18. 11. 2026.).
Ostale fotografije s obiteljskog dana samo se režu (alati/obradi-slike.mjs), tako da lica nisu u kadru.

Pokretanje:  python3 alati/obiteljski-dan.py
"""

from pathlib import Path

import cv2
import numpy as np

MAPA = Path(__file__).resolve().parent.parent / "izvori" / "obiteljski-dan"

# Elipse oko lica (središte x, y i poluosi) u pikselima izvorne fotografije 2576 x 1717.
LICA = [
    (1302, 781, 34, 40),  # dijete na poniju
    (1598, 788, 38, 46),  # odrasla osoba u zelenoj majici
]

slika = cv2.imread(str(MAPA / "poni.jpg"))
mutno = cv2.GaussianBlur(slika, (0, 0), 9)
maska = np.zeros(slika.shape[:2], dtype=np.float32)
for x, y, rx, ry in LICA:
    cv2.ellipse(maska, (x, y), (rx, ry), 0, 0, 360, 1.0, -1)
# Mekani rub, da se zamućenje ne vidi kao mrlja.
maska = cv2.GaussianBlur(maska, (0, 0), 8)[..., None]
izlaz = (slika * (1 - maska) + mutno * maska).astype(np.uint8)
cv2.imwrite(str(MAPA / "poni-anonimno.jpg"), izlaz, [cv2.IMWRITE_JPEG_QUALITY, 94])
print("poni-anonimno.jpg")
