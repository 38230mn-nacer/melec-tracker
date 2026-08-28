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

Ouvrir `index.html?selftest=1` : un panneau affiche le résultat des 31 tests unitaires
(seuils de jauges, échappement HTML, validation des scores, normalisation des données,
fenêtre glissante des 5 dernières observations). Attendu : **31/31 OK**.

Depuis la console : `window.__tracker.selfTest()`.

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
