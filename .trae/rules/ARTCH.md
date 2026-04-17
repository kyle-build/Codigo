# 这是项目的详细的包以及文件夹位置和职能



如果出现了架构调整，需要同步修改一下这个文件

- `.cache/codigo/workspaces/pages/*`：页面源码工作区缓存目录。首次打开 WebIDE 时由 `packages/template` 复制生成，后续 OpenSumi 编辑和文件读写都落在这里，不属于业务源码。
- `.trae/docs/TASK_LOG.md`：研发任务日志规范文档，定义任务结束后的必填字段、复现标准和使用方式。
- `.trae/task-logs/*`：研发任务日志归档目录。每次任务结束后生成一份 Markdown 日志和索引记录，用于追溯改动、执行命令与复现步骤。
- `scripts/task-log.mjs`：任务日志生成脚本。负责采集 Git 状态、环境快照、工作区包信息，并自动写入 `.trae/task-logs`。
- `.trae/context/*`：跨会话上下文资产目录，存放 handoff、项目事实与决策日志。
- `.trae/retros/BAD_CASES.md`：逻辑错误、架构违规、代码回退的复盘主文件。
