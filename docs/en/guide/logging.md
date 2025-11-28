---
title: Logging
---

# Logging

Logging is one of the core capabilities of vite-enhanced-proxy. `LoggerConfig` controls what gets printed, colors, levels, and WS/SSE details.

## LoggerConfig

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `level` | `LogLevel` | `LogLevel.INFO` | Log level (`DEBUG/INFO/WARN/ERROR`) |
| `colorful` | `boolean` | `true` | Enable colored output |
| `timestamp` | `boolean` | `true` | Show timestamps |
| `showMethod` | `boolean` | `true` | Show HTTP method |
| `showStatus` | `boolean` | `true` | Show status code |
| `showError` | `boolean` | `true` | Show error details |
| `prefix` | `string` | `[Proxy]` | Custom log prefix |
| `showRequestHeaders` | `boolean` | `false` | Print request headers |
| `showRequestBody` | `boolean` | `false` | Print request body |
| `showResponseHeaders` | `boolean` | `false` | Print response headers |
| `showResponseBody` | `boolean` | `false` | Print response body |
| `showQueryParams` | `boolean` | `false` | Print query parameters |
| `maxBodyLength` | `number` | `1000` | Max length for request/response bodies |
| `prettifyJson` | `boolean` | `true` | Beautify JSON output |
| `showWsConnections` | `boolean` | `false` | Show WebSocket connection logs |
| `showWsMessages` | `boolean` | `false` | Show WebSocket messages |
| `maxWsMessageLength` | `number` | `1000` | WS message truncate length |
| `showSseConnections` | `boolean` | `false` | Show SSE connection logs |
| `showSseMessages` | `boolean` | `false` | Show SSE messages |
| `maxSseMessageLength` | `number` | `1000` | SSE message truncate length |

## Practical presets

### Watch only errors

```ts
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR,
    colorful: false,
    showRequestBody: false,
    showResponseBody: false
  }
});
```

### Debug mode: dump everything

```ts
createProxyPlugin({
  logger: {
    level: LogLevel.DEBUG,
    showRequestHeaders: true,
    showRequestBody: true,
    showResponseHeaders: true,
    showResponseBody: true,
    showQueryParams: true,
    maxBodyLength: 10_000
  }
});
```

### WebSocket / SSE visibility

```ts
createProxyPlugin({
  logger: {
    showWsConnections: true,
    showWsMessages: true,
    maxWsMessageLength: 2_000,
    showSseConnections: true,
    showSseMessages: true,
    maxSseMessageLength: 2_000
  }
});
```

## Performance tips

1. Verbose logs consume more CPU/IO. In production, set `level` to `ERROR` and optionally `devOnly: true`.
2. Use `requestFilter` / `responseFilter` to avoid noisy logs.
3. Control output size with `maxBodyLength`, `maxWsMessageLength`, and `maxSseMessageLength`.

## Sample output

```text
2024-01-15 14:30:25 [Proxy] [GET   ] 🚀 Proxying to: http://localhost:8000/api/v3/backend/user
2024-01-15 14:30:25 [Proxy] [GET   ] ✅ 200 http://localhost:8000/api/v3/backend/user (156ms)

2024-01-15 14:30:26 [Proxy] [POST  ] ❌ 404 http://localhost:8000/api/v3/backend/login (89ms)

2024-01-15 14:30:28 [Proxy] [POST  ] 📤 Request details: http://localhost:8000/api/v3/backend/login
  Query: {"redirect": "/dashboard"}
  Headers:
    content-type: application/json
  Body: {...}
```
