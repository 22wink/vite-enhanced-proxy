import type { Express } from "express";

interface ApiRouteOptions {
  getSseConnections: () => number;
  getWebSocketConnections: () => number;
}

export function registerApiRoutes(
  app: Express,
  options: ApiRouteOptions,
) {
  app.get("/api/test", (req, res) => {
    res.json({
      message: "这是一个普通的 API 端点",
      protocol: req.protocol,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/http-test", (_req, res) => {
    res.json({
      protocol: "HTTP",
      message: "HTTP 代理测试成功",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/https-test", (_req, res) => {
    res.json({
      protocol: "HTTPS",
      message: "HTTPS 代理测试成功",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      sseConnections: options.getSseConnections(),
      websocketConnections: options.getWebSocketConnections(),
      timestamp: new Date().toISOString(),
    });
  });
}

