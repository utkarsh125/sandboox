// apps/http/src/index.ts

// import the env-variables first
import 'dotenv/config';

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { Variables } from './types';

// Modular Imports
import { authRoutes } from "./routes/auth";
import { analyzeRoutes } from "./routes/analyze";
import { sessionMiddleware } from "./middleware/auth";
import { projectRoutes } from "./routes/projects";

// init hono app instance with typed context
const app = new Hono<{ Variables: Variables }>();

// logger middleware - logs every incoming request to console
app.use('*', logger());

// cors config — MUST come before session middleware
// so that preflight requests succeed and cookies are sent cross-origin
app.use(
    '*',
    cors({
        origin: 'http://localhost:3000', // frontend url
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        credentials: true,
    })
)

// Session middleware - checks for a session on every request
// Sets 'user' and 'session' in the Hono context
app.use('*', sessionMiddleware);

// error handler
app.onError((err, c) => {
    console.error(err);
    return c.json({
        error: `ISE: ${err.message}`,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }, 500)
})

// --- ROUTES ---

// Auth Routes (sign-in, sign-up, session, /me)
// Mounted at /api/auth
app.route("/api/auth", authRoutes);

// Analyze Routes (APK processing logic)
// Mounted at /api/analyze
app.route("/api/analyze", analyzeRoutes);

//Project Routes (create, list)
//mounted at /api/projects
app.route("/api/projects", projectRoutes);

// health check
app.get('/', (c) => {
    return c.json({
        message: "Sandboox API is running...",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
    })
})

const PORT = parseInt(process.env.PORT || "3001");

// start the server
serve({
    fetch: app.fetch,
    port: PORT,
})

// graceful shutdown
process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    process.exit(0);
})
