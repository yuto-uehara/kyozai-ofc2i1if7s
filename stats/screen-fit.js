/* No simulation state is copied or reset when changing panels. */
const SF={active:false,index:0,_part:false,
 routes:{
 '01':['実験','結果・理論','相対度数のグラフ'], '02':['36通りを選ぶ','さいころ','結果・理論'],
 '03':['樹形図','くじ引き','確率','実験のグラフ'], '04':['ヒストグラム','点を動かす','箱ひげ図','数値・四分位数'],
 '05':['扉を選ぶ','勝率'], '06':['クラス','確率','人数と確率','人数を設定'],
 '07':['針を落とす','πの計算','推定値のグラフ','針の長さ'], '08':['点を打つ','πの計算','推定値のグラフ'],
 '09':['ゲーム','所持金のグラフ','確率・回数','条件を設定'], '10':['ゴルトンボード','平均・分散','条件を設定'],
 '11':['母集団','平均の変化','標本平均の分布','取り出した標本','平均・標準偏差','標本数を設定'],
 '12':['1000人・面積図','人数の内訳','陽性の確率','条件を設定'], '13':['歩く様子','距離','原点に戻る割合'],
 '14':['今日の天気','状態の移り変わり','最近の天気','晴れの割合','割合のグラフ','条件を設定']},
 part(i){if(!this.active)return;if(this._part)ctx.restore();ctx.save();this._part=true;if(i!==(this.parts?this.parts[this.index]:this.index)){ctx.beginPath();ctx.rect(0,0,0,0);ctx.clip();}},
 install(){
 this.id=location.pathname.split('/').pop().slice(0,2);this.labels=this.routes[this.id];if(!this.labels)return;
 this.parts=document.body.dataset.statsParts?.split(',').map(Number);if(this.parts)this.labels=this.parts.map(i=>this.labels[i]);
 const wrap=document.getElementById('wrap'),bar=document.getElementById('bar');
 const nav=document.createElement('nav');nav.id='sf-nav';nav.setAttribute('aria-label','表示パネル');
 const back=document.createElement('button');back.textContent='‹';back.setAttribute('aria-label','前のパネル');
 const label=document.createElement('span');label.id='sf-status';label.setAttribute('role','status');label.setAttribute('aria-live','polite');
 const next=document.createElement('button');next.textContent='›';next.setAttribute('aria-label','次のパネル');
 const home=document.createElement('a');home.textContent='教材一覧';home.href='../index.html#cstat'+(+this.id<=4?'1':+this.id<=9?'2':'3');home.id='sf-home';
 const reset=document.getElementById('bReset');nav.append(home,back,label,next);if(reset)nav.append(reset);wrap.prepend(nav);
 this.refreshNav=()=>{label.textContent=this.active?`${this.index+1}/${this.labels.length} ${this.labels[this.index]}`:'全体を表示';back.disabled=this.index===0;next.disabled=this.index===this.labels.length-1;};
 const dock=document.createElement('div');dock.id='sf-dock';wrap.append(dock);
 const menu=document.createElement('button');menu.textContent='操作';menu.setAttribute('aria-expanded','false');
 const close=()=>{bar.classList.remove('sf-open');menu.setAttribute('aria-expanded','false');menu.textContent='操作';};
 menu.onclick=()=>{this.refreshControls?.();const open=bar.classList.toggle('sf-open');menu.textContent=open?'戻る':'操作';menu.setAttribute('aria-expanded',String(open));};
 const primary=document.querySelector('#b1,#bNew,#bRand,#b1000'),second=document.getElementById('b100')||document.getElementById('bAuto');
 [primary,second].filter((x,i,a)=>x&&a.indexOf(x)===i).forEach(source=>{const b=document.createElement('button');b.textContent=source.textContent.length>9?'もう一度':source.textContent;b.className=source.className;b.onclick=()=>source.click();dock.append(b);new MutationObserver(()=>{b.disabled=source.disabled;b.className=source.className;}).observe(source,{attributes:true});});dock.append(menu);
 bar.addEventListener('click',e=>{if(e.target.tagName==='BUTTON'&&e.target.id!=='bQ')close();});
 const change=i=>{drags.clear();if(typeof onUp==='function')onUp();this.index=Math.max(0,Math.min(this.labels.length-1,i));this.refreshNav();close();document.getElementById('tip').classList.remove('show');fit();};
 if(reset)reset.addEventListener('click',()=>change(0));back.onclick=()=>change(this.index-1);next.onclick=()=>change(this.index+1);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();document.getElementById('tip').classList.remove('show');}});
 const oldLayout=layout,oldDraw=draw;
 layout=function(){const h=H;SF.active=!!SF.parts||innerWidth<900||innerHeight<650;document.documentElement.classList.toggle('sf-fit',SF.active);if(SF.active)H=Math.max(900,H);oldLayout();H=h;if(SF.active)SF.layout();SF.refreshNav();};
 draw=function(){SF._part=false;oldDraw();if(SF._part){ctx.restore();SF._part=false;}if(SF.id==='11'&&SF.parts&&[1,2].includes(SF.parts[SF.index]))sn.draw();};
 this.active=!!SF.parts||innerWidth<900||innerHeight<650;document.documentElement.classList.toggle('sf-fit',this.active);
 cv.setAttribute('aria-label',document.title+'。表示パネルと操作ボタンで実験できます。');
 // Native alternatives keep small grid/door targets usable by touch and keyboard.
 const selector=(label)=>{const el=document.createElement('select');el.setAttribute('aria-label',label);bar.append(el);return el;};
 const option=(el,value,label)=>{const o=document.createElement('option');o.value=value;o.textContent=label;el.append(o);};
 if(this.id==='02'){
   const aa=selector('赤いさいころの目'),bb=selector('白いさいころの目');for(let i=1;i<=6;i++){option(aa,i,'赤 '+i);option(bb,i,'白 '+i);}
   const toggle=document.createElement('button');toggle.className='sf-extra';toggle.textContent='組を選択・解除';toggle.onclick=()=>{const c=(+aa.value-1)*6+(+bb.value-1);paint=!on.has(c);setC(c);tabs(['pSum','pDbl','pOne','pClr'],'');change(0);};bar.append(toggle);
 }
 if(this.id==='05'){
   const doors=selector('選ぶ扉の番号');const chooseButton=document.createElement('button');chooseButton.className='sf-extra';chooseButton.textContent='この扉を選ぶ';chooseButton.onclick=()=>{choose(+doors.value);change(0);};bar.append(chooseButton);
   this.refreshControls=()=>{const previous=+doors.value||0;doors.textContent='';for(let i=0;i<N;i++)option(doors,i,'扉 '+(i+1));doors.value=Math.min(previous,N-1);chooseButton.disabled=phase!=='pick';};this.refreshControls();
 }
 if(this.id==='04'){
   const points=selector('変更する点');const value=document.createElement('input');value.type='range';value.min=0;value.max=XMAX;value.step=1;value.setAttribute('aria-label','選んだ点の点数');bar.append(value);
   points.onchange=()=>{value.value=D[+points.value];value.setAttribute('aria-valuetext',value.value+'点');};value.oninput=()=>{D[+points.value]=+value.value;value.setAttribute('aria-valuetext',value.value+'点');req();};
   this.refreshControls=()=>{const previous=+points.value||0;points.textContent='';D.forEach((v,i)=>option(points,i,(i+1)+'番: '+v+'点'));points.value=Math.min(previous,D.length-1);points.onchange();};this.refreshControls();
 }
 if(typeof onDown==='function'){
   const down=onDown;onDown=function(...args){if(SF.active&&SF.index!==(SF.id==='04'?1:0))return false;return down(...args);};
 }
 const tip=document.getElementById('tip');const dismiss=document.createElement('button');dismiss.className='sf-tip-close';dismiss.textContent='閉じる';dismiss.onclick=()=>{tip.classList.remove('show');document.getElementById('bQ').classList.remove('on');};tip.append(dismiss);
 this.select=change;this.refreshNav();
 },
 layout(){
 const box={x:52,y:36,w:W-76,h:Math.max(40,H-72)},wide={x:18,y:28,w:W-36,h:Math.max(40,H-52)};
 // The original layout establishes valid geometry for non-visible sections.
 // Each visible graph receives its own available viewport rather than a clipped strip.
 const sliders=()=>SL.forEach((s,i)=>{s.show=true;const gap=Math.min(100,(H-30)/SL.length);s.place(40,40+gap*i,W-80);});
 SL.forEach(s=>s.show=false);
 switch(this.id){
 case '02':G.land=false;G.cs=Math.min((W-24)/7,(H-40)/7);G.x=(W-G.cs*7)/2;G.y=16;break;
 case '04':G.x0=40;G.x1=W-28;G.hy=32;G.hh=Math.max(35,H-80);G.dy=30;G.dh=Math.max(45,H-100);G.by=40;G.bh=Math.min(60,H*.25);G.ty=34;break;
 case '05':G.st={x:0,y:0,w:W,h:H};{const cols=N===3?3:N===10?5:10,rows=Math.ceil(N/cols),cw=Math.min(W*.88/cols,H*.64/rows/1.75);G.cols=cols;G.cw=cw;G.dw=cw*.74;G.dh=G.dw*1.7;G.ch=G.dh*1.16;G.x0=(W-cw*cols)/2;G.y0=H*.18;}break;
 case '06':G.room={x:0,y:0,w:W,h:H};G.cols=W>600?12:8;G.rows=Math.ceil(NMAX/G.cols);G.bb={x:16,y:12,w:W-32,h:42};G.gx=12;G.gy=66;G.cw=(W-24)/G.cols;G.chh=(H-76)/G.rows;G.pan={x:24,y:10,w:W-48};G.ch=box;if(this.index===3)sliders();break;
 case '07':G.f=wide;G.c=box;if(this.index===3)sliders();break;
 case '08':{const s=Math.min(W-60,H-62);G.s={x:(W-s)/2,y:34,s};G.c=box;}break;
 case '09':G.sc=wide;G.c=box;G.tx=W/2;G.ty=35;if(this.index===3)sliders();break;
 case '10':G.bx=W/2;G.bw=W-50;G.top=38;G.bh=(H-100)*.5;G.hy=G.top+G.bh+10;G.hh=Math.max(30,(H-100)*.5);G.tx=24;G.ty=38;if(this.index===2)sliders();break;
 case '11':G.p=box;G.r=box;G.h=box;G.tray={x:16,y:32,w:W-32,h:Math.max(45,H-50)};G.tx=24;G.ty=40;if(this.parts&&[1,2].includes(this.parts[this.index])){G.r.h=G.h.h=Math.max(40,H-160);sn.show=true;sn.place(40,H-38,W-80);}else if((this.parts?this.parts[this.index]:this.index)===5)sliders();break;
 case '12':G.f={x:18,y:34,w:W-36,h:Math.max(40,H-65)};G.tx=16;G.tw=W-32;G.ty=34;if(this.index===3)sliders();break;
 case '13':G.a={x:48,y:32,w:W-70,h:Math.max(50,H-62)};G.b={x:50,y:58,w:W-76,h:Math.max(40,H-88)};G.tx=24;G.ty=36;break;
 case '14':G.win={x:20,y:20,w:W-40,h:H-40};G.d={x:0,y:10,w:W,h:H-20};G.cal={x:20,y:H*.25,w:W-40,h:Math.min(110,H*.5)};G.tx=20;G.ty=35;G.c=box;if(this.index===5)sliders();break;
 }
 }
};
