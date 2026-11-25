# Jumeau numérique pédagogique — Nacer

Version 1.0 — 2026-11-25.

---

## 1. Recadrage : « indiscernable » est le mauvais objectif

| Objectif « clone indiscernable » | Objectif « jumeau pédagogique assumé » |
|---|---|
| Faire croire qu'il s'agit de toi | **Penser, expliquer et corriger comme toi**, en disant qu'il s'agit d'une IA |
| Interdit dans tes usages réels : le règlement européen sur l'IA (AI Act, art. 50, applicable depuis le 2 août 2026) impose d'**informer** qu'on parle à une IA et d'**étiqueter** les voix et vidéos synthétiques [certitude 85 %] | Conforme, et vendable à un CFA ou un établissement |
| Risque d'usurpation : une fois ta voix et ton visage clonés, quiconque obtient les fichiers peut te faire dire n'importe quoi | Ton image reste sous contrôle : les fichiers voix et vidéo sont stockés localement, avec un usage borné |
| Public mineur : tromper des élèves = faute déontologique majeure | La transparence renforce la confiance des élèves et des parents |
| Mesure du succès : « personne ne voit la différence » | Mesure du succès : **un collègue en aveugle juge que la réponse vaut une des tiennes** (§4) |

**Choix recommandé : un jumeau dont la *pédagogie* est indiscernable de la tienne, et dont la *nature* est toujours déclarée.** C'est là qu'est la valeur : te démultiplier le soir, en révision, en CCF blanc, sans te dupliquer.

---

## 2. Architecture en 3 couches

| Couche | Ce qu'elle capture | Support | État |
|---|---|---|---|
| **1. Cerveau** (le plus important) | ta méthode, tes réflexes, ton ton, tes règles, tes pièges types | [`PROMPT-JUMEAU-NACER.md`](PROMPT-JUMEAU-NACER.md) : un prompt système à utiliser dans un Claude Project ou un skill | **V1 livrée** |
| **2. Mémoire** | tes explications réelles, tes corrigés, tes fiches, tes analogies | corpus dans Obsidian `Jumeau/Corpus/` → documents du Project | à alimenter (§3) |
| **3. Incarnation** | ta voix, ton visage (microvidéos des QR) | clonage de voix et avatar vidéo, **avec étiquette « voix/vidéo générée par IA »** | phase 3, seulement si les couches 1 et 2 passent le test |

Ordre non négociable : **1 → 2 → test → 3.** Une belle voix qui explique mal est pire que rien.

---

## 3. Protocole de collecte du corpus (2 semaines, environ 20 min/jour)

Ce qui fait la différence entre « un prof IA » et **toi**, c'est la façon dont tu réagis à l'erreur d'un élève.

| # | À capturer | Comment | Quantité cible |
|---|---|---|---|
| 1 | **Réactions à des erreurs réelles** (le plus précieux) | Après un cours, dicte au téléphone : « l'élève a écrit X, je lui ai dit Y, parce que Z » | 30 |
| 2 | Explications d'une notion à un élève faible | Enregistrement audio en cours particulier, avec l'accord de l'élève (et des parents s'il est mineur), puis transcription **sans prénom** | 10 |
| 3 | Analogies et images qui marchent | Liste libre | 20 |
| 4 | Phrases-signatures, tics positifs, encouragements | Liste libre | 15 |
| 5 | Ce que tu ne ferais **jamais** | Liste libre | 10 |
| 6 | Corrigés commentés | Copies déjà corrigées, anonymisées | 10 |

Format de chaque fiche : `contexte → ce que l'élève fait ou dit → ce que je réponds → pourquoi`.

Règle RGPD : **aucun nom d'élève** dans le corpus. Le script `safe_push.py` du dépôt peut servir de garde-fou.

---

## 4. Test de fidélité : la mesure de « bien créé »

Un test à l'aveugle, honnête, réalisé avec des collègues, pas avec des élèves :

1. Choisis 10 vraies questions d'élèves (anonymisées).
2. Réponds-y toi-même ; le jumeau y répond aussi.
3. Un ou deux collègues de maths-sciences reçoivent les 20 réponses mélangées et notent, pour chacune :
   - **qualité pédagogique** (/5) ;
   - **« ressemble à Nacer ? »** (oui / non).
4. Seuils :

| Indicateur | Seuil V1 | Seuil « jumeau prêt » |
|---|---|---|
| Qualité jumeau / qualité Nacer | ≥ 80 % | ≥ 95 % |
| Taux de réponses du jumeau attribuées à Nacer | ≥ 40 % | ≥ 70 % |
| Erreur scientifique | 0 | 0 |

5. Chaque écart observé devient une règle ou un exemple ajouté au prompt (boucle d'amélioration).

---

## 5. Usages, du plus sûr au plus ambitieux

| Usage | Public | Valeur | Condition |
|---|---|---|---|
| Préparer tes séances « avec toi-même » | toi | gain de temps immédiat | aucune |
| Assistant de révision 24 h/24, étiqueté « Jumeau IA de M. Nacer » | élèves, cours particuliers | soutien entre deux cours | message de transparence + pas de données personnelles + validation de l'établissement |
| Microvidéos des QR avec ta voix clonée | élèves | production ×5 plus rapide | mention « voix générée par IA » + fichiers voix stockés localement |
| Démonstration en formation CFA (« voici comment j'ai construit mon jumeau ») | profs, formateurs | **c'est ton produit #3 du scan de marché** | aucune |

Ce dernier usage est le plus rentable : ton jumeau devient la **démonstration vivante** de ta formation « IA pour enseignants de la voie pro ».

---

## Checkpoint

**ÉTAT :** couche 1 (cerveau) livrée ; protocole de corpus et de test défini.
**DÉCISION :** pédagogie indiscernable, nature toujours déclarée.
**PROCHAINE ACTION :** créer un Claude Project « Jumeau Nacer », y coller le prompt, faire 10 questions d'essai ; commencer la collecte n°1 (réactions aux erreurs).
**À CAPITALISER :** Obsidian `Jumeau/` (prompt + corpus + résultats des tests).
**BLOCAGE :** avant tout usage avec des élèves, accord de l'établissement et information des familles.
