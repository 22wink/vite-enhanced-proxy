import http from "node:http";
import https from "node:https";
import { createApp } from "./app";
import { PORTS } from "./config";
import { ensureCertificates } from "./certificates";
import { createSocketServer } from "./websocket/socketServer";

const wsCounters: Array<() => number> = [];

const { app } = createApp({
  getWebSocketConnections: () =>
    wsCounters.reduce((total, getter) => total + getter(), 0),
});

const httpServer = http.createServer(app);
httpServer.listen(PORTS.http, () => {
  console.log(`🚀 HTTP 服务器运行在 http://localhost:${PORTS.http}`);
  console.log("📡 SSE 端点:");
  console.log(`   - http://localhost:${PORTS.http}/api/sse`);
  console.log(`   - http://localhost:${PORTS.http}/api/sse/custom-retry`);
  console.log(`   - http://localhost:${PORTS.http}/api/sse/error`);
  console.log(`📤 广播端点: POST http://localhost:${PORTS.http}/api/sse/broadcast`);
  console.log(`❤️  健康检查: http://localhost:${PORTS.http}/health`);
  console.log(`🌐 HTTP 测试: http://localhost:${PORTS.http}/api/http-test`);
});

const sslOptions = ensureCertificates();

if (sslOptions) {
  const httpsServer = https.createServer(sslOptions, app);
  httpsServer.listen(PORTS.https, () => {
    console.log(`🔒 HTTPS 服务器运行在 https://localhost:${PORTS.https}`);
    console.log("📡 HTTPS SSE 端点:");
    console.log(`   - https://localhost:${PORTS.https}/api/sse`);
    console.log(`   - https://localhost:${PORTS.https}/api/sse/custom-retry`);
    console.log(`   - https://localhost:${PORTS.https}/api/sse/error`);
    console.log(`🌐 HTTPS 测试: https://localhost:${PORTS.https}/api/https-test`);
    console.log("⚠️  注意: 浏览器会显示证书警告（自签名证书）");
  });
} else {
  console.log("⚠️  HTTPS 服务器未启动（缺少证书）");
}

const wsServer = createSocketServer({
  port: PORTS.ws,
  protocol: "WS",
});
wsCounters.push(wsServer.getConnectionCount);

if (sslOptions) {
  const httpsServerForWss = https.createServer(sslOptions);
  httpsServerForWss.listen(PORTS.wss, () => {
    console.log(
      `🔒 WebSocket Secure 服务器 (WSS) 运行在 wss://localhost:${PORTS.wss}`,
    );
  });

  const wssServer = createSocketServer({
    server: httpsServerForWss,
    protocol: "WSS",
  });
  wsCounters.push(wssServer.getConnectionCount);
} else {
  console.log("⚠️  WebSocket Secure 服务器未启动（缺少证书）");
}

