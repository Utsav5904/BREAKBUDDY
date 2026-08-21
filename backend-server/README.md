# 🌿 BreakBuddy Backend

Express.js REST API with Google Gemini AI integration.

## Quick Start

```bash
cd backend-server
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

Server runs at: http://localhost:3000

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### AI Status
```
GET /api/v1/ai/status
```

### Generate Wellness Tip
```
POST /api/v1/ai/wellness-tip
Content-Type: application/json

{
  "category": "eyes",
  "focusMinutes": 60,
  "context": "Optional context"
}
```

## Environment Variables

Create `.env` file:

```bash
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
```

Get API key: https://aistudio.google.com/app/apikey

## Project Structure

```
backend-server/
├── src/
│   ├── config/         Environment validation
│   ├── middleware/     Error handling, rate limiting
│   ├── routes/         API endpoints
│   └── services/       Gemini AI integration
├── server.ts           Express app entry point
└── package.json        Dependencies
```

## Features

- ✅ Health check endpoint
- ✅ AI wellness tip generation
- ✅ Rate limiting (10 req/min)
- ✅ Input validation
- ✅ Error handling
- ✅ Security headers
- ✅ CORS support
- ✅ Request logging

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - TypeScript type checking

## Testing

```bash
# Health check
curl http://localhost:3000/api/v1/health

# AI status
curl http://localhost:3000/api/v1/ai/status

# Generate tip
curl -X POST http://localhost:3000/api/v1/ai/wellness-tip \
  -H "Content-Type: application/json" \
  -d '{"category": "eyes", "focusMinutes": 60}'
```

## Production Build

```bash
npm run build
npm start
```

Built server: `dist/server.js`
