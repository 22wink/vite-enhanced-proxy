import express from "express";
import cors from "cors";
import type { Response } from "express";
import { registerSseRoutes } from "./routes/sseRoutes";
import { registerApiRoutes } from "./routes/apiRoutes";

export interface AppOptions {
  getWebSocketConnections: () => number;
}

export function createApp(options: AppOptions) {
  const app = express();
  const sseClients = new Set<Response>();

  app.use(cors());
  app.use(express.json());

  registerSseRoutes(app, sseClients);
  registerApiRoutes(app, {
    getSseConnections: () => sseClients.size,
    getWebSocketConnections: options.getWebSocketConnections,
  });

  return { app, sseClients };
}

