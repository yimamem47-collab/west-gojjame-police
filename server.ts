import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: GitHub Sync - Pushes local files to the GitHub repo
  app.post("/api/github/sync", async (req, res) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
    const REPO_OWNER = "yimamem47-collab";
    const REPO_NAME = "west-gojjame-police";

    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: "GitHub token missing on server" });
    }

    // Files to sync (expand this list as needed)
    const filesToSync = [
      "src/App.tsx",
      "src/firebase.ts",
      "src/services/geminiService.ts",
      "src/hooks/useAppData.ts",
      "src/components/Dashboard.tsx",
      "src/components/Layout.tsx",
      "src/components/AIAssistant.tsx",
      "src/components/Settings.tsx",
      "src/components/Auth.tsx",
      "src/components/Navigation.tsx",
      "src/components/CrimeTipForm.tsx",
      "src/components/Reports.tsx",
      "src/components/Map.tsx",
      "src/components/TrafficSafety.tsx",
      "src/components/CorruptionReport.tsx",
      "src/components/Home.tsx",
      "src/components/PoliceServices.tsx",
      "src/components/AppManual.tsx",
      "src/components/Assignments.tsx",
      "src/components/CitizenReport.tsx",
      "src/components/CommunityReportForm.tsx",
      "src/components/CommunityReports.tsx",
      "src/components/EmergencyContacts.tsx",
      "src/components/ErrorBoundary.tsx",
      "src/components/IncidentMap.tsx",
      "src/components/Officers.tsx",
      "src/components/PoliceIDScanner.tsx",
      "src/components/QRScanner.tsx",
      "src/components/Scanner.tsx",
      "src/components/ZoneReports.tsx",
      "src/types.ts",
      "src/constants.ts",
      "src/lib/translations.ts",
      "src/services/diagnostics.ts",
      "src/services/githubFileService.ts",
      "src/services/telegramService.ts",
      "firestore.rules",
      "firebase-blueprint.json",
      "package.json",
      "vite.config.ts",
      "index.html",
      "src/index.css",
      "AGENTS.md",
      "server.ts",
      ".env.example"
    ];

    const results = [];

    for (const filePath of filesToSync) {
      try {
        const absolutePath = path.join(process.cwd(), filePath);
        const content = await fs.readFile(absolutePath, "utf-8");
        const base64Content = Buffer.from(content).toString("base64");

        // 1. Get SHA if file exists
        const getUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
        const getRes = await fetch(getUrl, {
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3+json"
          }
        });

        let sha;
        if (getRes.ok) {
          const data = await getRes.json();
          sha = data.sha;
        }

        // 2. Push content
        const putRes = await fetch(getUrl, {
          method: "PUT",
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
          },
          body: JSON.stringify({
            message: `Sync ${filePath} from AI Studio Dashboard`,
            content: base64Content,
            sha
          })
        });

        if (putRes.ok) {
          results.push({ file: filePath, status: "success" });
        } else {
          const err = await putRes.json();
          results.push({ file: filePath, status: "error", message: err.message });
        }
      } catch (err: any) {
        results.push({ file: filePath, status: "error", message: err.message });
      }
    }

    res.json({ results });
  });

  // API Route: Proxy Telegram to bypass browser CORS/fetching issues and hide token
  app.post("/api/telegram", async (req, res) => {
    const { message, html = true } = req.body;
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8405421128:AAEX7lRd1Q0unboIvb1FIthAIH0QCR7iJXA';
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003878859973';

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Telegram configuration missing on server" });
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
      const telegramResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: html ? "HTML" : undefined
        })
      });

      const data = await telegramResponse.json();
      
      if (!telegramResponse.ok) {
        console.error("Telegram API Error:", data);
        return res.status(telegramResponse.status).json(data);
      }

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Server-side Telegram Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal network error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
