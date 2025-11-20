import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PORTS = {
  http: 3001,
  https: 3002,
  ws: 3003,
  wss: 3004,
} as const;

export const TIMER_INTERVAL_MS = 2000;

export const CERT_PATHS = {
  cert: join(__dirname, "..", "cert.pem"),
  key: join(__dirname, "..", "key.pem"),
} as const;

