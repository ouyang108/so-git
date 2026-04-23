
# so-git

一键为项目配置 `commitlint` + `cz-git` 的 CLI 工具，自动安装依赖、生成配置文件并注入 `package.json` 脚本，让你的团队规范 Git 提交流程。

## 功能

- 自动检测项目使用的包管理器（pnpm / yarn / npm）
- 检查并安装缺失的依赖（`@commitlint/cli`、`@commitlint/config-conventional`、`cz-git`、`czg`、`simple-git-hooks`）
- 在项目根目录生成 `commitlint.config.cjs` 配置文件（已存在时自动跳过）
- 向 `package.json` 注入 `scripts` 命令和 `simple-git-hooks`、`commitizen` 配置

## 安装

```bash
# 全局安装
npm install -g so-git

# 或使用 pnpm
pnpm add -g so-git
```

## 使用

在项目根目录（需包含 `package.json`）执行：

```bash
so-git init
```

执行后会自动完成以下操作：

1. 读取当前项目的 `package.json`，找出未安装的依赖并批量安装
2. 在项目根目录生成 `commitlint.config.cjs`
3. 向 `package.json` 写入以下配置：

```json
{
  "scripts": {
    "commit": "czg",
    "prepare": "simple-git-hooks"
  },
  "simple-git-hooks": {
    "commit-msg": "npx commitlint --edit ${1}"
  },
  "commitizen": {
    "path": "node_modules/cz-git"
  }
}
```

4. 自动执行 `prepare` 命令激活 git hooks

## 生成的 commitlint 配置

生成的 `commitlint.config.cjs` 支持以下提交类型：

| 类型 | 说明 |
|------|------|
| `feat` | 新增功能 |
| `fix` | 修复缺陷 |
| `docs` | 文档变更 |
| `style` | 代码格式 |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `build` | 打包构建 |
| `ci` | CI 配置变更 |
| `revert` | 代码回退 |
| `chore` | 构建/工程依赖/工具 |
| `wip` | 正在开发中 |
| `workflow` | 工作流程改进 |

配置了 `simple-git-hooks` 后，每次执行 `git commit` 都会自动校验提交信息格式。使用 `npm run commit` 可以启动交互式提交界面。

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 全局链接，本地测试
npm link
so-git init
```

## 依赖

| 包 | 用途 |
|----|------|
| `@inquirer/prompts` | 交互式命令行提示 |
| `commander` | CLI 命令解析 |
| `execa` | 执行子进程命令 |
| `fs-extra` | 文件操作增强 |
| `ora` | 终端加载动画 |
| `picocolors` | 终端彩色输出 |

## License

ISC
