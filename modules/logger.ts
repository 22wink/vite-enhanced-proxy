import { type LoggerConfig, LogLevel } from "./types.js";

// ANSI颜色代码
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // 前景色
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // 背景色
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m"
} as const;

// HTTP方法颜色映射
const methodColors = {
  GET: colors.green,
  POST: colors.blue,
  PUT: colors.yellow,
  DELETE: colors.red,
  PATCH: colors.magenta,
  HEAD: colors.cyan,
  OPTIONS: colors.white
} as const;

// 状态码颜色映射
const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.yellow;
  if (status >= 400 && status < 500) return colors.red;
  if (status >= 500) return colors.magenta;
  return colors.white;
};

// 日志级别颜色映射
const levelColors = {
  [LogLevel.ERROR]: colors.red,
  [LogLevel.WARN]: colors.yellow,
  [LogLevel.INFO]: colors.cyan,
  [LogLevel.DEBUG]: colors.gray
} as const;

export class ProxyLogger {
  private config: Required<LoggerConfig>;
  private isColorSupported: boolean;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: LogLevel.INFO,
      colorful: true,
      timestamp: true,
      showMethod: true,
      showStatus: true,
      showError: true,
      prefix: "[Proxy]",
      // 新增配置的默认值
      showRequestHeaders: false,
      showRequestBody: false,
      showResponseHeaders: false,
      showResponseBody: false,
      maxBodyLength: 1000,
      prettifyJson: true,
      showQueryParams: false,
      // WebSocket 配置默认值
      showWsConnections: true,
      showWsMessages: false,
      maxWsMessageLength: 1000,
      ...config
    };

    // 检测颜色支持
    this.isColorSupported = this.detectColorSupport();
  }

  private detectColorSupport(): boolean {
    // 如果用户禁用了颜色
    if (!this.config.colorful) return false;

    // 检查环境变量
    if (process.env.NO_COLOR || process.env.FORCE_COLOR === "0") return false;
    if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== "0") return true;

    // 检查终端支持
    if (process.stdout && process.stdout.isTTY) return true;

    return false;
  }

  private colorize(text: string, color: string): string {
    if (!this.isColorSupported) return text;
    return `${color}${text}${colors.reset}`;
  }

  private formatTimestamp(): string {
    if (!this.config.timestamp) return "";
    const now = new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    return this.colorize(now, colors.gray);
  }

  private formatMethod(method: string): string {
    if (!this.config.showMethod) return "";
    const color =
      methodColors[method as keyof typeof methodColors] || colors.white;
    return `[${this.colorize(method.padEnd(3), color)}]`;
  }

  private formatStatus(status: number): string {
    if (!this.config.showStatus) return "";
    const color = getStatusColor(status);
    return this.colorize(status.toString(), color);
  }

  private formatUrl(url: string): string {
    return this.colorize(url, `${colors.blue}${colors.bright}`);
  }

  private formatPrefix(): string {
    return this.colorize(this.config.prefix, colors.cyan);
  }

  private formatLogLevel(level: keyof typeof levelColors): string {
    const color = levelColors[level];
    // 获取日志级别名称
    const levelNames = {
      [LogLevel.NONE]: "NONE",
      [LogLevel.ERROR]: "ERROR",
      [LogLevel.WARN]: "WARN",
      [LogLevel.INFO]: "INFO",
      [LogLevel.DEBUG]: "DEBUG"
    };
    const levelName = levelNames[level] || "UNKNOWN";
    return this.colorize(`[${levelName}]`, color);
  }

  public shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private log(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) return;

    const parts = [this.formatTimestamp(), this.formatPrefix(), message].filter(
      Boolean
    );

    console.log(parts.join(" "));
  }

  // 公共日志方法
  debug(message: string): void {
    const levelTag = this.formatLogLevel(LogLevel.DEBUG);
    this.log(LogLevel.DEBUG, `${levelTag} ${message}`);
  }

  info(message: string): void {
    const levelTag = this.formatLogLevel(LogLevel.INFO);
    this.log(LogLevel.INFO, `${levelTag} ${message}`);
  }

  warn(message: string): void {
    const levelTag = this.formatLogLevel(LogLevel.WARN);
    this.log(LogLevel.WARN, `${levelTag} ${message}`);
  }

  error(message: string): void {
    const levelTag = this.formatLogLevel(LogLevel.ERROR);
    this.log(LogLevel.ERROR, `${levelTag} ${message}`);
  }

  // 代理专用日志方法
  logRequest(method: string, url: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const parts = [
      this.formatTimestamp(),
      this.formatPrefix(),
      this.formatMethod(method),
      this.colorize("🚀 代理到:", colors.cyan),
      this.formatUrl(url)
    ].filter(Boolean);

    console.log(parts.join(" "));
  }

  logResponse(
    method: string,
    url: string,
    status: number,
    duration?: number
  ): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    // 根据状态码选择图标
    const statusIcon =
      status >= 200 && status < 300 ? "✅" : status >= 400 ? "❌" : "⚠️";

    const durationText = duration ? ` (${duration}ms)` : "";
    const parts = [
      this.formatTimestamp(),
      this.formatPrefix(),
      this.formatMethod(method),
      `${statusIcon} ${this.formatStatus(status)}`,
      this.formatUrl(url) + this.colorize(durationText, colors.gray)
    ].filter(Boolean);

    console.log(parts.join(" "));
  }

  logError(method: string, url: string, error: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const parts = [
      this.formatTimestamp(),
      this.formatPrefix(),
      this.formatMethod(method),
      this.colorize("💥 代理错误:", colors.red),
      this.formatUrl(url),
      "-",
      this.colorize(error.message, colors.red)
    ].filter(Boolean);

    console.log(parts.join(" "));
  }

  // ... (其余方法保持不变，为了简洁省略了详细日志等方法)
  // 用户可以从原 logger.ts 复制完整内容

  // 创建子logger
  createChild(prefix: string): ProxyLogger {
    return new ProxyLogger({
      ...this.config,
      prefix: `${this.config.prefix}:${prefix}`
    });
  }

  // 更新配置
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isColorSupported = this.detectColorSupport();
  }
}

// 创建默认logger实例
export const createLogger = (config?: LoggerConfig): ProxyLogger => {
  return new ProxyLogger(config);
};

// 导出颜色常量供外部使用
export { colors };
