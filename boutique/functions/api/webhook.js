/**
 * POST /api/webhook — notifications Stripe.
 * À l'événement checkout.session.completed, envoie l'e-mail contenant les
 * liens de téléchargement signés. C'est le filet de sécurité : même si
 * l'acheteur ferme l'onglet avant la page de confirmation, il reçoit ses fichiers.
 */
import { verifierWebhook } from '../lib/stripe.js';
import { json, erreur, chargerCatalogue, origine } from '../lib/commun.js';
import { lienTelechargement, referenceCommande } from '../lib/signature.js';
import { envoyerMail, gabarit } from '../lib/mail.js';
import { calculerCommande } from '../../assets/js/pricing.js';

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET) return erreur('Webhook non configuré', 503);

  const charge = await request.text();
  let evenement;
  try {
    evenement = await verifierWebhook(charge, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return erreur(`Signature refusée : ${e.message}`, 400);
  }

  if (evenement.type !== 'checkout.session.completed') return json({ recu: true, ignore: evenement.type });

  const session = evenement.data.object;
  const destinataire = session.customer_details?.email || session.customer_email;
  if (!destinataire) return json({ recu: true, avertissement: 'aucun e-mail sur la session' });

  const catalogue = await chargerCatalogue(request, env);
  const ids = String(session.metadata?.produits || '').split(',').filter(Boolean);
  const commande = calculerCommande(ids, session.metadata?.bump === '1', catalogue);
  const reference = referenceCommande(session.id);
  const base = origine(request, env);

  const blocs = [];
  for (const l of commande.lignes) {
    const produit = l.type === 'bump' ? catalogue.order_bump : catalogue.produits.find((p) => p.id === l.id);
    if (!produit?.fichier) continue;
    blocs.push({
      titre: l.nom,
      detail: `${produit.nb_fiches ? produit.nb_fiches + ' fiches · ' : ''}PDF A4 + PNG`,
      url: await lienTelechargement(env, base, produit.fichier.cle, reference),
    });
  }

  const html = gabarit({
    titre: 'Tes fiches sont prêtes 🎉',
    intro: `Merci pour ta commande <b>${reference}</b>. Voici tes fichiers, disponibles pendant 30 jours. Télécharge-les sur un ordinateur puis sauvegarde-les : ils sont à toi à vie.`,
    blocs,
    ctaTexte: 'Ouvrir ma page de téléchargement',
    ctaUrl: `${base}/merci.html?session_id=${session.id}`,
    pied: "Un conseil : imprime dès aujourd'hui les fiches du chapitre en cours et garde-les visibles pendant que tu travailles. C'est ce qui fait la différence sur la note.",
  });

  await envoyerMail(env, {
    destinataire,
    sujet: `🎓 Tes fiches Kulture Académie (${reference})`,
    html,
    texte: `Merci pour ta commande ${reference}.\n\n${blocs.map((b) => `${b.titre} : ${b.url}`).join('\n')}\n\nLiens valables 30 jours.`,
  });

  return json({ recu: true, reference });
}

export const onRequestGet = () => erreur('Méthode non autorisée', 405);
