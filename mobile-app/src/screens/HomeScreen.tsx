import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GreenBackground, Pico, Bubble, Card, DarkButton, AccentButton, GhostButton, BalancePill, ProgressBar, ui } from '../components/ui';
import { useStore, dayKey, exchangeLightning, lightningToPiggy } from '../store/store';
import { C, heartsText, boltsText } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { state, update } = useStore();
  const insets = useSafeAreaInsets();
  const goal = state.goals.find((g) => g.id === state.selectedGoalId) || null;
  const today = state.sessions.filter((x) => dayKey(x.at) === dayKey()).length;

  return (
    <GreenBackground>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 120 }}>
        <View style={s.topRow}>
          <Text style={s.logo}>
            Я-Зарядка <Text style={s.ai}> AI </Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <BalancePill kind="hearts" value={state.hearts} />
            <BalancePill kind="lightning" value={state.lightning} />
          </View>
        </View>

        <Text style={s.hello}>Привет, {state.profile ? state.profile.name : ''}!</Text>
        <View style={s.picoRow}>
          <Pico size={120} />
          <Bubble
            text={
              today
                ? 'Зарядка сегодня уже есть! Можно повторить или сделать доброе дело.'
                : 'Готов зарядиться? Я буду рядом и подскажу!'
            }
          />
        </View>

        <DarkButton title="НАЧАТЬ ЗАРЯДКУ" onPress={() => navigation.navigate('WorkoutTab')} style={{ marginBottom: 16 }} />

        {state.pendingInterest > 0 ? (
          <Card>
            <Text style={ui.cardTitle}>
              В копилке начислен новый %, начислено {boltsText(state.pendingInterest)}.
            </Text>
            <Text style={ui.muted}>Что с ними сделать:</Text>
            <AccentButton title="1. ОБМЕНЯТЬ НА СЕРДЦА" onPress={() => update((st) => exchangeLightning(st, st.pendingInterest))} style={{ marginTop: 10 }} />
            <GhostButton title="2. ДОБАВИТЬ В КОПИЛКУ" onPress={() => update((st) => lightningToPiggy(st, st.pendingInterest))} />
          </Card>
        ) : null}

        <Card>
          <View style={ui.row}>
            <MaterialCommunityIcons name="piggy-bank" size={34} color={C.piggy} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={ui.cardTitle}>Копилка</Text>
              <Text style={ui.muted}>
                {state.settings.piggyPercent}% от каждой награды, +{state.settings.interestPercent}% Молниями каждую неделю
              </Text>
            </View>
            <Text style={s.big}>{state.piggy}</Text>
          </View>
        </Card>

        <Card>
          <Text style={ui.cardTitle}>Моя цель</Text>
          {goal ? (
            <>
              <Text style={s.goal}>{goal.title}</Text>
              <ProgressBar value={state.hearts} max={goal.price} />
              <Text style={ui.muted}>
                {Math.min(state.hearts, goal.price)} из {heartsText(goal.price)}
              </Text>
            </>
          ) : (
            <Text style={ui.muted}>Цель ещё не выбрана.</Text>
          )}
          <DarkButton title="ВЫБРАТЬ ВОЗНАГРАЖДЕНИЕ" small onPress={() => navigation.navigate('RewardsTab')} style={{ marginTop: 12 }} />
          <Text style={ui.muted}>Тут ты можешь выбрать, на что потратить заработанные Сердца и Молнии</Text>
        </Card>

        <Text style={s.slogan}>Заряди себя, семью, страну!</Text>
      </ScrollView>
    </GreenBackground>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  ai: { color: C.charcoal, backgroundColor: '#FFFFFF', fontSize: 18 },
  hello: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 18 },
  picoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  big: { fontSize: 28, fontWeight: '900', color: C.charcoal },
  goal: { fontSize: 22, fontWeight: '800', color: C.accent, marginTop: 6 },
  slogan: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 10 },
});
