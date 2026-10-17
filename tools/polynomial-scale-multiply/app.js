(function(){'use strict';
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function Q(n,d=1){if(!d)throw new Error('zero denominator');if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return {n:n/g||0,d:d/g};}
const multiply=(a,b)=>Q(a.n*b.n,a.d*b.d),reciprocal=a=>a.n?Q(a.d,a.n):null;
// [numerator, denominator, x exponent, y exponent]. All examples are original.
const examples=[[[3,1,2,0],[-2,1,1,1],[1,1,0,0]],[[-1,2,2,0],[3,4,0,2],[-2,1,1,0]],[[2,3,1,1],[-1,3,0,1],[1,6,0,0]],[[1,1,2,0],[-1,1,1,1],[-1,1,0,0]]];
const scalars=[[2,1],[-3,1],[1,2],[-2,3],[0,1]];
function model(i,j,divide){const scalar=Q(...scalars[j]),factor=divide?reciprocal(scalar):scalar,terms=examples[i].map(([n,d,x,y])=>({coefficient:Q(n,d),x,y}));return {scalar,factor,valid:!!factor,terms,result:factor?terms.map(t=>({...t,coefficient:multiply(t.coefficient,factor)})):null};}
const api={Q,multiply,reciprocal,examples,scalars,model};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),divide=document.body.dataset.operation==='divide',op=divide?' ÷ ':' × ';let state;
const rational=q=>'<span class="rational" data-value="'+q.n+'/'+q.d+'">'+(q.n<0?'−':'')+(q.d===1?Math.abs(q.n):'<span class="frac"><span>'+Math.abs(q.n)+'</span><span>'+q.d+'</span></span>')+'</span>';
const wrapped=q=>q.n<0?'('+rational(q)+')':rational(q);
const letters=t=>[['x',t.x],['y',t.y]].map(([c,n])=>n?c+(n>1?'<sup>'+n+'</sup>':''):'').join('');
function term(t,absolute=false){const q=t.coefficient,l=letters(t),a=Q(Math.abs(q.n),q.d);return (!absolute&&q.n<0?'−':'')+(l&&a.n===a.d?'':rational(a))+l;}
function polynomial(ts){const nonzero=ts.filter(t=>t.coefficient.n);return nonzero.length?nonzero.map((t,i)=>'<span class="poly-term">'+(i?(t.coefficient.n<0?' − ':' ＋ '):'')+term(t,!!i)+'</span>').join('<wbr>'):'0';}
function render(){const i=+$('example').value,j=+$('scalar').value,step=+$('step').value,m=model(i,j,divide);$('original').innerHTML='('+polynomial(m.terms)+')'+op+wrapped(m.scalar);
$('stage-title').textContent=(divide?['式全体を割る数を確かめる','逆数を式全体に掛ける','各項の係数に逆数を掛ける','答えをまとめる']:['式全体に掛ける数を確かめる','各項に同じ数を掛ける','係数どうしを計算する','答えをまとめる'])[step];
if(!m.valid){$('work-label').textContent='除数の条件';$('work').textContent='0では割れません';$('result').textContent='0以外の数を選びます';$('reason').textContent='0には逆数がないため、除数には使えません。';$('check').textContent='計算は行いません。';state={i,j,step,divide,...m};return;}
$('work-label').textContent=step===0?'元の式の全体に注目':step===1?(divide?'割る数の逆数に置き換える':'分配法則'):step===2?'文字の部分を変えずに計算':'計算の結果';
if(step===0){$('work').innerHTML='括弧の中のすべての項を<br><span class="detail">'+(divide?wrapped(m.scalar)+' で割る':wrapped(m.scalar)+' 倍する')+'</span>';$('result').textContent=divide?'除数は0以外':'定数項も同じ数を掛ける';$('reason').textContent='最初の項だけでなく、括弧で囲まれた式全体が対象です。';}
if(step===1){$('work').innerHTML=divide?'('+polynomial(m.terms)+') × '+wrapped(m.factor):m.terms.map((t,k)=>'<div class="distribution-row">'+(k?'＋ ':'')+'('+term(t)+') × '+wrapped(m.factor)+'</div>').join('');$('result').textContent=divide?'割り算を、逆数の掛け算へ':'すべての項に同じ数が掛かる';$('reason').textContent=divide?'割る数の分子と分母を入れ替え、符号を保った逆数を式全体に掛けます。元の式の係数を逆数にするのではありません。':'分配法則で各項に掛けます。負の項も定数項も含め、掛け忘れないようにしよう。';}
if(step===2){$('work').innerHTML=m.terms.map((t,k)=>'<div class="calculation-row">'+wrapped(t.coefficient)+' × '+wrapped(m.factor)+' ＝ '+rational(m.result[k].coefficient)+'<span class="term-kind">'+(letters(t)?letters(t)+'の係数':'定数項')+'</span></div>').join('');$('result').textContent='文字の部分と指数は変わらない';$('reason').textContent=divide?'逆数を分配して、各項の係数に掛けます。分数は分子どうし・分母どうしを掛け、約分します。':'係数どうしを掛けます。分数は分子どうし・分母どうしを掛け、約分します。';}
if(step===3){$('work').innerHTML=polynomial(m.result);$('result').textContent=m.factor.n===0?'どの項も0になり、答えは0':'係数±1と0の項の書き方を整える';$('reason').textContent='係数1は省き、−1は−だけを書きます。係数が0の項は書かず、全項が0なら答えを0と書きます。';}
$('check').textContent=divide?'0には逆数がないので、0で割ることはできません。':m.scalar.n<0?'負の数を掛けると、各項の符号が反対になります。':m.scalar.n===0?'0を掛けることはできます。0で割ることとは区別します。':'数を掛けても、文字の指数を足したり変えたりはしません。';state={i,j,step,divide,...m};}
for(const id of ['example','scalar'])$(id).onchange=()=>{$('step').value=0;render();};$('step').addEventListener('input',render);$('reset').onclick=()=>{$('example').value=0;$('scalar').value=0;$('step').value=0;render();};window.PolynomialScale={get:()=>state};render();
})();
