import { ApkStatus } from "../enums/apk-status";

//APK model 
export type Apk = {
    id: string;
    fileName: string;
    fileSize: number;
    packageName: string | null;
    versionName: string | null;
    versionCode: number | null;
    minSdkVersion: number | null;
    targetSdkVersion: number | null;
    uploadedAt: string; // ISO date string
    status: ApkStatus;
};