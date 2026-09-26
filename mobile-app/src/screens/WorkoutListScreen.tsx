import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Card, AccentButton, Pico, Bubble, ui } from '../components/ui';
import { PROGRAMS, EXERCISES, targetFor } from '../cv/exercises';
import { useStore } from '../store/store';
import { C, fmtDate, heartsText } from '../theme';

export default function WorkoutListScreen({ navigation }: any) {
  const { state } = useStore();
  const age = state.profile ? state.profile.age : 8;
  return (
    <Screen title="Зарядка">
      <View style={s.tip}>
        <Pico size={90} />
        <Bubble text="Поставь телефон на стол или пол и отойди на 2–3 шага. Я должен видеть тебя целиком." />
      </View>
      {PROGRAMS.map((p) => (
        <Card key={p.id}>
          <Text style={ui.cardTitle}>{p.name}</Text>
          <Text style={ui.muted}>{p.description}</Text>
          <View style={s.list}>
            {p.exercises.map((id, i) => {
              const ex = EXERCISES[id];
              return (
                <Text key={id + i} style={s.item}>
                  {i + 1}. {ex.name}: {targetFor(ex, age)} {ex.unit}
                </Text>
              );
            })}
          </View>
          <AccentButton title="НАЧАТЬ" onPress={() => navigation.navigate('Workout', { programId: p.id })} />
        </Card>
      ))}
      {state.sessions.length ? <Text style={ui.section}>Последние зарядки</Text> : null}
      {state.sessions.slice(0, 5).map((x) => (
        <Card key={x.id}>
          <Text style={ui.cardTitle}>{x.program}</Text>
          <Text style={ui.muted}>
            {fmtDate(x.at)} · повторов: {x.reps} · +{heartsText(x.hearts)}
          </Text>
          <Text style={ui.muted}>
            Точность {x.accuracy} · Меткость {x.precision} · Кучность {x.consistency}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  tip: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  list: { marginVertical: 10 },
  item: { fontSize: 15, color: C.charcoal, marginVertical: 2 },
});
