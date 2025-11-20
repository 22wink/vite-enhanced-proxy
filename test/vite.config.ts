// vite.config.ts - SSE 测试配置
import { defineConfig } from "vite";
import { createProxyPlugin, LogLevel } from "../index";

enum MyEnv {
  Local = "local",
  Development = "development",
  Production = "production"
}

export default defineConfig({
  plugins: [
    createProxyPlugin<MyEnv>({
      // 使用本地环境
      env: MyEnv.Local,
      // 代理目标配置
      targets: {
        [MyEnv.Local]: {
          // HTTPS 代理 - 代理所有 /api-https 请求到 HTTPS 后端服务器
          "/api-https": {
            target: "https://localhost:3002/api",
            // 启用 SSE 支持
            sse: {
              enabled: true,
              logConnections: true,
              logMessages: true,
              retryInterval: 3000
            },
            // 自定义代理配置 - 忽略 SSL 证书错误（仅用于测试）
            customProxyConfig: {
              secure: false,
              rejectUnauthorized: false
            }
          },
          // HTTP 代理 - 代理所有 /api 请求到后端服务器
          "/api": {
            target: "http://localhost:3001/api",
            // 启用 SSE 支持
            sse: {
              enabled: true,
              logConnections: true,
              logMessages: true,
              retryInterval: 3000
            }
          },
          // WebSocket 代理 - 代理所有 /ws 请求到 WebSocket 服务器
          "/ws": {
            target: "http://localhost:3003",
            ws: {
              enabled: true,
              logConnections: true,
              logMessages: true
            }
          },
          // WebSocket Secure 代理 - 代理所有 /wss 请求到 WSS 服务器
          "/wss": {
            target: "https://localhost:3004",
            ws: {
              enabled: true,
              logConnections: true,
              logMessages: true
            },
            // 自定义代理配置 - 忽略 SSL 证书错误（仅用于测试）
            customProxyConfig: {
              secure: false,
              rejectUnauthorized: false
            }
          }
        }
      },

      // 日志配置 - 详细模式以便观察 SSE 行为
      logger: {
        level: LogLevel.DEBUG,
        colorful: true,
        timestamp: true,
        showMethod: true,
        showStatus: true,
        prefix: "[代理测试]",
        // SSE 相关日志配置
        showSseConnections: true,
        showSseMessages: true,
        // 其他详细配置
        showRequestHeaders: false,
        showRequestBody: false,
        showResponseHeaders: false,
        showResponseBody: false,
        showQueryParams: true,
        maxBodyLength: 1000,
        prettifyJson: true
      },

      // 全局 SSE 配置
      sse: {
        enabled: true,
        logConnections: true,
        logMessages: true
      },

      // 仅在开发模式启用
      devOnly: true,
      enabled: true
    })
  ],

  server: {
    port: 5173,
    open: true
  }
});

