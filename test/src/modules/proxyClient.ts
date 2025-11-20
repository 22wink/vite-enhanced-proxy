export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HttpsOptions {
  rejectUnauthorized: boolean;
  secure: boolean;
}

export interface ProxyRequestInfo {
  method: HttpMethod;
  url: string;
  httpsOptions?: HttpsOptions | null;
}

interface ProxyRequestOptions extends ProxyRequestInfo {
  body?: string;
}

export interface ProxyResponseDetails {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface ProxyResult {
  success: boolean;
  request: ProxyRequestInfo;
  duration: number;
  response?: ProxyResponseDetails;
  error?: {
    message: string;
    stack?: string;
  };
}

const METHODS_WITH_BODY: HttpMethod[] = ["POST", "PUT", "PATCH"];

function methodSupportsBody(method: HttpMethod): boolean {
  return METHODS_WITH_BODY.includes(method);
}

function normalizeBody(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "string" ? parsed : JSON.stringify(parsed);
  } catch {
    return trimmed;
  }
}

export async function sendProxyRequest(
  options: ProxyRequestOptions,
): Promise<ProxyResult> {
  const { method, url, body, httpsOptions } = options;
  const start = Date.now();

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (methodSupportsBody(method)) {
      const normalizedBody = normalizeBody(body);
      if (normalizedBody) {
        fetchOptions.body = normalizedBody;
      }
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      success: response.ok,
      request: { method, url, httpsOptions },
      duration: Date.now() - start,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: payload,
      },
    };
  } catch (error) {
    return {
      success: false,
      request: { method, url, httpsOptions },
      duration: Date.now() - start,
      error: {
        message: error instanceof Error ? error.message : "未知错误",
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
  }
}

