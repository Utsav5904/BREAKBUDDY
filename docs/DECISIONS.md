# BreakBuddy — Architecture Decision Log

## DEC-001: Minimal Backend over Full REST API

**Decision:** Build a minimal Express server (static serving + Gemini AI proxy) instead of a full CRUD REST backend.

**Why:** The frontend is 100% client-side with all data in `localStorage`. There are zero API calls in the frontend. Building a full REST backend would require rewriting the entire frontend data layer with no PRD justification.

**Alternatives considered:**
- Full REST backend with database — rejected (requires rewriting frontend, no PRD support)
- No backend at all — rejected (Gemini API key needs server-side proxy, metadata.json lists `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`)

**Impact:** Backend scope is focused and small. Frontend changes are minimal (one new AI tip feature in TipsTab).

**Date:** 2026-08-21

---

## DEC-002: No Database

**Decision:** No database required. User data stays in browser `localStorage`.

**Why:** The app is a personal wellness tool for a single anonymous user. All data is session-local (timers, settings, break records). There is no multi-user, no authentication, and no data that needs server-side persistence.

**Alternatives considered:**
- SQLite for server-side session backup — rejected (adds complexity with no clear benefit for the product)
- MongoDB for user accounts — rejected (no authentication in the frontend)

**Impact:** Simpler deployment, no database provisioning needed.

**Date:** 2026-08-21

---

## DEC-003: Server-Side Gemini Proxy

**Decision:** Proxy Gemini API calls through the Express server rather than calling from the client.

**Why:** The `GEMINI_API_KEY` must never be exposed to the browser. Server-side proxy also enables rate limiting and input sanitization.

**Alternatives considered:**
- Client-side Gemini calls — rejected (exposes API key)

**Impact:** Requires `POST /api/v1/ai/wellness-tip` endpoint. Frontend makes one fetch call to this endpoint.

**Date:** 2026-08-21

---

## DEC-004: Rate Limiting on AI Endpoint

**Decision:** Apply in-memory rate limiting (10 requests per minute per IP) on the AI endpoint.

**Why:** Gemini API calls have cost implications. Rate limiting prevents abuse without requiring authentication.

**Alternatives considered:**
- No rate limiting — rejected (API abuse risk)
- Redis-based rate limiting — rejected (over-engineered for this app)

**Impact:** Simple in-memory counter. Resets on server restart (acceptable for this scale).

**Date:** 2026-08-21

---

## DEC-005: Graceful AI Degradation

**Decision:** The AI wellness tip feature is optional. If `GEMINI_API_KEY` is not set, the endpoint returns `503 Service Unavailable` and the frontend falls back to its existing static exercises.

**Why:** The app must function fully offline and without AI. The AI feature is an enhancement.

**Impact:** Frontend shows/hides the AI button based on availability.

**Date:** 2026-08-21
