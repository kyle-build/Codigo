import { ArrowRightOutlined, FileTextOutlined, FormOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTitle } from "ahooks";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";

/** 管理后台概览页：提供常用入口与项目状态摘要。 */
export default function AdminDashboard() {
  useTitle("Codigo - 管理后台");
  const navigate = useNavigate();
  const { store: storeAuth } = useStoreAuth();

  return (
    <div className="h-full p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] text-[var(--ide-text-muted)]">
            欢迎回来，{storeAuth.details?.username ?? "用户"}
          </div>
          <h2 className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ide-text)]">
            管理工作台
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="default"
            icon={<FileTextOutlined />}
            onClick={() => navigate("/doc")}
          >
            开发文档
          </Button>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate("/editor")}
          >
            进入编辑器
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <section className="col-span-12 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[12px] font-medium text-[var(--ide-text)]">
                快捷入口
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--ide-text-muted)]">
                常用能力收口在这里：应用管理、指标统计、编辑器与文档。
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              className="group flex items-center justify-between rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-sidebar-bg)] px-3 py-2 text-left transition-colors hover:bg-[var(--ide-hover)]"
              onClick={() => navigate("/app-management?tab=published")}
            >
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--ide-text)]">
                  应用管理
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--ide-text-muted)]">
                  查看已发布/开发中应用
                </div>
              </div>
              <ArrowRightOutlined className="text-[12px] text-[var(--ide-text-muted)] transition-colors group-hover:text-[var(--ide-text)]" />
            </button>

            <button
              className="group flex items-center justify-between rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-sidebar-bg)] px-3 py-2 text-left transition-colors hover:bg-[var(--ide-hover)]"
              onClick={() => navigate("/admin/metrics")}
            >
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--ide-text)]">
                  指标统计
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--ide-text-muted)]">
                  表单组件数据与详情
                </div>
              </div>
              <ArrowRightOutlined className="text-[12px] text-[var(--ide-text-muted)] transition-colors group-hover:text-[var(--ide-text)]" />
            </button>

            <button
              className="group flex items-center justify-between rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-sidebar-bg)] px-3 py-2 text-left transition-colors hover:bg-[var(--ide-hover)]"
              onClick={() => navigate("/doc")}
            >
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--ide-text)]">
                  开发文档
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--ide-text-muted)]">
                  快速查阅能力说明与规范
                </div>
              </div>
              <ArrowRightOutlined className="text-[12px] text-[var(--ide-text-muted)] transition-colors group-hover:text-[var(--ide-text)]" />
            </button>

            <button
              className="group flex items-center justify-between rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-sidebar-bg)] px-3 py-2 text-left transition-colors hover:bg-[var(--ide-hover)]"
              onClick={() => navigate("/editor")}
            >
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--ide-text)]">
                  编辑器
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--ide-text-muted)]">
                  开始搭建后台页面
                </div>
              </div>
              <ArrowRightOutlined className="text-[12px] text-[var(--ide-text-muted)] transition-colors group-hover:text-[var(--ide-text)]" />
            </button>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-7 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            模块概览
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "基础设置", to: "/admin/settings" },
              { label: "权限设置", to: "/admin/permissions" },
              { label: "角色管理", to: "/admin/roles" },
              { label: "版本管理", to: "/admin/versions" },
              { label: "代码片段", to: "/admin/snippets" },
              { label: "数据大屏", to: "/admin/big-screen" },
            ].map((item) => (
              <button
                key={item.to}
                className="rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-sidebar-bg)] px-2 py-2 text-left text-[12px] text-[var(--ide-text)] transition-colors hover:bg-[var(--ide-hover)]"
                onClick={() => navigate(item.to)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-[var(--ide-text-muted)]">
            当前版本仅提供页面结构与核心工作流入口；暂不包含 npm 包管理。
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            今日提示
          </div>
          <ul className="mt-2 space-y-1 text-[11px] text-[var(--ide-text-muted)]">
            <li>先创建/编辑页面，再发布生成可分享链接。</li>
            <li>指标统计依赖表单组件；若为空请先在编辑器中创建表单。</li>
            <li>权限与角色模块将用于后续管理后台的 RBAC 配置。</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

