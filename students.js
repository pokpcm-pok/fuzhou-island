/* 同學登入與角色設計器（Google 登入 + Apps Script）。未設定時進入「預覽模式」，只在本機瀏覽器顯示。 */
(function(){
  var HATS=[['','不戴'],['hat','工作帽'],['glasses','眼鏡'],['band','髮帶'],['phones','耳機'],['box','紙箱'],['beret','畫家帽'],['antenna','天線'],['grad','畢業帽'],['speech','對話框'],['pennant','小旗'],['bow','蝴蝶結'],['cap','鴨舌帽'],['camera','相機'],['prop','螺旋槳帽'],['tie','領結']];
  var FACES=[['smile','微笑'],['open','開心'],['wink','眨眼'],['sleepy','想睡']];
  var COLORS=['#FFFFFF','#FFE9D6','#FFD400','#FF9FC6','#E6007E','#00A9E0','#7FD6F2','#6FCF97','#B39DDB','#F2994A','#BDBDBD','#4A4F55'];
  var S={list:[],me:null,token:null,draft:null,cfg:null,o:null,gisLoaded:false,pv:null,seen:{},log:[],admin:false};
  var QUICK=['👋 嗨！','請問這座島怎麼逛？','一起去吃飯嗎？','謝謝你！'];

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function has(list,v){return list.some(function(x){return x[0]===v;});}
  function clean(j){
    var ids={};S.o.D.forEach(function(d){ids[d.id]=1;});
    return (j&&Array.isArray(j.students)?j.students:[]).filter(function(s){
      return s&&s.sid&&s.nickname&&ids[s.island_id]&&/^#[0-9A-Fa-f]{6}$/.test(s.body_color);
    }).map(function(s){return {sid:String(s.sid),nickname:String(s.nickname).slice(0,12),island_id:s.island_id,body_color:s.body_color,
      hat:has(HATS,s.hat||'')?(s.hat||''):'',face:has(FACES,s.face)?s.face:'smile',bio:String(s.bio||'').slice(0,60),
      badges:(Array.isArray(s.badges)?s.badges:[]).filter(function(b){return ids[b];})};});
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
    var mine={sid:me.sid||'me',nickname:me.nickname,island_id:me.island_id,body_color:me.body_color,hat:me.hat||'',face:me.face||'smile',bio:me.bio||'',badges:Array.isArray(me.badges)?me.badges:[]};
    var i=-1;S.list.forEach(function(s,k){if(s.sid===mine.sid)i=k;});
    if(i>-1)S.list[i]=mine;else S.list.push(mine);
  }

  /* ---------- 主角與即時位置 ---------- */
  function avatar(spawn){
    if(S.me)World.setAvatar(Object.assign({},S.me,{sid:S.me.sid||'me'}),spawn);else World.setAvatar(null);
  }
  function url(q){return S.cfg.api+(S.cfg.api.indexOf('?')>-1?'&':'?')+q;}
  function applyPos(j){if(j&&j.pos)World.setPresence(j.pos,j.now||Date.now());}
  function syncLoop(){
    var wait=3000;
    if(!live()){return;}
    if(!document.hidden){
      var p=World.getPos(),moved=!S.lp||Math.abs(p.x-S.lp.x)+Math.abs(p.z-S.lp.z)>.05;
      if(moved){S.lp={x:p.x,z:p.z};S.lm=Date.now();}
      var idle=S.lm&&Date.now()-S.lm>30000;if(idle)wait=8000;
      if(S.sess&&S.me){
        api({action:'sync',sess:S.sess,x:Math.round(p.x*10)/10,z:Math.round(p.z*10)/10,r:Math.round(p.r*100)/100}).then(applyPos)
          .catch(function(e){if(/逾時|無效|請重新/.test(e.message))S.sess=null;});
      }else{
        wait=5000;
        fetch(url('action=pos')).then(function(r){return r.json();}).then(applyPos).catch(function(){});
      }
    }else wait=8000;
    setTimeout(syncLoop,wait);
  }

  /* ---------- 徽章 ---------- */
  function hasBadge(id){return !!(S.me&&S.me.badges&&S.me.badges.indexOf(id)>-1);}
  function canSave(){return !!(live()&&S.token&&S.me);}
  function loginHint(){
    if(!live())return '目前是示範模式，徽章不會保存。';
    if(!S.token)return '登入並建立角色後，再挑戰一次，徽章才會留下紀錄。';
    return '先建立你的角色，徽章才會留下紀錄。';
  }
  function submitBadge(id,answers){
    return api({action:'badge',token:S.token,island_id:id,answers:answers}).then(function(j){
      if(j.passed){
        S.me.badges=j.badges;merge(S.me);World.setStudents(S.list);World.setSelfBadges(j.badges.length);
        var d=S.o.D.filter(function(x){return x.id===id;})[0];
        World.say('s:'+mySid(),'拿到「'+(d?d.name:id)+'」徽章了！','我',8000,'stu');
      }
      return j;
    }).catch(function(e){if(/逾時|無效/.test(e.message)){S.token=null;throw new Error('登入已逾時，請重新登入後再交卷。');}throw e;});
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
  /* LINE、Facebook、Instagram 等 App 內建瀏覽器會被 Google 擋下登入，先提醒改用 Safari 或 Chrome */
  function inApp(){return /\bLine\/|FBAN|FBAV|FB_IAB|Instagram|Messenger|MicroMessenger|Twitter|KAKAOTALK|Snapchat|GSA\//i.test(navigator.userAgent||'');}
  function inAppWarn(){
    if(!inApp())return '';
    return '<div class="note" style="border:2px solid #E6007E;border-radius:12px;padding:10px 12px;margin:10px 0;background:#FFF0F7;color:#1E2328"><b>你正在 App 內建瀏覽器中</b><br>Google 不允許在這裡登入。請點右上或右下角的「⋯」選「用 Safari／Chrome 開啟」，或複製網址貼到瀏覽器。'+
      '<div class="actrow" style="margin-top:8px"><button class="primary" data-act="copyurl">複製網址</button></div></div>';
  }
  function loginHTML(){
    return '<button class="back" data-act="back">← 回到總覽</button><h2 style="margin-top:12px">登入，建立我的角色</h2>'+
      '<p>用任何 Gmail 帳號登入，設計一個專屬的小人，住進喜歡的島。每個帳號一個角色，之後隨時可以修改。</p>'+inAppWarn()+
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
    api({action:'me',token:S.token}).then(function(j){S.me=j.me;S.sess=j.sess||null;S.admin=!!j.admin;S.draft=null;S.hadAvatar=!!S.me;if(S.me)merge(S.me);avatar(true);World.setStudents(S.list);show();})
      .catch(function(e){S.token=null;msg(e.message,true);});
  }

  /* ---------- 事件 ---------- */
  function onClick(e){
    var q=e.target.closest('[data-q]');if(q){sendChat(q.dataset.q);return;}
    var o=e.target.closest('.opt,.sw');
    if(o&&S.draft){S.draft[o.dataset.k]=o.dataset.v;
      [].forEach.call(document.querySelectorAll('[data-k="'+o.dataset.k+'"]'),function(b){b.setAttribute('aria-pressed',b===o?'true':'false');});rebuild();return;}
    if(e.target.closest('[data-act="copyurl"]')){
      var url=location.href.split('#')[0],btn=e.target.closest('[data-act="copyurl"]');
      var ok=function(){btn.textContent='已複製，請到瀏覽器貼上';};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(ok,function(){prompt('請長按複製網址',url);});
      else{prompt('請長按複製網址',url);}
      return;
    }
    if(e.target.id==='chatBoss'){var ci0=document.getElementById('chatIn');if(ci0)ci0.maxLength=e.target.checked?60:40;return;}
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
    var done=function(me,sess){var first=!S.hadAvatar;S.me=me;if(sess)S.sess=sess;merge(me);avatar(first);S.hadAvatar=true;World.setStudents(S.list);World.select('s:'+(me.sid||'me'),true);};
    if(!live()){done(Object.assign({sid:'me'},S.draft));return;}
    api({action:'save',token:S.token,profile:S.draft}).then(function(j){done(j.me,j.sess);})
      .catch(function(e){b.disabled=false;if(/逾時|無效/.test(e.message)){S.token=null;}msg(e.message,true);});
  }
  function remove(){
    if(!confirm('確定移除你的角色嗎？'))return;
    var fin=function(){S.list=S.list.filter(function(s){return s.sid!==(S.me&&S.me.sid||'me');});S.me=null;S.sess=null;S.hadAvatar=false;S.draft=null;avatar(false);World.setStudents(S.list);show();};
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
    if(!S.me&&!S.admin)return head+'<p class="note" style="margin-top:0">先建立你的角色，就能開始說話。</p><div class="actrow"><button class="primary" data-act="edit">建立我的角色</button></div><ul class="chatlog" id="chatLog">'+logHTML()+'</ul>';
    var bossBox=S.admin?'<label class="bosschk"><input type="checkbox" id="chatBoss"> 以 BOSS 身分說話（公告：全站頂端會顯示 25 秒）</label>':'';
    return head+bossBox+'<div class="chatbox"><input id="chatIn" maxlength="40" autocomplete="off" data-to="'+esc(toNick||'')+'" placeholder="'+(toNick?'對 '+esc(toNick)+' 說…':'對大家說…')+'"><button class="primary" id="chatSend">送出</button></div>'+
      '<div class="optrow">'+QUICK.map(function(q){return '<button type="button" class="opt" data-k="q" data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('')+'</div>'+
      '<p class="note" id="chatMsg" aria-live="polite" style="border:0;padding:0;margin:6px 0 0"></p><ul class="chatlog" id="chatLog">'+logHTML()+'</ul>';
  }
  function cmsg(t,bad){var m=document.getElementById('chatMsg');if(m){m.textContent=t;m.style.color=bad?'var(--ma-t,#E6007E)':'var(--muted)';}}
  var bnTimer=null;
  function banner(text){
    var st=document.getElementById('stage');if(!st)return;
    var el=document.getElementById('bossBanner');
    if(!el){el=document.createElement('div');el.id='bossBanner';el.setAttribute('role','status');st.appendChild(el);}
    el.textContent='';var b=document.createElement('b');b.textContent='📣 波客老師';el.appendChild(b);el.appendChild(document.createTextNode(' '+text));
    el.style.display='block';clearTimeout(bnTimer);bnTimer=setTimeout(function(){el.style.display='none';},25000);
  }
  function addLog(m,bubble){
    if(S.seen[m.id])return;S.seen[m.id]=1;
    S.log.push({nick:m.nick,text:m.text});if(S.log.length>40)S.log.shift();
    if(bubble){
      if(m.boss||m.sid==='boss'){World.say('boss',m.text,'波客老師・公告',25000,'npc boss');banner(m.text);}
      else World.say('s:'+m.sid,m.text,m.nick,9000,'stu');
    }
  }
  function sendChat(text){
    var inp=document.getElementById('chatIn');text=(text||'').trim();if(!text)return;
    var bc=document.getElementById('chatBoss'),asBoss=!!(S.admin&&bc&&bc.checked);
    var to=inp?inp.dataset.to:'';if(!asBoss&&to&&text.indexOf('@')!==0)text='@'+to+' '+text;
    text=text.slice(0,asBoss?60:40);var btn=document.getElementById('chatSend');if(btn)btn.disabled=true;
    var done=function(m){addLog(m,true);if(inp)inp.value='';if(btn)btn.disabled=false;cmsg('');renderLog();};
    if(!live()){done({id:'pv-'+Date.now(),sid:mySid(),nick:S.me.nickname,text:text});return;}
    api({action:'say',token:S.token,text:text,as:asBoss?'boss':undefined}).then(function(j){done(j.msg);})
      .catch(function(e){if(btn)btn.disabled=false;if(/逾時|無效/.test(e.message))S.token=null;cmsg(e.message,true);});
  }
  function pollChat(){
    if(!live()||document.hidden)return;
    fetch(S.cfg.api+(S.cfg.api.indexOf('?')>-1?'&':'?')+'action=chat').then(function(r){return r.json();}).then(function(j){
      var now=j.now||Date.now(),fresh=false;
      (Array.isArray(j.chat)?j.chat:[]).forEach(function(m){
        if(!m||!m.id||!m.sid||!m.text)return;
        if(S.seen[m.id])return;
        addLog({id:String(m.id),sid:String(m.sid),nick:String(m.nick||'').slice(0,12),text:String(m.text).slice(0,60),boss:!!m.boss},now-m.t<(m.boss?60000:45000));fresh=true;});
      if(fresh)renderLog();}).catch(function(){});
  }

  window.Students={
    init:function(o){S.o=o;S.cfg=o.cfg;o.detail.addEventListener('click',onClick);
      refresh();setInterval(function(){if(!document.hidden)refresh();},90000);
      pollChat();setInterval(pollChat,8000);setTimeout(syncLoop,1500);
      o.detail.addEventListener('keydown',function(e){if(e.target.id==='chatIn'&&e.key==='Enter'){e.preventDefault();sendChat(e.target.value);}});},
    open:show,hasBadge:hasBadge,canSave:canSave,loginHint:loginHint,submitBadge:submitBadge,
    html:function(id){
      var sid=id.slice(2),s=S.list.filter(function(x){return x.sid===sid;})[0];if(!s)return '';
      var isl=S.o.D.filter(function(d){return d.id===s.island_id;})[0];
      var mineBtn=(S.me&&S.me.sid===s.sid)||(!live()&&s.sid==='me')?'<div class="actrow"><button class="primary" data-act="edit">編輯我的角色</button></div>':'';
      return '<button class="back" data-act="back">← 回到總覽</button><div style="margin-top:12px"><span class="kind" style="--t:'+esc(s.body_color)+'">同學</span></div>'+
        '<h2>'+esc(s.nickname)+'</h2><p>'+(s.bio?esc(s.bio):'這位同學還沒有寫自我介紹。')+'</p>'+
        (s.badges&&s.badges.length?'<h3>徽章（'+s.badges.length+'）</h3><div class="tags">'+s.badges.map(function(b){var d=S.o.D.filter(function(x){return x.id===b;})[0];return '<span>🏅 '+esc(d?d.name:b)+'</span>';}).join('')+'</div>':'')+
        '<h3>住在</h3><div class="tags"><button data-go="'+esc(s.island_id)+'"><i></i>'+esc(isl?isl.name:'')+'</button></div>'+mineBtn+chatHTML(mySid()&&s.sid===mySid()?'':s.nickname);
    }
  };
})();
