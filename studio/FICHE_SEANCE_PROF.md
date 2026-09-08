# Fiche de séance — Studio « Dérivation en électromécanique »

**Public** : professeur de mathématiques / sciences physiques qui ne maîtrise pas l'électrotechnique.
**Objectif de cette fiche** : vous permettre d'animer les 3 séances ci-dessous sans avoir besoin d'un collègue d'électrotechnique — tout le vocabulaire technique est expliqué ici, en une phrase, avant que vous en ayez besoin à l'oral.

---

## 0. Vue d'ensemble

| Séance | Titre | Durée | Électrotechnique requise | Public conseillé |
|---|---|---|---|---|
| **1** | Le concept de dérivée | 55 min | Aucune | Tous niveaux |
| **2** | Dérivée en électromécanique (porte, convoyeur, moteur) | 55 min | Lexique §2 (4 notions) | Bac Pro Term MELEC / BTS1 |
| **3** | Rampes de variateur, bobine, condensateur | 55 min | Lexique §3 (5 notions) | BTS prioritaire, allégeable en Bac Pro (voir note) |

Les 3 séances sont indépendantes : vous pouvez ne faire que la Séance 1, ou enchaîner les trois sur une semaine. Chaque séance suit le même squelette : ouverture (5 min) → démonstration guidée (25 min) → manipulation élèves (20 min) → synthèse (5 min).

**Vérification faite avant de vous remettre cette fiche** : chaque valeur numérique citée ci-dessous (a = 0,75 m/s², C(0) = 17,1 N·m, etc.) a été recalculée à la main et confirmée par un test automatisé du logiciel — ce que vous verrez à l'écran correspondra à ce qui est écrit ici, aux réglages par défaut.

---

## 1. Préparation technique (commune aux 3 séances)

1. **Ouvrir l'outil** : double-cliquez sur `studio/index.html` (ou depuis `whiteboard-derivation.html`, bouton **🎛 Studio** en haut à droite). Aucune connexion internet requise, aucune installation.
2. **Choisir le niveau** en haut de l'écran : *Bac Pro MELEC* ou *BTS Électrotechnique* (change seulement la liste de gauche, l'outil est identique).
3. **Cliquer la carte** de la séance (« Disponible » en vert ; « Bientôt » en gris = pas encore prêt, ignorez).
4. **Plein écran** : touche **F** (ou bouton ⛶). **Thème sombre conseillé** au vidéoprojecteur (meilleur contraste à distance) — c'est le réglage par défaut, touche **T** pour basculer si besoin.
5. **Retour à la liste** : touche **Échap** ou bouton « ← Retour aux concepts ».

**Raccourcis clavier à connaître** (fonctionnent dans toutes les scènes) :

| Touche | Effet |
|---|---|
| Espace | Lecture / Pause |
| ← → | Avancer / reculer le curseur d'un pas |
| E | Étape suivante du panneau « Expliquer pas à pas » |
| F | Plein écran |
| T | Thème clair / sombre |
| Échap | Retour à la liste des concepts |

**Plan B** :
- *Pas de vidéoprojecteur* : l'outil fonctionne aussi bien sur votre écran, en circulant, ou projeté sur un simple écran d'ordinateur portable relié en HDMI.
- *Écran tactile qui ne répond pas au doigt* : tous les réglages ont aussi un curseur (slider) au clavier/souris — inutile de toucher l'écran, cliquez-glissez à la souris.
- *Une question vous dépasse* : chaque notion a une réponse toute prête dans les tableaux « Questions fréquentes » ci-dessous. Si vraiment aucune ne convient, dites « bonne question, je vérifie et je vous réponds au prochain cours » — c'est une réponse professionnelle acceptable, pas un aveu de faiblesse.

---

## 2. Lexique éclair — Séance 2 (à lire 5 min avant le cours)

| Terme | En une phrase | Formule à retenir | Analogie pour les élèves |
|---|---|---|---|
| **Rampe** (variateur) | Réglage qui fixe le temps pour passer de l'arrêt à la vitesse demandée. | — | Comme l'accélérateur d'une voiture : appuyer doucement ou d'un coup change le confort, pas la vitesse finale. |
| **Adhérence, coefficient μ** | Mesure à quel point une surface entraîne l'autre sans glisser. | a_limite = μ · g | Un pneu sur route mouillée (μ petit) accroche moins qu'sur route sèche (μ grand). |
| **Couple moteur C** (N·m) | L'équivalent d'une force, mais pour faire tourner quelque chose. | C = J · α + Cr | La force qu'il faut pour faire tourner une manivelle : plus elle résiste (Cr) ou plus on veut l'accélérer vite (α), plus il faut pousser fort. |
| **Inertie J** (kg·m²) | Résistance d'un objet en rotation à changer de vitesse. | — | Comme la masse, mais pour tourner : une meule lourde est plus dure à lancer et à arrêter. |
| **Couple résistant Cr** | Ce qu'il faut vaincre même à vitesse constante (frottements, charge). | — | Le vent de face quand on pédale à vitesse constante : il faut pédaler même sans accélérer. |

**Le fil rouge de la séance** : dans les 4 situations, on cherche toujours la même chose — *la pente de la courbe verte (la vitesse ou la position) donne la courbe bleue (dérivée), et une pente qui change brutalement (une cassure) crée un problème mécanique ou électrique.*

---

## 3. Lexique éclair — Séance 3 (à lire 5 min avant le cours)

| Terme | En une phrase | Formule à retenir | Analogie pour les élèves |
|---|---|---|---|
| **Rampe en S** | Une rampe où l'accélération monte et redescend en douceur au lieu d'être brutale puis nulle d'un coup. | — | Un ascenseur moderne (rampe en S, confortable) contre un vieux monte-charge (rampe linéaire, secousse au départ et à l'arrêt). |
| **À-coup (jerk)** | La dérivée de l'accélération : la sensation de secousse, même à accélération constante avant/après. | j = dα/dt | Le "à-coup" dans le dos quand un bus démarre trop sec, même si l'accélération finale n'est pas énorme. |
| **Bobine (inductance L)** | Un composant qui s'oppose aux variations *rapides* du courant. | u_L = L · di/dt | Un volant d'inertie électrique : il "n'aime pas" qu'on change le courant brusquement. |
| **Condensateur (capacité C)** | Un composant qui s'oppose aux variations *rapides* de la tension. | i_C = C · du/dt | Un ressort électrique : il "n'aime pas" qu'on change la tension brusquement. |
| **Diode de roue libre / résistance de précharge** | Un composant ajouté pour laisser le courant ou la tension varier en douceur plutôt que brutalement. | — | Un amortisseur : on ne supprime pas le choc, on l'étale dans le temps. |

**Le fil rouge de la séance** : *couper vite le courant dans une bobine crée une surtension ; charger vite un condensateur crée un appel de courant. Dans les deux cas, c'est la dérivée (di/dt ou du/dt) qui est responsable — pas la valeur finale.*

---

## 4. Séance 1 — Le concept de dérivée (aucun prérequis électrotechnique)

### Objectifs
- Voir la dérivée comme une pente qui se construit (sécante → tangente), pas comme une formule tombée du ciel.
- Savoir lire un tableau de variations à partir du signe de f′.
- Relier dérivée et sens de variation.

### Ouvrir
Carte **« Dérivation : le concept »** (1ʳᵉ carte, Bac Pro comme BTS).

### Déroulé

| Temps | Vous faites | Vous dites | Vous demandez | Réponse attendue |
|---|---|---|---|---|
| 0-5 min | Fonction par défaut *f(x) = x²* déjà affichée. | « On veut mesurer la pente de cette courbe au point A. Un point seul, pas de pente possible : il faut un deuxième point. » | — | — |
| 5-12 min | **Ne cliquez pas Lecture directement** (l'animation dure 3 secondes à vitesse normale, trop court pour commenter) : réglez d'abord la vitesse sur **×0,25**, ou utilisez le bouton **« pas ⏵ »** pour avancer par à-coups en commentant chaque étape. Le point B se rapproche de A, la droite orange (sécante) devient bleue (tangente) en fin de course. | « La droite orange relie A et B, c'est le taux de variation moyen entre les deux. Je rapproche B de A. » | « Que devient la pente de cette droite ? » | Elle se stabilise, tend vers une valeur fixe. |
| 12-18 min | Montrez le tableau **« Le taux de variation quand h → 0 »** (colonne de droite du taux). | « Regardez les nombres : 3 / 2,5 / 2,1 / 2,01 / 2,001. Ils se rapprochent tous de 2. C'est ça, le nombre dérivé. » | — | — |
| 18-25 min | Montrez le graphe du dessous (courbe de f′, bleue). Déplacez le point A (glisser sur le graphe du haut) vers x négatif. | « f′ est elle-même une fonction : sa courbe. Là où f′ est négative (bande rouge), f descend. » | « Quand f′ passe par 0, que se passe-t-il sur la courbe de f ? » | Un maximum ou un minimum. |
| 25-30 min | Cliquez le bouton **« f(x) = x³ − 3x »**. Montrez le **tableau de variations** généré en bas. | « Ce tableau, l'ordinateur ne l'a pas deviné : il a cherché où f′ s'annule, comme vous le feriez à la main. » | — | — |
| 30-45 min | **Manipulation élèves** (en binôme, un poste ou projection tournante) : chaque binôme choisit une fonction, déplace A, note f′(x₀) et le sens de variation. | — | Fiche élève : « Pour x₀ = ⟨à choisir⟩, f′(x₀) = ? f est croissante ou décroissante ? » | — |
| 45-50 min | Testez **f(x) = 1/x** : glissez A près de x = 0. | « La pente devient énorme, presque verticale. C'est pour ça qu'on exclut x = 0 du domaine. » | — | — |
| 50-55 min | Synthèse orale, panneau **« Expliquer pas à pas »** (touche E) sur la fonction en cours pour rejouer le raisonnement complet. | — | « Résumez en une phrase ce qu'est le nombre dérivé. » | La pente de la tangente = limite du taux de variation quand h tend vers 0. |

### Questions fréquentes

| Question probable | Réponse |
|---|---|
| « Pourquoi h ne peut pas être 0 directement ? » | Diviser par 0 est interdit ; on approche de 0 sans jamais l'atteindre, puis on regarde la limite. |
| « f′(x₀) = 0, ça veut dire quoi exactement ? » | La tangente est horizontale à cet endroit : souvent un maximum ou un minimum local (montrez le tableau de variations). |
| « À quoi ça sert dans la vraie vie ? » | Enchaînez sur la Séance 2 : la vitesse d'une porte, l'accélération d'un moteur, c'est exactement cette même pente. |

### Vérification de fin de séance (2 min, à l'oral ou sur ardoise)
1. Sur *f(x) = x²*, que vaut f′(3) ? *(réponse : 6, car f′(x) = 2x)*
2. Si f′(x₀) < 0, f est-elle croissante ou décroissante en x₀ ? *(décroissante)*
3. Que représente géométriquement le nombre dérivé ? *(la pente de la tangente)*

---

## 5. Séance 2 — Dérivée en électromécanique

**Avant de commencer** : relisez le lexique §2 (5 min).

### Objectifs
- Reconnaître position → vitesse → accélération comme une chaîne de dérivées, dans 4 situations professionnelles réelles.
- Relier l'accélération à un effort physique (force ou couple) via une formule simple.
- Identifier une limite technique (adhérence, couple moteur) et la traduire en action corrective sur un réglage.

### Ouvrir
Carte **« Dérivation en électromécanique »**. 4 boutons en haut : 🚪 Porte automatique, 📦 Convoyeur, ⚙️ Moteur + variateur, ⚡ Démarrage direct.

### Déroulé

| Temps | Situation | Vous faites | Vous dites | Vous demandez | Réponse attendue |
|---|---|---|---|---|---|
| 0-12 min | 🚪 **Porte** (réglages par défaut) | ▶ Lecture. Montrez les 3 courbes x(t)/v(t)/a(t) qui s'animent ensemble. | « La porte accélère, roule à vitesse constante, freine. Regardez : quand la vitesse (bleue) est une droite montante, l'accélération (orange) est un plateau constant. » | « Pourquoi l'accélération est-elle nulle sur le palier de vitesse ? » | Une vitesse constante = pente nulle = dérivée nulle. |
| 12-20 min | 🚪 Porte, réglage | Réduisez **t_acc** au minimum (glisser à gauche). | « Regardez la formule à droite : F = m·a. Je viens de réduire t_acc, donc a augmente. » | « Qu'arrive-t-il à l'effort F demandé au moteur ? » | Il augmente (même formule, a plus grand). |
| 20-32 min | 📦 **Convoyeur** (réglages par défaut : OK, pas de glissement) | ▶ Lecture. Montrez qu'à ces réglages, tout va bien (message vert). Puis réduisez **t_rampe** (variateur) à 0,2 s. | « Le colis n'est entraîné que par le frottement avec le tapis, comme une caisse posée sur le plateau d'un camion qui freine. Si le tapis accélère trop vite, le frottement ne suffit plus. » | « Regardez le message : que se passe-t-il maintenant ? » | Le colis glisse, il prend du retard (visible en pointillé rouge). |
| 32-42 min | ⚙️ **Moteur + variateur** (défaut) puis ⚡ **Démarrage direct** (défaut) | Montrez le moteur + variateur : couple demandé 7,9 N·m, message vert (OK). Basculez sur démarrage direct (mêmes valeurs par ailleurs) : couple 17,1 N·m, message rouge. | « Même moteur, même charge. La seule différence : ici il n'y a pas de variateur, on branche directement. Regardez le couple au démarrage : plus du double, et ça dépasse ce que le moteur peut donner. » | « D'après vous, pourquoi utilise-t-on un variateur en usine plutôt qu'un démarrage direct ? » | Le variateur étale l'accélération dans le temps, donc réduit le couple (et le courant) de démarrage. |
| 42-50 min | **Manipulation élèves** | En binôme : chaque groupe reçoit une situation et doit trouver un réglage qui *évite* l'alerte (porte sans profil triangulaire, convoyeur sans glissement, moteur sous C_max). | Fiche élève : « Quel réglage avez-vous changé ? Pourquoi ça fonctionne maintenant ? » | — |
| 50-55 min | Synthèse | Touche **E** sur une situation pour rejouer l'explication en 7 étapes. | — | « Dans les 4 cas, qu'est-ce qui décide si ça casse ou pas : la vitesse maximale, ou autre chose ? » | La dérivée (l'accélération), pas la vitesse elle-même. |

### Questions fréquentes

| Question probable | Réponse prête |
|---|---|
| « Pourquoi le colis glisse-t-il, physiquement ? » | Le tapis ne peut transmettre au colis, par frottement, qu'une accélération limitée à μ·g. Au-delà, le colis "n'arrive pas à suivre" et glisse (voir lexique §2). |
| « C'est quoi le J dans C = J·α + Cr ? » | L'inertie : plus la charge entraînée est lourde/large, plus il est dur de la faire accélérer, exactement comme une masse plus grande est plus dure à pousser. |
| « Pourquoi le couple est négatif au freinage ? » | Le moteur ne pousse plus la charge, il la retient : il fonctionne à l'envers et renvoie de l'énergie vers le variateur (comme freiner en descente avec le moteur d'une voiture électrique). |
| « Un élève demande la formule exacte du frottement » | a_limite = μ × g (g = 9,81 m/s², l'accélération de la pesanteur, déjà connue en sciences physiques). |

### Pièges à surveiller
- Confondre **vitesse maximale** et **accélération** comme cause du problème : insistez, c'est toujours la pente (la dérivée) qui casse quelque chose, jamais la valeur finale.
- Le signe négatif du couple au freinage peut dérouter : c'est normal, ce n'est pas une erreur d'affichage.

### Vérification de fin de séance
1. Sur la porte, si on double t_acc (rampe deux fois plus longue), l'effort F est-il plus grand ou plus petit ? *(plus petit, deux fois moins grand)*
2. Pourquoi un variateur réduit-il le couple de démarrage par rapport à un démarrage direct ? *(il étale l'accélération dans le temps, donc α = dérivée de la vitesse est plus faible)*

---

## 6. Séance 3 — Rampes de variateur, bobine, condensateur

**Avant de commencer** : relisez le lexique §3 (5 min). **Astuce** : les réglages par défaut de « Rampe de courant » et « Rampe de tension » déclenchent déjà l'alerte (surtension / courant d'appel) — vous n'avez besoin de toucher aucun curseur pour montrer le phénomène la première fois.

### Objectifs
- Voir qu'une rampe est une fonction affine par morceaux, et que sa dérivée est simplement son coefficient directeur.
- Comprendre pourquoi une cassure (changement brutal de pente) pose un problème mécanique ou électrique.
- Relier les lois u = L·di/dt et i = C·du/dt à des situations professionnelles concrètes (variateur, filtrage).

### Ouvrir
Carte **« Rampes et dérivée »**. 3 boutons : ⚙️ Rampe de vitesse, 🧲 Rampe de courant (bobine), ⚡ Rampe de tension (condensateur).

### Déroulé

| Temps | Situation | Vous faites | Vous dites | Vous demandez | Réponse attendue |
|---|---|---|---|---|---|
| 0-10 min | ⚙️ **Rampe de vitesse**, forme *Linéaire* (défaut) | ▶ Lecture. Montrez les traits verticaux rouges sur le graphe de α et de j (à-coup) : ce sont les cassures. | « La vitesse est une droite qui monte, un plateau, une droite qui descend. Sa dérivée (l'accélération) est donc constante par morceaux — sauf aux 3 cassures, où elle saute d'un coup. » | — | — |
| 10-18 min | Basculez sur *En S* | Montrez que les courbes α et j n'ont plus de trait rouge : tout est continu. | « Le variateur peut lisser la rampe : accélération qui monte et redescend en douceur au lieu de sauter. » | « Quel est le prix à payer pour cette douceur, d'après les formules ? » | L'accélération maximale est plus grande (× 1,57) pour la même durée totale. |
| 18-30 min | 🧲 **Rampe de courant** (réglages par défaut : alerte déjà active) | ▶ Lecture. Montrez la tension u_L qui reste faible sur la montée (50 V) puis explose à la coupure (−500 V, au-delà du seuil rouge). | « La bobine s'oppose aux variations rapides du courant. Ici, je coupe le courant en seulement 1 milliseconde : la dérivée est énorme, donc la tension aussi — 500 volts, alors que le composant ne supporte que 400. » | « Que proposeriez-vous pour éviter cette surtension, sans changer le courant final ? » | Couper plus lentement (augmenter t_d) — ou ajouter une diode de roue libre (donnée dans le message d'alerte). |
| 30-40 min | ⚡ **Rampe de tension** (réglages par défaut : alerte déjà active) | ▶ Lecture. Montrez le courant i_C qui grimpe à 76 A à la charge, au-delà du seuil de 30 A. | « Même principe, à l'envers : le condensateur s'oppose aux variations rapides de tension. Charger vite un gros condensateur (comme au démarrage d'un variateur) appelle un courant énorme. » | — | — |
| 40-50 min | **Manipulation élèves** | En binôme, sur bobine ou condensateur : trouver un réglage (t_d ou t_m) qui fait repasser sous le seuil. | Fiche élève : « Quelle valeur avez-vous trouvée ? Est-ce réaliste en usine (temps très long) ? » | — |
| 50-55 min | Synthèse | Touche **E** pour rejouer l'explication. | — | « Une seule phrase : qu'est-ce qui provoque la surtension ou le courant d'appel ? » | Une variation trop rapide (une dérivée trop grande), pas la valeur finale du courant ou de la tension. |

### Questions fréquentes

| Question probable | Réponse prête |
|---|---|
| « Pourquoi la bobine "n'aime pas" les variations rapides ? » | C'est une propriété physique du composant (loi u = L·di/dt) : plus di/dt est grand, plus u est grand. Il n'y a pas besoin de justifier plus loin à ce niveau — c'est une loi, comme F = m·a. |
| « C'est quoi une diode de roue libre concrètement ? » | Un composant ajouté en parallèle de la bobine (relais, moteur) qui offre un chemin au courant pour redescendre en douceur au lieu de créer une surtension. |
| « Pourquoi le condensateur a besoin d'une résistance de précharge ? » | À la mise sous tension, le condensateur est vide (0 V) : sans précharge, la dérivée du/dt serait énorme et le courant d'appel détruirait les composants. La résistance limite ce courant, puis est court-circuitée une fois le condensateur chargé. |
| « Ça sert à quoi dans un variateur réel ? » | Le variateur contient justement des condensateurs (bus continu) et pilote des bobines (le moteur) : les deux phénomènes de cette séance s'y produisent réellement à chaque démarrage. |

### Note d'allègement pour Bac Pro MELEC
Si le temps ou le référentiel ne permet pas d'aller jusqu'à L·di/dt et C·du/dt, limitez la séance à la situation **⚙️ Rampe de vitesse** (Linéaire vs En S) : elle ne demande que la notion de fonction affine par morceaux, déjà couverte en Séance 1. *(Le placement exact de la bobine/condensateur dans votre référentiel Bac Pro MELEC est à vérifier avec le programme en vigueur dans votre établissement — cette fiche ne s'y substitue pas.)*

### Vérification de fin de séance
1. Pourquoi une rampe en S évite-t-elle les à-coups ? *(l'accélération y est continue, sans saut brutal)*
2. Dans u_L = L·di/dt, qu'est-ce qui rend u_L très grand ? *(un di/dt très grand, c'est-à-dire un courant qui varie très vite)*

---

## 7. À capitaliser après usage

Notez ici, séance après séance, ce qui a bien fonctionné ou non (réglages qui parlent le mieux aux élèves, questions imprévues, timing réel) — ces retours sont la vraie valeur durable, à reverser dans une prochaine version de cette fiche.

| Date | Séance | Ce qui a marché | Ce qui a coincé | Ajustement pour la prochaine fois |
|---|---|---|---|---|
| | | | | |
