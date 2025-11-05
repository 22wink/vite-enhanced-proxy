import { pathToFileURL } from "url";
import fs from "fs";
import path from "path";
import type { ProxyPluginUserConfig } from "./types.js";

// 支持的外部配置文件名
const PROXY_CONFIG_FILES = [
  "proxy.config.ts",
  "proxy.config.js",
  "proxy.config.cjs",
  "proxy.config.mjs",
  "proxy.config.json"
];

export function defineProxyConfig(config: ProxyPluginUserConfig): ProxyPluginUserConfig {
  return config;
}

export async function loadExternalProxyConfig(rootDir: string = process.cwd()): Promise<ProxyPluginUserConfig | null> {
  for (const file of PROXY_CONFIG_FILES) {
    const fullPath = path.resolve(rootDir, file);
    if (!fs.existsSync(fullPath)) continue;

    // JSON 直接读取
    if (file.endsWith(".json")) {
      try {
        const json = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        return json as ProxyPluginUserConfig;
      } catch {
        return null;
      }
    }

    // 其余使用动态 import，兼容 CJS 默认导出
    try {
      const url = pathToFileURL(fullPath).href;
      const mod: any = await import(url);
      const cfg = mod.default ?? mod;
      return cfg as ProxyPluginUserConfig;
    } catch {
      return null;
    }
  }
  return null;
}
