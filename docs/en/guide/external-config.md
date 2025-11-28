---
title: External Config
---

# External config files

The plugin can auto-load proxy configs from the project root and merge them with inline options. Supported filenames in priority order (top wins):

1. `proxy.config.ts`
2. `proxy.config.js`
3. `proxy.config.cjs`
4. `proxy.config.mjs`
5. `proxy.config.json`

The search stops as soon as a file is found.

## TypeScript example

```ts
// proxy.config.ts
import { LogLevel } from "vite-enhanced-proxy";

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

## ESM / CJS

```js
// proxy.config.mjs
export default {
  env: "dev",
  targets: {
    dev: { v2: "http://localhost:8000/api" }
  }
};
```

```js
// proxy.config.cjs
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

## JSON

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
        "ws": { "enabled": true, "logConnections": true, "logMessages": true }
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

> JSON cannot include functions, enums, or comments. Use TS/JS if you need middleware or `LogLevel`.

## Merge strategy

1. **External config wins**: when fields overlap, external values override inline ones.
2. **Runtime methods**: `plugin.updateTargets()` and friends operate on the merged result.
3. **Hot reload**: whenever the Vite dev server reloads the plugin it rereads the config file, enabling collaborative edits.

## defineProxyConfig

For stronger TypeScript inference you can wrap the export with an optional `defineProxyConfig` helper (if present). It only affects types, not runtime behavior.
