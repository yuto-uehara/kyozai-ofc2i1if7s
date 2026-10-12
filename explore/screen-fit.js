/* One viewport, with explicit views instead of a long document. Nodes are moved,
   not copied: existing input listeners, live regions and lesson state survive. */
(() => {
  'use strict';
  const route=location.pathname.split('/').pop().replace('.html','');
  if(!['linear','transform','cone','fractions','distributive','sector'].includes(route))return;
  const q=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
  const el=(tag,cls)=>Object.assign(document.createElement(tag),{className:cls||''});
  const oldMain=q('main'), title=q('h1'), shell=el('main','fit-shell');
  const head=el('div','fit-heading'), toolbar=el('nav','fit-toolbar');toolbar.setAttribute('aria-label','表示する内容');
  const back=el('a','fit-back');back.href='../';back.textContent='← 教材一覧';
  const label=el('label','fit-view-label');label.htmlFor='fit-view';label.textContent='表示';
  const picker=el('select');picker.id='fit-view';picker.setAttribute('aria-label','表示する内容を切り替える');
  toolbar.append(back,label,picker);
  const deck=el('div','fit-deck'), footer=el('div','fit-footer');
  shell.append(head,toolbar,deck,footer);document.body.append(shell);
  document.body.classList.add('screen-fit','fit-'+route);
  const pages=[];
  function page(name,nodes,cls=''){
    const p=el('section','fit-page '+cls);p.id='fit-page-'+pages.length;p.setAttribute('aria-label',name);
    for(const n of nodes.flat().filter(Boolean))p.append(n);
    deck.append(p);pages.push({name,node:p});return p;
  }
  function attach(selector,parent=head){const n=q(selector);if(n)parent.append(n);return n;}
  head.append(title);
  if(['linear','transform','cone'].includes(route)){
    attach('.intro');attach('.formula-bar');
    const visual=q('.visual'), graph=q('svg.diagram'), caption=visual.querySelector('.caption'), dock=q('.quick-dock');
    const diagram=page('図と操作',[graph,caption,dock],'fit-chart');
    if(dock) dock.classList.add('fit-inline-dock');
    const controls=q('#controls');
    if(route==='linear'){
      page('表で点を選ぶ',[q('.visual-head'),q('.table-wrap'),q('.legend')]);
      page('a・b の数を指定',[q('.control-grid')]);
      page('傾き・切片を比較',[...controls.children].filter(x=>x.classList.contains('control')));
      page('読み方と範囲',[q('#linear-note'),...controls.querySelectorAll(':scope > .subnote'),q('.footnote')]);
    }else if(route==='cone'){
      page('半径・母線を指定',[q('.control-grid')]);
      const groups=[...controls.children].filter(x=>x.classList.contains('control'));
      page('注目する長さと倍率',groups.slice(0,2));
      page('弧と円周をたどる',groups.slice(2));
      page('図の読み方',[q('.visual-head'),q('.compare-note'),visual.querySelector('.note'),q('#constraint-note'),q('.footnote')]);
    }else{
      page('移動の種類と対応点',[...controls.children].filter(x=>x.classList.contains('control')).slice(0,2));
      page('移動量・中心・対称の軸',[q('#translate-controls'),q('#rotate-controls'),q('#reflect-controls')]);
      page('動きを見る',[[...controls.children].filter(x=>x.classList.contains('row')),q('#animation-note')]);
      page('図の読み方',[q('.visual-head'),q('.legend'),q('#move-note'),q('.footnote')]);
      // Old anchors scrolled to the distant settings. They now select the view.
      dock.querySelectorAll('a').forEach(a=>{a.href='#';a.textContent='中心・対応点を変える';a.addEventListener('click',e=>{e.preventDefault();show(2);});});
    }
    page('ほかの教材',[q('.tool-nav'),q('.index-link')]);
  } else if(route==='fractions') {
    attach('.opening-task');
    const lesson=q('.lesson');
    const mainPage=page('計算の手順',[q('.lessonhead'),q('#stepTitle'),q('#equation'),q('#explain'),q('#visual')],'fit-calculation');
    page('種類と例題を選ぶ',[q('#modules'),q('#tabs'),q('.controls')]);
    const details=q('#meaning-details');
    page('図で意味を見る',[q('#meaning-explain'),q('#meaning-visual'),q('#caption')],'fit-meaning');
    page('計算のポイント',[q('#takeaway'),q('.foot'),q('.eyebrow')]);
    // Keep the details API used by the lesson script, without a second view.
    details.hidden=true;shell.append(details);
    footer.append(q('.navigation'));
  } else if(route==='sector') {
    attach('#sector-task');
    const chart=page('おうぎ形の図',[q('.diagram')],'fit-sector-chart');
    const dock=el('div','fit-sector-dock');
    for(const [id,name,unit] of [['angle','中心角','°'],['radius','半径',' cm']]){
      const source=q('#'+id), row=el('div','dock-row'), text=el('label'), slider=el('input'), output=el('output');
      slider.type='range';slider.id='fit-'+id;slider.min=source.min;slider.max=source.max;slider.step=source.step;
      text.htmlFor=slider.id;text.textContent=name;slider.setAttribute('aria-label',name+'を動かす');
      const sync=()=>{slider.value=source.value;output.textContent=source.value+unit;};
      slider.addEventListener('input',()=>{source.value=slider.value;source.dispatchEvent(new Event('input',{bubbles:true}));});
      source.addEventListener('input',sync);all('[data-angle],#reset').forEach(n=>n.addEventListener('click',sync));
      sync();row.append(text,slider,output);dock.append(row);
    }
    chart.append(dock);
    page('円全体に対する倍率',[q('.factor-panel')]);
    all('.formula-card').forEach((n,i)=>page(i?'面積を求める':'弧の長さを求める',[n]));
    const c=q('.controls');[...c.children].forEach((n,i)=>page(i?'半径を変える':'中心角を変える',[n]));
    page('読み方・リセット',[q('#reset'),...oldMain.querySelectorAll(':scope > .note'),oldMain.querySelector('nav')]);
  } else {
    attach('.opening-task');
    page('かける順序と答え',[q('.step-top'),q('#step-message'),q('#original'),q('.expansion')],'fit-distribute-chart');
    page('式の数字を変える',[q('.settings'),q('.quick-actions')]);
    page('手順のポイント',[q('.subtitle'),q('.bottom'),oldMain.querySelector('nav')]);
    footer.append(q('.nav-buttons'));
    // On calculation steps, show products alongside the source and arrow when
    // there is room; short screens offer the adjacent explicit product view.
  }
  // Keep live announcement nodes. Remove only empty layout and redundant links.
  all('.sr-only,.visually-hidden').filter(n=>!shell.contains(n)).forEach(n=>shell.append(n));
  [...document.body.children].filter(n=>n!==shell&&n.tagName!=='SCRIPT').forEach(n=>n.remove());
  pages.forEach((p,i)=>{const o=el('option');o.value=String(i);o.textContent=p.name;picker.append(o);});
  function show(i){pages.forEach((p,k)=>p.node.hidden=k!==i);picker.value=String(i);document.documentElement.dataset.fitView=String(i);}
  picker.addEventListener('change',()=>show(Number(picker.value)));
  // Explicit previous/next views keep all lesson content discoverable.
  const prev=el('button','fit-view-prev'),next=el('button','fit-view-next');
  prev.type=next.type='button';prev.textContent='‹';next.textContent='›';
  prev.setAttribute('aria-label','前の表示');next.setAttribute('aria-label','次の表示');
  prev.addEventListener('click',()=>show((Number(picker.value)+pages.length-1)%pages.length));
  next.addEventListener('click',()=>show((Number(picker.value)+1)%pages.length));toolbar.append(prev,next);
  show(0);
})();
