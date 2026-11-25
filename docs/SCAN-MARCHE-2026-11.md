# Scan de marché — Ressources maths-sciences pour la voie pro électrotechnique

Version 1.0 — 2026-11-25. Exécution du Prompt 1 de [`PROMPTS-NACER.md`](PROMPTS-NACER.md).
Méthode : 12 recherches web (sources institutionnelles, éditeurs, plateformes). Ce document est un **premier passage**. Toutes les hypothèses sont à confirmer par le test de 7 jours (§6).

Légende : **[F]** fait sourcé · **[E]** estimation · **[H]** hypothèse.

---

## 1. Ce qui existe

| Acteur | Ce qu'il offre | Prix | Point faible pour ton créneau |
|---|---|---|---|
| **Éduscol / académies** (Bordeaux, Versailles, Strasbourg…) | programmes, vade-mecum 2026, problémathèque, sujets de CCF, ressources pour la liaison Bac Pro–BTS [F] | gratuit | Écrit pour les profs. Peu interactif, rarement contextualisé en électrotechnique. Dispersé entre 30 sites. |
| **Éditeurs** (Nathan Technique, Delagrave, Foucher) | manuels par groupement, manuels numériques, espaces compagnons [F] | manuels payés par la Région ou les familles | Organisés par groupement, pas par métier. Contenus statiques. |
| **techphil.fr** | Moodle MELEC, environ 40 chapitres, quiz, câblage virtuel [F] | à vérifier | Porte sur le **domaine professionnel** (électricité), pas sur les maths-sciences. C'est un complément, pas un concurrent. |
| **Nomad Education** | module « Forme-toi à l'électricité » avec Schneider [F] | freemium (NOMAD+) | Générique, sans lien avec le programme de maths-sciences. |
| **PhET** (Colorado) | simulations de circuits CC/CA [F] | gratuit | **Ni transformateur ni diode** dans le kit CA [F]. Pas aligné sur le programme français. |
| **Falstad** | simulateur de circuits avec diodes, redresseurs et oscilloscope [F] | gratuit | Puissant mais peu pédagogique : aucune progression, aucune consigne, aucun piège. |
| **Formations IA** (académies, ICP, CCI, Lefebvre Dalloz, EFE) | parcours IA de 6 h en maths-physique pour profs de LP (académie de Paris, gratuit) ; formations de formateurs à 700–1 250 € HT/jour [F] | 0 à 1 250 € | Aucune n'est donnée par un **praticien LP/CFA qui construit ses propres outils**. |
| **Cours particuliers** (plateformes) | lycée : 20–35 €/h ; BTS : environ 50 €/h selon une plateforme [F, sources intéressées] | — | Offre de masse, sans méthode ni suivi structuré. |

---

## 2. Grille notion × format (MELEC / BTS Électrotechnique)

`●` bien servi · `◐` partiel · `○` **vide**

| Notion | Fiche / cours | Exercices | Vidéo | **Simulateur contextualisé** | Jeu / quiz | Éval. type CCF | Outil prof |
|---|---|---|---|---|---|---|---|
| Puissance, énergie, rendement | ● | ● | ◐ | ○ | ○ | ◐ | ○ |
| Signaux alternatifs (Ueff, période, fréquence) | ● | ● | ◐ | ◐ (Falstad brut) | ○ | ◐ | ○ |
| Transformateur | ◐ | ◐ | ◐ | **○** (pas dans PhET) | ○ | ○ | ○ |
| Redressement et filtrage (pont de Graëtz) | ◐ | ◐ | ◐ | **○** (Falstad brut) | ○ | ○ | ○ |
| Moteur asynchrone (côté sciences) | ◐ (Éduscol) | ◐ | ◐ | **○** (labo UCLouvain niveau supérieur) | ○ | ○ | ○ |
| Fonctions, dérivées (maths) | ● | ● | ● | ◐ | ◐ (Défi Dérivées) | ● | ○ |
| Statistiques, probabilités | ● | ● | ● | ◐ | ○ | ● | ○ |
| Maths du BTS Électrotechnique (CCF ou épreuve) | ◐ | ◐ (APMEP) | ◐ | ○ | ○ | **○** (la brochure IREM couvre 7 BTS mais **pas l'électrotechnique** [F]) | ○ |
| Suivi des compétences APP/ANA/REA/VAL/COM | — | — | — | — | — | — | **○** (à part ton DeltaTracker) |

**Lecture :** le vide est **structurel** sur toute la colonne « simulateur contextualisé » pour les notions électrotechniques et sur la colonne « outil prof ». Les fiches et exercices sont saturés, et gratuits grâce aux académies. Il ne faut pas vendre ce que l'institution donne.

---

## 3. Taille du marché

- **717 établissements** proposent le Bac Pro MELEC (Onisep, InserJeunes 2024) [F].
- Il y a donc au moins environ 700 profs de maths-sciences directement concernés, et plutôt **1 000 à 1 500** si l'on ajoute les spécialités voisines en électricité (MSPC, MEE, TMSEC…) [E].
- Les effectifs d'élèves en électrotechnique tournaient autour de 45 000 vers 2012 (source ancienne, Assemblée nationale) [F daté]. Je n'ai pas trouvé de donnée récente ; à consulter sur data.education.gouv.fr (DEPP).

**Conséquence honnête :** c'est une niche. Les ressources vendues aux profs rapporteront probablement **quelques centaines à 2–3 k€ par an** au départ [E, certitude 60 %]. Leur vraie valeur est d'être **la preuve** qui fait vendre les formations à 700–1 250 €/jour [F pour les tarifs].

---

## 4. Les 5 meilleurs vides

| # | Produit | Acheteur | Prix plausible [E] | Effort | Pourquoi personne ne l'a fait | Certitude du vide |
|---|---|---|---|---|---|---|
| **1** | **« Labo Maths-Sciences Électro »** : simulateurs HTML hors ligne (transformateur, pont de Graëtz + filtrage, puissance/rendement, moteur), chacun avec une progression, des défis « prédis puis mesure », des pièges et une situation professionnelle. Gratuit pour l'élève, **kit prof payant** (fiches, éval, mode vidéoprojection). | prof (kit), établissement ou CFA (licence) | kit 15–29 € ; licence 79–149 €/an | élevé (1 simulateur ≈ 1 à 2 semaines) | Il faut à la fois la physique, le programme LP et le code. Les éditeurs pensent « manuel » ; PhET et Falstad pensent « universel ». | **80 %** |
| **2** | **Pack maths du BTS Électrotechnique** : sujets d'entraînement contextualisés (signaux, Fourier, équations différentielles, transformée de Laplace selon le programme en vigueur) + corrigés + grilles | prof de BTS, étudiants | 19–39 € | moyen | Marché très étroit, absent de la brochure IREM [F] | 70 % |
| **3** | **Formation « IA + outils maison pour maths-sciences en voie pro »** | CFA (OPCO), établissements privés sous contrat (**Formiris finance 1 200 €/jour** pour un groupe de 10 à 25 enseignants [F]), GRETA | 700–1 200 €/jour | moyen | Les offres académiques sont gratuites mais génériques ; aucun formateur n'est un praticien qui montre de vrais outils | 70 % |
| **4** | **Kit « Document augmenté »** : modèles Word + QR + microvidéos selon ton standard | prof de LP | 19–29 € | faible (le standard existe déjà) | Le concept est nouveau et non outillé | 60 % |
| **5** | **DeltaTracker Lite** : suivi APP/ANA/REA/VAL/COM hors ligne, sans serveur, conforme RGPD par construction | prof de maths-sciences en LP | 29 €/an | élevé + responsabilité RGPD | Les ENT et Pronote ne suivent pas les compétences de la démarche scientifique au niveau voulu | 65 % |

---

## 5. Recommandation

**Gagnant : #1 « Labo Maths-Sciences Électro », en freemium. Certitude : 75 %.**

C'est le seul vide qui coche les quatre critères à la fois :
1. **Avantage différenciant** : il combine maths + physique + électrotechnique + pédagogie pour élèves fragiles + code. Il est difficile à copier.
2. **Activité actuelle** : il sert d'abord tes propres classes, donc il est testé gratuitement en conditions réelles.
3. **Compétences futures** : modélisation, JavaScript, données d'usage (anonymes), et à terme assistant IA intégré.
4. **Actif démontrable** : c'est la vitrine qui rend vendables la formation (#3) et le kit (#4).

Le gratuit côté élève n'est pas un manque à gagner : les familles de LP sont peu solvables [H], et la visibilité auprès des profs est ce qui vend le kit et la formation.

**Ce qu'il ne faut pas faire :** vendre des fiches de cours ou des banques d'exercices. Ce créneau est saturé et concurrencé par des ressources académiques gratuites. Certitude : 85 %.

---

## 6. Test de 7 jours (budget ≤ 50 €)

| Jour | Action | Indicateur |
|---|---|---|
| J1–J3 | Construire **1** simulateur : pont de Graëtz + filtrage (Prompt 2), en un seul fichier HTML, sur GitHub Pages | Fonctionne sur téléphone, testé avec 1 classe |
| J4 | Page d'accueil « Labo Maths-Sciences Électro » + formulaire « Je veux le kit prof » (liste d'attente, sans paiement) | — |
| J5 | Diffusion **gratuite** : listes de diffusion et groupes de profs de maths-sciences en LP, réseau CFA, LinkedIn | — |
| J6–J7 | Mesurer | **Succès si ≥ 30 inscrits à la liste d'attente ou ≥ 5 profs qui l'utilisent en classe.** En dessous de 10 inscrits : pivoter vers #3 (formation) avec ce simulateur comme démo. |

Coût : 0 € (GitHub Pages) ; un nom de domaine en option (≈ 10 €).

---

## 7. Points de vigilance

- **Statut [F] :** la production d'**œuvres de l'esprit** est libre pour un agent public, sans autorisation (Code général de la fonction publique, avis ministériel de 2023 sur les vidéos d'un prof de physique-chimie). La « vente de biens fabriqués personnellement » est en revanche une activité accessoire soumise à autorisation, en micro-entreprise. **Les formations sont une activité accessoire : déclaration obligatoire.** À vérifier auprès de la DRH de ton académie ou de ton employeur CFA. Certitude sur la nécessité de vérifier : 95 %.
- **Programme [F] :** les programmes de maths et de physique-chimie de 1re/Tle Bac Pro sont fixés par l'arrêté du 3 février 2020 (JO du 5 février 2020). Le vade-mecum de l'inspection est mis à jour en septembre 2026. Je n'ai trouvé aucun texte plus récent qui les remplace, mais je n'ai pas pu ouvrir le vade-mecum 2026. Certitude que le programme de 2020 est toujours en vigueur : 80 %.
- **BTS :** je n'ai pas pu confirmer le format actuel de l'épreuve de maths du BTS Électrotechnique (CCF ou épreuve ponctuelle, et sa durée). Les résultats de recherche mélangeaient plusieurs BTS. Il faut le vérifier dans le référentiel avant de lancer #2.
- **Simulateurs :** dans tout ce qui est vendu, vérifier la justesse physique de chaque modèle (ordres de grandeur, unités, cas limites).

---

## Sources

- Onisep — [Bac pro MELEC](https://www.onisep.fr/Ressources/univers-formation/Formations/Lycees/bac-pro-metiers-de-l-electricite-et-de-ses-environnements-connectes)
- Éduscol — [Programmes et ressources en mathématiques, voie professionnelle](https://eduscol.education.gouv.fr/5895/programmes-et-ressources-en-mathematiques-voie-professionnelle) · [L'essentiel sur le moteur électrique (LP)](https://eduscol.education.gouv.fr/sites/default/files/document/ra26-lycee-pro-phychi-essentielmoteur-electrique-127634.pdf)
- Académie de Bordeaux — [Maths-sciences, ressources TICE Bac Pro](https://ent2d.ac-bordeaux.fr/disciplines/maths-sciences/ressources-tice-bac-pro/) · [Vade-mecum maths-physique-chimie 2026](https://ent2d.ac-bordeaux.fr/disciplines/maths-sciences/wp-content/uploads/sites/13/2026/09/Vademecum-math-physique-chimie_2026.pdf) · [Maths BTS](https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/bts/)
- Académie de Grenoble — [Programme de maths de terminale Bac Pro 2019](https://mpc.web.ac-grenoble.fr/sites/default/files/Media/document/prog_bac_pro_2019_-_mathematiques_term.pdf)
- Académie de Versailles — [Synthèse des ressources maths BTS](https://mathsciences.ac-versailles.fr/IMG/_/_docs/maths-bts/Tableau%20de%20synthese%20des%20ressources.pdf)
- Éduscol STI — [Fiche techphil.fr](https://sti.eduscol.education.fr/print/18130)
- Nomad Education — [Forme-toi à l'électricité (MELEC)](https://www.nomadeducation.fr/revisions/bac-pro-metiers-de-lelectricite-et-de-ses-environ-lbe69752/forme-toi-a-l-electricite-avec-schneider-electric-cy77b217)
- PhET — [Guide Circuit Construction Kit AC](https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-ac-virtual-lab-html-guide_es.pdf) · ThinkIB — [Rectifier simulation (Falstad)](https://thinkib.net/physics/page/17516/rectifier-simulation-falstad)
- Foucher — [Maths Groupement C Tle Bac Pro](https://www.editions-foucher.fr/node/28278) · Nathan — [Catalogue LP](https://ecatalogue.nathan.fr/lycee_professionnel/common/data/catalogue.pdf)
- Formations IA — [Académie de Paris : IA en maths-PC LP](https://www.ac-paris.fr/mathematiques-physique-chimie-en-lp-129494) · [ICP : intégration de l'IA (Formiris)](https://www.icp.fr/formations/formation-continue-apprentissage/nos-formation-courtes/integration-de-lia-dans-la-pratique-pedagogique-intra?toPdf=true) · [Lefebvre Dalloz](https://formation.lefebvre-dalloz.fr/sites/default/files/pdf_training/2026/703037_prog.pdf) · [CCI Pays de la Loire](https://formation.paysdelaloire.cci.fr/print/pdf/node/4398) · [EFE](https://www.efe.fr/print/pdf/node/90363)
- Tarifs des cours — [Sherpas](https://sherpas.com/blog/prix-cours-particulier) · [Superprof](https://www.superprof.fr/blog/tarif-soutien-scolaire/) · [Groupe Réussite BTS](https://groupe-reussite.fr/soutien-scolaire/toutes-matieres/bts/france/)
- Cumul d'activités — [education.gouv.fr](https://www.education.gouv.fr/vie-professionnelle-et-situation-personnelle-cumul-d-activites-3977) · [justice.fr : agent public et micro-entrepreneur](https://www.justice.fr/fiche/cumuler-statuts-agent-public-micro-entrepreneur)
- Vente de ressources — [Sellfy](https://sellfy.com/fr/blog/vendre-ressources-pedagogiques/) · [Centre Inffo : place de marché formation pro](https://www.centre-inffo.fr/site-centre-inffo/actualites-centre-inffo/le-quotidien-de-la-formation-actualite-formation-professionnelle-apprentissage/actualites-2026/simplifier-lacces-aux-ressources-pedagogiques-le-pari-dagathe-hutin-dartiguelongue)

---

## Checkpoint

**ÉTAT :** scan fait. Vide principal identifié : les simulateurs contextualisés en électrotechnique.
**DÉCISION (proposée) :** #1 Labo Maths-Sciences Électro en freemium, qui sert de vitrine à #3 (formation).
**PROCHAINE ACTION :** Prompt 2, simulateur « Pont de Graëtz + filtrage », puis le test de 7 jours.
**À CAPITALISER :** grille §2 et tableau §4 → Obsidian (`Projets/Revenus IA/Scan marché 2026-11`).
**BLOCAGE :** déclaration de cumul pour la partie formation ; format de l'épreuve de maths du BTS à confirmer.
