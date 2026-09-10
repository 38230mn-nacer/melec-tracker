(function(){
  "use strict";
  window.MC = window.MC || {};
  MC.components = MC.components || {};

  MC.components.FormulaPanel = function(container){
    var wrap=document.createElement("div"); wrap.className="mc-formulas";
    container.appendChild(wrap);
    var rowsEls=[];

    function build(rows){
      wrap.innerHTML=""; rowsEls=[];
      rows.forEach(function(r){
        var row=document.createElement("div"); row.className="mc-formula-row";
        var lab=document.createElement("div"); lab.className="mc-formula-label"; lab.textContent=r.label;
        var expr=document.createElement("div"); expr.className="mc-formula-expr"; expr.textContent=r.expr;
        row.appendChild(lab); row.appendChild(expr);
        wrap.appendChild(row);
        rowsEls.push({lab:lab,expr:expr});
      });
    }
    function render(rows){
      if(rowsEls.length!==rows.length){ build(rows); return; }
      rows.forEach(function(r,i){
        if(rowsEls[i].lab.textContent!==r.label) rowsEls[i].lab.textContent=r.label;
        if(rowsEls[i].expr.textContent!==r.expr) rowsEls[i].expr.textContent=r.expr;
      });
    }
    return { render:render };
  };
})();
