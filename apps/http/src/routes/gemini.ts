//This file is responsible for the explanations
//using gemini api for the free tier

import { Hono } from "hono";
import { Variables } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const explainRoutes = new Hono<{ Variables: Variables }>();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

//POST /api/explain/vulnerability

explainRoutes.post("/vulnerability", async (c) => {
    const user = c.get("user");

    if (!user) {
        return c.json({
            error: "Unauthorized"
        }, 401)
    }

    const { vulnerability } = await c.req.json();
    if (!vulnerability) {
        return c.json({
            error: "vulnerability object is required"
        }, 400)
    }

    try {


        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600,
            }
        });

        const prompt = buildPrompt(vulnerability);

        const result = await model.generateContent(prompt);

        const explanation = result.response.text();

        return c.json({
            explanation
        })
    } catch (err: any) {
        console.error("[GEMINI] Call failed: ", err.message);
        return c.json({
            error: "Failed to generate explanation"
        }, 500)
    }
})



//a simple helper for prompt build
function buildPrompt(vuln: any): string {

    return `You are a mobile security expert. A static analysis tool (Semgrep) found this vulnerability in an Android APK:
        **Rule:** ${vuln.ruleId}
        **Severity:** ${vuln.severity}
        **Category:** ${vuln.category}
        **Message:** ${vuln.message}
        **File:** ${vuln.filePath}:${vuln.lineStart}
        ${vuln.owaspCategory ? `**OWASP:** ${vuln.owaspCategory}` : ""}
        ${vuln.cwe?.length ? `**CWE:** ${vuln.cwe.join(", ")}` : ""}
        **Code:**
        \`\`\`java
        ${vuln.code}
        \`\`\`
        Provide a response in this exact format:
        ## Risk
        2-3 sentences explaining what the risk is in plain English.
        ## Attack Scenario
        A concrete, realistic example of how an attacker could exploit this.
        ## Fix
        A code snippet showing how to fix the vulnerable code. Show before → after.
        ## False Positive?
        One sentence on the likelihood this is a false positive and why.`;
}