import z from "zod";
import { cuidSchema, paginationSchema, sortOrderSchema } from "./common";
import { ApkStatus } from "../enums";


//APK ID validation
export const apkIdSchema = cuidSchema;

//apk upload metadata (opt.)
export const apkUploadMetadataSchema = z.object({
    fileName: z.string().optional()
    //todo: add more metadata fields for validation
})

export type ApkUploadMetadata = z.infer<typeof apkUploadMetadataSchema>;

//apk list query parameters
export const apkListQuerySchema = paginationSchema.extend({
    status: z.enum(ApkStatus).optional(),
    sortBy: z.enum(['uploadedAt', 'fileName', 'fileSize']).default('uploadedAt'),
    order: sortOrderSchema,
    search: z.string().trim().optional(), // Search by filename
});

export type ApkListQuery = z.infer<typeof apkListQuerySchema>;

// Analysis configuration (when triggering analysis)
export const analysisConfigSchema = z.object({
    apkId: apkIdSchema,
    decompile: z.boolean().default(true),
    scanDepth: z.enum(['quick', 'standard', 'deep']).default('standard'),
    customRules: z.array(z.string()).optional(),
    //todo: Custom semgrep rule IDs
});

export type AnalysisConfig = z.infer<typeof analysisConfigSchema>;