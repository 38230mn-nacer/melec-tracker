(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Moteur générique d'une scène « situations » : sélecteur, réglages, animation, graphes
  // synchronisés sur un curseur temporel, valeurs, formules, alertes, explication pas à pas.
  // Une situation = { id, label, hint, anim, params:[…], time:{format, step, tickX, tickY}, build(state) → modèle }.
  // Un modèle = { T, charts:[{title, curves, hlines, vlines, includeZero}], anim(t), statsDef, stats(t), formulas, warnings, explain }.
  MC.components.SituationScene = function(container, cfg){
    var U=MC.core.units, L=MC.components.layout, f=U.fmt;
    container.innerHTML="";
    var root=document.createElement("div"); root.className="mc-scene";
    container.appendChild(root);

    var head=L.header(root, cfg.title, "");
    if(cfg.legend) L.legend(root, cfg.legend);
    if(cfg.reflexHtml){
      var reflex=document.createElement("div"); reflex.className="mc-reflex"; reflex.innerHTML=cfg.reflexHtml;
      root.appendChild(reflex);
    }

    // Barre « mode présentation » : navigation entre situations, interface épurée pour
    // vidéoprojecteur, affichage/masquage indépendant des formules et des valeurs (utile pour
    // révéler une formule au bon moment plutôt que de tout montrer d'emblée).
    var toolbar=document.createElement("div"); toolbar.className="mc-present-bar";
    function tbtn(txt,title,cls){ var b=document.createElement("button"); b.type="button"; b.className="mc-btn"+(cls?" "+cls:""); b.textContent=txt; if(title) b.title=title; return b; }
    var btnPrev=tbtn("⏮ Précédent","Situation précédente");
    var btnPresent=tbtn("🎥 Mode présentation","Interface épurée pour vidéoprojecteur (touche P)","primary mc-present-toggle");
    var btnNext=tbtn("Suivant ⏭","Situation suivante");
    var btnFormules=tbtn("👁 Formules","Afficher / masquer les formules","active");
    var btnResultats=tbtn("👁 Valeurs","Afficher / masquer les valeurs","active");
    [btnPrev,btnPresent,btnNext,btnFormules,btnResultats].forEach(function(b){ toolbar.appendChild(b); });
    root.appendChild(toolbar);

    function gotoIndex(i){ selectSituation((i+situations.length)%situations.length); }
    btnPrev.addEventListener("click", function(){ gotoIndex(currentIdx-1); });
    btnNext.addEventListener("click", function(){ gotoIndex(currentIdx+1); });
    function togglePresent(){
      presentMode=!presentMode;
      root.classList.toggle("mc-present", presentMode);
      btnPresent.classList.toggle("active", presentMode);
      btnPresent.setAttribute("aria-pressed", presentMode ? "true" : "false");
    }
    btnPresent.addEventListener("click", togglePresent);
    btnFormules.addEventListener("click", function(){
      formulaBox.el.hidden=!formulaBox.el.hidden;
      btnFormules.classList.toggle("active", !formulaBox.el.hidden);
      btnFormules.setAttribute("aria-pressed", formulaBox.el.hidden ? "false" : "true");
    });
    btnResultats.addEventListener("click", function(){
      statsBox.el.hidden=!statsBox.el.hidden;
      btnResultats.classList.toggle("active", !statsBox.el.hidden);
      btnResultats.setAttribute("aria-pressed", statsBox.el.hidden ? "false" : "true");
    });

    var sitBar=document.createElement("div"); sitBar.className="mc-situations"; sitBar.setAttribute("aria-label","Situation");
    root.appendChild(sitBar);

    var grid=document.createElement("div"); grid.className="mc-scene-grid"; root.appendChild(grid);
    var colLeft=document.createElement("div"); colLeft.className="mc-scene-col";
    var colRight=document.createElement("div"); colRight.className="mc-scene-col mc-scene-side";
    grid.appendChild(colLeft); grid.appendChild(colRight);

    var animBox=L.box("Phénomène physique");
    var warnEl=document.createElement("div"); warnEl.className="mc-warn"; animBox.el.appendChild(warnEl);
    var chartCount=cfg.chartCount||3, chartBoxes=[], k;
    for(k=0;k<chartCount;k++) chartBoxes.push(L.box(""));
    var explainBox=L.box(cfg.explainTitle||"Expliquer pas à pas (touche E : étape suivante)");
    colLeft.appendChild(animBox.el);
    chartBoxes.forEach(function(b){ colLeft.appendChild(b.el); });
    colLeft.appendChild(explainBox.el);

    var paramsBox=L.box("Réglages"), timeBox=L.box("Curseur temporel"), statsBox=L.box("Valeurs instantanées"), formulaBox=L.box("Formules et application numérique");
    [paramsBox,timeBox,statsBox,formulaBox].forEach(function(b){ colRight.appendChild(b.el); });

    var situations=cfg.situations;
    var state={}, sit=null, model=null, charts=[], mech=null, statsPanel=null, currentIdx=0, presentMode=false;

    function timeCfg(){ return (sit && sit.time) || {}; }
    var engine=MC.core.animation.register(new MC.core.animation.TimeEngine({period:5, loop:true, speed:1, timeScale:1}));
    MC.components.TimeCursor(timeBox.mount, engine, {
      onTick:renderTime,
      stepSize:function(){ var s=timeCfg().step; if(typeof s==="function") return s(model); return s || 0.1; },
      formatTime:function(t){ var tc=timeCfg(); return tc.format ? tc.format(t) : "t = "+f(t,2)+" s"; }
    });
    var formulaPanel=MC.components.FormulaPanel(formulaBox.mount);
    var explain=MC.components.ExplainPanel(explainBox.mount);

    function renderParams(){
      paramsBox.mount.innerHTML="";
      sit.params.forEach(function(p){
        if(p.choices){
          var wrap=document.createElement("div"); wrap.className="mc-param";
          var lab=document.createElement("div"); lab.className="mc-param-name"; lab.textContent=p.label; wrap.appendChild(lab);
          var row=document.createElement("div"); row.className="mc-choice"; wrap.appendChild(row);
          p.choices.forEach(function(c){
            var b=document.createElement("button"); b.type="button"; b.textContent=c.label;
            b.setAttribute("aria-pressed", state[p.key]===c.value ? "true" : "false");
            if(state[p.key]===c.value) b.className="active";
            b.addEventListener("click", function(){
              state[p.key]=c.value;
              Array.prototype.forEach.call(row.children, function(x){ x.classList.remove("active"); x.setAttribute("aria-pressed","false"); });
              b.classList.add("active"); b.setAttribute("aria-pressed","true");
              rebuildModel();
            });
            row.appendChild(b);
          });
          paramsBox.mount.appendChild(wrap);
        } else {
          MC.components.ParameterSlider(paramsBox.mount, {
            label:p.label, min:p.min, max:p.max, step:p.step, value:state[p.key], unit:p.unit, decimals:p.decimals,
            onChange:function(v){ state[p.key]=v; rebuildModel(); }
          });
        }
      });
    }

    function selectSituation(i){
      currentIdx=i;
      sit=situations[i];
      Array.prototype.forEach.call(sitBar.children, function(b,j){
        b.classList.toggle("active", j===i);
        b.setAttribute("aria-pressed", j===i ? "true" : "false");
      });
      head.hint.textContent=sit.hint||"";
      state={};
      sit.params.forEach(function(p){ state[p.key]=p.value; });
      renderParams();
      animBox.mount.innerHTML="";
      animBox.el.hidden=!sit.anim;
      mech = sit.anim ? MC.components.MechanismAnimation(animBox.mount, {kind:sit.anim, ariaLabel:sit.label}) : null;
      charts.forEach(function(ch){ ch.destroy(); });
      model=sit.build(state);
      function curveAt(kk,ci){ var ch=model.charts[kk]; return ch ? ch.curves[ci] : null; }
      function hlineAt(kk,hi){ var ch=model.charts[kk]; return ch && ch.hlines ? ch.hlines[hi] : null; }
      function vlineAt(kk,vi){ var ch=model.charts[kk]; return ch && ch.vlines ? ch.vlines[vi] : null; }
      var tc=timeCfg();
      charts=model.charts.map(function(ch,kk){
        chartBoxes[kk].el.hidden=false;
        chartBoxes[kk].title.textContent=ch.title;
        chartBoxes[kk].mount.innerHTML="";
        return MC.components.SineWave(chartBoxes[kk].mount, {
          period:function(){ return model.T; },
          className:"mc-canvas-sm", xLabel:tc.xLabel||"t (s)", includeZero:ch.includeZero,
          tickFormat:{
            x: tc.tickX || function(v){ return f(v,1); },
            y: tc.tickY || function(v){ return f(v, Math.abs(v)>=100 ? 0 : (Math.abs(v)>=10 ? 1 : 2)); }
          },
          hlines:(ch.hlines||[]).map(function(h,hi){
            return { y:function(){ var hl=hlineAt(kk,hi); return hl ? hl.y : NaN; }, colorVar:h.colorVar, label:h.label };
          }),
          vlines:(ch.vlines||[]).map(function(v,vi){
            return { x:function(){ var vl=vlineAt(kk,vi); return vl ? vl.x : NaN; }, colorVar:v.colorVar, label:v.label };
          }),
          curves:ch.curves.map(function(c,ci){
            return {
              fn:function(t){ var cc=curveAt(kk,ci); return cc ? cc.fn(t) : NaN; },
              slope: c.slope ? function(t){ var cc=curveAt(kk,ci); return cc && cc.slope ? cc.slope(t) : NaN; } : null,
              visible: c.visible ? function(){ var cc=curveAt(kk,ci); return !!(cc && cc.visible && cc.visible()); } : null,
              slopeColorVar:c.slopeColorVar, colorVar:c.colorVar, label:c.label, dash:c.dash, width:c.width
            };
          })
        });
      });
      for(k=model.charts.length;k<chartCount;k++) chartBoxes[k].el.hidden=true;
      statsPanel=L.stats(statsBox.mount, model.statsDef);
      explain.reset();
      engine.period=model.T;
      engine.loop = tc.loop!==false;
      engine.timeScale = tc.timeScale || 1;
      engine.reset();
      refreshStatic();
    }

    function rebuildModel(){
      model=sit.build(state);
      model.charts.forEach(function(ch,kk){ if(chartBoxes[kk]) chartBoxes[kk].title.textContent=ch.title; });
      charts.forEach(function(ch){ ch.refreshRange(); });
      engine.period=model.T;
      if(engine.t>model.T) engine.setT(model.T);
      refreshStatic();
    }

    function refreshStatic(){
      formulaPanel.render(model.formulas||[]);
      explain.render(model.explain||[]);
      warnEl.innerHTML="";
      (model.warnings||[]).forEach(function(w){
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
      if(mech && model.anim) mech.render(model.anim(t));
      var vals=model.stats(t);
      Object.keys(vals).forEach(function(key){ statsPanel.set(key, vals[key]); });
    }

    situations.forEach(function(s,i){
      var b=document.createElement("button"); b.type="button"; b.textContent=s.label;
      b.addEventListener("click", function(){ selectSituation(i); });
      sitBar.appendChild(b);
    });
    selectSituation(cfg.initial||0);

    return { destroy:function(){
      MC.core.animation.unregister(engine);
      charts.forEach(function(ch){ ch.destroy(); });
    } };
  };
})();
