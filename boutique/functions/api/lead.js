/**
 * POST /api/lead — demande de fiche gratuite.
 * Envoie la fiche par e-mail et transmet le contact à l'outil d'e-mailing
 * si LEAD_WEBHOOK est défini (Brevo, Systeme.io, Airtable, Make…).
 */
import { json, erreur, origine, emailValide } from '../lib/commun.js';
import { envoyerMail, gabarit } from '../lib/mail.js';

export async function onRequestPost({ request, env }) {
  let corps;
  try { corps = await request.json(); } catch { return erreur('Requête illisible'); }

  const email = String(corps.email || '').trim().toLowerCase();
  if (!emailValide(email)) return erreur('Adresse e-mail invalide');

  const niveau = ['seconde', 'premiere', 'terminale', 'autre'].includes(corps.niveau) ? corps.niveau : 'autre';
  const ficheId = String(corps.fiche || 'second-degre').replace(/[^a-z0-9-]/g, '').slice(0, 60) || 'second-degre';
  const base = origine(request, env);

  // Vérifie que la fiche demandée est bien proposée gratuitement.
  let titreFiche = 'ta fiche';
  try {
    const r = await fetch(`${base}/data/fiches.json`);
    const { fiches } = await r.json();
    const f = fiches.find((x) => x.id === ficheId && x.gratuite);
    if (!f) return erreur('Cette fiche n’est pas disponible gratuitement');
    titreFiche = f.titre;
  } catch { /* si l'index est indisponible, on continue avec la fiche demandée */ }

  const lienFiche = `${base}/fiche.html?id=${ficheId}`;

  const envoi = await envoyerMail(env, {
    destinataire: email,
    sujet: `🎓 Ta fiche offerte : ${titreFiche}`,
    html: gabarit({
      titre: `Voici ta fiche : ${titreFiche}`,
      intro: 'Comme promis, ta fiche de révision. Ouvre-la, imprime-la, et garde-la sous les yeux pendant que tu travailles ce chapitre.',
      ctaTexte: 'Ouvrir ma fiche',
      ctaUrl: lienFiche,
      pied: "Si le format te plaît, les packs complets couvrent tout le programme de ton niveau — et coûtent moins cher qu'un manuel.",
    }),
    texte: `Ta fiche : ${lienFiche}`,
  });

  // Transmission au CRM / outil d'e-mailing.
  if (env.LEAD_WEBHOOK) {
    try {
      await fetch(env.LEAD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, niveau, fiche: ficheId, date: new Date().toISOString(), source: 'site' }),
      });
    } catch { /* un CRM indisponible ne doit pas casser l'inscription */ }
  }

  return json({ ok: true, envoye: envoi.envoye, fiche: lienFiche });
}

export const onRequestGet = () => erreur('Méthode non autorisée', 405);
