import type { PropsWithChildren } from "react";
import type { IEditorPageSchema } from "@codigo/schema";

type AdminShellPage = Pick<IEditorPageSchema, "id" | "name" | "path">;

interface AdminShellProps extends PropsWithChildren {
  pages: AdminShellPage[];
  activePagePath: string | null;
  onSelectPagePath: (path: string) => void;
  title?: string;
}

export function AdminShell({
  pages,
  activePagePath,
  onSelectPagePath,
  title = "管理后台",
  children,
}: AdminShellProps) {
  return (
    <div className="h-full w-full flex bg-slate-50">
      <aside className="h-full w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-slate-200 font-semibold text-slate-900">
          {title}
        </div>
        <nav className="flex-1 min-h-0 p-2 flex flex-col gap-1 overflow-y-auto">
          {pages.map((page) => {
            const isActive = page.path === activePagePath;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelectPagePath(page.path)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {page.name}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
