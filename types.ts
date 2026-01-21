
export type Intensity = 'low' | 'medium' | 'high';
export type Theme = 'peach' | 'lavender' | 'mint' | 'sky';

export interface Subject {
  id: string;
  name: string;
  strengthRating: number; // 1-10 (1 = very weak/hard, 10 = very strong/easy)
  syllabusSize: number; // e.g., number of chapters
  completedTopics: number;
  currentTopic: string;
}

export interface ScheduleItem {
  time: string;
  task: string;
  category: 'study' | 'break' | 'life' | 'frog' | 'meal' | 'exercise';
  quote: string;
  icon: string;
  durationMinutes: number;
  pomodoroCycle?: number; // 1-4 for tracking cycles
}

export interface UserProfile {
  name: string;
  wakeUpTime: string;
  sleepTime: string;
  subjects: Subject[];
  intensity: Intensity;
  theme: Theme;
  onboardingComplete: boolean;
}

export interface GenerationResponse {
  schedule: ScheduleItem[];
  dailyGoals: string[];
  recommendation: string;
  assessment: {
    strongSubjects: string[];
    weakSubjects: string[];
    strategy: string;
    totalStudyHours: number;
  };
}

export enum TimerMode {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export type Mood = 'productive' | 'tired' | 'happy' | 'stressed' | 'chill';
