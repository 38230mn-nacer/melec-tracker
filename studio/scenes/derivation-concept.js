(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.scenes = MC.scenes || {};

  // Scène : le concept de dérivée. Sécante → tangente (h → 0 piloté par le curseur temporel),
  // nombre dérivé, fonction dérivée, tableau de convergence et tableau de variations.
  MC.scenes.derivationConcept = function(container){
    var U=MC.core.units, K=MC.core.calculus, L=MC.components.layout, f=U.fmt;
    var H_MIN=0.01, PERIOD=3;

    var presets=[
      { lvl:"Bac Pro", name:"f(x) = x²", fTxt:"f(x) = x²", dfTxt:"f′(x) = 2x",
        f:function(x){ return x*x; }, df:function(x){ return 2*x; },
        domain:{xmin:-3,xmax:3,ymin:-1.5,ymax:9.5,xstep:1,ystep:2}, dfDomain:{ymin:-7,ymax:7,ystep:2}, x0:1, h0:1.5 },
      { lvl:"Bac Pro", name:"f(x) = 0,5x² − 2x + 1", fTxt:"f(x) = 0,5x² − 2x + 1", dfTxt:"f′(x) = x − 2",
        f:function(x){ return 0.5*x*x-2*x+1; }, df:function(x){ return x-2; },
        domain:{xmin:-2,xmax:6,ymin:-2.5,ymax:8,xstep:1,ystep:2}, dfDomain:{ymin:-5,ymax:5,ystep:2}, x0:0.5, h0:1.5 },
      { lvl:"Bac Pro", name:"f(x) = x³ − 3x", fTxt:"f(x) = x³ − 3x", dfTxt:"f′(x) = 3x² − 3",
        f:function(x){ return x*x*x-3*x; }, df:function(x){ return 3*x*x-3; },
        domain:{xmin:-2.5,xmax:2.5,ymin:-5,ymax:5,xstep:1,ystep:2}, dfDomain:{ymin:-4,ymax:17,ystep:4}, x0:0.4, h0:1 },
      { lvl:"Bac Pro", name:"f(x) = 1/x", fTxt:"f(x) = 1/x  (x > 0)", dfTxt:"f′(x) = −1/x²",
        f:function(x){ return 1/x; }, df:function(x){ return -1/(x*x); },
        domain:{xmin:0.2,xmax:5,ymin:-0.5,ymax:5.5,xstep:1,ystep:1}, dfDomain:{ymin:-6,ymax:1,ystep:1}, x0:1, h0:1.5 },
      { lvl:"Bac Pro", name:"f(x) = √x", fTxt:"f(x) = √x  (x ≥ 0)", dfTxt:"f′(x) = 1 / (2√x)",
        f:function(x){ return x<0?NaN:Math.sqrt(x); }, df:function(x){ return x<=0?Infinity:1/(2*Math.sqrt(x)); },
        domain:{xmin:0,xmax:9,ymin:-0.5,ymax:3.5,xstep:1,ystep:1}, dfDomain:{ymin:-0.3,ymax:2.2,ystep:0.5}, x0:1, h0:2 },
      { lvl:"BTS", name:"f(x) = sin x", fTxt:"f(x) = sin x", dfTxt:"f′(x) = cos x",
        f:Math.sin, df:Math.cos,
        domain:{xmin:-6.5,xmax:6.5,ymin:-1.6,ymax:1.6,xstep:1,ystep:0.5}, dfDomain:{ymin:-1.6,ymax:1.6,ystep:0.5}, x0:0.5, h0:1.5 },
      { lvl:"BTS", name:"f(x) = e^(−x/2)", fTxt:"f(x) = e^(−x/2)", dfTxt:"f′(x) = −0,5 · e^(−x/2)",
        f:function(x){ return Math.exp(-x/2); }, df:function(x){ return -0.5*Math.exp(-x/2); },
        domain:{xmin:-1,xmax:6,ymin:-0.5,ymax:3,xstep:1,ystep:0.5}, dfDomain:{ymin:-1,ymax:0.3,ystep:0.25}, x0:0.5, h0:1.5 },
      { lvl:"BTS", name:"f(x) = x · e^(−x)", fTxt:"f(x) = x · e^(−x)", dfTxt:"f′(x) = (1 − x) · e^(−x)",
        f:function(x){ return x*Math.exp(-x); }, df:function(x){ return (1-x)*Math.exp(-x); },
        domain:{xmin:-0.5,xmax:5,ymin:-0.6,ymax:0.7,xstep:1,ystep:0.2}, dfDomain:{ymin:-1.4,ymax:1.4,ystep:0.5}, x0:0.3, h0:1.2 }
    ];

    container.innerHTML="";
    var root=document.createElement("div"); root.className="mc-scene";
    container.appendChild(root);
    L.header(root, "Dérivation : le concept — nombre dérivé, tangente, fonction dérivée, variations",
      "Choisissez une fonction, déplacez le point A (glisser sur le graphe ou curseur x₀). Le curseur temporel fait tendre h vers 0 : la sécante (AB) devient la tangente en A, et sa pente est le nombre dérivé f′(x₀). En dessous : la courbe de f′, la convergence du taux de variation et le tableau de variations.");
    L.legend(root, [
      ["--green","f : la fonction (position, charge, flux…)"],
      ["--orange","sécante (AB) : taux de variation moyen entre x₀ et x₀ + h"],
      ["--blue","tangente en A et f′ : nombre dérivé = pente = vitesse instantanée"],
      ["--red","f′ négative : f décroissante"]
    ]);
    var reflex=document.createElement("div"); reflex.className="mc-reflex";
    reflex.innerHTML='<span><b>JE VOIS</b> une pente qui change le long de la courbe</span>'+
      '<span><b>JE PENSE</b> dérivée = pente de la tangente = limite du taux de variation</span>'+
      '<span><b>JE FAIS</b> [f(x₀+h) − f(x₀)] / h avec h → 0, ou la formule de f′</span>'+
      '<span><b>JE VÉRIFIE</b> signe de f′ ⇔ sens de variation ; f′ = 0 ⇔ extremum</span>';
    root.appendChild(reflex);

    var presetBar=document.createElement("div"); presetBar.className="mc-situations"; presetBar.setAttribute("aria-label","Fonction");
    root.appendChild(presetBar);

    var grid=document.createElement("div"); grid.className="mc-scene-grid"; root.appendChild(grid);
    var colLeft=document.createElement("div"); colLeft.className="mc-scene-col";
    var colRight=document.createElement("div"); colRight.className="mc-scene-col mc-scene-side";
    grid.appendChild(colLeft); grid.appendChild(colRight);

    var fBox=L.box("Courbe de f — sécante (AB) puis tangente en A"), dfBox=L.box("Courbe de f′ — le nombre dérivé se lit sur la courbe de la fonction dérivée");
    var tauxBox=L.box("Le taux de variation quand h → 0"), varBox=L.box("Tableau de variations (généré à partir du signe de f′)");
    var explainBox=L.box("Expliquer pas à pas (touche E : étape suivante)");
    [fBox,dfBox,tauxBox,varBox,explainBox].forEach(function(b){ colLeft.appendChild(b.el); });
    var paramsBox=L.box("Point A"), timeBox=L.box("Curseur : h → 0 (sécante → tangente)"), statsBox=L.box("Valeurs"), formulaBox=L.box("Formules et application numérique");
    [paramsBox,timeBox,statsBox,formulaBox].forEach(function(b){ colRight.appendChild(b.el); });

    var state={ idx:0, x0:1 };
    var preset=presets[0];
    var engine=MC.core.animation.register(new MC.core.animation.TimeEngine({period:PERIOD, loop:false, speed:1, timeScale:1}));

    function hOf(t){
      var h0=preset.h0;
      var h=h0*Math.pow(H_MIN/h0, U.clamp(t/PERIOD,0,1));
      var room=preset.domain.xmax-state.x0-0.02;
      return Math.max(H_MIN, Math.min(h, room));
    }
    function revealed(t){ return t>=PERIOD-1e-9; }

    MC.components.TimeCursor(timeBox.mount, engine, {
      onTick:renderAll, stepSize:0.15,
      formatTime:function(t){ return "h = "+f(hOf(t),3)+(revealed(t) ? "  →  tangente" : ""); }
    });

    var fGraph=MC.components.FunctionGraph(fBox.mount, { domain:preset.domain, className:"mc-canvas-lg", ariaLabel:"Courbe de f",
      onDrag:function(x){ setX0(x); } });
    var dfGraph=MC.components.FunctionGraph(dfBox.mount, { domain:dfDomainOf(preset), className:"mc-canvas-md", ariaLabel:"Courbe de f′" });
    var tauxTable=document.createElement("table"); tauxTable.className="mc-tauxtable"; tauxBox.mount.appendChild(tauxTable);
    var varTable=MC.components.VariationTable(varBox.mount);
    var formulaPanel=MC.components.FormulaPanel(formulaBox.mount);
    var explain=MC.components.ExplainPanel(explainBox.mount);
    var stats=L.stats(statsBox.mount, [["f0","f(x₀)"],["f1","f(x₀ + h)"],["taux","taux de variation (pente de AB)"],["d","f′(x₀) nombre dérivé"],["tan","tangente en A"],["sens","en x₀, f est…"]]);
    var slider=null, vt=null;

    function dfDomainOf(p){
      return { xmin:p.domain.xmin, xmax:p.domain.xmax, ymin:p.dfDomain.ymin, ymax:p.dfDomain.ymax, xstep:p.domain.xstep, ystep:p.dfDomain.ystep };
    }
    function x0Bounds(){ return { min:preset.domain.xmin+0.1, max:preset.domain.xmax-0.4 }; }

    function setX0(x){
      var b=x0Bounds();
      state.x0=U.clamp(x, b.min, b.max);
      if(slider) slider.set(state.x0);
      renderAll(engine.t);
    }

    function selectPreset(i){
      state.idx=i; preset=presets[i];
      Array.prototype.forEach.call(presetBar.children, function(b,j){
        b.classList.toggle("active", j===i);
        b.setAttribute("aria-pressed", j===i ? "true" : "false");
      });
      fGraph.setDomain(preset.domain);
      dfGraph.setDomain(dfDomainOf(preset));
      var b=x0Bounds();
      state.x0=U.clamp(preset.x0, b.min, b.max);
      paramsBox.mount.innerHTML="";
      slider=MC.components.ParameterSlider(paramsBox.mount, { label:"Abscisse x₀ du point A", min:b.min, max:b.max, step:0.01, value:state.x0, unit:"", decimals:2,
        onChange:function(v){ state.x0=v; renderAll(engine.t); } });
      vt=K.variationTable(preset.f, preset.df, preset.domain.xmin, preset.domain.xmax);
      varTable.render(vt, { dfLabel:"signe de f′(x)", fLabel:"variations de f" });
      explain.reset();
      engine.reset();
    }

    function sensText(d){
      if(Math.abs(d)<1e-3) return "extremum possible (f′ = 0, tangente horizontale)";
      return d>0 ? "croissante (f′ > 0)" : "décroissante (f′ < 0)";
    }

    function renderTaux(x0, d){
      var hs=[1,0.5,0.1,0.01,0.001];
      var html='<tr><th>h</th><th>x₀ + h</th><th>f(x₀ + h)</th><th>[f(x₀ + h) − f(x₀)] / h</th></tr>';
      hs.forEach(function(h){
        var y1=preset.f(x0+h);
        var taux=isFinite(y1) ? K.secantSlope(preset.f,x0,h) : NaN;
        html+='<tr><td>'+f(h,3)+'</td><td>'+f(x0+h,3)+'</td><td>'+f(y1,4)+'</td><td>'+f(taux,4)+'</td></tr>';
      });
      html+='<tr class="lim"><td>h → 0</td><td>x₀</td><td>f(x₀) = '+f(preset.f(x0),4)+'</td><td>f′(x₀) = '+f(d,4)+'</td></tr>';
      tauxTable.innerHTML=html;
    }

    function renderAll(t){
      var x0=state.x0, h=hOf(t), rev=revealed(t);
      var y0=preset.f(x0), y1=preset.f(x0+h);
      var taux=K.secantSlope(preset.f,x0,h);
      var d=preset.df(x0);
      var tg=K.tangent(preset.f,preset.df,x0);
      var bS=y0-taux*x0;

      var curves=[{fn:preset.f, colorVar:"--green", width:3.2}];
      var points=[{x:x0,y:y0,colorVar:"--green",label:"A"}];
      var vlines=[{x:x0,colorVar:"--muted"}];
      var texts=[];
      if(!rev){
        curves.push({fn:function(x){ return taux*x+bS; }, colorVar:"--orange", width:2.4, dash:[7,5]});
        points.push({x:x0+h,y:y1,colorVar:"--orange",label:"B"});
        vlines.push({x:x0+h,colorVar:"--muted"});
        texts.push({text:"pente (AB) = "+f(taux,3)+"   (h = "+f(h,3)+")", colorVar:"--orange"});
      }
      if(rev || h<0.05){
        curves.push({fn:function(x){ return tg.m*x+tg.b; }, colorVar:"--blue", width:3});
        texts.push({text:"tangente : y = "+f(tg.m,2)+" x "+(tg.b>=0?"+ ":"− ")+f(Math.abs(tg.b),2)+"   pente f′(x₀) = "+f(d,3), colorVar:"--blue"});
      }
      fGraph.render({ curves:curves, points:points, vlines:vlines, texts:texts });

      dfGraph.render({
        bands: vt ? vt.intervals : [],
        curves:[{fn:preset.df, colorVar:"--blue", width:3}],
        points:[{x:x0, y:d, colorVar:"--blue", label:"f′(x₀)"}],
        vlines:[{x:x0,colorVar:"--muted"}],
        texts:[{text:"f′(x₀) = "+f(d,3)+"  →  f "+sensText(d), colorVar:"--blue"}]
      });

      renderTaux(x0, d);

      stats.set("f0", f(y0,3));
      stats.set("f1", f(y1,3));
      stats.set("taux", f(taux,3));
      stats.set("d", f(d,3));
      stats.set("tan", "y = "+f(tg.m,2)+" x "+(tg.b>=0?"+ ":"− ")+f(Math.abs(tg.b),2));
      stats.set("sens", sensText(d));

      formulaPanel.render([
        {label:"Fonction et fonction dérivée", expr:preset.fTxt+"      "+preset.dfTxt},
        {label:"Taux de variation entre x₀ et x₀ + h (pente de la sécante AB)", expr:"[f(x₀+h) − f(x₀)] / h = ("+f(y1,3)+" − "+f(y0,3)+") / "+f(h,3)+" = "+f(taux,3)},
        {label:"Nombre dérivé = limite du taux quand h → 0", expr:"f′("+f(x0,2)+") = "+f(d,3)},
        {label:"Équation de la tangente en A", expr:"y = f′(x₀)·(x − x₀) + f(x₀) = "+f(d,2)+"·(x − "+f(x0,2)+") + "+f(y0,2)+"  ⇒  y = "+f(tg.m,2)+" x "+(tg.b>=0?"+ ":"− ")+f(Math.abs(tg.b),2)},
        {label:"Signe de f′ et variations", expr:"f′(x₀) "+(d>1e-3?"> 0 ⇒ f croissante":(d<-1e-3?"< 0 ⇒ f décroissante":"= 0 ⇒ tangente horizontale, extremum possible"))+" au voisinage de x₀"}
      ]);

      explain.render([
        {title:"Observation", body:"La courbe de "+preset.fTxt+" monte ou descend plus ou moins vite : la pente n'est pas la même partout. Au point A (x₀ = "+f(x0,2)+"), on veut mesurer cette pente."},
        {title:"Grandeur recherchée", body:"La pente de la courbe en A. Problème : une pente se calcule entre DEUX points, et on n'en a qu'un."},
        {title:"Modèle", body:"On prend un second point B d'abscisse x₀ + h et on calcule la pente de la sécante (AB) : le taux de variation. Puis on rapproche B de A en faisant tendre h vers 0 (curseur temporel)."},
        {title:"Formule", body:["taux de variation = ",{t:"f(x₀+h) − f(x₀)",c:"num"}," / ",{t:"h",c:"den"},"   ;   nombre dérivé f′(x₀) = limite de ce taux quand h → 0 = pente de la tangente en A"]},
        {title:"Application numérique", body:["avec h = "+f(h,3)+" : (",{t:f(y1,3)+" − "+f(y0,3),c:"num"},") / ",{t:f(h,3),c:"den"}," = ",{t:f(taux,3),c:"res"},"   ;   par la formule "+preset.dfTxt+" : f′("+f(x0,2)+") = ",{t:f(d,3),c:"res"}]},
        {title:"Résultat", body:["Tangente en A : y = f′(x₀)·(x − x₀) + f(x₀) = ",{t:"y = "+f(tg.m,2)+" x "+(tg.b>=0?"+ ":"− ")+f(Math.abs(tg.b),2),c:"res"},". Signe de f′(x₀) : f est ",{t:sensText(d),c:d<-1e-3?"warn":"res"},"."]},
        {title:"Interprétation", body:"Le signe de f′ donne le sens de variation (tableau ci-dessus) ; f′ = 0 signale un extremum. En physique c'est la même dérivée : position x(t) → vitesse v = x′ ; charge q(t) → courant i = q′ ; flux Φ(t) → f.é.m. e = −Φ′. Voir les scènes « Rampes » et « Électromécanique »."}
      ]);
    }

    presets.forEach(function(p,i){
      var b=document.createElement("button"); b.type="button";
      b.innerHTML='<span class="mc-lvl">'+p.lvl+'</span> '+p.name;
      b.addEventListener("click", function(){ selectPreset(i); });
      presetBar.appendChild(b);
    });
    selectPreset(0);

    return { destroy:function(){
      MC.core.animation.unregister(engine);
      fGraph.destroy(); dfGraph.destroy();
    } };
  };
})();
