# Project Facts

## 架构边界
- Monorepo：`apps/*` 运行时应用，`packages/*` 复用能力。
- 依赖方向：`apps -> packages`，禁止 `packages -> apps`。

## 单一事实源
- 组件协议：`packages/schema`
- 运行时组件注册：`packages/materials`
- 编辑器展示元信息：`apps/client/src/modules/editor/registry`

## 常用约束
- `shared` 仅保留基础设施，不承接单域业务。
- `apps/ide` 与 `apps/client` 视为隔离技术栈。
- 任务结束前必须写任务日志到 `.trae/task-logs/`。

## 启动命令（按需维护）
- 安装依赖：
- 开发启动：
- 构建命令：
- 验证命令：
