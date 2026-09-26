import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../store/store';
import TabBar from '../components/TabBar';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import RewardsScreen from '../screens/RewardsScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import DeedsScreen from '../screens/DeedsScreen';
import MenuScreen from '../screens/MenuScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import ResultScreen from '../screens/ResultScreen';
import ParentModeScreen from '../screens/ParentModeScreen';
import StudyScreen from '../screens/StudyScreen';
import BalanceScreen from '../screens/BalanceScreen';
import { ProfileScreen, SettingsScreen } from '../screens/ProfileScreens';
import { InfoScreen, AboutScreen } from '../screens/InfoScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(p) => <TabBar {...p} />}>
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="RewardsTab" component={RewardsScreen} />
      <Tab.Screen name="WorkoutTab" component={WorkoutListScreen} />
      <Tab.Screen name="DeedsTab" component={DeedsScreen} />
      <Tab.Screen name="MenuTab" component={MenuScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { ready, state } = useStore();
  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  if (!ready || !splashDone) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!state.profile ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Workout" component={WorkoutSessionScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Parent" component={ParentModeScreen} />
          <Stack.Screen name="Study" component={StudyScreen} />
          <Stack.Screen name="Balance" component={BalanceScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Info" component={InfoScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
