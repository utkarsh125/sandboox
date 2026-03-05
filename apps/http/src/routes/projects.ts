import { prisma } from "@sandboox/db";
import { Hono } from "hono";
import { Variables } from "../types";

export const projectRoutes = new Hono<{ Variables: Variables }>();

//create a project
projectRoutes.post("/", async (c) => {

    const user = c.get("user");

    //user exists?
    if (!user) {
        return c.json({
            error: "Unauthorized"
        }, 401)
    }

    const { name, description, testType, sourceUrl, fileName } = await c.req.json();

    if (!name) {
        return c.json({
            error: "Name is required",
        }, 400)
    };

    const project = await prisma.project.create({
        data: {
            name,
            description: description || null,
            testType: testType || "APK",
            userId: user.id
        }
    })

    // If sourceUrl is provided, create an Apk record
    if (sourceUrl) {
        await prisma.apk.create({
            data: {
                userId: user.id,
                projectId: project.id,
                sourceUrl: sourceUrl,
                fileName: fileName || null,
                status: sourceUrl.includes("github.com") ? "READY" : "UPLOADED"
            }
        })
    }

    return c.json({
        success: true,
        project
    });
})

//List user's projects
projectRoutes.get("/", async (c) => {

    const user = c.get("user");
    if (!user) return c.json({
        error: "Unauthorized"
    }, 401)

    const projects = await prisma.project.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: "desc"
        }
    });


    return c.json({ projects });

})

