import { UserSettings, SessionRecord, DayStat } from '../types';

const SETTINGS_KEY = 'breakbuddy_settings_v1';
const SESSIONS_KEY = 'breakbuddy_sessions_v1';
const STREAK_KEY = 'breakbuddy_streak_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  defaultInterval: 30, // in minutes
  breakDuration: 5, // in minutes
  pushNotifications: true,
  soundReminders: true,
  hapticFeedback: true,
  darkMode: false,
  autoStartBreaks: false,
  ambientSound: 'off',
  dailyFocusGoalMinutes: 300, // 5 hours
  strictBreakLock: true, // Screen lock during break active by default
  fullscreenBreak: true, // Immersive fullscreen lock
  antiTamperGuard: true, // Unload guard & screen pin protection
};

export const INITIAL_SESSIONS: SessionRecord[] = [
  {
    id: 's-1',
    type: 'focus',
    title: 'Deep Work Block',
    category: 'Deep Work',
    durationMinutes: 90,
    completed: true,
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    formattedTime: '10:30 AM',
  },
  {
    id: 's-2',
    type: 'break',
    title: 'Stretch Break',
    category: 'Stretch Break',
    durationMinutes: 15,
    completed: true,
    timestamp: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    formattedTime: '12:00 PM',
  },
  {
    id: 's-3',
    type: 'focus',
    title: 'Writing Session',
    category: 'Writing',
    durationMinutes: 60,
    completed: true,
    timestamp: new Date(Date.now() - 3.2 * 3600 * 1000).toISOString(),
    formattedTime: '1:15 PM',
  },
  {
    id: 's-4',
    type: 'focus',
    title: 'Code Review & Logic',
    category: 'Coding',
    durationMinutes: 45,
    completed: true,
    timestamp: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
    formattedTime: '2:30 PM',
  },
  {
    id: 's-5',
    type: 'break',
    title: 'Eye Rest & Hydration',
    category: 'Eye Rest',
    durationMinutes: 5,
    completed: true,
    timestamp: new Date(Date.now() - 1.0 * 3600 * 1000).toISOString(),
    formattedTime: '3:20 PM',
  },
  {
    id: 's-6',
    type: 'focus',
    title: 'Planning & Documentation',
    category: 'General',
    durationMinutes: 55,
    completed: true,
    timestamp: new Date(Date.now() - 0.4 * 3600 * 1000).toISOString(),
    formattedTime: '4:10 PM',
  },
];

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore error
  }
}

export function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }
  return INITIAL_SESSIONS;
}

export function saveSessions(sessions: SessionRecord[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore error
  }
}

export function loadStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {
    // Ignore
  }
  return 5; // Default 5 day streak
}

export function saveStreak(streak: number) {
  try {
    localStorage.setItem(STREAK_KEY, streak.toString());
  } catch {
    // Ignore
  }
}

export function getWeeklyBreakStats(sessions: SessionRecord[]): DayStat[] {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Today's day of week (0 is Sun, 1 is Mon, etc.)
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  // Base mock proportions for weekly visual chart matching screenshot
  const defaultFocus = [140, 210, 280, 260, 45, 30, 40];
  const defaultBreaks = [4, 6, 8, 8, 1, 1, 1];

  // Calculate actual today's focus from recorded sessions
  const todaySessions = sessions.filter((s) => {
    const sessionDate = new Date(s.timestamp);
    return sessionDate.toDateString() === now.toDateString();
  });

  const todayFocus = todaySessions
    .filter((s) => s.type === 'focus' && s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const todayBreaks = todaySessions
    .filter((s) => s.type === 'break' && s.completed)
    .length;

  return days.map((day, idx) => {
    const isToday = idx === currentDayIndex;
    const focusMins = isToday && todayFocus > 0 ? todayFocus : defaultFocus[idx];
    const breaks = isToday && todayBreaks > 0 ? todayBreaks : defaultBreaks[idx];
    const heightPercent = Math.min(100, Math.max(15, Math.round((breaks / 10) * 100)));

    return {
      day,
      dayFull: fullNames[idx],
      dateKey: `day-${idx}`,
      focusMinutes: focusMins,
      breaksCount: breaks,
      isToday,
      targetPercent: heightPercent,
    };
  });
}
