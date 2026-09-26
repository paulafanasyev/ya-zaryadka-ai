import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import { Screen, Card, DarkButton, ui } from '../components/ui';
import { useStore } from '../store/store';
import { C } from '../theme';

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export function ProfileScreen({ navigation }: any) {
  const { state, update } = useStore();
  const [name, setName] = useState(state.profile ? state.profile.name : '');
  const [age, setAge] = useState(state.profile ? state.profile.age : 8);
  const [saved, setSaved] = useState(false);
  return (
    <Screen title="Профиль" onBack={() => navigation.goBack()}>
      <Card>
        <Text style={ui.label}>Имя</Text>
        <TextInput value={name} onChangeText={(t) => { setName(t); setSaved(false); }} style={ui.input} maxLength={24} />
        <Text style={ui.label}>Возраст</Text>
        <View style={s.ages}>
          {AGES.map((a) => (
            <Pressable key={a} onPress={() => { setAge(a); setSaved(false); }} style={[s.age, age === a && s.ageOn]}>
              <Text style={[s.ageText, age === a && { color: '#FFFFFF' }]}>{a}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={ui.muted}>От возраста зависит количество повторов в зарядке.</Text>
        <DarkButton
          title={saved ? 'СОХРАНЕНО' : 'СОХРАНИТЬ'}
          disabled={!name.trim()}
          onPress={() => {
            update((st) => ({ ...st, profile: { name: name.trim(), age, consent: st.profile ? st.profile.consent : true } }));
            setSaved(true);
          }}
          style={{ marginTop: 12 }}
        />
      </Card>
      <Card>
        <Text style={ui.cardTitle}>Статистика</Text>
        <Text style={ui.muted}>Зарядок: {state.sessions.length}</Text>
        <Text style={ui.muted}>Добрых дел подтверждено: {state.taskLogs.filter((l) => l.status === 'approved').length}</Text>
      </Card>
    </Screen>
  );
}

export function SettingsScreen({ navigation }: any) {
  const { state, update } = useStore();
  const set = (patch: any) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));
  return (
    <Screen title="Настройки" onBack={() => navigation.goBack()}>
      <Card>
        <View style={s.line}>
          <Text style={s.lineText}>Голос Пико</Text>
          <Switch value={state.settings.voice} onValueChange={(v) => set({ voice: v })} trackColor={{ true: C.accent, false: C.line }} />
        </View>
        <View style={s.line}>
          <Text style={s.lineText}>Показывать скелет на камере</Text>
          <Switch value={state.settings.showSkeleton} onValueChange={(v) => set({ showSkeleton: v })} trackColor={{ true: C.accent, false: C.line }} />
        </View>
        <Text style={ui.muted}>Остальные настройки доступны в Родительском режиме.</Text>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  ages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  age: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  ageOn: { backgroundColor: C.accent },
  ageText: { fontSize: 16, fontWeight: '800', color: C.charcoal },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  lineText: { flex: 1, fontSize: 16, fontWeight: '700', color: C.charcoal, marginRight: 10 },
});
