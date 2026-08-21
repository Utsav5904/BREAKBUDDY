# BreakBuddy — Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│                    Client                        │
│  React SPA (Vite build)                         │
│  ┌───────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ localStorage│ │Web Audio │ │Notification  │   │
│  │ (settings, │ │API       │ │API           │   │
│  │  sessions) │ │(sounds)  │ │(alerts)      │   │
│  └───────────┘ └──────────┘ └──────────────┘   │
│         │                                        │
│         │  POST /api/v1/ai/wellness-tip          │
│         ▼                                        │
├─────────────────────────────────────────────────┤
│                Express Server                    │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │Static    │  │AI Route   │  │Health Route  │ │
│  │File      │  │           │  │              │ │
│  │Server    │  │           │  │              │ │
│  └──────────┘  └─────┬─────┘  └──────────────┘ │
│                      │                           │
│              ┌───────▼───────┐                   │
│              │Gemini Service │                   │
│              └───────┬───────┘                   │
│                      │                           │
├──────────────────────┼──────────────────────────┤
│                      ▼                           │
│           Google Gemini AI API                   │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Focus/Break Sessions (Client-Only)
```
User Action → React State → localStorage
```
No server involvement. All timer logic, session recording, and analytics happen in the browser.

### AI Wellness Tips (Server-Proxied)
```
Frontend
   ↓ POST /api/v1/ai/wellness-tip
Express Route
   ↓
AI Service (geminiService.ts)
   ↓
Google Gemini API
   ↓
Response → Frontend
```

### Static Asset Serving (Production)
```
Browser Request → Express static middleware → /dist/* files
```

## Backend Layers

| Layer | Responsibility |
|---|---|
| `server.ts` | App bootstrap, middleware chain, static serving |
| `routes/` | HTTP method + endpoint mapping |
| `services/` | Business logic (Gemini AI interaction) |
| `middleware/` | Error handling, rate limiting |
| `config/` | Environment validation |

## Deployment Target
Google Cloud Run (inferred from AI Studio `APP_URL` env var pattern)
