# BreakBuddy — Testing Strategy

## Overview

Testing strategy for the BreakBuddy backend focusing on critical functionality, security, and API contracts.

---

## Testing Philosophy

### What We Test
- **Critical business logic** - AI service integration
- **Security** - Rate limiting, input validation
- **API contracts** - Request/response formats
- **Error handling** - Consistent error responses
- **Integration points** - Gemini AI service

### What We Don't Over-Test
- **Trivial getters/setters** - Waste of test time
- **Third-party libraries** - Already tested
- **Framework internals** - Express is well-tested
- **Configuration parsing** - Simple validation

---

## Test Pyramid

```
        /\
       /  \     E2E Tests (Few)
      /----\    
     /      \   Integration Tests (Some)
    /--------\  
   /          \ Unit Tests (Many)
  /____________\
```

**Current Focus:**
- Unit tests for services
- Integration tests for API endpoints
- Minimal E2E (manual testing sufficient for now)

---

## Testing Stack

### Recommended Tools

**Test Framework:**
- Jest (Node.js standard)
- Mocha + Chai (alternative)

**HTTP Testing:**
- Supertest (for API testing)

**Mocking:**
- Jest built-in mocks
- Sinon (if needed)

**Current Status:** No automated tests implemented yet (manual testing performed)

---

## Test Structure

```
backend-server/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   └── geminiService.test.ts
│   │   └── middleware/
│   │       ├── errorHandler.test.ts
│   │       └── rateLimiter.test.ts
│   │
│   ├── integration/
│   │   └── routes/
│   │       ├── health.test.ts
│   │       └── ai.test.ts
│   │
│   └── fixtures/
│       └── sampleResponses.ts
```

---

## Unit Tests

### GeminiService Tests

**tests/unit/services/geminiService.test.ts**

```typescript
describe('GeminiService', () => {
  describe('isAvailable', () => {
    it('should return true when API key is configured', () => {
      // Mock env with API key
      // Assert isAvailable() returns true
    });

    it('should return false when API key is not configured', () => {
      // Mock env without API key
      // Assert isAvailable() returns false
    });
  });

  describe('generateWellnessTip', () => {
    it('should generate wellness tip with valid request', async () => {
      // Mock Gemini API response
      // Call generateWellnessTip
      // Assert returned tip structure
    });

    it('should validate response format', async () => {
      // Mock Gemini API with valid JSON
      // Assert response is validated and normalized
    });

    it('should handle malformed API responses', async () => {
      // Mock Gemini API with invalid JSON
      // Assert error is thrown
    });

    it('should truncate long responses', async () => {
      // Mock Gemini API with oversized responses
      // Assert fields are truncated to limits
    });
  });

  describe('buildPrompt', () => {
    it('should build prompt with all parameters', () => {
      // Test prompt includes category, focusMinutes, context
    });

    it('should build prompt with minimal parameters', () => {
      // Test prompt with only category
    });
  });
});
```

### Rate Limiter Tests

**tests/unit/middleware/rateLimiter.test.ts**

```typescript
describe('RateLimiter', () => {
  it('should allow requests under the limit', () => {
    // Make 9 requests
    // Assert all succeed
  });

  it('should block requests over the limit', () => {
    // Make 11 requests
    // Assert 11th returns 429
  });

  it('should reset after time window', async () => {
    // Make 10 requests
    // Wait for window to expire
    // Make another request
    // Assert it succeeds
  });

  it('should track IPs independently', () => {
    // Make requests from IP1
    // Make requests from IP2
    // Assert independent limits
  });
});
```

### Error Handler Tests

**tests/unit/middleware/errorHandler.test.ts**

```typescript
describe('ErrorHandler', () => {
  describe('AppError', () => {
    it('should return correct error format', () => {
      // Create AppError
      // Assert format matches API contract
    });

    it('should include errors array when provided', () => {
      // Create AppError with validation errors
      // Assert errors array is present
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle AppError correctly', () => {
      // Trigger AppError
      // Assert response matches expected format
    });

    it('should handle unexpected errors', () => {
      // Trigger generic Error
      // Assert generic 500 response
    });

    it('should not expose stack traces in production', () => {
      // Set NODE_ENV=production
      // Trigger error
      // Assert stack trace not in response
    });
  });
});
```

---

## Integration Tests

### Health Endpoint Tests

**tests/integration/routes/health.test.ts**

```typescript
describe('GET /api/v1/health', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app)
      .get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'BreakBuddy server is running',
      version: '1.0.0'
    });
    expect(response.body.timestamp).toBeDefined();
  });

  it('should include security headers', async () => {
    const response = await request(app)
      .get('/api/v1/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });
});
```

### AI Endpoint Tests

**tests/integration/routes/ai.test.ts**

```typescript
describe('GET /api/v1/ai/status', () => {
  it('should return AI availability status', async () => {
    const response = await request(app)
      .get('/api/v1/ai/status');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        available: expect.any(Boolean)
      }
    });
  });
});

describe('POST /api/v1/ai/wellness-tip', () => {
  describe('when AI service is unavailable', () => {
    it('should return 503', async () => {
      // Mock geminiService.isAvailable() to return false

      const response = await request(app)
        .post('/api/v1/ai/wellness-tip')
        .send({ category: 'eyes' });

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        success: false,
        code: 'SERVICE_UNAVAILABLE'
      });
    });
  });

  describe('validation', () => {
    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wellness-tip')
        .send({ category: 'invalid' });

      expect(response.status).toBe(422);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toContain(
        'category must be one of: eyes, stretch, breathing, posture, general'
      );
    });

    it('should reject out-of-range focusMinutes', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wellness-tip')
        .send({ focusMinutes: 2000 });

      expect(response.status).toBe(422);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid request', async () => {
      // Mock geminiService to return valid response

      const response = await request(app)
        .post('/api/v1/ai/wellness-tip')
        .send({
          category: 'eyes',
          focusMinutes: 60,
          context: 'Feeling eye strain'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: expect.any(String),
        tip: expect.any(String),
        category: expect.any(String),
        durationSeconds: expect.any(Number),
        benefit: expect.any(String)
      });
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limit', async () => {
      // Make 11 rapid requests
      const promises = Array(11).fill(null).map(() =>
        request(app)
          .post('/api/v1/ai/wellness-tip')
          .send({ category: 'eyes' })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

describe('Unknown routes', () => {
  it('should return 404 for unknown API routes', async () => {
    const response = await request(app)
      .get('/api/v1/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      code: 'NOT_FOUND'
    });
  });
});
```

---

## Manual Testing Checklist

### Before Each Release

#### Health Check
- [ ] GET /api/v1/health returns 200
- [ ] Response includes timestamp and version
- [ ] Security headers present

#### AI Status
- [ ] GET /api/v1/ai/status returns correct availability
- [ ] Works with and without API key configured

#### AI Wellness Tip
- [ ] Valid request returns 200 with wellness tip
- [ ] Invalid category returns 422
- [ ] Invalid focusMinutes returns 422
- [ ] Rate limiting triggers after 10 requests
- [ ] 503 returned when AI service unavailable
- [ ] Context field truncated to 200 chars

#### Error Handling
- [ ] Validation errors return 422 with errors array
- [ ] Unknown routes return 404
- [ ] Stack traces not exposed in production
- [ ] Consistent error format across all endpoints

#### Security
- [ ] Security headers on all responses
- [ ] CORS working in development mode
- [ ] Body size limit enforced (10kb)
- [ ] No secrets in logs
- [ ] No secrets in error responses

#### Performance
- [ ] Response times < 2s for AI endpoint
- [ ] Response times < 100ms for health/status
- [ ] Rate limiter cleanup not causing memory leaks

---

## Test Data / Fixtures

**tests/fixtures/sampleResponses.ts**

```typescript
export const validWellnessTip = {
  title: "Palming for Eye Relief",
  tip: "Rub your palms together...",
  category: "eyes",
  durationSeconds: 30,
  benefit: "Reduces eye strain"
};

export const invalidGeminiResponse = {
  // Missing required fields
  title: "Test"
};

export const validRequest = {
  category: "eyes",
  focusMinutes: 60,
  context: "Working for 2 hours"
};
```

---

## Running Tests

### Setup

```bash
cd backend-server
npm install --save-dev jest @types/jest supertest @types/supertest
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Run Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

---

## Coverage Goals

### Target Coverage

- **Critical paths:** 90%+
  - AI service integration
  - Rate limiting
  - Error handling
  - Validation

- **Non-critical paths:** 70%+
  - Logging
  - Configuration
  - Utilities

- **Not measured:**
  - Server bootstrap
  - Environment loading

### Current Coverage

**Status:** No automated tests implemented yet

**Manual Testing:** All critical paths verified manually

**Priority:** Add automated tests before significant feature additions

---

## Continuous Integration

### Recommended CI/CD Pipeline

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: cd backend-server && npm ci
      - run: cd backend-server && npm test
      - run: cd backend-server && npm run lint
```

---

## Future Testing Needs

### If Features Added

**User Authentication:**
- Login/logout tests
- Token validation tests
- Password hashing tests

**Database:**
- Repository tests
- Transaction tests
- Data integrity tests

**File Uploads:**
- Upload validation tests
- File size limit tests
- Malicious file detection tests

**Payment Integration:**
- Payment flow tests
- Webhook handling tests
- Refund tests

---

## Summary

**Current Testing Approach:**
- ✅ Manual testing of all critical paths
- ✅ Documented test scenarios
- ⏳ Automated tests not yet implemented

**Testing Priority:**
1. AI service integration tests
2. Rate limiting tests
3. Validation tests
4. Error handling tests
5. Security tests

**Recommendation:**
Add automated tests before next major feature addition or before production launch if traffic increases significantly.
