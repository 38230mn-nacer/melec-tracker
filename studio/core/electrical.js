(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.core = MC.core || {};

  function omega(f){ return 2*Math.PI*f; }
  function instU(Urms,f,t,phase){ phase=phase||0; return Urms*Math.SQRT2*Math.sin(omega(f)*t+phase); }
  function instI(Irms,f,t,phase){ phase=phase||0; return Irms*Math.SQRT2*Math.sin(omega(f)*t+phase); }
  function powers(Urms,Irms,phiRad){
    var cosPhi=Math.cos(phiRad), sinPhi=Math.sin(phiRad);
    var S=Urms*Irms;
    return { P:S*cosPhi, Q:S*sinPhi, S:S, cosPhi:cosPhi, sinPhi:sinPhi };
  }

  MC.core.electrical = { omega:omega, instU:instU, instI:instI, powers:powers };
})();
