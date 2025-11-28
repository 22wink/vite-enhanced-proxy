---
title: Troubleshooting
---

# Troubleshooting

## No colors in the console

```ts
process.env.NO_COLOR = undefined;
process.env.FORCE_COLOR = "1";

createProxyPlugin({
  logger: {
    colorful: false // set to false if you actually want to disable colors
  }
});
```

## Proxy not working

1. Make sure `enabled` is `true`.
2. If `devOnly: true`, ensure you are running `vite dev`.
3. Check that `env` matches an entry in `targets`.
4. Verify the upstream server is reachable (curl it, inspect packets, etc.).

## Too many logs

```ts
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR
  },
  requestFilter: (url) => url.includes("/critical/api/"),
  responseFilter: (_, __, status) => status >= 500
});
```

## Verbose logs impacting performance

1. Set `level` to `INFO` or `WARN`.
2. Use `maxBodyLength`, `maxWsMessageLength`, `maxSseMessageLength`.
3. Enable `devOnly: true` for production builds.

```ts
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR,
    colorful: false,
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: false,
    showResponseBody: false
  },
  devOnly: true
});
```

## No WebSocket / SSE logs

Check that:

- The `webSocket` / `sse` blocks are enabled for the target.
- `logger.showWsMessages` / `showSseMessages` are `true`.
- `webSocketFilter` is not filtering out the path.

## Still stuck?

- See the [API reference](./api.md) for every method.
- Open an issue on GitHub: <https://github.com/22wink/vite-enhanced-proxy/issues>
