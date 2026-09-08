(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.core = MC.core || {};

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function round(v,d){
    if(d===undefined) d=2;
    if(!isFinite(v)) return v;
    var f=Math.pow(10,d);
    return Math.round(v*f)/f;
  }
  function deg2rad(d){ return d*Math.PI/180; }
  function rad2deg(r){ return r*180/Math.PI; }
  function fmt(v,d){
    if(d===undefined) d=2;
    if(!isFinite(v)) return "—";
    var s=round(v,d).toFixed(d);
    if(s==="-0.00"||s==="-0.0"||s==="-0"||s==="-0.000") s=s.slice(1);
    return s.replace("-","−");
  }

  MC.core.units = { clamp:clamp, round:round, deg2rad:deg2rad, rad2deg:rad2deg, fmt:fmt };
})();
