# vite-enhanced-proxy

![npm version](https://img.shields.io/npm/v/vite-enhanced-proxy.svg)
![npm downloads](https://img.shields.io/npm/dm/vite-enhanced-proxy.svg)
![license](https://img.shields.io/npm/l/vite-enhanced-proxy.svg)

English | [中文](README.zh_CN.md)
A powerful Vite proxy plugin with advanced features including colored logs, environment switching, filters, middleware, and more.

## ✨ Features

- 🎨 **Colored Logs** - Beautiful console output with customizable colors
- 🔄 **Environment Switching** - Easily switch between multiple backend environments
- 📊 **Performance Monitoring** - Automatically record request/response times
- 🎯 **Smart Filtering** - Support for request/response filters
- 🔧 **Middleware Support** - Extensible request processing pipeline
- 📝 **Full TypeScript Support** - Complete type definitions
- ⚡ **Zero Dependencies** - Uses only Node.js built-in features
- 📋 **Detailed Data Logging** - Support for logging request/response headers, request/response bodies, and more
- 🔍 **Query Parameter Display** - Automatically parse and display URL query parameters
- 🆕 **Dynamic Targets & Object-based Configuration** - No longer limited to v1/v2/v3, supports arbitrary keys and object-based routing
- 🔌 **WebSocket Support** - Full WebSocket proxy support, including connection logging and message recording
- 📡 **SSE Support** - Server-Sent Events proxy support, real-time event stream processing

## 📦 Installation

```bash
# Using npm
npm install vite-enhanced-proxy

# Using pnpm
pnpm add vite-enhanced-proxy

# Using yarn
yarn add vite-enhanced-proxy
```

## 🚀 Quick Start

### Basic Usage

**TypeScript Example:**

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    // Simplest usage
    createProxyPlugin({
      env: ProxyEnv.Local
    })
  ]
});
```

**JavaScript Example:**

```javascript
// vite.config.js (ES Module)
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    // Simplest usage
    createProxyPlugin({
      env: ProxyEnv.Local
    })
  ]
});
```

```javascript
// vite.config.js (CommonJS)
const { defineConfig } = require("vite");
const { createProxyPlugin, ProxyEnv } = require("vite-enhanced-proxy");

module.exports = defineConfig({
  plugins: [
    // Simplest usage
    createProxyPlugin({
      env: ProxyEnv.Local
    })
  ]
});
```

### Complete Configuration Example

```typescript
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv, LogLevel } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    createProxyPlugin({
      // Environment configuration
      env: ProxyEnv.Local,

      // Logger configuration
      logger: {
        level: LogLevel.DEBUG,
        colorful: true,
        timestamp: true,
        showMethod: true,
        showStatus: true,
        prefix: "[API Proxy]",
        // Detailed information configuration
        showRequestHeaders: true,
        showRequestBody: true,
        showResponseHeaders: true,
        showResponseBody: true,
        showQueryParams: true,
        maxBodyLength: 2000,
        prettifyJson: true
      },

      // Enable/Disable
      enabled: true,
      devOnly: true,

      // Filters
      requestFilter: (url, method) => url.includes("/api/"),
      responseFilter: (url, method, status) => status >= 400,

      // Custom proxy configuration
      customProxyConfig: {
        timeout: 30000
      }
    })
  ]
});
```

### Detailed Log Configuration Example

```typescript
// Show only request details
createProxyPlugin({
  env: ProxyEnv.Local,
  logger: {
    level: LogLevel.DEBUG,
    showRequestHeaders: true,
    showRequestBody: true,
    showQueryParams: true,
    showResponseHeaders: false,
    showResponseBody: false
  }
});

// Show only response details
createProxyPlugin({
  env: ProxyEnv.Local,
  logger: {
    level: LogLevel.DEBUG,
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: true,
    showResponseBody: true,
    maxBodyLength: 5000, // Show longer response body
    prettifyJson: true
  }
});

// Full detailed mode
createProxyPlugin({
  env: ProxyEnv.Local,
  logger: {
    level: LogLevel.DEBUG,
    showRequestHeaders: true,
    showRequestBody: true,
    showResponseHeaders: true,
    showResponseBody: true,
    showQueryParams: true,
    maxBodyLength: 10000,
    prettifyJson: true
  }
});
```

## 🎯 Configuration Options

### ProxyPluginOptions

| Option              | Type                      | Default           | Description                    |
| ------------------- | ------------------------- | ----------------- | ------------------------------ |
| `env`               | `ProxyEnv`                | `ProxyEnv.Local`  | Proxy environment              |
| `targets`           | `Partial<ProxyTargets>`   | -                 | Custom proxy targets           |
| `logger`            | `LoggerConfig`            | -                 | Logger configuration           |
| `requestFilter`     | `RequestFilter`           | -                 | Request filter                 |
| `responseFilter`    | `ResponseFilter`          | -                 | Response filter                |
| `middleware`        | `ProxyMiddleware[]`       | `[]`              | Middleware array               |
| `wsMiddleware`      | `WebSocketMiddleware[]`   | `[]`              | WebSocket middleware array     |
| `sseMiddleware`     | `SSEMiddleware[]`         | `[]`              | SSE middleware array           |
| `webSocketFilter`   | `WebSocketFilter`         | -                 | WebSocket filter               |
| `customProxyConfig` | `Partial<ProxyOptions>`   | -                 | Custom proxy configuration     |
| `rewriteRules`      | `Record<string, string>`  | -                 | URL rewrite rules              |
| `webSocket`         | `WebSocketConfig`         | -                 | Global WebSocket configuration  |
| `sse`               | `SSEConfig`               | -                 | Global SSE configuration       |
| `enabled`           | `boolean`                 | `true`            | Whether to enable proxy        |
| `devOnly`           | `boolean`                 | `false`           | Enable only in development mode |

### LoggerConfig

| Option                  | Type       | Default          | Description                        |
| ----------------------- | ---------- | ---------------- | ---------------------------------- |
| `level`                 | `LogLevel` | `LogLevel.INFO`  | Log level                          |
| `colorful`              | `boolean`  | `true`           | Whether to enable colors           |
| `timestamp`             | `boolean`  | `true`           | Show timestamp                     |
| `showMethod`             | `boolean`  | `true`           | Show HTTP method                   |
| `showStatus`             | `boolean`  | `true`           | Show status code                   |
| `showError`              | `boolean`  | `true`           | Show error information             |
| `prefix`                | `string`   | `'[Proxy]'`      | Log prefix                         |
| `showRequestHeaders`     | `boolean`  | `false`          | Show request header details        |
| `showRequestBody`        | `boolean`  | `false`          | Show request body data             |
| `showResponseHeaders`    | `boolean`  | `false`          | Show response header details       |
| `showResponseBody`       | `boolean`  | `false`          | Show response body data            |
| `maxBodyLength`          | `number`   | `1000`           | Maximum length of request/response body |
| `prettifyJson`           | `boolean`  | `true`           | Prettify JSON format display       |
| `showQueryParams`        | `boolean`  | `false`          | Show query parameters              |
| `showWsConnections`      | `boolean`  | `false`          | Show WebSocket connection logs     |
| `showWsMessages`         | `boolean`  | `false`          | Show WebSocket message logs        |
| `maxWsMessageLength`     | `number`   | `1000`           | Maximum WebSocket message length   |
| `showSseConnections`     | `boolean`  | `false`          | Show SSE connection logs           |
| `showSseMessages`        | `boolean`  | `false`          | Show SSE message logs              |
| `maxSseMessageLength`    | `number`   | `1000`           | Maximum SSE message length         |

## 🆕 Dynamic Targets & Object-based Configuration

The plugin now supports "arbitrary keys + string or object" routing definition, compatible with the old `v1/v2/v3` fields:

- **String form**: Value is the target address; path is derived from the key name (`v3 -> /api/v3`, `v2 -> /api`, `v1 -> /api/v1`, other keys -> `/{key}`).
- **Object form**: Can independently configure `target`, `path`, `rewrite`, all three are independent; `rewriteRules` can still override by path.

```ts
// proxy.config.ts
import { ProxyEnv } from "vite-enhanced-proxy";

export default {
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      // Old fields still available (path auto-mapped)
      v3: "http://localhost:8000/api/v3/backend",
      v2: "http://localhost:8000/api/backend",
      v1: "http://localhost:8000/api/v1/backend",

      // New arbitrary keys (string): automatically derive path as /flow
      flow: "http://localhost:8002",

      // Object form: fully customizable
      auth: { target: "http://localhost:9000", path: "/api/auth", rewrite: "/auth" },

      // Keys starting with "/" can be used directly as paths
      "/oss": { target: "https://oss.example.com", rewrite: "/oss" }
    }
  }
};
```

- **Rewrite priority**: `object.rewrite > rewriteRules[path] > path itself`
- **Path derivation**: If key is `v3|v2|v1` use preset; otherwise normalize key to `/{key}`
- **Type**: `ProxyTarget = { v1?: string; v2?: string; v3?: string } & Record<string, string | { target: string; path?: string; rewrite?: string }>`

### Migration Guide (Upgrading from Fixed v1/v2/v3)

- The original `v1/v2/v3` syntax can be kept as-is, no changes needed.
- If you need more routes, simply add arbitrary keys in `targets`; object form is recommended for fine-grained control.
- For custom rewrites, use the object form's `rewrite`, or define in `rewriteRules` by path.

### Custom Environment Enum/String Environment

You can use custom environment enums, or directly use string literals as environment keys. The plugin's API and types are friendly to both approaches:

```ts
// Enum approach (recommended when you have a clear set of environments)
import { defineConfig } from "vite";
import { createProxyPlugin } from "vite-enhanced-proxy";

export enum MyEnv {
  Dev = "dev",
  Test = "test",
  Prod = "prod"
}

export default defineConfig({
  plugins: [
    createProxyPlugin<MyEnv>({
      env: MyEnv.Dev,
      targets: {
        [MyEnv.Dev]: {
          v3: "http://localhost:8000/api/v3/backend",
          "/oss": { target: "http://localhost:9000", rewrite: "/oss" }
        },
        [MyEnv.Test]: {
          v3: "https://test.example.com/api/v3/backend"
        },
        [MyEnv.Prod]: {
          api: { target: "https://api.example.com", path: "/api", rewrite: "/" }
        }
      }
    })
  ]
});
```

```ts
// String literal approach (quick/flexible)
import { defineConfig } from "vite";
import { createProxyPlugin } from "vite-enhanced-proxy";

type Env = "dev" | "test" | "prod";

export default defineConfig({
  plugins: [
    createProxyPlugin<Env>({
      env: "dev",
      targets: {
        dev: {
          flow: "http://localhost:8002",
          auth: { target: "http://localhost:7001", path: "/api/auth", rewrite: "/" }
        },
        test: {
          v2: "https://test.example.com/api"
        },
        prod: {
          "/api": { target: "https://api.example.com", rewrite: "/" }
        }
      }
    })
  ]
});
```

Key points:

- `createProxyPlugin<TEnv extends string>` generic parameter declares your environment key set, providing complete type hints and validation.
- Methods like `updateEnvironment(env: TEnv)`, `updateTargets(...)` are also constrained by your custom environment type.
- When `env` is not provided, defaults to `Local` (consistent with old behavior).

## 🎨 Log Output Examples

```bash
# Normal request
2024-01-15 14:30:25 [Proxy] [GET   ] 🚀 Proxying to: http://localhost:8000/api/v3/backend/user
2024-01-15 14:30:25 [Proxy] [GET   ] ✅ 200 http://localhost:8000/api/v3/backend/user (156ms)

# Error request
2024-01-15 14:30:26 [Proxy] [POST  ] 🚀 Proxying to: http://localhost:8000/api/v3/backend/login
2024-01-15 14:30:26 [Proxy] [POST  ] ❌ 404 http://localhost:8000/api/v3/backend/login (89ms)

# Proxy error
2024-01-15 14:30:27 [Proxy] [GET   ] 💥 Proxy error: http://localhost:8000/api/v3/backend/test - ECONNREFUSED

# Detailed log example (when DEBUG level is enabled)
2024-01-15 14:30:28 [Proxy] [POST  ] 📤 Detailed request: http://localhost:8000/api/v3/backend/login
  Query params: {"redirect": "/dashboard"}
  Request headers:
    content-type: application/json
    authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
  Request body: {
    "username": "admin",
    "password": "******"
  }

2024-01-15 14:30:28 [Proxy] [POST  ] 📥 ✅ Detailed response: 200 http://localhost:8000/api/v3/backend/login (134ms)
  Response headers:
    content-type: application/json
    set-cookie: session=abc123; Path=/; HttpOnly
  Response body: {
    "code": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "username": "admin"
      },
      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  }
```

## 🔧 Advanced Usage

### Using Filters

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,

  // Only log POST requests
  requestFilter: (url, method) => method === "POST",

  // Only log error responses
  responseFilter: (url, method, status) => status >= 400
});
```

### Using Middleware

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,
  middleware: [
    // Add authentication header
    async (proxyReq, req, res, options) => {
      proxyReq.setHeader("Authorization", "Bearer " + getToken());
    },

    // Record request time
    async (proxyReq, req, res, options) => {
      console.log(`Request time: ${new Date().toISOString()}`);
    }
  ]
});
```

### WebSocket Proxy Support

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      // WebSocket proxy configuration
      "/ws": {
        target: "ws://localhost:3000",
        ws: {
          enabled: true,
          logConnections: true,
          logMessages: true,
          maxMessageLength: 2000,
          prettifyMessages: true,
          timeout: 30000
        }
      }
    }
  },
  // WebSocket middleware
  wsMiddleware: [
    async (ws, req, socket, head) => {
      // Execute when WebSocket connection is established
      console.log("WebSocket connection established:", req.url);
    }
  ],
  // WebSocket filter
  webSocketFilter: (url, protocols) => {
    // Only proxy specific WebSocket connections
    return url.startsWith("/ws/");
  },
  // Global WebSocket configuration
  webSocket: {
    enabled: true,
    logConnections: true,
    logMessages: true
  },
  // WebSocket log configuration
  logger: {
    showWsConnections: true,
    showWsMessages: true,
    maxWsMessageLength: 2000
  }
});
```

### SSE (Server-Sent Events) Proxy Support

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      // SSE proxy configuration
      "/events": {
        target: "http://localhost:3000",
        sse: {
          enabled: true,
          logConnections: true,
          logMessages: true,
          maxMessageLength: 2000,
          prettifyMessages: true,
          retryInterval: 3000,
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      }
    }
  },
  // SSE middleware
  sseMiddleware: [
    async (proxyReq, req, res, options) => {
      // Execute before SSE request is sent
      proxyReq.setHeader("Authorization", "Bearer " + getToken());
    }
  ],
  // Global SSE configuration
  sse: {
    enabled: true,
    logConnections: true,
    logMessages: true
  },
  // SSE log configuration
  logger: {
    showSseConnections: true,
    showSseMessages: true,
    maxSseMessageLength: 2000
  }
});
```

### Custom Proxy Targets (Dynamic Keys + Object-based Configuration)

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      // Compatible with old fields
      v3: "http://my-custom-server:8000/api/v3/backend",
      v2: "http://my-custom-server:8000/api/backend",

      // Arbitrary keys (string)
      flow: "http://my-custom-server:8002",

      // Object form: custom path and rewrite
      auth: { target: "http://my-auth:9000", path: "/api/auth", rewrite: "/auth" },

      // Use path directly as key
      "/oss": { target: "https://oss.example.com", rewrite: "/oss" }
    }
  },
  // Optional: unified rewrite rules (matched by path), object.rewrite has higher priority
  rewriteRules: {
    "/flow": "/",
    "/api": "/api"
  }
});
```

### Runtime Control

```typescript
import { ViteProxyPlugin } from "vite-enhanced-proxy";

const plugin = new ViteProxyPlugin({
  env: ProxyEnv.Local
});

// Switch environment
plugin.updateEnvironment(ProxyEnv.Local);

// Disable proxy
plugin.disableProxy();

// Get state
const state = plugin.getState();
console.log("Current environment:", state.env);
```

## 🔧 External Configuration File (loadExternalProxyConfig)

The plugin automatically searches for and loads any of the following files in the project root:

- `proxy.config.ts`
- `proxy.config.js`
- `proxy.config.cjs`
- `proxy.config.mjs`
- `proxy.config.json`

Rules and behavior:

- **Search order** is top to bottom as listed above, stops on first match.
- Non-JSON files are loaded via dynamic import, supporting `default` export or direct object export.
- JSON files are read using `JSON.parse`.
- After successful loading, merged with inline plugin parameters, **external configuration takes priority**, then the plugin automatically reinitializes state and logger.

Type: The structure of external configuration is consistent with `ProxyPluginOptions<TEnv>`, can directly reuse fields like `targets`, `logger`, etc. from the README above.

### TS Example (proxy.config.ts)

```ts
import { LogLevel } from "vite-enhanced-proxy";

// Can directly export configuration object, or use type hints
export default {
  env: "dev",
  logger: { level: LogLevel.INFO },
  targets: {
    dev: {
      v3: "http://localhost:8000/api/v3/backend",
      flow: "http://localhost:8002",
      auth: { target: "http://localhost:7001", path: "/api/auth", rewrite: "/" }
    },
    prod: {
      "/api": { target: "https://api.example.com", rewrite: "/" }
    }
  },
  rewriteRules: {
    "/flow": "/"
  }
};
```

- Note: The `defineProxyConfig` function is mainly for type hints, not required. You can directly `export default { ... }`.

### ESM Example (proxy.config.mjs)

```js
export default {
  env: "dev",
  targets: {
    dev: {
      v2: "http://localhost:8000/api"
    }
  }
};
```

### CommonJS Example (proxy.config.cjs / proxy.config.js)

```js
module.exports = {
  env: "dev",
  targets: {
    dev: {
      v1: "http://localhost:8000/api/v1/backend",
      "/oss": { target: "http://localhost:9000", rewrite: "/oss" }
    }
  }
};
```

Or using default export form:

```js
exports.default = {
  env: "prod",
  targets: {
    prod: {
      "/api": { target: "https://api.example.com", rewrite: "/" }
    }
  }
};
```

### JSON Example (proxy.config.json)

```json
{
  "env": "dev",
  "targets": {
    "dev": {
      "v3": "http://localhost:8000/api/v3/backend",
      "flow": "http://localhost:8002",
      "auth": { "target": "http://localhost:7001", "path": "/api/auth", "rewrite": "/" },
      "/ws": {
        "target": "ws://localhost:3000",
        "ws": {
          "enabled": true,
          "logConnections": true,
          "logMessages": true
        }
      },
      "/events": {
        "target": "http://localhost:3000",
        "sse": {
          "enabled": true,
          "logConnections": true,
          "logMessages": true,
          "retryInterval": 3000
        }
      }
    }
  },
  "rewriteRules": {
    "/flow": "/"
  }
}
```

Note: JSON cannot contain comments and does not support functions/enum constants; if you need more flexible expressions (like referencing `LogLevel`, writing function middleware, etc.), please use TS/JS form.

## 🎯 API Reference

### createProxyPlugin(options?)

Create a proxy plugin instance.

**Parameters:**

- `options` - Optional configuration options

**Returns:**

- Vite Plugin object

### ViteProxyPlugin

Plugin class for advanced control.

**Methods:**

- `updateEnvironment(env)` - Switch environment
- `updateTargets(targets)` - Update proxy targets
- `enableProxy()` - Enable proxy
- `disableProxy()` - Disable proxy
- `getState()` - Get current state

### ProxyLogger

Logging utility class.

**Methods:**

- `debug(message)` - Debug log
- `info(message)` - Info log
- `warn(message)` - Warning log
- `error(message)` - Error log
- `logRequest(method, url)` - Log request
- `logResponse(method, url, status, duration?)` - Log response
- `logError(method, url, error)` - Log error
- `logWebSocketConnection(url, protocols?)` - Log WebSocket connection
- `logWebSocketMessage(url, message, direction)` - Log WebSocket message
- `logSSEConnection(method, url)` - Log SSE connection
- `logSSEMessage(url, message)` - Log SSE message

### WebSocketConfig

WebSocket configuration options.

**Properties:**

- `enabled` - Whether to enable WebSocket proxy (default: `true`)
- `timeout` - WebSocket connection timeout (milliseconds)
- `logConnections` - Whether to log connections (default: `false`)
- `logMessages` - Whether to log messages (default: `false`)
- `maxMessageLength` - Maximum message log length (default: `1000`)
- `prettifyMessages` - Whether to prettify JSON messages (default: `true`)
- `headers` - Custom WebSocket headers
- `protocols` - WebSocket subprotocols

### SSEConfig

SSE (Server-Sent Events) configuration options.

**Properties:**

- `enabled` - Whether to enable SSE proxy (default: `true`)
- `logConnections` - Whether to log connections (default: `false`)
- `logMessages` - Whether to log messages (default: `false`)
- `maxMessageLength` - Maximum message log length (default: `1000`)
- `prettifyMessages` - Whether to prettify JSON messages (default: `true`)
- `headers` - Custom SSE response headers
- `retryInterval` - SSE reconnection interval (milliseconds, default: `3000`)

## 🐛 Troubleshooting

### Colors Not Displaying

```typescript
// Check environment variables
process.env.NO_COLOR = undefined;
process.env.FORCE_COLOR = "1";

// Or disable colors in configuration
createProxyPlugin({
  logger: {
    colorful: false
  }
});
```

### Proxy Not Working

1. Check if `enabled` option is `true`
2. Confirm environment configuration is correct
3. Check if target server is accessible

### Too Many Logs

```typescript
// Adjust log level
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR // Only show errors
  }
});

// Or use filters
createProxyPlugin({
  requestFilter: url => url.includes("/important-endpoint/")
});

// Disable detailed information
createProxyPlugin({
  logger: {
    level: LogLevel.INFO, // Use INFO level, don't show detailed information
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: false,
    showResponseBody: false
  }
});
```

### Detailed Log Performance Impact

When detailed logging is enabled, please note:

1. **Performance Impact**: Detailed logs will increase memory usage and CPU consumption, especially during high-frequency requests
2. **Recommended Settings**: In production environments, it's recommended to set `level: LogLevel.ERROR` or higher
3. **Data Length Limit**: Use `maxBodyLength` to control displayed data length, avoid overly long console output
4. **Selective Enablement**: Selectively enable specific detailed information options based on debugging needs

```typescript
// Production environment recommended configuration
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR,
    colorful: false,
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: false,
    showResponseBody: false
  },
  devOnly: true // Enable only in development mode
});
```

## 📄 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!
