import React from 'react';
import { Screen } from '../components/ui';
import { TaskList } from '../components/TaskList';

export default function DeedsScreen() {
  return (
    <Screen title="Добрые дела">
      <TaskList
        categories={[
          { key: 'deed', title: 'Добрые дела' },
          { key: 'habit', title: 'Полезные привычки' },
        ]}
      />
    </Screen>
  );
}
