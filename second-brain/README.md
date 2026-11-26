# Kit second cerveau — vérification déterministe pour le coffre Obsidian

Adaptation du guide « LLM wiki » (Karpathy / Brucky) au système existant :
**Obsidian = mémoire canonique · Claude = intelligence · `_AI/` = zone de préparation · EXECUTE sur validation.**

## Ce qui est repris, adapté, écarté

| Idée du guide | Décision | Pourquoi |
|---|---|---|
| Linter sans IA (citations, liens, frontmatter, sources modifiées) | **Repris et renforcé** | Un modèle qui relit son propre travail est d'accord avec lui-même. Contrôle à zéro token. |
| Citation exacte pour chaque affirmation dure | **Repris** (format FR `> « … » — raw/x.md`) | Indispensable pour BO, référentiels, dates : c'est ta hiérarchie des sources rendue vérifiable. |
| `raw/` en lecture seule par permission (et pas par consigne) | **Repris** | Une consigne écrite dans CLAUDE.md n'empêche rien ; une règle de permission bloque l'écriture. |
| `hot.md` + session-start | **Repris** dans `_AI/hot.md` | C'est ta commande /RESUME, automatique. |
| Un seul coffre pour tous les projets | **Repris** (`CLAUDE-projet.md.modele`) | Évite les mémoires concurrentes (règle n° 19). |
| Claude écrit directement le wiki | **Adapté** : il prépare dans `_AI/20_A_VALIDER/` | PREPARE ≠ EXECUTE. Tu valides avant que ça devienne canonique. |
| Structure `raw/ wiki/` imposée | **Adapté** : `.brain/config.json` désigne tes dossiers | Respecter la structure existante du coffre (règle n° 20). |
| Tout signaler sur un coffre existant | **Ajouté : `baseline`** | Sur un coffre de plusieurs centaines de notes, le premier lint sort des centaines d'alertes. On gèle l'existant, seuls les nouveaux problèmes bloquent. |
| Ingest de nuit automatique (`claude -p` + cron) | **Écarté** → lint de nuit uniquement | Une réécriture sans validation contredit PREPARE/EXECUTE. Le lint seul est sans risque. |
| Installer 3 dépôts de plugins tiers | **Écarté pour l'instant** | Ils dupliquent ce kit et ajoutent du code tiers qui agit sur tes fichiers. À reconsidérer seulement pour un besoin précis. |
| Vérification du sens par un sous-agent sans contexte | **Repris** (skill `verifier`) | Le linter vérifie la forme, pas la vérité : une source fausse donne un wiki fidèlement faux. |

## Installation (10 min, dans le coffre)
1. Copier `brain.py` à la racine du coffre ; créer `.brain/config.json` :
   ```json
   { "raw": ["raw"], "wiki": ["_AI/20_A_VALIDER", "wiki"], "report_dir": "_AI/30_RAPPORTS" }
   ```
   Remplacer par tes vrais dossiers : `raw` = sources (BO, référentiels, PDF convertis en .md), `wiki` = dossiers soumis aux règles strictes.
2. `python3 brain.py lint --all` → lire le volume de problèmes, **puis** `python3 brain.py baseline`.
3. Copier `claude/` en `.claude/` à la racine du coffre (`settings.json`, `hooks/`, `skills/`), et `hot.md.modele` en `_AI/hot.md`.
4. Dans chaque projet Claude Code : coller `CLAUDE-projet.md.modele` dans son CLAUDE.md, avec le chemin du coffre.
5. Vérifier dans Claude Code avec `/permissions` que la règle `Edit(/raw/**)` vise bien ton dossier de sources : la syntaxe des chemins a évolué selon les versions.
6. `git init` dans le coffre si ce n'est pas fait : chaque intégration validée = un commit, réversible.

## Usage
| Commande | Effet |
|---|---|
| `/integrer` | sources nouvelles ou modifiées → propositions dans `_AI/20_A_VALIDER/` + lint + index |
| `/verifier <page>` | contre-vérification du sens par un sous-agent neuf → `_AI/30_RAPPORTS/` |
| `python3 brain.py status` | ce qui reste à intégrer (le coût suit ce qui change, pas la taille du coffre) |
| `python3 brain.py lint --report` | rapport Markdown daté dans `_AI/30_RAPPORTS/` |

Lint de nuit (sans IA), par exemple dans le planificateur de tâches ou cron : `cd ~/coffre && python3 brain.py lint --report`.

## Limites
- Le linter contrôle la **forme** et l'**exactitude des citations**, pas la vérité de la source.
- Les PDF ne sont pas vérifiables : en extraire le texte vers `raw/*.md`.
- En dessous d'environ 50 sources intégrées, le gain par rapport à une recherche classique est faible : commencer par un domaine à forte valeur (référentiels et BO).
