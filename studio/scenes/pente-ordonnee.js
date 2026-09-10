(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.scenes = MC.scenes || {};

  // Scène : pente et ordonnée à l'origine d'une droite y = m·x + b.
  // Mode Libre : les curseurs m et b pilotent la droite en direct.
  // Mode Défi : une droite cible (en pointillés) est tirée au sort ; retrouver m et b par essais.
  MC.scenes.penteOrdonnee = function(container){
    var U=MC.core.units, L=MC.components.layout, f=U.fmt;
    var DOMAIN={xmin:-6,xmax:6,ymin:-7,ymax:7,xstep:1,ystep:1};

    container.innerHTML="";
    var root=document.createElement("div"); root.className="mc-scene";
    container.appendChild(root);
    L.header(root, "Pente et ordonnée à l'origine — équations de droites",
      "Une droite s'écrit y = m·x + b. Réglez m (la pente) et b (l'ordonnée à l'origine) et observez la droite verte. En mode Défi, retrouvez la droite cible (en pointillés orange) par essais successifs.");
    L.legend(root, [
      ["--green","ma droite : y = m·x + b"],
      ["--orange","droite à retrouver (mode Défi)"]
    ]);
    var reflex=document.createElement("div"); reflex.className="mc-reflex";
    reflex.innerHTML='<span><b>JE VOIS</b> une droite qui monte, descend ou reste horizontale</span>'+
      '<span><b>JE PENSE</b> m = pente (montée/descente), b = valeur de y quand x = 0</span>'+
      '<span><b>JE FAIS</b> je règle m et b, ou je les lis sur le graphique</span>'+
      '<span><b>JE VÉRIFIE</b> le point (0 ; b) est bien sur l\'axe des ordonnées ; signe de m ⇔ sens de la droite</span>';
    root.appendChild(reflex);

    var modeBar=document.createElement("div"); modeBar.className="mc-choice"; modeBar.style.margin="0 0 14px";
    root.appendChild(modeBar);

    var grid=document.createElement("div"); grid.className="mc-scene-grid"; root.appendChild(grid);
    var colLeft=document.createElement("div"); colLeft.className="mc-scene-col";
    var colRight=document.createElement("div"); colRight.className="mc-scene-col mc-scene-side";
    grid.appendChild(colLeft); grid.appendChild(colRight);

    var graphBox=L.box("y = m·x + b");
    var warnEl=document.createElement("div"); warnEl.className="mc-warn"; graphBox.el.appendChild(warnEl);
    colLeft.appendChild(graphBox.el);
    var paramsBox=L.box("Réglages"), formulaBox=L.box("Équation de la droite");
    colRight.appendChild(paramsBox.el); colRight.appendChild(formulaBox.el);

    var formulaPanel=MC.components.FormulaPanel(formulaBox.mount);
    var graph=MC.components.FunctionGraph(graphBox.mount, {domain:DOMAIN, className:"mc-canvas-lg"});

    var state={ mode:"libre", m:1, b:0, targetM:0, targetB:0 };

    function randTarget(){
      state.targetM = (Math.floor(Math.random()*9)-4)*0.5; // -2 .. 2, pas 0,5
      if(state.targetM===0) state.targetM=1;
      state.targetB = Math.floor(Math.random()*9)-4; // -4 .. 4
    }

    function buildModeBar(){
      modeBar.innerHTML="";
      [["libre","Libre"],["defi","Défi"]].forEach(function(mo){
        var b=document.createElement("button"); b.type="button"; b.textContent=mo[1];
        if(state.mode===mo[0]) b.className="active";
        b.addEventListener("click", function(){
          state.mode=mo[0];
          if(mo[0]==="defi") randTarget();
          buildModeBar(); renderParams(); refresh();
        });
        modeBar.appendChild(b);
      });
      if(state.mode==="defi"){
        var btnCheck=document.createElement("button"); btnCheck.type="button"; btnCheck.className="mc-btn primary"; btnCheck.textContent="✓ Vérifier";
        btnCheck.addEventListener("click", check);
        modeBar.appendChild(btnCheck);
        var btnNew=document.createElement("button"); btnNew.type="button"; btnNew.className="mc-btn"; btnNew.textContent="🎲 Nouveau défi";
        btnNew.addEventListener("click", function(){ randTarget(); warnEl.innerHTML=""; refresh(); });
        modeBar.appendChild(btnNew);
      }
    }

    function renderParams(){
      paramsBox.mount.innerHTML="";
      MC.components.ParameterSlider(paramsBox.mount, {
        label:"m — pente", min:-4, max:4, step:0.5, value:state.m, decimals:1,
        onChange:function(v){ state.m=v; refresh(); }
      });
      MC.components.ParameterSlider(paramsBox.mount, {
        label:"b — ordonnée à l'origine", min:-6, max:6, step:0.5, value:state.b, decimals:1,
        onChange:function(v){ state.b=v; refresh(); }
      });
    }

    function check(){
      var ok = Math.abs(state.m-state.targetM)<0.01 && Math.abs(state.b-state.targetB)<0.01;
      warnEl.innerHTML="";
      var d=document.createElement("div");
      if(ok){
        d.className="ok";
        d.textContent="✅ Correct ! y = "+f(state.m,1)+"x "+(state.b>=0?"+ ":"− ")+f(Math.abs(state.b),1);
      } else {
        var hints=[];
        if(Math.abs(state.m-state.targetM)>=0.01){
          hints.push(state.m<state.targetM ? "pente trop faible (ou négative)" : "pente trop forte (ou positive)");
        }
        if(Math.abs(state.b-state.targetB)>=0.01){
          hints.push(state.b<state.targetB ? "ordonnée à l'origine trop basse" : "ordonnée à l'origine trop haute");
        }
        d.textContent="Pas encore : "+hints.join(" ; ");
      }
      warnEl.appendChild(d);
    }

    function refresh(){
      formulaPanel.render([
        { label:"Pente (coefficient directeur)", expr:"m = "+f(state.m,1) },
        { label:"Ordonnée à l'origine", expr:"b = "+f(state.b,1) },
        { label:"Équation de la droite", expr:"y = "+f(state.m,1)+"x "+(state.b>=0?"+ ":"− ")+f(Math.abs(state.b),1) }
      ]);
      var curves=[{ fn:function(x){ return state.m*x+state.b; }, colorVar:"--green", width:3 }];
      if(state.mode==="defi"){
        curves.push({ fn:function(x){ return state.targetM*x+state.targetB; }, colorVar:"--orange", width:3, dash:[8,6] });
      }
      graph.render({
        curves:curves,
        points:[{ x:0, y:state.b, colorVar:"--green", label:"b" }]
      });
    }

    buildModeBar();
    renderParams();
    refresh();

    return { destroy:function(){ graph.destroy(); } };
  };
})();
