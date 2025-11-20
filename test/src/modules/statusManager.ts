export type ConnectionState = "connecting" | "connected" | "disconnected";

interface StatusElements {
  statusEl: HTMLElement;
  connectionStatusEl: HTMLElement;
}

export function createStatusManager(elements: StatusElements) {
  function update(state: ConnectionState, message: string) {
    elements.statusEl.className = `status ${state}`;
    elements.statusEl.textContent = message;

    let label = "未连接";
    if (state === "connecting") {
      label = "连接中";
    } else if (state === "connected") {
      label = "已连接";
    }
    elements.connectionStatusEl.textContent = label;
  }

  return { update };
}

