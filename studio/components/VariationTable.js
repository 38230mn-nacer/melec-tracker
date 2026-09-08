(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  // Tableau de variations au format scolaire : ligne x, ligne signe de f′, ligne variations de f.
  MC.components.VariationTable = function(container){
    var table=document.createElement("table"); table.className="mc-vartable";
    container.appendChild(table);
    var U=MC.core.units;

    function cell(tag,txt,cls){ var c=document.createElement(tag); c.textContent=txt; if(cls) c.className=cls; return c; }

    function render(vt, opts){
      opts=opts||{};
      table.innerHTML="";
      var rowX=document.createElement("tr"), rowS=document.createElement("tr"), rowF=document.createElement("tr");
      rowX.appendChild(cell("th","x","mc-vt-head"));
      rowS.appendChild(cell("th",opts.dfLabel||"signe de f′(x)","mc-vt-head"));
      rowF.appendChild(cell("th",opts.fLabel||"variations de f","mc-vt-head"));
      vt.points.forEach(function(p,i){
        rowX.appendChild(cell("td",U.fmt(p.x,2),"mc-vt-x"));
        rowS.appendChild(cell("td", p.isRoot ? "0" : "", "mc-vt-sign"));
        var fc=cell("td", isFinite(p.y)?U.fmt(p.y,2):"", "mc-vt-val");
        if(p.isRoot) fc.classList.add("mc-vt-ext");
        rowF.appendChild(fc);
        if(i<vt.intervals.length){
          var iv=vt.intervals[i];
          rowX.appendChild(cell("td","","mc-vt-gap"));
          rowS.appendChild(cell("td", iv.sign>0?"+":(iv.sign<0?"−":"0"), "mc-vt-sign "+(iv.sign>0?"pos":(iv.sign<0?"neg":""))));
          rowF.appendChild(cell("td", iv.sign>0?"↗":(iv.sign<0?"↘":"→"), "mc-vt-arrow "+(iv.sign>0?"pos":(iv.sign<0?"neg":""))));
        }
      });
      table.appendChild(rowX); table.appendChild(rowS); table.appendChild(rowF);
    }
    return { render:render, el:table };
  };
})();
