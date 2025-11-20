import { safeJsonParse } from "../utils/json";

export type DisconnectReason = "manual" | "error";

interface SseClientEvents {
  onConnecting?: () => void;
  onConnected?: () => void;
  onDisconnected?: (reason: DisconnectReason) => void;
  onMessage?: (payload: unknown) => void;
  onServerError?: (payload: unknown) => void;
  onNetworkError?: (error: unknown) => void;
}

export interface BroadcastResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function createSseClient(events: SseClientEvents) {
  let eventSource: EventSource | null = null;

  function cleanup(reason: DisconnectReason) {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    events.onDisconnected?.(reason);
  }

  function connect(endpoint: string) {
    if (eventSource) {
      eventSource.close();
    }

    events.onConnecting?.();
    eventSource = new EventSource(endpoint);

    eventSource.onopen = () => {
      events.onConnected?.();
    };

    eventSource.onmessage = (event) => {
      const parsed = safeJsonParse(event.data) ?? event.data;
      events.onMessage?.(parsed);
    };

    eventSource.addEventListener("error", (event) => {
      const messageEvent = event as MessageEvent<string>;
      if (typeof messageEvent.data === "string") {
        const parsed = safeJsonParse(messageEvent.data) ?? messageEvent.data;
        events.onServerError?.(parsed);
      }
    });

    eventSource.onerror = (error) => {
      events.onNetworkError?.(error);
      cleanup("error");
    };
  }

  function disconnect(reason: DisconnectReason = "manual") {
    cleanup(reason);
  }

  function isConnected(): boolean {
    return Boolean(eventSource);
  }

  async function broadcast(message: string): Promise<BroadcastResult> {
    try {
      const response = await fetch("/api/sse/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        error: response.ok ? undefined : "广播消息发送失败",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "广播失败",
      };
    }
  }

  return {
    connect,
    disconnect,
    isConnected,
    broadcast,
  };
}

