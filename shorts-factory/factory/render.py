"""Usine à Shorts — rendu complet d'un épisode JSON en MP4 vertical 1080×1920.

    python -m factory.render episodes/piscine-archimede.json
    python -m factory.render episodes/piscine-archimede.json --no-tts --preview

Chaîne : script (beats) → voix + timings mot à mot → états animés → images
         → sous-titres mot à mot → mixage (voix + nappe musicale + pops) → MP4.
"""
import argparse
import json
import math
import multiprocessing as mp
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .tts import synth_beats
from .world import BLUE, GREEN, INK, ORANGE, WHITE, H, W, World

ROOT = Path(__file__).resolve().parent.parent
FONT = str(ROOT / "assets" / "fonts" / "InterDisplay-Black.otf")
FPS = 30
SR = 44100
GAP = 0.22          # silence entre deux beats (s)
TRANS = 0.6         # durée d'une transition d'état (s)
STATE_KEYS = ["dig", "shell", "water", "table", "up", "down", "lift", "valve", "flow"]
CAM_DEFAULT = {"zoom": 1.0, "cx": W / 2, "cy": H / 2}
CARD_COLORS = {"up": ORANGE, "down": GREEN, "txt": BLUE}


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


# ---------------------------------------------------------------- timeline
def build_timeline(ep, voices):
    """Calcule début/fin de chaque beat, états de départ/arrivée, mots horodatés."""
    beats, t = [], 0.3
    state = {k: 0.0 for k in STATE_KEYS}
    cam = dict(CAM_DEFAULT)
    card = ""
    words = []
    for b, v in zip(ep["beats"], voices):
        s0, c0 = dict(state), dict(cam)
        for k, val in b.get("state", {}).items():
            if k == "card":
                card = val
            else:
                state[k] = float(val)
        cam.update(b.get("cam", {}))
        dur = v["dur"] + GAP
        beats.append({"t0": t, "t1": t + dur, "s0": s0, "s1": dict(state),
                      "c0": c0, "c1": dict(cam), "card": card, "mp3": v["mp3"]})
        for w in v["words"]:
            words.append({"w": w["w"], "t0": t + w["t0"], "t1": t + w["t1"]})
        t += dur
    total = t + 0.8
    # chaque mot reste affiché jusqu'au mot suivant (pas de trou visuel)
    for i, w in enumerate(words):
        nxt = words[i + 1]["t0"] if i + 1 < len(words) else w["t1"] + 0.5
        w["t1"] = max(w["t1"], min(nxt, w["t1"] + 0.6))
    return beats, words, total


def state_at(beats, t):
    b = beats[-1]
    for cand in beats:
        if t < cand["t1"]:
            b = cand
            break
    tr = TRANS * (2.2 if b["s1"].get("lift", 0) != b["s0"].get("lift", 0) else 1)
    p = ease((t - b["t0"]) / tr)
    s = {k: b["s0"][k] + (b["s1"][k] - b["s0"][k]) * p for k in STATE_KEYS}
    pc = ease((t - b["t0"]) / 0.9)
    c = {k: b["c0"][k] + (b["c1"][k] - b["c0"][k]) * pc for k in CAM_DEFAULT}
    card_alpha = min(1.0, (t - b["t0"]) / 0.3) if b["card"] else 0
    return s, c, b["card"], card_alpha


# ---------------------------------------------------------------- overlays
def apply_camera(img, cam):
    z = max(1.0, cam["zoom"])
    if z == 1.0:
        return img
    cw, ch = W / z, H / z
    x0 = min(max(cam["cx"] - cw / 2, 0), W - cw)
    y0 = min(max(cam["cy"] - ch / 2, 0), H - ch)
    return img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))


_fonts = {}


def font(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT, size)
    return _fonts[size]


def draw_caption(img, word, age, highlight):
    """Un mot à la fois, gros, centré, avec effet « pop »."""
    clean = word.strip(".,;:!?…«»\"")
    key = clean.lower().replace("’", "'")
    color = ORANGE if any(h in key for h in highlight) else WHITE
    pop = 0.78 + 0.22 * ease(age / 0.09)
    size = 128
    f = font(size)
    while f.getlength(word) > W * 0.86 and size > 60:
        size -= 6
        f = font(size)
    size = int(size * pop)
    f = font(size)
    d = ImageDraw.Draw(img)
    d.text((W / 2, 930), word, font=f, fill=color, anchor="mm",
           stroke_width=max(6, size // 11), stroke_fill=INK)


def draw_card(img, rows, alpha):
    if not rows or alpha <= 0:
        return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = font(62)
    y = 150
    for text, kind in rows:
        col = CARD_COLORS.get(kind, BLUE)
        tw = f.getlength(text)
        pad = 34
        box = [W / 2 - tw / 2 - pad, y, W / 2 + tw / 2 + pad, y + 100]
        d.rounded_rectangle(box, radius=26, fill=col + (235,), outline=WHITE + (255,), width=5)
        d.text((W / 2, y + 50), text, font=f, fill=WHITE, anchor="mm")
        y += 122
    if alpha < 1:
        layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    img.paste(layer, (0, 0), layer)


def draw_brand(img, text):
    d = ImageDraw.Draw(img)
    d.text((W / 2, H - 120), text, font=font(34), fill=(255, 255, 255), anchor="mm",
           stroke_width=4, stroke_fill=INK)


# ---------------------------------------------------------------- frames
_G = {}


def _init_worker(payload):
    _G.update(payload)
    _G["world"] = World()


def render_frame(i):
    t = i / FPS
    beats, words, ep = _G["beats"], _G["words"], _G["ep"]
    s, cam, card, ca = state_at(beats, t)
    img = _G["world"].render(s, t)
    img = apply_camera(img, cam)
    draw_card(img, ep.get("cards", {}).get(card), ca)
    for w in words:
        if w["t0"] <= t < w["t1"]:
            draw_caption(img, w["w"], t - w["t0"], ep.get("highlight", []))
            break
    if ep.get("brand"):
        draw_brand(img, ep["brand"])
    return img.tobytes()


# ---------------------------------------------------------------- audio
def decode_mp3(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le",
                          "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def build_audio(beats, total, out_wav, music=None):
    n = int(total * SR)
    voice = np.zeros(n, np.float32)
    for b in beats:
        if b["mp3"]:
            a = decode_mp3(b["mp3"])
            s = int(b["t0"] * SR)
            voice[s:s + len(a)] += a[: n - s]
    tt = np.arange(n) / SR
    if music:
        bed = decode_mp3(music)
        bed = np.resize(bed, n) * 0.18
    else:
        # nappe synthétique douce (accord La mineur – Fa – Do – Sol, 4 s chacun)
        chords = [[220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [261.6, 329.6, 392.0], [196.0, 246.9, 293.7]]
        bed = np.zeros(n, np.float32)
        for k, ch in enumerate(chords * int(total // 16 + 1)):
            s, e = int(k * 4 * SR), min(n, int((k * 4 + 4.4) * SR))
            if s >= n:
                break
            seg = tt[s:e] - k * 4
            env = np.minimum(1, seg / 0.8) * np.minimum(1, (4.4 - seg) / 0.8)
            for f in ch:
                bed[s:e] += (np.sin(2 * np.pi * f / 2 * seg) * 0.5 + np.sin(2 * np.pi * f * seg) * 0.2) * env
        bed *= 0.035
        # pulsation légère (rythme Short)
        bed *= 0.75 + 0.25 * (np.sin(2 * np.pi * 2 * tt) > 0)
    # ducking : la musique baisse quand la voix parle
    env = np.abs(voice)
    k = int(0.15 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    bed = bed * (1 - 0.6 * np.clip(env * 12, 0, 1))
    # « pop » à chaque changement de beat
    pops = np.zeros(n, np.float32)
    for b in beats[1:]:
        s = int(b["t0"] * SR)
        L = int(0.07 * SR)
        x = np.arange(min(L, n - s)) / SR
        pops[s:s + len(x)] += np.sin(2 * np.pi * (900 - 6000 * x) * x) * np.exp(-x * 60) * 0.18
    mix = voice + bed + pops
    peak = np.max(np.abs(mix)) or 1
    mix = mix / peak * 0.92
    with wave.open(str(out_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((mix * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- main
def main(argv=None):
    ap = argparse.ArgumentParser(description="Rendu d'un épisode Shorts")
    ap.add_argument("episode")
    ap.add_argument("--out", help="MP4 de sortie (défaut : out/<id>.mp4)")
    ap.add_argument("--no-tts", action="store_true", help="pas de voix (timings estimés)")
    ap.add_argument("--music", help="MP3 libre de droits à placer sous la voix")
    ap.add_argument("--preview", action="store_true", help="contact sheet PNG au lieu de la vidéo")
    ap.add_argument("--workers", type=int, default=max(1, mp.cpu_count()))
    a = ap.parse_args(argv)

    ep = json.loads(Path(a.episode).read_text(encoding="utf-8"))
    out_dir = ROOT / "out"
    out_dir.mkdir(exist_ok=True)
    work = out_dir / "_cache" / ep["id"]
    voices = synth_beats(ep["beats"], ep.get("voice", "fr-FR-HenriNeural"),
                         ep.get("rate", "+0%"), work, use_tts=not a.no_tts)
    beats, words, total = build_timeline(ep, voices)
    n_frames = int(total * FPS)
    print(f"[timeline] {len(beats)} beats · {len(words)} mots · {total:.1f} s · {n_frames} images")
    payload = {"beats": beats, "words": words, "ep": ep}

    if a.preview:
        _init_worker(payload)
        mids = [int(((b["t0"] + b["t1"]) / 2) * FPS) for b in beats]
        thumbs = [Image.frombytes("RGB", (W, H), render_frame(i)).resize((270, 480)) for i in mids]
        cols = 5
        rows = math.ceil(len(thumbs) / cols)
        sheet = Image.new("RGB", (cols * 270, rows * 480), (0, 0, 0))
        for k, th in enumerate(thumbs):
            sheet.paste(th, ((k % cols) * 270, (k // cols) * 480))
        p = out_dir / f"{ep['id']}_preview.png"
        sheet.save(p)
        print(f"[preview] {p}")
        return

    wav = work / "mix.wav"
    build_audio(beats, total, wav, a.music)
    out = Path(a.out) if a.out else out_dir / f"{ep['id']}.mp4"
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", str(wav),
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(out)]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with mp.Pool(a.workers, initializer=_init_worker, initargs=(payload,)) as pool:
        for k, fr in enumerate(pool.imap(render_frame, range(n_frames), chunksize=8)):
            ff.stdin.write(fr)
            if k % (FPS * 5) == 0:
                print(f"\r[rendu] {k / FPS:5.1f}/{total:.1f} s", end="", flush=True)
    ff.stdin.close()
    ff.wait()
    print(f"\n[ok] {out}")
    return 0 if ff.returncode == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
