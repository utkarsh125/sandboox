
//import the env-variables first
import 'dotenv/config';

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { auth } from "./lib/auth"

import {
    ApkStatus,
    type Apk,
    type ApkUploadResponse,
    type ApiErrorResponse
} from '@sandboox/shared-types';

console.log("ApkStatus: ", ApkStatus.UPLOADED);

//TODO: define what data is available in the context
type Variables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
}


//dotenv/config must be imported FIRST to load env variables
//Variables type tells TS what is available in the c.get() calls
//auth.$Infer provides type-safe session/user types from from better-auth


//init hono app instance
const app = new Hono<{ Variables: Variables }>();//Hono instance with typed context 


//logger middleware
//logs every incoming request to console
//'*' means "apply to all routes"
//runs BEFORE other middleware
app.use('*', logger()); //ex output: - -->POST /api/auth/sign-up/email 200 45ms


//cors config
app.use(

    '/api/auth/*',
    cors({
        origin: 'http://localhost:3000', //frontend url
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
)


//general cors for all other routes
app.use(
    '*',
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
)


//Why two CORS middlewares?
//1. Auth routes need stricter/specific headers
//2. Other routes use simpler CORS settings
//credentials: true - this allows cookeis to be sent

//key options:
//'origin' - which domain can access the API
//'allowHeaders' - allowed headers in requests
//'allowMethods' - allowed HTTP methods
//'exposeHeaders' - headers to expose in responses
//'maxAge' - how long browser caches preflight response



//session middleware
app.use('*', async (c, next) => {
    //on every request, check if there's a session cookie
    //extract user and session from better-auth
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    //if session-cookie not found, set user and session to null
    if (!session) {
        c.set('user', null);
        c.set('session', null);
        await next();
        return;
    }

    //if yes, set user and session in context with
    c.set('user', session.user);
    c.set('session', session.session);

    //continue to the next middleware/route
    await next();


    //every route can access 'c.get('user') and 'c.get('session')'
    //no need to manually check auth in each route
    //routes just check if user exists or not
})

//error handler
app.onError((err, c) => {
    console.error(err);
    return c.json({
        error: `ISE: ${err.message}`,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }, 500)
})


//better-auth routes
app.on(['POST', 'GET'],
    '/api/auth/*', //mount better-auth handler at /api/auth/*
    (c) => {
        return auth.handler(c.req.raw);
    }
    //this automatically creates all auth routes
    // /api/auth/sign-up/email
    // api/auth/sign-in/email
    // api/auth/sign-out
    // api/auth/session
)


//health check
app.get('/', (c) => {
    return c.json({
        message: "Sandboox API is running...",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV, //"development" | "production"
        port: process.env.PORT, //"3001"
    })
})

//get session info (protected)
app.get('/api/session', (c) => {
    const session = c.get('session');
    const user = c.get('user');

    //if user not found
    if (!user) {
        return c.body(null, 401);
    }

    return c.json({
        session,
        user
    })
})

//get current user (protected)
app.get('/api/me', (c) => {
    const user = c.get('user');

    //if user not found
    if (!user) {
        return c.json({
            error: "Unauthorized"
        }, 401);
    }

    return c.json({
        user
    });
})


const PORT = parseInt(process.env.PORT!); //make sure that the PORT is defined in .env

//start the server
serve({
    fetch: app.fetch,
    port: PORT,
})


//graceful shutdown
process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    process.exit(0);
})
