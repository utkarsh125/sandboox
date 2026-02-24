"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
var bullmq_1 = require("bullmq");
var ioredis_1 = require("ioredis");
var shared_types_1 = require("@sandboox/shared-types");
var analyzeApk_1 = require("./processors/analyzeApk");
var connection = new ioredis_1.Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", { maxRetriesPerRequest: null });
exports.worker = new bullmq_1.Worker(shared_types_1.QUEUE_NAMES.APK_ANALYSIS, analyzeApk_1.analyzeProcessor, { connection: connection });
exports.worker.on("completed", function (job) {
    console.log("JOB ".concat(job.id, " COMPLETED"));
});
exports.worker.on("failed", function (job, err) {
    console.error("JOB ".concat(job === null || job === void 0 ? void 0 : job.id, " FAILED"), err);
});
