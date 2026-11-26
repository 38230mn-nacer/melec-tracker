#!/usr/bin/env python3
"""brain.py — vérifications déterministes (sans IA, zéro token) pour un coffre Obsidian.

Adapté du pattern « LLM wiki » (Karpathy) et du linter de Brucky, pour un coffre EXISTANT :
- configuration .brain/config.json (dossiers sources, dossiers vérifiés, champs requis FR/EN) ;
- liens Obsidian réels (résolution par nom de fichier, insensible à la casse, alias, titres, ancres, images) ;
- citations FR : > « texte exact » — chemin/source.md   (ou guillemets droits / anglais) ;
- frontmatter YAML en listes multi-lignes ;
- « baseline » : on gèle les problèmes existants, seuls les NOUVEAUX bloquent (adoption sans tout casser) ;
- rapport Markdown dans _AI/30_RAPPORTS (lecture seule sur le canonique).

Commandes :
  status                     sources nouvelles / modifiées / supprimées depuis la dernière intégration
  done <source> <pages...>   enregistre qu'une source a été intégrée dans ces pages
  lint [--report] [--all]    vérifie ; code 2 si nouveaux problèmes (--all : ignore la baseline)
  baseline                   gèle les problèmes actuels (à faire une fois sur un coffre existant)
  index                      régénère l'index des pages vérifiées
Bibliothèque standard uniquement. Python 3.8+.
"""
import sys, re, json, hashlib, pathlib, unicodedata, datetime

ROOT = pathlib.Path(__file__).resolve().parent
STATE = ROOT / ".brain"
CFG_FILE, MANIFEST, BASELINE = STATE / "config.json", STATE / "manifest.json", STATE / "baseline.json"
DEFAULT = {
    "raw": ["raw"],                      # sources : lues, jamais modifiées
    "wiki": ["wiki"],                    # pages soumises aux règles strictes (frontmatter, citations, orphelins)
    "exclude": [".obsidian", ".trash", ".git", ".brain", "node_modules"],
    "required": {"title": ["title", "titre"], "sources": ["sources", "source"], "updated": ["updated", "maj", "modifie", "modifié"]},
    "special": ["index", "hot", "log"],  # pages de service : pas de frontmatter exigé, pas d'orphelin
    "report_dir": "_AI/30_RAPPORTS",
    "index_file": "index.md",
}
TEXT_EXT = {".md", ".txt", ".csv", ".json", ".html", ".tex"}
LINK = re.compile(r"!?\[\[([^\]|#^]+)(?:[#^|][^\]]*)?\]\]")
QUOTE = re.compile(r'^>\s*(?:"(.+?)"|«\s*(.+?)\s*»|“(.+?)”)\s*[—–-]+\s*(\S+?\.\w+)\s*$', re.M)
CODE = re.compile(r"```.*?```|`[^`\n]*`", re.S)


def cfg():
    c = dict(DEFAULT)
    if CFG_FILE.exists():
        c.update(json.loads(CFG_FILE.read_text(encoding="utf-8")))
    return c


C = cfg()
def rel(p): return p.relative_to(ROOT).as_posix()
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()[:16]
def excluded(p):  # les rapports citent des liens cassés : ne jamais les analyser
    return any(part in C["exclude"] for part in p.relative_to(ROOT).parts) or rel(p).startswith(C["report_dir"].rstrip("/") + "/")
def under(p, dirs): r = rel(p); return any(r == d or r.startswith(d.rstrip("/") + "/") for d in dirs)
def files(dirs): return sorted(p for d in dirs for p in (ROOT / d).rglob("*") if p.is_file() and not excluded(p)) if dirs else []
def load(f, default): return json.loads(f.read_text(encoding="utf-8")) if f.exists() else default
def dump(f, obj): STATE.mkdir(exist_ok=True); f.write_text(json.dumps(obj, indent=2, ensure_ascii=False, sort_keys=True), encoding="utf-8")


def norm(s):
    s = unicodedata.normalize("NFC", s)
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("«", '"'), ("»", '"'), (" ", " "), (" ", " ")):
        s = s.replace(a, b)
    return " ".join(s.split())


def frontmatter(text):
    """Mini-parseur YAML : clés simples, listes [a, b] et listes multi-lignes '- a'."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end < 0:
        return None
    fm, key = {}, None
    for line in text[3:end].splitlines():
        if re.match(r"^\s+-\s+", line) and key:
            fm[key] = (fm[key] + " " + line.strip()[1:].strip()).strip()
        elif ":" in line and not line.startswith(" "):
            key, val = line.split(":", 1)
            key = key.strip().lower()
            fm[key] = val.strip()
    return fm


def field(fm, logical):
    for k in C["required"][logical]:
        if k in fm and fm[k] not in ("", "[]", '""'):
            return fm[k]
    return None


# ---------------- status / done ----------------
def status():
    m, todo = load(MANIFEST, {}), []
    for p in files(C["raw"]):
        k = rel(p)
        if k not in m: todo.append(("NOUVEAU", k))
        elif m[k]["sha"] != sha(p): todo.append(("MODIFIÉ", k))
    for k in m:
        if not (ROOT / k).exists(): todo.append(("SUPPRIMÉ", k))
    for s, k in todo: print(s, k)
    print(f"à intégrer : {len(todo)}", file=sys.stderr)
    return 0


def done(src, pages):
    if not (ROOT / src).exists(): print("source introuvable :", src); return 1
    for w in pages:
        if not (ROOT / w).exists(): print("page introuvable :", w); return 1
    m = load(MANIFEST, {}); m[src] = {"sha": sha(ROOT / src), "pages": pages, "date": datetime.date.today().isoformat()}
    dump(MANIFEST, m); print("enregistré :", src, "→", ", ".join(pages)); return 0


# ---------------- lint ----------------
def collect():
    """Renvoie (erreurs, avertissements), chaque item = (fichier, message)."""
    err, warn = [], []
    vault = sorted(p for p in ROOT.rglob("*") if p.is_file() and not excluded(p))
    by_name = {}
    for p in vault:
        by_name.setdefault(p.name.lower(), []).append(p)
        if p.suffix == ".md": by_name.setdefault(p.stem.lower(), []).append(p)
    notes = [p for p in vault if p.suffix == ".md"]
    wiki = [p for p in notes if under(p, C["wiki"])]
    inbound = {p: 0 for p in wiki}

    def resolve(target):
        t = target.strip().lower()
        if t.endswith(".md"): t = t[:-3]
        if "/" in t:
            for cand in (t + ".md", t):
                hit = [p for p in vault if rel(p).lower().endswith(cand)]
                if hit: return hit[0]
            return None
        return (by_name.get(t) or by_name.get(t + ".md") or [None])[0]

    for p in notes:
        raw_text = p.read_text(encoding="utf-8", errors="ignore")
        text = CODE.sub("", raw_text)
        r = rel(p)
        for target in LINK.findall(text):
            hit = resolve(target)
            if hit is None:
                (err if p in inbound else warn).append((r, f"lien cassé [[{target}]]"))
            elif hit in inbound and hit != p:
                inbound[hit] += 1
        if p not in inbound:
            continue
        # --- règles strictes : pages vérifiées uniquement ---
        if p.stem.lower() in C["special"]:
            continue
        fm = frontmatter(raw_text)
        if fm is None:
            err.append((r, "frontmatter absent")); continue
        for logical in C["required"]:
            if field(fm, logical) is None:
                err.append((r, f"frontmatter : champ « {logical} » manquant ({' / '.join(C['required'][logical])})"))
        for src in re.findall(r"[\w./-]+\.\w+", field(fm, "sources") or ""):
            if any(src.startswith(d.rstrip('/') + '/') for d in C["raw"]) and not (ROOT / src).exists():
                err.append((r, f"source {src} inexistante"))
        for q1, q2, q3, src in QUOTE.findall(raw_text):
            q, f = q1 or q2 or q3, ROOT / src
            if not f.exists():
                err.append((r, f"citation : source {src} inexistante"))
            elif f.suffix.lower() not in TEXT_EXT:
                warn.append((r, f"citation non vérifiable (source {f.suffix}) : convertir en .md dans les sources"))
            elif norm(q) not in norm(f.read_text(encoding="utf-8", errors="ignore")):
                err.append((r, f"CITATION ABSENTE DE LA SOURCE → « {q[:60]} » ({src})"))
        if re.search(r"\bTODO\b|\bÀ COMPLÉTER\b", text):
            err.append((r, "TODO non résolu"))
    for p, n in inbound.items():
        if n == 0 and p.stem.lower() not in C["special"]:
            warn.append((rel(p), "orpheline (aucun lien entrant)"))
    for k, v in load(MANIFEST, {}).items():
        f = ROOT / k
        if f.exists() and sha(f) != v["sha"]:
            err.append((k, "source modifiée depuis son intégration ; pages à revoir : " + ", ".join(v["pages"])))
    return err, warn


def lint(argv):
    err, warn = collect()
    base = set() if "--all" in argv else {tuple(x) for x in load(BASELINE, [])}
    new = [e for e in err if e not in base]
    for f, m in new: print(f"{f}: {m}", file=sys.stderr)
    for f, m in warn: print(f"{f}: (avertissement) {m}", file=sys.stderr)
    frozen = len(err) - len(new)
    print(f"lint : {len(new)} problème(s) bloquant(s), {len(warn)} avertissement(s)" + (f", {frozen} gelé(s) par la baseline" if frozen else ""), file=sys.stderr)
    if "--report" in argv:
        d = ROOT / C["report_dir"]; d.mkdir(parents=True, exist_ok=True)
        today = datetime.date.today().isoformat()
        out = d / f"lint-{today}.md"
        lines = ["---", f"title: Rapport lint {today}", "sources: brain.py", f"updated: {today}", "tags: [rapport, lint]", "---", "",
                 f"# Rapport lint — {today}", "", f"- Bloquants : **{len(new)}** · Avertissements : {len(warn)} · Gelés : {frozen}", "", "## Bloquants"]
        lines += [f"- [ ] `{f}` — {m}" for f, m in new] or ["- aucun"]
        lines += ["", "## Avertissements"] + ([f"- `{f}` — {m}" for f, m in warn] or ["- aucun"])
        out.write_text("\n".join(lines) + "\n", encoding="utf-8"); print("rapport :", rel(out), file=sys.stderr)
    return 2 if new else 0


def baseline():
    err, _ = collect()
    err = [e for e in err if not e[1].startswith("source modifiée")]  # toujours à traiter, jamais gelé
    dump(BASELINE, [list(e) for e in err])
    print(f"baseline : {len(err)} problème(s) existant(s) gelé(s). Seuls les nouveaux bloqueront."); return 0


def index():
    rows = []
    for p in sorted(p for p in ROOT.rglob("*.md") if not excluded(p) and under(p, C["wiki"]) and p.stem.lower() not in C["special"]):
        fm = frontmatter(p.read_text(encoding="utf-8", errors="ignore")) or {}
        rows.append(f"- [[{p.stem}]] — {field(fm, 'title') or p.stem} ({field(fm, 'updated') or '?'})")
    out = ROOT / C["wiki"][0] / C["index_file"]; out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("# Index\n\n" + "\n".join(rows) + "\n", encoding="utf-8"); print(f"index : {len(rows)} page(s) → {rel(out)}"); return 0


if __name__ == "__main__":
    c, a = (sys.argv[1] if len(sys.argv) > 1 else ""), sys.argv[2:]
    cmds = {"status": status, "lint": lambda: lint(a), "baseline": baseline, "index": index,
            "done": lambda: done(a[0], a[1:]) if a else (print("usage : done <source> <pages...>") or 1)}
    sys.exit(cmds.get(c, lambda: print(__doc__) or 1)())
