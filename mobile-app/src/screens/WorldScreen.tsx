import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams } from '../../types';

type WorldScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'World'>;
};

const { width, height } = Dimensions.get('window');

export default function WorldScreen({ navigation }: WorldScreenProps) {
  const [greeting, setGreeting] = useState('Доброе утро!');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) {
      setGreeting('Добрый день!');
    } else if (hour >= 17 && hour < 23) {
      setGreeting('Добрый вечер!');
    } else if (hour >= 23 || hour < 6) {
      setGreeting('Доброй ночи!');
    }
  }, []);

  const menuItems = [
    {
      id: 'workout',
      title: 'Зарядка',
      icon: '🏃',
      color: '#FF6B6B',
      route: 'Workout' as keyof NavigationParams,
      description: '10 минут упражнений',
    },
    {
      id: 'creativity',
      title: 'Творчество',
      icon: '🎨',
      color: '#4ECDC4',
      route: 'Creativity' as keyof NavigationParams,
      description: 'Рисуй и создавай',
    },
    {
      id: 'achievements',
      title: 'Достижения',
      icon: '🏆',
      color: '#FFE66D',
      route: 'Achievements' as keyof NavigationParams,
      description: 'Твои награды',
    },
    {
      id: 'svetlana',
      title: 'Светлана',
      icon: '🤖',
      color: '#95E1D3',
      route: 'Svetlana' as keyof NavigationParams,
      description: 'ИИ-помощник',
    },
  ];

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.title}>Я-Зарядка AI</Text>
        </View>

        {/* World Map Area */}
        <View style={styles.worldMap}>
          {/* House/Home icon in the center */}
          <View style={styles.homeContainer}>
            <View style={styles.homeIcon}>
              <Text style={styles.homeEmoji}>🏠</Text>
            </View>
            <Text style={styles.homeLabel}>Твой дом</Text>
          </View>

          {/* Menu Items as paths/locations */}
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: item.color }]}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.8}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.navButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ParentMode')}
          >
            <Text style={styles.navButtonText}>👨‍👩‍👧</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4FC3F7',
    marginTop: 5,
  },
  worldMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  homeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  homeEmoji: {
    fontSize: 40,
  },
  homeLabel: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  menuItem: {
    width: (width - 60) / 2 - 7.5,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
  },
});
