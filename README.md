# DeltaTracker 1.0.0 — Consolidated RC

Version consolidée après validation progressive des fonctions RC1→RC5.

## Architecture
- `index.html` : moteur historique de suivi APP/ANA/REA/VAL/COM, étendu pour conserver les métadonnées DeltaTracker ;
- `delta-v1.js` : **unique** moteur DeltaTracker (import, Data Firewall, backup, couverture, audit) ;
- `melec-v41...v47` : chaîne métier MELEC/Word CFAI validée ;
- `curriculum.json` : référentiels explicitement sourcés, sans compléter les trous par supposition.

## Données
La clé historique `melec_full_data` reste volontairement utilisée afin de préserver les données existantes. Les champs DeltaTracker (`track`, `level`, `subjects`, `safeId`) sont maintenant conservés par le moteur de base à chaque rechargement.

## Sécurité
- identités locales uniquement ;
- Export SAFE avec pseudonymes stables ;
- backup nominatif explicitement local ;
- `.gitignore`, pre-commit et GitHub Action RGPD ;
- `_private/roster_terms.txt` peut contenir localement les noms à interdire dans Git et n'est jamais versionné.

## Avant GitHub
```bash
python scripts/safe_push.py
```

## Word CFAI
La chaîne V4.7.8 validée est conservée pour le sujet/corrigé Word avec équations natives.
