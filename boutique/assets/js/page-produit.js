/** Page produit : ?id=<identifiant du pack> */
import { panier } from './cart.js';
import { prixParFiche } from './pricing.js';
import {
  chargerCatalogue, produitPar, prix, track, memoriserSource, initHeader, initReveal,
  initPanier, initMobileCta, ajouterAuPanier, payer, ouvrirApercu, insererVignette,
} from './ui.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

async function init() {
  memoriserSource();
  initHeader();

  const id = new URLSearchParams(location.search).get('id');
  const cat = await chargerCatalogue().catch(() => null);
  const p = cat && id ? produitPar(cat, id) : null;

  if (!p) { $('#produit-vide').hidden = false; return; }
  $('#produit-contenu').hidden = false;

  initPanier(cat);
  initMobileCta();

  /* --- Titres et méta --- */
  document.title = `${p.nom} — ${p.sous_titre} | Kulture Académie`;
  const meta = document.querySelector('meta[name=description]');
  if (meta) meta.content = `${p.nom} : ${p.sous_titre}. ${p.accroche}`;
  $('#fil-nom').textContent = p.nom;
  $('#p-nom').textContent = p.nom;
  $('#p-accroche').textContent = `${p.sous_titre} — ${p.accroche}`;

  /* --- Données structurées --- */
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.nom, description: p.accroche, brand: { '@type': 'Brand', name: 'Kulture Académie' },
    offers: {
      '@type': 'Offer', price: (p.prix / 100).toFixed(2), priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock', url: location.href,
    },
  });
  document.head.appendChild(ld);

  /* --- Bloc achat --- */
  $('#p-prix').textContent = prix(p.prix);
  if (p.prix_barre) {
    $('#p-prix-barre').textContent = prix(p.prix_barre);
    $('#p-eco').textContent = `−${Math.round(100 - (p.prix / p.prix_barre) * 100)} %`;
  }
  const pf = prixParFiche(p);
  $('#p-unitaire').textContent = pf ? `${p.nb_fiches} fiches — soit ${(pf / 100).toFixed(2).replace('.', ',')} € la fiche` : '';
  $('#p-tags').innerHTML =
    p.niveaux.map((n) => `<span class="pill">${cat.niveaux.find((x) => x.id === n)?.nom || n}</span>`).join('') +
    p.matieres.map((m) => `<span class="pill pill--${m === 'maths' ? 'maths' : 'pc'}">${cat.matieres.find((x) => x.id === m)?.court || m}</span>`).join('');

  const majBoutonPanier = () => {
    $('#p-panier').textContent = panier.contient(p.id) ? '✓ Dans le panier' : 'Ajouter au panier';
  };
  panier.surChangement(majBoutonPanier);

  $('#p-panier').addEventListener('click', () => ajouterAuPanier(cat, p.id));
  const acheter = () => { panier.ajouter(p.id); payer(cat, $('#p-acheter')); };
  $('#p-acheter').addEventListener('click', acheter);
  $('#p-mobile')?.addEventListener('click', acheter);

  track('view_item', {
    currency: 'EUR', value: p.prix / 100,
    items: [{ item_id: p.id, item_name: p.nom, price: p.prix / 100 }],
  });

  /* --- Contenu --- */
  $('#p-inclus').innerHTML = p.inclus.map((i) => `<li><span>${i}</span></li>`).join('');
  $('#p-arguments').innerHTML = (p.arguments || []).map((a, i) =>
    `<div class="argument reveal"><i>${i + 1}</i><div><b>${a.titre}</b><p class="mb-0">${a.texte}</p></div></div>`).join('');

  const galerie = $('#p-galerie');
  galerie.innerHTML = '';
  (p.apercus || []).forEach((fid) => {
    const case_ = document.createElement('div');
    galerie.appendChild(case_);
    insererVignette(case_, fid);
  });

  /* --- Autres packs --- */
  const autres = cat.produits.filter((x) => x.id !== p.id).slice(0, 3);
  $('#p-autres').innerHTML = autres.map((x) => `
    <article class="product">
      <div class="product__body">
        <h3>${x.nom}</h3>
        <p class="product__sub">${x.sous_titre}</p>
        <div class="product__price"><b>${prix(x.prix)}</b>
          ${x.prix_barre ? `<span class="strike">${prix(x.prix_barre)}</span>` : ''}</div>
        <div class="product__actions">
          <a class="btn btn--ghost btn--sm" href="produit.html?id=${x.id}">Voir ce pack</a>
        </div>
      </div>
    </article>`).join('');

  /* --- FAQ --- */
  $('#faq-liste').innerHTML = cat.faq.map((f, i) =>
    `<details${i === 0 ? ' open' : ''}><summary>${f.q}</summary><div>${f.r}</div></details>`).join('');

  initReveal();
}

document.addEventListener('DOMContentLoaded', init);
