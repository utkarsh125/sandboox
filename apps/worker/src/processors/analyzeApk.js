import { Job } from "bullmq";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { prisma } from "@sandboox/db";
import { parseManifest } from "./manifest";
import { runSemgrep } from "./semgrep";
import { computeSecurityScore } from "./scoring";
const STORAGE = "/tmp/sandboox";
export async function analyzeProcessor(job) {
    const { apkId, githubUrl } = job.data;
    console.log("[WORKER]Processing APK: ", apkId);
    const dir = path.join(STORAGE, apkId);
    fs.mkdirSync(dir, {
        recursive: true
    });
    const apkPath = path.join(dir, "app.apk");
    try {
        //mark as processing
        await prisma.apk.update({
            where: {
                id: apkId,
            },
            data: {
                status: "PROCESSING"
            }
        });
        //download + decomplile 
        await download(githubUrl, apkPath);
        await runJadx(apkPath, dir);
        await runApktool(apkPath, dir);
        //parse manifest
        const manifest = await parseManifest(dir);
        console.log(`[WORKER]Package: ${manifest.packageName}, Permissions: ${manifest.permissions.length}`);
        //run semgrep
        const findings = runSemgrep(dir);
        console.log(`[WORKER] Found ${findings.length} issues`);
        //Score
        const scoreResult = computeSecurityScore(findings, manifest);
        console.log(`[WORKER]Score: ${scoreResult.totalScore}/100 (${scoreResult.grade})`);
        //store in db
        await prisma.analysis.create({
            data: {
                apkId,
                vulnerabilities: findings,
                permissions: manifest.permissions,
                manifestData: {
                    packageName: manifest.packageName,
                    versionName: manifest.versionName,
                    versionCode: manifest.versionCode,
                    minSdkVersion: manifest.minSdkVersion,
                    targetSdkVersion: manifest.targetSdkVersion,
                    exportedComponents: manifest.exportedComponents,
                    debuggable: manifest.debuggable,
                    allowBackup: manifest.allowBackup,
                    usesCleartextTraffic: manifest.usesCleartextTraffic,
                    networkSecurityConfig: manifest.networkSecurityConfig,
                },
                securityScore: scoreResult.totalScore,
                grade: scoreResult.grade,
                scoreBreakdown: scoreResult.deductions,
                decompiled: true,
                decompiledPath: dir,
                completedAt: new Date(),
            }
        });
        await prisma.apk.update({
            where: {
                id: apkId,
            },
            data: {
                status: "COMPLETED",
                packageName: manifest.packageName,
                versionName: manifest.versionName,
                versionCode: manifest.versionCode,
                minSdkVersion: manifest.minSdkVersion,
                targetSdkVersion: manifest.targetSdkVersion,
            }
        });
        console.log(`[WORKER] APK ${apkId} completed - SCORE: ${scoreResult.totalScore} (${scoreResult.grade})`);
        return {
            score: scoreResult.totalScore,
            grade: scoreResult.grade,
            findingsCount: findings.length
        };
    }
    catch (err) {
        console.error(`[WORKER]Failed for ${apkId}: `, err.message);
        try {
            await prisma.apk.update({
                where: {
                    id: apkId,
                },
                data: {
                    status: "FAILED"
                }
            });
            await prisma.analysis.upsert({
                where: { apkId },
                create: {
                    apkId,
                    errorMessage: err.message,
                    decompiled: false
                },
                update: {
                    errorMessage: err.message
                },
            });
        }
        catch (dbError) {
            console.error(`[WORKER]DB Error update failed: `, dbError);
        }
        throw err;
    }
}
//helper functions
async function download(url, output) {
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Download failed: ${res.status}`);
    const { Readable } = await import("stream");
    const nodeStream = Readable.fromWeb(res.body);
    const file = fs.createWriteStream(output);
    await new Promise((resolve, reject) => {
        nodeStream.pipe(file);
        file.on("finish", resolve);
        nodeStream.on("error", reject);
    });
}
function runJadx(apk, dir) {
    return new Promise((resolve, reject) => {
        const proc = spawn("jadx", [
            "-d",
            `${dir}/jadx`,
            apk
        ]);
        proc.on("close", resolve);
        proc.on("error", reject);
    });
}
function runApktool(apk, dir) {
    return new Promise((resolve, reject) => {
        const proc = spawn("apktool", [
            "d",
            apk,
            "-o",
            `${dir}/apktool`
        ]);
        proc.on("close", resolve);
        proc.on("error", reject);
    });
}
//# sourceMappingURL=analyzeApk.js.map