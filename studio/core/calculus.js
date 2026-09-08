(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.core = MC.core || {};

  // Outils de dérivation : taux de variation, tangente, racines de f′, tableau de variations.
  function secantSlope(f,x0,h){ return (f(x0+h)-f(x0))/h; }

  function tangent(f,df,x0){
    var m=df(x0);
    return { m:m, b:f(x0)-m*x0 };
  }

  // Racines de g sur [xmin,xmax] par changement de signe puis bissection.
  function findRoots(g,xmin,xmax,n){
    var roots=[], i, prevX=xmin, prevY=g(xmin);
    for(i=1;i<=n;i++){
      var x=xmin+(xmax-xmin)*i/n, y=g(x);
      if(isFinite(prevY) && isFinite(y)){
        if(prevY===0){ roots.push(prevX); }
        else if(prevY*y<0){
          var a=prevX, b=x, ya=prevY, k;
          for(k=0;k<45;k++){
            var m=(a+b)/2, ym=g(m);
            if(ya*ym<=0){ b=m; } else { a=m; ya=ym; }
          }
          roots.push((a+b)/2);
        }
      }
      prevX=x; prevY=y;
    }
    var out=[];
    roots.forEach(function(r){ if(!out.length || Math.abs(r-out[out.length-1])>1e-6) out.push(r); });
    return out;
  }

  // Tableau de variations : points remarquables (bornes + racines de f′) et signe de f′ entre eux.
  function variationTable(f,df,xmin,xmax){
    var roots=findRoots(df,xmin,xmax,800).filter(function(r){ return r>xmin+1e-6 && r<xmax-1e-6; });
    var pts=[xmin].concat(roots).concat([xmax]);
    var intervals=[], i;
    for(i=0;i<pts.length-1;i++){
      var mid=(pts[i]+pts[i+1])/2, s=df(mid);
      intervals.push({ from:pts[i], to:pts[i+1], sign: s>1e-12 ? 1 : (s<-1e-12 ? -1 : 0) });
    }
    return {
      points:pts.map(function(x,idx){ return { x:x, y:f(x), isRoot: idx>0 && idx<pts.length-1 }; }),
      intervals:intervals,
      roots:roots
    };
  }

  MC.core.calculus = { secantSlope:secantSlope, tangent:tangent, findRoots:findRoots, variationTable:variationTable };
})();
