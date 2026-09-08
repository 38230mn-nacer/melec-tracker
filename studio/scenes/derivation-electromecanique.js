(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.scenes = MC.scenes || {};

  // Scène : la dérivée vue par l'électromécanique.
  // Grandeur (position x, angle θ) → dérivée (vitesse v, ω/n) → dérivée seconde (accélération a, α) → effort moteur (F, C).
  MC.scenes.derivationElectromecanique = function(container){
    var U=MC.core.units, M=MC.core.mechanics, L=MC.components.layout;
    var f=U.fmt;
    var TWO_PI=2*Math.PI;

    container.innerHTML="";
    var root=document.createElement("div"); root.className="mc-scene";
    container.appendChild(root);

    var head=L.header(root, "Dérivation en électromécanique : rampes, convoyeur, porte, moteur", "");
    L.legend(root, [
      ["--green","grandeur : position x, angle θ"],
      ["--blue","dérivée : vitesse v = x′, vitesse de rotation n (ω = θ′)"],
      ["--orange","dérivée seconde : accélération a = v′, α = ω′ → effort F = m·a, couple C = J·α + Cr"],
      ["--red","curseur temporel, seuil, alerte"]
    ]);
    var reflex=document.createElement("div"); reflex.className="mc-reflex";
    reflex.innerHTML='<span><b>JE VOIS</b> une courbe de position ou de vitesse</span>'+
      '<span><b>JE PENSE</b> pente de la tangente = dérivée = vitesse ou accélération</span>'+
      '<span><b>JE FAIS</b> Δy / Δt sur la rampe, puis la formule</span>'+
      '<span><b>JE VÉRIFIE</b> l\'unité (m/s, m/s², rad/s², N·m) et le signe (freinage = négatif)</span>';
    root.appendChild(reflex);

    var sitBar=document.createElement("div"); sitBar.className="mc-situations"; sitBar.setAttribute("aria-label","Situation professionnelle");
    root.appendChild(sitBar);

    var grid=document.createElement("div"); grid.className="mc-scene-grid"; root.appendChild(grid);
    var colLeft=document.createElement("div"); colLeft.className="mc-scene-col";
    var colRight=document.createElement("div"); colRight.className="mc-scene-col mc-scene-side";
    grid.appendChild(colLeft); grid.appendChild(colRight);

    var animBox=L.box("Phénomène physique");
    var warnEl=document.createElement("div"); warnEl.className="mc-warn"; animBox.el.appendChild(warnEl);
    var chartBoxes=[L.box(""),L.box(""),L.box("")];
    var explainBox=L.box("Expliquer pas à pas (touche E : étape suivante)");
    colLeft.appendChild(animBox.el);
    chartBoxes.forEach(function(b){ colLeft.appendChild(b.el); });
    colLeft.appendChild(explainBox.el);

    var paramsBox=L.box("Réglages"), timeBox=L.box("Curseur temporel"), statsBox=L.box("Valeurs instantanées"), formulaBox=L.box("Formules et application numérique");
    [paramsBox,timeBox,statsBox,formulaBox].forEach(function(b){ colRight.appendChild(b.el); });

    var engine=MC.core.animation.register(new MC.core.animation.TimeEngine({period:5, loop:true, speed:1, timeScale:1}));
    MC.components.TimeCursor(timeBox.mount, engine, {
      onTick:renderTime, stepSize:0.1,
      formatTime:function(t){ return "t = "+f(t,2)+" s"; }
    });
    var formulaPanel=MC.components.FormulaPanel(formulaBox.mount);
    var explain=MC.components.ExplainPanel(explainBox.mount);

    /* ------------------------------------------------------------------ */
    /* Situations                                                           */
    /* ------------------------------------------------------------------ */
    var situations=[
      {
        id:"porte", label:"🚪 Porte automatique", anim:"door",
        hint:"Une porte coulissante s'ouvre : l'opérateur (motoréducteur) impose une rampe d'accélération, un palier de vitesse, puis une décélération. La vitesse est la dérivée de la position ; l'accélération, dérivée de la vitesse, fixe l'effort moteur F = m·a.",
        params:[
          {key:"L", label:"Course de la porte L", min:0.6, max:2, step:0.05, value:1.2, unit:"m", decimals:2},
          {key:"vmax", label:"Vitesse maxi v_max", min:0.2, max:1.2, step:0.05, value:0.6, unit:"m/s", decimals:2},
          {key:"tAcc", label:"Temps d'accélération t_acc", min:0.2, max:2, step:0.05, value:0.8, unit:"s", decimals:2},
          {key:"m", label:"Masse du vantail m", min:20, max:120, step:5, value:40, unit:"kg", decimals:0}
        ],
        build:function(s){
          var d=M.door({L:s.L, vmax:s.vmax, tAcc:s.tAcc, mass:s.m});
          var a=d.aAcc, F=d.forceAcc, tC=d.t2-d.t1;
          return {
            T:d.T,
            charts:[
              { title:"x(t) — position de la porte (m) — la tangente bleue a pour pente v(t)", includeZero:true,
                curves:[{fn:d.x, colorVar:"--green", label:"x(t)", slope:d.v, slopeColorVar:"--blue"}] },
              { title:"v(t) = x′(t) — vitesse (m/s) — la tangente orange a pour pente a(t)", includeZero:true,
                curves:[{fn:d.v, colorVar:"--blue", label:"v(t)", slope:d.a, slopeColorVar:"--orange"}] },
              { title:"a(t) = v′(t) — accélération (m/s²)", includeZero:true,
                curves:[{fn:d.a, colorVar:"--orange", label:"a(t)"}] }
            ],
            anim:function(t){ return { x:d.x(t), L:d.L, v:d.v(t), vmax:d.vmax, a:d.a(t) }; },
            statsDef:[["x","x(t) position"],["v","v(t) = x′(t) vitesse"],["a","a(t) = v′(t) accélération"],["F","F = m·a effort moteur"]],
            stats:function(t){ return { x:f(d.x(t),2)+" m", v:f(d.v(t),2)+" m/s", a:f(d.a(t),2)+" m/s²", F:f(d.force(t),0)+" N" }; },
            formulas:[
              {label:"Accélération sur la rampe (pente de v)", expr:"a = v_max / t_acc = "+f(d.vmax,2)+" / "+f(d.t1,2)+" = "+f(a,2)+" m/s²"},
              {label:"Effort moteur (principe fondamental de la dynamique)", expr:"F = m · a = "+f(s.m,0)+" × "+f(a,2)+" = "+f(F,0)+" N"},
              {label:"Distance parcourue pendant la rampe", expr:"d = ½ · a · t_acc² = ½ × "+f(a,2)+" × "+f(d.t1,2)+"² = "+f(0.5*a*d.t1*d.t1,2)+" m"},
              {label:"Durée totale", expr:"T = t_acc + t_palier + t_déc = "+f(d.t1,2)+" + "+f(tC,2)+" + "+f(d.t3-d.t2,2)+" = "+f(d.t3,2)+" s"}
            ],
            warnings: d.triangular
              ? [{text:"Course trop courte pour cette rampe : la porte n'atteint jamais v_max = "+f(s.vmax,2)+" m/s (profil triangulaire, pointe à "+f(d.vmax,2)+" m/s)."}]
              : [{ok:true, text:"Profil trapézoïdal : rampe "+f(d.t1,2)+" s, palier "+f(tC,2)+" s à "+f(d.vmax,2)+" m/s, freinage "+f(d.t3-d.t2,2)+" s."}],
            explain:[
              {title:"Observation", body:"La porte part de x = 0 et s'arrête à L = "+f(s.L,2)+" m. Sur la courbe verte, la pente change : faible au départ, forte au milieu, nulle à la fin."},
              {title:"Grandeur recherchée", body:"La vitesse à un instant t : c'est la pente de la tangente à x(t). On note v(t) = x′(t). Pente nulle ⇔ porte immobile."},
              {title:"Modèle", body:"L'opérateur impose une accélération constante pendant t_acc, un palier à v_max, puis une décélération. Donc a(t) = v′(t) est constante par morceaux : la courbe orange est en marches."},
              {title:"Formule", body:["Sur une rampe, la dérivée d'une droite est son coefficient directeur : a = Δv / Δt = ",{t:"v_max",c:"num"}," / ",{t:"t_acc",c:"den"}]},
              {title:"Application numérique", body:["a = ",{t:f(d.vmax,2),c:"num"}," / ",{t:f(d.t1,2),c:"den"}," = ",{t:f(a,2)+" m/s²",c:"res"}]},
              {title:"Résultat", body:["Effort moteur nécessaire (hors frottements) : F = m · a = "+f(s.m,0)+" × "+f(a,2)+" = ",{t:f(F,0)+" N",c:"res"}]},
              {title:"Interprétation professionnelle", body:"Diviser t_acc par 2 double l'accélération, donc l'effort et les chocs : le réglage de la rampe de l'opérateur de porte est un compromis confort / sécurité des personnes / usure mécanique."+(d.triangular ? " Ici la course est trop courte : la porte n'atteint jamais v_max." : "")}
            ]
          };
        }
      },
      {
        id:"convoyeur", label:"📦 Convoyeur (variateur)", anim:"conveyor",
        hint:"Un variateur démarre le tapis avec une rampe. Le colis n'est entraîné que par le frottement : il ne peut recevoir qu'une accélération maximale μ·g. Si la dérivée de la vitesse du tapis dépasse ce seuil, le colis glisse.",
        params:[
          {key:"vmax", label:"Vitesse du tapis v_max", min:0.2, max:2, step:0.05, value:1.0, unit:"m/s", decimals:2},
          {key:"tRamp", label:"Rampe du variateur t_rampe", min:0.1, max:3, step:0.05, value:0.5, unit:"s", decimals:2},
          {key:"mu", label:"Coefficient d'adhérence μ (colis / tapis)", min:0.1, max:0.8, step:0.02, value:0.3, unit:"", decimals:2}
        ],
        build:function(s){
          var c=M.conveyor({vmax:s.vmax, tRamp:s.tRamp, tCruise:2.0, mu:s.mu});
          var b=c.belt, a=b.aAcc;
          var slipVisible=function(){ return c.slipEver; };
          var warnings=[];
          if(c.slipAcc) warnings.push({text:"Démarrage : a = "+f(a,2)+" m/s² > μ·g = "+f(c.aLim,2)+" m/s² → le colis glisse, retard maxi "+f(c.maxLag*100,1)+" cm. Allonger la rampe du variateur."});
          if(c.slipDec) warnings.push({text:"Freinage : décélération "+f(b.aDec,2)+" m/s² > μ·g → le colis continue sur "+f(c.maxLead*100,1)+" cm (risque de chute en bout de tapis)."});
          if(!warnings.length) warnings.push({ok:true, text:"Adhérence OK : a = "+f(a,2)+" m/s² ≤ μ·g = "+f(c.aLim,2)+" m/s². Le colis suit exactement le tapis."});
          return {
            T:c.T,
            charts:[
              { title:"x(t) — déplacement du tapis (m) — la tangente bleue a pour pente v(t)", includeZero:true,
                curves:[
                  {fn:b.x, colorVar:"--green", label:"x tapis", slope:b.v, slopeColorVar:"--blue"},
                  {fn:c.parcelX, colorVar:"--red", label:"x colis", dash:[6,5], visible:slipVisible}
                ] },
              { title:"v(t) = x′(t) — vitesse (m/s) — la tangente orange a pour pente a(t)", includeZero:true,
                curves:[
                  {fn:b.v, colorVar:"--blue", label:"v tapis", slope:b.a, slopeColorVar:"--orange"},
                  {fn:c.parcelV, colorVar:"--red", label:"v colis", dash:[6,5], visible:slipVisible}
                ] },
              { title:"a(t) = v′(t) — accélération du tapis (m/s²) et seuil d'adhérence μ·g", includeZero:true,
                curves:[{fn:b.a, colorVar:"--orange", label:"a tapis"}],
                hlines:[{y:c.aLim, colorVar:"--red", label:"+ μ·g"},{y:-c.aLim, colorVar:"--red", label:"− μ·g"}] }
            ],
            anim:function(t){ return { xBelt:b.x(t), xParcel:c.parcelX(t), vBelt:b.v(t), vParcel:c.parcelV(t), vmax:b.vmax, xEnd:b.xEnd, slipping:c.slipping(t), slipDist:c.slipDist(t), tRamp:s.tRamp }; },
            statsDef:[["x","x(t) tapis"],["v","v(t) = x′(t) tapis"],["a","a(t) = v′(t) tapis"],["lim","a_lim = μ·g (adhérence)"],["slip","Glissement du colis Δx"]],
            stats:function(t){
              var d=c.slipDist(t);
              return { x:f(b.x(t),2)+" m", v:f(b.v(t),2)+" m/s", a:f(b.a(t),2)+" m/s²", lim:f(c.aLim,2)+" m/s²",
                slip: Math.abs(d)<0.0005 ? "0 cm" : f(d*100,1)+" cm" };
            },
            formulas:[
              {label:"Accélération du tapis sur la rampe", expr:"a = v_max / t_rampe = "+f(s.vmax,2)+" / "+f(s.tRamp,2)+" = "+f(a,2)+" m/s²"},
              {label:"Accélération maximale transmissible par frottement", expr:"a_lim = μ · g = "+f(s.mu,2)+" × 9,81 = "+f(c.aLim,2)+" m/s²"},
              {label:"Condition d'entraînement sans glissement", expr:"a ≤ μ · g  ⇔  t_rampe ≥ v_max / (μ · g) = "+f(s.vmax/c.aLim,2)+" s"},
              {label:"Verdict", expr: c.slipEver ? "Glissement : "+(c.slipAcc?"au démarrage ":"")+(c.slipDec?"au freinage":"") : "Le colis suit le tapis"}
            ],
            warnings:warnings,
            explain:[
              {title:"Observation", body:"Le variateur démarre le tapis : rampe de "+f(s.tRamp,2)+" s jusqu'à "+f(s.vmax,2)+" m/s, palier, puis rampe de freinage. Le colis posé dessus doit suivre sans glisser."},
              {title:"Grandeur recherchée", body:"L'accélération du tapis pendant la rampe : a = v′(t), pente de la courbe bleue (constante sur la rampe)."},
              {title:"Modèle", body:"Seul le frottement entraîne le colis. Il ne peut lui transmettre qu'une accélération maximale : a_lim = μ · g (μ = coefficient d'adhérence colis / tapis)."},
              {title:"Formule", body:["Condition pour que le colis suive : a = ",{t:"v_max",c:"num"}," / ",{t:"t_rampe",c:"den"}," ≤ μ · g"]},
              {title:"Application numérique", body:["a = ",{t:f(s.vmax,2),c:"num"}," / ",{t:f(s.tRamp,2),c:"den"}," = ",{t:f(a,2)+" m/s²",c:"res"},"   ;   μ · g = "+f(s.mu,2)+" × 9,81 = ",{t:f(c.aLim,2)+" m/s²",c:"res"}]},
              {title:"Résultat", body: c.slipEver
                ? [{t:"a > μ · g",c:"warn"}," : le colis glisse."+(c.slipAcc?" Retard maxi au démarrage : "+f(c.maxLag*100,1)+" cm.":"")+(c.slipDec?" Au freinage il continue sur "+f(c.maxLead*100,1)+" cm.":"")]
                : [{t:"a ≤ μ · g",c:"res"}," : le colis suit le tapis sans glisser."]},
              {title:"Interprétation professionnelle", body:"C'est la dérivée qui décide, pas la vitesse : allonger la rampe du variateur (paramètre « temps d'accélération ») réduit a sans toucher à v_max. Même raisonnement au freinage : une rampe de décélération trop courte envoie le colis vers l'avant."}
            ]
          };
        }
      },
      {
        id:"variateur", label:"⚙️ Moteur + variateur (rampe)", anim:"motor",
        hint:"Le variateur impose une rampe de vitesse au moteur. L'accélération angulaire α = dω/dt est la pente de cette rampe ; le couple demandé au moteur en découle : C = J·α + Cr. Une rampe trop courte dépasse le couple maximal.",
        params:[
          {key:"nNom", label:"Vitesse de consigne n", min:300, max:3000, step:50, value:1500, unit:"tr/min", decimals:0},
          {key:"tRamp", label:"Rampe d'accélération t_rampe", min:0.2, max:10, step:0.1, value:2, unit:"s", decimals:1},
          {key:"J", label:"Inertie entraînée J", min:0.01, max:0.5, step:0.01, value:0.05, unit:"kg·m²", decimals:2},
          {key:"Cr", label:"Couple résistant Cr", min:0, max:15, step:0.5, value:4, unit:"N·m", decimals:1},
          {key:"Cmax", label:"Couple maxi du moteur C_max", min:5, max:50, step:1, value:15, unit:"N·m", decimals:0}
        ],
        build:function(s){
          var m=M.motorRamp({nNom:s.nNom, tRamp:s.tRamp, tCruise:2.0, J:s.J, Cr:s.Cr});
          var over=m.torqueAcc>s.Cmax;
          var warnings=[];
          if(over) warnings.push({text:"Couple demandé "+f(m.torqueAcc,1)+" N·m > C_max = "+f(s.Cmax,0)+" N·m : le moteur ne peut pas suivre la rampe (limitation de courant, défaut variateur). Allonger t_rampe ou réduire J."});
          else warnings.push({ok:true, text:"Couple demandé "+f(m.torqueAcc,1)+" N·m ≤ C_max = "+f(s.Cmax,0)+" N·m : la rampe est compatible avec le moteur."});
          if(m.torqueDec<0) warnings.push({text:"Au freinage, C = "+f(m.torqueDec,1)+" N·m < 0 : le moteur freine la charge, l'énergie revient vers le variateur (résistance de freinage / bus continu)."});
          return {
            T:m.T,
            charts:[
              { title:"θ(t) — angle (tours) — la tangente bleue a pour pente n(t) en tr/s", includeZero:true,
                curves:[{fn:m.turns, colorVar:"--green", label:"θ(t)", slope:function(t){ return m.omega(t)/TWO_PI; }, slopeColorVar:"--blue"}] },
              { title:"n(t) — vitesse de rotation (tr/min) — pente = α (en tr/min par s)", includeZero:true,
                curves:[{fn:m.n, colorVar:"--blue", label:"n(t)", slope:function(t){ return M.radToRpm(m.alpha(t)); }, slopeColorVar:"--orange"}] },
              { title:"C(t) = J·α(t) + Cr — couple moteur (N·m) et couple maxi", includeZero:true,
                curves:[{fn:m.torque, colorVar:"--orange", label:"C(t)"}],
                hlines:[{y:s.Cmax, colorVar:"--red", label:"C max moteur"}] }
            ],
            anim:function(t){ return { thetaRad:m.theta(t), turns:m.turns(t), n:m.n(t), nNom:s.nNom, C:m.torque(t), Cmax:s.Cmax, mode:"ramp", tRamp:s.tRamp }; },
            statsDef:[["th","θ(t) angle"],["n","n(t) vitesse"],["w","ω(t) = θ′(t)"],["al","α(t) = ω′(t)"],["C","C(t) = J·α + Cr"]],
            stats:function(t){ return { th:f(m.turns(t),1)+" tours", n:f(m.n(t),0)+" tr/min", w:f(m.omega(t),1)+" rad/s", al:f(m.alpha(t),1)+" rad/s²", C:f(m.torque(t),1)+" N·m" }; },
            formulas:[
              {label:"Vitesse angulaire nominale", expr:"ω_nom = 2π · n / 60 = 2π × "+f(s.nNom,0)+" / 60 = "+f(m.wNom,1)+" rad/s"},
              {label:"Accélération angulaire sur la rampe (pente de ω)", expr:"α = ω_nom / t_rampe = "+f(m.wNom,1)+" / "+f(s.tRamp,1)+" = "+f(m.alphaAcc,1)+" rad/s²"},
              {label:"Couple moteur (PFD en rotation : C − Cr = J·α)", expr:"C = J · α + Cr = "+f(s.J,2)+" × "+f(m.alphaAcc,1)+" + "+f(s.Cr,1)+" = "+f(m.torqueAcc,1)+" N·m"},
              {label:"Au freinage (α < 0)", expr:"C = −J · α_d + Cr = "+f(m.torqueDec,1)+" N·m"}
            ],
            warnings:warnings,
            explain:[
              {title:"Observation", body:"Le variateur monte la vitesse de 0 à "+f(s.nNom,0)+" tr/min en "+f(s.tRamp,1)+" s : la courbe bleue n(t) est une rampe, la courbe verte θ(t) (angle) s'incurve de plus en plus."},
              {title:"Grandeur recherchée", body:"L'accélération angulaire α = dω/dt (rad/s²) : pente de ω(t). ω est la dérivée de l'angle θ ; α est la dérivée de ω."},
              {title:"Modèle", body:"Principe fondamental de la dynamique en rotation : C_moteur − Cr = J · α  ⇒  C = J · α + Cr. Le couple demandé au moteur dépend directement de la dérivée de la vitesse."},
              {title:"Formule", body:["ω_nom = 2π · n / 60   ;   α = ",{t:"ω_nom",c:"num"}," / ",{t:"t_rampe",c:"den"}]},
              {title:"Application numérique", body:["ω_nom = 2π × "+f(s.nNom,0)+" / 60 = "+f(m.wNom,1)+" rad/s ; α = ",{t:f(m.wNom,1),c:"num"}," / ",{t:f(s.tRamp,1),c:"den"}," = ",{t:f(m.alphaAcc,1)+" rad/s²",c:"res"}]},
              {title:"Résultat", body:["C = "+f(s.J,2)+" × "+f(m.alphaAcc,1)+" + "+f(s.Cr,1)+" = ",{t:f(m.torqueAcc,1)+" N·m",c:over?"warn":"res"},"  (C_max moteur = "+f(s.Cmax,0)+" N·m)"]},
              {title:"Interprétation professionnelle", body: over
                ? "Couple demandé supérieur à C_max : le moteur ne suit pas la consigne, le variateur passe en limitation de courant ou en défaut. Solution : allonger t_rampe (α plus faible) ou réduire l'inertie entraînée."
                : "Couple compatible avec le moteur. Au freinage, α < 0 : le couple devient "+f(m.torqueDec,1)+" N·m"+(m.torqueDec<0 ? " ; négatif, l'énergie revient vers le variateur (résistance de freinage)." : ".")}
            ]
          };
        }
      },
      {
        id:"direct", label:"⚡ Démarrage direct (contacteur)", anim:"motor",
        hint:"Sans variateur, la vitesse monte selon une exponentielle (modèle simplifié du 1er ordre). La dérivée est maximale à t = 0 : c'est l'à-coup de démarrage, source de chocs mécaniques et de pointe de courant.",
        params:[
          {key:"nNom", label:"Vitesse finale n", min:300, max:3000, step:50, value:1500, unit:"tr/min", decimals:0},
          {key:"tau", label:"Constante de temps mécanique τ", min:0.1, max:3, step:0.05, value:0.6, unit:"s", decimals:2},
          {key:"J", label:"Inertie entraînée J", min:0.01, max:0.5, step:0.01, value:0.05, unit:"kg·m²", decimals:2},
          {key:"Cr", label:"Couple résistant Cr", min:0, max:15, step:0.5, value:4, unit:"N·m", decimals:1},
          {key:"Cmax", label:"Couple maxi du moteur C_max", min:5, max:50, step:1, value:15, unit:"N·m", decimals:0}
        ],
        build:function(s){
          var m=M.motorDirect({nNom:s.nNom, tau:s.tau, J:s.J, Cr:s.Cr});
          var over=m.torque0>s.Cmax;
          return {
            T:m.T,
            charts:[
              { title:"θ(t) — angle (tours) — la tangente bleue a pour pente n(t) en tr/s", includeZero:true,
                curves:[{fn:m.turns, colorVar:"--green", label:"θ(t)", slope:function(t){ return m.omega(t)/TWO_PI; }, slopeColorVar:"--blue"}] },
              { title:"n(t) = n_f·(1 − e^(−t/τ)) — vitesse (tr/min) — pente maximale à t = 0", includeZero:true,
                curves:[{fn:m.n, colorVar:"--blue", label:"n(t)", slope:function(t){ return M.radToRpm(m.alpha(t)); }, slopeColorVar:"--orange"}] },
              { title:"C(t) = J·α(t) + Cr — couple moteur (N·m) : à-coup à t = 0", includeZero:true,
                curves:[{fn:m.torque, colorVar:"--orange", label:"C(t)"}],
                hlines:[{y:s.Cmax, colorVar:"--red", label:"C max moteur"}] }
            ],
            anim:function(t){ return { thetaRad:m.theta(t), turns:m.turns(t), n:m.n(t), nNom:s.nNom, C:m.torque(t), Cmax:s.Cmax, mode:"direct" }; },
            statsDef:[["th","θ(t) angle"],["n","n(t) vitesse"],["w","ω(t) = θ′(t)"],["al","α(t) = ω′(t)"],["C","C(t) = J·α + Cr"]],
            stats:function(t){ return { th:f(m.turns(t),1)+" tours", n:f(m.n(t),0)+" tr/min", w:f(m.omega(t),1)+" rad/s", al:f(m.alpha(t),1)+" rad/s²", C:f(m.torque(t),1)+" N·m" }; },
            formulas:[
              {label:"Vitesse (modèle du 1er ordre)", expr:"ω(t) = ω_f · (1 − e^(−t/τ)),  ω_f = "+f(m.wf,1)+" rad/s,  τ = "+f(s.tau,2)+" s"},
              {label:"Dérivée de l'exponentielle", expr:"α(t) = dω/dt = (ω_f / τ) · e^(−t/τ)  →  α(0) = "+f(m.wf,1)+" / "+f(s.tau,2)+" = "+f(m.alpha0,1)+" rad/s²"},
              {label:"À-coup de couple au démarrage", expr:"C(0) = J · α(0) + Cr = "+f(s.J,2)+" × "+f(m.alpha0,1)+" + "+f(s.Cr,1)+" = "+f(m.torque0,1)+" N·m"},
              {label:"Comparaison : rampe de variateur de 3τ = "+f(3*s.tau,2)+" s", expr:"C = J · ω_f / (3τ) + Cr = "+f(m.torqueRampEquiv,1)+" N·m"}
            ],
            warnings: over
              ? [{text:"À-coup C(0) = "+f(m.torque0,1)+" N·m > C_max = "+f(s.Cmax,0)+" N·m : chocs sur les accouplements et pointe de courant (5 à 8 × I_n en démarrage direct). Un variateur ou un démarreur progressif s'impose."}]
              : [{ok:true, text:"À-coup C(0) = "+f(m.torque0,1)+" N·m ≤ C_max = "+f(s.Cmax,0)+" N·m : démarrage direct acceptable pour cette charge."}],
            explain:[
              {title:"Observation", body:"Démarrage direct par contacteur : la vitesse monte très vite au début puis se stabilise à "+f(s.nNom,0)+" tr/min. Modèle simplifié du 1er ordre : ω(t) = ω_f · (1 − e^(−t/τ)), τ = "+f(s.tau,2)+" s."},
              {title:"Grandeur recherchée", body:"L'à-coup au démarrage = accélération angulaire maximale = pente maximale de la courbe bleue. Où est-elle maximale ? À t = 0, là où la tangente est la plus raide."},
              {title:"Modèle", body:"Dérivée de l'exponentielle : α(t) = dω/dt = (ω_f / τ) · e^(−t/τ). Elle décroît avec t : α(0) est la plus grande valeur."},
              {title:"Formule", body:["α(0) = ",{t:"ω_f",c:"num"}," / ",{t:"τ",c:"den"},"   ;   C(0) = J · α(0) + Cr"]},
              {title:"Application numérique", body:["α(0) = ",{t:f(m.wf,1),c:"num"}," / ",{t:f(s.tau,2),c:"den"}," = ",{t:f(m.alpha0,1)+" rad/s²",c:"res"},"  ;  C(0) = "+f(s.J,2)+" × "+f(m.alpha0,1)+" + "+f(s.Cr,1)+" = ",{t:f(m.torque0,1)+" N·m",c:over?"warn":"res"}]},
              {title:"Résultat", body:[{t: over ? "C(0) > C_max" : "C(0) ≤ C_max", c: over ? "warn" : "res"}," — avec une rampe de variateur de 3τ = "+f(3*s.tau,2)+" s, il suffirait de "+f(m.torqueRampEquiv,1)+" N·m."]},
              {title:"Interprétation professionnelle", body:"La dérivée à t = 0 mesure la brutalité du démarrage : chocs sur les accouplements, pointe de courant (5 à 8 × I_n en démarrage direct). Le variateur remplace l'exponentielle par une rampe : dérivée constante, choisie par le réglage."}
            ]
          };
        }
      }
    ];

    /* ------------------------------------------------------------------ */
    /* Câblage générique                                                    */
    /* ------------------------------------------------------------------ */
    var state={}, sit=null, model=null, charts=[], mech=null, statsPanel=null;

    function selectSituation(i){
      sit=situations[i];
      Array.prototype.forEach.call(sitBar.children, function(b,j){
        b.classList.toggle("active", j===i);
        b.setAttribute("aria-pressed", j===i ? "true" : "false");
      });
      head.hint.textContent=sit.hint;
      state={};
      sit.params.forEach(function(p){ state[p.key]=p.value; });
      paramsBox.mount.innerHTML="";
      sit.params.forEach(function(p){
        MC.components.ParameterSlider(paramsBox.mount, {
          label:p.label, min:p.min, max:p.max, step:p.step, value:p.value, unit:p.unit, decimals:p.decimals,
          onChange:function(v){ state[p.key]=v; rebuildModel(); }
        });
      });
      animBox.mount.innerHTML="";
      mech=MC.components.MechanismAnimation(animBox.mount, {kind:sit.anim, ariaLabel:sit.label});
      charts.forEach(function(ch){ ch.destroy(); });
      model=sit.build(state);
      // Les courbes lisent le modèle courant (reconstruit à chaque réglage) sans recréer les graphes.
      function curveAt(k,ci){ var ch=model.charts[k]; return ch ? ch.curves[ci] : null; }
      function hlineAt(k,hi){ var ch=model.charts[k]; return ch && ch.hlines ? ch.hlines[hi] : null; }
      charts=model.charts.map(function(ch,k){
        chartBoxes[k].title.textContent=ch.title;
        chartBoxes[k].mount.innerHTML="";
        return MC.components.SineWave(chartBoxes[k].mount, {
          period:function(){ return model.T; },
          className:"mc-canvas-sm", xLabel:"t (s)", includeZero:ch.includeZero,
          tickFormat:{ x:function(v){ return f(v,1); }, y:function(v){ return f(v, Math.abs(v)>=100 ? 0 : (Math.abs(v)>=10 ? 1 : 2)); } },
          hlines:(ch.hlines||[]).map(function(h,hi){
            return { y:function(){ var hl=hlineAt(k,hi); return hl ? hl.y : NaN; }, colorVar:h.colorVar, label:h.label };
          }),
          curves:ch.curves.map(function(c,ci){
            return {
              fn:function(t){ var cc=curveAt(k,ci); return cc ? cc.fn(t) : NaN; },
              slope: c.slope ? function(t){ var cc=curveAt(k,ci); return cc && cc.slope ? cc.slope(t) : NaN; } : null,
              visible: c.visible ? function(){ var cc=curveAt(k,ci); return !!(cc && cc.visible && cc.visible()); } : null,
              slopeColorVar:c.slopeColorVar, colorVar:c.colorVar, label:c.label, dash:c.dash, width:c.width
            };
          })
        });
      });
      statsPanel=L.stats(statsBox.mount, model.statsDef);
      explain.reset();
      engine.period=model.T;
      engine.reset();
      refreshStatic();
    }

    function rebuildModel(){
      model=sit.build(state);
      charts.forEach(function(ch){ ch.refreshRange(); });
      engine.period=model.T;
      if(engine.t>model.T) engine.setT(model.T);
      refreshStatic();
    }

    function refreshStatic(){
      formulaPanel.render(model.formulas);
      explain.render(model.explain);
      warnEl.innerHTML="";
      model.warnings.forEach(function(w){
        var d=document.createElement("div");
        if(w.ok) d.className="ok";
        d.textContent=w.text;
        warnEl.appendChild(d);
      });
      renderTime(engine.t);
    }

    function renderTime(t){
      if(!model) return;
      charts.forEach(function(ch){ ch.render(t); });
      mech.render(model.anim(t));
      var vals=model.stats(t);
      Object.keys(vals).forEach(function(k){ statsPanel.set(k, vals[k]); });
    }

    situations.forEach(function(s,i){
      var b=document.createElement("button"); b.type="button"; b.textContent=s.label;
      b.addEventListener("click", function(){ selectSituation(i); });
      sitBar.appendChild(b);
    });
    selectSituation(0);

    return { destroy:function(){
      MC.core.animation.unregister(engine);
      charts.forEach(function(ch){ ch.destroy(); });
    } };
  };
})();
