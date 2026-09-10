(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function makeView(rect,domain){
    var sx=rect.w/(domain.xmax-domain.xmin);
    var sy=rect.h/(domain.ymax-domain.ymin);
    return {
      px:function(x){ return rect.x+(x-domain.xmin)*sx; },
      py:function(y){ return rect.y+rect.h-(y-domain.ymin)*sy; },
      toX:function(px){ return domain.xmin+(px-rect.x)/sx; }
    };
  }

  function drawAxes(ctx,rect,domain,view,xstep,ystep){
    ctx.save();
    ctx.strokeStyle=cssVar("--grid"); ctx.lineWidth=1;
    var x,y;
    for(x=Math.ceil(domain.xmin/xstep)*xstep; x<=domain.xmax+1e-9; x+=xstep){
      var px=view.px(x);
      ctx.beginPath(); ctx.moveTo(px,rect.y); ctx.lineTo(px,rect.y+rect.h); ctx.stroke();
    }
    for(y=Math.ceil(domain.ymin/ystep)*ystep; y<=domain.ymax+1e-9; y+=ystep){
      var py=view.py(y);
      ctx.beginPath(); ctx.moveTo(rect.x,py); ctx.lineTo(rect.x+rect.w,py); ctx.stroke();
    }
    ctx.strokeStyle=cssVar("--axis"); ctx.lineWidth=1.6;
    if(domain.ymin<=0 && domain.ymax>=0){
      var y0=view.py(0);
      ctx.beginPath(); ctx.moveTo(rect.x,y0); ctx.lineTo(rect.x+rect.w,y0); ctx.stroke();
    }
    if(domain.xmin<=0 && domain.xmax>=0){
      var x0=view.px(0);
      ctx.beginPath(); ctx.moveTo(x0,rect.y); ctx.lineTo(x0,rect.y+rect.h); ctx.stroke();
    }
    ctx.restore();
  }

  function drawCurve(ctx,view,domain,fn,color,lw,n){
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=lw||2.6; ctx.lineJoin="round"; ctx.lineCap="round";
    ctx.beginPath();
    var N=n||220, started=false, i;
    for(i=0;i<=N;i++){
      var x=domain.xmin+(domain.xmax-domain.xmin)*i/N;
      var y=fn(x);
      if(!isFinite(y)){ started=false; continue; }
      var px=view.px(x), py=view.py(y);
      if(!started){ ctx.moveTo(px,py); started=true; } else { ctx.lineTo(px,py); }
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawDot(ctx,view,x,y,color,r){
    ctx.save();
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(view.px(x),view.py(y),r||5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawVCursor(ctx,rect,view,x,color){
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=1.4; ctx.setLineDash([5,4]);
    var px=view.px(x);
    ctx.beginPath(); ctx.moveTo(px,rect.y); ctx.lineTo(px,rect.y+rect.h); ctx.stroke();
    ctx.restore();
  }

  function label(ctx,x,y,txt,color){
    ctx.save();
    ctx.fillStyle=color||cssVar("--muted"); ctx.font="700 12px Segoe UI, Arial";
    ctx.fillText(txt, x, y);
    ctx.restore();
  }

  function attachCanvas(canvas){
    var st={canvas:canvas, ctx:canvas.getContext("2d"), w:0, h:0, onResize:null};
    function sync(){
      var dpr=window.devicePixelRatio||1;
      var rect=canvas.getBoundingClientRect();
      var w=Math.max(1,Math.round(rect.width)), h=Math.max(1,Math.round(rect.height));
      canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
      st.ctx.setTransform(dpr,0,0,dpr,0,0);
      st.w=w; st.h=h;
      if(st.onResize) st.onResize();
    }
    var observer=new ResizeObserver(sync);
    observer.observe(canvas);
    sync();
    st.destroy=function(){ observer.disconnect(); st.onResize=null; };
    return st;
  }

  MC.components.Chart = {
    cssVar:cssVar, makeView:makeView, drawAxes:drawAxes, drawCurve:drawCurve,
    drawDot:drawDot, drawVCursor:drawVCursor, label:label, attachCanvas:attachCanvas
  };
})();
