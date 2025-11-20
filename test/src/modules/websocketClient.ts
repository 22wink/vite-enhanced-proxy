export type WebSocketDisconnectReason = "manual" | "error" | "server";

export interface WebSocketClientOptions {
  onConnecting?: (url: string) => void;
  onConnected?: (url: string) => void;
  onDisconnected?: (reason: WebSocketDisconnectReason, url?: string) => void;
  onMessage?: (payload: unknown, raw: MessageEvent) => void;
  onError?: (error: Event) => void;
}

export interface WebSocketClient {
  connect: (url: string) => void;
  disconnect: (reason?: WebSocketDisconnectReason) => void;
  send: (message: string) => boolean;
  isConnected: () => boolean;
  getUrl: () => string | null;
}

function parsePayload(event: MessageEvent): unknown {
  const { data } = event;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export function createWebSocketClient(
  options: WebSocketClientOptions,
): WebSocketClient {
  let socket: WebSocket | null = null;
  let lastUrl: string | null = null;
  let manualClose = false;
  let hasDisconnected = false;

  function resetState() {
    socket = null;
    manualClose = false;
  }

  function markDisconnected() {
    hasDisconnected = true;
    lastUrl = null;
    resetState();
  }

  function connect(url: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    if (socket) {
      disconnect("manual");
    }

    lastUrl = url;
    hasDisconnected = false;
    options.onConnecting?.(url);

    try {
      socket = new WebSocket(url);
    } catch (error) {
      console.error("无法创建 WebSocket 连接:", error);
      options.onDisconnected?.("error", url);
      resetState();
      return;
    }

    socket.addEventListener("open", () => {
      options.onConnected?.(url);
    });

    socket.addEventListener("message", (event) => {
      options.onMessage?.(parsePayload(event), event);
    });

    socket.addEventListener("close", () => {
      if (hasDisconnected) {
        return;
      }
      const reason = manualClose ? "manual" : "server";
      options.onDisconnected?.(reason, lastUrl ?? undefined);
      markDisconnected();
    });

    socket.addEventListener("error", (event) => {
      options.onError?.(event);
      if (!hasDisconnected) {
        options.onDisconnected?.("error", lastUrl ?? undefined);
      }
      markDisconnected();
    });
  }

  function disconnect(reason: WebSocketDisconnectReason = "manual") {
    if (!socket) {
      return;
    }
    manualClose = reason === "manual";
    socket.close();
    if (reason === "manual" && !hasDisconnected) {
      options.onDisconnected?.("manual", lastUrl ?? undefined);
      markDisconnected();
    }
  }

  function send(message: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    socket.send(message);
    return true;
  }

  function isConnected() {
    return !!socket && socket.readyState === WebSocket.OPEN;
  }

  function getUrl() {
    return lastUrl;
  }

  return {
    connect,
    disconnect,
    send,
    isConnected,
    getUrl,
  };
}

