(function(){'use strict';
// Coefficients in the order x², xy, y², x, y, constant.
const examples=[
 [[3,2,0,0,0,-4],[-1,5,0,0,0,7]],
 [[2,0,-3,1,0,0],[-2,0,1,-4,0,0]],
 [[1,1,1,0,0,0],[-1,-1,-1,0,0,0]],
 [[-1,0,0,2,0,-3],[0,3,0,-1,0,3]],
 [[1,0,0,2,0,-1],[-1,0,0,-1,0,4]]
];
const symbols=['x<sup>2</sup>','xy','y<sup>2</sup>','x','y',''],labels=['x²の項','xyの項','y²の項','xの項','yの項','定数項'];
const num=n=>String(n).replace('-','−'),wrap=n=>n<0?'('+num(n)+')':num(n);
function model(i){const [a,b]=examples[i];return {a:a.slice(),b:b.slice(),sum:a.map((v,j)=>v+b[j]),groups:a.map((v,j)=>v||b[j]?j:-1).filter(j=>j!==-1)};}
function term(n,k){return(n<0?'−':'')+(Math.abs(n)===1&&symbols[k]?'':Math.abs(n))+symbols[k];}
function polynomial(v,focus){let first=true;const parts=[];v.forEach((n,k)=>{if(!n)return;const text=(first?'':n<0?' − ':' ＋ ')+term(first?n:Math.abs(n),k);parts.push('<span class="poly-term'+(k===focus?' selected-term':'')+'">'+text+'</span>');first=false;});return parts.join('<wbr>')||'0';}
const api={examples,model};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let state;
function fillGroups(){const m=model(+$('example').value);$('focus').replaceChildren(...m.groups.map(k=>new Option(labels[k],k)));}
function render(){const i=+$('example').value,step=+$('step').value,focus=+$('focus').value,m=model(i),{a,b,sum,groups}=m;
$('original').innerHTML='<div>('+polynomial(a,focus)+')</div><div>＋ ('+polynomial(b,focus)+')</div>';
$('stage-title').textContent=['元の2つの多項式を確かめる','符号を保って括弧を外す','同類項の係数どうしを足す','0の項を除いて答えをまとめる'][step];
$('work-label').textContent=['足す式の全体に注目','括弧を外した式','文字の部分ごとにまとめる','計算の結果'][step];
if(step===0){$('work').innerHTML='2つの多項式の和<br><span class="detail">橙色：'+labels[focus]+'</span>';$('result').textContent='括弧の前は「＋」';$('reason').textContent='足す式の項は、符号を変えずに加えます。注目する項を選んで、2つの式の中を探そう。';$('check').textContent='同類項：文字とその指数が同じ項。';}
if(step===1){const expanded=a.map((n,k)=>({n,k})).concat(b.map((n,k)=>({n,k}))).filter(t=>t.n);$('work').innerHTML=expanded.map(({n,k},j)=>'<span class="poly-term'+(k===focus?' selected-term':'')+'">'+(j?(n<0?' − ':' ＋ '):'')+term(j?Math.abs(n):n,k)+'</span>').join('<wbr>');$('result').textContent='元の各項の符号を保つ';$('reason').textContent='加法では、後ろの括弧を外しても各項の符号は変わりません。負の項もそのまま残します。';$('check').textContent='x² と xy と y² は、同じ二次でも同類項ではありません。';}
if(step===2){$('work').innerHTML=groups.map(k=>'<div class="group-row'+(k===focus?' selected-term':'')+'">'+(symbols[k]?'('+num(a[k])+' ＋ '+wrap(b[k])+')'+symbols[k]:num(a[k])+' ＋ '+wrap(b[k]))+' ＝ '+(sum[k]?term(sum[k],k):'0')+'</div>').join('');$('result').textContent='同じ文字の部分を残し、係数を足す';$('reason').textContent='同類項だけを集めます。片方の式にその項がないときは、係数を0として計算できます。';$('check').textContent='定数項どうしもまとめます。';}
if(step===3){$('work').innerHTML=polynomial(sum,focus);$('result').textContent=sum.every(n=>n===0)?'すべての項が消えると、答えは0':'係数が0の項は書かない';$('reason').textContent='係数1は省き、−1は−だけを書きます。残った異なる種類の項は、それ以上まとめません。';$('check').textContent=i===4?'二次の項が相殺し、答えは一次式です。':i===2?'空欄ではなく、0と書きます。':'元の2つの式と、まとめた答えを見比べよう。';}
state={i,step,focus,...m};}
$('example').onchange=()=>{$('step').value=0;fillGroups();render();};$('focus').onchange=render;$('step').addEventListener('input',render);$('reset').onclick=()=>{$('example').value=0;$('step').value=0;fillGroups();render();};window.PolynomialAdd={get:()=>state};fillGroups();render();
})();
