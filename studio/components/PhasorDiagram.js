(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.PhasorDiagram = function(container, opts){
    opts=opts||{};
    var S=MC.components.svg;
    var size=opts.size||240;
    var svg=S.el("svg",{viewBox:"0 0 "+size+" "+size, "class":"mc-svg-phasor", role:"img", "aria-label":"Diagramme de Fresnel"});
    container.appendChild(svg);
    var cx=size/2, cy=size/2;

    function render(state){
      var C=MC.components.Chart;
      S.clear(svg);
      var maxR=size*0.4;
      var grid=C.cssVar("--grid");
      svg.appendChild(S.circle(cx,cy,maxR,{fill:"none", stroke:grid, "stroke-width":1}));
      svg.appendChild(S.line(cx-maxR,cy,cx+maxR,cy,{stroke:grid,"stroke-width":1}));
      svg.appendChild(S.line(cx,cy-maxR,cx,cy+maxR,{stroke:grid,"stroke-width":1}));

      var ru=maxR*0.92;
      var ri=maxR*(state.IampNorm===undefined?0.65:state.IampNorm);
      var colU=C.cssVar(state.colorU||"--blue");
      var colI=C.cssVar(state.colorI||"--green");
      var ux=cx+ru*Math.cos(state.angleU), uy=cy-ru*Math.sin(state.angleU);
      var ix=cx+ri*Math.cos(state.angleI), iy=cy-ri*Math.sin(state.angleI);

      // projection verticale = valeur instantanée (lien vecteur tournant ↔ sinusoïde)
      svg.appendChild(S.line(ux,uy,cx,uy,{stroke:colU,"stroke-width":1,"stroke-dasharray":"3,3",opacity:0.7}));
      svg.appendChild(S.line(ix,iy,cx,iy,{stroke:colI,"stroke-width":1,"stroke-dasharray":"3,3",opacity:0.7}));

      var delta=state.angleI-state.angleU;
      if(Math.abs(delta)>0.02){
        var arcR=30;
        var x0=cx+arcR*Math.cos(state.angleU), y0=cy-arcR*Math.sin(state.angleU);
        var x1=cx+arcR*Math.cos(state.angleI), y1=cy-arcR*Math.sin(state.angleI);
        var sweep = delta<0 ? 1 : 0;
        var large = Math.abs(delta)>Math.PI ? 1 : 0;
        svg.appendChild(S.path("M "+x0+" "+y0+" A "+arcR+" "+arcR+" 0 "+large+" "+sweep+" "+x1+" "+y1,{fill:"none",stroke:C.cssVar("--orange"),"stroke-width":2.5}));
        var am=state.angleU+delta/2;
        svg.appendChild(S.text(cx+44*Math.cos(am),cy-44*Math.sin(am)+4,"φ",{fill:C.cssVar("--orange"),"font-weight":"700","font-size":"15","text-anchor":"middle"}));
      }

      svg.appendChild(S.arrow(cx,cy,ux,uy,colU,4));
      svg.appendChild(S.arrow(cx,cy,ix,iy,colI,4));
      svg.appendChild(S.text(ux+(ux>=cx?8:-8),uy+5,"U",{fill:colU,"font-weight":"700","font-size":"15","text-anchor":ux>=cx?"start":"end"}));
      svg.appendChild(S.text(ix+(ix>=cx?8:-8),iy+5,"I",{fill:colI,"font-weight":"700","font-size":"15","text-anchor":ix>=cx?"start":"end"}));
    }
    return { render:render, svg:svg };
  };
})();
