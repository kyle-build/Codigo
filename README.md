# Codigo 低代码平台

## 介绍

### 1. 基础定义层 (Foundation)

- **`@codigo/schema`**
  - **作用**：项目的“数据字典”。存放所有核心的类型定义（TypeScript Types）、数据结构、表单 Schema 以及前后端交互的 API 请求/响应接口定义。
  - **关系**：它是整个项目最底层的依赖，**几乎所有其他的包（前端、后端、渲染器等）都依赖它**，以此保证全栈数据类型的一致性。

### 2. 核心引擎层 (Core Engine)

- **`@codigo/plugin-system`**
  - **作用**：组件插件注册系统。用于管理和注册低代码平台中的各种组件物料，使物料能够以插件的形式动态加载或扩展。
  - **关系**：依赖 `@codigo/schema`，并被物料库（`materials-react`）所使用。
- **`@codigo/runtime-core`**
  - **作用**：运行时核心逻辑。包含与具体 UI 框架（React/Vue）无关的低代码页面渲染核心算法、状态管理和事件分发机制。
  - **关系**：依赖 `@codigo/schema`，是具体框架渲染器（`render-react` 和 `render-vue`）的底层基础。

### 3. 物料与渲染层 (Materials & Renderers)

- **`@codigo/materials`**（你刚刚查看的包）
  - **作用**：React 版本的**物料库**（即左侧组件面板里可以拖拽的组件，如按钮、输入框、轮播图等）。它包含了这些组件的具体实现以及在低代码平台中的配置面板描述。
  - **关系**：依赖 `@codigo/plugin-system`（用于注册自己）和 `@codigo/schema`。被编辑器客户端（`client`）和发布端（`release`）消费。
- **`@codigo/render-react` & `@codigo/render-vue`**
  - **作用**：针对 React 和 Vue 的**页面渲染器**。它们负责将 JSON 格式的页面 Schema 数据（由低代码编辑器生成）解析并真正渲染成 React 或 Vue 的 DOM 节点。
  - **关系**：依赖 `@codigo/runtime-core`。被编辑器客户端（`client`）引入，意味着你的平台可能支持跨框架预览或生成代码。

### 4. 应用层 (Applications)

- **`@codigo/client`**
  - **作用**：低代码平台的**主应用（编辑器/设计器前端）**。也就是用户用来拖拽组件、配置属性、搭建页面的可视化操作界面（基于 Vite + React）。
  - **关系**：它集大成者，依赖了 `@codigo/materials`（提供可拖拽物料）、`@codigo/render-react` 和 `@codigo/render-vue`（提供画布渲染能力）以及 `@codigo/schema`。
- **`@codigo/server`**
  - **作用**：项目的**后端服务**（基于 NestJS + MySQL + Redis）。负责用户认证、页面数据保存、资源上传（OSS）等服务端逻辑。
  - **关系**：依赖 `@codigo/schema`，实现了前后端类型的复用。
- **`@codigo/release`**
  - **作用**：**发布与预览端**（基于 Next.js）。当用户在编辑器中完成页面搭建并点击“发布”后，C 端用户访问的真实页面就是由这个包负责渲染的（支持 SSR 以利于 SEO 和首屏加载）。
  - **关系**：依赖 `@codigo/materials`（用于渲染具体组件）和 `@codigo/schema`。

---

### 相互关系总结链（依赖流向）

你可以将它们的关系理解为一个**金字塔结构**，从下到上依赖：

1. **最底层**：`schema`（所有人依赖它）。
2. **中间层**：`runtime-core` 和 `plugin-system`（提供框架无关的核心机制）。
3. **桥接层**：`materials-react`、`render-react`、`render-vue`（结合具体 UI 框架实现功能）。
4. **最顶层**：`client`（B端编辑器）、`release`（C端展示页）和 `server`（后端 API），它们拼装底层的能力为最终用户提供产品。

这种 Monorepo 的拆包方式非常优雅，不仅实现了“关注点分离”，还确保了比如在 `client`（编辑器）和 `release`（C端渲染）之间完美复用了相同的组件物料（`materials-react`），保证了**所见即所得 (WYSIWYG)**。

## 启动

初次启动

构建schema

> pnpm run build:schema

构建物料

> pnpm run build:materials-react

构建render-react

> pnpm run build:render-react

启动前后端

> pnpm i
>
> pnpm run:client
>
> pnpm run:server

## 二开

拉取主分支即可

## To do

- 国际化配置
- echarts主题包封装
- 骨架屏设计
- 主题切换
- 权限配置
- 协作开发
- AI 辅助生成
