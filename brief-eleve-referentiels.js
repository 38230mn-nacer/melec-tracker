/* Brief élève — Registre des référentiels (source de vérité de l'application)
 * Vérifié le 2026-11-26. Mise à jour MANUELLE : modifier ce fichier, puis changer VERIFIED.
 * Règles :
 *  - `from` / `until` = première / dernière année scolaire d'application (format "AAAA-AAAA").
 *  - `domainsStatus` : "officiel" (structure du texte), "indicatif" (repère de travail à aligner sur le texte),
 *    "banque" (thèmes de la banque MELEC du dépôt).
 *  - `certainty` : niveau de confiance sur le calendrier d'application (0-100).
 *  - Aucun lien profond inventé : quand l'URL exacte du texte n'est pas vérifiée, on pointe vers la page Éduscol / BO de la discipline.
 */
(function () {
  const EDUSCOL_MATHS_GT = 'https://eduscol.education.gouv.fr/1723/programmes-et-ressources-en-mathematiques-voie-gt';
  const EDUSCOL_MATHS = 'https://eduscol.education.gouv.fr/4509/mathematiques';
  const EDUSCOL_C4 = 'https://eduscol.education.gouv.fr/5736/ressources-d-accompagnement-du-programme-de-mathematiques-au-cycle-4';
  const EDUSCOL_CAL = 'https://eduscol.education.gouv.fr/sites/default/files/document/calendriernouveauxprogrammes-129025.pdf';
  const BO_2DE_2026 = 'https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A';
  const BO_C4_2026 = 'https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A';
  const EDUSCOL = 'https://eduscol.education.gouv.fr/';
  const BO = 'https://www.education.gouv.fr/bo';

  const AUTO = 'Automatismes (calcul, proportions, lecture graphique)';

  const R = [
    // ---------- Collège ----------
    { id: 'C3-MATHS-6E', label: 'Mathématiques 6e (cycle 3)', discipline: 'maths', levels: ['6e'], voie: 'college',
      from: '2025-2026', until: null, text: 'Programme cycle 3 rénové', certainty: 70, url: EDUSCOL_CAL,
      note: 'Calendrier déduit des documents académiques (CM1/6e 2025, CM2 2026). À confirmer sur le calendrier Éduscol.',
      domainsStatus: 'indicatif',
      domains: ['Nombres, calculs et résolution de problèmes', 'Fractions et décimaux', 'Grandeurs et mesures', 'Espace et géométrie', 'Proportionnalité', 'Organisation et gestion de données', 'Pensée informatique'] },

    { id: 'C4-MATHS-2026', label: 'Mathématiques cycle 4 (programme 2026)', discipline: 'maths', levels: ['5e', '4e', '3e'], voie: 'college',
      fromByLevel: { '5e': '2026-2027', '4e': '2027-2028', '3e': '2028-2029' }, until: null,
      text: 'Arrêté du 18 février 2026 — BO n° 10 du 5 mars 2026', certainty: 95, url: BO_C4_2026, url2: EDUSCOL_C4,
      domainsStatus: 'indicatif',
      domains: ['Nombres relatifs', 'Fractions', 'Puissances', 'Calcul littéral', 'Équations et inéquations', 'Proportionnalité et pourcentages', 'Fonctions', 'Géométrie plane (Pythagore, Thalès, trigonométrie)', 'Grandeurs et mesures', 'Statistiques et probabilités', 'Pensée informatique', AUTO] },

    { id: 'C4-MATHS-2020', label: 'Mathématiques cycle 4 (programme 2020, transition)', discipline: 'maths', levels: ['4e', '3e'], voie: 'college',
      from: null, untilByLevel: { '4e': '2026-2027', '3e': '2027-2028' },
      text: 'Programme 2020 maintenu tant que le programme 2026 n\'atteint pas le niveau', certainty: 95, url: EDUSCOL_C4,
      domainsStatus: 'indicatif',
      domains: ['Nombres relatifs', 'Fractions', 'Puissances et notation scientifique', 'Racine carrée', 'Calcul littéral et identités remarquables', 'Équations et inéquations', 'Pythagore', 'Thalès', 'Trigonométrie', 'Fonctions linéaires et affines', 'Statistiques et probabilités', 'Pensée informatique'] },

    { id: 'C4-FR-2026', label: 'Français cycle 4 (programme 2026)', discipline: 'francais', levels: ['5e', '4e', '3e'], voie: 'college',
      fromByLevel: { '5e': '2026-2027', '4e': '2027-2028', '3e': '2028-2029' }, until: null,
      text: 'Même calendrier que les mathématiques cycle 4', certainty: 80, url: EDUSCOL_CAL,
      note: 'Calendrier confirmé par sources secondaires concordantes ; vérifier le texte au BO.',
      domainsStatus: 'indicatif',
      domains: ['Lecture et compréhension', 'Écriture', 'Oral', 'Étude de la langue (grammaire, orthographe, lexique)', 'Culture littéraire et artistique'] },

    // ---------- Lycée général et technologique ----------
    { id: '2DE-MATHS-2026', label: 'Mathématiques seconde GT (programme 2026)', discipline: 'maths', levels: ['2de'], voie: 'gt',
      from: '2026-2027', until: null, text: 'BO n° 14 du 2 avril 2026 (NOR MENE2602914A)', certainty: 95, url: BO_2DE_2026, url2: EDUSCOL_MATHS_GT,
      domainsStatus: 'indicatif',
      domains: [AUTO, 'Nombres et calculs', 'Géométrie (vecteurs, repérage)', 'Fonctions', 'Statistiques et probabilités', 'Algorithmique et programmation', 'Vocabulaire ensembliste et logique'] },

    { id: '1G-SPE-MATHS-2026', label: 'Spécialité mathématiques première générale (2026)', discipline: 'maths', levels: ['1re'], voie: 'generale', requires: 'spe-maths',
      from: '2026-2027', until: null, text: 'Arrêté du 26 février 2026 — JO du 27 mars 2026', certainty: 92, url: EDUSCOL_MATHS_GT,
      domainsStatus: 'indicatif',
      domains: [AUTO, 'Suites numériques', 'Second degré', 'Dérivation', 'Fonction exponentielle', 'Trigonométrie', 'Produit scalaire et géométrie repérée', 'Probabilités conditionnelles', 'Variables aléatoires', 'Algorithmique et programmation'] },

    { id: '1G-ES-MATHS-2026', label: 'Mathématiques de l\'enseignement scientifique, première générale (2026)', discipline: 'maths', levels: ['1re'], voie: 'generale',
      from: '2026-2027', until: null, text: 'Arrêté du 26 février 2026 — JO du 27 mars 2026', certainty: 85, url: EDUSCOL_MATHS_GT,
      note: 'Associé à tous les élèves de première générale (avec ou sans spécialité maths).',
      domainsStatus: 'indicatif',
      domains: [AUTO, 'Proportions et pourcentages', 'Fonctions et lecture graphique', 'Statistiques', 'Probabilités', 'Modélisation et calcul numérique'] },

    { id: '1T-MATHS-2026', label: 'Mathématiques première technologique (2026)', discipline: 'maths', levels: ['1re'], voie: 'techno',
      from: '2026-2027', until: null, text: 'Arrêté du 26 février 2026 — JO du 27 mars 2026', certainty: 90, url: EDUSCOL_MATHS_GT,
      domainsStatus: 'indicatif',
      domains: [AUTO, 'Suites', 'Fonctions et dérivation', 'Statistiques à deux variables', 'Probabilités', 'Algorithmique et programmation'] },

    { id: 'TG-SPE-MATHS-2019', label: 'Spécialité mathématiques terminale générale (2019)', discipline: 'maths', levels: ['Tle'], voie: 'generale', requires: 'spe-maths',
      from: null, until: '2026-2027', text: 'Programme 2019 — remplacé à la rentrée 2027', certainty: 92, url: EDUSCOL_MATHS_GT,
      domainsStatus: 'indicatif',
      domains: ['Suites et récurrence', 'Limites et continuité', 'Dérivation et convexité', 'Logarithme népérien', 'Primitives, équations différentielles', 'Calcul intégral', 'Géométrie dans l\'espace', 'Combinatoire et dénombrement', 'Loi binomiale et sommes de variables aléatoires', 'Algorithmique et programmation'] },

    { id: 'TG-MATHS-2027', label: 'Mathématiques terminale (nouveau programme)', discipline: 'maths', levels: ['Tle'], voie: 'generale',
      from: '2027-2028', until: null, text: 'Rentrée 2027 — texte à confirmer', certainty: 85, url: EDUSCOL_MATHS_GT,
      domainsStatus: 'indicatif', domains: [] },

    { id: '1G-PC-2019', label: 'Spécialité physique-chimie première générale (2019)', discipline: 'pc', levels: ['1re'], voie: 'generale', requires: 'spe-pc', suggestWith: 'spe-maths',
      from: null, until: null, text: 'Programme publié en 2019, indiqué en vigueur par Éduscol', certainty: 85, url: EDUSCOL,
      domainsStatus: 'indicatif',
      domains: ['Constitution et transformations de la matière', 'Mouvement et interactions', 'L\'énergie : conversions et transferts', 'Ondes et signaux'] },

    { id: '1G-SVT-2019', label: 'Spécialité SVT première générale (2019)', discipline: 'svt', levels: ['1re'], voie: 'generale', requires: 'spe-svt', suggestWith: 'spe-maths',
      from: null, until: null, text: 'Programme publié en 2019, indiqué en vigueur par Éduscol', certainty: 85, url: EDUSCOL,
      domainsStatus: 'indicatif',
      domains: ['La Terre, la vie et l\'organisation du vivant', 'Enjeux contemporains de la planète', 'Corps humain et santé'] },

    // ---------- Voie professionnelle ----------
    { id: 'BACPRO-MATHS-TLE', label: 'Mathématiques terminale bac pro (MELEC, groupement A)', discipline: 'maths', levels: ['TMELEC'], voie: 'pro',
      from: null, until: null, text: 'Programme voie professionnelle (2020) — thèmes de la banque MELEC', certainty: 80, url: EDUSCOL, url2: BO,
      domainsStatus: 'banque',
      domains: ['Calcul numérique et notation scientifique', 'Fonctions et lecture graphique', 'Suites numériques', 'Dérivation et variations', 'Trigonométrie et signaux', 'Statistiques à une variable', 'Statistiques à deux variables et ajustement', 'Probabilités'] },

    { id: 'BACPRO-PC-TLE', label: 'Physique-chimie terminale bac pro MELEC', discipline: 'pc', levels: ['TMELEC'], voie: 'pro',
      from: null, until: null, text: 'Programme voie professionnelle (2020) — thèmes de la banque MELEC', certainty: 80, url: EDUSCOL, url2: BO,
      domainsStatus: 'banque',
      domains: ['Tension alternative et signaux', 'Puissance électrique et facteur de puissance', 'Réseaux triphasés et couplages', 'Machine asynchrone', 'Diodes, redressement et filtrage', 'Sécurité électrique et protections', 'Énergie électrique', 'Mesures électriques et multimètre'] },

    { id: 'BTS-ELT-MATHS', label: 'Mathématiques BTS Électrotechnique', discipline: 'maths', levels: ['BTS1', 'BTS2'], voie: 'bts',
      from: null, until: null, text: 'Référentiel du BTS — modules à confirmer sur le texte', certainty: 70, url: BO,
      note: 'Vérifier la liste des modules de mathématiques du BTS Électrotechnique dans le référentiel officiel.',
      domainsStatus: 'indicatif',
      domains: ['Nombres complexes', 'Fonctions d\'une variable réelle', 'Calcul intégral', 'Équations différentielles', 'Séries de Fourier', 'Transformation de Laplace', 'Statistiques et probabilités'] }
  ];

  // Prérequis : un blocage sur un domaine qui correspond au motif déclenche la vérification de ces prérequis.
  const PREREQ = [
    [/équation|inéquation/i, ['Priorités opératoires', 'Nombres relatifs', 'Calcul littéral']],
    [/dériv|variation/i, ['Coefficient directeur', 'Calcul littéral', 'Fractions']],
    [/second degré|identit/i, ['Calcul littéral', 'Nombres relatifs']],
    [/fraction/i, ['Multiples et diviseurs', 'Nombres relatifs']],
    [/puissance|scientifique/i, ['Nombres relatifs', 'Puissances de 10']],
    [/exponentiel|logarithme/i, ['Puissances de 10', 'Pourcentages et coefficient multiplicateur']],
    [/suite/i, ['Pourcentages et coefficient multiplicateur', 'Calcul littéral']],
    [/proba/i, ['Fractions', 'Pourcentages et coefficient multiplicateur']],
    [/statisti/i, ['Pourcentages et coefficient multiplicateur', 'Lecture graphique']],
    [/fonction|graphique/i, ['Lecture graphique', 'Priorités opératoires']],
    [/trigo|signal|alternati/i, ['Proportionnalité', 'Lecture graphique']],
    [/vecteur|scalaire|repér/i, ['Lecture graphique', 'Nombres relatifs']],
    [/complexe/i, ['Calcul littéral', 'Nombres relatifs']],
    [/intégr|primitive|différentiel|laplace|fourier/i, ['Coefficient directeur', 'Calcul littéral']],
    [/puissance électrique|énergie|triphas|machine|redress/i, ['Proportionnalité', 'Puissances de 10', 'Calcul littéral']],
    [/pythagore|thalès/i, ['Racine carrée', 'Proportionnalité']],
    [/proportion|pourcent/i, ['Fractions', 'Priorités opératoires']]
  ];

  // Diagnostic flash : 1 question = 1 prérequis, réponse attendue fournie au professeur.
  const FLASH = {
    'Priorités opératoires': ['2 + 3 × 4 = ?', '14'],
    'Nombres relatifs': ['−3 − 5 = ?   puis   (−2) × (−6) = ?', '−8 ; 12'],
    'Calcul littéral': ['Développe 3(x − 2)', '3x − 6'],
    'Fractions': ['1/2 + 1/3 = ?', '5/6'],
    'Multiples et diviseurs': ['Simplifie 12/18', '2/3'],
    'Puissances de 10': ['10³ × 10⁻⁵ = ?', '10⁻²'],
    'Pourcentages et coefficient multiplicateur': ['Augmenter de 20 %, c\'est multiplier par… ?', '1,2'],
    'Proportionnalité': ['3 m de câble coûtent 12 €. Combien coûtent 5 m ?', '20 €'],
    'Lecture graphique': ['Sur un graphique, f(2) se lit sur quel axe ?', 'Abscisse 2 → lire l\'ordonnée'],
    'Coefficient directeur': ['Droite passant par (0 ; 1) et (2 ; 5) : coefficient directeur ?', '2'],
    'Racine carrée': ['√49 = ?   et   √(9 + 16) = ?', '7 ; 5 (pas 3 + 4 par hasard : vérifier la méthode)']
  };

  window.BRIEF_REGISTRY = { VERIFIED: '2026-11-26', REVIEW_AFTER_DAYS: 120, REFS: R, PREREQ, FLASH,
    SOURCES: { calendrier: EDUSCOL_CAL, mathsGT: EDUSCOL_MATHS_GT, maths: EDUSCOL_MATHS } };
})();
