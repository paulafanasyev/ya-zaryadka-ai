import React from 'react';
import { Screen } from '../components/ui';
import { TaskList } from '../components/TaskList';

export default function StudyScreen({ navigation }: any) {
  return (
    <Screen title="Учёба и творчество" onBack={() => navigation.goBack()}>
      <TaskList
        categories={[
          { key: 'study', title: 'Учёба' },
          { key: 'creativity', title: 'Творчество' },
        ]}
      />
    </Screen>
  );
}
