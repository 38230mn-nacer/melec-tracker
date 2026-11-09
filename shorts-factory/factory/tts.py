"""Voix off + horodatage mot à mot.

Moteur principal : edge-tts (voix neuronales Microsoft, gratuites, nécessite Internet).
Repli hors ligne : pas de voix, durées estimées (les sous-titres restent synchronisés).
"""
import asyncio
import hashlib
import json
import os
import subprocess
from pathlib import Path


def _patch_ca():
    # Derrière un proxy d'entreprise, edge-tts ignore SSL_CERT_FILE (il utilise certifi).
    ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    if ca and Path(ca).exists():
        import certifi
        certifi.where = lambda: ca


async def _speak(text, voice, rate, mp3_path):
    import edge_tts
    words = []
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    with open(mp3_path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({
                    "w": chunk["text"],
                    "t0": chunk["offset"] / 1e7,
                    "t1": (chunk["offset"] + chunk["duration"]) / 1e7,
                })
    return words


def audio_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def estimate_words(text, wps=3.2):
    """Repli : ~3,2 mots/s (débit d'un Short dynamique)."""
    words, t = [], 0.15
    for w in text.split():
        d = max(0.18, len(w) * 0.055)
        words.append({"w": w, "t0": t, "t1": t + d})
        t += d + 0.04 + (0.25 if w[-1] in ".?!…:" else 0)
    return words, t + 0.2


def synth_beats(beats, voice, rate, workdir, use_tts=True):
    """Renvoie pour chaque beat : {mp3|None, words, dur}. Met en cache par texte."""
    workdir = Path(workdir)
    workdir.mkdir(parents=True, exist_ok=True)
    if use_tts:
        _patch_ca()
    results = []
    for i, b in enumerate(beats):
        text = b["say"]
        key = f"{i:02d}_" + hashlib.sha1(f"{text}|{voice}|{rate}".encode()).hexdigest()[:10]
        mp3, js = workdir / f"{key}.mp3", workdir / f"{key}.json"
        if use_tts:
            try:
                if not (mp3.exists() and js.exists() and mp3.stat().st_size > 0):
                    words = asyncio.run(_speak(text, voice, rate, mp3))
                    js.write_text(json.dumps(words, ensure_ascii=False))
                words = json.loads(js.read_text())
                results.append({"mp3": mp3, "words": words, "dur": audio_duration(mp3)})
                continue
            except Exception as e:  # réseau absent, quota…
                print(f"[tts] échec beat {i} ({e.__class__.__name__}) → mode estimé, sans voix")
                use_tts = False
        words, dur = estimate_words(text)
        results.append({"mp3": None, "words": words, "dur": dur})
    return results
