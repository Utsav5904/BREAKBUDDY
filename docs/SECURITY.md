# BreakBuddy — Security

## Authentication
None. Single anonymous user app.

## Authorization
None. No roles or permissions.

## API Key Protection
- `GEMINI_API_KEY` is stored server-side only (environment variable)
- Never exposed to the client via any endpoint
- AI calls are proxied through Express server

## Input Validation
- AI endpoint validates `category` against allowed enum values
- `context` field is truncated to 200 characters
- `focusMinutes` is validated as a positive number (max 1440)
- All untrusted input is sanitized before passing to Gemini API

## Rate Limiting
- AI endpoint: 10 requests per minute per IP (in-memory)
- Prevents API abuse without requiring authentication

## Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0` (rely on CSP instead)
- `Referrer-Policy: strict-origin-when-cross-origin`

## CORS
- Production: same-origin (frontend served from same server)
- Development: `http://localhost:3000` allowed

## Environment Secrets
Never commit:
- `.env` files (except `.env.example`)
- `GEMINI_API_KEY`
- Any API keys or credentials

## Error Information Leakage
- Production errors never expose stack traces
- Gemini API errors are wrapped in generic messages
- Internal error details logged server-side only
