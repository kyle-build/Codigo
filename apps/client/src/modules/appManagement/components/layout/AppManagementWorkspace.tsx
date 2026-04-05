import type { ReactNode } from "react";
import type {
  AppManagementNavItem,
  AppManagementTab,
} from "../../types/appManagement";
import AppManagementSidebar from "../navigation/AppManagementSidebar";

interface AppManagementWorkspaceProps {
  children: ReactNode;
  currentTab: AppManagementTab;
  items: AppManagementNavItem[];
  onChange: (tab: AppManagementTab) => void;
}

function AppManagementWorkspace({
  children,
  currentTab,
  items,
  onChange,
}: AppManagementWorkspaceProps) {
  const currentItem = items.find((item) => item.key === currentTab) ?? items[0];

  return (
    <section className="flex w-full gap-6 px-6 pb-8 pt-6">
      <AppManagementSidebar
        currentTab={currentTab}
        items={items}
        onChange={onChange}
      />

      <section className="min-w-0 flex-1">
        <section
          className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/75 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          id="app-management"
        >
          <div className="p-4 md:p-8">
            <div className="mx-auto flex min-h-[520px] w-full max-w-5xl flex-col rounded-[28px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  {currentItem.label}
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                  {currentItem.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {currentItem.description}
                </p>
              </div>

              <div className="mt-6 flex-1">{children}</div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
}

export default AppManagementWorkspace;
