/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI client securely
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Parse standard express JSON bodies
app.use(express.json());

// API: Get app configuration status
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!apiKey,
    appName: "OmniTest Automation Dashboard"
  });
});

// API: AI test suite generator
app.post("/api/gemini/generate-test", async (req, res) => {
  const { prompt, productType } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Configuration prompt is required." });
  }

  // Fallback mock JSON data generator if Gemini key is not configured
  if (!ai) {
    const mockCodeSnippets: Record<string, string> = {
      web: `import { test, expect } from '@playwright/test';\n\ntest('Auto-generated Web flow: ${prompt}', async ({ page }) => {\n  await page.goto('https://omnitest.io/demo');\n  // TODO: Add step-by-step locator parameters\n  await expect(page).toHaveTitle(/Demo/);\n});`,
      api: `const axios = require('axios');\n\ndescribe('Auto-generated API flow: ${prompt}', () => {\n  it('satisfies response headers schema', async () => {\n    const res = await axios.get('https://api.omnitest.io/status');\n    expect(res.status).toBe(200);\n  });\n});`,
      mobile: `import { remote } from 'webdriverio';\n\ndescribe('Mobile Emulation: ${prompt}', () => {\n  it('checks scrollable items', async () => {\n    // TODO: Verify mobile touch coordinates\n    expect(true).toBe(true);\n  });\n});`,
      windows: `// Windows Win32 verification system\n[TestMethod]\npublic void VerifyWindowsApp() {\n  // TODO: Add Windows UI Automation element drivers\n  Assert.IsTrue(true);\n}`
    };

    return res.json({
      testName: `Offline: ${productType.toUpperCase()} Suite`,
      description: `Synthesized placeholder for scenario: "${prompt}"`,
      steps: [
        "Initialize automation environment driver",
        `Dispatch actions mapping user request: "${prompt}"`,
        "Assert output boundaries satisfy response criteria"
      ],
      assertions: [
        "Network connection status holds successful protocol code",
        "Target interface state resolved to expected schema"
      ],
      code: mockCodeSnippets[productType] || mockCodeSnippets.web
    });
  }

  try {
    const systemPromptMessage = `You are a professional software testing AI Architect. Synthesize a complete automation verification profile based on the user's natural language requirements.
You MUST output your response in JSON format. The JSON object should contain exactly these fields:
- "testName": string (a short, crisp, beautiful name for the test suite)
- "description": string (summarizing what is verified)
- "steps": string[] (at least 3 to 6 logical sequential execution steps for testing)
- "assertions": string[] (logical checks/verification points)
- "code": string (a fully-formed, clean, documented automation code snippet appropriate for the platform: use Playwright/TS for 'web', Axios/Mocha/JS for 'api', WebdriverIO/JS for 'mobile', and C#/MSTest/WinAppDriver pattern for 'windows')

Keep code comments clean. Do not include external markdown wrapper block tags; return only the clean JSON structure.`;

    const userPromptMessage = `Generate automation verification templates for a [${productType.toUpperCase()}] test platform based on the user criteria:\n"${prompt}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPromptMessage,
      config: {
        systemInstruction: systemPromptMessage,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response text from Gemini model.");
    }

    const payload = JSON.parse(outputText.trim());
    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed execution via Gemini AI." });
  }
});

// API: AI console stack trace diagnostics
app.post("/api/gemini/debug-logs", async (req, res) => {
  const { logText } = req.body;

  if (!logText) {
    return res.status(400).json({ error: "Log text is required for diagnostics." });
  }

  // Fallback mock JSON diagnostics generator if Gemini key is not configured
  if (!ai) {
    return res.json({
      possibleCause: "Offline Mock Analyzer: Selector timeout error.",
      fixSuggestion: "1. Upgrade wait criteria wrapper on targeted elements.\n2. Verify target page state handles async loads safely.\n3. Verify element state holds clickability attributes.",
      fixedCode: `// Offline correction snippet\nawait page.locator('button#submit').waitFor({ state: 'visible', timeout: 8000 });\nawait page.click('button#submit');`
    });
  }

  try {
    const systemInstruction = `You are an autonomic debugging log diagnostician. Analyze the provided test logs, stack trace, or compile failures, and provide a comprehensive, clear, structured report.
Your output MUST be a clean JSON object containing exactly three fields:
- "possibleCause": string (a clear human explanation of what elements, timeouts, networks, or assets broke, explaining why)
- "fixSuggestion": string (step-by-step clear developer guidelines on how to resolve the crash)
- "fixedCode": string (a copy-pasteable script excerpt showcasing the corrected syntax or implementation override)

Ensure the response satisfies the JSON output format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Examine the log context below and output your structured diagnostic advice:\n\n${logText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response text from Gemini model.");
    }

    const payload = JSON.parse(outputText.trim());
    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Diagnostics failed to resolve." });
  }
});

// Vite server orchestration and middleware integration
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server live middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static built files from dist folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted and listening at http://localhost:${PORT}`);
  });
}

runServer().catch((e) => {
  console.error("Critical error during server boot orchestration:", e);
});
