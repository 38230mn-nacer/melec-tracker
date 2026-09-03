(function(){
'use strict';
var E=window.MELEC_V41_ENGINE;
if(!E){console.error('[V4.2] moteur V4.1 absent');return;}
var STORE='melec_v42_quality_data';
var V41='melec_v41_data';
var COMP=['APP','ANA','REA','VAL','COM'];
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ri(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function ch(a){return a[ri(0,a.length-1)]}
function fmt(x,d){d=d==null?2:d;var y=Math.round(Number(x)*Math.pow(10,d))/Math.pow(10,d);return String(y).replace('.',',')}
function stamp(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())}
function core(){return window.__tracker}
function classes(){var o={};core().data.students.forEach(function(s){o[String(s['class']||'').trim()||'Sans classe']=1});return Object.keys(o).sort()}
function students(c){return core().data.students.filter(function(s){return (String(s['class']||'').trim()||'Sans classe')===c})}
function level(c){var v41=loadV41();if(v41.classLevels&&v41.classLevels[c])return v41.classLevels[c];var x=String(c||'').toUpperCase();return x.indexOf('TMELEC')>-1||x.indexOf('TERM')>-1?'TMELEC':'1MELEC'}
function toast(m,t){if(core()&&core().toast)core().toast(m,t||'info',3600)}
function dl(n,type,text){var b=new Blob([text],{type:type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},0)}
function load(){try{return Object.assign({version:'4.2',history:[],assessments:[]},JSON.parse(localStorage.getItem(STORE))||{})}catch(e){return {version:'4.2',history:[],assessments:[]}}}
function save(){localStorage.setItem(STORE,JSON.stringify(qd))}
function loadV41(){try{return JSON.parse(localStorage.getItem(V41))||{}}catch(e){return {}}}
var qd=load(),current=null;

function part(comp,prompt,answer,points,method,check){return {comp:comp,prompt:prompt,answer:answer,points:points,method:method||'',check:check||''}}
function ex(id,level0,disc,kids,title,context,minutes,parts,tags){return {id:id,level:level0,discipline:disc,knowledgeIds:kids,title:title,context:context,minutes:minutes,parts:parts,tags:tags||[]}}

/* Les scénarios ci-dessous évaluent plusieurs compétences dans un même exercice.
   Les nombres changent à chaque génération afin d'obtenir un très grand nombre de variantes. */
var SC=[];

// -------- Terminale Maths --------
SC.push(function(){var u0=ri(120,260),q=ch([1.03,1.04,1.05,1.08]),n=ri(4,8),un=u0*Math.pow(q,n),sum=u0*(1-Math.pow(q,n+1))/(1-q);return ex('MT-GEO-ENERGIE','TMELEC','maths',['MT-SUIT-GEO'],'Évolution d’une consommation','Un atelier suit une consommation annuelle modélisée par une suite géométrique. La première valeur est u0='+u0+' kWh et la raison q='+fmt(q)+'.',18,[
part('APP','Relever le premier terme, la raison et préciser ce que représente u'+n+'.','u0='+u0+' kWh ; q='+fmt(q)+' ; u'+n+' représente la consommation à la période '+n+'.',2,'Identifier les données sans calculer.'),
part('ANA','Choisir une expression permettant de calculer u'+n+'.','u'+n+' = u0 × q^'+n+'.',2,'Reconnaître une suite géométrique.'),
part('REA','Calculer u'+n+' et arrondir au dixième.','u'+n+' ≈ '+fmt(un,1)+' kWh.',3,'Appliquer u_n=u_0 q^n.'),
part('REA','Calculer la consommation cumulée de u0 à u'+n+'.','Somme ≈ '+fmt(sum,1)+' kWh.',3,'Utiliser la somme des termes géométriques.'),
part('VAL','La valeur trouvée pour u'+n+' est-elle cohérente avec q>1 ? Justifier.','Oui : q>1 et u0>0, la suite est croissante ; u'+n+' doit être supérieur à '+u0+'.',2,'Contrôler le sens de variation.'),
part('COM','Rédiger une phrase interprétant le résultat de u'+n+'.','Conclusion attendue : à la période '+n+', la consommation modélisée est d’environ '+fmt(un,1)+' kWh.',1)
],['MELEC','énergie']);});

SC.push(function(){var a=ch([0.8,1.1,1.4,1.6]),b=ri(12,38),x=ri(45,90),pred=a*x+b,real=Math.round(pred+ri(-8,8));return ex('MT-STAT-AJUST','TMELEC','maths',['MT-STAT2'],'Ajustement d’un nuage de points','Une étude met en relation la charge x (%) d’un équipement et une grandeur y. Un ajustement affine donne y='+fmt(a)+'x+'+b+'.',17,[
part('APP','Identifier la variable explicative, la variable estimée et l’équation du modèle.','Variable explicative : x (charge). Variable estimée : y. Modèle : y='+fmt(a)+'x+'+b+'.',2),
part('ANA','Expliquer ce qu’il faut faire pour prévoir y lorsque x='+x+'.','Remplacer x par '+x+' dans l’équation d’ajustement.',2),
part('REA','Calculer la valeur prévue de y pour x='+x+'.','y='+fmt(a)+'×'+x+'+'+b+'='+fmt(pred)+'.',3),
part('VAL','La mesure réelle vaut '+real+'. Calculer l’écart absolu modèle/mesure.','Écart = |'+fmt(pred)+'−'+real+'| = '+fmt(Math.abs(pred-real))+'.',2),
part('COM','Rédiger une conclusion sur la prévision et rappeler une limite de l’extrapolation.','Prévision ≈ '+fmt(pred)+'. Une extrapolation loin du domaine observé doit être interprétée avec prudence.',2)
],['MELEC','données']);});

SC.push(function(){var pa=ch([0.2,0.25,0.3,0.4]),pba=ch([0.1,0.15,0.2,0.25]),pbna=ch([0.03,0.05,0.08,0.1]),pb=pa*pba+(1-pa)*pbna;return ex('MT-PROBA-MAINT','TMELEC','maths',['MT-PROBA'],'Contrôle et probabilité','Sur un lot, A désigne « équipement ancien » et B « défaut détecté ». P(A)='+fmt(pa)+', P(B|A)='+fmt(pba)+' et P(B|non A)='+fmt(pbna)+'.',18,[
part('APP','Relever les trois probabilités données et identifier l’événement recherché si l’on veut connaître la fréquence globale des défauts.','Données : P(A), P(B|A), P(B|non A). Événement recherché : B.',2),
part('ANA','Construire mentalement ou sur brouillon l’arbre utile et indiquer la formule des probabilités totales pour P(B).','P(B)=P(A)P(B|A)+P(non A)P(B|non A).',3),
part('REA','Calculer P(B).','P(B)='+fmt(pa)+'×'+fmt(pba)+'+'+fmt(1-pa)+'×'+fmt(pbna)+'='+fmt(pb)+'.',3),
part('VAL','Vérifier que la valeur obtenue est une probabilité plausible.','Oui, '+fmt(pb)+' est compris entre 0 et 1.',1),
part('COM','Exprimer le résultat en pourcentage dans une phrase.','Environ '+fmt(pb*100,1)+' % des équipements présentent un défaut selon ce modèle.',2)
],['MELEC','maintenance']);});

SC.push(function(){var a=ch([1,2,3]),r1=ri(-4,-1),r2=ri(1,4);return ex('MT-POLY3-VAR','TMELEC','maths',['MT-POLY3'],'Étude des variations','On étudie une fonction f dont la dérivée est f’(x)='+a+'(x−('+r1+'))(x−('+r2+')).',18,[
part('APP','Identifier les valeurs de x qui annulent f’.','x='+r1+' et x='+r2+'.',2),
part('ANA','Étudier le signe de f’ sur les trois intervalles déterminés par ces valeurs.','Comme '+a+'>0 : f’ est positive à l’extérieur des racines et négative entre elles.',3),
part('REA','En déduire les variations de f.','f croît jusqu’à '+r1+', décroît de '+r1+' à '+r2+', puis croît après '+r2+'.',3),
part('VAL','Quel type d’extremum local est associé à x='+r1+' puis x='+r2+' ?','Maximum local en x='+r1+' ; minimum local en x='+r2+'.',2),
part('COM','Présenter les variations sous forme d’une phrase ou d’un tableau clair.','Présentation cohérente avec les trois intervalles et les deux extremums.',2)
],['fonction']);});

SC.push(function(){var q=ch([1.05,1.08,1.1,1.2]),n=ri(8,18),a=Math.pow(q,n);return ex('MT-EXP-DECROISS','TMELEC','maths',['MT-EXPLOG'],'Modèle exponentiel','Une grandeur est multipliée à chaque période par q='+fmt(q)+'. On cherche au bout de combien de périodes le facteur cumulé atteint environ '+fmt(a,2)+'.',16,[
part('APP','Identifier la base de l’exponentielle et la valeur cible.','Base q='+fmt(q)+' ; cible ≈ '+fmt(a,2)+'.',2),
part('ANA','Écrire l’équation à résoudre.','('+fmt(q)+')^x ≈ '+fmt(a,2)+'.',2),
part('REA','À l’aide de la calculatrice ou d’un outil numérique, déterminer x.','x ≈ '+n+'.',3),
part('VAL','Vérifier en calculant q^'+n+'.','q^'+n+' ≈ '+fmt(a,2)+', donc la solution est cohérente.',2),
part('COM','Interpréter x dans le contexte.','La grandeur atteint le facteur cible après environ '+n+' périodes.',1)
],['modélisation']);});

SC.push(function(){var f=ch([25,50,60,100]),A=ch([12,24,48,230,325]),phi=ch([0,Math.PI/6,Math.PI/4]);var w=2*Math.PI*f,T=1/f;return ex('MT-TRIG-SIGNAL','TMELEC','maths',['MT-TRIG'],'Signal sinusoïdal','Une tension est modélisée par u(t)='+A+' sin('+Math.round(w)+' t + '+fmt(phi,2)+').',17,[
part('APP','Identifier l’amplitude et la pulsation ω.','Amplitude '+A+' ; ω≈'+Math.round(w)+' rad/s.',2),
part('ANA','Choisir la relation entre ω et la fréquence f.','ω=2πf, donc f=ω/(2π).',2),
part('REA','Calculer la fréquence et la période T.','f≈'+f+' Hz ; T=1/f='+fmt(T,4)+' s.',3),
part('VAL','Vérifier l’ordre de grandeur de la période.','À '+f+' Hz, une période de quelques '+fmt(T*1000,1)+' ms est cohérente.',2),
part('COM','Expliquer en une phrase ce que représente la période.','La période est la durée d’un motif complet du signal.',1)
],['MELEC','signal']);});

// -------- Première Maths --------
SC.push(function(){var u0=ri(15,50),r=ri(2,8),n=ri(6,14),un=u0+n*r,sum=(n+1)*(u0+un)/2;return ex('M1-ARITH-PROG','1MELEC','maths',['M1-SUIT-AR'],'Suite arithmétique et planification','Le nombre d’éléments traités augmente régulièrement : u0='+u0+' et la raison vaut '+r+'.',17,[
part('APP','Identifier le premier terme, la raison et la nature de la suite.','u0='+u0+' ; r='+r+' ; suite arithmétique.',2),
part('ANA','Écrire l’expression de u'+n+' à partir de u0 et r.','u'+n+'=u0+'+n+'r.',2),
part('REA','Calculer u'+n+'.','u'+n+'='+un+'.',3),
part('REA','Calculer u0+u1+…+u'+n+'.','Somme = '+sum+'.',3),
part('VAL','Justifier le sens de variation.','r>0 donc la suite est croissante.',1),
part('COM','Interpréter u'+n+' dans le contexte.','À la période '+n+', '+un+' éléments sont traités.',1)
],['planification']);});

SC.push(function(){var r1=ri(-6,-1),r2=ri(2,8);return ex('M1-POLY2-SIGNE','1MELEC','maths',['M1-POLY2'],'Polynôme du second degré','On étudie f(x)=(x−('+r1+'))(x−('+r2+')).',17,[
part('APP','Lire les racines directement dans la forme factorisée.','Racines : '+r1+' et '+r2+'.',2),
part('ANA','Déterminer le signe du produit sur les intervalles délimités par les racines.','Positif à l’extérieur, négatif entre '+r1+' et '+r2+'.',3),
part('REA','Résoudre f(x)≥0.','x≤'+r1+' ou x≥'+r2+'.',3),
part('VAL','Vérifier le signe de f(0).','f(0)=('+(-r1)+')×('+(-r2)+')='+((-r1)*(-r2))+', cohérent avec le tableau.',2),
part('COM','Présenter clairement l’ensemble solution.','S = ]−∞ ; '+r1+'] ∪ ['+r2+' ; +∞[.',1)
],['fonction']);});

SC.push(function(){var a=ch([1,2,3]),h=ri(-4,5),k=ri(-8,20),b=-2*a*h,c=a*h*h+k;return ex('M1-DERIV-OPT','1MELEC','maths',['M1-DERIV'],'Dérivée et extremum','Une grandeur est modélisée par f(x)='+a+'x² '+(b>=0?'+ '+b:'− '+(-b))+'x '+(c>=0?'+ '+c:'− '+(-c))+'.',18,[
part('APP','Identifier les coefficients utiles a et b.','a='+a+' ; b='+b+'.',1),
part('REA','Calculer f’(x).','f’(x)='+(2*a)+'x '+(b>=0?'+ '+b:'− '+(-b))+'.',3),
part('ANA','Résoudre f’(x)=0 et expliquer pourquoi cette valeur est importante.','x='+h+' ; c’est l’abscisse d’un extremum.',3),
part('VAL','Comme a>0, préciser la nature de l’extremum.','Minimum.',2),
part('COM','Rédiger la conclusion : où la grandeur est-elle minimale ?','La grandeur est minimale pour x='+h+'.',1)
],['optimisation']);});

SC.push(function(){var x=ch([3,4,5,6]),y=ch([3,4,5,8]);return ex('M1-VECT-DEPL','1MELEC','maths',['M1-VECT'],'Vecteur et déplacement','Dans un plan, le déplacement d’un point A vers B est représenté par le vecteur AB=('+x+' ; '+y+').',15,[
part('APP','Identifier les deux coordonnées du vecteur.','('+x+' ; '+y+').',1),
part('ANA','Choisir la relation permettant de calculer la norme dans un repère orthonormé.','||AB||=√(x²+y²).',2),
part('REA','Calculer la norme du vecteur.','||AB||=√'+(x*x+y*y)+'≈'+fmt(Math.sqrt(x*x+y*y))+'.',3),
part('VAL','Vérifier que la norme est supérieure à la valeur absolue de chacune des coordonnées.','Oui, la norme est '+fmt(Math.sqrt(x*x+y*y))+', supérieure à '+Math.max(x,y)+'.',1),
part('COM','Interpréter la norme.','Elle représente la longueur du déplacement AB dans l’unité du repère.',1)
],['géométrie']);});

// -------- Sciences Terminale --------
SC.push(function(){var Ueff=ch([12,24,48,230]),C=ch([470,1000,2200]),f=50;return ex('ST-PONT-FILTRE','TMELEC','sciences',['ST-RED'],'Redressement et filtrage','On observe au laboratoire une tension alternative de '+Ueff+' V efficace à '+f+' Hz, un pont de diodes puis un condensateur de '+C+' µF.',18,[
part('APP','Identifier la fonction assurée par le pont de diodes puis celle du condensateur.','Pont : redressement double alternance. Condensateur : filtrage/lissage.',2),
part('ANA','Décrire qualitativement la forme de la tension à la sortie du pont avant filtrage.','Tension redressée double alternance, restant pulsée.',2),
part('REA','La fréquence du réseau vaut '+f+' Hz. Quelle est la fréquence principale de l’ondulation après redressement double alternance ?','Environ '+(2*f)+' Hz.',2,'Deux alternances redressées par période réseau.'),
part('VAL','Si la capacité du condensateur augmente, comment évolue en général l’ondulation ?','Elle diminue : le filtrage est plus efficace, toutes choses égales par ailleurs.',2),
part('COM','Rédiger la chaîne de transformation énergétique/électrique en quelques mots.','Alternatif → redressé pulsé → continu filtré (avec ondulation résiduelle).',2)
],['MELEC','TP']);});

SC.push(function(){var Pin=ch([900,1200,1500,2200,3000]),eta=ch([0.72,0.78,0.82,0.86,0.9]),Pout=Pin*eta,loss=Pin-Pout;return ex('ST-MOTEUR-BILAN','TMELEC','sciences',['ST-MOT'],'Bilan de puissance d’un moteur','Un moteur absorbe une puissance électrique de '+Pin+' W et son rendement est η='+fmt(eta)+'.',18,[
part('APP','Identifier la puissance d’entrée et la grandeur sans unité donnée.','Puissance absorbée '+Pin+' W ; rendement η='+fmt(eta)+'.',2),
part('ANA','Écrire la relation permettant de déterminer la puissance utile à partir du rendement.','η=Putile/Pabsorbée donc Putile=η×Pabsorbée.',3),
part('REA','Calculer la puissance mécanique utile.','Putile='+fmt(Pout)+' W.',3),
part('REA','Calculer les pertes de puissance.','Pertes='+Pin+'−'+fmt(Pout)+'='+fmt(loss)+' W.',2),
part('VAL','Vérifier la cohérence : la puissance utile doit-elle être supérieure ou inférieure à la puissance absorbée ?','Inférieure car η<1 ; le résultat est cohérent.',2),
part('COM','Rédiger une conclusion énergétique en une phrase.','Le moteur fournit environ '+fmt(Pout)+' W utiles et dissipe environ '+fmt(loss)+' W de pertes.',1)
],['MELEC','moteur']);});

SC.push(function(){var V=ch([127,230,240]),U=Math.sqrt(3)*V;return ex('ST-TRIPHASE','TMELEC','sciences',['ST-TRI'],'Réseau triphasé','Sur un réseau triphasé équilibré, la tension simple mesurée vaut V='+V+' V.',16,[
part('APP','Préciser ce que l’on cherche lorsque l’on demande la tension composée.','La tension entre deux phases.',2),
part('ANA','Choisir la relation fournie entre tension simple et tension composée.','U=√3×V.',2),
part('REA','Calculer la tension composée.','U=√3×'+V+'≈'+fmt(U,0)+' V.',3),
part('VAL','Comparer l’ordre de grandeur de U et V.','U doit être supérieure à V d’un facteur ≈1,73 ; c’est cohérent.',2),
part('COM','Présenter le résultat avec son unité et le vocabulaire adapté.','La tension composée vaut environ '+fmt(U,0)+' V.',1)
],['MELEC','réseau']);});

SC.push(function(){var U=ch([12,24,48]),Ah=ch([20,40,50,75,100]),Ew=U*Ah,P=ch([60,120,240,400]),t=Ew/P;return ex('ST-BATTERIE','TMELEC','sciences',['ST-BAT'],'Énergie stockée dans un accumulateur','Un accumulateur est caractérisé par '+U+' V et '+Ah+' Ah. On alimente une charge moyenne de '+P+' W.',18,[
part('APP','Relever la tension, la capacité et la puissance de la charge.','U='+U+' V ; capacité='+Ah+' Ah ; P='+P+' W.',2),
part('ANA','Choisir une relation simple pour estimer l’énergie électrique disponible en Wh.','E≈U×capacité(Ah).',2),
part('REA','Calculer l’énergie stockée en Wh puis en kWh.','E≈'+Ew+' Wh = '+fmt(Ew/1000)+' kWh.',3),
part('REA','Estimer l’autonomie idéale avec t=E/P.','t≈'+fmt(t)+' h.',2),
part('VAL','Pourquoi cette autonomie réelle peut-elle être plus faible ?','Pertes, rendement, profondeur de décharge, variation de la charge, conditions d’usage.',2),
part('COM','Rédiger une conclusion donnant l’autonomie idéale et une réserve sur le réel.','Autonomie idéale ≈ '+fmt(t)+' h ; en pratique elle sera souvent inférieure.',1)
],['MELEC','stockage']);});

SC.push(function(){return ex('ST-CORROSION','TMELEC','sciences',['ST-REDOX','ST-CORR'],'Corrosion et protection','On compare une pièce d’acier seule et une pièce d’acier reliée électriquement à un métal plus facilement oxydable dans un électrolyte.',18,[
part('APP','Identifier le phénomène étudié et le rôle attendu du second métal.','Corrosion électrochimique ; le second métal joue le rôle d’anode sacrificielle.',2),
part('ANA','Expliquer pourquoi le métal sacrificiel doit s’oxyder plus facilement que le fer.','Il doit fournir préférentiellement les électrons et subir l’oxydation à la place de l’acier.',3),
part('REA','Écrire le principe d’une demi-équation d’oxydation d’un métal M.','M → M^n+ + n e−.',2),
part('VAL','Quelle observation expérimentale permettrait de confirmer que la protection fonctionne ?','Diminution/absence de corrosion de l’acier et corrosion du métal sacrificiel.',2),
part('COM','Formuler le principe de la protection en une phrase claire.','L’anode sacrificielle s’oxyde préférentiellement et protège l’acier.',1)
],['MELEC','chimie']);});

SC.push(function(){var f=ch([170,340,680,1000,2000]),c=340,lam=c/f,d=ch([5,10,20]),t=d/c;return ex('ST-ACOUSTIQUE','TMELEC','sciences',['ST-ACOU'],'Propagation d’un son','Dans l’air, on prend la célérité c=340 m/s. Un signal sonore de fréquence f='+f+' Hz se propage sur '+d+' m.',17,[
part('APP','Identifier c, f et la distance de propagation.','c=340 m/s ; f='+f+' Hz ; d='+d+' m.',2),
part('ANA','Choisir la relation permettant de calculer la longueur d’onde.','λ=c/f.',2),
part('REA','Calculer λ.','λ='+fmt(lam)+' m.',3),
part('REA','Calculer la durée de propagation t=d/c.','t='+fmt(t,4)+' s.',2),
part('VAL','Vérifier les unités des deux résultats.','λ en m ; t en s.',1),
part('COM','Rédiger une phrase donnant les deux résultats.','Le son a une longueur d’onde d’environ '+fmt(lam)+' m et met '+fmt(t,4)+' s pour parcourir '+d+' m.',1)
],['ondes']);});

// -------- Sciences Première --------
SC.push(function(){var U=ch([12,24,48,230]),I=ch([1.2,2,3.5,5,8]),P=U*I,t=ch([0.5,1,1.5,2,3]),Ew=P*t;return ex('S1-PUISSANCE-ENERGIE','1MELEC','sciences',['S1-PUI-DC'],'Puissance et énergie en régime continu','Un appareil fonctionne sous '+U+' V et est traversé par un courant de '+fmt(I)+' A pendant '+fmt(t)+' h.',18,[
part('APP','Relever U, I et la durée d’utilisation.','U='+U+' V ; I='+fmt(I)+' A ; t='+fmt(t)+' h.',2),
part('ANA','Choisir la relation de puissance adaptée au régime continu.','P=U×I.',2),
part('REA','Calculer la puissance reçue.','P='+fmt(P)+' W.',3),
part('REA','Calculer l’énergie reçue en Wh puis en kWh.','E='+fmt(Ew)+' Wh = '+fmt(Ew/1000)+' kWh.',3),
part('VAL','Vérifier la cohérence des unités.','W pour la puissance ; Wh ou kWh pour l’énergie.',1),
part('COM','Rédiger une conclusion distinguant puissance et énergie.','L’appareil reçoit '+fmt(P)+' W et consomme '+fmt(Ew/1000)+' kWh pendant la durée donnée.',1)
],['MELEC','électricité']);});

SC.push(function(){var U=230,I=ch([2,4,6,8,10]),cos=ch([0.7,0.8,0.85,0.9,0.95]),P=U*I*cos;return ex('S1-PUISSANCE-ACTIVE','1MELEC','sciences',['S1-PUI-AC'],'Puissance active en alternatif','Un récepteur monophasé fonctionne sous 230 V, avec I='+I+' A et cosφ='+fmt(cos)+'.',17,[
part('APP','Identifier U, I et le facteur de puissance.','U=230 V ; I='+I+' A ; cosφ='+fmt(cos)+'.',2),
part('ANA','Choisir la relation de puissance active.','P=U×I×cosφ.',2),
part('REA','Calculer la puissance active.','P=230×'+I+'×'+fmt(cos)+'='+fmt(P)+' W.',3),
part('VAL','Comparer P à la puissance apparente U×I.','P doit être ≤ U×I puisque cosφ≤1 ; cohérent.',2),
part('COM','Expliquer brièvement le rôle du facteur de puissance dans le calcul.','Il tient compte du déphasage et réduit la puissance active par rapport à U×I si cosφ<1.',2)
],['MELEC','électricité']);});

SC.push(function(){var R=ch([0.5,1,1.5,2,4]),I=ch([3,4,5,6,8]),P=R*I*I;return ex('S1-JOULE','1MELEC','sciences',['S1-JOULE'],'Pertes par effet Joule','Un conducteur de résistance R='+fmt(R)+' Ω est parcouru par un courant I='+I+' A.',16,[
part('APP','Identifier les grandeurs données et leur unité.','R='+fmt(R)+' Ω ; I='+I+' A.',1),
part('ANA','Choisir la relation de puissance dissipée par effet Joule.','P=R I².',2),
part('REA','Calculer la puissance dissipée.','P='+fmt(P)+' W.',3),
part('VAL','Si le courant double, par quel facteur la puissance Joule est-elle multipliée ?','Par 4 car P est proportionnelle à I².',2),
part('COM','Proposer une conséquence pratique pour limiter les pertes en ligne.','Réduire le courant pour une puissance transportée donnée, notamment en élevant la tension.',2)
],['MELEC','électricité']);});

SC.push(function(){var F=ch([100,200,500,800,1000]),S=ch([0.01,0.02,0.05,0.1]),p=F/S;return ex('S1-PRESSION','1MELEC','sciences',['S1-PRESS'],'Pression et force pressante','Une force de '+F+' N s’exerce uniformément sur une surface de '+fmt(S)+' m².',16,[
part('APP','Relever la force, la surface et leur unité.','F='+F+' N ; S='+fmt(S)+' m².',1),
part('ANA','Choisir la relation entre pression, force et surface.','p=F/S.',2),
part('REA','Calculer la pression.','p='+fmt(p)+' Pa.',3),
part('VAL','Que devient la pression si la surface est divisée par 2 à force constante ?','Elle double.',2),
part('COM','Rédiger la réponse finale avec unité.','La pression vaut '+fmt(p)+' Pa.',1)
],['mécanique']);});

SC.push(function(){var v0=ri(0,10),a=ch([1,1.5,2,2.5,3]),t=ri(3,8),v=v0+a*t;return ex('S1-MOUVEMENT','1MELEC','sciences',['S1-MECA'],'Mouvement rectiligne','Un mobile a une vitesse initiale de '+v0+' m/s et une accélération constante de '+fmt(a)+' m/s² pendant '+t+' s.',16,[
part('APP','Identifier v0, a et Δt.','v0='+v0+' m/s ; a='+fmt(a)+' m/s² ; Δt='+t+' s.',1),
part('ANA','Choisir la relation adaptée.','v=v0+aΔt.',2),
part('REA','Calculer la vitesse finale.','v='+fmt(v)+' m/s.',3),
part('VAL','La vitesse doit-elle augmenter ou diminuer ici ?','Augmenter car a>0 ; le résultat est cohérent.',2),
part('COM','Donner le résultat avec une phrase et l’unité.','Après '+t+' s, la vitesse vaut '+fmt(v)+' m/s.',1)
],['mécanique']);});

// -------- Prérequis contextualisés, utilisables uniquement si option --------
SC.push(function(){var a=ri(2,9),x=ri(-8,10),b=ri(-12,12),c=a*x+b;return ex('PRE-EQ1','BOTH','maths',['M-PRE-EQ1'],'Équation du premier degré','Pour déterminer une grandeur inconnue, on aboutit à l’équation '+a+'x '+(b>=0?'+ '+b:'− '+(-b))+' = '+c+'.',10,[
part('APP','Identifier l’inconnue et les termes numériques connus.','Inconnue : x ; données : '+a+', '+b+', '+c+'.',1),
part('ANA','Indiquer les opérations inverses à effectuer pour isoler x.','Retirer '+b+' puis diviser par '+a+' (avec adaptation au signe).',2),
part('REA','Résoudre l’équation.','x='+x+'.',3),
part('VAL','Vérifier par substitution dans l’équation initiale.','En remplaçant x par '+x+', le membre de gauche vaut '+c+'.',1)
],['prérequis']);});

SC.push(function(){var a=ri(1,9),b=ri(2,10),c=ri(1,9),d=ri(2,10),num=a*d+c*b,den=b*d;function gcd(x,y){while(y){var t=y;y=x%y;x=t}return Math.abs(x)}var g=gcd(num,den),sn=num/g,sd=den/g;return ex('PRE-FRACTION','BOTH','maths',['M-PRE-FRAC'],'Calcul fractionnaire','On doit additionner les deux fractions '+a+'/'+b+' et '+c+'/'+d+'.',10,[
part('APP','Identifier les deux dénominateurs.','Dénominateurs : '+b+' et '+d+'.',1),
part('ANA','Expliquer pourquoi on ne peut pas additionner directement les numérateurs si les dénominateurs sont différents.','Il faut d’abord écrire les fractions avec un dénominateur commun.',2),
part('REA','Calculer et simplifier la somme.','Somme = '+sn+'/'+sd+(sd===1?' = '+sn:'')+'.',3),
part('VAL','Donner une vérification décimale approchée.','Valeur ≈ '+fmt(num/den)+'.',1)
],['prérequis']);});

function validScenario(s,l,d,allowPre){if(s.level!=='BOTH'&&s.level!==l)return false;if(d!=='mixed'&&s.discipline!==d)return false;if(!allowPre&&s.tags.indexOf('prérequis')>-1)return false;return true}
function scenarioInstances(l,d,allowPre){var out=[];SC.forEach(function(f){try{var s=f();if(validScenario(s,l,d,allowPre))out.push(s)}catch(e){console.warn('[V4.2] scenario',e)}});return out}
function genericExercise(l,d,kid){var k=E.knowledgeById(kid);if(!k)return null;var virtual=E.applicable(l,d,kid,'mixed');if(!virtual.length)return null;var by={};virtual.forEach(function(t){if(!by[t.comp])by[t.comp]=t});var parts=[];COMP.forEach(function(c){if(by[c]){var q=E.build(by[c]);parts.push(part(c,q.question,q.answer,c==='REA'?2:1.5,'Réponse de référence : '+q.answer))}});if(parts.length<3)return null;return ex('GEN-'+kid,l,k.discipline,[kid],k.label,'Exercice génératif ciblé sur la notion « '+k.label+' ». Les valeurs et formulations varient à chaque génération.',Math.max(12,parts.length*3),parts,['génératif'])}
function v41Average(className,kid){var v=loadV41(),ids={};students(className).forEach(function(s){ids[s.id]=1});var by={};(v.knowledgeObservations||[]).filter(function(o){return ids[o.studentId]&&o.knowledgeId===kid}).forEach(function(o){(by[o.studentId]||(by[o.studentId]=[])).push(o)});var vals=[];Object.keys(by).forEach(function(id){var a=by[id].sort(function(x,y){return x.date-y.date}).slice(-5);vals.push(a.reduce(function(s,o){return s+o.score},0)/a.length)});return vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:null}
function selectScenarios(className,l,d,mode,duration,kids,allowPre,adapt){var all=scenarioInstances(l,d,allowPre);if(mode==='context'){var ctx=all.filter(function(s){return s.tags.indexOf('MELEC')>-1});if(ctx.length)all=ctx}
 var target=duration===120?6:duration===60?3:1,generic=[];
 if(kids&&kids.length){var filtered=all.filter(function(s){return s.knowledgeIds.some(function(k){return kids.indexOf(k)>-1})});all=filtered;kids.forEach(function(kid){if(!all.some(function(s){return s.knowledgeIds.indexOf(kid)>-1})){var g=genericExercise(l,d,kid);if(g)generic.push(g)}})}
 var recent=qd.history.slice(-12),fresh=all.filter(function(s){return recent.indexOf(s.id)<0});if(fresh.length>=2)all=fresh;
 if(adapt){all.sort(function(a,b){function w(s){var vals=s.knowledgeIds.map(function(k){return v41Average(className,k)}).filter(function(x){return x!==null});return vals.length?vals.reduce(function(x,y){return x+y},0)/vals.length:3}return w(a)-w(b)})}
 var chosen=[];while(all.length&&chosen.length<target){var range=Math.min(all.length,adapt?Math.max(2,Math.ceil(all.length/2)):all.length),idx=ri(0,range-1);chosen.push(all.splice(idx,1)[0])}
 while(generic.length&&chosen.length<target)chosen.push(generic.shift());
 if(chosen.length<target&&!kids.length&&mode!=='context'){var candidates=E.knowledge.filter(function(k){return k.levels.indexOf(l)>-1&&(d==='mixed'||k.discipline===d)&&(allowPre||k.group!=='Prérequis')});while(candidates.length&&chosen.length<target){var k=candidates.splice(ri(0,candidates.length-1),1)[0],g=genericExercise(l,d,k.id);if(g)chosen.push(g)}}
 return chosen}
function makeDiagnostic(className,l,d,duration,kids,allowPre){var target=duration===20?8:duration===60?16:24,pool=E.applicable(l,d,'','mixed');if(kids&&kids.length)pool=pool.filter(function(t){return kids.indexOf(t.knowledgeId)>-1});if(!allowPre)pool=pool.filter(function(t){var k=E.knowledgeById(t.knowledgeId);return k&&k.group!=='Prérequis'});if(!pool.length)pool=E.applicable(l,d,'','mixed');var recent=[],items=[];for(var i=0;i<target;i++){var fresh=pool.filter(function(t){return recent.indexOf(t.baseId)<0});if(!fresh.length){recent=[];fresh=pool.slice()}var t=ch(fresh),q=E.build(t);recent.push(t.baseId);if(recent.length>10)recent.shift();items.push({knowledgeIds:[q.knowledgeId],title:E.knowledgeById(q.knowledgeId).label,context:'Question courte de diagnostic.',minutes:q.minutes,parts:[part(q.comp,q.question,q.answer,1,'Réponse de référence : '+q.answer)]})}return items}
function normalizePoints(exs){var all=[];exs.forEach(function(e){e.parts.forEach(function(p){all.push(p)})});var raw=all.reduce(function(s,p){return s+p.points},0);if(!raw)return;var assigned=0;all.forEach(function(p,i){if(i===all.length-1){p.points=Math.max(.5,Math.round((20-assigned)*2)/2)}else{p.points=Math.max(.5,Math.round((20*p.points/raw)*2)/2);assigned+=p.points}})}
function competencySummary(exs){var o={APP:0,ANA:0,REA:0,VAL:0,COM:0};exs.forEach(function(e){e.parts.forEach(function(p){o[p.comp]=(o[p.comp]||0)+p.points})});return o}
function generate(){var c=$('v42Class').value,l=$('v42Level').value,d=$('v42Disc').value,mode=$('v42Mode').value,dur=Number($('v42Duration').value),allow=$('v42Prereq').checked,adapt=$('v42Adapt').checked,kids=Array.prototype.slice.call($('v42Knowledge').selectedOptions).map(function(o){return o.value}).filter(Boolean),exs;
 if(mode==='diagnostic')exs=makeDiagnostic(c,l,d,dur,kids,allow);else exs=selectScenarios(c,l,d,mode,dur,kids,allow,adapt);
 if(!exs.length){toast('Aucun scénario disponible avec ces filtres. Activez éventuellement les prérequis ou choisissez une autre discipline.','warning');return}
 normalizePoints(exs);current={id:'A'+Date.now().toString(36),className:c,level:l,discipline:d,mode:mode,duration:dur,allowPrereq:allow,adapt:adapt,createdAt:Date.now(),exercises:exs,competencies:competencySummary(exs)};qd.assessments.push(current);qd.assessments=qd.assessments.slice(-30);exs.forEach(function(e){if(e.id)qd.history.push(e.id)});qd.history=qd.history.slice(-80);save();preview();toast('✅ V4.2 : évaluation structurée générée.','success')}
function modeLabel(m){return m==='diagnostic'?'Diagnostic connaissances':m==='context'?'Évaluation contextualisée MELEC':'Évaluation de cours'}
function preview(){var b=$('v42Preview');if(!b)return;if(!current){b.innerHTML='<p class="text-muted">Aucune production générée.</p>';return}var cs=current.competencies;b.innerHTML='<div class="v42-summary"><strong>'+modeLabel(current.mode)+'</strong> · '+current.duration+' min · '+current.exercises.length+' exercice(s) · /20<br><span>APP '+fmt(cs.APP,1)+'</span><span>ANA '+fmt(cs.ANA,1)+'</span><span>REA '+fmt(cs.REA,1)+'</span><span>VAL '+fmt(cs.VAL,1)+'</span><span>COM '+fmt(cs.COM,1)+'</span></div>'+current.exercises.map(function(e,i){return '<div class="v42-ex"><h4>Exercice '+(i+1)+' — '+esc(e.title)+'</h4><p class="v42-context">'+esc(e.context)+'</p>'+e.parts.map(function(p,j){return '<div class="v42-part"><strong>'+(j+1)+'. '+p.comp+' · '+fmt(p.points,1)+' pt</strong> — '+esc(p.prompt)+'</div>'}).join('')+'</div>'}).join('')}
function knowledgeOptions(){var l=$('v42Level').value,d=$('v42Disc').value,allow=$('v42Prereq').checked,ks=E.knowledge.filter(function(k){return k.levels.indexOf(l)>-1&&(d==='mixed'||k.discipline===d)&&(allow||k.group!=='Prérequis')});var groups={};ks.forEach(function(k){(groups[k.group]||(groups[k.group]=[])).push(k)});$('v42Knowledge').innerHTML=Object.keys(groups).map(function(g){return '<optgroup label="'+esc(g)+'">'+groups[g].map(function(k){return '<option value="'+k.id+'">'+esc(k.label)+'</option>'}).join('')+'</optgroup>'}).join('')}
function fillSelectors(){var c=$('v42Class'),cur=c.value||classes()[0]||'';c.innerHTML=classes().map(function(x){return '<option>'+esc(x)+'</option>'}).join('');if(cur&&classes().indexOf(cur)>-1)c.value=cur;var l=level(c.value);$('v42Level').innerHTML='<option value="1MELEC">Première Bac Pro MELEC</option><option value="TMELEC">Terminale Bac Pro MELEC</option>';$('v42Level').value=l;knowledgeOptions()}
function subjectHtml(a,cor){var disc=a.discipline==='maths'?'Mathématiques':a.discipline==='sciences'?'Sciences physiques':'Mathématiques & Sciences';var comp=a.competencies;var exhtml=a.exercises.map(function(e,i){var pts=e.parts.reduce(function(s,p){return s+p.points},0);var parts=e.parts.map(function(p,j){if(!cor)return '<div class="q"><div><b>'+(j+1)+'.</b> '+esc(p.prompt)+' <span class="pt">'+fmt(p.points,1)+' pt</span></div><div class="line"></div></div>';return '<div class="corr"><div class="corrhead">'+(j+1)+'. '+p.comp+' — '+fmt(p.points,1)+' pt</div><div><b>Réponse :</b> '+esc(p.answer)+'</div>'+(p.method?'<div><b>Méthode / critère :</b> '+esc(p.method)+'</div>':'')+(p.check?'<div><b>Validation :</b> '+esc(p.check)+'</div>':'')+'</div>'}).join('');return '<section class="ex"><h2>Exercice '+(i+1)+' — '+esc(e.title)+' <span>'+fmt(pts,1)+' pt</span></h2><p class="ctx">'+esc(e.context)+'</p>'+parts+'</section>'}).join('');return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+esc(disc+' '+a.duration+' min')+'</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;max-width:190mm;margin:auto;font-size:11.5pt;line-height:1.28}header{border-bottom:3px solid #1f5796;padding-bottom:8px;margin-bottom:12px}h1{font-size:19pt;margin:0 0 5px}h2{font-size:13pt;border-bottom:1px solid #cbd5e1;padding-bottom:5px;display:flex;justify-content:space-between}.meta{font-size:10.5pt}.id{display:grid;grid-template-columns:2fr 1fr;gap:18px;margin:12px 0}.blank{height:22px;border-bottom:1px solid #444}.ex{break-inside:avoid;margin:14px 0}.ctx{background:#f3f6fa;padding:8px;border-left:3px solid #1f5796}.q{margin:10px 0}.pt{float:right;font-weight:bold}.line{height:30px;border-bottom:1px dotted #bbb}.corr{margin:10px 0;padding:8px;border-left:3px solid #5b8c4a;background:#f7faf5}.corrhead{font-weight:bold;margin-bottom:4px}.comp{margin-top:18px;padding:9px;background:#f3f6fa;font-size:9.5pt}.comp span{margin-right:12px}.foot{margin-top:15px;font-size:9pt;color:#555}@media print{body{max-width:none}}</style></head><body><header><h1>'+esc(modeLabel(a.mode)+' — '+disc+(cor?' — CORRIGÉ':''))+'</h1><div class="meta">'+esc(E.levels[a.level])+' · Durée : '+a.duration+' min · Barème /20</div></header>'+(cor?'':'<div class="id"><div>Nom / Prénom<div class="blank"></div></div><div>Classe<div class="blank"></div></div></div>')+exhtml+'<div class="comp"><b>Répartition indicative des compétences :</b> <span>APP '+fmt(comp.APP,1)+'</span><span>ANA '+fmt(comp.ANA,1)+'</span><span>REA '+fmt(comp.REA,1)+'</span><span>VAL '+fmt(comp.VAL,1)+'</span><span>COM '+fmt(comp.COM,1)+'</span></div><div class="foot">DeltaTracker V4.2 · Les compétences APP/ANA/REA/VAL/COM sont suivies en parallèle des connaissances/techniques.</div></body></html>'}
async function share(){if(!current){toast('Générez d’abord une production.','warning');return}var s=subjectHtml(current,false),c=subjectHtml(current,true),f1=new File([s],'Sujet_'+current.className+'_'+stamp()+'.html',{type:'text/html'}),f2=new File([c],'Corrige_'+current.className+'_'+stamp()+'.html',{type:'text/html'});if(navigator.canShare&&navigator.share&&navigator.canShare({files:[f1,f2]})){try{await navigator.share({files:[f1,f2],title:'DeltaTracker V4.2'});return}catch(e){if(e.name==='AbortError')return}}dl(f1.name,'text/html',s);dl(f2.name,'text/html',c);toast('Sujet et corrigé téléchargés.','success')}
function installUi(){var panel=$('tabV41');if(!panel)return false;if($('v42QualityCard'))return true;var old=null;Array.prototype.forEach.call(panel.querySelectorAll('.card'),function(c){var t=c.querySelector('.card-title');if(t&&t.textContent.indexOf('Générateur d’exercice / évaluation')>-1)old=c});if(old)old.style.display='none';var card=document.createElement('div');card.className='card';card.id='v42QualityCard';card.innerHTML='<div class="card-title">📝 V4.2 QUALITY ENGINE — Exercice / Diagnostic / Évaluation</div><div class="v42-note">Un exercice comporte désormais plusieurs questions et peut évaluer plusieurs compétences APP/ANA/REA/VAL/COM. Les prérequis sont exclus d’une évaluation normale sauf si vous les activez.</div><div class="v42-row"><div class="form-group"><label>Classe</label><select id="v42Class"></select></div><div class="form-group"><label>Niveau</label><select id="v42Level"></select></div><div class="form-group"><label>Discipline</label><select id="v42Disc"><option value="maths">Mathématiques</option><option value="sciences">Sciences</option><option value="mixed">Maths + Sciences</option></select></div></div><div class="v42-row"><div class="form-group"><label>Mode</label><select id="v42Mode"><option value="course">Évaluation de cours</option><option value="context">Contextualisée MELEC</option><option value="diagnostic">Diagnostic connaissances</option></select></div><div class="form-group"><label>Format</label><select id="v42Duration"><option value="20">Exercice / diagnostic ≈20 min</option><option value="60" selected>Évaluation 1 h</option><option value="120">Évaluation 2 h</option></select></div></div><div class="v42-checks"><label><input type="checkbox" id="v42Adapt" checked> Adapter aux faiblesses déjà observées</label><label><input type="checkbox" id="v42Prereq"> Inclure des prérequis/remédiation</label></div><div class="form-group"><label>Notions à inclure (facultatif)</label><select id="v42Knowledge" multiple size="7"></select><p class="form-hint">Sans sélection : tirage dans le programme du niveau. En mode évaluation, les prérequis restent exclus par défaut.</p></div><button class="btn btn-primary" id="v42Generate">✨ Générer avec QUALITY ENGINE</button><div id="v42Preview"></div><div class="btn-row"><button class="btn btn-sm btn-success" id="v42Share">📤 Envoyer sujet + corrigé</button><button class="btn btn-sm btn-outline" id="v42Down">💾 Télécharger</button></div><div class="v42-note">Le sujet et le corrigé sont des fichiers HTML A4 autonomes, faciles à partager depuis Android vers le PC puis à imprimer.</div>';
 if(old)old.parentNode.insertBefore(card,old.nextSibling);else panel.appendChild(card);
 var st=document.createElement('style');st.id='v42css';st.textContent='.v42-row{display:flex;gap:8px;flex-wrap:wrap}.v42-row>.form-group{flex:1 1 150px}.v42-note{background:#eef5ff;border-left:4px solid #1f5796;padding:9px;border-radius:8px;font-size:.73rem;margin:8px 0}.v42-checks{display:flex;gap:14px;flex-wrap:wrap;margin:8px 0;font-size:.74rem}.v42-summary{background:#f3f6fa;border-radius:10px;padding:10px;margin:10px 0}.v42-summary span{display:inline-block;margin:5px 6px 0 0;padding:3px 7px;border-radius:99px;background:#e8f0fe;font-size:.68rem;font-weight:700}.v42-ex{border:1px solid #dfe5ef;border-radius:12px;padding:10px;margin:10px 0}.v42-ex h4{margin:0 0 5px}.v42-context{background:#f8fafc;padding:7px;border-left:3px solid #1f5796}.v42-part{padding:7px 0;border-bottom:1px solid #eee;font-size:.75rem}';document.head.appendChild(st);
 fillSelectors();$('v42Class').addEventListener('change',fillSelectors);$('v42Level').addEventListener('change',knowledgeOptions);$('v42Disc').addEventListener('change',knowledgeOptions);$('v42Prereq').addEventListener('change',knowledgeOptions);$('v42Generate').addEventListener('click',function(e){e.preventDefault();generate()});$('v42Share').addEventListener('click',function(e){e.preventDefault();share()});$('v42Down').addEventListener('click',function(e){e.preventDefault();if(!current){toast('Générez d’abord une production.','warning');return}dl('Sujet_'+current.className+'_'+stamp()+'.html','text/html',subjectHtml(current,false));dl('Corrige_'+current.className+'_'+stamp()+'.html','text/html',subjectHtml(current,true))});return true}
window.MELEC_V42_QUALITY_API={getCurrent:function(){return current},subjectHtml:subjectHtml};
function init(){var n=0,t=setInterval(function(){n++;if(installUi()||n>50)clearInterval(t)},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
