/**
 * GET /api/download?f=...&e=...&r=...&s=...
 * Sert un fichier acheté après vérification de la signature.
 *
 * Deux hébergements possibles pour les fichiers :
 *   1. bucket R2 relié à la variable FICHIERS  → le fichier est diffusé ici ;
 *   2. variable URL_FICHIERS (stockage privé)  → redirection vers cette base.
 */
import { erreur } from '../lib/commun.js';
import { verifierLien } from '../lib/signature.js';

const TYPES = {
  zip: 'application/zip',
  pdf: 'application/pdf',
  png: 'image/png',
};

export async function onRequestGet({ request, env }) {
  const p = new URL(request.url).searchParams;
  const parametres = { f: p.get('f'), e: p.get('e'), r: p.get('r'), s: p.get('s') };

  if (!env.DOWNLOAD_SECRET) return erreur('Téléchargement non configuré', 503);

  const verif = await verifierLien(env, parametres);
  if (!verif.ok) {
    return new Response(
      `Lien de téléchargement invalide (${verif.raison}). Écris-nous à contact@kulture-academie.fr, nous te renverrons tes fichiers.`,
      { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const cle = parametres.f.replace(/^\/+/, '');
  if (cle.includes('..')) return erreur('Chemin refusé', 400);
  const nom = cle.split('/').pop();
  const extension = nom.split('.').pop().toLowerCase();

  if (env.FICHIERS) {
    const objet = await env.FICHIERS.get(cle);
    if (!objet) return erreur('Fichier introuvable', 404);
    return new Response(objet.body, {
      headers: {
        'Content-Type': TYPES[extension] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${nom}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  if (env.URL_FICHIERS) {
    return Response.redirect(`${env.URL_FICHIERS.replace(/\/+$/, '')}/${cle}`, 302);
  }

  return erreur('Aucun stockage de fichiers configuré (FICHIERS ou URL_FICHIERS)', 503);
}
