/**
 * Comportements communs à toutes les pages de la boutique :
 * en-tête, panier, paiement, aperçus de fiches, notifications, analytics.
 */
import { CONFIG } from './config.js';
import { panier } from './cart.js';
import { calculerCommande, formatPrix } from './pricing.js';
import { rendreFiche, chargerFiche } from './fiche.js';

export const prix = (c) => formatPrix(c, '€');

/* ------------------------------------------------------------- Catalogue */

let cataloguePromise = null;
export function chargerCatalogue() {
  if (!cataloguePromise) {
    cataloguePromise = fetch(CONFIG.chemins.catalogue).then((r) => {
      if (!r.ok) throw new Error('Catalogue indisponible');
      return r.json();
    });
  }
  return cataloguePromise;
}

export const produitPar = (cat, id) => cat.produits.find((p) => p.id === id);

/* ---------------------------------------------------------- Notifications */

let toastEl = null;
export function toast(message, duree = 3200) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  requestAnimationFrame(() => toastEl.classList.add('is-visible'));
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('is-visible'), duree);
}

/* ------------------------------------------------------------- Analytics */

export function track(evenement, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evenement, ...params });
  if (typeof window.gtag === 'function') window.gtag('event', evenement, params);
  if (typeof window.fbq === 'function') {
    const meta = { add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', generate_lead: 'Lead', view_item: 'ViewContent' }[evenement];
    if (meta) window.fbq('track', meta, params);
  }
}

/** Conserve la provenance (utm, ?ref=) pour l'attribution des ventes. */
export function memoriserSource() {
  try {
    const u = new URLSearchParams(location.search);
    const src = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'].forEach((k) => {
      if (u.get(k)) src[k] = u.get(k);
    });
    if (Object.keys(src).length) sessionStorage.setItem('ka_source', JSON.stringify(src));
  } catch { /* ignore */ }
}
function source() {
  try { return JSON.parse(sessionStorage.getItem('ka_source') || '{}'); } catch { return {}; }
}

/* --------------------------------------------------------------- En-tête */

export function initHeader() {
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const ouvert = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(ouvert));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }
  initCompteARebours();
}

function initCompteARebours() {
  const el = document.querySelector('.topbar__timer');
  if (!el) return;
  if (!CONFIG.finPromo) { el.closest('.topbar')?.classList.add('sans-timer'); el.remove(); return; }
  const fin = new Date(CONFIG.finPromo).getTime();
  const tic = () => {
    const reste = fin - Date.now();
    if (reste <= 0) { el.textContent = 'terminée'; return; }
    const j = Math.floor(reste / 864e5), h = Math.floor(reste / 36e5) % 24;
    const m = Math.floor(reste / 6e4) % 60, s = Math.floor(reste / 1e3) % 60;
    el.textContent = j > 0 ? `${j}j ${h}h ${m}min` : `${h}h ${String(m).padStart(2, '0')}min ${String(s).padStart(2, '0')}s`;
    setTimeout(tic, 1000);
  };
  tic();
}

/* ------------------------------------------------------- Révélation, CTA */

export function initReveal() {
  const cibles = document.querySelectorAll('.reveal');
  if (!cibles.length) return;
  if (!('IntersectionObserver' in window)) { cibles.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  cibles.forEach((e) => io.observe(e));
}

export function initMobileCta(ancre = '#packs') {
  const barre = document.querySelector('.mobile-cta');
  if (!barre) return;
  const lien = barre.querySelector('a');
  if (lien) lien.setAttribute('href', ancre);
  document.body.classList.add('has-mobile-cta');
  const onScroll = () => barre.classList.toggle('is-visible', window.scrollY > 700);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------------- Panier */

export function initPanier(catalogue) {
  const bouton = document.querySelector('.cart-btn');
  const tiroir = document.querySelector('.drawer');
  const fond = document.querySelector('.drawer-backdrop');
  if (!tiroir || !fond) return;

  const corps = tiroir.querySelector('.drawer__body');
  const pied = tiroir.querySelector('.drawer__foot');

  const ouvrir = () => {
    tiroir.classList.add('is-open'); fond.classList.add('is-open');
    tiroir.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    tiroir.querySelector('.drawer__close')?.focus();
  };
  const fermer = () => {
    tiroir.classList.remove('is-open'); fond.classList.remove('is-open');
    tiroir.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  bouton?.addEventListener('click', ouvrir);
  fond.addEventListener('click', fermer);
  tiroir.querySelector('.drawer__close')?.addEventListener('click', fermer);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
  document.addEventListener('ka:ouvrir-panier', ouvrir);

  panier.surChangement(() => rendrePanier(catalogue, corps, pied));
  return { ouvrir, fermer };
}

function rendrePanier(catalogue, corps, pied) {
  const cmd = calculerCommande(panier.items, panier.bump, catalogue);
  const compteur = document.querySelector('.cart-btn__count');
  if (compteur) {
    compteur.textContent = panier.nombre;
    compteur.style.display = panier.nombre ? '' : 'none';
  }

  if (!panier.items.length) {
    corps.innerHTML = `<div class="cart-empty">
        <p style="font-size:2.4rem;margin:0">🎒</p>
        <p><b>Ton panier est vide.</b></p>
        <p>Choisis ton niveau, ou prends le pack complet : c'est celui qui revient le moins cher à la fiche.</p>
        <a class="btn btn--gold" href="index.html#packs">Voir les packs</a>
      </div>`;
    pied.innerHTML = '';
    return;
  }

  const lignes = cmd.lignes.map((l) => `
    <div class="cart-line">
      <div class="cart-line__thumb" aria-hidden="true">${l.type === 'bump' ? '★' : 'PDF'}</div>
      <div><b>${l.nom}</b><small>${l.sousTitre || ''}</small>
        ${l.type === 'pack' ? `<button class="cart-line__rm" data-retirer="${l.id}">Retirer</button>` : ''}
      </div>
      <div><b>${prix(l.prix)}</b></div>
    </div>`).join('');

  const bump = catalogue.order_bump;
  const blocBump = bump ? `
    <div class="bump">
      <label>
        <input type="checkbox" id="ka-bump" ${panier.bump ? 'checked' : ''}>
        <span><b>Oui, j'ajoute ${bump.nom} (+${prix(bump.prix)})</b>
        ${bump.texte}</span>
      </label>
    </div>` : '';

  const manquants = catalogue.remises
    .map((r) => r.seuil - panier.items.length)
    .filter((d) => d > 0)
    .sort((a, b) => a - b)[0];
  const relance = manquants
    ? `<div class="cart-suggest"><b>Ajoute ${manquants} pack${manquants > 1 ? 's' : ''} et la remise automatique s'applique.</b>
       <div style="margin-top:.6rem"><a class="btn btn--ghost btn--sm" href="index.html#packs">Compléter ma commande</a></div></div>`
    : '';

  corps.innerHTML = lignes + blocBump + relance;

  pied.innerHTML = `
    <div class="cart-totals">
      <div><span>Sous-total</span><span>${prix(cmd.sousTotal)}</span></div>
      ${cmd.remise ? `<div class="save"><span>${cmd.remiseLibelle}</span><span>− ${prix(cmd.remise)}</span></div>` : ''}
      <div class="total"><span>Total</span><span>${prix(cmd.total)}</span></div>
      <div style="font-size:.8rem;color:var(--ink-soft)">TVA incluse • téléchargement immédiat</div>
    </div>
    <button class="btn btn--gold btn--block" id="ka-payer">Payer ${prix(cmd.total)} →</button>
    <small class="btn-sub center" style="display:block">🔒 Paiement sécurisé Stripe • Satisfait ou remboursé 30 jours</small>`;

  corps.querySelectorAll('[data-retirer]').forEach((b) =>
    b.addEventListener('click', () => { panier.retirer(b.dataset.retirer); toast('Produit retiré'); }));
  corps.querySelector('#ka-bump')?.addEventListener('change', (e) => {
    panier.definirBump(e.target.checked);
    if (e.target.checked) track('add_to_cart', { item_id: bump.id, value: bump.prix / 100, currency: 'EUR' });
  });
  pied.querySelector('#ka-payer')?.addEventListener('click', (e) => payer(catalogue, e.currentTarget));
}

/* -------------------------------------------------------------- Paiement */

export async function payer(catalogue, bouton) {
  const cmd = calculerCommande(panier.items, panier.bump, catalogue);
  if (!cmd.lignes.length) { toast('Ton panier est vide'); return; }

  track('begin_checkout', {
    currency: 'EUR', value: cmd.total / 100,
    items: cmd.lignes.map((l) => ({ item_id: l.id, price: l.prix / 100 })),
  });

  const texteInitial = bouton?.textContent;
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Redirection…'; }

  const rendreLaMain = () => { if (bouton) { bouton.disabled = false; bouton.textContent = texteInitial; } };

  if (CONFIG.modePaiement !== 'liens') {
    try {
      const r = await fetch(`${CONFIG.apiBase}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: panier.items, bump: panier.bump, source: source() }),
      });
      if (r.ok) {
        const { url } = await r.json();
        if (url) { location.href = url; return; }
      }
      if (CONFIG.modePaiement === 'api') {
        const err = await r.json().catch(() => ({}));
        toast(err.message || "Le paiement est momentanément indisponible. Réessaie dans un instant.");
        rendreLaMain();
        return;
      }
    } catch {
      if (CONFIG.modePaiement === 'api') {
        toast('Connexion au paiement impossible. Vérifie ta connexion et réessaie.');
        rendreLaMain();
        return;
      }
    }
  }

  // Repli : lien de paiement hébergé (aucun serveur requis)
  const principal = [...cmd.lignes].filter((l) => l.type === 'pack').sort((a, b) => b.prix - a.prix)[0];
  const lien = principal && CONFIG.lienPaiement[principal.id];
  if (lien) {
    if (cmd.lignes.filter((l) => l.type === 'pack').length > 1) {
      toast('Mode lien de paiement : un pack à la fois. Redirection vers le plus complet.');
      await new Promise((r) => setTimeout(r, 1400));
    }
    location.href = lien;
    return;
  }
  toast("Le paiement n'est pas encore configuré pour ce produit.");
  rendreLaMain();
}

/* ------------------------------------------------------- Aperçu de fiche */

export function initModale() {
  let fond = document.querySelector('.modal-backdrop');
  if (!fond) {
    fond = document.createElement('div');
    fond.className = 'modal-backdrop';
    fond.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Aperçu de fiche">
        <div class="modal__head"><h3 class="modal__titre" style="margin:0"></h3>
        <button class="modal__close" aria-label="Fermer">×</button></div>
        <div class="modal__corps"></div></div>`;
    document.body.appendChild(fond);
    fond.addEventListener('click', (e) => { if (e.target === fond) fermerModale(); });
    fond.querySelector('.modal__close').addEventListener('click', fermerModale);
    addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerModale(); });
  }
  return fond;
}
export function fermerModale() {
  document.querySelector('.modal-backdrop')?.classList.remove('is-open');
  document.body.style.overflow = '';
}

/** Ouvre une fiche en grand dans une modale. */
export async function ouvrirApercu(id, titre = 'Aperçu de la fiche') {
  const fond = initModale();
  fond.querySelector('.modal__titre').textContent = titre;
  const corps = fond.querySelector('.modal__corps');
  corps.innerHTML = '<p class="center">Chargement de la fiche…</p>';
  fond.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  track('view_item', { item_id: id, item_category: 'fiche' });
  try {
    const data = await chargerFiche(id, CONFIG.chemins.fiche);
    corps.innerHTML = '';
    corps.appendChild(rendreFiche(data, { apercu: true }));
    corps.insertAdjacentHTML('beforeend', `
      <div class="center" style="margin-top:1.4rem">
        <p style="font-size:.95rem;color:var(--ink-soft)">Version achetée : PDF haute définition sans filigrane + PNG pour le téléphone.</p>
        <a class="btn btn--gold" href="index.html#packs">Voir les packs de fiches</a>
      </div>`);
  } catch {
    corps.innerHTML = '<p class="center">Aperçu indisponible pour le moment.</p>';
  }
}

/** Insère une vignette de fiche cliquable dans un conteneur. */
export async function insererVignette(conteneur, id, titre) {
  try {
    const data = await chargerFiche(id, CONFIG.chemins.fiche);
    const bouton = document.createElement('button');
    bouton.className = 'fiche-thumb';
    bouton.type = 'button';
    bouton.setAttribute('aria-label', `Agrandir la fiche ${data.titre}`);
    bouton.appendChild(rendreFiche(data, { apercu: true, vignette: true }));
    bouton.addEventListener('click', () => ouvrirApercu(id, titre || data.titre));
    conteneur.innerHTML = '';
    conteneur.appendChild(bouton);
  } catch { conteneur.innerHTML = ''; }
}

/* ------------------------------------------------- Ajout au panier (API) */

export function ajouterAuPanier(catalogue, id, { ouvrir = true } = {}) {
  const p = produitPar(catalogue, id);
  if (!p) return;
  panier.ajouter(id);
  track('add_to_cart', { currency: 'EUR', value: p.prix / 100, items: [{ item_id: p.id, item_name: p.nom, price: p.prix / 100 }] });
  toast(`${p.nom} ajouté au panier`);
  if (ouvrir) document.dispatchEvent(new CustomEvent('ka:ouvrir-panier'));
}
