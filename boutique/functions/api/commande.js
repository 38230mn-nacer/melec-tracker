/**
 * GET /api/commande?session_id=cs_...
 * Relit la session Stripe, vérifie qu'elle est payée, puis renvoie les liens
 * de téléchargement signés. C'est ce qui alimente la page merci.html.
 */
import { appelStripe } from '../lib/stripe.js';
import { json, erreur, chargerCatalogue, origine } from '../lib/commun.js';
import { lienTelechargement, referenceCommande } from '../lib/signature.js';
import { calculerCommande } from '../../assets/js/pricing.js';

export async function onRequestGet({ request, env }) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return erreur('Session invalide');

  let session;
  try { session = await appelStripe(env, `checkout/sessions/${sessionId}`, { methode: 'GET' }); }
  catch (e) { return erreur(e.message || 'Session introuvable', 404); }

  if (session.payment_status !== 'paid') return erreur('Paiement non confirmé', 402);

  const catalogue = await chargerCatalogue(request, env);
  const ids = String(session.metadata?.produits || '').split(',').filter(Boolean);
  const bump = session.metadata?.bump === '1';
  const commande = calculerCommande(ids, bump, catalogue);
  const reference = referenceCommande(session.id);
  const base = origine(request, env);

  const lignes = [];
  for (const l of commande.lignes) {
    const produit = l.type === 'bump' ? catalogue.order_bump : catalogue.produits.find((p) => p.id === l.id);
    const fichier = produit?.fichier;
    lignes.push({
      id: l.id,
      nom: l.nom,
      poids_mo: fichier?.poids_mo || null,
      url: fichier ? await lienTelechargement(env, base, fichier.cle, reference) : null,
    });
  }

  return json({
    reference,
    email: session.customer_details?.email || session.customer_email || '',
    total: session.amount_total ?? commande.total,
    lignes,
  });
}
