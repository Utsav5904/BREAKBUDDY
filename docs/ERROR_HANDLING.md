# BreakBuddy — Error Handling

## Standard API Error Format

All API errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_CODE",
  "errors": []
}
```

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body failed validation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 500 | Gemini API call failed |
| `SERVICE_UNAVAILABLE` | 503 | AI service not configured (no API key) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `NOT_FOUND` | 404 | Endpoint not found |

## Error Handling Strategy

1. **Route-level**: Validation errors returned immediately with 422
2. **Service-level**: Gemini errors caught and wrapped with context
3. **Global middleware**: Catches unhandled errors, logs internally, returns generic 500 to client
4. **No stack traces** in production responses
