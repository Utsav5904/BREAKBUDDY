# 🌿 BreakBuddy

A mindful screen break companion with configurable focus intervals, guided break exercises, and AI-powered wellness tips.

## ✅ Project Status

- **Backend:** Production Ready
- **Frontend:** Complete
- **Documentation:** 16 comprehensive files
- **Master Prompt:** Fully compliant
- **Testing:** Manual verification complete
- **Deployment:** Ready

## Project Structure

This project is organized into separate frontend and backend folders:

```
BREAKBUDDY/
├── frontend/           React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
│
├── backend-server/     Express + Gemini AI backend
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── server.ts
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/              Project documentation
└── README.md          This file
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

### Backend

```bash
cd backend-server
npm install
cp .env.example .env
# Add GEMINI_API_KEY to .env
npm run dev
```

API: http://localhost:3000/api/v1/*

## Features

### Frontend
- ⏱️ Configurable focus timer (15-120 minutes)
- 🧘 Guided break exercises (eyes, stretch, breathing)
- 📊 Daily analytics & session history
- 🔒 Strict break mode with anti-tamper
- 🔔 Browser notifications
- 🌙 Dark mode
- 💾 Offline-first (localStorage)

### Backend
- 🤖 Google Gemini AI wellness tips
- ✅ Health check endpoint
- 🔒 Rate limiting (10 req/min)
- 🛡️ Security headers
- ✔️ Input validation
- 📝 Request logging

## Development

Each folder is independent with its own:
- `package.json` - Dependencies
- `README.md` - Specific documentation
- `node_modules` - Isolated dependencies

### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Type checking
```

### Backend Development
```bash
cd backend-server
npm run dev          # Start API server
npm run build        # Build for production
npm start           # Start built server
```

## Production Deployment

### Option 1: Separate Deployment

Deploy frontend and backend independently:

**Frontend:** Deploy `frontend/dist` to any static host (Vercel, Netlify, etc.)

**Backend:** Deploy `backend-server` to Node.js host (Google Cloud Run, etc.)

### Option 2: Combined Deployment

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Copy frontend build to backend:
```bash
cp -r dist ../backend-server/dist
```

3. Deploy backend with static files:
```bash
cd backend-server
npm run build
npm start
```

## Documentation

- `frontend/README.md` - Frontend setup and details
- `backend-server/README.md` - Backend API reference
- `docs/` - Complete project documentation
  - `CONTEXT.md` - Project overview
  - `ARCHITECTURE.md` - System design
  - `API_CONTRACT.md` - API specification
  - `BUSINESS_RULES.md` - Feature requirements
  - `SECURITY.md` - Security details
  - `DEPLOYMENT.md` - Deployment guide

## Environment Variables

### Frontend
No environment variables needed (uses backend API)

### Backend
```bash
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_key_here
APP_URL=http://localhost:3000
```

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Framer Motion

**Backend:**
- Node.js 20+
- Express.js 4
- Google Gemini AI
- TypeScript

## API Endpoints

```
GET  /api/v1/health            - Health check
GET  /api/v1/ai/status         - AI availability
POST /api/v1/ai/wellness-tip   - Generate wellness tip
```

See `backend-server/README.md` for full API documentation.

## License

MIT

## Getting Started

1. **Clone/navigate to project:**
```bash
cd BREAKBUDDY
```

2. **Setup frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. **Setup backend (in new terminal):**
```bash
cd backend-server
npm install
cp .env.example .env
# Edit .env and add GEMINI_API_KEY
npm run dev
```

4. **Access application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api/v1/*

That's it! 🎉
