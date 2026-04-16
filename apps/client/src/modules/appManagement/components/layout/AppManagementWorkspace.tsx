import type { ReactNode } from "react";
import type {
  AppManagementNavItem,
  AppManagementTab,
} from "../../types/appManagement";
import AppManagementSidebar from "../navigation/AppManagementSidebar";

interface AppManagementWorkspaceProps {
  children: ReactNode;
  currentTab: AppManagementTab;
  footer: ReactNode;
  hero: ReactNode;
  items: AppManagementNavItem[];
  onChange: (tab: AppManagementTab) => void;
}

function AppManagementWorkspace({
  children,
  currentTab,
  footer,
  hero,
  items,
  onChange,
}: AppManagementWorkspaceProps) {
  const currentItem = items.find((item) => item.key === currentTab) ?? items[0];

  return (
    <section className="flex flex-1 overflow-hidden">
      <AppManagementSidebar
        currentTab={currentTab}
        items={items}
        onChange={onChange}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto flex min-h-full max-w-5xl flex-col p-6">
          <div className="shrink-0">{hero}</div>

          <section className="flex-1 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {currentItem.label}
              </span>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {currentItem.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {currentItem.description}
              </p>
            </div>

            <div className="flex-1">{children}</div>
          </section>

          <div className="mt-auto shrink-0">{footer}</div>
        </div>
      </main>
    </section>
  );
}

export default AppManagementWorkspace;
