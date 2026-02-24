import { createMiddleware } from "hono/factory";
import { auth } from "@sandboox/auth/server";
import { Variables } from "../types";

//createMiddleware is shortcut of factory.createMiddleware(). 
//This function helps create custom middleware
// @https://hono.dev/docs/helpers/factory

export const sessionMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {

    //check: session cookie in the header
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    //inject results into hono context
    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return await next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return await next();
});