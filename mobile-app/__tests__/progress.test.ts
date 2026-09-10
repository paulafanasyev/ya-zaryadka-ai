import { Achievement } from '../src/types';

// Mock achievement calculation logic
export const calculateAchievements = (
  workoutDays: number,
  exercisesCompleted: number,
  drawingsCreated: number,
  messagesSent: number,
  coins: number,
  existingAchievements: Achievement[]
): Achievement[] => {
  const newAchievements: Achievement[] = [];

  // First workout
  if (workoutDays >= 1 && !existingAchievements.find(a => a.id === 1)?.achieved) {
    newAchievements.push({
      id: 1,
      name: 'Первая зарядка',
      description: 'Выполни свою первую зарядку',
      requirement: 1,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Three days in a row
  if (workoutDays >= 3 && !existingAchievements.find(a => a.id === 2)?.achieved) {
    newAchievements.push({
      id: 2,
      name: 'Три дня подряд',
      description: 'Делай зарядку 3 дня подряд',
      requirement: 3,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Week of activity
  if (workoutDays >= 7 && !existingAchievements.find(a => a.id === 3)?.achieved) {
    newAchievements.push({
      id: 3,
      name: 'Неделя активности',
      description: '7 дней зарядки без перерыва',
      requirement: 7,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Exercise master
  if (exercisesCompleted >= 50 && !existingAchievements.find(a => a.id === 4)?.achieved) {
    newAchievements.push({
      id: 4,
      name: 'Мастер упражнений',
      description: 'Выполни 50 упражнений',
      requirement: 50,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Young artist
  if (drawingsCreated >= 1 && !existingAchievements.find(a => a.id === 5)?.achieved) {
    newAchievements.push({
      id: 5,
      name: 'Юный художник',
      description: 'Создай свой первый рисунок',
      requirement: 1,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Gallery
  if (drawingsCreated >= 10 && !existingAchievements.find(a => a.id === 6)?.achieved) {
    newAchievements.push({
      id: 6,
      name: 'Галерея работ',
      description: 'Сохрани 10 рисунков',
      requirement: 10,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Meet Svetlana
  if (messagesSent >= 1 && !existingAchievements.find(a => a.id === 7)?.achieved) {
    newAchievements.push({
      id: 7,
      name: 'Знакомство со Светланой',
      description: 'Поговори с ИИ-помощником',
      requirement: 1,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Financial guru
  if (coins >= 1000 && !existingAchievements.find(a => a.id === 8)?.achieved) {
    newAchievements.push({
      id: 8,
      name: 'Финансовый гуру',
      description: 'Накопи 1000 монет',
      requirement: 1000,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Month of health
  if (workoutDays >= 30 && !existingAchievements.find(a => a.id === 9)?.achieved) {
    newAchievements.push({
      id: 9,
      name: 'Месяц здоровья',
      description: '30 дней активной зарядки',
      requirement: 30,
      achieved: true,
      unlockedAt: new Date().toISOString(),
    });
  }

  return newAchievements;
};

// Calculate points for completed workout
export const calculateWorkoutPoints = (exercisesCompleted: number): number => {
  return exercisesCompleted * 10;
};

// Check if user is on a streak
export const checkStreak = (lastWorkoutDate: Date | null, today: Date = new Date()): boolean => {
  if (!lastWorkoutDate) return false;
  
  const diffTime = Math.abs(today.getTime() - lastWorkoutDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 1;
};
