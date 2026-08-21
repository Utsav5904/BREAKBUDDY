# BreakBuddy — TODO

## Backend
- [x] Server entry point (`server.ts`)
- [x] Environment config (`src/server/config/env.ts`)
- [x] Error handling middleware
- [x] Rate limiting middleware
- [x] Health check route
- [x] Gemini AI service
- [x] AI wellness tip route
- [x] Update package.json scripts
- [x] Security headers
- [x] CORS configuration
- [x] Request logging
- [x] Static file serving
- [x] SPA fallback routing

## Frontend Enhancement
- [ ] AI wellness tip integration in TipsTab (optional - current hardcoded exercises work well)
- [ ] Add UI to call `/api/v1/ai/wellness-tip` endpoint
- [ ] Display AI-generated tips alongside hardcoded exercises

## Deployment
- [ ] Add Dockerfile (if containerization needed)
- [ ] Configure Cloud Run deployment
- [ ] Set GEMINI_API_KEY in production environment

## Future Considerations
- [ ] PWA manifest and service worker for offline install
- [ ] WebSocket for real-time break reminders across tabs
- [ ] Optional user accounts for cross-device sync
