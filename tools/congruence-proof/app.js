(function(){'use strict';
const INK='#252525',ORANGE='#c75000';
const LIMITS={u:{min:1,max:5,step:1},v:{min:1,max:5,step:1},theta:{min:20,max:160,step:5}};
const TITLES=['示したいことを確かめる','1組目の辺をそろえる','2組目の辺をそろえる','その間の角をそろえる','合同条件でつなぐ','対応する辺から結論へ','証明がつながった'];
const REASONS={given:'仮定',vertical:'対頂角は等しい',congruent:'合同な図形の性質'};
const ANSWERS={1:'given',2:'given',3:'vertical',4:'sas',5:'CD'};
const REASON_TEXT={1:'仮定より、OA = OC。',2:'仮定より、OB = OD。',3:'対頂角は等しいので、∠AOB = ∠COD。',4:'2組の辺とその間の角がそれぞれ等しいので、△AOB ≡ △COD。',5:'ABに対応する辺はCD。合同な図形の対応する辺は等しいので、AB = CD。'};
const clean=(n,fallback)=>Number.isFinite(Number(n))?Number(n):fallback;
function bounded(key,value){const z=LIMITS[key];return Math.max(z.min,Math.min(z.max,z.min+Math.round((clean(value,z.min)-z.min)/z.step)*z.step));}
function initialState(){return {u:3,v:2,theta:60,direction:1,mode:'choose',step:0,answers:{},selected:null};}
function normalize(s){return {u:bounded('u',s.u),v:bounded('v',s.v),theta:bounded('theta',s.theta),direction:s.direction===-1?-1:1,mode:s.mode==='read'?'read':'choose',step:Math.max(0,Math.min(6,Math.round(clean(s.step,0)))),answers:{...(s.answers||{})},selected:s.selected||null};}
function solved(s){return s.mode==='read'||!ANSWERS[s.step]||s.answers[s.step]===ANSWERS[s.step];}
function reduce(s,action){s=normalize(s);switch(action.type){
  case 'next':if(solved(s)){s.step=Math.min(6,s.step+1);s.selected=null;}break;
  case 'prev':s.step=Math.max(0,s.step-1);s.selected=null;break;
  case 'answer':if(s.mode==='choose'&&ANSWERS[s.step]){s.selected=action.value;if(action.value===ANSWERS[s.step])s.answers[s.step]=action.value;else delete s.answers[s.step];}break;
  case 'parameter':if(LIMITS[action.key])s[action.key]=bounded(action.key,action.value);break;
  case 'direction':s.direction=action.value===-1?-1:1;break;
  case 'mode':s.mode=action.value==='read'?'read':'choose';s.step=0;s.answers={};s.selected=null;break;
  case 'reset':s.step=0;s.answers={};s.selected=null;break;
}return s;}
function model(input){const s=normalize(input),t=s.theta*Math.PI/180,O={x:0,y:0},A={x:-s.u,y:0},C={x:s.u,y:0},B={x:s.v*Math.cos(t),y:s.direction*s.v*Math.sin(t)},D={x:-B.x,y:-B.y};
  const points={A,O,B,C,D},distance=(p,q)=>Math.hypot(points[p].x-points[q].x,points[p].y-points[q].y);
  return {points,lengths:{OA:distance('O','A'),OC:distance('O','C'),OB:distance('O','B'),OD:distance('O','D'),AB:distance('A','B'),CD:distance('C','D')},angles:{AOB:180-s.theta,COD:180-s.theta,BOC:s.theta},area:s.u*s.v*Math.sin(t)/2,correspondence:{A:'C',O:'O',B:'D'}};
}
function wrong(s){if(!s.selected||s.selected===ANSWERS[s.step])return '';
  if(s.step===1||s.step===2)return s.selected==='congruent'?'まだ合同とはいえていません。はじめに分かっている条件へ戻ろう。':'今見ているのは辺の等しさです。はじめの条件を確かめよう。';
  if(s.step===3)return s.selected==='congruent'?'この角の等しさを使って、これから合同を示します。交わる2直線の角に注目。':'この角の等しさは仮定にありません。交わる2直線の角に注目。';
  if(s.step===4)return s.selected==='sss'?'AB = CDは、これから示すこと。3組の辺はまだ使えません。':'分かった角は1組。2組の辺と、その間の角に注目。';
  return 'Aの相手はC、Bの相手はD。辺の2つの端を対応させよう。';
}
function view(input){const s=normalize(input),ok=solved(s),eq=['AB と CD','OA = OC','OB = OD','∠AOB = ∠COD',ok?'△AOB ≡ △COD':'△AOB と △COD',ok?'AB = CD':'AB ↔ ？','AB = CD'][s.step];
  const near=['△AOBと△CODの合同を使って、説明しよう。','OAとOCが等しいのは、なぜ？','OBとODが等しいのは、なぜ？','2組の辺の間にある、Oの角に注目。','A ↔ C、O ↔ O、B ↔ D の順に対応。',ok?'合同な図形の、対応する辺は等しい。':'A ↔ C、B ↔ D。辺の両端を対応させる。','仮定 → 根拠 → 合同 → 結論'][s.step];
  let choices=[],question='';
  if(s.step>=1&&s.step<=3){question='この等しさの根拠は？';choices=Object.entries(REASONS).map(([value,text])=>({value,text}));}
  if(s.step===4){question='使える合同条件は？';choices=[{value:'sss',text:'3組の辺がそれぞれ等しい'},{value:'sas',text:'2組の辺とその間の角がそれぞれ等しい'},{value:'asa',text:'1組の辺とその両端の角がそれぞれ等しい'}];}
  if(s.step===5){question='ABに対応する辺は？';choices=['CO','CD','OD'].map(value=>({value,text:value}));}
  const feedback=wrong(s)||((s.mode==='choose'&&ANSWERS[s.step]&&ok)?REASON_TEXT[s.step]:'');
  return {eq,near,title:TITLES[s.step],question,choices,feedback,ok,reason:REASON_TEXT[s.step]||'',compact:s.step===3||s.step===4,
    diagramNote:['同じ印の辺が等しいことは、仮定。','1本線の印：OAとOC。','2本線の印：OBとOD。','向かい合うOの角が、対頂角。','色のついた2辺と、その間の角を使う。','A → C、B → D だから、AB → CD。','図を変えても、この証明が使えます。'][s.step],
    nextDisabled:s.step===6||!ok,nextLabel:s.step===5?'まとめへ ›':'次へ ›'};
}
function diagram(input){const s=normalize(input),m=model(s),maxX=Math.max(s.u,Math.abs(m.points.B.x)),maxY=Math.abs(m.points.B.y),scale=Math.min(122/maxX,91/maxY),cx=180,cy=133;
  const p=Object.fromEntries(Object.entries(m.points).map(([key,q])=>[key,{x:cx+q.x*scale,y:cy-q.y*scale}]));
  const f=n=>Number(n.toFixed(4)),pt=q=>`${f(q.x)} ${f(q.y)}`,line=(a,b,color=INK,width=2.1)=>`<path data-segment="${a}${b}" d="M${pt(p[a])}L${pt(p[b])}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 266" role="img" aria-label="Oで直線ACとBDが交わる図。OAとOC、OBとODがそれぞれ等しい。三角形AOBとCODを比べる。"><title>△AOBと△COD</title>`;
  if(s.step===4)for(const names of [['A','O','B'],['C','O','D']])svg+=`<path d="M${names.map(k=>pt(p[k])).join('L')}Z" fill="#c750000c" stroke="none"/>`;
  const focus=s.step===1?['OA','OC']:s.step===2?['OB','OD']:s.step===4?['OA','OC','OB','OD']:s.step===0||s.step>=5?['AB','CD']:[];
  for(const seg of ['OA','OC','OB','OD','AB','CD'])svg+=line(seg[0],seg[1],focus.includes(seg)?ORANGE:INK,focus.includes(seg)?3.1:1.8);
  function tick(a,b,count){const dx=p[b].x-p[a].x,dy=p[b].y-p[a].y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,at=.57,mx=p[a].x+dx*at,my=p[a].y+dy*at,c=focus.includes(a+b)?ORANGE:INK;
    return Array.from({length:count},(_,i)=>{const t=(i-(count-1)/2)*5,x=mx+t*ux,y=my+t*uy;return `<path data-tick="${a}${b}" d="M${f(x-uy*4.8)} ${f(y+ux*4.8)}L${f(x+uy*4.8)} ${f(y-ux*4.8)}" fill="none" stroke="${c}" stroke-width="1.7"/>`;}).join('');}
  svg+=tick('O','A',1)+tick('O','C',1)+tick('O','B',2)+tick('O','D',2);
  if(s.step>=3){const r=Math.min(26,Math.min(s.u,s.v)*scale*.41),start=s.direction===1?s.theta:180,end=s.direction===1?180:360-s.theta;
    for(let i=0;i<2;i++){const a=(start+i*180)*Math.PI/180,b=(end+i*180)*Math.PI/180,q={x:cx+r*Math.cos(a),y:cy-r*Math.sin(a)},z={x:cx+r*Math.cos(b),y:cy-r*Math.sin(b)};svg+=`<path data-angle="${i===0?'AOB':'COD'}" d="M${pt(q)}A${f(r)} ${f(r)} 0 0 0 ${pt(z)}" fill="none" stroke="${s.step===3||s.step===4?ORANGE:INK}" stroke-width="2"/>`;}
  }
  for(const [name,q] of Object.entries(p))svg+=`<circle data-point="${name}" cx="${f(q.x)}" cy="${f(q.y)}" r="3.1" fill="${INK}"/>`;
  const bUnit={x:m.points.B.x/s.v,y:-m.points.B.y/s.v};
  const labels={A:{x:p.A.x-10,y:p.A.y+19},C:{x:p.C.x+10,y:p.C.y+19},B:{x:p.B.x+bUnit.x*22,y:p.B.y+bUnit.y*22+6},D:{x:p.D.x-bUnit.x*22,y:p.D.y-bUnit.y*22+6}};
  // Keep O clear of endpoint dots, labels, and the short sides of thin triangles.
  function segmentDistance(q,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(q.x-a.x-t*dx,q.y-a.y-t*dy);}
  const arcRadius=Math.min(26,Math.min(s.u,s.v)*scale*.41),arcStart=s.direction===1?s.theta:180,arcEnd=s.direction===1?180:360-s.theta,arcDots=[];
  for(let side=0;side<2;side++)for(let j=0;j<=36;j++){const a=(arcStart+(arcEnd-arcStart)*j/36+side*180)*Math.PI/180;arcDots.push({x:cx+arcRadius*Math.cos(a),y:cy-arcRadius*Math.sin(a)});}
  let best=null;for(const radius of [24,39,46])for(let i=0;i<32;i++){const a=(i+.5)*Math.PI/16,q={x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)};
    const lineClearance=Math.min(...['OA','OC','OB','OD','AB','CD'].map(seg=>segmentDistance(q,p[seg[0]],p[seg[1]])));
    const boxGap=z=>Math.hypot(Math.max(Math.abs(z.x-q.x)-10,0),Math.max(Math.abs(z.y-q.y)-12,0));
    const pointGap=Math.min(...Object.values(p).map(boxGap)),arcGap=Math.min(...arcDots.map(boxGap));
    const labelGap=Math.min(...Object.values(labels).map(z=>Math.hypot(Math.max(Math.abs(z.x-q.x)-20,0),Math.max(Math.abs(z.y-(q.y+6))-22,0))));
    const score=lineClearance-(radius-24)-Math.max(0,5-pointGap)*30-Math.max(0,3-arcGap)*30+(labelGap>0?0:-100);if(!best||score>best.score)best={score,x:q.x,y:q.y+6};
  }labels.O=best;
  for(const name of ['A','O','B','C','D']){const q=labels[name];svg+=`<text data-label="${name}" x="${f(q.x)}" y="${f(q.y)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="600" fill="${INK}" stroke="white" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${name}</text>`;}
  return svg+'</svg>';
}
const api={LIMITS,TITLES,ANSWERS,initialState,normalize,reduce,solved,model,view,diagram};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let state=initialState();
function render(){const focusedAnswer=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.answer:null,s=state,v=view(s);document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===s.mode)));document.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.direction===s.direction)));
  $('step-label').textContent=v.title;$('equation').className='equation math'+(v.compact?' compact':'');$('equation').innerHTML=`<span class="${s.step<6?'focus':''} ${v.ok&&s.step>0?'orange':''}">${v.eq}</span>`;$('near').textContent=v.near;$('diagram').innerHTML=diagram(s);$('diagram-note').textContent=v.diagramNote;
  $('question-card').hidden=s.mode!=='choose'||!v.choices.length;$('question').textContent=v.question;$('choices').className='choices'+(s.step===5?' side-choices':'');
  $('choices').innerHTML=v.choices.map(c=>`<button data-answer="${c.value}" aria-pressed="${String((s.selected||s.answers[s.step])===c.value)}" class="${s.answers[s.step]===c.value?'correct':''}">${c.text}</button>`).join('');
  if(focusedAnswer&&v.choices.some(c=>c.value===focusedAnswer))$('choices').querySelector(`[data-answer="${focusedAnswer}"]`).focus({preventScroll:true});
  $('feedback').textContent=v.feedback;$('feedback').className='feedback'+(v.ok&&!wrong(s)?' success':'');$('read-card').hidden=s.mode!=='read'||!v.reason;$('reason').textContent=v.reason;
  $('vertical-reason').hidden=s.step!==3;$('summary-card').hidden=s.step!==6;
  for(const key of Object.keys(LIMITS)){$(key+'-range').value=s[key];$(key+'-value').textContent=s[key]+(key==='theta'?'°':'');$(key+'-minus').disabled=s[key]===LIMITS[key].min;$(key+'-plus').disabled=s[key]===LIMITS[key].max;}
  $('prev').disabled=s.step===0;$('next').disabled=v.nextDisabled;$('next').textContent=v.nextLabel;$('count').textContent=(s.step+1)+' / 7';
}
function dispatch(action){state=reduce(state,action);render();}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>dispatch({type:'mode',value:b.dataset.mode})));
document.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>dispatch({type:'direction',value:+b.dataset.direction})));
$('choices').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(b)dispatch({type:'answer',value:b.dataset.answer});});
for(const [key,z] of Object.entries(LIMITS)){$(key+'-range').addEventListener('input',e=>dispatch({type:'parameter',key,value:+e.target.value}));for(const [suffix,sign] of [['minus',-1],['plus',1]])$(key+'-'+suffix).addEventListener('click',()=>dispatch({type:'parameter',key,value:state[key]+sign*z.step}));}
$('next').addEventListener('click',()=>dispatch({type:'next'}));$('prev').addEventListener('click',()=>dispatch({type:'prev'}));$('reset').addEventListener('click',()=>dispatch({type:'reset'}));window.addEventListener('pageshow',render);render();
})();
