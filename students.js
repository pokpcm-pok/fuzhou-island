/* 同學登入與角色設計器（Google 登入 + Apps Script）。未設定時進入「預覽模式」，只在本機瀏覽器顯示。 */
(function(){
  var HATS=[['','不戴'],['hat','工作帽'],['glasses','眼鏡'],['band','髮帶'],['phones','耳機'],['box','紙箱'],['beret','畫家帽'],['antenna','天線'],['grad','畢業帽'],['speech','對話框'],['pennant','小旗'],['bow','蝴蝶結'],['cap','鴨舌帽'],['camera','相機'],['prop','螺旋槳帽'],['tie','領結']];
  var FACES=[['smile','微笑'],['open','開心'],['wink','眨眼'],['sleepy','想睡']];
  var COLORS=['#FFFFFF','#FFE9D6','#FFD400','#FF9FC6','#E6007E','#00A9E0','#7FD6F2','#6FCF97','#B39DDB','#F2994A','#BDBDBD','#4A4F55'];
  var S={list:[],me:null,token:null,draft:null,cfg:null,o:null,gisLoaded:false,pv:null,seen:{},log:[]};
  var QUICK=['👋 嗨！','請問這座島怎麼逛？','一起去吃飯嗎？','謝謝你！'];

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function has(list,v){return list.some(function(x){return x[0]===v;});}
  function clean(j){
    var ids={};S.o.D.forEach(function(d){ids[d.id]=1;});
    return (j&&Array.isArray(j.students)?j.students:[]).filter(function(s){
      return s&&s.sid&&s.nickname&&ids[s.island_id]&&/^#[0-9A-Fa-f]{6}$/.test(s.body_color);
    }).map(function(s){return {sid:String(s.sid),nickname:String(s.nickname).slice(0,12),island_id:s.island_id,body_color:s.body_color,
      hat:has(HATS,s.hat||'')?(s.hat||''):'',face:has(FACES,s.face)?s.face:'smile',bio:String(s.bio||'').slice(0,60)};});
  }
  function live(){return !!(S.cfg.api&&S.cfg.clientId);}
  function api(body){
    return fetch(S.cfg.api,{method:'POST',body:JSON.stringify(body)}).then(function(r){return r.json();}).then(function(j){
      if(!j.ok)throw new Error(j.error||'發生錯誤');return j;});
  }
  function refresh(){
    if(!S.cfg.api){World.setStudents(S.list);return Promise.resolve();}
    return fetch(S.cfg.api+(S.cfg.api.indexOf('?')>-1?'&':'?')+'action=students').then(function(r){return r.json();}).then(function(j){
      S.list=clean(j);if(S.me)merge(S.me);World.setStudents(S.list);}).catch(function(e){console.warn('讀取同學名單失敗',e);});
  }
  function merge(me){
    var mine={sid:me.sid||'me',nickname:me.nickname,island_id:me.island_id,body_color:me.body_color,hat:me.hat||'',face:me.face||'smile',bio:me.bio||''};
    var i=-1;S.list.forEach(function(s,k){if(s.sid===mine.sid)i=k;});
    if(i>-1)S.list[i]=mine;else S.list.push(mine);
  }

  /* ---------- 預覽 ---------- */
  function startPreview(){
    var host=document.getElementById('pv');if(!host||!window.THREE)return;
    if(S.pv&&S.pv.r){host.appendChild(S.pv.r.domElement);return;}
    var T=THREE,r=new T.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.setSize(220,220);
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(35,1,.1,50);cam.position.set(0,1.7,5.6);cam.lookAt(0,1,0);
    sc.add(new T.HemisphereLight(0xffffff,0x9aa8b0,.95));var dl=new T.DirectionalLight(0xffffff,.7);dl.position.set(3,6,5);sc.add(dl);
    S.pv={r:r,sc:sc,cam:cam,g:null};host.appendChild(r.domElement);
    (function loop(){requestAnimationFrame(loop);if(!document.getElementById('pv')||!S.pv.g||document.hidden)return;
      S.pv.g.rotation.y+=.012;S.pv.g.userData.body.position.y=Math.abs(Math.sin(Date.now()/420))*.12;r.render(sc,cam);})();
  }
  function rebuild(){
    if(!S.pv||!S.draft)return;var d=S.draft;
    if(S.pv.g){S.pv.sc.remove(S.pv.g);S.pv.g.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});}
    var rot=S.pv.g?S.pv.g.rotation.y:.5;
    S.pv.g=Props.char(d.hat,2.4,parseInt(d.body_color.slice(1),16),d.face);S.pv.g.rotation.y=rot;S.pv.sc.add(S.pv.g);
  }

  /* ---------- 面板 ---------- */
  function chips(name,list,cur){return list.map(function(x){return '<button type="button" class="opt" data-k="'+name+'" data-v="'+esc(x[0])+'" aria-pressed="'+(cur===x[0])+'">'+esc(x[1])+'</button>';}).join('');}
  function swatches(cur){return COLORS.map(function(c){return '<button type="button" class="sw" data-k="body_color" data-v="'+c+'" aria-label="'+c+'" aria-pressed="'+(cur.toLowerCase()===c.toLowerCase())+'" style="background:'+c+'"></button>';}).join('');}
  function editorHTML(){
    var d=S.draft,isle=S.o.D.map(function(i){return '<option value="'+i.id+'"'+(i.id===d.island_id?' selected':'')+'>'+esc(i.name)+'</option>';}).join('');
    return '<button class="back" data-act="back">← 回到總覽</button><h2 style="margin-top:12px">我的角色</h2>'+
      (live()?'':'<p class="note" style="margin-top:0">預覽模式：角色只會顯示在這個瀏覽器。部署到 GitHub Pages 並設定 Google 登入後，全班都看得到。</p>')+
      '<div class="pvwrap"><div id="pv" aria-label="角色預覽"></div></div>'+
      '<label class="lbl">暱稱（最多 12 字）<input id="stuNick" maxlength="12" value="'+esc(d.nickname)+'" placeholder="例如：小印"></label>'+
      '<label class="lbl">我住在哪座島<select id="stuIsle">'+isle+'</select></label>'+
      '<div class="lbl">身體顏色</div><div class="optrow">'+swatches(d.body_color)+'</div>'+
      '<div class="lbl">配件</div><div class="optrow">'+chips('hat',HATS,d.hat)+'</div>'+
      '<div class="lbl">表情</div><div class="optrow">'+chips('face',FACES,d.face)+'</div>'+
      '<label class="lbl">一句話介紹（最多 60 字）<textarea id="stuBio" maxlength="60" rows="2" placeholder="例如：愛拍照，常駐攝影島">'+esc(d.bio)+'</textarea></label>'+
      '<div class="actrow"><button class="primary" id="stuSave">儲存，立刻出現在島上</button>'+(S.me?'<button id="stuDel" class="ghost">移除我的角色</button>':'')+'</div>'+
      '<p class="note" id="stuMsg" aria-live="polite" style="border:0;padding:0;margin-top:8px"></p>';
  }
  function msg(t,bad){var m=document.getElementById('stuMsg');if(m){m.textContent=t;m.style.color=bad?'var(--ma-t,#E6007E)':'var(--muted)';}}
  function loginHTML(){
    return '<button class="back" data-act="back">← 回到總覽</button><h2 style="margin-top:12px">登入，建立我的角色</h2>'+
      '<p>用任何 Gmail 帳號登入，設計一個專屬的小人，住進喜歡的島。每個帳號一個角色，之後隨時可以修改。</p>'+
      '<div id="gbtn" style="min-height:44px"></div><p class="note" id="stuMsg" aria-live="polite">我們只取得你的信箱來辨識身分，公開畫面只顯示暱稱與外觀，不會公開信箱。</p>';
  }
  function show(){
    var d=S.o.detail;document.body.classList.add('sel');d.hidden=false;d.scrollTop=0;
    if(live()&&!S.token){d.innerHTML=loginHTML();mountGoogle();return;}
    if(!S.draft)S.draft=S.me?JSON.parse(JSON.stringify(S.me)):{nickname:'',island_id:S.o.D[0].id,body_color:'#FFE9D6',hat:'',face:'smile',bio:''};
    d.innerHTML=editorHTML();startPreview();rebuild();
    if(window.innerWidth<900)document.getElementById('stage').scrollIntoView({block:'start',behavior:'smooth'});
  }

  /* ---------- Google 登入 ---------- */
  function mountGoogle(){
    function go(){
      var el=document.getElementById('gbtn');if(!el)return;
      google.accounts.id.initialize({client_id:S.cfg.clientId,callback:onCred,auto_select:false});
      google.accounts.id.renderButton(el,{theme:'outline',size:'large',shape:'pill',text:'signin_with',locale:'zh-TW'});
    }
    if(window.google&&google.accounts){go();return;}
    var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=go;
    s.onerror=function(){msg('無法載入 Google 登入，請檢查網路後重試',true);};document.head.appendChild(s);
  }
  function onCred(res){
    S.token=res.credential;msg('登入成功，讀取你的角色…');
    api({action:'me',token:S.token}).then(function(j){S.me=j.me;S.draft=null;show();})
      .catch(function(e){S.token=null;msg(e.message,true);});
  }

  /* ---------- 事件 ---------- */
  function onClick(e){
    var q=e.target.closest('[data-q]');if(q){sendChat(q.dataset.q);return;}
    var o=e.target.closest('.opt,.sw');
    if(o&&S.draft){S.draft[o.dataset.k]=o.dataset.v;
      [].forEach.call(document.querySelectorAll('[data-k="'+o.dataset.k+'"]'),function(b){b.setAttribute('aria-pressed',b===o?'true':'false');});rebuild();return;}
    if(e.target.id==='chatSend'){var ci=document.getElementById('chatIn');sendChat(ci&&ci.value);return;}
    if(e.target.id==='stuSave')save();
    if(e.target.id==='stuDel')remove();
    if(e.target.closest('[data-act="edit"]'))show();
  }
  function readDraft(){
    S.draft.nickname=document.getElementById('stuNick').value.trim();
    S.draft.island_id=document.getElementById('stuIsle').value;
    S.draft.bio=document.getElementById('stuBio').value.trim();
  }
  function save(){
    readDraft();if(!S.draft.nickname){msg('請先輸入暱稱',true);return;}
    var b=document.getElementById('stuSave');b.disabled=true;msg('儲存中…');
    var done=function(me){S.me=me;merge(me);World.setStudents(S.list);World.select('s:'+(me.sid||'me'),true);};
    if(!live()){done(Object.assign({sid:'me'},S.draft));return;}
    api({action:'save',token:S.token,profile:S.draft}).then(function(j){done(j.me);})
      .catch(function(e){b.disabled=false;if(/逾時|無效/.test(e.message)){S.token=null;}msg(e.message,true);});
  }
  function remove(){
    if(!confirm('確定移除你的角色嗎？'))return;
    var fin=function(){S.list=S.list.filter(function(s){return s.sid!==(S.me&&S.me.sid||'me');});S.me=null;S.draft=null;World.setStudents(S.list);show();};
    if(!live()){fin();return;}
    api({action:'delete',token:S.token}).then(fin).catch(function(e){msg(e.message,true);});
  }

  /* ---------- 公開氣泡留言 ---------- */
  function mySid(){return S.me?(S.me.sid||'me'):null;}
  function nickOf(sid){var s=S.list.filter(function(x){return x.sid===sid;})[0];return s?s.nickname:'';}
  function logHTML(){
    return S.log.slice(-8).map(function(m){return '<li><b>'+esc(m.nick)+'</b>'+esc(m.text)+'</li>';}).join('')||'<li class="empty">還沒有人說話，當第一個吧！</li>';
  }
  function renderLog(){var el=document.getElementById('chatLog');if(el){el.innerHTML=logHTML();el.scrollTop=el.scrollHeight;}}
  function chatHTML(toNick){
    var head='<h3>說說話</h3>';
    if(live()&&!S.token)return head+'<p class="note" style="margin-top:0">登入後，就能在島上對同學說話，頭上會冒出氣泡。</p><div class="actrow"><button class="primary" data-act="edit">登入，開始聊天</button></div><ul class="chatlog" id="chatLog">'+logHTML()+'</ul>';
    if(!S.me)return head+'<p class="note" style="margin-top:0">先建立你的角色，就能開始說話。</p><div class="actrow"><button class="primary" data-act="edit">建立我的角色</button></div><ul class="chatlog" id="chatLog">'+logHTML()+'</ul>';
    return head+'<div class="chatbox"><input id="chatIn" maxlength="40" autocomplete="off" data-to="'+esc(toNick||'')+'" placeholder="'+(toNick?'對 '+esc(toNick)+' 說…':'對大家說…')+'"><button class="primary" id="chatSend">送出</button></div>'+
      '<div class="optrow">'+QUICK.map(function(q){return '<button type="button" class="opt" data-k="q" data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('')+'</div>'+
      '<p class="note" id="chatMsg" aria-live="polite" style="border:0;padding:0;margin:6px 0 0"></p><ul class="chatlog" id="chatLog">'+logHTML()+'</ul>';
  }
  function cmsg(t,bad){var m=document.getElementById('chatMsg');if(m){m.textContent=t;m.style.color=bad?'var(--ma-t,#E6007E)':'var(--muted)';}}
  function addLog(m,bubble){
    if(S.seen[m.id])return;S.seen[m.id]=1;
    S.log.push({nick:m.nick,text:m.text});if(S.log.length>40)S.log.shift();
    if(bubble)World.say('s:'+m.sid,m.text,m.nick,9000,'stu');
  }
  function sendChat(text){
    var inp=document.getElementById('chatIn');text=(text||'').trim();if(!text)return;
    var to=inp?inp.dataset.to:'';if(to&&text.indexOf('@')!==0)text='@'+to+' '+text;
    text=text.slice(0,40);var btn=document.getElementById('chatSend');if(btn)btn.disabled=true;
    var done=function(m){addLog(m,true);if(inp)inp.value='';if(btn)btn.disabled=false;cmsg('');renderLog();};
    if(!live()){done({id:'pv-'+Date.now(),sid:mySid(),nick:S.me.nickname,text:text});return;}
    api({action:'say',token:S.token,text:text}).then(function(j){done(j.msg);})
      .catch(function(e){if(btn)btn.disabled=false;if(/逾時|無效/.test(e.message))S.token=null;cmsg(e.message,true);});
  }
  function pollChat(){
    if(!live()||document.hidden)return;
    fetch(S.cfg.api+(S.cfg.api.indexOf('?')>-1?'&':'?')+'action=chat').then(function(r){return r.json();}).then(function(j){
      var now=j.now||Date.now(),fresh=false;
      (Array.isArray(j.chat)?j.chat:[]).forEach(function(m){
        if(!m||!m.id||!m.sid||!m.text)return;
        if(S.seen[m.id])return;
        addLog({id:String(m.id),sid:String(m.sid),nick:String(m.nick||'').slice(0,12),text:String(m.text).slice(0,60)},now-m.t<45000);fresh=true;});
      if(fresh)renderLog();}).catch(function(){});
  }

  window.Students={
    init:function(o){S.o=o;S.cfg=o.cfg;o.detail.addEventListener('click',onClick);
      refresh();setInterval(function(){if(!document.hidden)refresh();},90000);
      pollChat();setInterval(pollChat,8000);
      o.detail.addEventListener('keydown',function(e){if(e.target.id==='chatIn'&&e.key==='Enter'){e.preventDefault();sendChat(e.target.value);}});},
    open:show,
    html:function(id){
      var sid=id.slice(2),s=S.list.filter(function(x){return x.sid===sid;})[0];if(!s)return '';
      var isl=S.o.D.filter(function(d){return d.id===s.island_id;})[0];
      var mineBtn=(S.me&&S.me.sid===s.sid)||(!live()&&s.sid==='me')?'<div class="actrow"><button class="primary" data-act="edit">編輯我的角色</button></div>':'';
      return '<button class="back" data-act="back">← 回到總覽</button><div style="margin-top:12px"><span class="kind" style="--t:'+esc(s.body_color)+'">同學</span></div>'+
        '<h2>'+esc(s.nickname)+'</h2><p>'+(s.bio?esc(s.bio):'這位同學還沒有寫自我介紹。')+'</p>'+
        '<h3>住在</h3><div class="tags"><button data-go="'+esc(s.island_id)+'"><i></i>'+esc(isl?isl.name:'')+'</button></div>'+mineBtn+chatHTML(mySid()&&s.sid===mySid()?'':s.nickname);
    }
  };
})();
