(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.CircuitDiagram = function(container, opts){
    opts=opts||{};
    var S=MC.components.svg;
    var w=opts.width||420, h=opts.height||170;
    var svg=S.el("svg",{viewBox:"0 0 "+w+" "+h, "class":"mc-svg-circuit", role:"img", "aria-label":"Schéma du circuit"});
    container.appendChild(svg);
    var top=34, bottom=h-48, leftX=44, rightX=w-44, midY=(top+bottom)/2;

    function render(state){
      var C=MC.components.Chart;
      S.clear(svg);
      var wire=C.cssVar("--axis");
      var flow=C.cssVar(state.colorFlowVar||"--green");
      var colU=C.cssVar("--blue");
      var muted=C.cssVar("--muted");

      [[leftX,top,rightX,top],[leftX,bottom,rightX,bottom],[leftX,top,leftX,midY-16],[leftX,midY+16,leftX,bottom],[rightX,top,rightX,midY-18],[rightX,midY+18,rightX,bottom]]
        .forEach(function(l){ svg.appendChild(S.line(l[0],l[1],l[2],l[3],{stroke:wire,"stroke-width":3})); });

      svg.appendChild(S.circle(leftX,midY,16,{fill:"none",stroke:wire,"stroke-width":3}));
      svg.appendChild(S.text(leftX,midY+6,"~",{fill:wire,"font-size":"18","font-weight":"700","text-anchor":"middle"}));
      svg.appendChild(S.el("rect",{x:rightX-17,y:midY-18,width:34,height:36,fill:"none",stroke:wire,"stroke-width":3}));
      svg.appendChild(S.text(rightX,midY+5,"Z",{fill:wire,"font-size":"14","font-weight":"700","text-anchor":"middle"}));
      svg.appendChild(S.text((leftX+rightX)/2,bottom+24,state.label||"Charge",{fill:muted,"font-size":"12","text-anchor":"middle"}));

      svg.appendChild(S.arrow(leftX-28,midY+22,leftX-28,midY-22,colU,2.5));
      svg.appendChild(S.text(leftX-34,midY+4,"u",{fill:colU,"font-size":"13","font-weight":"700","text-anchor":"end"}));

      var norm = state.iMax ? Math.max(-1,Math.min(1, state.iInst/state.iMax)) : 0;
      var dir = norm>=0 ? 1 : -1;
      var mag = Math.abs(norm);
      var n=7, i;
      var span=rightX-leftX-90;
      for(i=0;i<n;i++){
        var f=(i/n + (state.phase||0)) % 1;
        var travel=leftX+45+f*span;
        var x = dir>0 ? travel : (leftX+rightX-travel);
        svg.appendChild(S.circle(x, top, 3.2, {fill:flow, opacity:0.15+0.85*mag}));
      }
      var ax=(leftX+rightX)/2;
      svg.appendChild(S.arrow(ax-16*dir, top-14, ax+16*dir, top-14, flow, 2.5));
      svg.appendChild(S.text(ax, top-20, "i", {fill:flow,"font-size":"13","font-weight":"700","text-anchor":"middle"}));
    }
    return { render:render };
  };
})();
