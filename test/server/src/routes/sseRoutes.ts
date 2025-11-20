import type { Express, Request, Response } from "express";
import { TIMER_INTERVAL_MS } from "../config";

type SseClient = Response;

function setSseHeaders(res: Response, extraHeaders?: Record<string, string>) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Cache-Control");

  if (extraHeaders) {
    Object.entries(extraHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }
}

function cleanupClient(
  res: SseClient,
  clients: Set<SseClient>,
  intervalId: NodeJS.Timeout,
  label: string,
) {
  clients.delete(res);
  clearInterval(intervalId);
  res.end();
  console.log(`❌ SSE 客户端断开连接 (${label})`);
}

function attachClient(
  req: Request,
  res: SseClient,
  clients: Set<SseClient>,
  label: string,
  sender: () => void,
) {
  clients.add(res);
  const intervalId = setInterval(() => {
    if (clients.has(res)) {
      sender();
    }
  }, TIMER_INTERVAL_MS);

  req.on("close", () => cleanupClient(res, clients, intervalId, label));
}

export function registerSseRoutes(app: Express, clients: Set<SseClient>) {
  app.get("/api/sse", (req, res) => {
    console.log("📡 新的 SSE 连接请求");
    setSseHeaders(res);

    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "SSE 连接已建立",
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    attachClient(
      req,
      res,
      clients,
      "基础",
      () => {
        const message = {
          type: "message",
          data: {
            id: Date.now(),
            message: `服务器消息 - ${new Date().toLocaleTimeString()}`,
            random: Math.random().toFixed(4),
          },
          timestamp: new Date().toISOString(),
        };
        res.write(`data: ${JSON.stringify(message)}\n\n`);
      },
    );
  });

  app.get("/api/sse/custom-retry", (req, res) => {
    console.log("📡 新的 SSE 连接请求 (自定义重试)");
    setSseHeaders(res, { "Retry-After": "5000" });
    res.write("retry: 5000\n");
    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "SSE 连接已建立（自定义重试间隔）",
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    attachClient(
      req,
      res,
      clients,
      "自定义重试",
      () => {
        const message = {
          type: "custom-message",
          data: {
            id: Date.now(),
            message: `自定义消息 - ${new Date().toLocaleTimeString()}`,
            retryInterval: 5000,
          },
          timestamp: new Date().toISOString(),
        };
        res.write(`data: ${JSON.stringify(message)}\n\n`);
      },
    );
  });

  app.get("/api/sse/error", (req, res) => {
    console.log("📡 新的 SSE 连接请求 (错误测试)");
    setSseHeaders(res);

    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "SSE 连接已建立（错误测试）",
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    let messageCount = 0;
    clients.add(res);

    const intervalId = setInterval(() => {
      if (!clients.has(res)) {
        return;
      }

      messageCount += 1;
      if (messageCount === 3) {
        res.write("event: error\n");
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: "模拟错误消息",
            timestamp: new Date().toISOString(),
          })}\n\n`,
        );
      } else {
        const payload = {
          type: "message",
          data: {
            id: Date.now(),
            message: `消息 ${messageCount}`,
            timestamp: new Date().toISOString(),
          },
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    }, TIMER_INTERVAL_MS);

    req.on("close", () => cleanupClient(res, clients, intervalId, "错误测试"));
  });

  app.post("/api/sse/broadcast", (req, res) => {
    const { message } = req.body ?? {};
    const broadcastMessage = {
      type: "broadcast",
      data: {
        message: message || "广播消息",
        timestamp: new Date().toISOString(),
      },
    };

    let sentCount = 0;
    clients.forEach((client) => {
      try {
        client.write(`data: ${JSON.stringify(broadcastMessage)}\n\n`);
        sentCount += 1;
      } catch (error) {
        console.error("发送广播消息失败:", error);
      }
    });

    res.json({
      success: true,
      message: `消息已广播到 ${sentCount} 个客户端`,
      timestamp: new Date().toISOString(),
    });
  });
}

