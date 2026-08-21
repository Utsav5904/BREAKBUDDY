# BreakBuddy — Deployment

## Build Process

### 1. Frontend Build
```bash
npm run build
```
- Compiles React app with Vite
- Output: `dist/` directory with optimized static assets
- Includes HTML, CSS, JS, and images

### 2. Backend Build
```bash
npm run build:server
```
- Bundles Express server with esbuild
- Output: `dist/server.js` (single file)
- Externals: express, dotenv, @google/genai (installed via node_modules)

### 3. Complete Production Build
```bash
npm run build && npm run build:server
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | No* | — | Google Gemini API key (*required for AI features) |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | production | Environment mode (`development` or `production`) |
| `APP_URL` | No | — | Public application URL (used by AI Studio) |

**Note:** The app works without `GEMINI_API_KEY` — AI tips will be unavailable but all other features work normally.

## Production Deployment

### Local Production Server

```bash
# Build everything
npm run build && npm run build:server

# Start production server
npm start
```

The server will:
- Listen on `PORT` (default: 3000)
- Serve static frontend from `dist/`
- Expose API at `/api/v1/*`
- Log all API requests with timing

### Google Cloud Run Deployment

1. **Build container** (create `Dockerfile`):
```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built assets
COPY dist ./dist

# Expose port (Cloud Run uses PORT env var)
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
```

2. **Deploy**:
```bash
gcloud run deploy breakbuddy \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"
```

3. **Configure secrets** in Google Cloud Secret Manager:
```bash
echo -n "your-api-key" | gcloud secrets create gemini-api-key --data-file=-
```

## Health Check

**Endpoint:**
```
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "BreakBuddy server is running",
  "timestamp": "2026-08-21T06:00:00.000Z",
  "version": "1.0.0"
}
```

**Usage:**
- Cloud Run health check endpoint
- Uptime monitoring
- Load balancer health probe

## Logging

The server outputs structured logs to stdout:

- **Startup logs**: Environment configuration (no secrets)
- **Request logs**: `[http] METHOD /path STATUS duration_ms`
- **Error logs**: `[error] METHOD /path: error_message`
- **AI logs**: `[gemini] status_message`

**Security:**
- API keys never logged
- Stack traces only in development mode
- Generic error messages in production responses

## Monitoring

Key metrics to track:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Response time | > 2s | Check Gemini API latency |
| Error rate | > 5% | Review error logs |
| Rate limit hits | High | Consider increasing limit or adding per-user tracking |
| Memory usage | > 500MB | Investigate memory leaks |

## Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Check environment variables
node -e "console.log(process.env)"
```

### AI endpoint returns 503
- Verify `GEMINI_API_KEY` is set
- Check Gemini API quota/billing
- Review server startup logs for `[gemini]` messages

### Frontend shows blank page
- Verify `dist/` directory exists and contains files
- Check browser console for errors
- Verify static file serving in server.ts

### Rate limit too restrictive
Edit `src/server/routes/ai.ts`:
```typescript
rateLimiter(20, 60 * 1000)  // 20 requests per minute
```

## Performance Optimization

**Frontend:**
- ✅ Vite code splitting enabled
- ✅ Tree shaking in production build
- ✅ Minified CSS and JS
- ✅ Gzip compression via Express

**Backend:**
- ✅ Response caching headers (static assets)
- ✅ 10kb body size limit
- ⚠️ Consider adding response compression middleware for API

**Gemini API:**
- Temperature: 0.8 (balanced creativity)
- Max tokens: 400 (sufficient for wellness tips)
- Response format: JSON (faster parsing)

## Cost Estimation

**Cloud Run:**
- ~$0 for low traffic (always-free tier covers minimal usage)
- Scales to zero when not in use

**Gemini API:**
- Free tier: 15 requests/min, 1,500 requests/day
- Rate limit (10 req/min) stays within free tier
