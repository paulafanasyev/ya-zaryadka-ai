import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GreenBackground, Pico } from '../components/ui';

export default function SplashScreen() {
  return (
    <GreenBackground>
      <View style={s.center}>
        <Text style={s.logo}>Я-Зарядка</Text>
        <Text style={s.ai}>AI</Text>
        <Pico size={190} />
        <Text style={s.slogan}>Заряди себя, семью, страну!</Text>
        <ActivityIndicator color="#FFFFFF" style={{ marginTop: 24 }} />
      </View>
    </GreenBackground>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { color: '#FFFFFF', fontSize: 40, fontWeight: '900' },
  ai: { color: '#2B2E28', fontSize: 28, fontWeight: '900', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, overflow: 'hidden', marginTop: 6, marginBottom: 12 },
  slogan: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 16 },
});
