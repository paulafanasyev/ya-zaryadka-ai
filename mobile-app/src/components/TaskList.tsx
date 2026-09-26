import React from 'react';
import { View, Text } from 'react-native';
import { Card, AccentButton, Tag, ui } from './ui';
import { useStore, dayKey, submitTask, habitStreak, TaskCategory } from '../store/store';
import { heartsText } from '../theme';

export function TaskList({ categories }: { categories: { key: TaskCategory; title: string }[] }) {
  const { state, update } = useStore();
  const today = dayKey();
  return (
    <>
      {categories.map((cat) => (
        <View key={cat.key}>
          <Text style={ui.section}>{cat.title}</Text>
          {state.tasks
            .filter((t) => t.category === cat.key)
            .map((t) => {
              const log = state.taskLogs.find((l) => l.taskId === t.id && l.day === today && l.status !== 'rejected');
              const streak = cat.key === 'habit' ? habitStreak(state, t.id) : 0;
              return (
                <Card key={t.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={ui.cardTitle}>{t.title}</Text>
                    <Text style={ui.muted}>
                      +{heartsText(t.hearts)}
                      {streak > 0 ? ' · серия ' + streak + ' дн.' : ''}
                    </Text>
                  </View>
                  {log ? (
                    <Tag status={log.status} />
                  ) : (
                    <AccentButton small title="СДЕЛАЛ!" onPress={() => update((s) => submitTask(s, t) || s)} />
                  )}
                </Card>
              );
            })}
        </View>
      ))}
      <Text style={ui.muted}>Сердца начисляются, когда родитель подтвердит дело в Родительском режиме.</Text>
    </>
  );
}
