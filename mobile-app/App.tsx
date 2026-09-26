import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StoreProvider } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F4F4EE' } };

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
