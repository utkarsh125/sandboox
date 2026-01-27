# How to Build a Hono Server with Better Auth

A complete step-by-step guide to recreating your production-ready Hono server with authentication.

---

## Table of Contents
1. [Understanding the Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Deep Dive into Each Component](#component-breakdown)
5. [Common Patterns](#common-patterns)
6. [Testing Your Server](#testing)

---

## Architecture

Your Hono server follows this structure:

```
┌─────────────────────────────────────────┐
│   Incoming HTTP Request                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  1. Logger Middleware                   │
│     (Logs all requests)                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. CORS Middleware                     │
│     (Handles cross-origin requests)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Session Middleware                  │
│     (Injects user/session into context) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Route Handler                       │
│     • Better Auth routes (/api/auth/*)  │
│     • Custom routes (/api/me, etc.)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Error Handler (if error occurs)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   HTTP Response                         │
└─────────────────────────────────────────┘
```

---

## Prerequisites

### Required Dependencies

```bash
pnpm add hono @hono/node-server better-auth dotenv
pnpm add -D tsx typescript @types/node
```

### File Structure

```
apps/http/
├── src/
│   ├── index.ts          # Main server file (what we're building)
│   └── lib/
│       └── auth.ts       # Better Auth configuration
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

---

## Step-by-Step Setup

### Step 1: Environment Setup

**Create `.env` file:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
PORT=3001
NODE_ENV=development

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3001"

# OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-secret"
```

---

### Step 2: Create the Auth Configuration

**File: `src/lib/auth.ts`**

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@your-workspace/db"; // Your Prisma client

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    trustedOrigins: ['http://localhost:3000'],
});
```

**What this does:**
- Configures Better Auth with Prisma database adapter
- Enables email/password authentication
- Sets up GitHub OAuth
- Defines trusted origins for CORS

---

### Step 3: Build the Server (Main File)

**File: `src/index.ts`**

Let's build it piece by piece:

#### Part 1: Imports and Type Definitions

```typescript
import 'dotenv/config'; // Load environment variables FIRST
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { auth } from './lib/auth';

// Define what data is available in the context
type Variables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};
```

**Why this matters:**
- `dotenv/config` must be imported FIRST to load env vars
- `Variables` type tells TypeScript what's available in `c.get()` calls
- `auth.$Infer` provides type-safe session/user types from Better Auth

#### Part 2: Initialize the App

```typescript
const app = new Hono<{ Variables: Variables }>();
```

**This creates a Hono instance with typed context.**

#### Part 3: Logger Middleware

```typescript
app.use('*', logger());
```

**What it does:**
- Logs every incoming request to console
- `'*'` means "apply to all routes"
- Runs BEFORE other middleware

**Example output:**
```
<-- POST /api/auth/sign-up/email
--> POST /api/auth/sign-up/email 200 45ms
```

#### Part 4: CORS Configuration

```typescript
// Specific CORS settings for auth routes
app.use(
    '/api/auth/*',
    cors({
        origin: 'http://localhost:3000',
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        //What OPTIONS means?
        //Browsers send an HTTP OPTIONS request before certain cross-origin requests
        //to check if the actual request is allowed - this is called CORS preflight.
        //This is a security measure to prevent cross-site request forgery (CSRF)
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
        credentials: true,
    })
);

// General CORS for all other routes
app.use(
    '*',
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);
```

**Why two CORS middlewares?**
- Auth routes need stricter/specific headers
- Other routes use simpler CORS settings
- `credentials: true` allows cookies to be sent

**Key Options:**
- `origin` - Which domain can access your API
- `credentials` - Allow cookies/auth headers
- `allowHeaders` - Which request headers are allowed
- `allowMethods` - Which HTTP methods are allowed

#### Part 5: Session Middleware (The Magic)

```typescript
app.use('*', async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        c.set('user', null);
        c.set('session', null);
        await next();
        return;
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
});
```

**What this does:**
1. On EVERY request, check if there's a session cookie
2. If yes, extract user and session data from Better Auth
3. Store them in the context with `c.set()`
4. Continue to the next middleware/route with `await next()`

**This means:**
- Every route can access `c.get('user')` and `c.get('session')`
- No need to manually check auth in each route
- Routes just check if user exists

#### Part 6: Error Handler

```typescript
app.onError((err, c) => {
    console.error('Error:', err);
    return c.json(
        {
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
        500
    );
});
```

**What it does:**
- Catches any unhandled errors
- Logs to console
- Returns JSON error response
- Shows stack trace ONLY in development

#### Part 7: Better Auth Routes

```typescript
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});
```

**What this does:**
- Mounts Better Auth handler at `/api/auth/*`
- Automatically creates all auth endpoints:
  - `/api/auth/sign-up/email`
  - `/api/auth/sign-in/email`
  - `/api/auth/sign-out`
  - `/api/auth/session`
  - etc.

#### Part 8: Custom Routes

```typescript
// Health check (public)
app.get('/', (c) => {
    return c.json({
        message: 'Sandboox API is running!',
        timestamp: new Date().toISOString(),
    });
});

// Get session info (protected)
app.get('/api/session', (c) => {
    const session = c.get('session');
    const user = c.get('user');

    if (!user) {
        return c.body(null, 401);
    }

    return c.json({ session, user });
});

// Get current user (protected)
app.get('/api/me', (c) => {
    const user = c.get('user');

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user });
});
```

**Pattern for protected routes:**
1. Get user from context: `c.get('user')`
2. Check if user exists
3. Return 401 if not authenticated
4. Return data if authenticated

#### Part 9: Start the Server

```typescript
const port = parseInt(process.env.PORT || '3001');

console.log(`Server starting on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
```

**This:**
- Reads port from env or defaults to 3001
- Starts the HTTP server
- Uses Hono's `fetch` handler

#### Part 10: Graceful Shutdown

```typescript
process.on('SIGINT', async () => {
    console.log('\nShutting the server down...');
    process.exit(0);
});
```

**What it does:**
- Listens for Ctrl+C
- Allows cleanup before exit
- Exits gracefully

---

## Component Breakdown

### 1. Understanding Middleware Order

**Order MATTERS! Middleware runs top to bottom:**

```typescript
app.use('*', logger());        // 1. Runs first
app.use('/api/auth/*', cors()); // 2. Runs for /api/auth/* only
app.use('*', cors());          // 3. Runs for all routes
app.use('*', sessionMiddleware); // 4. Runs last
```

**Think of it like layers:**
```
Request
  ↓
Logger → CORS → Session → Your Route → Response
```

### 2. Context (`c`) Object

The context object has these key methods:

```typescript
// Request data
c.req.raw          // Raw Request object
c.req.header()     // Get headers
c.req.query()      // Get query params
c.req.json()       // Parse JSON body
c.req.parseBody()  // Parse form data

// Response methods
c.json({ data })   // Send JSON response
c.text('text')     // Send text
c.html('<h1>')     // Send HTML
c.body(data, 200)  // Send raw response

// Context storage
c.set('key', value)  // Store in context
c.get('key')         // Retrieve from context
```

### 3. Better Auth Integration Points

**Three main integration points:**

1. **Auth Configuration** (`lib/auth.ts`)
   - Database adapter
   - Authentication methods
   - OAuth providers

2. **Route Handler** (in `index.ts`)
   ```typescript
   app.on(['POST', 'GET'], '/api/auth/*', (c) => {
       return auth.handler(c.req.raw);
   });
   ```

3. **Session Middleware** (in `index.ts`)
   ```typescript
   const session = await auth.api.getSession({
       headers: c.req.raw.headers,
   });
   ```

---

## Common Patterns

### Pattern 1: Creating a Protected Route

```typescript
app.get('/api/protected-data', (c) => {
    // 1. Get user from context
    const user = c.get('user');

    // 2. Check authentication
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    // 3. Your logic here
    const data = getProtectedData(user.id);

    // 4. Return response
    return c.json({ data });
});
```

### Pattern 2: Creating a Public Route

```typescript
app.get('/api/public-data', (c) => {
    // No auth check needed
    const data = getPublicData();
    return c.json({ data });
});
```

### Pattern 3: Route with Body Validation

```typescript
app.post('/api/create-item', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    // Parse and validate body
    const body = await c.req.json();
    
    if (!body.name || !body.description) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create item
    const item = await createItem({
        name: body.name,
        description: body.description,
        userId: user.id,
    });

    return c.json({ item }, 201);
});
```

### Pattern 4: Custom Middleware

```typescript
// Create reusable middleware
const requireAuth = async (c, next) => {
    const user = c.get('user');
    
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    
    await next();
};

// Use it
app.get('/api/admin', requireAuth, (c) => {
    // This only runs if user is authenticated
    return c.json({ message: 'Admin panel' });
});
```

### Pattern 5: Mounting Sub-Routes

```typescript
// Create a sub-app for related routes
const apiRoutes = new Hono();

apiRoutes.get('/users', (c) => { /* ... */ });
apiRoutes.get('/posts', (c) => { /* ... */ });
apiRoutes.get('/comments', (c) => { /* ... */ });

// Mount it
app.route('/api', apiRoutes);
```

---

## Testing Your Server

### 1. Start the Server

```bash
pnpm run dev
```

### 2. Test Health Check

```bash
curl http://localhost:3001/
```

### 3. Test Sign Up

```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### 4. Test Sign In

```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

### 5. Test Protected Route

```bash
curl http://localhost:3001/api/me \
  -b cookies.txt
```

---

## Key Concepts Explained

### Why `'dotenv/config'` First?

```typescript
import 'dotenv/config'; // MUST be first
import { auth } from './lib/auth'; // Uses process.env vars
```

If you import auth before dotenv, `process.env.DATABASE_URL` will be `undefined`.

### Why Type the Context?

```typescript
type Variables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();
```

**Without this:**
```typescript
const user = c.get('user'); // Type: any
```

**With this:**
```typescript
const user = c.get('user'); // Type: User | null
// TypeScript knows the shape of user!
user.email // ✅ Autocomplete works
```

### Why `await next()`?

```typescript
app.use('*', async (c, next) => {
    // Do something before route
    console.log('Before');
    
    await next(); // Pass control to next middleware/route
    
    // Do something after route
    console.log('After');
});
```

This allows you to run code both before AND after your routes execute.

### Why Multiple CORS Middlewares?

```typescript
app.use('/api/auth/*', cors({ /* specific settings */ }));
app.use('*', cors({ /* general settings */ }));
```

- First one matches `/api/auth/*` specifically
- Second one is a fallback for everything else
- More specific routes take precedence

---

## Complete Code Template

Here's the full template you can copy:

```typescript
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { auth } from './lib/auth';

type Variables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware
app.use('*', logger());

app.use('/api/auth/*', cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));

app.use('*', cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use('*', async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    c.set('user', session?.user || null);
    c.set('session', session?.session || null);
    
    await next();
});

// Error handler
app.onError((err, c) => {
    console.error('Error:', err);
    return c.json({
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }, 500);
});

// Better Auth
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

// Your routes here
app.get('/', (c) => {
    return c.json({ message: 'API is running!' });
});

app.get('/api/me', (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    return c.json({ user });
});

// Start server
const port = parseInt(process.env.PORT || '3001');
console.log(`Server starting on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    process.exit(0);
});
```

---

## Next Steps

1. **Add more routes** for your application logic
2. **Create route modules** to organize routes by feature
3. **Add validation** using libraries like Zod
4. **Implement rate limiting** for production
5. **Add request logging** to a file or service

---

## Resources

- [Hono Documentation](https://hono.dev/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**You now understand every line of your Hono server! 🎉**
