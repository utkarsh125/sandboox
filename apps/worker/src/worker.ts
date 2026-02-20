import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { QUEUE_NAMES } from "@sandboox/shared-types";
import { analyzeProcessor } from "./processors/analyzeApk";

const connection = new Redis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379",
    { maxRetriesPerRequest: null }
);

export const worker = new Worker(
    QUEUE_NAMES.APK_ANALYSIS,
    analyzeProcessor,
    { connection }
);

worker.on("completed", (job) => {
    console.log(`JOB ${job.id} COMPLETED`);
});

worker.on("failed", (job, err) => {
    console.error(`JOB ${job?.id} FAILED`, err);
})
