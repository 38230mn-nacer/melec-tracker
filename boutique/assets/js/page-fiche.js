/** Lecteur de fiche : fiche.html?id=<identifiant> */
import { CONFIG } from './config.js';
import { initHeader, track } from './ui.js';
import { rendreFiche, chargerFiche } from './fiche.js';

async function init() {
  initHeader();
  document.getElementById('imprimer')?.addEventListener('click', () => window.print());

  const id = new URLSearchParams(location.search).get('id') || 'second-degre';
  const zone = document.getElementById('zone-fiche');

  // Seules les fiches déclarées gratuites sont consultables ici.
  let entree = null;
  try {
    const r = await fetch(CONFIG.chemins.fiches);
    entree = (await r.json()).fiches.find((f) => f.id === id && f.gratuite);
  } catch { /* index indisponible */ }

  if (!entree) {
    zone.innerHTML = `<div class="card" style="padding:2rem;text-align:center">
      <h2>Cette fiche n'est pas en accès libre</h2>
      <p>Elle fait partie des packs. Tu peux en découvrir d'autres gratuitement depuis la page d'accueil.</p>
      <a class="btn btn--gold" href="index.html#gratuit">Demander une fiche gratuite</a></div>`;
    return;
  }

  try {
    const data = await chargerFiche(id, CONFIG.chemins.fiche);
    document.title = `${data.titre} — fiche de révision Kulture Académie`;
    document.getElementById('titre').textContent = data.titre;
    document.getElementById('sous-titre').textContent = entree.resume;
    zone.innerHTML = '';
    zone.appendChild(rendreFiche(data));
    track('view_item', { item_id: id, item_category: 'fiche-gratuite' });
  } catch {
    zone.innerHTML = '<p class="center">Fiche momentanément indisponible.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
