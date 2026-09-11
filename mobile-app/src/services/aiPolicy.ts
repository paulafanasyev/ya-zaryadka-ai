/** Local child-safety gate. This runs before any external AI request. */

export type PolicyResult =
  | { allowed: true }
  | { allowed: false; reason: string; response: string };

const BLOCKED_PATTERNS: RegExp[] = [
  /\b(sex|porn|porno|эрот|секс|порно)\b/i,
  /\b(наркот|drug|cocaine|heroin|meth|марихуан|weed)\b/i,
  /\b(оруж|weapon|gun|пистолет|бомб|взрывчат)\b/i,
  /\b(самоубий|суицид|самоповреж|порезать себя|self[- ]?harm|suicide)\b/i,
  /\b(казино|ставк|พนัน|gambl|betting)\b/i,
  /\b(парол|password|api[-_ ]?key|secret|токен|token)\b/i,
  /\b(обойти родител|обойти контроль|bypass.*parent|parental control.*bypass)\b/i,
];

const MEDICAL_DIAGNOSIS_PATTERNS: RegExp[] = [
  /какой у меня диагноз/i,
  /что у меня за болезнь/i,
  /какое лекарство мне/i,
  /сколько таблеток/i,
  /назначь.*лекар/i,
  /diagnos(e|is)|prescribe|medication.*for me/i,
];

const INVESTMENT_PATTERNS: RegExp[] = [
  /куда вложить.*деньг/i,
  /что купить.*акци/i,
  /какую крипт/i,
  /инвестир(уй|овать).*чтобы заработать/i,
  /какой кредит взять/i,
];

export function checkChildSafety(text: string): PolicyResult {
  const value = text.trim();

  if (!value) {
    return { allowed: true };
  }

  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(value))) {
    return {
      allowed: false,
      reason: 'blocked_category',
      response: 'Я не могу помогать с этой темой. Давай поговорим о зарядке, учёбе, сказках или полезных привычках.',
    };
  }

  if (MEDICAL_DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(value))) {
    return {
      allowed: false,
      reason: 'medical_diagnosis',
      response: 'Я не ставлю диагнозы и не назначаю лекарства. Если тебе плохо или больно, остановись и расскажи взрослому, которому доверяешь.',
    };
  }

  if (INVESTMENT_PATTERNS.some((pattern) => pattern.test(value))) {
    return {
      allowed: false,
      reason: 'financial_advice',
      response: 'Я могу объяснить основы денег: бюджет, накопления, доходы и расходы. Но не буду советовать ребёнку, куда вкладывать деньги или какой кредит брать.',
    };
  }

  return { allowed: true };
}

export const SVETLANA_SYSTEM_PROMPT = `Ты Пико — добрый робот-помощник приложения «Я-Зарядка» для детей 6–14 лет.
Отвечай по-русски, коротко, понятно и доброжелательно.
Разрешённые темы: зарядка и упражнения, безопасные здоровые привычки без диагностики, поддержка и мотивация, детская финансовая грамотность, обучение, творчество, сказки и обсуждение произведений Пушкина, а также вопросы о приложении.
Не ставь диагнозы, не назначай лечение и лекарства. Не обсуждай сексуальный контент, наркотики, оружие, самоповреждение, азартные игры, обход родительского контроля, пароли, секреты и вредоносные действия.
Финансовая грамотность — только образовательная: бюджет, накопления, доходы и расходы, без инвестиционных или кредитных рекомендаций ребёнку.
Не проси и не раскрывай персональные данные ребёнка.`;
