export type Kind = 'squat' | 'spring' | 'jack' | 'arms' | 'bend' | 'knees' | 'toes' | 'punch' | 'heron' | 'plane';

export interface ExerciseDef {
  id: Kind;
  kind: Kind;
  name: string;
  description: string;
  cue: string;
  target: number;
  unit: 'раз' | 'сек';
  maxSec: number;
}

export const EXERCISES: Record<Kind, ExerciseDef> = {
  squat: { id: 'squat', kind: 'squat', name: 'Приседания', description: 'Ноги на ширине плеч, приседаем и встаём.', cue: 'Приседай, как будто садишься на стул.', target: 10, unit: 'раз', maxSec: 90 },
  spring: { id: 'spring', kind: 'spring', name: 'Пружинка', description: 'Небольшие приседания, как пружина.', cue: 'Чуть-чуть приседай и выпрямляйся.', target: 12, unit: 'раз', maxSec: 90 },
  jack: { id: 'jack', kind: 'jack', name: 'Прыжки «Звёздочка»', description: 'Прыжок: ноги в стороны, руки вверх. Прыжок обратно.', cue: 'Ноги в стороны, руки над головой!', target: 10, unit: 'раз', maxSec: 90 },
  arms: { id: 'arms', kind: 'arms', name: 'Руки к солнцу', description: 'Поднимаем прямые руки вверх и опускаем.', cue: 'Тянись руками к солнышку.', target: 10, unit: 'раз', maxSec: 90 },
  bend: { id: 'bend', kind: 'bend', name: 'Наклоны в стороны', description: 'Руки на пояс, наклон вправо и влево.', cue: 'Наклоняйся в сторону, бёдра на месте.', target: 10, unit: 'раз', maxSec: 90 },
  knees: { id: 'knees', kind: 'knees', name: 'Высокие колени', description: 'Шагаем на месте, поднимая колени высоко.', cue: 'Поднимай колени до пояса.', target: 16, unit: 'раз', maxSec: 90 },
  toes: { id: 'toes', kind: 'toes', name: 'Достань до носочков', description: 'Наклон вниз к носкам и обратно.', cue: 'Тянись руками к носочкам, колени прямые.', target: 8, unit: 'раз', maxSec: 90 },
  punch: { id: 'punch', kind: 'punch', name: 'Удары в стороны', description: 'По очереди выбрасываем руки в стороны на уровне плеч.', cue: 'Выпрямляй руку в сторону, как боксёр.', target: 16, unit: 'раз', maxSec: 90 },
  heron: { id: 'heron', kind: 'heron', name: 'Цапля', description: 'Стоим на одной ноге и держим равновесие.', cue: 'Подними одну ногу и стой как цапля.', target: 15, unit: 'сек', maxSec: 60 },
  plane: { id: 'plane', kind: 'plane', name: 'Самолёт', description: 'Руки в стороны на уровне плеч, держим позу.', cue: 'Раскрой руки-крылья и держи их ровно.', target: 15, unit: 'сек', maxSec: 60 },
};

export function targetFor(ex: ExerciseDef, age: number) {
  const k = age <= 6 ? 0.6 : age <= 10 ? 0.8 : 1;
  return Math.max(3, Math.round(ex.target * k));
}

export interface Program { id: string; name: string; description: string; exercises: Kind[]; }

export const PROGRAMS: Program[] = [
  { id: 'morning', name: 'Утренняя зарядка', description: '5 упражнений для бодрого утра', exercises: ['arms', 'squat', 'jack', 'bend', 'heron'] },
  { id: 'easy', name: 'Весёлый старт', description: 'Лёгкая зарядка для малышей 4–7 лет', exercises: ['spring', 'arms', 'knees', 'plane'] },
  { id: 'power', name: 'Сила и ловкость', description: 'Для тех, кто хочет посильнее', exercises: ['squat', 'punch', 'toes', 'knees', 'heron'] },
  { id: 'all', name: 'Все упражнения', description: 'Все 10 упражнений по очереди', exercises: ['arms', 'spring', 'squat', 'jack', 'bend', 'knees', 'toes', 'punch', 'plane', 'heron'] },
];
