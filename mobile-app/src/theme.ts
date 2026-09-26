export const C = {
  g1: '#5DB83A',
  g2: '#1B6E35',
  accent: '#3DA535',
  offWhite: '#F4F4EE',
  charcoal: '#2B2E28',
  white: '#FFFFFF',
  heart: '#E53935',
  lightning: '#FB8C00',
  piggy: '#EC407A',
  muted: '#6B6F66',
  line: '#E2E2D8',
  danger: '#C62828',
  warn: '#F9A825',
};

export const R = { card: 24, pill: 999 };

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export const heartsText = (n: number) => n + ' ' + plural(n, 'Сердце', 'Сердца', 'Сердец');
export const boltsText = (n: number) => n + ' ' + plural(n, 'Молния', 'Молнии', 'Молний');

const pad = (n: number) => (n < 10 ? '0' + n : String(n));
export function fmtDate(t: number) {
  const d = new Date(t);
  return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
