(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};
  var NS="http://www.w3.org/2000/svg";

  function merge(base,extra){
    if(extra) Object.keys(extra).forEach(function(k){ base[k]=extra[k]; });
    return base;
  }
  function el(tag,attrs){
    var e=document.createElementNS(NS,tag);
    if(attrs) Object.keys(attrs).forEach(function(k){ e.setAttribute(k, attrs[k]); });
    return e;
  }
  function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); }
  function line(x1,y1,x2,y2,attrs){ return el("line", merge({x1:x1,y1:y1,x2:x2,y2:y2},attrs)); }
  function arrow(x1,y1,x2,y2,color,width){
    var g=el("g");
    g.appendChild(line(x1,y1,x2,y2,{stroke:color,"stroke-width":width||3,"stroke-linecap":"round"}));
    var ang=Math.atan2(y2-y1,x2-x1);
    var size=8+((width||3)*0.6);
    var p1x=x2-size*Math.cos(ang-Math.PI/7), p1y=y2-size*Math.sin(ang-Math.PI/7);
    var p2x=x2-size*Math.cos(ang+Math.PI/7), p2y=y2-size*Math.sin(ang+Math.PI/7);
    g.appendChild(el("polygon",{points:x2+","+y2+" "+p1x+","+p1y+" "+p2x+","+p2y, fill:color}));
    return g;
  }
  function text(x,y,str,attrs){
    var t=el("text", merge({x:x,y:y},attrs));
    t.textContent=str;
    return t;
  }
  function circle(cx,cy,r,attrs){ return el("circle", merge({cx:cx,cy:cy,r:r},attrs)); }
  function path(d,attrs){ return el("path", merge({d:d},attrs)); }

  MC.components.svg = { el:el, clear:clear, line:line, arrow:arrow, text:text, circle:circle, path:path };
})();
