(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.TimeCursor = function(container, engine, opts){
    opts=opts||{};
    var wrap=document.createElement("div"); wrap.className="mc-timecursor";

    function btn(txt,cls,title){
      var b=document.createElement("button"); b.type="button"; b.className=cls; b.textContent=txt; if(title) b.title=title;
      return b;
    }
    var btnReset=btn("⏮","mc-btn","Retour au début");
    var btnStepBack=btn("⏴ pas","mc-btn mc-step-back","Pas à pas arrière (←)");
    var btnPlay=btn("▶ Lecture","mc-btn primary","Lecture / pause (Espace)");
    var btnStepFwd=btn("pas ⏵","mc-btn mc-step-fwd","Pas à pas avant (→)");
    var formatTime = opts.formatTime || function(t){ return "t = "+MC.core.units.fmt(t*1000,1)+" ms"; };
    var row1=document.createElement("div"); row1.className="mc-row";
    [btnReset,btnStepBack,btnPlay,btnStepFwd].forEach(function(b){ row1.appendChild(b); });

    var speedRow=document.createElement("div"); speedRow.className="mc-row mc-speeds";
    [0.25,0.5,1,2].forEach(function(sp){
      var b=document.createElement("button"); b.type="button"; b.textContent="×"+String(sp).replace(".",",");
      if(sp===engine.speed) b.className="active";
      b.addEventListener("click", function(){
        engine.speed=sp;
        Array.prototype.forEach.call(speedRow.children,function(x){ x.classList.remove("active"); });
        b.classList.add("active");
      });
      speedRow.appendChild(b);
    });

    var slider=document.createElement("input"); slider.type="range"; slider.setAttribute("aria-label","Curseur temporel");
    slider.min=0; slider.max=engine.period; slider.step=engine.period/1000; slider.value=engine.t;
    var lbl=document.createElement("div"); lbl.className="mc-timelabel";

    wrap.appendChild(row1); wrap.appendChild(speedRow); wrap.appendChild(lbl); wrap.appendChild(slider);
    container.appendChild(wrap);

    var dragging=false;
    function syncPlayBtn(){ btnPlay.textContent = engine.playing ? "⏸ Pause" : "▶ Lecture"; }
    function syncSlider(t){
      slider.max=engine.period;
      slider.step=engine.period/1000;
      if(!dragging) slider.value=t;
      lbl.textContent = formatTime(t);
    }

    slider.addEventListener("pointerdown", function(){ dragging=true; engine.pause(); syncPlayBtn(); });
    slider.addEventListener("pointerup", function(){ dragging=false; });
    slider.addEventListener("input", function(){ engine.setT(parseFloat(slider.value)); });
    btnPlay.addEventListener("click", function(){ engine.toggle(); syncPlayBtn(); });
    btnReset.addEventListener("click", function(){ engine.reset(); syncPlayBtn(); });
    btnStepBack.addEventListener("click", function(){ engine.step(-1, opts.stepSize); syncPlayBtn(); });
    btnStepFwd.addEventListener("click", function(){ engine.step(1, opts.stepSize); syncPlayBtn(); });

    engine.onChange = function(t){
      syncSlider(t);
      syncPlayBtn();
      if(opts.onTick) opts.onTick(t);
    };
    syncSlider(engine.t);

    return { syncPlayBtn:syncPlayBtn, el:wrap };
  };
})();
