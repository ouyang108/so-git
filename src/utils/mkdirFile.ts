// 导入 fs-extra 用于文件读写，模板内容直接内联避免打包后路径问题
import fs from "fs-extra";
import { pkgpath } from "./pkgPath";
import { COMMITLINT_TEMPLATE } from "../commitlint/template";

// 检查目标项目根目录是否存在 commitlint.config.cjs，不存在则创建
async function mkdirFile() {
  const { path: targetFile } = pkgpath("commitlint.config.cjs");

  // 如果文件已存在则跳过
  if (await fs.pathExists(targetFile)) {
    console.log("文件已存在，跳过创建");
    return true;
  }

  // 将内联模板写入目标项目根目录
  await fs.outputFile(targetFile, COMMITLINT_TEMPLATE, "utf-8");
  console.log("文件创建成功");
  return true;
}

export default mkdirFile;
