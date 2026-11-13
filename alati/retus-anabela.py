# Retuš fotografije ponija Anabele za hero.
#
# Pokretanje:  python3 alati/retus-anabela.py izvori/anabela-viedo.jpg izvori/anabela-izrez.png
# Treba Python s paketima opencv-python i numpy.
#
# Izvorna fotografija prikazuje i dijete koje vodi ponija. Skripta izrezuje samo ponija
# (560 x 647 px, omjer šesterokuta) i uklanja djetetovu ruku i uže koji ulaze u izrez:
# trava i dlaka iza ruke dopunjene su iz okolnih boja, duž obrisa ponija.
# Rezultat dalje obrađuje alati/obradi-slike.mjs.
import cv2, numpy as np, sys

src = cv2.imread(sys.argv[1])
izlaz = sys.argv[2]
L, T, W, H = 600, 60, 560, 647            # izrez u izvornoj fotografiji
crop = src[T:T+H, L:L+W].copy()

def poly(tocke):
    return np.array([[x - L, y - T] for x, y in tocke], np.int32)

# 1. Maska: rukav, ruka i omča užeta (izvorne koordinate).
mrlja = np.zeros(crop.shape[:2], np.uint8)
for p in [
    [(600,346),(620,351),(642,375),(646,392),(632,411),(600,420)],
    [(600,398),(628,376),(663,379),(688,401),(691,428),(682,446),(656,457),(649,464),(626,464),(600,457)],
    [(600,446),(631,449),(636,470),(629,498),(600,502)],
]:
    cv2.fillPoly(mrlja, [poly(p)], 255)
mrlja = cv2.dilate(mrlja, np.ones((5, 5), np.uint8))

uze = np.zeros(crop.shape[:2], np.uint8)
cv2.line(uze, (626 - L, 444 - T), (687 - L, 494 - T), 255, 23)
uze = cv2.dilate(uze, np.ones((3, 3), np.uint8))

# 2. Obris ponija koji je ruka zaklanjala: od ruba kadra do korijena uha.
obris = [(6, 482), (37, 410), (90, 320)]   # (x, y) u koordinatama izreza
def x_obrisa(y):
    (x0, y0), (x1, y1), (x2, y2) = obris
    if y >= y1:
        return x1 + (y - y1) * (x0 - x1) / (y0 - y1)
    return x1 + (y - y1) * (x2 - x1) / (y2 - y1)

rez = crop.astype(np.float32)
ys, xs = np.nonzero(mrlja)
strana = np.zeros(crop.shape[:2], np.uint8)       # 1 = trava, 2 = dlaka
for y, x in zip(ys, xs):
    strana[y, x] = 1 if x < x_obrisa(y) else 2

def uzorak(y0, y1, x0, x1):
    dio = crop[max(y0, 0):y1, max(x0, 0):x1].reshape(-1, 3)
    return np.median(dio, axis=0)

# Trava: mekani prijelaz od boje livade do boje trave, a uz gornji i donji rub mrlje
# preuzima se boja stvarne pozadine iznad odnosno ispod (izglađena po širini, bez pruga).
livada = uzorak(298, 310, 40, 78)
trava = uzorak(446, 470, 2, 14)
gore_y, dolje_y = 286, 446
stupci = np.arange(W)
iznad = np.tile(livada, (W, 1)).astype(np.float32)
ispod = np.tile(trava, (W, 1)).astype(np.float32)
vrh = np.full(W, -1); dno = np.full(W, -1); dno_je_trava = np.zeros(W, bool)
for x in np.unique(xs):
    stupac = np.nonzero(strana[:, x] == 1)[0]
    if len(stupac) == 0:
        continue
    vrh[x], dno[x] = stupac.min(), stupac.max()
    iznad[x] = uzorak(vrh[x] - 9, vrh[x] - 2, x - 3, x + 4)
    if dno[x] + 3 < H and not mrlja[dno[x] + 3, x] and x < x_obrisa(dno[x] + 3):
        dno_je_trava[x] = True
        ispod[x] = uzorak(dno[x] + 3, dno[x] + 10, x - 3, x + 4)
iznad = cv2.GaussianBlur(iznad.reshape(1, W, 3), (0, 0), 5).reshape(W, 3)
ispod = cv2.GaussianBlur(ispod.reshape(1, W, 3), (0, 0), 5).reshape(W, 3)
for y, x in zip(ys, xs):
    if strana[y, x] != 1:
        continue
    t = min(max((y - gore_y) / (dolje_y - gore_y), 0), 1)
    osnova = livada * (1 - t) + trava * t
    u_gore = np.exp(-(y - vrh[x]) / 14)
    u_dolje = np.exp(-(dno[x] - y) / 14) if dno_je_trava[x] else 0.0
    ostatak = max(1 - u_gore - u_dolje, 0)
    rez[y, x] = (iznad[x] * u_gore + ispod[x] * u_dolje + osnova * ostatak) / (u_gore + u_dolje + ostatak)

# Blage neravnine boje, da trava ne bude ravna ploha.
valovi = cv2.GaussianBlur(np.random.default_rng(3).normal(0, 1, (H, W)).astype(np.float32), (0, 0), 7)
valovi = valovi / np.abs(valovi).max() * 9
rez[strana == 1] += valovi[strana == 1][:, None] * np.array([0.5, 1.0, 0.8], np.float32)

# Dlaka: po redovima, boja prvih nezaklonjenih točaka desno od mrlje (uže se preskače).
for y in np.unique(ys):
    red = np.nonzero(strana[y] == 2)[0]
    if len(red) == 0:
        continue
    x = red.max() + 3
    cisto = []
    while x < W and len(cisto) < 8:
        if not uze[y, x] and not mrlja[y, x]:
            cisto.append(crop[y, x])
        x += 1
    rez[y, red] = np.median(np.array(cisto), axis=0)

# Mekani rub dlake duž obrisa, u boji postojećeg ruba iznad mrlje.
boja_ruba = uzorak(322, 332, 82, 92)
for y in np.unique(ys):
    xo = x_obrisa(y)
    for x in range(int(xo) - 7, int(xo) + 8):
        if 0 <= x < W and mrlja[y, x]:
            jakost = 0.6 * np.exp(-((x - xo) ** 2) / (2 * 2.5 ** 2))
            rez[y, x] = rez[y, x] * (1 - jakost) + boja_ruba * jakost

# Omekšavanje unutar mrlje i na njezinu rubu.
mutno = cv2.GaussianBlur(rez, (0, 0), 2.2)
pero = cv2.GaussianBlur(cv2.dilate(mrlja, np.ones((5, 5), np.uint8)), (0, 0), 2.5).astype(np.float32)[..., None] / 255
rez = rez * (1 - pero) + mutno * pero
rez = np.clip(rez, 0, 255).astype(np.uint8)

# 3. Uže od ruke do čvora: tanka crta preko dlake.
rez = cv2.inpaint(rez, uze, 7, cv2.INPAINT_TELEA)

# 4. Zrno, da se popravljeni dio ne razlikuje od ostatka fotografije.
sve = cv2.GaussianBlur(cv2.max(mrlja, uze), (0, 0), 2).astype(np.float32)[..., None] / 255
zrno = np.random.default_rng(7).normal(0, 3.5, rez.shape).astype(np.float32)
rez = np.clip(rez.astype(np.float32) + zrno * sve, 0, 255).astype(np.uint8)

cv2.imwrite(izlaz, rez)
if len(sys.argv) > 3:
    usp = np.hstack([cv2.resize(x[250:500, 0:200], None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC) for x in (crop, rez)])
    cv2.imwrite(sys.argv[3], usp)
print('izrez', rez.shape[1], 'x', rez.shape[0])
