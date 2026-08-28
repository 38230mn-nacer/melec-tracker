/**
 * Panier — état persistant (localStorage) + abonnement aux changements.
 */
const CLE = 'ka_panier_v1';

const etat = { items: [], bump: false };
const abonnes = new Set();

function lire() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) || '{}');
    etat.items = Array.isArray(brut.items) ? brut.items.filter((x) => typeof x === 'string') : [];
    etat.bump = !!brut.bump;
  } catch { /* stockage indisponible : le panier reste en mémoire */ }
}

function ecrire() {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* mode privé */ }
  abonnes.forEach((fn) => fn(instantane()));
}

function instantane() { return { items: [...etat.items], bump: etat.bump }; }

lire();

export const panier = {
  get items() { return [...etat.items]; },
  get bump() { return etat.bump; },
  get nombre() { return etat.items.length + (etat.bump && etat.items.length ? 1 : 0); },

  contient(id) { return etat.items.includes(id); },

  ajouter(id) {
    if (!etat.items.includes(id)) etat.items.push(id);
    ecrire();
  },
  retirer(id) {
    etat.items = etat.items.filter((x) => x !== id);
    if (!etat.items.length) etat.bump = false;
    ecrire();
  },
  basculer(id) { this.contient(id) ? this.retirer(id) : this.ajouter(id); },
  definirBump(v) { etat.bump = !!v; ecrire(); },
  vider() { etat.items = []; etat.bump = false; ecrire(); },

  surChangement(fn) { abonnes.add(fn); fn(instantane()); return () => abonnes.delete(fn); },
};
