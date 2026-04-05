import { RocketOutlined } from "@ant-design/icons";
import type { AppManagementNavItem, AppManagementTab } from "../../types/appManagement";

interface AppManagementSidebarProps {
  currentTab: AppManagementTab;
  items: AppManagementNavItem[];
  onChange: (tab: AppManagementTab) => void;
}

function AppManagementSidebar({
  currentTab,
  items,
  onChange,
}: AppManagementSidebarProps) {
  return (
    <>
      <aside className="hidden w-[104px] shrink-0 lg:flex">
        <div className="flex h-full w-full flex-col items-center rounded-[30px] border border-slate-200/80 bg-white/82 px-3 py-5 shadow-[12px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl text-emerald-600 shadow-[0_20px_40px_-28px_rgba(16,185,129,0.75)]">
            <RocketOutlined />
          </div>
          <div className="flex w-full flex-1 flex-col gap-3">
            {items.map((item) => {
              const active = currentTab === item.key;

              return (
                <button
                  key={item.key}
                  className={`group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition-all duration-200 ${
                    active
                      ? "bg-emerald-500/10 text-emerald-600 shadow-[0_18px_32px_-24px_rgba(16,185,129,0.65)] before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-1 before:rounded-r-full before:bg-emerald-500"
                      : "bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-600"
                  }`}
                  type="button"
                  onClick={() => onChange(item.key)}
                >
                  <span className="text-[18px] leading-none">{item.icon}</span>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
        {items.map((item) => {
          const active = currentTab === item.key;

          return (
            <button
              key={item.key}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-emerald-500/10 text-emerald-600 shadow-[0_18px_32px_-24px_rgba(16,185,129,0.65)]"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200/80"
              }`}
              type="button"
              onClick={() => onChange(item.key)}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default AppManagementSidebar;
