"""Fotografije s obiteljskog dana: lica koja se ne smiju vidjeti blago se zamute.

Ulaz i izlaz su u izvori/ (nije u gitu):
  obiteljski-dan/poni.jpg           -> poni-anonimno.jpg      (dijete na poniju i posjetiteljica u zelenoj majici)
  obiteljski-dan/vodenje-konja.jpg  -> vodenje-anonimno.jpg   (dječak na konju)
  slike/hipoterapija.jpg            -> hipoterapija-anonimno.jpg (dječak na konju)

Fotografije se prikazuju cijele; ostale (oslikavanje, pas) idu bez izmjena.
Odluke naručitelja od 18. 11. 2026.

Pokretanje:  python3 alati/obiteljski-dan.py
"""

from pathlib import Path

import cv2
import numpy as np

MAPA = Path(__file__).resolve().parent.parent / "izvori"

# Elipse oko lica (središte x, y i poluosi) u pikselima izvorne fotografije, te jačina zamućenja.
POSLOVI = {
    "obiteljski-dan/poni.jpg": ("obiteljski-dan/poni-anonimno.jpg", 9, [(1302, 781, 34, 40), (1598, 788, 38, 46)]),
    "obiteljski-dan/vodenje-konja.jpg": ("obiteljski-dan/vodenje-anonimno.jpg", 14, [(1110, 738, 78, 84)]),
    # Hipoterapija (početna): lice dječaka na konju.
    "slike/hipoterapija.jpg": ("slike/hipoterapija-anonimno.jpg", 12, [(620, 466, 52, 60)]),
    # Hipoterapija (početna, 19. 11. 2026.): lice korisnice na konju; članice u bordo majicama ostaju.
    "hipoterapija/pocetna-krava.jpg": ("hipoterapija/pocetna-krava-anonimno.jpg", 12, [(893, 262, 40, 52)]),
    # Aktivnosti (početna, 19. 11. 2026.): profil djevojčice na poniju.
    "aktivnosti/poni-cunj.jpg": ("aktivnosti/poni-cunj-anonimno.jpg", 10, [(866, 640, 36, 48)]),
    # Izgradnja ranča (O nama): registarska tablica vozila.
    "slike/ranc-nadstresnica.jpg": ("slike/ranc-nadstresnica-anonimno.jpg", 24, [(446, 1475, 44, 34)], 6),
}

for ulaz, (izlaz, jacina, lica, *rub) in POSLOVI.items():
    slika = cv2.imread(str(MAPA / ulaz))
    mutno = cv2.GaussianBlur(slika, (0, 0), jacina)
    maska = np.zeros(slika.shape[:2], dtype=np.float32)
    for x, y, rx, ry in lica:
        cv2.ellipse(maska, (x, y), (rx, ry), 0, 0, 360, 1.0, -1)
    # Mekani rub, da se zamućenje ne vidi kao mrlja.
    # Mekoća ruba; zadano jednaka jačini zamućenja, a za male površine (tablica) zadaje se zasebno.
    maska = cv2.GaussianBlur(maska, (0, 0), rub[0] if rub else jacina)[..., None]
    rezultat = (slika * (1 - maska) + mutno * maska).astype(np.uint8)
    cv2.imwrite(str(MAPA / izlaz), rezultat, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print(izlaz)
