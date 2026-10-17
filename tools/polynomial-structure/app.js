(()=>{'use strict';
// Each example is already collected: [coefficient, exponent of x, exponent of y].
const examples=[[[3,2,0],[-2,1,1],[5,0,0]],[[-1,1,1]],[[1,2,1],[-1,0,2],[1,1,0],[-7,0,0]],[[-1,1,0],[1,0,1],[-1,0,0]],[[4,0,0]],[[2,2,3],[-1,1,1],[6,0,0]]];
const num=n=>String(n).replace('-','−');
const letters=([,x,y])=>[['x',x],['y',y]].map(([v,n])=>n?v+(n>1?'<sup>'+n+'</sup>':''):'').join('');
const term=t=>{const [a,x,y]=t;return (a<0?'−':'')+((x+y)&&Math.abs(a)===1?'':Math.abs(a))+letters(t);};
const expression=ts=>ts.map((t,i)=>i?(t[0]<0?' − ':' ＋ ')+term([Math.abs(t[0]),t[1],t[2]]):term(t)).join('');
const $=id=>document.getElementById(id);let chosen=0,state;
function render(){const i=+$('example').value,step=+$('step').value,ts=examples[i],t=ts[chosen],[a,x,y]=t,degree=x+y,degrees=ts.map(t=>t[1]+t[2]),maximum=Math.max(...degrees),constant=degree===0;
$('original').innerHTML=expression(ts);$('stage-title').textContent=['符号を含めて項に分ける','数の因数を係数として読む','掛けた文字の個数を数える','各項の次数から式全体へ'][step];
$('terms').innerHTML=ts.map((t,j)=>'<button type="button" data-term="'+j+'" aria-pressed="'+(j===chosen)+'">'+term(t)+'</button>').join('');
const product=[...(Array(x).fill('x')),...(Array(y).fill('y'))].join(' × ');
if(step===0){$('work').innerHTML=expression(ts)+'<br><span class="detail">＝ '+ts.map(t=>'('+term(t)+')').join(' ＋ ')+'</span>';$('result').textContent=ts.length===1?'単項式：数や文字の積で表される式':'多項式：'+ts.length+'個の単項式の和';$('reason').textContent='減法を、負の項を足す形に直します。−の符号も項の一部です。';$('check').textContent='項は、数や文字の積でできています。数だけの項もあります。';}
if(step===1){$('work').innerHTML=constant?term(t)+'<br><span class="detail">文字を含まない定数の項</span>':term(t)+' ＝ <span class="coefficient">('+num(a)+')</span> × '+letters(t);$('result').textContent=constant?'定数項：'+num(a):'係数：'+num(a);$('reason').textContent=constant?'この項には文字がありません。式の中で、定数項といいます。':'文字を含む項の数の因数が係数です。x の係数は1、−x の係数は−1です。';$('check').textContent='負の係数も、符号を含めて読みます。';}
if(step===2){$('work').innerHTML=constant?term(t)+'<br><span class="detail">掛けられた文字は0個</span>':term(t)+' ＝ ('+num(a)+') × '+product;$('result').textContent='この項の次数：'+degree;$('reason').textContent=constant?'0でない定数だけの項の次数は0です。':'次数は掛けられた文字の個数です。x と y の指数を足し、係数は数えません。';$('check').textContent=constant?'文字がないので、次数は0。':'x が'+x+'個、y が'+y+'個：'+x+' ＋ '+y+' ＝ '+degree;}
if(step===3){$('work').innerHTML=ts.map((t,j)=>'<span class="degree-row'+(degrees[j]===maximum?' highest':'')+'">'+term(t)+'：次数 '+degrees[j]+'</span>').join('');$('result').textContent='式全体の次数：'+maximum;$('reason').textContent=ts.length===1?'単項式では、その項の次数が式の次数です。':'多項式の次数は、各項の次数のうち最も大きいものです。項の次数を全部足すのではありません。';$('check').textContent='この例は同類項をまとめた式です。'+(maximum===1?'一次式です。':maximum===2?'二次式です。':'');}
state={i,step,chosen,terms:ts.map(t=>t.slice()),coefficient:a,degree,degrees,maximum};}
$('terms').addEventListener('click',e=>{const b=e.target.closest('[data-term]');if(!b)return;chosen=+b.dataset.term;render();$('terms').querySelector('[data-term="'+chosen+'"]').focus();});
$('example').addEventListener('change',()=>{chosen=0;$('step').value=0;render();});$('step').addEventListener('input',render);$('reset').onclick=()=>{$('example').value=0;$('step').value=0;chosen=0;render();};window.PolynomialStructure={get:()=>state};render();
})();
