/**
 * Configuration de la boutique.
 * Un seul fichier à éditer pour brancher les paiements.
 */
export const CONFIG = {
  /**
   * 'api'    : paiement via les fonctions serverless de ce dépôt (/api/checkout)
   *            → panier multi-produits, remises, order bump, e-mail automatique.
   * 'liens'  : aucun serveur, chaque produit renvoie vers un lien de paiement
   *            Stripe / Gumroad déclaré dans lienPaiement ci-dessous.
   * 'auto'   : essaie l'API, bascule sur les liens si elle ne répond pas.
   */
  modePaiement: 'auto',

  /** Base des fonctions serverless (vide = même domaine). */
  apiBase: '',

  /** Mode 'liens' : URL de paiement hébergée, par identifiant de produit. */
  lienPaiement: {
    'pack-lycee-complet': 'https://kultureacademie.gumroad.com/l/pack-lycee-complet',
    'pack-seconde': 'https://kultureacademie.gumroad.com/l/pack-seconde',
    'pack-premiere': 'https://kultureacademie.gumroad.com/l/pack-premiere',
    'pack-terminale': 'https://kultureacademie.gumroad.com/l/pack-terminale',
    'pack-maths-lycee': 'https://kultureacademie.gumroad.com/l/pack-maths',
    'pack-pc-lycee': 'https://kultureacademie.gumroad.com/l/pack-physique-chimie',
    'sprint-bac': 'https://kultureacademie.gumroad.com/l/sprint-bac',
  },

  /** Compte à rebours de l'offre de lancement (bandeau haut). Null = masqué. */
  finPromo: null,      // ex. '2026-09-15T23:59:59+02:00'

  /** Clés d'analytics (laisser vide pour désactiver). */
  analytics: {
    ga4: '',           // ex. 'G-XXXXXXXXXX'
    metaPixel: '',     // ex. '123456789012345'
    tiktokPixel: '',
  },

  /** Chemins des données. */
  chemins: {
    catalogue: 'data/catalog.json',
    fiches: 'data/fiches.json',
    fiche: (id) => `data/fiches/${id}.json`,
  },
};
