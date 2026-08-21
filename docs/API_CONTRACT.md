# BreakBuddy — API Contract

## Base URL
```
/api/v1
```

---

## Health Check

```
GET /api/v1/health

Auth: Public
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "BreakBuddy server is running",
  "timestamp": "2026-08-21T06:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Generate AI Wellness Tip

```
POST /api/v1/ai/wellness-tip

Auth: Public (rate-limited)
Content-Type: application/json
```

**Request:**
```json
{
  "category": "eyes" | "stretch" | "breathing" | "posture" | "general",
  "focusMinutes": 120,
  "context": "I've been coding for 2 hours"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `category` | string | No | Exercise category filter. Defaults to `"general"` |
| `focusMinutes` | number | No | Current focus session length in minutes |
| `context` | string | No | Optional free-text user context (max 200 chars) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "title": "Palming for Digital Eye Fatigue",
    "tip": "Rub your palms together vigorously for 5 seconds, then gently cup them over your closed eyes. Breathe deeply for 30 seconds in total darkness. This soothes overworked photoreceptors and relieves ciliary muscle tension.",
    "category": "eyes",
    "durationSeconds": 30,
    "benefit": "Reduces eye strain and activates the parasympathetic nervous system"
  }
}
```

**Error Responses:**

422 Unprocessable Entity:
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": ["category must be one of: eyes, stretch, breathing, posture, general"]
}
```

429 Too Many Requests:
```json
{
  "success": false,
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "message": "Failed to generate wellness tip",
  "code": "AI_SERVICE_ERROR"
}
```

503 Service Unavailable:
```json
{
  "success": false,
  "message": "AI service is not configured",
  "code": "SERVICE_UNAVAILABLE"
}
```
