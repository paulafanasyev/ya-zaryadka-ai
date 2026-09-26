import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GreenBackground, Pico, Card, DarkButton, AccentButton, BalancePill, ui } from '../components/ui';
import { useStore } from '../store/store';
import { C, heartsText, plural } from '../theme';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.stat}>
      <View style={s.ring}>
        <Text style={s.ringValue}>{value}</Text>
      </View>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function ResultScreen({ navigation, route }: any) {
  const p = route.params || {};
  const { state } = useStore();
  const insets = useSafeAreaInsets();
  const hearts = p.hearts || 0;
  const toPiggy = p.toPiggy || 0;

  return (
    <GreenBackground>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 40 }}>
        <View style={s.head}>
          <Text style={s.title}>{p.reps ? 'Готово!' : 'Попробуем ещё?'}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <BalancePill kind="hearts" value={state.hearts} />
            <BalancePill kind="piggy" value={state.piggy} />
          </View>
        </View>
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Pico size={130} />
        </View>
        <Card>
          <Text style={ui.cardTitle}>{p.program}</Text>
          <Text style={ui.muted}>
            {p.reps || 0} {plural(p.reps || 0, 'повтор', 'повтора', 'повторов')} · общая оценка {p.total || 0}
          </Text>
          <View style={s.stats}>
            <Stat label="Точность" value={p.accuracy || 0} />
            <Stat label="Меткость" value={p.precision || 0} />
            <Stat label="Кучность" value={p.consistency || 0} />
          </View>
        </Card>
        <Card>
          {hearts > 0 ? (
            <Text style={s.msg}>
              Вы получили {heartsText(hearts)}. Из них {heartsText(toPiggy)} перечислено в копилку. Всего на балансе {heartsText(state.hearts)}. Всего в копилке {heartsText(state.piggy)}.
            </Text>
          ) : (
            <Text style={s.msg}>Пико не увидел повторов. Проверь, что ты весь в кадре и в комнате светло, и попробуй снова.</Text>
          )}
        </Card>
        <DarkButton title="ВЫБРАТЬ ВОЗНАГРАЖДЕНИЕ" onPress={() => navigation.navigate('Tabs', { screen: 'RewardsTab' })} />
        <Text style={s.hint}>Тут ты можешь выбрать, на что потратить заработанные Сердца и Молнии</Text>
        <AccentButton title="НА ГЛАВНУЮ" onPress={() => navigation.navigate('Tabs', { screen: 'HomeTab' })} />
      </ScrollView>
    </GreenBackground>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  stat: { alignItems: 'center', flex: 1 },
  ring: { width: 78, height: 78, borderRadius: 39, borderWidth: 6, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontSize: 24, fontWeight: '900', color: C.charcoal },
  statLabel: { fontSize: 14, fontWeight: '700', color: C.charcoal, marginTop: 6 },
  msg: { fontSize: 16, lineHeight: 23, color: C.charcoal },
  hint: { color: '#FFFFFF', fontSize: 14, textAlign: 'center', marginBottom: 8 },
});
