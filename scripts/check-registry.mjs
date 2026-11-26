#!/usr/bin/env node
// Tests déterministes du registre Brief élève (aucune IA, quelques millisecondes).
// Erreur = bloque la CI. Avertissement = signalé seulement (ex. registre à revérifier).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'brief-eleve-referentiels.js'), 'utf8'), ctx);
const { REFS, PREREQ, FLASH, REFLEX = {}, VERIFIED, REVIEW_AFTER_DAYS } = ctx.window.BRIEF_REGISTRY;
const curriculum = JSON.parse(readFileSync(join(root, 'curriculum.json'), 'utf8'));

const err = [], warn = [];
const Y = /^(\d{4})-(\d{4})$/;
const okYear = y => { const m = Y.exec(y); return m && +m[2] === +m[1] + 1; };
const start = y => (y ? parseInt(y, 10) : null);
const OFFICIAL = /^https:\/\/(www\.education\.gouv\.fr|eduscol\.education\.gouv\.fr)\//;

// 1. Structure de chaque référentiel
const ids = new Set();
for (const r of REFS) {
  const id = r.id || '(sans id)';
  if (ids.has(id)) err.push(`${id} : identifiant en double`); ids.add(id);
  for (const k of ['label', 'discipline', 'voie', 'text']) if (!r[k]) err.push(`${id} : champ « ${k} » manquant`);
  if (!Array.isArray(r.levels) || !r.levels.length) err.push(`${id} : aucun niveau`);
  if (!OFFICIAL.test(r.url || '')) err.push(`${id} : lien non officiel ou absent (${r.url})`);
  if (r.url2 && !OFFICIAL.test(r.url2)) err.push(`${id} : lien secondaire non officiel (${r.url2})`);
  if (!(r.certainty >= 0 && r.certainty <= 100)) err.push(`${id} : fiabilité hors 0-100`);
  if (r.certainty < 80 && !r.note && r.domainsStatus !== 'banque') warn.push(`${id} : fiabilité ${r.certainty} % sans note expliquant quoi vérifier`);
  if (!['officiel', 'indicatif', 'banque'].includes(r.domainsStatus)) err.push(`${id} : domainsStatus invalide`);
  for (const y of [r.from, r.until].filter(Boolean)) if (!okYear(y)) err.push(`${id} : année mal formée « ${y} »`);
  for (const key of ['fromByLevel', 'untilByLevel']) for (const [lv, y] of Object.entries(r[key] || {})) {
    if (!r.levels.includes(lv)) err.push(`${id} : ${key} cite le niveau ${lv} absent de levels`);
    if (!okYear(y)) err.push(`${id} : année mal formée « ${y} » (${lv})`);
  }
  const f = start(r.from), u = start(r.until);
  if (f && u && u < f) err.push(`${id} : until avant from`);
  if (!r.domains?.length && !(f && f > start(VERIFIED.slice(0, 4)))) warn.push(`${id} : aucun domaine alors que le référentiel est (ou sera bientôt) actif`);
  if (new Set(r.domains).size !== r.domains.length) err.push(`${id} : domaine en double`);
}

// 2. Calendrier : jamais deux programmes actifs pour le même enseignement, signaler les trous de transition
const status = (r, lv, y) => {
  const f = start(r.fromByLevel?.[lv] ?? r.from), u = start(r.untilByLevel?.[lv] ?? r.until);
  return f && y < f ? 'futur' : u && y > u ? 'ancien' : 'actif';
};
const groups = {};
for (const r of REFS) for (const lv of r.levels) (groups[[lv, r.voie, r.discipline, r.requires || '-'].join('|')] ??= []).push(r);
for (const [k, list] of Object.entries(groups)) for (let y = 2025; y <= 2029; y++) {
  const act = list.filter(r => status(r, k.split('|')[0], y) === 'actif');
  if (act.length > 1) err.push(`${k} en ${y}-${y + 1} : plusieurs programmes actifs (${act.map(r => r.id).join(', ')})`);
  if (list.length > 1 && !act.length) warn.push(`${k} en ${y}-${y + 1} : aucun programme actif (trou de transition ?)`);
}

// 3. Prérequis : chaque prérequis proposé doit avoir sa question flash
for (const [rx, list] of PREREQ) for (const p of list) if (!FLASH[p]) err.push(`prérequis « ${p} » (motif ${rx}) sans question flash`);
for (const [p, qa] of Object.entries(FLASH)) if (!Array.isArray(qa) || qa.length !== 2 || !qa[0] || !qa[1]) err.push(`flash « ${p} » : question ou réponse manquante`);

for (const p of Object.keys(FLASH)) {
  const r = REFLEX[p];
  if (!r) err.push(`prérequis « ${p} » sans fiche réflexe JE VOIS → JE VÉRIFIE`);
  else if (r.length !== 4 || r.some(x => !x || !x.trim())) err.push(`fiche réflexe « ${p} » incomplète (4 étapes attendues)`);
}
for (const p of Object.keys(REFLEX)) if (!FLASH[p]) warn.push(`fiche réflexe « ${p} » sans question flash`);

// 4. Cohérence avec curriculum.json (même banque MELEC, une seule vérité)
const melec = curriculum.tracks?.melec?.levels?.TMELEC || {};
for (const [id, disc] of [['BACPRO-MATHS-TLE', 'maths'], ['BACPRO-PC-TLE', 'sciences']]) {
  const r = REFS.find(x => x.id === id); if (!r || !melec[disc]) continue;
  const a = new Set(r.domains), b = new Set(melec[disc]);
  const onlyA = [...a].filter(x => !b.has(x)), onlyB = [...b].filter(x => !a.has(x));
  if (onlyA.length || onlyB.length) err.push(`${id} diverge de curriculum.json TMELEC.${disc} : +[${onlyA}] −[${onlyB}]`);
}

// 5. Fraîcheur de la vérification
const age = Math.round((Date.now() - new Date(VERIFIED + 'T12:00:00Z')) / 864e5);
if (!/^\d{4}-\d{2}-\d{2}$/.test(VERIFIED)) err.push(`VERIFIED mal formé : ${VERIFIED}`);
else if (age > REVIEW_AFTER_DAYS) warn.push(`registre vérifié il y a ${age} jours (> ${REVIEW_AFTER_DAYS}) : revérifier BO / Éduscol puis mettre à jour VERIFIED`);

warn.forEach(w => console.log('avertissement :', w));
err.forEach(e => console.log('ERREUR :', e));
console.log(`registre : ${REFS.length} référentiels, ${err.length} erreur(s), ${warn.length} avertissement(s)`);
process.exit(err.length ? 1 : 0);
