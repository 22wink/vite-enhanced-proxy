---
title: Core Options
---

# Core Options

This page lists every option accepted by `createProxyPlugin`, including defaults and common scenarios.

## ProxyPluginOptions

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `env` | `ProxyEnv` \| `string` | `ProxyEnv.Local` | Active proxy environment |
| `targets` | `Partial<ProxyTargets<TEnv>>` | - | Proxy targets for each environment |
| `logger` | [`LoggerConfig`](./logging.md) | - | Log configuration |
| `requestFilter` | `RequestFilter` | - | Decide which requests get logged |
| `responseFilter` | `ResponseFilter` | - | Decide which responses get logged |
| `middleware` | `ProxyMiddleware[]` | `[]` | HTTP middleware |
| `wsMiddleware` | `WebSocketMiddleware[]` | `[]` | WebSocket middleware |
| `sseMiddleware` | `SSEMiddleware[]` | `[]` | SSE middleware |
| `webSocketFilter` | `WebSocketFilter` | - | Filter incoming WS connections |
| `customProxyConfig` | `Partial<ProxyOptions>` | - | Raw `http-proxy` options passthrough |
| `rewriteRules` | `Record<string, string>` | - | URL rewrite mappings |
| `webSocket` | `WebSocketConfig` | - | Global WS config |
| `sse` | `SSEConfig` | - | Global SSE config |
| `enabled` | `boolean` | `true` | Toggle the proxy |
| `devOnly` | `boolean` | `false` | Only run during `vite dev` |

### targets structure

```ts
type ProxyTarget =
  | string
  | {
      target: string;
      path?: string;
      rewrite?: string;
      ws?: WebSocketConfig;
      sse?: SSEConfig;
    };
```

- When the value is a **string**, the plugin derives a path from the key: `v3 -> /api/v3`, `v2 -> /api`, `v1 -> /api/v1`, and everything else becomes `/{key}`.
- When the value is an **object**, you can control `target/path/rewrite` independently and enable WS/SSE for that path.
- Keys that start with `/` are treated as absolute paths, e.g. `"/oss"`.

### Rewrite priority

`object.rewrite > rewriteRules[path] > path`

## Layered config

1. Inline: inside `createProxyPlugin({...})`
2. External: auto-load `proxy.config.*` (see [External config](./external-config.md))
3. Runtime updates: `ViteProxyPlugin` instance methods (see [Runtime controls](./runtime.md))

Later layers override earlier layers.

## Example: multi-environment with rewrites

```ts
createProxyPlugin({
  env: "dev",
  targets: {
    dev: {
      v3: "http://localhost:8000/api/v3/backend",
      flow: "http://localhost:8002",
      "/ws": {
        target: "ws://localhost:3000",
        ws: { enabled: true, logConnections: true, logMessages: true }
      }
    },
    test: {
      api: { target: "https://test.example.com", path: "/api", rewrite: "/" }
    },
    prod: {
      "/api": { target: "https://api.example.com", rewrite: "/" }
    }
  },
  rewriteRules: {
    "/flow": "/"
  }
});
```

## Relationship with Vite's native proxy

vite-enhanced-proxy replaces part of `server.proxy` and uses `http-proxy` internally. If you already use `server.proxy`, consider migrating rules here to gain unified logging and middleware. Running both is possible—just make sure their paths don't overlap.
