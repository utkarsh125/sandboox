import { prisma } from "@sandboox/db";
import { Hono } from "hono";
import { Variables } from "../types";
import { apkAnalysisQueue } from "../lib/queue";
import { validateGithubApkUrl } from "../lib/github";
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

    if (sourceUrl) {
        const validation = await validateGithubApkUrl(sourceUrl);
        if (!validation.valid) {
            return c.json({
                error: validation.error
            }, 400)
        }
    }

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
                status: "READY" //as the github url is already validated
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

    console.log("Project ROUTES HIT!");


    const user = c.get("user");

    //the user is not being hit since the log is NULL;
    console.log("USER:", user);


    if (!user) return c.json({
        error: "Unauthorized"
    }, 401)

    const projects = await prisma.project.findMany({
        where: {
            userId: user.id
        },
        include: {
            apk: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    console.log(projects);
    return c.json({ projects });

})

//Rename a project
projectRoutes.patch("/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const projectId = c.req.param("id");
    const { name } = await c.req.json();

    if (!name) return c.json({ error: "Name is required" }, 400);

    const existingProject = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!existingProject || existingProject.userId !== user.id) {
        return c.json({ error: "Not found" }, 404);
    }

    const project = await prisma.project.update({
        where: { id: projectId },
        data: { name }
    });

    return c.json({ success: true, project });
});

//Delete a project
projectRoutes.delete("/:id", async (c) => {

    console.log("DELETE EP HIT!");


    const user = c.get("user");
    // console.log("SANITY CHECK FOR DA USER!------: ", user);

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const projectId = c.req.param("id");
    // console.log("PROJECT ID: ", projectId);

    const existingProject = await prisma.project.findUnique({
        where: { id: projectId }
    });
    // console.log("EXISTING PROJECT DETECTED: ", existingProject);

    if (!existingProject || existingProject.userId !== user.id) {
        return c.json({ error: "Not found" }, 404);
    }

    await prisma.project.delete({
        where: { id: projectId }
    });

    return c.json({ success: true });
});

//Start analysis for a project's APK
projectRoutes.post("/:id/start", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const projectId = c.req.param("id");

    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
        include: { apk: true }
    });

    if (!project || !project.apk) {
        return c.json({ error: "Project or associated APK not found" }, 404);
    }

    if (project.apk.status === "COMPLETED" || project.apk.status === "PROCESSING") {
        return c.json({ error: "Analysis already completed or in progress" }, 400);
    }

    // Update status to PENDING
    const updatedApk = await prisma.apk.update({
        where: { id: project.apk.id },
        data: { status: "PENDING" }
    });

    // Enqueue the job
    await apkAnalysisQueue.add("analyze-apk", {
        apkId: project.apk.id,
        githubUrl: project.apk.sourceUrl || ""
    });

    return c.json({ success: true, message: "Analysis started", apk: updatedApk });
});

