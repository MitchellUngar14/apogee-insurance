# Centralized Authentication Implementation Plan

## Overview

This document outlines the plan for implementing centralized authentication with role-based access control for the Apogee Insurance platform.

**Authentication Provider:** NextAuth.js
**Portal Location:** Root app (apogee-insurance.vercel.app)
**Session Strategy:** JWT (for cross-domain support)

## User Roles

| Role | Access |
|------|--------|
| Quoting | Quoting Service only |
| CustomerService | Customer Service only |
| BenefitDesigner | Benefit Designer only |
| Admin | All services |

## Live Deployments

| Service | URL |
|---------|-----|
| Portal (Login) | https://apogee-insurance.vercel.app |
| Quoting Service | https://apogee-insurance-quoting.vercel.app |
| Customer Service | https://apogee-insurance-customer-service.vercel.app |
| Benefit Designer | https://apogee-insurance-benefit-designer.vercel.app |

---

## Authentication Flow

```
User visits Portal
       │
       ▼
┌─────────────────┐
│  Authenticated? │
└────────┬────────┘
         │
    No   │   Yes
    ▼    │    ▼
┌────────┴────────┐
│  Login Page     │    ┌─────────────────────┐
│  /auth/signin   │───▶│  IntroHome          │
└─────────────────┘    │  (filtered by role) │
                       └──────────┬──────────┘
                                  │
                        Click Service Card
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Generate JWT Token  │
                       │ (15 min expiry)     │
                       └──────────┬──────────┘
                                  │
                       Redirect with ?token=xxx
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Service Middleware  │
                       │ - Verify JWT        │
                       │ - Check role        │
                       │ - Store in cookie   │
                       └──────────┬──────────┘
                                  │
                          Valid   │   Invalid
                            ▼     │      ▼
                       ┌──────────┴──────────┐
                       │  Service App        │  /unauthorized
                       └─────────────────────┘
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(256) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Roles Table
```sql
CREATE TYPE user_role AS ENUM ('Quoting', 'CustomerService', 'BenefitDesigner', 'Admin');

CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

### Root App (.env.local)
```env
# Existing
DATABASE_URL=...

# New - Auth
AUTH_SECRET=<generate: openssl rand -base64 32>
JWT_SECRET=<generate: openssl rand -base64 32>
NEXTAUTH_URL=https://apogee-insurance.vercel.app
```

### Each Service (.env.local)
```env
# Existing
DATABASE_URL=...

# New - Auth
JWT_SECRET=<same as root app - must match!>
PORTAL_URL=https://apogee-insurance.vercel.app
```

---

## File Structure (New/Modified)

### Root App
```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts    # NEW - NextAuth handler
│   │       └── service-token/route.ts    # NEW - Token generation
│   ├── auth/
│   │   └── signin/page.tsx               # NEW - Login page
│   ├── layout.tsx                        # MODIFY - Add SessionProvider
│   └── page.tsx                          # MODIFY - Get session, pass to IntroHome
├── components/
│   ├── IntroHome.tsx                     # MODIFY - Filter cards by role
│   └── DynamicHeader.tsx                 # MODIFY - Show user, logout button
├── lib/
│   ├── auth.ts                           # NEW - NextAuth config
│   ├── db/
│   │   └── auth.ts                       # NEW - Auth DB connection
│   └── schema/
│       └── auth.ts                       # NEW - Users/roles schema
└── middleware.ts                         # NEW - Route protection
```

### Shared Package
```
packages/shared/src/
├── types/
│   └── auth.ts                           # NEW - UserRole, ServiceToken types
├── utils/
│   └── jwt.ts                            # NEW - Token verification
└── index.ts                              # MODIFY - Export auth types/utils
```

### Each Service Package
```
packages/[service]/src/
├── app/
│   └── unauthorized/page.tsx             # NEW - Access denied page
└── middleware.ts                         # NEW - Token validation
```

---

## Implementation Phases

### Phase 1: Foundation
1. Install dependencies (next-auth, bcryptjs, jose)
2. Create auth database schema
3. Run database migration
4. Configure NextAuth

### Phase 2: Login UI
5. Create login page
6. Update layout with SessionProvider
7. Add middleware for route protection
8. Update header with user info/logout

### Phase 3: Service Tokens
9. Add shared auth types
10. Add JWT utilities to shared package
11. Create service token API
12. Update IntroHome to filter and redirect

### Phase 4: Service Integration
13. Add middleware to each service
14. Create unauthorized pages
15. Test cross-domain flow

### Phase 5: Admin Features (Future)
16. User management UI
17. Role assignment UI
18. Audit logging

---

## Security Considerations

- **JWT Expiry:** Service tokens expire in 15 minutes
- **Cookie Security:** httpOnly, secure, sameSite: 'lax'
- **Shared Secret:** JWT_SECRET must be identical across all services
- **Password Hashing:** bcryptjs with salt rounds
- **Token in URL:** Immediately stored in cookie and removed from URL
- **Rate Limiting:** Consider adding to login endpoint

---

## Dependencies to Add

### Root package.json
```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "@auth/drizzle-adapter": "^1.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

### Shared package.json
```json
{
  "dependencies": {
    "jose": "^5.2.0"
  }
}
```

---

## Service Role Mapping

```typescript
export const SERVICE_ROLE_MAP: Record<string, UserRole[]> = {
  'quoting': ['Quoting', 'Admin'],
  'customer-service': ['CustomerService', 'Admin'],
  'benefit-designer': ['BenefitDesigner', 'Admin'],
};
```

---

## References

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Drizzle ORM Adapter](https://authjs.dev/reference/adapter/drizzle)
- [Jose JWT Library](https://github.com/panva/jose)
