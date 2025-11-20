import { readFileSync, existsSync, writeFileSync } from "node:fs";
import type { SecureContextOptions } from "node:tls";
import selfsigned from "selfsigned";
import { CERT_PATHS } from "./config";

export function ensureCertificates(): SecureContextOptions | null {
  const { cert: certPath, key: keyPath } = CERT_PATHS;

  if (!existsSync(certPath) || !existsSync(keyPath)) {
    console.log("🔐 生成自签名证书...");
    try {
      const attrs = [{ name: "commonName", value: "localhost" }];
      const pems = selfsigned.generate(attrs, {
        keySize: 2048,
        days: 365,
        algorithm: "sha256",
      });

      writeFileSync(certPath, pems.cert);
      writeFileSync(keyPath, pems.private);

      console.log("✅ 证书生成成功");
      console.log(`   📄 证书文件: ${certPath}`);
      console.log(`   🔑 密钥文件: ${keyPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ 证书生成失败:", error.message);
      }
      return null;
    }
  } else {
    console.log("📋 使用现有证书文件");
  }

  try {
    return {
      cert: readFileSync(certPath),
      key: readFileSync(keyPath),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.warn("⚠️  读取证书失败:", error.message);
    }
    return null;
  }
}

