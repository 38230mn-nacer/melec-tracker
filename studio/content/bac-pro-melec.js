(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.content = MC.content || {};

  MC.content.bacProMelec = [
    { id:"pente-ordonnee", title:"Pente et ordonnée à l'origine — équations de droites", status:"ready", kind:"scene", render:MC.scenes.penteOrdonnee,
      desc:"Fonction affine y = m·x + b : réglage direct de la pente et de l'ordonnée à l'origine, ou mode Défi pour retrouver une droite donnée." },
    { id:"derivation-concept", title:"Dérivation : le concept — nombre dérivé, tangente, fonction dérivée, variations", status:"ready", kind:"scene", render:MC.scenes.derivationConcept,
      desc:"Sécante → tangente quand h → 0, taux de variation, nombre dérivé, courbe de f′, tableau de variations généré. Fonctions du programme : x², polynômes, 1/x, √x." },
    { id:"derivation-electromecanique", title:"Dérivation en électromécanique : rampes, convoyeur, porte, moteur", status:"ready", kind:"scene", render:MC.scenes.derivationElectromecanique,
      desc:"Position → vitesse → accélération → effort moteur. Porte automatique, convoyeur (le colis glisse-t-il ?), rampe de variateur, démarrage direct. Tangentes, formules et explication pas à pas." },
    { id:"rampes-derivee", title:"Rampes et dérivée : variateur, bobine, condensateur", status:"ready", kind:"scene", render:MC.scenes.rampesDerivee,
      desc:"Dérivée d'une rampe = coefficient directeur. Rampe linéaire ou en S (à-coup), u = L·di/dt (surtension, diode de roue libre), i = C·du/dt (courant d'appel, précharge)." },
    { id:"derivation-mouvement", title:"Dérivation en mouvement", status:"ready", kind:"external", url:"../whiteboard-derivation.html",
      desc:"Sécante → tangente, position/vitesse/accélération, charge d'un condensateur, induction. Outil transversal maths/sciences." },
    { id:"tension-courant-resistance", title:"Tension, courant et résistance", status:"soon" },
    { id:"loi-ohm", title:"Loi d'Ohm", status:"soon" },
    { id:"lois-noeuds-mailles", title:"Lois des nœuds et des mailles", status:"soon" },
    { id:"circuits-serie-parallele", title:"Circuits série et parallèle", status:"soon" },
    { id:"puissance-energie", title:"Puissance et énergie", status:"soon" },
    { id:"alternatif-sinusoidal", title:"Courant alternatif sinusoïdal", status:"soon" },
    { id:"periode-frequence", title:"Période et fréquence", status:"soon" },
    { id:"valeur-efficace", title:"Valeur efficace", status:"soon" },
    { id:"dephasage-intro", title:"Déphasage", status:"soon" },
    { id:"facteur-puissance", title:"Facteur de puissance", status:"soon" },
    { id:"mono-triphase", title:"Monophasé et triphasé", status:"soon" },
    { id:"mesures-electriques", title:"Mesures électriques", status:"soon" },
    { id:"diagnostic-simple", title:"Situations simples de diagnostic", status:"soon" }
  ];
})();
