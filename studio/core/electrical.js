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

  // Rampe de courant dans une bobine : u_L = L · di/dt (la tension EST la dérivée du courant).
  function inductorRamp(p){
    var prof=MC.core.mechanics.trapezoid({vmax:p.Imax, tAcc:p.tRise, tCruise:p.tHold, tDec:p.tFall});
    function u(t){ return p.L*prof.a(t); }
    return {
      T:prof.t3*1.25, t1:prof.t1, t2:prof.t2, t3:prof.t3,
      i:prof.v, didt:prof.a, u:u, charge:prof.x,
      p:function(t){ return u(t)*prof.v(t); },
      energy:function(t){ var i=prof.v(t); return 0.5*p.L*i*i; },
      didtRise:prof.aAcc, didtFall:-prof.aDec,
      uRise:p.L*prof.aAcc, uFall:-p.L*prof.aDec, energyMax:0.5*p.L*p.Imax*p.Imax
    };
  }

  // Rampe de tension sur un condensateur : i_C = C · du/dt (le courant EST la dérivée de la tension).
  function capacitorRamp(p){
    var prof=MC.core.mechanics.trapezoid({vmax:p.Umax, tAcc:p.tRise, tCruise:p.tHold, tDec:p.tFall});
    function i(t){ return p.C*prof.a(t); }
    return {
      T:prof.t3*1.25, t1:prof.t1, t2:prof.t2, t3:prof.t3,
      u:prof.v, dudt:prof.a, i:i, flux:prof.x,
      p:function(t){ return i(t)*prof.v(t); },
      energy:function(t){ var u=prof.v(t); return 0.5*p.C*u*u; },
      dudtRise:prof.aAcc, dudtFall:-prof.aDec,
      iRise:p.C*prof.aAcc, iFall:-p.C*prof.aDec, energyMax:0.5*p.C*p.Umax*p.Umax
    };
  }

  MC.core.electrical = { omega:omega, instU:instU, instI:instI, powers:powers, inductorRamp:inductorRamp, capacitorRamp:capacitorRamp };
})();
