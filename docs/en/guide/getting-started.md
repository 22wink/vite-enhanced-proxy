---
title: Getting Started
---

# Getting Started

vite-enhanced-proxy is an enhanced proxy plugin for the Vite `dev` server. It offers environment switching, colorful logs, middleware, filters, WebSocket/SSE support, and more to keep complex debugging sessions under control.

## Installation

```bash
# npm
npm install vite-enhanced-proxy -D

# pnpm
pnpm add vite-enhanced-proxy -D

# yarn
yarn add vite-enhanced-proxy -D
```

> The plugin supports Vite `^3 || ^4 || ^5 || ^6 || ^7` and requires Node.js 16+.

## Quick example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    createProxyPlugin({
      env: ProxyEnv.Local
    })
  ]
});
```

The JavaScript equivalents:

```js
// vite.config.js (ESM)
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [createProxyPlugin({ env: ProxyEnv.Local })]
});
```

```js
// vite.config.js (CommonJS)
const { defineConfig } = require("vite");
const { createProxyPlugin, ProxyEnv } = require("vite-enhanced-proxy");

module.exports = defineConfig({
  plugins: [createProxyPlugin({ env: ProxyEnv.Local })]
});
```

## Full option skeleton

```ts
import { defineConfig } from "vite";
import {
  createProxyPlugin,
  ProxyEnv,
  LogLevel,
  type ProxyPluginOptions
} from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    createProxyPlugin({
      env: ProxyEnv.Local,
      targets: {
        [ProxyEnv.Local]: {
          v3: "http://localhost:8000/api/v3/backend",
          "/ws": {
            target: "ws://localhost:3000",
            ws: { enabled: true, logConnections: true }
          }
        }
      },
      logger: {
        level: LogLevel.DEBUG,
        colorful: true,
        timestamp: true,
        showRequestHeaders: true,
        showResponseBody: true
      },
      requestFilter: (url, method) => method === "POST",
      responseFilter: (url, method, status) => status >= 400,
      middleware: [
        (proxyReq, req) => {
          proxyReq.setHeader("X-Debug-User", req.headers["x-user"] ?? "dev");
        }
      ],
      wsMiddleware: [
        (ws, req) => {
          console.log("WS connection:", req.url);
        }
      ],
      sseMiddleware: [
        (proxyReq) => {
          proxyReq.setHeader("Authorization", `Bearer ${process.env.TOKEN}`);
        }
      ]
    } satisfies ProxyPluginOptions)
  ]
});
```

## Next steps

- Read [`Configuration / Core options`](./configuration.md) for every configurable field.
- Check [`Advanced usage`](./advanced.md) to learn about filters, middleware, WS, SSE, and more.
- Want to split proxy settings into a dedicated file? See [`External config`](./external-config.md).
