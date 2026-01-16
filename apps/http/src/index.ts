import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { auth } from './lib/auth';

// Type the context to include user and session
type Variables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware - Order matters!
app.use('*', logger());

// CORS - More specific for auth routes
app.use(
    '/api/auth/*',
    cors({
        origin: 'http://localhost:3000', // Your frontend URL
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
        credentials: true,
    })
);

// CORS for other routes
app.use(
    '*',
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

// Session middleware - Adds user/session to context on every request
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

// Global error handler
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

// Better Auth handler - Note: single asterisk (*)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

// Routes
app.get('/', (c) => {
    return c.json({
        message: 'Sandboox API is running!',
        timestamp: new Date().toISOString(),
    });
});

// Example: Access session from context
app.get('/api/session', (c) => {
    const session = c.get('session');
    const user = c.get('user');

    if (!user) {
        return c.body(null, 401);
    }

    return c.json({ session, user });
});

// Example: Protected route
app.get('/api/me', (c) => {
    const user = c.get('user');

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user });
});

const port = parseInt(process.env.PORT || '3001');

console.log(`Server starting on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting the server down...');
    process.exit(0);
});