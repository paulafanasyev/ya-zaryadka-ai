import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Exercise, Achievement, CreativeWork, Activity, Message } from '../types';

const API_URL = process.env.API_URL || 'https://api.ya-zaryadka.ru/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(name: string, email: string, password: string) {
    const response = await api.post('/auth/register', { name, email, password });
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
  },

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  },
};

export const profileService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put('/profile', data);
    return response.data;
  },
};

export const exerciseService = {
  async getExercises(): Promise<Exercise[]> {
    const response = await api.get('/activities');
    return response.data;
  },

  async completeExercise(exerciseId: number): Promise<{ success: boolean; pointsAwarded: number }> {
    const response = await api.post('/activities/complete', {
      activityId: exerciseId,
      date: new Date().toISOString(),
    });
    return response.data;
  },
};

export const achievementService = {
  async getAchievements(): Promise<Achievement[]> {
    const response = await api.get('/achievements');
    return response.data;
  },
};

export const creativeService = {
  async getCreativeWorks(): Promise<CreativeWork[]> {
    const response = await api.get('/creative');
    return response.data;
  },

  async saveCreativeWork(imageData: string): Promise<{ workId: number; imageUrl: string }> {
    const response = await api.post('/creative', { imageData });
    return response.data;
  },
};

export const chatService = {
  async sendMessage(message: string, conversationId?: number): Promise<Message> {
    const response = await api.post('/ai/chat', { conversationId, message });
    return response.data;
  },

  async streamMessage(message: string, conversationId?: number) {
    // For streaming responses via SSE or WebSocket
    const response = await api.post('/ai/stream', { conversationId, message });
    return response.data;
  },
};

// Offline-first helper
export const offlineCache = {
  async cacheExercises(exercises: Exercise[]) {
    await AsyncStorage.setItem('cachedExercises', JSON.stringify(exercises));
  },

  async getCachedExercises(): Promise<Exercise[] | null> {
    const data = await AsyncStorage.getItem('cachedExercises');
    return data ? JSON.parse(data) : null;
  },

  async cacheAchievements(achievements: Achievement[]) {
    await AsyncStorage.setItem('cachedAchievements', JSON.stringify(achievements));
  },

  async getCachedAchievements(): Promise<Achievement[] | null> {
    const data = await AsyncStorage.getItem('cachedAchievements');
    return data ? JSON.parse(data) : null;
  },

  async saveLocalActivity(activity: Activity) {
    const activities = await this.getCachedActivities();
    activities.push(activity);
    await AsyncStorage.setItem('cachedActivities', JSON.stringify(activities));
  },

  async getCachedActivities(): Promise<Activity[]> {
    const data = await AsyncStorage.getItem('cachedActivities');
    return data ? JSON.parse(data) : [];
  },
};
