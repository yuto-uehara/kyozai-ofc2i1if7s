(()=>{'use strict';const $=id=>document.getElementById(id),svg=$('diagram'),NS='http://www.w3.org/2000/svg',A=[-3,0],B=[3,0];let state;
const xy=p=>[250+28*p[0],170-28*p[1]];
function el(tag,a){const e=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));svg.append(e);return e}
function line(a,b,c,w=2,dash='none'){const p=xy(a),q=xy(b);el('line',{x1:p[0],y1:p[1],x2:q[0],y2:q[1],stroke:c,'stroke-width':w,'stroke-dasharray':dash})}
function text(p,s,c,dx=0,dy=0){const q=xy(p),e=el('text',{x:q[0]+dx,y:q[1]+dy,fill:c,'text-anchor':'middle'});e.textContent=s}
function point(p,n,c,dx=0,dy=-12){const q=xy(p);el('circle',{cx:q[0],cy:q[1],r:4,fill:c});if(n)text(p,n,c,dx,dy)}
function clipped(m,b,c){const pts=[];for(const x of [-7.5,7.5]){const y=m*x+b;if(y>=-5&&y<=5)pts.push([x,y])}if(m)for(const y of [-5,5]){const x=(y-b)/m;if(x>=-7.5&&x<=7.5)pts.push([x,y])}line(pts[0],pts[1],c,3);return pts}
function render(){const mode=$('line-case').value,b=+$('offset').value,step=+$('step').value,vertical=mode==='parallel'||mode==='same',m=mode==='up'?.5:mode==='down'?-1:0,c=mode==='same'?0:b,status=mode==='same'?'infinite':mode==='parallel'?'none':'unique',P=status==='unique'?[0,b]:null;svg.replaceChildren();$('offset').disabled=mode==='same';$('offset-out').textContent=mode==='same'?'固定':b;
line(A,B,'#aaa',1,'4 3');if(vertical){line([c,-5],[c,5],'#b65b16',3);text([c,4.5],'ℓ','#b65b16',18)}else{const ends=clipped(m,b,'#b65b16');text(ends[1],'ℓ','#b65b16',-14,20)}
if(step>=1){for(const p of [A,B]){const q=xy(p);el('circle',{cx:q[0],cy:q[1],r:112,fill:'none',stroke:'#b6b4ae','stroke-width':1.4,'stroke-dasharray':'5 4'})}point([0,Math.sqrt(7)],'C','#555',-18,-8);point([0,-Math.sqrt(7)],'D','#555',-18,22)}
if(step>=2){line([0,-5],[0,5],'#326e96',2,'7 4');text([0,-4.5],'垂直二等分線','#326e96',70,0);line([0,0],[.3,0],'#555');line([.3,0],[.3,.3],'#555');line([.3,.3],[0,.3],'#555')}
if(step===3&&P){line(P,A,'#b33944',2);line(P,B,'#b33944',2);point(P,'P','#b33944',20,-14)}
if(step===3&&status==='infinite'){for(const y of [-1,1,3])point([0,y],'','#b33944');text([0,1],'どの点も等距離','#b33944',78,0)}
point(A,'A','#222',-14,22);point(B,'B','#222',14,22);
$('stage-title').textContent=['2つの条件を確かめる','A・Bを中心に同じ半径の円を描く','二交点C・Dを結ぶ','指定直線との共通点を確かめる'][step];
$('reason').textContent=step===0?'Pは「直線ℓ上」と「PA＝PB」の両方を満たす必要があります。':step===1?'AB＝6。半径4（ABの半分より大きい）の円を描き、二交点C・Dをとります。':step===2?'直線CDはABの垂直二等分線。この線上の点はA・Bから等距離です。':status==='unique'?'交点Pは直線ℓ上にあり、垂直二等分線上にもあります。だから2つの条件を同時に満たします。':status==='none'?'異なる平行な2直線には共通点がありません。両条件を満たす点はありません。':'2直線が重なるので、ℓ上のすべての点がA・Bから等距離です。答えは無数にあります。';
const distance=P?Math.hypot(P[0]-A[0],P[1]-A[1]):null;$('check').textContent=step<3?'橙：指定直線ℓ　青：等距離になる直線':status==='unique'?'Pはℓ上 ✓　PA＝PB＝'+distance.toFixed(2):status==='none'?'共通点なし → 解なし':'ℓ＝垂直二等分線 → 解は無数';state={A,B,mode,b,m,c,step,status,P,distance};}
$('line-case').onchange=render;$('offset').addEventListener('input',render);$('step').addEventListener('input',render);$('reset').onclick=()=>{$('line-case').value='up';$('offset').value=2;$('step').value=0;render()};window.EquidistantOnLine={get:()=>state};render();})();