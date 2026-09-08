(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.scenes = MC.scenes || {};

  // Scène : les rampes, objets mathématiques (fonction affine par morceaux) et objets métier.
  // Dérivée d'une rampe = son coefficient directeur ; les cassures = à-coups, surtensions, courants d'appel.
  MC.scenes.rampesDerivee = function(container){
    var U=MC.core.units, M=MC.core.mechanics, E=MC.core.electrical;
    var f=U.fmt, PI=Math.PI;

    var msTime={
      format:function(t){ return "t = "+f(t*1000,2)+" ms"; },
      step:function(model){ return model ? model.T/60 : 0.001; },
      tickX:function(v){ return f(v*1000,0); },
      xLabel:"t (ms)",
      // Les phénomènes bobine/condensateur durent quelques dizaines de ms : sans ralenti,
      // la lecture boucle trop vite pour être visible à l'œil (~0,02 = période étalée sur qqs secondes).
      timeScale:0.02
    };

    var situations=[
      {
        id:"vitesse", label:"⚙️ Rampe de vitesse (variateur)", anim:"motor",
        hint:"Le variateur fait monter la vitesse par une rampe : une fonction affine par morceaux. Sa dérivée est le coefficient directeur (l'accélération), constante sur la rampe et nulle sur le palier. Aux cassures, la dérivée saute : c'est l'à-coup. La rampe en S rend la dérivée continue.",
        params:[
          {key:"type", label:"Forme de la rampe", choices:[{value:"lin",label:"Linéaire"},{value:"s",label:"En S"}], value:"lin"},
          {key:"nNom", label:"Vitesse de consigne n", min:300, max:3000, step:50, value:1500, unit:"tr/min", decimals:0},
          {key:"tAcc", label:"Temps d'accélération (paramètre ACC)", min:0.2, max:10, step:0.1, value:2, unit:"s", decimals:1},
          {key:"tDec", label:"Temps de décélération (paramètre DEC)", min:0.2, max:10, step:0.1, value:1, unit:"s", decimals:1}
        ],
        build:function(s){
          var wNom=M.rpmToRad(s.nNom), isS=s.type==="s";
          var prof = isS ? M.sTrapezoid({vmax:wNom, tAcc:s.tAcc, tCruise:2, tDec:s.tDec}) : M.trapezoid({vmax:wNom, tAcc:s.tAcc, tCruise:2, tDec:s.tDec});
          var J=0.05, Cr=4, Cmax=15;
          var corners=prof.corners.map(function(c){ return {x:c, colorVar:"--red", label:"∞"}; });
          return {
            T:prof.t3+0.6,
            charts:[
              { title:"n(t) — vitesse (tr/min) : la rampe est un segment de droite — la tangente bleue a pour pente α", includeZero:true,
                curves:[{fn:function(t){ return M.radToRpm(prof.v(t)); }, colorVar:"--green", label:"n(t)", slope:function(t){ return M.radToRpm(prof.a(t)); }, slopeColorVar:"--blue"}] },
              { title:"α(t) = ω′(t) — accélération angulaire (rad/s²) : dérivée d'une droite = son coefficient directeur", includeZero:true,
                curves:[{fn:prof.a, colorVar:"--blue", label:"α(t)"}],
                vlines: isS ? [] : prof.corners.map(function(c){ return {x:c, colorVar:"--red", label:"saut"}; }) },
              { title: isS ? "j(t) = α′(t) — à-coup (rad/s³) : fini, l'accélération varie en douceur" : "j(t) = α′(t) — à-coup (rad/s³) : nul sur les segments, infini aux cassures (traits rouges)", includeZero:true,
                curves:[{fn:prof.j, colorVar:"--orange", label:"j(t)"}],
                vlines: isS ? [] : corners }
            ],
            anim:function(t){ return { thetaRad:prof.x(t), turns:prof.x(t)/(2*PI), n:M.radToRpm(prof.v(t)), nNom:s.nNom, C:J*prof.a(t)+Cr, Cmax:Cmax, mode:isS?"sramp":"ramp", tRamp:s.tAcc }; },
            statsDef:[["n","n(t) vitesse"],["al","α(t) = ω′(t)"],["alr","α en (tr/min) par seconde"],["j","j(t) = α′(t) à-coup"],["C","couple C = J·α + Cr (J = 0,05 kg·m², Cr = 4 N·m)"]],
            stats:function(t){
              var al=prof.a(t);
              var onCorner = !isS && prof.corners.some(function(c){ return Math.abs(t-c)<0.03; });
              return { n:f(M.radToRpm(prof.v(t)),0)+" tr/min", al:f(al,1)+" rad/s²", alr:f(M.radToRpm(al),0)+" (tr/min)/s", j: onCorner ? "∞ (cassure)" : f(prof.j(t),1)+" rad/s³", C:f(J*al+Cr,1)+" N·m" };
            },
            formulas: isS ? [
              {label:"Rampe en S (loi en cosinus) sur [0 ; t_acc]", expr:"ω(t) = ω_nom · [1 − cos(π·t / t_acc)] / 2,   ω_nom = "+f(wNom,1)+" rad/s"},
              {label:"Dérivée : accélération", expr:"α(t) = ω′(t) = (π·ω_nom / 2·t_acc) · sin(π·t / t_acc)  →  α_max = π/2 × "+f(wNom,1)+" / "+f(s.tAcc,1)+" = "+f(prof.aAcc,1)+" rad/s²"},
              {label:"Dérivée seconde : à-coup (fini)", expr:"j_max = π²/2 × ω_nom / t_acc² = "+f(prof.jAcc,1)+" rad/s³ à l'accélération ; π²/2 × ω_nom / t_dec² = "+f(prof.jDec,1)+" rad/s³ à la décélération"},
              {label:"Comparaison", expr:"rampe linéaire de même durée : α = "+f(wNom/s.tAcc,1)+" rad/s² (α_max × 1,57 en S) mais à-coup infini aux cassures"}
            ] : [
              {label:"Rampe linéaire sur [0 ; t_acc] : fonction affine", expr:"ω(t) = a · t   avec   a = ω_nom / t_acc = "+f(wNom,1)+" / "+f(s.tAcc,1)+" = "+f(prof.aAcc,1)+" rad/s²"},
              {label:"Dérivée d'une fonction affine = coefficient directeur", expr:"α(t) = ω′(t) = a = "+f(prof.aAcc,1)+" rad/s²  (constante)"},
              {label:"Dérivée d'une constante = 0", expr:"sur le palier ω = ω_nom = "+f(wNom,1)+" rad/s  ⇒  α = 0"},
              {label:"Décélération (DEC)", expr:"α = −ω_nom / t_dec = −"+f(wNom,1)+" / "+f(s.tDec,1)+" = "+f(-prof.aDec,1)+" rad/s²"},
              {label:"Aux cassures", expr:"α saute de 0 à "+f(prof.aAcc,1)+" : à-coup j = α′ infini → chocs mécaniques"}
            ],
            warnings: isS
              ? [{ok:true, text:"Rampe en S : α(t) continue, à-coup fini j_max = "+f(prof.jMax,1)+" rad/s³. Pic d'accélération "+f(prof.aAcc,1)+" rad/s² (× 1,57 par rapport à la rampe linéaire) mais sans choc."}]
              : [{text:"Rampe linéaire : aux cassures (t = 0 ; "+f(prof.t1,1)+" ; "+f(prof.t2,1)+" ; "+f(prof.t3,1)+" s) l'accélération saute brutalement : à-coup infini → chocs sur les accouplements, glissement de charge, usure. Sur le variateur : activer la « rampe en S » ou allonger ACC/DEC."}],
            explain:[
              {title:"Observation", body:"La consigne de vitesse monte en ligne droite de 0 à "+f(s.nNom,0)+" tr/min en "+f(s.tAcc,1)+" s, reste constante, puis redescend en "+f(s.tDec,1)+" s : une fonction affine par morceaux."},
              {title:"Grandeur recherchée", body:"L'accélération angulaire α = dω/dt : la pente de la courbe verte. Est-elle la même partout ?"},
              {title:"Modèle", body:"Sur la rampe, ω(t) = a·t est une fonction affine. Sur le palier, ω(t) = ω_nom est une constante."},
              {title:"Formule", body:["Dérivée d'une fonction affine : (a·t + b)′ = ",{t:"a",c:"num"}," (le coefficient directeur). Dérivée d'une constante : (ω_nom)′ = ",{t:"0",c:"den"}]},
              {title:"Application numérique", body:["a = ω_nom / t_acc = ",{t:f(wNom,1),c:"num"}," / ",{t:f(s.tAcc,1),c:"den"}," = ",{t:f(wNom/s.tAcc,1)+" rad/s²",c:"res"}," ; sur le palier α = 0 ; en décélération α = ",{t:f(-wNom/s.tDec,1)+" rad/s²",c:"res"}]},
              {title:"Résultat", body: isS
                ? ["Avec la rampe en S, α(t) monte progressivement jusqu'à ",{t:f(prof.aAcc,1)+" rad/s²",c:"res"}," puis redescend : la dérivée est continue, l'à-coup j = α′ reste fini (",{t:f(prof.jMax,1)+" rad/s³",c:"res"},")."]
                : ["α(t) est constante par morceaux : 0 → ",{t:f(prof.aAcc,1),c:"res"}," → 0 → ",{t:f(-prof.aDec,1),c:"res"}," → 0. À chaque cassure la dérivée ",{t:"saute",c:"warn"}," : à-coup infini."]},
              {title:"Interprétation professionnelle", body:"Sur le variateur, ACC et DEC règlent la pente, donc la dérivée. La rampe en S remplace les cassures par des arrondis : dérivée continue, moins de chocs mécaniques et de glissement de charge, au prix d'un pic d'accélération 1,57 fois plus élevé pour la même durée."}
            ]
          };
        }
      },
      {
        id:"bobine", label:"🧲 Rampe de courant (bobine)", anim:"inductor", time:msTime,
        hint:"Dans une bobine, la tension est proportionnelle à la dérivée du courant : u_L = L·di/dt. Une rampe de courant donne une tension constante ; une coupure brutale (t_d très court) donne une surtension énorme — d'où la diode de roue libre.",
        params:[
          {key:"L", label:"Inductance L", min:1, max:500, step:1, value:100, unit:"mH", decimals:0},
          {key:"Imax", label:"Courant maxi I_max", min:0.5, max:20, step:0.5, value:5, unit:"A", decimals:1},
          {key:"tRise", label:"Montée du courant t_m", min:0.1, max:50, step:0.1, value:10, unit:"ms", decimals:1},
          {key:"tFall", label:"Coupure du courant t_d", min:0.1, max:50, step:0.1, value:1, unit:"ms", decimals:1},
          {key:"Ulim", label:"Tension admissible U_max", min:50, max:1000, step:10, value:400, unit:"V", decimals:0}
        ],
        build:function(s){
          var L=s.L/1000, tr=s.tRise/1000, tf=s.tFall/1000;
          var m=E.inductorRamp({L:L, Imax:s.Imax, tRise:tr, tHold:0.020, tFall:tf});
          var uPeak=Math.max(Math.abs(m.uFall), Math.abs(m.uRise));
          var over=uPeak>s.Ulim;
          return {
            T:m.T,
            charts:[
              { title:"i(t) — courant dans la bobine (A) — la tangente bleue a pour pente di/dt", includeZero:true,
                curves:[{fn:m.i, colorVar:"--green", label:"i(t)", slope:m.didt, slopeColorVar:"--blue"}] },
              { title:"u_L(t) = L·di/dt — tension aux bornes (V) : la dérivée du courant, à L près", includeZero:true,
                curves:[{fn:m.u, colorVar:"--blue", label:"u_L(t)"}],
                hlines:[{y:s.Ulim, colorVar:"--red", label:"+U max"},{y:-s.Ulim, colorVar:"--red", label:"−U max"}] },
              { title:"p(t) = u·i — puissance (W) : > 0 la bobine stocke de l'énergie, < 0 elle la restitue", includeZero:true,
                curves:[{fn:m.p, colorVar:"--orange", label:"p(t)"}] }
            ],
            anim:function(t){ return { i:m.i(t), iMax:s.Imax, u:m.u(t), uMax:uPeak, uLim:s.Ulim, p:m.p(t), flowPx:m.charge(t)/(s.Imax*m.T)*2200 }; },
            statsDef:[["i","i(t) courant"],["didt","di/dt (pente de i)"],["u","u_L = L·di/dt"],["p","p = u·i"],["w","énergie ½·L·i²"]],
            stats:function(t){ return { i:f(m.i(t),2)+" A", didt:f(m.didt(t),0)+" A/s", u:f(m.u(t),1)+" V", p:f(m.p(t),1)+" W", w:f(m.energy(t)*1000,1)+" mJ" }; },
            formulas:[
              {label:"Loi de la bobine", expr:"u_L = L · di/dt   (L = "+f(s.L,0)+" mH = "+f(L,3)+" H)"},
              {label:"Montée : rampe de courant", expr:"di/dt = I_max / t_m = "+f(s.Imax,1)+" / "+f(tr,4)+" = "+f(m.didtRise,0)+" A/s  →  u_L = "+f(L,3)+" × "+f(m.didtRise,0)+" = "+f(m.uRise,1)+" V"},
              {label:"Palier : courant constant", expr:"di/dt = 0  →  u_L = 0 V (la bobine est « transparente » en continu)"},
              {label:"Coupure : descente rapide", expr:"di/dt = −I_max / t_d = "+f(m.didtFall,0)+" A/s  →  u_L = "+f(m.uFall,1)+" V"},
              {label:"Énergie stockée", expr:"W = ½ · L · I_max² = ½ × "+f(L,3)+" × "+f(s.Imax,1)+"² = "+f(m.energyMax*1000,1)+" mJ"}
            ],
            warnings: over
              ? [{text:"Surtension : |u_L| = "+f(uPeak,0)+" V > U_max = "+f(s.Ulim,0)+" V. Couper le courant en "+f(s.tFall,1)+" ms fait exploser la dérivée : claquage du transistor, arc au contact. Remède : diode de roue libre (le courant décroît lentement) ou circuit d'aide à la commutation."}]
              : [{ok:true, text:"|u_L| ≤ U_max : la dérivée du courant reste supportable pour les composants (montée "+f(m.uRise,1)+" V, coupure "+f(m.uFall,1)+" V)."}],
            explain:[
              {title:"Observation", body:"Le hacheur impose une rampe de courant de 0 à "+f(s.Imax,1)+" A en "+f(s.tRise,1)+" ms, un palier, puis une coupure en "+f(s.tFall,1)+" ms. La tension u_L n'apparaît que quand le courant VARIE."},
              {title:"Grandeur recherchée", body:"La tension aux bornes de la bobine. Elle ne dépend pas de la valeur du courant mais de sa vitesse de variation di/dt : la pente de la courbe verte."},
              {title:"Modèle", body:"Loi de la bobine : u_L = L · di/dt. La tension EST la dérivée du courant, multipliée par L."},
              {title:"Formule", body:["Sur la rampe (fonction affine) : di/dt = ",{t:"I_max",c:"num"}," / ",{t:"t_m",c:"den"},"   puis   u_L = L × di/dt"]},
              {title:"Application numérique", body:["di/dt = ",{t:f(s.Imax,1)+" A",c:"num"}," / ",{t:f(tr,4)+" s",c:"den"}," = ",{t:f(m.didtRise,0)+" A/s",c:"res"},"  →  u_L = "+f(L,3)+" × "+f(m.didtRise,0)+" = ",{t:f(m.uRise,1)+" V",c:"res"}]},
              {title:"Résultat", body:["À la coupure (t_d = "+f(s.tFall,1)+" ms) : u_L = ",{t:f(m.uFall,0)+" V",c:over?"warn":"res"},". Plus la coupure est rapide, plus la dérivée est grande, plus la surtension est violente."]},
              {title:"Interprétation professionnelle", body:"C'est pour cela qu'une bobine de relais, de contacteur ou un moteur (charges inductives) reçoivent une diode de roue libre ou un circuit RC : ils offrent un chemin au courant pour que di/dt reste raisonnable. Même idée que la rampe du variateur : maîtriser la dérivée."}
            ]
          };
        }
      },
      {
        id:"condensateur", label:"⚡ Rampe de tension (condensateur)", anim:"capacitor", time:msTime,
        hint:"Dans un condensateur, le courant est proportionnel à la dérivée de la tension : i_C = C·du/dt. Charger trop vite un condensateur (bus continu d'un variateur, filtre) crée un courant d'appel énorme — d'où les circuits de précharge.",
        params:[
          {key:"C", label:"Capacité C", min:10, max:4700, step:10, value:470, unit:"µF", decimals:0},
          {key:"Umax", label:"Tension finale U_max", min:5, max:600, step:5, value:325, unit:"V", decimals:0},
          {key:"tRise", label:"Montée de la tension t_m", min:0.1, max:50, step:0.1, value:2, unit:"ms", decimals:1},
          {key:"tFall", label:"Décharge t_d", min:0.1, max:50, step:0.1, value:20, unit:"ms", decimals:1},
          {key:"Ilim", label:"Courant admissible I_max", min:1, max:200, step:1, value:30, unit:"A", decimals:0}
        ],
        build:function(s){
          var C=s.C*1e-6, tr=s.tRise/1000, tf=s.tFall/1000;
          var m=E.capacitorRamp({C:C, Umax:s.Umax, tRise:tr, tHold:0.020, tFall:tf});
          var iPeak=Math.max(Math.abs(m.iRise), Math.abs(m.iFall));
          var over=iPeak>s.Ilim;
          return {
            T:m.T,
            charts:[
              { title:"u_C(t) — tension aux bornes (V) — la tangente bleue a pour pente du/dt", includeZero:true,
                curves:[{fn:m.u, colorVar:"--green", label:"u_C(t)", slope:m.dudt, slopeColorVar:"--blue"}] },
              { title:"i_C(t) = C·du/dt — courant (A) : la dérivée de la tension, à C près", includeZero:true,
                curves:[{fn:m.i, colorVar:"--blue", label:"i_C(t)"}],
                hlines:[{y:s.Ilim, colorVar:"--red", label:"+I max"},{y:-s.Ilim, colorVar:"--red", label:"−I max"}] },
              { title:"p(t) = u·i — puissance (W) : > 0 le condensateur se charge, < 0 il se décharge", includeZero:true,
                curves:[{fn:m.p, colorVar:"--orange", label:"p(t)"}] }
            ],
            anim:function(t){ return { i:m.i(t), iMax:iPeak, u:m.u(t), uMax:s.Umax, iLim:s.Ilim, p:m.p(t), flowPx:(m.u(t)/s.Umax)*900 }; },
            statsDef:[["u","u_C(t) tension"],["dudt","du/dt (pente de u)"],["i","i_C = C·du/dt"],["p","p = u·i"],["w","énergie ½·C·u²"]],
            stats:function(t){ return { u:f(m.u(t),1)+" V", dudt:f(m.dudt(t),0)+" V/s", i:f(m.i(t),2)+" A", p:f(m.p(t),0)+" W", w:f(m.energy(t),2)+" J" }; },
            formulas:[
              {label:"Loi du condensateur", expr:"i_C = C · du/dt   (C = "+f(s.C,0)+" µF = "+C.toExponential(2).replace(".",",")+" F)"},
              {label:"Montée : rampe de tension", expr:"du/dt = U_max / t_m = "+f(s.Umax,0)+" / "+f(tr,4)+" = "+f(m.dudtRise,0)+" V/s  →  i_C = C × du/dt = "+f(m.iRise,1)+" A"},
              {label:"Palier : tension constante", expr:"du/dt = 0  →  i_C = 0 A (le condensateur bloque le continu)"},
              {label:"Décharge", expr:"du/dt = −U_max / t_d = "+f(m.dudtFall,0)+" V/s  →  i_C = "+f(m.iFall,1)+" A"},
              {label:"Énergie stockée", expr:"W = ½ · C · U_max² = "+f(m.energyMax,2)+" J"}
            ],
            warnings: over
              ? [{text:"Courant d'appel : |i_C| = "+f(iPeak,0)+" A > I_max = "+f(s.Ilim,0)+" A. Charger "+f(s.C,0)+" µF à "+f(s.Umax,0)+" V en "+f(s.tRise,1)+" ms impose une dérivée énorme. Remède : résistance de précharge, démarrage progressif (soft-start), ou allonger t_m."}]
              : [{ok:true, text:"|i_C| ≤ I_max : la dérivée de la tension reste supportable (charge "+f(m.iRise,1)+" A, décharge "+f(m.iFall,1)+" A)."}],
            explain:[
              {title:"Observation", body:"L'alimentation fait monter la tension du condensateur de 0 à "+f(s.Umax,0)+" V en "+f(s.tRise,1)+" ms, la maintient, puis le décharge en "+f(s.tFall,1)+" ms. Le courant ne circule que quand la tension VARIE."},
              {title:"Grandeur recherchée", body:"Le courant dans le condensateur. Il ne dépend pas de la tension elle-même mais de sa vitesse de variation du/dt : la pente de la courbe verte."},
              {title:"Modèle", body:"Loi du condensateur : i_C = C · du/dt. Le courant EST la dérivée de la tension, multipliée par C. (C'est la loi duale de la bobine.)"},
              {title:"Formule", body:["Sur la rampe (fonction affine) : du/dt = ",{t:"U_max",c:"num"}," / ",{t:"t_m",c:"den"},"   puis   i_C = C × du/dt"]},
              {title:"Application numérique", body:["du/dt = ",{t:f(s.Umax,0)+" V",c:"num"}," / ",{t:f(tr,4)+" s",c:"den"}," = ",{t:f(m.dudtRise,0)+" V/s",c:"res"},"  →  i_C = "+C.toExponential(2).replace(".",",")+" × "+f(m.dudtRise,0)+" = ",{t:f(m.iRise,1)+" A",c:over?"warn":"res"}]},
              {title:"Résultat", body:[{t: over ? "i_C > I_max : courant d'appel" : "i_C ≤ I_max", c: over ? "warn" : "res"},". Plus la montée est rapide, plus la dérivée est grande, plus le courant d'appel est violent (fusibles, contacts, diodes du pont)."]},
              {title:"Interprétation professionnelle", body:"À la mise sous tension d'un variateur, les condensateurs du bus continu sont déchargés : sans précharge, du/dt serait énorme et le courant d'appel détruirait le pont redresseur. La résistance de précharge (court-circuitée ensuite par un contacteur) allonge t_m : elle limite la dérivée."}
            ]
          };
        }
      }
    ];

    return MC.components.SituationScene(container, {
      title:"Rampes et dérivée : variateur, bobine, condensateur",
      legend:[
        ["--green","grandeur qui suit la rampe : vitesse n, courant i, tension u"],
        ["--blue","sa dérivée : accélération α, tension u_L = L·di/dt, courant i_C = C·du/dt"],
        ["--orange","dérivée seconde ou puissance : à-coup j = α′, p = u·i"],
        ["--red","curseur temporel, cassure, seuil, alerte"]
      ],
      reflexHtml:'<span><b>JE VOIS</b> une rampe (segment de droite) puis un palier</span>'+
        '<span><b>JE PENSE</b> dérivée d\'une fonction affine = coefficient directeur ; dérivée d\'une constante = 0</span>'+
        '<span><b>JE FAIS</b> pente = Δ(grandeur) / Δt, puis je multiplie par L, C ou J</span>'+
        '<span><b>JE VÉRIFIE</b> cassure = saut de la dérivée = choc, surtension ou courant d\'appel</span>',
      situations:situations
    });
  };
})();
