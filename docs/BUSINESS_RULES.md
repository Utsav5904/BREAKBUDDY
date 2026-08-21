# BreakBuddy — Business Rules

## BR-001: Focus Interval Boundaries
Focus intervals are configurable between 15 and 120 minutes. Quick presets: 20, 30, 45, 60 minutes.

## BR-002: Break Duration Boundaries
Break durations are configurable between 1 and 30 minutes. Default: 5 minutes.

## BR-003: Session Recording Threshold
Focus sessions shorter than 60 seconds are not recorded to session history (see `handleResetSession` in App.tsx).

## BR-004: Break Completion Recording
All completed breaks are recorded with the actual elapsed break time (not the configured duration).

## BR-005: Strict Break Lock
When enabled, the break screen hides the early finish button. Users must perform a 3-second emergency hold to bypass.

## BR-006: Anti-Tamper Guard
When enabled, blocks tab close, page reload, and browser exit during active break periods using the `beforeunload` event.

## BR-007: Auto-Start Breaks
When enabled, breaks start automatically when a focus interval completes. When disabled, a prompt modal is shown with Start/Snooze/Dismiss options.

## BR-008: Offline-First
All core functionality works without network access. AI wellness tips are an optional enhancement.

## BR-009: AI Wellness Tips (Server-Side)
Personalized wellness tips are generated via Gemini AI through a server-side proxy. Rate limited to 10 requests per minute. Falls back gracefully when unavailable.

## BR-010: Daily Focus Goal
Default daily focus goal is 300 minutes (5 hours). Configurable in settings. Used for progress percentage calculation in Stats tab.
