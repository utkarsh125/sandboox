//this file turns the FileRouter into a Hono-compatible sub-app

import { Hono } from "hono"
import { createRouteHandler } from "uploadthing/server"
import { ourFileRouter } from "../lib/uploadthing"

//createRouterHandler generates a standard reqeust -> response handler
const handler = createRouteHandler({
    router: ourFileRouter,
    config: {
        token: process.env.UPLOADTHING_TOKEN!,
    },
});

const uploadthingApp = new Hono();

//Hono's app.all captures GET (for info) and POST (for the upload singnal)
//c.req.raw is the standard Request object that Uploadthing expects
uploadthingApp.all('*', (c) => handler(c.req.raw));

export { uploadthingApp };