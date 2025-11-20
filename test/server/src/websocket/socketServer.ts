import type { Server as HttpServer } from "node:http";
import type { Server as HttpsServer } from "node:https";
import { WebSocketServer, type WebSocket } from "ws";

export type SocketProtocol = "WS" | "WSS";

export interface SocketServerOptions {
  port?: number;
  server?: HttpServer | HttpsServer;
  protocol: SocketProtocol;
  onConnectionCountChange?: (count: number) => void;
}

export interface ManagedSocketServer {
  getConnectionCount: () => number;
}

function createClientId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function createSocketServer(
  options: SocketServerOptions,
): ManagedSocketServer {
  if (!options.server && typeof options.port !== "number") {
    throw new Error("必须提供 port 或 server 以启动 WebSocket 服务");
  }

  const wss = options.server
    ? new WebSocketServer({ server: options.server })
    : new WebSocketServer({ port: options.port });

  if (!options.server && options.port) {
    console.log(
      `🔗 WebSocket 服务器 (${options.protocol}) 运行在 ${options.protocol === "WSS" ? "wss" : "ws"}://localhost:${options.port}`,
    );
  }

  const clients = new Set<WebSocket>();

  const updateCount = () => {
    options.onConnectionCountChange?.(clients.size);
  };

  wss.on("connection", (socket, req) => {
    const clientId = createClientId();
    clients.add(socket);
    updateCount();

    console.log(
      `🔗 WebSocket 客户端连接 (${options.protocol}): ${clientId} ${
        req.socket.remoteAddress ? `from ${req.socket.remoteAddress}` : ""
      }`,
    );

    socket.send(
      JSON.stringify({
        type: "connected",
        protocol: options.protocol,
        clientId,
        message: `${options.protocol} 连接已建立`,
        timestamp: new Date().toISOString(),
      }),
    );

    const intervalId = setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message",
            protocol: options.protocol,
            data: {
              id: Date.now(),
              message: `WebSocket 消息 - ${new Date().toLocaleTimeString()}`,
              random: Math.random().toFixed(4),
            },
            timestamp: new Date().toISOString(),
          }),
        );
      }
    }, 2000);

    socket.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`📨 收到 WebSocket 消息 (${options.protocol}):`, data);

        socket.send(
          JSON.stringify({
            type: "echo",
            protocol: options.protocol,
            original: data,
            timestamp: new Date().toISOString(),
          }),
        );
      } catch (error) {
        console.error("解析 WebSocket 消息失败:", error);
      }
    });

    function handleClose(eventLabel: string, error?: unknown) {
      if (error) {
        console.error(`❌ ${eventLabel}`, error);
      } else {
        console.log(`❌ ${eventLabel}`);
      }
      clients.delete(socket);
      clearInterval(intervalId);
      updateCount();
    }

    socket.on("close", () => {
      handleClose(
        `WebSocket 客户端断开 (${options.protocol}): ${clientId}`,
      );
    });

    socket.on("error", (err) => {
      handleClose(`WebSocket 错误 (${options.protocol}): ${clientId}`, err);
    });
  });

  return {
    getConnectionCount: () => clients.size,
  };
}

