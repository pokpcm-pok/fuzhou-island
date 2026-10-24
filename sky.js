/* 日夜循環與天氣：依所選地點的當地時間算出太陽高度，並向 Open-Meteo 讀取目前天氣。
   只送出「所選城市」的座標，不會取得同學自己的位置。 */
(function(){
  var T=THREE,RAD=Math.PI/180;
  var CITIES=[
    {id:'banqiao',n:'新北板橋（學校）',g:'台灣',lat:25.01,lon:121.46,tz:'Asia/Taipei'},
    {id:'taipei',n:'台北',g:'台灣',lat:25.04,lon:121.56,tz:'Asia/Taipei'},
    {id:'taoyuan',n:'桃園',g:'台灣',lat:24.99,lon:121.30,tz:'Asia/Taipei'},
    {id:'hsinchu',n:'新竹',g:'台灣',lat:24.80,lon:120.97,tz:'Asia/Taipei'},
    {id:'taichung',n:'台中',g:'台灣',lat:24.15,lon:120.67,tz:'Asia/Taipei'},
    {id:'chiayi',n:'嘉義',g:'台灣',lat:23.48,lon:120.45,tz:'Asia/Taipei'},
    {id:'tainan',n:'台南',g:'台灣',lat:22.99,lon:120.21,tz:'Asia/Taipei'},
    {id:'kaohsiung',n:'高雄',g:'台灣',lat:22.63,lon:120.30,tz:'Asia/Taipei'},
    {id:'yilan',n:'宜蘭',g:'台灣',lat:24.76,lon:121.75,tz:'Asia/Taipei'},
    {id:'hualien',n:'花蓮',g:'台灣',lat:23.98,lon:121.60,tz:'Asia/Taipei'},
    {id:'taitung',n:'台東',g:'台灣',lat:22.76,lon:121.14,tz:'Asia/Taipei'},
    {id:'penghu',n:'澎湖',g:'台灣',lat:23.57,lon:119.57,tz:'Asia/Taipei'},
    {id:'kinmen',n:'金門',g:'台灣',lat:24.43,lon:118.32,tz:'Asia/Taipei'},
    {id:'tokyo',n:'東京',g:'海外',lat:35.68,lon:139.69,tz:'Asia/Tokyo'},
    {id:'seoul',n:'首爾',g:'海外',lat:37.57,lon:126.98,tz:'Asia/Seoul'},
    {id:'hongkong',n:'香港',g:'海外',lat:22.32,lon:114.17,tz:'Asia/Hong_Kong'},
    {id:'singapore',n:'新加坡',g:'海外',lat:1.35,lon:103.82,tz:'Asia/Singapore'},
    {id:'bangkok',n:'曼谷',g:'海外',lat:13.76,lon:100.50,tz:'Asia/Bangkok'},
    {id:'dubai',n:'杜拜',g:'海外',lat:25.20,lon:55.27,tz:'Asia/Dubai'},
    {id:'london',n:'倫敦',g:'海外',lat:51.51,lon:-0.13,tz:'Europe/London'},
    {id:'paris',n:'巴黎',g:'海外',lat:48.86,lon:2.35,tz:'Europe/Paris'},
    {id:'berlin',n:'柏林',g:'海外',lat:52.52,lon:13.40,tz:'Europe/Berlin'},
    {id:'newyork',n:'紐約',g:'海外',lat:40.71,lon:-74.01,tz:'America/New_York'},
    {id:'losangeles',n:'洛杉磯',g:'海外',lat:34.05,lon:-118.24,tz:'America/Los_Angeles'},
    {id:'sydney',n:'雪梨',g:'海外',lat:-33.87,lon:151.21,tz:'Australia/Sydney'}
  ];
  /* 手動時間：直接指定太陽高度（度）與方位（從正南向西為正） */
  var TIMES=[['auto','即時（當地時間）'],['dawn','清晨',4,-100],['noon','正午',68,0],['dusk','黃昏',2,100],['night','深夜',-35,170]];
  var WXS=[['auto','實際天氣'],['clear','晴天'],['cloudy','多雲'],['overcast','陰天'],['fog','起霧'],['drizzle','小雨'],['rain','大雨'],['snow','下雪'],['storm','雷雨']];
  var KEYS=[
    {e:-18,hor:0x0B1626,top:0x03060C,water:0x082B40,spec:0x3C6A90,sunC:0xFFB070,glow:0xFF9A55,glowOp:0,cloud:0x25354A,hemiS:0x7F9CC0,hemiG:0x13232D,hemiI:.8,sunI:0,lightC:0xFFFFFF,k:1,stars:1,bird:0xCFE2EC,stripeA:.22},
    {e:-9,hor:0x24315A,top:0x070D26,water:0x0A3350,spec:0x5A78A8,sunC:0xFFB070,glow:0xFF9A55,glowOp:.1,cloud:0x34415F,hemiS:0x8CA4C8,hemiG:0x15262F,hemiI:.85,sunI:0,lightC:0xFFFFFF,k:.95,stars:.8,bird:0xCFE2EC,stripeA:.24},
    {e:-2,hor:0xD58A7A,top:0x2D3F7A,water:0x1B5575,spec:0xC89AA0,sunC:0xFF7A3A,glow:0xFF7A3A,glowOp:.9,cloud:0xE8A58C,hemiS:0xE8B8A0,hemiG:0x3A4A55,hemiI:.9,sunI:.3,lightC:0xFFA070,k:.55,stars:.15,bird:0x3A3040,stripeA:.28},
    {e:6,hor:0xF6B988,top:0x4F7FC4,water:0x2B8FB5,spec:0xFFD2A0,sunC:0xFFA860,glow:0xFFB066,glowOp:.95,cloud:0xFFD4B8,hemiS:0xFFE4CC,hemiG:0x7FA0B0,hemiI:.97,sunI:.7,lightC:0xFFD2A8,k:.15,stars:0,bird:0x2C3038,stripeA:.32},
    {e:18,hor:0xE4E2CF,top:0x58A2DE,water:0x2DA0C8,spec:0xE8E0B0,sunC:0xFFE6A0,glow:0xFFD080,glowOp:.9,cloud:0xFFF4E6,hemiS:0xFFFFFF,hemiG:0x8FB8C8,hemiI:1,sunI:.95,lightC:0xFFF0D8,k:0,stars:0,bird:0x26323B,stripeA:.34},
    {e:40,hor:0xCFE9F4,top:0x58AEE6,water:0x2FA6CF,spec:0xA8E4F5,sunC:0xFFF1B8,glow:0xFFC766,glowOp:.9,cloud:0xFFFFFF,hemiS:0xFFFFFF,hemiG:0x8FB8C8,hemiI:1,sunI:1,lightC:0xFFFFFF,k:0,stars:0,bird:0x26323B,stripeA:.34}
  ];
  var HEX=['hor','top','water','spec','sunC','glow','cloud','hemiS','hemiG','lightC'],NUM=['glowOp','hemiI','sunI','k','stars','stripeA'];
  /* 天氣碼 → 狀態（cover 雲量、precip 雨雪、pInt 強度、fog 霧） */
  function fromCode(c,cc){
    var cover=cc!=null?cc/100:null,o;
    if(c===0)o={cover:.05,l:'晴',ic:'☀'};
    else if(c===1)o={cover:.2,l:'晴時多雲',ic:'🌤'};
    else if(c===2)o={cover:.55,l:'多雲',ic:'⛅'};
    else if(c===3)o={cover:.92,l:'陰天',ic:'☁'};
    else if(c===45||c===48)o={cover:.85,fog:1,l:'起霧',ic:'🌫'};
    else if(c>=51&&c<=57)o={cover:.85,precip:'rain',pInt:.25,l:'毛毛雨',ic:'🌦'};
    else if(c===61||c===80)o={cover:.88,precip:'rain',pInt:.45,l:'小雨',ic:'🌧'};
    else if(c===63||c===66||c===81)o={cover:.92,precip:'rain',pInt:.7,l:'下雨',ic:'🌧'};
    else if(c===65||c===67||c===82)o={cover:1,precip:'rain',pInt:.95,l:'大雨',ic:'🌧'};
    else if(c===71||c===77||c===85)o={cover:.9,precip:'snow',pInt:.45,l:'小雪',ic:'🌨'};
    else if(c===73)o={cover:.95,precip:'snow',pInt:.7,l:'下雪',ic:'🌨'};
    else if(c===75||c===86)o={cover:1,precip:'snow',pInt:.95,l:'大雪',ic:'❄'};
    else if(c>=95)o={cover:1,precip:'rain',pInt:.9,thunder:1,l:'雷雨',ic:'⛈'};
    else o={cover:.3,l:'—',ic:'☀'};
    if(cover!=null&&c<=3)o.cover=Math.max(0,Math.min(1,cover));
    return o;
  }
  var MANUAL={clear:{cover:.05,l:'晴天',ic:'☀'},cloudy:{cover:.55,l:'多雲',ic:'⛅'},overcast:{cover:.95,l:'陰天',ic:'☁'},fog:{cover:.85,fog:1,l:'起霧',ic:'🌫'},
    drizzle:{cover:.85,precip:'rain',pInt:.3,l:'小雨',ic:'🌦'},rain:{cover:1,precip:'rain',pInt:.95,l:'大雨',ic:'🌧'},snow:{cover:.95,precip:'snow',pInt:.8,l:'下雪',ic:'❄'},storm:{cover:1,precip:'rain',pInt:.9,thunder:1,l:'雷雨',ic:'⛈'}};

  var S={city:'banqiao',time:'auto',wx:'auto',real:null,temp:null,tm:null,err:false,on:false,saver:false};
  function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function put(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function city(){for(var i=0;i<CITIES.length;i++)if(CITIES[i].id===S.city)return CITIES[i];return CITIES[0];}

  /* ---------- 天文：太陽高度與方位 ---------- */
  function sunAt(c,date){
    var n=Math.floor((date-Date.UTC(date.getUTCFullYear(),0,0))/864e5);
    var decl=23.44*RAD*Math.sin(2*Math.PI*(284+n)/365);
    var ut=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
    var B=2*Math.PI*(n-81)/364,eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B); // 時差（分鐘）
    var hra=((ut+c.lon/15+eot/60)-12)*15*RAD,lat=c.lat*RAD;
    var sinE=Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(hra);
    var el=Math.asin(Math.max(-1,Math.min(1,sinE)));
    var az=Math.atan2(Math.sin(hra),Math.cos(hra)*Math.sin(lat)-Math.tan(decl)*Math.cos(lat));
    return {el:el/RAD,az:az/RAD};
  }
  function localClock(c,date){
    try{
      var f=new Intl.DateTimeFormat('en-GB',{timeZone:c.tz,hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
      return f.replace(/^24/,'00');
    }catch(e){return '--:--';}
  }
  function clockMin(c,date){var m=localClock(c,date).split(':');return (+m[0])*60+(+m[1]);}
  function fmt(m){m=((m%1440)+1440)%1440;var h=Math.floor(m/60),mm=Math.round(m%60);if(mm===60){h=(h+1)%24;mm=0;}return (h<10?'0':'')+h+':'+(mm<10?'0':'')+mm;}
  /* 日出、日落：以 5 分鐘為單位掃描當天（當地時間） */
  function riseSet(c,date){
    var base=new Date(date.getTime()-clockMin(c,date)*60000),rise=null,set=null,prev=sunAt(c,base).el,i,e,t;
    for(i=1;i<=288;i++){t=new Date(base.getTime()+i*300000);e=sunAt(c,t).el;
      if(prev<=-.83&&e>-.83&&rise===null)rise=i*5;
      if(prev>-.83&&e<=-.83&&set===null)set=i*5;prev=e;}
    return {rise:rise,set:set};
  }

  /* ---------- 組合出場景參數 ---------- */
  function lerpHex(a,b,t){return new T.Color(a).lerp(new T.Color(b),t).getHex();}
  function keyAt(e){
    var i,a,b,t,o={};
    if(e<=KEYS[0].e)a=b=KEYS[0],t=0;
    else if(e>=KEYS[KEYS.length-1].e)a=b=KEYS[KEYS.length-1],t=0;
    else{for(i=0;i<KEYS.length-1;i++)if(e>=KEYS[i].e&&e<KEYS[i+1].e){a=KEYS[i];b=KEYS[i+1];t=(e-a.e)/(b.e-a.e);break;}}
    HEX.forEach(function(k){o[k]=lerpHex(a[k],b[k],t);});
    NUM.forEach(function(k){o[k]=a[k]+(b[k]-a[k])*t;});
    return o;
  }
  function dirOf(el,az){var e=el*RAD,a=az*RAD;return new T.Vector3(-Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e));}
  function weather(){
    if(S.wx!=='auto'&&MANUAL[S.wx])return MANUAL[S.wx];
    return S.real||{cover:.1,l:'晴',ic:'☀'};
  }
  function compute(){
    var c=city(),now=new Date(),sun,tm=null,i;
    for(i=0;i<TIMES.length;i++)if(TIMES[i][0]===S.time)tm=TIMES[i];
    sun=(tm&&tm.length>2)?{el:tm[2],az:tm[3]}:sunAt(c,now);
    var p=keyAt(sun.el),w=weather(),o=Math.max(0,Math.min(1,w.cover)),day=Math.max(0,Math.min(1,(sun.el+6)/30));
    // 陰天：天空、雲與光線往灰色靠，夜晚保持深色
    var gr=new T.Color(0x8E9BA6).multiplyScalar(.2+.8*day).getHex();
    p.hor=lerpHex(p.hor,gr,.6*o);p.top=lerpHex(p.top,new T.Color(gr).multiplyScalar(.85).getHex(),.55*o);
    p.cloud=lerpHex(p.cloud,new T.Color(0x7D8892).multiplyScalar(.3+.7*day).getHex(),.8*o);
    p.water=lerpHex(p.water,new T.Color(0x3C6E80).multiplyScalar(.4+.6*day).getHex(),.35*o);
    p.sunI*=1-.55*o;p.glowOp*=1-.85*o;p.hemiI*=1-.08*o;
    p.cloudN=Math.min(1,.12+o*.95);
    p.fogNear=(95-o*20)*1.6;p.fogFar=(270-o*70)*1.6;
    if(w.fog){p.fogNear=14;p.fogFar=120;p.hor=lerpHex(p.hor,new T.Color(0xB9C3CA).multiplyScalar(.25+.75*day).getHex(),.7);}
    if(w.precip){p.fogFar=Math.min(p.fogFar,170);}
    p.sdir=dirOf(sun.el,sun.az);
    p.sunVis=sun.el>-3&&o<.9;
    var me=-sun.el;p.mdir=dirOf(Math.max(me,6),sun.az+180);p.moonVis=sun.el<-3;p.moonC=o>.8?0x9AA5B5:0xEEF3FF;
    if(!p.moonVis&&!p.sunVis)p.glowOp=0;
    if(p.moonVis){p.glow=0x9FC0F0;p.glowOp=.5*(1-o*.85)*Math.min(1,(-sun.el-3)/8);}
    p.stars*=1-o;
    // 光源方向：太陽或月亮，且壓低角度避免陰影過長
    var ld=p.moonVis&&sun.el<-6?dirOf(Math.max(me,35),sun.az+180):dirOf(Math.max(sun.el,14),sun.az);
    p.ldir=ld;
    if(p.moonVis&&sun.el<-3){p.sunI=Math.max(p.sunI,.32*(1-o*.5));p.lightC=0x9DB8E0;}
    p.precip=w.precip||null;p.pInt=w.pInt||0;p.thunder=!!w.thunder;
    p.k=Math.max(p.k,0);
    S.sun=sun;
    return p;
  }

  /* ---------- 介面 ---------- */
  var ui={};
  function icon(w,sun){
    if(sun&&sun.el<-3&&!w.precip&&!w.fog)return w.cover>.6?'☁':'🌙';
    return w.ic||'☀';
  }
  function info(){
    var c=city(),now=new Date(),w=weather(),rs=riseSet(c,now),parts=[];
    parts.push(c.n+' 現在 '+localClock(c,now)+'（當地）');
    parts.push(w.l+(S.wx==='auto'&&S.temp!=null?'，'+Math.round(S.temp)+'°C':'')+(S.wx!=='auto'?'（手動）':''));
    if(rs.rise!=null&&rs.set!=null)parts.push('日出 '+fmt(rs.rise)+'／日落 '+fmt(rs.set));
    var t=parts.join('｜');
    if(S.err&&S.wx==='auto')t+='\n天氣暫時讀不到，先以晴天顯示。';
    return t;
  }
  function paint(){
    if(!ui.btn)return;
    var c=city(),w=weather();
    ui.btn.textContent=icon(w,S.sun)+' '+c.n.replace(/（.*/,'')+(S.wx==='auto'&&S.temp!=null?' '+Math.round(S.temp)+'°':'');
    if(ui.info)ui.info.textContent=info();
  }
  function build(){
    var stage=document.getElementById('stage'),hud=stage&&stage.querySelector('.hud');
    if(!hud)return;
    ui.btn=document.getElementById('bSky');
    if(!ui.btn){ui.btn=document.createElement('button');ui.btn.id='bSky';hud.insertBefore(ui.btn,hud.firstChild);}
    ui.btn.setAttribute('aria-haspopup','dialog');ui.btn.setAttribute('aria-expanded','false');
    var box=document.createElement('div');box.className='skybox';box.id='skyBox';box.setAttribute('role','dialog');box.setAttribute('aria-label','天空與天氣設定');box.hidden=true;
    var tw='',ov='';CITIES.forEach(function(c){var h='<option value="'+c.id+'">'+c.n+'</option>';if(c.g==='台灣')tw+=h;else ov+=h;});
    box.innerHTML='<h4>天空與天氣</h4>'+
      '<label>地點<select id="skyCity"><optgroup label="台灣">'+tw+'</optgroup><optgroup label="海外">'+ov+'</optgroup></select></label>'+
      '<label>時間<select id="skyTime">'+TIMES.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>';}).join('')+'</select></label>'+
      '<label>天氣<select id="skyWx">'+WXS.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>';}).join('')+'</select></label>'+
      '<p id="skyInfo" class="skyinfo"></p>'+
      '<p class="skynote">只會把所選城市的座標傳給 Open-Meteo 查天氣，不會取得你的位置。時間與天氣的手動選項只改變你自己的畫面。</p>';
    stage.appendChild(box);ui.box=box;ui.info=box.querySelector('#skyInfo');
    ui.selC=box.querySelector('#skyCity');ui.selT=box.querySelector('#skyTime');ui.selW=box.querySelector('#skyWx');
    ui.selC.value=S.city;ui.selT.value=S.time;ui.selW.value=S.wx;
    ui.btn.addEventListener('click',function(e){e.stopPropagation();var open=box.hidden;box.hidden=!open;ui.btn.setAttribute('aria-expanded',open?'true':'false');if(open){paint();ui.selC.focus();}});
    box.addEventListener('click',function(e){e.stopPropagation();});
    document.addEventListener('click',function(){if(!box.hidden){box.hidden=true;ui.btn.setAttribute('aria-expanded','false');}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!box.hidden){box.hidden=true;ui.btn.setAttribute('aria-expanded','false');ui.btn.focus();}});
    ui.selC.addEventListener('change',function(){S.city=ui.selC.value;put('fz_city',S.city);S.real=null;S.temp=null;fetchWx();apply();});
    ui.selT.addEventListener('change',function(){S.time=ui.selT.value;put('fz_time',S.time);apply();});
    ui.selW.addEventListener('change',function(){S.wx=ui.selW.value;put('fz_wx',S.wx);apply();});
  }

  /* ---------- 天氣：Open-Meteo ---------- */
  function fetchWx(){
    var c=city(),id=c.id;
    var url='https://api.open-meteo.com/v1/forecast?latitude='+c.lat+'&longitude='+c.lon+'&current=temperature_2m,weather_code,cloud_cover&timezone=auto';
    fetch(url).then(function(r){return r.json();}).then(function(j){
      if(id!==S.city)return;
      var cur=j&&j.current;if(!cur||cur.weather_code==null)throw new Error('no data');
      S.real=fromCode(+cur.weather_code,cur.cloud_cover!=null?+cur.cloud_cover:null);S.temp=cur.temperature_2m!=null?+cur.temperature_2m:null;S.err=false;
      apply();
    }).catch(function(){if(id===S.city){S.err=true;paint();}});
  }

  function apply(){
    if(!window.World)return;
    S.on=true;World.setSky(compute());paint();
  }

  window.Sky={
    on:function(){return S.on;},
    reapply:apply,
    cities:CITIES,
    state:S,
    init:function(){
      var c=get('fz_city'),t=get('fz_time'),w=get('fz_wx'),i,ok;
      for(ok=false,i=0;i<CITIES.length;i++)if(CITIES[i].id===c)ok=true;if(ok)S.city=c;
      for(ok=false,i=0;i<TIMES.length;i++)if(TIMES[i][0]===t)ok=true;if(ok)S.time=t;
      for(ok=false,i=0;i<WXS.length;i++)if(WXS[i][0]===w)ok=true;if(ok)S.wx=w;
      build();apply();fetchWx();
      setInterval(function(){if(!document.hidden)apply();},30000);
      setInterval(function(){if(!document.hidden)fetchWx();},20*60000);
      document.addEventListener('visibilitychange',function(){if(!document.hidden){apply();}});
    }
  };
})();
