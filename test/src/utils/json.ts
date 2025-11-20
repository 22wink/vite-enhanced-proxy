export function safeJsonParse<T = unknown>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function safeJsonStringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return JSON.stringify(
      {
        message: value.message,
        stack: value.stack,
        name: value.name,
      },
      null,
      2,
    );
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

