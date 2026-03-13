//This file is responsible for semgrep logic
//It runs semgrap scan on the jadx-decompiled java/kotlin source code
//parses the JSON output into structured findings. 
//Each finding gets categorized (cryptography, injection, webview security, etc.) and gets mapped to OWASP Mobile Top 10
import { execSync } from "child_process";
import path from "path";
//Run Semgrep on the jadx-decompiled Java/Kotlin source
//Returns structured finding array
export function runSemgrep(decompDir) {
    const jadxDir = path.join(decompDir, "jadx");
    try {
        //--config-auto: use Semgrep's recommended rules
        //--json: structured output
        //--no-git: we're scanning a decompiled git, not a repo
        const result = execSync([
            "semgrep", "scan",
            "--config=auto",
            "--json",
            "--no-git",
            "--timeout", "300",
            "--max-target-bytes", "5000000",
            jadxDir,
        ].join(" "), {
            maxBuffer: 50 * 1024 * 1024, //50MB buffer for large APKs
            timeout: 600_600,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        });
        return parseResults(result, decompDir);
    }
    catch (err) {
        //semgrep exists with code 1 when finding exists,
        //but stdout still has valid JSON for some reason
        if (err.stdout) {
            try {
                return parseResults(err.stdout, decompDir);
            }
            catch (error) {
                console.error(`Failed to parse semgrep output: ${err.message}`);
            }
        }
        console.error(`Semgrep execution failed: ${err.message}`);
        return [];
    }
}
//func to parse results but i believe it is going to broken down more
function parseResults(rawOutput, baseDir) {
    const parsed = JSON.parse(rawOutput);
    if (!parsed.results || !Array.isArray(parsed.results)) {
        return [];
    }
    return parsed.results.map((r) => ({
        ruleId: r.check_id || "unknown",
        severity: mapSeverity(r.extra?.severity), //todo: make a func for this shit
        message: r.extra?.message || "",
        filePath: r.path || "",
        lineStart: r.start.line || 0,
        lineEnd: r.end?.line | 0,
        code: r.extra?.lines || "",
        category: categorizeRule(r.check_id || ""),
        owaspCategory: mapToOwasp(r.check_id || ""),
        cwe: extractCWE(r.extra?.metadata),
    }));
}
function mapSeverity(severity) {
    switch (severity?.toUpperCase()) {
        case "ERROR": return "ERROR";
        case "WARNING": return "WARNING";
        default: return "INFO";
    }
}
function categorizeRule(ruleId) {
    const lower = ruleId.toLowerCase();
    if (lower.includes("crypto") ||
        lower.includes("cipher") ||
        lower.includes("ssl") ||
        lower.includes("tls"))
        return "Cryptography";
    if (lower.includes("sql") ||
        lower.includes("injection") ||
        lower.includes("inject"))
        return "Injection";
    if (lower.includes("log") ||
        lower.includes("leak") ||
        lower.includes("print"))
        return "Information Disclosure";
    if (lower.includes("webview") ||
        lower.includes("javascript-interface"))
        return "WebView Security";
    if (lower.includes("intent") ||
        lower.includes("broadcast") ||
        lower.includes("ipc") ||
        lower.includes("content-provider"))
        return "IPC Security";
    if (lower.includes("permissions"))
        return "Permissions";
    if (lower.includes("storage") ||
        lower.includes("shared-pref") ||
        lower.includes("file"))
        return "Data Storage";
    if (lower.includes("auth") ||
        lower.includes("password") ||
        lower.includes("credentials"))
        return "Authentication";
    if (lower.includes("network") ||
        lower.includes("http") ||
        lower.includes("url"))
        return "Network Security";
    if (lower.includes("hardcoded") ||
        lower.includes("secret") ||
        lower.includes("api-key") ||
        lower.includes("token"))
        return "Hardcoded Secets";
    return "General";
}
function mapToOwasp(ruleId) {
    const lower = ruleId.toLowerCase();
    if (lower.includes("crypto") ||
        lower.includes("cipher") ||
        lower.includes("hash"))
        return "M5: Insufficient Cryptography";
    if (lower.includes("storage") ||
        lower.includes("shared-pref") ||
        lower.includes("log"))
        return "M9: Insecure Data Storage";
    if (lower.includes("auth") ||
        lower.includes("password"))
        return "M3: Insecure Authentication";
    if (lower.includes("network") ||
        lower.includes("ssl") ||
        lower.includes("tls") ||
        lower.includes("http"))
        return "M5: Insufficient Cryptography";
    if (lower.includes("inject") ||
        lower.includes("sql"))
        return "M7: Client Code Quality";
    if (lower.includes("intent") ||
        lower.includes("ipc") ||
        lower.includes("broadcast"))
        return "M1: Improper Platform Usage";
    if (lower.includes("hardcoded") ||
        lower.includes("secret") ||
        lower.includes("key"))
        return "M9: Insecure Data Storage";
    if (lower.includes("webview"))
        return "M1: Improper Platform Usage";
    return null;
}
function extractCWE(metadata) {
    if (!metadata)
        return [];
    if (Array.isArray(metadata.cwe))
        return metadata.cwe;
    if (typeof metadata.cwe === "string")
        return [metadata.cwe];
    return [];
}
//# sourceMappingURL=semgrep.js.map