export interface SemgrepFinding {
    ruleId: string;
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    filePath: string;
    lineStart: number;
    lineEnd: number;
    code: string;
    category: string;
    owaspCategory: string | null;
    cwe: string[];
}
export declare function runSemgrep(decompDir: string): SemgrepFinding[];
//# sourceMappingURL=semgrep.d.ts.map