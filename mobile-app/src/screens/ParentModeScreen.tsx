import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams } from '../../types';

type ParentModeScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'ParentMode'>;
};

export default function ParentModeScreen({ navigation }: ParentModeScreenProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);

  const DEFAULT_PIN = '1234'; // In production, this should be configurable

  const handlePinSubmit = () => {
    if (pinInput === DEFAULT_PIN) {
      setIsAuthenticated(true);
      setPinInput('');
      setShowPinEntry(false);
    } else {
      Alert.alert('Неверный PIN', 'Попробуйте ещё раз');
      setPinInput('');
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    navigation.navigate('World');
  };

  if (!showPinEntry && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Родительский режим</Text>
          <Text style={styles.lockSubtitle}>Введите PIN-код для доступа</Text>
          
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() => setShowPinEntry(true)}
          >
            <Text style={styles.enterButtonText}>Ввести PIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('World')}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showPinEntry && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pinEntry}>
          <Text style={styles.pinTitle}>Введите PIN-код</Text>
          
          <TextInput
            style={styles.pinInput}
            value={pinInput}
            onChangeText={setPinInput}
            maxLength={4}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="****"
            autoFocus
          />
          
          <View style={styles.pinButtons}>
            <TouchableOpacity
              style={styles.pinButton}
              onPress={handlePinSubmit}
              disabled={pinInput.length !== 4}
            >
              <Text style={[styles.pinButtonText, pinInput.length !== 4 && styles.pinButtonDisabled]}>
                Войти
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.pinButton, styles.cancelButton]}
              onPress={() => {
                setShowPinEntry(false);
                setPinInput('');
              }}
            >
              <Text style={styles.pinButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated parent view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Родительский кабинет 👨‍👩‍👧</Text>
        <TouchableOpacity onPress={handleLock} style={styles.lockButton}>
          <Text style={styles.lockButtonText}>🔒 Выйти</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Child Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Профиль ребёнка</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>👦</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.childName}>Имя ребёнка</Text>
              <Text style={styles.childAge}>Возраст: 8 лет</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика активности</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Дней подряд</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>42</Text>
              <Text style={styles.statLabel}>Упражнений</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>350</Text>
              <Text style={styles.statLabel}>Монет</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Достижения</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Сменить PIN-код</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Уведомления о зарядке</Text>
            <Text style={styles.settingToggle}>✓</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Ограничение времени</Text>
            <Text style={styles.settingValue}>30 мин/день</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Экспорт данных</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Info */}
        <View style={styles.safetyBox}>
          <Text style={styles.safetyTitle}>🛡️ Безопасность</Text>
          <Text style={styles.safetyText}>
            Приложение не собирает персональные данные детей без согласия родителей. 
            Все данные хранятся локально на устройстве.
          </Text>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Удалить аккаунт?',
                'Это действие нельзя отменить. Все данные будут удалены.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Удалить', style: 'destructive' },
                ]
              );
            }}
          >
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  lockScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  lockIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  lockSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  enterButton: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  enterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  pinEntry: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  pinInput: {
    width: 200,
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 10,
    marginBottom: 30,
  },
  pinButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  pinButton: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: '#FFCDD2',
  },
  pinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pinButtonDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  lockButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFCDD2',
    borderRadius: 15,
  },
  lockButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  settingToggle: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  settingArrow: {
    fontSize: 24,
    color: '#999',
  },
  safetyBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#4FC3F7',
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#FFCDD2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});
