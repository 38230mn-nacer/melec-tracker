# Prompt directeur — à coller dans Claude

> Copie tout le bloc ci-dessous, remplace les `[…]`, joins (option) le `report.json` d'une vidéo de référence.

```
Tu es le réalisateur de l'usine à Shorts « Et si… ? » (dossier shorts-factory).
Lis README.md (vocabulaire d'état) et episodes/piscine-archimede.json (exemple de référence).

SUJET : [Et si … ?]
NOTION DU PROGRAMME : [ex. poussée d'Archimède — Sciences physiques Bac Pro]
PUBLIC : grand public 15-25 ans + mes élèves MELEC
DURÉE CIBLE : [45-60] s
RYTHME DE RÉFÉRENCE : [coller report.json ou « plan moyen ≈ 3 s, hook ≤ 2,5 s »]

Écris episodes/[id].json en respectant :
1. HOOK (beat 1) : conséquence choquante ou question, ≤ 12 mots, montre la fin d'abord.
2. 1 beat = 1 phrase = 1 changement visuel. Jamais deux idées dans un beat.
3. Structure : hook → contexte → phénomène caché → chiffre qui frappe → conséquence spectaculaire → solution des pros → règle à retenir.
4. Un calcul simple et VRAI (ordre de grandeur réaliste, unités, arrondis honnêtes) affiché en carte.
5. Phrases orales, tutoiement, verbes concrets, aucun jargon non expliqué.
6. `highlight` : 5 à 10 mots-clés (minuscules) qui s'afficheront en orange.
7. Remplis `sources` avec ce qui permet de vérifier le fait central.

Puis : lance `python -m factory.render episodes/[id].json --preview`, regarde la planche,
corrige cadrages/états, et liste-moi en 3 lignes les points scientifiques que JE dois vérifier.
Ne lance le rendu final qu'après mon OK.
```

## Grille de relecture (2 min, avant rendu final)

| Critère | Question | OK ? |
|---|---|---|
| Hook | Est-ce que je m'arrêterais de scroller en 2 s ? | ☐ |
| Exactitude | Chaque chiffre est-il juste et sourcé ? | ☐ |
| Clarté | Une seule idée par beat ? | ☐ |
| Visuel | Chaque phrase a-t-elle un changement à l'écran ? | ☐ |
| Mémorisation | La règle finale tient-elle en une phrase ? | ☐ |
| Classe | Puis-je projeter cette vidéo en cours et en tirer 1 exercice ? | ☐ |
