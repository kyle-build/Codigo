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
      <aside className="hidden w-[64px] shrink-0 border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-full w-full flex-col items-center py-2">
          <div className="flex w-full flex-1 flex-col gap-0.5">
            {items.map((item) => {
              const active = currentTab === item.key;

              return (
                <button
                  key={item.key}
                  className={`group relative flex w-full flex-col items-center justify-center gap-1 py-3 transition-all duration-150 ${
                    active
                      ? "text-emerald-600"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                  type="button"
                  onClick={() => onChange(item.key)}
                >
                  {active && (
                    <span className="absolute left-0 top-0 h-full w-[2px] bg-emerald-500" />
                  )}
                  <span className="text-[20px] leading-none">{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="border-b border-slate-200 bg-white p-2 lg:hidden">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const active = currentTab === item.key;

            return (
              <button
                key={item.key}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                type="button"
                onClick={() => onChange(item.key)}
              >
                <span className="text-sm leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default AppManagementSidebar;
