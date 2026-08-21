import React, { useEffect, useState, useRef } from 'react';
import { soundManager } from '../utils/audio';
import { triggerHaptic } from '../utils/notifications';

interface BreakScreenProps {
  breakSecondsRemaining: number;
  totalBreakDurationSeconds: number;
  onFinishBreak: () => void;
  onAddMinute: () => void;
  onBackToHome: () => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  strictLock?: boolean;
  antiTamper?: boolean;
  fullscreenBreak?: boolean;
  onShowToast?: (msg: string) => void;
}

const BREAK_ACTIVITIES = [
  {
    title: 'Look 20 feet away.',
    subtitle: 'Relax your ciliary eye muscles.',
    detail: 'Focus on a distant tree, building, or horizon to relieve optic tension.',
    icon: 'visibility',
  },
  {
    title: 'Roll your shoulders & stretch.',
    subtitle: 'Release cervical & trapezius strain.',
    detail: 'Do 5 slow backward shoulder rolls and gently tilt your head side to side.',
    icon: 'self_improvement',
  },
  {
    title: 'Hydrate & breathe deeply.',
    subtitle: 'Re-oxygenate your brain.',
    detail: 'Drink a glass of water, inhale for 4s, hold for 4s, and exhale for 6s.',
    icon: 'water_drop',
  },
  {
    title: 'Stand up and step away.',
    subtitle: 'Re-energize circulation & spine.',
    detail: 'Walk around the room, shake out wrists, and let your mind completely unplug.',
    icon: 'directions_walk',
  },
];

export const BreakScreen: React.FC<BreakScreenProps> = ({
  breakSecondsRemaining,
  totalBreakDurationSeconds,
  onFinishBreak,
  onAddMinute,
  onBackToHome,
  soundEnabled,
  hapticEnabled,
  strictLock = true,
  antiTamper = true,
  fullscreenBreak = true,
  onShowToast,
}) => {
  const [activityIndex, setActivityIndex] = useState(0);
  const [isHoldingUnlock, setIsHoldingUnlock] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0); // 0 to 100%
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const unlockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Request fullscreen on break mount if enabled
  useEffect(() => {
    if (fullscreenBreak && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fullscreen requires direct user gesture in some browsers, safely ignore
          });
        }
      } catch {
        // Ignore
      }
    }
  }, [fullscreenBreak]);

  // Anti-tamper & unload guard during active break
  useEffect(() => {
    if (!antiTamper) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'BreakBuddy is currently in a Mindful Rest block. Are you sure you want to exit?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [antiTamper]);

  // Rotate activity tips every 12s during break
  useEffect(() => {
    const timer = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % BREAK_ACTIVITIES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Handle 3-second long-press for Emergency Unlock in strict mode
  const startHoldUnlock = () => {
    setIsHoldingUnlock(true);
    setUnlockProgress(0);
    if (hapticEnabled) triggerHaptic(30);

    const startTime = Date.now();
    const DURATION = 3000; // 3 seconds hold

    unlockTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setUnlockProgress(progress);

      if (progress >= 100) {
        if (unlockTimerRef.current) clearInterval(unlockTimerRef.current);
        setIsHoldingUnlock(false);
        setUnlockProgress(0);
        if (hapticEnabled) triggerHaptic([50, 50, 100]);
        if (onShowToast) onShowToast('🔓 Emergency lock bypassed.');
        onFinishBreak();
      }
    }, 50);
  };

  const cancelHoldUnlock = () => {
    if (unlockTimerRef.current) {
      clearInterval(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    setIsHoldingUnlock(false);
    setUnlockProgress(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressRatio =
    totalBreakDurationSeconds > 0 ? breakSecondsRemaining / totalBreakDurationSeconds : 0;

  // SVG radius 46, circumference 2 * PI * 46 = 289
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const currentActivity = BREAK_ACTIVITIES[activityIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#f9f9ff] dark:bg-[#111c2c] text-[#111c2c] dark:text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Breathing Ambient Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[65vw] h-[65vw] max-w-[460px] max-h-[460px] rounded-full bg-[#7fb685]/20 dark:bg-[#7fb685]/12 blur-[60px] bg-breathe" />
        <div className="absolute w-[50vw] h-[50vw] max-w-[360px] max-h-[360px] rounded-full bg-[#add6fd]/25 dark:bg-[#386284]/15 blur-[50px] bg-breathe-delayed" />
      </div>

      {/* Top Bar with Strict Lock Status */}
      <header className="w-full flex items-center justify-between px-6 h-16 relative z-10">
        {strictLock ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#114721]/10 dark:bg-emerald-950/60 text-[#114721] dark:text-[#b7f1bb] border border-[#7fb685]/30 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">
              lock
            </span>
            <span>Rest Lockout Active</span>
          </div>
        ) : (
          <button
            onClick={() => {
              if (hapticEnabled) triggerHaptic(20);
              onBackToHome();
            }}
            aria-label="Go Back"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#414940] dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        )}

        <div className="flex items-center gap-1 text-[#35693f] dark:text-[#b7f1bb]">
          <span className="material-symbols-outlined text-[18px]">spa</span>
          <span className="font-['Quicksand'] font-bold text-xs sm:text-sm tracking-wider uppercase">
            Mindful Rest Mode
          </span>
        </div>

        {/* Emergency help or bypass trigger */}
        {strictLock ? (
          <button
            onClick={() => setShowOverrideModal(true)}
            className="text-[11px] font-semibold text-[#717970] dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1 rounded-md transition-colors"
          >
            Bypass
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-2">
        {/* Countdown Ring */}
        <div className="relative flex items-center justify-center w-[270px] h-[270px] sm:w-[310px] sm:h-[310px] mb-6">
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_10px_30px_rgba(127,182,133,0.2)]"
            viewBox="0 0 100 100"
          >
            {/* Track */}
            <circle
              className="stroke-[#d8e3fa]/50 dark:stroke-slate-700"
              cx="50"
              cy="50"
              fill="none"
              r="46"
              strokeWidth="5"
            />
            {/* Active Progress */}
            <circle
              className="stroke-[#7fb685] transition-all duration-500"
              cx="50"
              cy="50"
              fill="none"
              r="46"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="6"
            />
          </svg>

          {/* Countdown Numbers */}
          <div className="flex flex-col items-center z-10 text-center">
            <span className="font-['Quicksand'] font-bold text-6xl sm:text-7xl text-[#111c2c] dark:text-white tracking-tighter tabular-nums">
              {formatTime(breakSecondsRemaining)}
            </span>
            <span className="text-xs font-semibold text-[#35693f] dark:text-[#b7f1bb] mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {breakSecondsRemaining > 0 ? 'Digital Screen Shield' : 'Break Finished'}
            </span>
          </div>
        </div>

        {/* Instructional Message matching Break Activities */}
        <div className="text-center max-w-[340px] flex flex-col items-center gap-1.5 transition-all duration-300">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#7fb685]/20 text-[#35693f] dark:text-[#b7f1bb] mb-1 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">{currentActivity.icon}</span>
          </div>
          <h1 className="font-['Quicksand'] font-bold text-2xl text-[#111c2c] dark:text-white leading-tight">
            {currentActivity.title}
          </h1>
          <p className="font-['Inter'] text-base text-[#414940] dark:text-slate-300 font-medium">
            {currentActivity.subtitle}
          </p>
          <p className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-1 max-w-[300px] leading-relaxed">
            {currentActivity.detail}
          </p>
        </div>

        {/* Quick extension button */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => {
              if (hapticEnabled) triggerHaptic(20);
              onAddMinute();
            }}
            className="px-4 py-1.5 rounded-full bg-[#d8e3fa]/70 dark:bg-slate-800 text-xs font-semibold text-[#114721] dark:text-[#b7f1bb] hover:bg-[#7fb685]/30 transition-colors flex items-center gap-1 active:scale-95 shadow-sm border border-[#7fb685]/20"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>+1 min rest</span>
          </button>
        </div>
      </main>

      {/* Bottom Action Area */}
      <footer className="w-full px-6 pb-8 pt-4 bg-gradient-to-t from-[#f9f9ff] dark:from-[#111c2c] via-[#f9f9ff]/90 dark:via-[#111c2c]/90 to-transparent z-20 flex flex-col items-center gap-2">
        {strictLock ? (
          <div className="w-full max-w-[360px] flex flex-col items-center gap-2">
            {/* If break finished or in standard mode */}
            {breakSecondsRemaining <= 0 ? (
              <button
                onClick={() => {
                  if (hapticEnabled) triggerHaptic(40);
                  if (soundEnabled) soundManager.playBreakCompletedChime();
                  onFinishBreak();
                }}
                className="w-full h-14 bg-[#7fb685] hover:bg-[#6fa775] text-[#114721] rounded-full font-['Inter'] font-semibold text-base flex items-center justify-center gap-2.5 shadow-[0_10px_40px_-10px_rgba(127,182,133,0.6)] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined filled text-[24px]">check_circle</span>
                Resume Focus Work
              </button>
            ) : (
              <div className="w-full bg-[#ffffff] dark:bg-slate-800/90 rounded-2xl p-4 border border-[#d8e3fa]/60 dark:border-slate-700 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#114721] dark:text-[#b7f1bb]">
                  <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                  <span>Look away from your screen until the timer rings</span>
                </div>
                <p className="text-[11px] text-[#717970] dark:text-slate-400 mt-1">
                  Strict lock prevents premature dismissal to ensure real visual recovery.
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              if (hapticEnabled) triggerHaptic(40);
              if (soundEnabled) soundManager.playBreakCompletedChime();
              onFinishBreak();
            }}
            className="w-full max-w-[360px] h-14 bg-[#7fb685] hover:bg-[#6fa775] text-[#114721] rounded-full font-['Inter'] font-semibold text-base flex items-center justify-center gap-2.5 shadow-[0_10px_40px_-10px_rgba(127,182,133,0.6)] active:scale-[0.98] transition-all duration-200"
          >
            <span className="material-symbols-outlined filled text-[24px]">stop_circle</span>
            Finish Break
          </button>
        )}
      </footer>

      {/* Emergency Bypass Modal with 3-Second Hold Lock */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">lock_open</span>
            </div>

            <h3 className="font-['Quicksand'] font-bold text-xl text-[#111c2c] dark:text-white">
              Emergency Lock Bypass
            </h3>

            <p className="font-['Inter'] text-xs text-[#414940] dark:text-slate-300 mt-2 leading-relaxed">
              Strict Rest Lock is designed to prevent impulsive work habits. If you genuinely have an urgent interruption, hold the button below for 3 continuous seconds.
            </p>

            {/* Hold Button with Live Circular/Bar Progress */}
            <div className="mt-6 flex flex-col items-center">
              <button
                onMouseDown={startHoldUnlock}
                onMouseUp={cancelHoldUnlock}
                onMouseLeave={cancelHoldUnlock}
                onTouchStart={startHoldUnlock}
                onTouchEnd={cancelHoldUnlock}
                className="relative w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm flex items-center justify-center overflow-hidden shadow-md transition-transform select-none"
              >
                {/* Progress bar background fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-red-600/60 transition-all duration-75 pointer-events-none"
                  style={{ width: `${unlockProgress}%` }}
                />

                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    {isHoldingUnlock ? 'hourglass_top' : 'touch_app'}
                  </span>
                  <span>{isHoldingUnlock ? `Hold to unlock (${unlockProgress}%)` : 'Press & Hold (3s) to Bypass'}</span>
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                cancelHoldUnlock();
                setShowOverrideModal(false);
              }}
              className="mt-3 text-xs font-semibold text-[#717970] dark:text-slate-400 hover:text-[#111c2c] dark:hover:text-white py-2"
            >
              Cancel and continue resting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
