/**
 * Règles de prix — module partagé navigateur / serveur.
 * Aucune dépendance, aucun accès au DOM : la fonction serverless importe ce
 * même fichier pour recalculer le montant avant de créer le paiement.
 * Tous les montants sont en centimes, TTC (TVA incluse dans le prix affiché).
 */

/** Remise automatique selon le nombre de packs distincts dans le panier. */
export function palierRemise(nbPacks, remises = []) {
  let palier = null;
  for (const r of remises) {
    if (nbPacks >= r.seuil && (!palier || r.seuil > palier.seuil)) palier = r;
  }
  return palier;
}

/**
 * Calcule le détail d'une commande.
 * @param {string[]} ids            identifiants des produits (packs)
 * @param {boolean}  bump           l'offre complémentaire est-elle ajoutée ?
 * @param {object}   catalogue      contenu de data/catalog.json
 * @returns {{lignes, sousTotal, remise, remiseLibelle, total, economie}}
 */
export function calculerCommande(ids, bump, catalogue) {
  const uniques = [...new Set(ids)];
  const lignes = [];
  let sousTotal = 0;
  let valeurBarree = 0;

  for (const id of uniques) {
    const p = catalogue.produits.find((x) => x.id === id);
    if (!p) continue;
    lignes.push({ id: p.id, nom: p.nom, sousTitre: p.sous_titre, prix: p.prix, type: 'pack' });
    sousTotal += p.prix;
    valeurBarree += p.prix_barre || p.prix;
  }

  const nbPacks = lignes.length;
  const palier = palierRemise(nbPacks, catalogue.remises);
  const remise = palier ? Math.round((sousTotal * palier.pourcentage) / 100) : 0;

  let totalBump = 0;
  if (bump && catalogue.order_bump && nbPacks > 0) {
    const b = catalogue.order_bump;
    lignes.push({ id: b.id, nom: b.nom, sousTitre: b.sous_titre, prix: b.prix, type: 'bump' });
    totalBump = b.prix;
    valeurBarree += b.prix_barre || b.prix;
  }

  const total = sousTotal - remise + totalBump;

  return {
    lignes,
    sousTotal: sousTotal + totalBump,
    remise,
    remiseLibelle: palier ? palier.libelle : '',
    total,
    economie: Math.max(0, valeurBarree - total),
  };
}

/** 2990 -> "29,90 €" (et "2 €" reste "2 €" si le centime est nul) */
export function formatPrix(centimes, symbole = '€') {
  const euros = centimes / 100;
  const txt = Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(2).replace('.', ',');
  return `${txt} ${symbole}`;
}

/** Prix unitaire par fiche, utile comme argument de vente. */
export function prixParFiche(produit) {
  if (!produit.nb_fiches) return null;
  return produit.prix / produit.nb_fiches;
}
