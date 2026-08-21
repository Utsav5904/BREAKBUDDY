import React, { useState } from 'react';
import { SessionState } from '../types';
import { soundManager } from '../utils/audio';
import { triggerHaptic } from '../utils/notifications';

interface HomeTabProps {
  sessionState: SessionState;
  elapsedSeconds: number;
  intervalMinutes: number;
  onIntervalChange: (minutes: number) => void;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onResetSession: () => void;
  onTriggerBreakManually: () => void;
  sessionCategory: string;
  onCategoryChange: (cat: string) => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  sessionState,
  elapsedSeconds,
  intervalMinutes,
  onIntervalChange,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onResetSession,
  onTriggerBreakManually,
  sessionCategory,
  onCategoryChange,
  soundEnabled,
  hapticEnabled,
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const totalIntervalSeconds = intervalMinutes * 60;
  
  // Calculate seconds until next break
  const secondsRemainingInInterval = Math.max(0, totalIntervalSeconds - (elapsedSeconds % totalIntervalSeconds));
  
  // Progress calculation for SVG ring
  const progressRatio = totalIntervalSeconds > 0 
    ? ((elapsedSeconds % totalIntervalSeconds) / totalIntervalSeconds)
    : 0;

  // Format Elapsed Time MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 116; // r=116 -> ~728.8
  const strokeDashoffset = circumference - progressRatio * circumference;

  const intervalPresets = [20, 30, 45, 60];
  const categories = ['Deep Work', 'Writing', 'Coding', 'Study', 'General'];

  const handleActionClick = () => {
    if (hapticEnabled) triggerHaptic(40);
    if (soundEnabled) soundManager.playStartTone();

    if (sessionState === 'idle') {
      onStartSession();
    } else if (sessionState === 'focusing') {
      onPauseSession();
    } else if (sessionState === 'focus_paused') {
      onResumeSession();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative min-h-[calc(100vh-140px)] pb-32">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#b7f1bb]/40 dark:bg-[#35693f]/20 blur-[100px] bg-breathe" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-[#cce5ff]/40 dark:bg-[#386284]/20 blur-[100px] bg-breathe-delayed" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center px-6 pt-6">
        
        {/* Category Pill Tag */}
        <div className="mb-4 relative">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f3ff] dark:bg-slate-800 text-[#35693f] dark:text-[#b7f1bb] text-xs font-semibold hover:bg-[#e7eeff] transition-all shadow-sm border border-[#d8e3fa]/60 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-[16px]">label</span>
            <span>{sessionCategory}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
          </button>

          {showCategoryMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-[#d8e3fa] dark:border-slate-700 py-1.5 z-30">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryChange(cat);
                    setShowCategoryMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                    sessionCategory === cat
                      ? 'bg-[#7fb685]/20 text-[#114721] dark:text-[#b7f1bb] font-bold'
                      : 'text-[#414940] dark:text-slate-300 hover:bg-[#f0f3ff] dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section Header */}
        <h2 className="font-['Inter'] text-xs font-bold text-[#414940] dark:text-slate-400 uppercase tracking-widest mb-6">
          CURRENT SESSION
        </h2>

        {/* Circular Progress Ring matching design mockup */}
        <section className="flex flex-col items-center justify-center w-full mb-8 relative">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Ring */}
            <svg
              className="absolute inset-0 w-full h-full drop-shadow-[0_8px_24px_rgba(127,182,133,0.18)]"
              viewBox="0 0 256 256"
              width="100%"
              height="100%"
            >
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7fb685" />
                  <stop offset="100%" stopColor="#add6fd" />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                className="text-[#d8e3fa]/60 dark:text-slate-700"
                cx="128"
                cy="128"
                fill="none"
                r="116"
                stroke="currentColor"
                strokeWidth="12"
              />
              {/* Animated Progress Indicator */}
              <circle
                className="progress-ring-circle"
                cx="128"
                cy="128"
                fill="none"
                r="116"
                stroke="url(#progressGradient)"
                strokeDasharray="728.8"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="12"
              />
            </svg>

            {/* Center Timer Display */}
            <div className="flex flex-col items-center justify-center z-10 text-center select-none">
              <div className="font-['Quicksand'] font-bold text-5xl sm:text-6xl text-[#111c2c] dark:text-white tabular-nums tracking-tight mb-1">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="font-['Inter'] text-sm text-[#414940] dark:text-slate-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#35693f] dark:text-[#b7f1bb]">
                  schedule
                </span>
                <span>
                  Next Break in:{' '}
                  <strong className="font-semibold text-[#35693f] dark:text-[#b7f1bb]">
                    {formatTime(secondsRemainingInInterval)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Interval Selector */}
        <section className="w-full flex flex-col items-center mb-8">
          <h3 className="font-['Inter'] text-xs font-semibold text-[#717970] dark:text-slate-400 mb-2.5">
            Quick Interval
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {intervalPresets.map((preset) => {
              const isSelected = intervalMinutes === preset;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    if (hapticEnabled) triggerHaptic(20);
                    onIntervalChange(preset);
                  }}
                  className={`font-['Inter'] text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#7fb685] text-[#114721] shadow-[0_4px_12px_rgba(127,182,133,0.35)] scale-105'
                      : 'bg-[#d8e3fa]/60 dark:bg-slate-800 text-[#414940] dark:text-slate-300 hover:bg-[#7fb685]/20'
                  }`}
                >
                  {preset}m
                </button>
              );
            })}
          </div>
        </section>

        {/* Secondary Control Row (Take Break Now / Reset) */}
        {sessionState !== 'idle' && (
          <div className="flex items-center justify-center gap-3 mb-6 animate-fadeIn">
            <button
              onClick={() => {
                if (hapticEnabled) triggerHaptic(30);
                onTriggerBreakManually();
              }}
              className="px-4 py-2 rounded-full bg-[#add6fd]/40 dark:bg-slate-800 text-[#1d4a6b] dark:text-sky-200 text-xs font-semibold hover:bg-[#add6fd]/70 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">self_improvement</span>
              Take Break Now
            </button>
            <button
              onClick={() => {
                if (hapticEnabled) triggerHaptic(30);
                onResetSession();
              }}
              className="px-4 py-2 rounded-full bg-[#d8e3fa]/40 dark:bg-slate-800 text-[#414940] dark:text-slate-300 text-xs font-semibold hover:bg-[#d8e3fa] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset
            </button>
          </div>
        )}
      </main>

      {/* Floating Primary Action Button */}
      <div className="fixed bottom-[96px] md:bottom-8 left-0 w-full flex justify-center z-30 px-6 pointer-events-none">
        <button
          onClick={handleActionClick}
          className="pointer-events-auto w-full max-w-sm h-16 bg-[#35693f] hover:bg-[#2b5534] dark:bg-[#35693f] dark:hover:bg-[#2b5534] text-white rounded-full font-['Inter'] font-semibold text-base flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(53,105,63,0.35)] active:scale-95 transition-all duration-200"
        >
          {sessionState === 'focusing' ? (
            <>
              <span className="material-symbols-outlined filled text-[24px]">pause</span>
              Pause Session
            </>
          ) : sessionState === 'focus_paused' ? (
            <>
              <span className="material-symbols-outlined filled text-[24px]">play_arrow</span>
              Resume Session
            </>
          ) : (
            <>
              <span className="material-symbols-outlined filled text-[24px]">play_arrow</span>
              Start Session
            </>
          )}
        </button>
      </div>
    </div>
  );
};
