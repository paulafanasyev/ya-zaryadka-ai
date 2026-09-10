import { calculateAchievements, calculateWorkoutPoints, checkStreak } from '../src/utils/progress';

describe('Progress Calculations', () => {
  describe('calculateWorkoutPoints', () => {
    it('should calculate points correctly for completed exercises', () => {
      expect(calculateWorkoutPoints(1)).toBe(10);
      expect(calculateWorkoutPoints(5)).toBe(50);
      expect(calculateWorkoutPoints(10)).toBe(100);
      expect(calculateWorkoutPoints(0)).toBe(0);
    });
  });

  describe('checkStreak', () => {
    it('should return false if no previous workout', () => {
      expect(checkStreak(null)).toBe(false);
    });

    it('should return true for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(checkStreak(yesterday)).toBe(true);
    });

    it('should return true for same day', () => {
      const today = new Date();
      expect(checkStreak(today)).toBe(true);
    });

    it('should return false for gap of more than 1 day', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(checkStreak(twoDaysAgo)).toBe(false);
    });
  });

  describe('calculateAchievements', () => {
    it('should unlock first workout achievement after 1 day', () => {
      const achievements = calculateAchievements(1, 0, 0, 0, 0, []);
      expect(achievements.find(a => a.id === 1)).toBeDefined();
      expect(achievements.find(a => a.id === 1)?.achieved).toBe(true);
    });

    it('should unlock three days achievement after 3 days', () => {
      const achievements = calculateAchievements(3, 0, 0, 0, 0, []);
      expect(achievements.find(a => a.id === 2)).toBeDefined();
      expect(achievements.find(a => a.id === 2)?.achieved).toBe(true);
    });

    it('should not unlock achievements already achieved', () => {
      const existingAchievements = [
        {
          id: 1,
          name: 'Первая зарядка',
          description: '',
          requirement: 1,
          achieved: true,
          unlockedAt: new Date().toISOString(),
        },
      ];
      const achievements = calculateAchievements(1, 0, 0, 0, 0, existingAchievements);
      expect(achievements.length).toBe(0);
    });

    it('should unlock multiple achievements at once', () => {
      const achievements = calculateAchievements(7, 50, 10, 1, 1000, []);
      expect(achievements.length).toBeGreaterThan(1);
    });

    it('should unlock young artist achievement after first drawing', () => {
      const achievements = calculateAchievements(0, 0, 1, 0, 0, []);
      expect(achievements.find(a => a.id === 5)).toBeDefined();
    });

    it('should unlock Svetlana achievement after first message', () => {
      const achievements = calculateAchievements(0, 0, 0, 1, 0, []);
      expect(achievements.find(a => a.id === 7)).toBeDefined();
    });
  });
});
