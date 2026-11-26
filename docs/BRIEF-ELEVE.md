# Brief élève — guide et architecture

Application locale (`brief-eleve.html`) pour les cours particuliers et le suivi individuel. Aucune donnée ne quitte le navigateur.

## Fichiers
| Fichier | Rôle |
|---|---|
| `brief-eleve.html` | Application (vues Aujourd'hui · Élève · Registre · Données) |
| `brief-eleve-referentiels.js` | **Source de vérité** des référentiels : calendrier, domaines, prérequis, questions flash |

## Saisie rapide (barre du haut, touche `/`)
Format : `Nom, élément, élément…`. Un aperçu « Je comprends : … » s'affiche **avant** l'enregistrement (Entrée pour valider, Échap pour annuler, bouton Annuler après coup).

| Saisie | Effet |
|---|---|
| `Lucas, première, spé maths` | profil + spé maths 1re + maths de l'enseignement scientifique ; SVT/PC proposées « à confirmer » |
| `Lucas, blocage : signe de la dérivée` | blocage relié au domaine + prérequis à tester |
| `Lucas, devoir : ex 12 p 54 pour vendredi` | devoir daté (demain, lundi…, 12/12, AAAA-MM-JJ, dans 3 jours) |
| `Lucas, DS suites le 12/12` | échéance : booste les domaines liés à J-21 |
| `Lucas, 2/3 suites` | mini-test → état (≥ 80 % maîtrisé, ≥ 50 % en cours, sinon à revoir) |
| `Lucas, ok dérivation` / `revoir …` / `en cours …` | état manuel |
| `Lucas, confiance 4 suites` | confiance déclarée (1-4) → alerte sur/sous-confiance |
| `Lucas, séance 1h30 payée` | séance + règlement |
| `Lucas, chapitre : produit scalaire` | chapitre vu en classe |
| `blocage : fractions` (sans nom) | s'applique à l'élève ouvert |

## Logique de priorité (transparente, affichée)
Score = état (à revoir 4, en cours 3, à vérifier 3, à situer 2) + chapitre en classe (+3) + blocage ouvert (+2 chacun) + prérequis d'un blocage (+1,5) + échéance liée ≤ 21 j (+3) + surconfiance (+1).
C'est un repère de travail, pas un ordre officiel.

## Fonctions ajoutées par rapport à la V1
1. **Aperçu avant validation + Annuler** : supprime les erreurs de saisie silencieuses.
2. **Répétition espacée** : un domaine maîtrisé repasse « À vérifier » après 7 → 21 → 60 → 120 jours.
3. **Diagnostic flash des prérequis** : chaque blocage déclenche 1 question par prérequis (réponse attendue fournie).
4. **Calibration de la confiance** : on compare la confiance de l'élève aux preuves (surconfiance / sous-confiance).
5. **Brief 30 secondes** à copier ou imprimer avant la séance.
6. **Message aux parents** généré et formulé en positif.
7. **Tableau de bord du jour** : devoirs en retard ou à J-3, échéances à J-21, rappels dus, élèves pas vus depuis 14 jours, montants non réglés.
8. **Séances et règlements** : tarif horaire, heures du mois, impayés.
9. **Export Obsidian** (.md avec propriétés YAML) pour un élève ou pour tous.
10. **Mode pseudonymes** et **export SAFE** (noms → Élève-NN, notes masquées).
11. **Registre daté** : alerte si la vérification a plus de 120 jours ; fiabilité (%) par référentiel ; domaines marqués `indicatif` / `banque`.

## V3 — de l'outil de suivi à l'outil de séance
| Fonction | Usage |
|---|---|
| **Plan de séance minuté** | Calé sur la durée (45/60/90/120) et l'heure de la prochaine séance : flash prérequis → rappel espacé → devoir à J-3 → 1 ou 2 priorités → ticket de sortie. Chaque priorité reçoit une consigne selon son état : *situer* (3 questions graduées), *sécurisation*, *maîtrise*, *transfert*. |
| **Clôture en 30 s** | Un écran : domaines travaillés, score du ticket de sortie (0-3/3), blocages résolus, durée, règlement, note, prochaine séance. Complète la séance déjà saisie par la barre au lieu de la dupliquer. |
| **Agenda** | `Lucas, prochaine mardi 17h30` ou champs date/heure. Tableau du jour : séances des 7 jours, séances passées non clôturées. |
| **Évolution** | Notions maîtrisées avant → après chaque séance, courbe, notions gagnées par heure, temps investi par domaine. Le message aux parents cite ce progrès factuel. |
| **Fiches réflexes** | JE VOIS → JE PENSE → JE FAIS → JE VÉRIFIE pour chaque prérequis lié à un blocage, avec la question flash ; impression seule pour l'élève. |
| **Récap du mois / CSV** | Texte prêt à envoyer (séances, heures, montant, reste dû) ; export CSV des séances du mois (Excel, séparateur `;`). |
| **Rappel de sauvegarde** | Bandeau après 7 jours de modifications non exportées. |
| **Fusion sûre à l'import** | Pour chaque élève, la version la plus récente gagne ; le bilan est affiché. |

Corrections : date du jour calculée en heure locale (et non UTC, faux entre minuit et 1-2 h) ; double point final dans le message aux parents.

## Mettre à jour le registre
1. Vérifier les textes (BO, Éduscol).
2. Modifier `brief-eleve-referentiels.js` : `from`/`until` ou `fromByLevel`/`untilByLevel`, `domains`, `certainty`.
3. Changer `VERIFIED`.
4. `node scripts/check-registry.mjs` : doit afficher 0 erreur (exécuté aussi en CI). Chaque prérequis doit avoir une question flash **et** une fiche réflexe.

Points à confirmer en priorité : domaines des nouveaux programmes 2026 (actuellement indicatifs), calendrier 6e, modules maths du BTS Électrotechnique.

## Hors périmètre (non activé)
Capture SMS/WhatsApp, analyse de photos, transcription audio : nécessitent des services externes. Si on les ajoute un jour : capture → n8n → texte au format de la saisie rapide → import JSON.

## Planning professionnel → progressions des sections (onglet « Sections »)
**Principe : lecture seule, aucune connexion.** L'application ne se connecte pas à NetYpareo et ne stocke aucun identifiant. Tu exportes toi-même ton planning depuis le portail, avec ton compte, puis tu importes le fichier. Il est lu dans le navigateur et n'est envoyé nulle part.

### 1. Exporter depuis NetYpareo
1. Ouvrir son planning sur le portail, comme d'habitude.
2. Chercher une icône ou un menu d'export : **iCal / iCalendar / .ics / « Synchroniser avec mon agenda »**. Le format .ics est le meilleur : chaque créneau a un identifiant stable, donc les déplacements sont détectés.
3. À défaut : un export **CSV / Excel** avec au minimum les colonnes `Date` et `Heure début` (idéalement aussi `Heure fin`, `Matière`, `Groupe`, `Salle`). Excel : « Enregistrer sous… CSV (séparateur point-virgule) ».
4. Si aucun export n'apparaît, demander au service planning ou informatique de l'établissement si l'export iCal est activé pour les formateurs.

Prudence :
- Un **lien d'abonnement iCal** donne accès au planning à quiconque le possède. Ne pas le partager, ne pas le committer (`*.ics` est dans `.gitignore`).
- Exporter son propre planning pour son usage professionnel est un usage normal du portail. Avant de partager un fichier qui contient d'autres personnes (collègues, apprentis), vérifier les règles internes de l'établissement.

### 2. Importer et rattacher
- Onglet **Sections** → « Choisir un fichier ». Ré-importer chaque semaine ou chaque mois : les créneaux **nouveaux, déplacés et disparus** sont signalés. Seuls les créneaux de la même période, du même type d'export et des mêmes sections peuvent être marqués « disparus ».
- Les créneaux sont rattachés à une section par des **règles de mots-clés** (TMELEC, BTS1… fournies par défaut, modifiables). La matière est reconnue par « maths » ou « physique / chimie / sciences ». Les intitulés non reconnus sont listés avec un bouton pour créer la règle.
- Les créneaux « CCF, évaluation, examen, bac blanc, contrôle, DS » sont des **jalons** : ils ne consomment pas d'heures de progression.

### 3. Progression et suivi
- Les heures réelles du planning sont réparties sur les domaines du registre (même section et même matière), dans l'ordre, après une **réserve** (10 % par défaut) pour les révisions, la remédiation et le rattrapage. Un **poids** (×0,5 à ×3) donne plus ou moins d'heures à un domaine.
- Pour chaque domaine : période prévue, heures, nombre de séances, statut (à venir, en cours, en retard, traité). Tu coches « traité » au fil de l'année.
- Indicateurs : % du temps écoulé, % du programme traité, heures de retard.
- Le tableau **Aujourd'hui** affiche tes cours du jour avec le domaine prévu par la progression.
- Exports : CSV (Excel) et Markdown pour Obsidian (frontmatter compatible avec `second-brain/brain.py`).

Limites :
- Les heures sans indicateur UTC sont lues dans le fuseau de l'appareil (Europe/Paris en pratique).
- L'ordre des domaines suit le registre : c'est un repère de travail, pas l'ordre imposé par le programme.
- Le niveau 1MELEC n'a pas encore de domaines dans le registre : seules ses heures sont suivies.
