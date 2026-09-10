import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams } from '../../types';

type SettingsScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('ru');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Настройки ⚙️</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Внешний вид</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Тёмная тема</Text>
              <Text style={styles.settingDescription}>Использовать тёмный режим</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#CCC', true: '#4FC3F7' }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Напоминания о зарядке</Text>
              <Text style={styles.settingDescription}>Ежедневное напоминание утром</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CCC', true: '#4CAF50' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Звуковые эффекты</Text>
              <Text style={styles.settingDescription}>Воспроизводить звуки при действиях</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#CCC', true: '#FFC107' }}
              thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Язык / Language</Text>
          
          <TouchableOpacity
            style={[styles.languageOption, language === 'ru' && styles.selectedLanguage]}
            onPress={() => setLanguage('ru')}
          >
            <Text style={styles.languageFlag}>🇷🇺</Text>
            <Text style={styles.languageName}>Русский</Text>
            {language === 'ru' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
            onPress={() => setLanguage('en')}
          >
            <Text style={styles.languageFlag}>🇬🇧</Text>
            <Text style={styles.languageName}>English</Text>
            {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>Я-Зарядка AI</Text>
            <Text style={styles.version}>Версия 0.1.0</Text>
            <Text style={styles.description}>
              Интерактивное приложение для детей 6-14 лет с ИИ-помощником Светланой
            </Text>
          </View>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Политика конфиденциальности</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Условия использования</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Поддержка</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dataButton}>
            <Text style={styles.dataButtonText}>📥 Экспорт данных</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.dataButton, styles.clearButton]}>
            <Text style={[styles.dataButtonText, styles.clearButtonText]}>
              🗑️ Очистить кэш
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Сделано с ❤️ для здорового детства
          </Text>
          <Text style={styles.copyright}>
            © 2024 Я-Зарядка AI
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#333',
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedLanguage: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: -15,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  aboutCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  linkText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 24,
    color: '#CCC',
  },
  dataButton: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#FFCDD2',
  },
  dataButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#D32F2F',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    color: '#CCC',
  },
});
