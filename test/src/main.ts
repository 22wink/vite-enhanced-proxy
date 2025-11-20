import "./styles/main.css";
import { setupTabs } from "./modules/tabs";
import { createConnectionTimer } from "./modules/connectionTimer";
import { createMessageLog } from "./modules/messageLog";
import {
  createSseClient,
  type DisconnectReason,
} from "./modules/sseClient";
import {
  sendProxyRequest,
  type HttpMethod,
  type ProxyRequestInfo,
  type HttpsOptions,
} from "./modules/proxyClient";
import { createStatusManager } from "./modules/statusManager";
import {
  createWebSocketClient,
  type WebSocketDisconnectReason,
} from "./modules/websocketClient";

type DomSelectors = {
  tabs: NodeListOf<HTMLButtonElement>;
  tabContents: NodeListOf<HTMLElement>;
  connectBtn: HTMLButtonElement;
  disconnectBtn: HTMLButtonElement;
  broadcastBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  sendProxyBtn: HTMLButtonElement;
  clearProxyBtn: HTMLButtonElement;
  endpointSelect: HTMLSelectElement;
  proxyEndpointSelect: HTMLSelectElement;
  httpMethodSelect: HTMLSelectElement;
  requestBodyTextarea: HTMLTextAreaElement;
  rejectUnauthorizedCheckbox: HTMLInputElement;
  secureCheckbox: HTMLInputElement;
  statusEl: HTMLElement;
  connectionStatusEl: HTMLElement;
  connectionTimeEl: HTMLElement;
  messageCountEl: HTMLElement;
  messageListEl: HTMLElement;
  wsConnectBtn: HTMLButtonElement;
  wsDisconnectBtn: HTMLButtonElement;
  wsSendBtn: HTMLButtonElement;
  wsClearBtn: HTMLButtonElement;
  wsEndpointSelect: HTMLSelectElement;
  wsMessageInput: HTMLInputElement;
  wsStatusEl: HTMLElement;
  wsConnectionStatusEl: HTMLElement;
  wsConnectionTimeEl: HTMLElement;
};

type WebSocketTarget = {
  url: string;
  protocol: "WS" | "WSS";
  description: string;
};

function queryDom(): DomSelectors {
  const selectors = {
    tabs: document.querySelectorAll<HTMLButtonElement>(".tab"),
    tabContents: document.querySelectorAll<HTMLElement>(".tab-content"),
    connectBtn: document.getElementById("connectBtn") as HTMLButtonElement,
    disconnectBtn: document.getElementById(
      "disconnectBtn",
    ) as HTMLButtonElement,
    broadcastBtn: document.getElementById("broadcastBtn") as HTMLButtonElement,
    clearBtn: document.getElementById("clearBtn") as HTMLButtonElement,
    sendProxyBtn: document.getElementById("sendProxyBtn") as HTMLButtonElement,
    clearProxyBtn: document.getElementById(
      "clearProxyBtn",
    ) as HTMLButtonElement,
    endpointSelect: document.getElementById(
      "endpoint",
    ) as HTMLSelectElement,
    proxyEndpointSelect: document.getElementById(
      "proxyEndpoint",
    ) as HTMLSelectElement,
    httpMethodSelect: document.getElementById(
      "httpMethod",
    ) as HTMLSelectElement,
    requestBodyTextarea: document.getElementById(
      "requestBody",
    ) as HTMLTextAreaElement,
    rejectUnauthorizedCheckbox: document.getElementById(
      "rejectUnauthorized",
    ) as HTMLInputElement,
    secureCheckbox: document.getElementById("secure") as HTMLInputElement,
    statusEl: document.getElementById("status") as HTMLElement,
    connectionStatusEl: document.getElementById(
      "connectionStatus",
    ) as HTMLElement,
    connectionTimeEl: document.getElementById("connectionTime") as HTMLElement,
    messageCountEl: document.getElementById("messageCount") as HTMLElement,
    messageListEl: document.getElementById("messageList") as HTMLElement,
    wsConnectBtn: document.getElementById("wsConnectBtn") as HTMLButtonElement,
    wsDisconnectBtn: document.getElementById(
      "wsDisconnectBtn",
    ) as HTMLButtonElement,
    wsSendBtn: document.getElementById("wsSendBtn") as HTMLButtonElement,
    wsClearBtn: document.getElementById("wsClearBtn") as HTMLButtonElement,
    wsEndpointSelect: document.getElementById("wsEndpoint") as HTMLSelectElement,
    wsMessageInput: document.getElementById("wsMessage") as HTMLInputElement,
    wsStatusEl: document.getElementById("wsStatus") as HTMLElement,
    wsConnectionStatusEl: document.getElementById(
      "wsConnectionStatus",
    ) as HTMLElement,
    wsConnectionTimeEl: document.getElementById(
      "wsConnectionTime",
    ) as HTMLElement,
  };

  Object.entries(selectors).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`缺少DOM节点: ${key}`);
    }
  });

  return selectors;
}

function buildProxySocketUrl(path: string, forcedScheme?: "ws" | "wss") {
  const scheme =
    forcedScheme ??
    (window.location.protocol === "https:" ? "wss" : "ws");
  const base = `${scheme}://${window.location.host}`;
  return new URL(path, base).toString();
}

function resolveWebSocketTarget(select: HTMLSelectElement): WebSocketTarget {
  const option = select.selectedOptions[0];
  if (!option) {
    throw new Error("缺少 WebSocket 端点配置");
  }

  const protocol = option.dataset.protocol === "WSS" ? "WSS" : "WS";
  const description = option.textContent?.trim() ?? option.value;
  const source = option.dataset.source ?? "proxy";

  if (source === "direct") {
    return {
      url: option.value,
      protocol,
      description,
    };
  }

  const forcedScheme = option.dataset.scheme as "ws" | "wss" | undefined;
  return {
    url: buildProxySocketUrl(option.value, forcedScheme),
    protocol,
    description,
  };
}

function createHttpsOptions(
  endpoint: string,
  options: {
    rejectUnauthorized: boolean;
    secure: boolean;
  },
): HttpsOptions | null {
  const isHttps = endpoint.includes("https");
  const includesHttpsProxy = endpoint.includes("api-https");
  return isHttps || includesHttpsProxy ? options : null;
}

function bootstrap() {
  const dom = queryDom();
  setupTabs(dom.tabs, dom.tabContents);

  const statusManager = createStatusManager({
    statusEl: dom.statusEl,
    connectionStatusEl: dom.connectionStatusEl,
  });

  const timer = createConnectionTimer((seconds) => {
    dom.connectionTimeEl.textContent = `${seconds}s`;
  });

  const messageLog = createMessageLog({
    container: dom.messageListEl,
    counterEl: dom.messageCountEl,
  });

  const wsStatusManager = createStatusManager({
    statusEl: dom.wsStatusEl,
    connectionStatusEl: dom.wsConnectionStatusEl,
  });

  const wsTimer = createConnectionTimer((seconds) => {
    dom.wsConnectionTimeEl.textContent = `${seconds}s`;
  });

  function toggleControls(isConnected: boolean) {
    dom.connectBtn.disabled = isConnected;
    dom.disconnectBtn.disabled = !isConnected;
    dom.endpointSelect.disabled = isConnected;
  }

  function setWsControls(mode: "idle" | "connecting" | "connected") {
    const isConnected = mode === "connected";
    const isConnecting = mode === "connecting";
    dom.wsConnectBtn.disabled = isConnected || isConnecting;
    dom.wsDisconnectBtn.disabled = mode === "idle";
    dom.wsSendBtn.disabled = !isConnected;
    dom.wsEndpointSelect.disabled = mode !== "idle";
  }

  let currentWsTarget: WebSocketTarget | null = null;

  const sseClient = createSseClient({
    onConnecting: () => {
      statusManager.update("connecting", "🔄 正在连接...");
      messageLog.add("connecting", { message: "正在建立 SSE 连接..." });
    },
    onConnected: () => {
      statusManager.update("connected", "✅ SSE 连接已建立");
      toggleControls(true);
      timer.start();
      messageLog.add("connected", { message: "SSE 连接已成功建立" });
    },
    onDisconnected: (reason: DisconnectReason) => {
      statusManager.update("disconnected", "⚠️ 未连接");
      toggleControls(false);
      timer.stop();

      const message =
        reason === "error" ? "SSE 连接异常断开" : "SSE 连接已断开";
      messageLog.add("disconnected", { message });
    },
    onMessage: (payload) => {
      const summary =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : { message: String(payload) };
      messageLog.add("message", summary, payload);
    },
    onServerError: (payload) => {
      messageLog.add("error", { message: "SSE 错误事件" }, payload);
    },
    onNetworkError: (error) => {
      messageLog.add("error", { message: "SSE 连接发生错误" }, error);
    },
  });

  function getWsCategory() {
    return currentWsTarget?.protocol === "WSS" ? "wss" : "ws";
  }

  const websocketClient = createWebSocketClient({
    onConnecting: (url) => {
      const label = currentWsTarget?.description ?? url;
      wsStatusManager.update("connecting", "🔄 正在连接 WebSocket...");
      setWsControls("connecting");
      messageLog.add("connecting", {
        message: `尝试连接 WebSocket: ${label}`,
      });
    },
    onConnected: (url) => {
      wsStatusManager.update("connected", "✅ WebSocket 连接已建立");
      setWsControls("connected");
      wsTimer.start();
      messageLog.add(getWsCategory(), {
        message: `${currentWsTarget?.protocol ?? "WS"} 连接成功`,
        url,
      });
    },
    onDisconnected: (reason: WebSocketDisconnectReason, url) => {
      wsStatusManager.update("disconnected", "⚠️ 未连接");
      setWsControls("idle");
      wsTimer.stop();
      messageLog.add("disconnected", {
        message: `WebSocket 连接已断开 (${reason})`,
        url,
      });
      currentWsTarget = null;
    },
    onMessage: (payload) => {
      const category = getWsCategory();
      messageLog.add(
        category,
        {
          message: `${currentWsTarget?.protocol ?? "WS"} 收到消息`,
        },
        payload,
      );
    },
    onError: (event) => {
      messageLog.add("error", { message: "WebSocket 发生错误" }, event);
    },
  });

  async function handleBroadcast() {
    const result = await sseClient.broadcast(
      `广播消息 - ${new Date().toLocaleTimeString()}`,
    );
    if (result.success) {
      messageLog.add(
        "broadcast",
        { message: "广播消息已发送" },
        result.data ?? null,
      );
      return;
    }

    messageLog.add("error", {
      message: result.error ?? "广播消息发送失败",
    });
  }

  function handleDisconnect() {
    if (sseClient.isConnected()) {
      sseClient.disconnect("manual");
    }
  }

  function handleConnect() {
    if (sseClient.isConnected()) {
      return;
    }
    sseClient.connect(dom.endpointSelect.value);
  }

  async function handleProxyRequest() {
    const endpoint = dom.proxyEndpointSelect.value;
    const method = dom.httpMethodSelect.value as HttpMethod;
    const requestInfo: ProxyRequestInfo = {
      method,
      url: endpoint,
      httpsOptions: createHttpsOptions(endpoint, {
        rejectUnauthorized: dom.rejectUnauthorizedCheckbox.checked,
        secure: dom.secureCheckbox.checked,
      }),
    };

    messageLog.add(
      "proxy",
      { message: `发送 ${method} 请求到 ${endpoint}...` },
      null,
      requestInfo,
    );

    const result = await sendProxyRequest({
      ...requestInfo,
      body: dom.requestBodyTextarea.value,
    });

    if (result.success && result.response) {
      messageLog.add(
        "proxy",
        {
          message: `${method} 请求成功`,
          duration: `${result.duration}ms`,
        },
        result.response,
        requestInfo,
      );
      return;
    }

    messageLog.add(
      "error",
      {
        message: result.error?.message ?? "代理请求失败",
      },
      result.error,
      requestInfo,
    );
  }

  function handleClearMessages() {
    messageLog.clear();
  }

  function handleWsConnect() {
    if (websocketClient.isConnected()) {
      return;
    }
    try {
      currentWsTarget = resolveWebSocketTarget(dom.wsEndpointSelect);
      websocketClient.connect(currentWsTarget.url);
    } catch (error) {
      messageLog.add("error", { message: "解析 WebSocket 端点失败" }, error);
    }
  }

  function handleWsDisconnect() {
    if (websocketClient.isConnected()) {
      websocketClient.disconnect("manual");
    }
  }

  function handleWsSend() {
    const defaultPayload = JSON.stringify({
      action: "ping",
      timestamp: new Date().toISOString(),
    });
    const payload = dom.wsMessageInput.value.trim() || defaultPayload;
    const sent = websocketClient.send(payload);
    if (sent) {
      messageLog.add(
        getWsCategory(),
        { message: "发送 WebSocket 消息" },
        { payload },
      );
      return;
    }
    messageLog.add("error", {
      message: "当前没有可用的 WebSocket 连接",
    });
  }

  dom.connectBtn.addEventListener("click", handleConnect);
  dom.disconnectBtn.addEventListener("click", handleDisconnect);
  dom.broadcastBtn.addEventListener("click", handleBroadcast);
  dom.clearBtn.addEventListener("click", handleClearMessages);
  dom.sendProxyBtn.addEventListener("click", handleProxyRequest);
  dom.clearProxyBtn.addEventListener("click", handleClearMessages);
  dom.wsConnectBtn.addEventListener("click", handleWsConnect);
  dom.wsDisconnectBtn.addEventListener("click", handleWsDisconnect);
  dom.wsSendBtn.addEventListener("click", handleWsSend);
  dom.wsClearBtn.addEventListener("click", handleClearMessages);

  window.addEventListener("beforeunload", () => {
    if (sseClient.isConnected()) {
      sseClient.disconnect("manual");
    }
    if (websocketClient.isConnected()) {
      websocketClient.disconnect("manual");
    }
  });
}

bootstrap();

