/**
 * Liens de téléchargement signés.
 * Un lien contient le fichier, une date d'expiration et une signature HMAC :
 * impossible à forger, inutile de tenir une base de jetons.
 */
const encodeur = new TextEncoder();

function base64url(octets) {
  let s = '';
  for (const o of new Uint8Array(octets)) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signer(secret, message) {
  const cle = await crypto.subtle.importKey(
    'raw', encodeur.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return base64url(await crypto.subtle.sign('HMAC', cle, encodeur.encode(message)));
}

function comparer(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Construit une URL de téléchargement valable `joursValidite` jours. */
export async function lienTelechargement(env, origine, cle, reference, joursValidite = 30) {
  const secret = env.DOWNLOAD_SECRET;
  if (!secret) throw new Error('DOWNLOAD_SECRET manquante');
  const expiration = Math.floor(Date.now() / 1000) + joursValidite * 86400;
  const message = `${cle}|${expiration}|${reference}`;
  const signature = await signer(secret, message);
  const params = new URLSearchParams({ f: cle, e: String(expiration), r: reference, s: signature });
  return `${origine}/api/download?${params}`;
}

/** Vérifie une URL de téléchargement. */
export async function verifierLien(env, { f, e, r, s }) {
  if (!f || !e || !s) return { ok: false, raison: 'lien incomplet' };
  const expiration = Number(e);
  if (!Number.isFinite(expiration)) return { ok: false, raison: 'lien invalide' };
  if (expiration < Math.floor(Date.now() / 1000)) return { ok: false, raison: 'lien expiré' };
  const attendue = await signer(env.DOWNLOAD_SECRET, `${f}|${e}|${r || ''}`);
  if (!comparer(s, attendue)) return { ok: false, raison: 'signature invalide' };
  return { ok: true };
}

/** Référence de commande lisible : KA-8F3K2Q */
export function referenceCommande(sessionId) {
  const base = (sessionId || crypto.randomUUID()).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `KA-${base.slice(-6)}`;
}
