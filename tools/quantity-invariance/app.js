(function(){'use strict';
function model(n,x,b){x=Math.max(0,Math.min(n,x));return {n,x,b,blue:n-x,total:100*x+100*(n-x)+b,simplified:100*n+b};}
const api={model};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let state;
function render(){const n=+$('count').value,x=+$('red').value,b=+$('bag').value,step=+$('step').value,m=model(n,x,b);$('red').max=n;$('red').value=m.x;$('count-out').textContent=n;$('red-out').textContent=m.x;$('example-note').textContent='今の例：赤'+m.x+'個・青'+m.blue+'個、袋代'+b+'円';$('stage-title').textContent=['数量と代金の関係を見る','数量を文字で表す','式を整理して消える文字を見る','残った文字から影響を判断する'][step];$('work-label').textContent=step===0?'赤も青も1個100円':step===1?'n：合計個数、x：赤の個数、b：袋代':step===2?'分配して同類項をまとめる':'合計代金T＝100n＋b';
if(step===0){$('work').innerHTML='100 × '+m.x+' ＋ 100 × '+m.blue+' ＋ '+b+'<br>＝ '+m.total+' 円';$('result').textContent='合計'+n+'個を、赤と青に分ける';$('reason').textContent='赤と青は同じ値段です。袋は1枚使い、その料金をb円とします。内訳だけを変えたときの合計代金を比べよう。';}
if(step===1){$('work').innerHTML='青の個数 ＝ n − x<br>T ＝ 100x ＋ 100(n − x) ＋ b';$('result').textContent='合計個数nを保つと、青の個数はn−x';$('reason').textContent='赤を1個増やすと青を1個減らします。内訳の比較では、合計個数nと袋代bを固定します。';}
if(step===2){$('work').innerHTML='T ＝ 100x ＋ 100n − 100x ＋ b<br>＝ <strong>100n ＋ b</strong>';$('result').textContent='＋100xと−100xが相殺する';$('reason').textContent='式を整理するとxが消えました。赤の個数を変えても、合計個数nと袋代bが同じなら代金Tは変わりません。';}
if(step===3){$('work').innerHTML='<div>内訳xだけを変える：Tは同じ</div><div>合計nを1増やす：Tは100円増える</div><div>袋代bを10円増やす：Tは10円増える</div>';$('result').textContent='影響する量：n・b ／ 内訳xにはよらない';$('reason').textContent='100n＋bに残る文字から、影響する量を読み取れます。この結論は赤と青の単価が同じという条件で成り立ちます。';}
$('current-total').textContent='今の合計代金：'+m.total+'円';$('check').textContent='n・xは整数、1 ≦ n、0 ≦ x ≦ n、b ≧ 0。内訳だけを比べるときはn・bを固定。';state={step,...m};}
for(const id of ['count','red'])$(id).addEventListener('input',render);$('bag').onchange=render;$('step').addEventListener('input',render);$('reset').onclick=()=>{$('count').value=6;$('red').max=6;$('red').value=2;$('bag').value=20;$('step').value=0;render();};window.QuantityInvariance={get:()=>state};render();
})();
