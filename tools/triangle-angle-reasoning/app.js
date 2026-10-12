(function(){
'use strict';
const COLORS={ink:'#252525',red:'#b8202d',orange:'#c75000',muted:'#6d6962'};
const PRESETS=[{name:'基本',a:50,b:60},{name:'A が鈍角',a:110,b:30},{name:'C が鈍角',a:25,b:30},{name:'細い形',a:80,b:80}];
const STAGES=['まず、求めたい角を確かめる','C を通る平行線を引く','∠A と等しい角を C に見つける','∠B と等しい角を C に見つける','C のまわりに、3つの角が並ぶ','180° から、2つの角を引く'];
const RAD=Math.PI/180;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const round=v=>Number(v.toFixed(4));
function initialState(){return {a:50,b:60,step:0};}
function maxAngle(other){return Math.min(120,160-other);}
function normalized(raw){raw=raw||{};let a=Number(raw.a),b=Number(raw.b),step=Number(raw.step);a=Number.isFinite(a)?clamp(Math.round(a/5)*5,20,120):50;b=clamp(Number.isFinite(b)?Math.round(b/5)*5:60,20,maxAngle(a));return {a,b,step:Number.isFinite(step)?clamp(Math.floor(step),0,5):0};}
function reduce(raw,action){const s=normalized(raw);if(!action)return s;
  if(action.type==='next')return {...s,step:Math.min(5,s.step+1)};
  if(action.type==='prev')return {...s,step:Math.max(0,s.step-1)};
  if(action.type==='reset')return {...s,step:0};
  if(action.type==='preset'){const p=PRESETS[action.index];return p?{a:p.a,b:p.b,step:0}:s;}
  if(action.type==='parameter'&&(action.key==='a'||action.key==='b')){const v=Number(action.value);if(!Number.isFinite(v))return s;const other=action.key==='a'?'b':'a';return {...s,[action.key]:clamp(Math.round(v/5)*5,20,maxAngle(s[other])),step:0};}
  return s;
}
function model(raw){const s=normalized(raw),c=180-s.a-s.b,ac=6*Math.sin(s.b*RAD)/Math.sin(c*RAD),p={A:{x:0,y:0},B:{x:6,y:0},C:{x:ac*Math.cos(s.a*RAD),y:ac*Math.sin(s.a*RAD)}};
  const low=Math.min(0,p.C.x),high=Math.max(6,p.C.x),scale=Math.min(230/(high-low),146/p.C.y),center=(low+high)/2;
  const height=p.C.y*scale,base=65+height;
  const px=Object.fromEntries(Object.entries(p).map(([k,v])=>[k,{x:180+(v.x-center)*scale,y:base-v.y*scale}]));
  const rA=Math.min(25,.23*Math.min(6,ac)*scale),bc=Math.hypot(p.C.x-6,p.C.y),rB=Math.min(25,.23*Math.min(6,bc)*scale),rC=Math.min(25,.24*Math.min(ac,bc)*scale);
  // Keep the whole x label off all sides and arcs. Very flat triangles use a
  // named outside label rather than squeezing a number into a narrow region.
  const half=c/2*RAD,theta=(s.b+c/2)*RAD;
  const inside=(x,y)=>[['A','B'],['B','C'],['C','A']].every(([u,v])=>{const q=px[u],r=px[v];return ((r.x-q.x)*(y-q.y)-(r.y-q.y)*(x-q.x))/Math.hypot(r.x-q.x,r.y-q.y)<-2;});
  let xLabel=null;
  for(let d=Math.max(rC+17,14/Math.sin(half));d<300;d+=2){const x=px.C.x+d*Math.cos(theta),y=px.C.y+d*Math.sin(theta),dx=Math.max(Math.abs(x-px.C.x)-9.675,0),dy=Math.max(Math.abs(y-px.C.y)-13,0);if(dx*dx+dy*dy<(rC+3)**2)continue;if([-9.675,9.675].every(ox=>[-13,13].every(oy=>inside(x+ox,y+oy)))){xLabel={x,y,text:'x',outside:false};break;}}
  if(!xLabel)xLabel={x:180,y:base+57,text:'∠ACB = x',outside:true};
  return {...s,c,world:p,points:{...px,D:{x:20,y:px.C.y},E:{x:340,y:px.C.y}},scale,radii:{A:rA,B:rB,C:rC},xLabel,viewBoxHeight:base+(xLabel.outside?79:47),area:3*p.C.y};
}
function view(raw){const s=normalized(raw),m=model(s);const line=(text,cls='')=>`<span class="line ${cls}">${text}</span>`;
  const equations=[line('x = ?','answer focus'),line('DE ∥ AB','focus'),line('∠DCA = ∠A')+line(`= ${s.a}°`,'result'),line('∠BCE = ∠B')+line(`= ${s.b}°`,'result'),line(`${s.a}° + x + ${s.b}°`)+line('= 180°','result'),line(`x = 180° − ${s.a}° − ${s.b}°`,'small')+line(`x = ${m.c}°`,'answer result')];
  const reasons=['いきなり測らず、角の性質を使って考えよう。','点 C を通り、辺 AB と平行な直線 DE を引く。','DE ∥ AB で、AC が横切る。錯角なので等しい。','DE ∥ AB で、BC が横切る。錯角なので等しい。','∠DCA、x、∠BCE は、直線 DE の下側をすき間なく分ける。','直線の角 180° から、分かった2つの角を引く。'];
  const notes=['∠A と ∠B は元の条件。上の頂点 C の角が x です。','同じ矢印の印は「平行」を表します。','赤：元の ∠A。橙：錯角として分かった ∠DCA。','赤：元の ∠B。橙：錯角として分かった C の両側の角。','2つの錯角を元の数に置き換えると、3つを足して 180°。','求めた x は上の頂点 C の内角。どの数にしても同じ手順です。'];
  return {title:STAGES[s.step],equation:equations[s.step],reason:reasons[s.step],note:notes[s.step],given:`<span>∠A = ${s.a}°</span><span>∠B = ${s.b}°</span>`};
}
function diagram(raw){const m=model(raw),{a,b,c,step,points:p,radii:r}=m,C=COLORS;
  const path=(d,col,width=2,attrs='')=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
  const seg=(from,to,col,key)=>path(`M${round(p[from].x)} ${round(p[from].y)}L${round(p[to].x)} ${round(p[to].y)}`,col,2.1,`data-segment="${key}"`);
  const arc=(vertex,start,end,radius,col,key)=>{const q=p[vertex],x=t=>round(q.x+radius*Math.cos(t*RAD)),y=t=>round(q.y+radius*Math.sin(t*RAD));return path(`M${x(start)} ${y(start)}A${round(radius)} ${round(radius)} 0 0 1 ${x(end)} ${y(end)}`,col,2.6,`data-angle="${key}" data-degrees="${round(end-start)}"`);};
  const label=(text,x,y,col,key,size=18)=>{const w=text.length*size*.65+7,h=size+7;return `<g data-label="${key}"><rect x="${round(x-w/2)}" y="${round(y-h/2)}" width="${round(w)}" height="${h}" rx="3" fill="white"/><text x="${round(x)}" y="${round(y+size*.34)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="600" fill="${col}">${text}</text></g>`;};
  const marker=(x,y,col,key)=>path(`M${round(x-4)} ${round(y-4)}L${round(x+2)} ${round(y)}L${round(x-4)} ${round(y+4)}`,col,1.8,`data-parallel="${key}"`);
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${round(m.viewBoxHeight)}" role="img" aria-labelledby="triangle-title triangle-desc"><title id="triangle-title">三角形 ABC の角を平行線から求める</title><desc id="triangle-desc">∠A は ${a} 度、∠B は ${b} 度。∠ACB が x。${step>=1?'C を通る直線 DE は AB と平行。':''}${step>=2?`錯角の ∠DCA は ${a} 度。`:''}${step>=3?`錯角の ∠BCE は ${b} 度。`:''}${step>=4?'C の下側の3つの角の和は180度。':''}${step===5?`x は ${c} 度。`:''}</desc>`;
  if(step>=1){const col=step===1||step===4?C.red:C.ink;svg+=path(`M10 ${round(p.C.y)}H350`,col,2,`data-auxiliary="DE"`);const right=p.C.x<180,markX=right?(p.C.x+340)/2:(p.C.x+20)/2;svg+=marker(markX,p.C.y,col,'DE')+marker((p.A.x+p.B.x)/2,p.A.y,C.ink,'AB');}
  svg+=seg('A','B',C.ink,'AB')+seg('A','C',step===2?C.red:C.ink,'AC')+seg('B','C',step===3?C.red:C.ink,'BC');
  svg+=arc('A',-a,0,r.A,step===2?C.red:C.ink,'A')+arc('B',180,180+b,r.B,step===3?C.red:C.ink,'B');
  svg+=arc('C',b,180-a,r.C,step===5?C.orange:C.ink,'ACB');
  if(step>=2)svg+=arc('C',180-a,180,r.C,C.orange,'DCA');
  if(step>=3)svg+=arc('C',0,b,r.C,C.orange,'BCE');
  for(const k of ['A','B','C',...(step>=1?['D','E']:[])])svg+=`<circle data-point="${k}" cx="${round(p[k].x)}" cy="${round(p[k].y)}" r="2.6" fill="${C.ink}"/>`;
  svg+=label('A',p.A.x,p.A.y+22,C.ink,'A')+label('B',p.B.x,p.B.y+22,C.ink,'B')+label('C',p.C.x,p.C.y-23,C.ink,'C');
  if(step>=1)svg+=label('D',p.D.x,p.D.y-18,C.ink,'D')+label('E',p.E.x,p.E.y-18,C.ink,'E');
  svg+=label(m.xLabel.text,m.xLabel.x,m.xLabel.y,step===5?C.orange:C.ink,'x',19);
  return svg+'</svg>';
}
const api={COLORS,PRESETS,STAGES,initialState,maxAngle,normalized,reduce,model,view,diagram};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let state=initialState();
function render(){const s=state,v=view(s);$('given').innerHTML=v.given;$('step-kicker').textContent=`考え方 ${s.step+1} / 6`;$('step-title').textContent=v.title;$('equation').innerHTML=v.equation;$('reason').textContent=v.reason;$('diagram').innerHTML=diagram(s);$('diagram-note').textContent=v.note;$('conclusion').hidden=s.step!==5;$('count').textContent=`${s.step+1} / 6`;$('prev').disabled=s.step===0;$('next').disabled=s.step===5;
  for(const key of ['a','b']){const other=key==='a'?'b':'a',max=maxAngle(s[other]);$(key+'-range').max=String(max);$(key+'-range').value=String(s[key]);$(key+'-range').setAttribute('aria-valuetext',s[key]+'度');$(key+'-value').textContent=s[key]+'°';$(key+'-minus').disabled=s[key]===20;$(key+'-plus').disabled=s[key]===max;$(key+'-range-note').textContent=`今の条件では 20° 〜 ${max}°（5°ずつ）`;}
  document.querySelectorAll('[data-preset]').forEach(el=>{const p=PRESETS[Number(el.dataset.preset)];el.setAttribute('aria-pressed',String(p.a===s.a&&p.b===s.b));});
}
function dispatch(action){state=reduce(state,action);render();}
for(const id of ['next','prev','reset'])$(id).addEventListener('click',()=>dispatch({type:id}));
for(const key of ['a','b']){$(key+'-range').addEventListener('input',event=>dispatch({type:'parameter',key,value:event.target.value}));for(const suffix of ['minus','plus'])$(key+'-'+suffix).addEventListener('click',()=>dispatch({type:'parameter',key,value:state[key]+(suffix==='plus'?5:-5)}));}
document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>dispatch({type:'preset',index:Number(el.dataset.preset)})));
window.addEventListener('pageshow',render);render();
})();
