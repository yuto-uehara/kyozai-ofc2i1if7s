(function(){'use strict';
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function Q(n,d=1){if(!d)throw Error('zero denominator');if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return {n:n/g||0,d:d/g};}
const add=(a,b)=>Q(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a,b)=>Q(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a,b)=>Q(a.n*b.n,a.d*b.d),div=(a,b)=>Q(a.n*b.d,a.d*b.n),times=(n,a)=>mul(Q(n),a),equal=(a,b)=>a.n===b.n&&a.d===b.d;
const values=[[-3,1],[-1,1],[0,1],[1,2],[2,1],[3,1]];
function model(i,xi,yi){const x=Q(...values[xi]),y=Q(...values[yi]),valid=i!==5||(x.n!==0&&y.n!==0);if(!valid)return {x,y,valid,direct:null,answer:null};const xx=mul(x,x),xy=mul(x,y);let direct,answer;
if(i===0){direct=sub(add(times(3,x),times(2,y)),sub(x,y));answer=add(times(2,x),times(3,y));}
if(i===1){direct=add(sub(times(2,xx),xy),sub(times(3,xy),times(2,xx)));answer=times(2,xy);}
if(i===2){direct=sub(times(3,sub(x,times(2,y))),times(2,add(x,y)));answer=sub(x,times(8,y));}
if(i===3){direct=add(div(sub(times(4,x),times(2,y)),Q(2)),div(add(times(3,x),times(6,y)),Q(3)));answer=add(times(3,x),y);}
if(i===4){direct=sub(add(xx,times(2,x)),add(xx,times(2,x)));answer=Q(0);}
if(i===5){direct=div(times(6,mul(xx,y)),times(-2,xy));answer=times(-3,x);}
return {x,y,valid,direct,answer,equal:equal(direct,answer)};}
const api={Q,values,model};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let state;
const number=q=>'<span class="rational" data-value="'+q.n+'/'+q.d+'">'+(q.n<0?'−':'')+(q.d===1?Math.abs(q.n):'<span class="frac"><span>'+Math.abs(q.n)+'</span><span>'+q.d+'</span></span>')+'</span>',wrapped=q=>q.n<0?'('+number(q)+')':number(q);
const original=['(3x ＋ 2y) − (x − y)','(2x<sup>2</sup> − xy) ＋ (3xy − 2x<sup>2</sup>)','3(x − 2y) − 2(x ＋ y)',number(Q(1,2))+'(4x − 2y) ＋ '+number(Q(1,3))+'(3x ＋ 6y)','(x<sup>2</sup> ＋ 2x) − (x<sup>2</sup> ＋ 2x)','6x<sup>2</sup>y ÷ (−2xy)'];
const simplified=['2x ＋ 3y','2xy','x − 8y','3x ＋ y','0','−3x'];
const collected=['3x ＋ 2y − x ＋ y','2x<sup>2</sup> − xy ＋ 3xy − 2x<sup>2</sup>','3x − 6y − 2x − 2y','2x − y ＋ x ＋ 2y','x<sup>2</sup> ＋ 2x − x<sup>2</sup> − 2x','6x<sup>2</sup>y ÷ (−2xy)'];
function substitution(i,x,y){return ['2 × '+wrapped(x)+' ＋ 3 × '+wrapped(y),'2 × '+wrapped(x)+' × '+wrapped(y),wrapped(x)+' − 8 × '+wrapped(y),'3 × '+wrapped(x)+' ＋ '+wrapped(y),'0','(−3) × '+wrapped(x)][i];}
function render(){const i=+$('example').value,xi=+$('x-choice').value,yi=+$('y-choice').value,step=+$('step').value,m=model(i,xi,yi);$('original').innerHTML=original[i];$('given-values').innerHTML='x ＝ '+number(m.x)+'、y ＝ '+number(m.y);$('stage-title').textContent=['元の式と代入する値を確認','先に式を簡単にする','整理した式に値を代入する','値を求め、元の式と比べる'][step];$('check').textContent=i===5?'条件：x ≠ 0、y ≠ 0。約分後も元の除数の条件が残ります。':'この式では、x・yに0も代入できます。';
if(!m.valid){$('stage-title').textContent='代入できる条件を確認する';$('work-label').textContent='元の式の除数を確認';$('work').innerHTML='−2xy ＝ 0<br>値は定義できません';$('result').textContent='0以外のx・yを選びます';$('reason').textContent='整理すると−3xになりますが、元の式では0で割ることになります。この値は代入できません。';state={i,xi,yi,step,...m};return;}
$('work-label').textContent=['数を入れる前に式を見る','同類項・分配・約分を使う','同じ文字を同じ値で置き換える','計算の結果'][step];
if(step===0){$('work').textContent='先に同類項や因数を整理しよう';$('result').textContent='計算する項や因数を減らす';$('reason').textContent='そのまま代入しても計算できますが、先に式を簡単にすると、必要な計算が少なくなります。';}
if(step===1){$('work').innerHTML=collected[i]+'<br>＝ '+simplified[i];$('result').textContent='整理した式：'+simplified[i];$('reason').textContent=i===5?'文字の共通因数を約分します。ただし、元の除数を0にしない条件は消えません。':'括弧を外し、同類項をまとめます。係数が0になった項は消えます。';}
if(step===2){$('work').innerHTML=substitution(i,m.x,m.y);$('result').textContent=i===4?'どの値を代入しても、整理した式は0':'負の数は括弧をつけて代入する';$('reason').textContent=i===4?'元の式の項がすべて相殺するので、x・yの値によらず0です。':'x・yを指定された数に置き換えます。整理で消えた文字を、もう一度計算に戻す必要はありません。';}
if(step===3){$('work').innerHTML=substitution(i,m.x,m.y)+'<br>＝ '+number(m.answer);$('result').innerHTML='元の式の値：'+number(m.direct)+' ／ 整理後：'+number(m.answer);$('reason').textContent='元の式に直接代入した値も同じです。式を整理しても、条件を満たす値での計算結果は変わりません。';}
state={i,xi,yi,step,...m};}
for(const id of ['x-choice','y-choice'])$(id).replaceChildren(...values.map(([n,d],i)=>new Option((n<0?'−':'')+Math.abs(n)+(d===1?'':'/'+d),i)));$('x-choice').value=0;$('y-choice').value=4;
for(const id of ['example','x-choice','y-choice'])$(id).onchange=()=>{$('step').value=0;render();};$('step').addEventListener('input',render);$('reset').onclick=()=>{$('example').value=0;$('x-choice').value=0;$('y-choice').value=4;$('step').value=0;render();};window.SimplifySubstitute={get:()=>state};render();
})();
