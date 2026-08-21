# 🌿 BreakBuddy Frontend

React + TypeScript wellness application for screen break reminders.

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- Framer Motion
- Lucide Icons

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

## Build for Production

```bash
npm run build
```

Output: `dist/` folder

## Features

- Focus timer with circular progress
- Break screen with guided exercises
- Stats dashboard
- Wellness tips
- Settings & customization
- Dark mode support
- Offline-first (localStorage)

## Project Structure

```
frontend/
├── src/
│   ├── components/     React components
│   ├── types/          TypeScript types
│   ├── utils/          Utilities (audio, storage, notifications)
│   ├── App.tsx         Main app component
│   ├── main.tsx        Entry point
│   └── index.css       Global styles
├── index.html          HTML template
├── vite.config.ts      Vite configuration
└── package.json        Dependencies
```

## API Integration

To connect with backend:

```typescript
// Check if AI is available
const response = await fetch('http://localhost:3000/api/v1/ai/status');
const { data } = await response.json();

if (data.available) {
  // Call AI endpoint
  const tip = await fetch('http://localhost:3000/api/v1/ai/wellness-tip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'eyes' })
  });
}
```

## Scripts

- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - TypeScript type checking
