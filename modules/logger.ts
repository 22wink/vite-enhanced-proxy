import { type LoggerConfig, LogLevel } from "./types";

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
const levelColors: Record<LogLevel, string> = {
  [LogLevel.NONE]: colors.gray,
  [LogLevel.ERROR]: colors.red,
  [LogLevel.WARN]: colors.yellow,
  [LogLevel.INFO]: colors.cyan,
  [LogLevel.DEBUG]: colors.gray
};

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

  private formatLogLevel(level: LogLevel): string {
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

  // 数据格式化方法
  private formatData(data: any, maxLength?: number): string {
    if (!data) return this.colorize("无数据", colors.gray);

    let content: string;

    try {
      if (typeof data === "string") {
        content = data;
      } else if (typeof data === "object") {
        content = this.config.prettifyJson
          ? JSON.stringify(data, null, 2)
          : JSON.stringify(data);
      } else {
        content = String(data);
      }

      // 限制长度
      const limit = maxLength || this.config.maxBodyLength || 1000;
      if (content.length > limit) {
        content =
          content.substring(0, limit) +
          this.colorize("...(已截断)", colors.gray);
      }

      return this.colorize(content, colors.white);
    } catch (error) {
      return this.colorize(`格式化失败: ${error}`, colors.red);
    }
  }

  private formatHeaders(headers: Record<string, any>): string {
    if (!headers || Object.keys(headers).length === 0) {
      return this.colorize("无请求头", colors.gray);
    }

    const headerLines = Object.entries(headers)
      .map(
        ([key, value]) =>
          `    ${this.colorize(key, colors.cyan)}: ${this.colorize(String(value), colors.white)}`
      )
      .join("\n");

    return `\n${headerLines}`;
  }

  private formatQueryParams(url: string): string {
    try {
      const urlObj = new URL(
        url.startsWith("http") ? url : `http://localhost${url}`
      );
      const params = Object.fromEntries(urlObj.searchParams);

      if (Object.keys(params).length === 0) {
        return this.colorize("无查询参数", colors.gray);
      }

      return this.formatData(params);
    } catch {
      return this.colorize("解析查询参数失败", colors.red);
    }
  }

  // 详细请求日志
  logDetailedRequest(
    method: string,
    url: string,
    options: {
      headers?: Record<string, any>;
      body?: any;
      queryParams?: boolean;
    } = {}
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const parts = [
      this.formatTimestamp(),
      this.formatPrefix(),
      this.formatMethod(method),
      this.colorize("📤 详细请求:", colors.blue),
      this.formatUrl(url)
    ].filter(Boolean);

    console.log(parts.join(" "));

    // 显示查询参数
    if (this.config.showQueryParams && options.queryParams !== false) {
      console.log(
        `  ${this.colorize("查询参数:", colors.yellow)} ${this.formatQueryParams(url)}`
      );
    }

    // 显示请求头
    if (this.config.showRequestHeaders && options.headers) {
      console.log(
        `  ${this.colorize("请求头:", colors.yellow)}${this.formatHeaders(options.headers)}`
      );
    }

    // 显示请求体
    if (this.config.showRequestBody && options.body) {
      console.log(
        `  ${this.colorize("请求体:", colors.yellow)} ${this.formatData(options.body)}`
      );
    }
  }

  // 详细响应日志
  logDetailedResponse(
    method: string,
    url: string,
    status: number,
    options: {
      headers?: Record<string, any>;
      body?: any;
      duration?: number;
    } = {}
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const statusIcon =
      status >= 200 && status < 300 ? "✅" : status >= 400 ? "❌" : "⚠️";
    const durationText = options.duration ? ` (${options.duration}ms)` : "";

    const parts = [
      this.formatTimestamp(),
      this.formatPrefix(),
      this.formatMethod(method),
      `📥 ${statusIcon} 详细响应:`,
      `${this.formatStatus(status)}`,
      this.formatUrl(url) + this.colorize(durationText, colors.gray)
    ].filter(Boolean);

    console.log(parts.join(" "));

    // 显示响应头
    if (this.config.showResponseHeaders && options.headers) {
      console.log(
        `  ${this.colorize("响应头:", colors.yellow)}${this.formatHeaders(options.headers)}`
      );
    }

    // 显示响应体
    if (this.config.showResponseBody && options.body) {
      console.log(
        `  ${this.colorize("响应体:", colors.yellow)} ${this.formatData(options.body)}`
      );
    }
  }

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
