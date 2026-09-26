import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Screen, Card, DarkButton, AccentButton, GhostButton, BalancePill, ProgressBar, Tag, ui } from '../components/ui';
import { useStore, requestReward, requestWithdraw, exchangeLightning, lightningToPiggy } from '../store/store';
import { C, heartsText, boltsText, fmtDate } from '../theme';

export default function RewardsScreen() {
  const { state, update } = useStore();
  const [msg, setMsg] = useState('');
  const amounts = [5, 10, 25];

  const withdraw = (a: number) => {
    update((s) => {
      const n = requestWithdraw(s, a);
      if (!n) return s;
      return n;
    });
    setMsg('Запрос на вывод ' + heartsText(a) + ' отправлен родителю.');
  };

  return (
    <Screen title="Вознаграждения">
      <View style={s.pills}>
        <BalancePill kind="hearts" value={state.hearts} />
        <BalancePill kind="lightning" value={state.lightning} />
        <BalancePill kind="piggy" value={state.piggy} />
      </View>
      <Text style={ui.muted}>Тут ты можешь выбрать, на что потратить заработанные Сердца и Молнии</Text>
      {msg ? <Text style={[ui.muted, { color: C.accent, fontWeight: '700' }]}>{msg}</Text> : null}

      <Text style={ui.section}>Цели</Text>
      {state.goals.map((g) => {
        const selected = state.selectedGoalId === g.id;
        const pending = state.requests.some((r) => r.kind === 'reward' && r.goalId === g.id && r.status === 'pending');
        const enough = state.hearts >= g.price;
        return (
          <Card key={g.id} style={selected ? { borderWidth: 2, borderColor: C.accent } : undefined}>
            <View style={ui.row}>
              <Ionicons name="gift-outline" size={28} color={C.accent} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={ui.cardTitle}>{g.title}</Text>
                <Text style={ui.muted}>{heartsText(g.price)}</Text>
              </View>
              {selected ? <Text style={s.selected}>Моя цель</Text> : null}
            </View>
            <ProgressBar value={state.hearts} max={g.price} />
            <View style={s.btnRow}>
              {!selected ? <GhostButton small title="СДЕЛАТЬ ЦЕЛЬЮ" onPress={() => update((st) => ({ ...st, selectedGoalId: g.id }))} /> : null}
              {pending ? (
                <Tag status="pending" />
              ) : (
                <AccentButton
                  small
                  title="ХОЧУ ЭТО!"
                  disabled={!enough}
                  onPress={() => {
                    update((st) => requestReward(st, g) || st);
                    setMsg('Запрос «' + g.title + '» отправлен родителю.');
                  }}
                />
              )}
            </View>
          </Card>
        );
      })}
      <Text style={ui.muted}>Вознаграждение покупает родитель. Покупка у магазинов-партнёров появится после подключения сервера.</Text>

      <Text style={ui.section}>Копилка</Text>
      <Card>
        <View style={ui.row}>
          <MaterialCommunityIcons name="piggy-bank" size={34} color={C.piggy} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={ui.cardValue}>{heartsText(state.piggy)}</Text>
            <Text style={ui.muted}>
              {state.settings.piggyPercent}% от каждой награды. Каждую неделю +{state.settings.interestPercent}% Молниями.
            </Text>
          </View>
        </View>
        <Text style={[ui.label, { marginTop: 12 }]}>Попросить у родителя вывести на баланс:</Text>
        <View style={s.btnRow}>
          {amounts.map((a) => (
            <GhostButton key={a} small title={String(a)} disabled={a > state.piggy} onPress={() => withdraw(a)} />
          ))}
          <GhostButton small title="ВСЁ" disabled={state.piggy <= 0} onPress={() => withdraw(state.piggy)} />
        </View>
      </Card>

      <Text style={ui.section}>Молнии</Text>
      <Card>
        <View style={ui.row}>
          <Ionicons name="flash" size={32} color={C.lightning} />
          <Text style={[ui.cardValue, { marginLeft: 12 }]}>{boltsText(state.lightning)}</Text>
        </View>
        <Text style={ui.muted}>Молнии можно обменять на Сердца 1 к {state.settings.exchangeRate} или добавить в Копилку.</Text>
        <AccentButton title="ОБМЕНЯТЬ НА СЕРДЦА" disabled={state.lightning <= 0} onPress={() => update((st) => exchangeLightning(st, st.lightning))} style={{ marginTop: 10 }} />
        <DarkButton title="ДОБАВИТЬ В КОПИЛКУ" disabled={state.lightning <= 0} onPress={() => update((st) => lightningToPiggy(st, st.lightning))} />
      </Card>

      {state.requests.length ? <Text style={ui.section}>Мои запросы</Text> : null}
      {state.requests.slice(0, 10).map((r) => (
        <Card key={r.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={ui.cardTitle}>{r.title}</Text>
            <Text style={ui.muted}>
              {heartsText(r.amount)} · {fmtDate(r.at)}
            </Text>
          </View>
          <Tag status={r.status} />
        </Card>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  pills: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },
  selected: { color: C.accent, fontWeight: '800' },
});
