# BreakBuddy — Validation

## Overview

Input validation is critical for security and data integrity. All untrusted input must be validated on the backend regardless of frontend validation.

---

## Validation Principles

### 1. Never Trust Client Input
Frontend validation is for UX only. Backend must validate independently.

### 2. Fail Early
Validate input before any business logic or database operations.

### 3. Consistent Error Responses
Return validation errors in a consistent format (see ERROR_HANDLING.md).

### 4. Whitelist, Don't Blacklist
Define what is allowed, rather than what is forbidden.

---

## API Validation Rules

### POST /api/v1/ai/wellness-tip

#### Request Body Schema

```typescript
{
  category?: string,
  focusMinutes?: number,
  context?: string
}
```

#### Validation Rules

**category** (optional)
- Type: string
- Allowed values: `'eyes'`, `'stretch'`, `'breathing'`, `'posture'`, `'general'`
- Default if omitted: `'general'`
- Error if invalid: `"category must be one of: eyes, stretch, breathing, posture, general"`

**focusMinutes** (optional)
- Type: number
- Range: 0 to 1440 (0 to 24 hours)
- Must be a valid number (not NaN, not Infinity)
- Error if invalid: `"focusMinutes must be a number between 0 and 1440"`

**context** (optional)
- Type: string
- Max length: 200 characters
- Automatically truncated (no error thrown)
- Used for AI prompt context

#### Validation Implementation

```typescript
const VALID_CATEGORIES = ['eyes', 'stretch', 'breathing', 'posture', 'general'] as const;

const errors: string[] = [];

if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
  errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
}

if (focusMinutes !== undefined) {
  if (typeof focusMinutes !== 'number' || focusMinutes < 0 || focusMinutes > 1440) {
    errors.push('focusMinutes must be a number between 0 and 1440');
  }
}

if (context !== undefined && typeof context !== 'string') {
  errors.push('context must be a string');
}

if (errors.length > 0) {
  throw new AppError('Validation failed', 422, 'VALIDATION_ERROR', errors);
}
```

---

## General Validation Patterns

### String Validation

**Required String:**
```typescript
if (!value || typeof value !== 'string' || value.trim().length === 0) {
  errors.push('field is required');
}
```

**Max Length:**
```typescript
if (value.length > maxLength) {
  errors.push(`field must not exceed ${maxLength} characters`);
}
```

**Enum Validation:**
```typescript
const ALLOWED_VALUES = ['value1', 'value2', 'value3'];
if (!ALLOWED_VALUES.includes(value)) {
  errors.push(`field must be one of: ${ALLOWED_VALUES.join(', ')}`);
}
```

### Number Validation

**Required Number:**
```typescript
if (typeof value !== 'number' || isNaN(value)) {
  errors.push('field must be a number');
}
```

**Range Validation:**
```typescript
if (value < min || value > max) {
  errors.push(`field must be between ${min} and ${max}`);
}
```

**Integer Validation:**
```typescript
if (!Number.isInteger(value)) {
  errors.push('field must be an integer');
}
```

### Type Validation

**Check Type:**
```typescript
if (typeof value !== expectedType) {
  errors.push(`field must be a ${expectedType}`);
}
```

---

## Sanitization

### String Sanitization

**Trim Whitespace:**
```typescript
const sanitized = value.trim();
```

**Truncate Length:**
```typescript
const sanitized = value.slice(0, maxLength);
```

**Remove HTML (if needed):**
```typescript
// Use a library like DOMPurify or strip-tags if HTML input is expected
```

### Number Sanitization

**Parse and Validate:**
```typescript
const parsed = parseInt(value, 10);
if (isNaN(parsed)) {
  // Invalid number
}
```

**Clamp to Range:**
```typescript
const clamped = Math.min(Math.max(value, min), max);
```

---

## Current Implementation Status

### Implemented ✅

**POST /api/v1/ai/wellness-tip**
- ✅ Category enum validation
- ✅ focusMinutes range validation
- ✅ context type validation
- ✅ context automatic truncation (200 chars)
- ✅ Consistent error response format

**GET /api/v1/health**
- No validation needed (no input)

**GET /api/v1/ai/status**
- No validation needed (no input)

---

## Validation Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    "category must be one of: eyes, stretch, breathing, posture, general",
    "focusMinutes must be a number between 0 and 1440"
  ]
}
```

**HTTP Status:** 422 Unprocessable Entity

---

## Security Considerations

### Injection Prevention

**SQL Injection:** N/A (no database)

**NoSQL Injection:** N/A (no database)

**Command Injection:**
- Never pass user input directly to shell commands
- Never use `eval()` or similar on user input

**XSS Prevention:**
- Response Content-Type is `application/json`
- No HTML rendering on backend
- Frontend should sanitize any rendered HTML

### Input Length Limits

**Body Size Limit:**
```typescript
app.use(express.json({ limit: '10kb' }));
```

This prevents large payload attacks.

### Type Coercion Attacks

**Use Strict Equality:**
```typescript
// Good
if (value === 'expected')

// Bad
if (value == 'expected')
```

**Validate Types:**
```typescript
if (typeof value !== 'number')
```

Don't rely on JavaScript automatic type coercion.

---

## Validation Best Practices

### 1. Validate Early
Validate input at the route/controller level before calling services.

### 2. Be Specific
Provide clear error messages that help developers debug issues.

### 3. Don't Leak Implementation Details
Error messages should not expose:
- Database structure
- Internal paths
- Technology stack details
- Server configuration

### 4. Consistent Error Format
All validation errors follow the same structure (see ERROR_HANDLING.md).

### 5. Test Validation
Write tests for:
- Valid input (should succeed)
- Invalid input (should fail with correct error)
- Boundary values (min/max)
- Type mismatches
- Missing required fields

---

## Future Validation Needs

If the application evolves to include:

**User Authentication:**
- Email format validation
- Password strength validation
- Username validation

**File Uploads:**
- File type validation
- File size limits
- Virus scanning

**Complex Business Rules:**
- Cross-field validation
- Conditional validation
- Database uniqueness checks

---

## Validation Tools

### Current Implementation
Custom validation logic in route handlers.

### Future Options (if needed)
- **Joi** - Schema validation library
- **Yup** - Schema validator
- **Zod** - TypeScript-first schema validation
- **class-validator** - Decorator-based validation (if using classes)

**Current Decision:** Keep validation simple and explicit. No validation library needed for current scope.

---

## Summary

**Current Validation Coverage:**
- ✅ All API endpoints validated
- ✅ Enum validation
- ✅ Range validation
- ✅ Type validation
- ✅ Length limits enforced
- ✅ Consistent error responses

**Security Posture:**
- ✅ No injection vulnerabilities
- ✅ Body size limits enforced
- ✅ Type checking prevents coercion attacks
- ✅ Input sanitization where needed

**Maintainability:**
- ✅ Explicit validation logic
- ✅ Clear error messages
- ✅ Documented validation rules
