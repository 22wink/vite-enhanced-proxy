import type { ProxyOptions } from "vite";

// 代理环境枚举
export enum ProxyEnv {
  Local = "local"
}

// 允许的环境键：内置枚举或自定义字符串
export type EnvKey = ProxyEnv | (string & {});

// WebSocket 配置选项
export interface WebSocketConfig {
  // 是否启用 WebSocket 代理
  enabled?: boolean;
  // WebSocket 连接超时时间（毫秒）
  timeout?: number;
  // 是否记录 WebSocket 连接日志
  logConnections?: boolean;
  // 是否记录 WebSocket 消息日志
  logMessages?: boolean;
  // 最大消息日志长度
  maxMessageLength?: number;
  // 是否美化 JSON 消息
  prettifyMessages?: boolean;
  // 自定义 WebSocket 头部
  headers?: Record<string, string>;
  // WebSocket 子协议
  protocols?: string | string[];
}

// 路由配置：字符串（仅目标）或对象（包含路径/重写）
export type ProxyRouteConfig =
  | string
  | {
      target: string;
      path?: string; // 自定义匹配路径（不填时按键或默认规则推导）
      rewrite?: string; // 自定义重写前缀
      // WebSocket 配置
      ws?: WebSocketConfig;
    };

// 兼容旧字段，同时支持任意键
type LegacyProxyTarget = {
  v3?: string;
  v2?: string;
  v1?: string;
};

// 代理目标配置（支持任意键和值为字符串或对象）
export type ProxyTarget = LegacyProxyTarget & Record<string, ProxyRouteConfig>;

// 代理目标映射（支持自定义环境键）
export type ProxyTargets<TEnv extends string = EnvKey> = Record<TEnv, ProxyTarget>;

// 日志级别
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

// 日志配置
export interface LoggerConfig {
  level?: LogLevel;
  colorful?: boolean;
  timestamp?: boolean;
  showMethod?: boolean;
  showStatus?: boolean;
  showError?: boolean;
  prefix?: string;
  // 新增详细信息配置
  showRequestHeaders?: boolean;
  showRequestBody?: boolean;
  showResponseHeaders?: boolean;
  showResponseBody?: boolean;
  maxBodyLength?: number;
  prettifyJson?: boolean;
  showQueryParams?: boolean;
  // WebSocket 日志配置
  showWsConnections?: boolean;
  showWsMessages?: boolean;
  maxWsMessageLength?: number;
}

// 过滤器函数类型
export type RequestFilter = (url: string, method: string) => boolean;
export type ResponseFilter = (
  url: string,
  method: string,
  status: number
) => boolean;

// WebSocket 过滤器函数类型
export type WebSocketFilter = (url: string, protocols?: string | string[]) => boolean;

// 中间件函数类型
export type ProxyMiddleware = (
  proxyReq: any,
  req: any,
  res: any,
  options: any
) => void | Promise<void>;

// WebSocket 中间件函数类型
export type WebSocketMiddleware = (
  ws: any,
  req: any,
  socket: any,
  head: Buffer
) => void | Promise<void>;

// 插件配置选项（内部与直接传参使用）
export interface ProxyPluginOptions<TEnv extends string = EnvKey> {
  // 基础配置
  env?: TEnv;
  targets?: Partial<ProxyTargets<TEnv>>;

  // 日志配置
  logger?: LoggerConfig;

  // 过滤器
  requestFilter?: RequestFilter;
  responseFilter?: ResponseFilter;
  webSocketFilter?: WebSocketFilter;

  // 中间件
  middleware?: ProxyMiddleware[];
  wsMiddleware?: WebSocketMiddleware[];

  // 自定义代理配置
  customProxyConfig?: Partial<ProxyOptions>;

  // 重写规则
  rewriteRules?: Record<string, string>;

  // 开发模式特定配置
  devOnly?: boolean;

  // 是否启用代理
  enabled?: boolean;

  // WebSocket 全局配置
  webSocket?: WebSocketConfig;
}

// 外部用户配置（外部文件 proxy.config.* 使用），与插件选项一致
export type ProxyPluginUserConfig<TEnv extends string = EnvKey> = ProxyPluginOptions<TEnv>;

// 内部使用的插件状态
export interface PluginState<TEnv extends string = EnvKey> {
  env: TEnv;
  targets: ProxyTargets<TEnv>;
  logger: Required<LoggerConfig>;
  enabled: boolean;
}

// 代理事件类型
export interface ProxyEvents {
  onProxyReq?: (proxyReq: any, req: any, res: any) => void;
  onProxyRes?: (proxyRes: any, req: any, res: any) => void;
  onError?: (err: Error, req: any, res: any) => void;
  // WebSocket 事件
  onWsOpen?: (ws: any, req: any) => void;
  onWsMessage?: (data: any, req: any) => void;
  onWsClose?: (code: number, reason: string, req: any) => void;
  onWsError?: (err: Error, req: any) => void;
}
