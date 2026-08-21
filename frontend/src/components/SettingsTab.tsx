import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendBreakNotification,
  triggerHaptic,
  NotificationPermissionStatus,
} from '../utils/notifications';
import { soundManager } from '../utils/audio';

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetToDefaults: () => void;
  onShowToast?: (msg: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onResetToDefaults,
  onShowToast,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAntiUninstallModal, setShowAntiUninstallModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [notificationNote, setNotificationNote] = useState<string | null>(null);

  // Sync real permission status
  useEffect(() => {
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);
  }, []);

  const handleTogglePushNotifications = async () => {
    if (!settings.pushNotifications) {
      // User is enabling notifications
      const res = await requestNotificationPermission();
      const currentStatus = getNotificationPermissionStatus();
      setPermissionStatus(currentStatus);

      if (res.success || currentStatus === 'granted') {
        onUpdateSettings({ pushNotifications: true });
        setNotificationNote(null);
        if (settings.hapticFeedback) triggerHaptic(40);
        if (onShowToast) onShowToast('🔔 Push notifications activated!');
      } else if (res.permission === 'denied' || currentStatus === 'denied') {
        // Allow setting for in-app alert mode, inform user
        onUpdateSettings({ pushNotifications: true });
        setNotificationNote(
          'Browser blocked system alerts for this site. In-app banner reminders are active. Click the URL lock icon to allow system push.'
        );
        if (onShowToast) onShowToast('⚠️ In-app alerts enabled; browser system alerts are blocked.');
      } else {
        onUpdateSettings({ pushNotifications: false });
        if (res.message) setNotificationNote(res.message);
        if (onShowToast) onShowToast(res.message || 'Permission dismissed.');
      }
    } else {
      // User is disabling notifications
      onUpdateSettings({ pushNotifications: false });
      setNotificationNote(null);
      if (settings.hapticFeedback) triggerHaptic(20);
      if (onShowToast) onShowToast('Notifications turned off.');
    }
  };

  const handleTestNotification = () => {
    sendBreakNotification(
      'BreakBuddy Test Reminder',
      '🌱 It works! You will receive gentle reminders like this when your focus block ends.'
    );
    if (settings.soundReminders) soundManager.playBreakPromptChime();
    if (settings.hapticFeedback) triggerHaptic(50);
    if (onShowToast) onShowToast('📢 Sent test notification!');
  };

  const handleTestSound = () => {
    soundManager.playBreakPromptChime();
    if (settings.hapticFeedback) triggerHaptic(40);
    if (onShowToast) onShowToast('🔔 Playing meditation bell test');
  };

  const faqs = [
    {
      q: 'How does Strict Break Lock work?',
      a: 'When Strict Break Lock is enabled, the mindful rest screen stays in full view until the countdown finishes. This prevents impulsive screen usage and ensures your eye muscles actually rest. An emergency 3-second hold bypass is available if an urgent event arises.',
    },
    {
      q: 'How do I prevent the app from being uninstalled or closed during breaks?',
      a: 'Enable "Anti-Tamper & Exit Protection" below. For total mobile lockdown, use Android Screen Pinning (Settings > Security > App Pinning) or iOS Guided Access (Settings > Accessibility > Guided Access). This locks BreakBuddy on your device and blocks app uninstalls or app switching until unlocked.',
    },
    {
      q: 'How do I fix notifications if they are blocked by my browser?',
      a: 'Click the padlock or tune icon on the left side of your browser’s address bar, set "Notifications" to "Allow", and refresh or toggle the notification switch in BreakBuddy.',
    },
    {
      q: 'What is the 20-20-20 rule for eye strain?',
      a: 'Every 20 minutes spent looking at a screen, look at something at least 20 feet away for 20 seconds. This relaxes the ciliary muscle inside your eye and prevents digital eye fatigue.',
    },
    {
      q: 'Can I use BreakBuddy offline?',
      a: 'Yes! BreakBuddy functions entirely offline with local storage and Web Audio API synthesis.',
    },
  ];

  return (
    <main className="pt-[88px] pb-[104px] px-6 flex flex-col gap-8 max-w-2xl mx-auto relative z-10">
      {/* Header */}
      <div className="mb-1">
        <h2 className="font-['Quicksand'] font-bold text-3xl sm:text-4xl text-[#111c2c] dark:text-white tracking-tight">
          Settings
        </h2>
        <p className="font-['Inter'] text-sm sm:text-base text-[#414940] dark:text-slate-300 mt-1">
          Customize your mindful session cadence and device lockdown rules.
        </p>
      </div>

      {/* SESSION SETTINGS SECTION */}
      <section className="flex flex-col gap-3">
        <h3 className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase tracking-wider">
          SESSION SETTINGS
        </h3>

        <div className="bg-[#ffffff] dark:bg-slate-800/90 rounded-2xl p-6 ambient-shadow flex flex-col gap-6 border border-[#d8e3fa]/50 dark:border-slate-700">
          {/* Default Break Interval Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label
                htmlFor="interval-slider"
                className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white"
              >
                Default Focus Interval
              </label>
              <span className="font-['Inter'] text-xs font-bold text-[#114721] dark:text-[#b7f1bb] bg-[#f0f3ff] dark:bg-slate-700 px-3 py-1 rounded-full border border-[#7fb685]/30">
                {settings.defaultInterval} min
              </span>
            </div>
            <input
              id="interval-slider"
              type="range"
              min="15"
              max="120"
              step="5"
              value={settings.defaultInterval}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateSettings({ defaultInterval: val });
              }}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between mt-1.5 font-['Inter'] text-xs text-[#717970] dark:text-slate-400">
              <span>15m</span>
              <span>120m</span>
            </div>
          </div>

          <hr className="border-[#d8e3fa]/60 dark:border-slate-700" />

          {/* Break Duration Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label
                htmlFor="duration-slider"
                className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white"
              >
                Rest Break Duration
              </label>
              <span className="font-['Inter'] text-xs font-bold text-[#114721] dark:text-[#b7f1bb] bg-[#f0f3ff] dark:bg-slate-700 px-3 py-1 rounded-full border border-[#7fb685]/30">
                {settings.breakDuration} min
              </span>
            </div>
            <input
              id="duration-slider"
              type="range"
              min="1"
              max="30"
              step="1"
              value={settings.breakDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateSettings({ breakDuration: val });
              }}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between mt-1.5 font-['Inter'] text-xs text-[#717970] dark:text-slate-400">
              <span>1m</span>
              <span>30m</span>
            </div>
          </div>
        </div>
      </section>

      {/* STRICT BREAK LOCK & ANTI-TAMPER PROTECTION */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>STRICT BREAK LOCK &amp; ANTI-TAMPER</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>

        <div className="bg-[#ffffff] dark:bg-slate-800/90 rounded-2xl p-6 ambient-shadow flex flex-col gap-5 border border-[#d8e3fa]/50 dark:border-slate-700">
          {/* Strict Lock Switch */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col">
              <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
                Strict Break Lockout
              </span>
              <span className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5 leading-relaxed">
                Locks the break screen and hides premature finish buttons. Requires a 3-second emergency hold to bypass.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={settings.strictBreakLock}
                onChange={(e) => {
                  onUpdateSettings({ strictBreakLock: e.target.checked });
                  if (settings.hapticFeedback) triggerHaptic(20);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
            </label>
          </div>

          <hr className="border-[#d8e3fa]/60 dark:border-slate-700" />

          {/* Anti-Tamper & Page Exit Guard */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col">
              <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
                Anti-Tamper &amp; Exit Guard
              </span>
              <span className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5 leading-relaxed">
                Blocks tab closing, accidental reloads, and browser exits during active rest periods.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={settings.antiTamperGuard}
                onChange={(e) => {
                  onUpdateSettings({ antiTamperGuard: e.target.checked });
                  if (settings.hapticFeedback) triggerHaptic(20);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
            </label>
          </div>

          <hr className="border-[#d8e3fa]/60 dark:border-slate-700" />

          {/* Auto Fullscreen Digital Shield */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col">
              <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
                Auto-Fullscreen Digital Shield
              </span>
              <span className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5 leading-relaxed">
                Automatically expands the rest screen to fullscreen to obscure background app distractions.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={settings.fullscreenBreak}
                onChange={(e) => {
                  onUpdateSettings({ fullscreenBreak: e.target.checked });
                  if (settings.hapticFeedback) triggerHaptic(20);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
            </label>
          </div>

          {/* Anti-Uninstall / Device Pinning Action Banner */}
          <div className="mt-1 p-4 bg-[#f0f3ff] dark:bg-slate-900/60 rounded-xl border border-[#d8e3fa] dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[22px] text-[#35693f] dark:text-[#b7f1bb] shrink-0 mt-0.5">
                security
              </span>
              <div className="flex flex-col">
                <span className="font-['Inter'] text-xs font-semibold text-[#111c2c] dark:text-white">
                  Device Pinning &amp; Anti-Uninstall Guide
                </span>
                <span className="font-['Inter'] text-[11px] text-[#717970] dark:text-slate-400">
                  Lock BreakBuddy to your screen on Android, iOS, or PC to prevent app switching or uninstallation.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowAntiUninstallModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#35693f] hover:bg-[#2c5734] text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-sm self-end sm:self-center"
            >
              View Guide
            </button>
          </div>
        </div>
      </section>

      {/* NOTIFICATION PREFERENCES SECTION */}
      <section className="flex flex-col gap-3">
        <h3 className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase tracking-wider">
          NOTIFICATION PREFERENCES
        </h3>

        <div className="bg-[#ffffff] dark:bg-slate-800/90 rounded-2xl p-6 ambient-shadow flex flex-col gap-5 border border-[#d8e3fa]/50 dark:border-slate-700">
          {/* Push Notifications Toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
                  Push Notifications
                </span>
                <span className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5">
                  Receive system and in-app alerts when a focus interval completes
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={handleTogglePushNotifications}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
              </label>
            </div>

            {/* Permission State Badge */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[11px] font-['Inter'] font-semibold text-[#717970] dark:text-slate-400">
                Status:
              </span>
              {permissionStatus === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Browser Notifications Allowed
                </span>
              ) : permissionStatus === 'denied' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Browser Alerts Blocked • Using In-App Banners
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  Toggle switch to request permission
                </span>
              )}
            </div>

            {notificationNote && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                  info
                </span>
                <span>{notificationNote}</span>
              </div>
            )}
          </div>

          <hr className="border-[#d8e3fa]/60 dark:border-slate-700" />

          {/* Sound Reminders Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
                Sound Reminders
              </span>
              <span className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5">
                Harmonic meditation bell when interval finishes
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.soundReminders}
                onChange={(e) => {
                  onUpdateSettings({ soundReminders: e.target.checked });
                  if (settings.hapticFeedback) triggerHaptic(20);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
            </label>
          </div>

          <hr className="border-[#d8e3fa]/60 dark:border-slate-700" />

          {/* Haptic Feedback Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
                Haptic Feedback
              </span>
              <span className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400 mt-0.5">
                Gentle vibration on supported mobile devices
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.hapticFeedback}
                onChange={(e) => {
                  onUpdateSettings({ hapticFeedback: e.target.checked });
                  if (e.target.checked) triggerHaptic(60);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
            </label>
          </div>

          {/* ELEGANT DIAGNOSTICS & TESTING BAR */}
          <div className="mt-2 pt-4 border-t border-[#d8e3fa]/60 dark:border-slate-700">
            <span className="font-['Inter'] text-[11px] font-bold text-[#717970] dark:text-slate-400 uppercase tracking-wider block mb-3">
              Diagnostics &amp; Previews
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Test Alert Button */}
              <button
                onClick={handleTestNotification}
                className="p-3 rounded-xl bg-[#f0f3ff] hover:bg-[#e4ebff] dark:bg-slate-700/70 dark:hover:bg-slate-700 text-[#114721] dark:text-[#b7f1bb] border border-[#d8e3fa] dark:border-slate-600 transition-all flex items-center gap-3 active:scale-[0.98] shadow-xs text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#7fb685]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-[#35693f] dark:text-[#b7f1bb]">
                    notifications_active
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-['Inter'] text-xs font-bold text-[#111c2c] dark:text-white">
                    Test Push Alert
                  </span>
                  <span className="text-[11px] text-[#717970] dark:text-slate-400">
                    Verify in-app &amp; system notification
                  </span>
                </div>
              </button>

              {/* Test Chime Button */}
              <button
                onClick={handleTestSound}
                className="p-3 rounded-xl bg-[#f0f3ff] hover:bg-[#e4ebff] dark:bg-slate-700/70 dark:hover:bg-slate-700 text-[#114721] dark:text-[#b7f1bb] border border-[#d8e3fa] dark:border-slate-600 transition-all flex items-center gap-3 active:scale-[0.98] shadow-xs text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#7fb685]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-[#35693f] dark:text-[#b7f1bb]">
                    volume_up
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-['Inter'] text-xs font-bold text-[#111c2c] dark:text-white">
                    Preview Bell Chime
                  </span>
                  <span className="text-[11px] text-[#717970] dark:text-slate-400">
                    432Hz meditation singing bowl
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AMBIENT AUDIO BACKGROUND */}
      <section className="flex flex-col gap-3">
        <h3 className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase tracking-wider">
          AMBIENT AUDIO
        </h3>
        <div className="bg-[#ffffff] dark:bg-slate-800/90 rounded-2xl p-6 ambient-shadow flex flex-col gap-3 border border-[#d8e3fa]/50 dark:border-slate-700">
          <p className="font-['Inter'] text-xs text-[#717970] dark:text-slate-400">
            Play soothing synthesized background sounds during your focus time.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {(['off', 'rain', 'forest'] as const).map((soundType) => {
              const isSelected = settings.ambientSound === soundType;
              return (
                <button
                  key={soundType}
                  onClick={() => {
                    onUpdateSettings({ ambientSound: soundType });
                    soundManager.setAmbientSound(soundType);
                    if (settings.hapticFeedback) triggerHaptic(20);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#35693f] text-white shadow-sm'
                      : 'bg-[#f0f3ff] dark:bg-slate-700 text-[#414940] dark:text-slate-300 hover:bg-[#d8e3fa]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {soundType === 'off' ? 'volume_off' : soundType === 'rain' ? 'water_drop' : 'nature'}
                  </span>
                  <span>{soundType}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* APPEARANCE SECTION */}
      <section className="flex flex-col gap-3">
        <h3 className="font-['Inter'] text-xs font-bold text-[#35693f] dark:text-[#b7f1bb] uppercase tracking-wider">
          APPEARANCE
        </h3>
        <div className="bg-[#ffffff] dark:bg-slate-800/90 rounded-2xl p-6 ambient-shadow border border-[#d8e3fa]/50 dark:border-slate-700">
          <div className="flex justify-between items-center py-1">
            <span className="font-['Inter'] text-base font-medium text-[#111c2c] dark:text-white">
              Dark Mode
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => {
                  onUpdateSettings({ darkMode: e.target.checked });
                  if (settings.hapticFeedback) triggerHaptic(20);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-[#d8e3fa] dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#7fb685] shadow-sm"></div>
            </label>
          </div>
        </div>
      </section>

      {/* HELP & SUPPORT BUTTON */}
      <section className="mt-2">
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full bg-[#f0f3ff] hover:bg-[#e7eeff] dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors rounded-2xl p-5 flex items-center justify-between ambient-shadow active:scale-[0.99] border border-[#d8e3fa]/50 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 text-[#35693f] dark:text-[#b7f1bb]">
            <span className="material-symbols-outlined text-[24px]">help</span>
            <span className="font-['Inter'] text-base font-semibold">
              Help &amp; Knowledge Base
            </span>
          </div>
          <span className="material-symbols-outlined text-[#717970] dark:text-slate-400">
            chevron_right
          </span>
        </button>
      </section>

      {/* Reset Defaults */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => {
            if (confirm('Reset all settings to default values?')) {
              onResetToDefaults();
            }
          }}
          className="text-xs text-[#717970] dark:text-slate-400 hover:text-red-600 transition-colors"
        >
          Reset Settings to Default
        </button>
      </div>

      {/* Anti-Uninstall & Screen Pinning Modal */}
      {showAntiUninstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#d8e3fa] dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-[#d8e3fa] dark:border-slate-700">
              <div className="flex items-center gap-2.5 text-[#35693f] dark:text-[#b7f1bb]">
                <span className="material-symbols-outlined text-[26px]">security</span>
                <h3 className="font-['Quicksand'] font-bold text-xl text-[#111c2c] dark:text-white">
                  Device Pinning &amp; Anti-Uninstall
                </h3>
              </div>
              <button
                onClick={() => setShowAntiUninstallModal(false)}
                className="text-[#717970] hover:text-[#111c2c] dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-xs sm:text-sm text-[#414940] dark:text-slate-300 leading-relaxed">
              <p>
                To enforce an un-bypassable mindful routine and prevent switching to distracting apps or uninstalling BreakBuddy during focus and break intervals, follow your device’s native kiosk lock instructions below:
              </p>

              {/* Android Instructions */}
              <div className="p-4 bg-[#f0f3ff] dark:bg-slate-900/60 rounded-2xl border border-[#d8e3fa] dark:border-slate-700">
                <h4 className="font-bold text-[#114721] dark:text-[#b7f1bb] flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">android</span>
                  <span>Android: App Pinning &amp; Device Admin</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[#414940] dark:text-slate-300">
                  <li>Open <strong>Settings &gt; Security &gt; Advanced &gt; App Pinning</strong> (or Screen Pinning) and turn it ON.</li>
                  <li>Enable <em>"Ask for PIN before unpinning"</em>.</li>
                  <li>Open BreakBuddy, swipe up to the recent apps view, tap the BreakBuddy icon, and select <strong>Pin</strong>.</li>
                  <li>BreakBuddy is now locked to the screen. Nobody can leave the app, open other apps, or uninstall until your secure device PIN is entered.</li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="p-4 bg-[#f0f3ff] dark:bg-slate-900/60 rounded-2xl border border-[#d8e3fa] dark:border-slate-700">
                <h4 className="font-bold text-[#114721] dark:text-[#b7f1bb] flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                  <span>iOS (iPhone &amp; iPad): Guided Access</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[#414940] dark:text-slate-300">
                  <li>Go to <strong>Settings &gt; Accessibility &gt; Guided Access</strong> and turn it ON.</li>
                  <li>Set a dedicated Passcode or Face ID lock.</li>
                  <li>While inside BreakBuddy, <strong>triple-click the side power button</strong> and tap <strong>Start</strong>.</li>
                  <li>Home gestures and app switching are completely locked until you triple-click and enter your passcode.</li>
                </ol>
              </div>

              {/* Desktop Browser */}
              <div className="p-4 bg-[#f0f3ff] dark:bg-slate-900/60 rounded-2xl border border-[#d8e3fa] dark:border-slate-700">
                <h4 className="font-bold text-[#114721] dark:text-[#b7f1bb] flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">laptop</span>
                  <span>Windows / macOS / Chrome Kiosk</span>
                </h4>
                <p>
                  Enable <strong>"Anti-Tamper &amp; Exit Guard"</strong> and <strong>"Auto-Fullscreen Shield"</strong> in BreakBuddy settings. You can also install BreakBuddy as a standalone PWA via the browser address bar icon for a dedicated desktop window.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAntiUninstallModal(false)}
                className="px-5 py-2 rounded-full bg-[#35693f] text-white text-xs font-semibold shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#d8e3fa] dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-[#d8e3fa] dark:border-slate-700">
              <div className="flex items-center gap-2 text-[#35693f] dark:text-[#b7f1bb]">
                <span className="material-symbols-outlined text-[24px]">spa</span>
                <h3 className="font-['Quicksand'] font-bold text-xl text-[#111c2c] dark:text-white">
                  BreakBuddy Knowledge &amp; FAQ
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#717970] hover:text-[#111c2c] dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#d8e3fa] dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 bg-[#f9f9ff] dark:bg-slate-800/80 font-['Inter'] text-sm font-semibold text-[#111c2c] dark:text-white flex items-center justify-between"
                    >
                      <span>{faq.q}</span>
                      <span className="material-symbols-outlined text-[20px] text-[#717970]">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-slate-900/60 font-['Inter'] text-xs sm:text-sm text-[#414940] dark:text-slate-300 leading-relaxed border-t border-[#d8e3fa]/60 dark:border-slate-700">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 rounded-full bg-[#35693f] text-white text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
