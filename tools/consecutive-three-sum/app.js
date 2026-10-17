(function(){'use strict';
function model(middle){const integers=[middle-1,middle,middle+1];return {middle,integers,sum:integers.reduce((a,b)=>a+b,0),multiple:3*middle};}
const api={model};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),num=n=>String(n).replace('-','−'),wrap=n=>n<0?'('+num(n)+')':num(n);let state;
function render(){const middle=+$('sample').value,step=+$('step').value,m=model(middle);$('sample-out').textContent=num(middle);$('sample-note').textContent='表示中の具体例：'+m.integers.map(num).join('、');$('stage-title').textContent=['具体例で予想を確かめる','任意の整数で3つの数を表す','和を文字式で整理する','3の倍数という結論につなぐ'][step];$('work-label').textContent=step===0?'この1組についての確認':'すべての連続する3整数について考える';
if(step===0){$('work').innerHTML=m.integers.map(wrap).join(' ＋ ')+'<br>＝ '+num(m.sum)+' ＝ 3 × '+wrap(middle);$('result').textContent='この組の和は3の倍数';$('reason').textContent='例を変えて予想を確かめます。ただし、有限個の例が成り立つだけでは、すべての場合の理由を示したことにはなりません。';$('check').textContent='次は具体的な数を決めず、文字で説明します。';}
if(step===1){$('work').innerHTML='<div class="definition">真ん中の整数を n とする</div><div class="integer-row"><span>n − 1</span><span>n</span><span>n ＋ 1</span></div>';$('result').textContent='nは任意の整数';$('reason').textContent='1小さい整数がn−1、1大きい整数がn＋1です。どの連続する3整数も、その真ん中をnとしてこの形で表せます。';$('check').textContent='nを正の整数だけに限定しません。負の整数や0でも同じ表し方です。';}
if(step===2){$('work').innerHTML='(n − 1) ＋ n ＋ (n ＋ 1)<br>＝ n ＋ n ＋ n − 1 ＋ 1<br>＝ <strong>3n</strong>';$('result').textContent='和を「3 × 整数」の形にする';$('reason').textContent='同類項をまとめると、nが3つで3n、−1と＋1は相殺して0になります。具体的な数を代入せずに整理できました。';$('check').textContent='目指す形は3n。3の倍数だといえる理由につながります。';}
if(step===3){$('work').innerHTML='<strong>3n ＝ 3 × n</strong><br><span class="detail">nは整数なので、3nは3の倍数</span>';$('result').textContent='連続する3整数の和は、3の倍数';$('reason').textContent='任意の整数nで表した和が3×整数になりました。したがって、すべての連続する3整数について結論が成り立ちます。';$('check').textContent='−3＝3×(−1)、0＝3×0も3の倍数です。具体例の確認と一般的な証明を区別しよう。';}
state={step,...m};}
$('sample').addEventListener('input',render);$('step').addEventListener('input',render);$('reset').onclick=()=>{$('sample').value=3;$('step').value=0;render();};window.ConsecutiveThree={get:()=>state};render();
})();
