export const FRAME_HINTS: Record<string, string> = {
  no_person: 'Встань перед камерой, я тебя пока не вижу.',
  too_close: 'Отойди чуть назад, чтобы я видел тебя целиком, от головы до ног.',
  too_far: 'Подойди немного ближе к телефону.',
  multiple: 'Я вижу несколько человек. Пусть в кадре останется один спортсмен.',
  dark: 'Здесь темновато. Включи свет, пожалуйста.',
};

export const STATUS_LABEL: Record<string, string> = {
  init: 'Готовлюсь',
  ok: 'Вижу тебя',
  no_person: 'Не вижу тебя',
  too_close: 'Слишком близко',
  too_far: 'Слишком далеко',
  multiple: 'Несколько людей',
  dark: 'Темно',
};

export const FORM_HINTS: Record<string, string> = {
  tilt: 'Держи корпус ровно, не заваливайся в сторону.',
  legs_asym: 'Сгибай обе ноги одинаково.',
  shallow: 'Присядь чуть глубже, у тебя получится!',
  arms_asym: 'Поднимай обе руки одновременно.',
  elbows: 'Выпрями руки в локтях.',
  hips: 'Бёдра держи на месте, наклоняйся только корпусом.',
  knees_higher: 'Поднимай колени повыше!',
  knees_bent: 'Старайся не сгибать колени.',
  punch_height: 'Выбрасывай руку на уровне плеча.',
  wobble: 'Держи равновесие, смотри в одну точку.',
  hold_lost: 'Попробуй ещё раз и удержи позу.',
  arms_level: 'Держи руки ровно, как крылья самолёта.',
  jack_legs: 'Прыгай шире, ноги в стороны!',
};

const REP_PHRASES = ['Отлично!', 'Так держать!', 'Супер!', 'Ты заряжаешься!', 'Молодец!'];

export function motivation(kind: 'rep' | 'almost' | 'done', n: number) {
  if (kind === 'done') return 'Упражнение выполнено! Ты молодец!';
  if (kind === 'almost') return 'Ещё чуть-чуть!';
  return REP_PHRASES[n % REP_PHRASES.length] + ' Уже ' + n + '!';
}
