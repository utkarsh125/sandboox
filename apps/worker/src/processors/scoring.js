// 100 (perfect)
//  - vulnerability deductions (criticals, warnings, infos)
//  - manifest deductions (debuggable, allowBackup, cleartext, no network config)
//  - permission deductions (too many dangerous perms)
//  - component deductions (too many exported components)
//  - config deductions (old minSdk)
//  = final score -> grade
export function computeSecurityScore(findings, manifest) {
    let score = 100;
    const deductions = [];
    //vulnerability deductions
    const criticals = findings.filter(f => f.severity === "ERROR");
    const warnings = findings.filter(f => f.severity === "WARNING");
    const infos = findings.filter(f => f.severity === "INFO");
    if (criticals.length > 0) {
        const points = Math.min(criticals.length * 8, 40);
        score -= points;
        deductions.push({
            reason: `${criticals.length} critical finding(s)`,
            points,
            category: "Vulnerabilities"
        });
    }
    if (warnings.length > 0) {
        const points = Math.min(warnings.length * 3, 20);
        score -= points;
        deductions.push({
            reason: `${warnings.length} warning(s)`,
            points,
            category: "Vulnerabilities"
        });
    }
    if (infos.length > 5) {
        const points = Math.min((infos.length - 5) * 1, 10);
        score -= points;
        deductions.push({
            reason: `${infos.length} info findings (${infos.length - 5} above threshold)`,
            points,
            category: "Vulnerabilities" // also fix the typo below
        });
    }
    //Manifest deductions
    if (manifest.debuggable) {
        score -= 15;
        deductions.push({
            reason: "App is debuggable",
            points: 15,
            category: "Manifest"
        });
    }
    if (manifest.allowBackup) {
        score -= 5;
        deductions.push({
            reason: "App allows backup",
            points: 5,
            category: "Manifest"
        });
    }
    if (!manifest.networkSecurityConfig) { //if network securityconfig not present
        score -= 3;
        deductions.push({
            reason: "No network security configuration",
            points: 3,
            category: "Manifest"
        });
    }
    if (manifest.usesCleartextTraffic) {
        score -= 10;
        deductions.push({
            reason: "Cleartext HTTP traffic allowed",
            points: 10,
            category: "Manifest"
        });
    }
    const dangerousPerms = manifest.permissions.filter(p => p.risk === "dangerous");
    if (dangerousPerms.length > 3) {
        const points = Math.min((dangerousPerms.length - 3) * 2, 10);
        score -= points;
        deductions.push({
            reason: `${dangerousPerms.length} dangerous permissions`,
            points,
            category: "Permissions",
        });
    }
    const exportedCount = manifest.exportedComponents.length;
    if (exportedCount > 2) {
        const points = Math.min((exportedCount - 2) * 2, 10);
        score -= points;
        deductions.push({
            reason: `${exportedCount} exported components`,
            points,
            category: "Manifest"
        });
    }
    if (manifest.minSdkVersion !== null && manifest.minSdkVersion < 23) {
        score -= 5;
        deductions.push({
            reason: `minSdk ${manifest.minSdkVersion} (below API 23)`,
            points: 5,
            category: "Configuration"
        });
    }
    score = Math.max(0, Math.min(100, score));
    return {
        totalScore: score,
        grade: scoreToGrade(score),
        deductions
    };
}
function scoreToGrade(score) {
    if (score >= 90)
        return "A";
    if (score >= 75)
        return "B";
    if (score >= 60)
        return "C";
    if (score >= 45)
        return "D";
    return "F";
}
//# sourceMappingURL=scoring.js.map