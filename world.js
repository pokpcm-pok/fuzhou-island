/* 臺藝圖文浮洲島：3D 開放世界（Three.js r128） */
(function(){
  var T=THREE, SQ3=Math.sqrt(3);
  var S=9.6, RT=6.2, SPEED=8;
  var CX=S*SQ3*1.5, CZ=S*1.5*1.5;
  var PAL={
    light:{sky:0xDCEBF1,water:0xB9DDEA,fog:0xDCEBF1,hemiS:0xFFFFFF,hemiG:0x8FB8C8,sun:1.0,
      hue:{cy:[0x8ED8F0,0x3FA9CF],ma:[0xF7A3CF,0xD9559A],ye:[0xFFE97D,0xDDBB1A],gr:[0xA4E3B6,0x4FB06F],or:[0xFFBB92,0xE27644],vi:[0xC3B2F2,0x8467D1]}},
    dark:{sky:0x0E1A22,water:0x10303F,fog:0x0E1A22,hemiS:0x9DB8C8,hemiG:0x13232D,sun:.7,
      hue:{cy:[0x2B86A4,0x1B5970],ma:[0xA8407A,0x70284F],ye:[0x9A8418,0x6B5A0E],gr:[0x2F8250,0x1F5636],or:[0xA9552F,0x773A1E],vi:[0x6551AC,0x43357A]}}
  };
  var W={}, st={};

  function rng(seed){var s=seed*9301+49297;return function(){s=(s*9301+49297)%233280;return s/233280;};}

  W.init=function(opt){
    st.el=opt.el;st.labels=opt.labels;st.data=opt.data.islands;st.onSelect=opt.onSelect||function(){};
    st.reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var r;
    try{r=new T.WebGLRenderer({antialias:true,alpha:false});}catch(e){if(opt.onError)opt.onError(e);return false;}
    st.renderer=r;r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
    st.el.appendChild(r.domElement);r.domElement.style.display='block';r.domElement.style.touchAction='none';
    st.scene=new T.Scene();
    st.camera=new T.PerspectiveCamera(58,1,.5,700);
    st.hemi=new T.HemisphereLight(0xffffff,0x8FB8C8,1.0);st.scene.add(st.hemi);
    st.sun=new T.DirectionalLight(0xffffff,1);st.sun.position.set(-48,58,-18).add(new T.Vector3(CX,0,CZ));st.sun.castShadow=true;
    st.sun.shadow.mapSize.set(2048,2048);var c=st.sun.shadow.camera;c.left=-85;c.right=85;c.top=85;c.bottom=-85;c.near=10;c.far=200;
    st.sun.target.position.set(CX,0,CZ);st.scene.add(st.sun,st.sun.target);
    Ocean.build(st.scene,CX,CZ);

    buildWorld();
    buildPlayer();
    st.stuIsland={};st.stuNodes=[];
    st.cam={yaw:.55,pitch:.32,dist:33,tgt:new T.Vector3(),want:new T.Vector3()};
    st.keys={};st.joy={x:0,y:0};st.path=[];st.sel=null;st.filter=null;
    bindInput();
    W.setTheme(opt.dark?'dark':'light');
    W.resize();
    st.clock=new T.Clock();
    loop();
    return true;
  };

  /* ---------- world ---------- */
  function buildWorld(){
    var P=Props;
    st.islands=[];st.byId={};st.bridges=[];
    st.data.forEach(function(d,i){
      d.x=S*SQ3*(d.q+d.r/2);d.z=S*1.5*d.r;
      var g=new T.Group();g.position.set(d.x,0,d.z);
      var top=new T.Mesh(new T.CylinderGeometry(RT,RT,.4,6),new T.MeshLambertMaterial({color:0xffffff}));top.position.y=-.2;top.receiveShadow=true;top.castShadow=true;
      var side=new T.Mesh(new T.CylinderGeometry(RT*.98,RT*.55,3.2,6),new T.MeshLambertMaterial({color:0xffffff}));side.position.y=-2.0;side.castShadow=true;
      var tip=new T.Mesh(new T.ConeGeometry(RT*.5,2.2,6),side.material);tip.rotation.x=Math.PI;tip.position.y=-4.7;
      Ocean.addRing(d.x,d.z,i*.13);
      var float=new T.Group();float.add(top,side,tip);
      var lm=P.landmark(d.landmark);lm.position.set(-1.3,0,-.9);lm.scale.setScalar(1.15);lm.rotation.y=.35;float.add(lm);
      var ch=P.char(d.acc,1.25);ch.position.set(2.6,0,1.9);ch.rotation.y=-.6;float.add(ch);
      // little trees
      var rnd=rng(i+3),k;
      for(k=0;k<5;k++){var a=rnd()*Math.PI*2,rr=3.9+rnd()*1.3,tx=Math.cos(a)*rr,tz=Math.sin(a)*rr;
        if(Math.abs(tx-2.6)<1.6&&Math.abs(tz-1.9)<1.6)continue;
        var tr=new T.Group();var tc=new T.Mesh(new T.CylinderGeometry(.12,.16,.7,6),new T.MeshLambertMaterial({color:0x8A5A33}));tc.position.y=.35;
        var tl=new T.Mesh(new T.ConeGeometry(.55,1.3,7),new T.MeshLambertMaterial({color:0x4FB06F}));tl.position.y=1.3;tl.castShadow=true;
        tr.add(tc,tl);tr.position.set(tx,0,tz);tr.scale.setScalar(.8+rnd()*.5);float.add(tr);}
      g.add(float);st.scene.add(g);
      var o={d:d,g:g,float:float,top:top,side:side,char:ch,lm:lm,phase:i*.8,hue:d.hue};
      st.islands.push(o);st.byId[d.id]=o;
      var tag=document.createElement('button');tag.className='tag';tag.textContent=d.name;tag.dataset.id=d.id;st.labels.appendChild(tag);o.tag=tag;
      top.userData.id=d.id;side.userData.id=d.id;lm.traverse(function(m){m.userData.id=d.id;});ch.traverse(function(m){m.userData.id=d.id;m.userData.npc='res';});
    });
    // BOSS on 課程島
    var cb=st.byId.courses;
    var boss=P.boss();boss.position.set(-2.6,0,2.4);boss.rotation.y=.5;cb.float.add(boss);
    var pod=new T.Mesh(new T.CylinderGeometry(1.3,1.5,.5,16),new T.MeshLambertMaterial({color:0xFFD400}));pod.position.set(-2.6,.25,2.4);pod.castShadow=true;cb.float.add(pod);boss.position.y=.5;
    boss.traverse(function(m){m.userData.id='boss';m.userData.npc='boss';});
    st.boss=boss;
    var bt=document.createElement('button');bt.className='tag boss';bt.textContent='波客老師 BOSS';bt.dataset.id='boss';st.labels.appendChild(bt);st.bossTag=bt;
    // bridges for every adjacent pair
    var dirs=[[1,0],[0,1],[-1,1]];
    st.data.forEach(function(a){dirs.forEach(function(v){
      var b=st.data.filter(function(o){return o.q===a.q+v[0]&&o.r===a.r+v[1];})[0];if(!b)return;
      var dx=b.x-a.x,dz=b.z-a.z,dist=Math.sqrt(dx*dx+dz*dz),len=dist-2*(RT*SQ3/2-.5);
      var br=new T.Group();br.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);br.rotation.y=Math.atan2(dx,dz);
      var n=Math.max(3,Math.round(len/.55)),i;
      for(i=0;i<n;i++){var p=new T.Mesh(new T.BoxGeometry(2.4,.18,len/n*.86),new T.MeshLambertMaterial({color:i%2?0xE2B27A:0xCFA066}));p.position.set(0,-.12,-len/2+(i+.5)*len/n);p.castShadow=true;p.receiveShadow=true;br.add(p);}
      var railMat=new T.MeshLambertMaterial({color:0x8A5A33});
      [-1,1].forEach(function(s){var rl=new T.Mesh(new T.BoxGeometry(.1,.1,len),railMat);rl.position.set(s*1.22,.55,0);br.add(rl);
        [-1,0,1].forEach(function(e){var po=new T.Mesh(new T.CylinderGeometry(.08,.08,.8,6),railMat);po.position.set(s*1.22,.2,e*len/2);br.add(po);});});
      br.userData={a:a.id,b:b.id,rail:railMat};
      st.scene.add(br);st.bridges.push({a:a,b:b,g:br,rail:railMat});
    });});
    st.adj={};st.data.forEach(function(d){st.adj[d.id]=[];});
    st.bridges.forEach(function(b){st.adj[b.a.id].push(b.b.id);st.adj[b.b.id].push(b.a.id);});
    st.data.forEach(function(d){d.nb=st.adj[d.id];});
    // selection ring
    st.ring=new T.Mesh(new T.TorusGeometry(RT+.3,.14,6,6),new T.MeshBasicMaterial({color:0xE6007E}));st.ring.rotation.x=Math.PI/2;st.ring.rotation.z=Math.PI/6;st.ring.visible=false;st.scene.add(st.ring);
  }

  function buildPlayer(){
    var p=Props.drop();st.player=p;st.pg=p.userData.body;p.traverse(function(m){m.userData.me=true;});
    var s=st.byId.offset;p.position.set(s.d.x+3,0,s.d.z+3.5);st.scene.add(p);st.walking=false;st.faceY=0;
    st.cam&&0;
  }

  /* ---------- theme ---------- */
  W.setTheme=function(mode){
    st.mode=mode;var P=PAL[mode];
    Ocean.theme(mode);
    st.hemi.color.setHex(P.hemiS);st.hemi.groundColor.setHex(P.hemiG);st.sun.intensity=P.sun;
    st.islands.forEach(function(o){var h=P.hue[o.hue];o.cTop=new T.Color(h[0]);o.cSide=new T.Color(h[1]);});
    applyFilter();
    if(window.Sky&&Sky.on())Sky.reapply();
  };
  /* 太陽高度、天氣與時間：由 sky.js 呼叫 */
  W.setSky=function(p){
    st.skyOn=true;st.hemi.color.setHex(p.hemiS);st.hemi.groundColor.setHex(p.hemiG);
    st.hemi.intensity=st.hemiBase=p.hemiI;st.sun.intensity=p.sunI;st.sun.color.setHex(p.lightC);
    st.sun.position.set(p.ldir.x*80+CX,p.ldir.y*80,p.ldir.z*80+CZ);
    st.mode=p.k>.5?'dark':'light';
    st.islands.forEach(function(o){var l=PAL.light.hue[o.hue],d=PAL.dark.hue[o.hue];
      o.cTop=new T.Color(l[0]).lerp(new T.Color(d[0]),p.k);o.cSide=new T.Color(l[1]).lerp(new T.Color(d[1]),p.k);});
    Ocean.sky(p);applyFilter();
  };
  function applyFilter(){
    var gray=new T.Color(st.mode==='dark'?0x2A3C47:0xB5C2C8);
    st.islands.forEach(function(o){
      var ok=!st.filter||st.filter(o.d);o.ok=ok;
      o.top.material.color.copy(o.cTop);o.side.material.color.copy(o.cSide);
      if(!ok){o.top.material.color.lerp(gray,.7);o.side.material.color.lerp(gray,.7);}
      o.tag.classList.toggle('dim',!ok);
    });
  }
  W.setFilter=function(fn){st.filter=fn;applyFilter();};

  /* ---------- walking ---------- */
  function walkable(x,z){
    var i,o,dx,dz,r=RT*.92;
    for(i=0;i<st.islands.length;i++){o=st.islands[i].d;dx=x-o.x;dz=z-o.z;if(dx*dx+dz*dz<r*r)return true;}
    for(i=0;i<st.bridges.length;i++){var b=st.bridges[i];if(segDist(x,z,b.a.x,b.a.z,b.b.x,b.b.z)<1.2)return true;}
    return false;
  }
  function segDist(px,pz,ax,az,bx,bz){var vx=bx-ax,vz=bz-az,t=((px-ax)*vx+(pz-az)*vz)/(vx*vx+vz*vz);t=Math.max(0,Math.min(1,t));var cx=ax+vx*t-px,cz=az+vz*t-pz;return Math.sqrt(cx*cx+cz*cz);}
  function nearestIsland(x,z){var best=null,bd=1e9;st.islands.forEach(function(o){var dx=x-o.d.x,dz=z-o.d.z,dd=dx*dx+dz*dz;if(dd<bd){bd=dd;best=o;}});return best;}
  function bfs(a,b){
    if(a===b)return [a];var prev={},seen={},q=[a];seen[a]=1;
    while(q.length){var c=q.shift();if(c===b)break;st.adj[c].forEach(function(n){if(!seen[n]){seen[n]=1;prev[n]=c;q.push(n);}});}
    var p=[b],c2=b;while(prev[c2]){c2=prev[c2];p.unshift(c2);}return p;
  }
  W.walkTo=function(id){
    var tg=id==='boss'?st.byId.courses:(st.byId[id]||st.byId[st.stuIsland[id]]);if(!tg)return;
    var from=nearestIsland(st.player.position.x,st.player.position.z).d.id;
    var ids=bfs(from,tg.d.id),path=[],i;
    for(i=0;i<ids.length-1;i++){
      var A=st.byId[ids[i]].d,B=st.byId[ids[i+1]].d,dx=B.x-A.x,dz=B.z-A.z,L=Math.sqrt(dx*dx+dz*dz),ux=dx/L,uz=dz/L;
      path.push(new T.Vector3(A.x+ux*4.6,0,A.z+uz*4.6),new T.Vector3(B.x-ux*4.6,0,B.z-uz*4.6));
    }
    var off=id==='boss'?[-.5,5.3]:[3.2,3.4];
    path.push(new T.Vector3(tg.d.x+off[0],0,tg.d.z+off[1]));
    st.path=path;
  };
  function movePlayer(dt){
    var p=st.player.position,mv=new T.Vector3(),moving=false;
    if(st.path.length){
      var t=st.path[0],dx=t.x-p.x,dz=t.z-p.z,d=Math.sqrt(dx*dx+dz*dz);
      if(d<.25){st.path.shift();}else{mv.set(dx/d,0,dz/d);moving=true;p.x+=mv.x*SPEED*dt;p.z+=mv.z*SPEED*dt;}
    }else{
      var ix=(st.keys.d||st.keys.ArrowRight?1:0)-(st.keys.a||st.keys.ArrowLeft?1:0)+st.joy.x;
      var iy=(st.keys.w||st.keys.ArrowUp?1:0)-(st.keys.s||st.keys.ArrowDown?1:0)+st.joy.y;
      var len=Math.sqrt(ix*ix+iy*iy);
      if(len>.08){
        if(len>1){ix/=len;iy/=len;}
        var y=st.cam.yaw,fx=-Math.sin(y),fz=-Math.cos(y),rx=Math.cos(y),rz=-Math.sin(y);
        var vx=rx*ix+fx*iy,vz=rz*ix+fz*iy,nx=p.x+vx*SPEED*dt,nz=p.z+vz*SPEED*dt;
        if(walkable(nx,nz)){p.x=nx;p.z=nz;}else if(walkable(nx,p.z)){p.x=nx;}else if(walkable(p.x,nz)){p.z=nz;}
        mv.set(vx,0,vz);moving=true;
      }
    }
    if(moving){var ty=Math.atan2(mv.x,mv.z),dy=ty-st.faceY;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;st.faceY+=dy*Math.min(1,dt*12);st.player.rotation.y=st.faceY;}
    st.walking=moving;
  }

  /* ---------- selection ---------- */
  W.select=function(id,walk){
    st.sel=id;
    st.ring.visible=false;
    st.bridges.forEach(function(b){b.rail.color.setHex(0x8A5A33);});
    if(id&&id!=='boss'){
      var o=st.byId[id]||st.byId[st.stuIsland[id]];if(!o){st.onSelect(id);return;}
      st.ring.position.set(o.d.x,.25,o.d.z);st.ring.visible=true;
      st.bridges.forEach(function(b){if(b.a.id===id||b.b.id===id)b.rail.color.setHex(0xE6007E);});
    }
    if(id&&walk!==false&&!(st.selfSid&&id==='s:'+st.selfSid))W.walkTo(id);
    st.onSelect(id);
  };
  /* ---------- 同學角色 ---------- */
  var SLOTS=(function(){var out=[],k=0,a,r,x,z,bad=[[-1.3,-.9,2.4],[2.6,1.9,1.9],[-2.6,2.4,2.2]];
    while(out.length<14&&k<400){a=k*2.39996;r=1.6+((k*37)%10)/10*3.1;x=Math.cos(a)*r;z=Math.sin(a)*r;k++;
      if(bad.some(function(b){return Math.hypot(x-b[0],z-b[1])<b[2];}))continue;
      if(out.some(function(p){return Math.hypot(x-p[0],z-p[1])<1.35;}))continue;out.push([x,z]);}
    return out;})();
  function disposeObj(g){g.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});}
  W.setStudents=function(list){
    if(!st.stuNodes)st.stuNodes=[];st.stuIsland={};
    var old={};
    st.stuNodes.forEach(function(n){old[n.sid]={x:n.x,z:n.z,tx:n.tx,tz:n.tz,tr:n.tr,live:n.live};st.scene.remove(n.g);disposeObj(n.g);if(n.tag.parentNode)n.tag.parentNode.removeChild(n.tag);});
    st.stuNodes=[];var cnt={},over={};
    (list||[]).forEach(function(s,idx){
      var o=st.byId[s.island_id];if(!o)return;var id='s:'+s.sid;
      st.stuIsland[id]=s.island_id;
      if(st.selfSid&&s.sid===st.selfSid)return; // 自己是可操控的主角，不重複放一個
      var k=cnt[s.island_id]=(cnt[s.island_id]||0);
      if(k>=SLOTS.length){over[s.island_id]=(over[s.island_id]||0)+1;return;}cnt[s.island_id]++;
      var col=parseInt(String(s.body_color).replace('#',''),16);if(isNaN(col))col=0xFFFFFF;
      var hx=o.d.x+SLOTS[k][0],hz=o.d.z+SLOTS[k][1],ry=Math.atan2(-SLOTS[k][0],-SLOTS[k][1])+((idx%5)-2)*.12;
      var g=Props.char(s.hat||'',1.0,col,s.face);g.rotation.y=ry;g.position.set(hx,0,hz);
      g.traverse(function(m){m.userData.id=id;});st.scene.add(g);
      var tag=document.createElement('button');tag.className='tag stu';tag.textContent=s.nickname+(s.badges&&s.badges.length?' 🏅'+s.badges.length:'');tag.dataset.id=id;st.labels.appendChild(tag);
      var n={g:g,o:o,tag:tag,sid:s.sid,nick:s.nickname,hx:hx,hz:hz,x:hx,z:hz,tx:hx,tz:hz,tr:ry,ry:ry,live:false,moving:false,ph:idx*.7,id:id},od=old[s.sid];
      if(od&&od.live){n.x=od.x;n.z=od.z;n.tx=od.tx;n.tz=od.tz;n.tr=od.tr;n.live=true;}
      st.stuNodes.push(n);
    });
    st.stuOver=over;
  };
  /* 即時位置：pos = {sid:{x,z,r,t}}，now = 伺服器時間。超過 20 秒沒更新的視為離線，回到住處 */
  W.setPresence=function(pos,now){
    pos=pos||{};
    (st.stuNodes||[]).forEach(function(n){
      var p=pos[n.sid],fresh=p&&isFinite(p.x)&&isFinite(p.z)&&now-p.t<20000;
      if(fresh){if(!n.live){n.x=p.x;n.z=p.z;}n.live=true;n.tx=p.x;n.tz=p.z;n.tr=p.r||0;}
      else n.live=false;
    });
  };
  /* 走近同學：5.5 單位內冒出「打招呼」小標籤，離開到 7 單位以外才收起（避免閃爍） */
  W.onGreet=function(fn){st.greetFn=fn;};
  function updateGreet(){
    var p=st.player.position,best=null,bd=1e9,cur=st.greetNode;
    (st.stuNodes||[]).forEach(function(n){var dx=n.x-p.x,dz=n.z-p.z,d=dx*dx+dz*dz;if(d<bd){bd=d;best=n;}});
    var lim=(cur&&best===cur)?49:30.25;
    st.greetNode=(best&&bd<lim)?best:null;
    var g=st.greetEl,n=st.greetNode;
    if(g&&n&&g.dataset.sid!==n.sid){g.dataset.sid=n.sid;g.dataset.nick=n.nick;g.textContent='👋 跟 '+n.nick+' 打招呼';}
  }
  W.currentIsland=function(){var o=nearestIsland(st.player.position.x,st.player.position.z);if(!o)return null;var dx=st.player.position.x-o.d.x,dz=st.player.position.z-o.d.z,r=RT*1.15;return dx*dx+dz*dz<r*r?o.d.id:null;};
  function selfLabel(){if(st.selfTag)st.selfTag.textContent=st.selfNick+'（我）'+(st.selfN?' 🏅'+st.selfN:'');}
  W.setSelfBadges=function(n){st.selfN=n;selfLabel();};
  W.onIsland=function(id){var o=st.byId[id];if(!o)return false;var dx=st.player.position.x-o.d.x,dz=st.player.position.z-o.d.z,r=RT*1.15;return dx*dx+dz*dz<r*r;};
  W.getPos=function(){return {x:st.player.position.x,z:st.player.position.z,r:st.faceY};};
  function turn(cur,to,k){var d=to-cur;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return cur+d*Math.min(1,k);}
  function updateStu(n,dt,t){
    if(n.live){
      var dx=n.tx-n.x,dz=n.tz-n.z,d=Math.sqrt(dx*dx+dz*dz);
      if(d>.04){var k=Math.min(1,dt*5);n.x+=dx*k;n.z+=dz*k;}
      n.moving=d>.35;
      n.ry=turn(n.ry,n.moving?Math.atan2(dx,dz):n.tr,dt*8);
      n.g.rotation.y=n.ry;n.g.position.set(n.x,0,n.z);
    }else{n.moving=false;n.x=n.hx;n.z=n.hz;n.g.position.set(n.hx,n.o.float.position.y,n.hz);}
    if(!st.reduce&&!st.saver)n.g.userData.body.position.y=n.moving?Math.abs(Math.sin(t*12))*.2:Math.abs(Math.sin(t*2.4+n.ph))*.1;
  }
  /* 主角：登入並建立角色後，自己的角色取代小滴；沒有角色的訪客仍是小滴 */
  W.setAvatar=function(prof,spawn){
    var old=st.player,pos=old.position.clone(),p;
    st.scene.remove(old);disposeObj(old);
    if(prof){
      var col=parseInt(String(prof.body_color).replace('#',''),16);if(isNaN(col))col=0xFFFFFF;
      st.selfSid=prof.sid||'me';
      p=Props.char(prof.hat||'',1.1,col,prof.face);var sid='s:'+st.selfSid;
      p.traverse(function(m){m.userData.id=sid;});
      st.stuIsland[sid]=prof.island_id;
      if(!st.greetEl){var ge=document.createElement('button');ge.className='tag greet';ge.style.display='none';st.labels.appendChild(ge);st.greetEl=ge;}
      if(!st.selfTag){var tg=document.createElement('button');tg.className='tag stu me';st.labels.appendChild(tg);st.selfTag=tg;}
      st.selfNick=prof.nickname;st.selfN=(prof.badges||[]).length;selfLabel();st.selfTag.dataset.id=sid;st.selfTag.style.display='';
      var isl=st.byId[prof.island_id];if(spawn&&isl)pos.set(isl.d.x+3.2,0,isl.d.z+3.4);
    }else{
      st.selfSid=null;p=Props.drop();p.traverse(function(m){m.userData.me=true;});
      if(st.selfTag)st.selfTag.style.display='none';
    }
    p.position.copy(pos);p.rotation.y=st.faceY||0;st.scene.add(p);st.player=p;st.pg=p.userData.body;st.path=[];
  };
  W.focusStudent=function(sid){W.select('s:'+sid,true);};
  W.clear=function(){W.select(null,false);};
  W.overview=function(){st.over=true;st.cam.pitch=.65;st.cam.dist=115;};
  W.follow=function(){st.over=false;st.cam.pitch=.32;st.cam.dist=33;};
  W.setJoystick=function(x,y){st.joy.x=x;st.joy.y=y;};

  /* ---------- 對話氣泡 ---------- */
  var bub={};
  function anchor(key){
    var o,n,i;
    if(key==='me'){var p=st.player.position;return [p.x,3.3,p.z];}
    if(key==='boss'){var cb=st.byId.courses;return [cb.d.x-2.6,6.3+cb.float.position.y,cb.d.z+2.4];}
    if(key.indexOf('res:')===0){o=st.byId[key.slice(4)];return o?[o.d.x+2.6,o.float.position.y+3.9,o.d.z+1.9]:null;}
    if(st.selfSid&&key==='s:'+st.selfSid){var q=st.player.position;return [q.x,3.7,q.z];}
    for(i=0;i<(st.stuNodes||[]).length;i++){n=st.stuNodes[i];if(n.id===key)return [n.x,(n.live?0:n.o.float.position.y)+3.6,n.z];}
    return null;
  }
  function islandOf(key){
    if(key==='me')return nearestIsland(st.player.position.x,st.player.position.z).d.id;
    if(key==='boss')return 'courses';
    if(key.indexOf('res:')===0)return key.slice(4);
    return st.stuIsland[key]||'harbor';
  }
  /* 在角色頭上顯示氣泡。key: 'me'|'boss'|'res:<島id>'|'s:<sid>'；who 是說話者名稱 */
  W.say=function(key,text,who,ms,cls){
    var b=bub[key];if(b&&b.el.parentNode)b.el.parentNode.removeChild(b.el);
    var el=document.createElement('div');el.className='say'+(cls?' '+cls:'');
    if(who){var w=document.createElement('b');w.textContent=who;el.appendChild(w);}
    el.appendChild(document.createTextNode(String(text)));
    st.labels.appendChild(el);bub[key]={el:el,until:Date.now()+(ms||7000)};
  };
  W.npcSay=function(key){
    var isl=islandOf(key),d=st.byId[isl]&&st.byId[isl].d,who=key==='boss'?'波客老師':key==='me'?'小滴':'島民';
    W.say(key,(window.Talk?Talk.line(isl):'歡迎來到浮洲島！'),who+(d&&key!=='boss'?'・'+d.name:''),8000,'npc');
  };
  function placeBubbles(put){
    var now=Date.now();
    Object.keys(bub).forEach(function(k){var b=bub[k];
      if(now>b.until){if(b.el.parentNode)b.el.parentNode.removeChild(b.el);delete bub[k];return;}
      var a=anchor(k);if(!a){b.el.style.display='none';return;}put(b.el,a[0],a[1],a[2]);});
  }

  /* ---------- input ---------- */
  function bindInput(){
    var cv=st.renderer.domElement,ptrs={},down=null,pinch=0;
    cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};down={x:e.clientX,y:e.clientY,t:Date.now(),moved:0};});
    cv.addEventListener('pointermove',function(e){
      var p=ptrs[e.pointerId];if(!p)return;var ids=Object.keys(ptrs);
      if(ids.length===2){var o=ptrs[ids[0]==e.pointerId?ids[1]:ids[0]],d0=Math.hypot(p.x-o.x,p.y-o.y);p.x=e.clientX;p.y=e.clientY;var d1=Math.hypot(p.x-o.x,p.y-o.y);if(pinch)st.cam.dist=clampD(st.cam.dist*pinch/d1);pinch=d1;if(down)down.moved=99;return;}
      var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
      if(down)down.moved+=Math.abs(dx)+Math.abs(dy);
      st.cam.yaw-=dx*.006;st.cam.pitch=Math.max(.1,Math.min(1.35,st.cam.pitch+dy*.005));
    });
    function up(e){delete ptrs[e.pointerId];pinch=0;
      if(down&&down.moved<6&&Date.now()-down.t<500)pick(e.clientX,e.clientY);down=null;}
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',function(e){delete ptrs[e.pointerId];pinch=0;down=null;});
    cv.addEventListener('wheel',function(e){e.preventDefault();st.cam.dist=clampD(st.cam.dist*(1+e.deltaY*.001));},{passive:false});
    window.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA/.test((e.target||{}).tagName))return;var k=e.key.length===1?e.key.toLowerCase():e.key;st.keys[k]=true;if(st.path.length&&/^(w|a|s|d|Arrow.*)$/.test(k))st.path=[];});
    window.addEventListener('keyup',function(e){var k=e.key.length===1?e.key.toLowerCase():e.key;st.keys[k]=false;});
    st.labels.addEventListener('click',function(e){var g=e.target.closest('.tag.greet');if(g){if(st.greetFn)st.greetFn(g.dataset.sid,g.dataset.nick);return;}var b=e.target.closest('.tag');if(b)W.select(b.dataset.id,true);});
    window.addEventListener('resize',W.resize);
  }
  function clampD(d){return Math.max(12,Math.min(110,d));}
  var ray=new T.Raycaster(),v2=new T.Vector2();
  function pick(cx,cy){
    var r=st.renderer.domElement.getBoundingClientRect();
    v2.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(v2,st.camera);
    var hits=ray.intersectObjects(st.scene.children,true),i;
    for(i=0;i<hits.length;i++){var ud=hits[i].object.userData,id=ud.id;
      if(ud.me){W.npcSay('me');return;}
      if(id){W.select(id,true);if(ud.npc)W.npcSay(ud.npc==='boss'?'boss':'res:'+id);return;}}
  }
  W.resize=function(){
    var w=st.el.clientWidth||600,h=st.el.clientHeight||500;
    st.renderer.setSize(w,h,false);st.renderer.domElement.style.width='100%';st.renderer.domElement.style.height='100%';
    st.camera.aspect=w/h;st.camera.updateProjectionMatrix();
  };

  /* ---------- 省電模式：降解析度、關陰影、限制 30 fps、減少動畫 ---------- */
  W.setSaver=function(on){
    on=!!on;if(st.saver===on||!st.renderer)return;st.saver=on;
    st.renderer.setPixelRatio(on?1:Math.min(window.devicePixelRatio||1,2));
    st.renderer.shadowMap.enabled=!on;st.sun.castShadow=!on;
    st.scene.traverse(function(m){if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(function(x){x.needsUpdate=true;});}});
    W.resize();
  };
  W.saver=function(){return !!st.saver;};

  /* ---------- loop ---------- */
  var tmp=new T.Vector3();
  function loop(){
    requestAnimationFrame(loop);
    if(document.hidden)return;
    if(st.saver){var nw=performance.now();if(nw-(st.lastR||0)<32)return;st.lastR=nw;}
    var dt=Math.min(.05,st.clock.getDelta()),t=st.clock.elapsedTime;
    movePlayer(dt);
    if(st.selfSid&&st.greetFn)updateGreet();else st.greetNode=null;
    var pp=st.player.position;
    // animate
    st.pg.position.y=st.walking?Math.abs(Math.sin(t*12))*.25:Math.sin(t*2)*.04;
    st.pg.rotation.z=st.walking?Math.sin(t*12)*.08:0;
    if(!st.reduce&&!st.saver){
      st.islands.forEach(function(o){
        o.float.position.y=Math.sin(t*.9+o.phase)*.12;
        o.char.userData.body.position.y=Math.abs(Math.sin(t*2.2+o.phase))*.12;
        var sp=o.lm.userData.spin;if(sp)sp.rotation.y+=dt*1.2;
      });
      st.boss.userData.body.position.y=Math.abs(Math.sin(t*2.6))*.15;
    }
    (st.stuNodes||[]).forEach(function(n){updateStu(n,dt,t);});
    // camera
    var c=st.cam;
    if(st.over){c.want.set(CX,0,CZ);}else{c.want.set(pp.x,0,pp.z);}
    c.tgt.lerp(c.want,Math.min(1,dt*(st.over?3:5)));
    var cp=Math.cos(c.pitch);
    st.camera.position.set(c.tgt.x+Math.sin(c.yaw)*cp*c.dist,c.tgt.y+Math.sin(c.pitch)*c.dist,c.tgt.z+Math.cos(c.yaw)*cp*c.dist);
    st.camera.lookAt(c.tgt.x,c.tgt.y+2.2,c.tgt.z);
    st.ring.scale.setScalar(1+Math.sin(t*3)*.02);
    st.odt=(st.odt||0)+dt;st.fr=(st.fr||0)+1;
    if(!st.saver||st.fr%2===0){Ocean.update(st.odt,t,st.camera,st.reduce||st.saver);st.odt=0;}
    if(st.skyOn)st.hemi.intensity=(st.hemiBase||1)+Ocean.flash()*1.4;
    st.renderer.render(st.scene,st.camera);
    placeLabels();
  }
  function placeLabels(){
    var w=st.el.clientWidth,h=st.el.clientHeight;
    function put(el,x,y,z){tmp.set(x,y,z).project(st.camera);
      var vis=tmp.z<1&&Math.abs(tmp.x)<1.1&&Math.abs(tmp.y)<1.1;
      el.style.display=vis?'':'none';
      if(vis)el.style.transform='translate('+((tmp.x*.5+.5)*w).toFixed(0)+'px,'+((-tmp.y*.5+.5)*h).toFixed(0)+'px) translate(-50%,-100%)';}
    st.islands.forEach(function(o){put(o.tag,o.d.x,o.float.position.y+5.2,o.d.z);o.tag.classList.toggle('sel',st.sel===o.d.id);});
    (st.stuNodes||[]).forEach(function(n){
      var dx=n.x-st.cam.tgt.x,dz=n.z-st.cam.tgt.z,near=!st.over&&dx*dx+dz*dz<26*26||st.sel===n.id;
      if(!near){n.tag.style.display='none';return;}put(n.tag,n.x,(n.live?0:n.o.float.position.y)+2.5,n.z);n.tag.classList.toggle('sel',st.sel===n.id);});
    if(st.selfTag&&st.selfSid){put(st.selfTag,st.player.position.x,3.0,st.player.position.z);st.selfTag.classList.toggle('sel',st.sel==='s:'+st.selfSid);}
    if(st.greetEl){if(st.greetNode&&st.greetFn&&st.selfSid){var gn=st.greetNode;put(st.greetEl,gn.x,(gn.live?0:gn.o.float.position.y)+4.4,gn.z);}else st.greetEl.style.display='none';}
    placeBubbles(put);
    var cb=st.byId.courses.d;put(st.bossTag,cb.x-2.6,5.4,cb.z+2.4);st.bossTag.classList.toggle('sel',st.sel==='boss');
  }

  window.World=W;
})();
