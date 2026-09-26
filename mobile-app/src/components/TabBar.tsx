import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

const TABS: Record<string, { label: string; icon: any }> = {
  HomeTab: { label: 'Главная', icon: 'home-outline' },
  RewardsTab: { label: 'Вознаграждения', icon: 'ribbon-outline' },
  WorkoutTab: { label: 'Зарядка', icon: 'walk-outline' },
  DeedsTab: { label: 'Добрые дела', icon: 'thumbs-up-outline' },
  MenuTab: { label: 'Меню', icon: 'grid-outline' },
};

export default function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const t = TABS[route.name] || { label: route.name, icon: 'ellipse-outline' };
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={[s.item, focused && s.active]} accessibilityRole="button" accessibilityLabel={t.label}>
            <Ionicons name={t.icon} size={22} color={focused ? C.charcoal : '#FFFFFF'} />
            {focused ? (
              <Text style={s.label} numberOfLines={1}>
                {t.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: C.charcoal,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: { height: 44, minWidth: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 10 },
  active: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexShrink: 1 },
  label: { marginLeft: 6, color: C.charcoal, fontWeight: '700', fontSize: 13, flexShrink: 1 },
});
