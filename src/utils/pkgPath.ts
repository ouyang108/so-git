import fsExtra from "fs-extra";

import path from "node:path";
import fs from "fs-extra";
const { readJsonSync } = fsExtra;
export const pkgpath = (filename: string) => {
  // 获取执行命令的工作目录（即用户项目根目录）
  const cwd = process.cwd();
  return {
    cwd,

    path: path.join(cwd, filename),
  };
};
export const manange = () => {
  console.log("manange");
  const { path: pkgPath, cwd } = pkgpath("package.json");
  try {
    const pkg = readJsonSync(pkgPath) as Record<string, unknown>;
    const pm = pkg.packageManager as string | undefined;
    if (pm?.startsWith("pnpm")) return "pnpm";
    if (pm?.startsWith("yarn")) return "yarn";
    if (pm?.startsWith("npm")) return "npm";
  } catch {
    // 忽略，继续通过锁文件判断
  }
  // 通过锁文件判断
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  // 默认回退到 npm
  return "npm";
};
