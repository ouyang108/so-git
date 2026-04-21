import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  clean: true,
  // 添加 shebang，使构建产物可直接作为 CLI 执行
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Node.js 内置模块不打包进产物
  external: [
    "events",
    "fs",
    "path",
    "os",
    "util",
    "crypto",
    "url",
    "querystring",
    "stream",
    "buffer",
    "process",
  ],
  outDir: "dist",
  dts: false,
});
