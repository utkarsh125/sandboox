import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";


const app = new Hono();

//middleware
app.use('*', logger());
app.use('*', cors({
    origin: ['http://localhost:3000'], //frontend url
    credentials: true,
}))

//global error handler
app.onError((err, ctx) => {
    console.error(`Error: ${err}`);
    return ctx.json({
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, 500);
});

