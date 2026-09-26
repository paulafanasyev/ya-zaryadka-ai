import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, DarkButton, AccentButton, GhostButton, ui } from '../components/ui';
import { useStore, decideTask, decideRequest, uid, AppData, TaskCategory } from '../store/store';
import { C, heartsText, fmtDate } from '../theme';

const LOCK_MS = 15 * 60 * 1000;

const CATS: { key: TaskCategory; title: string }[] = [
  { key: 'deed', title: 'Доброе дело' },
  { key: 'habit', title: 'Привычка' },
  { key: 'study', title: 'Учёба' },
  { key: 'creativity', title: 'Творчество' },
];

function Stepper({ label, value, suffix, onChange, min, max, step = 1 }: { label: string; value: number; suffix: string; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <View style={s.stepper}>
      <Text style={s.stepLabel}>{label}</Text>
      <Pressable onPress={() => onChange(Math.max(min, value - step))} style={s.stepBtn}>
        <Ionicons name="remove" size={20} color="#FFFFFF" />
      </Pressable>
      <Text style={s.stepValue}>
        {value}
        {suffix}
      </Text>
      <Pressable onPress={() => onChange(Math.min(max, value + step))} style={s.stepBtn}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export default function ParentModeScreen({ navigation }: any) {
  const { state, update } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalPrice, setGoalPrice] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCat, setTaskCat] = useState<TaskCategory>('deed');
  const [taskHearts, setTaskHearts] = useState(3);
  const last = useRef(Date.now());

  useEffect(() => {
    if (!unlocked) return;
    const t = setInterval(() => {
      if (Date.now() - last.current > LOCK_MS) {
        setUnlocked(false);
        setPin('');
      }
    }, 15000);
    return () => clearInterval(t);
  }, [unlocked]);

  const act = (fn: (s: AppData) => AppData) => {
    last.current = Date.now();
    update(fn);
  };
  const setSetting = (patch: any) => act((st) => ({ ...st, settings: { ...st.settings, ...patch } }));

  if (!unlocked) {
    const creating = !state.parentPin;
    return (
      <Screen title="Родительский режим" onBack={() => navigation.goBack()}>
        <Card>
          <Text style={ui.cardTitle}>{creating ? 'Придумайте PIN-код из 4 цифр' : 'Введите PIN-код'}</Text>
          <TextInput value={pin} onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={4} style={[ui.input, { marginTop: 12 }]} placeholder="PIN" />
          {creating ? (
            <TextInput value={pin2} onChangeText={(t) => setPin2(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={4} style={ui.input} placeholder="Повторите PIN" />
          ) : null}
          {error ? <Text style={ui.error}>{error}</Text> : null}
          <DarkButton
            title={creating ? 'СОХРАНИТЬ PIN' : 'ВОЙТИ'}
            onPress={() => {
              if (pin.length !== 4) {
                setError('Нужно 4 цифры.');
                return;
              }
              if (creating) {
                if (pin !== pin2) {
                  setError('PIN-коды не совпадают.');
                  return;
                }
                update((st) => ({ ...st, parentPin: pin }));
              } else if (pin !== state.parentPin) {
                setError('Неверный PIN-код.');
                return;
              }
              setError('');
              setPin2('');
              last.current = Date.now();
              setUnlocked(true);
            }}
          />
          <Text style={ui.muted}>Режим закрывается сам через 15 минут без действий.</Text>
        </Card>
      </Screen>
    );
  }

  const pendingTasks = state.taskLogs.filter((l) => l.status === 'pending');
  const pendingReq = state.requests.filter((r) => r.status === 'pending');

  return (
    <Screen title="Родительский режим" onBack={() => navigation.goBack()}>
      <GhostButton
        small
        title="ЗАКРЫТЬ РЕЖИМ"
        onPress={() => {
          setUnlocked(false);
          setPin('');
        }}
        style={{ alignSelf: 'flex-end', marginBottom: 8 }}
      />
      {info ? <Text style={[ui.muted, { color: C.danger }]}>{info}</Text> : null}

      <Text style={ui.section}>Ждут подтверждения</Text>
      {pendingTasks.length === 0 && pendingReq.length === 0 ? <Text style={ui.muted}>Нет новых запросов.</Text> : null}
      {pendingTasks.map((l) => (
        <Card key={l.id}>
          <Text style={ui.cardTitle}>{l.title}</Text>
          <Text style={ui.muted}>
            +{heartsText(l.hearts)} · {fmtDate(l.at)}
          </Text>
          <View style={s.btnRow}>
            <AccentButton small title="ПОДТВЕРДИТЬ" onPress={() => act((st) => decideTask(st, l.id, true))} />
            <GhostButton small title="ОТКЛОНИТЬ" onPress={() => act((st) => decideTask(st, l.id, false))} />
          </View>
        </Card>
      ))}
      {pendingReq.map((r) => (
        <Card key={r.id}>
          <Text style={ui.cardTitle}>{r.kind === 'withdraw' ? 'Вывод из Копилки' : 'Вознаграждение: ' + r.title}</Text>
          <Text style={ui.muted}>
            {heartsText(r.amount)} · {fmtDate(r.at)}
          </Text>
          <View style={s.btnRow}>
            <AccentButton
              small
              title="ОДОБРИТЬ"
              onPress={() => {
                const res = decideRequest(state, r.id, true);
                setInfo(res.error || '');
                if (!res.error) act((st) => decideRequest(st, r.id, true).s);
              }}
            />
            <GhostButton small title="ОТКЛОНИТЬ" onPress={() => act((st) => decideRequest(st, r.id, false).s)} />
          </View>
        </Card>
      ))}

      <Text style={ui.section}>Настройки</Text>
      <Card>
        <Stepper label="В Копилку от награды" value={state.settings.piggyPercent} suffix="%" min={0} max={50} step={5} onChange={(v) => setSetting({ piggyPercent: v })} />
        <Stepper label="Процент Копилки в неделю" value={state.settings.interestPercent} suffix="%" min={0} max={10} onChange={(v) => setSetting({ interestPercent: v })} />
        <Stepper label="Подсказки Пико не чаще" value={state.settings.hintIntervalSec} suffix=" с" min={4} max={20} onChange={(v) => setSetting({ hintIntervalSec: v })} />
        <View style={s.line}>
          <Text style={s.stepLabel}>Голос Пико</Text>
          <Switch value={state.settings.voice} onValueChange={(v) => setSetting({ voice: v })} trackColor={{ true: C.accent, false: C.line }} />
        </View>
      </Card>

      <Text style={ui.section}>Цели ребёнка</Text>
      <Card>
        {state.goals.map((g) => (
          <View key={g.id} style={s.line}>
            <Text style={s.stepLabel}>
              {g.title} · {heartsText(g.price)}
            </Text>
            <Pressable onPress={() => act((st) => ({ ...st, goals: st.goals.filter((x) => x.id !== g.id), selectedGoalId: st.selectedGoalId === g.id ? null : st.selectedGoalId }))}>
              <Ionicons name="trash-outline" size={22} color={C.danger} />
            </Pressable>
          </View>
        ))}
        <TextInput value={goalTitle} onChangeText={setGoalTitle} placeholder="Новая цель, например «Велосипед»" style={[ui.input, { marginTop: 10 }]} maxLength={40} />
        <TextInput value={goalPrice} onChangeText={(t) => setGoalPrice(t.replace(/[^0-9]/g, ''))} placeholder="Цена в Сердцах" keyboardType="number-pad" style={ui.input} maxLength={5} />
        <DarkButton
          small
          title="ДОБАВИТЬ ЦЕЛЬ"
          disabled={!goalTitle.trim() || !Number(goalPrice)}
          onPress={() => {
            const g = { id: uid(), title: goalTitle.trim(), price: Number(goalPrice) };
            act((st) => ({ ...st, goals: st.goals.concat([g]) }));
            setGoalTitle('');
            setGoalPrice('');
          }}
        />
      </Card>

      <Text style={ui.section}>Задания</Text>
      <Card>
        <TextInput value={taskTitle} onChangeText={setTaskTitle} placeholder="Новое задание" style={ui.input} maxLength={60} />
        <View style={s.btnRow}>
          {CATS.map((c) => (
            <Pressable key={c.key} onPress={() => setTaskCat(c.key)} style={[s.chip, taskCat === c.key && s.chipOn]}>
              <Text style={[s.chipText, taskCat === c.key && { color: '#FFFFFF' }]}>{c.title}</Text>
            </Pressable>
          ))}
        </View>
        <Stepper label="Награда" value={taskHearts} suffix="" min={1} max={20} onChange={setTaskHearts} />
        <DarkButton
          small
          title="ДОБАВИТЬ ЗАДАНИЕ"
          disabled={!taskTitle.trim()}
          onPress={() => {
            const t = { id: uid(), title: taskTitle.trim(), category: taskCat, hearts: taskHearts };
            act((st) => ({ ...st, tasks: st.tasks.concat([t]) }));
            setTaskTitle('');
          }}
        />
      </Card>

      <Text style={ui.section}>Последние зарядки</Text>
      {state.sessions.length === 0 ? <Text style={ui.muted}>Зарядок пока не было.</Text> : null}
      {state.sessions.slice(0, 10).map((x) => (
        <Card key={x.id}>
          <Text style={ui.cardTitle}>{x.program}</Text>
          <Text style={ui.muted}>
            {fmtDate(x.at)} · повторов {x.reps} · +{heartsText(x.hearts)}
          </Text>
          <Text style={ui.muted}>
            Точность {x.accuracy} · Меткость {x.precision} · Кучность {x.consistency}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  stepLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: C.charcoal, marginRight: 8 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 54, textAlign: 'center', fontSize: 16, fontWeight: '800', color: C.charcoal },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' },
  chip: { borderWidth: 2, borderColor: C.accent, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: C.accent },
  chipText: { fontSize: 13, fontWeight: '700', color: C.charcoal },
});
