import type { ProxyRequestInfo } from "./proxyClient";
import { safeJsonStringify } from "../utils/json";

export type MessageCategory =
  | "connected"
  | "disconnected"
  | "connecting"
  | "message"
  | "broadcast"
  | "error"
  | "proxy"
  | "ws"
  | "wss";

interface MessageLogOptions {
  container: HTMLElement;
  counterEl: HTMLElement;
}

export interface MessageSummary {
  message?: string;
  [key: string]: unknown;
}

function formatSummary(summary: MessageSummary | string): string {
  if (typeof summary === "string") {
    return summary;
  }

  if (summary.message && typeof summary.message === "string") {
    return summary.message;
  }

  return safeJsonStringify(summary);
}

function renderStatusBadge(rawData: unknown): string {
  if (!rawData || typeof rawData !== "object") {
    return "";
  }

  const maybeResponse = rawData as Partial<{ status: number }>;
  if (typeof maybeResponse.status !== "number") {
    return "";
  }

  const statusClass =
    maybeResponse.status >= 200 && maybeResponse.status < 300
      ? "success"
      : "error";

  return `<span class="response-status ${statusClass}">${maybeResponse.status}</span>`;
}

function createRequestInfo(info?: ProxyRequestInfo | null): HTMLElement | null {
  if (!info) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "request-info";

  const rows = [
    { label: "方法", value: info.method },
    { label: "URL", value: info.url },
  ];

  if (info.httpsOptions) {
    rows.push({
      label: "HTTPS选项",
      value: safeJsonStringify(info.httpsOptions),
    });
  }

  rows.forEach(({ label, value }) => {
    const row = document.createElement("div");
    row.className = "info-row";

    const labelEl = document.createElement("span");
    labelEl.className = "info-label";
    labelEl.textContent = `${label}:`;

    const valueEl = document.createElement("span");
    valueEl.textContent = String(value);

    row.append(labelEl, valueEl);
    wrapper.appendChild(row);
  });

  return wrapper;
}

export function createMessageLog(options: MessageLogOptions) {
  let count = 0;

  function updateCounter() {
    options.counterEl.textContent = String(count);
  }

  function add(
    type: MessageCategory,
    summary: MessageSummary | string,
    rawData?: unknown,
    requestInfo?: ProxyRequestInfo | null,
  ) {
    count += 1;
    updateCounter();

    const message = document.createElement("div");
    message.className = `message ${type}`;

    const header = document.createElement("div");
    header.className = "message-header";
    header.innerHTML = `
      <span class="message-type">${type.toUpperCase()}</span>
      <span>${renderStatusBadge(rawData)} ${new Date().toLocaleTimeString()}</span>
    `;

    const content = document.createElement("div");
    content.className = "message-content";

    const infoBlock = createRequestInfo(requestInfo ?? null);
    if (infoBlock) {
      content.appendChild(infoBlock);
    }

    const text = document.createElement("div");
    text.textContent = formatSummary(summary);
    content.appendChild(text);

    message.append(header, content);

    if (rawData) {
      const dataBlock = document.createElement("div");
      dataBlock.className = "message-data";
      dataBlock.textContent = safeJsonStringify(rawData);
      message.appendChild(dataBlock);
    }

    options.container.prepend(message);
  }

  function clear() {
    options.container.innerHTML = "";
    count = 0;
    updateCounter();
  }

  return {
    add,
    clear,
  };
}

