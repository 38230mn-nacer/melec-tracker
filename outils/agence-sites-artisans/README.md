# Agence sites artisans — outil complet

Chaîne : **TROUVER → QUALIFIER → GÉNÉRER LE SITE → CONTACTER → SUIVRE**

| Fichier | Rôle |
|---|---|
| `prospecteur.py` | Trouve les artisans actifs d'une zone (SIRENE officiel), détecte leur site (OSM, domaine, Google optionnel), audite le site, calcule un score de potentiel. |
| `atelier.html` | Interface : liste priorisée, fiche prospect, **site généré en un clic** (textes rédigés par Claude), messages de prospection, suivi commercial. |
| `data/prospects.json` | Résultat d'une prospection (chargé par l'atelier). |
| `data/prospects.csv` | Même résultat pour Excel / Google Sheets. |

## 1. Lancer une prospection (2 min)

```bash
python3 prospecteur.py --ville "Bourgoin-Jallieu" --metiers plombier,electricien,couvreur --rayon 15
python3 prospecteur.py --ville "Lyon" --metiers tous --rayon 5 --max 100
```

Métiers : plombier, electricien, menuisier, serrurier, carreleur, peintre, couvreur, macon, platrier, paysagiste, coiffeur, esthetique, boulanger, boucher, garagiste.

**Fortement recommandé** : clé Google Places (détecte bien mieux les sites existants, ajoute note et nombre d'avis).
```bash
export GOOGLE_MAPS_API_KEY="votre_clé"   # console.cloud.google.com → Places API (New)
```
Sans clé, une partie des « aucun site détecté » ont en réalité un site non référencé dans OSM : vérifiez en 20 s avec les boutons de la fiche avant d'appeler.

## 2. Générer et vendre

Importer `data/prospects.json` dans l'atelier → choisir un prospect A → **Générer son site** → télécharger le `.html` → l'héberger gratuitement (Netlify Drop, Cloudflare Pages) sous un lien de maquette → envoyer le SMS.

## 3. Après signature

1. Désactiver « Mode maquette » et régénérer.
2. Remplacer les 3 cadres photo par les vraies photos de chantier.
3. Compléter l'hébergeur dans les mentions légales, brancher le formulaire (Formspree / Netlify Forms).
4. Nom de domaine (~10 €/an) + fiche Google Business Profile.

## Règles intégrées (conformité)

- Entreprises en opposition à la prospection (SIRENE) ou non diffusibles : exclues automatiquement.
- Aucun avis, chiffre ou certification inventés dans les sites ; RGE affiché seulement s'il est dans les données officielles.
- Mentions légales pré-remplies depuis SIRENE (LCEN art. 6).
- E-mails et SMS avec identification et option STOP.
- Maquettes en `noindex` avec bandeau « proposition non officielle » : ne jamais publier une maquette indexable au nom d'un artisan qui n'a pas signé.
