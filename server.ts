import express from "express";
import path from "path";
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
