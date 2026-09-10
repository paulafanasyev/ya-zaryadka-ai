/**
 * Библиотека эталонных упражнений для детской утренней зарядки
 * Основано на анализе популярных детских фитнес-приложений и методиках ЛФК для детей 6-14 лет
 * 
 * Источники:
 * - Exercise For Kids (30-day challenge)
 * - Kids Workout: Animal Kingdom (анималистические позы)
 * - Yoga for Kids & Family Fitness (йога для детей)
 * - 7 Min Workouts – Lazy Monster
 * - Утренняя зарядка (Morning exercise)
 * - Методические рекомендации по ЛФК для школьников
 */

import { Exercise, ExerciseCategory, DifficultyLevel } from '../types';

// Категории упражнений
export const ExerciseCategories: Record<ExerciseCategory, string> = {
  warmup: 'Разминка',
  cardio: 'Кардио',
  strength: 'Сила',
  flexibility: 'Гибкость',
  balance: 'Баланс',
  cooldown: 'Заминка',
  yoga: 'Йога',
  animal: 'Звериные позы',
};

// Библиотека упражнений - Разминка (Warm-up)
export const WARMUP_EXERCISES: Exercise[] = [
  {
    id: 101,
    name: 'Повороты головы',
    description: 'Медленно поворачивай голову влево и вправо, как будто говоришь "нет-нет"',
    category: 'warmup',
    difficulty: 1,
    duration: 20,
    repetitions: 8,
    instructions: [
      'Встань ровно, ноги на ширине плеч',
      'Руки положи на пояс',
      'Плавно поверни голову влево до упора',
      'Вернись в исходное положение',
      'Повтори в правую сторону',
    ],
    tips: 'Делай медленно, без рывков!',
    musclesWorked: ['шея', 'верх спины'],
    emoji: '🦉',
  },
  {
    id: 102,
    name: 'Вращение плечами',
    description: 'Круговые движения плечами вперёд и назад',
    category: 'warmup',
    difficulty: 1,
    duration: 20,
    repetitions: 10,
    instructions: [
      'Ноги на ширине плеч',
      'Подними плечи к ушам',
      'Отведи их назад и опусти',
      'Выполни круговое движение',
    ],
    tips: 'Представь, что рисуешь круги локтями!',
    musclesWorked: ['плечи', 'верх спины'],
    emoji: '🔄',
  },
  {
    id: 103,
    name: 'Мельница руками',
    description: 'Круговые движения прямыми руками вперёд и назад',
    category: 'warmup',
    difficulty: 1,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Ноги на ширине плеч',
      'Выпрями руки в стороны',
      'Делай большие круги вперёд',
      'Поменяй направление назад',
    ],
    tips: 'Старайся делать круги максимально большими!',
    musclesWorked: ['плечи', 'руки', 'грудь'],
    emoji: '🎡',
  },
  {
    id: 104,
    name: 'Вращение тазом',
    description: 'Круговые движения тазом, как будто крутишь обруч',
    category: 'warmup',
    difficulty: 1,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Ноги чуть шире плеч',
      'Руки на поясе',
      'Делай круговые движения тазом',
      'Сначала в одну сторону, потом в другую',
    ],
    tips: 'Представь, что у тебя есть волшебный обруч!',
    musclesWorked: ['таз', 'поясница', 'кор'],
    emoji: '⭕',
  },
  {
    id: 105,
    name: 'Вращение коленями',
    description: 'Круговые движения коленями для разминки ног',
    category: 'warmup',
    difficulty: 1,
    duration: 20,
    repetitions: 10,
    instructions: [
      'Ноги вместе, слегка согни колени',
      'Положи ладони на колени',
      'Делай круговые движения коленями',
      'Сначала по часовой стрелке, потом против',
    ],
    tips: 'Колени должны двигаться вместе!',
    musclesWorked: ['колени', 'бёдра'],
    emoji: '🦵',
  },
  {
    id: 106,
    name: 'Вращение стопами',
    description: 'Круговые движения стопами для разминки голеностопа',
    category: 'warmup',
    difficulty: 1,
    duration: 20,
    repetitions: 10,
    instructions: [
      'Подними одну ногу',
      'Вращай стопой по кругу',
      'Поменяй направление',
      'Повтори другой ногой',
    ],
    tips: 'Можно держаться за стул для равновесия!',
    musclesWorked: ['голеностоп', 'икры'],
    emoji: '👣',
  },
];

// Кардио упражнения (Cardio)
export const CARDIO_EXERCISES: Exercise[] = [
  {
    id: 201,
    name: 'Прыжки (Jumping Jacks)',
    description: 'Классическое упражнение: прыгай, разводя руки и ноги в стороны',
    category: 'cardio',
    difficulty: 2,
    duration: 30,
    repetitions: 15,
    instructions: [
      'Встань прямо, ноги вместе, руки вдоль тела',
      'Прыжком разведи ноги шире плеч',
      'Одновременно подними руки через стороны вверх',
      'Хлопни над головой',
      'Прыжком вернись в исходное положение',
    ],
    tips: 'Приземляйся мягко на носочки!',
    musclesWorked: ['ноги', 'плечи', 'кардио'],
    emoji: '⭐',
  },
  {
    id: 202,
    name: 'Бег на месте',
    description: 'Беги на месте, высоко поднимая колени',
    category: 'cardio',
    difficulty: 2,
    duration: 60,
    repetitions: 1,
    instructions: [
      'Встань прямо',
      'Начни бежать на месте',
      'Поднимай колени как можно выше',
      'Работай руками как настоящий бегун',
    ],
    tips: 'Представь, что убегаешь от динозавра! 🦖',
    musclesWorked: ['ноги', 'кардио', 'кор'],
    emoji: '🏃',
  },
  {
    id: 203,
    name: 'Бег с захлёстом голени',
    description: 'Бег на месте с касанием пятками ягодиц',
    category: 'cardio',
    difficulty: 2,
    duration: 30,
    repetitions: 20,
    instructions: [
      'Встань прямо',
      'Беги на месте',
      'Загибай голень назад',
      'Старайся коснуться пяткой ягодиц',
    ],
    tips: 'Пятки должны почти касаться попы!',
    musclesWorked: ['задняя поверхность бедра', 'икры', 'кардио'],
    emoji: '💨',
  },
  {
    id: 204,
    name: 'Прыжки лягушкой',
    description: 'Присядь и прыгай вперёд как лягушка',
    category: 'cardio',
    difficulty: 2,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Присядь низко, руки на полу перед собой',
      'Прыгни вперёд',
      'Мягко приземлись',
      'Сразу прыгай снова',
    ],
    tips: 'Ква-ква! Будь настоящей лягушкой! 🐸',
    musclesWorked: ['ноги', 'ягодицы', 'кардио'],
    emoji: '🐸',
  },
  {
    id: 205,
    name: 'Прыжки на одной ноге',
    description: 'Прыгай на одной ноге, как кузнечик',
    category: 'cardio',
    difficulty: 2,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Встань на одну ногу',
      'Прыгай на месте',
      'Поменяй ногу',
    ],
    tips: 'Можно помогать себе руками!',
    musclesWorked: ['ноги', 'баланс', 'кардио'],
    emoji: '🦗',
  },
  {
    id: 206,
    name: 'Боковые прыжки',
    description: 'Прыгай из стороны в сторону через воображаемую линию',
    category: 'cardio',
    difficulty: 2,
    duration: 30,
    repetitions: 15,
    instructions: [
      'Представь линию на полу',
      'Прыгни вправо от линии',
      'Сразу прыгни влево',
      'Продолжай быстро прыгать',
    ],
    tips: 'Прыгай быстро и легко!',
    musclesWorked: ['ноги', 'координация', 'кардио'],
    emoji: '↔️',
  },
];

// Силовые упражнения (Strength)
export const STRENGTH_EXERCISES: Exercise[] = [
  {
    id: 301,
    name: 'Приседания',
    description: 'Классические приседания: ноги на ширине плеч, спина ровная',
    category: 'strength',
    difficulty: 1,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Ноги на ширине плеч, носки чуть врозь',
      'Спина прямая, смотри вперёд',
      'Медленно присядь, отводя таз назад',
      'Колени не должны выходить за носки',
      'Вернись в исходное положение',
    ],
    tips: 'Представь, что садишься на невидимый стул!',
    musclesWorked: ['квадрицепсы', 'ягодицы', 'бёдра'],
    emoji: '🪑',
  },
  {
    id: 302,
    name: 'Планка',
    description: 'Держи тело ровным, как струна',
    category: 'strength',
    difficulty: 2,
    duration: 20,
    repetitions: 1,
    instructions: [
      'Ляг на живот',
      'Поднимись на предплечьях и носках',
      'Тело должно быть прямой линией',
      'Напряги пресс и ягодицы',
      'Держи позицию',
    ],
    tips: 'Не прогибай спину и не поднимай таз!',
    musclesWorked: ['пресс', 'кор', 'спина', 'плечи'],
    emoji: '📏',
  },
  {
    id: 303,
    name: 'Отжимания от стены',
    description: 'Отжимания стоя лицом к стене для начинающих',
    category: 'strength',
    difficulty: 1,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Встань лицом к стене на расстоянии шага',
      'Упрись руками в стену на уровне груди',
      'Согни руки, приближаясь к стене',
      'Вернись в исходное положение',
    ],
    tips: 'Чем дальше стоишь от стены, тем сложнее!',
    musclesWorked: ['грудь', 'трицепсы', 'плечи'],
    emoji: '🧱',
  },
  {
    id: 304,
    name: 'Отжимания от пола (облегчённые)',
    description: 'Отжимания с колен для детей',
    category: 'strength',
    difficulty: 2,
    duration: 30,
    repetitions: 8,
    instructions: [
      'Встань на колени',
      'Руки на полу шире плеч',
      'Скрести ноги в щиколотках',
      'Опустись грудью к полу',
      'Вернись в исходное положение',
    ],
    tips: 'Держи спину ровной, не прогибайся!',
    musclesWorked: ['грудь', 'трицепсы', 'плечи', 'кор'],
    emoji: '💪',
  },
  {
    id: 305,
    name: 'Ягодичный мостик',
    description: 'Подъём таза лёжа на спине',
    category: 'strength',
    difficulty: 1,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Ляг на спину, согни колени',
      'Стопы на полу на ширине плеч',
      'Подними таз вверх',
      'Сожми ягодицы в верхней точке',
      'Опустись вниз',
    ],
    tips: 'Вверху ты должен быть как мостик!',
    musclesWorked: ['ягодицы', 'задняя поверхность бедра', 'кор'],
    emoji: '🌉',
  },
  {
    id: 306,
    name: 'Выпады',
    description: 'Шаги вперёд с приседанием на одной ноге',
    category: 'strength',
    difficulty: 2,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Встань прямо, ноги вместе',
      'Сделай большой шаг вперёд',
      'Опустись вниз, сгибая обе ноги',
      'Заднее колено почти касается пола',
      'Вернись и поменяй ногу',
    ],
    tips: 'Держи спину прямо и смотри вперёд!',
    musclesWorked: ['квадрицепсы', 'ягодицы', 'бёдра'],
    emoji: '🦵',
  },
];

// Упражнения на гибкость (Flexibility & Stretching)
export const FLEXIBILITY_EXERCISES: Exercise[] = [
  {
    id: 401,
    name: 'Наклон вперёд',
    description: 'Наклонись вперёд, стараясь коснуться пальцев ног',
    category: 'flexibility',
    difficulty: 1,
    duration: 30,
    repetitions: 3,
    instructions: [
      'Встань прямо, ноги вместе',
      'Медленно наклонись вперёд',
      'Старайся коснуться пальцев ног',
      'Задержись на 10 секунд',
      'Медленно выпрямись',
    ],
    tips: 'Не пружинь! Тянемся медленно!',
    musclesWorked: ['задняя поверхность бедра', 'спина', 'икры'],
    emoji: '🙇',
  },
  {
    id: 402,
    name: 'Бабочка',
    description: 'Сидя, соедини стопы вместе и прижми колени к полу',
    category: 'flexibility',
    difficulty: 1,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Сядь на пол',
      'Соедини стопы вместе',
      'Обхвати стопы руками',
      'Прижимай колени к полу',
      'Задержись на 20 секунд',
    ],
    tips: 'Представь, что твои колени — крылья бабочки! 🦋',
    musclesWorked: ['внутренняя поверхность бедра', 'паховая область'],
    emoji: '🦋',
  },
  {
    id: 403,
    name: 'Кошка-корова',
    description: 'Поза из йоги для гибкости спины',
    category: 'flexibility',
    difficulty: 1,
    duration: 30,
    repetitions: 8,
    instructions: [
      'Встань на четвереньки',
      'Выгни спину вверх, как злая кошка',
      'Опусти живот вниз, прогнись',
      'Подними голову вверх',
      'Чередуй движения',
    ],
    tips: 'Мяу! Почувствуй, как тянется спинка!',
    musclesWorked: ['спина', 'поясница', 'шея'],
    emoji: '🐱',
  },
  {
    id: 404,
    name: 'Растяжка трицепса',
    description: 'Растяжка задней поверхности руки',
    category: 'flexibility',
    difficulty: 1,
    duration: 20,
    repetitions: 2,
    instructions: [
      'Подними одну руку вверх',
      'Согни её в локте за головой',
      'Другой рукой аккуратно надави на локоть',
      'Задержись на 10 секунд',
      'Поменяй руку',
    ],
    tips: 'Без боли! Только приятное растяжение!',
    musclesWorked: ['трицепс', 'плечи'],
    emoji: '💪',
  },
  {
    id: 405,
    name: 'Поза ребёнка',
    description: 'Расслабляющая поза из йоги',
    category: 'flexibility',
    difficulty: 1,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Встань на колени',
      'Сядь на пятки',
      'Наклонись вперёд, лоб на полу',
      'Руки вытяни вперёд или положи вдоль тела',
      'Расслабься и дыши глубоко',
    ],
    tips: 'Отдыхай здесь, если устал!',
    musclesWorked: ['спина', 'бёдра', 'расслабление'],
    emoji: '🧘',
  },
  {
    id: 406,
    name: 'Растяжка боков',
    description: 'Наклоны в стороны для растяжки боковых мышц',
    category: 'flexibility',
    difficulty: 1,
    duration: 30,
    repetitions: 4,
    instructions: [
      'Встань прямо, ноги на ширине плеч',
      'Подними одну руку вверх',
      'Наклонись в противоположную сторону',
      'Задержись на 10 секунд',
      'Поменяй сторону',
    ],
    tips: 'Представь, что ты дерево, клонящееся на ветру!',
    musclesWorked: ['косые мышцы', 'бока', 'спина'],
    emoji: '🌳',
  },
];

// Баланс и координация (Balance)
export const BALANCE_EXERCISES: Exercise[] = [
  {
    id: 501,
    name: 'Фламинго',
    description: 'Стой на одной ноге как фламинго',
    category: 'balance',
    difficulty: 1,
    duration: 20,
    repetitions: 2,
    instructions: [
      'Встань на одну ногу',
      'Другую ногу согни в колене',
      'Руки разведи в стороны для равновесия',
      'Стой 10 секунд',
      'Поменяй ногу',
    ],
    tips: 'Смотри в одну точку — так легче держать баланс!',
    musclesWorked: ['ноги', 'кор', 'баланс'],
    emoji: '🦩',
  },
  {
    id: 502,
    name: 'Дерево',
    description: 'Поза дерева из йоги для баланса',
    category: 'balance',
    difficulty: 2,
    duration: 30,
    repetitions: 2,
    instructions: [
      'Встань прямо',
      'Перенеси вес на одну ногу',
      'Поставь стопу другой ноги на внутреннюю часть бедра',
      'Сложи руки перед грудью или подними вверх',
      'Задержись на 15 секунд',
    ],
    tips: 'Ты — сильное дерево с глубокими корнями! 🌲',
    musclesWorked: ['ноги', 'кор', 'баланс', 'концентрация'],
    emoji: '🌲',
  },
  {
    id: 503,
    name: 'Самолётик',
    description: 'Баланс на одной ноге с наклоном вперёд',
    category: 'balance',
    difficulty: 2,
    duration: 20,
    repetitions: 2,
    instructions: [
      'Встань на одну ногу',
      'Наклони корпус вперёд',
      'Другую ногу отведи назад',
      'Руки разведи в стороны как крылья',
      'Задержись на 10 секунд',
    ],
    tips: 'Лети, самолётик! ✈️',
    musclesWorked: ['ноги', 'кор', 'спина', 'баланс'],
    emoji: '✈️',
  },
  {
    id: 504,
    name: 'Ходьба по линии',
    description: 'Иди по воображаемой линии, ставя ногу перед ногой',
    category: 'balance',
    difficulty: 1,
    duration: 30,
    repetitions: 2,
    instructions: [
      'Представь прямую линию на полу',
      'Поставь пятку одной ноги к носку другой',
      'Иди по линии',
      'Руки разведи для баланса',
    ],
    tips: 'Как канатоходец в цирке! 🎪',
    musclesWorked: ['баланс', 'координация', 'концентрация'],
    emoji: '🎯',
  },
];

// Звериные позы (Animal poses - популярно в детских приложениях)
export const ANIMAL_EXERCISES: Exercise[] = [
  {
    id: 601,
    name: 'Поза медведя',
    description: 'Ходи как медведь на четвереньках',
    category: 'animal',
    difficulty: 1,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Встань на четвереньки',
      'Подними колени чуть от пола',
      'Иди вперёд, переставляя руки и ноги',
      'Держи спину ровной',
    ],
    tips: 'Ррр! Ты большой сильный медведь! 🐻',
    musclesWorked: ['руки', 'ноги', 'кор', 'координация'],
    emoji: '🐻',
  },
  {
    id: 602,
    name: 'Поза краба',
    description: 'Передвижение в позе краба',
    category: 'animal',
    difficulty: 2,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Сядь на пол, руки позади себя',
      'Согни колени, стопы на полу',
      'Подними таз вверх',
      'Передвигайся, переставляя руки и ноги',
    ],
    tips: 'Цап-цап! Как настоящий краб! 🦀',
    musclesWorked: ['руки', 'трицепсы', 'кор', 'ягодицы'],
    emoji: '🦀',
  },
  {
    id: 603,
    name: 'Поза кенгуру',
    description: 'Прыжки как кенгуру с поднятыми руками',
    category: 'animal',
    difficulty: 2,
    duration: 30,
    repetitions: 10,
    instructions: [
      'Встань прямо, руки согнуты у груди',
      'Прыгай на двух ногах',
      'Руки держи как лапки кенгуру',
      'Приземляйся мягко',
    ],
    tips: 'Прыгай высоко как кенгуру в Австралии! 🦘',
    musclesWorked: ['ноги', 'икры', 'кардио'],
    emoji: '🦘',
  },
  {
    id: 604,
    name: 'Поза змеи',
    description: 'Поза кобры из йоги',
    category: 'animal',
    difficulty: 1,
    duration: 20,
    repetitions: 3,
    instructions: [
      'Ляг на живот',
      'Руки под плечами',
      'Подними верхнюю часть тела',
      'Смотри вверх',
      'Задержись на 10 секунд',
    ],
    tips: 'Шшш! Ты мудрая змея! 🐍',
    musclesWorked: ['спина', 'грудь', 'пресс'],
    emoji: '🐍',
  },
  {
    id: 605,
    name: 'Поза собаки мордой вниз',
    description: 'Классическая поза из йоги',
    category: 'animal',
    difficulty: 2,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Встань на четвереньки',
      'Подними таз вверх',
      'Выпрями ноги (можно согнуть колени)',
      'Тело образует букву Λ',
      'Задержись на 20 секунд',
    ],
    tips: 'Гав! Ты счастливая собака! 🐕',
    musclesWorked: ['спина', 'икры', 'плечи', 'растяжка'],
    emoji: '🐕',
  },
  {
    id: 606,
    name: 'Поза пингвина',
    description: 'Присядь и ходи как пингвин',
    category: 'animal',
    difficulty: 1,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Присядь низко',
      'Руки прижми к бокам',
      'Ходи маленькими шагами',
      'Переваливайся с боку на бок',
    ],
    tips: 'Ты милый пингвин из Антарктиды! 🐧',
    musclesWorked: ['ноги', 'ягодицы', 'координация'],
    emoji: '🐧',
  },
];

// Заминка (Cool-down)
export const COOLDOWN_EXERCISES: Exercise[] = [
  {
    id: 701,
    name: 'Глубокое дыхание',
    description: 'Медленное глубокое дыхание для успокоения',
    category: 'cooldown',
    difficulty: 1,
    duration: 30,
    repetitions: 5,
    instructions: [
      'Встань или сядь удобно',
      'Медленно вдохни через нос (считай до 4)',
      'Задержи дыхание (считай до 2)',
      'Медленно выдохни через рот (считай до 6)',
      'Повтори 5 раз',
    ],
    tips: 'Представь, что вдыхаешь спокойствие и выдыхаешь усталость!',
    musclesWorked: ['диафрагма', 'расслабление', 'дыхание'],
    emoji: '🌬️',
  },
  {
    id: 702,
    name: 'Объятие коленей',
    description: 'Лёжа на спине, обними колени',
    category: 'cooldown',
    difficulty: 1,
    duration: 30,
    repetitions: 1,
    instructions: [
      'Ляг на спину',
      'Притяни колени к груди',
      'Обхвати их руками',
      'Покачайся немного из стороны в сторону',
      'Расслабься',
    ],
    tips: 'Как в уютном гнёздышке!',
    musclesWorked: ['поясница', 'ягодицы', 'расслабление'],
    emoji: '🤗',
  },
  {
    id: 703,
    name: 'Потягивание всего тела',
    description: 'Полное потягивание для расслабления',
    category: 'cooldown',
    difficulty: 1,
    duration: 20,
    repetitions: 3,
    instructions: [
      'Ляг на спину',
      'Вытяни руки над головой',
      'Потянись всем телом',
      'Вытяни носки',
      'Задержись на 10 секунд',
    ],
    tips: 'Как котик после сна! 😺',
    musclesWorked: ['всё тело', 'расслабление'],
    emoji: '😴',
  },
];

// Готовые комплексы упражнений для разных уровней
export const WORKOUT_ROUTES = {
  // Комплекс для начинающих (5-7 минут)
  beginner: {
    name: 'Новичок 🌟',
    description: 'Идеально для старта! Простые упражнения для самых маленьких',
    duration: 5,
    exercises: [
      WARMUP_EXERCISES[1], // Вращение плечами
      WARMUP_EXERCISES[2], // Мельница руками
      CARDIO_EXERCISES[1], // Бег на месте
      STRENGTH_EXERCISES[0], // Приседания
      FLEXIBILITY_EXERCISES[0], // Наклон вперёд
      BALANCE_EXERCISES[0], // Фламинго
      COOLDOWN_EXERCISES[0], // Глубокое дыхание
    ],
  },
  
  // Стандартная утренняя зарядка (10 минут)
  standard: {
    name: 'Стандарт ⭐⭐',
    description: 'Классическая 10-минутная зарядка для школы',
    duration: 10,
    exercises: [
      WARMUP_EXERCISES[0], // Повороты головы
      WARMUP_EXERCISES[1], // Вращение плечами
      WARMUP_EXERCISES[2], // Мельница руками
      WARMUP_EXERCISES[3], // Вращение тазом
      CARDIO_EXERCISES[0], // Jumping Jacks
      CARDIO_EXERCISES[1], // Бег на месте
      STRENGTH_EXERCISES[0], // Приседания
      STRENGTH_EXERCISES[1], // Планка
      FLEXIBILITY_EXERCISES[0], // Наклон вперёд
      FLEXIBILITY_EXERCISES[2], // Кошка-корова
      COOLDOWN_EXERCISES[0], // Глубокое дыхание
      COOLDOWN_EXERCISES[2], // Потягивание
    ],
  },
  
  // Весёлая звериная зарядка (8 минут)
  animalFun: {
    name: 'Зоопарк 🦁',
    description: 'Весёлая зарядка в стиле животных!',
    duration: 8,
    exercises: [
      ANIMAL_EXERCISES[0], // Медведь
      ANIMAL_EXERCISES[1], // Краб
      ANIMAL_EXERCISES[2], // Кенгуру
      ANIMAL_EXERCISES[3], // Змея
      ANIMAL_EXERCISES[4], // Собака
      ANIMAL_EXERCISES[5], // Пингвин
      COOLDOWN_EXERCISES[0], // Глубокое дыхание
    ],
  },
  
  // Йога для детей (10 минут)
  kidsYoga: {
    name: 'Мини-йог 🧘',
    description: 'Простые позы йоги для детей',
    duration: 10,
    exercises: [
      WARMUP_EXERCISES[0], // Повороты головы
      WARMUP_EXERCISES[1], // Вращение плечами
      FLEXIBILITY_EXERCISES[2], // Кошка-корова
      FLEXIBILITY_EXERCISES[4], // Поза ребёнка
      BALANCE_EXERCISES[1], // Дерево
      ANIMAL_EXERCISES[3], // Змея (кобра)
      ANIMAL_EXERCISES[4], // Собака мордой вниз
      FLEXIBILITY_EXERCISES[1], // Бабочка
      COOLDOWN_EXERCISES[0], // Глубокое дыхание
      COOLDOWN_EXERCISES[2], // Потягивание
    ],
  },
  
  // Энергетическая зарядка (12 минут)
  energyBoost: {
    name: 'Энергия ⚡',
    description: 'Для тех, кто хочет проснуться!',
    duration: 12,
    exercises: [
      WARMUP_EXERCISES[2], // Мельница руками
      CARDIO_EXERCISES[0], // Jumping Jacks
      CARDIO_EXERCISES[1], // Бег на месте
      CARDIO_EXERCISES[2], // Бег с захлёстом
      CARDIO_EXERCISES[3], // Прыжки лягушкой
      CARDIO_EXERCISES[5], // Боковые прыжки
      STRENGTH_EXERCISES[0], // Приседания
      STRENGTH_EXERCISES[3], // Отжимания от пола
      STRENGTH_EXERCISES[5], // Выпады
      FLEXIBILITY_EXERCISES[0], // Наклон вперёд
      COOLDOWN_EXERCISES[0], // Глубокое дыхание
    ],
  },
  
  // Сила и баланс (10 минут)
  strengthBalance: {
    name: 'Силач 💪',
    description: 'Упражнения для силы и равновесия',
    duration: 10,
    exercises: [
      WARMUP_EXERCISES[1], // Вращение плечами
      WARMUP_EXERCISES[3], // Вращение тазом
      STRENGTH_EXERCISES[0], // Приседания
      STRENGTH_EXERCISES[1], // Планка
      STRENGTH_EXERCISES[3], // Отжимания
      STRENGTH_EXERCISES[4], // Ягодичный мостик
      BALANCE_EXERCISES[0], // Фламинго
      BALANCE_EXERCISES[1], // Дерево
      BALANCE_EXERCISES[2], // Самолётик
      FLEXIBILITY_EXERCISES[4], // Поза ребёнка
    ],
  },
};

// Экспорт всех упражнений единым массивом
export const ALL_EXERCISES: Exercise[] = [
  ...WARMUP_EXERCISES,
  ...CARDIO_EXERCISES,
  ...STRENGTH_EXERCISES,
  ...FLEXIBILITY_EXERCISES,
  ...BALANCE_EXERCISES,
  ...ANIMAL_EXERCISES,
  ...COOLDOWN_EXERCISES,
];

// Функция для получения упражнения по ID
export const getExerciseById = (id: number): Exercise | undefined => {
  return ALL_EXERCISES.find(ex => ex.id === id);
};

// Функция для получения упражнений по категории
export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return ALL_EXERCISES.filter(ex => ex.category === category);
};

// Функция для получения случайного упражнения
export const getRandomExercise = (category?: ExerciseCategory): Exercise => {
  const exercises = category 
    ? getExercisesByCategory(category)
    : ALL_EXERCISES;
  const randomIndex = Math.floor(Math.random() * exercises.length);
  return exercises[randomIndex];
};

// Функция для создания персонализированной тренировки
export const createCustomWorkout = (
  durationMinutes: number,
  categories: ExerciseCategory[],
  difficulty: DifficultyLevel
): Exercise[] => {
  const exercisesPerMinute = 1.2; // примерно 1.2 упражнения в минуту
  const totalExercises = Math.round(durationMinutes * exercisesPerMinute);
  const exercisesPerCategory = Math.ceil(totalExercises / categories.length);
  
  const workout: Exercise[] = [];
  
  categories.forEach(category => {
    const categoryExercises = getExercisesByCategory(category)
      .filter((ex: any) => ex.difficulty <= difficulty)
      .sort(() => Math.random() - 0.5)
      .slice(0, exercisesPerCategory);
    
    workout.push(...categoryExercises);
  });
  
  return workout.slice(0, totalExercises);
};

// Экспорт типов
export type WorkoutRoute = typeof WORKOUT_ROUTES[keyof typeof WORKOUT_ROUTES];
