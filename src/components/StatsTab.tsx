import React, { useState } from 'react';
import { SessionRecord, DayStat, TabType } from '../types';
import { getWeeklyBreakStats } from '../utils/storage';
import { triggerHaptic } from '../utils/notifications';

interface StatsTabProps {
  sessions: SessionRecord[];
  streakDays: number;
  dailyGoalMinutes: number;
  onClearSessions: () => void;
  onAddManualSession: (record: SessionRecord) => void;
  onNavigateToHome: () => void;
  hapticEnabled: boolean;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  sessions,
  streakDays,
  dailyGoalMinutes,
  onClearSessions,
  onAddManualSession,
  onNavigateToHome,
  hapticEnabled,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayStat | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('Deep Work Block');
  const [manualCategory, setManualCategory] = useState<'Deep Work' | 'Writing' | 'Coding' | 'Study' | 'General' | 'Stretch Break' | 'Eye Rest'>('Deep Work');
  const [manualMinutes, setManualMinutes] = useState(45);
  const [manualType, setManualType] = useState<'focus' | 'break'>('focus');

  // Compute today's focus metrics
  const now = new Date();
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.timestamp);
    return d.toDateString() === now.toDateString();
  });

  const totalFocusMinutesToday = todaySessions
    .filter((s) => s.type === 'focus' && s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const breaksCountToday = todaySessions.filter(
    (s) => s.type === 'break' && s.completed
  ).length;

  const focusHours = Math.floor(totalFocusMinutesToday / 60);
  const focusRemainderMins = totalFocusMinutesToday % 60;
  const goalProgressPercent = Math.min(100, Math.round((totalFocusMinutesToday / dailyGoalMinutes) * 100));

  const weeklyStats = getWeeklyBreakStats(sessions);

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date();
    const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: SessionRecord = {
      id: `manual-${Date.now()}`,
      type: manualType,
      title: manualTitle || (manualType === 'focus' ? 'Focus Session' : 'Quick Break'),
      category: manualCategory,
      durationMinutes: manualMinutes,
      completed: true,
      timestamp: d.toISOString(),
      formattedTime: timeString,
    };
    onAddManualSession(newRecord);
    setShowAddModal(false);
    if (hapticEnabled) triggerHaptic(30);
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto flex flex-col gap-6 relative z-10">
      {/* Header matching screenshot */}
      <section className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-['Quicksand'] font-bold text-3xl sm:text-4xl text-[#111c2c] dark:text-white tracking-tight">
            Today&apos;s Progress
          </h1>
          <p className="font-['Inter'] text-base text-[#414940] dark:text-slate-300 mt-1">
            Your daily wellness summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (hapticEnabled) triggerHaptic(20);
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#7fb685]/20 hover:bg-[#7fb685]/30 text-[#114721] dark:text-[#b7f1bb] text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Log Session</span>
          </button>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <section className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Primary Stat Card: Total Focus Time */}
        <div className="col-span-2 bg-[#f0f3ff] dark:bg-slate-800/90 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(127,182,133,0.1)] flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_15px_50px_-10px_rgba(127,182,133,0.18)] transition-all duration-300 border border-[#d8e3fa]/40 dark:border-slate-700">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#7fb685]/20 dark:bg-[#7fb685]/10 rounded-full blur-2xl group-hover:bg-[#7fb685]/30 transition-colors" />

          <div className="flex items-center justify-between z-10 mb-6">
            <span className="font-['Inter'] text-xs font-bold text-[#414940] dark:text-slate-400 uppercase tracking-wider">
              TOTAL FOCUS TIME
            </span>
            <span className="material-symbols-outlined text-[#35693f] dark:text-[#b7f1bb] filled text-[24px]">
              timer
            </span>
          </div>

          <div className="z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-['Quicksand'] font-bold text-4xl sm:text-5xl text-[#35693f] dark:text-[#b7f1bb]">
                {focusHours}h
              </span>
              <span className="font-['Quicksand'] font-bold text-3xl sm:text-4xl text-[#111c2c] dark:text-white">
                {focusRemainderMins}m
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full h-2.5 bg-[#d8e3fa] dark:bg-slate-700 rounded-full mt-4 overflow-hidden relative">
              <div
                className="h-full bg-[#35693f] dark:bg-[#7fb685] rounded-full transition-all duration-700"
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-[#717970] dark:text-slate-400 mt-2 font-medium">
              <span>Goal: {Math.floor(dailyGoalMinutes / 60)}h / day</span>
              <span>{goalProgressPercent}% Achieved</span>
            </div>
          </div>
        </div>

        {/* Secondary Stat Card 1: Breaks Taken */}
        <div className="bg-[#f0f3ff] dark:bg-slate-800/90 rounded-2xl p-5 shadow-[0_10px_30px_-10px_rgba(127,182,133,0.06)] flex flex-col justify-between border border-[#d8e3fa]/40 dark:border-slate-700 hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#386284] dark:text-sky-300 text-xl">
              coffee
            </span>
            <span className="font-['Inter'] text-xs font-semibold text-[#414940] dark:text-slate-400">
              Breaks Taken
            </span>
          </div>
          <span className="font-['Quicksand'] font-bold text-3xl sm:text-4xl text-[#111c2c] dark:text-white">
            {breaksCountToday}
          </span>
        </div>

        {/* Secondary Stat Card 2: Streak */}
        <div className="bg-[#f0f3ff] dark:bg-slate-800/90 rounded-2xl p-5 shadow-[0_10px_30px_-10px_rgba(127,182,133,0.06)] flex flex-col justify-between border border-[#d8e3fa]/40 dark:border-slate-700 hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#675d49] dark:text-amber-300 text-xl">
              local_fire_department
            </span>
            <span className="font-['Inter'] text-xs font-semibold text-[#414940] dark:text-slate-400">
              Streak
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-['Quicksand'] font-bold text-3xl sm:text-4xl text-[#111c2c] dark:text-white">
              {streakDays}
            </span>
            <span className="font-['Inter'] text-sm text-[#414940] dark:text-slate-400">
              days
            </span>
          </div>
        </div>
      </section>

      {/* Break Frequency Weekly Chart */}
      <section className="bg-[#f0f3ff] dark:bg-slate-800/90 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(127,182,133,0.08)] border border-[#d8e3fa]/40 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-['Quicksand'] font-bold text-xl text-[#111c2c] dark:text-white">
              Break Frequency
            </h2>
            <p className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5">
              Breaks taken throughout this week
            </p>
          </div>
          {selectedDay && (
            <span className="font-['Inter'] text-xs font-semibold px-3 py-1 rounded-full bg-[#7fb685]/20 text-[#114721] dark:text-[#b7f1bb]">
              {selectedDay.dayFull}: {selectedDay.breaksCount} breaks ({Math.round(selectedDay.focusMinutes / 60)}h)
            </span>
          )}
        </div>

        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-[#d8e3fa] dark:border-slate-700 pb-2">
          {weeklyStats.map((item, idx) => {
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(item)}
                className="w-full flex flex-col items-center gap-2 group focus:outline-none"
                title={`${item.dayFull}: ${item.breaksCount} breaks`}
              >
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    item.isToday
                      ? 'bg-[#35693f] dark:bg-[#7fb685] shadow-md relative'
                      : 'bg-[#7fb685]/40 dark:bg-[#7fb685]/30 group-hover:bg-[#7fb685]'
                  }`}
                  style={{ height: `${item.targetPercent}%` }}
                >
                  {item.isToday && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#35693f] dark:bg-[#b7f1bb] rounded-full ring-2 ring-white dark:ring-slate-800" />
                  )}
                </div>
                <span
                  className={`font-['Inter'] text-xs ${
                    item.isToday
                      ? 'text-[#35693f] dark:text-[#b7f1bb] font-bold'
                      : 'text-[#414940] dark:text-slate-400'
                  }`}
                >
                  {item.day}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Sessions List */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between ml-1">
          <h2 className="font-['Quicksand'] font-bold text-xl text-[#111c2c] dark:text-white">
            Recent Sessions
          </h2>
          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all session history?')) {
                  onClearSessions();
                }
              }}
              className="text-xs text-[#717970] dark:text-slate-400 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="bg-[#f0f3ff] dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-[#d8e3fa] dark:border-slate-700">
            <p className="font-['Inter'] text-sm text-[#717970] dark:text-slate-400">
              No sessions recorded yet. Start your first session on the Home screen!
            </p>
            <button
              onClick={onNavigateToHome}
              className="mt-3 px-4 py-2 rounded-full bg-[#35693f] text-white text-xs font-semibold shadow"
            >
              Start Focus Session
            </button>
          </div>
        ) : (
          sessions.slice(0, 8).map((session) => {
            const isBreak = session.type === 'break';
            return (
              <div
                key={session.id}
                className="bg-[#f0f3ff] dark:bg-slate-800/90 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(127,182,133,0.04)] hover:shadow-[0_8px_20px_rgba(127,182,133,0.08)] transition-all border border-[#d8e3fa]/40 dark:border-slate-700"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center ${
                      isBreak
                        ? 'bg-[#add6fd]/30 dark:bg-[#add6fd]/20 text-[#386284] dark:text-sky-300'
                        : 'bg-[#7fb685]/20 dark:bg-[#7fb685]/30 text-[#35693f] dark:text-[#b7f1bb]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isBreak ? 'self_improvement' : 'psychology'}
                    </span>
                  </div>
                  <div>
                    <p className="font-['Inter'] font-semibold text-sm text-[#111c2c] dark:text-white">
                      {session.title}
                    </p>
                    <p className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5">
                      {session.formattedTime} • {session.category}
                    </p>
                  </div>
                </div>

                <span className="font-['Inter'] font-semibold text-sm text-[#111c2c] dark:text-slate-200">
                  {session.durationMinutes}m
                </span>
              </div>
            );
          })
        )}
      </section>

      {/* Manual Session Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#d8e3fa] dark:border-slate-700 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Quicksand'] font-bold text-xl text-[#111c2c] dark:text-white">
                Log Activity
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#717970] hover:text-[#111c2c] dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="flex flex-col gap-4">
              <div>
                <label className="block font-['Inter'] text-xs font-semibold text-[#414940] dark:text-slate-300 mb-1">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualType('focus');
                      setManualTitle('Deep Work Block');
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      manualType === 'focus'
                        ? 'bg-[#35693f] text-white'
                        : 'bg-[#f0f3ff] dark:bg-slate-700 text-[#414940] dark:text-slate-300'
                    }`}
                  >
                    Focus Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualType('break');
                      setManualTitle('Stretch Break');
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      manualType === 'break'
                        ? 'bg-[#7fb685] text-[#114721]'
                        : 'bg-[#f0f3ff] dark:bg-slate-700 text-[#414940] dark:text-slate-300'
                    }`}
                  >
                    Break Taken
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-['Inter'] text-xs font-semibold text-[#414940] dark:text-slate-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fa] dark:border-slate-600 bg-[#f9f9ff] dark:bg-slate-700 text-sm focus:outline-none focus:border-[#35693f]"
                  required
                />
              </div>

              <div>
                <label className="block font-['Inter'] text-xs font-semibold text-[#414940] dark:text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8e3fa] dark:border-slate-600 bg-[#f9f9ff] dark:bg-slate-700 text-sm focus:outline-none focus:border-[#35693f]"
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#d8e3fa]/40 dark:bg-slate-700 text-[#414940] dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#35693f] text-white text-xs font-semibold shadow"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
