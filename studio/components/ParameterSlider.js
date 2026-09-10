(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.ParameterSlider = function(container, opts){
    var wrap=document.createElement("div"); wrap.className="mc-param";
    var id="mc-param-"+Math.random().toString(36).slice(2,8);
    var lab=document.createElement("label"); lab.htmlFor=id;
    var nameSpan=document.createElement("span"); nameSpan.className="mc-param-name"; nameSpan.textContent=opts.label;
    var valSpan=document.createElement("span"); valSpan.className="mc-param-val";
    lab.appendChild(nameSpan); lab.appendChild(valSpan);
    var input=document.createElement("input"); input.type="range"; input.id=id;
    input.min=opts.min; input.max=opts.max; input.step=opts.step||1; input.value=opts.value;
    wrap.appendChild(lab); wrap.appendChild(input);
    container.appendChild(wrap);

    var decimals=opts.decimals===undefined?1:opts.decimals;
    function render(v){
      valSpan.textContent = MC.core.units.fmt(v,decimals) + (opts.unit ? " "+opts.unit : "");
    }
    render(parseFloat(input.value));
    input.addEventListener("input", function(){
      var v=parseFloat(input.value);
      render(v);
      if(opts.onChange) opts.onChange(v);
    });

    return {
      get:function(){ return parseFloat(input.value); },
      set:function(v){ input.value=v; render(v); },
      el:wrap
    };
  };
})();
