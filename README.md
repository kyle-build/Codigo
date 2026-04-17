# Codigo

Codigo 是一个基于 pnpm workspace + turbo 的低代码平台 Monorepo。仓库将协议层、运行时物料、编辑器、发布端、服务端与嵌入式 IDE 拆分为清晰边界，避免双源定义与包边界漂移。

## 目录结构

```text
codigo/
├─ apps/
│  ├─ client/   # 主前端（编辑器/应用管理/预览入口）
│  ├─ admin/    # 后台管理前端
│  ├─ server/   # NestJS 后端
│  └─ ide/      # OpenSumi IDE 外壳
├─ packages/
│  ├─ schema/         # 跨端协议与类型（唯一事实源）
│  ├─ materials/      # 运行时物料渲染与注册（唯一事实源）
│  ├─ runtime-core/   # 框架无关运行时算法（纯函数）
│  ├─ render/         # 代码生成与 runtime-core 桥接
│  ├─ editor-sandbox/ # 编辑器沙箱输出与最小预览生成
│  ├─ file-service/   # IDE/浏览器文件服务上下文适配
│  ├─ plugin-system/  # 组件插件注册协议
│  └─ release/        # 最终发布页运行时（消费层）
└─ .trae/rules/  # 本地协作规则（不参与生产构建）
```

## 快速开始

```bash
pnpm install
pnpm run dev
```

按应用单独启动：

```bash
pnpm run run:client
pnpm run run:admin
pnpm run run:server
pnpm run run:ide
pnpm run run:release
```

## 构建与质量

```bash
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm run test
```

## 协作规则

- 架构边界与依赖方向：见 `.trae/rules/BASIC_RULES.md`
- 协作与风格约束：见 `.trae/rules/USER_GUIDE.md`
- 项目包与目录职责：见 `.trae/rules/ARTCH.md`

## 研发工作日志

仓库内置任务日志系统，任务结束前需要生成一份工作日志：

```bash
pnpm run task:log -- --title "任务标题" --goal "任务目标" --summary "交付结果" --repro "复现步骤 1"
```

日志归档目录：`.trae/task-logs/`
