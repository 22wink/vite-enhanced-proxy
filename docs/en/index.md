---
layout: home
title: Home
hero:
  name: vite-enhanced-proxy
  text: The ultimate proxy enhancement plugin for Vite apps
  tagline: Colorful logs, environment switching, middleware, WebSocket/SSE, zero deps—everything you need for smooth debugging
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/22wink/vite-enhanced-proxy
features:
  - title: Colorful logs & observability
    details: Built-in log levels, request/response payloads, query params, plus WebSocket and SSE streams so you can read proxy traffic at a glance.
  - title: Flexible environments & targets
    details: Any environment keys, dynamic targets, URL rewrites, runtime switching—multi-backend collaboration without the headache.
  - title: Middleware & filters
    details: Request/response filters and rich middleware hooks make it easy to inject auth, metrics, tracing, or other custom logic.
  - title: Full types, zero runtime deps
    details: 100% TypeScript with friendly APIs. Ships without extra runtime dependencies so you can install and go.
---

:::: tip Battle-tested for real workloads
The plugin has been refined in multi-team Vite projects, covering HTTP, WebSocket, and SSE proxy scenarios with comprehensive visibility tooling.
::::

Use the navigation links to explore “Guide”, “Configuration”, “Advanced”, and “API”, or start with the topics below:

- `Guide / Getting Started`: installation, basic setup, and full examples
- `Configuration / Core Options`: every available option with defaults
- `Advanced Usage`: filters, middleware, WS/SSE, external config, and more
- `API Reference`: deep dive into `ViteProxyPlugin`, logger helpers, and runtime APIs
