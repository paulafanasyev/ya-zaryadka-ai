/*
 * Я-Зарядка AI: camera + MediaPipe Pose loop inside the WebView.
 * Loads the runtime, WASM and model from the APK assets (offline).
 * Falls back to the CDN only if the bundled files cannot be loaded.
 * Nothing leaves the device: frames are processed in memory and dropped.
 */
(function () {
  'use strict';
  var D = window.YZDetector;
  var CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  var CDN_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
  var V = document.getElementById('v');
  var CV = document.getElementById('c');
  var X = CV.getContext('2d');
  var bc = document.createElement('canvas');
  bc.width = 16; bc.height = 12;
  var bx = bc.getContext('2d', { willReadFrequently: true });

  var lm = null, cfg = null, det = null, smooth = D.smoother(0.5);
  var paused = false, skel = true;
  var status = 'init', cand = null, candAt = 0, lastT = -1, frame = 0, light = 128, asp = 0.75;

  var LINKS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
  var PTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

  function log(m) { try { console.log('YZCV ' + m); } catch (e) { /* ignore */ } }
  function post(m) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify(m)); } catch (e) { /* ignore */ }
  }
  function now() { return performance.now(); }
  window.onerror = function (msg) { log('error ' + msg); };

  window.setExercise = function (c) {
    if (!c || typeof c.kind !== 'string') return;
    cfg = { kind: c.kind, target: Number(c.target) || 0 };
    det = D.createDetector(cfg.kind);
    det.reset(now());
    smooth = D.smoother(0.5);
  };
  window.setPaused = function (p) {
    paused = !!p;
    if (det) det.reset(now());
  };
  window.setSkeleton = function (v) {
    skel = !!v;
    if (!skel) X.clearRect(0, 0, CV.width, CV.height);
  };

  function xhr(url, type) {
    return new Promise(function (resolve, reject) {
      var r = new XMLHttpRequest();
      r.open('GET', url, true);
      r.responseType = type;
      r.onload = function () {
        if ((r.status === 0 || r.status === 200) && r.response) resolve(r.response);
        else reject(new Error('load ' + url + ' status ' + r.status));
      };
      r.onerror = function () { reject(new Error('load ' + url)); };
      r.send();
    });
  }
  function blobUrl(data, mime) { return URL.createObjectURL(new Blob([data], { type: mime })); }

  function simdSupported() {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
    } catch (e) { return false; }
  }

  async function loadBundleLocal() {
    try {
      var code = await xhr('vision_bundle.cjs', 'text');
      var mod = { exports: {} };
      (new Function('module', 'exports', 'require', code))(mod, mod.exports, function () { throw new Error('require is not available'); });
      if (mod.exports && mod.exports.PoseLandmarker) return mod.exports;
      log('cjs bundle has no PoseLandmarker');
    } catch (e) {
      log('cjs bundle failed ' + (e && e.message ? e.message : e));
    }
    var mjs = await xhr('vision_bundle.mjs', 'text');
    return await import(blobUrl(mjs, 'text/javascript'));
  }

  async function localFileset() {
    var name = 'wasm/vision_wasm' + (simdSupported() ? '' : '_nosimd') + '_internal';
    var js = await xhr(name + '.js', 'text');
    var wasm = await xhr(name + '.wasm', 'arraybuffer');
    log('wasm ' + name + ' ' + wasm.byteLength + ' bytes');
    return { wasmLoaderPath: blobUrl(js, 'text/javascript'), wasmBinaryPath: blobUrl(wasm, 'application/wasm') };
  }

  async function createLandmarker(mp, files, modelOptions) {
    function opts(delegate) {
      var base = modelOptions();
      base.delegate = delegate;
      return {
        baseOptions: base,
        runningMode: 'VIDEO',
        numPoses: 2,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      };
    }
    try {
      return await mp.PoseLandmarker.createFromOptions(files, opts('GPU'));
    } catch (e) {
      log('gpu delegate failed, using cpu: ' + (e && e.message ? e.message : e));
      return await mp.PoseLandmarker.createFromOptions(files, opts('CPU'));
    }
  }

  function brightness() {
    try {
      bx.drawImage(V, 0, 0, 16, 12);
      var d = bx.getImageData(0, 0, 16, 12).data, s = 0;
      for (var i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
      return s / (d.length / 4);
    } catch (e) { return 128; }
  }

  function draw(p, ok) {
    X.clearRect(0, 0, CV.width, CV.height);
    if (!skel || !p) return;
    var W = CV.width, H = CV.height;
    X.lineWidth = Math.max(3, W / 120);
    X.strokeStyle = ok ? 'rgba(124,252,106,0.95)' : 'rgba(255,196,0,0.95)';
    X.fillStyle = '#FFFFFF';
    for (var i = 0; i < LINKS.length; i++) {
      var a = p[LINKS[i][0]], b = p[LINKS[i][1]];
      X.beginPath(); X.moveTo(a.x * W, a.y * H); X.lineTo(b.x * W, b.y * H); X.stroke();
    }
    for (var j = 0; j < PTS.length; j++) {
      var q = p[PTS[j]];
      X.beginPath(); X.arc(q.x * W, q.y * H, Math.max(4, W / 90), 0, Math.PI * 2); X.fill();
    }
  }

  function setStatus(q, t) {
    if (q === status) { cand = null; return; }
    if (cand !== q) { cand = q; candAt = t; return; }
    if (t - candAt > 600) {
      status = q; cand = null;
      post({ type: 'status', s: q });
    }
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!lm || V.readyState < 2) return;
    if (CV.width !== V.videoWidth && V.videoWidth) {
      CV.width = V.videoWidth; CV.height = V.videoHeight;
      asp = V.videoWidth / Math.max(1, V.videoHeight);
    }
    var t = now();
    if (t - lastT < 30) return;
    lastT = t;
    frame++;
    if (frame % 15 === 0) light = brightness();
    var res;
    try { res = lm.detectForVideo(V, t); } catch (e) { log('detect failed ' + e); return; }
    var poses = (res && res.landmarks) || [];
    var q = D.quality(poses, light);
    setStatus(q, t);
    draw(poses[0], q === 'ok');
    if (q !== 'ok') { smooth = D.smoother(0.5); return; }
    if (status !== 'ok' || !det || paused) return;
    var raw = poses[0], P = [];
    for (var i = 0; i < raw.length; i++) P.push({ x: raw[i].x * asp, y: raw[i].y, visibility: raw[i].visibility });
    var ev = det.update(smooth(P), t);
    for (var k = 0; k < ev.length; k++) post(ev[k]);
  }

  async function init() {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      V.srcObject = stream;
      await V.play();
    } catch (e) {
      log('camera failed ' + (e && e.name ? e.name : e));
      post({ type: 'error', code: 'camera', msg: String(e && e.name ? e.name : e) });
      return;
    }
    var source = 'local';
    try {
      var mp = await loadBundleLocal();
      var files = await localFileset();
      var model = await xhr('pose_landmarker_lite.task', 'arraybuffer');
      log('model ' + model.byteLength + ' bytes');
      lm = await createLandmarker(mp, files, function () { return { modelAssetBuffer: new Uint8Array(model.slice(0)) }; });
    } catch (e) {
      log('local engine failed: ' + (e && e.message ? e.message : e));
      source = 'cdn';
      try {
        var mp2 = await import(CDN + '/vision_bundle.mjs');
        var files2 = await mp2.FilesetResolver.forVisionTasks(CDN + '/wasm');
        lm = await createLandmarker(mp2, files2, function () { return { modelAssetPath: CDN_MODEL }; });
      } catch (e2) {
        log('cdn engine failed: ' + (e2 && e2.message ? e2.message : e2));
        post({ type: 'error', code: 'model', msg: String(e2 && e2.message ? e2.message : e2) });
        return;
      }
    }
    log('ready source=' + source);
    post({ type: 'ready', source: source });
    requestAnimationFrame(loop);
  }

  init();
})();
