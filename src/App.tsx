import { useState, useEffect, useRef, useCallback } from 'react';
import { TabType, SessionState, UserSettings, SessionRecord } from './types';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadSessions,
  saveSessions,
  loadStreak,
  saveStreak,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { sendBreakNotification, triggerHaptic } from './utils/notifications';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { BreakScreen } from './components/BreakScreen';
import { BreakPromptModal } from './components/BreakPromptModal';
import { StatsTab } from './components/StatsTab';
import { TipsTab } from './components/TipsTab';
import { SettingsTab } from './components/SettingsTab';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(1455); // 24:15 default to match screenshot initial state
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [sessionCategory, setSessionCategory] = useState('Deep Work');

  // Break Countdown States
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(300); // 5 min default
  const [totalBreakDurationSeconds, setTotalBreakDurationSeconds] = useState(300);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Settings & Analytics
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadSessions());
  const [streakDays, setStreakDays] = useState<number>(() => loadStreak());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Persist sessions & streak
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveStreak(streakDays);
  }, [streakDays]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Listen for background & in-app notification events
  useEffect(() => {
    const handleNotificationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string }>;
      if (customEvent.detail) {
        showToast(`🔔 ${customEvent.detail.title} - ${customEvent.detail.body}`);
      }
    };

    window.addEventListener('breakbuddy_notification', handleNotificationEvent);
    return () => {
      window.removeEventListener('breakbuddy_notification', handleNotificationEvent);
    };
  }, [showToast]);

  // Timer Ref for precision interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startBreakMode = useCallback((durationMins: number) => {
    setShowPromptModal(false);
    const secs = durationMins * 60;
    setTotalBreakDurationSeconds(secs);
    setBreakSecondsRemaining(secs);
    setSessionState('breaking');
  }, []);

  // Main Session Focus Timer Effect
  useEffect(() => {
    if (sessionState === 'focusing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          const targetSeconds = intervalMinutes * 60;
          
          // Check if interval boundary is reached
          if (targetSeconds > 0 && next % targetSeconds === 0) {
            // Sound and haptic notification
            if (settings.soundReminders) {
              soundManager.playBreakPromptChime();
            }
            if (settings.pushNotifications) {
              sendBreakNotification(
                'Time for a Mindful Break!',
                `You have been focusing for ${intervalMinutes} minutes. Step back and rest your eyes.`
              );
            }
            if (settings.hapticFeedback) {
              triggerHaptic(100);
            }

            if (settings.autoStartBreaks) {
              startBreakMode(settings.breakDuration);
            } else {
              setShowPromptModal(true);
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState, intervalMinutes, settings, startBreakMode]);

  // Break Countdown Timer Effect
  const handleFinishBreak = useCallback(() => {
    // Log completed break
    const d = new Date();
    const breakMinutes = Math.max(1, Math.round((totalBreakDurationSeconds - breakSecondsRemaining) / 60));
    const newBreakRecord: SessionRecord = {
      id: `break-${Date.now()}`,
      type: 'break',
      title: 'Mindful Stretch Break',
      category: 'Stretch Break',
      durationMinutes: breakMinutes > 0 ? breakMinutes : settings.breakDuration,
      completed: true,
      timestamp: d.toISOString(),
      formattedTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) => [newBreakRecord, ...prev]);
    setSessionState('idle');
    showToast('✨ Great job taking a break! Eyes and mind refreshed.');
  }, [breakSecondsRemaining, settings.breakDuration, showToast, totalBreakDurationSeconds]);

  useEffect(() => {
    let breakTimer: NodeJS.Timeout | null = null;
    if (sessionState === 'breaking') {
      breakTimer = setInterval(() => {
        setBreakSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (settings.soundReminders) {
              soundManager.playBreakCompletedChime();
            }
            if (settings.hapticFeedback) {
              triggerHaptic(80);
            }
            handleFinishBreak();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breakTimer) clearInterval(breakTimer);
    };
  }, [sessionState, settings, handleFinishBreak]);

  // Actions
  const handleStartSession = () => {
    setSessionState('focusing');
    showToast('Focus session started. Stay mindful!');
  };

  const handlePauseSession = () => {
    setSessionState('focus_paused');
    showToast('Session paused');
  };

  const handleResumeSession = () => {
    setSessionState('focusing');
    showToast('Session resumed');
  };

  const handleResetSession = () => {
    if (elapsedSeconds > 60) {
      const d = new Date();
      const mins = Math.round(elapsedSeconds / 60);
      const newFocusRecord: SessionRecord = {
        id: `focus-${Date.now()}`,
        type: 'focus',
        title: `${sessionCategory} Session`,
        category: sessionCategory as SessionRecord['category'],
        durationMinutes: mins,
        completed: true,
        timestamp: d.toISOString(),
        formattedTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) => [newFocusRecord, ...prev]);
    }
    setSessionState('idle');
    setElapsedSeconds(0);
    showToast('Session reset and saved to daily stats');
  };

  const handleTriggerBreakManually = () => {
    startBreakMode(settings.breakDuration);
  };

  const handleAddMinuteToBreak = () => {
    setBreakSecondsRemaining((prev) => prev + 60);
    setTotalBreakDurationSeconds((prev) => prev + 60);
    showToast('+1 minute added to break');
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.defaultInterval !== undefined) {
        setIntervalMinutes(newSettings.defaultInterval);
      }
      return updated;
    });
  };

  const handleResetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setIntervalMinutes(DEFAULT_SETTINGS.defaultInterval);
    showToast('Settings reset to defaults');
  };

  const handleAddManualSession = (record: SessionRecord) => {
    setSessions((prev) => [record, ...prev]);
    showToast('Activity logged successfully');
  };

  const handleClearSessions = () => {
    setSessions([]);
    showToast('Session history cleared');
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] dark:bg-[#111c2c] text-[#111c2c] dark:text-slate-100 transition-colors flex flex-col relative selection:bg-[#7fb685] selection:text-[#114721]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#111c2c] dark:bg-white text-white dark:text-[#111c2c] text-xs font-semibold shadow-xl border border-white/20 animate-fadeIn pointer-events-none flex items-center gap-2 max-w-[90vw] truncate">
          <span className="material-symbols-outlined text-[16px] text-[#7fb685]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Break Screen (Full-Screen Overlay matching Image 3.png) */}
      {sessionState === 'breaking' ? (
        <BreakScreen
          breakSecondsRemaining={breakSecondsRemaining}
          totalBreakDurationSeconds={totalBreakDurationSeconds}
          onFinishBreak={handleFinishBreak}
          onAddMinute={handleAddMinuteToBreak}
          onBackToHome={() => setSessionState('focus_paused')}
          soundEnabled={settings.soundReminders}
          hapticEnabled={settings.hapticFeedback}
          strictLock={settings.strictBreakLock}
          antiTamper={settings.antiTamperGuard}
          fullscreenBreak={settings.fullscreenBreak}
          onShowToast={showToast}
        />
      ) : (
        <>
          {/* Main Top Header */}
          <Header
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            isTimerRunning={sessionState === 'focusing'}
          />

          {/* Active Tab View */}
          <div className="flex-1 w-full">
            {currentTab === 'home' && (
              <HomeTab
                sessionState={sessionState}
                elapsedSeconds={elapsedSeconds}
                intervalMinutes={intervalMinutes}
                onIntervalChange={setIntervalMinutes}
                onStartSession={handleStartSession}
                onPauseSession={handlePauseSession}
                onResumeSession={handleResumeSession}
                onResetSession={handleResetSession}
                onTriggerBreakManually={handleTriggerBreakManually}
                sessionCategory={sessionCategory}
                onCategoryChange={setSessionCategory}
                soundEnabled={settings.soundReminders}
                hapticEnabled={settings.hapticFeedback}
              />
            )}

            {currentTab === 'stats' && (
              <StatsTab
                sessions={sessions}
                streakDays={streakDays}
                dailyGoalMinutes={settings.dailyFocusGoalMinutes}
                onClearSessions={handleClearSessions}
                onAddManualSession={handleAddManualSession}
                onNavigateToHome={() => setCurrentTab('home')}
                hapticEnabled={settings.hapticFeedback}
              />
            )}

            {currentTab === 'tips' && (
              <TipsTab
                soundEnabled={settings.soundReminders}
                hapticEnabled={settings.hapticFeedback}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetToDefaults={handleResetToDefaults}
                onShowToast={showToast}
              />
            )}
          </div>

          {/* Break Prompt Modal (Interval Reached) */}
          {showPromptModal && (
            <BreakPromptModal
              intervalMinutes={intervalMinutes}
              breakDurationMinutes={settings.breakDuration}
              onStartBreak={() => startBreakMode(settings.breakDuration)}
              onSnooze={(mins) => {
                setShowPromptModal(false);
                showToast(`Snoozed for ${mins} minutes`);
              }}
              onDismiss={() => {
                setShowPromptModal(false);
                showToast('Break skipped for now');
              }}
              hapticEnabled={settings.hapticFeedback}
            />
          )}

          {/* Floating Bottom Nav Bar */}
          <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </>
      )}
    </div>
  );
}
