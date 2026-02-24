import { Hono } from "hono";
import { apkAnalysisQueue } from "../lib/queue";
import { prisma } from "@sandboox/db";
import { Variables } from "../types";

export const analyzeRoutes = new Hono<{ Variables: Variables }>();

// This POST request now knows exactly WHO is uploading
analyzeRoutes.post("/github", async (c) => {
    const user = c.get("user"); // This comes from sessionMiddleware!

    if (!user) {
        return c.json({ error: "Unauthorized. Please log in first." }, 401);
    }

    const { githubUrl } = await c.req.json();

    if (!githubUrl) {
        return c.json({ error: "githubUrl is required" }, 400);
    }

    // 1. Save the APK record to the DB, linked to the User ID
    const apk = await prisma.apk.create({
        data: {
            userId: user.id, // THE GLUE: Link this upload to the current user
            sourceUrl: githubUrl,
            status: "PENDING",
        },
    });

    // 2. Send only the ID and URL to the Worker
    // The worker doesn't need to know about "users", it only cares about "apk-id"
    await apkAnalysisQueue.add("analyze-apk", {
        apkId: apk.id,
        githubUrl,
    });

    return c.json({
        success: true,
        message: "Analysis queued successfully",
        apkId: apk.id,
    });
});
