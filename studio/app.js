(function(){
  "use strict";

  function toggleTheme(){
    var html=document.documentElement;
    var next = html.getAttribute("data-theme")==="dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try{ localStorage.setItem("mc_studio_theme", next); }catch(e){}
  }
  (function initTheme(){
    var saved=null;
    try{ saved=localStorage.getItem("mc_studio_theme"); }catch(e){}
    if(saved) document.documentElement.setAttribute("data-theme", saved);
  })();
  document.getElementById("btnTheme").addEventListener("click", toggleTheme);

  function toggleFullscreen(){
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen().catch(function(){}); }
    else { document.exitFullscreen().catch(function(){}); }
  }
  document.getElementById("btnFull").addEventListener("click", toggleFullscreen);

  var levels={
    melec:{ label:"Bac Pro MELEC", items:MC.content.bacProMelec },
    bts:{ label:"BTS Électrotechnique", items:MC.content.btsElectrotechnique }
  };
  var levelBar=document.getElementById("levelBar");
  var grid=document.getElementById("conceptGrid");
  var stage=document.getElementById("sceneStage");
  var backBtn=document.getElementById("btnBack");
  var currentLevel="bts";
  var currentScene=null;

  function renderLevelBar(){
    levelBar.innerHTML="";
    Object.keys(levels).forEach(function(key){
      var b=document.createElement("button"); b.type="button"; b.textContent=levels[key].label;
      b.setAttribute("aria-pressed", key===currentLevel ? "true" : "false");
      if(key===currentLevel) b.className="active";
      b.addEventListener("click", function(){ currentLevel=key; renderLevelBar(); renderGrid(); });
      levelBar.appendChild(b);
    });
  }

  function closeScene(){
    if(currentScene && currentScene.destroy) currentScene.destroy();
    currentScene=null;
    stage.innerHTML="";
  }

  function renderGrid(){
    closeScene();
    stage.hidden=true; grid.hidden=false; backBtn.hidden=true;
    grid.innerHTML="";
    levels[currentLevel].items.forEach(function(item){
      var ready=item.status==="ready";
      var card=document.createElement(ready?"button":"div");
      if(ready) card.type="button";
      card.className="mc-card "+(ready?"ready":"soon");
      var h=document.createElement("h3"); h.textContent=item.title; card.appendChild(h);
      var badge=document.createElement("span"); badge.className="mc-badge"; badge.textContent=ready?"Disponible":"Bientôt";
      card.appendChild(badge);
      if(item.desc){ var p=document.createElement("p"); p.textContent=item.desc; card.appendChild(p); }
      if(ready) card.addEventListener("click", function(){ openConcept(item); });
      grid.appendChild(card);
    });
  }

  function openConcept(item){
    if(item.kind==="external"){ window.location.href=item.url; return; }
    grid.hidden=true; stage.hidden=false; backBtn.hidden=false;
    stage.innerHTML="";
    if(item.kind==="scene" && item.render){ currentScene=item.render(stage); }
    window.scrollTo(0,0);
  }

  backBtn.addEventListener("click", renderGrid);

  document.addEventListener("keydown", function(e){
    var tag=e.target && e.target.tagName;
    if(tag==="INPUT"||tag==="SELECT"||tag==="TEXTAREA") return;
    if(e.key===" " && !stage.hidden){
      var play=stage.querySelector(".mc-timecursor .primary");
      if(play){ e.preventDefault(); play.click(); }
    } else if(e.key==="f"||e.key==="F"){ toggleFullscreen(); }
    else if(e.key==="t"||e.key==="T"){ toggleTheme(); }
    else if(e.key==="Escape" && !stage.hidden){ renderGrid(); }
    else if((e.key==="ArrowRight"||e.key==="ArrowLeft") && !stage.hidden){
      var stepBtn=stage.querySelector(e.key==="ArrowRight" ? ".mc-step-fwd" : ".mc-step-back");
      if(stepBtn){ e.preventDefault(); stepBtn.click(); }
    }
    else if((e.key==="e"||e.key==="E") && !stage.hidden){
      var nextBtn=stage.querySelector(".mc-explain-next");
      if(nextBtn){ e.preventDefault(); nextBtn.click(); }
    }
    else if((e.key==="p"||e.key==="P") && !stage.hidden){
      var presentBtn=stage.querySelector(".mc-present-toggle");
      if(presentBtn){ e.preventDefault(); presentBtn.click(); }
    }
  });

  renderLevelBar();
  renderGrid();
})();
