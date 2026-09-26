import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, PermissionsAndroid, Platform, ActivityIndicator, AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { POSE_HTML } from '../cv/poseHtml';
import { PROGRAMS, EXERCISES, targetFor } from '../cv/exercises';
import { computeScore, heartsForScore, RepMetric } from '../cv/score';
import { FRAME_HINTS, FORM_HINTS, STATUS_LABEL, motivation } from '../pico/phrases';
import { useStore, earn, uid, piggyShare } from '../store/store';
import { Pico, DarkButton, GreenBackground } from '../components/ui';
import { C } from '../theme';

type HintKind = 'safety' | 'frame' | 'technique' | 'motivation';

// Offline page bundled into the APK by scripts/copy-cv-assets.js.
const LOCAL_POSE_URI = 'file:///android_asset/pose/index.html';
// Fallback page embedded in JS (loads the engine from CDN).
const INLINE_BASE_URL = 'https://localhost/';
const TRUSTED_PREFIXES = ['file:///android_asset/pose/', INLINE_BASE_URL, 'about:blank'];
const STATUSES = ['init', 'ok', 'no_person', 'too_close', 'too_far', 'multiple', 'dark'];

const isTrustedUrl = (u?: string) => !u || TRUSTED_PREFIXES.some((p) => u.indexOf(p) === 0);
const clamp = (v: any, lo: number, hi: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

export default function WorkoutSessionScreen({ navigation, route }: any) {
  const programId = route.params ? route.params.programId : undefined;
  const program = PROGRAMS.find((p) => p.id === programId) || PROGRAMS[0];
  const { state, update } = useStore();
  const insets = useSafeAreaInsets();
  const age = state.profile ? state.profile.age : 8;
  const items = useMemo(() => program.exercises.map((id) => ({ ...EXERCISES[id], target: targetFor(EXERCISES[id], age) })), [program.id, age]);

  const [perm, setPerm] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [source, setSource] = useState<'local' | 'inline'>(Platform.OS === 'android' ? 'local' : 'inline');
  const [engine, setEngine] = useState<'loading' | 'ready' | 'error'>('loading');
  const [engineError, setEngineError] = useState('');
  const [status, setStatus] = useState('init');
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [skeleton, setSkeleton] = useState(state.settings.showSkeleton);
  const [bubble, setBubble] = useState('Привет! Я Пико. Встань перед камерой, чтобы я видел тебя целиком.');

  const web = useRef<WebView>(null);
  const metrics = useRef<RepMetric[][]>(items.map(() => []));
  const lastHintAt = useRef(0);
  const finished = useRef(false);
  const advancing = useRef(false);
  const indexRef = useRef(0);
  const countRef = useRef(0);
  const pausedRef = useRef(false);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const say = useCallback(
    (text: string, kind: HintKind, force = false) => {
      const t = Date.now();
      const gap = kind === 'technique' || kind === 'motivation' ? state.settings.hintIntervalSec * 1000 : 3000;
      if (!force && t - lastHintAt.current < gap) return;
      lastHintAt.current = t;
      setBubble(text);
      if (state.settings.voice) {
        Speech.stop();
        Speech.speak(text, { language: 'ru-RU', rate: 1.0, pitch: 1.15 });
      }
    },
    [state.settings.hintIntervalSec, state.settings.voice]
  );

  const askPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setPerm('granted');
      return;
    }
    try {
      const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Камера для зарядки',
        message: 'Пико смотрит на движения через камеру. Видео обрабатывается только на телефоне и никуда не отправляется.',
        buttonPositive: 'Разрешить',
        buttonNegative: 'Не сейчас',
      });
      setPerm(r === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
    } catch (e) {
      setPerm('denied');
    }
  }, []);

  useEffect(() => {
    askPermission();
    return () => {
      Speech.stop();
    };
  }, []);

  const inject = (js: string) => {
    if (web.current) web.current.injectJavaScript(js + ';true;');
  };
  const sendExercise = (i: number) => {
    const ex = items[i];
    inject('window.setExercise && window.setExercise(' + JSON.stringify({ kind: ex.kind, target: ex.target }) + ')');
  };

  const setPausedBoth = (p: boolean) => {
    pausedRef.current = p;
    setPaused(p);
    inject('window.setPaused && window.setPaused(' + (p ? 'true' : 'false') + ')');
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st !== 'active' && !pausedRef.current) setPausedBoth(true);
    });
    return () => sub.remove();
  }, []);

  const finish = (complete: boolean) => {
    if (finished.current) return;
    finished.current = true;
    Speech.stop();
    const score = computeScore(metrics.current);
    const hearts = heartsForScore(score);
    const toPiggy = piggyShare(state, hearts);
    update((s) => {
      const n = hearts > 0 ? earn(s, hearts, 'Зарядка «' + program.name + '»') : s;
      const rec = { id: uid(), at: Date.now(), program: program.name, reps: score.reps, accuracy: score.accuracy, precision: score.precision, consistency: score.consistency, hearts };
      return { ...n, sessions: [rec].concat(n.sessions).slice(0, 100) };
    });
    navigation.replace('Result', { ...score, hearts, toPiggy, complete, program: program.name });
  };

  const next = () => {
    const i = indexRef.current + 1;
    advancing.current = false;
    if (i >= items.length) {
      finish(true);
      return;
    }
    indexRef.current = i;
    countRef.current = 0;
    setIndex(i);
    setCount(0);
    setElapsed(0);
    sendExercise(i);
    say('Следующее упражнение: ' + items[i].name + '. ' + items[i].cue, 'motivation', true);
  };

  useEffect(() => {
    if (engine !== 'ready' || paused) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [engine, paused]);

  useEffect(() => {
    if (engine === 'ready' && elapsed >= items[index].maxSec && !advancing.current) {
      advancing.current = true;
      next();
    }
  }, [elapsed]);

  const fallbackToInline = () => {
    if (sourceRef.current !== 'local') return false;
    setEngine('loading');
    setSource('inline');
    return true;
  };

  const onMessage = (e: any) => {
    const ne = e && e.nativeEvent ? e.nativeEvent : {};
    if (!isTrustedUrl(ne.url)) return;
    if (typeof ne.data !== 'string' || ne.data.length > 4096) return;
    let m: any;
    try {
      m = JSON.parse(ne.data);
    } catch (err) {
      return;
    }
    if (!m || typeof m.type !== 'string') return;
    if (finished.current) return;
    switch (m.type) {
      case 'ready':
        console.log('YZCV ready source=' + (typeof m.source === 'string' ? m.source : sourceRef.current));
        setEngine('ready');
        sendExercise(indexRef.current);
        inject('window.setSkeleton && window.setSkeleton(' + (skeleton ? 'true' : 'false') + ')');
        say('Если что-то заболит, остановись и скажи взрослым. Начинаем: ' + items[indexRef.current].name + '! ' + items[indexRef.current].cue, 'safety', true);
        break;
      case 'error':
        console.log('YZCV error code=' + String(m.code) + ' source=' + sourceRef.current);
        setEngine('error');
        setEngineError(
          m.code === 'camera'
            ? 'Не удалось включить камеру. Проверь разрешение для камеры в настройках телефона.'
            : 'Не удалось запустить распознавание движений. Попробуй ещё раз.'
        );
        break;
      case 'status': {
        if (typeof m.s !== 'string' || STATUSES.indexOf(m.s) < 0) break;
        setStatus(m.s);
        if (m.s !== 'ok' && FRAME_HINTS[m.s]) say(FRAME_HINTS[m.s], 'frame');
        break;
      }
      case 'rep': {
        const i = indexRef.current;
        if (advancing.current || pausedRef.current) break;
        metrics.current[i].push({ amp: clamp(m.amp, 0, 100), form: clamp(m.form, 0, 100), dur: clamp(m.dur, 0, 60) });
        const c = countRef.current + 1;
        countRef.current = c;
        setCount(c);
        const target = items[i].target;
        if (c >= target) {
          advancing.current = true;
          say(motivation('done', c), 'motivation', true);
          setTimeout(next, 1500);
        } else if (c === target - 2) {
          say(motivation('almost', c), 'motivation');
        } else {
          say(motivation('rep', c), 'motivation');
        }
        break;
      }
      case 'form':
        if (typeof m.id === 'string' && Object.prototype.hasOwnProperty.call(FORM_HINTS, m.id)) say(FORM_HINTS[m.id], 'technique');
        break;
      default:
        break;
    }
  };

  const retry = () => {
    setEngine('loading');
    setEngineError('');
    if (web.current) web.current.reload();
  };

  const toggleSkeleton = () => {
    const v = !skeleton;
    setSkeleton(v);
    inject('window.setSkeleton && window.setSkeleton(' + (v ? 'true' : 'false') + ')');
  };

  if (perm === 'denied') {
    return (
      <GreenBackground>
        <View style={s.center}>
          <Pico size={120} />
          <Text style={s.centerTitle}>Нужна камера</Text>
          <Text style={s.centerText}>Без камеры Пико не увидит движения. Видео не записывается и не покидает телефон.</Text>
          <DarkButton title="РАЗРЕШИТЬ КАМЕРУ" onPress={askPermission} style={{ alignSelf: 'stretch' }} />
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={s.link}>Назад</Text>
          </Pressable>
        </View>
      </GreenBackground>
    );
  }

  const ex = items[index];
  const statusOk = status === 'ok';
  const local = source === 'local';

  return (
    <View style={s.root}>
      {perm === 'granted' ? (
        <WebView
          key={source}
          ref={web}
          style={s.web}
          source={local ? { uri: LOCAL_POSE_URI } : { html: POSE_HTML, baseUrl: INLINE_BASE_URL }}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(req) => {
            const u = req.url || '';
            if (u.indexOf('blob:') === 0 || u.indexOf('data:') === 0) return true;
            return isTrustedUrl(u);
          }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess={local}
          allowFileAccessFromFileURLs={local}
          allowUniversalAccessFromFileURLs={local}
          mixedContentMode="never"
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically={false}
          geolocationEnabled={false}
          thirdPartyCookiesEnabled={false}
          saveFormDataDisabled
          webviewDebuggingEnabled={false}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          mediaCapturePermissionGrantType="grant"
          onMessage={onMessage}
          onError={() => {
            if (!fallbackToInline()) {
              setEngine('error');
              setEngineError('Не удалось запустить распознавание движений. Попробуй ещё раз.');
            }
          }}
          onHttpError={() => {
            fallbackToInline();
          }}
          androidLayerType="hardware"
        />
      ) : null}

      <View style={[s.top, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => finish(false)} style={s.round} accessibilityLabel="Завершить">
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Text style={s.exName} numberOfLines={1}>
            {index + 1}/{items.length}. {ex.name}
          </Text>
          <View style={[s.status, { backgroundColor: statusOk ? C.accent : C.warn }]}>
            <Text style={s.statusText}>{STATUS_LABEL[status] || status}</Text>
          </View>
        </View>
        <View style={s.counter}>
          <Text style={s.counterBig}>
            {count}/{ex.target}
          </Text>
          <Text style={s.counterSmall}>
            {ex.unit} · {elapsed} сек
          </Text>
        </View>
      </View>

      {engine === 'loading' ? (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={s.overlayText}>Пико готовится смотреть на твою зарядку...</Text>
        </View>
      ) : null}
      {engine === 'error' ? (
        <View style={s.overlay}>
          <Text style={s.overlayText}>{engineError}</Text>
          <DarkButton title="ПОПРОБОВАТЬ СНОВА" onPress={retry} style={{ alignSelf: 'stretch', marginHorizontal: 24 }} />
        </View>
      ) : null}

      <View style={[s.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.picoRow}>
          <Pico size={70} />
          <View style={s.bubble}>
            <Text style={s.bubbleText}>{bubble}</Text>
          </View>
        </View>
        <View style={s.controls}>
          <Pressable onPress={toggleSkeleton} style={s.ctrl} accessibilityLabel="Скелет">
            <Ionicons name={skeleton ? 'body' : 'body-outline'} size={22} color="#FFFFFF" />
            <Text style={s.ctrlText}>Скелет</Text>
          </Pressable>
          <Pressable onPress={() => setPausedBoth(!paused)} style={[s.ctrl, s.ctrlMain]}>
            <Ionicons name={paused ? 'play' : 'pause'} size={26} color={C.charcoal} />
            <Text style={[s.ctrlText, { color: C.charcoal }]}>{paused ? 'Дальше' : 'Пауза'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!advancing.current) {
                advancing.current = true;
                next();
              }
            }}
            style={s.ctrl}
          >
            <Ionicons name="play-skip-forward" size={22} color="#FFFFFF" />
            <Text style={s.ctrlText}>Следующее</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1B6E35' },
  web: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#1B6E35' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 12 },
  centerText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginVertical: 12, lineHeight: 22 },
  link: { color: '#FFFFFF', fontSize: 16, textDecorationLine: 'underline', marginTop: 12 },
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10, backgroundColor: 'rgba(27,110,53,0.75)' },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  exName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  status: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  counter: { alignItems: 'flex-end' },
  counterBig: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  counterSmall: { color: '#FFFFFF', fontSize: 12 },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(27,110,53,0.85)', padding: 24 },
  overlayText: { color: '#FFFFFF', fontSize: 17, textAlign: 'center', marginVertical: 16, lineHeight: 24 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: 10, backgroundColor: 'rgba(43,46,40,0.8)', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  picoRow: { flexDirection: 'row', alignItems: 'center' },
  bubble: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, marginLeft: 8 },
  bubbleText: { color: C.charcoal, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 12 },
  ctrl: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 6 },
  ctrlMain: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 22 },
  ctrlText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginTop: 2 },
});
