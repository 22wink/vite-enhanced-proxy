// vite.config.ts - 基本用法示例
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    createProxyPlugin({
      env: ProxyEnv.Local,
      targets: {
        [ProxyEnv.Local]: {
          v3: "http://localhost:8000/api/v3",
          v2: "http://localhost:8000/api/v2",
          flow: "http://localhost:8002"
        }
      }
    })
  ]
});