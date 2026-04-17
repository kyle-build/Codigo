# 研发任务日志系统

## 目标

这个日志系统用于记录每次研发任务完成时的交付结果、执行命令、验证过程和复现步骤�?
日志必须满足三个要求�?

1. 可追溯：能看到任务时间、范围、责任人、Git 快照和改动文件�?2. 可复现：能按照日志中的命令和步骤重新搭建并验证结果�?3. 可检索：能通过 `.trae/task-logs/index.json` 快速定位历史任务�?

## 目录约定

- `.trae/task-logs/index.json`：任务日志索引�?- `.trae/task-logs/<YYYY-MM-DD>/*.md`：任务说明日志�?- `.trae/task-logs/<YYYY-MM-DD>/*.json`：对应的机器可读快照�?- `scripts/task-log.mjs`：日志生成脚本�?
  以上日志文件默认纳入 Git 管理，禁止继续把工作日志目录加入忽略规则�?

## 使用方式

每次任务结束后执行：

```bash
pnpm run task:log -- --title "任务标题" --goal "任务目标" --summary "本次交付" --repro "pnpm install" --repro "pnpm run build"
```

推荐补充完整的上下文?

```bash
pnpm run task:log -- \
  --title "建立任务日志系统" \
  --goal "让任务结束后自动写入可追溯、可复现的研发日? \
  --summary "新增任务日志脚本、日志索引、规范文档与仓库跟踪规则" \
  --scope "repository" \
  --author "Trae Agent" \
  --tag "task-log" \
  --command "pnpm run task:log -- --help" \
  --command "pnpm run typecheck" \
  --verify "日志脚本成功生成 Markdown ?JSON 文件" \
  --verify "最近修改文件通过诊断? \
  --artifact ".trae/docs/TASK_LOG.md" \
  --artifact ".trae/task-logs/index.json" \
  --repro "pnpm install" \
  --repro "pnpm run task:log -- --help" \
  --repro "pnpm run build"
```

## 必填字段

- `title`：任务名称?- `goal`：任务原始目标�?- `summary`：本次完成内容�?- `repro`：可复现步骤，至少一条�?

## 强制建议

- 每次任务结束立刻写日志，不要等待提交前补写�?- AI 代理在给出最终答复前，默认必须先执行一次日志写入�?- 日志生成后要和代码改动一起提交，避免仓库历史与任务记录脱节�?- `command` 写实际执行过的命令，不写计划命令�?- `verify` 写已经完成的验证，不写预期验证�?- `artifact` 记录关键文件、预览地址或输出路径�?- 如果任务涉及异常、回退、架构违规，必须同步更新 `.trae/retros/BAD_CASES.md`�?

## 复现标准

一份合格日志至少能回答下面的问题：

1. 当时改了什么文件�?2. 当时在哪�?Git 分支和提交上执行�?3. 当时使用�?Node、pnpm �?workspace 包版本是什么�?4. 当时执行了哪些命令�?5. 结果如何验证�?6. 下一位接手人如何从头复现这次结果�?
