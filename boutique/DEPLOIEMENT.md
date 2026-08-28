# Déploiement & paiement

Deux façons de mettre la boutique en ligne. La première marche en dix minutes sans
serveur ; la seconde débloque le panier multi-produits, les remises automatiques et
l'envoi automatique des fichiers.

---

## Option A — sans serveur (liens de paiement)

Le site est publié tel quel (GitHub Pages, Netlify drop, Cloudflare Pages…) et chaque
pack renvoie vers un lien de paiement hébergé (Stripe Payment Link ou Gumroad).

1. Créer un lien de paiement par pack chez Stripe ou Gumroad ;
2. Les reporter dans `assets/js/config.js` → `lienPaiement` ;
3. Y laisser `modePaiement: 'auto'` (le site tente l'API, puis bascule sur les liens).

Limite : un pack à la fois, pas de remise multi-packs, pas d'*order bump*, et la
livraison des fichiers dépend de la plateforme choisie.

---

## Option B — recommandée : Cloudflare Pages + Stripe

### 1. Publier le site

Cloudflare Dashboard → **Workers & Pages** → *Create* → *Pages* → connecter le dépôt.

| Réglage | Valeur |
|---|---|
| Build command | *(vide)* |
| Build output directory | `boutique` |
| Root directory | `/` |

Les fonctions de `boutique/functions/` sont déployées automatiquement sur `/api/*`.

### 2. Configurer Stripe

1. Créer un compte, activer le mode **Test** pour commencer ;
2. Récupérer la clé secrète (`sk_test_…`) ;
3. **Webhooks** → *Add endpoint* → `https://<ton-domaine>/api/webhook`, événement
   `checkout.session.completed` → noter le secret de signature (`whsec_…`).

### 3. Héberger les fichiers vendus

Les ZIP ne doivent **jamais** être publiés dans le site : ils seraient téléchargeables
sans payer. Deux possibilités :

- **Bucket R2** (recommandé) : créer un bucket, y déposer les fichiers en respectant les
  clés de `catalog.json` (`packs/pack-lycee-complet.zip`…), puis lier le bucket à la
  variable **`FICHIERS`** dans les réglages Pages ;
- **Stockage externe privé** : renseigner `URL_FICHIERS`, la fonction redirige vers
  `URL_FICHIERS/<clé>`.

Dans les deux cas, l'accès passe par `/api/download` et exige une signature valide.

### 4. Variables d'environnement

Réglages du projet Pages → *Variables and Secrets* (côté **Production** et **Preview**) :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `STRIPE_SECRET_KEY` | oui | clé secrète Stripe (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | oui | signature des webhooks (`whsec_…`) |
| `DOWNLOAD_SECRET` | oui | clé de signature des liens — chaîne aléatoire de 32+ caractères |
| `SITE_URL` | conseillé | `https://kulture-academie.fr` (URL canonique) |
| `RESEND_API_KEY` | conseillé | envoi des e-mails ([resend.com](https://resend.com)) |
| `MAIL_FROM` | conseillé | `Kulture Académie <contact@ton-domaine.fr>` |
| `FICHIERS` | selon 3 | liaison R2 |
| `URL_FICHIERS` | selon 3 | base d'un stockage externe |
| `LEAD_WEBHOOK` | non | URL appelée à chaque demande de fiche gratuite (Brevo, Make…) |
| `STRIPE_TAX` | non | `1` pour activer Stripe Tax (TVA automatique) |

Générer un secret solide :

```bash
openssl rand -base64 32
```

### 5. Vérifier

1. `assets/js/config.js` → `modePaiement: 'api'` ;
2. Passer une commande test avec la carte `4242 4242 4242 4242`, date future, CVC libre ;
3. Contrôler : redirection vers `merci.html`, liens de téléchargement présents,
   e-mail reçu, événement `succeeded` dans le tableau de bord Stripe ;
4. Vérifier qu'un lien de téléchargement modifié à la main renvoie bien une erreur 403 ;
5. Passer les clés en mode Live.

---

## Comment fonctionne le paiement

```
Navigateur                  /api/checkout                    Stripe
   │  identifiants du panier      │                             │
   ├─────────────────────────────>│                             │
   │                              │ relit data/catalog.json     │
   │                              │ recalcule le total          │
   │                              ├────────────────────────────>│
   │                              │        URL de session       │
   │<─────────────────────────────┴─────────────────────────────┤
   │                    page de paiement Stripe                 │
   │                              paiement                      │
   │                                                            │
   ├── merci.html ──> /api/commande ──> vérifie « payé » ──> liens signés
   │                                                            │
   └── en parallèle : Stripe ──> /api/webhook ──> e-mail avec les mêmes liens
```

Points à retenir :

- **Les prix sont recalculés côté serveur.** Un panier modifié dans le navigateur n'a
  aucun effet sur le montant réellement débité.
- **Les liens de téléchargement sont signés** (HMAC-SHA256 + expiration 30 jours).
  Aucune base de données : la signature suffit à prouver l'achat.
- **Double livraison** : page de confirmation *et* e-mail. Si l'acheteur ferme l'onglet
  trop tôt, il reçoit quand même ses fichiers.
- **Aucune donnée bancaire** ne transite par le site.

---

## Netlify, Vercel ou autre

Les fonctions suivent la signature Cloudflare Pages (`onRequestPost({ request, env })`).
Pour un autre hébergeur, l'adaptation est mécanique :

- **Netlify** : déplacer les fichiers dans `netlify/functions/`, exporter
  `export default async (req, context) => …` et lire les variables via `Netlify.env.get()` ;
- **Vercel** : placer les fichiers dans `api/`, exporter `export default function handler(req, res)`
  et lire `process.env`.

La logique métier (`functions/lib/`) et le calcul de prix (`assets/js/pricing.js`) ne
changent pas : seule la couche d'entrée est à réécrire.
