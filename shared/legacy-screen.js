(()=>{'use strict';
const wrap=document.getElementById('wrap'),bar=document.getElementById('bar'),figure=document.getElementById('svg')||document.getElementById('cv');if(!wrap||!bar||!figure)return;
const tools=document.createElement('nav');tools.className='screen-tools';tools.setAttribute('aria-label','教材の表示と操作');
const back=document.createElement('a');back.href='../../index.html';back.textContent='‹ 一覧';tools.append(back);
const views=document.createElement('select');views.setAttribute('aria-label','画面に表示する部分');
const actions=document.createElement('select');actions.setAttribute('aria-label','教材の操作を選ぶ');
const isSvg=figure.tagName.toLowerCase()==='svg',slug=location.pathname.split('/').pop();
const regions={
'2n4s_parallel_angles.html':{portrait:[[0,0,650,600],[0,0,650,600],[0,0,1000,235]],landscape:[[0,0,650,600],[0,0,650,600],[1200,0,400,330]],labels:['上の交点','下の交点','角の関係']},
'1n5s_sector.html':{portrait:[[0,0,1000,810],[0,790,1000,550]],landscape:[[130,100,620,620],[940,30,660,580]],labels:['図を動かす','半径・式']},
'1n5s_transform.html':{portrait:[[0,0,1000,850],[0,820,1000,520]],landscape:[[0,0,1050,820],[1020,0,580,820]],labels:['図を動かす','角度・関係']},
'1n6s_projection.html':{portrait:[[0,0,1000,730],[0,710,1000,330],[0,1035,1000,305]],landscape:[[0,0,960,820],[940,0,660,410],[940,410,660,410]],labels:['立体を動かす','立面図','平面図']},
'1n6s_revolution.html':{portrait:[[0,0,1000,1060],[0,1050,1000,290]],landscape:[[0,0,1160,820],[1160,200,440,400]],labels:['回転体','回転角を変える']},
'2n5s_parallelogram_conditions.html':{portrait:[[0,0,1000,750],[0,740,1000,600]],landscape:[[0,0,1000,820],[980,0,620,820]],labels:['図を動かす','成立する条件']}
};
const config=regions[slug];let sourceBox=null,ignore=false,focusGroup=null,clipRect=null;
if(isSvg&&config){const ns='http://www.w3.org/2000/svg';focusGroup=document.createElementNS(ns,'g');while(figure.firstChild)focusGroup.append(figure.firstChild);figure.append(focusGroup);const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath');clip.id='screen-focus-clip';clip.setAttribute('clipPathUnits','userSpaceOnUse');clipRect=document.createElementNS(ns,'rect');clip.append(clipRect);defs.append(clip);figure.append(defs);}

if(isSvg){views.add(new Option('全体','all'));if(config)config.labels.forEach((s,i)=>views.add(new Option(s,String(i))));if(config&&(innerWidth<650||innerHeight<420))views.value='0';tools.append(views);}
tools.append(actions);wrap.append(tools);
let originals=[];
function syncActions(){
 const selected=actions.value;originals=[...bar.querySelectorAll('button')].filter(b=>!b.hidden&&!b.classList.contains('hide'));
 const label=originals.filter(b=>b.classList.contains('on')).map(b=>b.textContent.trim()).join('・');
 actions.replaceChildren(new Option(label?'操作：'+label:'操作を選ぶ',''));
 if(isSvg)originals.push(...figure.querySelectorAll('.row'));
 originals.forEach((b,i)=>{const o=new Option((b.classList.contains('on')?'● ':'')+b.textContent.trim(),String(i));o.disabled=!!b.disabled;actions.add(o);});actions.value='';
}
actions.addEventListener('change',()=>{const b=originals[Number(actions.value)];if(actions.value!==''&&b&&!b.disabled){if(b.tagName.toLowerCase()==='g')b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));else b.click();syncActions();}actions.value='';});
function applyView(){if(!isSvg||!sourceBox)return;let box=sourceBox;if(config&&views.value!=='all'){const landscape=sourceBox[2]>sourceBox[3];box=config[landscape?'landscape':'portrait'][Number(views.value)];if(slug==='1n5s_sector.html'&&views.value==='0'&&typeof st!=='undefined'&&typeof L!=='undefined'){const r=st.r*L.u+75;box=[L.c[0]-r,L.c[1]-r,2*r,2*r];}if(slug==='2n4s_parallel_angles.html'&&Number(views.value)<2&&typeof geom==='function'){const p=views.value==='0'?geom().P:Q,cx=layout.fx+p.x*layout.fs,cy=layout.fy+p.y*layout.fs;box=[cx-325,cy-300,650,600];}}if(clipRect){if(views.value==='all')focusGroup.removeAttribute('clip-path');else{['x','y','width','height'].forEach((k,i)=>clipRect.setAttribute(k,String(box[i])));focusGroup.setAttribute('clip-path','url(#screen-focus-clip)');}}if(figure.getAttribute('viewBox')!==box.join(' ')){ignore=true;figure.setAttribute('viewBox',box.join(' '));ignore=false;}}
views.addEventListener('change',applyView);
function refresh(){const compact=innerWidth<1000||innerHeight<700;document.documentElement.classList.toggle('screen-compact',compact);syncActions();if(isSvg){const value=figure.getAttribute('viewBox');if(value){const box=value.trim().split(/[ ,]+/).map(Number);if(box[0]===0&&box[1]===0&&((box[2]===1000&&box[3]===1340)||(box[2]===1600&&box[3]===820)))sourceBox=box;}applyView();}}
new MutationObserver(syncActions).observe(bar,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','hidden']});
if(isSvg)new MutationObserver(()=>{syncActions();applyView();}).observe(figure,{childList:true,subtree:true});
if(isSvg)new MutationObserver(()=>{if(!ignore){const value=figure.getAttribute('viewBox');if(value){const b=value.split(/[ ,]+/).map(Number);if(b[0]===0&&b[1]===0&&((b[2]===1000&&b[3]===1340)||(b[2]===1600&&b[3]===820)))sourceBox=b;}applyView();}}).observe(figure,{attributes:true,attributeFilter:['viewBox']});
addEventListener('resize',()=>requestAnimationFrame(refresh));if(window.visualViewport)visualViewport.addEventListener('resize',()=>requestAnimationFrame(refresh));
refresh();requestAnimationFrame(()=>{dispatchEvent(new Event('resize'));});
})();
