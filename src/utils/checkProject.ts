// 检查运行该命令的项目是否存在指定的插件

import fsExtra from "fs-extra";
const { readJsonSync } = fsExtra;
import { execa } from "execa";
import ora from "ora";
import picocolors from "picocolors";
import { DEFAULT_TEMPLATE } from "../constant";
import { manange, pkgpath } from "./pkgPath";
type PackageManager = "pnpm" | "yarn" | "npm";

/**
 * 通过锁文件和 package.json 的 packageManager 字段检测当前项目使用的包管理器。
 * 优先级：packageManager 字段 > 锁文件
 */
const detectPackageManager = (): PackageManager => {
  return manange();
};

/**
 * 根据包管理器返回安装 devDependency 的命令参数。
 * pnpm: pnpm add -D <pkgs>
 * yarn: yarn add -D <pkgs>
 * npm:  npm install -D <pkgs>
 */
const buildInstallArgs = (
  pm: PackageManager,
  packages: string[],
): { bin: string; args: string[] } => {
  if (pm === "yarn") return { bin: "yarn", args: ["add", "-D", ...packages] };
  if (pm === "npm") return { bin: "npm", args: ["install", "-D", ...packages] };
  return { bin: "pnpm", args: ["add", "-D", ...packages] };
};

/**
 * 读取执行命令所在目录的 package.json，
 * 找出 DEFAULT_TEMPLATE 中未安装的插件，
 * 自动检测包管理器后批量安装缺失的依赖。
 */
const checkoutProject = async (): Promise<boolean> => {
  // 获取执行命令的工作目录（即用户项目根目录）
  //   const cwd = process.cwd();
  const { cwd, path: pkgPath } = pkgpath("package.json");

  // 读取用户项目的 package.json
  let pkg: Record<string, unknown>;
  try {
    pkg = readJsonSync(pkgPath);
  } catch {
    // 读取失败说明当前目录不是合法的 Node.js 项目
    console.error(
      picocolors.red(`无法读取 package.json，请确认在项目根目录执行该命令。`),
    );
    process.exit(1);
  }

  // 从 devDependencies 中提取已安装的包名
  const installed = new Set([
    ...Object.keys((pkg.devDependencies as Record<string, string>) ?? {}),
  ]);

  // 找出 DEFAULT_TEMPLATE 中尚未安装的包
  const missing = DEFAULT_TEMPLATE.filter((name) => !installed.has(name));

  // 全部已安装，无需处理
  if (missing.length === 0) {
    console.log(picocolors.green("所有依赖已安装，无需额外操作。"));
    return true;
  }

  // 检测包管理器
  const pm = detectPackageManager();
  console.log(picocolors.cyan(`检测到包管理器：${pm}`));
  console.log(
    picocolors.yellow(`以下依赖缺失，即将安装：\n  ${missing.join("\n  ")}`),
  );

  const { bin, args } = buildInstallArgs(pm, missing);

  // 使用 ora 显示安装进度
  const spinner = ora("正在安装缺失依赖...").start();

  try {
    await execa(bin, args, { cwd });
    spinner.succeed(picocolors.green("依赖安装成功！"));
    return true;
  } catch (error) {
    spinner.fail(picocolors.red("依赖安装失败，请手动执行以下命令："));
    console.error(picocolors.red(`  ${bin} ${args.join(" ")}`));
    throw error;
  }
};

export default checkoutProject;
