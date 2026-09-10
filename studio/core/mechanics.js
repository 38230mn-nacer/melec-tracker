(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.core = MC.core || {};

  var G = 9.81;

  function rpmToRad(n){ return n*2*Math.PI/60; }
  function radToRpm(w){ return w*60/(2*Math.PI); }

  // Profil trapézoïdal de vitesse : rampe d'accélération, palier, rampe de décélération.
  // C'est le profil imposé par un variateur (rampes) ou un opérateur de porte.
  function trapezoid(p){
    var vmax=p.vmax, tA=p.tAcc, tC=Math.max(0,p.tCruise), tD=p.tDec, x0=p.x0||0;
    var aA = tA>0 ? vmax/tA : 0;
    var aD = tD>0 ? vmax/tD : 0;
    var t1=tA, t2=tA+tC, t3=tA+tC+tD;
    var x1=x0+0.5*aA*tA*tA;
    var x2=x1+vmax*tC;
    var x3=x2+vmax*tD-0.5*aD*tD*tD;
    function x(t){
      if(t<=0) return x0;
      if(t<t1) return x0+0.5*aA*t*t;
      if(t<t2) return x1+vmax*(t-t1);
      if(t<t3){ var u=t-t2; return x2+vmax*u-0.5*aD*u*u; }
      return x3;
    }
    function v(t){
      if(t<=0) return 0;
      if(t<t1) return aA*t;
      if(t<t2) return vmax;
      if(t<t3) return vmax-aD*(t-t2);
      return 0;
    }
    function a(t){
      if(t<0) return 0;
      if(t<t1) return aA;
      if(t<t2) return 0;
      if(t<t3) return -aD;
      return 0;
    }
    function j(t){ return 0; }
    return { x:x, v:v, a:a, j:j, vmax:vmax, aAcc:aA, aDec:aD, aMax:Math.max(aA,aD), jMax:Infinity,
      corners:[0,t1,t2,t3], t1:t1, t2:t2, t3:t3, xEnd:x3, kind:"lin" };
  }

  // Rampe en S (loi en cosinus) : même durée et même distance que la rampe linéaire,
  // mais l'accélération est continue — l'à-coup (dérivée de l'accélération) reste fini.
  function sTrapezoid(p){
    var vmax=p.vmax, tA=p.tAcc, tC=Math.max(0,p.tCruise), tD=p.tDec, x0=p.x0||0, PI=Math.PI;
    var t1=tA, t2=tA+tC, t3=tA+tC+tD;
    var x1=x0+vmax*tA/2, x2=x1+vmax*tC, x3=x2+vmax*tD/2;
    var aMaxA=vmax*PI/(2*tA), aMaxD=vmax*PI/(2*tD);
    function x(t){
      if(t<=0) return x0;
      if(t<t1) return x0+vmax/2*(t-(tA/PI)*Math.sin(PI*t/tA));
      if(t<t2) return x1+vmax*(t-t1);
      if(t<t3){ var u=t-t2; return x2+vmax/2*(u+(tD/PI)*Math.sin(PI*u/tD)); }
      return x3;
    }
    function v(t){
      if(t<=0) return 0;
      if(t<t1) return vmax*(1-Math.cos(PI*t/tA))/2;
      if(t<t2) return vmax;
      if(t<t3) return vmax*(1+Math.cos(PI*(t-t2)/tD))/2;
      return 0;
    }
    function a(t){
      if(t<0) return 0;
      if(t<t1) return aMaxA*Math.sin(PI*t/tA);
      if(t<t2) return 0;
      if(t<t3) return -aMaxD*Math.sin(PI*(t-t2)/tD);
      return 0;
    }
    function j(t){
      if(t<0) return 0;
      if(t<t1) return aMaxA*PI/tA*Math.cos(PI*t/tA);
      if(t<t2) return 0;
      if(t<t3) return -aMaxD*PI/tD*Math.cos(PI*(t-t2)/tD);
      return 0;
    }
    var jAcc=aMaxA*PI/tA, jDec=aMaxD*PI/tD;
    return { x:x, v:v, a:a, j:j, vmax:vmax, aAcc:aMaxA, aDec:aMaxD, aMax:Math.max(aMaxA,aMaxD),
      jAcc:jAcc, jDec:jDec, jMax:Math.max(jAcc,jDec), corners:[], t1:t1, t2:t2, t3:t3, xEnd:x3, kind:"s" };
  }

  // Porte coulissante : course L, vitesse maxi, temps d'accélération (= décélération).
  // Si la course est trop courte, la porte n'atteint jamais vmax (profil triangulaire).
  function door(p){
    var acc=p.vmax/p.tAcc;
    var dAcc=0.5*acc*p.tAcc*p.tAcc;
    var triangular = 2*dAcc > p.L;
    var prof;
    if(triangular){
      var tPeak=Math.sqrt(p.L/acc);
      prof=trapezoid({vmax:acc*tPeak, tAcc:tPeak, tCruise:0, tDec:tPeak});
    } else {
      prof=trapezoid({vmax:p.vmax, tAcc:p.tAcc, tCruise:(p.L-2*dAcc)/p.vmax, tDec:p.tAcc});
    }
    prof.triangular=triangular;
    prof.L=p.L;
    prof.mass=p.mass;
    prof.force=function(t){ return p.mass*prof.a(t); };
    prof.forceAcc=p.mass*prof.aAcc;
    prof.T=prof.t3+0.6;
    return prof;
  }

  // Convoyeur : le tapis suit la rampe du variateur ; le colis ne peut recevoir par frottement
  // qu'une accélération maximale μ·g. Au-delà, il glisse (intégration numérique, μs = μk).
  function conveyor(p){
    var belt=trapezoid({vmax:p.vmax, tAcc:p.tRamp, tCruise:p.tCruise, tDec:p.tRamp});
    var aLim=p.mu*G;
    var T=belt.t3+1.0;
    var dt=0.002, n=Math.ceil(T/dt)+2;
    var xs=new Float64Array(n), vs=new Float64Array(n), sl=new Uint8Array(n);
    var stuck=true, offset=0, xp=0, vp=0, i;
    for(i=0;i<n;i++){
      var t=i*dt, vb=belt.v(t), ab=belt.a(t), xb=belt.x(t);
      if(stuck){
        if(Math.abs(ab)>aLim+1e-9){ stuck=false; }
        else { vp=vb; xp=xb-offset; }
      }
      if(!stuck){
        var rel=vp-vb;
        if(Math.abs(rel)<1e-6 && Math.abs(ab)<=aLim){
          stuck=true; offset=xb-xp; vp=vb;
        } else {
          var ap = Math.abs(rel)<1e-6 ? (ab>0?1:-1)*aLim : (rel>0?-1:1)*aLim;
          var vNext=vp+ap*dt;
          if(Math.abs(rel)>=1e-6 && (vNext-vb)*rel<0) vNext=vb;
          xp+=(vp+vNext)/2*dt; vp=vNext;
        }
      }
      xs[i]=xp; vs[i]=vp; sl[i]=stuck?0:1;
    }
    function lookup(arr,t){
      var k=t/dt, i0=Math.floor(k);
      if(i0<0) return arr[0];
      if(i0>=n-1) return arr[n-1];
      var f=k-i0;
      return arr[i0]*(1-f)+arr[i0+1]*f;
    }
    // Retard pris au démarrage (avant le freinage) et avance prise pendant le freinage,
    // mesurés chacun par rapport au tapis au début de la phase.
    var slipEver=false, maxLag=0, maxLead=0;
    var iDec=Math.min(n-1,Math.floor(belt.t2/dt));
    var lagAtDec=belt.x(iDec*dt)-xs[iDec];
    for(i=0;i<n;i++){
      if(sl[i]) slipEver=true;
      var d=belt.x(i*dt)-xs[i];
      if(i<=iDec && d>maxLag) maxLag=d;
      if(i>iDec && lagAtDec-d>maxLead) maxLead=lagAtDec-d;
    }
    return {
      belt:belt, aLim:aLim, T:T,
      slipAcc: belt.aAcc>aLim+1e-9, slipDec: belt.aDec>aLim+1e-9, slipEver:slipEver,
      maxLag:maxLag, maxLead:maxLead,
      parcelX:function(t){ return lookup(xs,t); },
      parcelV:function(t){ return lookup(vs,t); },
      slipping:function(t){ var k=Math.round(t/dt); return sl[Math.max(0,Math.min(n-1,k))]===1; },
      slipDist:function(t){ return belt.x(t)-lookup(xs,t); }
    };
  }

  // Moteur piloté par variateur : rampe de vitesse 0 → nNom en tRamp, palier, rampe de freinage.
  // C_moteur − C_r = J·α  ⇒  C = J·α + C_r
  function motorRamp(p){
    var wNom=rpmToRad(p.nNom);
    var prof=trapezoid({vmax:wNom, tAcc:p.tRamp, tCruise:p.tCruise, tDec:p.tRamp});
    var alphaAcc=prof.aAcc;
    return {
      T:prof.t3+0.6, t1:prof.t1, t2:prof.t2, t3:prof.t3,
      wNom:wNom, alphaAcc:alphaAcc, torqueAcc:p.J*alphaAcc+p.Cr, torqueDec:-p.J*prof.aDec+p.Cr,
      theta:prof.x, omega:prof.v, alpha:prof.a,
      turns:function(t){ return prof.x(t)/(2*Math.PI); },
      n:function(t){ return radToRpm(prof.v(t)); },
      torque:function(t){ return p.J*prof.a(t)+p.Cr; }
    };
  }

  // Démarrage direct (contacteur), modèle du 1er ordre : ω(t) = ω_f·(1 − e^(−t/τ)).
  // La dérivée est maximale à t = 0 : c'est l'à-coup de démarrage.
  function motorDirect(p){
    var wf=rpmToRad(p.nNom), tau=p.tau;
    function omega(t){ return t<=0 ? 0 : wf*(1-Math.exp(-t/tau)); }
    function alpha(t){ return t<0 ? 0 : (wf/tau)*Math.exp(-t/tau); }
    function theta(t){ return t<=0 ? 0 : wf*(t-tau*(1-Math.exp(-t/tau))); }
    return {
      T:5*tau, wf:wf, tau:tau,
      alpha0:wf/tau, torque0:p.J*wf/tau+p.Cr,
      torqueRampEquiv:p.J*wf/(3*tau)+p.Cr,
      theta:theta, omega:omega, alpha:alpha,
      turns:function(t){ return theta(t)/(2*Math.PI); },
      n:function(t){ return radToRpm(omega(t)); },
      torque:function(t){ return p.J*alpha(t)+p.Cr; }
    };
  }

  MC.core.mechanics = {
    G:G, rpmToRad:rpmToRad, radToRpm:radToRpm,
    trapezoid:trapezoid, sTrapezoid:sTrapezoid, door:door, conveyor:conveyor, motorRamp:motorRamp, motorDirect:motorDirect
  };
})();
