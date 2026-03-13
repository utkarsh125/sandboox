import { Job } from "bullmq";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { prisma } from "@sandboox/db";
import { parseManifest } from "./manifest";
import { runSemgrep } from "./semgrep";
import { computeSecurityScore } from "./scoring";

const STORAGE = "/tmp/sandboox";

export async function analyzeProcessor(job: Job) {

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
    console.log(`[WORKER] Score Breakdown: ${JSON.stringify(scoreResult.deductions)}`);
    console.log(`[WORKER] Findings: ${JSON.stringify(findings)}`)
    console.log(`[WORKER] Manifest: ${JSON.stringify(manifest)}`);
    //store in db
    await prisma.analysis.create({
      data: {
        apkId,
        vulnerabilities: findings as any,
        permissions: manifest.permissions as any,
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
        } as any,
        securityScore: scoreResult.totalScore,
        grade: scoreResult.grade,
        scoreBreakdown: scoreResult.deductions as any,
        decompiled: true,
        decompiledPath: dir,
        completedAt: new Date(),
      }
    })


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
    }
  } catch (err: any) {

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
    } catch (dbError) {
      console.error(`[WORKER]DB Error update failed: `, dbError);
    }
    throw err;
  }
}


//helper functions
async function download(url: string, output: string) {

  let finalUrl = url;
  // Convert standard github blob URL to raw URL so we get the APK binary, not the HTML page
  // Example: https://github.com/user/repo/blob/master/app.apk -> https://github.com/user/repo/raw/master/app.apk
  if (finalUrl.includes("github.com") && finalUrl.includes("/blob/")) {
    finalUrl = finalUrl.replace("/blob/", "/raw/");
  } else if (finalUrl.includes("github.com") && !finalUrl.includes("/raw/") && !finalUrl.includes("raw.githubusercontent.com")) {
      // Just in case it's a direct link to a file without blob but not raw
      finalUrl = finalUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }

  const res = await fetch(finalUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed: ${res.status} for ${finalUrl}`);

  const { Readable } = await import("stream");
  const nodeStream = Readable.fromWeb(res.body! as any);
  const file = fs.createWriteStream(output);

  await new Promise<void>((resolve, reject) => {
    nodeStream.pipe(file);
    file.on("finish", resolve);
    nodeStream.on("error", reject);
  });
}

function runJadx(apk: string, dir: string) {
  return new Promise((resolve, reject) => {
    const proc = spawn("jadx", ["-d", `${dir}/jadx`, apk]);

    proc.on("close", (code) => {
      // jadx exit codes: 0 (success), 3 (errors in some classes), 4 (warnings)
      if (code === 0 || code === 3 || code === 4) resolve(true);
      else reject(new Error(`jadx exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

function runApktool(apk: string, dir: string) {
  return new Promise((resolve, reject) => {
    const proc = spawn("apktool", ["d", apk, "-o", `${dir}/apktool`, "-f"]);

    proc.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`apktool exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}