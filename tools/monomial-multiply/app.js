(function(){'use strict';
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function Q(n,d=1){if(!d)throw Error('zero denominator');if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return {n:n/g||0,d:d/g};}
const mul=(a,b)=>Q(a.n*b.n,a.d*b.d),div=(a,b)=>{if(!b.n)throw Error('zero divisor');return Q(a.n*b.d,a.d*b.n);};
// Each monomial is [coefficient numerator, denominator, x exponent, y exponent].
const examples={
 multiply:[{a:[-2,1,2,1],b:[3,1,1,2]},{a:[-1,2,1,0],b:[-4,3,0,2]},{a:[1,1,1,1],b:[-1,1,1,0]},{a:[3,4,2,0],b:[2,3,1,1]},{a:[-1,1,1,1],b:[-1,1,0,1]}],
 divide:[{a:[6,1,3,2],b:[-2,1,1,1]},{a:[-3,4,2,1],b:[-1,2,1,1]},{a:[1,1,2,0],b:[1,1,2,0]},{a:[-2,3,1,2],b:[4,9,1,0]},{a:[3,1,1,1],b:[3,1,1,1]}],
 power:[{a:[-2,1,1,1],p:2},{a:[-2,1,1,0],p:3},{a:[-1,2,2,1],p:2},{a:[2,3,1,2],p:3},{a:[-1,1,0,1],p:2}],
 mixed:[{a:[6,1,3,1],b:[-2,1,1,0],c:[3,1,0,1]},{a:[-3,4,2,1],b:[-1,2,1,1],c:[2,3,0,1]},{a:[2,1,1,2],b:[4,1,1,1],c:[-2,1,1,0]},{a:[1,1,2,0],b:[1,1,2,0],c:[3,1,0,1]},{a:[-2,3,2,1],b:[4,9,1,0],c:[-2,1,0,1]},{a:[-2,1,1,1],ap:2,b:[4,1,1,0],c:[-3,1,0,1]}]
};
const mono=v=>({q:Q(v[0],v[1]),x:v[2],y:v[3]});
function calculate(mode,e){const sourceA=mono(e.a),ap=e.ap||1,a={q:Q(sourceA.q.n**ap,sourceA.q.d**ap),x:sourceA.x*ap,y:sourceA.y*ap},b=e.b?mono(e.b):null,c=e.c?mono(e.c):null,p=e.p,divide=mode==='divide'||mode==='mixed';if(divide&&!b.q.n)throw Error('zero divisor');let q,x,y;
if(mode==='multiply'){q=mul(a.q,b.q);x=a.x+b.x;y=a.y+b.y;}
else if(mode==='power'){q=Q(a.q.n**p,a.q.d**p);x=a.x*p;y=a.y*p;}
else{q=div(a.q,b.q);x=a.x-b.x;y=a.y-b.y;if(mode==='mixed'){q=mul(q,c.q);x+=c.x;y+=c.y;}}
if(x<0||y<0)throw Error('negative exponent outside this lesson');return {sourceA,ap,a,b,c,p,result:{q,x,y},domain:divide?['x','y'].filter(v=>b[v]>0):[]};}
const model=(mode,i)=>calculate(mode,examples[mode][i]);const api={Q,mul,div,examples,calculate,model};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),mode=document.body.dataset.operation;let state;
const number=q=>'<span class="rational" data-value="'+q.n+'/'+q.d+'">'+(q.n<0?'−':'')+(q.d===1?Math.abs(q.n):'<span class="frac"><span>'+Math.abs(q.n)+'</span><span>'+q.d+'</span></span>')+'</span>';
const wrapped=q=>q.n<0?'('+number(q)+')':number(q);
const letters=t=>['x','y'].map(v=>t[v]?v+(t[v]>1?'<sup>'+t[v]+'</sup>':''):'').join('');
const monomial=t=>!t.q.n?'0':(t.q.n<0?'−':'')+(Math.abs(t.q.n)===t.q.d&&letters(t)?'':number(Q(Math.abs(t.q.n),t.q.d)))+letters(t);
const paren=t=>'('+monomial(t)+')';
const expanded=t=>wrapped(t.q)+(t.x+t.y?' × '+[...Array(t.x).fill('x'),...Array(t.y).fill('y')].join(' × '):'');
const fraction=(n,d)=>'<span class="whole-fraction"><span>'+n+'</span><span>'+d+'</span></span>';
function inverse(t){return(t.q.n<0?'−':'')+fraction(String(t.q.d),(Math.abs(t.q.n)===1&&letters(t)?'':Math.abs(t.q.n))+letters(t));}
const titles={multiply:['係数と文字の因数を分ける','係数と同じ文字を集める','文字の個数を足す','積をまとめる'],divide:['割る単項式を確かめる','除数全体の逆数を掛ける','係数を割り、文字を約分する','商と条件を確かめる'],power:['括弧全体の累乗を確かめる','同じ単項式の積に直す','係数と文字をそれぞれ累乗する','累乗の結果をまとめる'],mixed:['乗除の順序と除数を確かめる','割り算を逆数の掛け算に直す','係数と文字を整理する','結果と条件を確かめる']};
function render(){const i=+$('example').value,step=+$('step').value,m=model(mode,i),{a,b,c,p,result:r,domain}=m;
$('original').innerHTML=mode==='power'?paren(a)+'<sup>'+p+'</sup>':paren(m.sourceA)+(m.ap>1?'<sup>'+m.ap+'</sup>':'')+(mode==='multiply'?' × ':' ÷ ')+paren(b)+(c?' × '+paren(c):'');$('stage-title').textContent=titles[mode][step];$('work-label').textContent=['元の式を分けて見る','計算の形を変える','係数と文字の個数','計算の結果'][step];
if(step===0){$('work').innerHTML=[m.sourceA,b,c].filter(Boolean).map(t=>'<div class="factor-row">'+monomial(t)+' ＝ '+expanded(t)+'</div>').join('');$('result').textContent=mode==='power'?'括弧の外の指数は、係数にも文字にも掛かる':mode==='mixed'?(m.ap>1?'累乗を先に計算し、その後は左から':'乗法と除法は、左から順に計算する'):'数の因数が係数、xやyが文字の因数';$('reason').textContent=mode==='power'?'負号を含む単項式全体を、指数の数だけ掛けます。':mode==='mixed'?(m.ap>1?'まず括弧全体を2回掛けて累乗を計算します。その後の乗法・除法は左から順に計算します。':'A ÷ B × C は (A ÷ B) × C です。A ÷ (B × C) ではありません。'):'省かれた係数1や−1も、計算では数の因数として考えます。';}
if(step===1){if(mode==='multiply'){$('work').innerHTML='<div>'+wrapped(a.q)+' × '+wrapped(b.q)+'</div><div class="detail">× '+[...Array(a.x+b.x).fill('x'),...Array(a.y+b.y).fill('y')].join(' × ')+'</div>';$('reason').textContent='交換法則・結合法則で、数の因数と同じ文字の因数を集めます。';}
else if(mode==='power'){$('work').innerHTML=Array(p).fill('<span class="mono-factor">'+paren(a)+'</span>').join(' ×<wbr> ');$('reason').textContent='同じ単項式を'+p+'回掛けます。係数だけ、または文字だけを累乗するのではありません。';}
else{$('work').innerHTML=paren(a)+' × ('+inverse(b)+')'+(c?' × '+paren(c):'');$('reason').textContent=(m.ap>1?'累乗を先に計算しました。':'')+'割る単項式全体の逆数を掛けます。係数だけでなく文字の因数も分母へ移ります。';}
$('result').textContent=mode==='power'?'括弧全体を'+p+'個並べた積':mode==='multiply'?'文字の因数の個数は変わらない':'除数が0でない条件を保つ';}
if(step===2){const coefficient=mode==='power'?Array(p).fill(wrapped(a.q)).join(' × '):wrapped(a.q)+(mode==='multiply'?' × ':' ÷ ')+wrapped(b.q)+(c?' × '+wrapped(c.q):'');$('work').innerHTML='<div class="coefficient-work">'+coefficient+' ＝ '+number(r.q)+'</div>'+['x','y'].map(v=>'<div class="count-row">'+v+'：'+(mode==='power'?a[v]+'個 × '+p:mode==='multiply'?a[v]+'個 ＋ '+b[v]+'個':(a[v]+(c?c[v]:0))+'個から '+b[v]+'個を約分')+' → '+r[v]+'個</div>').join('');$('result').textContent='残った同じ文字の個数を指数にする';$('reason').textContent=mode==='power'?'係数も同じ回数掛けます。負の係数は、偶数回なら正、奇数回なら負になります。':mode==='multiply'?'同じ文字が何個掛かっているかを数えるので、指数は足します。係数どうしは掛けます。':'分子と分母の共通する文字の因数を約分します。分子に残る文字の個数を数えます。';}
if(step===3){$('work').innerHTML=monomial(r);$('result').textContent=!letters(r)?'文字がすべて約分され、数だけが残る':'係数1・指数1は省略する';$('reason').textContent=mode==='divide'||mode==='mixed'?'文字が消えても、元の割り算ができる条件は残ります。':'係数−1は−だけを書き、同じ文字の積を累乗で表します。';}
$('check').textContent=domain.length?'条件：'+domain.map(v=>v+' ≠ 0').join('、')+'。元の除数を0にしないためです。':'x・yは0でも使えます。';state={i,step,mode,...m};}
$('example').onchange=()=>{$('step').value=0;render();};$('step').addEventListener('input',render);$('reset').onclick=()=>{$('example').value=0;$('step').value=0;render();};window.MonomialOperations={get:()=>state};render();
})();
