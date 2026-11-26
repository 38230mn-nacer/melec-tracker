#!/usr/bin/env python3
"""
PROSPECTEUR ARTISANS — trouve les artisans sans site (ou avec un site obsolète).

Sources (toutes gratuites, légales, officielles ou ouvertes) :
  1. API Recherche d'entreprises (data.gouv / INSEE SIRENE)  -> liste exhaustive des artisans actifs
  2. OpenStreetMap (Overpass)                                -> site web / téléphone déclarés
  3. Google Places API (OPTIONNEL, clé GOOGLE_MAPS_API_KEY)   -> site web, note, nb d'avis (le plus fiable)
  4. Audit HTTP du site trouvé                               -> score d'obsolescence

Respect RGPD / INSEE : les entreprises ayant fait opposition à la prospection
commerciale (opposition_diffusion_commerciale) ou en diffusion partielle sont EXCLUES.

Usage :
  python3 prospecteur.py --ville "Grenoble" --metiers plombier,electricien --rayon 8
  python3 prospecteur.py --ville "Bourgoin-Jallieu" --metiers tous --rayon 15 --max 300
  python3 prospecteur.py --ville "Voiron" --metiers plombier --ajouter     (fusionne avec la base existante)

Sortie : data/prospects.json et data/prospects.csv
Aucune dépendance externe : Python 3.9+ standard.
"""
import argparse, csv, json, os, re, ssl, sys, time, unicodedata
import urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from difflib import SequenceMatcher
from math import radians, sin, cos, asin, sqrt

UA = "prospecteur-artisans/1.0 (outil local)"
OVERPASS = ["https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"]

# métier -> codes NAF (SIRENE) + tags OSM + famille visuelle utilisée par l'atelier
METIERS = {
    "plombier":     {"label": "Plombier chauffagiste", "naf": ["43.22A", "43.22B"], "osm": "plumber|hvac|heating_engineer", "famille": "eau"},
    "electricien":  {"label": "Électricien", "naf": ["43.21A"], "osm": "electrician", "famille": "energie"},
    "menuisier":    {"label": "Menuisier", "naf": ["43.32A", "16.23Z"], "osm": "carpenter|joiner|window_construction", "famille": "bois"},
    "serrurier":    {"label": "Serrurier métallier", "naf": ["43.32B", "25.11Z"], "osm": "locksmith|metal_construction", "famille": "metal"},
    "carreleur":    {"label": "Carreleur", "naf": ["43.33Z"], "osm": "tiler|floorer", "famille": "pierre"},
    "peintre":      {"label": "Peintre en bâtiment", "naf": ["43.34Z"], "osm": "painter", "famille": "couleur"},
    "couvreur":     {"label": "Couvreur charpentier", "naf": ["43.91A", "43.91B"], "osm": "roofer", "famille": "toit"},
    "macon":        {"label": "Maçon", "naf": ["43.99C", "41.20B"], "osm": "builder|stonemason", "famille": "pierre"},
    "platrier":     {"label": "Plâtrier plaquiste", "naf": ["43.31Z"], "osm": "plasterer", "famille": "couleur"},
    "paysagiste":   {"label": "Paysagiste", "naf": ["81.30Z"], "osm": "gardener", "famille": "jardin"},
    "coiffeur":     {"label": "Coiffeur", "naf": ["96.02A"], "osm": "hairdresser", "famille": "beaute"},
    "esthetique":   {"label": "Institut de beauté", "naf": ["96.02B"], "osm": "beauty", "famille": "beaute"},
    "boulanger":    {"label": "Boulanger pâtissier", "naf": ["10.71C", "10.71D"], "osm": "bakery|pastry", "famille": "bouche"},
    "boucher":      {"label": "Boucher charcutier", "naf": ["47.22Z", "10.13B"], "osm": "butcher", "famille": "bouche"},
    "garagiste":    {"label": "Garagiste", "naf": ["45.20A", "45.20B"], "osm": "car_repair", "famille": "metal"},
}
NAF2METIER = {n: k for k, m in METIERS.items() for n in m["naf"]}

CTX = ssl.create_default_context()


# ---------------------------------------------------------------- utilitaires
def get_json(url, data=None, headers=None, timeout=30, essais=5):
    for i in range(essais):
        try:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": UA, **(headers or {})})
            with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503, 504) or i == essais - 1:
                raise
        except (urllib.error.URLError, ConnectionError, TimeoutError):
            if i == essais - 1:
                raise
        time.sleep(1.5 * (i + 1))


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\b(sarl|sas|sasu|eurl|ets|etablissements|entreprise|ei|sa|scop|monsieur|madame)\b", " ", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def dist_km(a, b, c, d):
    a, b, c, d = map(radians, (a, b, c, d))
    return 6371 * 2 * asin(sqrt(sin((c - a) / 2) ** 2 + cos(a) * cos(c) * sin((d - b) / 2) ** 2))


def joli_nom(rec):
    s = rec["siege"]
    nom = s.get("nom_commercial") or (s.get("liste_enseignes") or [None])[0]
    if not nom:
        m = re.search(r"\(([^)]+)\)", rec.get("nom_complet") or "")
        nom = m.group(1) if m else rec.get("nom_complet") or "?"
    petits = {"de", "du", "des", "et", "la", "le", "les", "d", "l", "a"}
    mots = nom.lower().split()
    return " ".join(w if (w in petits and i) else w.capitalize() for i, w in enumerate(mots))


# ---------------------------------------------------------------- 1. SIRENE
def geocoder(ville):
    q = urllib.parse.quote(ville)
    f = get_json(f"https://api-adresse.data.gouv.fr/search/?q={q}&type=municipality&limit=1")["features"]
    if not f:
        sys.exit(f"Ville introuvable : {ville}")
    lon, lat = f[0]["geometry"]["coordinates"]
    return lat, lon, f[0]["properties"]["city"]


def sirene(lat, lon, rayon_km, nafs, maxi):
    out, page = [], 1
    while len(out) < maxi:
        url = ("https://recherche-entreprises.api.gouv.fr/near_point?"
               + urllib.parse.urlencode({"lat": lat, "long": lon, "radius": min(rayon_km, 50),
                                         "activite_principale": ",".join(nafs), "per_page": 25, "page": page}))
        d = None
        for essai in range(4):  # réseau instable : on insiste avant d'abandonner la page
            try:
                d = get_json(url); break
            except Exception as e:
                print(f"  ! SIRENE (essai {essai+1}/4) :", e); time.sleep(8)
        if d is None:
            break
        for r in d.get("results", []):
            s = r["siege"]
            if (r.get("etat_administratif") != "A" or s.get("etat_administratif") != "A"
                    or r.get("statut_diffusion") != "O" or r.get("opposition_diffusion_commerciale")):
                continue  # fermé, non diffusible, ou opposé à la prospection -> exclu
            if s.get("activite_principale") not in nafs:
                continue
            if r.get("categorie_entreprise") in ("GE", "ETI") or ((r.get("tranche_effectif_salarie") or "").isdigit() and r["tranche_effectif_salarie"] >= "21"):
                continue  # grands groupes / 50 salariés et plus : pas la cible
            out.append(r)
        if page >= d.get("total_pages", 1):
            break
        page += 1
        time.sleep(0.2)  # limite API : 7 req/s
    return out[:maxi]


# ---------------------------------------------------------------- 2. OSM
def osm(lat, lon, rayon_km, regex):
    q = (f'[out:json][timeout:60];(nwr(around:{int(rayon_km*1000)},{lat},{lon})["craft"~"{regex}"];'
         f'nwr(around:{int(rayon_km*1000)},{lat},{lon})["shop"~"{regex}"];);out tags center;')
    for url in OVERPASS:
        try:
            d = get_json(url, data=urllib.parse.urlencode({"data": q}).encode(), timeout=70)
            res = []
            for e in d["elements"]:
                t = e.get("tags", {})
                c = e.get("center", e)
                res.append({"nom": t.get("name", ""), "site": t.get("website") or t.get("contact:website"),
                            "tel": t.get("phone") or t.get("contact:phone"),
                            "lat": c.get("lat"), "lon": c.get("lon")})
            return res
        except Exception:
            continue
    print("  ! OSM indisponible (on continue sans)")
    return []


def match_osm(p, pts):
    best, bs = None, 0
    for o in pts:
        if not o["nom"]:
            continue
        sim = SequenceMatcher(None, norm(p["nom"]), norm(o["nom"])).ratio()
        if p["lat"] and o["lat"] and dist_km(p["lat"], p["lon"], o["lat"], o["lon"]) < 0.15:
            sim += 0.15
        if sim > bs:
            best, bs = o, sim
    return best if bs >= 0.8 else None


# ---------------------------------------------------------------- 3. Google Places (optionnel)
def places(p, key):
    body = json.dumps({"textQuery": f'{p["nom"]} {p["commune"]}', "languageCode": "fr", "maxResultCount": 1}).encode()
    try:
        d = get_json("https://places.googleapis.com/v1/places:searchText", data=body, headers={
            "Content-Type": "application/json", "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.nationalPhoneNumber,"
                                "places.rating,places.userRatingCount,places.googleMapsUri,places.formattedAddress"})
        pl = (d.get("places") or [None])[0]
        if not pl:
            return {}
        if SequenceMatcher(None, norm(p["nom"]), norm(pl["displayName"]["text"])).ratio() < 0.55:
            return {}  # fiche Google qui ne correspond pas
        return {"site": pl.get("websiteUri"), "tel": pl.get("nationalPhoneNumber"), "note": pl.get("rating"),
                "avis": pl.get("userRatingCount"), "maps": pl.get("googleMapsUri")}
    except Exception:
        return {}


# ---------------------------------------------------------------- 3b. Deviner le domaine (sans Google)
def deviner_site(p):
    """Teste nom.fr / nom.com / nom-avec-tirets.fr ; valide si la page cite le code postal, le SIREN ou le nom."""
    base = norm(p["nom"]).split()
    if not base:
        return None
    cands = []
    for slug in ("".join(base), "-".join(base)):
        if 4 <= len(slug) <= 40:
            cands += [f"https://www.{slug}.fr", f"https://www.{slug}.com"]
    mots = [w for w in base if len(w) > 4]
    for u in dict.fromkeys(cands):
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 " + UA})
            with urllib.request.urlopen(req, timeout=6, context=CTX) as r:
                h = norm(r.read(400_000).decode("utf-8", "ignore"))
            nom_ok = bool(mots) and all(w in h for w in mots)
            lieu_ok = bool(p["code_postal"] and p["code_postal"] in h) or norm(p["commune"]) in h
            if p["siren"] in h.replace(" ", "") or (nom_ok and lieu_ok):
                return u
        except Exception:
            continue
    return None


# ---------------------------------------------------------------- 4. Audit du site
def auditer(url):
    """Renvoie (score_obsolescence 0-100, raisons). 100 = site à refaire d'urgence."""
    if not url:
        return None, []
    if not url.startswith("http"):
        url = "http://" + url
    if re.search(r"facebook\.com|instagram\.com|linktr\.ee|pagesjaunes\.fr|google\.com/maps|business\.site", url):
        return 90, ["Seulement une page réseau social / annuaire : pas de vrai site à son nom"]
    raisons, score = [], 0
    try:
        t0 = time.time()
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 " + UA})
        with urllib.request.urlopen(req, timeout=12, context=CTX) as r:
            html = r.read(1_500_000).decode("utf-8", "ignore")
            final = r.geturl()
        dt = time.time() - t0
    except urllib.error.HTTPError as e:
        if e.code in (401, 403, 429, 503):
            return 30, ["Audit automatique bloqué : vérifier le site à la main"]
        return 95, [f"Site en erreur {e.code} : le client perd des contacts"]
    except Exception:
        return 95, ["Site injoignable : le client perd des contacts"]
    low = html.lower()
    if not final.startswith("https"):
        score += 25; raisons.append("Pas de HTTPS : Chrome affiche « Non sécurisé »")
    if 'name="viewport"' not in low and "name='viewport'" not in low:
        score += 30; raisons.append("Pas adapté au mobile, alors que la plupart des clients cherchent sur téléphone")
    ans = [int(a) for a in re.findall(r"(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d{2})", low)]
    if ans and max(ans) <= date.today().year - 3:
        score += 15; raisons.append(f"Copyright {max(ans)} : site visiblement abandonné")
    gen = re.search(r'name="generator"\s+content="([^"]+)"', low)
    if gen and re.search(r"joomla! 1|joomla! 2|wordpress [1-4]\.|frontpage|dreamweaver|wix\.com website builder", gen.group(1)):
        score += 15; raisons.append(f"Technologie ancienne : {gen.group(1)}")
    if "<frameset" in low or ".swf" in low or "<marquee" in low:
        score += 20; raisons.append("Technologies des années 2000 (frames / Flash)")
    if "tel:" not in low:
        score += 10; raisons.append("Pas de bouton « Appeler » cliquable")
    if dt > 4:
        score += 10; raisons.append(f"Lent ({dt:.1f} s)")
    if len(re.sub(r"<[^>]+>", " ", low).split()) < 150:
        score += 10; raisons.append("Très peu de contenu : invisible sur Google")
    if re.search(r"pagesjaunes|solocal|site-solocal|123siteweb|e-monsite|jimdo", low + final):
        score += 10; raisons.append("Site d'annuaire / constructeur bas de gamme")
    return min(score, 100), raisons


# ---------------------------------------------------------------- 5. Score commercial
def scorer(p):
    """Potentiel 0-100 : besoin (pas de site / obsolète) x capacité à payer x arguments de vente."""
    if p["site"] is None:
        s = 60; p["statut_site"] = "aucun site détecté"
    elif p["raisons"] and p["raisons"][0].startswith("Seulement une page"):
        s = 65; p["statut_site"] = "aucun site détecté"
    elif p["obsolescence"] >= 50:
        s = 50 + p["obsolescence"] * 0.3; p["statut_site"] = "site obsolète"
    elif p["obsolescence"] >= 25:
        s = 35; p["statut_site"] = "site perfectible"
    else:
        s = 5; p["statut_site"] = "site correct"
    if p["anciennete"] >= 3: s += 10           # installé, a de la trésorerie
    if p["salaries"]: s += 10                  # entreprise employeuse = budget
    if p["rge"]: s += 5                        # argument fort à mettre en avant
    if p.get("avis") and p["avis"] >= 10 and not p["site"]: s += 10  # bonne réputation non exploitée
    if p["anciennete"] < 1: s += 5             # nouvelle entreprise : besoin de visibilité
    p["score"] = round(min(s, 100))
    p["priorite"] = "A" if p["score"] >= 75 else "B" if p["score"] >= 55 else "C"


def construire(r, metier, lat0, lon0, rayon):
    s = r["siege"]
    # l'établissement réellement situé dans la zone (le siège peut être ailleurs)
    for e in r.get("matching_etablissements") or []:
        if e.get("etat_administratif") == "A" and e.get("latitude") and \
                dist_km(lat0, lon0, float(e["latitude"]), float(e["longitude"])) <= rayon:
            s = {**s, **{k: v for k, v in e.items() if v is not None}}
            break
    lat = float(s["latitude"]) if s.get("latitude") else None
    lon = float(s["longitude"]) if s.get("longitude") else None
    creation = r.get("date_creation") or s.get("date_creation") or str(date.today())
    dir_ = next((d for d in r.get("dirigeants", []) if d.get("type_dirigeant") == "personne physique"), None)
    tranche = r.get("tranche_effectif_salarie") or "NN"
    return {
        "id": s["siret"], "siren": r["siren"], "siret": s["siret"], "nom": joli_nom(r),
        "raison_sociale": r.get("nom_raison_sociale") or r.get("nom_complet"),
        "metier": metier, "metier_label": METIERS[metier]["label"], "famille": METIERS[metier]["famille"],
        "naf": s["activite_principale"], "adresse": s.get("adresse"), "commune": (s.get("libelle_commune") or "").title(),
        "code_postal": s.get("code_postal"), "lat": lat, "lon": lon,
        "dirigeant": f'{(dir_ or {}).get("prenoms","").split(" ")[0].title()} {(dir_ or {}).get("nom","").title()}'.strip() or None,
        "creation": creation, "anciennete": round((date.today() - date.fromisoformat(creation)).days / 365.25, 1),
        "salaries": tranche not in ("NN", "00", None), "tranche_effectif": tranche,
        "forme": "Entreprise individuelle" if r.get("nature_juridique") == "1000" else "Société",
        "rge": bool(s.get("liste_rge") or (r.get("complements") or {}).get("est_rge")),
        "site": None, "tel": None, "note": None, "avis": None, "maps": None,
        "obsolescence": None, "raisons": [], "sources": ["SIRENE"],
    }


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description="Trouve les artisans sans site ou avec un site obsolète.")
    ap.add_argument("--ville", required=True)
    ap.add_argument("--metiers", default="plombier,electricien,menuisier,peintre,couvreur,carreleur")
    ap.add_argument("--rayon", type=float, default=10, help="km (max 50)")
    ap.add_argument("--max", type=int, default=60, help="max d'entreprises par métier")
    ap.add_argument("--sortie", default=os.path.join(os.path.dirname(__file__), "data"))
    ap.add_argument("--ajouter", action="store_true", help="fusionne avec le prospects.json existant au lieu de l'écraser")
    a = ap.parse_args()
    metiers = list(METIERS) if a.metiers == "tous" else [m.strip() for m in a.metiers.split(",")]
    for m in metiers:
        if m not in METIERS:
            sys.exit(f"Métier inconnu : {m}. Choix : {', '.join(METIERS)}")

    lat, lon, ville = geocoder(a.ville)
    print(f"📍 {ville} ({lat:.3f}, {lon:.3f}) — rayon {a.rayon} km")
    key = os.environ.get("GOOGLE_MAPS_API_KEY")
    print("🔑 Google Places :", "activé" if key else "non configuré (OSM seul, moins de sites détectés)")

    prospects = []
    for m in metiers:
        recs = sirene(lat, lon, a.rayon, METIERS[m]["naf"], a.max)
        pts = osm(lat, lon, a.rayon, METIERS[m]["osm"])
        print(f"   {METIERS[m]['label']:<24} SIRENE {len(recs):>3} | OSM {len(pts):>3}")
        for r in recs:
            p = construire(r, m, lat, lon, a.rayon)
            if p['lat'] and dist_km(lat, lon, p['lat'], p['lon']) > a.rayon * 1.2:
                continue
            o = match_osm(p, pts)
            if o:
                p["site"] = p["site"] or o["site"]; p["tel"] = p["tel"] or o["tel"]; p["sources"].append("OSM")
            prospects.append(p)

    # dédoublonnage (même SIREN sur plusieurs NAF)
    vus, uniq = set(), []
    for p in prospects:
        if p["siren"] not in vus:
            vus.add(p["siren"]); uniq.append(p)
    prospects = uniq

    if key:
        print(f"🔎 Google Places sur {len(prospects)} fiches…")
        with ThreadPoolExecutor(6) as ex:
            for p, g in zip(prospects, ex.map(lambda p: places(p, key), prospects)):
                if g:
                    p.update({k: v for k, v in g.items() if v and not (k == "site" and p["site"])})
                    p["sources"].append("Google")

    sans = [p for p in prospects if not p["site"]]
    print(f"🌐 Recherche de domaine pour {len(sans)} fiches sans site…")
    with ThreadPoolExecutor(8) as ex:
        for p, u in zip(sans, ex.map(deviner_site, sans)):
            if u:
                p["site"] = u; p["sources"].append("domaine")

    print(f"🩺 Audit des sites trouvés…")
    with ThreadPoolExecutor(8) as ex:
        res = list(ex.map(lambda p: auditer(p["site"]), prospects))
    for p, (sc, rs) in zip(prospects, res):
        p["obsolescence"], p["raisons"] = sc, rs
        scorer(p)

    os.makedirs(a.sortie, exist_ok=True)
    meta = {"ville": ville, "lat": lat, "lon": lon, "rayon_km": a.rayon, "date": str(date.today()),
            "google": bool(key), "metiers": {m: METIERS[m]["label"] for m in metiers}}
    ancien = os.path.join(a.sortie, "prospects.json")
    if a.ajouter and os.path.exists(ancien):
        old = json.load(open(ancien, encoding="utf-8"))
        neufs = {p["siren"] for p in prospects}
        prospects += [p for p in old["prospects"] if p["siren"] not in neufs]
        meta["metiers"] = {**old["meta"].get("metiers", {}), **meta["metiers"]}
        if old["meta"].get("ville") != ville:
            meta["ville"] = old["meta"]["ville"] + " + " + ville
    prospects.sort(key=lambda p: -p["score"])
    with open(os.path.join(a.sortie, "prospects.json"), "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "prospects": prospects}, f, ensure_ascii=False, indent=1)
    cols = ["priorite", "score", "nom", "metier_label", "commune", "statut_site", "site", "tel", "dirigeant",
            "anciennete", "salaries", "rge", "note", "avis", "siret", "adresse"]
    with open(os.path.join(a.sortie, "prospects.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore", delimiter=";")
        w.writeheader(); w.writerows(prospects)

    from collections import Counter
    c = Counter(p["statut_site"] for p in prospects)
    print(f"\n✅ {len(prospects)} prospects | " + " | ".join(f"{k}: {v}" for k, v in c.items()))
    print(f"   Priorité A : {sum(p['priorite']=='A' for p in prospects)} → {a.sortie}/prospects.json")


if __name__ == "__main__":
    main()
