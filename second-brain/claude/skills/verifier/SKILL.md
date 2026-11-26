---
name: verifier
description: Contre-vérification d'une page par un regard neuf — chaque phrase découle-t-elle de sa source ?
disable-model-invocation: true
---

Lancer un sous-agent **sans le contexte de la rédaction** (contexte frais), avec pour seule consigne :

« Pour la page $ARGUMENTS : lis la page puis chaque source citée dans son frontmatter. Pour chaque phrase factuelle, réponds
DÉCOULE / NE DÉCOULE PAS / NON VÉRIFIABLE, avec la ligne de source. Ne corrige rien. »

Puis écrire le résultat dans `_AI/30_RAPPORTS/verification-<page>.md`. Le linter vérifie la forme et les citations ;
ce contrôle vérifie le sens. Les deux ensemble, jamais l'un à la place de l'autre.
