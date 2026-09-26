export interface RepMetric { amp: number; form: number; dur: number; }
export interface Score { accuracy: number; precision: number; consistency: number; total: number; reps: number; }

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sd = (a: number[]) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((v) => (v - m) * (v - m))));
};
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

// Точность: качество техники (положение корпуса, симметрия, прямые руки и ноги).
// Меткость: достижение целевой амплитуды в каждом повторе.
// Кучность: стабильность темпа и качества от повтора к повтору.
export function computeScore(groups: RepMetric[][]): Score {
  const reps = groups.reduce((acc: RepMetric[], g) => acc.concat(g), []);
  if (!reps.length) return { accuracy: 0, precision: 0, consistency: 0, total: 0, reps: 0 };
  const accuracy = clamp(mean(reps.map((r) => r.form)));
  const precision = clamp(mean(reps.map((r) => r.amp)));
  const parts = groups
    .filter((g) => g.length >= 3)
    .map((g) => {
      const d = g.slice(1).map((r) => r.dur);
      const m = mean(d);
      const cv = m > 0 ? sd(d) / m : 0;
      return 100 - cv * 100 - sd(g.map((r) => r.amp)) * 0.6 - sd(g.map((r) => r.form)) * 0.6;
    });
  const consistency = parts.length ? clamp(mean(parts)) : clamp(Math.min(accuracy, precision) * 0.6);
  const total = clamp((accuracy + precision + consistency) / 3);
  return { accuracy, precision, consistency, total, reps: reps.length };
}

export function heartsForScore(s: Score) {
  if (s.reps === 0) return 0;
  return Math.max(1, Math.min(10, Math.round(s.total / 10)));
}
