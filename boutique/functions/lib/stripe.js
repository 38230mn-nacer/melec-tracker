/**
 * Client Stripe minimal (API REST, aucune dépendance npm).
 * Suffisant pour créer une session de paiement, la relire et vérifier
 * la signature des webhooks.
 */

/** Encode un objet imbriqué au format attendu par l'API Stripe. */
export function encoderForm(objet, prefixe = '', sortie = new URLSearchParams()) {
  for (const [cle, valeur] of Object.entries(objet)) {
    if (valeur === undefined || valeur === null) continue;
    const nom = prefixe ? `${prefixe}[${cle}]` : cle;
    if (Array.isArray(valeur)) {
      valeur.forEach((v, i) => {
        if (v !== null && typeof v === 'object') encoderForm(v, `${nom}[${i}]`, sortie);
        else sortie.append(`${nom}[${i}]`, String(v));
      });
    } else if (typeof valeur === 'object') {
      encoderForm(valeur, nom, sortie);
    } else {
      sortie.append(nom, String(valeur));
    }
  }
  return sortie;
}

export async function appelStripe(env, chemin, { methode = 'POST', corps = null } = {}) {
  const cle = env.STRIPE_SECRET_KEY;
  if (!cle) throw new Error('STRIPE_SECRET_KEY manquante');

  const reponse = await fetch(`https://api.stripe.com/v1/${chemin}`, {
    method: methode,
    headers: {
      Authorization: `Bearer ${cle}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20',
    },
    body: corps ? encoderForm(corps).toString() : undefined,
  });

  const data = await reponse.json();
  if (!reponse.ok) {
    const message = data?.error?.message || `Erreur Stripe (${reponse.status})`;
    const err = new Error(message);
    err.statut = reponse.status;
    throw err;
  }
  return data;
}

/* ------------------------------------------------------- Webhook Stripe */

const encodeur = new TextEncoder();

async function hmacHex(secret, message) {
  const cle = await crypto.subtle.importKey(
    'raw', encodeur.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cle, encodeur.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Comparaison à temps constant (évite les attaques par mesure de temps). */
export function egalesConstant(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Vérifie l'en-tête Stripe-Signature et renvoie l'événement.
 * @throws si la signature est invalide ou l'horodatage trop ancien.
 */
export async function verifierWebhook(charge, entete, secret, toleranceSecondes = 300) {
  if (!entete) throw new Error('Signature absente');
  const parties = Object.fromEntries(
    entete.split(',').map((p) => p.split('=').map((x) => x.trim())),
  );
  const horodatage = Number(parties.t);
  if (!horodatage || Math.abs(Date.now() / 1000 - horodatage) > toleranceSecondes) {
    throw new Error('Horodatage hors tolérance');
  }
  const attendue = await hmacHex(secret, `${horodatage}.${charge}`);
  const fournies = entete.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!fournies.some((s) => egalesConstant(s, attendue))) throw new Error('Signature invalide');
  return JSON.parse(charge);
}
