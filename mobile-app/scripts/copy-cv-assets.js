#!/usr/bin/env node
/*
 * Copies the offline CV page, the MediaPipe Tasks Vision runtime (JS + WASM)
 * and the pose model into android/app/src/main/assets/pose so the app works
 * without internet. Run after `expo prebuild`.
 *
 * Usage: node scripts/copy-cv-assets.js [path/to/pose_landmarker_lite.task]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const modelSrc = path.resolve(process.argv[2] || path.join(root, '.cache', 'pose_landmarker_lite.task'));
const dest = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'pose');
const tv = path.join(root, 'node_modules', '@mediapipe', 'tasks-vision');

function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }

function copy(src, rel, required) {
  if (!fs.existsSync(src)) {
    if (required) throw new Error('Missing required CV asset: ' + src);
    console.log('skip (missing): ' + src);
    return null;
  }
  const d = path.join(dest, rel);
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.copyFileSync(src, d);
  const size = fs.statSync(d).size;
  const hash = sha(d);
  console.log(rel.padEnd(42) + String(size).padStart(10) + '  ' + hash);
  return { file: rel, size, sha256: hash };
}

if (!fs.existsSync(path.join(root, 'android'))) {
  throw new Error('android/ folder not found. Run `npx expo prebuild --platform android` first.');
}
if (!fs.existsSync(tv)) {
  throw new Error('@mediapipe/tasks-vision is not installed. Run npm install.');
}

fs.rmSync(dest, { recursive: true, force: true });
const files = [];
for (const f of ['index.html', 'app.js', 'detector.js']) files.push(copy(path.join(root, 'cv-web', f), f, true));
files.push(copy(path.join(tv, 'vision_bundle.cjs'), 'vision_bundle.cjs', false));
files.push(copy(path.join(tv, 'vision_bundle.mjs'), 'vision_bundle.mjs', true));
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) {
  files.push(copy(path.join(tv, 'wasm', f), 'wasm/' + f, f.indexOf('nosimd') < 0));
}
const model = copy(modelSrc, 'pose_landmarker_lite.task', true);
if (model.size < 1000000) throw new Error('Pose model looks truncated: ' + model.size + ' bytes');

const version = JSON.parse(fs.readFileSync(path.join(tv, 'package.json'), 'utf8')).version;
fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify({ tasksVision: version, files: files.filter(Boolean) }, null, 2));
console.log('CV assets ready in ' + path.relative(root, dest) + ' (tasks-vision ' + version + ')');
