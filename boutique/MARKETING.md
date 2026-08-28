# Stratégie commerciale

Notes de travail qui accompagnent le site : ce qui a été construit, pourquoi, et ce
qu'il reste à tester. Tout ce qui touche aux prix et aux textes se change dans
`data/catalog.json` et `index.html` — aucune ligne de code à toucher.

---

## 1. Ce que le tunnel actuel laisse passer

Le parcours Instagram → Beacons → Gumroad perd de la valeur à chaque étape :

| Étape | Ce qui se perd |
|---|---|
| Beacons | une liste de boutons. Aucune promesse, aucune preuve, aucun aperçu du produit. |
| Fiche produit Gumroad | le visiteur découvre le prix avant d'avoir vu une seule fiche. |
| « Read more » replié | l'argumentaire est caché sous un lien que presque personne n'ouvre. |
| Un seul produit par commande | ni panier, ni remise, ni offre complémentaire. |
| Zéro capture d'e-mail | le visiteur qui n'achète pas aujourd'hui est perdu définitivement. |
| Le formulaire gratuit part sur Google Forms | l'audience quitte le site, la donnée reste dans un tableur. |

Le produit est bon. C'est le chemin qui coûte cher.

## 2. Le principe retenu

**Montrer la fiche avant de demander l'argent.**

Une fiche de révision est un produit qui se juge en trois secondes. Le site affiche donc
des fiches **entières, réelles, lisibles**, dès le premier écran puis dans une section
d'aperçus dédiée. Ce n'est pas une image d'illustration : c'est le produit rendu depuis
son contenu, avec ses formules composées et ses schémas.

Conséquences dans la page :

1. **Hero** — promesse (« Les fiches que tu relis vraiment »), éventail de cinq fiches réelles, deux appels à l'action.
2. **Bandeau de réassurance** — les cinq objections d'achat traitées en une ligne.
3. **Avant / après** — la douleur (relire 14 pages la veille) face à la solution (une notion = une page).
4. **Aperçus** — sept fiches consultables en grand, sans inscription.
5. **Catalogue filtrable** — le visiteur trouve son niveau en un clic.
6. **Comparateur** — oriente vers le pack complet sans forcer la main.
7. **Preuve sociale, garantie 30 jours, FAQ** — les trois derniers freins.
8. **Fiche gratuite contre e-mail** — récupère les 97 % qui n'achètent pas aujourd'hui.

## 3. Architecture de prix

Prix actuels (2 € le pack niveau, 4,99 € les 301 fiches) → prix proposés :

| Produit | Avant | Proposé | Rôle |
|---|---|---|---|
| Sprint Bac (30 fiches) | — | **9,90 €** | produit d'appel, achat impulsif |
| Pack niveau (2ⁿᵈᵉ / 1ʳᵉ / Tᵃˡᵉ) | 2 € | **14,90 €** | le besoin exprimé |
| Pack matière (maths ou PC, 3 ans) | — | **19,90 €** | segment « je ne jure que par une matière » |
| Pack Lycée Complet (301 fiches) | 4,99 € | **29,90 €** | l'offre que tout pousse à choisir |
| Order bump : 60 méthodes types bac | — | **+6,90 €** | +20 à 30 % de panier moyen |

Pourquoi monter :

- **Le prix est un signal de qualité.** À 4,99 € pour 301 fiches (1,6 centime la fiche),
  le prix contredit le produit : il fait douter, il n'entraîne pas.
- **La marge finance l'acquisition.** À 4,99 €, aucune publicité n'est rentable ; à
  29,90 €, un coût d'acquisition de 8 à 12 € reste confortable. C'est la différence
  entre vendre à ses abonnés et construire une machine.
- **L'ancrage rend le pack complet évident.** Trois packs niveau à 14,90 € = 44,70 € ;
  le pack complet à 29,90 € affiche « −33 % » sans rien brader.
- **Le prix bas ne protège pas.** Personne ne renonce à des fiches à 29,90 € pour aller
  en chercher des gratuites : celui qui voulait du gratuit n'achetait pas à 4,99 € non plus.

**À tester, pas à croire.** Passer d'un coup de 4,99 € à 29,90 € est une hypothèse.
Protocole : garder 4,99 € une semaine (mesurer visiteurs → ventes), puis passer à
29,90 € la semaine suivante à volume de trafic comparable. Comparer le **chiffre
d'affaires par visiteur**, jamais le taux de conversion seul. Un taux divisé par deux
avec un prix multiplié par six reste trois fois plus rentable.

Repli : afficher le pack complet à 19,90 € (au lieu de 29,90 €) si le CA par visiteur
baisse deux semaines de suite.

## 4. Le tunnel

```
Instagram / TikTok / YouTube
        │  (lien en bio → le site, plus Beacons)
        ▼
   Page de vente ──── aperçus de fiches ────┐
        │                                   │
        │ 3 % achètent tout de suite        │ 97 % partent
        ▼                                   ▼
   Panier + order bump              Fiche gratuite contre e-mail
        │                                   │
        ▼                                   ▼
   Paiement Stripe                  Séquence de 5 e-mails
        │                                   │
        ▼                                   ▼
   Téléchargement + e-mail  ◄────── achat différé (J+3 à J+30)
        │
        ▼
   Vente complémentaire (pack niveau → pack complet)
```

Une seule règle de trafic : **le lien en bio pointe vers le site**, pas vers Beacons.
Beacons reste utile pour les liens secondaires, pas comme porte d'entrée.

## 5. Séquence e-mail après la fiche gratuite

| Jour | Objet | Contenu |
|---|---|---|
| J+0 | 🎓 Ta fiche est là | livraison + comment s'en servir ce soir |
| J+1 | L'erreur que 8 élèves sur 10 font sur ce chapitre | une erreur classique développée, utile même sans achat |
| J+3 | Comment réviser un chapitre en 12 minutes | méthode : fiche → 3 exercices → auto-test |
| J+5 | Ce que contient le pack de ton niveau | l'offre, sans détour, avec la garantie 30 jours |
| J+8 | Dernier rappel : le pack complet | pack complet + rappel des trois années couvertes |

Envoi via `LEAD_WEBHOOK` vers l'outil d'e-mailing (Brevo, Systeme.io…). La règle qui
tient sur la durée : **quatre e-mails utiles pour un e-mail commercial**.

## 6. Le moteur de contenu

Chaque fiche est un post. Le site est construit pour ça : une fiche = un visuel prêt.

- **Réseaux → site** : « Erreur classique n° 3 sur le second degré » en carrousel, la
  fiche complète sur le site. Le trafic arrive déjà convaincu.
- **Hooks qui fonctionnent en scolaire** : l'erreur classique, le « en 4 minutes », le
  « ce que le prof n'a pas le temps de dire », le résultat chiffré (11 → 15).
- **Calendrier** : rentrée (sept.), premiers contrôles (oct.), bac blanc (janv.-fév.),
  révisions du bac (avril-juin). Deux pics de vente : septembre et avril.
- **Saisonnalité des offres** : Sprint Bac ne doit être mis en avant qu'à partir d'avril ;
  les packs niveau dominent en septembre.

## 7. Ce qu'il faut mesurer

| Indicateur | Repère raisonnable | Où le lire |
|---|---|---|
| Visiteurs → clic « Ajouter au panier » | 8 à 15 % | événement `add_to_cart` |
| Panier → paiement lancé | 45 à 60 % | `begin_checkout` |
| Paiement lancé → payé | 70 à 85 % | tableau de bord Stripe |
| Visiteurs → acheteurs | 2 à 4 % | `purchase` |
| Visiteurs → e-mails collectés | 8 à 12 % | `generate_lead` |
| Panier moyen | +20 à 30 % grâce à l'order bump | Stripe |

Les événements sont déjà émis (`dataLayer`, `gtag`, `fbq`). Il suffit de renseigner les
identifiants dans `assets/js/config.js` — **et d'ajouter un bandeau de consentement
avant d'activer un pixel publicitaire.**

## 8. À tester ensuite, dans cet ordre

1. **Le prix** (le levier le plus fort, cf. § 3).
2. **Le titre du hero** : « Les fiches que tu relis vraiment » contre une version
   résultat (« Trois points de moyenne en plus, une page à la fois »).
3. **La place des aperçus** : au-dessus du catalogue (actuel) ou juste sous le hero.
4. **L'order bump** : méthodes types bac contre annales corrigées.
5. **La garantie** : 30 jours contre « remboursé si ta note ne monte pas ».

Une seule variable à la fois, deux semaines minimum, décision au CA par visiteur.

## 9. Deux garde-fous

- **Les avis du site sont des exemples.** Ils doivent être remplacés par de vrais
  témoignages avant la mise en ligne : publier de faux avis est une pratique commerciale
  trompeuse (art. L121-2 du Code de la consommation), sanctionnée, et destructrice pour
  une marque qui vend de la confiance à des familles.
- **Pas de promesse de résultat.** « Gagner des points » se formule en méthode, jamais en
  garantie de note. La garantie porte sur la satisfaction, pas sur le bulletin.
