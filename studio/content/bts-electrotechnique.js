(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.content = MC.content || {};

  MC.content.btsElectrotechnique = [
    { id:"dephasage-puissances", title:"Déphasage tension/courant et puissances P, Q, S", status:"ready", kind:"scene", render:MC.scenes.dephasagePuissances,
      desc:"Animation de référence : sinusoïdes, vecteurs de Fresnel tournants, cos φ, triangle des puissances — tout synchronisé sur un curseur temporel." },
    { id:"complexes", title:"Nombres complexes appliqués à l'électrotechnique", status:"soon" },
    { id:"impedances", title:"Impédances", status:"soon" },
    { id:"circuits-rlc", title:"Circuits RLC", status:"soon" },
    { id:"fresnel", title:"Diagrammes de Fresnel", status:"soon" },
    { id:"resonance", title:"Résonance", status:"soon" },
    { id:"compensation", title:"Compensation de l'énergie réactive", status:"soon" },
    { id:"triphase", title:"Systèmes triphasés", status:"soon" },
    { id:"harmoniques", title:"Harmoniques et qualité de l'énergie", status:"soon" },
    { id:"transformateurs", title:"Transformateurs", status:"soon" },
    { id:"redresseurs", title:"Redresseurs", status:"soon" },
    { id:"hacheurs", title:"Hacheurs", status:"soon" },
    { id:"onduleurs", title:"Onduleurs", status:"soon" },
    { id:"pwm", title:"Commande PWM", status:"soon" },
    { id:"machine-asynchrone", title:"Machines asynchrones", status:"soon" },
    { id:"machine-synchrone", title:"Machines synchrones", status:"soon" },
    { id:"couple-vitesse", title:"Caractéristiques couple/vitesse", status:"soon" },
    { id:"chaine-energie", title:"Chaîne d'énergie", status:"soon" },
    { id:"regulation", title:"Notions de régulation", status:"soon" }
  ];
})();
