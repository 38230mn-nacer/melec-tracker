# Boutique Kulture Académie

Site de vente de fiches de révision (maths et physique-chimie, Seconde → Terminale),
optimisé pour la conversion, avec paiement intégré.

Aucun framework, aucune étape de build : ce sont des fichiers statiques + des fonctions
serverless. On modifie un fichier, on recharge la page.

---

## Démarrer en local

Le site charge ses données en `fetch()` et utilise des modules ES : il faut un serveur,
un double-clic sur `index.html` ne suffit pas.

```bash
cd boutique
python3 -m http.server 8080
# → http://localhost:8080
```

Pour tester aussi les paiements (fonctions serverless) :

```bash
npm install -g wrangler
cd boutique
wrangler pages dev . --port 8080
```

## Les pages

| Fichier | Rôle |
|---|---|
| `index.html` | Page de vente : hero, aperçus, catalogue, comparateur, avis, FAQ, capture d'e-mail |
| `produit.html?id=…` | Page produit détaillée (une par pack, générée depuis le catalogue) |
| `fiche.html?id=…` | Lecteur d'une fiche gratuite, imprimable |
| `merci.html` | Confirmation d'achat + liens de téléchargement |
| `cgv.html`, `mentions.html` | Pages légales (à compléter avant mise en ligne) |

## Structure

```
boutique/
├── data/
│   ├── catalog.json          ← produits, prix, remises, avis, FAQ  (le fichier à éditer)
│   ├── fiches.json           ← index des fiches consultables
│   └── fiches/<id>.json      ← contenu d'une fiche
├── assets/
│   ├── css/  base · store · fiche
│   └── js/   config · pricing · cart · ui · fiche · app · page-*
└── functions/                ← API serverless (Cloudflare Pages Functions)
    ├── api/  checkout · commande · webhook · download · lead
    └── lib/  stripe · signature · mail · commun
```

---

## Modifier la boutique

### Changer un prix

`data/catalog.json`, en **centimes** :

```json
{ "id": "pack-terminale", "prix": 1490, "prix_barre": 2490 }
```

`prix_barre` sert d'ancrage (prix barré + pourcentage d'économie affiché).
Le serveur relit ce même fichier avant de créer le paiement : **le prix ne vient jamais
du navigateur**, un panier trafiqué est sans effet.

### Ajouter un pack

Copier un bloc de `produits` et adapter. Les champs utilisés :

| Champ | Effet |
|---|---|
| `niveaux`, `matieres` | filtres du catalogue et pastilles colorées |
| `nb_fiches` | calcul automatique du « prix à la fiche » |
| `badge`, `mise_en_avant` | ruban et mise en valeur de la carte |
| `inclus` | liste à cocher (les 4 premiers apparaissent sur la carte) |
| `arguments` | blocs argumentaires de la page produit |
| `apercus` | identifiants des fiches montrées en exemple |
| `fichier.cle` | chemin du ZIP dans le stockage (voir `DEPLOIEMENT.md`) |

Le pack apparaît aussitôt dans le catalogue, le comparateur, le plan du site et le panier.

### Ajouter une matière ou un niveau

Ajouter une entrée dans `matieres` ou `niveaux` (`id`, `nom`, `couleur`), puis la
référencer dans les produits. Les filtres, les pastilles et les couleurs suivent seuls.
Pour une nouvelle matière, ajouter aussi sa couleur dans `assets/css/base.css`
(`--svt`, par exemple) si l'on veut une teinte dédiée sur les fiches.

### Ajouter une fiche

1. Créer `data/fiches/<id>.json` (voir un fichier existant comme modèle) ;
2. L'inscrire dans `data/fiches.json` (`gratuite: true` la rend consultable publiquement).

Blocs disponibles dans une section : `texte`, `formule`, `liste`, `encadre`
(`cle` / `attention` / `exemple`), `tableau`, `etapes`, `graphe`, `schema`.

Les maths s'écrivent en LaTeX entre `$…$` (en ligne) ; les blocs `formule` sont
composés en mode centré. Le rendu est assuré par KaTeX.

`graphe` trace une courbe réelle (`polynome`, `ln`, `exp`, `inverse`, `sinus`) avec
repère, quadrillage, racines et sommet. `schema` appelle un schéma vectoriel nommé
(`vecteur-repere`, `titrage-montage`, `tableau-periodique`, `conduite`,
`synthese-additive`) — les nouveaux schémas s'ajoutent dans `assets/js/fiche.js`.

### Régénérer l'image de partage

`_og.html` est le gabarit de l'image Open Graph (`assets/img/og.png`). L'ouvrir en
1200×630 et faire une capture, ou utiliser un navigateur sans interface.

---

## Ce qu'il reste à faire avant la mise en ligne

- [ ] Remplacer les **témoignages de démonstration** de `catalog.json` par de vrais avis
      (publier des avis inventés est une pratique commerciale trompeuse).
- [ ] Vérifier le chiffre « 1 700+ élèves » du hero (`index.html`).
- [ ] Compléter `mentions.html` et `cgv.html` (raison sociale, SIRET, médiateur…).
- [ ] Déposer les vrais fichiers ZIP dans le stockage et vérifier les clés `fichier.cle`.
- [ ] Suivre `DEPLOIEMENT.md` pour brancher Stripe.
