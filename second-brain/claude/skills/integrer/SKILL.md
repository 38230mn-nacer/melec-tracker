---
name: integrer
description: Intègre les sources nouvelles ou modifiées de raw/ en préparant des pages dans _AI/20_A_VALIDER (jamais directement dans le canonique).
disable-model-invocation: true
---

Niveau : PREPARE. Les notes canoniques ne sont pas modifiées.

1. `python3 brain.py status` : ne traiter que les fichiers listés.
2. Pour chaque source, chercher d'abord dans le coffre si une note existante doit être **enrichie** plutôt que créée (pas de prolifération).
3. Écrire les propositions dans `_AI/20_A_VALIDER/` :
   - page nouvelle : le fichier final ;
   - enrichissement d'une note existante : `<note>.proposition.md` avec uniquement les ajouts, et le lien `[[<note>]]`.
4. Frontmatter : `title`, `sources`, `updated` (+ tags existants du coffre, jamais de nouveaux tags sans le signaler).
5. Chaque affirmation factuelle importante (date, chiffre, exigence officielle) porte une citation exacte :
   `> « texte exact » — raw/<fichier>.md`
   Si la source est un PDF : en extraire le texte vers `raw/<nom>.md` d'abord, et le signaler.
6. Contradiction avec une note existante : ne pas trancher. La noter dans la page sous `## Contradiction` (source A vs source B, source la plus fiable, conséquence).
7. `python3 brain.py lint` jusqu'au code 0 (les avertissements ne bloquent pas).
8. `python3 brain.py done <source> <pages...>` puis `python3 brain.py index`.
9. Résumé en 3 lignes : créé / proposé en enrichissement / contradictions. Mettre à jour `_AI/hot.md` (12 lignes max).
10. Ne pas committer : Nacer valide, déplace, puis committe.
