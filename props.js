/* 3D 地標與小人物（Three.js r128，全域 THREE） */
(function(){
  var T=THREE;
  var CY=0x00A9E0,MA=0xE6007E,YE=0xFFD400,K=0x23282D,W=0xFFFFFF,CARD=0xF2F5F7,PINK=0xFFA6C8;
  function mat(c,o){return new T.MeshLambertMaterial(Object.assign({color:c},o||{}));}
  function mesh(geo,c,x,y,z,o){var m=new T.Mesh(geo,mat(c,o));m.position.set(x||0,y||0,z||0);m.castShadow=true;return m;}
  function box(w,h,d,c,x,y,z,o){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,o);}
  function cyl(rt,rb,h,c,x,y,z,seg){return mesh(new T.CylinderGeometry(rt,rb,h,seg||16),c,x,y,z);}
  function sph(r,c,x,y,z,sx,sy,sz){var m=mesh(new T.SphereGeometry(r,16,12),c,x,y,z);m.scale.set(sx||1,sy||1,sz||1);return m;}
  function cone(r,h,c,x,y,z,seg){return mesh(new T.ConeGeometry(r,h,seg||12),c,x,y,z);}
  function tor(r,t,c,x,y,z,arc){return mesh(new T.TorusGeometry(r,t,8,20,arc||Math.PI*2),c,x,y,z);}
  function grp(){var g=new T.Group();for(var i=0;i<arguments.length;i++)g.add(arguments[i]);return g;}
  function rx(m,a){m.rotation.x=a;return m;}
  function rz(m,a){m.rotation.z=a;return m;}
  function ry(m,a){m.rotation.y=a;return m;}

  var L={
    lightbox:function(){return grp(box(3.2,.5,2.2,CARD,0,.25,0),box(.6,.25,.6,CY,-1.1,.62,0),box(.6,.25,.6,MA,-.37,.62,0),box(.6,.25,.6,YE,.37,.62,0),box(.6,.25,.6,K,1.1,.62,0),box(2.9,.08,.35,K,0,.54,.8));},
    press:function(){return grp(box(3.2,1.2,1.8,CARD,0,.6,0),box(3.5,.3,2,CARD,0,1.35,0),rx(cyl(.45,.45,1.5,CY,-1,1.65,0),Math.PI/2),rx(cyl(.45,.45,1.5,MA,0,1.65,0),Math.PI/2),rx(cyl(.45,.45,1.5,YE,1,1.65,0),Math.PI/2),box(1.1,.3,1.5,W,-2.2,.9,0),box(.9,.3,1.3,W,2.2,.7,0));},
    screen:function(){var g=grp(box(2.8,.22,.22,K,0,.2,0),box(2.8,.22,.22,K,0,2.3,0),box(.22,2.2,.22,K,-1.3,1.25,0),box(.22,2.2,.22,K,1.3,1.25,0),box(2.4,1.9,.05,W,0,1.25,0,{transparent:true,opacity:.7}));for(var i=-2;i<=2;i++){g.add(box(.03,1.9,.06,K,i*.45,1.25,0));}g.add(rz(box(.35,1.8,.35,MA,2.2,.9,.3),.3));return g;},
    wheel:function(){var w=rx(cyl(1.15,1.15,.35,CARD,0,1.5,0),Math.PI/2);var g=grp(box(3,.45,1.6,CARD,0,.22,0),box(.4,1.2,.5,CARD,-1.1,.9,0),box(.4,1.2,.5,CARD,1.1,.9,0),w,rx(cyl(.35,.35,.5,MA,0,1.5,0),Math.PI/2));var i,s;for(i=0;i<3;i++){s=box(2.1,.12,.4,K,0,1.5,.2);s.rotation.z=i*Math.PI/3;g.add(s);}g.add(rx(cyl(.35,.35,.9,YE,2,.55,.3),Math.PI/2));g.userData.spin=w;return g;},
    printer:function(){return grp(box(3.2,1.3,1.9,CARD,0,.65,0),box(2.2,.15,.1,K,0,.55,.96),rx(box(1.8,.05,1.2,W,0,1.55,-.2),-.5),box(1.5,.05,1,W,0,.4,1.4),sph(.1,MA,1.3,1.0,.96));},
    cutter:function(){return grp(box(2.4,1.6,2.4,0xD9A66B,0,.8,0),box(2.6,.18,2.6,0xEBC995,0,1.7,0),box(.5,.02,2.6,0xC28F55,0,1.8,0),sph(.35,YE,0,2.1,0));},
    computer:function(){var s=mesh(new T.OctahedronGeometry(.28),YE,0,1.95,.2);var g=grp(box(2.8,1.8,.25,CARD,0,1.9,0),box(2.5,1.5,.05,0x23323C,0,1.9,.14),cyl(.15,.25,.8,CARD,0,.8,0),box(1.4,.15,1,CARD,0,.08,0),s);g.userData.spin=s;return g;},
    camera:function(){var g=grp(box(2.6,1.4,1.3,0x3A424A,0,1.1,0),box(.9,.3,.6,0x3A424A,-.7,1.95,0),rx(cyl(.7,.7,.9,K,0,1.1,.95),Math.PI/2),rx(cyl(.5,.5,.1,CY,0,1.1,1.45),Math.PI/2),box(.5,.3,.3,YE,.9,1.9,0));var i,a;for(i=0;i<3;i++){a=i*Math.PI*2/3;var l=cyl(.06,.06,1.2,K,Math.sin(a)*.6,.4,Math.cos(a)*.6);l.rotation.z=Math.sin(a)*.3;l.rotation.x=Math.cos(a)*.3;g.add(l);}return g;},
    phone:function(){var p=cone(.4,.7,MA,.05,1.7,.2,3);p.rotation.z=-Math.PI/2;var g=grp(box(1.6,2.7,.3,K,0,1.55,0),box(1.35,2.3,.05,0x23323C,0,1.55,.17),p,box(2.4,.2,1.4,CARD,0,.1,0));g.rotation.y=-.35;return g;},
    chat:function(){return grp(sph(.95,W,-.8,1.7,0,1.35,.9,.8),cone(.3,.5,W,-1.2,.9,.1),sph(.8,YE,.9,.9,.4,1.3,.85,.8),cone(.25,.45,YE,1.2,.2,.5),sph(.08,K,-1.2,1.7,.7),sph(.08,K,-.8,1.7,.7),sph(.08,K,-.4,1.7,.7));},
    book:function(){var a=box(1.6,.18,2.1,W,-.82,.55,0),b=box(1.6,.18,2.1,W,.82,.55,0);a.rotation.z=.18;b.rotation.z=-.18;return grp(box(3.5,.25,2.4,MA,0,.12,0),a,b,box(.12,.05,2,K,0,.5,0),box(.2,.02,.9,YE,1.2,.7,.9));},
    chart:function(){return grp(box(3.4,.2,2.2,CARD,0,.1,0),box(.7,1.2,.7,CY,-1.1,.8,0),box(.7,2.1,.7,MA,0,1.25,0),box(.7,3,.7,YE,1.1,1.7,0),sph(.2,W,1.1,3.3,0));},
    briefcase:function(){return grp(box(2.6,1.6,1.1,0x8A5A33,0,.8,0),tor(.45,.08,K,0,1.8,0,Math.PI),box(.35,.3,.15,YE,0,1.3,.58),rx(cyl(.55,.55,.14,YE,2.1,.7,.2),Math.PI/2));},
    lighthouse:function(){var g=grp(cyl(.8,1.3,3.2,W,0,1.6,0),cyl(1.05,1.05,.15,K,0,3.2,0),cyl(.7,.7,.8,CY,0,3.65,0),cone(.95,.9,MA,0,4.5,0));g.add(cyl(1.24,1.24,.35,MA,0,.9,0),cyl(1.07,1.07,.35,MA,0,1.9,0),cyl(.9,.9,.35,MA,0,2.8,0));return g;},
    flag:function(){return grp(cyl(.07,.07,3.8,K,-1.1,1.9,0),box(1.7,.95,.06,MA,-.25,3.2,0),cone(1.4,1.9,YE,1.5,.95,0,4),box(.55,.8,.1,W,1.5,.4,1.05));},
    frame:function(){var m=cone(.9,.9,CY,-.3,1.5,.2,3);return grp(rz(cyl(.07,.07,2.2,K,-1.1,.9,-.4),.2),rz(cyl(.07,.07,2.2,K,1.1,.9,-.4),-.2),box(3.2,2.4,.2,CARD,0,1.9,0),box(2.8,2,.05,0xBEEBFA,0,1.9,.13),m,sph(.28,YE,.9,2.5,.2));}
  };
  var ACC={
    hat:function(){return grp(mesh(new T.SphereGeometry(.52,16,8,0,Math.PI*2,0,Math.PI/2),YE,0,.9,0),cyl(.66,.66,.06,YE,0,.92,0));},
    glasses:function(){return grp(tor(.14,.03,K,-.17,.67,.44),tor(.14,.03,K,.17,.67,.44));},
    band:function(){return rx(tor(.5,.06,MA,0,.85,0),Math.PI/2);},
    phones:function(){return grp(tor(.54,.05,K,0,.6,0,Math.PI),rz(cyl(.14,.14,.14,CY,-.54,.6,0),Math.PI/2),rz(cyl(.14,.14,.14,CY,.54,.6,0),Math.PI/2));},
    box:function(){return ry(box(.62,.48,.62,0xD9A66B,0,1.25,0),.4);},
    beret:function(){var b=sph(.42,0x8467D1,.08,1.0,0,1,.35,1);b.rotation.z=-.15;return grp(b,cyl(.03,.03,.12,0x8467D1,.1,1.17,0));},
    antenna:function(){return grp(cyl(.03,.03,.45,K,0,1.3,0),sph(.1,CY,0,1.58,0));},
    grad:function(){var b=ry(box(1,.07,1,K,0,1.15,0),Math.PI/4);return grp(b,cyl(.34,.34,.2,K,0,1.02,0),sph(.07,YE,.5,1.1,.5));},
    speech:function(){return grp(sph(.4,W,.35,1.85,0,1.5,.8,.6),sph(.05,K,.1,1.85,.3),sph(.05,K,.35,1.85,.3),sph(.05,K,.6,1.85,.3));},
    pennant:function(){return grp(cyl(.03,.03,1.3,K,.62,.9,0),box(.5,.28,.03,MA,.88,1.4,0));},
    bow:function(){return grp(rz(cone(.14,.3,MA,-.18,.22,.45),Math.PI/2),rz(cone(.14,.3,MA,.18,.22,.45),-Math.PI/2),sph(.07,MA,0,.22,.46));},
    cap:function(){return grp(cyl(.46,.46,.22,K,0,1.02,0),cyl(.48,.48,.07,W,0,.95,0),sph(.07,YE,0,1.16,.4),box(.7,.05,.3,K,0,.93,.45));},
    camera:function(){return grp(box(.5,.32,.2,K,0,.32,.5),rx(cyl(.1,.1,.12,CY,0,.32,.62),Math.PI/2));},
    prop:function(){var p=box(.7,.04,.12,MA,0,1.3,0);return grp(cone(.4,.4,0xE27644,0,1.1,0),sph(.06,YE,0,1.33,0),p);},
    tie:function(){return grp(box(.12,.1,.08,MA,0,.42,.5),rz(cone(.11,.3,MA,0,.25,.5,4),Math.PI));}
  };

  function makeChar(acc,scale,color,face){
    var g=new T.Group(),b=new T.Group(),c=color||W;
    b.add(sph(.5,c,0,.55,0,1,1.1,1),sph(.16,c,-.2,.1,.05,1,.7,1.2),sph(.16,c,.2,.1,.05,1,.7,1.2),
      sph(.09,0xFF9FC6,-.3,.55,.4,1,.6,.4),sph(.09,0xFF9FC6,.3,.55,.4,1,.6,.4));
    var dot=function(x){return sph(.07,K,x,.7,.43);},line=function(x,rot){var l=box(.15,.035,.03,K,x,.7,.47);l.rotation.z=rot||0;return l;};
    if(face==='wink'){b.add(line(-.17,0),dot(.17));}
    else if(face==='sleepy'){b.add(line(-.17,-.2),line(.17,.2));}
    else{b.add(dot(-.17),dot(.17));}
    if(face==='open'){b.add(sph(.065,0x7A2A2A,0,.46,.46,1,1.25,.5));}
    else if(face==='sleepy'){b.add(sph(.03,K,0,.46,.48));}
    else{var m=tor(.09,.018,K,0,.52,.495,Math.PI);m.rotation.z=Math.PI;b.add(m);}
    if(ACC[acc])b.add(ACC[acc]());
    g.add(b);g.userData.body=b;g.scale.setScalar(scale||1);return g;
  }
  function makeBossHat(){
    var h=new T.Group();
    h.add(sph(.58,PINK,0,1.0,-.02,1,.72,1),cone(.2,.38,PINK,-.38,1.3,0,3),cone(.2,.38,PINK,.38,1.3,0,3));
    var sn=rx(cyl(.22,.22,.18,0xFF7FB0,0,1.02,.5),Math.PI/2);h.add(sn,sph(.04,K,-.08,1.02,.6),sph(.04,K,.08,1.02,.6));
    h.children[1].rotation.z=.4;h.children[2].rotation.z=-.4;
    return h;
  }
  function makeBoss(){
    var g=makeChar('',1.7,0xFFE9D6);g.userData.body.add(makeBossHat());
    return g;
  }
  function makeDrop(){
    var pts=[],i,t,r;
    for(i=0;i<=24;i++){t=i/24;r=Math.sin(Math.PI*Math.pow(t,.7))*.5;pts.push(new T.Vector2(Math.max(.001,r),t*1.5));}
    var body=new T.Mesh(new T.LatheGeometry(pts,20),mat(MA));body.castShadow=true;
    var g=new T.Group(),o=new T.Group();o.add(body);
    o.add(sph(.07,K,-.15,.5,.46),sph(.07,K,.15,.5,.46),sph(.04,W,-.18,.55,.5));
    g.add(o);g.userData.body=o;g.scale.setScalar(1.1);return g;
  }
  window.Props={landmark:function(k){return (L[k]||L.book)();},char:makeChar,boss:makeBoss,drop:makeDrop,accs:Object.keys(ACC),faces:['smile','open','wink','sleepy']};
})();
