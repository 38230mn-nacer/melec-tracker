# Standard « Document augmenté » — CFAI4 / Maths au Cube

Version 1.0 — standard permanent de conception des ressources papier + QR.
Statut : s'applique à toute nouvelle fiche, séance, TD ou évaluation formative.

---

## 1. Principe directeur

On ne cherche pas le maximum de QR codes, mais le **maximum de valeur pédagogique par QR code**.

> Le papier est le centre de commande.
> Le QR fait apparaître le professeur à l'endroit exact où l'élève décroche.

Boucle attendue :

```
PAPIER  →  QR  →  MICROVIDÉO  →  ACTION SUR LE PAPIER
```

Boucle à empêcher par construction :

```
PAPIER → QR → 12 min de vidéo → réseaux sociaux → cours oublié
```

---

## 2. Règle de parité papier (non négociable)

**Un document doit rester 100 % utilisable sans aucun scan.**

Conséquences directes :
- aucune définition, formule, donnée d'énoncé ou consigne d'évaluation ne vit uniquement dans une vidéo ;
- le QR apporte toujours un **surcroît** (voix, geste, animation, reformulation, correction progressive), jamais un **prérequis** ;
- un élève sans téléphone, sans réseau ou sans forfait n'est jamais bloqué ni pénalisé.

Cette règle est la condition d'équité, et la condition pour qu'un document augmenté reste utilisable en CCF, en salle sans réseau et en cas de panne d'hébergement.

---

## 3. Les quatre familles de QR

| Repère imprimé | Code N&B | Fonction | Durée cible |
|---|---|---|---|
| ▶️ **JE COMPRENDS** | `[▶]` | Explication de la notion, le « pourquoi » | 2–4 min |
| ✍️ **JE REGARDE FAIRE** | `[✎]` | Exemple entièrement résolu, *voisin* de l'exercice, jamais identique | 3–6 min |
| 🆘 **JE SUIS BLOQUÉ** | `[SOS]` | Remédiation ultra-courte sur un prérequis précis | 1–2 min |
| ✅ **JE ME TESTE** | `[✔]` | Vérification, correction du ticket de sortie, mini-défi | 1–3 min |

Aucune cinquième famille. Si un besoin n'entre dans aucune des quatre, c'est généralement que le papier suffit.

**Code noir et blanc obligatoire** : les documents sont photocopiés. L'emoji couleur disparaît, le pictogramme `[▶] [✎] [SOS] [✔]` survit. Les deux sont imprimés côte à côte, et la légende figure en pied de chaque document.

---

## 4. Test des 3 questions : ce QR mérite-t-il d'exister ?

Avant d'ajouter un QR, il doit passer les trois :

1. **Le papier fait-il déjà cela aussi bien ?** Si oui → pas de QR.
2. **Qu'est-ce que l'élève fait juste après ?** Si la réponse n'est pas une action précise sur la feuille → pas de QR.
3. **Cette aide arrive-t-elle au moment exact du blocage ?** Un QR en fin de page pour un blocage de la ligne 3 arrive trop tard → le déplacer.

**Quotas de densité** : maximum **4 QR par page**, **1 seul `[▶]` par notion**, et jamais deux QR dans le même champ visuel (l'élève doit savoir lequel le concerne).

---

## 5. Le bloc QR standard : trois informations, toujours

Sous chaque QR, sans exception :

```
▶  Pourquoi la pente représente-t-elle l'accélération ?
⏱  3 min 10
✍  Après la vidéo : faire la question 3 sans revenir en arrière.
```

Exemple de remédiation :

```
SOS  Je ne comprends pas pourquoi on divise par U
     Scanne uniquement si tu bloques sur P = U × I.
⏱    1 min 40
✍    Puis recommence l'exercice 2 sans regarder la correction.
```

La durée imprimée doit correspondre à la durée réelle **à ±15 s près**. Une durée fausse détruit la confiance dans tout le dispositif, et l'élève cesse de scanner.

Psychologiquement, ce n'est plus « encore un QR code » : c'est une aide contextuelle.

---

## 6. Protocole téléphone

```
SCAN  →  REGARDE  →  RANGE  →  FAIS
```

Pictogramme imprimé en en-tête de chaque document :

> 📱 Téléphone autorisé uniquement lorsqu'un QR est demandé.

Le QR autorise temporairement le téléphone ; la vidéo terminée, le téléphone disparaît et l'activité revient sur la feuille. On ne combat plus le téléphone : on définit précisément quand il devient outil pédagogique et quand il redevient interdit.

**Mode dégradé prévu à l'avance** (salle sans réseau, classe sans téléphone) : la séance se déroule normalement, grâce à la règle de parité papier. Les QR `[▶]` et `[✎]` deviennent alors du travail personnel à la maison, et les `[SOS]` sont pris en charge oralement par le professeur.

---

## 7. Aide graduée : 1 QR imprimé, 3 paliers

Le point le plus coûteux de la première version du dispositif était de prévoir trois QR distincts (indice / méthode / correction) pour un même exercice : trois codes à imprimer, à maintenir, et un élève qui va directement au troisième.

**Optimisation retenue : un seul QR imprimé, trois paliers révélés en ligne.**

```
Exercice → je cherche seul
        ↓ blocage
   [SOS] un seul QR
        ↓
   Palier 1 : indice          30–45 s
   Palier 2 : méthode         1–2 min   (bouton révélé après le palier 1)
   Palier 3 : correction      3–4 min   (bouton révélé après le palier 2)
```

Gains : un tiers de codes imprimés, la gradation reste intacte, et le niveau d'aide peut être modifié après impression sans réimprimer quoi que ce soit. On reconstruit numériquement ce que fait un bon professeur qui circule dans la salle : il ne donne pas la solution, il donne juste assez d'aide pour permettre de repartir.

---

## 8. URL permanentes : le QR ne pointe jamais vers une vidéo

```
QR imprimé  →  adresse permanente Maths au Cube  →  ressource actuelle
```

Un QR pointant directement vers YouTube ou VEED fige 200 documents imprimés sur une ressource qu'on ne pourra plus remplacer. Le QR pointe donc vers une **adresse permanente**, et cette adresse seule décide de la destination.

**Convention de slug** : `<notion>-<numéro>[-<palier>]`, en minuscules, sans accent.
Exemples : `derivee-01`, `derivee-01-sos`, `puissance-loi-ohm-02`.

**Source de vérité** : `qr-registry.json` à la racine du dépôt. Un slug imprimé n'est **jamais** supprimé ni réattribué ; on change uniquement sa cible.

**Résolveur** : `v/index.html`, déjà publié avec le site.

| Aujourd'hui | Demain |
|---|---|
| `https://<site-github-pages>/v/?r=derivee-01` | `https://mathsaucube.fr/v/derivee-01` |

Le passage au domaine propre se fera par un simple CNAME : **les QR déjà imprimés continueront de fonctionner**.

**Dette de production interdite** : on n'imprime jamais un QR dont l'entrée n'existe pas dans le registre. Une ressource pas encore filmée se déclare `"statut": "a_produire"` — le résolveur affiche alors une page « en préparation » qui renvoie explicitement l'élève vers la consigne papier, au lieu d'une erreur 404 qui décrédibilise le document.

---

## 9. Spécifications techniques d'impression

- taille minimale imprimée : **2 cm × 2 cm** (2,5 cm si photocopie de photocopie) ;
- correction d'erreur **niveau Q**, pour rester lisible malgré l'usure et l'agrafe ;
- marge blanche (quiet zone) d'au moins 4 modules, jamais de texte collé au code ;
- jamais dans la pliure, dans la zone d'agrafage ni à moins de 1 cm du bord ;
- noir sur blanc uniquement — pas de QR en vert, bleu ou orange, le contraste chute à la photocopie ;
- **test obligatoire** : scanner le QR sur une photocopie, pas sur l'écran, avant diffusion.

---

## 10. Règle de production et priorisation

Idéal par notion importante :

```
1 fiche papier + 1 microvidéo [▶] + 1 microvidéo [✎] + éventuellement [SOS] + 1 activité de vérification [✔]
```

Mais quatre vidéos par notion n'est pas soutenable sur une année complète. **Priorisation par taux d'échec** :

| Priorité | Cible | À produire |
|---|---|---|
| P1 | Notions à fort taux d'échec récurrent | `[▶]` + `[✎]` + `[SOS]` |
| P2 | Notions centrales mais globalement acquises | `[✎]` seul |
| P3 | Notions périphériques | rien — le papier suffit |

Cadence réaliste : **2 microvidéos par semaine**, soit ≈ 70 sur une année scolaire, ce qui couvre l'essentiel d'un niveau en deux ans et constitue une bibliothèque réutilisable d'année en année.

**Trame de microvidéo** (rythme quasi constant) :

```
0:00  problème concret
0:15  ce qu'on cherche
0:30  explication visuelle
2:00  exemple
3:30  erreur fréquente
4:00  « à toi »
```

Configuration : caméra du téléphone pour l'introduction (visage, 10–15 s), puis écran/tablette graphique pour écrire et annoter, voix par-dessus. Segmentation, signalement des éléments importants et mise en action de l'apprenant correspondent aux recommandations issues de la recherche sur la vidéo pédagogique.

---

## 11. Ce que protège réellement le dispositif

Une protection anticopie de PDF est fragile et sera contournée. Le levier réel est différent : **rendre le document beaucoup moins intéressant hors de l'écosystème Maths au Cube**.

Un document photocopié conserve les QR, mais :
- les QR pointent vers le résolveur Maths au Cube, dont vous seul décidez du contenu ;
- chaque vidéo porte votre voix, votre vocabulaire, vos méthodes, votre charte, vos exemples industriels ;
- la fiche devient une porte d'entrée vers votre univers pédagogique plutôt qu'une simple feuille photocopiable.

Quelqu'un pourra toujours photocopier la feuille. Il photocopiera une feuille qui dit : « Bonjour, c'est Nacer. Ici, on va utiliser la Méthode du Film… »

---

## 12. Mesure (phase 2, optionnelle)

Le résolveur statique actuel **ne collecte rien** : aucun compteur, aucun cookie, aucune donnée élève — cohérent avec la posture RGPD du dépôt.

Un comptage anonyme par slug (quel `[SOS]` est massivement scanné ?) nécessite un backend minimal et fera l'objet d'une décision séparée. Il constituerait le premier jeu de données réel du projet : il indiquerait quelles vidéos produire en priorité, au lieu de le deviner. Contrainte imposée d'avance : **agrégat par slug uniquement, jamais d'identification d'élève**.

---

## 13. Exemple complet : fiche « Dérivée » (CFAI4)

**En-tête** — *Rampe de vitesse : comprendre la dérivée* + schéma moteur/convoyeur + pictogramme téléphone.

**Situation** — v(t) passe de 0 à 1500 tr/min en 5 secondes. Graphe imprimé.

À côté du graphe :
```
▶  [▶] Pourquoi la pente représente-t-elle l'accélération ?
⏱  3 min 10          ✍  Puis réponds à la question 1.
```

**Formalisation** — a = Δv / Δt, encadré sur le papier.

En marge :
```
SOS  [SOS] Je ne comprends pas le symbole Δ
⏱   1 min 15         ✍  Puis reprends le calcul de a.
```

**Exercice** — première question :
```
✍  [✎] Regarde-moi résoudre un exemple similaire (pas le même)
⏱  4 min             ✍  Puis fais la question 2 seul.
```

**Ticket de sortie** (papier, 4 questions courtes) :
1. Qu'est-ce qu'une pente ?
2. Que représente-t-elle ici ?
3. Que signifie une pente plus grande ?
4. Calculer celle de la courbe B.

```
✔  [✔] Vérifie ta compréhension — correction vidéo
⏱  1 min 30
```

Total : **4 QR sur la page**, quota respecté, chacun rattaché à un moment de blocage identifié.

---

## 14. Checklist avant diffusion

- [ ] Le document reste utilisable sans aucun scan (règle de parité papier).
- [ ] 4 QR maximum, chacun passe le test des 3 questions.
- [ ] Chaque QR porte : pourquoi / durée réelle / action après.
- [ ] Emoji **et** code N&B imprimés, légende en pied de page.
- [ ] Pictogramme téléphone en en-tête.
- [ ] Chaque slug existe dans `qr-registry.json`.
- [ ] Aucun QR ne pointe directement vers une plateforme vidéo.
- [ ] QR testé au scan **sur photocopie**.
- [ ] Ticket de sortie présent.

---

## 15. Légende à reproduire en pied de chaque document

```
[▶] COMPRENDRE   [✎] VOIR FAIRE   [SOS] DÉBLOQUER   [✔] SE TESTER
📱 Téléphone autorisé uniquement lorsqu'un QR est demandé.
Tout le cours fonctionne sans scanner : les QR sont une aide, pas une obligation.
```

Au bout de quelques semaines, un apprenti qui voit `[SOS]` sait immédiatement : « je ne scanne ça que si je suis bloqué ». C'est exactement l'objectif — réduire la charge mentale consacrée à comprendre le document, pour la consacrer aux mathématiques.
