// HTML page that runs inside react-native-webview.
// Camera frames are processed on the device by MediaPipe Pose Landmarker.
// Only landmarks-derived events (status, rep, form) are posted to React Native.
// Video is never recorded or sent anywhere.

export const POSE_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;padding:0;height:100%;background:#1B6E35;overflow:hidden}
video,canvas{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
</style>
</head>
<body>
<video id="v" playsinline autoplay muted></video>
<canvas id="c"></canvas>
<script>
var MP='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
var MODEL='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
var V=document.getElementById('v'),CV=document.getElementById('c'),X=CV.getContext('2d');
var bc=document.createElement('canvas');bc.width=16;bc.height=12;var bx=bc.getContext('2d');
var lm=null,cfg=null,paused=false,skel=true,st=null,status='init',cand=null,candAt=0,lastT=-1,frame=0,light=128,asp=0.75;
function post(m){try{window.ReactNativeWebView.postMessage(JSON.stringify(m));}catch(e){}}
window.onerror=function(msg){post({type:'log',msg:String(msg)});};
function now(){return performance.now();}
window.setExercise=function(c){cfg=c;st={phase:'idle',t0:now(),issues:{},n:0};};
window.setPaused=function(p){paused=!!p;if(st){st.t0=now();}};
window.setSkeleton=function(v){skel=!!v;if(!skel){X.clearRect(0,0,CV.width,CV.height);}};

function cl(v){return Math.max(0,Math.min(100,v));}
function ang(a,b,c){var ax=a.x-b.x,ay=a.y-b.y,cx=c.x-b.x,cy=c.y-b.y;var d=Math.sqrt(ax*ax+ay*ay)*Math.sqrt(cx*cx+cy*cy);if(d<1e-9)return 180;var v=(ax*cx+ay*cy)/d;v=Math.max(-1,Math.min(1,v));return Math.acos(v)*180/Math.PI;}
function mid(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
function dist(a,b){return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));}
function lean(P){var s=mid(P[11],P[12]),h=mid(P[23],P[24]);return Math.atan2(s.x-h.x,h.y-s.y)*180/Math.PI;}
function avg(a){if(!a.length)return 0;var s=0;for(var i=0;i<a.length;i++)s+=a[i];return s/a.length;}
function sd(a){if(a.length<2)return 0;var m=avg(a),v=0;for(var i=0;i<a.length;i++)v+=(a[i]-m)*(a[i]-m);return Math.sqrt(v/a.length);}
function rep(amp,form,dur){var t=now();var d=dur||Math.max(0.3,(t-st.t0)/1000);st.t0=t;st.n++;post({type:'rep',n:st.n,amp:Math.round(cl(amp)),form:Math.round(cl(form)),dur:Math.round(d*100)/100});}
function issue(id){var t=now();if(st.issues[id]&&t-st.issues[id]<5000)return;st.issues[id]=t;post({type:'form',id:id});}

var K={};
function squatLike(P,enter,deep,target,exit){
  var h=mid(P[23],P[24]),k=mid(P[25],P[26]),a=mid(P[27],P[28]);
  var shin=Math.max(0.03,Math.abs(a.y-k.y));var d=(k.y-h.y)/shin;
  st.base=st.base?Math.max(st.base*0.999,d):d;var r=d/Math.max(0.3,st.base);
  var sw=Math.max(0.03,dist(P[11],P[12]));var ln=Math.abs(lean(P)),as=Math.abs(P[25].y-P[26].y)/sw;
  if(st.phase!=='down'){if(r<enter){st.phase='down';st.min=r;st.ln=ln;st.as=as;}return;}
  st.min=Math.min(st.min,r);st.ln=Math.max(st.ln,ln);st.as=Math.max(st.as,as);
  if(r>exit){
    st.phase='up';
    if(st.ln>20)issue('tilt');
    if(st.as>0.5)issue('legs_asym');
    if(st.min>deep){issue('shallow');return;}
    var amp=st.min<=target?100:100-(st.min-target)/Math.max(0.01,enter-target)*100;
    var form=100-Math.max(0,st.ln-8)*3-Math.max(0,st.as-0.2)*80;
    rep(amp,form);
  }
}
K.squat=function(P){squatLike(P,0.8,0.55,0.3,0.88);};
K.spring=function(P){squatLike(P,0.9,0.82,0.7,0.95);};
K.jack=function(P){
  var sw=Math.max(0.03,dist(P[11],P[12])),sp=dist(P[27],P[28]);
  var up=P[15].y<P[0].y&&P[16].y<P[0].y,down=P[15].y>P[11].y&&P[16].y>P[12].y;
  if(st.phase!=='open'){
    if(up&&sp>1.3*sw){st.phase='open';st.sp=sp;st.as=Math.abs(P[15].y-P[16].y)/sw;st.upAt=0;return;}
    if(up){if(!st.upAt)st.upAt=now();else if(now()-st.upAt>800)issue('jack_legs');}else{st.upAt=0;}
    return;
  }
  st.sp=Math.max(st.sp,sp);st.as=Math.max(st.as,Math.abs(P[15].y-P[16].y)/sw);
  if(down&&sp<1.2*sw){st.phase='closed';if(st.as>0.6)issue('arms_asym');rep(st.sp/(2.2*sw)*100,100-Math.max(0,st.as-0.15)*120);}
};
K.arms=function(P){
  var s=mid(P[11],P[12]),h=mid(P[23],P[24]),tor=Math.max(0.05,dist(s,h)),sw=Math.max(0.03,dist(P[11],P[12]));
  var up=P[15].y<P[0].y&&P[16].y<P[0].y,down=P[15].y>s.y+0.5*tor&&P[16].y>s.y+0.5*tor;
  var el=Math.min(ang(P[11],P[13],P[15]),ang(P[12],P[14],P[16]));
  if(st.phase!=='up'){if(up){st.phase='up';st.hi=0;st.el=el;st.as=0;}return;}
  var hi=(s.y-(P[15].y+P[16].y)/2)/tor;st.hi=Math.max(st.hi,hi);st.el=Math.min(st.el,el);st.as=Math.max(st.as,Math.abs(P[15].y-P[16].y)/sw);
  if(down){st.phase='down';if(st.el<130)issue('elbows');if(st.as>0.5)issue('arms_asym');rep(st.hi/1.1*100,100-Math.max(0,150-st.el)*1.5-Math.max(0,st.as-0.15)*100);}
};
K.bend=function(P){
  var t=lean(P),a=Math.abs(t),sw=Math.max(0.03,dist(P[11],P[12])),hx=mid(P[23],P[24]).x;
  if(st.phase!=='bend'){if(a<6)st.hx=hx;if(a>15&&st.hx!==undefined){st.phase='bend';st.max=a;st.shift=0;}return;}
  st.max=Math.max(st.max,a);st.shift=Math.max(st.shift,Math.abs(hx-st.hx)/sw);
  if(a<6){st.phase='center';if(st.shift>0.4)issue('hips');rep(st.max/25*100,100-Math.max(0,st.shift-0.1)*150);}
};
K.knees=function(P){
  var ln=Math.abs(lean(P));if(!st.s)st.s=[{up:false},{up:false}];
  for(var i=0;i<2;i++){
    var hip=P[23+i],knee=P[25+i],ss=st.s[i];var th=knee.y-hip.y;
    ss.base=ss.base?Math.max(ss.base*0.998,th):th;var base=Math.max(0.03,ss.base);var lift=1-th/base;
    if(!ss.up){if(lift>0.5){ss.up=true;ss.best=lift;}}
    else{ss.best=Math.max(ss.best,lift);if(lift<0.2){ss.up=false;if(ln>20)issue('tilt');if(ss.best<0.7)issue('knees_higher');rep(ss.best/0.9*100,100-Math.max(0,ln-8)*3);}}
  }
};
K.toes=function(P){
  var s=mid(P[11],P[12]),h=mid(P[23],P[24]);var w=(P[15].y+P[16].y)/2,k=(P[25].y+P[26].y)/2,a=(P[27].y+P[28].y)/2;
  var tor=h.y-s.y;st.tb=st.tb?Math.max(st.tb*0.999,tor):tor;
  var kn=Math.min(ang(P[23],P[25],P[27]),ang(P[24],P[26],P[28]));
  if(st.phase!=='down'){if(w>k){st.phase='down';st.low=w;st.kn=kn;}return;}
  st.low=Math.max(st.low,w);st.kn=Math.min(st.kn,kn);
  if(tor>0.8*st.tb){st.phase='up';if(st.kn<140)issue('knees_bent');rep(50+(st.low-k)/Math.max(0.03,a-k)*50,100-Math.max(0,160-st.kn)*2);}
};
K.punch=function(P){
  var sw=Math.max(0.03,dist(P[11],P[12]));if(!st.s)st.s=[{out:false},{out:false}];
  for(var i=0;i<2;i++){
    var sh=P[11+i],el=P[13+i],wr=P[15+i],ss=st.s[i];
    var e=ang(sh,el,wr),reach=Math.abs(wr.x-sh.x)/sw,dy=Math.abs(wr.y-sh.y)/sw;
    if(!ss.out){if(e>150&&reach>0.9){ss.out=true;ss.r=reach;ss.dy=dy;}}
    else{ss.r=Math.max(ss.r,reach);ss.dy=Math.min(ss.dy,dy);if(e<100||reach<0.5){ss.out=false;if(ss.dy>0.5)issue('punch_height');rep(ss.r/1.3*100,100-Math.max(0,ss.dy-0.2)*150);}}
  }
};
function hold(ok,amp,form,P){
  var t=now(),hx=mid(P[23],P[24]).x;
  if(!ok){if(st.h){st.h=null;issue('hold_lost');}return;}
  if(!st.h){st.h={at:t,xs:[],amp:[],form:[]};return;}
  st.h.xs.push(hx);st.h.amp.push(amp);st.h.form.push(form);
  if(t-st.h.at>=1000){
    var sw=Math.max(0.03,dist(P[11],P[12]));var wob=sd(st.h.xs)/sw;
    if(wob>0.08)issue('wobble');
    rep(avg(st.h.amp),avg(st.h.form)-Math.max(0,wob-0.03)*600,1);
    st.h={at:t,xs:[],amp:[],form:[]};
  }
}
K.heron=function(P){
  var h=mid(P[23],P[24]);var la=P[27].y,ra=P[28].y;var legs=Math.max(0.05,Math.max(la,ra)-h.y);var lift=Math.abs(la-ra)/legs;
  hold(lift>0.15,lift/0.35*100,100-Math.abs(lean(P))*3,P);
};
K.plane=function(P){
  var sw=Math.max(0.03,dist(P[11],P[12]));var sp=dist(P[15],P[16])/sw;
  var lvl=(Math.abs(P[15].y-P[11].y)+Math.abs(P[16].y-P[12].y))/2/sw;var ok=sp>2.3&&lvl<0.6;
  if(ok&&lvl>0.4)issue('arms_level');
  hold(ok,sp/3.2*100,100-Math.max(0,lvl-0.1)*150,P);
};

function quality(poses){
  if(light<35)return 'dark';
  if(!poses.length)return 'no_person';
  if(poses.length>1)return 'multiple';
  var p=poses[0],i,maxVis=0;
  for(i=0;i<p.length;i++){var vv=p[i].visibility||0;if(vv>maxVis)maxVis=vv;}
  var key=[11,12,23,24,25,26,27,28];
  if(maxVis>0){for(i=0;i<key.length;i++){if((p[key[i]].visibility||0)<0.4)return 'too_close';}}
  var top=Math.min(p[0].y,p[11].y,p[12].y),bottom=Math.max(p[27].y,p[28].y);
  if(bottom>1.03||top<-0.03)return 'too_close';
  var minX=1,maxX=0;for(i=0;i<key.length;i++){minX=Math.min(minX,p[key[i]].x);maxX=Math.max(maxX,p[key[i]].x);}
  if(minX<-0.03||maxX>1.03)return 'too_close';
  if(bottom-top<0.3)return 'too_far';
  return 'ok';
}
function setStatus(q){var t=now();if(q!==cand){cand=q;candAt=t;return;}if(q!==status&&t-candAt>600){status=q;post({type:'status',s:q});}}
function measure(){try{bx.drawImage(V,0,0,16,12);var d=bx.getImageData(0,0,16,12).data,s=0;for(var i=0;i<d.length;i+=4)s+=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];light=s/(d.length/4);}catch(e){}}
var LINKS=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
var PTS=[0,11,12,13,14,15,16,23,24,25,26,27,28];
function draw(p,ok){
  var w=CV.width,h=CV.height,i;X.lineWidth=Math.max(3,w/160);X.strokeStyle=ok?'#7CFC6A':'#FFC107';X.fillStyle='#FFFFFF';
  for(i=0;i<LINKS.length;i++){var a=p[LINKS[i][0]],b=p[LINKS[i][1]];X.beginPath();X.moveTo(a.x*w,a.y*h);X.lineTo(b.x*w,b.y*h);X.stroke();}
  for(i=0;i<PTS.length;i++){var q=p[PTS[i]];X.beginPath();X.arc(q.x*w,q.y*h,X.lineWidth*1.3,0,6.283);X.fill();}
}
function loop(){
  requestAnimationFrame(loop);
  if(!lm||V.readyState<2)return;
  if(V.currentTime===lastT)return;lastT=V.currentTime;
  if(CV.width!==V.videoWidth||CV.height!==V.videoHeight){CV.width=V.videoWidth;CV.height=V.videoHeight;asp=V.videoWidth/Math.max(1,V.videoHeight);}
  frame++;if(frame%20===1)measure();
  var r;try{r=lm.detectForVideo(V,now());}catch(e){return;}
  var poses=(r&&r.landmarks)||[];
  X.clearRect(0,0,CV.width,CV.height);
  var q=quality(poses);setStatus(q);
  if(poses.length&&skel)draw(poses[0],q==='ok');
  if(status==='ok'&&q==='ok'&&cfg&&st&&!paused){
    var P=poses[0].map(function(l){return {x:l.x*asp,y:l.y};});
    try{var fn=K[cfg.kind];if(fn)fn(P);}catch(e){post({type:'log',msg:String(e)});}
  }
}
async function init(){
  try{
    var stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
    V.srcObject=stream;await V.play();
  }catch(e){post({type:'error',code:'camera',msg:String((e&&e.message)||e)});return;}
  try{
    var mp=await import(MP+'/vision_bundle.mjs');
    var files=await mp.FilesetResolver.forVisionTasks(MP+'/wasm');
    var opts=function(d){return {baseOptions:{modelAssetPath:MODEL,delegate:d},runningMode:'VIDEO',numPoses:2,minPoseDetectionConfidence:0.5,minPosePresenceConfidence:0.5,minTrackingConfidence:0.5};};
    try{lm=await mp.PoseLandmarker.createFromOptions(files,opts('GPU'));}catch(e1){lm=await mp.PoseLandmarker.createFromOptions(files,opts('CPU'));}
  }catch(e){post({type:'error',code:'model',msg:String((e&&e.message)||e)});return;}
  post({type:'ready'});
  requestAnimationFrame(loop);
}
init();
</script>
</body>
</html>`;
