// 主入口文件
export { createProxyPlugin, ViteProxyPlugin } from "./modules/plugin";

// 导出所有类型和枚举
export type {
  ProxyPluginOptions,
  ProxyTargets,
  ProxyTarget,
  LoggerConfig,
  RequestFilter,
  ResponseFilter,
  ProxyMiddleware,
  PluginState,
  ProxyEvents
} from "./modules/types";

export { ProxyEnv, LogLevel } from "./modules/types";

// 导出日志工具
export { createLogger, ProxyLogger, colors } from "./modules/logger";
