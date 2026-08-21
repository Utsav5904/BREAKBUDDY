import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: 'dashboard', filledIcon: 'dashboard' },
    { id: 'stats' as TabType, label: 'Stats', icon: 'bar_chart', filledIcon: 'bar_chart' },
    { id: 'tips' as TabType, label: 'Tips', icon: 'self_improvement', filledIcon: 'self_improvement' },
    { id: 'settings' as TabType, label: 'Settings', icon: 'settings', filledIcon: 'settings' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-4 pb-safe bg-[#f9f9ff]/85 dark:bg-[#111c2c]/85 backdrop-blur-[16px] z-40 rounded-t-2xl shadow-[0_-10px_40px_rgba(127,182,133,0.12)] border-t border-[#d8e3fa]/50 dark:border-slate-800 md:hidden"
      role="navigation"
      aria-label="Main Navigation"
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-full transition-all duration-200 active:scale-90 ${
              isActive
                ? 'bg-[#7fb685]/25 dark:bg-[#7fb685]/30 text-[#35693f] dark:text-[#b7f1bb] font-semibold'
                : 'text-[#414940] dark:text-slate-400 opacity-75 hover:opacity-100 hover:bg-[#d8e3fa]/30 dark:hover:bg-slate-800'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}
            >
              {tab.icon}
            </span>
            <span className="font-['Inter'] text-xs mt-0.5 whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
