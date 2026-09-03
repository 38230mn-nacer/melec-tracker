(function(){
'use strict';
var V44=window.MELEC_V44_WORD_CFAI;
if(!V44){console.error('[V4.5 LaTeX] V4.4 Word CFAI absent');return;}
var WNS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
function $(id){return document.getElementById(id)}
function toast(m,t){if(window.__tracker&&window.__tracker.toast)window.__tracker.toast(m,t||'info',4200)}
function stamp(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())}
function dlBlob(name,blob){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},100)}
function api(){return window.MELEC_V42_QUALITY_API}
function current(){var x=api();return x&&x.getCurrent?x.getCurrent():null}
function meta(a){return V44.ensureEvalMeta(a)}

/* ---------- ZIP STORE reader/writer ----------
   Les DOCX produits par V4.4 sont volontairement en ZIP "store" (méthode 0),
   ce qui permet de les post-traiter hors-ligne dans le navigateur sans librairie. */
function r16(u,p){return u[p]|(u[p+1]<<8)}
function r32(u,p){return (u[p]|(u[p+1]<<8)|(u[p+2]<<16)|(u[p+3]<<24))>>>0}
function readStoreZip(u){var files={},p=0,dec=new TextDecoder('utf-8');while(p+30<=u.length&&r32(u,p)===0x04034b50){var method=r16(u,p+8),csize=r32(u,p+18),nlen=r16(u,p+26),xlen=r16(u,p+28);if(method!==0)throw new Error('ZIP V4.4 non STORE : méthode '+method);var ns=p+30,ds=ns+nlen+xlen,name=dec.decode(u.slice(ns,ns+nlen));files[name]=u.slice(ds,ds+csize);p=ds+csize}return files}
var CRCT=null;
function crcTable(){if(CRCT)return CRCT;CRCT=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);CRCT[n]=c>>>0}return CRCT}
function crc32(u){var t=crcTable(),c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=t[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function cat(arr){var n=arr.reduce(function(s,a){return s+a.length},0),u=new Uint8Array(n),o=0;arr.forEach(function(a){u.set(a,o);o+=a.length});return u}
function bytes(s){return new TextEncoder().encode(s)}
function dosDT(){var d=new Date(),time=((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((Math.floor(d.getSeconds()/2))&31),date=(((d.getFullYear()-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31);return [time,date]}
function makeZip(files){var locals=[],centrals=[],offset=0,dt=dosDT();Object.keys(files).forEach(function(name){var data=files[name],nb=bytes(name),crc=crc32(data);var local=cat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(dt[0]),u16(dt[1]),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),nb,data]);locals.push(local);var central=cat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(dt[0]),u16(dt[1]),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nb]);centrals.push(central);offset+=local.length});var cdir=cat(centrals),body=cat(locals),end=cat([u32(0x06054b50),u16(0),u16(0),u16(centrals.length),u16(centrals.length),u32(cdir.length),u32(body.length),u16(0)]);return cat([body,cdir,end])}

/* ---------- Canonicalisation LaTeX ---------- */
var SUB={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₙ':'n'};
var SUP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ⁿ':'n','ˣ':'x','⁻':'-'};
function charsTo(s,m){return String(s).split('').map(function(c){return m[c]||c}).join('')}
function fixBadUn(s){return String(s).replace(/Uₙe/g,'Une').replace(/uₙe/g,'une').replace(/d[’']uₙ(?=\s)/g,function(x){return x.charAt(1)==='’'?'d’un':"d'un"}).replace(/\buₙ\s+(?=(nuage|lot|atelier|équipement|appareil|signal|moteur|circuit|système|exercice|modèle|résultat|point|nombre)\b)/gi,'un ')}
function toLatex(x){var s=String(x).trim();
  s=s.replace(/P\(non\s+([A-Za-z])\)/g,'P(\\overline{$1})');
  s=s.replace(/P\(([^|()]+)\|non\s+([A-Za-z])\)/g,'P($1\\mid \\overline{$2})');
  s=s.replace(/P\(([^|()]+)\|([^()]+)\)/g,'P($1\\mid $2)');
  s=s.replace(/([A-Za-zqQ])([₀-₉ₙ]+)/g,function(_,b,a){return b+'_{'+charsTo(a,SUB)+'}'});
  s=s.replace(/([A-Za-zqQ)])([⁰-⁹ⁿˣ⁻]+)/g,function(_,b,a){return b+'^{'+charsTo(a,SUP)+'}'});
  s=s.replace(/\^(-?\d+|x|n)\b/g,function(_,a){return '^{'+a+'}'});
  s=s.replace(/(\d)\,(\d)/g,'$1{,}$2');
  s=s.replace(/×/g,'\\times ');
  s=s.replace(/−/g,'-');
  s=s.replace(/≈/g,'\\approx ');
  s=s.replace(/≥/g,'\\ge ');s=s.replace(/≤/g,'\\le ');
  s=s.replace(/ω/g,'\\omega ');s=s.replace(/φ/g,'\\varphi ');s=s.replace(/η/g,'\\eta ');s=s.replace(/λ/g,'\\lambda ');s=s.replace(/π/g,'\\pi ');
  s=s.replace(/\bsin\s*\(/g,'\\sin(');s=s.replace(/\bcos\s*\(/g,'\\cos(');s=s.replace(/\blog\s*\(/g,'\\log(');
  s=s.replace(/\b(\d+)\s*\/\s*(\d+)\b/g,'\\frac{$1}{$2}');
  s=s.replace(/\|/g,'\\mid ');
  s=s.replace(/\s+/g,' ').trim();
  return s;
}
function marker(x){return '⟦LATEX:'+toLatex(x)+'⟧'}
function markMath(s){s=fixBadUn(s);var vals=[];function hold(m){var i=vals.length;vals.push(marker(m));return '§§M'+i+'§§'}
  /* Formules longues / spécialisées d'abord. */
  s=s.replace(/P\([^)]+\)\s*=\s*P\([^)]+\)\s*P\([^)]+\)\s*[+−-]\s*P\([^)]+\)\s*P\([^)]+\)/g,hold);
  s=s.replace(/u\(t\)\s*[=≈]\s*[^.;]+/g,hold);
  s=s.replace(/f[’']\(x\)\s*[=≈]\s*[0-9xX()+−\-×*/^.,]+/g,hold);
  s=s.replace(/\by\s*[=≈]\s*[+\-−]?[0-9]+(?:,[0-9]+)?x(?:\s*[+\-−]\s*\d+(?:,\d+)?)?/g,hold);
  s=s.replace(/P\([^)]+\)\s*[=≈]\s*\d+(?:,\d+)?/g,hold);
  s=s.replace(/(?:u[₀-₉0-9ₙn]+)\s*[=≈]\s*(?:u[₀-₉0-9ₙn]+|\d+(?:,\d+)?)(?:\s*[×*]\s*q[⁰-⁹0-9ⁿn^]*)?/g,hold);
  s=s.replace(/\b(?:q|x|ω|f|T|U|I|R|E|P|p|V|S)\s*[=≈]\s*[+\-−]?[0-9A-Za-zπωηλ()/*^.,]+/g,hold);
  s=s.replace(/\(\d+(?:,\d+)?\)\^[xn0-9]+/g,hold);
  s=s.replace(/\bq[⁰-⁹ⁿˣ]+/g,hold);
  s=s.replace(/\bu[₀-₉ₙ]+/g,hold);
  s=s.replace(/P\([^)]+\)/g,hold);
  s=s.replace(/\b\d+\s*\/\s*\d+\b/g,hold);
  return s.replace(/§§M(\d+)§§/g,function(_,i){return vals[Number(i)]});
}
async function latexV1(a,cor,space){var base=V44.makeDocx(a,cor,space),u=new Uint8Array(await base.arrayBuffer()),files=readStoreZip(u),dec=new TextDecoder('utf-8');if(!files['word/document.xml'])throw new Error('document.xml absent');var xml=dec.decode(files['word/document.xml']);var dom=new DOMParser().parseFromString(xml,'application/xml');var nodes=dom.getElementsByTagNameNS(WNS,'t'),count=0;for(var i=0;i<nodes.length;i++){var old=nodes[i].textContent||'',nu=markMath(old);if(nu!==old){nodes[i].textContent=nu;count+=(nu.match(/⟦LATEX:/g)||[]).length}}var ser=new XMLSerializer().serializeToString(dom);files['word/document.xml']=bytes(ser);return {blob:new Blob([makeZip(files)],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),formulaCount:count}}
function nameFor(a,cor){var m=meta(a);return 'Eval_'+m.display+'_'+(cor?'Corrige':'Sujet')+'_CFAI_'+a.className+'_V1_LATEX_'+stamp()+'.docx'}
async function one(cor){var a=current();if(!a){toast('Générez d’abord une évaluation.','warning');return}try{var space=$('v44AnswerSpace')?$('v44AnswerSpace').value:'comfort',r=await latexV1(a,cor,space);dlBlob(nameFor(a,cor),r.blob);toast('Word V1 LaTeX créé : '+r.formulaCount+' formule(s) balisée(s). Sur le PC, lancez FINALISER_WORD_LATEX.cmd.','success')}catch(e){console.error(e);toast('Erreur V4.5 : '+e.message,'error')}}
async function shareBoth(){var a=current();if(!a){toast('Générez d’abord une évaluation.','warning');return}try{var space=$('v44AnswerSpace')?$('v44AnswerSpace').value:'comfort',s=await latexV1(a,false,space),c=await latexV1(a,true,space),f1=new File([s.blob],nameFor(a,false),{type:s.blob.type}),f2=new File([c.blob],nameFor(a,true),{type:c.blob.type});if(navigator.canShare&&navigator.share&&navigator.canShare({files:[f1,f2]})){try{await navigator.share({files:[f1,f2],title:'Word CFAI V1 LaTeX'});return}catch(e){if(e.name==='AbortError')return}}dlBlob(f1.name,s.blob);setTimeout(function(){dlBlob(f2.name,c.blob)},350);toast('Les 2 Word V1 LaTeX sont téléchargés. Finalisez-les sur le PC.','success')}catch(e){console.error(e);toast('Erreur V4.5 : '+e.message,'error')}}
function install(){var card=$('v42QualityCard');if(!card)return false;var old=$('v44WordCfai');if(old)old.style.display='none';if($('v45LatexCfai'))return true;var div=document.createElement('div');div.id='v45LatexCfai';div.className='v42-note';div.style.marginTop='12px';div.innerHTML='<strong>∑ WORD CFAI — V4.5 LATEX PIPELINE</strong><br>Les formules sont conservées en LaTeX canonique dans un Word V1, puis converties sur le PC en <strong>équations Word natives éditables</strong> (OMML). Le bug « un → uₙ » est corrigé dans cette boucle.<div style="margin-top:8px" class="btn-row"><button class="btn btn-sm btn-primary" id="v45Sujet">📄 Sujet V1 LaTeX</button><button class="btn btn-sm btn-outline" id="v45Corr">✅ Corrigé V1 LaTeX</button><button class="btn btn-sm btn-success" id="v45Both">📤 Envoyer les 2 V1</button></div><p class="form-hint">Sur le PC : double-cliquez ensuite sur <b>FINALISER_WORD_LATEX.cmd</b>, choisissez le Word V1 téléchargé et la version <b>_FINAL_LATEX.docx</b> est créée automatiquement.</p>';card.appendChild(div);$('v45Sujet').addEventListener('click',function(e){e.preventDefault();one(false)});$('v45Corr').addEventListener('click',function(e){e.preventDefault();one(true)});$('v45Both').addEventListener('click',function(e){e.preventDefault();shareBoth()});return true}
window.MELEC_V45_LATEX={latexV1:latexV1,markMath:markMath,toLatex:toLatex};
var n=0,t=setInterval(function(){n++;if(install()||n>80)clearInterval(t)},200);
})();