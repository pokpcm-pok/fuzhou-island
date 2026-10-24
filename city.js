/* 臺藝圖文浮洲島：島上配置（樹、長椅、路燈…）、環島道路、YouBike 租借站、307／264 公車 */
(function(){
  var T=THREE, C={}, SQ3=Math.sqrt(3);
  var RING=9.0, ROAD_IN=7.4, ROAD_OUT=10.4, LANE=.85, BUSV=9, DWELL=5, STEP=.15;
  var ST={x:4.2,z:-4.2};                       // YouBike 站（島嶼座標）
  var P={}, S0={};                              // 設定
  var FONT='"Noto Sans TC","Microsoft JhengHei","PingFang TC",sans-serif';

  /* ---------- 把許多小幾何合併成一個 Mesh（頂點著色），一座島只用 2 個 draw call ---------- */
  function Baker(){this.pos=[];this.nor=[];this.col=[];this.base=new T.Matrix4();this.stack=[];this.m=new T.Matrix4();this.q=new T.Quaternion();this.e=new T.Euler();this.v=new T.Vector3();this.s=new T.Vector3(1,1,1);this.c=new T.Color();}
  Baker.prototype.at=function(x,y,z,ry,s){this.e.set(0,ry||0,0);this.q.setFromEuler(this.e);this.base.compose(this.v.set(x,y,z),this.q,this.s.set(s||1,s||1,s||1));return this;};
  Baker.prototype.reset=function(){this.base.identity();this.stack.length=0;return this;};
  Baker.prototype.push=function(x,y,z,ry){this.stack.push(this.base.clone());this.e.set(0,ry||0,0);this.q.setFromEuler(this.e);this.m.compose(this.v.set(x,y,z),this.q,this.s.set(1,1,1));this.base.multiply(this.m);return this;};
  Baker.prototype.pop=function(){this.base.copy(this.stack.pop());return this;};
  Baker.prototype.add=function(geo,col,x,y,z,rx,ry,rz,sx,sy,sz){
    this.e.set(rx||0,ry||0,rz||0);this.q.setFromEuler(this.e);
    this.m.compose(this.v.set(x||0,y||0,z||0),this.q,this.s.set(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz));
    this.m.premultiply(this.base);
    var g=geo.index?geo.toNonIndexed():geo;g.applyMatrix4(this.m);
    var p=g.attributes.position.array,n=g.attributes.normal.array,i;this.c.setHex(col);
    for(i=0;i<p.length;i++){this.pos.push(p[i]);this.nor.push(n[i]);}
    for(i=0;i<p.length;i+=3)this.col.push(this.c.r,this.c.g,this.c.b);
    geo.dispose();if(g!==geo)g.dispose();return this;
  };
  Baker.prototype.mesh=function(mat,shadow){
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.BufferAttribute(new Float32Array(this.pos),3));
    g.setAttribute('normal',new T.BufferAttribute(new Float32Array(this.nor),3));
    g.setAttribute('color',new T.BufferAttribute(new Float32Array(this.col),3));
    var m=new T.Mesh(g,mat);m.castShadow=!!shadow;return m;
  };
  var matVC=null,matBulb=null;
  function bx(B,w,h,d,c,x,y,z,ry){return B.add(new T.BoxGeometry(w,h,d),c,x,y,z,0,ry||0,0);}
  function cy(B,rt,rb,h,c,x,y,z,seg){return B.add(new T.CylinderGeometry(rt,rb,h,seg||8),c,x,y,z);}
  function sp(B,r,c,x,y,z,sx,sy,sz){return B.add(new T.SphereGeometry(r,9,7),c,x,y,z,0,0,0,sx,sy,sz);}
  function co(B,r,h,c,x,y,z,seg){return B.add(new T.ConeGeometry(r,h,seg||8),c,x,y,z);}

  /* ---------- 小物件（原點為地面中心，Baker 的 at() 決定位置、朝向與大小） ---------- */
  var GR=[0x4FB06F,0x3E9E5E,0x6CC27F,0x5BB56B,0x56AE7A], CMYK=[0x00A9E0,0xE6007E,0xFFD400,0x23282D];
  var BR=0x8A5A33, WD=0xC79A5E, GY=0x9AA7AE, DK=0x3A444C;
  var ITEM={
    tree:function(B,r){var h=.8+r()*.4;cy(B,.13,.18,h,BR,0,h/2,0,6);var c=GR[Math.floor(r()*GR.length)];sp(B,.95,c,0,h+.7,0,1,.95,1);sp(B,.62,c,.35,h+1.25,.1);},
    pine:function(B,r){cy(B,.12,.16,.7,BR,0,.35,0,6);var c=GR[1+Math.floor(r()*3)];co(B,1.0,1.4,c,0,1.3,0,8);co(B,.78,1.2,c,0,2.0,0,8);co(B,.5,1.0,c,0,2.7,0,8);},
    sakura:function(B){cy(B,.14,.2,1.1,BR,0,.55,0,6);sp(B,1.0,0xF7B6D2,0,1.7,0,1,.9,1);sp(B,.6,0xFAC8DD,.5,1.3,.3);sp(B,.55,0xF7B6D2,-.5,1.45,-.2);},
    bush:function(B,r){var c=GR[Math.floor(r()*GR.length)];sp(B,.6,c,0,.38,0,1.2,.8,1);sp(B,.4,c,.5,.28,.2);},
    flower:function(B,r){bx(B,1.3,.22,.8,0x7A5232,0,.11,0);var k;for(k=0;k<7;k++){var cc=CMYK[k%3];sp(B,.13,cc,-.5+k*.17,.34,(k%2?.18:-.18));}sp(B,.22,0x5BB56B,0,.3,0,2,.5,1);},
    bench:function(B){bx(B,1.5,.1,.5,WD,0,.5,0);bx(B,1.5,.45,.08,WD,0,.82,-.22);bx(B,.1,.5,.45,DK,-.65,.25,0);bx(B,.1,.5,.45,DK,.65,.25,0);},
    rock:function(B,r){B.add(new T.DodecahedronGeometry(.55),0xA9B4BA,0,.3,0,r(),r()*3,0,1.2,.8,1);B.add(new T.DodecahedronGeometry(.3),0x93A0A7,.6,.15,.3);},
    kiosk:function(B,r){var c=CMYK[Math.floor(r()*3)];bx(B,1.9,1.3,1.5,0xF2F5F7,0,.65,0);bx(B,2.1,.14,1.7,c,0,1.35,0);B.add(new T.ConeGeometry(1.5,.9,4),c,0,1.85,0,0,Math.PI/4,0);
      var k;for(k=0;k<5;k++)bx(B,.36,.06,.5,k%2?0xFFFFFF:c,-.74+k*.37,1.2,.95);bx(B,1.2,.5,.05,0x23323C,0,.85,.76);},
    umbrella:function(B,r){var c=CMYK[Math.floor(r()*3)];cy(B,.05,.05,2.0,GY,0,1.0,0,6);co(B,1.5,.55,c,0,2.2,0,10);cy(B,.55,.55,.07,0xF2F5F7,0,.75,0,12);cy(B,.06,.06,.75,GY,0,.37,0,6);
      cy(B,.22,.22,.45,DK,.9,.22,0,8);cy(B,.22,.22,.45,DK,-.9,.22,0,8);},
    paper:function(B,r){var k;for(k=0;k<4;k++)B.add(new T.BoxGeometry(1.1,.14,.8),0xFFFFFF,0,.07+k*.15,0,0,(r()-.5)*.35,0);bx(B,1.12,.5,.1,0xD9A66B,0,.3,0);bx(B,.1,.5,.82,0xD9A66B,0,.3,0);},
    cmyk:function(B){var k;for(k=0;k<4;k++)cy(B,.22,.22,.55+k*.18,CMYK[k],-.9+k*.6,(.55+k*.18)/2,0,12);},
    crate:function(B,r){bx(B,.9,.8,.9,0xD9A66B,0,.4,0,r()*.6);bx(B,.7,.6,.7,0xE4B982,.1,1.1,0,r()*.6);bx(B,.92,.12,.92,0xC28F55,0,.8,0);},
    bin:function(B){cy(B,.26,.22,.7,0x3F8F6A,0,.35,0,8);cy(B,.28,.28,.08,DK,0,.72,0,8);},
    sign:function(B,r){cy(B,.05,.05,1.5,BR,0,.75,0,6);B.add(new T.BoxGeometry(1.1,.5,.07),WD,0,1.45,0,0,0,(r()-.5)*.1);bx(B,1.0,.12,.08,CMYK[Math.floor(r()*3)],0,1.45,.05);},
    lamp:function(B,L){cy(B,.07,.1,2.6,DK,0,1.3,0,6);bx(B,.5,.06,.06,DK,.2,2.58,0);L.add(new T.SphereGeometry(.2,8,6),0xFFE9A0,.45,2.5,0);}
  };
  C.ITEM=ITEM;

  function rng(seed){var s=seed*9301+49297;return function(){s=(s*9301+49297)%233280;return s/233280;};}

  /* ---------- 文字看板（Sprite，永遠面向鏡頭） ---------- */
  function textSprite(lines,bg,fg,sc){
    var cv=document.createElement('canvas');cv.width=320;cv.height=160;var g=cv.getContext('2d');
    var r=16;g.fillStyle=bg;g.beginPath();g.moveTo(r,0);g.lineTo(320-r,0);g.quadraticCurveTo(320,0,320,r);g.lineTo(320,160-r);g.quadraticCurveTo(320,160,320-r,160);g.lineTo(r,160);g.quadraticCurveTo(0,160,0,160-r);g.lineTo(0,r);g.quadraticCurveTo(0,0,r,0);g.fill();
    g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
    g.font='700 64px '+FONT;g.fillText(lines[0],160,lines[1]?56:80);
    if(lines[1]){g.font='500 34px '+FONT;g.fillText(lines[1],160,118);}
    var tx=new T.CanvasTexture(cv);
    var sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));
    sp.scale.set(sc*2,sc,1);return sp;
  }
  function numTex(no,color){
    var cv=document.createElement('canvas');cv.width=256;cv.height=128;var g=cv.getContext('2d');
    g.fillStyle='#'+('000000'+color.toString(16)).slice(-6);g.fillRect(0,0,256,128);
    g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='800 92px '+FONT;g.fillText(no,128,70);
    g.font='600 22px '+FONT;g.fillText('臺藝圖文浮洲島',128,18);
    return new T.CanvasTexture(cv);
  }

  /* ---------- 公車路線 ---------- */
  var DEFS=[
    {no:'307',color:0x2E7DD1,ids:['digital','ai','post','photo','media']},
    {no:'264',color:0x2BAE66,ids:['prepress','ai','courses','clubs','showcase']}
  ];
  function wrap(a){while(a>Math.PI)a-=Math.PI*2;while(a<=-Math.PI)a+=Math.PI*2;return a;}
  function buildRoute(def,byId){
    var is=def.ids.map(function(id){return byId[id];});if(is.some(function(x){return !x;}))return null;
    var n=is.length,V=2*n-2,visits=[],k,idx;
    for(k=0;k<V;k++){idx=k<n?k:2*n-2-k;visits.push({d:is[idx],k:k});}
    var pts=[],dws=[],cum=[],R={no:def.no,color:def.color,pts:pts,dw:dws,cum:cum,ids:def.ids};
    function push(x,z){var l=pts[pts.length-1];if(l&&Math.abs(l.x-x)<1e-6&&Math.abs(l.z-z)<1e-6)return;pts.push({x:x,z:z});}
    visits.forEach(function(v,k){
      var d=v.d,pv=visits[(k-1+V)%V].d,nx=visits[(k+1)%V].d;
      var eA=Math.atan2(pv.z-d.z,pv.x-d.x),xA=Math.atan2(nx.z-d.z,nx.x-d.x),dl=wrap(xA-eA);
      if(Math.abs(dl)<.01)dl=-Math.PI*2;else if(dl>Math.PI-.01)dl=-Math.PI;
      var sg=dl<0?-1:1,steps=Math.max(2,Math.ceil(Math.abs(dl)/STEP)),j,a;
      push(d.x+Math.cos(eA)*P.GATE,d.z+Math.sin(eA)*P.GATE);
      var dwI=Math.min(3,steps-1);
      for(j=0;j<=steps;j++){a=eA+dl*j/steps;push(d.x+Math.cos(a)*RING,d.z+Math.sin(a)*RING);
        if(j===dwI){dws.push({pi:pts.length-1,island:d,ang:a,k:k,idx:null});}}
      push(d.x+Math.cos(xA)*P.GATE,d.z+Math.sin(xA)*P.GATE);
    });
    // 路徑是封閉的：最後一個點會接回第一個點
    var s=0,i;cum.push(0);
    for(i=1;i<=pts.length;i++){var a2=pts[i-1],b2=pts[i%pts.length];s+=Math.hypot(b2.x-a2.x,b2.z-a2.z);cum.push(s);}
    R.L=s;
    dws.forEach(function(w){w.s=cum[w.pi];});
    var t=0,prev=0;
    dws.forEach(function(w){t+=(w.s-prev)/BUSV;w.t0=t;t+=DWELL;prev=w.s;});
    R.Tc=t+(R.L-prev)/BUSV;
    // 站牌文字
    dws.forEach(function(w,i){
      var dest=w.k<n-1?is[n-1]:is[0];
      w.dest=dest;w.next=dws[(i+1)%dws.length].island;
      w.key=def.no+':'+w.island.id+':'+w.k;
    });
    return R;
  }
  function pathAt(R,s,off){
    var L=R.L;s=((s%L)+L)%L;var lo=0,hi=R.cum.length-1;
    while(hi-lo>1){var mid=(lo+hi)>>1;if(R.cum[mid]<=s)lo=mid;else hi=mid;}
    var a=R.pts[lo%R.pts.length],b=R.pts[(lo+1)%R.pts.length],len=R.cum[lo+1]-R.cum[lo],u=len>0?(s-R.cum[lo])/len:0;
    var tx=len>0?(b.x-a.x)/len:0,tz=len>0?(b.z-a.z)/len:1;
    var x=a.x+(b.x-a.x)*u,z=a.z+(b.z-a.z)*u;
    return {x:x-tz*off,z:z+tx*off,tx:tx,tz:tz};
  }
  function routeAt(R,tau){
    var acc=0,prev=0,i,w,seg;
    for(i=0;i<R.dw.length;i++){w=R.dw[i];seg=(w.s-prev)/BUSV;
      if(tau<acc+seg)return {s:prev+(tau-acc)*BUSV,dw:-1};
      acc+=seg;if(tau<acc+DWELL)return {s:w.s,dw:i};
      acc+=DWELL;prev=w.s;}
    return {s:Math.min(R.L,prev+(tau-acc)*BUSV),dw:-1};
  }

  /* ---------- 設定：算出座標與路線（在建立島嶼前呼叫） ---------- */
  C.setup=function(o){
    P.S=o.S;P.RT=o.RT;P.GATE=o.RT*SQ3/2-.5;P.data=o.data;
    var byId={};o.data.forEach(function(d){byId[d.id]=d;});
    C.routes=[];C.stops=[];C.buses=[];C.byId=byId;
    DEFS.forEach(function(def){
      var R=buildRoute(def,byId);if(!R)return;C.routes.push(R);
      R.dw.forEach(function(w,i){
        var ctr=w.island,pa=pathAt(R,w.s,LANE),sx=ctr.x+Math.cos(w.ang)*7.0,sz=ctr.z+Math.sin(w.ang)*7.0;
        C.stops.push({key:w.key,route:R,dwi:i,island:ctr,x:sx,z:sz,bx:pa.x,bz:pa.z,dest:w.dest,next:w.next,
          label:[R.no+' 公車','往 '+w.dest.name]});
      });
    });
  };

  /* ---------- 遊樂設施：摩天輪、大怒神（時間同步，所有同學看到的角度一致） ---------- */
  var CMY=[0x00A9E0,0xE6007E,0xFFD400,0xFFFFFF];
  function legs(B,H,span,zs,col,w){
    [-1,1].forEach(function(xs){var dx=xs*span,len=Math.hypot(dx,H-.2);
      B.add(new T.BoxGeometry(w,len,w),col,dx/2,(H+.2)/2,zs,0,0,xs*Math.atan2(span,H-.2));});
  }
  function makeFerris(){
    var R=4.6,H=6.6,N=10,W=2*Math.PI/.28,g=new T.Group(),B=new Baker(),i,k;
    bx(B,9.4,.25,3.8,0x89949B,0,.12,0);
    [-1,1].forEach(function(zs){legs(B,H,3.0,zs*1.25,0xE8EDF0,.3);});
    B.add(new T.CylinderGeometry(.38,.38,3.2,12),0xFFD400,0,H,0,Math.PI/2,0,0);
    bx(B,.2,2.4,.2,0xE6007E,-1.1,1.2,3.0);bx(B,.2,2.4,.2,0xE6007E,1.1,1.2,3.0);bx(B,2.6,.4,.2,0xFFD400,0,2.5,3.0);
    g.add(B.mesh(matVC,true));
    var wh=new T.Group();wh.position.set(0,H,0);g.add(wh);
    var WB=new Baker();
    [-1,1].forEach(function(zs,zi){var z=zs*.8,c=zi?0xE6007E:0x00A9E0;
      WB.add(new T.TorusGeometry(R,.13,6,44),c,0,0,z);
      for(k=0;k<12;k++){var a=k*Math.PI/6;WB.add(new T.BoxGeometry(R,.08,.08),0xE8EDF0,Math.cos(a)*R/2,Math.sin(a)*R/2,z,0,0,a);}
      for(k=0;k<24;k++){var b=k*Math.PI/12;WB.add(new T.SphereGeometry(.1,6,5),0xFFF2B0,Math.cos(b)*R,Math.sin(b)*R,z);}
    });
    wh.add(WB.mesh(matVC,true));
    var gons=[];
    for(i=0;i<N;i++){var a2=i*2*Math.PI/N,gp=new T.Group();gp.position.set(Math.cos(a2)*R,Math.sin(a2)*R,0);
      var CB=new Baker(),col=CMY[i%4];
      bx(CB,.1,.1,1.7,0xE8EDF0,0,0,0);cy(CB,.04,.04,.9,0x6E7B85,.5,-.45,0,5);cy(CB,.04,.04,.9,0x6E7B85,-.5,-.45,0,5);
      bx(CB,1.4,.1,1.5,col,0,-1.4,0);bx(CB,1.4,.5,.1,col,0,-1.1,-.7);bx(CB,.1,.5,1.5,col,.65,-1.1,0);bx(CB,.1,.5,1.5,col,-.65,-1.1,0);
      bx(CB,1.6,.1,1.7,col,0,-.45,0);
      gp.add(CB.mesh(matVC,true));wh.add(gp);gons.push(gp);}
    var o={kind:'ferris',group:g,gate:[0,3.6],dur:W,
      ang:function(t){return (t*.28)%(Math.PI*2);},
      update:function(t){var a=o.ang(t);wh.rotation.z=a;gons.forEach(function(gp){gp.rotation.z=-a;});},
      pick:function(t){var a=o.ang(t),best=0,bd=9,j;for(j=0;j<N;j++){var d=Math.abs(wrap(j*2*Math.PI/N+a+Math.PI/2));if(d<bd){bd=d;best=j;}}return best;},
      seat:function(t,idx){var a=idx*2*Math.PI/N+o.ang(t);return {x:Math.cos(a)*R,y:H+Math.sin(a)*R-1.35,z:0};},
      say:function(t,riding){return riding?'🎡 高空看浮洲島！':'🎡 坐摩天輪（繞一圈約 '+Math.round(W)+' 秒）';},
      canBoard:function(){return true;}};
    return o;
  }
  var SW_CYC=40,SW_LOAD=6,SW_END=30;
  function swTheta(t){
    var ph=((t%SW_CYC)+SW_CYC)%SW_CYC;if(ph<SW_LOAD||ph>=SW_END)return 0;
    var u=ph-SW_LOAD,env=Math.min(1,u/6)*Math.min(1,(24-u)/5);return env*1.15*Math.sin(2*Math.PI*u/4.2);
  }
  function makeSwing(){
    var H=6.8,L=5.6,g=new T.Group(),B=new Baker();
    bx(B,11,.25,5.4,0x89949B,0,.12,0);
    [-1,1].forEach(function(zs){legs(B,H,3.0,zs*2.3,0xC0392B,.34);});
    B.add(new T.CylinderGeometry(.3,.3,5.4,12),0xFFD400,0,H,0,Math.PI/2,0,0);
    bx(B,.2,2.4,.2,0xE6007E,-1.1,1.2,3.4);bx(B,.2,2.4,.2,0xE6007E,1.1,1.2,3.4);bx(B,2.6,.4,.2,0x23282D,0,2.5,3.4);
    g.add(B.mesh(matVC,true));
    var ship=new T.Group();ship.position.set(0,H,0);g.add(ship);
    var SB=new Baker();
    [-1,1].forEach(function(zs){bx(SB,.16,L,.16,0x6E7B85,0,-L/2,zs*1.35);bx(SB,6.8,.7,.16,0xC0392B,0,-L+.55,zs*1.25);});
    bx(SB,6.2,.4,2.6,0x8A5A33,0,-L,0);
    [-1,1].forEach(function(xs){SB.add(new T.BoxGeometry(1.6,.5,2.6),0x8A5A33,xs*3.3,-L+.4,0,0,0,xs*-.5);bx(SB,.2,.9,2.6,0xC0392B,xs*3.7,-L+.9,0);});
    [-1.9,0,1.9].forEach(function(x){bx(SB,.8,.1,.8,0xE8EDF0,x,-L+.4,0);});
    cy(SB,.08,.08,2.4,0x23282D,0,-L+1.5,0,6);bx(SB,1.0,.7,.06,0x23282D,.5,-L+2.4,0);bx(SB,.3,.3,.07,0xFFFFFF,.5,-L+2.4,0);
    ship.add(SB.mesh(matVC,true));
    var o={kind:'swing',group:g,gate:[0,4.4],dur:SW_END-SW_LOAD,
      update:function(t){ship.rotation.z=swTheta(t);},
      phase:function(t){return ((t%SW_CYC)+SW_CYC)%SW_CYC;},
      canBoard:function(t){return o.phase(t)<SW_LOAD;},
      pick:function(){return Math.floor(Math.random()*5);},
      seat:function(t,idx){var th=swTheta(t),xs=(idx-2)*1.0,d=L-.45;return {x:xs*Math.cos(th)+d*Math.sin(th),y:H+xs*Math.sin(th)-d*Math.cos(th),z:0};},
      say:function(t,riding){if(riding)return '🏴‍☠️ 抓緊囉！大怒神！';var ph=o.phase(t);
        return ph<SW_LOAD?'🏴‍☠️ 坐大怒神（約 '+Math.max(1,Math.ceil(SW_LOAD-ph))+' 秒後發車）':'⏳ 大怒神運轉中・約 '+Math.ceil(SW_CYC-ph)+' 秒後可搭';}};
    return o;
  }
  C.rides=[];
  C.addRide=function(kind,d,float){
    if(!matVC)matVC=new T.MeshLambertMaterial({vertexColors:true});
    var o=kind==='ferris'?makeFerris():makeSwing();o.island=d;float.add(o.group);C.rides.push(o);o.update(Date.now()/1000);return o;
  };
  C.stationAt=function(d){return {x:d.x+ST.x,z:d.z+ST.z};};
  C.stationLocal=ST;

  /* ---------- 每座島：環島道路、小物件、站牌、YouBike 站 ---------- */
  C.decorate=function(d,i,float,opts){
    opts=opts||{};
    if(!matVC){matVC=new T.MeshLambertMaterial({vertexColors:true});matBulb=new T.MeshBasicMaterial({color:0xFFE9A0});}
    var B=new Baker(),L=new Baker(),r=rng(i*7+11),k,a;
    // 環島道路：一圈灰色柏油 + 白色邊線 + 黃色中線虛線
    B.add(new T.RingGeometry(ROAD_IN,ROAD_OUT,72),0x6E7B85,0,.04,0,-Math.PI/2,0,0);
    B.add(new T.RingGeometry(ROAD_IN,ROAD_IN+.14,72),0xF2F5F7,0,.06,0,-Math.PI/2,0,0);
    B.add(new T.RingGeometry(ROAD_OUT-.14,ROAD_OUT,72),0xF2F5F7,0,.06,0,-Math.PI/2,0,0);
    for(k=0;k<36;k++){a=k/36*Math.PI*2+.05;B.at(0,0,0,0,1);B.add(new T.BoxGeometry(.9,.02,.12),0xFFE36B,Math.cos(a)*RING,.06,Math.sin(a)*RING,0,-a-Math.PI/2,0);}
    B.reset();
    // 保留區（島嶼座標）：地標、島民、BOSS、租借站、同學站位
    var lmP=opts.lm||[-2.6,-1.8],npP=opts.npc||[2.8,2.6],res=[[lmP[0],lmP[1],3.9],[npP[0],npP[1],2.8],[ST.x,ST.z,3.4]];
    (opts.extra||[]).forEach(function(e){res.push(e);});
    if(opts.boss)res.push([-3.4,3.4,3.4]);
    (opts.slots||[]).forEach(function(s){res.push([s[0],s[1],.95]);});
    var placed=[];
    function free(x,z,gap){
      var j;for(j=0;j<res.length;j++)if(Math.hypot(x-res[j][0],z-res[j][1])<res[j][2]+gap*.4)return false;
      for(j=0;j<placed.length;j++)if(Math.hypot(x-placed[j][0],z-placed[j][1])<placed[j][2]+gap)return false;
      return true;}
    function put(name,r0,r1,gap,tries,ry,sc){
      for(var t=0;t<(tries||40);t++){
        var aa=r()*Math.PI*2,rr=r0+r()*(r1-r0),x=Math.cos(aa)*rr,z=Math.sin(aa)*rr;
        if(!free(x,z,gap))continue;
        placed.push([x,z,gap]);B.at(x,0,z,ry==null?r()*6.28:ry,sc||(.9+r()*.3));ITEM[name](B,r);B.reset();return true;}
      return false;}
    // 室內圈（r<7）：花圃、長椅、灌木、石頭、傘桌、書報亭、紙堆、CMYK 色柱、木箱、垃圾桶、告示牌
    var plan=[['flower',4],['bench',3],['bush',6],['rock',3],['umbrella',1],['kiosk',1],['paper',1],['cmyk',1],['crate',2],['bin',2],['sign',1],['tree',2],['pine',1]];
    plan.forEach(function(p){for(var n=0;n<p[1];n++)put(p[0],3.0,6.9,p[0]==='tree'||p[0]==='kiosk'||p[0]==='umbrella'?1.6:1.15,50);});
    // 道路外緣：六個角落的樹叢，以及橋頭兩側的灌木
    for(k=0;k<6;k++){a=Math.PI/2+k*Math.PI/3;
      var cnt=2+(r()<.5?1:0),m;
      for(m=0;m<cnt;m++){var aa2=a+(r()-.5)*.28,rr2=10.9+r()*.9,x2=Math.cos(aa2)*rr2,z2=Math.sin(aa2)*rr2;
        B.at(x2,0,z2,r()*6.28,.9+r()*.35);(r()<.4?ITEM.pine:ITEM.tree)(B,r);B.reset();}}
    for(k=0;k<6;k++){a=k*Math.PI/3;[-1,1].forEach(function(sg){var aa3=a+sg*.3,x3=Math.cos(aa3)*10.5,z3=Math.sin(aa3)*10.5;B.at(x3,0,z3,r()*6.28,.7+r()*.2);ITEM.bush(B,r);B.reset();});}
    // 路燈：沿道路內緣，避開站牌
    var signs=(opts.stops||[]).map(function(s){return [s.x-d.x,s.z-d.z];});
    for(k=0;k<12;k++){a=(k+.5)/12*Math.PI*2;var lx=Math.cos(a)*7.15,lz=Math.sin(a)*7.15;
      if(signs.some(function(q){return Math.hypot(q[0]-lx,q[1]-lz)<1.6;}))continue;
      if(Math.hypot(lx-ST.x,lz-ST.z)<2.4)continue;
      B.at(lx,0,lz,a,1);ITEM.lamp(B,L);B.reset();}
    // 公車站牌：柱子 + 路線色圓盤；看板另外用 Sprite
    var sprites=[];
    (opts.stops||[]).forEach(function(s){
      var lx=s.x-d.x,lz=s.z-d.z;
      cy(B,.06,.06,2.4,DK,lx,1.2,lz,6);cy(B,.5,.5,.1,s.route.color,lx,2.45,lz,16);
      bx(B,1.6,.12,1.0,0x89949B,lx,.06,lz);
      var sp2=textSprite(s.label,'#'+('000000'+s.route.color.toString(16)).slice(-6),'#fff',1.15);sp2.position.set(lx,3.7,lz);sprites.push(sp2);
    });
    // YouBike 站：底座、四台停放的單車、停車柱
    B.at(ST.x,0,ST.z,Math.atan2(-ST.x,-ST.z),1);
    bx(B,4.4,.1,1.9,0x89949B,0,.05,0);
    for(k=0;k<4;k++){bikeBody(B,0xF5C400,-1.5+k*1.0,.1,0,0);cy(B,.05,.05,.7,GY,-1.5+k*1.0,.45,.85,6);}
    cy(B,.09,.09,2.2,0x2E8B57,2.0,1.1,-.8,8);bx(B,.5,.5,.14,0x2E8B57,2.0,2.2,-.8);
    B.reset();
    var stSp=textSprite(['YouBike','🚲 租借站'],'#F5C400','#23282D',1.15);
    var wp=new T.Vector3(ST.x,3.7,ST.z);stSp.position.copy(wp);sprites.push(stSp);
    var m1=B.mesh(matVC,true),m2=L.mesh(matBulb,false);
    float.add(m1,m2);sprites.forEach(function(s){float.add(s);});
    return {road:m1};
  };

  /* ---------- 單車 ---------- */
  function bikeBody(B,col,x,y,z,ry){
    B.push(x,y,z,ry);
    B.add(new T.TorusGeometry(.42,.07,6,16),DK,0,.42,.62,0,Math.PI/2,0);B.add(new T.TorusGeometry(.42,.07,6,16),DK,0,.42,-.62,0,Math.PI/2,0);
    bx(B,.07,.07,1.05,col,0,.62,0);B.add(new T.BoxGeometry(.07,.07,.7),col,0,.62,.28,-.5,0,0);
    bx(B,.07,.5,.07,col,0,.75,-.3);bx(B,.2,.06,.34,DK,0,1.02,-.3);
    bx(B,.07,.6,.07,col,0,.75,.55);bx(B,.6,.06,.07,DK,0,1.05,.55);bx(B,.34,.22,.28,0x3F8F6A,0,.85,.78);
    B.pop();
  }
  C.makeBike=function(){
    var g=new T.Group(),B=new Baker();
    bx(B,.07,.07,1.05,0xF5C400,0,.62,0);B.add(new T.BoxGeometry(.07,.07,.7),0xF5C400,0,.62,.28,-.5,0,0);
    bx(B,.07,.5,.07,0xF5C400,0,.75,-.3);bx(B,.2,.06,.34,DK,0,1.02,-.3);
    bx(B,.07,.6,.07,0xF5C400,0,.75,.55);bx(B,.6,.06,.07,DK,0,1.05,.55);bx(B,.34,.22,.28,0x3F8F6A,0,.85,.78);
    if(!matVC)matVC=new T.MeshLambertMaterial({vertexColors:true});
    g.add(B.mesh(matVC,true));
    g.userData.wheels=[.62,-.62].map(function(z){
      var w=new T.Group();w.position.set(0,.42,z);
      var tire=new T.Mesh(new T.TorusGeometry(.42,.07,6,16),new T.MeshLambertMaterial({color:DK}));tire.rotation.y=Math.PI/2;w.add(tire);
      var sp1=new T.Mesh(new T.BoxGeometry(.04,.8,.04),new T.MeshLambertMaterial({color:0xDDDDDD})),sp2=sp1.clone();sp2.rotation.x=Math.PI/2;w.add(sp1,sp2);
      g.add(w);return w;});
    return g;
  };

  /* ---------- 公車 ---------- */
  function makeBus(R){
    var B=new Baker(),c=R.color,g=new T.Group(),k;
    bx(B,2.5,.22,6.4,DK,0,.3,0);
    [-1,1].forEach(function(s){bx(B,.12,.9,6.4,c,s*1.19,.85,0);});
    bx(B,2.5,.9,.12,c,0,.85,3.14);bx(B,2.5,.9,.12,c,0,.85,-3.14);
    [-1,1].forEach(function(s){[-2.9,0,2.9].forEach(function(z){bx(B,.12,1.25,.12,0xE8EDF0,s*1.19,1.9,z);});});
    bx(B,2.7,.14,6.7,0xFFFFFF,0,2.58,0);bx(B,2.72,.15,1.1,c,0,2.6,2.7);
    [-1,1].forEach(function(s){[-2.1,2.1].forEach(function(z){B.add(new T.CylinderGeometry(.46,.46,.3,12),0x1F2428,s*1.2,.46,z,0,0,Math.PI/2);});});
    sp(B,.18,0xFFF2B0,.8,.8,3.22);sp(B,.18,0xFFF2B0,-.8,.8,3.22);sp(B,.16,0xE02020,.8,.8,-3.22);sp(B,.16,0xE02020,-.8,.8,-3.22);
    // 座椅
    for(k=0;k<4;k++){bx(B,.8,.12,.5,0xE8EDF0,-.62,.55,-2+k*1.25);bx(B,.8,.12,.5,0xE8EDF0,.62,.55,-2+k*1.25);}
    if(!matVC)matVC=new T.MeshLambertMaterial({vertexColors:true});
    g.add(B.mesh(matVC,true));
    var gl=new T.Mesh(new T.BoxGeometry(2.3,1.15,6.2),new T.MeshLambertMaterial({color:0xBFE7F5,transparent:true,opacity:.26,depthWrite:false}));gl.position.y=1.9;g.add(gl);
    var tx=numTex(R.no,R.color),pm=new T.MeshBasicMaterial({map:tx});
    [[1.27,0,Math.PI/2],[-1.27,0,-Math.PI/2]].forEach(function(p){var m=new T.Mesh(new T.PlaneGeometry(1.7,.85),pm);m.position.set(p[0],.85,p[1]);m.rotation.y=p[2];g.add(m);});
    var fr=new T.Mesh(new T.PlaneGeometry(1.7,.5),pm);fr.position.set(0,2.3,3.38);g.add(fr);
    var bk=new T.Mesh(new T.PlaneGeometry(1.7,.5),pm);bk.position.set(0,2.3,-3.38);bk.rotation.y=Math.PI;g.add(bk);
    return g;
  }
  C.addBuses=function(scene){
    C.routes.forEach(function(R){
      [0,.5].forEach(function(f,bi){
        var g=makeBus(R);scene.add(g);
        C.buses.push({route:R,g:g,off:f*R.Tc,x:0,z:0,hd:0,state:{dw:-1,cyc:0},init:false});
      });
    });
  };
  C.update=function(nowS,dt){
    C.rides.forEach(function(r){r.update(nowS);});
    C.buses.forEach(function(b){
      var R=b.route,raw=nowS+b.off,tau=((raw%R.Tc)+R.Tc)%R.Tc,st=routeAt(R,tau),p=pathAt(R,st.s,LANE);
      var want=Math.atan2(p.tx,p.tz);
      if(!b.init){b.hd=want;b.init=true;}
      else{var dd=wrap(want-b.hd);b.hd+=dd*Math.min(1,(dt||.016)*6);}
      b.x=p.x;b.z=p.z;b.g.position.set(p.x,0,p.z);b.g.rotation.y=b.hd;
      b.state.dw=st.dw;b.state.cyc=Math.floor(raw/R.Tc);
    });
  };
  C.busNear=function(x,z){for(var i=0;i<C.buses.length;i++){var b=C.buses[i];if(Math.hypot(b.x-x,b.z-z)<3.3)return true;}return false;};
  C.busAt=function(stop){
    for(var i=0;i<C.buses.length;i++){var b=C.buses[i];if(b.route===stop.route&&b.state.dw===stop.dwi)return b;}
    return null;
  };
  C.eta=function(stop,nowS){
    var R=stop.route,best=1e9;
    C.buses.forEach(function(b){if(b.route!==R)return;
      var tau=(((nowS+b.off)%R.Tc)+R.Tc)%R.Tc,st=routeAt(R,tau);
      var d=st.dw===stop.dwi?0:((R.dw[stop.dwi].t0-tau)%R.Tc+R.Tc)%R.Tc;if(d<best)best=d;});
    return best;
  };
  C.nextStop=function(stop){var R=stop.route,w=R.dw[(stop.dwi+1)%R.dw.length];return {island:w.island,stop:C.stopOf(R,(stop.dwi+1)%R.dw.length)};};
  C.stopOf=function(R,i){for(var k=0;k<C.stops.length;k++)if(C.stops[k].route===R&&C.stops[k].dwi===i)return C.stops[k];return null;};
  window.City=C;
})();
