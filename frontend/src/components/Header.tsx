import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isTimerRunning: boolean;
  onOpenAmbientModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  isTimerRunning,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-[#f9f9ff]/80 dark:bg-[#111c2c]/80 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(127,182,133,0.12)] border-b border-[#d8e3fa]/40 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-6 h-16 max-w-5xl mx-auto w-full">
        {/* Brand & Spa Icon */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 text-[#35693f] dark:text-[#b7f1bb] hover:opacity-85 transition-transform active:scale-95 group"
          aria-label="BreakBuddy Home"
        >
          <div className="w-9 h-9 rounded-full bg-[#7fb685]/20 dark:bg-[#7fb685]/30 flex items-center justify-center text-[#35693f] dark:text-[#b7f1bb] transition-transform group-hover:rotate-12">
            <span className="material-symbols-outlined text-[22px]">spa</span>
          </div>
          <span className="font-['Quicksand'] font-bold text-2xl tracking-tight text-[#35693f] dark:text-[#b7f1bb]">
            BreakBuddy
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onTabChange('home')}
            className={`font-['Inter'] text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              currentTab === 'home'
                ? 'text-[#35693f] dark:text-[#b7f1bb] bg-[#7fb685]/20 dark:bg-[#7fb685]/30'
                : 'text-[#414940] dark:text-slate-300 hover:text-[#35693f] dark:hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('stats')}
            className={`font-['Inter'] text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              currentTab === 'stats'
                ? 'text-[#35693f] dark:text-[#b7f1bb] bg-[#7fb685]/20 dark:bg-[#7fb685]/30'
                : 'text-[#414940] dark:text-slate-300 hover:text-[#35693f] dark:hover:text-white'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => onTabChange('tips')}
            className={`font-['Inter'] text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              currentTab === 'tips'
                ? 'text-[#35693f] dark:text-[#b7f1bb] bg-[#7fb685]/20 dark:bg-[#7fb685]/30'
                : 'text-[#414940] dark:text-slate-300 hover:text-[#35693f] dark:hover:text-white'
            }`}
          >
            Tips
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`font-['Inter'] text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
              currentTab === 'settings'
                ? 'text-[#35693f] dark:text-[#b7f1bb] bg-[#7fb685]/20 dark:bg-[#7fb685]/30'
                : 'text-[#414940] dark:text-slate-300 hover:text-[#35693f] dark:hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Status Indicator / Pulse */}
        <div className="flex items-center gap-2">
          {isTimerRunning && (
            <div className="flex items-center gap-1.5 bg-[#7fb685]/20 text-[#114721] dark:text-[#b7f1bb] px-2.5 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#35693f] dark:bg-[#b7f1bb] animate-ping" />
              <span>Session Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
