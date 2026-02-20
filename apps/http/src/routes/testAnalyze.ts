import { Hono } from "hono";
import { apkAnalysisQueue } from "../lib/queue";
import { prisma } from "@sandboox/db";

export const testAnalyzeRoutes = new Hono();

/**
 * POST /test/analyze
 * Quick test endpoint to enqueue an APK analysis job without auth.
 * Body: { "githubUrl": "https://..." }
 */
testAnalyzeRoutes.post("/test/analyze", async (c) => {
    const { githubUrl } = await c.req.json();

    if (!githubUrl) {
        return c.json({
            error: "githubUrl is required",
        }, 400);
    }

    // Ensure a test user exists (FK constraint requires a valid userId)
    const testUser = await prisma.user.upsert({
        where: { email: "test@sandboox.dev" },
        update: {},
        create: {
            email: "test@sandboox.dev",
            name: "Test User",
        },
    });

    // Create a test APK record (no auth required)
    const apk = await prisma.apk.create({
        data: {
            userId: testUser.id,
            sourceUrl: githubUrl,
            status: "PENDING",
        },
    });

    // Push job to queue
    await apkAnalysisQueue.add("analyze-apk", {
        apkId: apk.id,
        githubUrl,
    });

    return c.json({
        success: true,
        apkId: apk.id,
        message: "Job enqueued. Check worker logs for progress.",
    });
});
