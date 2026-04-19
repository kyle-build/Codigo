# 4. 接口设计（REST）

## 4.1 基础约定

### Base URL 与前缀

- 后端统一前缀：`/api`
- 鉴权：`Authorization: Bearer <JWT>`

### 响应结构（统一封装）

后端通过全局拦截器统一包装成功响应，并通过异常过滤器统一包装错误响应。

- 成功：`{ code: 0, data, msg?, message? }`
- 失败：`{ code, data:null, msg, message, error:{ status, name, timestamp, path?, details? } }`

状态码枚举见：`apps/server/src/core/exception/code.ts`。

### 鉴权与权限

- JWT：Passport `jwt` 策略，服务端从 `Authorization` 头解析 token。
- 可选鉴权：部分接口允许匿名访问，但若携带 token 会注入用户用于权限判断（例如读取发布页面）。
- 后台治理接口：通常要求 `JWT + RolesGuard + AdminPermissionGuard`。

## 4.2 接口清单（按模块分组）

说明：
- “Legacy” 为历史兼容接口，建议逐步淘汰并统一到新路径。
- 以下清单覆盖主要能力；细节请求体/返回体字段与校验以 DTO 与实体为准。

### Auth（新路径）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| GET | `/auth/captcha` | 否 | 获取图形验证码（SVG） |
| POST | `/auth/sms-codes` | 否 | 发送短信验证码（默认不需要图形验证码；命中风控才需要） |
| POST | `/auth/tokens/password` | 否 | 账号密码登录，返回 token |
| POST | `/auth/tokens/phone` | 否 | 手机验证码登录，返回 token |

补充约定：
- `/auth/sms-codes` 入参 `captcha` 为可选；当服务端判断需要图形验证码时，会返回业务码 `602`（CaptchaRequired），前端应先调用 `/auth/captcha` 并携带 `captcha` 重试。
- 图形验证码与风控判断基于来源指纹（ip + user-agent 的 hash）进行绑定。

### Users（新路径）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| POST | `/users` | 否 | 注册 |
| PATCH | `/users/me` | 是 | 更新个人资料 |
| PUT | `/users/me/password` | 是 | 修改密码 |

### User（Legacy）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| GET | `/user/me` | 是 | 获取当前用户 |
| POST | `/user/captcha` | 否 | 获取图形验证码（body 版本） |
| POST | `/user/register` | 否 | 注册（重复能力） |
| POST | `/user/password_login` | 否 | 密码登录（重复能力） |
| POST | `/user/phone_login` | 否 | 手机登录（重复能力） |

### Pages（发布/访问/版本/提交数据）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| PUT | `/pages/me` | 是 | 发布/更新“我的页面”，并生成版本快照 |
| GET | `/pages/me` | 是 | 获取“我的页面” |
| PUT | `/pages/:id/config` | 是 | 更新可见性/过期时间 |
| GET | `/pages/public` | 否 | 公共页面列表（过滤私密/过期） |
| GET | `/pages/:id` | 可选 | 获取发布内容（public 未过期可匿名；private 需 owner） |
| GET | `/pages/:id/versions` | 是 | 版本列表 |
| GET | `/pages/:id/versions/:versionId` | 是 | 版本详情 |
| GET | `/pages/:id/submissions/me` | 否 | 判断是否已提交（基于 ip+ua） |
| POST | `/pages/:id/submissions` | 否 | 提交数据（基于 ip+ua） |

### Workspace（页面源码工作区 / WebIDE 文件系统）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| GET | `/pages/:id/workspace` | 是 | 获取工作区元信息 |
| POST | `/pages/:id/workspace` | 是 | 同步工作区（首次复制模板 + 写入 schema 文件） |
| GET | `/pages/:id/workspace/explorer` | 是 | 获取目录树 |
| GET | `/pages/:id/workspace/file?path=...` | 是 | 读取文件 |
| PUT | `/pages/:id/workspace/file` | 是 | 写文件（写 schema 文件会回写 DB） |
| GET | `/pages/:id/workspace/ide-config` | 是 | 获取 IDE 配置 |
| POST | `/pages/:id/workspace/ide-config` | 是 | 保存 IDE 配置 |

### Collaborators（协作成员）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| GET | `/pages/:pageId/collaborators` | 是 | 成员列表 |
| POST | `/pages/:pageId/collaborators` | 是 | 邀请协作者 |
| PUT | `/pages/:pageId/collaborators/:userId` | 是 | 更新协作者角色 |
| DELETE | `/pages/:pageId/collaborators/:userId` | 是 | 移除协作者 |

### Resources（资源）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| POST | `/resources/upload` | 是 | 上传文件（multipart） |
| POST | `/resources` | 是 | 上传文件（重复入口） |
| GET | `/resources?type=...` | 是 | 资源列表 |
| DELETE | `/resources?id=...` | 是 | 删除资源（重复入口） |
| DELETE | `/resources/:id` | 是 | 删除资源（重复入口） |

### Templates（模板）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---:|---|
| GET | `/templates` | 否 | 模板列表（支持筛选） |
| GET | `/templates/key/:key` | 否 | 模板详情（按 key） |
| GET | `/templates/:id` | 否 | 模板详情（按 id） |
| POST | `/templates` | 是（ADMIN） | 创建模板 |
| PUT | `/templates/:id` | 是（ADMIN） | 更新模板 |
| DELETE | `/templates/:id` | 是（ADMIN） | 删除模板 |

### Admin（后台治理）

说明：以下接口通常需要 `@Roles(ADMIN|SUPER_ADMIN)` + `@AdminPermissions(...)`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/admin/users` | 用户列表 |
| PUT | `/admin/users/:id/role` | 更新用户全局角色 |
| PUT | `/admin/users/:id/status` | 冻结/解冻用户 |
| PUT | `/admin/users/:id/permissions` | 更新用户权限点 |
| GET | `/admin/pages` | 页面列表 |
| GET | `/admin/pages/:id/versions` | 页面版本列表 |
| DELETE | `/admin/pages/:id` | 删除页面 |
| GET | `/admin/components/stats` | 组件统计 |
| GET | `/admin/components` | 组件列表 |
| DELETE | `/admin/components/:id` | 删除组件 |

## 4.3 Legacy 接口淘汰策略（建议）

- 原则：保持对外稳定，内部收口到新路径实现，逐步移除重复能力。
- 建议步骤：
  1. 文档标注 Legacy 与替代接口；
  2. 前端逐步切换到新路径；
  3. 后端为 Legacy 增加弃用提示（响应头/日志），并设定移除版本；
  4. 最终删除 Legacy Controller 与路由。
