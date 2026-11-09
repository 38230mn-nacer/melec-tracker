# Usine à Shorts « Et si… ? » — Maths au Cube

Format vidéo vertical inspiré des coupes 3D virales (maison, jardin, sol en coupe, sous-titres mot à mot), **appliqué à la physique**.
Tu diriges, la machine produit : **script JSON → voix → animation → sous-titres → musique → MP4 1080×1920**.

Épisode 1 livré : `episodes/piscine-archimede.json` → *« Et si tu vidais ta piscine… au mauvais moment ? »*
(poussée d'Archimède, nappe phréatique, valve hydrostatique — 57 s).

---

## 1. Ce que dit vraiment le post viral (lecture critique)

| Affirmation | Réalité |
|---|---|
| « Claude édite les vidéos » | Claude n'a pas de timeline type Premiere. Il **écrit et exécute du code** (Python, ffmpeg) qui fabrique la vidéo. C'est ce que fait ce dossier. |
| « Upload tes clips + colle une vidéo virale → fais-le comme ça » | Claude peut **mesurer** une référence (rythme, nb de plans, durée du hook) et en copier la **structure**. Il ne « voit » pas un flux vidéo comme un monteur. |
| Les vidéos de la capture | Ce sont des **animations 3D** (Blender ou générateur vidéo IA), pas du montage de clips. Le vrai travail = le visuel. |
| 3 400 → 31 M vues en 20 vidéos | Invérifiable, typique du récit d'accroche. Ce qui est vrai : un format **répétable** + un **hook** fort + un **sujet surprenant** est ce qui fait le succès de ces comptes. |

**Le vrai avantage ici n'est pas l'outil, c'est le fond** : un prof de physique qui sait *pourquoi* la piscine sort du sol produit des « Et si » exacts, rares et réutilisables en classe.

---

## 2. Installation (une fois)

```bash
pip install -r requirements.txt     # numpy, Pillow, edge-tts
# + ffmpeg dans le PATH (Windows : winget install Gyan.FFmpeg)
```

## 3. Les 4 commandes

```bash
# (option) mesurer une vidéo virale de référence
python -m factory.analyze_reference ma_reference.mp4      # → out/ref_*/report.json + sheet.png

# aperçu en 15 s : 1 vignette par beat
python -m factory.render episodes/piscine-archimede.json --preview

# rendu final (≈ 1 min 30 sur 4 cœurs)
python -m factory.render episodes/piscine-archimede.json  # → out/piscine-archimede.mp4

# options : --no-tts (sans voix, hors ligne)  --music fond.mp3 (musique libre de droits, baissée sous la voix)
```

Derrière un proxy d'entreprise : définir `SSL_CERT_FILE` vers le certificat du proxy (géré automatiquement).

---

## 4. La boucle de production (≈ 20 min / vidéo)

| Étape | Qui | Durée |
|---|---|---|
| 1. Choisir un « Et si… ? » (banque ci-dessous) | toi | 2 min |
| 2. (option) `analyze_reference` sur une vidéo qui marche | machine | 1 min |
| 3. Coller le **prompt directeur** (`DIRECTEUR.md`) à Claude | toi | 1 min |
| 4. Claude écrit l'épisode JSON (script + états + cartes) | Claude | 3 min |
| 5. `--preview` → relire **la physique** et le hook, corriger | toi | 5 min |
| 6. Rendu final | machine | 2 min |
| 7. Publier (TikTok / Reels / Shorts) + garder pour la classe | toi | 5 min |

**Ton rôle non délégable : vérifier l'exactitude scientifique.** Un chiffre faux = crédibilité perdue.

---

## 5. Comment ça marche (architecture)

```
episodes/*.json ──► factory/tts.py ──► voix MP3 + horodatage de chaque mot (edge-tts)
        │                                      │
        ▼                                      ▼
factory/render.py : timeline (beats) ─► états interpolés ─► factory/world.py (dessin)
        │                  caméra (zoom/cadrage) ─► cartes chiffrées ─► sous-titre mot à mot
        ▼
mixage audio (voix + nappe musicale avec ducking + « pops ») ─► ffmpeg ─► MP4 H.264
```

### Vocabulaire d'état du monde « coupe de terrain » (valeurs 0 → 1)

| Clé | Effet visuel |
|---|---|
| `dig` | trou d'excavation + tas de terre |
| `shell` | coque béton + liner |
| `water` | niveau d'eau dans la piscine |
| `table` | hauteur de la nappe phréatique (0 = profonde, 1 = sous la surface) |
| `up` / `down` | flèches poussée (orange) / poids (vert) |
| `lift` | soulèvement de la piscine + secousse + fissures |
| `valve` / `flow` | valve hydrostatique / ouverture + bulles |
| `card` | carte chiffrée (définie dans `cards`) ; `""` = masquer |
| `cam` | `{"zoom", "cx", "cy"}` : zoom et point visé (coordonnées 1080×1920) |

Chaque beat = **une phrase** + les états qui changent. Les transitions sont animées automatiquement.
Couleurs des cartes : `up` = orange, `down` = vert, `txt` = bleu (charte Maths au Cube).

### Ajouter un nouveau monde (ex. tableau électrique, transformateur)
Copier `world.py` → `world_tableau.py`, garder la même interface `render(state, t)`, définir son vocabulaire d'état.
C'est une tâche typique à confier à Claude (« crée un monde *coupe de mur avec câble encastré* avec les états `current`, `heat`, `breaker` »).

---

## 6. Banque d'idées « Et si… ? » (physique / électrotechnique, MELEC-compatible)

| Hook | Notion | Monde |
|---|---|---|
| Et si tu vidais ta piscine au mauvais moment ? | Archimède, pression | ✅ terrain |
| Et si ta maison n'avait pas de piquet de terre ? | Mise à la terre, DDR 30 mA | terrain (+ câble) |
| Et si on mettait un câble trop fin sur un four ? | Effet Joule, section | mur en coupe |
| Et si tu débranchais un transformateur… côté primaire en charge ? | Transfo, rapport de transformation | tableau |
| Et si une éolienne tournait sans frein ? | Énergie cinétique, puissance | terrain |
| Et si la foudre tombait sur ton jardin ? | Tension de pas, résistivité du sol | terrain (+ éclair) |
| Et si tu laissais un clou dans l'eau 1 an ? | Corrosion, oxydoréduction | coupe |

---

## 7. Limites assumées (V1)

- Visuel **2.5D dessiné en code** (lisible, cohérent, gratuit) — pas le rendu 3D photoréaliste des comptes viraux.
  Montée en gamme possible : générer des plans 3D par IA vidéo (payant, crédits) et garder ce pipeline pour voix + sous-titres + montage.
- Voix edge-tts : gratuite, nécessite Internet ; pas de licence commerciale garantie → pour monétiser, passer à une voix sous licence ou ta propre voix.
- Musique : nappe synthétique générée (libre). Pour une vraie musique, `--music` avec un fichier libre de droits.
