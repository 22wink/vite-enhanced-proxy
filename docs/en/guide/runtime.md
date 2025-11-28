---
title: Runtime Controls
---

# Runtime controls

Besides acting as a regular Vite plugin, vite-enhanced-proxy exposes the `ViteProxyPlugin` class so you can switch environments, toggle the proxy, or inspect state at runtime.

## Getting an instance

```ts
import { ViteProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

const plugin = new ViteProxyPlugin({
  env: ProxyEnv.Local
});

export default defineConfig({
  plugins: [plugin]
});
```

Or grab the internal instance returned by `createProxyPlugin`:

```ts
const proxyPlugin = createProxyPlugin({ env: ProxyEnv.Local });
export default defineConfig({ plugins: [proxyPlugin] });

// after the dev server starts
proxyPlugin.updateEnvironment(ProxyEnv.Prod);
```

## Available methods

| Method | Description |
| --- | --- |
| `updateEnvironment(env)` | Switch the active environment |
| `updateTargets(targets)` | Replace/merge target definitions |
| `enableProxy()` | Enable the proxy |
| `disableProxy()` | Disable the proxy |
| `getState()` | Inspect the current state (env, enabled flag, targets, etc.) |

## Example: CLI switcher

```ts
// scripts/switch-env.ts
import { ViteProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

const plugin = new ViteProxyPlugin({
  env: ProxyEnv.Local
});

plugin.updateEnvironment(process.argv[2] as ProxyEnv);
console.log("Switched to", plugin.getState().env);
```

## Relationship with the Vite dev server

- These methods only work while the dev server is running.
- Switching environments rebuilds the proxy context and loggers.
- `disableProxy` helps compare “direct” vs “proxied” requests quickly.
