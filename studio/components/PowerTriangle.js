(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.PowerTriangle = function(container, opts){
    opts=opts||{};
    var S=MC.components.svg;
    var w=opts.width||300, h=opts.height||230;
    var svg=S.el("svg",{viewBox:"0 0 "+w+" "+h, "class":"mc-svg-triangle", role:"img", "aria-label":"Triangle des puissances"});
    container.appendChild(svg);

    function render(state){
      var C=MC.components.Chart;
      var U=MC.core.units;
      S.clear(svg);
      var padL=24, padR=90, padT=24, padB=30;
      var maxMag=Math.max(Math.abs(state.P),Math.abs(state.Q),state.S,1);
      var scale=Math.min((w-padL-padR)/maxMag, (h-padT-padB)/2/maxMag);
      var ox=padL, oy=h/2;
      var px=ox+state.P*scale;
      var qy=oy-state.Q*scale;
      var colP=C.cssVar(state.colorP||"--orange");
      var colQ=C.cssVar(state.colorQ||"--red");
      var colS=C.cssVar(state.colorS||"--ink");

      svg.appendChild(S.line(ox,oy,w-padR+40,oy,{stroke:C.cssVar("--grid"),"stroke-width":1}));
      svg.appendChild(S.arrow(ox,oy,px,oy,colP,4));
      if(Math.abs(state.Q)>1e-6) svg.appendChild(S.arrow(px,oy,px,qy,colQ,4));
      svg.appendChild(S.arrow(ox,oy,px,qy,colS,3));

      if(Math.abs(state.Q)>1e-6){
        var arcR=22;
        var ang=Math.atan2(state.Q,state.P);
        var x1=ox+arcR*Math.cos(ang), y1=oy-arcR*Math.sin(ang);
        svg.appendChild(S.path("M "+(ox+arcR)+" "+oy+" A "+arcR+" "+arcR+" 0 0 "+(ang>0?0:1)+" "+x1+" "+y1,{fill:"none",stroke:colP,"stroke-width":2}));
        svg.appendChild(S.text(ox+34*Math.cos(ang/2), oy-34*Math.sin(ang/2)+4, "φ", {fill:colP,"font-size":"13","font-weight":"700"}));
      }

      svg.appendChild(S.text(ox+(px-ox)/2, oy+(state.Q>=0?18:-10), "P = "+U.fmt(state.P,0)+" W", {fill:colP,"font-size":"12","font-weight":"700","text-anchor":"middle"}));
      svg.appendChild(S.text(px+8, oy+(qy-oy)/2+4, "Q = "+U.fmt(state.Q,0)+" var", {fill:colQ,"font-size":"12","font-weight":"700"}));
      svg.appendChild(S.text(ox+(px-ox)/2-8, oy+(qy-oy)/2+(state.Q>=0?-8:16), "S = "+U.fmt(state.S,0)+" VA", {fill:colS,"font-size":"12","font-weight":"700","text-anchor":"end"}));
    }
    return { render:render };
  };
})();
