# Test 应用（SSE & Proxy Playground）

`test/` 目录现在是一个完整的 Vite + TypeScript 工程，用于验证 `vite-enhanced-proxy` 在 SSE、HTTPS、WS/WSS 等场景下的表现。它包含一个带自签名证书的多协议后端以及可视化前端控制台。

## 目录结构

```text
test/
├── server/
│   ├── src/             # TypeScript 源码（SSE / WS / HTTP(S) 模块化拆分）
│   └── dist/            # `npm run server:build` 输出
├── src/
│   ├── main.ts          # 前端入口，协调状态和交互
│   ├── modules/         # 功能模块（SSE/WS 客户端、代理调试、UI 工具等）
│   └── styles/          # 独立样式文件
├── index.html           # Vite HTML 模板（语义化 DOM）
├── vite.config.ts       # 使用 vite-enhanced-proxy 的配置
├── package.json         # 测试工程依赖和脚本
└── README.md            # 本文件
```

## 快速开始

1. **在仓库根目录构建插件（如有必要）**

   ```bash
   npm run build
   ```

2. **安装测试工程依赖**

   ```bash
   cd test
   npm install
   ```

3. **一键启动（推荐）**

   ```bash
   npm start
   ```

   - `npm run server:dev`：启动 HTTP/HTTPS/SSE/WS/WSS 后端并自动生成自签名证书
   - `npm run dev`：启动 Vite 前端，端口 `5173`

> 也可以在两个终端分别运行 `npm run server:dev` 和 `npm run dev`；或使用 `npm run server:start` 启动编译后的产物。

## 可用脚本

| 命令                | 说明                                             |
| ------------------- | ------------------------------------------------ |
| `npm run server:dev`| 直接使用 `tsx` 运行 TypeScript 后端（热重载体验） |
| `npm run server:build` | 编译后端到 `server/dist`                        |
| `npm run server:start` | 以 Node.js 运行编译后的后端                      |
| `npm run dev`       | 启动 Vite 前端（使用代理插件）                     |
| `npm run build`     | 生产构建前端                                      |
| `npm run preview`   | 预览生产构建                                      |
| `npm run start`     | 使用 concurrently 同时启动前后端                   |

## 前端功能

- **SSE 控制台**
  - 多端点切换（基础、自定义重试、错误模拟）
  - 连接状态/耗时/消息数实时统计
  - 广播消息下发、自动日志滚动、JSON 高亮
  - TypeScript 模块化：`sseClient`、`statusManager`、`messageLog`、`connectionTimer`

- **WebSocket 调试面板（新增）**
  - 预设代理/直连端点，覆盖 `WS` 与 `WSS`
  - 一键连接/断开/发送消息，自动解析 JSON
  - 独立状态信息（连接状态、连接时长）与日志分类（WS/WSS）
  - 自动落入统一的消息日志，方便与终端代理日志对照

- **代理调试面板**
  - 自定义 method / body
  - HTTPS 选项可视化（secure / rejectUnauthorized）
  - 请求/响应详情（状态徽章、耗时、响应体、请求配置）

## 后端端点速览

- `GET /api/sse`、`/api/sse/custom-retry`、`/api/sse/error`
- `POST /api/sse/broadcast`
- `GET /api/test`、`/api/http-test`、`/api/https-test`
- `GET /health`
- `WS ws://localhost:3003`（通过代理 `/ws`） / `WSS wss://localhost:3004`（通过代理 `/wss`）

## 调试提示

1. 前端所有请求都通过 `vite-enhanced-proxy`，可在终端观察彩色日志。
2. HTTPS/WSS 使用自签名证书，可通过访问 `https://localhost:3002` 提前信任。
3. 广播请求和代理请求的所有细节会落在统一的消息面板里，方便对照终端日志。

Enjoy hacking ✨
