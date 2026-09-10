(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.core = MC.core || {};

  function rangeOf(fn,tmin,tmax,n){
    var lo=Infinity, hi=-Infinity, i;
    for(i=0;i<=n;i++){
      var t=tmin+(tmax-tmin)*i/n;
      var v=fn(t);
      if(isFinite(v)){ if(v<lo) lo=v; if(v>hi) hi=v; }
    }
    if(lo===hi){ lo-=1; hi+=1; }
    var pad=(hi-lo)*0.18;
    return { min:lo-pad, max:hi+pad };
  }

  MC.core.math = { rangeOf:rangeOf };
})();
