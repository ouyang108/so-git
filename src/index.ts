import picocolors from "picocolors";
import checkoutProject from "./utils/checkProject";
import mkdirFile from "./utils/mkdirFile";
import addNewCommand from "./utils/addNewCommand";

async function start(): Promise<void> {
  try {
    const result = await checkoutProject();
    if (!result) {
      console.error(picocolors.red("项目检查失败"));
      process.exit(1);
    }
    // 创建 commitlint 配置文件
    await mkdirFile();
    // 向目标项目的 package.json 注入脚本和配置
    addNewCommand();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(picocolors.red("执行失败："), message);
    process.exit(1);
  }
}

start();
