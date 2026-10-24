/* 臺藝圖文浮洲島：生命感——哥吉拉、快艇、會動的地標、貓狗、島民閒晃 */
(function(){
  var T=THREE, LF={}, K=City.kit, Baker=K.Baker, bx=K.bx, cy=K.cy, sp=K.sp, co=K.co, SQ3=Math.sqrt(3);
  var PI=Math.PI, TAU=PI*2;
  function glow(m,hex,k){if(m.material&&m.material.emissive){m.material.emissive.setHex(hex);m.material.emissiveIntensity=k;}}
  function glowTex(){
    var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d');
    var gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr;g.fillRect(0,0,128,128);return new T.CanvasTexture(c);
  }
  var GT=null;function gSprite(color,sc){
    if(!GT)GT=glowTex();
    var s=new T.Sprite(new T.SpriteMaterial({map:GT,color:color,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0}));s.scale.set(sc,sc,1);return s;
  }
  function bm(c,o){return new T.MeshBasicMaterial(Object.assign({color:c},o||{}));}
  function lam(c){return new T.MeshLambertMaterial({color:c});}

  /* ================= 會動的地標 ================= */
  LF.landmark=function(lm,key){
    var kids=lm.children,tick=function(){},poke=null;
    function add(m){lm.add(m);return m;}
    if(key==='lightbox'){
      tick=function(t){for(var i=1;i<=4;i++){var s=1+.55*Math.max(0,Math.sin(t*2.4-i*.9));kids[i].scale.y=s;kids[i].position.y=.5+.125*s;glow(kids[i],[0x00A9E0,0xE6007E,0xFFD400,0x888888][i-1],.5*Math.max(0,Math.sin(t*2.4-i*.9)));}};
    }else if(key==='press'){
      var sheets=[0,1,2].map(function(i){var m=new T.Mesh(new T.BoxGeometry(1.2,.04,1.4),lam(0xFFFFFF));m.userData.i=i;return add(m);});
      tick=function(t,dt){for(var i=2;i<=4;i++)kids[i].rotation.y+=dt*(i%2?4:-4);
        kids[1].position.y=1.35+.012*Math.sin(t*38);
        sheets.forEach(function(m){var u=((t*.35)+m.userData.i/3)%1;m.position.set(-2.3+4.6*u,1.02+.04*Math.sin(u*PI),0);m.visible=true;});};
    }else if(key==='screen'){
      var sq=kids[kids.length-1];
      tick=function(t){sq.position.x=Math.sin(t*1.5)*1.05;sq.position.z=.3;sq.rotation.z=.3*Math.sin(t*1.5+1);kids[4].material.opacity=.55+.15*Math.sin(t*1.5);};
    }else if(key==='printer'){
      var sh=add(new T.Mesh(new T.BoxGeometry(1.4,.03,1.0),lam(0xFFFFFF)));
      tick=function(t){var u=(t%2.4)/2.4,e=Math.min(1,u*1.6);sh.position.set(0,.55-.12*e,.9+.55*e);sh.scale.z=.3+.7*e;sh.visible=u<.9;
        kids[0].position.y=.65+.012*Math.sin(t*30);glow(kids[4],0xE6007E,.4+.6*(Math.sin(t*6)>0?1:0));};
    }else if(key==='cutter'){
      var bl=add(new T.Mesh(new T.BoxGeometry(2.8,.14,.35),lam(0xCCD5DA)));
      tick=function(t){var u=(t%3)/3,y=u<.72?2.7-.1*Math.sin(u*9):(u<.8?2.7-(u-.72)/.08*.85:1.85+(u-.8)/.2*.85);bl.position.set(0,y,0);
        kids[3].position.y=2.1+.12*Math.sin(t*3);kids[0].position.y=.8-(u>.72&&u<.82?.02:0);};
    }else if(key==='computer'){
      tick=function(t){var m=kids[1].material;m.color.setHSL((t*.06)%1,.55,.22+.1*Math.sin(t*3));glow(kids[1],0x1A6A8A,.4+.3*Math.sin(t*7));};
    }else if(key==='camera'){
      var fl=add(gSprite(0xFFFFFF,5));fl.position.set(0,1.1,1.6);
      var fl2=add(gSprite(0xFFF1B8,9));fl2.position.set(0,1.1,1.6);
      tick=function(t){var u=(t%3.2)/3.2,f=u<.1?1-u/.1:0;fl.material.opacity=f;fl2.material.opacity=f*.7;fl.scale.setScalar(5+f*4);
        glow(kids[4],0xFFD400,f>0?1:.1);kids[2].rotation.z+=.0;};
    }else if(key==='phone'){
      var hs=[0,1,2].map(function(i){var m=new T.Mesh(new T.SphereGeometry(.14,8,6),new T.MeshBasicMaterial({color:[0xE6007E,0xFFD400,0x00A9E0][i],transparent:true}));m.userData.i=i;return add(m);});
      tick=function(t){kids[1].material.color.setHSL(.58+.08*Math.sin(t*1.7),.6,.22+.08*Math.sin(t*5));
        hs.forEach(function(m){var u=((t*.5)+m.userData.i/3)%1;m.position.set((m.userData.i-1)*.35,1.7+u*2.2,.4);m.material.opacity=1-u;m.scale.setScalar(.6+u);});};
    }else if(key==='chat'){
      tick=function(t){kids[0].position.y=1.7+.14*Math.sin(t*2);kids[2].position.y=.9-.14*Math.sin(t*2);kids[0].position.x=-.8+.05*Math.sin(t*1.3);
        for(var i=4;i<=6;i++){var s=1+.9*Math.max(0,Math.sin(t*5-(i-4)*1.1));kids[i].scale.setScalar(s);}};
    }else if(key==='book'){
      tick=function(t){var o=.2+.32*(.5+.5*Math.sin(t*1.3));kids[1].rotation.z=o;kids[2].rotation.z=-o;kids[1].position.y=kids[2].position.y=.55+.1*o;kids[4].position.y=.7+.05*Math.sin(t*4);kids[4].rotation.z=.2*Math.sin(t*3);};
    }else if(key==='chart'){
      var base=[1.2,2.1,3.0],cur=[1.2,2.1,3.0],tg=[1.2,2.1,3.0],nextT=0;
      function retarget(big){for(var i=0;i<3;i++)tg[i]=big?.4+Math.random()*3.6:.6+Math.random()*3.2;}
      poke=function(){retarget(true);nextT=-1;};
      tick=function(t,dt,pd){
        if(t>nextT){retarget(pd<10);nextT=t+(pd<10?1.1:2.6);}
        for(var i=0;i<3;i++){cur[i]+=(tg[i]-cur[i])*Math.min(1,dt*(pd<10?5:2.2));var b=kids[i+1],h=cur[i];b.scale.y=h/base[i];b.position.y=.2+h/2;glow(b,[0x00A9E0,0xE6007E,0xFFD400][i],Math.max(0,(h-1.8)/6));}
        kids[4].position.y=.2+cur[2]+.3+.12*Math.sin(t*4);};
    }else if(key==='briefcase'){
      tick=function(t){kids[3].rotation.y+=0;kids[3].position.y=.7+.18*Math.abs(Math.sin(t*3));kids[3].rotation.y=t*3;kids[1].rotation.x=.08*Math.sin(t*2);glow(kids[2],0xFFD400,.3+.3*Math.sin(t*5));};
    }else if(key==='lighthouse'){
      var pv=new T.Group();pv.position.y=3.65;lm.add(pv);
      var beam=new T.Mesh(new T.CylinderGeometry(.2,2.4,15,14,1,true),new T.MeshBasicMaterial({color:0xFFF4C2,transparent:true,opacity:.3,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
      beam.rotation.x=PI/2;beam.position.z=7.5;pv.add(beam);
      var beam2=beam.clone();beam2.position.z=-7.5;beam2.rotation.x=-PI/2;pv.add(beam2);
      tick=function(t,dt){pv.rotation.y+=dt*1.3;glow(kids[2],0xFFE9A0,.6+.4*Math.sin(t*6));};
    }else if(key==='flag'){
      tick=function(t){var f=kids[1];f.rotation.y=.28*Math.sin(t*3.2);f.scale.x=1+.08*Math.sin(t*6);f.position.y=3.2+.04*Math.sin(t*4);kids[2].rotation.y=0;kids[3].position.y=.4+.05*Math.abs(Math.sin(t*3));};
    }else if(key==='frame'){
      var st2=[[1.6,2.9,.2],[-1.7,1.3,.2],[1.2,.9,.3],[-1.1,3.1,.2]].map(function(p,i){var s=gSprite(0xFFF1B8,1.2);s.position.set(p[0],p[1],p[2]+.2);s.userData.i=i;return add(s);});
      tick=function(t){kids[4].scale.setScalar(1+.2*Math.sin(t*4));kids[4].rotation.y=t*1.5;kids[5].position.y=2.5+.18*Math.abs(Math.sin(t*3));
        kids[3].material.color.setHSL(.5+.05*Math.sin(t*1.5),.7,.78+.05*Math.sin(t*3));
        st2.forEach(function(s){var u=Math.max(0,Math.sin(t*2.2+s.userData.i*1.7));s.material.opacity=u;s.scale.setScalar(.4+u*1.1);});};
    }
    return {tick:tick,poke:poke};
  };

  /* ================= 島民閒晃：伸懶腰、跳、轉圈、搖擺、小步走，不出島 ================= */
  LF.npc=function(o,t,dt){
    var g=o.char,b=g.userData.body,I=o.idle;
    if(!I){I=o.idle={mode:'none',t0:0,next:t+1+Math.random()*4,tx:o.npc[0],tz:o.npc[1],ry:g.rotation.y};}
    b.rotation.x=0;b.rotation.z=0;b.scale.set(1,1,1);b.position.y=Math.abs(Math.sin(t*2.2+o.phase))*.12;
    if(I.mode==='none'&&t>I.next){
      var r=Math.random();I.t0=t;
      I.mode=r<.28?'hop':r<.5?'stretch':r<.62?'spin':r<.78?'wiggle':'walk';
      if(I.mode==='walk'){var a=Math.random()*TAU,rr=1+Math.random()*2.2;I.tx=o.npc[0]+Math.cos(a)*rr;I.tz=o.npc[1]+Math.sin(a)*rr;}
    }
    var u=t-I.t0;
    if(I.mode==='hop'){var d=1.3;if(u>d)I.mode='none',I.next=t+3+Math.random()*6;else b.position.y+=Math.abs(Math.sin(u/d*PI*2))*.95;}
    else if(I.mode==='stretch'){var d2=2;if(u>d2)I.mode='none',I.next=t+3+Math.random()*6;else{var s=Math.sin(u/d2*PI);b.scale.y=1+.2*s;b.scale.x=b.scale.z=1-.06*s;b.rotation.x=-.3*s;}}
    else if(I.mode==='spin'){var d3=1.3;if(u>d3)I.mode='none',I.next=t+3+Math.random()*6;else{g.rotation.y+=dt*TAU/d3;b.position.y+=Math.abs(Math.sin(u/d3*PI))*.5;}}
    else if(I.mode==='wiggle'){var d4=1.6;if(u>d4)I.mode='none',I.next=t+3+Math.random()*6;else b.rotation.z=.3*Math.sin(u*14)*(1-u/d4);}
    else if(I.mode==='walk'){
      var p=g.position,dx=I.tx-p.x,dz=I.tz-p.z,dd=Math.hypot(dx,dz);
      if(dd<.12||u>6){I.mode='none';I.next=t+2+Math.random()*5;}
      else{var v=1.7*dt,nx=p.x+dx/dd*v,nz=p.z+dz/dd*v;if(Math.hypot(nx,nz)<7){p.x=nx;p.z=nz;}
        var ty=Math.atan2(dx,dz),da=ty-g.rotation.y;while(da>PI)da-=TAU;while(da<-PI)da+=TAU;g.rotation.y+=da*Math.min(1,dt*8);
        b.position.y+=Math.abs(Math.sin(u*11))*.16;}
    }
  };

  /* ================= 貓狗（沿環島道路散步、偶爾坐下） ================= */
  function petGeo(kind,col,col2){
    var B=new Baker();
    if(kind==='dog'){
      bx(B,.55,.45,1.0,col,0,.6,0);sp(B,.3,col,0,.95,.62);bx(B,.24,.17,.26,col2,0,.87,.9);sp(B,.06,0x23282D,0,.93,1.03);
      bx(B,.1,.28,.14,col2,-.2,.95,.55);bx(B,.1,.28,.14,col2,.2,.95,.55);
      [[-.18,.4],[.18,.4],[-.18,-.4],[.18,-.4]].forEach(function(p){bx(B,.13,.4,.13,col2,p[0],.2,p[1]);});
      sp(B,.045,0x23282D,-.1,1.03,.82);sp(B,.045,0x23282D,.1,1.03,.82);
    }else{
      bx(B,.4,.34,.8,col,0,.5,0);sp(B,.25,col,0,.78,.5);
      B.add(new T.ConeGeometry(.1,.2,4),col,-.14,1.04,.5);B.add(new T.ConeGeometry(.1,.2,4),col,.14,1.04,.5);
      sp(B,.04,0x23282D,-.09,.8,.72);sp(B,.04,0x23282D,.09,.8,.72);sp(B,.035,0xFF9FC6,0,.74,.74);
      [[-.14,.28],[.14,.28],[-.14,-.28],[.14,-.28]].forEach(function(p){bx(B,.1,.32,.1,col2,p[0],.16,p[1]);});
    }
    return B.mesh(K.vc(),false).geometry;
  }
  var PET={dogs:[[0xC8925A,0x8A5A33],[0xF2E7D0,0xD9C7A0],[0x6B4A2E,0x3E2A18]],cats:[[0xE08A3C,0xC26F28],[0x8E9AA3,0x6E7B85],[0x2B2F33,0x1B1F22]]};
  LF.pets=function(islands){
    var mats={},geos={};
    function gm(kind,i){var k=kind+i;if(!geos[k]){var c=PET[kind+'s'][i];geos[k]=petGeo(kind,c[0],c[1]);}return geos[k];}
    var out=[];
    islands.forEach(function(o,idx){
      ['dog','cat'].forEach(function(kind,j){
        var ci=(idx+j*2)%3,g=new T.Group(),body=new T.Mesh(gm(kind,ci),K.vc());body.castShadow=false;g.add(body);
        var tailCol=PET[kind+'s'][ci][1],tl=new T.Mesh(new T.BoxGeometry(.08,.08,kind==='dog'?.45:.6),lam(tailCol));
        tl.position.set(0,kind==='dog'?.78:.62,kind==='dog'?-.62:-.5);tl.rotation.x=kind==='dog'?.6:-.5;g.add(tl);
        g.scale.setScalar(kind==='dog'?1.35:1.2);
        o.float.add(g);
        out.push({g:g,body:body,tail:tl,o:o,kind:kind,R:kind==='dog'?9.45:8.35,a0:idx*1.31+j*3.1,dir:(idx+j)%2?1:-1,v:(kind==='dog'?2.2:1.6),ph:idx*.7+j});
      });
    });
    LF._pets=out;
  };
  function petTick(t){
    (LF._pets||[]).forEach(function(p){
      var cyc=24,walk=16,n=Math.floor(t/cyc),r=t%cyc,wt=n*walk+Math.min(r,walk),sit=r>=walk;
      var a=p.a0+p.dir*p.v*wt/p.R;
      p.g.position.set(Math.cos(a)*p.R,0,Math.sin(a)*p.R);
      var hx=-Math.sin(a)*p.dir,hz=Math.cos(a)*p.dir;p.g.rotation.y=Math.atan2(hx,hz);
      p.body.position.y=sit?-.04:Math.abs(Math.sin(t*9+p.ph))*.05;
      p.body.rotation.x=sit?-.25:0;p.body.scale.y=sit?.88:1;
      p.tail.rotation.y=Math.sin(t*(sit?5:12)+p.ph)*.55;
      p.tail.position.y=(p.kind==='dog'?.78:.62)+(sit?-.1:0);
    });
  }

  /* ================= 快艇 ================= */
  function boatModel(){
    var B=new Baker(),g=new T.Group();
    bx(B,2.6,.9,6.2,0xF2F5F7,0,.1,-.4);B.add(new T.ConeGeometry(1.3,2.6,4),0xF2F5F7,0,.1,3.9,PI/2,PI/4,0,1,1,.35);
    bx(B,2.7,.18,6.2,0xE6007E,0,.5,-.4);bx(B,2.0,.16,5.2,0x23323C,0,.62,-.6);
    bx(B,2.0,.7,.14,0x00A9E0,0,1.0,.9);bx(B,.14,.7,1.2,0x00A9E0,-.95,.95,.35);bx(B,.14,.7,1.2,0x00A9E0,.95,.95,.35);
    bx(B,1.7,.5,.9,0x3A444C,0,.95,-2.0);bx(B,.5,.8,.9,0x23282D,0,.85,-3.6);cy(B,.12,.12,.6,0x23282D,0,.2,-3.9,6);
    sp(B,.14,0xFFF2B0,0,.95,3.0);
    g.add(B.mesh(K.vc(),false));
    var wake=new T.Mesh(new T.PlaneGeometry(4.5,12),bm(0xFFFFFF,{transparent:true,opacity:.4,depthWrite:false}));wake.rotation.x=-PI/2;wake.position.set(0,.02,-8);g.add(wake);g.userData.wake=wake;
    return g;
  }
  LF.makeBoat=boatModel;
  var DOCK={ang:2.094,r0:10.2,len:15};
  LF.dock=function(d,float,st){
    var B=new Baker(),dx=Math.cos(DOCK.ang),dz=Math.sin(DOCK.ang),ry=Math.atan2(dx,dz),mid=DOCK.r0+DOCK.len/2;
    B.at(dx*mid,-.12,dz*mid,ry,1);
    bx(B,3.6,.3,DOCK.len,0xC79A5E,0,0,0);
    for(var i=0;i<5;i++){bx(B,.35,5,.35,0x6B4423,-1.6,-2.4,-DOCK.len/2+i*(DOCK.len/4));bx(B,.35,5,.35,0x6B4423,1.6,-2.4,-DOCK.len/2+i*(DOCK.len/4));}
    bx(B,.12,1,DOCK.len,0x8A5A33,-1.75,.7,0);bx(B,.12,1,DOCK.len,0x8A5A33,1.75,.7,0);
    cy(B,.1,.1,3.2,0x3A444C,-1.5,1.7,DOCK.len/2-.4,6);cy(B,.1,.1,3.2,0x3A444C,1.5,1.7,DOCK.len/2-.4,6);
    B.reset();
    var m=B.mesh(K.vc(),true);float.add(m);
    var ex=dx*(DOCK.r0+DOCK.len),ez=dz*(DOCK.r0+DOCK.len);
    var nx=-dz,nz=dx;
    var parked=boatModel();parked.position.set(ex+nx*4.2-dx*3,-3.95,ez+nz*4.2-dz*3);parked.rotation.y=ry;parked.userData.wake.visible=false;float.add(parked);
    var tx=document.createElement('canvas');tx.width=320;tx.height=160;var c2=tx.getContext('2d');c2.fillStyle='#E6007E';c2.fillRect(0,0,320,160);c2.fillStyle='#fff';c2.textAlign='center';c2.textBaseline='middle';c2.font='700 56px "Noto Sans TC","Microsoft JhengHei",sans-serif';c2.fillText('🚤 快艇碼頭',160,60);c2.font='500 32px sans-serif';c2.fillText('Speedboat',160,118);
    var sg=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(tx),transparent:true,depthWrite:false}));sg.scale.set(5,2.5,1);sg.position.set(ex-dx*2,4,ez-dz*2);float.add(sg);
    var info={d:d,float:float,parked:parked,ry:ry,end:{x:d.x+ex-dx*1.2,z:d.z+ez-dz*1.2},spot:{x:d.x+ex+nx*4.2-dx*3,z:d.z+ez+nz*4.2-dz*3},a:{x:d.x+dx*DOCK.r0,z:d.z+dz*DOCK.r0},b:{x:d.x+ex,z:d.z+ez}};
    LF.dockInfo=info;return info;
  };

  /* ================= 哥吉拉 ================= */
  var GZ={T:40,CYC:150};
  function buildGodzilla(){
    var g=new T.Group(),body=new T.Group(),B=new Baker();
    var SK=0x3D5A4A,DK=0x2E4439,BE=0x8FA58A,SP=0xBFE8FF;
    B.add(new T.SphereGeometry(1,16,12),SK,0,22,0,0,0,0,15,25,12);
    B.add(new T.SphereGeometry(1,14,10),BE,0,19,5.5,0,0,0,11,19,7);
    [-1,1].forEach(function(s){B.add(new T.CylinderGeometry(2.4,3.2,15,10),SK,s*14,32,7,1.1,0,s*-.25);
      for(var c=-1;c<=1;c++)B.add(new T.ConeGeometry(.7,3,5),0xF2F5F7,s*(14+c*1.3),24.5,12.8,PI*.65,0,0);});
    for(var i=0;i<8;i++){var sz=1+Math.sin(i/7*PI)*.7;B.add(new T.ConeGeometry(2.6*sz,8*sz,4),SP,0,45-i*5.4,-10.5-i*.5,-.55,PI/4,0);B.add(new T.BoxGeometry(5*sz,1.5,3),DK,0,43.5-i*5.4,-9.2,0,0,0);}
    var torso=B.mesh(K.vc(),false);body.add(torso);
    var neck=new T.Group();neck.position.set(0,40,5);body.add(neck);
    var NB=new Baker();NB.add(new T.CylinderGeometry(5,7.5,16,10),SK,0,8,2,.45,0,0);neck.add(NB.mesh(K.vc(),false));
    var head=new T.Group();head.position.set(0,17,8);neck.add(head);
    var HB=new Baker();
    HB.add(new T.SphereGeometry(1,14,10),SK,0,0,0,0,0,0,6,5.2,8);
    HB.add(new T.BoxGeometry(5.6,3.4,8.5),SK,0,-1.1,8,.1,0,0);
    HB.add(new T.BoxGeometry(2,1.2,2),DK,-2.4,3.8,7,0,0,0);HB.add(new T.BoxGeometry(2,1.2,2),DK,2.4,3.8,7,0,0,0);
    for(var t2=0;t2<4;t2++){HB.add(new T.ConeGeometry(.35,1.2,4),0xF2F5F7,-2+t2*1.35,-2.5,11+(t2%2)*.2,PI,0,0);}
    for(var k2=-1;k2<=1;k2+=2)for(var q=0;q<3;q++)HB.add(new T.ConeGeometry(.9,2.2,4),SP,k2*3.3,3.6+q*1.0,-3-q*2.5,-.6,0,k2*.3);
    head.add(HB.mesh(K.vc(),false));
    var eyeM=bm(0xFFE24D);[-1,1].forEach(function(s){var e=new T.Mesh(new T.SphereGeometry(.85,8,6),eyeM);e.position.set(s*3.3,2.3,6.6);head.add(e);});
    var jaw=new T.Group();jaw.position.set(0,-2.6,3.6);head.add(jaw);
    var JB=new Baker();JB.add(new T.BoxGeometry(5,1.6,8),SK,0,-.4,4.2);for(var t3=0;t3<4;t3++)JB.add(new T.ConeGeometry(.35,1.1,4),0xF2F5F7,-1.8+t3*1.2,.8,7+(t3%2)*.2,0,0,0);
    jaw.add(JB.mesh(K.vc(),false));
    var mouth=new T.Mesh(new T.BoxGeometry(4.4,.5,7),bm(0xFF5A1F));mouth.position.set(0,-1.9,8.2);head.add(mouth);mouth.visible=false;
    // 尾巴
    var tail=new T.Group();tail.position.set(0,8,-12);body.add(tail);
    var TB=new Baker();for(var i2=0;i2<7;i2++){var r=7-i2*.85;TB.add(new T.ConeGeometry(r,10,8),i2%2?SK:DK,0,3+i2*3.2,-i2*9.5-5,-PI/2-.12,0,0,1,1,1);}
    for(var j2=0;j2<6;j2++)TB.add(new T.ConeGeometry(2,5,4),SP,0,8+j2*3,-9-j2*9,-.7,PI/4,0);
    tail.add(TB.mesh(K.vc(),false));
    g.add(body);g.visible=false;
    // 火焰粒子
    var fm=[bm(0xFF6A1A,{transparent:true,blending:T.AdditiveBlending,depthWrite:false}),bm(0xFFD24D,{transparent:true,blending:T.AdditiveBlending,depthWrite:false})],fgeo=new T.SphereGeometry(1,8,6),fire=[],i3;
    for(i3=0;i3<46;i3++){var f=new T.Mesh(fgeo,fm[i3%2].clone());f.visible=false;f.userData.r=Math.random();f.userData.s=(Math.random()-.5);fire.push(f);}
    // 水波
    var rings=[];for(i3=0;i3<6;i3++){var rm=new T.Mesh(new T.RingGeometry(.86,1,48),bm(0xFFFFFF,{transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));rm.rotation.x=-PI/2;rm.visible=false;rings.push(rm);}
    return {g:g,body:body,neck:neck,head:head,jaw:jaw,tail:tail,mouth:mouth,fire:fire,rings:rings,eyeM:eyeM};
  }
  function smooth(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
  var DIRN=['東','東南','南','西南','西','西北','北','東北'];
  LF.godzilla=function(scene,cx,cz){
    var G=buildGodzilla();LF._gz=G;G.cx=cx;G.cz=cz;G.cyc=-1;G.ringN=0;G.state='hidden';
    scene.add(G.g);G.fire.forEach(function(f){scene.add(f);});G.rings.forEach(function(r){scene.add(r);});
    G.g.scale.setScalar(1.25);
  };
  function spawnRing(G,x,z,t0){var r=G.rings[G.ringN++%G.rings.length];r.userData={x:x,z:z,t0:t0};r.visible=true;}
  function gzTick(nowS,cam){
    var G=LF._gz;if(!G)return;
    var cyc=Math.floor((nowS+37)/GZ.CYC),tt=(nowS+37)-cyc*GZ.CYC,tl=tt;
    var hash=(Math.sin(cyc*127.1+3.7)*43758.5453)%1,k=Math.floor(Math.abs(hash)*6)%6,ang=k*PI/3+PI/6+(Math.abs(hash*7)%1)*.3;
    var R=250,x=G.cx+Math.cos(ang)*R,z=G.cz+Math.sin(ang)*R;
    // 水波
    G.rings.forEach(function(r){if(!r.visible)return;var u=(nowS-r.userData.t0)/7;if(u<0||u>1){r.visible=false;return;}
      r.position.set(r.userData.x,-4.15,r.userData.z);r.scale.setScalar(6+u*95);r.material.opacity=.5*(1-u);});
    if(tl>GZ.T){G.g.visible=false;G.mouth.visible=false;G.fire.forEach(function(f){f.visible=false;});
      if(G.state!=='hidden'){G.state='hidden';}return;}
    if(G.state==='hidden'||G.cyc!==cyc){
      G.cyc=cyc;G.state='active';G.sp={x:x,z:z,ang:ang};
      spawnRing(G,x,z,nowS-tl);spawnRing(G,x,z,nowS-tl+1.2);
      if(LF.onAppear&&tl<8){var d=Math.round(((Math.atan2(z-G.cz,x-G.cx)*180/PI+360)%360)/45)%8;LF.onAppear(DIRN[d]);}
      G.sunk=false;
    }
    var sp0=G.sp;G.g.visible=true;G.g.position.set(sp0.x,-4,sp0.z);
    G.g.rotation.y=Math.atan2(G.cx-sp0.x,G.cz-sp0.z);
    var rise=smooth(tl/7),sink=smooth((tl-23)/10),lvl=rise*(1-sink);
    var y=-85+85*lvl;G.body.position.y=y;
    G.body.position.x=(Math.random()-.5)*.25*(lvl>0&&lvl<1?1:0);
    if(!G.sunk&&tl>24){G.sunk=true;spawnRing(G,sp0.x,sp0.z,nowS);spawnRing(G,sp0.x,sp0.z,nowS+1.3);}
    // 頭與下巴
    var look=tl<11?Math.sin(tl*.9)*.7:0,fireU=(tl-12)/6;
    var roar=(tl>7.5&&tl<10.5)||(tl>19&&tl<23)||(fireU>0&&fireU<1);
    var jawA=roar?(.35+.3*Math.sin(tl*9)*.2+(fireU>0&&fireU<1?.2:.3)):0;
    var sweep=fireU>0&&fireU<1?(fireU-.5)*1.1:0;
    G.neck.rotation.y=tl<11?look*.6:sweep;G.head.rotation.x=(fireU>0&&fireU<1)?-.1:(roar?-.25:0);G.head.rotation.y=tl<11?look*.4:0;
    G.jaw.rotation.x+=((jawA)-G.jaw.rotation.x)*.2;
    G.body.scale.setScalar(roar?1.03+.02*Math.sin(tl*8):1);
    G.tail.rotation.y=Math.sin(nowS*.8)*.4;
    G.mouth.visible=fireU>0&&fireU<1;
    // 火焰
    var active=fireU>0&&fireU<1;
    if(active||G.fireOn){
      G.fireOn=active;
      var M=new T.Matrix4(),mp=new T.Vector3(0,-1.5,12),mw,dir=new T.Vector3(0,.12,1).normalize();
      G.g.updateMatrixWorld(true);G.head.updateMatrixWorld(true);
      mw=G.head.localToWorld(mp.clone());
      var dw=dir.clone().transformDirection(G.head.matrixWorld);
      G.fire.forEach(function(f,i){
        var u=((nowS*.9)+i/G.fire.length)%1;
        if(!active){f.visible=false;return;}
        f.visible=true;
        var dist=u*150;
        f.position.set(mw.x+dw.x*dist+f.userData.s*u*18,mw.y+dw.y*dist-u*u*18+Math.sin(i)*u*5,mw.z+dw.z*dist+f.userData.s*u*18*.6);
        f.scale.setScalar((2.2+u*9)*1.25);f.material.opacity=.85*(1-u*u);
      });
    }
    // 視線追蹤
    G.eyeM.color.setHex(roar?0xFF6A1A:0xFFE24D);
  }

  /* ================= 總更新 ================= */
  LF.init=function(scene,cx,cz,islands){
    LF.godzilla(scene,cx,cz);LF.pets(islands);
  };
  LF.update=function(t,dt,nowS,cam,pp,reduce){
    gzTick(nowS,cam);
    if(!reduce)petTick(nowS);
  };
  window.Life=LF;
})();
