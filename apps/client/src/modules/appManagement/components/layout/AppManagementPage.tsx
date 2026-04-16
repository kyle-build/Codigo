import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { HomeUserEntry } from "@/modules/home/components/layout/HomeUserEntry";

interface AppManagementPageProps {
  avatarUrl?: string;
  children: ReactNode;
  isLoggedIn: boolean;
  openLogin: () => void;
  userMenuItems: MenuProps["items"];
  username?: string;
}

function AppManagementPage({
  avatarUrl,
  children,
  isLoggedIn,
  openLogin,
  userMenuItems,
  username,
}: AppManagementPageProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      <header className="z-20 h-12 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500 font-mono text-sm font-bold text-white shadow-sm shadow-emerald-500/20">
                C
              </div>
              <span className="font-mono text-sm font-semibold tracking-wider text-slate-900">
                Codigo
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">/</span>
            <span className="text-sm font-medium text-slate-600">应用管理</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/">
              <Button size="small" icon={<ArrowLeftOutlined />}>
                返回
              </Button>
            </Link>
            <HomeUserEntry
              avatarUrl={avatarUrl}
              isLoggedIn={isLoggedIn}
              openLogin={openLogin}
              userMenuItems={userMenuItems}
              username={username}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default AppManagementPage;
