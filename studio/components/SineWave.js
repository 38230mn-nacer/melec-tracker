(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Graphe temporel générique (sinusoïdes, mais aussi position/vitesse/couple…).
  // Options par courbe : fn, colorVar, label, dash:[…], visible:fn→bool,
  // slope:fn(t) → trace la tangente au curseur (dérivée = pente), slopeColorVar.
  // Option hlines : [{y:number|fn, colorVar, label}] pour une ligne de seuil.
  MC.components.SineWave = function(container, opts){
    var canvas=document.createElement("canvas");
    canvas.className="mc-canvas"+(opts.className?" "+opts.className:"");
    container.appendChild(canvas);
    var st=MC.components.Chart.attachCanvas(canvas);
    var domain={xmin:0,xmax:opts.period(),ymin:-1.2,ymax:1.2};
    var lastT=0;

    function hlineY(h){ return typeof h.y==="function" ? h.y() : h.y; }

    function computeRange(){
      domain.xmax=opts.period();
      if(opts.fixedYDomain){
        domain.ymin=opts.fixedYDomain.min; domain.ymax=opts.fixedYDomain.max;
        return;
      }
      var lo=Infinity,hi=-Infinity;
      opts.curves.forEach(function(c){
        var r=MC.core.math.rangeOf(c.fn,0,domain.xmax,240);
        if(r.min<lo) lo=r.min;
        if(r.max>hi) hi=r.max;
      });
      (opts.hlines||[]).forEach(function(h){
        var y=hlineY(h);
        if(isFinite(y)){ if(y<lo) lo=y-Math.abs(y)*0.15-0.1; if(y>hi) hi=y+Math.abs(y)*0.15+0.1; }
      });
      if(opts.includeZero && lo>0) lo=0;
      if(opts.includeZero && hi<0) hi=0;
      domain.ymin=lo; domain.ymax=hi;
    }
    computeRange();

    function drawTangent(ctx,view,rect,t,c){
      var y0=c.fn(t), m=c.slope(t);
      if(!isFinite(y0)||!isFinite(m)) return;
      var d=(domain.xmax-domain.xmin)*0.11;
      ctx.save();
      ctx.beginPath(); ctx.rect(rect.x,rect.y,rect.w,rect.h); ctx.clip();
      ctx.strokeStyle=MC.components.Chart.cssVar(c.slopeColorVar||"--orange");
      ctx.lineWidth=2.2; ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(view.px(t-d),view.py(y0-m*d));
      ctx.lineTo(view.px(t+d),view.py(y0+m*d));
      ctx.stroke();
      ctx.restore();
    }

    function render(t){
      lastT=t;
      var C=MC.components.Chart;
      var ctx=st.ctx, w=st.w, h=st.h;
      ctx.clearRect(0,0,w,h);
      var ticks=opts.tickFormat;
      var rect={x:ticks?44:10,y:10,w:w-(ticks?54:20),h:h-28};
      var view=C.makeView(rect,domain);
      var xstep=domain.xmax/8;
      var ystep=(domain.ymax-domain.ymin)/4||1;
      C.drawAxes(ctx,rect,domain,view,xstep,ystep);
      if(ticks){
        var muted=C.cssVar("--muted"), k;
        ctx.save(); ctx.fillStyle=muted; ctx.font="11px Segoe UI, Arial";
        for(k=1;k<8;k++){
          var xv=k*xstep;
          ctx.textAlign="center"; ctx.fillText(ticks.x(xv), view.px(xv), rect.y+rect.h+14);
        }
        var yv;
        for(yv=Math.ceil(domain.ymin/ystep)*ystep; yv<=domain.ymax+1e-9; yv+=ystep){
          ctx.textAlign="right"; ctx.fillText(ticks.y(yv), rect.x-4, view.py(yv)+4);
        }
        ctx.restore();
      }
      (opts.hlines||[]).forEach(function(hl){
        var y=hlineY(hl);
        if(!isFinite(y)) return;
        var col=C.cssVar(hl.colorVar||"--red");
        ctx.save();
        ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.setLineDash([6,5]);
        ctx.beginPath(); ctx.moveTo(rect.x,view.py(y)); ctx.lineTo(rect.x+rect.w,view.py(y)); ctx.stroke();
        ctx.restore();
        if(hl.label) C.label(ctx, rect.x+rect.w-6-ctx.measureText(hl.label).width, view.py(y)-5, hl.label, col);
      });
      (opts.vlines||[]).forEach(function(vl){
        var xv = typeof vl.x==="function" ? vl.x() : vl.x;
        if(!isFinite(xv)) return;
        var col=C.cssVar(vl.colorVar||"--red");
        ctx.save();
        ctx.strokeStyle=col; ctx.lineWidth=1.4; ctx.setLineDash([3,4]);
        ctx.beginPath(); ctx.moveTo(view.px(xv),rect.y); ctx.lineTo(view.px(xv),rect.y+rect.h); ctx.stroke();
        ctx.restore();
        if(vl.label) C.label(ctx, view.px(xv)+4, rect.y+rect.h-6, vl.label, col);
      });
      var labelX=rect.x+8;
      opts.curves.forEach(function(c){
        if(c.visible && !c.visible()) return;
        var color=C.cssVar(c.colorVar);
        if(c.dash){ ctx.save(); ctx.setLineDash(c.dash); }
        C.drawCurve(ctx,view,domain,c.fn,color,c.width||2.8,260);
        if(c.dash) ctx.restore();
        if(c.slope) drawTangent(ctx,view,rect,t,c);
        C.drawDot(ctx,view,t,c.fn(t),color,5.5);
        if(c.label){
          C.label(ctx, labelX, rect.y+16, c.label, color);
          ctx.save(); ctx.font="700 12px Segoe UI, Arial";
          labelX+=ctx.measureText(c.label).width+16;
          ctx.restore();
        }
      });
      C.drawVCursor(ctx,rect,view,t,C.cssVar("--red"));
      if(opts.xLabel) C.label(ctx, rect.x+rect.w-30, rect.y+rect.h+14, opts.xLabel);
    }
    st.onResize=function(){ render(lastT); };

    return { render:render, refreshRange:computeRange, canvas:canvas, destroy:st.destroy };
  };
})();
