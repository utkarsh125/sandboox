import { Hono } from "hono";
import { prisma } from "@sandboox/db";
import type { Variables } from "../types";

export const reportRoutes = new Hono<{ Variables: Variables }>();

reportRoutes.get("/:projectId", async (c) => {


    //get the user
    const user = c.get("user");

    if (!user) {
        return c.json({
            error: "Unauthorized"
        }, 401);
    }

    //get the project
    const project = await prisma.project.findFirst({
        where: {
            id: c.req.param("projectId"),
            userId: user.id
        },
        include: {
            apk: {
                include: {
                    analysis: true
                }
            }
        }
    });

    if (!project) return c.json({
        error: "Project not found"
    }, 404);

    if (!project.apk) return c.json({
        error: "No APK"
    }, 404);

    if (!project.apk.analysis) {
        return c.json({
            error: "Analysis not completed",
            status: project.apk.status
        }, 404)
    }


    const analysis = project.apk.analysis;
    const vulns = (analysis.vulnerabilities as any[]) || [];
    const permissions = (analysis.permissions as any[]) || [];
    const manifest = (analysis.manifestData as any[]) || [];
    const deductions = (analysis.scoreBreakdown as any[]) || [];


    //Category breakdown for bar chart
    const categoryMap = new Map<string, number>();
    for (const v of vulns) {

        categoryMap.set(v.category || "General",
            (categoryMap.get(v.category || "General") || 0) + 1
        )
    }

    const categories = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return c.json({
        project: {
            id: project.id,
            name: project.name,
        },
        apk: {
            id: project.apk.id,
            fileName: project.apk.fileName,
            packageName: project.apk.packageName,
            versionName: project.apk.versionName,
            versionCode: project.apk.versionCode,
            status: project.apk.status
        },

        score: {
            value: analysis.securityScore,
            grade: analysis.grade,
            deductions
        },

        severitySummary: {
            critical: vulns.filter(v => v.severity === "ERROR").length,
            warning: vulns.filter(v => v.severity === "WARNING").length,
            info: vulns.filter(v => v.severity === "INFO").length,
            total: vulns.length
        },

        categories,
        vulnerabilities: vulns,
        permissions,
        permissionsSummary: {
            total: permissions.length,
            dangerous: permissions.filter((p: any) => p.risk === "dangerous").length,
            normal: permissions.filter((p: any) => p.risk === "normal").length,
            signature: permissions.filter((p: any) => p.risk === "signature").length,
        },

        manifest,
        completedAt: analysis.completedAt,
    })

})