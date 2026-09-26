import React from 'react';
import { Text, View, Linking } from 'react-native';
import { Screen, Card, Pico, GhostButton, ui } from '../components/ui';
import { APP_VERSION, PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from '../config';

function Block({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <Text style={ui.cardTitle}>{title}</Text>
      <Text style={[ui.muted, { lineHeight: 21 }]}>{text}</Text>
    </Card>
  );
}

const open = (url: string) => Linking.openURL(url).catch(() => undefined);

export function InfoScreen({ navigation }: any) {
  return (
    <Screen title="Информация" onBack={() => navigation.goBack()}>
      <Block title="Как проходит зарядка" text="Поставь телефон на стол или пол и отойди на 2–3 шага. Пико должен видеть тебя от головы до ног. Пико считает повторы и подсказывает, как сделать упражнение лучше. Если в кадре никого нет, слишком темно или в кадре несколько людей, счёт ставится на паузу." />
      <Block title="Сколько повторов" text="Нормы зависят от возраста: для 4–6 лет обычно 5–8 повторов, для 7–10 лет 6–12, для 11–16 лет до 12–16. Прыжков и шагов больше. Так рекомендуют методики утренней гимнастики для детей." />
      <Block title="Точность, Меткость, Кучность" text="Точность показывает, насколько правильная техника. Меткость показывает, насколько полно ты делаешь движение: глубину приседа, высоту рук и коленей. Кучность показывает, насколько ровно и стабильно ты повторяешь упражнение. Все оценки от 0 до 100." />
      <Block title="Сердца, Молнии и Копилка" text="За зарядку и добрые дела ты получаешь Сердца. Часть от каждой награды попадает в Копилку. Каждую неделю Копилка приносит Молнии. Молнии можно обменять на Сердца или добавить в Копилку. Забрать Сердца из Копилки можно только с разрешения родителя." />
      <Block title="Безопасность" text="Занимайся на свободном месте, без острых углов рядом. Если что-то заболит, остановись и скажи взрослым." />
    </Screen>
  );
}

export function AboutScreen({ navigation }: any) {
  return (
    <Screen title="О приложении" onBack={() => navigation.goBack()}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Pico size={120} />
      </View>
      <Block title="Я-Зарядка AI" text={'Версия ' + APP_VERSION + '. Детская зарядка с роботом-тренером Пико для детей 4–16 лет. Заряди себя, семью, страну!'} />
      <Block title="Приватность" text="Видео с камеры обрабатывается только на телефоне, не записывается и никуда не отправляется. Модель распознавания позы встроена в приложение, интернет для зарядки не нужен. Имя, возраст, Сердца и история хранятся только на телефоне. Родительский PIN хранится в защищённом хранилище Android в виде хеша. Удалить все данные можно в родительском режиме." />
      <GhostButton small title="ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ" onPress={() => open(PRIVACY_URL)} style={{ marginBottom: 8 }} />
      <GhostButton small title="УСЛОВИЯ ИСПОЛЬЗОВАНИЯ" onPress={() => open(TERMS_URL)} style={{ marginBottom: 8 }} />
      <GhostButton small title="НАПИСАТЬ В ПОДДЕРЖКУ" onPress={() => open('mailto:' + SUPPORT_EMAIL)} />
    </Screen>
  );
}
