import { createRouteHandler } from "uploadthing/server";
import { ourFileRouter } from "../lib/uploadthing";
import type { Context } from "hono";

// Create the single route handler (handles both POST and GET automatically)
const uploadthingHandler = createRouteHandler({
    router: ourFileRouter,
    config: {
        token: process.env.UPLOADTHING_TOKEN,
    },
});

// Wrap for Hono - single handler for both methods
export const uploadthingHandlers = {
    POST: async (c: Context) => {
        const response = await uploadthingHandler(c.req.raw);
        return response;
    },
    GET: async (c: Context) => {
        const response = await uploadthingHandler(c.req.raw);
        return response;
    },
};
