(function(){
'use strict';
var A=window.MELEC_CFAI_TEMPLATE_ASSETS;
if(!A){console.error('[V4.4 Word CFAI] assets absents');return;}
var META_STORE='melec_v44_eval_meta';
function loadMeta(){try{return JSON.parse(localStorage.getItem(META_STORE))||{counters:{},evals:{}}}catch(e){return {counters:{},evals:{}}}}
function saveMeta(m){localStorage.setItem(META_STORE,JSON.stringify(m))}
function schoolYear(){var d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;return m>=8?(y+'-'+(y+1)):((y-1)+'-'+y)}
function safeCode(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'')}
function discCode(a){return a.discipline==='sciences'?'SCI':a.discipline==='mixed'?'MIX':'MATH'}
function evalKey(a){return String(a&&a.id||a&&a.createdAt||'CURRENT')}
function ensureEvalMeta(a){var m=loadMeta(),k=evalKey(a);if(m.evals[k])return m.evals[k];var ck=schoolYear()+'|'+safeCode(a.className)+'|'+discCode(a);var n=(m.counters[ck]||0)+1;m.counters[ck]=n;var meta={number:n,display:String(n).padStart(2,'0'),schoolYear:schoolYear(),code:safeCode(a.className)+'-'+discCode(a)+'-E'+String(n).padStart(2,'0'),createdAt:Date.now()};m.evals[k]=meta;saveMeta(m);return meta}

function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]})}
function textBytes(s){return new TextEncoder().encode(s)}
function b64Bytes(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function stamp(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())}
function toast(m,t){if(window.__tracker&&window.__tracker.toast)window.__tracker.toast(m,t||'info',3800)}
function dlBlob(name,blob){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},100)}

// ZIP writer STORE (sans compression) : suffisant pour un .docx et totalement hors-ligne.
var CRCT=null;
function crcTable(){if(CRCT)return CRCT;CRCT=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);CRCT[n]=c>>>0}return CRCT}
function crc32(u){var t=crcTable(),c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=t[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function cat(arr){var n=arr.reduce(function(s,a){return s+a.length},0),u=new Uint8Array(n),o=0;arr.forEach(function(a){u.set(a,o);o+=a.length});return u}
function dosDT(){var d=new Date(),time=((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((Math.floor(d.getSeconds()/2))&31),date=(((d.getFullYear()-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31);return [time,date]}
function makeZip(files){var locals=[],centrals=[],offset=0,dt=dosDT();Object.keys(files).forEach(function(name){var data=files[name],nb=textBytes(name),crc=crc32(data);var local=cat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(dt[0]),u16(dt[1]),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),nb,data]);locals.push(local);var central=cat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(dt[0]),u16(dt[1]),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nb]);centrals.push(central);offset+=local.length});var cdir=cat(centrals),body=cat(locals);var end=cat([u32(0x06054b50),u16(0),u16(0),u16(centrals.length),u16(centrals.length),u32(cdir.length),u32(body.length),u16(0)]);return cat([body,cdir,end])}

var sup={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','x':'ˣ','n':'ⁿ','-':'⁻'};
var sub={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','n':'ₙ'};
function mapChars(s,m){return String(s).split('').map(function(c){return m[c]||c}).join('')}
function pretty(s){s=String(s==null?'':s);s=s.replace(/\^(-?\d+|x|n)/g,function(_,a){return mapChars(a,sup)});s=s.replace(/u_?(\d+|n)/g,function(_,a){return 'u'+mapChars(a,sub)});s=s.replace(/q_?(\d+)/g,function(_,a){return 'q'+mapChars(a,sub)});return s}
function run(t,opt){opt=opt||{};var pr='';if(opt.bold)pr+='<w:b/><w:bCs/>';if(opt.italic)pr+='<w:i/><w:iCs/>';if(opt.color)pr+='<w:color w:val="'+opt.color+'"/>';if(opt.size)pr+='<w:sz w:val="'+opt.size+'"/><w:szCs w:val="'+opt.size+'"/>';return '<w:r><w:rPr>'+pr+'</w:rPr><w:t xml:space="preserve">'+esc(pretty(t))+'</w:t></w:r>'}
function para(content,opt){opt=opt||{};var pp='';if(opt.style)pp+='<w:pStyle w:val="'+opt.style+'"/>';if(opt.align)pp+='<w:jc w:val="'+opt.align+'"/>';if(opt.keep)pp+='<w:keepNext/>';if(opt.before!=null||opt.after!=null)pp+='<w:spacing'+(opt.before!=null?' w:before="'+opt.before+'"':'')+(opt.after!=null?' w:after="'+opt.after+'"':'')+'/>';if(opt.border)pp+='<w:pBdr><w:bottom w:val="single" w:sz="'+(opt.border.sz||10)+'" w:space="4" w:color="'+opt.border.color+'"/></w:pBdr>';return '<w:p><w:pPr>'+pp+'</w:pPr>'+content+'</w:p>'}
function cell(content,opt){opt=opt||{};var tc='<w:tcW w:w="'+(opt.w||5000)+'" w:type="dxa"/>';if(opt.fill)tc+='<w:shd w:val="clear" w:color="auto" w:fill="'+opt.fill+'"/>';if(opt.border){var b=opt.border;tc+='<w:tcBorders><w:top w:val="single" w:sz="'+(b.sz||10)+'" w:color="'+b.color+'"/><w:left w:val="single" w:sz="'+(b.sz||10)+'" w:color="'+b.color+'"/><w:bottom w:val="single" w:sz="'+(b.sz||10)+'" w:color="'+b.color+'"/><w:right w:val="single" w:sz="'+(b.sz||10)+'" w:color="'+b.color+'"/></w:tcBorders>'}tc+='<w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>';return '<w:tc><w:tcPr>'+tc+'</w:tcPr>'+content+'</w:tc>'}
function row(cells,cant){return '<w:tr><w:trPr>'+(cant?'<w:cantSplit/>':'')+'</w:trPr>'+cells.join('')+'</w:tr>'}
function table(rows,widths,opt){opt=opt||{};var grid=(widths||[]).map(function(w){return '<w:gridCol w:w="'+w+'"/>'}).join('');var pr='<w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/>';if(opt.align)pr+='<w:jc w:val="'+opt.align+'"/>';return '<w:tbl><w:tblPr>'+pr+'</w:tblPr><w:tblGrid>'+grid+'</w:tblGrid>'+rows.join('')+'</w:tbl>'}
function blankLine(height){return para(run(' '),{after:height||320})}
function fieldPage(){return '<w:r><w:rPr><w:b/><w:color w:val="005C7D"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:b/><w:color w:val="005C7D"/><w:sz w:val="16"/></w:rPr><w:instrText>PAGE</w:instrText></w:r><w:r><w:rPr><w:b/><w:color w:val="005C7D"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:b/><w:color w:val="005C7D"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:b/><w:color w:val="005C7D"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>'}
function fieldPages(){return '<w:r><w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="16"/></w:rPr><w:instrText>NUMPAGES</w:instrText></w:r><w:r><w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>'}
function footerXml(a){var meta=ensureEvalMeta(a);var code=(a.level==='TMELEC'?'TMELEC':'1MELEC')+'_'+(a.discipline==='sciences'?'SCIENCES':a.discipline==='mixed'?'MATHS-SCIENCES':'MATHS')+'_EVAL'+meta.display;return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:space="4" w:color="005C7D"/></w:pBdr><w:tabs><w:tab w:val="center" w:pos="4500"/><w:tab w:val="right" w:pos="9026"/></w:tabs><w:spacing w:before="60" w:after="60"/></w:pPr>'+run(code,{color:'7F7F7F',size:16})+'<w:r><w:tab/></w:r>'+run(meta.code,{bold:true,color:'005C7D',size:16})+'<w:r><w:tab/></w:r>'+fieldPage()+run(' / ',{color:'7F7F7F',size:16})+fieldPages()+'</w:p></w:ftr>'}
function responseLineCount(p,space){var pts=Number(p.points||1),n=2+Math.ceil(pts*1.4);if(p.comp==='REA')n+=2;if(/calcul|résoud|équation|dériv|tableau|tracer|constru|justif|démarche/i.test(String(p.prompt||'')))n+=1;if(space==='compact')n=Math.max(2,n-2);if(space==='comfort')n+=2;return Math.max(3,Math.min(n,10))}
function responseRule(){return para(run(' ',{size:16}),{after:100,border:{color:'B8C2CC',sz:4}})}
function responseBox(p,space){var n=responseLineCount(p,space),inside=para(run('RÉPONSE / DÉMARCHE',{bold:true,color:'6B7785',size:15}),{after:40});for(var i=0;i<n;i++)inside+=responseRule();return table([row([cell(inside,{w:9300,fill:'FBFCFD',border:{color:'AAB7C4',sz:8}})],true)],[9300],{})}

function corrDefaultMethod(p){
 var c=String(p.comp||'').toUpperCase();
 if(p.method&&String(p.method).trim())return String(p.method).trim();
 if(c==='APP')return 'Repérer les données utiles, les unités et la grandeur demandée avant tout calcul.';
 if(c==='ANA')return 'Choisir la relation ou la propriété adaptée, puis justifier ce choix.';
 if(c==='REA')return 'Écrire la relation, remplacer par les valeurs, effectuer les calculs et donner l’unité.';
 if(c==='VAL')return 'Contrôler le signe, l’unité, l’ordre de grandeur et la cohérence du résultat.';
 if(c==='COM')return 'Rédiger une conclusion précise contenant la valeur, l’unité et son interprétation.';
 return 'Présenter une démarche structurée et justifiée.';
}
function corrDefaultCheck(p){
 if(p.check&&String(p.check).trim())return String(p.check).trim();
 var c=String(p.comp||'').toUpperCase();
 if(c==='APP')return 'Toutes les données nécessaires sont identifiées sans ajout inutile.';
 if(c==='ANA')return 'La relation choisie correspond bien aux grandeurs et au contexte.';
 if(c==='REA')return 'Le calcul est traçable et le résultat comporte son unité.';
 if(c==='VAL')return 'Le contrôle permet de confirmer ou de remettre en cause le résultat.';
 if(c==='COM')return 'La phrase répond explicitement à la question posée.';
 return 'Le résultat final est cohérent avec l’énoncé.';
}
function corrCommonError(p){
 var c=String(p.comp||'').toUpperCase(),q=String(p.prompt||'').toLowerCase();
 if(q.indexOf('signe')>-1||q.indexOf('variation')>-1)return 'Conclure sur les variations sans avoir étudié le signe sur chacun des intervalles.';
 if(q.indexOf('probab')>-1)return 'Confondre probabilité conditionnelle et probabilité simple, ou oublier la somme égale à 1 sur un même nœud.';
 if(q.indexOf('fréquence')>-1||q.indexOf('période')>-1)return 'Confondre fréquence, pulsation et période, ou oublier les unités associées.';
 if(q.indexOf('puissance')>-1)return 'Utiliser une formule de puissance inadaptée au régime ou oublier le facteur de puissance.';
 if(q.indexOf('suite')>-1)return 'Confondre suite arithmétique et géométrique, ou décaler le rang dans la formule.';
 if(q.indexOf('dériv')>-1)return 'Donner uniquement les racines sans exploiter le signe de la dérivée pour conclure.';
 if(c==='APP')return 'Commencer à calculer avant d’avoir identifié les données et la grandeur recherchée.';
 if(c==='ANA')return 'Choisir une formule sans vérifier ses conditions d’utilisation.';
 if(c==='REA')return 'Donner seulement le résultat final sans étapes de calcul.';
 if(c==='VAL')return 'Valider automatiquement sans contrôler unité, signe ou ordre de grandeur.';
 if(c==='COM')return 'Donner un nombre isolé sans phrase, unité ni interprétation.';
 return 'Omettre une justification intermédiaire importante.';
}
function corrAnswerParagraphs(answer){
 var s=String(answer==null?'':answer).trim(),out=[];
 if(!s){out.push(para(run('Aucune réponse de référence renseignée.',{italic:true,color:'7F8C8D',size:18}),{after:50}));return out}
 var chunks=s.split(/\s*;\s*/).filter(function(x){return x.trim()});
 if(chunks.length<=1){out.push(para(run(s,{size:19}),{after:55}));return out}
 chunks.forEach(function(x,i){out.push(para(run((i+1)+'. '+x.trim(),{size:19}),{after:40,indent:240}))});
 return out;
}
function corrScale(points){
 var p=Math.max(.5,Number(points||0)),items=[],a,b,c,d;
 if(p<=1)return [['Réponse correcte et exploitable',p]];
 if(p<=2){
   a=Math.round(p*.5*2)/2;
   return [['Choix / identification correcte',a],['Conclusion correcte',Math.round((p-a)*2)/2]];
 }
 a=Math.max(.5,Math.round(p*.2*2)/2);
 b=Math.max(.5,Math.round(p*.3*2)/2);
 c=Math.max(.5,Math.round(p*.3*2)/2);
 d=Math.round((p-a-b-c)*2)/2;
 if(d<.5){d=.5;c=Math.max(.5,Math.round((p-a-b-d)*2)/2)}
 items=[['Mise en place / données / relation',a],['Démarche et calculs intermédiaires',b],['Résultat exact ou numérique',c],['Unité / justification / conclusion',d]];
 return items;
}
function corrDetailedBlock(p,qcode){
 var pts=Number(p.points||0),x='',method=corrDefaultMethod(p),check=corrDefaultCheck(p),err=corrCommonError(p);
 x+=para(run(qcode+'  •  '+p.comp+' — '+String(pts).replace('.',',')+' pt',{bold:true,color:'5C8A2E',size:21}),{after:55});
 x+=para(run('Énoncé rappelé : ',{bold:true,color:'374151',size:18})+run(p.prompt,{size:18}),{after:65});
 x+=para(run('1. Démarche attendue',{bold:true,color:'005C7D',size:19}),{after:35});
 x+=para(run(method,{size:18}),{after:65,indent:240});
 x+=para(run('2. Résolution / réponse détaillée',{bold:true,color:'005C7D',size:19}),{after:35});
 corrAnswerParagraphs(p.answer).forEach(function(z){x+=z});
 x+=para(run('3. Contrôle / validation',{bold:true,color:'005C7D',size:19}),{after:35});
 x+=para(run(check,{size:18}),{after:65,indent:240});
 x+=para(run('4. Barème indicatif',{bold:true,color:'005C7D',size:19}),{after:35});
 corrScale(pts).forEach(function(it){x+=para(run('• '+it[0]+' : '+String(it[1]).replace('.',',')+' pt',{size:17}),{after:25,indent:240})});
 x+=para(run('5. Erreur fréquente à éviter',{bold:true,color:'A93226',size:19}),{after:35,before:30});
 x+=para(run(err,{italic:true,color:'7A271A',size:18}),{after:35,indent:240});
 return x;
}

function docXml(a,cor,space){space=space||'comfort';var meta=ensureEvalMeta(a);var disc=a.discipline==='maths'?'Mathématiques':a.discipline==='sciences'?'Sciences physiques':'Mathématiques & Sciences';var mode=a.mode==='diagnostic'?'Diagnostic':a.mode==='context'?'Évaluation contextualisée MELEC':'Évaluation de cours';var body='';body+=para(run('ÉVALUATION n° '+meta.display+' — '+disc+(cor?' — CORRIGÉ ENSEIGNANT DÉTAILLÉ':''),{bold:true,color:'003B52',size:30}),{align:'center',after:60,border:{color:'005C7D',sz:12}});body+=para(run(mode+'  •  '+(a.level==='TMELEC'?'Terminale Bac Pro MELEC':'Première Bac Pro MELEC')+'  •  Durée : '+a.duration+' min  •  Barème /20',{color:'5D6D7E',size:20}),{align:'center',after:80});body+=para(run('Code évaluation : '+meta.code+'  •  Année : '+meta.schoolYear,{bold:true,color:'005C7D',size:17}),{align:'center',after:120});if(!cor){body+=table([row([cell(para(run('',{size:20}),{after:0}),{w:6500}),cell(para(run('Note : __________________',{bold:true,size:20}),{align:'right',after:0}),{w:2800})],true)],[6500,2800],{});body+=blankLine(80)}
(a.exercises||[]).forEach(function(e,i){var pts=(e.parts||[]).reduce(function(s,p){return s+Number(p.points||0)},0);body+=table([row([cell(para(run('EXERCICE '+(i+1)+' — '+e.title,{bold:true,color:'005C7D',size:23}),{keep:true,after:0}),{w:7700,fill:'E8F2F6',border:{color:'005C7D',sz:10}}),cell(para(run(String(pts).replace('.',',')+' pt',{bold:true,color:'005C7D',size:23}),{align:'right',keep:true,after:0}),{w:1600,fill:'E8F2F6',border:{color:'005C7D',sz:10}})],true)],[7700,1600],{});body+=table([row([cell(para(run(e.context,{size:20}),{after:0}),{w:9300,fill:'F0F3F8',border:{color:'1F3A5F',sz:8}})],true)],[9300],{});body+=blankLine(70);(e.parts||[]).forEach(function(p,j){var qcode='E'+(i+1)+'.'+(j+1);if(!cor){body+=table([row([cell(para(run(qcode+'  '+p.prompt,{size:20}),{after:0,keep:true}),{w:7900}),cell(para(run(String(p.points).replace('.',',')+' pt',{bold:true,color:'C8841C',size:20}),{align:'right',after:0,keep:true}),{w:1400})],true)],[7900,1400],{});body+=responseBox(p,space);body+=blankLine(70)}else{var detail=corrDetailedBlock(p,qcode);body+=table([row([cell(detail,{w:9300,fill:'F6FAF0',border:{color:'5C8A2E',sz:9}})],true)],[9300],{});body+=blankLine(80)}});body+=blankLine(100)});if(cor){body+=table([row([cell(para(run('LECTURE DU CORRIGÉ',{bold:true,color:'005C7D',size:19}),{after:40})+para(run('Ce document est destiné à l’enseignant : les étapes facilitent l’attribution de points partiels et le repérage précis des difficultés. Le barème proposé reste ajustable par l’enseignant.',{size:17}),{after:0}),{w:9300,fill:'EAF3F8',border:{color:'005C7D',sz:8}})],true)],[9300],{});body+=blankLine(80)}if(cor&&a.competencies){var c=a.competencies;body+=table([row([cell(para(run('COMPÉTENCES MOBILISÉES',{bold:true,color:'005C7D',size:19}),{after:60})+para(run('APP '+c.APP+' pt  •  ANA '+c.ANA+' pt  •  REA '+c.REA+' pt  •  VAL '+c.VAL+' pt  •  COM '+c.COM+' pt',{size:17}),{after:0}),{w:9300,fill:'E8F2F6',border:{color:'005C7D',sz:8}})],true)],[9300],{})}
body+='<w:sectPr><w:headerReference w:type="default" r:id="rId7"/><w:footerReference w:type="default" r:id="rId8"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1191" w:left="1134" w:header="720" w:footer="720" w:gutter="0"/><w:cols w:space="720"/><w:docGrid w:linePitch="360"/></w:sectPr>';return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>'+body+'</w:body></w:document>'}
function rels(){return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings" Target="webSettings.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes" Target="endnotes.xml"/><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header2.xml"/><Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer2.xml"/><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/><Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>'}
function types(){return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/><Override PartName="/word/header2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/><Override PartName="/word/endnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'}
function rootRels(){return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'}
function coreProps(){return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Évaluation CFAI - DeltaTracker</dc:title><dc:creator>Institut des Ressources Industrielles - CFAI Lyon</dc:creator><cp:lastModifiedBy>DeltaTracker</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">'+new Date().toISOString()+'</dcterms:created></cp:coreProperties>'}
function appProps(){return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Office Word</Application><Company>Institut des Ressources Industrielles - CFAI Lyon</Company></Properties>'}
function makeDocx(a,cor,space){var files={'[Content_Types].xml':textBytes(types()),'_rels/.rels':textBytes(rootRels()),'docProps/core.xml':textBytes(coreProps()),'docProps/app.xml':textBytes(appProps()),'word/document.xml':textBytes(docXml(a,cor,space)),'word/_rels/document.xml.rels':textBytes(rels()),'word/footer2.xml':textBytes(footerXml(a))};Object.keys(A).forEach(function(k){if(k!=='word/footer2.xml')files[k]=b64Bytes(A[k])});return new Blob([makeZip(files)],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
function api(){return window.MELEC_V42_QUALITY_API}
function current(){var x=api();return x&&x.getCurrent?x.getCurrent():null}
async function shareWord(){var a=current();if(!a){toast('Générez d’abord une évaluation avec QUALITY ENGINE.','warning');return}var meta=ensureEvalMeta(a),space=$('v44AnswerSpace')?$('v44AnswerSpace').value:'comfort',subj=makeDocx(a,false,space),corr=makeDocx(a,true,space),n1='Eval_'+meta.display+'_Sujet_CFAI_'+a.className+'_'+stamp()+'.docx',n2='Eval_'+meta.display+'_Corrige_CFAI_'+a.className+'_'+stamp()+'.docx';var f1=new File([subj],n1,{type:subj.type}),f2=new File([corr],n2,{type:corr.type});if(navigator.canShare&&navigator.share&&navigator.canShare({files:[f1,f2]})){try{await navigator.share({files:[f1,f2],title:'Évaluation CFAI n° '+meta.display});return}catch(e){if(e.name==='AbortError')return}}dlBlob(n1,subj);setTimeout(function(){dlBlob(n2,corr)},350);toast('Sujet et corrigé Word CFAI téléchargés.','success')}
function install(){var card=$('v42QualityCard');if(!card)return false;var old=$('v43WordCfai');if(old)old.remove();if($('v44WordCfai'))return true;var div=document.createElement('div');div.id='v44WordCfai';div.className='v42-note';div.style.marginTop='12px';div.innerHTML='<strong>📄 WORD CFAI — V4.4</strong><br>Numérotation automatique des évaluations, code unique et zones de réponse encadrées avec lignes.<div style="margin-top:8px"><label style="font-weight:700">Espace de réponse : </label><select id="v44AnswerSpace"><option value="comfort" selected>Confort — recommandé</option><option value="standard">Standard</option><option value="compact">Compact</option></select></div><div class="btn-row" style="margin-top:8px"><button class="btn btn-sm btn-primary" id="v44WordSujet">📄 Word CFAI — Sujet</button><button class="btn btn-sm btn-outline" id="v44WordCorr">✅ Word CFAI — Corrigé</button><button class="btn btn-sm btn-success" id="v44WordShare">📤 Envoyer les 2 Word</button></div>';card.appendChild(div);$('v44WordSujet').addEventListener('click',function(e){e.preventDefault();var a=current();if(!a){toast('Générez d’abord une évaluation.','warning');return}var m=ensureEvalMeta(a),space=$('v44AnswerSpace').value;dlBlob('Eval_'+m.display+'_Sujet_CFAI_'+a.className+'_'+stamp()+'.docx',makeDocx(a,false,space))});$('v44WordCorr').addEventListener('click',function(e){e.preventDefault();var a=current();if(!a){toast('Générez d’abord une évaluation.','warning');return}var m=ensureEvalMeta(a),space=$('v44AnswerSpace').value;dlBlob('Eval_'+m.display+'_Corrige_CFAI_'+a.className+'_'+stamp()+'.docx',makeDocx(a,true,space))});$('v44WordShare').addEventListener('click',function(e){e.preventDefault();shareWord()});return true}
window.MELEC_V44_WORD_CFAI={makeDocx:makeDocx,shareWord:shareWord,ensureEvalMeta:ensureEvalMeta};
window.MELEC_V44_META={ensureEvalMeta:ensureEvalMeta,loadMeta:loadMeta};
var n=0,t=setInterval(function(){n++;if(install()||n>60)clearInterval(t)},200);
})();