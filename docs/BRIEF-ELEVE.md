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

## Mettre à jour le registre
1. Vérifier les textes (BO, Éduscol).
2. Modifier `brief-eleve-referentiels.js` : `from`/`until` ou `fromByLevel`/`untilByLevel`, `domains`, `certainty`.
3. Changer `VERIFIED`.

Points à confirmer en priorité : domaines des nouveaux programmes 2026 (actuellement indicatifs), calendrier 6e, modules maths du BTS Électrotechnique.

## Hors périmètre (non activé)
Capture SMS/WhatsApp, analyse de photos, transcription audio : nécessitent des services externes. Si on les ajoute un jour : capture → n8n → texte au format de la saisie rapide → import JSON.
