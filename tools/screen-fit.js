/* Preserve the original lesson DOM and event handlers; only its visible reading panel changes. */
(()=>{'use strict';
const main=document.querySelector('main');if(!main)return;
const title=main.querySelector('h1'),back=main.querySelector('.back');
const head=document.createElement('header');head.className='fit-head';if(back)head.append(back);if(title)head.append(title);
const stage=document.createElement('div');stage.className='fit-stage';stage.setAttribute('aria-label','学習画面');
const foot=document.createElement('div');foot.className='fit-footer';
const switcher=document.createElement('nav');switcher.className='fit-switch';switcher.setAttribute('aria-label','表示する画面');
switcher.innerHTML='<button type="button" aria-label="前の画面">‹</button><select aria-label="表示する内容"></select><button type="button" aria-label="次の画面">›</button>';
const context=document.createElement('div');context.className='fit-context';context.setAttribute('aria-label','元の問題と条件');foot.append(context,switcher);const selector=switcher.querySelector('select'),arrows=switcher.querySelectorAll('button');
// Flatten the old decorative header while retaining its introductory text.
const oldHeader=main.querySelector(':scope > header');if(oldHeader){while(oldHeader.firstChild)main.insertBefore(oldHeader.firstChild,oldHeader);oldHeader.remove()}
const children=[...main.children],panels=[];
for(const el of children){if(el===head||el.matches('script'))continue;if(el.classList.contains('eyebrow')){head.setAttribute('title',el.textContent.trim());el.remove();continue}
if(el.classList.contains('dock')&&el.querySelector('#next,#prev')){foot.insertBefore(el,switcher);continue}
el.dataset.fitPanel='';panels.push(el);stage.append(el);if(el.tagName==='DETAILS'){el.open=true;el.querySelector('summary')?.setAttribute('tabindex','-1')}}
main.classList.add('fit-shell');main.append(head,stage,foot);
function label(el,i){if(el.matches('.given-card,.task'))return'問題・元の条件';if(el.matches('.formula-card,.work-card'))return'式・考え方';if(el.matches('.graph-panel,.diagram-card'))return'図で確かめる';if(el.id==='question-card')return'根拠を選ぶ';if(el.id==='summary-card')return'つながった証明';if(el.id==='read-card')return'理由を読む';if(el.classList.contains('dock'))return'値を変える';if(el.matches('.modes,.presets'))return'条件・モード';if(el.id==='compare')return'表をまとめて比べる';if(el.matches('.reset-row,#reset'))return'はじめから';const t=el.querySelector('summary,h2,label')?.textContent?.trim();return t|| (el.querySelector('table')?'表で確かめる':el.textContent.trim().slice(0,22))||`画面 ${i+1}`}
function updateContext(){const source=stage.querySelector('.given-card,.task');let nodes=[];if(source){nodes=[...source.querySelectorAll('.given,.domain,.goal .math')];if(source.querySelector('.domain'))nodes.unshift(source.querySelector('#formula'));if(!nodes.length)nodes=[source]}else{const formula=stage.querySelector('#formula,.original');if(formula)nodes.push(formula)}context.replaceChildren();const mode=stage.querySelector('[data-mode][aria-pressed="true"]');if(mode&&!['choose','read'].includes(mode.dataset.mode)){const caption=document.createElement('small');caption.textContent=mode.textContent;context.append(caption)}for(const sourceNode of nodes.filter(Boolean)){const copy=sourceNode.cloneNode(true);copy.removeAttribute('id');copy.removeAttribute('hidden');copy.className='fit-context-value';for(const n of copy.querySelectorAll('[id],[aria-live],.fit-part-off,.active,.focus')){n.removeAttribute('id');n.removeAttribute('aria-live');n.classList.remove('fit-part-off','active','focus')}context.append(copy)}if(!source){const x=stage.querySelector('#x-value');if(x){const value=document.createElement('span');value.textContent='元の x = '+x.textContent;context.append(value)}}if(!nodes.length){const row=stage.querySelector('#table-body tr:has(.active)');if(row){const value=document.createElement('span');value.textContent='x = '+row.cells[0].textContent+'、y = '+row.cells[1].textContent;context.append(value)}}context.hidden=!context.childElementCount}
let active=0,part=0,pages=[],busy=false,queued=false,lastAction=null;
const observer=new MutationObserver(()=>schedule());
function observe(){observer.observe(stage,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','open']})}
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;layout()})}}
function units(el){let result=[];const cs=[...el.children].filter(c=>!c.hidden&&c.tagName!=='SCRIPT');for(let i=0;i<cs.length;i++){const c=cs[i];if(c.matches('.control-head,.control-top')&&cs[i+1]?.matches('.slider,.range-row')){result.push([c,cs[++i]]);continue}if(c.matches('#sliders,#controls,#coefficients,.explanation,.choices,.proof-list,#diagram.fit-split-figures'+(window.ScreenFitOptions?.unitContainers?','+window.ScreenFitOptions.unitContainers:'')))result.push(...units(c));else if(c.tagName==='TABLE'&&c.tBodies[0]?.rows.length>3){result.push(...[...c.tBodies[0].rows].map(r=>[r]));}else result.push([c])}return result.length?result:[[el]]}
function visibleUnits(el,all,chosen){el.querySelectorAll('.fit-part-off').forEach(n=>n.classList.remove('fit-part-off'));for(const group of all)for(const n of group)if(n!==el&&!chosen.includes(group))n.classList.add('fit-part-off');for(const table of el.querySelectorAll('table')){const rows=[...table.tBodies].flatMap(b=>[...b.rows]);if(rows.length&&rows.every(r=>r.classList.contains('fit-part-off')))table.classList.add('fit-part-off')}}
function prepareFigures(){const box=stage.querySelector('#diagram');if(!box)return;const svg=box.querySelector(':scope > svg');if(svg?.getAttribute('viewBox')==='0 0 330 535'){const frames=[[0,255],[255,280]].map(([y,h],i)=>{const copy=svg.cloneNode(true);copy.setAttribute('viewBox',`0 ${y} 330 ${h}`);copy.setAttribute('aria-label',`比較する三角形 ${i+1}`);return copy});box.replaceChildren(...frames);box.classList.add('fit-split-figures')}else if(svg&&svg.getAttribute('viewBox')!=='0 0 330 255')box.classList.remove('fit-split-figures')}

function layout(){if(busy)return;busy=true;observer.disconnect();
try{updateContext();prepareFigures();for(const d of stage.querySelectorAll('details'))d.open=true;const previous=panels[active];const available=panels.filter(p=>!p.hidden);if(!available.includes(previous)){active=panels.indexOf(available[0]);part=0}
if(lastAction){const id=lastAction;lastAction=null;let dest;if(['next','prev'].includes(id))dest=panels.find(p=>p.matches('.work-card,.formula-card'));if(id==='compare')dest=panels.find(p=>p.id==='conclusion');if(dest&&!dest.hidden){active=panels.indexOf(dest);part=0}}
const el=panels[active];if(!el)return;panels.forEach(p=>p.classList.toggle('fit-off',p!==el));el.querySelectorAll('.fit-part-off').forEach(n=>n.classList.remove('fit-part-off'));
const height=Math.max(160,stage.clientHeight);stage.style.setProperty('--fit-graph-height',Math.max(140,height-(height>400?95:20))+'px');
const all=units(el);pages=[];let group=[];
for(const u of all){const trial=[...group,u];visibleUnits(el,all,trial);if(el.getBoundingClientRect().height>height+1&&group.length){pages.push(group);group=[u]}else group=trial}
if(group.length)pages.push(group);if(!pages.length)pages=[all];part=Math.min(part,pages.length-1);visibleUnits(el,all,pages[part]);
selector.replaceChildren(...available.map(p=>{const o=document.createElement('option');o.value=panels.indexOf(p);o.textContent=label(p,panels.indexOf(p))+(p===el&&pages.length>1?` · ${part+1}/${pages.length}`:'');return o}));selector.value=String(active);
arrows[0].disabled=available.indexOf(el)===0&&part===0;arrows[1].disabled=available.indexOf(el)===available.length-1&&part===pages.length-1;
}catch(e){console.error('Screen layout:',e)}finally{observe();busy=false}}
function move(dir){const available=panels.filter(p=>!p.hidden),el=panels[active];if(dir>0&&part+1<pages.length)part++;else if(dir<0&&part>0)part--;else{const target=available[available.indexOf(el)+dir];if(!target)return;active=panels.indexOf(target);part=dir<0?Number.MAX_SAFE_INTEGER:0}layout()}
arrows[0].addEventListener('click',()=>move(-1));arrows[1].addEventListener('click',()=>move(1));selector.addEventListener('change',()=>{active=Number(selector.value);part=0;layout()});
main.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!switcher.contains(b)){lastAction=b.id;schedule()}});main.addEventListener('input',schedule);
window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);layout();
})();
