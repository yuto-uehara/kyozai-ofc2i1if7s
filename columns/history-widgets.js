(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const svg=(label,body)=>`<svg viewBox="0 0 560 270" role="img" aria-label="${label}" xmlns="${NS}">${body}</svg>`;
  const txt=(x,y,s,size=30)=>`<text x="${x}" y="${y}" fill="#1b3038" font-size="${size}" text-anchor="middle">${s}</text>`;
  const q=(root,s)=>root.querySelector(s);
  document.querySelectorAll('.mini-lab').forEach(lab=>{
    const kind=lab.dataset.widget;
    if(!['bridges','ada','definition','zeno'].includes(kind))return;
    const controls=q(lab,'.lab-controls'), result=q(lab,'.lab-result'),figure=q(lab,'.lab-figure');
    controls.hidden=false;
    if(kind==='bridges'){
      const edges=[['A','B'],['A','B'],['A','C'],['A','C'],['A','D'],['B','D'],['C','D']];
      let start=null,at=null,steps=[],showDegrees=false;
      const update=()=>{
        const used=new Set(steps.map(s=>s.edge));
        lab.querySelectorAll('[data-start]').forEach(b=>{b.setAttribute('aria-pressed',String(start===b.dataset.start));});
        lab.querySelectorAll('[data-edge]').forEach(b=>{const i=+b.dataset.edge;b.disabled=!at||used.has(i)||!edges[i].includes(at);b.textContent=`${i+1}：${edges[i][0]}と${edges[i][1]}${used.has(i)?'（済）':''}`;});
        lab.querySelectorAll('[data-bridge]').forEach(path=>{const done=used.has(+path.dataset.bridge);path.setAttribute('stroke',done?'#aa5f05':'#7895a0');path.setAttribute('stroke-dasharray',done?'9 4':'none');});
        lab.querySelectorAll('[data-place]').forEach(node=>node.setAttribute('fill',node.dataset.place===at?'#f8d68e':'#ecf3f5'));
        q(lab,'[data-action=undo]').disabled=steps.length===0;
        q(lab,'[data-action=degrees]').setAttribute('aria-pressed',String(showDegrees));
        const stuck=at&&!edges.some((e,i)=>e.includes(at)&&!used.has(i));
        result.textContent=(at?`現在地${at}。渡った橋は${steps.length}／7本。${stuck?'ここから渡れる未使用の橋はありません。1手戻すか、最初から試せます。':'今いる陸地につながる、未使用の橋を選ぼう。'}`:'出発点を選んで始めよう。')+(showDegrees?' 橋の本数はAが5本、B・C・Dが各3本。奇数の陸地が4つあるため、どの道順でも7本を1回ずつ渡りきれません。':'');
        q(lab,'svg').setAttribute('aria-label',`7本の橋の模式図。${at?'現在地'+at+'。':''}渡った橋は${steps.length}本。`);
      };
      controls.addEventListener('click',e=>{
        const b=e.target.closest('button');if(!b||b.disabled)return;
        if(b.dataset.action==='start'){start=at=b.dataset.start;steps=[];}
        if(b.dataset.action==='bridge'){
          const edge=+b.dataset.edge;if(!at||steps.some(s=>s.edge===edge)||!edges[edge].includes(at))return;
          const from=at;at=edges[edge][0]===at?edges[edge][1]:edges[edge][0];steps.push({edge,from});
        }
        if(b.dataset.action==='undo'&&steps.length)at=steps.pop().from;
        if(b.dataset.action==='reset'){start=at=null;steps=[];showDegrees=false;}
        if(b.dataset.action==='degrees')showDegrees=!showDegrees;
        update();
      });update();
    }
    if(kind==='ada'){
      const input=q(lab,'[data-input=limit]');let n=5,k=0,total=0;
      const update=()=>{
        q(lab,'[data-value=limit]').textContent=n;
        const complete=k===n;
        q(lab,'[data-action=step]').disabled=complete;
        q(lab,'[data-action=step]').textContent=complete?'ここで終了':`${k+1}を足す`;
        figure.innerHTML=svg(`1から${n}までの加算。${k}まで足して、合計${total}。`,txt(280,49,`${k} ／ ${n} 回`)+`<rect x="90" y="74" width="380" height="104" rx="14" fill="#dfebef"/>`+txt(280,140,`合計 ${total}`,44)+txt(280,231,complete?'ここで終了':`次は ＋${k+1}`,34));
        result.textContent=complete?`${n}まで足して、合計${total}。止まる条件に達したので、これで終了です。`:`${k}まで足しました。合計${total}。次に${k+1}を足し、${n}を足したところで止めます。`;
      };
      input.addEventListener('input',()=>{n=+input.value;k=total=0;update();});
      controls.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='step'&&k<n){k++;total+=k;}if(b.dataset.action==='reset'){n=5;input.value='5';k=total=0;}update();});update();
    }
    if(kind==='definition'){
      let equal=false,right=false;
      const shapes=[{name:'A 正方形',equal:true,right:true},{name:'B 直角でないひし形',equal:true,right:false},{name:'C 横長の長方形',equal:false,right:true},{name:'D それ以外の四角形',equal:false,right:false}];
      const update=()=>{
        q(lab,'[data-action=equal]').setAttribute('aria-pressed',String(equal));q(lab,'[data-action=right]').setAttribute('aria-pressed',String(right));
        const passed=[];
        lab.querySelectorAll('[data-shape]').forEach(g=>{const s=shapes[+g.dataset.shape],ok=(!equal||s.equal)&&(!right||s.right);g.setAttribute('fill',ok?'#a7c5ce':'#fff');g.setAttribute('stroke',ok?'#174f66':'#8a9699');g.setAttribute('stroke-dasharray',ok?'none':'5 5');if(ok)passed.push(s.name);});
        const status=`当てはまるのは、${passed.join('、')}。`;
        result.textContent=status+(equal&&right?' 両方の条件で、正方形だけになりました。':!equal&&!right?' まだ条件を選んでいません。':' この条件だけでは、正方形以外も入ります。');
        q(lab,'svg').setAttribute('aria-label',status+'当てはまる図形を塗りつぶし、ほかを破線で表示。');
      };
      controls.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='equal')equal=!equal;if(b.dataset.action==='right')right=!right;if(b.dataset.action==='reset')equal=right=false;update();});update();
    }
    if(kind==='zeno'){
      let n=0;
      const update=()=>{
        const den=2**n,remaining=1/den,done=1-remaining;
        const fraction=n===0?'1':`1/${den}`;
        figure.innerHTML=svg(`${n}回進んだ後。進んだ距離${done}m、残り${fraction}m。`,txt(280,46,`${n} 回目`)+`<rect x="40" y="81" width="480" height="72" fill="#dfebef"/><rect x="40" y="81" width="${480*done}" height="72" fill="#174f66"/><line x1="520" x2="520" y1="73" y2="162" stroke="#aa5f05" stroke-width="4"/>`+txt(40,194,'0')+txt(510,194,'1m')+txt(280,242,`残り ${fraction} m`,32));
        result.textContent=`${n}回：進んだ距離${done}m、経過時間${done}秒。残り${fraction}mです。`+(n===12?' 画面ではここまで。数学的にはさらに半分にできます。有限回の区切りでは、残りは0にはなりません。':'');
        q(lab,'[data-action=step]').disabled=n===12;
      };
      controls.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='step'&&n<12)n++;if(b.dataset.action==='reset')n=0;update();});update();
    }
  });
})();
