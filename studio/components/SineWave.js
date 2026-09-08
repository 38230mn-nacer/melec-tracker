(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.SineWave = function(container, opts){
    var canvas=document.createElement("canvas"); canvas.className="mc-canvas";
    container.appendChild(canvas);
    var st=MC.components.Chart.attachCanvas(canvas);
    var domain={xmin:0,xmax:opts.period(),ymin:-1.2,ymax:1.2};
    var lastT=0;

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
      domain.ymin=lo; domain.ymax=hi;
    }
    computeRange();

    function render(t){
      lastT=t;
      var C=MC.components.Chart;
      var ctx=st.ctx, w=st.w, h=st.h;
      ctx.clearRect(0,0,w,h);
      var rect={x:10,y:10,w:w-20,h:h-28};
      var view=C.makeView(rect,domain);
      var xstep=domain.xmax/8;
      C.drawAxes(ctx,rect,domain,view,xstep,(domain.ymax-domain.ymin)/4||1);
      opts.curves.forEach(function(c,i){
        var color=C.cssVar(c.colorVar);
        C.drawCurve(ctx,view,domain,c.fn,color,2.8,260);
        C.drawDot(ctx,view,t,c.fn(t),color,5.5);
        if(c.label) C.label(ctx, rect.x+8+i*64, rect.y+16, c.label, color);
      });
      C.drawVCursor(ctx,rect,view,t,C.cssVar("--red"));
      if(opts.xLabel) C.label(ctx, rect.x+rect.w-30, rect.y+rect.h+14, opts.xLabel);
    }
    st.onResize=function(){ render(lastT); };

    return { render:render, refreshRange:computeRange, canvas:canvas };
  };
})();
