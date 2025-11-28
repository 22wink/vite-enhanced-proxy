---
title: API Reference
---

# API reference

## createProxyPlugin(options?)

Creates and returns a Vite-compliant plugin instance. In most cases you add it directly to the `plugins` array inside `vite.config.ts`.

- `options`: optional [`ProxyPluginOptions`](./configuration.md).
- **Return value**: a Vite plugin with extra runtime helpers (callable once the dev server initializes).

## ViteProxyPlugin

The class constructor used internally by `createProxyPlugin`. Useful when you want to hold the instance explicitly or reuse it outside of the Vite config file.

```ts
import { ViteProxyPlugin } from "vite-enhanced-proxy";

const plugin = new ViteProxyPlugin({ env: ProxyEnv.Local });
plugin.updateEnvironment(ProxyEnv.Test);
```

### Instance methods

| Method | Description |
| --- | --- |
| `updateEnvironment(env)` | Switch the active environment |
| `updateTargets(partialTargets)` | Merge or override proxy targets |
| `enableProxy()` | Enable the proxy |
| `disableProxy()` | Disable the proxy |
| `getState()` | Returns `{ env, enabled, targets }` and related info |

## ProxyLogger

A helper class for structured logging. Usually you don't instantiate it manually, but you can reuse it for custom scenarios.

| Method | Description |
| --- | --- |
| `debug(message)` | Emit a debug log |
| `info(message)` | Emit an info log |
| `warn(message)` | Emit a warning |
| `error(message)` | Emit an error |
| `logRequest(method, url)` | Log a request |
| `logResponse(method, url, status, duration?)` | Log a response |
| `logError(method, url, error)` | Log a proxy error |
| `logWebSocketConnection(url, protocols?)` | WS connection log |
| `logWebSocketMessage(url, message, direction)` | WS message log |
| `logSSEConnection(method, url)` | SSE connection log |
| `logSSEMessage(url, message)` | SSE message log |

## Type helpers

- `ProxyEnv`: built-in env enum (`Local/Test/Dev/Sit/Uat/Prod`)
- `LogLevel`: log level enum
- `WebSocketConfig` / `SSEConfig`: WS/SSE option objects
- `ProxyPluginOptions<TEnv extends string = ProxyEnv>`: generic config type; pass your own `TEnv` for stricter typing

```ts
export enum MyEnv {
  Dev = "dev",
  Test = "test",
  Prod = "prod"
}

createProxyPlugin<MyEnv>({
  env: MyEnv.Dev,
  targets: {
    [MyEnv.Dev]: { v3: "http://localhost:8000/api/v3/backend" },
    [MyEnv.Test]: { v3: "https://test.example.com/api/v3/backend" }
  }
});
```

## Compatibility

- Vite: `^3 - ^7`
- Node.js: `>= 16`

Check GitHub Releases for the latest changes and upgrade notes.
