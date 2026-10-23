/* 海、洋流、天空、太陽（深色模式為月亮）、雲與飛鳥 */
(function(){
  var T=THREE, O={}, st={};
  var PAL={
    light:{hor:0xCFE9F4,top:0x58AEE6,water:0x2FA6CF,spec:0xA8E4F5,sun:0xFFF1B8,glow:0xFFC766,cloud:0xFFFFFF,bird:0x26323B,stripe:1,stripeA:.34},
    dark:{hor:0x1D3A55,top:0x050E18,water:0x0B3A55,spec:0x4F86B0,sun:0xE6EEF8,glow:0x7FA6D6,cloud:0x2C4458,bird:0xCFE2EC,stripe:.6,stripeA:.22}
  };

  function stripeTex(seed){
    var c=document.createElement('canvas');c.width=c.height=512;var g=c.getContext('2d');
    g.lineCap='round';g.strokeStyle='#fff';
    var i,k,x,y0,A,ph,w,r=function(){seed=(seed*9301+49297)%233280;return seed/233280;};
    for(i=0;i<16;i++){
      y0=30+r()*452;A=6+r()*14;k=1+Math.floor(r()*2);ph=r()*6.28;w=2+r()*3;
      var x0=r()*512,len=140+r()*200;
      g.globalAlpha=.55+r()*.4;g.lineWidth=w;g.beginPath();
      for(x=0;x<=len;x+=8){var xx=(x0+x)%512,yy=y0+A*Math.sin(Math.PI*2*k*xx/512+ph);if(x===0||xx<8)g.moveTo(xx,yy);else g.lineTo(xx,yy);}
      g.stroke();
    }
    var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t;
  }
  function glowTex(){
    var c=document.createElement('canvas');c.width=c.height=256;var g=c.getContext('2d');
    var gr=g.createRadialGradient(128,128,0,128,128,128);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr;g.fillRect(0,0,256,256);return new T.CanvasTexture(c);
  }

  O.build=function(scene,cx,cz){
    st.scene=scene;st.cx=cx;st.cz=cz;
    // sea surface (animated swell)
    var geo=new T.PlaneGeometry(640,640,128,128);geo.rotateX(-Math.PI/2);
    st.base=geo.attributes.position.array.slice();
    st.water=new T.Mesh(geo,new T.MeshPhongMaterial({color:0x2FA6CF,flatShading:true,shininess:70,specular:0xA8E4F5}));
    st.water.position.set(cx,-4.3,cz);st.water.receiveShadow=true;scene.add(st.water);
    // current stripes, two layers drifting in different directions
    st.str=[];
    [[stripeTex(7),9,-3.72,.02,.008],[stripeTex(31),6,-3.68,-.012,.015]].forEach(function(s){
      var g=new T.PlaneGeometry(640,640);g.rotateX(-Math.PI/2);
      s[0].repeat.set(s[1],s[1]);
      var m=new T.Mesh(g,new T.MeshBasicMaterial({map:s[0],transparent:true,opacity:.34,depthWrite:false}));
      m.position.set(cx,s[2],cz);scene.add(m);st.str.push({m:m,t:s[0],vx:s[3],vy:s[4]});
    });
    // sky dome
    var dg=new T.SphereGeometry(520,24,16),n=dg.attributes.position.count;
    dg.setAttribute('color',new T.BufferAttribute(new Float32Array(n*3),3));
    st.dome=new T.Mesh(dg,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,fog:false,depthWrite:false}));
    st.dome.renderOrder=-10;scene.add(st.dome);
    // sun / moon with glow
    st.sun=new T.Mesh(new T.SphereGeometry(15,24,16),new T.MeshBasicMaterial({color:0xFFF1B8,fog:false}));
    st.glow=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xFFC766,fog:false,depthWrite:false,blending:T.AdditiveBlending,transparent:true}));
    st.glow.scale.set(190,190,1);
    st.sdir=new T.Vector3(-70,15,-26).normalize();
    scene.add(st.sun,st.glow);
    // clouds
    st.clouds=[];st.cmat=new T.MeshBasicMaterial({color:0xffffff,fog:false});
    var i,j;
    for(i=0;i<9;i++){
      var c=new T.Group(),k=3+(i%3);
      for(j=0;j<k;j++){var s=new T.Mesh(new T.SphereGeometry(1,10,8),st.cmat);s.scale.set(7+Math.random()*5,3+Math.random()*2,4+Math.random()*3);s.position.set((j-k/2)*7,Math.random()*1.5,Math.random()*3);c.add(s);}
      c.position.set(-160+i*55+Math.random()*20,52+Math.random()*22,-150+Math.random()*130);
      c.userData.v=1.2+Math.random()*1.2;scene.add(c);st.clouds.push(c);
    }
    // birds: three flocks circling the archipelago
    st.birds=[];st.bmat=new T.MeshBasicMaterial({color:0x26323B,side:T.DoubleSide,fog:false});
    var wg=new T.BufferGeometry();
    wg.setAttribute('position',new T.BufferAttribute(new Float32Array([0,0,0, 1.5,.05,.25, .35,0,-.6]),3));
    var flocks=[[60,22,.11,0],[78,27,-.08,2.1],[92,18,.07,4.2]];
    flocks.forEach(function(f,fi){
      for(var b=0;b<4;b++){
        var g=new T.Group(),wr=new T.Mesh(wg,st.bmat),wl=new T.Mesh(wg,st.bmat);wl.scale.x=-1;
        g.add(wr,wl,new T.Mesh(new T.ConeGeometry(.22,1,5),st.bmat));g.children[2].rotation.x=Math.PI/2;
        g.scale.setScalar(2);scene.add(g);
        st.birds.push({g:g,wr:wr,wl:wl,r:f[0]+b*2.5,h:f[1]+(b%2)*2,sp:f[2],ph:f[3]+b*.12,fl:Math.random()*6});
      }
    });
    st.rings=[];st.vis=[];st.next={plane:7,deity:14};
    return st;
  };


  /* ---------- 偶爾路過的訪客：神明、飛機 ---------- */
  function bm(c,o){return new T.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));}
  function bmesh(geo,c,x,y,z,o){var m=new T.Mesh(geo,bm(c,o));m.position.set(x||0,y||0,z||0);return m;}
  function makeDeity(){
    var g=new T.Group(),body=new T.Group(),i;
    // 祥雲
    [[0,-1.5,0,2.0],[-1.5,-1.3,.2,1.4],[1.5,-1.3,-.1,1.5],[.6,-1.1,.6,1.2],[-.7,-1.1,-.6,1.2]].forEach(function(c){
      var s=bmesh(new T.SphereGeometry(c[3]*.62,12,8),0xFFF3C0,c[0],c[1],c[2]);s.scale.y=.6;body.add(s);});
    // 衣袍、金邊、腰帶
    body.add(bmesh(new T.CylinderGeometry(.55,1.05,2.0,14),0xD7262E,0,.1,0));
    body.add(bmesh(new T.CylinderGeometry(1.07,1.07,.16,14),0xFFD400,0,-.86,0));
    body.add(bmesh(new T.CylinderGeometry(.58,.58,.2,14),0xFFD400,0,.55,0));
    // 寬袖與雙手
    [-1,1].forEach(function(sd){
      var sl=bmesh(new T.SphereGeometry(.5,12,8),0xB81E26,sd*.95,.45,.35);sl.scale.set(.8,1.2,.8);sl.rotation.z=sd*.5;body.add(sl);
      body.add(bmesh(new T.SphereGeometry(.16,10,8),0xF3C9A5,sd*.8,-.15,.5));
    });
    // 頭、白鬍、眉、眼、腮紅
    body.add(bmesh(new T.SphereGeometry(.52,16,12),0xF3C9A5,0,1.55,0));
    var bd=bmesh(new T.ConeGeometry(.42,1.0,10),0xFFFFFF,0,1.05,.38);bd.rotation.x=Math.PI;bd.scale.z=.5;body.add(bd);
    body.add(bmesh(new T.SphereGeometry(.06,8,6),0x23282D,-.2,1.62,.46),bmesh(new T.SphereGeometry(.06,8,6),0x23282D,.2,1.62,.46));
    var b1=bmesh(new T.BoxGeometry(.28,.06,.06),0xFFFFFF,-.2,1.76,.47),b2=bmesh(new T.BoxGeometry(.28,.06,.06),0xFFFFFF,.2,1.76,.47);b1.rotation.z=.25;b2.rotation.z=-.25;body.add(b1,b2);
    body.add(bmesh(new T.SphereGeometry(.09,8,6),0xFF9FC6,-.33,1.48,.42),bmesh(new T.SphereGeometry(.09,8,6),0xFF9FC6,.33,1.48,.42));
    // 官帽
    body.add(bmesh(new T.CylinderGeometry(.38,.46,.42,12),0x23282D,0,2.05,0));
    body.add(bmesh(new T.BoxGeometry(1.35,.07,.26),0x23282D,0,2.12,-.05),bmesh(new T.BoxGeometry(1.35,.02,.1),0xFFD400,0,2.17,-.05));
    // 光環
    var halo=bmesh(new T.TorusGeometry(.95,.06,8,28),0xFFD400,0,1.6,-.5);body.add(halo);
    body.add(bmesh(new T.CircleGeometry(.9,24),0xFFE27A,0,1.6,-.52,{transparent:true,opacity:.45,side:T.DoubleSide}));
    var gl=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xFFD27A,fog:false,depthWrite:false,blending:T.AdditiveBlending,transparent:true}));gl.scale.set(15,15,1);gl.position.set(0,1,-.6);body.add(gl);
    g.add(body);g.userData.body=body;
    // 飄帶（沿行進方向往後飄）
    var rb=new T.Group();
    [-.5,.5].forEach(function(x,k){
      var r=bmesh(new T.PlaneGeometry(.28,7),k?0xFFD400:0xE6007E,x,.6,-3.6,{side:T.DoubleSide});r.rotation.x=-Math.PI/2;rb.add(r);rb.userData['r'+k]=r;});
    g.userData.ribbon=rb;
    g.userData.scale=3.6;
    return g;
  }
  function makeJet(){
    var g=new T.Group(),W=0xFFFFFF;
    var fu=bmesh(new T.CylinderGeometry(.46,.46,5,14),W);fu.rotation.x=Math.PI/2;g.add(fu);
    var nose=bmesh(new T.ConeGeometry(.46,1.2,14),W,0,0,3.1);nose.rotation.x=Math.PI/2;g.add(nose);
    var tail=bmesh(new T.ConeGeometry(.46,1.6,14),W,0,.05,-3.3);tail.rotation.x=-Math.PI/2;g.add(tail);
    var st1=bmesh(new T.CylinderGeometry(.47,.47,3.4,14),0x2B6CB0,0,-.12,.2);st1.rotation.x=Math.PI/2;st1.scale.set(1,1,.35);g.add(st1);
    var wr=bmesh(new T.BoxGeometry(4,.1,1.3),W,2.4,-.2,.3),wl=bmesh(new T.BoxGeometry(4,.1,1.3),W,-2.4,-.2,.3);wr.rotation.y=-.4;wl.rotation.y=.4;g.add(wr,wl);
    g.add(bmesh(new T.BoxGeometry(.1,1.5,1.1),0xE6007E,0,1,-3.0));
    var sr=bmesh(new T.BoxGeometry(1.5,.08,.7),W,.95,.1,-3.1),sl=bmesh(new T.BoxGeometry(1.5,.08,.7),W,-.95,.1,-3.1);sr.rotation.y=-.3;sl.rotation.y=.3;g.add(sr,sl);
    [-1.9,1.9].forEach(function(x){var e=bmesh(new T.CylinderGeometry(.28,.28,1.1,10),0x8A99A3,x,-.55,.8);e.rotation.x=Math.PI/2;g.add(e);});
    g.userData.lightR=bmesh(new T.SphereGeometry(.14,8,6),0xFF3B3B,-4.2,-.25,.1);g.userData.lightG=bmesh(new T.SphereGeometry(.14,8,6),0x3BFF7A,4.2,-.25,.1);
    g.add(g.userData.lightR,g.userData.lightG);
    // 飛機雲
    [-1.9,1.9].forEach(function(x){var c=bmesh(new T.BoxGeometry(.22,.16,40),0xFFFFFF,x,-.5,-23,{transparent:true,opacity:.5});g.add(c);});
    g.userData.scale=3.4;
    return g;
  }
  var fwd=new T.Vector3();
  function spawn(kind,cam){
    var g=kind==='deity'?makeDeity():makeJet();
    cam.getWorldDirection(fwd);fwd.y=0;if(fwd.lengthSq()<1e-4)fwd.set(0,0,-1);fwd.normalize();
    var right=new T.Vector3(-fwd.z,0,fwd.x),dist=kind==='deity'?125:135,half=150;
    var sgn=Math.random()<.5?-1:1,elev=(kind==='deity'?7:11+Math.random()*3)*Math.PI/180;
    var cx=cam.position.x+fwd.x*dist,cz=cam.position.z+fwd.z*dist,y=cam.position.y+dist*Math.tan(elev)+(kind==='deity'?0:6);
    var from=new T.Vector3(cx-right.x*half*sgn,y,cz-right.z*half*sgn),to=new T.Vector3(cx+right.x*half*sgn,y,cz+right.z*half*sgn);
    var sc=g.userData.scale;g.scale.setScalar(sc);
    st.scene.add(g);if(g.userData.ribbon){g.userData.ribbon.scale.setScalar(sc);st.scene.add(g.userData.ribbon);}
    st.vis.push({g:g,kind:kind,from:from,to:to,u:0,dur:kind==='deity'?38:15});
  }
  function updateVisitors(dt,t,cam,reduce){
    if(reduce)return;
    ['plane','deity'].forEach(function(k){
      if(t>st.next[k]){spawn(k==='plane'?'plane':'deity',cam);st.next[k]=t+(k==='plane'?38+Math.random()*30:55+Math.random()*40);}
    });
    for(var i=st.vis.length-1;i>=0;i--){
      var v=st.vis[i],g=v.g;v.u+=dt/v.dur;
      if(v.u>=1){st.scene.remove(g);if(g.userData.ribbon)st.scene.remove(g.userData.ribbon);st.vis.splice(i,1);continue;}
      g.position.lerpVectors(v.from,v.to,v.u);
      var hx=v.to.x-v.from.x,hz=v.to.z-v.from.z,head=Math.atan2(hx,hz);
      if(v.kind==='plane'){
        g.rotation.y=head;g.rotation.z=Math.sin(t*.6)*.04;
        g.userData.lightR.visible=g.userData.lightG.visible=Math.sin(t*5)>-.2;
      }else{
        g.position.y+=Math.sin(t*1.3)*1.2;
        g.userData.body.rotation.y=Math.atan2(cam.position.x-g.position.x,cam.position.z-g.position.z)-0;
        g.userData.body.position.y=Math.sin(t*2)*.12;
        var rb=g.userData.ribbon;rb.position.copy(g.position);rb.rotation.y=head;
        rb.userData.r0.rotation.z=Math.sin(t*3)*.25;rb.userData.r1.rotation.z=Math.sin(t*3+1.6)*.25;
      }
    }
  }

  O.addRing=function(x,z,phase){
    var g=new T.RingGeometry(5.9,6.9,6,1);g.rotateZ(Math.PI/6);g.rotateX(-Math.PI/2);
    var m=new T.Mesh(g,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false}));
    m.position.set(x,-3.9,z);st.scene.add(m);st.rings.push({m:m,ph:phase});
  };

  O.theme=function(mode,sunLight){
    var P=PAL[mode];
    st.scene.fog=new T.Fog(P.hor,95,270);st.scene.background=new T.Color(P.hor);
    st.water.material.color.setHex(P.water);st.water.material.specular.setHex(P.spec);
    st.str.forEach(function(s){s.m.material.opacity=P.stripeA;});
    var pos=st.dome.geometry.attributes.position,col=st.dome.geometry.attributes.color,i,h,c1=new T.Color(P.hor),c2=new T.Color(P.top),c=new T.Color();
    for(i=0;i<pos.count;i++){h=Math.max(0,pos.getY(i)/520);c.copy(c1).lerp(c2,Math.pow(h,.55));col.setXYZ(i,c.r,c.g,c.b);}
    col.needsUpdate=true;
    st.sun.material.color.setHex(P.sun);st.glow.material.color.setHex(P.glow);
    st.glow.material.opacity=mode==='dark'?.55:.9;
    st.cmat.color.setHex(P.cloud);st.bmat.color.setHex(P.bird);
    st.mode=mode;
  };

  O.update=function(dt,t,cam,reduce){
    var p=st.base,a=st.water.geometry.attributes.position.array,i,x,z;
    for(i=0;i<a.length;i+=3){
      x=p[i]+st.cx;z=p[i+2]+st.cz;
      a[i+1]=Math.sin(x*.12+t*.9)*.2+Math.sin(z*.17-t*.7)*.16+Math.sin((x+z)*.3+t*1.3)*.07;
    }
    st.water.geometry.attributes.position.needsUpdate=true;
    st.str.forEach(function(s){s.t.offset.x+=s.vx*dt;s.t.offset.y+=s.vy*dt;});
    st.dome.position.copy(cam.position);
    st.sun.position.copy(cam.position).addScaledVector(st.sdir,430);
    st.glow.position.copy(st.sun.position);
    st.sun.visible=st.glow.visible=true;
    st.clouds.forEach(function(c){c.position.x+=c.userData.v*dt;if(c.position.x>230)c.position.x=-230;});
    st.birds.forEach(function(b){
      var th=b.ph+t*b.sp,cx=st.cx,cz=st.cz,dir=b.sp>0?1:-1;
      var px=cx+Math.cos(th)*b.r,pz=cz+Math.sin(th)*b.r;
      b.g.position.set(px,b.h+Math.sin(t*.8+b.ph*5)*1.4,pz);
      b.g.rotation.y=Math.atan2(-Math.sin(th)*dir,Math.cos(th)*dir);
      var f=Math.sin(t*9+b.fl)*.7;b.wr.rotation.z=f;b.wl.rotation.z=-f;
    });
    updateVisitors(dt,t,cam,reduce);
    st.rings.forEach(function(r){var s=1+((t*.35+r.ph)%1)*.14;r.m.scale.setScalar(s);r.m.material.opacity=.55*(1-((t*.35+r.ph)%1));});
  };
  window.Ocean=O;
})();
