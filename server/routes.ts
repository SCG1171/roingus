import type { Express } from "express";
import { createServer, type Server } from "http";
import { startBot } from "./bot";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  try {
    console.log("Starting Discord bot...");
    await startBot();
    console.log("Discord bot started successfully");
  } catch (error) {
    console.error("Failed to start Discord bot:", error);
    // Exit with error code to ensure the process restarts cleanly
    process.exit(1);
  }

  return httpServer;
}