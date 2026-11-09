"""Monde « coupe de terrain » : maison, jardin, sol en coupe, piscine, nappe phréatique.

Tout est dessiné en Python (PIL + numpy) : aucun logiciel 3D, aucun asset externe.
Le monde est piloté par un *état* numérique (dig, shell, water, table, up, down,
lift, valve, flow) que l'épisode JSON fait évoluer beat par beat.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
G = 1000            # ligne de coupe (niveau du terrain, face avant)
LAWN_BACK = 720     # fond de la pelouse (pied de la maison)

# Palette (Maths au Cube : vert / bleu / orange)
ORANGE = (242, 140, 40)
GREEN = (43, 182, 115)
BLUE = (30, 111, 217)
WHITE = (255, 255, 255)
INK = (20, 22, 28)

# Profil de la piscine (coupe avant)
INNER = [(136, G), (944, G), (944, 1344), (660, 1344), (520, 1184), (136, 1184)]
OUTER = [(110, G), (970, G), (970, 1370), (668, 1370), (512, 1210), (110, 1210)]
# Ouverture vue du dessus (sur la pelouse, en perspective)
TOP_OPEN = [(136, G), (944, G), (880, G - 170), (200, G - 170)]
TOP_RIM = [(110, G), (970, G), (900, G - 186), (180, G - 186)]
VALVE_X = 800
UP_XS = [190, 340, 470, 600, 740, 880]


def _noise(h, w, scale, seed):
    rng = np.random.default_rng(seed)
    small = rng.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def _soil_texture(h, w, base, seed):
    n = 0.55 * _noise(h, w, 60, seed) + 0.3 * _noise(h, w, 14, seed + 1) + 0.15 * _noise(h, w, 3, seed + 2)
    # fissures verticales (aspect « terre tassée » de la référence)
    streak = _noise(h, w, 1, seed + 3)[:1, :].repeat(h, 0)
    streak = np.clip((streak - 0.82) * 6, 0, 1) * _noise(h, w, 40, seed + 4)
    shade = 0.72 + 0.42 * n - 0.35 * streak
    # strates horizontales légères
    rows = 0.04 * np.sin(np.arange(h)[:, None] / 23.0 + 3 * _noise(h, w, 80, seed + 5))
    shade = shade + rows
    rgb = np.clip(np.array(base, np.float32)[None, None, :] * shade[:, :, None], 0, 255)
    return Image.fromarray(rgb.astype(np.uint8), "RGB")


def _lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _mask(poly, dy=0, size=(W, H)):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon([(x, y + dy) for x, y in poly], fill=255)
    return m


def _arrow(d, x, y_tail, y_head, width, fill, outline, alpha=255):
    """Flèche verticale (tête en y_head)."""
    up = y_head < y_tail
    s = 1 if up else -1
    head = width * 1.9
    hl = width * 1.6
    shaft_end = y_head + s * hl
    pts = [
        (x - width / 2, y_tail), (x - width / 2, shaft_end), (x - head / 2, shaft_end),
        (x, y_head), (x + head / 2, shaft_end), (x + width / 2, shaft_end), (x + width / 2, y_tail)]
    d.polygon(pts, fill=fill + (alpha,), outline=outline + (alpha,), width=5)


class World:
    def __init__(self):
        self.static = self._build_static()
        self.wet = _soil_texture(H, W, (78, 120, 190), 11)
        self.wet = Image.blend(self.wet, Image.new("RGB", (W, H), (70, 130, 215)), 0.25)
        self.hole_tex = _soil_texture(H, W, (110, 66, 36), 21)
        self.concrete = _soil_texture(H, W, (205, 205, 200), 31)
        self.m_outer = _mask(OUTER)
        self.m_inner = _mask(INNER)
        shell = Image.new("L", (W, H), 0)
        shell.paste(self.m_outer)
        shell.paste(0, mask=self.m_inner)
        self.m_shell = shell

    # ---------- décor fixe ----------
    def _build_static(self):
        img = Image.new("RGB", (W, H))
        d = ImageDraw.Draw(img)
        # ciel
        for y in range(LAWN_BACK):
            d.line([(0, y), (W, y)], fill=_lerp((150, 190, 235), (232, 240, 248), y / LAWN_BACK))
        clouds = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        dc = ImageDraw.Draw(clouds)
        for cx, cy, r in [(160, 150, 70), (250, 130, 90), (340, 160, 60), (760, 90, 80), (860, 120, 100), (960, 100, 60)]:
            dc.ellipse([cx - r * 1.4, cy - r * 0.7, cx + r * 1.4, cy + r * 0.7], fill=(255, 255, 255, 210))
        img.paste(clouds.filter(ImageFilter.GaussianBlur(14)), (0, 0), clouds.filter(ImageFilter.GaussianBlur(14)))
        # arbres + maison voisine
        for cx, cy, r, col in [(70, 520, 150, (60, 110, 50)), (1010, 560, 130, (70, 120, 55)), (120, 600, 110, (75, 130, 60))]:
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
        d.rectangle([60, 560, 80, 720], fill=(90, 65, 45))
        d.rectangle([940, 560, 1080, 720], fill=(220, 210, 198))
        d.polygon([(930, 560), (1080, 560), (1080, 500), (960, 500)], fill=(196, 92, 62))
        # maison
        d.rectangle([180, 390, 900, 720], fill=(228, 218, 206))
        d.rectangle([760, 200, 805, 300], fill=(150, 80, 60))
        d.polygon([(150, 405), (930, 405), (850, 245), (230, 245)], fill=(198, 94, 62))
        for k in range(8):
            y = 245 + k * 20
            x0 = 230 - (y - 245) * 0.5
            d.line([(x0, y), (W - x0 - 0, y)], fill=(170, 75, 50), width=3)
        d.rectangle([150, 400, 930, 412], fill=(240, 236, 228))
        shutter = (36, 84, 150)
        glass = (150, 185, 215)
        for x in (250, 400, 600, 750):  # étage
            d.rectangle([x, 440, x + 80, 525], fill=glass, outline=WHITE, width=5)
            d.line([(x + 40, 440), (x + 40, 525)], fill=WHITE, width=4)
            d.rectangle([x - 30, 440, x - 4, 525], fill=shutter)
            d.rectangle([x + 84, 440, x + 110, 525], fill=shutter)
        for x in (250, 750):  # RDC
            d.rectangle([x, 580, x + 80, 670], fill=glass, outline=WHITE, width=5)
            d.rectangle([x - 30, 580, x - 4, 670], fill=shutter)
            d.rectangle([x + 84, 580, x + 110, 670], fill=shutter)
        d.rectangle([420, 560, 660, 720], fill=(95, 125, 160), outline=WHITE, width=7)
        d.line([(540, 560), (540, 720)], fill=WHITE, width=5)
        # terrasse
        d.polygon([(140, 720), (940, 720), (960, 760), (120, 760)], fill=(214, 196, 170))
        # pelouse rayée en perspective
        n = 9
        ys = [LAWN_BACK + (G - LAWN_BACK) * (i / n) ** 1.35 for i in range(n + 1)]
        for i in range(n):
            col = (92, 172, 62) if i % 2 else (112, 192, 76)
            d.rectangle([0, ys[i], W, ys[i + 1]], fill=col)
        d.polygon([(140, 720), (940, 720), (960, 760), (120, 760)], fill=(214, 196, 170))
        # tuyau d'arrosage
        pts = [(980, 790), (900, 820), (820, 800), (760, 840), (700, 830)]
        d.line(pts, fill=(40, 120, 60), width=6, joint="curve")
        # pots de fleurs
        for x in (200, 690, 880):
            d.polygon([(x, 700), (x + 30, 700), (x + 24, 735), (x + 6, 735)], fill=(190, 100, 60))
            d.ellipse([x - 8, 670, x + 38, 705], fill=(60, 140, 60))
        # sol en coupe
        img.paste(_soil_texture(H - G, W, (152, 98, 58), 1), (0, G))
        d.rectangle([0, G - 6, W, G + 4], fill=(70, 130, 50))
        d.line([(0, G + 4), (W, G + 4)], fill=(90, 55, 30), width=3)
        return img

    # ---------- rendu d'une image ----------
    def render(self, s, t):
        """s : état courant (dict de floats). t : temps global (s)."""
        img = self.static.copy()
        d = ImageDraw.Draw(img, "RGBA")
        dig, shell, water = s["dig"], s["shell"], s["water"]
        table, up, down = s["table"], s["up"], s["down"]
        lift, valve, flow = s["lift"], s["valve"], s["flow"]

        # nappe phréatique
        ty = int(1880 - table * (1880 - 1080))
        ty += int(6 * math.sin(t * 2.2))
        if ty < H:
            img.paste(self.wet.crop((0, ty, W, H)), (0, ty))
            d.line([(0, ty), (W, ty)], fill=(160, 210, 255, 220), width=4)

        dy = int(-lift * 170)
        if 0.02 < lift < 0.98:
            dy += int(7 * math.sin(t * 61))

        # trou d'excavation (avant la coque)
        if dig > 0:
            hole_mask = self.m_outer.point(lambda v: int(v * dig))
            img.paste(self.hole_tex, (0, 0), hole_mask)
            if dig > 0 and shell < 1 and water < 0.5:  # tas de terre
                a = int(255 * dig * (1 - shell))
                d.ellipse([200, 735, 420, 820], fill=(140, 88, 50, a))
                d.ellipse([240, 715, 380, 790], fill=(160, 102, 60, a))
        if lift > 0:  # cavité laissée sous la coque, envahie par la nappe
            cav = self.m_outer.copy()
            img.paste((40, 30, 25), (0, 0), cav)
            under = cav.copy()
            ImageDraw.Draw(under).rectangle([0, 0, W, ty], fill=0)
            img.paste((80, 140, 220), (0, 0), under)

        # ouverture sur la pelouse (vue du dessus)
        if dig > 0:
            rim = [(x, y + dy) for x, y in TOP_RIM]
            op = [(x, y + dy) for x, y in TOP_OPEN]
            if shell > 0:
                d.polygon(rim, fill=(235, 232, 225, int(255 * shell)))
            inside = _lerp((95, 60, 35), (190, 200, 205), shell)
            d.polygon(op, fill=inside + (int(255 * dig),))
            if water > 0:
                d.polygon(op, fill=(110, 200, 235, int(220 * min(1, water * 1.4))))
                # reflets
                for k in range(6):
                    yy = G - 150 + k * 26 + dy
                    xx = 260 + (k * 97 + int(t * 40)) % 500
                    d.line([(xx, yy), (xx + 70, yy)], fill=(255, 255, 255, int(120 * water)), width=3)

        # coque béton + liner
        if shell > 0:
            sm = self._shift(self.m_shell, dy).point(lambda v: int(v * shell))
            img.paste(self.concrete, (0, 0), sm)
            # intérieur vide : paroi du fond en béton clair
            im = self._shift(self.m_inner, dy)
            img.paste((214, 214, 208), (0, 0), im.point(lambda v: int(v * shell)))
            liner = [(x, y + dy) for x, y in INNER]
            d.line(liner[1:] + liner[:1], fill=(200, 70, 60, int(255 * shell)), width=4)

        # eau dans la piscine
        if water > 0.01 and shell > 0:
            top, bottom = G + 22, 1344
            lvl = int(bottom - water * (bottom - top)) + dy
            wm = self._shift(self.m_inner, dy).copy()
            ImageDraw.Draw(wm).rectangle([0, 0, W, lvl], fill=0)
            img.paste((120, 205, 235), (0, 0), wm.point(lambda v: int(v * 0.85)))
            d.line([(INNER[0][0] + 3, lvl), (INNER[1][0] - 3, lvl)], fill=(230, 250, 255, 255), width=5)

        # fissures si soulèvement
        if lift > 0.25:
            a = int(255 * min(1, (lift - 0.25) * 2))
            for sx, sy, dirx in [(110, G, -1), (970, G, 1), (180, G - 186, -1), (900, G - 186, 1)]:
                x, y = sx, sy
                pts = [(x, y)]
                for k in range(7):
                    x += dirx * (18 + (k * 13) % 17)
                    y += (-1) ** k * (10 + k * 3)
                    pts.append((x, y))
                d.line(pts, fill=(40, 25, 15, a), width=5)

        # valve hydrostatique
        if valve > 0:
            a = int(255 * valve)
            gy = 1370 + dy
            for k in range(26):
                gx = VALVE_X - 70 + (k * 37) % 140
                gyy = gy + 8 + (k * 23) % 50
                d.ellipse([gx - 13, gyy - 11, gx + 13, gyy + 11], fill=(225, 225, 225, a), outline=(150, 150, 150, a))
            d.rectangle([VALVE_X - 10, 1338 + dy, VALVE_X + 10, gy + 30], fill=(70, 140, 220, a))
            d.rectangle([VALVE_X - 26, 1330 + dy, VALVE_X + 26, 1340 + dy], fill=(240, 240, 240, a))
            open_px = int(14 * flow)
            d.rectangle([VALVE_X - 30, 1316 + dy - open_px, VALVE_X + 30, 1328 + dy - open_px], fill=(225, 50, 50, a))
            if flow > 0:
                for k in range(16):
                    ph = (t * 0.9 + k / 16) % 1
                    yy = gy + 60 - ph * 160
                    xx = VALVE_X + 14 * math.sin(k * 1.7 + t * 3)
                    r = 7
                    d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=(200, 235, 255, int(a * flow * (1 - ph * 0.6))))

        # flèches : poussée (vers le haut) et poids (vers le bas)
        if up > 0.01:
            a = int(255 * min(1, up * 1.5))
            bob = 10 * math.sin(t * 5)
            for i, x in enumerate(UP_XS):
                floor = self._floor_y(x) + dy
                L = 60 + 120 * up
                y_head = floor + 18 + bob * (1 if i % 2 else -1) * 0.5
                _arrow(d, x, y_head + L, y_head, 26, WHITE, ORANGE, a)
        if down > 0.01:
            a = int(255 * min(1, down * 1.5))
            L = 90 + 140 * down
            _arrow(d, 400, G + 30 + dy, G + 30 + L + dy, 34, GREEN, WHITE, a)
        return img

    @staticmethod
    def _floor_y(x):
        if x <= 512:
            return 1210
        if x >= 668:
            return 1370
        return 1210 + (x - 512) / (668 - 512) * 160

    @staticmethod
    def _shift(mask, dy):
        if dy == 0:
            return mask
        out = Image.new("L", mask.size, 0)
        out.paste(mask, (0, dy))
        return out
