(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.scenes = MC.scenes || {};

  MC.scenes.dephasagePuissances = function(container){
    var U=MC.core.units, E=MC.core.electrical;
    container.innerHTML="";
    var root=document.createElement("div"); root.className="mc-scene";
    container.appendChild(root);

    var header=document.createElement("div"); header.className="mc-scene-header";
    var h2=document.createElement("h2"); h2.textContent="Déphasage tension/courant et triangle des puissances";
    var hint=document.createElement("p"); hint.className="mc-hint";
    hint.textContent="Une charge (moteur, luminaire, chauffage…) impose un déphasage φ entre la tension et le courant. Modifiez U, I, f et φ : sinusoïdes, vecteurs de Fresnel, cos φ et triangle des puissances se mettent à jour ensemble.";
    header.appendChild(h2); header.appendChild(hint);
    root.appendChild(header);

    var legend=document.createElement("div"); legend.className="mc-legend";
    legend.innerHTML =
      '<span><i style="background:var(--blue)"></i>U tension</span>'+
      '<span><i style="background:var(--green)"></i>I courant</span>'+
      '<span><i style="background:var(--orange)"></i>P active / φ</span>'+
      '<span><i style="background:var(--red)"></i>Q réactive</span>';
    root.appendChild(legend);

    var grid=document.createElement("div"); grid.className="mc-scene-grid";
    root.appendChild(grid);
    var colLeft=document.createElement("div"); colLeft.className="mc-scene-col";
    var colRight=document.createElement("div"); colRight.className="mc-scene-col mc-scene-side";
    grid.appendChild(colLeft); grid.appendChild(colRight);

    var box=MC.components.layout.box;

    var circuitBox=box("Circuit");
    var waveBox=box("u(t) et i(t) — amplitudes normalisées pour comparer les phases");
    var lowerGrid=document.createElement("div"); lowerGrid.className="mc-scene-lower";
    var fresnelBox=box("Diagramme de Fresnel (vecteurs tournants)");
    var triBox=box("Triangle des puissances");
    colLeft.appendChild(circuitBox.el);
    colLeft.appendChild(waveBox.el);
    colLeft.appendChild(lowerGrid);
    lowerGrid.appendChild(fresnelBox.el);
    lowerGrid.appendChild(triBox.el);

    var paramsBox=box("Paramètres");
    var timeBox=box("Curseur temporel");
    var statsBox=box("Valeurs");
    var formulaBox=box("Formules");
    [paramsBox,timeBox,statsBox,formulaBox].forEach(function(b){ colRight.appendChild(b.el); });

    var state={ U:230, I:10, f:50, phiDeg:30 };
    function period(){ return 2/state.f; }

    var engine=MC.core.animation.register(new MC.core.animation.TimeEngine({period:period(), loop:true, speed:1, timeScale:0.005}));

    var wave=MC.components.SineWave(waveBox.mount,{
      period:period,
      xLabel:"t",
      fixedYDomain:{min:-1.25,max:1.25},
      curves:[
        { fn:function(t){ return E.instU(state.U,state.f,t,0)/(state.U*Math.SQRT2); }, colorVar:"--blue", label:"u(t)" },
        { fn:function(t){ return E.instI(state.I,state.f,t,-U.deg2rad(state.phiDeg))/(state.I*Math.SQRT2); }, colorVar:"--green", label:"i(t)" }
      ]
    });
    var fresnel=MC.components.PhasorDiagram(fresnelBox.mount,{size:230});
    var tri=MC.components.PowerTriangle(triBox.mount,{width:300,height:230});
    var formulaPanel=MC.components.FormulaPanel(formulaBox.mount);
    var circuit=MC.components.CircuitDiagram(circuitBox.mount,{width:420,height:170});

    var statNodes={};
    var statLabels=[["u","u(t) instantanée"],["i","i(t) instantanée"],["cosphi","cos φ (facteur de puissance)"],["P","P active"],["Q","Q réactive"],["S","S apparente"]];
    statLabels.forEach(function(pair){
      var row=document.createElement("div"); row.className="mc-stat";
      var k=document.createElement("span"); k.className="mc-k"; k.textContent=pair[1];
      var v=document.createElement("span"); v.className="mc-v";
      row.appendChild(k); row.appendChild(v);
      statsBox.mount.appendChild(row);
      statNodes[pair[0]]=v;
    });

    MC.components.ParameterSlider(paramsBox.mount,{ label:"Tension efficace U", min:10, max:400, step:1, value:state.U, unit:"V", decimals:0,
      onChange:function(v){ state.U=v; refreshStatic(); } });
    MC.components.ParameterSlider(paramsBox.mount,{ label:"Courant efficace I", min:0.5, max:50, step:0.1, value:state.I, unit:"A", decimals:1,
      onChange:function(v){ state.I=v; refreshStatic(); } });
    MC.components.ParameterSlider(paramsBox.mount,{ label:"Fréquence f", min:10, max:100, step:1, value:state.f, unit:"Hz", decimals:0,
      onChange:function(v){ state.f=v; engine.period=period(); wave.refreshRange(); engine.reset(); } });
    MC.components.ParameterSlider(paramsBox.mount,{ label:"Déphasage φ (retard de I sur U)", min:-90, max:90, step:1, value:state.phiDeg, unit:"°", decimals:0,
      onChange:function(v){ state.phiDeg=v; refreshStatic(); } });

    MC.components.TimeCursor(timeBox.mount, engine, { onTick:renderTime });

    function computeStatic(){
      var phiRad=U.deg2rad(state.phiDeg);
      return { phiRad:phiRad, pw:E.powers(state.U,state.I,phiRad) };
    }

    function refreshStatic(){
      var calc=computeStatic(), pw=calc.pw;
      tri.render({ P:pw.P, Q:pw.Q, S:pw.S, colorP:"--orange", colorQ:"--red", colorS:"--ink" });
      formulaPanel.render([
        { label:"cos φ", expr:"cos("+U.fmt(state.phiDeg,0)+"°) = "+U.fmt(pw.cosPhi,3) },
        { label:"P = U · I · cos φ", expr:U.fmt(state.U,0)+" × "+U.fmt(state.I,1)+" × "+U.fmt(pw.cosPhi,3)+" = "+U.fmt(pw.P,0)+" W" },
        { label:"Q = U · I · sin φ", expr:U.fmt(state.U,0)+" × "+U.fmt(state.I,1)+" × "+U.fmt(pw.sinPhi,3)+" = "+U.fmt(pw.Q,0)+" var" },
        { label:"S = U · I", expr:U.fmt(state.U,0)+" × "+U.fmt(state.I,1)+" = "+U.fmt(pw.S,0)+" VA" },
        { label:"Vérification S² = P² + Q²", expr:U.fmt(pw.S*pw.S,0)+" = "+U.fmt(pw.P*pw.P,0)+" + "+U.fmt(pw.Q*pw.Q,0) },
        { label:"Lecture pro", expr: pw.Q>1e-6 ? "Charge inductive (moteur, bobine) : Q consommée" : (pw.Q<-1e-6 ? "Charge capacitive (condensateurs) : Q fournie" : "Charge résistive : Q = 0, cos φ = 1") }
      ]);
      statNodes.cosphi.textContent=U.fmt(pw.cosPhi,3);
      statNodes.P.textContent=U.fmt(pw.P,0)+" W";
      statNodes.Q.textContent=U.fmt(pw.Q,0)+" var";
      statNodes.S.textContent=U.fmt(pw.S,0)+" VA";
      renderTime(engine.t, calc);
    }

    function renderTime(t, calc){
      calc=calc||computeStatic();
      wave.render(t);
      var w=E.omega(state.f);
      fresnel.render({
        angleU:w*t, angleI:w*t-calc.phiRad,
        IampNorm:U.clamp(0.4+0.5*(state.I/50),0.4,0.9),
        colorU:"--blue", colorI:"--green"
      });
      var uInst=E.instU(state.U,state.f,t,0);
      var iInst=E.instI(state.I,state.f,t,-calc.phiRad);
      circuit.render({ colorFlowVar:"--green", iInst:iInst, iMax:state.I*Math.SQRT2, phase:(t/period())%1,
        label:"Charge — cos φ = "+U.fmt(calc.pw.cosPhi,2) });
      statNodes.u.textContent=U.fmt(uInst,0)+" V";
      statNodes.i.textContent=U.fmt(iInst,2)+" A";
    }

    refreshStatic();

    return { destroy:function(){ MC.core.animation.unregister(engine); wave.destroy(); } };
  };
})();
