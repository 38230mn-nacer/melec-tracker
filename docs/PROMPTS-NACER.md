# Prompts Nacer — 10 prompts à fort levier

Dérivés des « 31 usages » et adaptés à ton contexte. Stratégie : [`STRATEGIE-IA-31-USAGES.md`](STRATEGIE-IA-31-USAGES.md).
Remplace ce qui est entre `[crochets]`. À coller dans Claude Code (ou Claude avec outils / Cowork).

**Règles communes (déjà intégrées) :** RGPD élèves = pseudonymes uniquement · respect BO / référentiel en vigueur · méthode JE VOIS → JE PENSE → JE FAIS → JE VÉRIFIE · couleurs Maths au Cube vert/bleu/orange · toute production passe par un vérificateur.

| # | Prompt | Objectif | Source |
|---|---|---|---|
| 1 | Scan de marché | Revenus | 30 |
| 2 | Simulateur électrotechnique | Revenus + portfolio | 26 |
| 3 | Usine à ressources multi-agents | Efficience + revenus | 17, 23 |
| 4 | Radar annales | Efficience + Data | 19, 27 |
| 5 | Exoplanètes TESS | Portfolio Data + séance wow | 18 |
| 6 | Offre de formation CFA | Revenus | — |
| 7 | Tarification & négociation | Revenus | 11 |
| 8 | Jeu de révision avec classement | Engagement | 29 |
| 9 | Brief du lundi (n8n) | Efficience | 6 |
| 10 | Auto-coach d'attention (MediaPipe) | Apprentissage Python/vision | 9 |

---

## 1. Scan de marché — trouver le produit que personne n'a fait

```text
Je suis professeur de maths-sciences en Bac Pro MELEC et BTS Électrotechnique, et je code (HTML/JS, Python débutant).
Objectif : trouver le produit pédagogique numérique que personne n'a encore fait sur mon créneau.

1. Recense l'offre existante (éditeurs scolaires, plateformes de vente de ressources entre profs, sites gratuits,
   simulateurs en ligne, chaînes YouTube) pour : maths et physique-chimie en voie professionnelle, en particulier
   le lien avec l'électrotechnique. Pour chaque offre : public, format, prix, avis, points faibles.
2. Construis une grille (notion du programme × format : fiche, vidéo, simulateur, jeu, évaluation, outil prof)
   et marque les cases vides ou mal servies.
3. Croise avec les notions du programme officiel en vigueur (cite le BO) et les difficultés fréquentes des élèves de LP.
4. Propose les 5 meilleurs vides, chacun avec : produit concret, acheteur (élève, parent, prof, établissement, CFA),
   prix plausible, effort de création, pourquoi personne ne l'a fait, et comment le tester en 7 jours pour moins de 50 €.
5. Recommande UN gagnant et justifie.
Sépare clairement faits sourcés (avec liens), estimations et hypothèses. Donne un % de certitude par conclusion.
Livre le tout dans un fichier markdown.
```

---

## 2. Simulateur électrotechnique interactif (produit phare)

```text
Construis un site interactif, un seul fichier HTML autonome hors ligne (comme mon derivees-defi.html),
pour faire comprendre [le transformateur monophasé / le moteur asynchrone / le pont de Graëtz + filtrage]
à des élèves de Terminale Bac Pro MELEC en difficulté.

Progression : RÉEL → EXPÉRIENCE → OBSERVATION → MESURE → MODÈLE → FORMULE → APPLICATION PRO.
1. Assemblage : l'élève monte la machine pièce par pièce, une courte note par pièce (une idée à la fois).
2. Simulation : curseurs (tension, nombre de spires, charge…), oscillogrammes et appareils de mesure virtuels
   avec valeurs cohérentes physiquement (vérifie chaque formule).
3. Défis « prédis avant de mesurer » avec retour immédiat, et un piège classique par notion.
4. Situation professionnelle authentique (ex. plaque signalétique, choix d'un transfo pour une installation).
5. Mode professeur : vidéoprojection, gros caractères.
Charte Maths au Cube (vert, bleu, orange), mobile d'abord, aucune collecte de données.
Montre-moi le plan et les formules utilisées avant de coder. Ensuite, liste ce qu'il faudrait pour le vendre
en licence établissement (version, pages, conditions).
```

---

## 3. Usine à ressources multi-agents

```text
Je veux un pipeline réutilisable pour produire mes ressources pédagogiques. Monte une équipe de sous-agents,
une mission chacun, un dossier de travail par agent dans _AI/10_PROPOSITIONS/[nom-ressource]/ :

- CONCEPTEUR : à partir de [notion + niveau + durée + profil de classe], produit la séance selon
  POURQUOI → PROBLÈME → INTUITION → FORMALISATION → MÉTHODE → EXEMPLE → PIÈGE → ENTRAÎNEMENT → TRANSFERT,
  avec une fiche réflexe JE VOIS / JE PENSE / JE FAIS / JE VÉRIFIE.
- DIFFÉRENCIATEUR : 3 niveaux (sécurisation, maîtrise, transfert) qui diffèrent par le raisonnement et l'autonomie,
  pas seulement par les nombres.
- ÉVALUATEUR : mini-test qui vérifie reconnaître / choisir / appliquer / détecter une erreur / expliquer / transférer.
- VÉRIFICATEUR (contexte vierge, n'a pas vu la conception) : refait chaque calcul, contrôle la conformité au
  référentiel [fourni], la charge cognitive et les unités ; renvoie la liste des erreurs au concepteur.
  Boucle jusqu'à zéro erreur bloquante.
- METTEUR EN PAGE : export compatible avec ma chaîne Word CFAI (équations natives) et emplacements QR selon
  docs/STANDARD-DOCUMENT-AUGMENTE.md.
Commence par [notion pilote] et montre-moi le plan avant de lancer quoi que ce soit.
Ne modifie aucun fichier hors de _AI/.
```

---

## 4. Radar annales (ce qui tombe vraiment)

```text
Je veux savoir ce qui tombe réellement à [l'épreuve de maths / physique-chimie du Bac Pro / les CCF du BTS Électrotechnique].
Sources : sujets officiels publics [liens ou dossier de PDF], sessions [2015–2026].
1. Découpe le corpus par session et lance un sous-agent par lot, en parallèle.
2. Chaque agent extrait dans un fichier commun (CSV) : session, exercice, notion du référentiel, capacité,
   contexte professionnel, type de question, points, piège identifié.
3. Un agent final fusionne, déduplique, puis produit :
   - fréquence des notions et tendance dans le temps ;
   - les 10 automatismes qui rapportent le plus de points ;
   - les contextes professionnels récurrents ;
   - les notions du programme jamais ou rarement évaluées.
4. Écris le traitement en Python (pandas) + une base SQLite, avec le code commenté pour que je comprenne
   chaque étape : c'est aussi mon projet portfolio Data.
Signale toute extraction incertaine. Ne redistribue pas les sujets eux-mêmes.
```

---

## 5. Exoplanètes TESS — projet Data + séance « wow »

```text
Je débute en Data Science (Python). Apprends-moi l'analyse de séries temporelles en cherchant des transits
d'exoplanètes dans les courbes de lumière publiques de TESS (bibliothèque lightkurve), autour de [étoiles connues d'abord].
Étapes : CONCEPT → INTUITION → EXEMPLE → MANIPULATION → EXERCICE → MINI-PROJET.
1. Retrouve d'abord une planète connue (validation de méthode).
2. Puis cherche des signaux périodiques, teste-les contre de faux signaux (binaires à éclipses, bruit),
   prédis une période cachée à partir des autres, et vérifie ExoFOP avant toute conclusion.
3. Notebook Jupyter commenté, chaque cellule expliquée.
4. Dérive une activité de 55 min pour Terminale Bac Pro (lumière, intensité, période, lecture graphique,
   proportionnalité) avec un vrai jeu de données simplifié.
Distingue toujours résultat robuste, signal faible et hypothèse.
```

---

## 6. Offre de formation « IA pour enseignants de la voie pro »

```text
Je veux vendre une formation à des CFA, GRETA, lycées professionnels et organismes de formation continue :
« L'IA au service de la pédagogie en voie professionnelle — de la préparation à l'évaluation ».
Mes preuves : [DeltaTracker, Défi Dérivées, Standard Document augmenté, usine à ressources, simulateurs].
Produis :
1. 3 formats (atelier 3 h, journée, parcours 3 × 3 h) avec objectifs, programme, livrables pour les participants.
2. Les contraintes à respecter : RGPD et données d'élèves, usage responsable de l'IA, cadre institutionnel
   actuel sur l'IA dans l'éducation (vérifie les textes en vigueur et cite-les).
3. Tarifs du marché pour ce type de prestation (sources), et ma fourchette recommandée.
4. Si pertinent : ce qu'implique une certification Qualiopi ou le passage par un organisme porteur.
5. Une page de présentation d'une page + un email de prise de contact pour un directeur de CFA (court, sans jargon).
6. La liste de 20 cibles types et comment les trouver.
Indique un % de certitude sur chaque chiffre.
```

---

## 7. Tarification et négociation (cours particuliers / prestations)

```text
Je propose [cours particuliers de maths-physique lycée-BTS / formation / licence de simulateur] à [ville / en ligne].
1. Recherche les tarifs pratiqués (plateformes, indépendants, ta source à chaque fois) pour mon niveau et ma zone.
2. Construis 3 offres : standard, premium (méthode + suivi data + rapport mensuel parent généré à partir de mes notes
   pseudonymisées), intensive (stage examen). Prix d'ouverture, prix plancher, ce qui justifie l'écart.
3. Rédige mes messages : présentation, réponse à « c'est trop cher », relance, conclusion. Poli, honnête, sans
   promesse de résultat, aucun fait inventé.
4. Rappelle ce que je dois vérifier côté statut (cumul d'activités, micro-entreprise, avance immédiate de crédit d'impôt).
```

---

## 8. Jeu de révision avec classement de classe

```text
Fais un jeu web mobile, un seul fichier HTML, pour réviser [notion] en Terminale Bac Pro MELEC.
Mécanique originale de course / réflexe (inspirée du genre « runner », pas une copie d'un jeu existant) :
les obstacles sont des questions éclair (une notion à la fois), les bonus des fiches réflexes.
Erreurs fréquentes intégrées comme pièges, retour immédiat expliqué.
Classement de classe par PSEUDONYME uniquement (aucun nom, aucune donnée personnelle), stockage minimal.
Charte Maths au Cube. Ajoute une affiche A4 imprimable avec QR code vers le jeu (format Document augmenté).
Montre-moi comment le mettre en ligne sur GitHub Pages.
```

---

## 9. Brief du lundi automatisé (n8n)

```text
Je veux un brief envoyé chaque lundi à [6 h 40] sur [mon email / Telegram], construit avec n8n.
Contenu : mes cours de la semaine (Google Agenda), la séance prévue pour chaque classe, les 3 élèves à surveiller
d'après l'export SAFE pseudonymisé de DeltaTracker, les échéances CCF, et UNE action prioritaire sur mon projet IA/Data.
1. D'abord : décris le processus manuel en 5 étapes et vérifie qu'il est stable (je le fais 2 semaines à la main).
2. Ensuite : workflow n8n nœud par nœud, avec où mettre les identifiants (jamais dans le workflow en clair).
3. Explique chaque nœud comme à un débutant, comment le tester, les erreurs probables.
Aucune donnée nominative d'élève ne doit sortir de mon ordinateur.
```

---

## 10. Auto-coach d'attention (projet Python / vision, usage personnel)

```text
Projet d'apprentissage Python : code une petite appli [Windows / Mac] qui utilise MA webcam (usage personnel uniquement,
jamais en classe ni sur des élèves) pour détecter quand je regarde mon téléphone pendant mes blocs de travail profond.
Tout en local, aucune image enregistrée ni envoyée. MediaPipe.
Signal discret + compteur par bloc de 25 min + bilan de la journée (CSV + graphique matplotlib).
Explique chaque bloc de code : capture vidéo, repères du visage, calcul de l'orientation, seuil, journalisation.
Puis propose 3 améliorations qui me font progresser en Data (analyse de mes données de concentration).
```

---

## Méta-prompt : transformer n'importe quel « usage viral » pour moi

```text
Voici un usage de l'IA vu en ligne : [colle-le].
Évalue-le pour moi sur 4 critères notés /5 : compétences futures, activité actuelle, avantage différenciant
(maths + sciences + pédagogie + terrain LP/CFA + IA/data), création d'un actif réutilisable ou vendable.
Si total < 12 : dis-le-moi en une ligne et passe. Sinon : réécris le prompt adapté à mon contexte,
avec livrable, risques (RGPD, statut, propriété intellectuelle) et prochaine action.
```

> **À capitaliser dans le second cerveau :** ce fichier → `90_PROMPTS_SYSTEME/` (Obsidian), le méta-prompt en priorité.
