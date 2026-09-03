#!/usr/bin/env python3
from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
EXCLUDE={'.git','node_modules','_private','data','rosters','dist','archive'}
TEXT_EXT={'.html','.js','.json','.md','.txt','.css','.yml','.yaml','.py','.ps1','.cmd','.webmanifest','.gitignore','.gitattributes'}
patterns={
 'email':re.compile(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}',re.I),
 'phone_fr':re.compile(r'(?<!\d)(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}(?!\d)'),
 'ine':re.compile(r'\b\d{9}[A-Z]{2}\b',re.I),
 'dob':re.compile(r'\b(?:0?[1-9]|[12]\d|3[01])[\/. -](?:0?[1-9]|1[0-2])[\/. -](?:19|20)\d{2}\b')
}
allow_emails={'example@example.fr','contact@example.fr'}
# Optional local roster terms, deliberately git-ignored.
terms=[]
term_file=ROOT/'_private'/'roster_terms.txt'
if term_file.exists():
    terms=[x.strip().lower() for x in term_file.read_text(encoding='utf-8',errors='ignore').splitlines() if len(x.strip())>=3]
hits=[]
for p in ROOT.rglob('*'):
    if not p.is_file() or any(x in EXCLUDE for x in p.parts): continue
    if p.suffix.lower() not in TEXT_EXT and p.name not in {'.gitignore','.gitattributes'}: continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    for kind,rx in patterns.items():
        for m in rx.finditer(txt):
            val=m.group(0)
            if kind=='email' and val.lower() in allow_emails: continue
            hits.append((p.relative_to(ROOT),kind,val[:80]))
    low=txt.lower()
    for term in terms:
        if term in low: hits.append((p.relative_to(ROOT),'roster_term',term))
for p in ROOT.rglob('*'):
    if not p.is_file(): continue
    n=p.name.lower()
    if any(tok in n for tok in ['backup_v','bak_v','exportgroupe','roster']) or n.endswith(('.local.db','.sqlite','.sqlite3')):
        hits.append((p.relative_to(ROOT),'forbidden_file',p.name))
if hits:
    print('SAFE-PUSH BLOQUE — données ou artefacts suspects détectés:')
    for h in hits[:100]: print(' -',*h)
    sys.exit(2)
print('SAFE-PUSH OK — aucun motif PII/artefact sensible détecté.')
