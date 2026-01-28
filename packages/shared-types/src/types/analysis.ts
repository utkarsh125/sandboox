
//vulnerability severity lvls
export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type PermissionProtectionLevel = 'normal' | 'dangerous' | 'signature' | 'signatureOrSystem';

//individual vulnerability
export type Vulnerabiltity = {
    id: string;
    severity: VulnerabilitySeverity;
    title: string;
    description: string;
    location: {
        file: string;
        line?: number;
        column?: number;
    }
    cwe?: string //CWE identifier 
    recommendation?: string;
}

//android permission
export type Permission = {
    name: string;
    protectionLevel: PermissionProtectionLevel;
    description?: string;
}

//analysis result
export type AnalysisResult = {
    id: string;
    apkId: string;
    vulnerabilities: Vulnerabiltity[];
    permissions: Permission[];
    securityScore: number | null;
    decompiled: boolean;
    decompiledPath: string | null;
    manifestData: Record<string, any> | null; //parsed AndroidManifest.xml
    startedAt: string;
    completedAt: string | null;
    errorMessage: string | null;
}