import { ArrowLeftOutlined, LoginOutlined, RocketOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AppManagementPageProps {
  children: ReactNode;
  footer: ReactNode;
  hero: ReactNode;
  isLoggedIn: boolean;
}

function AppManagementPage({
  children,
  footer,
  hero,
  isLoggedIn,
}: AppManagementPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_36%)]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200/80 bg-white/80 px-5 py-4 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Codigo Studio
            </div>
            <div className="mt-2 text-xl font-semibold text-slate-900">
              应用管理
            </div>
            <div className="mt-1 text-sm text-slate-500">
              独立页面入口，管理草稿、发布、模板与版本。
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/">
              <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
            </Link>
            <Link to={isLoggedIn ? "/editor" : "/login"}>
              <Button
                icon={isLoggedIn ? <RocketOutlined /> : <LoginOutlined />}
                type="primary"
              >
                {isLoggedIn ? "进入编辑器" : "立即登录"}
              </Button>
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          {hero}
          {children}
          {footer}
        </section>
      </main>
    </div>
  );
}

export default AppManagementPage;
