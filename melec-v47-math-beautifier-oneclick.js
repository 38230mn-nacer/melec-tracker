(function(){
'use strict';
var V45=window.MELEC_V45_LATEX, V44=window.MELEC_V44_WORD_CFAI;
if(!V45||!V44){console.error('[V4.7.8] Dépendances V4.4/V4.5 absentes');return;}
function $(id){return document.getElementById(id)}
function api(){return window.MELEC_V42_QUALITY_API}
function current(){var x=api();return x&&x.getCurrent?x.getCurrent():null}
function toast(m,t){if(window.__tracker&&window.__tracker.toast)window.__tracker.toast(m,t||'info',5000)}
function meta(a){return V44.ensureEvalMeta(a)}
function safe(s){return String(s||'').replace(/[^A-Za-z0-9_-]+/g,'_')}
function token(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+'_'+Math.random().toString(36).slice(2,7)}
function dlBlob(name,blob){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},350)}
function launch(tok){try{var a=document.createElement('a');a.href='melecfinal://finalize?token='+encodeURIComponent(tok);a.style.display='none';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)}catch(e){console.warn(e)}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]})}

/* ZIP STORE reader/writer, identique au moteur V4.5 validé */
function r16(u,p){return u[p]|(u[p+1]<<8)}
function r32(u,p){return (u[p]|(u[p+1]<<8)|(u[p+2]<<16)|(u[p+3]<<24))>>>0}
function readStoreZip(u){var files={},p=0,dec=new TextDecoder('utf-8');while(p+30<=u.length&&r32(u,p)===0x04034b50){var method=r16(u,p+8),csize=r32(u,p+18),nlen=r16(u,p+26),xlen=r16(u,p+28);if(method!==0)throw new Error('ZIP non STORE : méthode '+method);var ns=p+30,ds=ns+nlen+xlen,name=dec.decode(u.slice(ns,ns+nlen));files[name]=u.slice(ds,ds+csize);p=ds+csize}return files}
var CRCT=null;
function crcTable(){if(CRCT)return CRCT;CRCT=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);CRCT[n]=c>>>0}return CRCT}
function crc32(u){var t=crcTable(),c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=t[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function cat(arr){var n=arr.reduce(function(s,a){return s+a.length},0),u=new Uint8Array(n),o=0;arr.forEach(function(a){u.set(a,o);o+=a.length});return u}
function bytes(s){return new TextEncoder().encode(s)}
function dosDT(){var d=new Date(),time=((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((Math.floor(d.getSeconds()/2))&31),date=(((d.getFullYear()-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31);return [time,date]}
function makeZip(files){var locals=[],centrals=[],offset=0,dt=dosDT();Object.keys(files).forEach(function(name){var data=files[name],nb=bytes(name),crc=crc32(data);var local=cat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(dt[0]),u16(dt[1]),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),nb,data]);locals.push(local);var central=cat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(dt[0]),u16(dt[1]),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nb]);centrals.push(central);offset+=local.length});var cdir=cat(centrals),body=cat(locals),end=cat([u32(0x06054b50),u16(0),u16(0),u16(centrals.length),u16(centrals.length),u32(cdir.length),u32(body.length),u16(0)]);return cat([body,cdir,end])}

/* V4.7.8 — garde-fou OOXML : répare et valide [Content_Types].xml avant chaque téléchargement. */
function xmlValid(text){try{var d=new DOMParser().parseFromString(text,'application/xml');return d.getElementsByTagName('parsererror').length===0}catch(e){return false}}
function sanitizeContentTypes(files){var key='[Content_Types].xml';if(!files[key])throw new Error('[Content_Types].xml absent');var dec=new TextDecoder('utf-8'),t=dec.decode(files[key]).replace(/^\uFEFF/,'');var i=t.indexOf('<Types');if(i<0)throw new Error('Racine <Types> absente');
  /* Retire tout Default PNG qui aurait été placé AVANT la racine <Types>. */
  var before=t.slice(0,i).replace(/<Default\b[^>]*Extension=["']png["'][^>]*\/>/gi,'');var root=t.slice(i);t=before+root;
  /* Ajoute PNG uniquement DANS <Types> si nécessaire. */
  if(!/<Default\b[^>]*Extension=["']png["']/i.test(root)){var r=t.indexOf('<Types'),e=t.indexOf('>',r);if(e<0)throw new Error('Balise <Types> incomplète');t=t.slice(0,e+1)+'<Default Extension="png" ContentType="image/png"/>'+t.slice(e+1)}
  if(!xmlValid(t))throw new Error('[Content_Types].xml invalide après réparation');files[key]=bytes(t);return files}
function validatePackage(files){var req=['[Content_Types].xml','_rels/.rels','word/document.xml','word/_rels/document.xml.rels'];for(var i=0;i<req.length;i++)if(!files[req[i]])throw new Error('DOCX incomplet : '+req[i]+' absent');var dec=new TextDecoder('utf-8');for(var j=0;j<req.length;j++){if(/\.xml$|\.rels$/.test(req[j])){var tx=dec.decode(files[req[j]]);if(!xmlValid(tx))throw new Error('XML invalide : '+req[j])}}return true}

function autoData(a){var titles=(a.exercises||[]).map(function(e){return e.title}).filter(Boolean);var module=titles.slice(0,2).join(' • ')||'À préciser';var t=module.toLowerCase(),pro='Application des mathématiques/sciences à l’analyse, au contrôle et à la maintenance d’un système électrotechnique.';
 if(/probab|fiabil|contrôle/.test(t))pro='Fiabilité, défauts, diagnostic et contrôle qualité d’une installation électrotechnique.';
 else if(/suite|exponent|consomm/.test(t))pro='Suivi de consommation énergétique, vieillissement et évolution des performances d’une installation.';
 else if(/ajust|statist/.test(t))pro='Analyse de mesures, contrôle de performance et aide à la maintenance d’un équipement électrotechnique.';
 else if(/trigo|sinus/.test(t))pro='Étude de tensions et courants sinusoïdaux en électrotechnique.';
 else if(/dériv|variation|fonction/.test(t))pro='Étude de l’évolution et optimisation d’une grandeur électrique.';
 return {module:module,professional:pro};}
function readFields(a){var d=autoData(a),m=$('v47Module'),p=$('v47Pro');return {module:(m&&m.value.trim())||d.module,professional:(p&&p.value.trim())||d.professional}}
function syncAuthenticCoverMeta(a){
 var d=readFields(a),m=meta(a),all={};
 try{all=JSON.parse(localStorage.getItem('melec_v46_cover_meta'))||{}}catch(e){all={}}
 all[m.code]={module:d.module,professional:d.professional};
 localStorage.setItem('melec_v46_cover_meta',JSON.stringify(all));
 return d;
}
function p(text,size,bold,color,align,after){return '<w:p><w:pPr>'+(align?'<w:jc w:val="'+align+'"/>':'')+'<w:spacing w:after="'+(after||120)+'"/></w:pPr><w:r><w:rPr>'+(bold?'<w:b/>':'')+'<w:color w:val="'+(color||'374151')+'"/><w:sz w:val="'+(size||24)+'"/><w:szCs w:val="'+(size||24)+'"/></w:rPr><w:t xml:space="preserve">'+esc(text)+'</w:t></w:r></w:p>'}
function coverXml(a,cor){var m=meta(a),d=readFields(a),disc=a.discipline==='sciences'?'Sciences physiques':a.discipline==='mixed'?'Mathématiques & Sciences':'Mathématiques',level=(a.level==='TMELEC'?'Terminale Bac Pro MELEC':'Première Bac Pro MELEC');var x='';
 x+=p('ÉVALUATION N° '+m.display+(cor?' — CORRIGÉ':''),44,true,'005C7D','center',220);
 x+=p('MODULE(S) CONCERNÉ(S) : '+d.module,25,false,'005C7D','left',140);
 x+=p('LIEN PROFESSIONNEL ÉLECTROTECHNIQUE : '+d.professional,22,false,'374151','left',170);
 x+=p(level+'  •  '+disc+'  •  '+a.duration+' min',22,false,'5D6D7E','center',240);
 if(!cor){x+='<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:jc w:val="center"/></w:tblPr><w:tblGrid><w:gridCol w:w="5900"/><w:gridCol w:w="3100"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="5900" w:type="dxa"/></w:tcPr>'+p('Nom / Prénom : ______________________________________',22,true,'374151','left',0)+'</w:tc><w:tc><w:tcPr><w:tcW w:w="3100" w:type="dxa"/></w:tcPr>'+p('Note : __________________',22,true,'374151','right',0)+'</w:tc></w:tr></w:tbl>';}
 x+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
 return x;}
function beautifyMarkers(xml){return xml.replace(/⟦LATEX:([^⟧]+)⟧/g,function(all,latex){var s=latex;
 s=s.replace(/\b1\s*\((x[^)]*)\)\s*\((x[^)]*)\)/g,'($1)($2)');
 s=s.replace(/x-\(-([0-9]+(?:\{,\}[0-9]+)?)\)/g,'x+$1');
 s=s.replace(/x-\(([0-9]+(?:\{,\}[0-9]+)?)\)/g,'x-$1');
 s=s.replace(/\+\s*-/g,'-').replace(/-\s*-/g,'+');
 return '⟦LATEX:'+s+'⟧';});}
async function buildV1(a,cor,space){
 var r=await V45.latexV1(a,cor,space);
 var V46=window.MELEC_V46_COVER;
 if(!V46||!V46.addCover)throw new Error('Moteur de couverture Modele_CFAI_V4 absent (V4.6)');
 syncAuthenticCoverMeta(a);
 /* Source de vérité : première page authentique de Modele_CFAI_V4 via le moteur V4.6.
    La couverture comporte le visuel IRI et les logos CFAI, puis un saut de page.
    Le corps d'évaluation commence seulement après cette page 1. */
 var covered=await V46.addCover(r.blob,a,cor);
 var u=new Uint8Array(await covered.arrayBuffer()),files=readStoreZip(u),dec=new TextDecoder('utf-8');
 if(!files['word/document.xml'])throw new Error('document.xml absent');
 var xml=dec.decode(files['word/document.xml']);
 /* Supprime le doublon Classe dans le corps historique V4.4. */
 xml=xml.replace(/Classe\s*:\s*__________________/g,'Note : __________________');
 xml=beautifyMarkers(xml);
 files['word/document.xml']=bytes(xml);
 sanitizeContentTypes(files);
 validatePackage(files);
 return new Blob([makeZip(files)],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function filename(a,cor,tok){var m=meta(a);return 'Eval_'+m.display+'_'+(cor?'Corrige':'Sujet')+'_CFAI_'+safe(a.className)+'_V1_LATEX_V478_'+tok+'.docx'}
async function build(cor,autoLaunch){var a=current();if(!a){toast('Générez d’abord une évaluation.','warning');return}try{var space=$('v44AnswerSpace')?$('v44AnswerSpace').value:'comfort',blob=await buildV1(a,cor,space),tok=token();dlBlob(filename(a,cor,tok),blob);if(autoLaunch){toast('V4.7.8 : DOCX sécurisé. Conversion LaTeX → équations Word en cours…','success');setTimeout(function(){launch(tok)},1600)}}catch(e){console.error(e);toast('Erreur V4.7.8 : '+e.message,'error')}}
async function both(){var a=current();if(!a){toast('Générez d’abord une évaluation.','warning');return}try{var space=$('v44AnswerSpace')?$('v44AnswerSpace').value:'comfort',bs=await buildV1(a,false,space),bc=await buildV1(a,true,space),t1=token(),t2=token();dlBlob(filename(a,false,t1),bs);setTimeout(function(){dlBlob(filename(a,true,t2),bc)},400);toast('Sujet et corrigé V4.7.8 contrôlés. Finalisation automatique…','success');setTimeout(function(){launch(t1)},1400);setTimeout(function(){launch(t2)},3200)}catch(e){console.error(e);toast('Erreur V4.7.8 : '+e.message,'error')}}
function fillAuto(){var a=current();if(!a)return;var d=autoData(a);if($('v47Module'))$('v47Module').value=d.module;if($('v47Pro'))$('v47Pro').value=d.professional}
function install(){var card=$('v42QualityCard');if(!card)return false;var old=$('v47FinalCfai');if(old)old.remove();var v46=$('v46CoverCfai');if(v46)v46.style.display='none';var v45=$('v45LatexCfai');if(v45)v45.style.display='none';var div=document.createElement('div');div.id='v47FinalCfai';div.className='v42-note';div.style.marginTop='12px';div.innerHTML='<strong>✨ WORD FINAL CFAI — V4.7.8 DOCX SAFE ENGINE</strong><br>Le moteur V4.4/V4.5 est conservé. La page 1 reprend la couverture authentique du Modele_CFAI_V4, puis V4.7.8 sécurise le DOCX et finalise les équations Word.<div style="margin-top:9px"><label style="font-weight:700">Module(s) concerné(s)</label><input id="v47Module" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ccd4e3;border-radius:8px"></div><div style="margin-top:8px"><label style="font-weight:700">Lien professionnel électrotechnique</label><textarea id="v47Pro" rows="3" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ccd4e3;border-radius:8px"></textarea></div><div class="btn-row" style="margin-top:9px"><button class="btn btn-sm btn-outline" id="v47Auto">↻ Déduire automatiquement</button><button class="btn btn-sm btn-primary" id="v47Sujet">📄 Word FINAL CFAI — Sujet</button><button class="btn btn-sm btn-outline" id="v47Corr">✅ Word FINAL CFAI — Corrigé</button><button class="btn btn-sm btn-success" id="v47Both">📦 FINAL Sujet + Corrigé</button></div><p class="form-hint"><b>V4.7.8 :</b> page 1 = couverture Modele_CFAI_V4 ; page 2+ = évaluation. Le DOCX est validé avant téléchargement.</p>';card.appendChild(div);fillAuto();$('v47Auto').onclick=function(e){e.preventDefault();fillAuto()};$('v47Sujet').onclick=function(e){e.preventDefault();build(false,true)};$('v47Corr').onclick=function(e){e.preventDefault();build(true,true)};$('v47Both').onclick=function(e){e.preventDefault();both()};return true}
window.MELEC_V47={buildFinal:build,buildBoth:both,buildStableV1:buildV1};
var n=0,t=setInterval(function(){n++;if(install()||n>100)clearInterval(t)},200);
})();
