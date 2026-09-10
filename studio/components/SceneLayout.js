(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  function box(title){
    var b=document.createElement("div"); b.className="mc-box";
    var h=document.createElement("h3"); h.textContent=title; b.appendChild(h);
    var mount=document.createElement("div"); b.appendChild(mount);
    return { el:b, mount:mount, title:h };
  }

  function header(root, title, hint){
    var wrap=document.createElement("div"); wrap.className="mc-scene-header";
    var h2=document.createElement("h2"); h2.textContent=title;
    var p=document.createElement("p"); p.className="mc-hint"; p.textContent=hint||"";
    wrap.appendChild(h2); wrap.appendChild(p);
    root.appendChild(wrap);
    return { h2:h2, hint:p };
  }

  function legend(root, items){
    var el=document.createElement("div"); el.className="mc-legend";
    items.forEach(function(it){
      var s=document.createElement("span");
      var i=document.createElement("i"); i.style.background="var("+it[0]+")";
      s.appendChild(i); s.appendChild(document.createTextNode(it[1]));
      el.appendChild(s);
    });
    root.appendChild(el);
    return el;
  }

  function stats(mount, pairs){
    var nodes={};
    mount.innerHTML="";
    pairs.forEach(function(pair){
      var row=document.createElement("div"); row.className="mc-stat";
      var k=document.createElement("span"); k.className="mc-k"; k.textContent=pair[1];
      var v=document.createElement("span"); v.className="mc-v";
      row.appendChild(k); row.appendChild(v);
      mount.appendChild(row);
      nodes[pair[0]]=v;
    });
    return {
      nodes:nodes,
      set:function(key,val){ var n=nodes[key]; if(n && n.textContent!==val) n.textContent=val; }
    };
  }

  MC.components.layout = { box:box, header:header, legend:legend, stats:stats };
})();
