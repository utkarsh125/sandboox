
//import the env-variables first
import 'dotenv/config';

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { auth } from "./lib/auth"


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
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    if (!session) {
        c.set('user', null);
        c.set('session', null);
        await next();
        return;
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
})