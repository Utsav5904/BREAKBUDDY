# BreakBuddy — Database

## Overview

**Database Type:** None

**Rationale:** BreakBuddy is a single-user, client-side application. All user data is stored in browser `localStorage` for privacy and offline-first functionality.

---

## Data Storage Strategy

### Client-Side Storage (localStorage)

All application data is stored in the browser:

**User Settings:**
```javascript
{
  focusMinutes: number,
  breakMinutes: number,
  strictBreakMode: boolean,
  antiTamper: boolean,
  autoStartBreak: boolean,
  soundEnabled: boolean,
  hapticEnabled: boolean,
  ambientSoundEnabled: boolean,
  ambientVolume: number,
  darkMode: boolean,
  dailyGoalMinutes: number
}
```

**Session History:**
```javascript
[
  {
    id: string,
    type: 'focus' | 'break',
    duration: number,
    completedAt: timestamp,
    date: string
  }
]
```

**Daily Stats:**
```javascript
{
  [date: string]: {
    totalFocusMinutes: number,
    totalBreakMinutes: number,
    completedSessions: number
  }
}
```

---

## Why No Server-Side Database?

### Architecture Decision

**Decision:** DEC-002 (See DECISIONS.md)

**Reasons:**
1. **Privacy-First:** User wellness data never leaves their device
2. **Offline-First:** App works without internet connection
3. **Simplicity:** No user accounts, no authentication needed
4. **Cost:** Zero database hosting costs
5. **Performance:** Instant data access, no network latency
6. **Compliance:** No GDPR/data protection concerns (no server-side PII)

---

## Server-Side Data

The backend does NOT persist any user data. It only:

1. **In-Memory Rate Limiting State**
   - Tracked per IP address
   - Resets on server restart
   - No persistence required

2. **Request Logs** (Ephemeral)
   - Console output only
   - Not stored in database
   - Used for debugging and monitoring

---

## If Database Was Needed (Future)

If the product evolves to require server-side persistence, consider:

### Potential Use Cases
- User accounts for cross-device sync
- Global leaderboards
- Team/organization features
- Historical analytics aggregation
- AI tip personalization history

### Recommended Stack
```
PostgreSQL
+ Prisma ORM
+ UUID primary keys
+ Timestamps (created_at, updated_at)
+ Soft deletes where appropriate
```

### Potential Schema

**users** (if accounts added)
```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
name            VARCHAR(100)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

**sessions** (if cloud sync added)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
type            VARCHAR(10) -- 'focus' | 'break'
duration        INTEGER -- seconds
completed_at    TIMESTAMP
date            DATE
created_at      TIMESTAMP DEFAULT NOW()
```

**settings** (if cloud sync added)
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES users(id) UNIQUE
focus_minutes       INTEGER DEFAULT 25
break_minutes       INTEGER DEFAULT 5
strict_break_mode   BOOLEAN DEFAULT false
auto_start_break    BOOLEAN DEFAULT false
sound_enabled       BOOLEAN DEFAULT true
dark_mode           BOOLEAN DEFAULT false
daily_goal_minutes  INTEGER DEFAULT 300
updated_at          TIMESTAMP DEFAULT NOW()
```

### Indexes (if implemented)
```sql
CREATE INDEX idx_sessions_user_date ON sessions(user_id, date);
CREATE INDEX idx_sessions_completed_at ON sessions(completed_at);
CREATE INDEX idx_users_email ON users(email);
```

---

## Current Implementation

### localStorage Keys Used by Frontend

```javascript
// Settings
'breakbuddy_settings'

// Session history
'breakbuddy_sessions'

// Daily stats cache
'breakbuddy_daily_stats'
```

### Data Retention
- Managed entirely by the browser
- User can clear via browser settings
- No server-side data retention policy needed

---

## Migration Strategy (If Database Added)

If the product evolves to need a database:

1. **Maintain Backward Compatibility**
   - Keep localStorage as primary storage initially
   - Add optional cloud sync feature
   - Export/import functionality

2. **Migration Path**
   - Read from localStorage on first login
   - Upload to server (user confirmation)
   - Sync strategy (localStorage + server)
   - Eventually phase out localStorage if desired

3. **No Forced Migration**
   - Users who prefer offline-only can continue
   - Cloud sync as optional premium feature

---

## Conclusion

**Current State:** No database required or implemented.

**Backend Data:** Stateless except for ephemeral rate limiting.

**User Data:** 100% client-side in localStorage.

**Future:** Database can be added without breaking existing users if product evolves.
