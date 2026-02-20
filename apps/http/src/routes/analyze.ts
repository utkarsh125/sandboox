import { Hono } from "hono";
import { apkAnalysisQueue } from "../lib/queue";
import { prisma } from "@sandboox/db";
import { github } from "better-auth";

export const analyzeRoutes = new Hono();

analyzeRoutes.post("/analyze/github", async (c) => {
    const user = c.get("user");

    if (!user) {
        return c.json({
            error: "Unauthorized"
        }, 401)
    }

    const { githubUrl } = await c.req.json();

    if (!githubUrl) {
        return c.json({
            error: "githubUrl required"
        }, 400);
    }


    //create database record
    const apk = await prisma.apk.create({
        data: {
            userId: user.id,
            sourceUrl: githubUrl,
            status: "PENDING",
        }
    });


    //push job to queue
    await apkAnalysisQueue.add("analyze-apk", {
        apkId: apk.id,
        githubUrl,
    })

    return c.json({
        success: true,
        apkId: apk.id,
    })
})