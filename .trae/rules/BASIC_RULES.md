# Codigo 项目规则（精简版）

## 核心原则

1. 先稳边界，再写功能
2. 单一事实源必须明确，禁止双源维护
3. shared 只能放基础设施，禁止承接单一业务域逻辑
4. 包级依赖只能单向向下，禁止横向穿透

## 仓库分层

- `packages/*`：跨应用复用（协议/运行时/工具）
- `apps/*`：独立运行时应用
- `.trae/rules/*`：协作规则（不参与生产构建）

## 依赖方向（硬约束）

- `apps/*` 可以依赖 `packages/*`
- `packages/*` 禁止依赖 `apps/*`
- `apps/client`、`apps/server`、`apps/ide` 之间禁止源码互相依赖

推荐依赖链：`schema` <- `plugin-system` <- `materials`；`schema` <- `runtime-core` <- `render`；`schema` <- `editor-sandbox`；`file-service` <- `ide`；`schema+materials+render+editor-sandbox` <- `client`；`schema+materials` <- `release`

## 单一事实源

- 协议与跨端类型：`packages/schema`
- 运行时物料注册与渲染：`packages/materials`
- 编辑器展示元信息：`apps/client/src/modules/editor/registry`
- 文件服务上下文协议：`packages/file-service`
- 后端实体：`apps/server/src/modules/*/entity`

## 关键包职责（只记边界）

- `packages/schema`：跨端协议与类型；禁止依赖 React/Nest/数据库/浏览器 API
- `packages/materials`：运行时 React 物料与 registry；禁止耦合 `apps/client` 的业务代码
- `packages/runtime-core`：框架无关的 schema 解析与算法（纯函数）
- `packages/render`：代码生成与 `runtime-core` 桥接（不重复实现完整运行时）
- `packages/editor-sandbox`：编辑器沙箱输出；重复逻辑优先下沉 `runtime-core`
- `packages/file-service`：文件 API 适配与上下文管理（传输/缓存/路径规范化）
- `packages/release`：发布端消费层（只做适配，不反向定义协议）
- `packages/template`：脚手架试验区（不得成为业务正式依赖）

## 应用职责（简）

- `apps/client`：编辑与管理；复杂编辑逻辑留在 `modules/editor` 域内，不回灌 `shared`
- `apps/server`：NestJS；`flow` 新增能力先按子域归类，避免继续聚合膨胀
- `apps/ide`：OpenSumi 外壳；禁止依赖 `apps/client`/`materials` 的 React UI 代码

## 研发日志

- 任务结束前必须记录工作日志：`pnpm run task:log -- --title ... --goal ... --summary ... --repro ...`
