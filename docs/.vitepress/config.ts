import type { DefaultTheme, UserConfig } from "vitepress";

const editLink =
  "https://github.com/22wink/vite-enhanced-proxy/edit/main/docs/:path";

const zhNav: DefaultTheme.NavItem[] = [
  { text: "指南", link: "/guide/getting-started" },
  { text: "配置", link: "/guide/configuration" },
  { text: "高级用法", link: "/guide/advanced" },
  { text: "API", link: "/guide/api" }
];

const enNav: DefaultTheme.NavItem[] = [
  { text: "Guide", link: "/en/guide/getting-started" },
  { text: "Configuration", link: "/en/guide/configuration" },
  { text: "Advanced", link: "/en/guide/advanced" },
  { text: "API", link: "/en/guide/api" }
];

const zhSidebar: DefaultTheme.Sidebar = {
  "/guide/": [
    {
      text: "快速上手",
      items: [
        { text: "简介", link: "/guide/getting-started" },
        { text: "安装与使用", link: "/guide/getting-started#安装" },
        { text: "快速示例", link: "/guide/getting-started#快速示例" }
      ]
    },
    {
      text: "配置参考",
      items: [
        { text: "核心配置", link: "/guide/configuration" },
        { text: "日志系统", link: "/guide/logging" },
        { text: "外部配置文件", link: "/guide/external-config" }
      ]
    },
    {
      text: "高级能力",
      items: [
        { text: "高级用法", link: "/guide/advanced" },
        { text: "运行时控制", link: "/guide/runtime" },
        { text: "故障排查", link: "/guide/troubleshooting" }
      ]
    },
    {
      text: "API 参考",
      items: [{ text: "API 列表", link: "/guide/api" }]
    }
  ]
};

const enSidebar: DefaultTheme.Sidebar = {
  "/en/guide/": [
    {
      text: "Getting Started",
      items: [
        { text: "Overview", link: "/en/guide/getting-started" },
        {
          text: "Installation",
          link: "/en/guide/getting-started#installation"
        },
        {
          text: "Quick example",
          link: "/en/guide/getting-started#quick-example"
        }
      ]
    },
    {
      text: "Configuration",
      items: [
        { text: "Core options", link: "/en/guide/configuration" },
        { text: "Logging", link: "/en/guide/logging" },
        { text: "External config", link: "/en/guide/external-config" }
      ]
    },
    {
      text: "Advanced topics",
      items: [
        { text: "Advanced usage", link: "/en/guide/advanced" },
        { text: "Runtime controls", link: "/en/guide/runtime" },
        { text: "Troubleshooting", link: "/en/guide/troubleshooting" }
      ]
    },
    {
      text: "API",
      items: [{ text: "API list", link: "/en/guide/api" }]
    }
  ]
};

const config: UserConfig = {
  lastUpdated: true,
  cleanUrls: true,
  locales: {
    root: {
      label: "简体中文",
      link: "/",
      lang: "zh-CN",
      title: "vite-enhanced-proxy",
      description: "功能全面的 Vite 代理插件，提供日志、环境切换、中间件等能力",
      themeConfig: {
        nav: zhNav,
        sidebar: zhSidebar,
        editLink: {
          pattern: editLink,
          text: "在 GitHub 上编辑此页"
        },
        footer: {
          message: "基于 MIT 许可证发布",
          copyright: "Copyright © 2025-present 22wink"
        }
      }
    },
    en: {
      label: "English",
      link: "/en/",
      lang: "en-US",
      title: "vite-enhanced-proxy",
      description:
        "Full-featured Vite proxy plugin with colorful logs, environment switching, middleware, and runtime controls.",
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        editLink: {
          pattern: editLink,
          text: "Edit this page on GitHub"
        },
        footer: {
          message: "Released under the MIT License",
          copyright: "Copyright © 2025-present 22wink"
        }
      }
    }
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/22wink/vite-enhanced-proxy"
      }
    ]
  }
};

export default config;

