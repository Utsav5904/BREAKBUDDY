# BreakBuddy — Project Context

## Project
**BreakBuddy** — Screen Break Reminder & Wellness Companion

## Purpose
A mindful screen break companion with configurable focus intervals, ambient countdowns, guided stretch breaks, and daily focus analytics. Helps users protect their eyes and mental health during prolonged screen work.

## Target Users
Individual knowledge workers, developers, students, and anyone spending long hours at a screen.

## Core Modules
1. **Home** — Focus timer with circular progress ring, interval presets, session controls
2. **Stats** — Daily progress dashboard, weekly break frequency chart, session history
3. **Tips** — Guided wellness exercises (eye, stretch, breathing), AI-powered wellness tips
4. **Settings** — Session config, strict break lock, anti-tamper, notifications, ambient audio, dark mode
5. **Break Screen** — Full-screen break overlay with countdown, stretch guidance

## Technology Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion
- **Backend**: Express.js (Node.js) — serves static frontend + Gemini AI proxy
- **AI**: Google Gemini API (`@google/genai`) for personalized wellness tips
- **Storage**: Browser `localStorage` (client-side persistence)
- **Audio**: Web Audio API (client-side synthesized sounds)
- **Notifications**: Browser Notification API + in-app banners

## Backend Architecture
Minimal Express server:
- Serves production frontend build (`/dist`)
- Gemini AI proxy endpoint for wellness tip generation
- Health check endpoint for deployment monitoring
- No database — all user data remains in client-side `localStorage`

## Authentication Strategy
None — single anonymous user, no login required.

## Authorization Strategy
None — no multi-user, no roles.

## Important Integrations
- Google Gemini AI API (server-side proxy to protect API key)

## Current Implementation Status
- Frontend: Complete (AI Studio generated)
- Backend: In progress
- AI Integration: In progress

## Current Development Phase
Backend implementation — Phase 1

## Important Constraints
- Must not break existing frontend behavior
- Frontend data layer (localStorage) must remain unchanged
- Gemini API key must never be exposed to the client
- App must function fully offline (AI tips are an enhancement, not a requirement)
