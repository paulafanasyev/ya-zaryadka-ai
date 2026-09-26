import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, ui } from '../components/ui';
import { C } from '../theme';

interface Item { icon: any; title: string; onPress?: () => void; soon?: boolean; }

function Row({ item }: { item: Item }) {
  return (
    <Pressable onPress={item.onPress} disabled={item.soon} style={({ pressed }) => [s.row, { opacity: item.soon ? 0.45 : pressed ? 0.7 : 1 }]}>
      <View style={s.icon}>
        <Ionicons name={item.icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={s.title}>{item.title}</Text>
      {item.soon ? <Text style={s.soon}>скоро</Text> : <Ionicons name="chevron-forward" size={20} color={C.muted} />}
    </Pressable>
  );
}

export default function MenuScreen({ navigation }: any) {
  const share = () => {
    Share.share({ message: 'Я-Зарядка AI: утренняя зарядка с роботом-тренером Пико. Заряди себя, семью, страну!' }).catch(() => undefined);
  };
  const main: Item[] = [
    { icon: 'wallet-outline', title: 'Баланс', onPress: () => navigation.navigate('Balance') },
    { icon: 'person-outline', title: 'Профиль', onPress: () => navigation.navigate('Profile') },
    { icon: 'information-circle-outline', title: 'Информация', onPress: () => navigation.navigate('Info') },
    { icon: 'settings-outline', title: 'Настройки', onPress: () => navigation.navigate('Settings') },
    { icon: 'share-social-outline', title: 'Поделиться', onPress: share },
    { icon: 'qr-code-outline', title: 'Показать QR код', soon: true },
    { icon: 'help-buoy-outline', title: 'Поддержка', soon: true },
    { icon: 'apps-outline', title: 'О приложении', onPress: () => navigation.navigate('About') },
  ];
  const extra: Item[] = [
    { icon: 'book-outline', title: 'Учёба и творчество', onPress: () => navigation.navigate('Study') },
    { icon: 'lock-closed-outline', title: 'Родительский режим', onPress: () => navigation.navigate('Parent') },
  ];
  return (
    <Screen title="Меню">
      <Card style={{ paddingVertical: 6 }}>
        {main.map((i) => (
          <Row key={i.title} item={i} />
        ))}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        {extra.map((i) => (
          <Row key={i.title} item={i} />
        ))}
      </Card>
      <Text style={[ui.muted, { textAlign: 'center' }]}>Заряди себя, семью, страну!</Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '700', color: C.charcoal },
  soon: { fontSize: 12, color: C.muted, fontWeight: '700' },
});
