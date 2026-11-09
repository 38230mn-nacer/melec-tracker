"""Analyse d'une vidéo virale de référence : « fais-le comme ça » rendu mesurable.

    python -m factory.analyze_reference ma_reference.mp4

Produit dans out/ref_<nom>/ :
  - report.json : durée, nb de plans, durée moyenne d'un plan, durée du hook,
                  coupes par 10 s → à donner à Claude pour caler le rythme ;
  - sheet.png   : planche contact (1 vignette par plan) → structure visuelle.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def probe_duration(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", str(p)], capture_output=True, text=True)
    return float(out.stdout.strip())


def main(argv=None):
    argv = argv or sys.argv[1:]
    if not argv:
        print(__doc__)
        return 1
    src = Path(argv[0])
    thr = float(argv[1]) if len(argv) > 1 else 0.3
    out = ROOT / "out" / f"ref_{src.stem}"
    out.mkdir(parents=True, exist_ok=True)
    dur = probe_duration(src)
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src), "-vf",
         f"select='gt(scene,{thr})',showinfo", "-an", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    cuts = [float(m) for m in re.findall(r"pts_time:([\d.]+)", log)]
    bounds = [0.0] + cuts + [dur]
    shots = [round(b - a, 2) for a, b in zip(bounds, bounds[1:]) if b - a > 0.05]
    report = {
        "fichier": src.name,
        "duree_s": round(dur, 2),
        "nb_plans": len(shots),
        "plan_moyen_s": round(sum(shots) / len(shots), 2),
        "hook_s": shots[0],
        "coupes_par_10s": round(10 * len(cuts) / dur, 2),
        "plans_s": shots,
        "consigne_rythme": (
            "Viser des beats de durée proche de plan_moyen_s ; "
            "le premier beat (hook) ne doit pas dépasser hook_s + 0,5 s."),
    }
    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    # planche contact : une image au milieu de chaque plan
    mids = [(a + b) / 2 for a, b in zip(bounds, bounds[1:]) if b - a > 0.05][:30]
    expr = "+".join(f"lt(prev_pts*TB\\,{m})*gte(pts*TB\\,{m})" for m in mids)
    cols = min(6, len(mids))
    rows = (len(mids) + cols - 1) // cols
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf",
                    f"select='{expr}',scale=240:-2,tile={cols}x{rows}", "-frames:v", "1",
                    str(out / "sheet.png")], check=False)
    print(json.dumps({k: v for k, v in report.items() if k != "plans_s"}, ensure_ascii=False, indent=2))
    print(f"[ok] {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
