/**
 * Page d'accueil : hero, catalogue filtrable, comparateur, aperçus,
 * avis, FAQ, capture d'e-mail.
 */
import { CONFIG } from './config.js';
import { panier } from './cart.js';
import { prixParFiche } from './pricing.js';
import {
  chargerCatalogue, prix, toast, track, memoriserSource, initHeader, initReveal,
  initMobileCta, initPanier, ajouterAuPanier, ouvrirApercu, insererVignette,
} from './ui.js';
import { rendreFiche, chargerFiche } from './fiche.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let CAT = null;
let FICHES = [];

/* ------------------------------------------------------------------ Hero */

async function construireHero() {
  const fan = $('.fan');
  if (!fan) return;
  const vedettes = ['vecteurs', 'second-degre', 'fonction-ln', 'titrage', 'tableau-periodique'];
  const items = vedettes.map(() => {
    const el = document.createElement('div');
    el.className = 'fan__item';
    fan.appendChild(el);
    return el;
  });
  await Promise.all(vedettes.map(async (id, i) => {
    try {
      const data = await chargerFiche(id, CONFIG.chemins.fiche);
      items[i].appendChild(rendreFiche(data, { vignette: true }));
    } catch { items[i].remove(); }
  }));
}

/* ------------------------------------------------------------- Catalogue */

const filtres = { niveau: 'tous', matiere: 'toutes' };

function correspond(p) {
  const n = filtres.niveau === 'tous' || p.niveaux.includes(filtres.niveau);
  const m = filtres.matiere === 'toutes' || p.matieres.includes(filtres.matiere);
  return n && m;
}

function carteProduit(p) {
  const art = document.createElement('article');
  art.className = 'product reveal' + (p.mise_en_avant ? ' product--featured' : '');
  if (p.badge) art.dataset.badge = p.badge;

  const couleurs = p.matieres.map((m) => CAT.matieres.find((x) => x.id === m)?.couleur || '#16215B');
  const cartes = Array.from({ length: 5 }, (_, i) =>
    `<i style="--c:${couleurs[i % couleurs.length]}"></i>`).join('');

  const parFiche = prixParFiche(p);
  const eco = p.prix_barre ? Math.round(100 - (p.prix / p.prix_barre) * 100) : 0;

  art.innerHTML = `
    <div class="product__visual"><div class="mini-fan">${cartes}</div></div>
    <div class="product__body">
      <div class="product__tags">
        ${p.niveaux.map((n) => { const x = CAT.niveaux.find((v) => v.id === n); return `<span class="pill">${x ? x.nom : n}</span>`; }).join('')}
        ${p.matieres.map((m) => `<span class="pill pill--${m === 'maths' ? 'maths' : 'pc'}">${CAT.matieres.find((x) => x.id === m)?.court || m}</span>`).join('')}
      </div>
      <h3>${p.nom}</h3>
      <p class="product__sub">${p.sous_titre}</p>
      <ul class="product__list">${p.inclus.slice(0, 4).map((i) => `<li><span>${i}</span></li>`).join('')}</ul>
      <div class="product__price">
        <b>${prix(p.prix)}</b>
        ${p.prix_barre ? `<span class="strike">${prix(p.prix_barre)}</span><span class="product__save">−${eco} %</span>` : ''}
      </div>
      <div class="product__unit">${parFiche ? `soit ${(parFiche / 100).toFixed(2).replace('.', ',')} € la fiche · ${p.nb_fiches} fiches` : ''}</div>
      <div class="product__actions">
        <button class="btn ${p.mise_en_avant ? 'btn--gold' : ''}" data-ajouter="${p.id}">
          ${panier.contient(p.id) ? '✓ Dans le panier' : 'Ajouter au panier'}
        </button>
        <a class="btn btn--ghost btn--sm" href="produit.html?id=${p.id}">Voir le détail</a>
        ${p.apercus?.length ? `<button class="link-preview" data-apercu="${p.apercus[0]}">👀 Voir un exemple de fiche</button>` : ''}
      </div>
    </div>`;

  art.querySelector('[data-ajouter]').addEventListener('click', (e) => {
    ajouterAuPanier(CAT, p.id);
    e.currentTarget.textContent = '✓ Dans le panier';
  });
  art.querySelector('[data-apercu]')?.addEventListener('click', (e) => ouvrirApercu(e.currentTarget.dataset.apercu));
  return art;
}

function rendreCatalogue() {
  const grille = $('#grille-produits');
  if (!grille) return;
  const liste = CAT.produits.filter(correspond);
  grille.innerHTML = '';
  if (!liste.length) {
    grille.innerHTML = `<p class="center" style="grid-column:1/-1">Aucun pack pour cette combinaison.
      <button class="link-preview" id="reset-filtres">Réinitialiser les filtres</button></p>`;
    $('#reset-filtres')?.addEventListener('click', () => {
      filtres.niveau = 'tous'; filtres.matiere = 'toutes';
      $$('.filter').forEach((b) => b.classList.toggle('is-active', b.dataset.valeur === 'tous' || b.dataset.valeur === 'toutes'));
      rendreCatalogue();
    });
    return;
  }
  liste.forEach((p) => grille.appendChild(carteProduit(p)));
  initReveal();
  track('view_item_list', { item_list_name: 'catalogue', items: liste.map((p) => ({ item_id: p.id })) });
}

function construireFiltres() {
  const zone = $('#filtres');
  if (!zone) return;
  const groupes = [
    { cle: 'niveau', options: [{ id: 'tous', nom: 'Tous les niveaux' }, ...CAT.niveaux] },
    { cle: 'matiere', options: [{ id: 'toutes', nom: 'Toutes les matières' }, ...CAT.matieres] },
  ];
  zone.innerHTML = '';
  groupes.forEach((g) => {
    g.options.forEach((o) => {
      const b = document.createElement('button');
      b.className = 'filter' + (filtres[g.cle] === o.id ? ' is-active' : '');
      b.type = 'button';
      b.dataset.groupe = g.cle;
      b.dataset.valeur = o.id;
      b.textContent = o.nom;
      b.addEventListener('click', () => {
        filtres[g.cle] = o.id;
        $$(`[data-groupe="${g.cle}"]`, zone).forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
        rendreCatalogue();
      });
      zone.appendChild(b);
    });
  });
}

/* ------------------------------------------------------------ Comparateur */

function rendreComparateur() {
  const hote = $('#comparateur');
  if (!hote) return;
  const packs = CAT.produits.filter((p) => p.type === 'pack').slice(0, 4);
  const lignes = [
    ['Nombre de fiches', (p) => `${p.nb_fiches}`],
    ['Niveaux couverts', (p) => p.niveaux.map((n) => CAT.niveaux.find((x) => x.id === n)?.court).join(' · ')],
    ['Matières', (p) => p.matieres.map((m) => CAT.matieres.find((x) => x.id === m)?.court).join(' · ')],
    ['Prix à la fiche', (p) => `${(prixParFiche(p) / 100).toFixed(2).replace('.', ',')} €`],
    ['PDF A4 + PNG', () => '<span class="yes">✓</span>'],
    ['Mises à jour à vie', () => '<span class="yes">✓</span>'],
    ['Valable jusqu’au bac', (p) => (p.niveaux.length === 3 ? '<span class="yes">✓</span>' : '<span class="no">—</span>')],
    ['Prix', (p) => `<b>${prix(p.prix)}</b>`],
  ];
  hote.innerHTML = `
    <table>
      <thead><tr><th style="text-align:left">Comparatif</th>
        ${packs.map((p) => `<th${p.mise_en_avant ? ' class="is-best"' : ''}>${p.nom}</th>`).join('')}</tr></thead>
      <tbody>
        ${lignes.map(([titre, val]) => `<tr><th>${titre}</th>
          ${packs.map((p) => `<td${p.mise_en_avant ? ' class="is-best"' : ''}>${val(p)}</td>`).join('')}</tr>`).join('')}
        <tr><th></th>${packs.map((p) => `<td${p.mise_en_avant ? ' class="is-best"' : ''}>
          <button class="btn btn--sm ${p.mise_en_avant ? 'btn--gold' : 'btn--ghost'}" data-ajouter="${p.id}">Choisir</button></td>`).join('')}</tr>
      </tbody>
    </table>`;
  $$('[data-ajouter]', hote).forEach((b) => b.addEventListener('click', () => ajouterAuPanier(CAT, b.dataset.ajouter)));
}

/* ---------------------------------------------------------- Aperçus */

async function rendreApercus() {
  const liste = $('#apercus-liste');
  const scene = $('#apercus-scene');
  if (!liste || !scene) return;
  try {
    const r = await fetch(CONFIG.chemins.fiches);
    FICHES = (await r.json()).fiches;
  } catch { return; }

  const afficher = async (f, bouton) => {
    $$('.preview-tab', liste).forEach((b) => b.classList.remove('is-active'));
    bouton.classList.add('is-active');
    scene.innerHTML = '<p class="center">Chargement…</p>';
    try {
      const data = await chargerFiche(f.id, CONFIG.chemins.fiche);
      scene.innerHTML = '';
      const b = document.createElement('button');
      b.className = 'fiche-thumb';
      b.type = 'button';
      b.appendChild(rendreFiche(data, { apercu: true }));
      b.addEventListener('click', () => ouvrirApercu(f.id, data.titre));
      scene.appendChild(b);
    } catch { scene.innerHTML = '<p class="center">Aperçu indisponible.</p>'; }
  };

  liste.innerHTML = '';
  FICHES.forEach((f, i) => {
    const niveau = CAT.niveaux.find((n) => n.id === f.niveau)?.nom || '';
    const matiere = CAT.matieres.find((m) => m.id === f.matiere)?.court || '';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preview-tab' + (i === 0 ? ' is-active' : '');
    b.innerHTML = `<b>${f.titre}</b><small>${niveau} · ${matiere}${f.gratuite ? ' · aperçu offert' : ''}</small>`;
    b.addEventListener('click', () => afficher(f, b));
    liste.appendChild(b);
    if (i === 0) afficher(f, b);
  });
}

/* -------------------------------------------------------------- Avis/FAQ */

function rendreAvis() {
  const hote = $('#avis');
  if (!hote) return;
  hote.innerHTML = CAT.avis.map((a) => `
    <figure class="review reveal" style="margin:0">
      <div class="stars" aria-label="${a.note} sur 5">${'★'.repeat(a.note)}${'☆'.repeat(5 - a.note)}</div>
      <blockquote style="margin:.6rem 0 0;padding:0"><p>« ${a.texte} »</p></blockquote>
      <figcaption class="review__who">
        <i aria-hidden="true">${a.prenom[0]}</i>
        <span><b>${a.prenom}</b><small>${a.niveau}${a.verifie ? ' · achat vérifié' : ''}</small></span>
      </figcaption>
    </figure>`).join('');
}

function rendreFaq() {
  const hote = $('#faq-liste');
  if (!hote) return;
  hote.innerHTML = CAT.faq.map((f, i) => `
    <details${i === 0 ? ' open' : ''}>
      <summary>${f.q}</summary>
      <div>${f.r}</div>
    </details>`).join('');
}

function rendreStats() {
  const hote = $('#stats');
  if (!hote) return;
  const total = CAT.produits.find((p) => p.id === 'pack-lycee-complet')?.nb_fiches || 301;
  const donnees = [
    [total, 'fiches de révision'],
    [3, 'niveaux couverts'],
    [2, 'matières scientifiques'],
    ['4,9/5', 'note moyenne'],
  ];
  hote.innerHTML = donnees.map(([v, l]) => `<div class="stat reveal"><b data-compte="${typeof v === 'number' ? v : ''}">${v}</b><span>${l}</span></div>`).join('');

  // Compteur animé
  $$('[data-compte]', hote).forEach((el) => {
    const cible = Number(el.dataset.compte);
    if (!cible) return;
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), duree = 900;
      const pas = (t) => {
        const k = Math.min(1, (t - t0) / duree);
        el.textContent = Math.round(cible * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }, { threshold: .5 });
    io.observe(el);
  });
}

/* ------------------------------------------------------- Fiche gratuite */

function initFormulaireLead() {
  const form = $('#form-fiche-gratuite');
  if (!form) return;

  const choix = $('#lead-fiche');
  if (choix) {
    choix.innerHTML = FICHES.filter((f) => f.gratuite)
      .map((f) => `<option value="${f.id}">${f.titre}</option>`).join('')
      || '<option value="second-degre">Fonction polynôme du second degré</option>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bouton = form.querySelector('button[type=submit]');
    const donnees = Object.fromEntries(new FormData(form).entries());
    if (!donnees.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(donnees.email)) {
      toast('Vérifie ton adresse e-mail'); return;
    }
    bouton.disabled = true; bouton.textContent = 'Envoi…';
    try {
      const r = await fetch(`${CONFIG.apiBase}/api/lead`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(donnees),
      });
      if (!r.ok) throw new Error('api');
      track('generate_lead', { method: 'fiche-gratuite' });
      form.outerHTML = `<div class="lead-ok">
        <h3 style="color:#fff;margin-top:0">C'est envoyé 🎉</h3>
        <p>Ta fiche arrive dans les 2 minutes sur <b>${donnees.email}</b>.
        Pense à regarder l'onglet « Promotions » si tu ne la vois pas.</p></div>`;
    } catch {
      // Sans serveur : on ouvre quand même la fiche demandée, et on prévient.
      track('generate_lead', { method: 'fiche-gratuite-hors-ligne' });
      toast("Envoi indisponible : la fiche s'ouvre directement.");
      ouvrirApercu(donnees.fiche || 'second-degre');
      bouton.disabled = false; bouton.textContent = 'Recevoir ma fiche';
    }
  });
}

/* ------------------------------------------------------------------ Init */

async function init() {
  memoriserSource();
  initHeader();
  try {
    CAT = await chargerCatalogue();
  } catch {
    toast('Catalogue indisponible. Lance un serveur local (voir README).');
    return;
  }
  document.documentElement.dataset.catalogue = 'pret';

  construireFiltres();
  rendreCatalogue();
  rendreComparateur();
  rendreAvis();
  rendreFaq();
  rendreStats();
  initPanier(CAT);
  initMobileCta('#packs');
  initReveal();
  await construireHero();
  await rendreApercus();
  initFormulaireLead();

  // CTA génériques (« Voir les packs », etc.)
  $$('[data-action="panier"]').forEach((b) =>
    b.addEventListener('click', () => document.dispatchEvent(new CustomEvent('ka:ouvrir-panier'))));
  $$('[data-action="ajouter-vedette"]').forEach((b) =>
    b.addEventListener('click', () => ajouterAuPanier(CAT, 'pack-lycee-complet')));
}

document.addEventListener('DOMContentLoaded', init);
