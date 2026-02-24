import { auth } from "@sandboox/auth/server";
import { Hono } from "hono";
import { Variables } from "../types";

//auth routes, this is where all auth related logic is 
export const authRoutes = new Hono<{ Variables: Variables }>();

//1.BetterAuth Internal Routes (sign-in, sign-up, etc.)
//When a request hits /api/auth/sign-in, it comes here
authRoutes.on(["POST", "GET"], "*", (c) => {
    return auth.handler(c.req.raw);
})

//2. Custom "who-am-i" route 
authRoutes.get("/me", (c) => {
    const user = c.get("user");

    if (!user) return c.json({
        error: "Unauthorized"
    }, 401);

    return c.json({
        user
    })
})