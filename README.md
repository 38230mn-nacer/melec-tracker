# MELEC Tracker

Suivi des compétences **APP / ANA / REA / VAL / COM** en Bac Pro MELEC.
Fichier HTML unique, 100 % hors ligne, aucune donnée envoyée sur Internet.

## Utilisation

- Double-cliquer sur `index.html` (ou l'ouvrir depuis le téléphone).
- Ou lancer un serveur local : `python -m http.server 8785 --directory melec-tracker` → http://localhost:8785

Les données sont stockées dans le **localStorage du navigateur utilisé** (clé `melec_full_data`).
Un navigateur ≠ un autre : pensez à la sauvegarde JSON (onglet Tableau → *Données*).

## Installation sur téléphone (Android / Samsung)

### Méthode recommandée : application installée (PWA)

1. Publier les 7 fichiers du dossier sur un hébergement **https** gratuit
   (GitHub Pages, Cloudflare Pages…). Le contenu publié ne contient **aucune donnée élève**.
2. Sur le téléphone : ouvrir l'URL dans Chrome → menu ⋮ → *Ajouter à l'écran d'accueil*
   (ou *Installer l'application*).
3. Vérifier : mode avion, puis lancer depuis l'icône. L'application doit s'ouvrir normalement.

Le service worker (`sw.js`) met les 7 fichiers en cache au premier lancement : la connexion
n'est nécessaire que cette première fois, et pour les mises à jour.

> **Mise à jour** : après toute modification d'`index.html`, incrémenter `CACHE_VERSION`
> dans `sw.js` (`melec-v1` → `melec-v2`), sinon les téléphones gardent l'ancienne version.

### Méthode sans aucune connexion : fichier seul

Copier **`index.html`** (seul, il est autonome) dans `Download` du téléphone, puis l'ouvrir
dans Chrome via l'adresse `file:///storage/emulated/0/Download/index.html`.

⚠️ Selon le mode d'ouverture, Android peut interdire le stockage local : dans ce cas
l'application affiche « Sauvegarde impossible » et les saisies sont perdues à la fermeture.
Test en 30 s : ajouter un apprenti, fermer l'onglet, rouvrir l'adresse. S'il a disparu,
utiliser la méthode PWA.

## Vérification

Ouvrir `index.html?selftest=1` : un panneau affiche le résultat des 44 tests unitaires
(seuils de jauges, échappement HTML, validation des scores, normalisation des données,
fenêtre glissante des 5 dernières observations, intégrité du lot de questions et
idempotence de la fusion). Attendu : **44/44 OK**.

Depuis la console : `window.__tracker.selfTest()`.

## Banque de questions

Un lot **Terminale Bac Pro MELEC** de 80 items est intégré au fichier : 40 en sciences
physiques, 40 en mathématiques (groupement A), sur 16 thèmes × 5 compétences.

| Sciences physiques | Mathématiques |
|---|---|
| `ALT` alternatif sinusoïdal · `PUI` puissances et cos φ · `TRI` triphasé · `MAS` moteur asynchrone | `CAL` calcul et notation scientifique · `FON` fonctions et lecture graphique · `SUI` suites · `DER` dérivée |
| `RED` redressement et filtrage · `SEC` sécurité électrique · `ENE` énergie et rendement · `MES` mesures et EXAO | `TRG` trigonométrie et sinusoïdes · `ST1` stats 1 variable · `ST2` stats 2 variables · `PRO` probabilités |

Codage : `DISCIPLINE-COMPÉTENCE-THÈME-NN` (ex. `SCI-VAL-MAS-19`).

- **Installation neuve** : les 80 questions sont présentes d'emblée.
- **Installation existante** : onglet *Banque* → **📚 Ajouter le lot à ma banque**.
  Seuls les codes absents sont ajoutés ; les questions personnelles, les apprentis et
  les observations ne sont **jamais** modifiés. Cliquer deux fois ne crée aucun doublon.
- **Conséquence** : si un code existe déjà, son énoncé n'est pas écrasé par celui du lot.
  Pour reprendre la version du lot, supprimer d'abord la question (✖), puis relancer l'ajout.
- **Recherche** : champ *Rechercher*, insensible aux accents (`securite` trouve « sécurité »),
  portant sur le code et l'énoncé. Combinable avec le filtre par compétence.
- Les listes déroulantes *Évaluer* et *Classe* regroupent les questions par compétence.

## Règles de calcul

| Élément | Règle |
|---|---|
| Jauge d'une compétence | moyenne des **5 dernières** observations de l'apprenti, en % de 3 |
| Niveaux couleur | < 34 % rouge · < 67 % orange · < 84 % jaune · ≥ 84 % vert |
| Remédiation classe | compétences entre 1 % et 66 %, les 2 plus basses |
| Remédiation profil | ≥ 2 observations et < 67 % |
| Prêt pour le CCF | **toutes** les compétences ≥ 70 % avec ≥ 3 observations |

Constantes modifiables en haut du script : `WINDOW_SIZE`, `CCF_MIN_OBS`, `CCF_MIN_LEVEL`.

## Sauvegarde / restauration

- **💾 Sauvegarde** : fichier JSON complet (apprentis, questions, observations).
- **📊 CSV** : historique des observations, séparateur `;` + BOM UTF-8 (Excel FR).
- **📤 Restaurer** : remplace les données actuelles après confirmation ; tout fichier
  importé est normalisé (types forcés, doublons et scores invalides écartés).

## Structure des données

```json
{
  "students":     [{ "id": "…", "name": "…", "class": "TMELEC" }],
  "questions":    [{ "code": "SCI-REA-MOT-03", "comp": "REA", "text": "…" }],
  "observations": [{ "id": "…", "studentId": "…", "questionCode": "…",
                     "score": 0, "comp": "REA", "date": 1756300000000 }]
}
```

Format identique à la version précédente : les données déjà saisies sont reprises telles quelles.
