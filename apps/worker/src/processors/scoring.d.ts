import type { ManifestData } from "./manifest";
import type { SemgrepFinding } from "./semgrep";
export interface ScoreBreakdown {
    totalScore: number;
    grade: string;
    deductions: ScoreDeduction[];
}
export interface ScoreDeduction {
    reason: string;
    points: number;
    category: string;
}
export declare function computeSecurityScore(findings: SemgrepFinding[], manifest: ManifestData): ScoreBreakdown;
//# sourceMappingURL=scoring.d.ts.map