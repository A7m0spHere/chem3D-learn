@AGENTS.md

# Claude Code 专用要求

> 公共规则见 AGENTS.md（已在第一行导入）。本文件只写 Claude Code 特有的工作方式，不重复 AGENTS.md 的内容。

## 工作方式

- **先计划后动手**：涉及多文件或不熟悉区域的任务，先给方案并等确认，再改代码。小而明确的改动可直接执行。
- **分离探索上下文**：任务适合并行且用户未禁止委派时，可用 Claude Code 的子 Agent 承担边界清晰的只读调研；主 Agent 负责核对结论和最终交付。
- **失败不要硬试**：同一方法失败两次就停下来诊断根因、换思路，并说明偏差，而不是反复打补丁。

## 原生 Windows 工作约定

- Claude Code 在原生 Windows 上依赖 Git for Windows 提供的 Git Bash；本机路径为 `C:\Program Files\Git\bin\bash.exe`。以 [Claude Code 官方 Windows 设置说明](https://docs.anthropic.com/en/docs/claude-code/getting-started) 为准。
- Claude Code 的 Bash 工具中使用 Git Bash 语法和 `D:/chem3D-learn` 路径；向项目所有者展示的可复制命令默认使用 PowerShell 语法和 `D:\chem3D-learn` 路径。不要在同一条命令中混用两套语法。
- Git Bash 自动发现失败时，先在 PowerShell 当前进程中设置 `$env:CLAUDE_CODE_GIT_BASH_PATH = 'C:\Program Files\Git\bin\bash.exe'`，再运行 `claude doctor`。不要未经用户同意改用 WSL 或永久写入系统环境变量。
- 不修改 `.claude/settings.local.json`、全局 npm 配置或 PowerShell 执行策略。遇到 npm 缓存权限问题时，沿用 `AGENTS.md` 的单次 `--cache` 方案。
- Shell 或权限失败时先区分 Git Bash、PowerShell、文件权限和 Claude Code 工具权限；不要把环境故障误判为业务代码问题。

## 文件职责

- 共享的项目事实、命令、验证要求、Git 流程和交接规则只维护在 `AGENTS.md` 及其指定的治理文档中。
- 若本文件与 `AGENTS.md` 冲突，以 `AGENTS.md` 为准，并在后续治理任务中删除本文件的重复或过时内容。
