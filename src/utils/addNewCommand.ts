import fsExtra from "fs-extra";
const { readJsonSync } = fsExtra;
import { pkgpath } from "./pkgPath";
import picocolors from "picocolors";
import { execa } from "execa";
import { manange } from "./pkgPath";
// 需要注入到目标项目 scripts 字段的命令列表
const command = [
  {
    name: "commit",
    script: "czg",
  },
  {
    name: "prepare",
    script: "simple-git-hooks",
  },
];
const packageContent = [
  {
    name: "simple-git-hooks",
    script: {
      "commit-msg": "npx commitlint --edit ${1}",
    },
  },
  {
    name: "commitizen",
    script: {
      path: "node_modules/cz-git",
    },
  },
];
/** 向目标 package.json 注入 scripts 命令和顶层配置字段 */
function addNewCommand(): void {
  const { path: pkgPath } = pkgpath("package.json");

  try {
    const pkg = readJsonSync(pkgPath) as Record<
      string,
      Record<string, unknown>
    >;
    commandAdd(pkg);
    packageAdd(pkg);
    fsExtra.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    console.log(picocolors.green("package.json 更新成功"));
    // 执行prepare命令
    console.log(picocolors.cyan("执行prepare命令"));
    execPrepareCommand();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(picocolors.red(`更新 package.json 失败：${message}`));
    throw error;
  }
}

/** 向 scripts 字段追加缺失的命令，已存在的不覆盖 */
function commandAdd(pkg: Record<string, Record<string, unknown>>): void {
  if (!pkg.scripts) pkg.scripts = {};
  for (const { name, script } of command) {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = script;
    }
  }
}

/** 向顶层追加缺失的配置字段（如 simple-git-hooks、commitizen），已存在的不覆盖 */
function packageAdd(pkg: Record<string, Record<string, unknown>>): void {
  for (const { name, script } of packageContent) {
    if (!pkg[name]) {
      pkg[name] = script as Record<string, unknown>;
    }
  }
}
// 同时执行prepare命令
function execPrepareCommand(): void {
  try {
    const pm = manange();
    // return { bin: "pnpm", args: ["add", "-D", ...packages] };
    //   await execa(bin, args, { cwd });
    execa(pm, ["run", "prepare"], { cwd: process.cwd() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(picocolors.red(`执行prepare命令失败：${message}`));
    throw error;
  } finally {
    console.log(picocolors.green("prepare命令执行完成"));
  }
}
export default addNewCommand;
