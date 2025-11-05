import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  minify: false,
  target: "es2020",
  external: ["vite"],
  banner: {
    js: "// vite-enhanced-proxy - A powerful Vite proxy plugin"
  }
});