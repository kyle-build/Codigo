# 9.2 安全设计

## 9.2.1 安全目标

- 身份认证：所有写接口与用户私密资源必须要求 JWT；支持可选鉴权的读取接口需严格执行可见性策略。
- 授权：后台治理能力采用“全局角色 + 权限点”双层授权。
- 审计：关键治理操作、发布操作、协作成员变更应可追踪、可审计、可回放。
- 合规：敏感信息（手机号、token、密钥、表单提交数据）需最小化采集与输出；日志脱敏；明确保留周期。

## 9.2.2 身份认证（Authentication）

- JWT：
  - 传输：仅通过 `Authorization: Bearer <token>`；
  - 有效期：7d（以服务端配置为准）；
  - 校验：服务端验证 token、用户存在与冻结状态。
- 密码存储：
  - 使用 bcrypt 哈希存储（bcryptjs）；
  - 禁止明文密码落库与日志输出。
- 验证码：
  - 图形验证码：用于防刷；默认不强制，命中风控时才要求输入；
  - 短信验证码：限流与重复发送控制（Redis 记录发送频率窗口；高风险触发图形验证码）。

## 9.2.3 授权（Authorization）

- 角色（GlobalRole）：SUPER_ADMIN / ADMIN / USER（以 `@codigo/schema` 为准）。
- 后台权限点：
  - 通过 `@AdminPermissions(...)` + `AdminPermissionGuard` 校验；
  - 结合全局角色形成最终有效权限集合。

## 9.2.4 审计日志（Audit）

建议对以下行为写入审计日志（可复用 `operation_log` 表）：

- 后台治理：用户角色/状态/权限点修改；删除页面/组件；模板 CRUD；
- 发布：发布页面、修改可见性/过期时间；
- 协作：邀请/移除/改角色；锁定编辑；关键协作事件（可抽样记录）。

审计字段建议：
- actor_id、page_id、event、target、ip、ua、request_id、created_at

## 9.2.5 加密算法与密钥管理

### 传输加密

- 全站 HTTPS（TLS 1.2+）；禁止在公网暴露 HTTP 明文。

### 存储加密

- 密码：bcrypt（已实现）
- Token/密钥：不落库；如必须落库，采用 KMS 管理的数据加密密钥（DEK）进行字段级加密。

### 密钥管理（建议）

- 所有密钥（JWT_SECRET、短信服务密钥、OSS 密钥、DB 密码）只通过环境变量/密钥管理系统注入；
- 在 CI 中启用 secret scanning；
- 定期轮换密钥，并具备紧急吊销与回滚策略。

## 9.2.6 OWASP Top 10 防护清单（落地要点）

- A01 Broken Access Control：所有资源访问必须基于 owner/collaborator/role 校验；private 页面匿名访问必须返回 401。
- A02 Cryptographic Failures：强制 HTTPS；敏感数据不打印日志；密钥不硬编码。
- A03 Injection：对 `path`、`id`、`query` 参数做白名单校验；DB 查询使用参数化；避免拼接 SQL。
- A04 Insecure Design：对 Legacy 接口做治理与下线计划，避免能力重复导致绕过。
- A05 Security Misconfiguration：生产禁用 `synchronize: true`；启用 CORS 白名单；统一安全响应头。
- A07 Identification & Authentication Failures：验证码限流；登录失败次数限制；冻结用户强制拒绝。
- A08 Software and Data Integrity Failures：依赖锁定（pnpm-lock）；CI 校验；发布产物签名（可选）。
- A09 Security Logging & Monitoring Failures：审计日志 + 告警（异常登录、频繁发布、异常删除）。
- A10 SSRF（如涉及外部 URL）：对外部 URL 访问做 allowlist（当前主要是 OSS SDK，不直接代理 URL）。

## 9.2.7 当前实现风险点（需要整改）

以下为“代码层已可见”的风险点，建议作为安全整改 ADR 的输入：

- **敏感配置硬编码**：DB 连接信息、部分第三方配置存在硬编码风险；应迁移到环境变量/密钥管理，并避免出现在仓库里。
 - **日志泄露风险**：短信验证码发送链路不应输出验证码/密钥到日志；调试输出已移除，后续新增日志需持续保持脱敏策略。
- **DB schema 同步策略**：`synchronize: true` 在生产环境存在不可控变更风险；建议迁移到 migrations。
- **缺少显式约束**：关键唯一约束/索引缺失可能引发越权/数据重复问题（如协作者重复记录）。

## 9.2.8 安全验收标准（建议）

- 所有敏感配置均可通过环境变量注入，仓库不含明文密钥/密码；
- 核心接口均有鉴权与权限测试用例覆盖；
- 关键审计事件可追溯（含 request_id、actor、目标对象）；
- OWASP Top 10 中与本系统相关项有明确落地措施与验证方式。
