import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Card, BalancePill, ui } from '../components/ui';
import { useStore } from '../store/store';
import { C, fmtDate } from '../theme';

function delta(n: number, label: string) {
  if (!n) return null;
  return (
    <Text style={{ color: n > 0 ? C.accent : C.danger, fontWeight: '800', marginLeft: 8 }}>
      {n > 0 ? '+' : ''}
      {n} {label}
    </Text>
  );
}

export default function BalanceScreen({ navigation }: any) {
  const { state } = useStore();
  return (
    <Screen title="Баланс" onBack={() => navigation.goBack()}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <BalancePill kind="hearts" value={state.hearts} />
        <BalancePill kind="lightning" value={state.lightning} />
        <BalancePill kind="piggy" value={state.piggy} />
      </View>
      {state.ops.length === 0 ? <Text style={ui.muted}>Пока нет операций. Сделай зарядку, чтобы получить первые Сердца!</Text> : null}
      {state.ops.map((o) => (
        <Card key={o.id}>
          <Text style={ui.cardTitle}>{o.title}</Text>
          <Text style={ui.muted}>{fmtDate(o.at)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, marginLeft: -8 }}>
            {delta(o.hearts, 'Сердец')}
            {delta(o.lightning, 'Молний')}
            {delta(o.piggy, 'в Копилке')}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
