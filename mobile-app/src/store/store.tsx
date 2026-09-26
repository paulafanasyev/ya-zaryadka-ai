import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TaskCategory = 'deed' | 'habit' | 'study' | 'creativity';
export type Status = 'pending' | 'approved' | 'rejected';

export interface TaskItem { id: string; title: string; category: TaskCategory; hearts: number; }
export interface TaskLog { id: string; taskId: string; title: string; hearts: number; at: number; day: string; status: Status; }
export interface Goal { id: string; title: string; price: number; }
export interface RequestItem { id: string; kind: 'withdraw' | 'reward'; amount: number; goalId?: string; title: string; at: number; status: Status; }
export interface Op { id: string; at: number; title: string; hearts: number; lightning: number; piggy: number; }
export interface SessionRecord { id: string; at: number; program: string; reps: number; accuracy: number; precision: number; consistency: number; hearts: number; }
export interface Settings { piggyPercent: number; interestPercent: number; exchangeRate: number; hintIntervalSec: number; showSkeleton: boolean; voice: boolean; }
export interface Profile { name: string; age: number; consent: boolean; }

export interface AppData {
  version: 1;
  profile: Profile | null;
  hearts: number;
  lightning: number;
  piggy: number;
  pendingInterest: number;
  lastInterestAt: number;
  ops: Op[];
  tasks: TaskItem[];
  taskLogs: TaskLog[];
  goals: Goal[];
  selectedGoalId: string | null;
  requests: RequestItem[];
  sessions: SessionRecord[];
  settings: Settings;
  parentPin: string | null;
}

const KEY = 'ya-zaryadka-ai/state/v1';
export const WEEK = 7 * 24 * 3600 * 1000;

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const dayKey = (t: number = Date.now()) => {
  const d = new Date(t);
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
};

export const DEFAULT_TASKS: TaskItem[] = [
  { id: 'deed-help', title: 'Помог родителям по дому', category: 'deed', hearts: 5 },
  { id: 'deed-toys', title: 'Убрал свои игрушки и вещи', category: 'deed', hearts: 3 },
  { id: 'deed-plants', title: 'Полил цветы', category: 'deed', hearts: 2 },
  { id: 'deed-friend', title: 'Помог другу или младшему', category: 'deed', hearts: 5 },
  { id: 'habit-teeth', title: 'Почистил зубы утром и вечером', category: 'habit', hearts: 2 },
  { id: 'habit-bed', title: 'Заправил кровать', category: 'habit', hearts: 2 },
  { id: 'habit-water', title: 'Выпил стакан воды после зарядки', category: 'habit', hearts: 1 },
  { id: 'habit-sleep', title: 'Лёг спать вовремя', category: 'habit', hearts: 3 },
  { id: 'study-read', title: 'Читал книгу 20 минут', category: 'study', hearts: 4 },
  { id: 'study-math', title: 'Решил 10 примеров', category: 'study', hearts: 4 },
  { id: 'study-poem', title: 'Выучил стихотворение', category: 'study', hearts: 5 },
  { id: 'art-draw', title: 'Нарисовал рисунок', category: 'creativity', hearts: 4 },
  { id: 'art-craft', title: 'Сделал поделку', category: 'creativity', hearts: 5 },
  { id: 'art-music', title: 'Занимался музыкой или танцами', category: 'creativity', hearts: 4 },
];

export const DEFAULT_GOALS: Goal[] = [
  { id: 'goal-ice', title: 'Мороженое', price: 30 },
  { id: 'goal-book', title: 'Новая книга', price: 80 },
  { id: 'goal-cinema', title: 'Поход в кино', price: 150 },
  { id: 'goal-game', title: 'Настольная игра', price: 250 },
];

export const DEFAULT_SETTINGS: Settings = {
  piggyPercent: 10,
  interestPercent: 1,
  exchangeRate: 1,
  hintIntervalSec: 8,
  showSkeleton: true,
  voice: true,
};

export const initialData: AppData = {
  version: 1,
  profile: null,
  hearts: 0,
  lightning: 0,
  piggy: 0,
  pendingInterest: 0,
  lastInterestAt: 0,
  ops: [],
  tasks: DEFAULT_TASKS,
  taskLogs: [],
  goals: DEFAULT_GOALS,
  selectedGoalId: null,
  requests: [],
  sessions: [],
  settings: DEFAULT_SETTINGS,
  parentPin: null,
};

// ---------- economy (pure functions) ----------

function addOp(s: AppData, title: string, hearts: number, lightning: number, piggy: number): AppData {
  const op: Op = { id: uid(), at: Date.now(), title, hearts, lightning, piggy };
  return { ...s, ops: [op].concat(s.ops).slice(0, 300) };
}

export function piggyShare(s: AppData, amount: number) {
  return Math.round((amount * s.settings.piggyPercent) / 100);
}

export function earn(s: AppData, amount: number, title: string): AppData {
  if (amount <= 0) return s;
  const toPiggy = piggyShare(s, amount);
  const avail = amount - toPiggy;
  const n = { ...s, hearts: s.hearts + avail, piggy: s.piggy + toPiggy };
  return addOp(n, title, avail, 0, toPiggy);
}

export function applyInterest(s: AppData, now: number = Date.now()): AppData {
  if (!s.lastInterestAt) return { ...s, lastInterestAt: now };
  const weeks = Math.floor((now - s.lastInterestAt) / WEEK);
  if (weeks <= 0) return s;
  const accrued = weeks * Math.round((s.piggy * s.settings.interestPercent) / 100);
  let n: AppData = { ...s, lastInterestAt: s.lastInterestAt + weeks * WEEK };
  if (accrued > 0) {
    n = { ...n, lightning: n.lightning + accrued, pendingInterest: n.pendingInterest + accrued };
    n = addOp(n, 'Проценты Копилки', 0, accrued, 0);
  }
  return n;
}

export function exchangeLightning(s: AppData, count: number): AppData {
  const c = Math.min(count, s.lightning);
  if (c <= 0) return s;
  const h = c * s.settings.exchangeRate;
  const n = { ...s, lightning: s.lightning - c, hearts: s.hearts + h, pendingInterest: Math.max(0, s.pendingInterest - c) };
  return addOp(n, 'Обмен Молний на Сердца', h, -c, 0);
}

export function lightningToPiggy(s: AppData, count: number): AppData {
  const c = Math.min(count, s.lightning);
  if (c <= 0) return s;
  const h = c * s.settings.exchangeRate;
  const n = { ...s, lightning: s.lightning - c, piggy: s.piggy + h, pendingInterest: Math.max(0, s.pendingInterest - c) };
  return addOp(n, 'Молнии добавлены в Копилку', 0, -c, h);
}

export function requestWithdraw(s: AppData, amount: number): AppData | null {
  if (amount <= 0 || amount > s.piggy) return null;
  const r: RequestItem = { id: uid(), kind: 'withdraw', amount, title: 'Вывод из Копилки', at: Date.now(), status: 'pending' };
  return { ...s, requests: [r].concat(s.requests) };
}

export function requestReward(s: AppData, goal: Goal): AppData | null {
  if (s.hearts < goal.price) return null;
  if (s.requests.some((r) => r.kind === 'reward' && r.goalId === goal.id && r.status === 'pending')) return null;
  const r: RequestItem = { id: uid(), kind: 'reward', amount: goal.price, goalId: goal.id, title: goal.title, at: Date.now(), status: 'pending' };
  return { ...s, requests: [r].concat(s.requests) };
}

export function decideRequest(s: AppData, id: string, approve: boolean): { s: AppData; error?: string } {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== 'pending') return { s };
  const setStatus = (st: AppData, status: Status) => ({ ...st, requests: st.requests.map((x) => (x.id === id ? { ...x, status } : x)) });
  if (!approve) return { s: setStatus(s, 'rejected') };
  if (r.kind === 'withdraw') {
    if (r.amount > s.piggy) return { s, error: 'В Копилке недостаточно Сердец.' };
    let n = { ...s, piggy: s.piggy - r.amount, hearts: s.hearts + r.amount };
    n = addOp(n, 'Вывод из Копилки', r.amount, 0, -r.amount);
    return { s: setStatus(n, 'approved') };
  }
  if (r.amount > s.hearts) return { s, error: 'На балансе недостаточно Сердец.' };
  let n: AppData = { ...s, hearts: s.hearts - r.amount, selectedGoalId: s.selectedGoalId === r.goalId ? null : s.selectedGoalId };
  n = addOp(n, 'Вознаграждение: ' + r.title, -r.amount, 0, 0);
  return { s: setStatus(n, 'approved') };
}

export function submitTask(s: AppData, task: TaskItem): AppData | null {
  const today = dayKey();
  if (s.taskLogs.some((l) => l.taskId === task.id && l.day === today && l.status !== 'rejected')) return null;
  const log: TaskLog = { id: uid(), taskId: task.id, title: task.title, hearts: task.hearts, at: Date.now(), day: today, status: 'pending' };
  return { ...s, taskLogs: [log].concat(s.taskLogs).slice(0, 500) };
}

export function decideTask(s: AppData, logId: string, approve: boolean): AppData {
  const log = s.taskLogs.find((l) => l.id === logId);
  if (!log || log.status !== 'pending') return s;
  let n: AppData = { ...s, taskLogs: s.taskLogs.map((l) => (l.id === logId ? { ...l, status: approve ? 'approved' : 'rejected' } : l)) };
  if (approve) n = earn(n, log.hearts, log.title);
  return n;
}

export function habitStreak(s: AppData, taskId: string) {
  const days = new Set(s.taskLogs.filter((l) => l.taskId === taskId && l.status !== 'rejected').map((l) => l.day));
  let streak = 0;
  let t = Date.now();
  if (!days.has(dayKey(t))) t -= 24 * 3600 * 1000;
  while (days.has(dayKey(t))) {
    streak++;
    t -= 24 * 3600 * 1000;
  }
  return streak;
}

// ---------- context ----------

interface StoreValue { state: AppData; ready: boolean; update: (fn: (s: AppData) => AppData) => void; }
const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const merged: AppData = { ...initialData, ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) } };
            setState(applyInterest(merged));
            return;
          } catch (e) {
            // corrupted storage: start fresh
          }
        }
        setState((s) => applyInterest(s));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state, ready]);

  const update = useCallback((fn: (s: AppData) => AppData) => setState((s) => fn(s)), []);

  return <Ctx.Provider value={{ state, ready, update }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
