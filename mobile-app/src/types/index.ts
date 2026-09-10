// Types for Ya-Zaryadka AI application

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  avatar?: string;
}

export interface ChildProfile {
  id: number;
  userId: number;
  age: number;
  avatar?: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  imageUrl?: string;
  duration?: number; // in seconds
  repetitions?: number;
  category?: ExerciseCategory;
  instructions?: string[];
  tips?: string;
  musclesWorked?: string[];
  emoji?: string;
}

export type ExerciseCategory = 
  | 'warmup'
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'balance'
  | 'cooldown'
  | 'yoga'
  | 'animal';

export type DifficultyLevel = 1 | 2 | 3;

export interface Activity {
  id: number;
  userId: number;
  exerciseId: number;
  completedAt: string;
  pointsAwarded?: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  achieved: boolean;
  unlockedAt?: string;
  imageUrl?: string;
}

export interface CreativeWork {
  id: number;
  userId: number;
  imageUrl: string;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  fromUser: boolean;
  content: string;
  sentAt: string;
}

export interface Conversation {
  id: number;
  userId: number;
  startedAt: string;
  messages?: Message[];
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  achievements: Achievement[];
  activities: Activity[];
  creativeWorks: CreativeWork[];
  theme: 'light' | 'dark';
  isOnline: boolean;
}

export interface NavigationParams {
  World: undefined;
  Workout: { exerciseId?: number };
  Creativity: undefined;
  Achievements: undefined;
  Svetlana: undefined;
  ParentMode: undefined;
  Settings: undefined;
}

export interface CVPoseData {
  keypoints: Array<{
    x: number;
    y: number;
    confidence: number;
  }>;
  angles?: {
    leftKnee?: number;
    rightKnee?: number;
    leftElbow?: number;
    rightElbow?: number;
  };
}
