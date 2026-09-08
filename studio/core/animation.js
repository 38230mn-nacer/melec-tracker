(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.core = MC.core || {};

  function TimeEngine(opts){
    opts=opts||{};
    this.t=0;
    this.playing=false;
    this.speed=opts.speed||1;
    this.period=opts.period||10;
    this.loop=opts.loop!==false;
    // timeScale < 1 = ralenti : indispensable pour rendre lisible une période de 20 ms
    this.timeScale=opts.timeScale||1;
    this.onChange=opts.onChange||function(){};
  }
  TimeEngine.prototype.tick=function(dtMs){
    if(!this.playing) return;
    this.t+=dtMs/1000*this.speed*this.timeScale;
    if(this.loop){ this.t=((this.t%this.period)+this.period)%this.period; }
    else if(this.t>=this.period){ this.t=this.period; this.playing=false; }
    this.onChange(this.t);
  };
  TimeEngine.prototype.play=function(){ if(!this.loop && this.t>=this.period) this.t=0; this.playing=true; };
  TimeEngine.prototype.pause=function(){ this.playing=false; };
  TimeEngine.prototype.toggle=function(){ if(this.playing) this.pause(); else this.play(); };
  TimeEngine.prototype.reset=function(){ this.t=0; this.playing=false; this.onChange(this.t); };
  TimeEngine.prototype.step=function(dir, stepSize){
    this.playing=false;
    var s=stepSize||this.period/40;
    this.t=MC.core.units.clamp(this.t+dir*s,0,this.period);
    this.onChange(this.t);
  };
  TimeEngine.prototype.setT=function(t){
    this.t=MC.core.units.clamp(t,0,this.period);
    this.onChange(this.t);
  };

  var engines=[];
  var lastTs=null;
  function loop(ts){
    if(lastTs===null) lastTs=ts;
    var dt=Math.min(100, ts-lastTs); lastTs=ts;
    engines.forEach(function(e){ e.tick(dt); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function register(engine){ if(engines.indexOf(engine)<0) engines.push(engine); return engine; }
  function unregister(engine){ var i=engines.indexOf(engine); if(i>=0) engines.splice(i,1); }

  MC.core.animation = { TimeEngine:TimeEngine, register:register, unregister:unregister };
})();
