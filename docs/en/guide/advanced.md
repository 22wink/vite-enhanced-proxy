---
title: Advanced Usage
---

# Advanced Usage

This section covers filters, middleware, WebSocket/SSE proxying, and dynamic targets.

## Request/response filters

```ts
createProxyPlugin({
  env: ProxyEnv.Local,
  requestFilter: (url, method) => method === "POST",
  responseFilter: (url, method, status) => status >= 400
});
```

- `requestFilter` must return `true` for a request log to be emitted.
- `responseFilter` must return `true` for a response log to be emitted.

## Middleware

```ts
createProxyPlugin({
  middleware: [
    async (proxyReq, req) => {
      proxyReq.setHeader("Authorization", `Bearer ${getToken()}`);
    },
    async () => {
      console.log("Request time:", new Date().toISOString());
    }
  ]
});
```

Middleware runs in array order. Use it to inject headers, track fingerprints, measure latency, etc.

## WebSocket proxy

```ts
createProxyPlugin({
  targets: {
    [ProxyEnv.Local]: {
      "/ws": {
        target: "ws://localhost:3000",
        ws: {
          enabled: true,
          logConnections: true,
          logMessages: true,
          maxMessageLength: 2_000,
          prettifyMessages: true,
          timeout: 30_000
        }
      }
    }
  },
  wsMiddleware: [
    async (ws, req) => {
      console.log("WS connection:", req.url);
    }
  ],
  webSocketFilter: (url) => url.startsWith("/ws/"),
  logger: {
    showWsConnections: true,
    showWsMessages: true
  }
});
```

## SSE proxy

```ts
createProxyPlugin({
  targets: {
    [ProxyEnv.Local]: {
      "/events": {
        target: "http://localhost:3000",
        sse: {
          enabled: true,
          logConnections: true,
          logMessages: true,
          maxMessageLength: 2_000,
          prettifyMessages: true,
          retryInterval: 3_000,
          headers: { "Cache-Control": "no-cache" }
        }
      }
    }
  },
  sseMiddleware: [
    async (proxyReq) => {
      proxyReq.setHeader("Authorization", `Bearer ${getToken()}`);
    }
  ],
  logger: {
    showSseConnections: true,
    showSseMessages: true
  }
});
```

## Dynamic targets & object-style config

```ts
createProxyPlugin({
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      v3: "http://localhost:8000/api/v3/backend",
      v2: "http://localhost:8000/api/backend",
      flow: "http://localhost:8002",
      auth: { target: "http://localhost:9000", path: "/api/auth", rewrite: "/auth" },
      "/oss": { target: "https://oss.example.com", rewrite: "/oss" }
    }
  },
  rewriteRules: {
    "/flow": "/",
    "/api": "/api"
  }
});
```

Key points:

- Keys like `v3/v2/v1` map to conventional paths automatically.
- Other keys become `/{key}`.
- Keys starting with `/` are treated as full paths.
- `rewrite` priority: inline object > `rewriteRules`.
