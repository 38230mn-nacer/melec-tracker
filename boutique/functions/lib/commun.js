/** Utilitaires partagés par les fonctions serverless. */

export function json(donnees, statut = 200, entetes = {}) {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...entetes },
  });
}

export const erreur = (message, statut = 400) => json({ message }, statut);

/** Charge le catalogue publié (source de vérité des prix, côté serveur). */
let cache = { data: null, expire: 0 };
export async function chargerCatalogue(request, env) {
  if (cache.data && cache.expire > Date.now()) return cache.data;
  const base = env?.SITE_URL || new URL(request.url).origin;
  const r = await fetch(`${base}/data/catalog.json`, { cf: { cacheTtl: 300 } });
  if (!r.ok) throw new Error('Catalogue introuvable');
  const data = await r.json();
  cache = { data, expire: Date.now() + 300000 };
  return data;
}

/** Origine publique du site (préfère SITE_URL si défini). */
export const origine = (request, env) => env?.SITE_URL || new URL(request.url).origin;

/** Validation d'e-mail volontairement simple et permissive. */
export const emailValide = (v) => typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());
