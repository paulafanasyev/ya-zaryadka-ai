import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams, Exercise } from '../../types';
import { exerciseService, offlineCache } from '../../services/api';
import { 
  ALL_EXERCISES, 
  WORKOUT_ROUTES, 
  WorkoutRoute,
  getExerciseById 
} from '../../data/exerciseLibrary';

type WorkoutScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'Workout'>;
};

// Available workout routes
const WORKOUT_ROUTES_LIST: Array<{ key: keyof typeof WORKOUT_ROUTES; name: string; description: string; emoji: string }> = [
  { key: 'beginner', name: 'Новичок', description: 'Простые упражнения для старта', emoji: '🌟' },
  { key: 'standard', name: 'Стандарт', description: 'Классическая 10-минутная зарядка', emoji: '⭐⭐' },
  { key: 'animalFun', name: 'Зоопарк', description: 'Весёлая зарядка с животными', emoji: '🦁' },
  { key: 'kidsYoga', name: 'Мини-йог', description: 'Простые позы йоги', emoji: '🧘' },
  { key: 'energyBoost', name: 'Энергия', description: 'Для тех, кто хочет проснуться', emoji: '⚡' },
  { key: 'strengthBalance', name: 'Силач', description: 'Упражнения для силы и равновесия', emoji: '💪' },
];

export default function WorkoutScreen({ navigation }: WorkoutScreenProps) {
  const [selectedRoute, setSelectedRoute] = useState<WorkoutRoute | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [completedCount, setCompletedCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [workoutMode, setWorkoutMode] = useState<'select' | 'list' | 'active'>('select');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isWorkoutActive) {
      completeExercise();
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, timeLeft]);

  const loadExercises = async () => {
    try {
      const cached = await offlineCache.getCachedExercises();
      if (cached) {
        setExercises(cached);
      }
      // Try to fetch from server (will fail offline, which is fine)
      const remote = await exerciseService.getExercises();
      setExercises(remote);
      await offlineCache.cacheExercises(remote);
    } catch (error) {
      console.log('Using default exercises');
    }
  };

  const selectWorkoutRoute = (routeKey: keyof typeof WORKOUT_ROUTES) => {
    const route = WORKOUT_ROUTES[routeKey];
    setSelectedRoute(route);
    setExercises(route.exercises as Exercise[]);
    setWorkoutMode('list');
  };

  const startWorkout = () => {
    if (exercises.length === 0) return;
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setTimeLeft(exercises[0]?.duration || 30);
    setCompletedCount(0);
    setWorkoutMode('active');
  };

  const completeExercise = () => {
    const nextIndex = currentExerciseIndex + 1;
    
    if (nextIndex < exercises.length) {
      setCurrentExerciseIndex(nextIndex);
      setTimeLeft(exercises[nextIndex]?.duration || 30);
      setCompletedCount((prev) => prev + 1);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    const earnedPoints = completedCount * 10;
    setPoints((prev) => prev + earnedPoints);
    
    Alert.alert(
      'Молодец! 🎉',
      `Ты завершил зарядку "${selectedRoute?.name}"!\nВыполнено упражнений: ${completedCount}\nЗаработано монеток: ${earnedPoints}`,
      [{ text: 'Отлично!', onPress: () => { setWorkoutMode('select'); setSelectedRoute(null); } }]
    );
  };

  const skipExercise = () => {
    completeExercise();
  };

  const goBackToSelection = () => {
    setWorkoutMode('select');
    setSelectedRoute(null);
    setExercises([]);
  };

  const currentExercise = exercises[currentExerciseIndex];

  // Mode 1: Select workout route
  if (workoutMode === 'select') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Утренняя зарядка</Text>
            <Text style={styles.subtitle}>Выбери программу тренировки!</Text>
          </View>

          <View style={styles.routesList}>
            {WORKOUT_ROUTES_LIST.map((route) => (
              <TouchableOpacity 
                key={route.key} 
                style={styles.routeCard}
                onPress={() => selectWorkoutRoute(route.key)}
              >
                <View style={styles.routeEmoji}>
                  <Text style={styles.routeEmojiText}>{route.emoji}</Text>
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeDescription}>{route.description}</Text>
                  <Text style={styles.routeDuration}>
                    ⏱️ {WORKOUT_ROUTES[route.key].duration} мин
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Совет:</Text>
            <Text style={styles.infoText}>
              Начни с "Новичка", если делаешь зарядку впервые!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Mode 2: Show exercise list before starting
  if (workoutMode === 'list') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{selectedRoute?.name} {selectedRoute ? WORKOUT_ROUTES_LIST.find(r => r.key === Object.keys(WORKOUT_ROUTES).find(k => WORKOUT_ROUTES[k] === selectedRoute)?.substring(0, 3) : ''}</Text>
            <Text style={styles.subtitle}>{selectedRoute?.description}</Text>
          </View>

          <View style={styles.exerciseList}>
            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.emoji} {exercise.name}</Text>
                  <Text style={styles.exerciseDesc}>{exercise.description}</Text>
                  <Text style={styles.exerciseMeta}>
                    ⏱️ {exercise.duration}с | 🔄 {exercise.repetitions}x
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.backButton} onPress={goBackToSelection}>
              <Text style={styles.backButtonText}>← Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
              <Text style={styles.startButtonText}>Начать зарядку! 🚀</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Mode 3: Active workout
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activeWorkout}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Упражнение {currentExerciseIndex + 1} из {exercises.length}
          </Text>
          <Text style={styles.pointsText}>💰 {points}</Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
        </View>

        <View style={styles.currentExercise}>
          <Text style={styles.currentExerciseName}>{currentExercise?.emoji} {currentExercise?.name}</Text>
          <Text style={styles.currentExerciseDesc}>{currentExercise?.description}</Text>
          
          {currentExercise?.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Совет:</Text>
              <Text style={styles.tipsText}>{currentExercise.tips}</Text>
            </View>
          )}
          
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationEmoji}>{currentExercise?.emoji || '🏃'}</Text>
            <Text style={styles.illustrationHint}>Делай как на картинке!</Text>
          </View>

          {currentExercise?.instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>Как делать:</Text>
              {currentExercise.instructions.map((instruction, idx) => (
                <Text key={idx} style={styles.instructionItem}>• {instruction}</Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
            <Text style={styles.skipButtonText}>Пропустить</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={completeExercise}
          >
            <Text style={styles.completeButtonText}>Готово! ✓</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Если больно - остановись! Здоровье важнее!
          </Text>
        </View>

        <TouchableOpacity style={styles.finishEarlyButton} onPress={finishWorkout}>
          <Text style={styles.finishEarlyText}>Завершить тренировку</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  exerciseList: {
    marginBottom: 20,
  },
  exerciseCard: {
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
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activeWorkout: {
    flex: 1,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  currentExercise: {
    flex: 1,
    alignItems: 'center',
  },
  currentExerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  currentExerciseDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  illustrationHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#FFCDD2',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  routesList: {
    marginBottom: 20,
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  routeEmoji: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  routeEmojiText: {
    fontSize: 32,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  routeDuration: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#1B5E20',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#FFCDD2',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsBox: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 5,
  },
  tipsText: {
    fontSize: 13,
    color: '#333',
  },
  instructionsBox: {
    backgroundColor: '#E8EAF6',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  finishEarlyButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
  },
  finishEarlyText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
});
