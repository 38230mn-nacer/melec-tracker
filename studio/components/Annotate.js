(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Surcouche de dessin libre par-dessus toute l'application (annoter en direct au
  // tableau blanc / vidéoprojecteur, par-dessus n'importe quelle scène ou la grille de concepts).
  // Un seul calque global, indépendant des scènes : entrer/sortir ne détruit rien en dessous.
  MC.components.Annotate = function(toggleBtn){
    var active=false, drawing=false, color="#ef4444", lastX=0, lastY=0;
    var canvas=document.createElement("canvas");
    canvas.className="mc-annotate-canvas";
    document.body.appendChild(canvas);

    var toolbar=document.createElement("div"); toolbar.className="mc-annotate-bar"; toolbar.hidden=true;
    var colors=[
      {c:"#ef4444", n:"Rouge"}, {c:"#22c55e", n:"Vert"}, {c:"#3b82f6", n:"Bleu"},
      {c:"#f97316", n:"Orange"}, {c:"#f8fafc", n:"Blanc"}
    ];
    var swatches=[];
    function setActiveSwatch(b){ swatches.forEach(function(s){ s.classList.remove("active"); }); b.classList.add("active"); }
    colors.forEach(function(cc,i){
      var b=document.createElement("button"); b.type="button"; b.className="mc-annotate-swatch";
      b.style.background=cc.c; b.title=cc.n; b.setAttribute("aria-label",cc.n);
      b.addEventListener("click", function(){ color=cc.c; setActiveSwatch(b); });
      toolbar.appendChild(b); swatches.push(b);
      if(i===0) setActiveSwatch(b);
    });
    var btnClear=document.createElement("button"); btnClear.type="button"; btnClear.className="mc-btn"; btnClear.textContent="🗑 Effacer";
    btnClear.addEventListener("click", clear);
    toolbar.appendChild(btnClear);
    var btnClose=document.createElement("button"); btnClose.type="button"; btnClose.className="mc-btn"; btnClose.textContent="✕ Fermer (A)";
    btnClose.addEventListener("click", function(){ setActive(false); });
    toolbar.appendChild(btnClose);
    document.body.appendChild(toolbar);

    var ctx=canvas.getContext("2d");
    function resize(){
      var ratio=window.devicePixelRatio||1;
      var w=window.innerWidth, h=window.innerHeight;
      canvas.width=w*ratio; canvas.height=h*ratio;
      canvas.style.width=w+"px"; canvas.style.height=h+"px";
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.lineJoin="round"; ctx.lineCap="round"; ctx.lineWidth=4;
      // Le tracé est perdu au redimensionnement (rotation, plein écran) : cas rare,
      // priorité à la simplicité plutôt qu'à la préservation du dessin.
    }
    window.addEventListener("resize", resize);
    resize();

    function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

    function pos(e){ return { x:e.clientX, y:e.clientY }; }

    canvas.addEventListener("pointerdown", function(e){
      if(!active) return;
      drawing=true;
      var p=pos(e); lastX=p.x; lastY=p.y;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function(e){
      if(!active || !drawing) return;
      var p=pos(e);
      ctx.strokeStyle=color;
      ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(p.x,p.y); ctx.stroke();
      lastX=p.x; lastY=p.y;
    });
    function stop(){ drawing=false; }
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    canvas.addEventListener("pointerleave", stop);

    function setActive(v){
      active=v;
      canvas.classList.toggle("mc-active", active);
      toolbar.hidden=!active;
      if(toggleBtn){
        toggleBtn.classList.toggle("active", active);
        toggleBtn.setAttribute("aria-pressed", active?"true":"false");
      }
    }
    function toggle(){ setActive(!active); }
    if(toggleBtn) toggleBtn.addEventListener("click", toggle);

    return { toggle:toggle, isActive:function(){ return active; }, close:function(){ setActive(false); } };
  };
})();
