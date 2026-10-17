'use strict';
const OPS={add:{name:'たし算 ＋',sign:'＋',concept:'同じ大きさにそろえて、合わせる',examples:[[1,2,1,3],[2,5,1,5],[3,4,2,3],[2,3,1,3]]},sub:{name:'ひき算 −',sign:'−',concept:'同じ大きさにそろえて、取り除く',examples:[[3,4,1,6],[5,6,1,3],[2,3,2,3],[5,4,1,2]]},mul:{name:'かけ算 ×',sign:'×',concept:'ある量の、何分のいくつ',examples:[[2,3,3,4],[1,2,1,3],[3,2,2,3],[4,5,5,6]]},div:{name:'わり算 ÷',sign:'÷',concept:'その大きさが、何個分あるか',examples:[[3,4,1,2],[2,3,4,5],[1,2,3,4],[4,3,2,3]]}};
let mode='arithmetic',pair=[3,4];
let op='add',values=[1,2,1,3],step=0;
const $=id=>document.getElementById(id);
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const reduce=(n,d)=>{if(d===0)throw Error('分母は0にできません');let g=gcd(n,d);return[n/g,d/g]};
const calculate=(o,a,b,c,d)=>{if(!b||!d||(o==='div'&&!c))throw Error('0でわることはできません');return reduce(o==='add'?a*d+c*b:o==='sub'?a*d-c*b:o==='mul'?a*c:a*d,o==='div'?b*c:b*d)};
function f(n,d,cls=''){return `<span class="frac ${cls}" aria-label="${d}分の${n}"><span class="n">${n}</span><span>${d}</span></span>`}
function answer(n,d){return d===1?`<span class="green">${n}</span>`:f(n,d,'green')}
function bar(n,d,y,label,color='#387cb4',crossFrom=null){const unit=170,x=170,total=Math.max(1,Math.ceil(n/d));let s=`<text x="5" y="${y+22}" font-size="17" fill="#344550">${label}</text>`;for(let i=0;i<total*d;i++){let fill=i<n?color:'#f2f5f6';s+=`<rect x="${x+i*unit/d}" y="${y}" width="${unit/d}" height="32" fill="${fill}" stroke="#6e8390" stroke-width=".8"/>`;if(crossFrom!==null&&i>=crossFrom&&i<n)s+=`<path d="M${x+i*unit/d+2} ${y+3}l${unit/d-4} 26" stroke="#172e3b" stroke-width="2"/>`;}for(let i=0;i<=total;i++)s+=`<path d="M${x+i*unit} ${y+33}v6" stroke="#506472"/><text x="${x+i*unit}" y="${y+55}" text-anchor="middle" font-size="13" fill="#506472">${i}</text>`;return s}
function bars(items){const max=Math.max(...items.map(x=>Math.ceil(x.n/x.d)),1);return `<svg role="img" aria-label="1の長さをそろえた分数のテープ図" viewBox="0 0 ${190+170*max} ${items.length*84+5}">${items.map((x,i)=>bar(x.n,x.d,i*84+3,x.label,x.color,x.cross)).join('')}</svg>`}
function area(a,b,c,d,stage){const u=145,x=35,y=26,w=u*Math.max(1,a/b),h=u*Math.max(1,c/d);let s=`<svg role="img" aria-label="横${b}分の${a}、縦${d}分の${c}の長方形の面積" viewBox="0 0 ${Math.max(w+175,350)} ${h+75}"><rect x="${x}" y="${y}" width="${u}" height="${u}" fill="#f2f5f6" stroke="#647987" stroke-dasharray="5 4"/>`;for(let i=0;i<b;i++)for(let j=0;j<d;j++)s+=`<rect x="${x+i*u/b}" y="${y+j*u/d}" width="${u/b}" height="${u/d}" fill="none" stroke="#c3cdd0" stroke-width=".8"/>`;for(let i=0;i<a;i++)for(let j=0;j<c;j++)s+=`<rect x="${x+i*u/b}" y="${y+j*u/d}" width="${u/b}" height="${u/d}" fill="${stage===0?'#d9e7f1':'#90bca0'}" stroke="#486855" stroke-width=".8"/>`;s+=`<text x="${x}" y="${h+52}" font-size="15" fill="#175d9a">横 ${a}/${b} × 縦 ${c}/${d}</text><text x="${x+w+8}" y="${y+15}" font-size="13" fill="#596970">点線の正方形</text><text x="${x+w+8}" y="${y+34}" font-size="13" fill="#596970">の面積が 1</text></svg>`;return s}
function divisionDiagram(a,b,c,d,stage){const L=b*d/gcd(b,d),A=a*L/b,B=c*L/d; if(stage<2)return bars([{n:A,d:L,label:`もとの量 ${a}/${b}`},{n:B,d:L,label:`1組分 ${c}/${d}`,color:'#d39355'}]);let q=A/B,units=Math.max(1,Math.ceil(q)),u=110,x=30;let s=`<svg role="img" aria-label="わる数を1組として、もとの量に何組分あるかを表した図" viewBox="0 0 ${Math.max(units*u+70,360)} 125"><text x="30" y="20" font-size="16" fill="#455a50">${c}/${d} を「1組」に読み替える</text>`;for(let k=0;k<units;k++){s+=`<rect x="${x+k*u}" y="40" width="${u}" height="38" fill="#f4f5f3" stroke="#53705b"/><rect x="${x+k*u}" y="40" width="${Math.max(0,Math.min(1,q-k))*u}" height="38" fill="#8fb99b" stroke="#53705b"/>`;s+=`<text x="${x+k*u}" y="102" text-anchor="middle" font-size="14">${k}</text>`;}s+=`<text x="${x+units*u}" y="102" text-anchor="middle" font-size="14">${units}組</text></svg>`;return s;}
// Multiplication cross-cancellation is intentionally step-driven, with no timers.
// Every next/back/reset renders one complete, deterministic state.
function cancellationEquation(nums,active=[],changed=[]){
 const digit=key=>`<span data-cancel-slot="${key}" class="cancel-number${active.includes(key)?' cancel-target':''}${changed.includes(key)?' cancel-new':''}">${nums[key]}</span>`;
 const frac=(n,d)=>`<span class="frac cancel-frac" aria-label="${nums[d]}分の${nums[n]}"><span class="n">${digit(n)}</span><span>${digit(d)}</span></span>`;
 return `<span class="cancel-product">${frac('a','b')}<span>×</span>${frac('c','d')}</span>`;
}
function cancellationStages(a,b,c,d){
 const roles={a:'左の分子',b:'左の分母',c:'右の分子',d:'右の分母'};
 let nums={a,b,c,d},changed=[],out=[];
 for(const keys of [['a','d'],['c','b']]){
  const [k1,k2]=keys,g=gcd(nums[k1],nums[k2]);
  if(g<=1)continue; // Do not teach a needless divide-by-one operation.
  const sources=[nums[k1],nums[k2]],results=sources.map(n=>n/g),stepName=`${sources[0]} と ${sources[1]} を、${g} で割る`;
  const common={divisor:g,keys:[...keys],sources:[...sources],results:[...results]};
  out.push({...common,phase:'focus',numbers:{...nums},title:stepName,eq:cancellationEquation(nums,keys,changed),ex:`${roles[k1]} ${sources[0]} と ${roles[k2]} ${sources[1]} に注目。赤枠の2つを、同じ数 ${g} で割ります。`,vis:`<div class="cancel-prompt">まず、式の中の赤枠を確認。<br><span>次に <strong>÷ ${g}</strong> の結果を出します。</span></div>`,cap:'まだ元の数は変えていません。',nextLabel:'次へ →'});
  const working=keys.map((key,i)=>`<div class="cancel-work"><p class="cancel-role">${roles[key]}</p><div class="cancel-calc"><span>${sources[i]}</span><span class="cancel-operation">÷ ${g}</span><span class="cancel-arrow" aria-label="計算すると">→</span><strong class="cancel-new">${results[i]}</strong></div></div>`).join('');
  out.push({...common,phase:'calculate',numbers:{...nums},title:'計算結果は、いったん枠の外へ',eq:cancellationEquation(nums,keys,changed),ex:'元の式を残して、2つの結果を確かめます。確認したら、右矢印で次へ進んでください。',vis:`<div class="cancel-work-grid" aria-label="赤枠の数を割った計算結果">${working}</div>`,cap:'オレンジの結果は、まだ式に入れていません。',nextLabel:'次へ →'});
  keys.forEach((key,i)=>nums[key]=results[i]);changed.push(...keys);
  out.push({...common,phase:'replace',numbers:{...nums},title:'結果を、元の位置に戻す',eq:cancellationEquation(nums,[],changed),ex:`${roles[k1]}を ${results[0]}、${roles[k2]}を ${results[1]} に置き換えました。ほかの数はそのままです。`,vis:'<div class="cancel-settled">この組の約分は終わり。<br>計算の矢印と赤枠を消しました。</div>',cap:'オレンジの数が、置き換えた結果です。積の値は変わりません。'});
 }
 return out;
}

function arithmeticLesson(){let[a,b,c,d]=values,L=b*d/gcd(b,d),A=a*L/b,B=c*L/d,[rn,rd]=calculate(op,a,b,c,d),g1=gcd(a,d),g2=gcd(c,b),aa=a/g1,dd=d/g1,cc=c/g2,bb=b/g2;let initial=`${f(a,b,'blue')}<span>${OPS[op].sign}</span>${f(c,d,'orange')}`,rawN=op==='add'?A+B:op==='sub'?A-B:op==='mul'?aa*cc:a*d,rawD=op==='add'||op==='sub'?L:op==='mul'?bb*dd:b*c,g=gcd(rawN,rawD),steps=[];let add=(title,eq,ex,vis,cap)=>steps.push({title,eq,ex,vis,cap});
if(op==='add'||op==='sub'){
 const isAdd=op==='add',word=isAdd?'足す':'引く';
 add('まず、かけらの大きさを見る',initial,`左は 1 を ${b} 等分したかけらが ${a} 個。右は 1 を ${d} 等分したかけらが ${c} 個です。${b===d?'かけらの大きさは、すでに同じです。':'大きさが違うまま、個数だけを計算することはできません。'}`,bars([{n:a,d:b,label:`左 ${a}/${b}`},{n:c,d:d,label:`右 ${c}/${d}`,color:'#d39355'}]),'どの段も、目盛り 0 から 1 までの長さは同じです。');
 add('通分：同じ大きさのかけらにする',`${f(`${a}×${L/b}`,`${b}×${L/b}`,'blue')}<span>${OPS[op].sign}</span>${f(`${c}×${L/d}`,`${d}×${L/d}`,'orange')}`,`分母を ${b} と ${d} の最小公倍数 ${L} にそろえます。分子と分母に同じ数をかけるので、量は変わりません。`,bars([{n:A,d:L,label:`左 ${A}/${L}`},{n:B,d:L,label:`右 ${B}/${L}`,color:'#d39355'}]),`左は上下に ${L/b}、右は上下に ${L/d} をかけます。`);
 add(`1/${L} のかけらを数える`,`${f(A,L,'blue')}<span>${OPS[op].sign}</span>${f(B,L,'orange')}`,`これで両方とも 1/${L} のかけらです。${isAdd?`${A} 個と ${B} 個を合わせます。`:`${A} 個から ${B} 個を取り除きます。`}`,bars([{n:A,d:L,label:`左：${A} 個`},{n:B,d:L,label:`右：${B} 個`,color:'#d39355'}]),'かけら1個の大きさがそろいました。');
 add(`分子を${word}。分母はそのまま`,`${f(`${A}${OPS[op].sign}${B}`,L,'focus')}<span>＝</span>${f(rawN,L,'green')}`,`個数は ${A} ${OPS[op].sign} ${B} = ${rawN} 個です。かけらの大きさ 1/${L} は変わらないので、分母は ${L} のままです。`,bars([{n:isAdd?rawN:A,d:L,label:isAdd?`合わせて ${rawN} 個`:`${B} 個を消す`,color:'#76a987',cross:isAdd?null:rawN}]),isAdd?'同じ大きさのかけらをつなげた図です。':'斜線のかけらを取り除くと、斜線のないかけらが残ります。');
}else if(op==='mul'){
 add('「ある量の、何分のいくつ」',initial,`${a}/${b} の量を ${d} 等分したうちの ${c} 個分を求めます。図では、横 ${a}/${b}、縦 ${c}/${d} の長方形の面積として考えます。`,area(a,b,c,d,0),'点線の正方形の面積が 1。小さな長方形1個の面積は 1/('+b+'×'+d+') です。');
 add('小さな長方形の、面積と個数を見る',`${f(`${a}×${c}`,`${b}×${d}`)}<span>＝</span>${f(a*c,b*d,'green')}`,`基準の正方形1個を ${b} × ${d} = ${b*d} 個に等分しています。小さな長方形1個の面積は1/${b*d}。色のついた長方形は ${a} × ${c} = ${a*c} 個なので、面積は${a*c}/${b*d}です。`,area(a,b,c,d,1),'薄い格子が、面積1を分けた基準。色のついた個数が分子になります。');
 const cancelSteps=cancellationStages(a,b,c,d);
 add(cancelSteps.length?'先に約分する数を、一組ずつ見る':'この2組では、先に約分しない',cancellationEquation({a,b,c,d}),cancelSteps.length?'左の分子と右の分母、次に右の分子と左の分母を調べます。割れる組を、一組ずつ確かめましょう。':'斜めの2組には、1より大きい共通の約数がありません。このまま分子どうし・分母どうしをかけ、必要なら最後に約分します。',area(a,b,c,d,1),'約分できるのは、積の分子と分母です。足し算・引き算の項をまたいではできません。');
 steps.push(...cancelSteps);
 add('分子どうし・分母どうしをかける',`${f(`${aa}×${cc}`,`${bb}×${dd}`)}<span>＝</span>${f(rawN,rawD,'green')}`,`分子は ${aa} × ${cc} = ${rawN}、分母は ${bb} × ${dd} = ${rawD}。もとの図では、面積 1/${b*d} の長方形 ${a*c} 個分と同じ量です。`,area(a,b,c,d,1),`面積は ${a*c}/${b*d} = ${rawN}/${rawD} です。`);
}else{
 add('わり算は「何組分ある？」',initial,`${a}/${b} の中に、${c}/${d} が何組分入るかを考えます。わる数 ${c}/${d} が、1組の大きさです。`,divisionDiagram(a,b,c,d,0),'上がもとの量、下が1組分。ここでは、0から1までの長さが同じです。');
 add('わる数を 1 にする倍率を考える',`${f(c,d,'orange')}<span>×</span>${f(d,c,'focus')}<span>＝ 1</span>`,`${c}/${d} に逆数 ${d}/${c} をかけると 1 になります。分子と分母を入れ替えるのは、この「1組」を基準にするためです。`,divisionDiagram(a,b,c,d,1),`${c} × ${d} と ${d} × ${c} が等しいので、積は 1 です。`);
 add('両方に同じ倍率をかける',`<span>（</span>${f(a,b,'blue')}<span>×</span>${f(d,c,'focus')}<span>）÷ 1</span>`,`もとの量にも同じ ${d}/${c} をかけます。両方を同じ倍率で変えても「何組分か」は変わりません。わる数が 1 になったので、残るのは逆数とのかけ算です。`,divisionDiagram(a,b,c,d,2),'ここから目盛りの単位は「組」。もとの量の 1 とは異なります。');
 add('逆数とのかけ算を計算する',`${f(a,b,'blue')}<span>×</span>${f(d,c,'orange')}<span>＝</span>${f(rawN,rawD,'green')}`,`分子は ${a} × ${d} = ${rawN}、分母は ${b} × ${c} = ${rawD}。${a}/${b} の中に ${c}/${d} は ${rawN}/${rawD} 組分あります。`,divisionDiagram(a,b,c,d,3),'余った部分も、1組分を基準にした分数で表せます。');
}
add(g>1?'最後に、約分してすっきり':rawD===1?'整数で表せるか確かめる':'答えを確かめる',`${f(rawN,rawD)}<span>＝</span>${answer(rn,rd)}`,rawN===0?'残った量は 0。分子が 0 の分数は、分母が 0 でなければ 0 です。':`${g>1?`分子と分母を共通の数 ${g} で割ると、${rn}/${rd} になります。`:'これ以上、約分する必要はありません。'}${rd===1?`答えは整数 ${rn} です。`:rn>rd?` 1 より大きいので、仮分数で表しています。`:''}${op==='div'?' 答えの単位は「組分」です。':''}`,op==='mul'?area(a,b,c,d,4):op==='div'?divisionDiagram(a,b,c,d,4):bars([{n:rn,d:rd,label:'答え',color:'#76a987'}]),'約分は表し方を変えるだけ。量そのものは変わりません。');return steps;
}
function shareDiagram(n,d,stage){if(n===0)return '<svg role="img" aria-label="0枚なので、1人分も0枚" viewBox="0 0 400 100"><text x="200" y="55" text-anchor="middle" font-size="24">配るものは 0 枚 → 1人分も 0 枚</text></svg>';let rows=Math.ceil(n/2),s=`<svg role="img" aria-label="${n}枚をそれぞれ${d}等分し、各枚から1片ずつAさんに配る図" viewBox="0 0 400 ${rows*70+30}">`;for(let i=0;i<n;i++){let x=12+(i%2)*200,y=22+Math.floor(i/2)*70;s+=`<text x="${x}" y="${y-6}" font-size="13">${i+1}枚目（この1枚が 1）</text>`;for(let k=0;k<(stage===0?1:d);k++){let wid=172/(stage===0?1:d);s+=`<rect x="${x+k*wid}" y="${y}" width="${wid}" height="32" fill="${stage>=2&&k===0?'#90bca0':'#eef2f4'}" stroke="#657b85"/>`;if(stage>=2&&k===0)s+=`<text x="${x+wid/2}" y="${y+22}" text-anchor="middle" font-size="14">A</text>`;}}return s+'</svg>'}
function lesson(){if(mode==='arithmetic')return arithmeticLesson();let a=values[0],b=values[1],c=values[2],d=values[3],L=b*d/gcd(b,d),A=a*L/b,B=c*L/d;const mk=(title,eq,ex,vis,cap)=>({title,eq,ex,vis,cap});if(mode==='common'){let before=bars([{n:a,d:b,label:`左 ${a}/${b}`},{n:c,d:d,label:`右 ${c}/${d}`,color:'#d39355'}]),after=bars([{n:A,d:L,label:`左 ${A}/${L}`},{n:B,d:L,label:`右 ${B}/${L}`,color:'#d39355'}]);return [mk('通分は、分母をそろえること',`${f(a,b,'blue')}<span>と</span>${f(c,d,'orange')}`,`1を${b}等分したかけらと、${d}等分したかけら。同じ大きさで比べられるように、区切り方をそろえます。`,before,'0から1までの長さは同じ。通分だけでは、足したり引いたりしません。'),mk('共通の分母を見つける',`<span>${b} と ${d} → </span><span class="focus">${L}</span>`,`${b}と${d}の両方の倍数を選びます。今回は、いちばん小さい共通の倍数（最小公倍数）${L}を使います。`,before,`${L*2}など、ほかの共通の倍数でも通分できます。`),mk('分子と分母に、同じ数をかける',`${f(`${a}×${L/b}`,`${b}×${L/b}`,'blue')}<span>と</span>${f(`${c}×${L/d}`,`${d}×${L/d}`,'orange')}`,`左は分子と分母に${L/b}、右は分子と分母に${L/d}をかけます。かけらを細かくした分だけ、個数も増えます。`,after,'区切り線を増やしても、色のついた長さは変わりません。'),mk('量を変えずに、分母がそろった',`${f(a,b,'blue')}<span>＝</span>${f(A,L,'blue focus')}<span>と</span>${f(c,d,'orange')}<span>＝</span>${f(B,L,'orange focus')}`,`どちらも1/${L}のかけらで表せました。通分の前と後で、それぞれの分数の大きさは同じです。`,after,'分母だけを変えると量が変わってしまいます。必ず分子にも同じ数をかけます。')];}
let[n,k]=pair,[rn,rd]=reduce(n,k),vis=i=>shareDiagram(n,k,i);return [mk('同じ大きさのものを、等しく分ける',`<span>${n} ÷ ${k}</span>`,`${n}枚を${k}人で等しく分けます。1人分は何枚になるでしょう。`,vis(0),'この図では、1は「1枚」。答えは「1人分の枚数」です。'),mk('1枚ずつ、人数に合わせて等分する',`<span>1 ÷ ${k} ＝ </span>${f(1,k)}`,`1枚を${k}等分すると、1片は1/${k}枚です。${n}枚それぞれを、同じように分けます。`,vis(1),`1片は、全部まとめた量の分数ではなく「1枚の${k}分の1」です。`),mk('1人は、各枚から1片ずつ受け取る',`${f(1,k,'blue')}<span>× ${n} ＝</span>${f(n,k,'green')}`,`Aさんは、各枚から1/${k}枚ずつ受け取ります。全部で${n}片あるので、1人分は${n}/${k}枚です。他の人も同じ量を受け取ります。`,vis(2),'緑の「A」が、1人分の取り分です。'),mk('割られる数を分子、割る数を分母にする',`<span>${n} ÷ ${k} ＝</span>${f(n,k,'focus')}${n===rn&&k===rd?'':`<span>＝</span>${answer(rn,rd)}`}`,`${n}÷${k}は${n}/${k}と書けます。${n>k?`1人分は1枚より多く、${Math.floor(n/k)}枚${n%k?`と${n%k}/${k}枚`:""}です。`:n===0?'0枚を分けても、1人分は0枚です。':'分けきれないときも、分数なら正確に表せます。'}`,vis(2),'a ÷ b = a/b（b は 0 以外）。0で割ることはできません。')];}
function setMode(m){closeMeaning();mode=m;step=0;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.mode===m));if(m==='arithmetic'){change(document.body.dataset.operation||'add');return;}if(m==='common'){values=[1,2,1,3];$('preset').innerHTML=[[1,2,1,3],[2,3,3,4],[1,4,2,6],[3,2,2,3]].map((v,i)=>`<option value="${i}">${v[0]}/${v[1]} と ${v[2]}/${v[3]}</option>`).join('');}else{pair=[3,4];$('preset').innerHTML=[[3,4],[7,3],[1,2],[0,4],[6,3]].map((v,i)=>`<option value="${i}">${v[0]} ÷ ${v[1]}</option>`).join('');}render();}
// Keep the original explanations and diagrams available, with a shorter
// equation-first reading path. Calculation-state cards remain visible.
function compactPresentation(x,total){
 const[a,b,c,d]=values;
 if(x.phase)return {title:x.title,ex:x.ex};
 if(mode==='common')return [
  {title:'通分する2つの分数',ex:`分母 ${b} と ${d} を、同じ数にそろえます。`},
  {title:'共通の分母を選ぶ',ex:`${b} と ${d} の最小公倍数を使います。`},
  {title:'上下に、同じ数をかける',ex:'分子にも同じ数をかけるので、分数の大きさは変わりません。'},
  {title:'分母がそろった',ex:'それぞれ同じ大きさの分数のまま、表し方をそろえました。'}
 ][step];
 if(mode==='conversion'){
  const[n,k]=pair;
  return [
   {title:'分数に直す割り算',ex:`${n} を ${k} で割った値を、分数で表します。`},
   {title:'1 を割ると',ex:`1 を ${k} 等分した、1つ分です。`},
   {title:`その ${n} 個分を集める`,ex:`分母は ${k} のまま、分子は ${n} になります。`},
   {title:'割られる数が上、割る数が下',ex:'割る数は 0 以外。必要なら最後に約分します。'}
  ][step];
 }
 const L=b*d/gcd(b,d),A=a*L/b,B=c*L/d;
 if(step===total-1){
  const [rn,rd]=calculate(op,a,b,c,d);
  const N=op==='add'?A+B:op==='sub'?A-B:op==='mul'?(a/gcd(a,d))*(c/gcd(c,b)):a*d;
  const D=op==='add'||op==='sub'?L:op==='mul'?(b/gcd(c,b))*(d/gcd(a,d)):b*c,g=gcd(N,D);
  return {title:rn===0?'答えは 0':rd===1?'整数の答え':'答えを確かめる',ex:rn===0?'残った量は 0 です。':(g>1?`分子と分母を ${g} で割ります。`:'これ以上、約分は必要ありません。')+(op==='div'?' 答えは「何組分か」を表します。':'')};
 }
 if(op==='add'||op==='sub'){
  const verb=op==='add'?'足す':'引く';
  return [
   {title:'計算する式を確認',ex:b===d?'分母は、すでに同じです。':'まず、分母を同じ数にそろえます。'},
   {title:`分母を ${L} にそろえる`,ex:`左は上下に ${L/b}、右は上下に ${L/d} をかけます。`},
   {title:'同じ分母にそろった',ex:`分母は ${L}。次は、分子を${verb}計算です。`},
   {title:`分子を${verb}。分母はそのまま`,ex:`${A} ${OPS[op].sign} ${B} を計算します。分母 ${L} は変えません。`}
  ][step];
 }
 if(op==='mul'){
  if(step===0)return {title:'計算する式を確認',ex:'分子どうし、分母どうしをかける計算です。'};
  if(step===1)return {title:'分子どうし・分母どうしをかける',ex:`分子は ${a} × ${c}、分母は ${b} × ${d}。`};
  if(step===2)return {title:x.title,ex:gcd(a,d)>1||gcd(c,b)>1?'分子と分母の組を、一組ずつ先に約分します。':'斜めの2組では約分できません。積を出してから、必要なら約分します。'};
  return {title:x.title,ex:'約分した数で、分子どうし・分母どうしをかけます。'};
 }
 return [
  {title:'計算する式を確認',ex:'左の量の中に、右の分数が何組分あるかを求めます。'},
  {title:'割る数を 1 にする',ex:'分子と分母を入れ替えた逆数をかけます。'},
  {title:'両方に、同じ逆数をかける',ex:'両方を同じ倍率で変えても、商は変わりません。'},
  {title:'逆数とのかけ算にする',ex:`分子は ${a} × ${d}、分母は ${b} × ${c}。`}
 ][step];
}
function closeMeaning(){$('meaning-details').open=false;}

function renderTask(){
 if(mode==='conversion'){$('task-goal').textContent='この割り算を、分数で表す';$('task-source').innerHTML=`<span>${pair[0]} ÷ ${pair[1]}</span>`;return;}
 const[a,b,c,d]=values;
 $('task-goal').textContent=mode==='common'?'この2つの分数を、通分する':'この計算をする';
 $('task-source').innerHTML=`${f(a,b)}<span>${mode==='common'?'と':OPS[op].sign}</span>${f(c,d)}`;
}
function render(){renderTask();let s=lesson(),x=s[step],brief=compactPresentation(x,s.length);$('counter').textContent=`STEP ${step+1} / ${s.length}`;$('concept').textContent=mode==='common'?'量を変えずに、区切り方をそろえる':mode==='conversion'?'1人分を、分数で表す':OPS[op].concept;$('stepTitle').textContent=brief.title;$('equation').innerHTML=x.eq;$('equation').setAttribute('data-mode',mode);$('equation').setAttribute('data-operation',op);$('equation').setAttribute('data-stage',String(step));$('explain').textContent=brief.ex;$('visual').hidden=!x.phase;$('visual').innerHTML=x.phase?x.vis:'';$('meaning-explain').textContent=x.phase?'図は、もとの2つの分数の積を面積で表しています。約分しても、この面積は変わりません。':x.ex;$('meaning-visual').innerHTML=x.phase?area(...values,1):x.vis;$('caption').textContent=x.phase?'点線の正方形の面積が 1。約分の前後で、全体の積は同じです。':x.cap;$('prev').disabled=step===0;$('next').disabled=step===s.length-1;$('next').textContent=x.nextLabel||'次へ →';$('dots').innerHTML=s.length>7?`<span class="cancel-step-count">${step+1} / ${s.length}</span>`:s.map((_,i)=>`<i class="${i===step?'on':''}"></i>`).join('');$('takeaway').textContent=op==='add'?'ポイント：分母をそろえる → 分子を足す → 約分する。':op==='sub'?'ポイント：分母をそろえる → 分子を引く → 約分する。例題の答えは 0 以上です。':op==='mul'?'ポイント：先に約分できるか見る → 分子どうし・分母どうしをかける。': 'ポイント：わる数を逆数にする → かけ算にする。「何組分か」は、1 より小さい分数にもなります。0 でわる例題は出ません。';if(mode==='common')$('takeaway').textContent='ポイント：共通の分母を選ぶ → 分子と分母に同じ数をかける。分数の量は変わりません。';if(mode==='conversion')$('takeaway').textContent='ポイント：割られる数 ÷ 割る数 = 割られる数 / 割る数。分母は0にできません。';document.querySelectorAll('[data-op]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.op===op));}
function change(o){closeMeaning();op=o;step=0;values=[...OPS[o].examples[0]];$('preset').innerHTML=OPS[o].examples.map((v,i)=>`<option value="${i}">${v[0]}/${v[1]} ${OPS[o].sign} ${v[2]}/${v[3]}</option>`).join('');render()}
$('preset').onchange=e=>{if(e.target.value==='random')return;closeMeaning();if(mode==='conversion')pair=[[3,4],[7,3],[1,2],[0,4],[6,3]][+e.target.value];else if(mode==='common')values=[[1,2,1,3],[2,3,3,4],[1,4,2,6],[3,2,2,3]][+e.target.value];else values=[...OPS[op].examples[+e.target.value]];step=0;render()};$('prev').onclick=()=>{if(step>0){step--;render()}};$('next').onclick=()=>{if(step<lesson().length-1){step++;render()}};$('reset').onclick=()=>{closeMeaning();step=0;render()};$('random').onclick=()=>{closeMeaning();if(mode==='conversion'){pair=[Math.floor(Math.random()*8),2+Math.floor(Math.random()*4)];step=0;let o=document.createElement('option');o.value='random';o.textContent=`${pair[0]} ÷ ${pair[1]}（おためし）`;let old=$('preset').querySelector('[value=random]');if(old)old.remove();$('preset').append(o);$('preset').value='random';render();return;}let b=2+Math.floor(Math.random()*5),d=2+Math.floor(Math.random()*5),a=1+Math.floor(Math.random()*b),c=1+Math.floor(Math.random()*d);if(mode==='arithmetic'&&op==='sub'&&a*d<c*b)[a,b,c,d]=[c,d,a,b];values=[a,b,c,d];step=0;$('preset').innerHTML=(mode==='common'?[[1,2,1,3],[2,3,3,4],[1,4,2,6],[3,2,2,3]]:OPS[op].examples).map((v,i)=>`<option value="${i}">${v[0]}/${v[1]} ${mode==='common'?'と':OPS[op].sign} ${v[2]}/${v[3]}</option>`).join('')+`<option value="random" selected>${a}/${b} ${mode==='common'?'と':OPS[op].sign} ${c}/${d}（おためし）</option>`;render()};setMode(document.body.dataset.lessonMode||'arithmetic');
