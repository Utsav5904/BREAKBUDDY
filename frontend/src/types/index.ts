export type TabType = 'home' | 'stats' | 'tips' | 'settings';

export type SessionState = 'idle' | 'focusing' | 'focus_paused' | 'break_prompt' | 'breaking' | 'break_paused';

export interface UserSettings {
  defaultInterval: number; // in minutes (e.g., 30)
  breakDuration: number; // in minutes (e.g., 5)
  pushNotifications: boolean;
  soundReminders: boolean;
  hapticFeedback: boolean;
  darkMode: boolean;
  autoStartBreaks: boolean;
  ambientSound: 'off' | 'rain' | 'forest' | 'chimes';
  dailyFocusGoalMinutes: number;
  strictBreakLock: boolean; // Locks screen and restricts early exit during break
  fullscreenBreak: boolean; // Enters fullscreen automatically on break start
  antiTamperGuard: boolean; // Warns & blocks browser exit/tab close during breaks
}

export interface SessionRecord {
  id: string;
  type: 'focus' | 'break';
  title: string;
  category: 'Deep Work' | 'Writing' | 'Coding' | 'Study' | 'General' | 'Stretch Break' | 'Eye Rest';
  durationMinutes: number;
  completed: boolean;
  timestamp: string; // ISO string
  formattedTime: string;
}

export interface DayStat {
  day: string; // 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S'
  dayFull: string;
  dateKey: string;
  focusMinutes: number;
  breaksCount: number;
  isToday: boolean;
  targetPercent: number;
}

export interface TipExercise {
  id: string;
  title: string;
  category: 'eyes' | 'stretch' | 'breathing' | 'posture';
  durationSeconds: number;
  description: string;
  instructionSteps: string[];
  benefit: string;
  iconName: string;
}
