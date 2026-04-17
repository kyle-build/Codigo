# .trae 目录说明

按职责拆分后，`.trae` 使用以下结构：

- `rules/`：项目规则、结构约束、用户偏好约束。
- `docs/`：协作规范文档（如任务日志规范）。
- `context/`：跨会话上下文资产（handoff、事实清单、决策记录、启动提示词）。
- `retros/`：问题复盘与 bad case 记录。
- `task-logs/`：任务执行日志与索引。

## 快速入口

- 上下文交接：`.trae/context/SESSION_HANDOFF.md`
- 项目事实：`.trae/context/PROJECT_FACTS.md`
- 决策日志：`.trae/context/DECISIONS.md`
- 会话启动提示词：`.trae/context/START_PROMPT.md`
- Bad Case 主文件：`.trae/retros/BAD_CASES.md`
