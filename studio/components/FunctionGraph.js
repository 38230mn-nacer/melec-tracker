(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Graphe d'une fonction f(x) sur un domaine quelconque (x négatifs compris), avec graduations,
  // courbes, droites (sécante, tangente), points nommés, bandes de signe et point A déplaçable.
  MC.components.FunctionGraph = function(container, opts){
    opts=opts||{};
    var canvas=document.createElement("canvas");
    canvas.className="mc-canvas"+(opts.className?" "+opts.className:"");
    canvas.setAttribute("aria-label", opts.ariaLabel||"Graphe de la fonction");
    container.appendChild(canvas);
    var C=MC.components.Chart, U=MC.core.units;
    var st=C.attachCanvas(canvas);
    var domain=opts.domain;
    var lastState=null, lastView=null;

    function render(state){
      lastState=state;
      var ctx=st.ctx, w=st.w, h=st.h;
      ctx.clearRect(0,0,w,h);
      var rect={x:40,y:12,w:w-52,h:h-30};
      var view=C.makeView(rect,domain);
      lastView=view;
      var xstep=domain.xstep||1, ystep=domain.ystep||1;

      (state.bands||[]).forEach(function(b){
        ctx.save();
        ctx.fillStyle=C.cssVar(b.sign>0?"--green":"--red");
        ctx.globalAlpha=0.09;
        var px1=view.px(b.from), px2=view.px(b.to);
        ctx.fillRect(px1, rect.y, px2-px1, rect.h);
        ctx.restore();
      });

      C.drawAxes(ctx,rect,domain,view,xstep,ystep);
      ctx.save();
      ctx.fillStyle=C.cssVar("--muted"); ctx.font="11px Segoe UI, Arial";
      var xv, yv;
      for(xv=Math.ceil(domain.xmin/xstep)*xstep; xv<=domain.xmax+1e-9; xv+=xstep){
        if(Math.abs(xv)<1e-9) continue;
        ctx.textAlign="center";
        var yAxis = (domain.ymin<=0 && domain.ymax>=0) ? view.py(0) : rect.y+rect.h;
        ctx.fillText(U.fmt(xv, xstep<1?1:0), view.px(xv), Math.min(rect.y+rect.h+14, yAxis+14));
      }
      for(yv=Math.ceil(domain.ymin/ystep)*ystep; yv<=domain.ymax+1e-9; yv+=ystep){
        if(Math.abs(yv)<1e-9) continue;
        ctx.textAlign="right";
        ctx.fillText(U.fmt(yv, ystep<1?1:0), rect.x-4, view.py(yv)+4);
      }
      ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.rect(rect.x,rect.y,rect.w,rect.h); ctx.clip();
      (state.vlines||[]).forEach(function(l){
        ctx.save();
        ctx.strokeStyle=C.cssVar(l.colorVar||"--muted"); ctx.lineWidth=1.2; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(view.px(l.x),rect.y); ctx.lineTo(view.px(l.x),rect.y+rect.h); ctx.stroke();
        ctx.restore();
      });
      (state.curves||[]).forEach(function(c){
        if(c.dash){ ctx.save(); ctx.setLineDash(c.dash); }
        C.drawCurve(ctx,view,domain,c.fn,C.cssVar(c.colorVar),c.width||3,320);
        if(c.dash) ctx.restore();
      });
      ctx.restore();

      (state.points||[]).forEach(function(p){
        if(!isFinite(p.y)) return;
        C.drawDot(ctx,view,p.x,p.y,C.cssVar(p.colorVar),p.r||6.5);
        if(p.label){
          ctx.save();
          ctx.fillStyle=C.cssVar("--ink"); ctx.font="700 13px Segoe UI, Arial";
          ctx.fillText(p.label, view.px(p.x)+9, view.py(p.y)-9);
          ctx.restore();
        }
      });
      (state.texts||[]).forEach(function(t,i){
        C.label(ctx, rect.x+8+(t.dx||0), rect.y+16+i*16, t.text, C.cssVar(t.colorVar||"--muted"));
      });
    }
    st.onResize=function(){ if(lastState) render(lastState); };

    if(opts.onDrag){
      var dragging=false;
      function move(e){
        if(!lastView) return;
        var r=canvas.getBoundingClientRect();
        opts.onDrag(lastView.toX(e.clientX-r.left));
      }
      canvas.addEventListener("pointerdown", function(e){ dragging=true; canvas.setPointerCapture(e.pointerId); move(e); });
      canvas.addEventListener("pointermove", function(e){ if(dragging) move(e); });
      canvas.addEventListener("pointerup", function(){ dragging=false; });
      canvas.addEventListener("pointercancel", function(){ dragging=false; });
    }

    return {
      render:render,
      setDomain:function(d){ domain=d; },
      destroy:st.destroy,
      canvas:canvas
    };
  };
})();
