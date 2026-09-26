'use strict';
// Unit tests for the CV detectors with synthetic MediaPipe-like landmarks.
// Run: node --test cv-web/test/detector.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../detector.js');

const STEP = 33; // ms per frame, about 30 fps

function base() {
  const P = [];
  for (let i = 0; i < 33; i++) P.push({ x: 0.5, y: 0.5, visibility: 0.99 });
  const set = (i, x, y) => { P[i] = { x, y, visibility: 0.99 }; };
  set(0, 0.5, 0.15);
  set(11, 0.44, 0.25); set(12, 0.56, 0.25);
  set(13, 0.42, 0.36); set(14, 0.58, 0.36);
  set(15, 0.41, 0.46); set(16, 0.59, 0.46);
  set(23, 0.46, 0.5); set(24, 0.54, 0.5);
  set(25, 0.46, 0.68); set(26, 0.54, 0.68);
  set(27, 0.46, 0.86); set(28, 0.54, 0.86);
  return P;
}
const clone = (P) => P.map((l) => ({ ...l }));
const hold = (P, n) => Array.from({ length: n }, () => clone(P));
function ramp(fn, from, to, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(fn(from + (to - from) * (i / (n - 1))));
  return out;
}
function scale(P, k) { return P.map((l) => ({ ...l, x: 0.5 + (l.x - 0.5) * k, y: 0.5 + (l.y - 0.5) * k })); }
function shift(P, dy) { return P.map((l) => ({ ...l, y: l.y + dy })); }

function squatPose(d) {
  const P = base();
  const drop = d * 0.3 * 0.36;
  for (const i of [0, 11, 12, 13, 14, 15, 16, 23, 24]) P[i].y += drop;
  P[25].y += drop / 2; P[26].y += drop / 2;
  P[25].x -= 0.02 * d; P[26].x += 0.02 * d;
  return P;
}
function jackOpen() {
  const P = base();
  P[13] = { x: 0.40, y: 0.16, visibility: 0.99 }; P[14] = { x: 0.60, y: 0.16, visibility: 0.99 };
  P[15] = { x: 0.40, y: 0.08, visibility: 0.99 }; P[16] = { x: 0.60, y: 0.08, visibility: 0.99 };
  P[25] = { x: 0.40, y: 0.68, visibility: 0.99 }; P[26] = { x: 0.60, y: 0.68, visibility: 0.99 };
  P[27] = { x: 0.36, y: 0.86, visibility: 0.99 }; P[28] = { x: 0.64, y: 0.86, visibility: 0.99 };
  return P;
}
function armsUp() {
  const P = base();
  P[13] = { x: 0.44, y: 0.12, visibility: 0.99 }; P[14] = { x: 0.56, y: 0.12, visibility: 0.99 };
  P[15] = { x: 0.44, y: 0.02, visibility: 0.99 }; P[16] = { x: 0.56, y: 0.02, visibility: 0.99 };
  return P;
}
function heronPose() {
  const P = base();
  P[25].y = 0.60; P[27].y = 0.70;
  return P;
}
function kneeUp(side) {
  const P = base();
  P[25 + side].y = 0.52; P[27 + side].y = 0.66;
  return P;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function noisy(P, amp, r) { return P.map((l) => ({ ...l, x: l.x + (r() * 2 - 1) * amp, y: l.y + (r() * 2 - 1) * amp })); }

function run(kind, frames) {
  const det = D.createDetector(kind);
  det.reset(0);
  const ev = [];
  frames.forEach((P, k) => { for (const e of det.update(P, k * STEP)) ev.push(e); });
  return ev;
}
const reps = (ev) => ev.filter((e) => e.type === 'rep');
const forms = (ev) => ev.filter((e) => e.type === 'form').map((e) => e.id);

test('all kinds are supported', () => {
  for (const k of D.KINDS) assert.equal(D.createDetector(k).supported, true, k);
  assert.equal(D.createDetector('unknown').supported, false);
});

test('squat: 3 full squats give 3 reps with high amplitude and form', () => {
  let f = hold(base(), 10);
  for (let i = 0; i < 3; i++) f = f.concat(ramp(squatPose, 0, 1, 15), ramp(squatPose, 1, 0, 15), hold(base(), 5));
  const r = reps(run('squat', f));
  assert.equal(r.length, 3);
  for (const x of r) {
    assert.ok(x.amp >= 95, 'amp ' + x.amp);
    assert.ok(x.form >= 90, 'form ' + x.form);
    assert.ok(x.dur > 0.5 && x.dur < 2, 'dur ' + x.dur);
  }
});

test('squat: shallow dips are not counted and give a hint', () => {
  let f = hold(base(), 10);
  for (let i = 0; i < 2; i++) f = f.concat(ramp(squatPose, 0, 0.45, 15), ramp(squatPose, 0.45, 0, 15), hold(base(), 5));
  const ev = run('squat', f);
  assert.equal(reps(ev).length, 0);
  assert.ok(forms(ev).includes('shallow'));
});

test('squat and spring: standing still with jitter gives no reps', () => {
  const r = rng(42);
  const f = Array.from({ length: 300 }, () => noisy(base(), 0.002, r));
  assert.equal(reps(run('squat', f)).length, 0);
  assert.equal(reps(run('spring', f)).length, 0);
});

test('squat: walking away from the camera is not a squat', () => {
  const f = [];
  for (let i = 0; i < 90; i++) f.push(scale(base(), 1 - 0.2 * (i / 89)));
  for (let i = 0; i < 90; i++) f.push(scale(base(), 0.8 + 0.2 * (i / 89)));
  assert.equal(reps(run('squat', f)).length, 0);
});

test('spring: small bends are counted', () => {
  let f = hold(base(), 10);
  for (let i = 0; i < 4; i++) f = f.concat(ramp(squatPose, 0, 0.45, 8), ramp(squatPose, 0.45, 0, 8), hold(base(), 3));
  assert.equal(reps(run('spring', f)).length, 4);
});

test('jack: 5 jumping jacks give 5 reps', () => {
  let f = hold(base(), 5);
  for (let i = 0; i < 5; i++) f = f.concat(hold(jackOpen(), 8), hold(base(), 8));
  const r = reps(run('jack', f));
  assert.equal(r.length, 5);
  assert.ok(r[0].amp >= 90);
});

test('arms: 4 raises give 4 reps', () => {
  let f = hold(base(), 5);
  for (let i = 0; i < 4; i++) f = f.concat(hold(armsUp(), 10), hold(base(), 10));
  const r = reps(run('arms', f));
  assert.equal(r.length, 4);
  assert.ok(r[0].form >= 90, 'form ' + r[0].form);
});

test('knees: 6 alternating knee lifts give 6 reps', () => {
  let f = hold(base(), 5);
  for (let i = 0; i < 3; i++) f = f.concat(hold(kneeUp(0), 6), hold(base(), 6), hold(kneeUp(1), 6), hold(base(), 6));
  const ev = run('knees', f);
  assert.equal(reps(ev).length, 6);
  assert.ok(!forms(ev).includes('knees_higher'));
});

test('heron: 5.5 s on one leg gives 5 one-second reps', () => {
  const f = hold(base(), 10).concat(hold(heronPose(), 167));
  const r = reps(run('heron', f));
  assert.equal(r.length, 5);
  for (const x of r) assert.equal(x.dur, 1);
});

test('heron: a short tracking gap does not break the hold', () => {
  const f = hold(heronPose(), 90).concat(hold(base(), 6), hold(heronPose(), 90));
  const ev = run('heron', f);
  assert.equal(reps(ev).length, 5);
  assert.ok(!forms(ev).includes('hold_lost'));
});

test('heron: a long gap breaks the hold', () => {
  const f = hold(heronPose(), 60).concat(hold(base(), 20));
  assert.ok(forms(run('heron', f)).includes('hold_lost'));
});

test('quality checks', () => {
  assert.equal(D.quality([], 128), 'no_person');
  assert.equal(D.quality([base(), base()], 128), 'multiple');
  assert.equal(D.quality([base()], 20), 'dark');
  assert.equal(D.quality([base()], 128), 'ok');
  assert.equal(D.quality([scale(base(), 0.3)], 128), 'too_far');
  assert.equal(D.quality([shift(base(), 0.2)], 128), 'too_close');
});

test('smoother damps jitter', () => {
  const sm = D.smoother(0.5);
  const a = base();
  sm(a);
  const b = shift(base(), 0.1);
  const out = sm(b);
  assert.ok(Math.abs(out[0].y - (a[0].y + 0.05)) < 1e-9);
});
