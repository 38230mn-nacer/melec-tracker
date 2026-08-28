/**
 * POST /api/checkout
 * Crée une session de paiement Stripe à partir du panier.
 * Les prix ne viennent JAMAIS du client : ils sont recalculés ici depuis
 * data/catalog.json avec la même logique que le navigateur.
 */
import { appelStripe } from '../lib/stripe.js';
import { json, erreur, chargerCatalogue, origine } from '../lib/commun.js';
import { calculerCommande } from '../../assets/js/pricing.js';

export async function onRequestPost({ request, env }) {
  let corps;
  try { corps = await request.json(); } catch { return erreur('Requête illisible'); }

  const items = Array.isArray(corps.items) ? corps.items.slice(0, 20).filter((x) => typeof x === 'string') : [];
  const bump = !!corps.bump;
  if (!items.length) return erreur('Panier vide');

  let catalogue;
  try { catalogue = await chargerCatalogue(request, env); }
  catch { return erreur('Catalogue indisponible', 503); }

  const commande = calculerCommande(items, bump, catalogue);
  if (!commande.lignes.length) return erreur('Aucun produit valide dans le panier');

  const base = origine(request, env);
  const comportementTva = env.STRIPE_TAX === '1' ? 'inclusive' : 'unspecified';

  const lineItems = commande.lignes.map((l) => ({
    quantity: 1,
    price_data: {
      currency: (catalogue.devise || 'EUR').toLowerCase(),
      unit_amount: l.prix,
      tax_behavior: comportementTva,
      product_data: {
        name: l.nom,
        description: (l.sousTitre || '').slice(0, 200),
        metadata: { produit_id: l.id },
      },
    },
  }));

  // La remise multi-packs est appliquée sous forme de coupon à usage unique.
  let discounts;
  if (commande.remise > 0) {
    try {
      const coupon = await appelStripe(env, 'coupons', {
        corps: {
          amount_off: commande.remise,
          currency: (catalogue.devise || 'EUR').toLowerCase(),
          duration: 'once',
          name: commande.remiseLibelle || 'Remise multi-packs',
          max_redemptions: 1,
          redeem_by: Math.floor(Date.now() / 1000) + 3600,
        },
      });
      discounts = [{ coupon: coupon.id }];
    } catch { /* en cas d'échec, la commande passe au prix plein plutôt que d'échouer */ }
  }

  const source = corps.source && typeof corps.source === 'object' ? corps.source : {};

  try {
    const session = await appelStripe(env, 'checkout/sessions', {
      corps: {
        mode: 'payment',
        locale: 'fr',
        line_items: lineItems,
        ...(discounts ? { discounts } : { allow_promotion_codes: true }),
        automatic_tax: { enabled: env.STRIPE_TAX === '1' },
        success_url: `${base}/merci.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/index.html#packs`,
        metadata: {
          produits: commande.lignes.map((l) => l.id).join(','),
          bump: bump ? '1' : '0',
          utm_source: String(source.utm_source || '').slice(0, 60),
          utm_campaign: String(source.utm_campaign || '').slice(0, 60),
          ref: String(source.ref || '').slice(0, 60),
        },
        payment_intent_data: {
          description: `Kulture Académie — ${commande.lignes.map((l) => l.nom).join(' + ')}`.slice(0, 240),
        },
        custom_text: {
          submit: { message: 'Téléchargement immédiat après paiement. Satisfait ou remboursé 30 jours.' },
        },
      },
    });
    return json({ url: session.url, id: session.id });
  } catch (e) {
    return erreur(e.message || 'Création du paiement impossible', e.statut || 502);
  }
}

export const onRequestGet = () => erreur('Méthode non autorisée', 405);
