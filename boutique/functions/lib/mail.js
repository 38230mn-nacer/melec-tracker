/**
 * Envoi d'e-mails via Resend (https://resend.com).
 * Sans clé configurée, l'envoi est ignoré silencieusement : la boutique
 * continue de fonctionner, la page de confirmation affiche les liens.
 */
export async function envoyerMail(env, { destinataire, sujet, html, texte }) {
  if (!env.RESEND_API_KEY) return { envoye: false, raison: 'RESEND_API_KEY absente' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM || 'Kulture Académie <contact@kulture-academie.fr>',
      to: [destinataire],
      subject: sujet,
      html,
      text: texte,
    }),
  });
  if (!r.ok) return { envoye: false, raison: await r.text() };
  return { envoye: true };
}

/** Gabarit HTML commun (compatible clients mail : tableaux, styles en ligne). */
export function gabarit({ titre, intro, blocs = [], ctaTexte, ctaUrl, pied }) {
  const lignes = blocs.map((b) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #E6E0CE">
      <strong style="color:#16215B">${b.titre}</strong><br>
      <span style="color:#4A5068;font-size:14px">${b.detail || ''}</span>
      ${b.url ? `<br><a href="${b.url}" style="color:#16215B;font-weight:600">Télécharger →</a>` : ''}
    </td></tr>`).join('');

  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#FBF4E4;font-family:Helvetica,Arial,sans-serif;color:#101426">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
    <table width="100%" style="max-width:560px;background:#FFFDF7;border-radius:16px;overflow:hidden;border:1px solid #E6E0CE">
      <tr><td style="background:#16215B;padding:22px 26px;color:#fff">
        <span style="font-size:20px;font-weight:700">🎓 Kulture Académie</span><br>
        <span style="font-size:13px;color:#F2B705">Apprendre vite, comprendre mieux</span>
      </td></tr>
      <tr><td style="padding:26px">
        <h1 style="margin:0 0 12px;font-size:22px;color:#16215B">${titre}</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4A5068">${intro}</p>
        ${lignes ? `<table width="100%" cellpadding="0" cellspacing="0">${lignes}</table>` : ''}
        ${ctaUrl ? `<p style="margin:24px 0"><a href="${ctaUrl}" style="background:#F2B705;color:#16215B;text-decoration:none;padding:14px 22px;border-radius:100px;font-weight:700;display:inline-block">${ctaTexte}</a></p>` : ''}
        <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#7A8098">${pied || ''}</p>
      </td></tr>
      <tr><td style="padding:16px 26px;background:#F3E9D2;font-size:12px;color:#4A5068">
        Une question ? Réponds simplement à cet e-mail.
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}
