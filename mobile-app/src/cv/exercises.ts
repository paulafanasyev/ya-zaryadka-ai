export type Kind = 'squat' | 'spring' | 'jack' | 'arms' | 'bend' | 'knees' | 'toes' | 'punch' | 'heron' | 'plane';

/** 0: 4–6 лет, 1: 7–10 лет, 2: 11–16 лет. */
export type AgeBand = 0 | 1 | 2;

export interface ExerciseDef {
  id: Kind;
  kind: Kind;
  name: string;
  description: string;
  cue: string;
  /** Норма для 7–10 лет (для совместимости). */
  target: number;
  /** Нормы по возрастным группам: [4–6, 7–10, 11–16]. */
  norms: [number, number, number];
  unit: 'раз' | 'сек';
  maxSec: number;
}

/*
 * Нормы подобраны по открытым методикам ОРУ (общеразвивающих упражнений):
 * дошкольники 4–6 лет: 5–6 повторов, младшие школьники: 6–8 повторов,
 * прыжки 10–20 раз, 10–12 лет: 6–12 повторов. ВОЗ: дети 5–17 лет, 60 минут
 * активности в день. Только упражнения с весом своего тела.
 * Источники перечислены в базе знаний проекта.
 */
export const EXERCISES: Record<Kind, ExerciseDef> = {
  squat: { id: 'squat', kind: 'squat', name: 'Приседания', description: 'Ноги на ширине плеч, приседаем и встаём.', cue: 'Приседай, как будто садишься на стул.', target: 8, norms: [6, 8, 12], unit: 'раз', maxSec: 90 },
  spring: { id: 'spring', kind: 'spring', name: 'Пружинка', description: 'Небольшие приседания, как пружина.', cue: 'Чуть-чуть приседай и выпрямляйся.', target: 10, norms: [8, 10, 14], unit: 'раз', maxSec: 90 },
  jack: { id: 'jack', kind: 'jack', name: 'Прыжки «Звёздочка»', description: 'Прыжок: ноги в стороны, руки вверх. Прыжок обратно.', cue: 'Ноги в стороны, руки над головой!', target: 12, norms: [8, 12, 16], unit: 'раз', maxSec: 90 },
  arms: { id: 'arms', kind: 'arms', name: 'Руки к солнцу', description: 'Поднимаем прямые руки вверх и опускаем.', cue: 'Тянись руками к солнышку.', target: 8, norms: [6, 8, 10], unit: 'раз', maxSec: 90 },
  bend: { id: 'bend', kind: 'bend', name: 'Наклоны в стороны', description: 'Руки на пояс, наклон вправо и влево.', cue: 'Наклоняйся в сторону, бёдра на месте.', target: 8, norms: [6, 8, 10], unit: 'раз', maxSec: 90 },
  knees: { id: 'knees', kind: 'knees', name: 'Высокие колени', description: 'Шагаем на месте, поднимая колени высоко.', cue: 'Поднимай колени до пояса.', target: 20, norms: [12, 20, 30], unit: 'раз', maxSec: 90 },
  toes: { id: 'toes', kind: 'toes', name: 'Достань до носочков', description: 'Наклон вниз к носкам и обратно.', cue: 'Тянись руками к носочкам, колени прямые.', target: 6, norms: [5, 6, 8], unit: 'раз', maxSec: 90 },
  punch: { id: 'punch', kind: 'punch', name: 'Удары в стороны', description: 'По очереди выбрасываем руки в стороны на уровне плеч.', cue: 'Выпрямляй руку в сторону, как боксёр.', target: 16, norms: [10, 16, 20], unit: 'раз', maxSec: 90 },
  heron: { id: 'heron', kind: 'heron', name: 'Цапля', description: 'Стоим на одной ноге и держим равновесие.', cue: 'Подними одну ногу и стой как цапля.', target: 12, norms: [8, 12, 20], unit: 'сек', maxSec: 60 },
  plane: { id: 'plane', kind: 'plane', name: 'Самолёт', description: 'Руки в стороны на уровне плеч, держим позу.', cue: 'Раскрой руки-крылья и держи их ровно.', target: 8, norms: [5, 8, 12], unit: 'сек', maxSec: 60 },
};

export function ageBand(age: number): AgeBand {
  return age <= 6 ? 0 : age <= 10 ? 1 : 2;
}

export function targetFor(ex: ExerciseDef, age: number) {
  const n = ex.norms ? ex.norms[ageBand(age)] : ex.target;
  return Math.max(3, n);
}

export interface Program { id: string; name: string; description: string; exercises: Kind[]; }

export const PROGRAMS: Program[] = [
  { id: 'morning', name: 'Утренняя зарядка', description: '5 упражнений для бодрого утра', exercises: ['arms', 'squat', 'jack', 'bend', 'heron'] },
  { id: 'easy', name: 'Весёлый старт', description: 'Лёгкая зарядка для малышей 4–7 лет', exercises: ['spring', 'arms', 'knees', 'plane'] },
  { id: 'power', name: 'Сила и ловкость', description: 'Для тех, кто хочет посильнее', exercises: ['squat', 'punch', 'toes', 'knees', 'heron'] },
  { id: 'all', name: 'Все упражнения', description: 'Все 10 упражнений по очереди', exercises: ['arms', 'spring', 'squat', 'jack', 'bend', 'knees', 'toes', 'punch', 'plane', 'heron'] },
];
