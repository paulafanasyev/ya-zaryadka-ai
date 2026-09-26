import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R } from '../theme';

export const PICO = require('../../assets/pico.png');

const PATTERN: [string, string, string, number][] = [
  ['rugby', '4%', '6%', -25],
  ['boxing-glove', '10%', '72%', 15],
  ['dumbbell', '24%', '38%', -10],
  ['tennis', '34%', '82%', 20],
  ['basketball-hoop-outline', '46%', '4%', 0],
  ['skateboard', '58%', '60%', -15],
  ['bike', '70%', '18%', 0],
  ['timer-outline', '80%', '78%', 10],
  ['shoe-sneaker', '90%', '40%', -8],
];

export function SportPattern({ tone }: { tone: 'light' | 'green' }) {
  const color = tone === 'light' ? 'rgba(255,255,255,0.13)' : 'rgba(61,165,53,0.10)';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PATTERN.map(([name, top, left, rot], i) => (
        <MaterialCommunityIcons
          key={i}
          name={name as any}
          size={46}
          color={color}
          style={{ position: 'absolute', top: top as any, left: left as any, transform: [{ rotate: rot + 'deg' }] }}
        />
      ))}
    </View>
  );
}

export function GreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient colors={[C.g1, C.g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SportPattern tone="light" />
      {children}
    </LinearGradient>
  );
}

export function RoundBack({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={ui.roundBack} accessibilityRole="button" accessibilityLabel="Назад">
      <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

export function Screen({ title, onBack, children }: { title: string; onBack?: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.offWhite }}>
      <SportPattern tone="green" />
      <LinearGradient colors={[C.g1, C.g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[ui.header, { paddingTop: insets.top + 10 }]}>
        {onBack ? <RoundBack onPress={onBack} /> : <View style={{ width: 40 }} />}
        <Text style={ui.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

interface BtnProps { title: string; onPress?: () => void; disabled?: boolean; loading?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; }

export function DarkButton({ title, onPress, disabled, loading, small, style }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [ui.btn, small && ui.btnSmall, { backgroundColor: C.charcoal, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[ui.btnText, small && ui.btnTextSmall]}>{title}</Text>}
    </Pressable>
  );
}

export function AccentButton({ title, onPress, disabled, loading, small, style }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [ui.btn, small && ui.btnSmall, { backgroundColor: C.accent, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[ui.btnText, small && ui.btnTextSmall]}>{title}</Text>}
    </Pressable>
  );
}

export function GhostButton({ title, onPress, disabled, small, style }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [ui.btn, small && ui.btnSmall, ui.ghost, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }, style]}
    >
      <Text style={[ui.btnText, small && ui.btnTextSmall, { color: C.charcoal }]}>{title}</Text>
    </Pressable>
  );
}

export function BalancePill({ kind, value }: { kind: 'hearts' | 'lightning' | 'piggy'; value: number | string }) {
  return (
    <View style={ui.pill}>
      {kind === 'hearts' ? <Ionicons name="heart" size={18} color={C.heart} /> : null}
      {kind === 'lightning' ? <Ionicons name="flash" size={18} color={C.lightning} /> : null}
      {kind === 'piggy' ? <MaterialCommunityIcons name="piggy-bank" size={18} color={C.piggy} /> : null}
      <Text style={ui.pillText}>{value}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[ui.card, style]}>{children}</View>;
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const p = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <View style={ui.progressTrack}>
      <View style={[ui.progressFill, { width: Math.round(p * 100) + '%' as any }]} />
    </View>
  );
}

export function Pico({ size = 140 }: { size?: number }) {
  return <Image source={PICO} style={{ width: size, height: size * 1.25 }} resizeMode="contain" />;
}

export function Bubble({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[ui.bubble, style]}>
      <Text style={ui.bubbleText}>{text}</Text>
    </View>
  );
}

export function Tag({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    pending: { t: 'Ждёт родителя', c: C.warn },
    approved: { t: 'Подтверждено', c: C.accent },
    rejected: { t: 'Отклонено', c: C.danger },
  } as const;
  const m = map[status];
  return (
    <View style={[ui.tag, { borderColor: m.c }]}>
      <Text style={[ui.tagText, { color: m.c }]}>{m.t}</Text>
    </View>
  );
}

export const ui = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  roundBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  btn: { borderRadius: R.pill, paddingVertical: 16, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 14, marginVertical: 0 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  btnTextSmall: { fontSize: 13 },
  ghost: { backgroundColor: 'transparent', borderWidth: 2, borderColor: C.charcoal },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 12, gap: 6 },
  pillText: { fontSize: 16, fontWeight: '800', color: C.charcoal },
  card: { backgroundColor: '#FFFFFF', borderRadius: R.card, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: C.charcoal },
  cardValue: { fontSize: 28, fontWeight: '800', color: C.charcoal, marginTop: 4 },
  muted: { fontSize: 14, color: C.muted, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '800', color: C.charcoal, marginTop: 10, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '700', color: C.charcoal, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.charcoal, backgroundColor: '#FFFFFF', marginBottom: 10 },
  error: { color: C.danger, fontSize: 14, marginVertical: 6 },
  progressTrack: { height: 12, borderRadius: 6, backgroundColor: '#E6EFE3', overflow: 'hidden', marginTop: 10 },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: C.accent },
  bubble: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, marginLeft: 8 },
  bubbleText: { fontSize: 15, color: C.charcoal, lineHeight: 21 },
  tag: { borderWidth: 1.5, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
