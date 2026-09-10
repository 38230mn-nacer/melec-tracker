(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Révélation progressive : Observation → grandeur → modèle → formule → application → résultat → interprétation.
  // Un corps d'étape peut être une chaîne ou une liste de segments {t:texte, c:"num"|"den"|"res"|"warn"}
  // pour mettre en évidence les parties d'une formule.
  MC.components.ExplainPanel = function(container){
    var wrap=document.createElement("div"); wrap.className="mc-explain";
    var bar=document.createElement("div"); bar.className="mc-explain-bar";
    function btn(txt,title,cls){ var b=document.createElement("button"); b.type="button"; b.className="mc-btn"+(cls?" "+cls:""); b.textContent=txt; b.title=title; return b; }
    var bReset=btn("⏮","Revenir à la première étape");
    var bPrev=btn("◀","Étape précédente");
    var bNext=btn("Étape suivante ▶","Révéler l'étape suivante","primary mc-explain-next");
    var bAll=btn("Tout","Afficher toutes les étapes");
    var count=document.createElement("span"); count.className="mc-explain-count";
    [bReset,bPrev,bNext,bAll,count].forEach(function(b){ bar.appendChild(b); });
    var list=document.createElement("div"); list.className="mc-explain-list";
    wrap.appendChild(bar); wrap.appendChild(list);
    container.appendChild(wrap);

    var steps=[], idx=0;

    function segment(seg){
      if(typeof seg==="string") return document.createTextNode(seg);
      var s=document.createElement("span"); s.className=seg.c||""; s.textContent=seg.t;
      return s;
    }

    function draw(){
      list.innerHTML="";
      steps.forEach(function(st,i){
        if(i>idx) return;
        var d=document.createElement("div"); d.className="mc-explain-step"+(i===idx?" current":"");
        var h=document.createElement("h4"); h.textContent=(i+1)+". "+st.title;
        var body=document.createElement("div");
        var segs = Array.isArray(st.body) ? st.body : [st.body];
        segs.forEach(function(seg){ body.appendChild(segment(seg)); });
        d.appendChild(h); d.appendChild(body);
        list.appendChild(d);
      });
      count.textContent=steps.length ? (idx+1)+" / "+steps.length : "";
      bNext.disabled = idx>=steps.length-1;
      bPrev.disabled = idx<=0;
    }

    bReset.addEventListener("click", function(){ idx=0; draw(); });
    bPrev.addEventListener("click", function(){ if(idx>0){ idx--; draw(); } });
    bNext.addEventListener("click", function(){ if(idx<steps.length-1){ idx++; draw(); } });
    bAll.addEventListener("click", function(){ idx=Math.max(0,steps.length-1); draw(); });

    return {
      render:function(newSteps){ steps=newSteps||[]; if(idx>steps.length-1) idx=Math.max(0,steps.length-1); draw(); },
      reset:function(){ idx=0; draw(); },
      next:function(){ bNext.click(); },
      el:wrap
    };
  };
})();
