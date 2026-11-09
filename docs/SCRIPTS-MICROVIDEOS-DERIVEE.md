# Scripts de tournage — microvidéos « Dérivée » (CFAI4)

Quatre scripts prêts à enregistrer, correspondant aux quatre slugs de `qr-registry.json`.
Chacun suit la trame du standard : problème → ce qu'on cherche → explication visuelle → exemple → erreur fréquente → « à toi ».

**Dispositif retenu : écran + voix.** Aucune caméra n'est nécessaire.
L'image utile en mathématiques, c'est la tablette qui écrit, pas un visage qui parle. Un plan d'incarnation (avatar fixe ou vignette) sert d'ouverture et de signature, 10 à 15 secondes, puis disparaît.

| Colonne | Contenu |
|---|---|
| **⏱** | timecode cible |
| **ÉCRAN** | ce que l'on voit : annotation Artist 12, capture de la fiche interactive, ou plan d'incarnation |
| **VOIX** | ce que tu dis — texte à dire, pas à lire mot à mot |

Quand une vidéo est prête : dans `qr-registry.json`, remplace `url` par son adresse et passe `format` de `interactif` à `video`. Le QR imprimé ne change pas.

---

## 1. `derivee-01` — ▶ JE COMPRENDS · cible 3 min 10

> **Promesse imprimée sous le QR** : « Pourquoi la pente représente-t-elle l'accélération ? »

| ⏱ | ÉCRAN | VOIX |
|---|---|---|
| 0:00 | Incarnation, plein cadre | « Bonjour, c'est Nacer. Trois minutes, une seule idée : pourquoi une pente, c'est une accélération. » |
| 0:12 | Deux moteurs côte à côte, 1500 tr/min affiché sur les deux | « Ces deux moteurs atteignent la même vitesse. L'un en 5 secondes, l'autre en 20. » |
| 0:30 | Les deux droites tracées en direct sur le même graphe | « Même point d'arrivée. Pas la même montée. Et c'est la montée qui fait le courant d'appel, l'à-coup sur la courroie, l'usure du réducteur. » |
| 0:50 | Triangle Δv / Δt tracé sous la droite raide | « Je descends de l'arrivée, je reviens au départ : ça, c'est Δv. Je fais pareil sur le temps : Δt. » |
| 1:20 | Écriture de a = Δv ÷ Δt, puis 1500 ÷ 5 | « La pente répond à une seule question : quand j'avance d'une seconde, combien je gagne en vitesse ? 300 tours par minute chaque seconde. » |
| 1:50 | Second calcul : 1500 ÷ 20 = 75 | « Même montée, quatre fois plus douce. » |
| 2:20 | Surlignage du palier horizontal de la courbe | « Regarde bien la partie plate. Le moteur y tourne à pleine vitesse… et la pente y est nulle. » |
| 2:40 | Face à face : « vitesse élevée » / « accélération nulle » | « Vitesse élevée ne veut pas dire accélération élevée. Une vitesse constante, c'est une accélération égale à zéro. C'est l'erreur numéro un. » |
| 3:00 | Encadré JE VOIS / JE PENSE / JE FAIS / JE VÉRIFIE | « Droite montante sur un graphe vitesse-temps : je pense pente, donc accélération. Je fais Δv ÷ Δt. Je vérifie l'unité. » |
| 3:10 | Carton de fin | « À toi : question 1, sans revenir sur la vidéo. » |

---

## 2. `derivee-01-sos` — 🆘 JE SUIS BLOQUÉ · cible 1 min 40

> **Promesse imprimée** : « Je ne comprends pas pourquoi on divise par U » → ici : « Je ne comprends pas le symbole Δ »
> Une seule idée. Pas d'introduction, pas de générique : l'élève est bloqué maintenant.

| ⏱ | ÉCRAN | VOIX |
|---|---|---|
| 0:00 | Le symbole Δ seul, très grand | « Δ, ça se lit : variation de. C'est tout. » |
| 0:10 | Écriture : Δ = arrivée − départ | « Et une variation, c'est toujours la même chose : l'arrivée, moins le départ. » |
| 0:25 | Axe avec deux points, 0 et 1500 | « Le moteur part de 0, arrive à 1500. Δv = 1500 − 0 = 1500 tours par minute. » |
| 0:45 | Même chose sur le temps, 0 et 5 s | « Il part à 0 seconde, arrive à 5. Δt = 5 − 0 = 5 secondes. » |
| 1:00 | Comparaison : 1500 − 0 en vert, 0 − 1500 en rouge barré | « Attention au sens. Si tu écris 0 − 1500, tu trouves moins 1500 : ça voudrait dire que le moteur ralentit. » |
| 1:20 | Mini-test : 200 → 1400, réponse 1200 | « Teste-toi : de 200 à 1400, Δv vaut combien ? … 1200. Arrivée moins départ. » |
| 1:40 | Carton de fin | « Tu as ce qu'il faut. Reprends ton calcul et range ton téléphone. » |

---

## 3. `derivee-02` — ✍️ JE REGARDE FAIRE · 3 paliers

> **Exercice voisin, jamais identique** : moteur de pompe, 300 → 1200 tr/min entre t = 1 s et t = 4 s.
> Trois fichiers séparés : l'élève ne doit pas pouvoir sauter au dernier.

### Palier 1 — Indice · cible 40 s
| ⏱ | ÉCRAN | VOIX |
|---|---|---|
| 0:00 | Énoncé seul | « Tu bloques. Je ne te donne pas la méthode, juste de quoi repartir. » |
| 0:10 | Quatre cases vides à remplir | « Tu n'as pas besoin d'une formule de plus. Tu as besoin de deux points : où la vitesse part, où elle arrive, et à quels instants. » |
| 0:30 | Les quatre cases, en colonne | « Écris ces quatre nombres sur ta feuille avant tout calcul. Neuf fois sur dix, le blocage disparaît là. » |

### Palier 2 — Méthode · cible 1 min 30
| ⏱ | ÉCRAN | VOIX |
|---|---|---|
| 0:00 | Titre « la procédure, pas le résultat » | « Je te donne les étapes. Le calcul reste à toi. » |
| 0:10 | JE VOIS | « Une vitesse qui change entre deux instants. » |
| 0:25 | JE PENSE | « Variation de vitesse divisée par variation de temps. » |
| 0:40 | JE FAIS, les trois lignes | « Δv, puis Δt, puis la division. Dans cet ordre, jamais mélangés. » |
| 1:05 | JE VÉRIFIE | « Deux contrôles : l'unité tombe en tours par minute par seconde, et le signe est positif puisque le moteur accélère. » |
| 1:20 | Encadré rouge : Δt = 4 − 1 | « L'erreur qui coûte le plus cher : diviser par 4 au lieu de 3. La montée commence à 1 seconde, pas à zéro. » |

### Palier 3 — Correction détaillée · cible 3 min
| ⏱ | ÉCRAN | VOIX |
|---|---|---|
| 0:00 | Énoncé | « On la fait ensemble, étape par étape. Mets en pause avant chaque étape et essaie de la deviner. » |
| 0:15 | Les deux points écrits | « Départ : 1 seconde, 300 tours. Arrivée : 4 secondes, 1200 tours. » |
| 0:45 | Δv = 1200 − 300 = 900 | « Arrivée moins départ : 900 tours par minute gagnés. Positif, le moteur accélère. » |
| 1:20 | Δt = 4 − 1 = 3 | « Et non 4. La montée dure 3 secondes. » |
| 1:50 | a = 900 ÷ 3 = 300 | « 300 tours par minute par seconde. » |
| 2:15 | Contrôle : 300 × 3 = 900 | « Je vérifie : 300 gagnés par seconde pendant 3 secondes, ça fait 900. Je retombe sur Δv. » |
| 2:40 | Erreur 225, barrée | « Si tu avais divisé par 4, tu trouvais 225 — et 225 × 3 ne fait pas 900. Ce contrôle vaut deux minutes de relecture. » |
| 3:00 | Carton de fin | « Maintenant refais l'exercice de ta feuille sans la vidéo. Les nombres changent, la démarche est la même. » |

---

## 4. `derivee-03` — ✅ JE ME TESTE · cible 1 min 30

> **Promesse imprimée** : « Vérifie ta compréhension »
> Correction du ticket de sortie. À regarder **après** avoir écrit les quatre réponses.

| ⏱ | ÉCRAN | VOIX |
|---|---|---|
| 0:00 | Les quatre questions | « Tes quatre réponses doivent déjà être écrites. Sinon tu ne testes rien, tu lis. » |
| 0:12 | Q1 + réponse | « Une pente : ce qu'on gagne en hauteur quand on avance de 1. » |
| 0:30 | Q2 + réponse | « Ici, c'est l'accélération : des tours par minute gagnés chaque seconde. L'unité fait partie de la réponse. » |
| 0:50 | Q3 + réponse, les deux droites | « Pente plus grande : il monte en vitesse plus vite. Pas "il va plus vite" — les deux finissent à 1500. » |
| 1:10 | Q4 : 1500 ÷ 10 = 150 | « Courbe B : 150 tours par minute par seconde. Deux fois moins que A. » |
| 1:25 | Barème : 4 / 3 / ≤2 | « 4 bonnes : tu passes au transfert. 2 ou moins : rescanne le QR bleu et refais ce ticket demain. Ce n'est pas grave, mais ne passe pas à la suite. » |

---

## Règles de prise de son et de rythme

- **Une seule prise, pas de montage fin.** Si tu te reprends, laisse : l'hésitation humaine aide la crédibilité, pas la perfection.
- **Micro proche** (cravate ou micro du téléphone à 20 cm). Le son porte la compréhension plus que l'image.
- **Pas de musique.** Elle occupe la mémoire de travail et nuit à l'apprentissage chez les élèves fragiles.
- **Jamais au-delà de la durée imprimée + 15 s.** Si tu dépasses, coupe du contenu, pas de la respiration.
- **Une notion par vidéo.** Si une deuxième idée arrive, elle devient un autre slug.
