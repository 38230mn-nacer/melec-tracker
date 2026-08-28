/** Page de confirmation : récupère la commande et affiche les liens de téléchargement. */
import { CONFIG } from './config.js';
import { panier } from './cart.js';
import { prix, track, initHeader } from './ui.js';

const $ = (s) => document.querySelector(s);

async function init() {
  initHeader();
  const params = new URLSearchParams(location.search);
  const session = params.get('session_id');
  const liste = $('#telechargements');
  const recap = $('#recap');

  // Le paiement est validé : le panier n'a plus lieu d'être.
  panier.vider();

  if (!session) {
    recap.textContent = "Ta commande est bien enregistrée. Les liens de téléchargement viennent de t'être envoyés par e-mail.";
    liste.innerHTML = `<li><span>Consulte ta boîte mail (et le dossier spam) pour accéder à tes fichiers.</span>
      <a class="btn btn--sm btn--ghost" href="mailto:contact@kulture-academie.fr">Besoin d'aide ?</a></li>`;
    return;
  }

  try {
    const r = await fetch(`${CONFIG.apiBase}/api/commande?session_id=${encodeURIComponent(session)}`);
    if (!r.ok) throw new Error('api');
    const cmd = await r.json();

    recap.textContent = `Commande ${cmd.reference} — ${cmd.lignes.length} produit(s) · ${prix(cmd.total)} · confirmation envoyée à ${cmd.email}.`;

    liste.innerHTML = cmd.lignes.map((l) => `
      <li>
        <span><b>${l.nom}</b><br><small>${l.poids_mo ? l.poids_mo + ' Mo · ' : ''}PDF + PNG</small></span>
        <a class="btn btn--gold btn--sm" href="${l.url}" download>Télécharger</a>
      </li>`).join('');

    track('purchase', {
      transaction_id: cmd.reference, currency: 'EUR', value: cmd.total / 100,
      items: cmd.lignes.map((l) => ({ item_id: l.id, item_name: l.nom })),
    });
  } catch {
    recap.textContent = "Paiement bien reçu ! Tes liens de téléchargement t'ont été envoyés par e-mail.";
    liste.innerHTML = `<li><span>Si tu ne les vois pas dans 10 minutes, vérifie tes spams puis écris-nous :
      nous renvoyons les fichiers manuellement sous 24 h.</span>
      <a class="btn btn--sm btn--ghost" href="mailto:contact@kulture-academie.fr">Nous écrire</a></li>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
