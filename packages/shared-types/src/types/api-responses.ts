import type { User, Session } from "./user";
import type { Apk } from "./apk";
import type { AnalysisResult } from "./analysis";

//auth responses
//----
//GET /api/session
export type GetSessionResponse = {
    session: Session | null;
    user: User | null;
}

//GET /api/me
export type MeResponse = {
    user: User;
}

//APK responses
//----
//POST /api/apk/upload
export type ApkUploadResponse = {
    apk: Apk;
    success: boolean;
}

//GET /api/apk/:id
export type GetApkResponse = {
    apk: Apk & {
        analysis: AnalysisResult | null;
    }
}

//GET /api/apk/me
export type GetMyApksResponse = {
    apks: Apk[];
}

//DELETE /api/apk/:id
export type DeleteApkResponse = {
    success: boolean;
}

//analysis responses
//----
//GET /api/apk/:id/results
export type AnalysisResultResponse = {
    analysis: AnalysisResult;
    apk: Pick<Apk, "id" | "fileName" | "packageName">;
}

//GET /api/apk/:/id/status
export type AnalysisStatusResponse = {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
}


//error responses
//----


//standard API error
export type ApiErrorResponse = {
    error: string;
    statusCode?: number;
    details?: Record<string, any>;
}

//validation error detail
export type ValidationError = {
    field: string;
    message: string;
}

//validation error response (from zod)
export type ValidationErrorResponse = {
    error: string;
    validationErrors: ValidationError[];
}

//utility response types
//----

//paginated list wrapper
export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}

//generic success response
export type SuccessResponse<T = void> = {
    success: true;
    data?: T;
    message?: string;
}