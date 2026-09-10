import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams, Achievement } from '../../types';
import { achievementService, offlineCache } from '../../services/api';

type AchievementsScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'Achievements'>;
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    name: 'Первая зарядка',
    description: 'Выполни свою первую зарядку',
    requirement: 1,
    achieved: false,
  },
  {
    id: 2,
    name: 'Три дня подряд',
    description: 'Делай зарядку 3 дня подряд',
    requirement: 3,
    achieved: false,
  },
  {
    id: 3,
    name: 'Неделя активности',
    description: '7 дней зарядки без перерыва',
    requirement: 7,
    achieved: false,
  },
  {
    id: 4,
    name: 'Мастер упражнений',
    description: 'Выполни 50 упражнений',
    requirement: 50,
    achieved: false,
  },
  {
    id: 5,
    name: 'Юный художник',
    description: 'Создай свой первый рисунок',
    requirement: 1,
    achieved: false,
  },
  {
    id: 6,
    name: 'Галерея работ',
    description: 'Сохрани 10 рисунков',
    requirement: 10,
    achieved: false,
  },
  {
    id: 7,
    name: 'Знакомство со Светланой',
    description: 'Поговори с ИИ-помощником',
    requirement: 1,
    achieved: false,
  },
  {
    id: 8,
    name: 'Финансовый гуру',
    description: 'Накопи 1000 монет',
    requirement: 1000,
    achieved: false,
  },
  {
    id: 9,
    name: 'Месяц здоровья',
    description: '30 дней активной зарядки',
    requirement: 30,
    achieved: false,
  },
  {
    id: 10,
    name: 'Чемпион',
    description: 'Получи все достижения',
    requirement: 9,
    achieved: false,
  },
];

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  useEffect(() => {
    const unlocked = achievements.filter(a => a.achieved).length;
    setUnlockedCount(unlocked);
  }, [achievements]);

  const loadAchievements = async () => {
    try {
      const cached = await offlineCache.getCachedAchievements();
      if (cached) {
        setAchievements(cached);
      }
      // Try to fetch from server (will fail offline, which is fine)
      const remote = await achievementService.getAchievements();
      setAchievements(remote);
      await offlineCache.cacheAchievements(remote);
    } catch (error) {
      console.log('Using default achievements');
    }
  };

  const getAchievementEmoji = (achievement: Achievement): string => {
    if (!achievement.achieved) return '❓';
    
    const emojiMap: Record<number, string> = {
      1: '🎉',
      2: '🔥',
      3: '⭐',
      4: '💪',
      5: '🎨',
      6: '🖼️',
      7: '🤖',
      8: '💰',
      9: '🏅',
      10: '👑',
    };
    
    return emojiMap[achievement.id] || '🏆';
  };

  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения 🏆</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{unlockedCount}/{achievements.length}</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{progressPercent}% завершено</Text>

      <ScrollView style={styles.achievementsList}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.achieved && styles.lockedCard,
            ]}
          >
            <View style={[
              styles.achievementIcon,
              achievement.achieved ? styles.unlockedIcon : styles.lockedIcon,
            ]}>
              <Text style={styles.iconEmoji}>{getAchievementEmoji(achievement)}</Text>
            </View>
            
            <View style={styles.achievementInfo}>
              <Text 
                style={[
                  styles.achievementName,
                  !achievement.achieved && styles.lockedText,
                ]}
              >
                {achievement.achieved ? achievement.name : '???'}
              </Text>
              <Text 
                style={[
                  styles.achievementDesc,
                  !achievement.achieved && styles.lockedText,
                ]}
              >
                {achievement.achieved ? achievement.description : 'Продолжай заниматься!'}
              </Text>
              {achievement.achieved && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                </Text>
              )}
            </View>

            {achievement.achieved && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.claimButton}
          onPress={() => navigation.navigate('World')}
        >
          <Text style={styles.claimButtonText}>Вернуться в мир</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#FFE0B2',
    marginHorizontal: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 5,
  },
  progressLabel: {
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  achievementsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  lockedCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  unlockedIcon: {
    backgroundColor: '#FFF3CD',
  },
  lockedIcon: {
    backgroundColor: '#E0E0E0',
  },
  iconEmoji: {
    fontSize: 30,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lockedText: {
    color: '#999',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#999',
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  claimButton: {
    backgroundColor: '#4FC3F7',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
