import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import WorldScreen from '../screens/WorldScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import CreativityScreen from '../screens/CreativityScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import SvetlanaScreen from '../screens/SvetlanaScreen';
import ParentModeScreen from '../screens/ParentModeScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { NavigationParams } from '../types';

const Stack = createStackNavigator<NavigationParams>();

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="World"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen name="World" component={WorldScreen} />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen name="Creativity" component={CreativityScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen name="Svetlana" component={SvetlanaScreen} />
            <Stack.Screen name="ParentMode" component={ParentModeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
