import React from 'react';
import { triggerHaptic } from '../utils/notifications';

interface BreakPromptModalProps {
  intervalMinutes: number;
  breakDurationMinutes: number;
  onStartBreak: () => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
  hapticEnabled: boolean;
}

export const BreakPromptModal: React.FC<BreakPromptModalProps> = ({
  intervalMinutes,
  breakDurationMinutes,
  onStartBreak,
  onSnooze,
  onDismiss,
  hapticEnabled,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#f9f9ff] dark:bg-[#1e293b] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#7fb685]/30 flex flex-col items-center text-center">
        {/* Calming icon */}
        <div className="w-16 h-16 rounded-full bg-[#7fb685]/20 text-[#35693f] dark:text-[#b7f1bb] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[36px] filled">spa</span>
        </div>

        <h3 className="font-['Quicksand'] font-bold text-2xl text-[#111c2c] dark:text-white mb-2">
          Time for a Break!
        </h3>
        <p className="font-['Inter'] text-sm text-[#414940] dark:text-slate-300 mb-6">
          You&apos;ve completed a <strong>{intervalMinutes}-minute</strong> focus block. Take a {breakDurationMinutes}-minute break to rest your eyes and stretch.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => {
              if (hapticEnabled) triggerHaptic(30);
              onStartBreak();
            }}
            className="w-full h-14 bg-[#35693f] hover:bg-[#2b5534] text-white rounded-full font-['Inter'] font-semibold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">self_improvement</span>
            Start {breakDurationMinutes}m Break
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (hapticEnabled) triggerHaptic(20);
                onSnooze(5);
              }}
              className="flex-1 h-11 bg-[#d8e3fa]/60 dark:bg-slate-700 hover:bg-[#d8e3fa] text-[#111c2c] dark:text-slate-200 rounded-full font-['Inter'] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">snooze</span>
              Snooze 5m
            </button>
            <button
              onClick={() => {
                if (hapticEnabled) triggerHaptic(20);
                onDismiss();
              }}
              className="flex-1 h-11 bg-[#d8e3fa]/30 dark:bg-slate-800 text-[#414940] dark:text-slate-400 hover:bg-[#d8e3fa]/60 rounded-full font-['Inter'] text-xs font-semibold transition-colors"
            >
              Skip Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
