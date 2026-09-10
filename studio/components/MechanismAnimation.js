(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Animation SVG d'un mécanisme (porte coulissante, convoyeur, moteur).
  // La structure est construite une fois ; chaque frame ne met à jour que les transformations
  // et les textes. Les couleurs passent par var(--…) pour suivre le thème sans reconstruction.
  MC.components.MechanismAnimation = function(container, opts){
    var S=MC.components.svg, U=MC.core.units;
    var W=640, H=215;
    var svg=S.el("svg",{viewBox:"0 0 "+W+" "+H, "class":"mc-svg-mech", role:"img", "aria-label":opts.ariaLabel||"Animation du mécanisme"});
    container.appendChild(svg);

    function add(node){ svg.appendChild(node); return node; }
    function st(node, css){ node.setAttribute("style", css); return node; }
    function text(x,y,str,css,attrs){ var t=S.text(x,y,str,attrs||{}); st(t, "font-size:12px;font-weight:700;"+(css||"")); return add(t); }
    function rect(x,y,w,h,css,attrs){ var a={x:x,y:y,width:w,height:h}; if(attrs) Object.keys(attrs).forEach(function(k){ a[k]=attrs[k]; }); return add(st(S.el("rect",a), css)); }
    function line(x1,y1,x2,y2,css,attrs){ return add(st(S.line(x1,y1,x2,y2,attrs||{}), css)); }
    function group(attrs){ return add(S.el("g",attrs||{})); }
    var WIRE="stroke:var(--axis);", MUTED="fill:var(--muted);", INK="fill:var(--ink);";

    var arrowNode=null;
    function replaceArrow(x1,y1,x2,y2,cssColor,width){
      if(arrowNode) svg.removeChild(arrowNode);
      arrowNode=null;
      if(Math.abs(x2-x1)<2 && Math.abs(y2-y1)<2) return;
      arrowNode=S.arrow(x1,y1,x2,y2,"currentColor",width||3);
      st(arrowNode,"color:"+cssColor+";");
      add(arrowNode);
    }

    var render;

    if(opts.kind==="door"){
      rect(20,22,280,166, "fill:var(--btn);stroke:var(--line);stroke-width:2;", {rx:4});
      text(160,40,"refoulement (mur)","fill:var(--muted);font-weight:600;",{"text-anchor":"middle"});
      rect(300,22,280,166, "fill:none;stroke:var(--axis);stroke-width:3;");
      text(440,40,"baie de passage","fill:var(--muted);font-weight:600;",{"text-anchor":"middle"});
      line(20,190,620,190, WIRE+"stroke-width:3;");
      rect(236,4,64,16,"fill:var(--btn);stroke:var(--axis);stroke-width:1.5;",{rx:3});
      text(268,16,"M","fill:var(--ink);font-size:11px;",{"text-anchor":"middle"});
      line(300,12,590,12, WIRE+"stroke-width:1.5;stroke-dasharray:4 4;");
      var panel=group();
      var pr=S.el("rect",{x:302,y:30,width:276,height:152,rx:3});
      st(pr,"fill:var(--green);opacity:0.85;stroke:var(--ink);stroke-width:1.5;");
      panel.appendChild(pr);
      var handle=S.el("rect",{x:312,y:96,width:8,height:26,rx:2}); st(handle,"fill:var(--ink);opacity:0.8;");
      panel.appendChild(handle);
      var tX=text(150,207,"","fill:var(--green);");
      var tV=text(330,207,"","fill:var(--blue);");
      var tA=text(500,207,"","fill:var(--orange);");
      render=function(s){
        var frac = s.L>0 ? U.clamp(s.x/s.L,0,1) : 0;
        panel.setAttribute("transform","translate("+(-frac*276)+",0)");
        var cx=302+138-frac*276;
        var len = s.vmax>0 ? (s.v/s.vmax)*90 : 0;
        replaceArrow(cx, 60, cx-len, 60, "var(--blue)", 4);
        tX.textContent="x = "+U.fmt(s.x,2)+" m";
        tV.textContent="v = "+U.fmt(s.v,2)+" m/s";
        tA.textContent="a = "+U.fmt(s.a,2)+" m/s²";
      };
    }

    else if(opts.kind==="conveyor"){
      rect(10,36,92,74,"fill:var(--btn);stroke:var(--axis);stroke-width:2;",{rx:6});
      text(56,52,"Variateur","fill:var(--ink);font-size:11px;",{"text-anchor":"middle"});
      var ramp=S.el("polyline",{points:"22,96 42,96 62,70 86,70"});
      st(ramp,"fill:none;stroke:var(--blue);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;");
      add(ramp);
      var tRamp=text(56,64,"","fill:var(--muted);font-size:10px;font-weight:600;",{"text-anchor":"middle"});
      line(102,72,150,72,WIRE+"stroke-width:2;");
      line(150,72,150,126,WIRE+"stroke-width:2;");
      var beltY=126, r=24, xL=150, xR=600;
      line(xL,beltY,xR,beltY,WIRE+"stroke-width:4;");
      line(xL,beltY+2*r,xR,beltY+2*r,WIRE+"stroke-width:4;");
      var dashes=line(xL,beltY,xR,beltY,"stroke:var(--muted);stroke-width:4;stroke-dasharray:12 14;");
      var rollers=[xL,xR].map(function(cx){
        var g=group();
        var c=S.circle(cx,beltY+r,r,{}); st(c,"fill:var(--panel);stroke:var(--axis);stroke-width:3;"); g.appendChild(c);
        var sp=S.el("g",{});
        var l1=S.line(cx-r+4,beltY+r,cx+r-4,beltY+r,{}); st(l1,WIRE+"stroke-width:2;");
        var l2=S.line(cx,beltY+4,cx,beltY+2*r-4,{}); st(l2,WIRE+"stroke-width:2;");
        sp.appendChild(l1); sp.appendChild(l2); g.appendChild(sp);
        return { spokes:sp, cx:cx };
      });
      line(xL-30,beltY+2*r+10,xR+30,beltY+2*r+10,WIRE+"stroke-width:2;");
      var ghost=S.el("rect",{x:0,y:beltY-40,width:54,height:40,rx:3});
      st(ghost,"fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 4;");
      add(ghost);
      var parcel=S.el("rect",{x:0,y:beltY-40,width:54,height:40,rx:3});
      st(parcel,"fill:var(--green);stroke:var(--ink);stroke-width:1.5;");
      add(parcel);
      var tV=text(300,24,"","fill:var(--blue);");
      var tP=text(300,44,"","fill:var(--muted);font-weight:600;");
      var tS=text(470,24,"","fill:var(--red);");
      render=function(s){
        var span=xR-xL-90;
        var pxPerM = s.xEnd>0 ? span/s.xEnd : 0;
        var x0=xL+18;
        var xb=x0+U.clamp(s.xBelt*pxPerM,0,span+40);
        var xp=x0+U.clamp(s.xParcel*pxPerM,-40,span+60);
        ghost.setAttribute("x",xb); parcel.setAttribute("x",xp);
        parcel.setAttribute("style", s.slipping
          ? "fill:var(--red);stroke:var(--ink);stroke-width:1.5;"
          : "fill:var(--green);stroke:var(--ink);stroke-width:1.5;");
        var off=-(s.xBelt*pxPerM)%26;
        dashes.setAttribute("stroke-dashoffset", off);
        var deg=(s.xBelt/(2*Math.PI*0.1))*360;
        rollers.forEach(function(ro){ ro.spokes.setAttribute("transform","rotate("+deg+" "+ro.cx+" "+(beltY+r)+")"); });
        tRamp.textContent="rampe "+U.fmt(s.tRamp,2)+" s";
        var len = s.vmax>0 ? (s.vBelt/s.vmax)*70 : 0;
        replaceArrow(xp+27, beltY-52, xp+27+len, beltY-52, "var(--blue)", 3);
        tV.textContent="v tapis = "+U.fmt(s.vBelt,2)+" m/s";
        tP.textContent="v colis = "+U.fmt(s.vParcel,2)+" m/s";
        var d=s.slipDist;
        tS.textContent = Math.abs(d)<0.005 ? "" : (d>0 ? "colis en retard de "+U.fmt(d*100,1)+" cm" : "colis avancé de "+U.fmt(-d*100,1)+" cm");
      };
    }

    else if(opts.kind==="motor"){
      rect(10,60,96,80,"fill:var(--btn);stroke:var(--axis);stroke-width:2;",{rx:6});
      var srcTitle=text(58,78,"","fill:var(--ink);font-size:11px;",{"text-anchor":"middle"});
      var srcIcon=S.el("polyline",{points:""});
      st(srcIcon,"fill:none;stroke:var(--blue);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;");
      add(srcIcon);
      var srcSub=text(58,132,"","fill:var(--muted);font-size:10px;font-weight:600;",{"text-anchor":"middle"});
      line(106,100,150,100,WIRE+"stroke-width:2;");
      line(106,106,150,106,WIRE+"stroke-width:2;");
      line(106,112,150,112,WIRE+"stroke-width:2;");
      rect(150,62,180,90,"fill:var(--btn);stroke:var(--axis);stroke-width:3;",{rx:10});
      var f;
      for(f=0;f<6;f++) line(168+f*26,62,168+f*26,152,WIRE+"stroke-width:1.5;opacity:0.5;");
      text(240,112,"M 3~","fill:var(--ink);font-size:16px;",{"text-anchor":"middle"});
      line(330,107,392,107,WIRE+"stroke-width:8;stroke-linecap:round;");
      var dcx=452, dcy=107, dr=56;
      var disc=S.circle(dcx,dcy,dr,{}); st(disc,"fill:var(--panel);stroke:var(--axis);stroke-width:3;"); add(disc);
      var spokes=group();
      var k;
      for(k=0;k<4;k++){
        var ang=k*Math.PI/4;
        var l=S.line(dcx-dr*Math.cos(ang)+3*Math.cos(ang), dcy-dr*Math.sin(ang)+3*Math.sin(ang), dcx+dr*Math.cos(ang)-3*Math.cos(ang), dcy+dr*Math.sin(ang)-3*Math.sin(ang),{});
        st(l, k===0 ? "stroke:var(--green);stroke-width:4;" : WIRE+"stroke-width:2;");
        spokes.appendChild(l);
      }
      var hub=S.circle(dcx,dcy,7,{}); st(hub,"fill:var(--ink);"); add(hub);
      var tN=text(dcx,190,"","fill:var(--blue);",{"text-anchor":"middle"});
      var tTh=text(dcx,206,"","fill:var(--green);font-weight:600;",{"text-anchor":"middle"});
      var gx=560, gy=30, gw=30, gh=150;
      rect(gx,gy,gw,gh,"fill:var(--btn);stroke:var(--axis);stroke-width:2;",{rx:4});
      var gauge=S.el("rect",{x:gx+3,y:gy+gh-3,width:gw-6,height:0,rx:2}); st(gauge,"fill:var(--orange);"); add(gauge);
      var cmaxLine=S.line(gx-6,gy,gx+gw+6,gy,{}); st(cmaxLine,"stroke:var(--red);stroke-width:2;stroke-dasharray:4 3;"); add(cmaxLine);
      var tCmax=text(gx+gw+8,gy+4,"","fill:var(--red);font-size:10px;");
      var tC=text(gx+gw/2,gy+gh+18,"","fill:var(--orange);",{"text-anchor":"middle"});
      text(gx+gw/2,gy-10,"couple","fill:var(--muted);font-size:10px;font-weight:600;",{"text-anchor":"middle"});
      render=function(s){
        var deg=(s.thetaRad*180/Math.PI)%360;
        spokes.setAttribute("transform","rotate("+deg+" "+dcx+" "+dcy+")");
        tN.textContent="n = "+U.fmt(s.n,0)+" tr/min";
        tTh.textContent="θ = "+U.fmt(s.turns,1)+" tours";
        if(s.mode==="ramp"){
          srcTitle.textContent="Variateur";
          srcIcon.setAttribute("points","22,120 40,120 62,90 92,90");
          srcSub.textContent="rampe "+U.fmt(s.tRamp,2)+" s";
        } else if(s.mode==="sramp"){
          srcTitle.textContent="Variateur";
          srcIcon.setAttribute("points","22,120 38,120 46,117 52,110 58,100 64,93 72,90 92,90");
          srcSub.textContent="rampe en S "+U.fmt(s.tRamp,2)+" s";
        } else {
          srcTitle.textContent="Contacteur";
          srcIcon.setAttribute("points","22,112 44,112 70,92 92,112");
          srcSub.textContent="démarrage direct";
        }
        var scale=Math.max(s.Cmax*1.3, Math.abs(s.C), 1);
        var hgt=U.clamp(Math.abs(s.C)/scale,0,1)*(gh-6);
        gauge.setAttribute("height",hgt); gauge.setAttribute("y",gy+gh-3-hgt);
        gauge.setAttribute("style", s.C>s.Cmax ? "fill:var(--red);" : (s.C<0 ? "fill:var(--blue);" : "fill:var(--orange);"));
        var yMax=gy+gh-3-U.clamp(s.Cmax/scale,0,1)*(gh-6);
        cmaxLine.setAttribute("y1",yMax); cmaxLine.setAttribute("y2",yMax);
        tCmax.setAttribute("y",yMax+4); tCmax.textContent="C max";
        tC.textContent="C = "+U.fmt(s.C,1)+" N·m";
        var len=U.clamp(s.n/Math.max(s.nNom,1),0,1)*50;
        replaceArrow(dcx+dr+14, dcy+len, dcx+dr+14, dcy-len, "var(--blue)", 3);
      };
    }

    else if(opts.kind==="inductor" || opts.kind==="capacitor"){
      var isL = opts.kind==="inductor";
      rect(10,60,96,80,"fill:var(--btn);stroke:var(--axis);stroke-width:2;",{rx:6});
      text(58,78,isL?"Hacheur":"Alimentation","fill:var(--ink);font-size:11px;",{"text-anchor":"middle"});
      var sw=S.el("polyline",{points:"22,112 44,112 70,96"});
      st(sw,"fill:none;stroke:var(--blue);stroke-width:2.5;stroke-linecap:round;"); add(sw);
      line(70,112,92,112,"stroke:var(--blue);stroke-width:2.5;stroke-linecap:round;");
      text(58,132,"commande","fill:var(--muted);font-size:10px;font-weight:600;",{"text-anchor":"middle"});
      var lx1=106, lx2=540, ly1=70, ly2=150;
      line(lx1,ly1,300,ly1,WIRE+"stroke-width:3;");
      line(380,ly1,lx2,ly1,WIRE+"stroke-width:3;");
      line(lx2,ly1,lx2,ly2,WIRE+"stroke-width:3;");
      line(lx1,ly2,lx2,ly2,WIRE+"stroke-width:3;");
      line(lx1,ly1,lx1,100,WIRE+"stroke-width:3;");
      line(lx1,120,lx1,ly2,WIRE+"stroke-width:3;");
      var fill=null;
      if(isL){
        var coil=S.path("M300 70 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0",{});
        st(coil,"fill:none;stroke:var(--green);stroke-width:3.5;"); add(coil);
        text(340,50,"L","fill:var(--green);font-size:14px;",{"text-anchor":"middle"});
      } else {
        line(300,ly1,332,ly1,WIRE+"stroke-width:3;");
        line(348,ly1,380,ly1,WIRE+"stroke-width:3;");
        line(332,50,332,90,"stroke:var(--green);stroke-width:4;");
        line(348,50,348,90,"stroke:var(--green);stroke-width:4;");
        fill=S.el("rect",{x:335,y:90,width:10,height:0}); st(fill,"fill:var(--green);opacity:0.7;"); add(fill);
        text(340,42,"C","fill:var(--green);font-size:14px;",{"text-anchor":"middle"});
      }
      var dots=[], di;
      for(di=0;di<14;di++){ var d=S.circle(0,0,3.2,{}); st(d,"fill:var(--blue);"); add(d); dots.push(d); }
      var perim=2*(lx2-lx1)+2*(ly2-ly1);
      function posOnLoop(dist){
        dist=((dist%perim)+perim)%perim;
        var a=lx2-lx1, b=ly2-ly1;
        if(dist<a) return [lx1+dist, ly1];
        dist-=a; if(dist<b) return [lx2, ly1+dist];
        dist-=b; if(dist<a) return [lx2-dist, ly2];
        dist-=a; return [lx1, ly2-dist];
      }
      var gx=575, gy=30, gw=30, gh=150;
      rect(gx,gy,gw,gh,"fill:var(--btn);stroke:var(--axis);stroke-width:2;",{rx:4});
      var gauge=S.el("rect",{x:gx+3,y:gy+gh-3,width:gw-6,height:0,rx:2}); st(gauge,"fill:var(--blue);"); add(gauge);
      var limLine=S.line(gx-6,gy,gx+gw+6,gy,{}); st(limLine,"stroke:var(--red);stroke-width:2;stroke-dasharray:4 3;"); add(limLine);
      text(gx+gw/2,gy-10,isL?"|u_L|":"|i_C|","fill:var(--muted);font-size:10px;font-weight:600;",{"text-anchor":"middle"});
      var tLim=text(gx+gw/2,gy+gh+18,"","fill:var(--red);font-size:10px;",{"text-anchor":"middle"});
      var tI=text(120,205,"","fill:"+(isL?"var(--green)":"var(--blue)")+";");
      var tU=text(300,205,"","fill:"+(isL?"var(--blue)":"var(--green)")+";");
      var tP=text(450,205,"","fill:var(--orange);");
      render=function(s){
        var mag = s.iMax>0 ? U.clamp(Math.abs(s.i)/s.iMax,0,1) : 0;
        var dir = s.i>=0 ? 1 : -1;
        dots.forEach(function(d,idx){
          var pos=posOnLoop(dir*s.flowPx + idx*perim/dots.length);
          d.setAttribute("cx",pos[0]); d.setAttribute("cy",pos[1]);
          d.setAttribute("style","fill:var(--blue);opacity:"+(0.1+0.9*mag)+";");
        });
        if(fill){
          var fh = s.uMax>0 ? U.clamp(s.u/s.uMax,0,1)*40 : 0;
          fill.setAttribute("height",fh); fill.setAttribute("y",90-fh);
        }
        var vmag = s.uMax>0 ? U.clamp(s.u/s.uMax,-1,1) : 0;
        var arrowLen=vmag*60;
        if(Math.abs(arrowLen)>2) replaceArrow(340+arrowLen/2, 110, 340-arrowLen/2, 110, isL?"var(--blue)":"var(--green)", 3);
        else replaceArrow(0,0,0,0,"var(--blue)",3);
        var lim = isL ? s.uLim : s.iLim;
        var val = isL ? Math.abs(s.u) : Math.abs(s.i);
        var scale=Math.max(lim*1.3, val, 1e-9);
        var hgt=U.clamp(val/scale,0,1)*(gh-6);
        gauge.setAttribute("height",hgt); gauge.setAttribute("y",gy+gh-3-hgt);
        gauge.setAttribute("style", val>lim ? "fill:var(--red);" : "fill:var(--blue);");
        var yLim=gy+gh-3-U.clamp(lim/scale,0,1)*(gh-6);
        limLine.setAttribute("y1",yLim); limLine.setAttribute("y2",yLim);
        tLim.textContent=(isL?"U max ":"I max ")+U.fmt(lim,0);
        tI.textContent="i = "+U.fmt(s.i,2)+" A";
        tU.textContent="u = "+U.fmt(s.u,1)+" V";
        tP.textContent="p = u·i = "+U.fmt(s.p,1)+" W";
      };
    }

    return { render:render, svg:svg };
  };
})();
