import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GreenBackground, Pico, Bubble, Card, DarkButton, ui } from '../components/ui';
import { useStore } from '../store/store';
import { C } from '../theme';

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export default function OnboardingScreen() {
  const { update } = useStore();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [consent, setConsent] = useState(false);
  const ok = name.trim().length > 0 && age !== null && consent;

  return (
    <GreenBackground>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Давай знакомиться!</Text>
        <View style={s.picoRow}>
          <Pico size={110} />
          <Bubble text="Я Пико, твой тренер. Как тебя зовут и сколько тебе лет?" />
        </View>
        <Card>
          <Text style={ui.label}>Имя ребёнка</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Например, Маша" style={ui.input} maxLength={24} />
          <Text style={[ui.label, { marginTop: 8 }]}>Возраст</Text>
          <View style={s.ages}>
            {AGES.map((a) => (
              <Pressable key={a} onPress={() => setAge(a)} style={[s.age, age === a && s.ageOn]}>
                <Text style={[s.ageText, age === a && { color: '#FFFFFF' }]}>{a}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setConsent(!consent)} style={s.consent}>
            <Ionicons name={consent ? 'checkbox' : 'square-outline'} size={26} color={C.accent} />
            <Text style={s.consentText}>
              Я родитель. Разрешаю использовать камеру во время зарядки. Видео обрабатывается только на телефоне, не записывается и никуда не отправляется.
            </Text>
          </Pressable>
          <DarkButton
            title="НАЧАТЬ"
            disabled={!ok}
            onPress={() => update((st) => ({ ...st, profile: { name: name.trim(), age: age as number, consent: true } }))}
          />
        </Card>
      </ScrollView>
    </GreenBackground>
  );
}

const s = StyleSheet.create({
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginBottom: 12 },
  picoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  age: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  ageOn: { backgroundColor: C.accent },
  ageText: { fontSize: 16, fontWeight: '800', color: C.charcoal },
  consent: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 12 },
  consentText: { flex: 1, fontSize: 14, color: C.charcoal, lineHeight: 20 },
});
