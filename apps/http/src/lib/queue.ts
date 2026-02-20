import { Queue } from "bullmq";
import Redis from "ioredis";
import { QUEUE_NAMES } from "@sandboox/shared-types";

export const connection = new Redis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

export const apkAnalysisQueue = new Queue(
    QUEUE_NAMES.APK_ANALYSIS,
    { connection }
);