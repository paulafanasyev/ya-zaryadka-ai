/*
 * Я-Зарядка AI: exercise detectors on top of MediaPipe Pose landmarks.
 * Pure JavaScript without DOM. Runs inside the WebView (window.YZDetector)
 * and in Node for unit tests (module.exports).
 *
 * Events:
 *   { type: 'rep', n, amp, form, dur }  amp and form are 0..100, dur is seconds
 *   { type: 'form', id }                id is a key of FORM_HINTS in src/pico/phrases.ts
 *
 * Thresholds follow open-source rep counters (MediaPipe pose classification,
 * LearnOpenCV squat analysis, AI gym trainer knee angles) adapted for a frontal
 * phone camera and children. See the project Knowledge Base for sources.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.YZDetector = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NOSE = 0, LS = 11, RS = 12, LE = 13, RE = 14, LW = 15, RW = 16,
    LH = 23, RH = 24, LK = 25, RK = 26, LA = 27, RA = 28;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function cl(v) { return clamp(v, 0, 100); }
  function ang(a, b, c) {
    var ax = a.x - b.x, ay = a.y - b.y, cx = c.x - b.x, cy = c.y - b.y;
    var d = Math.sqrt(ax * ax + ay * ay) * Math.sqrt(cx * cx + cy * cy);
    if (d < 1e-9) return 180;
    return Math.acos(clamp((ax * cx + ay * cy) / d, -1, 1)) * 180 / Math.PI;
  }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function lean(P) {
    var s = mid(P[LS], P[RS]), h = mid(P[LH], P[RH]);
    return Math.atan2(s.x - h.x, h.y - s.y) * 180 / Math.PI;
  }
  function avg(a) { if (!a.length) return 0; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sd(a) {
    if (a.length < 2) return 0;
    var m = avg(a), v = 0;
    for (var i = 0; i < a.length; i++) v += (a[i] - m) * (a[i] - m);
    return Math.sqrt(v / a.length);
  }
  function shoulderW(P) { return Math.max(0.03, dist(P[LS], P[RS])); }

  // Depth-based squat detector: 1.0 = full squat (hip drop 30% of the standing
  // leg/torso ratio or knee angle 90 deg). Works for frontal and side cameras.
  var SQUAT = { down: 0.6, up: 0.2, partial: 0.3, ampAt: 1.0, minRepMs: 500 };
  var SPRING = { down: 0.3, up: 0.12, partial: 0, ampAt: 0.5, minRepMs: 300 };

  function createDetector(kind) {
    var st = { t0: null, lastRep: null, issues: {}, n: 0, phase: 'idle' };
    var out = [];

    function emitRep(t, amp, form, dur, minMs) {
      if (minMs && st.lastRep !== null && t - st.lastRep < minMs) return false;
      var d = dur != null ? dur : Math.max(0.3, (t - (st.t0 === null ? t : st.t0)) / 1000);
      st.t0 = t;
      st.lastRep = t;
      st.n++;
      out.push({ type: 'rep', n: st.n, amp: Math.round(cl(amp)), form: Math.round(cl(form)), dur: Math.round(d * 100) / 100 });
      return true;
    }
    function issue(t, id) {
      if (st.issues[id] !== undefined && t - st.issues[id] < 5000) return;
      st.issues[id] = t;
      out.push({ type: 'form', id: id });
    }

    function squatLike(P, t, c) {
      var h = mid(P[LH], P[RH]), a = mid(P[LA], P[RA]), s = mid(P[LS], P[RS]);
      var torso = Math.max(0.03, h.y - s.y);
      var ratio = Math.max(0, a.y - h.y) / torso;
      st.base = st.base ? Math.max(st.base * 0.999, ratio) : ratio;
      var drop = clamp(1 - ratio / Math.max(0.1, st.base), 0, 1);
      var kA = (ang(P[LH], P[LK], P[LA]) + ang(P[RH], P[RK], P[RA])) / 2;
      var depth = Math.max(drop / 0.3, clamp((170 - kA) / 80, 0, 1.5));
      var w = shoulderW(P), ln = Math.abs(lean(P)), as = Math.abs(P[LK].y - P[RK].y) / w;
      if (st.phase !== 'down') {
        if (depth >= c.down) {
          st.phase = 'down'; st.max = depth; st.ln = ln; st.as = as; st.part = 0;
          return;
        }
        if (c.partial) {
          if (depth >= c.partial) st.part = Math.max(st.part || 0, depth);
          else if (st.part && depth <= c.up) { st.part = 0; issue(t, 'shallow'); }
        }
        return;
      }
      st.max = Math.max(st.max, depth);
      st.ln = Math.max(st.ln, ln);
      st.as = Math.max(st.as, as);
      if (depth <= c.up) {
        st.phase = 'up';
        st.part = 0;
        if (st.ln > 20) issue(t, 'tilt');
        if (st.as > 0.5) issue(t, 'legs_asym');
        var amp = clamp(st.max / c.ampAt, 0, 1) * 100;
        var form = 100 - Math.max(0, st.ln - 8) * 3 - Math.max(0, st.as - 0.2) * 80;
        emitRep(t, amp, form, null, c.minRepMs);
      }
    }

    function jack(P, t) {
      var w = shoulderW(P), sp = dist(P[LA], P[RA]);
      var up = P[LW].y < P[NOSE].y && P[RW].y < P[NOSE].y;
      var down = P[LW].y > P[LS].y && P[RW].y > P[RS].y;
      if (st.phase !== 'open') {
        if (up && sp > 1.3 * w) {
          st.phase = 'open'; st.sp = sp; st.as = Math.abs(P[LW].y - P[RW].y) / w; st.upAt = null;
          return;
        }
        if (up) {
          if (st.upAt == null) st.upAt = t;
          else if (t - st.upAt > 800) issue(t, 'jack_legs');
        } else {
          st.upAt = null;
        }
        return;
      }
      st.sp = Math.max(st.sp, sp);
      st.as = Math.max(st.as, Math.abs(P[LW].y - P[RW].y) / w);
      if (down && sp < 1.15 * w) {
        st.phase = 'closed';
        if (st.as > 0.6) issue(t, 'arms_asym');
        emitRep(t, st.sp / (2.0 * w) * 100, 100 - Math.max(0, st.as - 0.15) * 120, null, 350);
      }
    }

    function arms(P, t) {
      var s = mid(P[LS], P[RS]), h = mid(P[LH], P[RH]), tor = Math.max(0.05, dist(s, h)), w = shoulderW(P);
      var lUp = P[LW].y < P[NOSE].y, rUp = P[RW].y < P[NOSE].y;
      var down = P[LW].y > s.y + 0.5 * tor && P[RW].y > s.y + 0.5 * tor;
      var el = Math.min(ang(P[LS], P[LE], P[LW]), ang(P[RS], P[RE], P[RW]));
      if (st.phase !== 'up') {
        if (lUp && rUp) {
          st.phase = 'up'; st.hi = 0; st.el = el; st.as = 0; st.oneAt = null;
          return;
        }
        if (lUp !== rUp) {
          if (st.oneAt == null) st.oneAt = t;
          else if (t - st.oneAt > 1000) issue(t, 'arms_asym');
        } else {
          st.oneAt = null;
        }
        return;
      }
      var hi = (s.y - (P[LW].y + P[RW].y) / 2) / tor;
      st.hi = Math.max(st.hi, hi);
      st.el = Math.min(st.el, el);
      st.as = Math.max(st.as, Math.abs(P[LW].y - P[RW].y) / w);
      if (down) {
        st.phase = 'down';
        if (st.el < 130) issue(t, 'elbows');
        if (st.as > 0.5) issue(t, 'arms_asym');
        emitRep(t, st.hi / 1.1 * 100, 100 - Math.max(0, 150 - st.el) * 1.5 - Math.max(0, st.as - 0.15) * 100, null, 500);
      }
    }

    function bend(P, t) {
      var a = Math.abs(lean(P)), w = shoulderW(P), hx = mid(P[LH], P[RH]).x;
      if (st.phase !== 'bend') {
        if (a < 6) st.hx = hx;
        if (a > 15 && st.hx !== undefined) { st.phase = 'bend'; st.max = a; st.shift = 0; }
        return;
      }
      st.max = Math.max(st.max, a);
      st.shift = Math.max(st.shift, Math.abs(hx - st.hx) / w);
      if (a < 6) {
        st.phase = 'center';
        if (st.shift > 0.4) issue(t, 'hips');
        emitRep(t, st.max / 25 * 100, 100 - Math.max(0, st.shift - 0.1) * 150, null, 500);
      }
    }

    function knees(P, t) {
      var ln = Math.abs(lean(P));
      if (!st.legs) st.legs = [{ up: false }, { up: false }];
      for (var i = 0; i < 2; i++) {
        var hip = P[LH + i], knee = P[LK + i], ss = st.legs[i];
        var th = knee.y - hip.y;
        ss.base = ss.base ? Math.max(ss.base * 0.998, th) : th;
        var lift = 1 - th / Math.max(0.03, ss.base);
        if (!ss.up) {
          if (lift > 0.5) { ss.up = true; ss.best = lift; }
          continue;
        }
        ss.best = Math.max(ss.best, lift);
        if (lift < 0.2) {
          ss.up = false;
          if (ln > 20) issue(t, 'tilt');
          if (ss.best < 0.7) issue(t, 'knees_higher');
          if (ss.last === undefined || t - ss.last >= 250) {
            ss.last = t;
            emitRep(t, ss.best / 0.9 * 100, 100 - Math.max(0, ln - 8) * 3, null, 0);
          }
        }
      }
    }

    function toes(P, t) {
      var s = mid(P[LS], P[RS]), h = mid(P[LH], P[RH]);
      var wy = (P[LW].y + P[RW].y) / 2, ky = (P[LK].y + P[RK].y) / 2, ay = (P[LA].y + P[RA].y) / 2;
      var tor = h.y - s.y;
      st.tb = st.tb ? Math.max(st.tb * 0.999, tor) : tor;
      var kn = Math.min(ang(P[LH], P[LK], P[LA]), ang(P[RH], P[RK], P[RA]));
      if (st.phase !== 'down') {
        if (wy > ky) { st.phase = 'down'; st.low = wy; st.kn = kn; }
        return;
      }
      st.low = Math.max(st.low, wy);
      st.kn = Math.min(st.kn, kn);
      if (wy < h.y && tor > 0.8 * st.tb) {
        st.phase = 'up';
        if (st.kn < 140) issue(t, 'knees_bent');
        emitRep(t, 50 + (st.low - ky) / Math.max(0.03, ay - ky) * 50, 100 - Math.max(0, 160 - st.kn) * 2, null, 600);
      }
    }

    function punch(P, t) {
      var w = shoulderW(P);
      if (!st.arms) st.arms = [{ out: false }, { out: false }];
      for (var i = 0; i < 2; i++) {
        var sh = P[LS + i], el = P[LE + i], wr = P[LW + i], ss = st.arms[i];
        var ext = Math.abs(wr.x - sh.x) / w;
        var e = ang(sh, el, wr);
        if (!ss.out) {
          if (ext > 1.1 && e > 140) { ss.out = true; ss.ext = ext; ss.dy = Math.abs(wr.y - sh.y) / w; ss.e = e; }
          continue;
        }
        ss.ext = Math.max(ss.ext, ext);
        ss.dy = Math.max(ss.dy, Math.abs(wr.y - sh.y) / w);
        ss.e = Math.max(ss.e, e);
        if (ext < 0.6) {
          ss.out = false;
          if (ss.dy > 0.5) issue(t, 'punch_height');
          if (ss.last === undefined || t - ss.last >= 200) {
            ss.last = t;
            emitRep(t, ss.ext / 1.6 * 100, 100 - Math.max(0, ss.dy - 0.2) * 120 - Math.max(0, 165 - ss.e), null, 0);
          }
        }
      }
    }

    // Static holds: one rep per second. Short tracking gaps (< 400 ms) do not
    // break the hold, so landmark jitter does not punish the child.
    function hold(P, t, ok, amp, form) {
      var hx = mid(P[LH], P[RH]).x;
      if (!ok) {
        if (st.h) {
          if (st.h.lostAt === null) st.h.lostAt = t;
          else if (t - st.h.lostAt > 400) { st.h = null; issue(t, 'hold_lost'); }
        }
        return;
      }
      if (!st.h) { st.h = { at: t, xs: [], amp: [], form: [], lostAt: null }; return; }
      st.h.lostAt = null;
      st.h.xs.push(hx);
      st.h.amp.push(amp);
      st.h.form.push(form);
      if (t - st.h.at >= 1000) {
        var wob = sd(st.h.xs) / shoulderW(P);
        if (wob > 0.08) issue(t, 'wobble');
        emitRep(t, avg(st.h.amp), avg(st.h.form) - Math.max(0, wob - 0.03) * 600, 1, 0);
        st.h = { at: t, xs: [], amp: [], form: [], lostAt: null };
      }
    }

    function heron(P, t) {
      var h = mid(P[LH], P[RH]);
      var la = P[LA].y, ra = P[RA].y;
      var legs = Math.max(0.05, Math.max(la, ra) - h.y);
      var lift = Math.abs(la - ra) / legs;
      hold(P, t, lift > 0.15, lift / 0.35 * 100, 100 - Math.abs(lean(P)) * 3);
    }

    function plane(P, t) {
      var w = shoulderW(P), sp = Math.abs(P[LW].x - P[RW].x) / w;
      var s = mid(P[LS], P[RS]);
      var level = (Math.abs(P[LW].y - s.y) + Math.abs(P[RW].y - s.y)) / 2 / w;
      var ok = sp > 2.3 && level < 0.6;
      if (ok && level > 0.35) issue(t, 'arms_level');
      hold(P, t, ok, sp / 3.2 * 100, 100 - Math.max(0, level - 0.1) * 150);
    }

    var FN = {
      squat: function (P, t) { squatLike(P, t, SQUAT); },
      spring: function (P, t) { squatLike(P, t, SPRING); },
      jack: jack, arms: arms, bend: bend, knees: knees,
      toes: toes, punch: punch, heron: heron, plane: plane
    };
    var fn = FN[kind] || null;

    return {
      kind: kind,
      supported: !!fn,
      reset: function (t) { st.t0 = t; st.h = null; },
      update: function (P, t) {
        out = [];
        if (fn && P && P.length >= 33) fn(P, t);
        return out;
      },
      count: function () { return st.n; }
    };
  }

  // Frame quality check. Order matters: light first, then presence, then framing.
  function quality(poses, light) {
    if (typeof light === 'number' && light < 35) return 'dark';
    if (!poses || !poses.length) return 'no_person';
    if (poses.length > 1) return 'multiple';
    var p = poses[0], i;
    var key = [LS, RS, LH, RH, LK, RK, LA, RA];
    for (i = 0; i < key.length; i++) {
      var v = p[key[i]].visibility;
      if (typeof v === 'number' && v < 0.4) return 'too_close';
    }
    var top = Math.min(p[NOSE].y, p[LS].y, p[RS].y), bottom = Math.max(p[LA].y, p[RA].y);
    var minX = 1, maxX = 0;
    for (i = 0; i < key.length; i++) { minX = Math.min(minX, p[key[i]].x); maxX = Math.max(maxX, p[key[i]].x); }
    if (bottom > 1.03 || top < -0.03 || minX < -0.03 || maxX > 1.03) return 'too_close';
    if (bottom - top < 0.3) return 'too_far';
    return 'ok';
  }

  // Exponential smoothing of landmarks (alpha 0.5 is about a 3-frame window).
  function smoother(alpha) {
    var prev = null;
    return function (P) {
      var i, nx;
      if (!prev || prev.length !== P.length) {
        prev = [];
        for (i = 0; i < P.length; i++) prev.push({ x: P[i].x, y: P[i].y, visibility: P[i].visibility });
        return prev;
      }
      nx = [];
      for (i = 0; i < P.length; i++) {
        nx.push({ x: prev[i].x + alpha * (P[i].x - prev[i].x), y: prev[i].y + alpha * (P[i].y - prev[i].y), visibility: P[i].visibility });
      }
      prev = nx;
      return nx;
    };
  }

  return {
    KINDS: ['squat', 'spring', 'jack', 'arms', 'bend', 'knees', 'toes', 'punch', 'heron', 'plane'],
    createDetector: createDetector,
    quality: quality,
    smoother: smoother,
    geometry: { ang: ang, mid: mid, dist: dist, lean: lean }
  };
});
