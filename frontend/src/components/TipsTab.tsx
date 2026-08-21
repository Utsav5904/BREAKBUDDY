import React, { useState, useEffect } from 'react';
import { TipExercise } from '../types';
import { soundManager } from '../utils/audio';
import { triggerHaptic } from '../utils/notifications';

interface TipsTabProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const EXERCISES: TipExercise[] = [
  {
    id: 'tip-1',
    title: 'The 20-20-20 Rule for Eye Fatigue',
    category: 'eyes',
    durationSeconds: 20,
    description: 'Every 20 minutes, shift your gaze to an object at least 20 feet away for 20 continuous seconds.',
    instructionSteps: [
      'Look away from your screen or laptop.',
      'Focus on a distant object (e.g. out a window or at the far wall).',
      'Blink gently several times to moisten the corneal surface.',
      'Allow your eye muscles to completely unclench.',
    ],
    benefit: 'Relieves ciliary muscle spasm and reduces dry eye symptoms.',
    iconName: 'visibility',
  },
  {
    id: 'tip-2',
    title: '4-7-8 Calming Breathwork',
    category: 'breathing',
    durationSeconds: 60,
    description: 'A rhythmic breathing pattern that activates the parasympathetic nervous system.',
    instructionSteps: [
      'Exhale completely through your mouth.',
      'Close your mouth and inhale quietly through your nose for 4 seconds.',
      'Hold your breath comfortably for 7 seconds.',
      'Exhale completely through your mouth for 8 seconds.',
    ],
    benefit: 'Lowers heart rate, reduces cortisol, and sharpens mental clarity.',
    iconName: 'air',
  },
  {
    id: 'tip-3',
    title: 'Desk Neck & Trap Decompressor',
    category: 'stretch',
    durationSeconds: 45,
    description: 'Releases cervical spine compression caused by forward head posture.',
    instructionSteps: [
      'Sit tall with your shoulders relaxed and down.',
      'Gently drop your right ear toward your right shoulder.',
      'Hold for 15 seconds without forcing or jerking.',
      'Repeat smoothly on the left side.',
      'Complete with 3 gentle backward shoulder rolls.',
    ],
    benefit: 'Eases upper trapezius stiffness and tension headaches.',
    iconName: 'self_improvement',
  },
  {
    id: 'tip-4',
    title: 'Wrist & Forearm Flexor Release',
    category: 'stretch',
    durationSeconds: 30,
    description: 'Prevents repetitive strain injury (RSI) and carpal tunnel inflammation.',
    instructionSteps: [
      'Extend your arm in front with palm facing forward (fingers pointing up).',
      'Use your other hand to gently pull fingers toward you.',
      'Hold for 15 seconds.',
      'Flip palm downward and repeat gentle pull.',
    ],
    benefit: 'Increases blood flow to overworked typing tendons.',
    iconName: 'back_hand',
  },
  {
    id: 'tip-5',
    title: 'Warm Palming for Eye Rejuvenation',
    category: 'eyes',
    durationSeconds: 30,
    description: 'Uses soothing body heat to relax optical nerves and photoreceptors.',
    instructionSteps: [
      'Rub your palms vigorously together until warm.',
      'Cup your hands over your closed eyes without applying pressure.',
      'Breathe deeply in total darkness for 30 seconds.',
    ],
    benefit: 'Provides instant relief from intense screen glare.',
    iconName: 'spa',
  },
];

export const TipsTab: React.FC<TipsTabProps> = ({ soundEnabled, hapticEnabled }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'eyes' | 'stretch' | 'breathing'>('all');
  const [activeExercise, setActiveExercise] = useState<TipExercise | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Exercise countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (soundEnabled) soundManager.playBreakCompletedChime();
            if (hapticEnabled) triggerHaptic(80);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, secondsRemaining, soundEnabled, hapticEnabled]);

  // Breathing pacer cycle
  useEffect(() => {
    if (!timerRunning || activeExercise?.category !== 'breathing') return;

    const breathInterval = setInterval(() => {
      setBreathPhase((curr) => {
        if (curr === 'Inhale') return 'Hold';
        if (curr === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);

    return () => clearInterval(breathInterval);
  }, [timerRunning, activeExercise]);

  const handleStartExercise = (ex: TipExercise) => {
    setActiveExercise(ex);
    setSecondsRemaining(ex.durationSeconds);
    setTimerRunning(true);
    setBreathPhase('Inhale');
    if (hapticEnabled) triggerHaptic(30);
    if (soundEnabled) soundManager.playStartTone();
  };

  const filteredExercises = activeCategory === 'all'
    ? EXERCISES
    : EXERCISES.filter((ex) => ex.category === activeCategory);

  return (
    <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto flex flex-col gap-6 relative z-10">
      {/* Header */}
      <div>
        <h1 className="font-['Quicksand'] font-bold text-3xl sm:text-4xl text-[#111c2c] dark:text-white tracking-tight">
          Wellness &amp; Micro-Breaks
        </h1>
        <p className="font-['Inter'] text-sm sm:text-base text-[#414940] dark:text-slate-300 mt-1">
          Evidence-based exercises to relieve eye strain and recharge during screen work.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Tips', icon: 'grid_view' },
          { id: 'eyes', label: 'Eye Strain', icon: 'visibility' },
          { id: 'stretch', label: 'Stretches', icon: 'self_improvement' },
          { id: 'breathing', label: 'Breathing', icon: 'air' },
        ].map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
              className={`px-4 py-2 rounded-full font-['Inter'] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#35693f] text-white shadow-sm'
                  : 'bg-[#f0f3ff] dark:bg-slate-800 text-[#414940] dark:text-slate-300 hover:bg-[#d8e3fa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured 20-20-20 Quick Card */}
      <section className="bg-gradient-to-br from-[#7fb685]/20 to-[#add6fd]/30 dark:from-[#35693f]/30 dark:to-slate-800 rounded-3xl p-6 border border-[#7fb685]/30 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-md">
            <span className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase tracking-wider">
              QUICK RELIEF
            </span>
            <h3 className="font-['Quicksand'] font-bold text-2xl text-[#111c2c] dark:text-white mt-1">
              The 20-20-20 Eye Reset
            </h3>
            <p className="font-['Inter'] text-sm text-[#414940] dark:text-slate-300 mt-1.5">
              Look 20 feet away right now for 20 seconds. Relax your facial muscles and blink.
            </p>
          </div>
          <button
            onClick={() => handleStartExercise(EXERCISES[0])}
            className="px-5 py-3 rounded-full bg-[#35693f] hover:bg-[#2b5534] text-white font-['Inter'] text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Start 20s Reset
          </button>
        </div>
      </section>

      {/* Tips / Exercises List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-[#f0f3ff] dark:bg-slate-800/90 rounded-2xl p-5 shadow-[0_4px_16px_rgba(127,182,133,0.05)] border border-[#d8e3fa]/50 dark:border-slate-700 flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(127,182,133,0.1)] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-[#7fb685]/20 dark:bg-[#7fb685]/30 text-[#35693f] dark:text-[#b7f1bb] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{exercise.iconName}</span>
                </div>
                <span className="font-['Inter'] text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-700 text-[#717970] dark:text-slate-300">
                  {exercise.durationSeconds}s
                </span>
              </div>

              <h3 className="font-['Quicksand'] font-bold text-lg text-[#111c2c] dark:text-white">
                {exercise.title}
              </h3>
              <p className="font-['Inter'] text-xs text-[#414940] dark:text-slate-300 mt-1 leading-relaxed">
                {exercise.description}
              </p>

              <div className="mt-3 bg-white/60 dark:bg-slate-900/50 p-3 rounded-xl">
                <p className="font-['Inter'] text-[11px] font-semibold text-[#35693f] dark:text-[#b7f1bb]">
                  Why it helps: {exercise.benefit}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStartExercise(exercise)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#d8e3fa]/60 dark:bg-slate-700 hover:bg-[#7fb685]/25 text-[#114721] dark:text-[#b7f1bb] font-['Inter'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              Guide Me ({exercise.durationSeconds}s)
            </button>
          </div>
        ))}
      </section>

      {/* Interactive Guided Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#7fb685]/30 flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase">
                Guided Practice
              </span>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setActiveExercise(null);
                }}
                className="text-[#717970] hover:text-[#111c2c] dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h3 className="font-['Quicksand'] font-bold text-2xl text-[#111c2c] dark:text-white mt-1">
              {activeExercise.title}
            </h3>

            {/* Pacing Visualizer */}
            <div className="my-6 relative flex items-center justify-center w-36 h-36">
              <div
                className={`absolute inset-0 rounded-full border-4 border-[#7fb685] transition-all duration-1000 ${
                  timerRunning ? 'animate-ping opacity-30' : ''
                }`}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="font-['Quicksand'] font-bold text-4xl text-[#35693f] dark:text-[#b7f1bb] tabular-nums">
                  {secondsRemaining}s
                </span>
                {activeExercise.category === 'breathing' && (
                  <span className="font-['Inter'] text-xs font-semibold text-[#1d4a6b] dark:text-sky-200 mt-1">
                    {breathPhase}
                  </span>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="w-full text-left bg-[#f9f9ff] dark:bg-slate-900/60 p-4 rounded-2xl mb-6">
              <p className="font-['Inter'] text-xs font-bold text-[#414940] dark:text-slate-300 mb-2">
                Follow these steps:
              </p>
              <ul className="space-y-1.5">
                {activeExercise.instructionSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="font-['Inter'] text-xs text-[#414940] dark:text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-[#35693f] dark:text-[#b7f1bb] font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full flex gap-2">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="flex-1 py-3 rounded-full bg-[#35693f] hover:bg-[#2b5534] text-white font-['Inter'] text-xs font-semibold shadow transition-all"
              >
                {timerRunning ? 'Pause' : secondsRemaining === 0 ? 'Restart' : 'Resume'}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setActiveExercise(null);
                }}
                className="px-5 py-3 rounded-full bg-[#d8e3fa]/60 dark:bg-slate-700 text-[#414940] dark:text-slate-300 font-['Inter'] text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
