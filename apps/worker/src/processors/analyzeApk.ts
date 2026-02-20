import { Job } from "bullmq";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const STORAGE = "/tmp/sandboox";

export async function analyzeProcessor(job: Job) {

    const { apkId, githubUrl } = job.data;

    console.log("Processing APK: ", apkId);

    const dir = path.join(STORAGE, apkId);

    fs.mkdirSync(dir, {
        recursive: true
    });


    const apkPath = path.join(dir, "app.apk");

    await download(githubUrl, apkPath);
    await runJadx(apkPath, dir);
    await runApktool(apkPath, dir);
    return true;
}

async function download(url: string, output: string) {

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

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

        const proc = spawn("jadx", [
            "-d",
            `${dir}/jadx`,
            apk
        ]);

        proc.on("close", resolve);
        proc.on("error", reject);

    });
}

function runApktool(apk: string, dir: string) {

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