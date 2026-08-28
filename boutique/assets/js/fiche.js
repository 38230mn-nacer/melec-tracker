/**
 * Moteur de rendu des fiches de révision.
 * Une fiche = un JSON. Le rendu produit une page A4 vectorielle, imprimable,
 * lisible à toute taille (tout est dimensionné en cqw), et les formules sont
 * composées par KaTeX.
 *
 * Ajouter une fiche = déposer un JSON dans data/fiches/ et l'inscrire dans
 * data/fiches.json. Aucun code à modifier.
 */

/* ------------------------------------------------------------------ KaTeX */

let katexPromise = null;
function attendreKatex() {
  if (window.renderMathInElement) return Promise.resolve(true);
  if (katexPromise) return katexPromise;
  katexPromise = new Promise((resolve) => {
    let essais = 0;
    const t = setInterval(() => {
      if (window.renderMathInElement) { clearInterval(t); resolve(true); }
      else if (++essais > 60) { clearInterval(t); resolve(false); }   // ~6 s
    }, 100);
  });
  return katexPromise;
}

/** Compose les maths d'un sous-arbre ; sans KaTeX, le TeX reste lisible. */
export async function composerMaths(racine) {
  const pret = await attendreKatex();
  if (!pret) { racine.classList.add('sans-katex'); return; }
  window.renderMathInElement(racine, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
    trust: false,
  });
}

/* ------------------------------------------------------------- Graphiques */

const NS = 'http://www.w3.org/2000/svg';

function fonctionDe(spec) {
  switch (spec.type) {
    case 'polynome': return (x) => spec.a * x * x + spec.b * x + spec.c;
    case 'ln':       return (x) => (x > 0 ? Math.log(x) : NaN);
    case 'exp':      return (x) => Math.exp(x);
    case 'inverse':  return (x) => (Math.abs(x) < 1e-6 ? NaN : 1 / x);
    case 'sinus':    return (x) => Math.sin(x);
    default:         return () => NaN;
  }
}

/**
 * Trace une courbe dans un repère orthonormé stylisé.
 * spec : { type, xmin, xmax, ymin, ymax, racines?, sommet?, points? }
 */
export function tracerGraphe(spec) {
  const L = 400, H = 260, M = 22;
  const { xmin = -5, xmax = 5, ymin = -5, ymax = 5 } = spec;
  const px = (x) => M + ((x - xmin) / (xmax - xmin)) * (L - 2 * M);
  const py = (y) => H - M - ((y - ymin) / (ymax - ymin)) * (H - 2 * M);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${L} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Représentation graphique');

  const el = (nom, attrs) => {
    const n = document.createElementNS(NS, nom);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.appendChild(n);
    return n;
  };

  el('rect', { x: 0, y: 0, width: L, height: H, fill: '#fff', rx: 6 });

  // Quadrillage à pas entier
  for (let x = Math.ceil(xmin); x <= xmax; x++) {
    el('line', { x1: px(x), y1: M, x2: px(x), y2: H - M, stroke: '#E8EAF2', 'stroke-width': 1 });
  }
  for (let y = Math.ceil(ymin); y <= ymax; y++) {
    el('line', { x1: M, y1: py(y), x2: L - M, y2: py(y), stroke: '#E8EAF2', 'stroke-width': 1 });
  }

  // Axes
  const y0 = Math.min(Math.max(py(0), M), H - M);
  const x0 = Math.min(Math.max(px(0), M), L - M);
  el('line', { x1: M, y1: y0, x2: L - M, y2: y0, stroke: '#5A6076', 'stroke-width': 1.6, 'marker-end': 'url(#fleche)' });
  el('line', { x1: x0, y1: H - M, x2: x0, y2: M, stroke: '#5A6076', 'stroke-width': 1.6, 'marker-end': 'url(#fleche)' });

  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = '<marker id="fleche" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5A6076"/></marker>';
  svg.insertBefore(defs, svg.firstChild);

  el('text', { x: L - M + 4, y: y0 + 4, 'font-size': 11, fill: '#5A6076', 'font-style': 'italic' }).textContent = 'x';
  el('text', { x: x0 - 12, y: M - 4, 'font-size': 11, fill: '#5A6076', 'font-style': 'italic' }).textContent = 'y';

  // Courbe (segments interrompus sur les valeurs non définies)
  const f = fonctionDe(spec);
  const pas = (xmax - xmin) / 400;
  let d = '', ouvert = false;
  for (let x = xmin; x <= xmax; x += pas) {
    const y = f(x);
    if (!Number.isFinite(y) || y < ymin - 2 || y > ymax + 2) { ouvert = false; continue; }
    d += `${ouvert ? 'L' : 'M'}${px(x).toFixed(1)},${py(y).toFixed(1)} `;
    ouvert = true;
  }
  el('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.6, 'stroke-linecap': 'round' });

  // Points remarquables
  const marque = (x, y, couleur, texte) => {
    el('circle', { cx: px(x), cy: py(y), r: 4.2, fill: couleur, stroke: '#fff', 'stroke-width': 1.6 });
    if (texte) {
      el('text', { x: px(x) + 7, y: py(y) - 7, 'font-size': 10.5, 'font-weight': 700, fill: couleur }).textContent = texte;
    }
  };
  (spec.racines || []).forEach((r) => marque(r, 0, '#C2410C', String(r)));
  if (spec.sommet) marque(spec.sommet[0], spec.sommet[1], '#16215B', 'S');
  (spec.points || []).forEach(([x, y]) => marque(x, y, '#16215B'));

  return svg;
}

/* ---------------------------------------------------------------- Schémas */

const SCHEMAS = {
  'vecteur-repere': `
    <svg viewBox="0 0 400 250" role="img" aria-label="Vecteur AB dans un repère">
      <rect width="400" height="250" fill="#fff" rx="6"/>
      <g stroke="#E8EAF2">
        ${Array.from({ length: 9 }, (_, i) => `<line x1="${40 + i * 40}" y1="20" x2="${40 + i * 40}" y2="220"/>`).join('')}
        ${Array.from({ length: 5 }, (_, i) => `<line x1="40" y1="${20 + i * 50}" x2="360" y2="${20 + i * 50}"/>`).join('')}
      </g>
      <line x1="40" y1="220" x2="370" y2="220" stroke="#5A6076" stroke-width="1.6"/>
      <line x1="40" y1="230" x2="40" y2="20" stroke="#5A6076" stroke-width="1.6"/>
      <text x="374" y="224" font-size="11" fill="#5A6076" font-style="italic">x</text>
      <text x="28" y="18" font-size="11" fill="#5A6076" font-style="italic">y</text>
      <line x1="80" y1="170" x2="280" y2="70" stroke="currentColor" stroke-width="3" marker-end="url(#fl2)"/>
      <defs><marker id="fl2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
      <line x1="80" y1="170" x2="280" y2="170" stroke="#A9AEC2" stroke-width="1.4" stroke-dasharray="5 4"/>
      <line x1="280" y1="170" x2="280" y2="70" stroke="#A9AEC2" stroke-width="1.4" stroke-dasharray="5 4"/>
      <text x="170" y="188" font-size="12" fill="#5A6076" text-anchor="middle">+5</text>
      <text x="292" y="125" font-size="12" fill="#5A6076">+4</text>
      <circle cx="80" cy="170" r="4.5" fill="#16215B"/><text x="62" y="186" font-size="13" font-weight="700" fill="#16215B">A</text>
      <circle cx="280" cy="70" r="4.5" fill="#16215B"/><text x="288" y="62" font-size="13" font-weight="700" fill="#16215B">B</text>
    </svg>`,

  'titrage-montage': `
    <svg viewBox="0 0 400 260" role="img" aria-label="Montage d'un titrage">
      <rect width="400" height="260" fill="#fff" rx="6"/>
      <!-- burette -->
      <rect x="185" y="12" width="26" height="120" rx="4" fill="#F1E8F8" stroke="currentColor" stroke-width="2.4"/>
      <rect x="185" y="12" width="26" height="44" fill="currentColor" opacity=".25"/>
      ${Array.from({ length: 8 }, (_, i) => `<line x1="211" y1="${28 + i * 12}" x2="219" y2="${28 + i * 12}" stroke="currentColor" stroke-width="1.2"/>`).join('')}
      <path d="M192 132 h12 v14 h-12 z" fill="currentColor"/>
      <circle cx="198" cy="152" r="3" fill="currentColor"/>
      <circle cx="198" cy="168" r="2.4" fill="currentColor" opacity=".6"/>
      <text x="228" y="46" font-size="12" font-weight="700" fill="currentColor">Burette</text>
      <text x="228" y="62" font-size="11" fill="#5A6076">solution titrante</text>
      <!-- bécher -->
      <path d="M150 180 L158 244 H242 L250 180 Z" fill="#FFF9E8" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M156 212 L158 244 H242 L244 212 Z" fill="currentColor" opacity=".18"/>
      <text x="262" y="206" font-size="12" font-weight="700" fill="currentColor">Bécher</text>
      <text x="262" y="222" font-size="11" fill="#5A6076">V précis de titré</text>
      <!-- agitateur -->
      <rect x="140" y="244" width="120" height="14" rx="4" fill="#DCD3BC"/>
      <ellipse cx="200" cy="238" rx="14" ry="4" fill="#5A6076"/>
      <text x="60" y="120" font-size="11" fill="#5A6076">pipette</text>
      <text x="60" y="136" font-size="11" fill="#5A6076">jaugée</text>
      <path d="M96 128 q28 10 48 46" fill="none" stroke="#A9AEC2" stroke-width="1.4" stroke-dasharray="4 4"/>
    </svg>`,

  'tableau-periodique': `
    <svg viewBox="0 0 400 170" role="img" aria-label="Trois premières périodes du tableau périodique">
      <rect width="400" height="170" fill="#fff" rx="6"/>
      ${(() => {
        const cases = [
          ['H', 0, 0, '#0E8F8C'], ['He', 17, 0, '#7B3FA0'],
          ['Li', 0, 1, '#F2B705'], ['Be', 1, 1, '#E4572E'], ['B', 12, 1, '#2D6CDF'], ['C', 13, 1, '#2D6CDF'],
          ['N', 14, 1, '#2D6CDF'], ['O', 15, 1, '#2D6CDF'], ['F', 16, 1, '#0E8F8C'], ['Ne', 17, 1, '#7B3FA0'],
          ['Na', 0, 2, '#F2B705'], ['Mg', 1, 2, '#E4572E'], ['Al', 12, 2, '#2D6CDF'], ['Si', 13, 2, '#2D6CDF'],
          ['P', 14, 2, '#2D6CDF'], ['S', 15, 2, '#2D6CDF'], ['Cl', 16, 2, '#0E8F8C'], ['Ar', 17, 2, '#7B3FA0'],
        ];
        const w = 20, h = 26, x0 = 8, y0 = 40;
        return cases.map(([s, c, l, col]) =>
          `<g><rect x="${x0 + c * (w + 1.4)}" y="${y0 + l * (h + 2)}" width="${w}" height="${h}" rx="3" fill="${col}" opacity=".16" stroke="${col}" stroke-width="1.2"/>
           <text x="${x0 + c * (w + 1.4) + w / 2}" y="${y0 + l * (h + 2) + 17}" font-size="11" font-weight="700" text-anchor="middle" fill="${col}">${s}</text></g>`
        ).join('');
      })()}
      <text x="8" y="22" font-size="10" font-weight="700" fill="#5A6076">COLONNE → nombre d'électrons de valence</text>
      <text x="8" y="160" font-size="9.5" fill="#F2B705" font-weight="700">■ alcalins (1 e⁻)</text>
      <text x="110" y="160" font-size="9.5" fill="#0E8F8C" font-weight="700">■ halogènes (7 e⁻)</text>
      <text x="228" y="160" font-size="9.5" fill="#7B3FA0" font-weight="700">■ gaz nobles (couche pleine)</text>
    </svg>`,

  'conduite': `
    <svg viewBox="0 0 400 170" role="img" aria-label="Conduite avec rétrécissement">
      <rect width="400" height="170" fill="#fff" rx="6"/>
      <path d="M20 40 H170 L250 68 H380 V112 H250 L170 130 H20 Z" fill="#EAF4FB" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
      <g stroke="currentColor" stroke-width="2" marker-end="url(#fl3)">
        <line x1="55" y1="85" x2="105" y2="85"/>
        <line x1="285" y1="90" x2="360" y2="90"/>
      </g>
      <defs><marker id="fl3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
      <line x1="40" y1="40" x2="40" y2="130" stroke="#16215B" stroke-width="1.6" stroke-dasharray="4 3"/>
      <line x1="330" y1="68" x2="330" y2="112" stroke="#16215B" stroke-width="1.6" stroke-dasharray="4 3"/>
      <text x="46" y="34" font-size="12" font-weight="700" fill="#16215B">S₁</text>
      <text x="336" y="62" font-size="12" font-weight="700" fill="#16215B">S₂ &lt; S₁</text>
      <text x="60" y="105" font-size="12" fill="#5A6076">v₁</text>
      <text x="300" y="110" font-size="12" fill="#5A6076">v₂ &gt; v₁</text>
      <text x="20" y="158" font-size="11" font-weight="700" fill="currentColor">S₁v₁ = S₂v₂  →  la vitesse augmente, la pression diminue</text>
    </svg>`,

  'synthese-additive': `
    <svg viewBox="0 0 400 200" role="img" aria-label="Synthèse additive des couleurs">
      <rect width="400" height="200" fill="#101426" rx="6"/>
      <g style="mix-blend-mode:screen">
        <circle cx="160" cy="80" r="62" fill="#FF0000"/>
        <circle cx="240" cy="80" r="62" fill="#00FF00"/>
        <circle cx="200" cy="140" r="62" fill="#0000FF"/>
      </g>
      <text x="120" y="46" font-size="11" font-weight="700" fill="#fff">Rouge</text>
      <text x="252" y="46" font-size="11" font-weight="700" fill="#fff">Vert</text>
      <text x="176" y="192" font-size="11" font-weight="700" fill="#fff">Bleu</text>
      <text x="200" y="86" font-size="11" font-weight="800" fill="#101426" text-anchor="middle">BLANC</text>
    </svg>`,
};

/* ----------------------------------------------------------------- Rendu */

function bloc(b) {
  const d = document.createElement('div');
  switch (b.type) {
    case 'texte':
      d.className = 'ftexte';
      d.innerHTML = `<p>${b.html}</p>`;
      break;
    case 'formule':
      d.className = 'fformule';
      d.innerHTML = `$$${b.tex}$$`;
      break;
    case 'liste':
      d.className = 'fliste-wrap';
      d.innerHTML = `<ul class="fliste">${b.items.map((i) => `<li><span>${i}</span></li>`).join('')}</ul>`;
      break;
    case 'encadre':
      d.className = `fencadre fencadre--${b.variante || 'cle'}`;
      d.innerHTML = `${b.titre ? `<div class="fencadre__t">${iconeDe(b.variante)} ${b.titre}</div>` : ''}<p>${b.html}</p>`;
      break;
    case 'tableau':
      d.className = 'ftable-wrap';
      d.innerHTML = `<table class="ftable"><thead><tr>${b.entetes.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${b.lignes.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      break;
    case 'etapes':
      d.className = 'fetapes';
      d.innerHTML = b.items.map((e) =>
        `<div class="fetape"><span class="fetape__n"></span><div><b>${e.titre}</b><span>${e.html}</span></div></div>`).join('');
      break;
    case 'graphe':
      d.className = 'fgraphe';
      d.appendChild(tracerGraphe(b.spec));
      if (b.legende) d.insertAdjacentHTML('beforeend', `<div class="flegende">${b.legende}</div>`);
      break;
    case 'schema':
      d.className = 'fschema';
      d.innerHTML = SCHEMAS[b.nom] || '';
      if (b.legende) d.insertAdjacentHTML('beforeend', `<div class="flegende">${b.legende}</div>`);
      break;
    default:
      d.remove();
      return null;
  }
  return d;
}

function iconeDe(variante) {
  return { cle: '🔑', attention: '⚠️', exemple: '💡' }[variante] || '🔑';
}

const ICONES = { book: '📘', chart: '📈', key: '🔑', target: '🎯', sign: '±', steps: '🧭' };

/**
 * Construit l'élément DOM d'une fiche.
 * @param {object} data          JSON de la fiche
 * @param {object} [opts]        { apercu, uneColonne, vignette } — `vignette`
 *                               impose le format A4 strict (contenu rogné).
 */
export function rendreFiche(data, opts = {}) {
  const art = document.createElement('article');
  art.className = 'fiche'
    + (opts.apercu ? ' fiche--apercu' : '')
    + (opts.uneColonne ? ' fiche--une-colonne' : '')
    + (opts.vignette ? ' fiche--vignette' : '');
  art.dataset.matiere = data.matiere;
  art.dataset.niveau = data.niveau;
  art.setAttribute('aria-label', `Fiche : ${data.titre}`);

  const nomNiveau = { seconde: '2ᵈᵉ', premiere: '1ʳᵉ', terminale: 'Tᵃˡᵉ' }[data.niveau] || '';

  art.innerHTML = `
    <header class="fiche__head">
      <span class="fiche__logo" aria-hidden="true">🎓</span>
      <h3 class="fiche__title">${data.titre}</h3>
      <span class="fiche__level">${nomNiveau}</span>
    </header>
    <div class="fiche__body"></div>
    <footer class="fiche__foot"></footer>
    <span class="fiche__mark">Kulture Académie — ${data.chapitre}</span>`;

  const corps = art.querySelector('.fiche__body');
  for (const s of data.sections) {
    const sec = document.createElement('section');
    sec.className = 'fsection';
    sec.innerHTML = `<h4 class="fsection__title">
        <span class="fsection__num">${s.n}</span>
        <span>${s.titre}</span>
        <span class="fsection__ico" aria-hidden="true">${ICONES[s.icone] || ''}</span>
      </h4>`;
    for (const b of s.blocs) { const e = bloc(b); if (e) sec.appendChild(e); }
    corps.appendChild(sec);
  }

  const pied = art.querySelector('.fiche__foot');
  if (data.astuces?.length) {
    pied.insertAdjacentHTML('beforeend', `<div class="fnote fnote--astuces">
      <div class="fnote__t">✅ Astuces</div>
      <ul>${data.astuces.map((a) => `<li><span>${a}</span></li>`).join('')}</ul></div>`);
  }
  if (data.erreurs?.length) {
    pied.insertAdjacentHTML('beforeend', `<div class="fnote fnote--erreurs">
      <div class="fnote__t">⚠️ Erreurs classiques</div>
      <ul>${data.erreurs.map((a) => `<li><span>${a}</span></li>`).join('')}</ul></div>`);
  }

  composerMaths(art);
  return art;
}

/** Charge le JSON d'une fiche (avec cache mémoire). */
const cacheFiches = new Map();
export async function chargerFiche(id, chemin) {
  if (cacheFiches.has(id)) return cacheFiches.get(id);
  const r = await fetch(chemin(id));
  if (!r.ok) throw new Error(`Fiche introuvable : ${id}`);
  const data = await r.json();
  cacheFiches.set(id, data);
  return data;
}
