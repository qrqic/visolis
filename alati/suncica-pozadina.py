"""Sunčica na konju (tim, o-nama.html): blago zamućena pozadina, osoba i konj ostaju oštri.

Ulaz:  izvori/tim/suncica-konj.jpg         (fotografija od naručitelja, 19. 11. 2026.)
Izlaz: izvori/tim/suncica-konj-mutno.jpg   (izrez se radi u alati/obradi-slike.mjs)

Prednji plan određuje GrabCut iz grubih oznaka (lice, kosa, majica, konj).
Pokretanje:  python3 alati/suncica-pozadina.py
"""

from pathlib import Path

import cv2
import numpy as np

MAPA = Path(__file__).resolve().parent.parent / "izvori" / "tim"
slika = cv2.imread(str(MAPA / "suncica-konj.jpg"))
h, w = slika.shape[:2]

maska = np.full((h, w), cv2.GC_BGD, np.uint8)
# Moguće prednji plan: široko područje oko osobe i konja.
cv2.rectangle(maska, (0, 250), (830, h), cv2.GC_PR_FGD, -1)
cv2.ellipse(maska, (690, 400), (150, 170), 0, 0, 360, cv2.GC_PR_FGD, -1)
# Sigurno prednji plan: lice, kosa, majica, konj.
cv2.ellipse(maska, (695, 380), (48, 58), 0, 0, 360, cv2.GC_FGD, -1)
cv2.ellipse(maska, (700, 300), (60, 22), 0, 0, 360, cv2.GC_FGD, -1)
cv2.fillPoly(maska, [np.array([(560, 410), (720, 440), (740, 640), (650, 780), (470, 700), (460, 560)])], cv2.GC_FGD)
cv2.fillPoly(maska, [np.array([(150, 560), (330, 520), (420, 700), (430, h), (150, h)])], cv2.GC_FGD)
# Sigurno pozadina: nebo i krošnje iznad glave, desno od kose.
cv2.rectangle(maska, (0, 0), (w, 240), cv2.GC_BGD, -1)
cv2.rectangle(maska, (850, 0), (w, 780), cv2.GC_BGD, -1)

bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(slika, maska, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
prednji = np.where((maska == cv2.GC_FGD) | (maska == cv2.GC_PR_FGD), 1.0, 0.0).astype(np.float32)
prednji = cv2.morphologyEx(prednji, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
prednji = cv2.GaussianBlur(prednji, (0, 0), 3)[..., None]

mutno = cv2.GaussianBlur(slika, (0, 0), 7)
rezultat = (slika * prednji + mutno * (1 - prednji)).astype(np.uint8)
cv2.imwrite(str(MAPA / "suncica-konj-mutno.jpg"), rezultat, [cv2.IMWRITE_JPEG_QUALITY, 94])
cv2.imwrite(str(MAPA / "suncica-konj-maska.png"), (prednji[..., 0] * 255).astype(np.uint8))
