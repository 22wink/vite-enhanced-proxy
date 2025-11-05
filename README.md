# Vite Proxy Plugin

一个功能强大的 Vite 代理插件，提供彩色日志、环境切换、过滤器、中间件等高级功能。

## ✨ 特性

- 🎨 **彩色日志** - 美观的控制台输出，支持自定义颜色
- 🔄 **环境切换** - 轻松在多个后端环境间切换
- 📊 **性能监控** - 自动记录请求响应时间
- 🎯 **智能过滤** - 支持请求/响应过滤器
- 🔧 **中间件支持** - 可扩展的请求处理管道
- 📝 **完整的 TypeScript 支持** - 完善的类型定义
- ⚡ **零依赖** - 仅使用 Node.js 内置功能
- 📋 **详细数据记录** - 支持记录请求/响应头、请求体、响应体等详细信息
- 🔍 **查询参数显示** - 自动解析并显示URL查询参数
- 🆕 **动态 targets 与对象化配置** - 不再局限于 v1/v2/v3，任意键与对象式路由

## 📦 安装

```bash
# 使用 npm
npm install vite-enhanced-proxy

# 使用 pnpm
pnpm add vite-enhanced-proxy

# 使用 yarn
yarn add vite-enhanced-proxy
```

## 🚀 快速开始

### 基础用法

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    // 最简单的用法
    createProxyPlugin({
      env: ProxyEnv.Local
    })
  ]
});
```

### 完整配置示例

```typescript
import { defineConfig } from "vite";
import { createProxyPlugin, ProxyEnv, LogLevel } from "vite-enhanced-proxy";

export default defineConfig({
  plugins: [
    createProxyPlugin({
      // 环境配置
      env: ProxyEnv.Local,

      // 日志配置
      logger: {
        level: LogLevel.DEBUG,
        colorful: true,
        timestamp: true,
        showMethod: true,
        showStatus: true,
        prefix: "[API代理]",
        // 详细信息配置
        showRequestHeaders: true,
        showRequestBody: true,
        showResponseHeaders: true,
        showResponseBody: true,
        showQueryParams: true,
        maxBodyLength: 2000,
        prettifyJson: true
      },

      // 启用/禁用
      enabled: true,
      devOnly: true,

      // 过滤器
      requestFilter: (url, method) => url.includes("/api/"),
      responseFilter: (url, method, status) => status >= 400,

      // 自定义代理配置
      customProxyConfig: {
        timeout: 30000
      }
    })
  ]
});
```

### 详细日志配置示例

```typescript
// 仅显示请求详情
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

// 仅显示响应详情
createProxyPlugin({
  env: ProxyEnv.Local,
  logger: {
    level: LogLevel.DEBUG,
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: true,
    showResponseBody: true,
    maxBodyLength: 5000, // 显示更长的响应体
    prettifyJson: true
  }
});

// 完全详细模式
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

## 🎯 配置选项

### ProxyPluginOptions

| 选项                | 类型                     | 默认值           | 描述               |
| ------------------- | ------------------------ | ---------------- | ------------------ |
| `env`               | `ProxyEnv`               | `ProxyEnv.Local` | 代理环境           |
| `targets`           | `Partial<ProxyTargets>`  | -                | 自定义代理目标     |
| `logger`            | `LoggerConfig`           | -                | 日志配置           |
| `requestFilter`     | `RequestFilter`          | -                | 请求过滤器         |
| `responseFilter`    | `ResponseFilter`         | -                | 响应过滤器         |
| `middleware`        | `ProxyMiddleware[]`      | `[]`             | 中间件数组         |
| `customProxyConfig` | `Partial<ProxyOptions>`  | -                | 自定义代理配置     |
| `rewriteRules`      | `Record<string, string>` | -                | URL重写规则        |
| `enabled`           | `boolean`                | `true`           | 是否启用代理       |
| `devOnly`           | `boolean`                | `false`          | 仅在开发模式下启用 |

### LoggerConfig

| 选项                  | 类型       | 默认值          | 描述                |
| --------------------- | ---------- | --------------- | ------------------- |
| `level`               | `LogLevel` | `LogLevel.INFO` | 日志级别            |
| `colorful`            | `boolean`  | `true`          | 是否启用颜色        |
| `timestamp`           | `boolean`  | `true`          | 显示时间戳          |
| `showMethod`          | `boolean`  | `true`          | 显示HTTP方法        |
| `showStatus`          | `boolean`  | `true`          | 显示状态码          |
| `showError`           | `boolean`  | `true`          | 显示错误信息        |
| `prefix`              | `string`   | `'[Proxy]'`     | 日志前缀            |
| `showRequestHeaders`  | `boolean`  | `false`         | 显示请求头详情      |
| `showRequestBody`     | `boolean`  | `false`         | 显示请求体数据      |
| `showResponseHeaders` | `boolean`  | `false`         | 显示响应头详情      |
| `showResponseBody`    | `boolean`  | `false`         | 显示响应体数据      |
| `maxBodyLength`       | `number`   | `1000`          | 请求/响应体最大长度 |
| `prettifyJson`        | `boolean`  | `true`          | 美化JSON格式显示    |
| `showQueryParams`     | `boolean`  | `false`         | 显示查询参数        |

## 🆕 动态 targets 与对象化配置

插件现在支持“任意键 + 字符串或对象”的路由定义方式，兼容旧的 `v1/v2/v3` 字段：

- **字符串形式**：值为目标地址；路径按键名推导（`v3 -> /api/v3`、`v2 -> /api`、`v1 -> /api/v1`、其他键 -> `/{key}`）。
- **对象形式**：可独立配置 `target`、`path`、`rewrite`，三者相互独立；`rewriteRules` 仍可按路径覆盖。

```ts
// proxy.config.ts
import { ProxyEnv } from "vite-enhanced-proxy";

export default {
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      // 旧字段仍可用（路径自动映射）
      v3: "http://localhost:8000/api/v3/backend",
      v2: "http://localhost:8000/api/backend",
      v1: "http://localhost:8000/api/v1/backend",

      // 新增任意键（字符串）：自动推导路径为 /flow
      flow: "http://localhost:8002",

      // 对象形式：完全自定义
      auth: { target: "http://localhost:9000", path: "/api/auth", rewrite: "/auth" },

      // 以 "/" 开头的键可直接作为路径
      "/oss": { target: "https://oss.example.com", rewrite: "/oss" }
    }
  }
};
```

- **rewrite 优先级**：`对象.rewrite > rewriteRules[path] > path 本身`
- **路径推导**：若键为 `v3|v2|v1` 使用预设；否则将键规范化为 `/{key}`
- **类型**：`ProxyTarget = { v1?: string; v2?: string; v3?: string } & Record<string, string | { target: string; path?: string; rewrite?: string }>`

### 迁移指南（从固定 v1/v2/v3 升级）

- 原有 `v1/v2/v3` 写法可原样保留，无需修改。
- 若需要更多路由，直接在 `targets` 中新增任意键；建议使用对象形式以便精细控制。
- 如需自定义重写，可使用对象形式的 `rewrite`，或在 `rewriteRules` 中按路径定义。

### 自定义环境枚举/字符串环境

你可以使用自定义的环境枚举，或直接使用字符串字面量作为环境键。插件的 API 和类型对两种写法都友好：

```ts
// 枚举方式（推荐有明确环境集合时）
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
// 字符串字面量方式（快速/灵活）
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

要点：

- `createProxyPlugin<TEnv extends string>` 泛型参数声明你的环境键集合，获得完整的类型提示与校验。
- `updateEnvironment(env: TEnv)`、`updateTargets(...)` 等方法同样受你的自定义环境类型约束。
- 当未提供 `env` 时，默认使用 `Local`（与旧行为保持一致）。

## 🎨 日志输出示例

```bash
# 正常请求
2024-01-15 14:30:25 [Proxy] [GET   ] 🚀 代理到: http://localhost:8000/api/v3/backend/user
2024-01-15 14:30:25 [Proxy] [GET   ] ✅ 200 http://localhost:8000/api/v3/backend/user (156ms)

# 错误请求
2024-01-15 14:30:26 [Proxy] [POST  ] 🚀 代理到: http://localhost:8000/api/v3/backend/login
2024-01-15 14:30:26 [Proxy] [POST  ] ❌ 404 http://localhost:8000/api/v3/backend/login (89ms)

# 代理错误
2024-01-15 14:30:27 [Proxy] [GET   ] 💥 代理错误: http://localhost:8000/api/v3/backend/test - ECONNREFUSED

# 详细日志示例（启用DEBUG级别时）
2024-01-15 14:30:28 [Proxy] [POST  ] 📤 详细请求: http://localhost:8000/api/v3/backend/login
  查询参数: {"redirect": "/dashboard"}
  请求头:
    content-type: application/json
    authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
  请求体: {
    "username": "admin",
    "password": "******"
  }

2024-01-15 14:30:28 [Proxy] [POST  ] 📥 ✅ 详细响应: 200 http://localhost:8000/api/v3/backend/login (134ms)
  响应头:
    content-type: application/json
    set-cookie: session=abc123; Path=/; HttpOnly
  响应体: {
    "code": 200,
    "message": "登录成功",
    "data": {
      "user": {
        "id": 1,
        "username": "admin"
      },
      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  }
```

## 🔧 高级用法

### 使用过滤器

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,

  // 只记录 POST 请求
  requestFilter: (url, method) => method === "POST",

  // 只记录错误响应
  responseFilter: (url, method, status) => status >= 400
});
```

### 使用中间件

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,
  middleware: [
    // 添加认证头
    async (proxyReq, req, res, options) => {
      proxyReq.setHeader("Authorization", "Bearer " + getToken());
    },

    // 记录请求时间
    async (proxyReq, req, res, options) => {
      console.log(`请求时间: ${new Date().toISOString()}`);
    }
  ]
});
```

### 自定义代理目标（动态键 + 对象化配置）

```typescript
createProxyPlugin({
  env: ProxyEnv.Local,
  targets: {
    [ProxyEnv.Local]: {
      // 兼容旧字段
      v3: "http://my-custom-server:8000/api/v3/backend",
      v2: "http://my-custom-server:8000/api/backend",

      // 任意键（字符串）
      flow: "http://my-custom-server:8002",

      // 对象形式：自定义 path 与 rewrite
      auth: { target: "http://my-auth:9000", path: "/api/auth", rewrite: "/auth" },

      // 直接以路径作为键
      "/oss": { target: "https://oss.example.com", rewrite: "/oss" }
    }
  },
  // 可选：统一重写规则（按路径匹配），对象.rewrite 优先级更高
  rewriteRules: {
    "/flow": "/",
    "/api": "/api"
  }
});
```

### 运行时控制

```typescript
import { ViteProxyPlugin } from "vite-enhanced-proxy";

const plugin = new ViteProxyPlugin({
  env: ProxyEnv.Local
});

// 切换环境
plugin.updateEnvironment(ProxyEnv.Local);

// 禁用代理
plugin.disableProxy();

// 获取状态
const state = plugin.getState();
console.log("当前环境:", state.env);
```

## 🔧 外部配置文件（loadExternalProxyConfig）

插件会在项目根目录自动查找以下任一文件并加载：

- `proxy.config.ts`
- `proxy.config.js`
- `proxy.config.cjs`
- `proxy.config.mjs`
- `proxy.config.json`

规则与行为：

- **查找顺序**按上表从上到下，命中即停止。
- 非 JSON 文件通过动态 import 加载，支持 `default` 导出或直接导出对象。
- JSON 文件使用 `JSON.parse` 读取。
- 加载成功后与内联插件参数合并，**外部配置优先**，随后插件会自动重新初始化状态与日志器。

类型：外部配置的结构与 `ProxyPluginOptions<TEnv>` 一致，可直接复用 README 上文的 `targets`、`logger` 等字段。

### TS 示例（proxy.config.ts）

```ts
import { defineProxyConfig, LogLevel } from "vite-enhanced-proxy";

export default defineProxyConfig({
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
});
```

- 你也可以不使用 `defineProxyConfig`，直接 `export default { ... }`。

### ESM 示例（proxy.config.mjs）

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

### CommonJS 示例（proxy.config.cjs / proxy.config.js）

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

或使用默认导出形式：

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

### JSON 示例（proxy.config.json）

```json
{
  "env": "dev",
  "targets": {
    "dev": {
      "v3": "http://localhost:8000/api/v3/backend",
      "flow": "http://localhost:8002",
      "auth": { "target": "http://localhost:7001", "path": "/api/auth", "rewrite": "/" }
    }
  },
  "rewriteRules": {
    "/flow": "/"
  }
}
```

注意：JSON 中无法书写注释，且不支持函数/枚举常量；若需要更灵活的表达（如引用 `LogLevel`、编写函数中间件等），请使用 TS/JS 形式。

## 🎯 API 参考

### createProxyPlugin(options?)

创建代理插件实例。

**参数：**

- `options` - 可选的配置选项

**返回：**

- Vite Plugin 对象

### ViteProxyPlugin

插件类，用于高级控制。

**方法：**

- `updateEnvironment(env)` - 切换环境
- `updateTargets(targets)` - 更新代理目标
- `enableProxy()` - 启用代理
- `disableProxy()` - 禁用代理
- `getState()` - 获取当前状态

### ProxyLogger

日志工具类。

**方法：**

- `debug(message)` - 调试日志
- `info(message)` - 信息日志
- `warn(message)` - 警告日志
- `error(message)` - 错误日志
- `logRequest(method, url)` - 记录请求
- `logResponse(method, url, status, duration?)` - 记录响应
- `logError(method, url, error)` - 记录错误

## 🐛 故障排除

### 颜色不显示

```typescript
// 检查环境变量
process.env.NO_COLOR = undefined;
process.env.FORCE_COLOR = "1";

// 或者在配置中禁用颜色
createProxyPlugin({
  logger: {
    colorful: false
  }
});
```

### 代理不工作

1. 检查 `enabled` 选项是否为 `true`
2. 确认环境配置正确
3. 检查目标服务器是否可访问

### 日志过多

```typescript
// 调整日志级别
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR // 只显示错误
  }
});

// 或使用过滤器
createProxyPlugin({
  requestFilter: url => url.includes("/重要接口/")
});

// 禁用详细信息
createProxyPlugin({
  logger: {
    level: LogLevel.INFO, // 使用INFO级别，不显示详细信息
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: false,
    showResponseBody: false
  }
});
```

### 详细日志性能影响

当启用详细日志功能时，请注意：

1. **性能影响**: 详细日志会增加内存使用和CPU消耗，特别是在高频请求时
2. **推荐设置**: 在生产环境中建议设置 `level: LogLevel.ERROR` 或更高级别
3. **数据长度限制**: 使用 `maxBodyLength` 控制显示的数据长度，避免控制台输出过长
4. **选择性启用**: 根据调试需要选择性启用特定的详细信息选项

```typescript
// 生产环境推荐配置
createProxyPlugin({
  logger: {
    level: LogLevel.ERROR,
    colorful: false,
    showRequestHeaders: false,
    showRequestBody: false,
    showResponseHeaders: false,
    showResponseBody: false
  },
  devOnly: true // 仅在开发模式启用
});
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
