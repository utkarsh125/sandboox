export interface PermissionInfo {
    name: string;
    shortName: string;
    risk: "dangerous" | "normal" | "signature";
}
export interface ExportedComponent {
    name: string;
    type: "activity" | "service" | "receiver" | "provider";
    intentFilters: number;
}
export interface ManifestData {
    packageName: string | null;
    versionName: string | null;
    versionCode: number | null;
    minSdkVersion: number | null;
    targetSdkVersion: number | null;
    permissions: PermissionInfo[];
    exportedComponents: ExportedComponent[];
    debuggable: boolean;
    allowBackup: boolean;
    usesCleartextTraffic: boolean;
    networkSecurityConfig: boolean;
}
export declare function parseManifest(decompDir: string): Promise<ManifestData>;
//# sourceMappingURL=manifest.d.ts.map