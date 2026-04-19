import type { Dispatch, SetStateAction } from "react";
import type { ShellTreeNode } from "../utils/tree";

interface TopNavProps {
  title: string;
  roots: ShellTreeNode[];
  activePagePath: string | null;
  openPaths: Set<string>;
  setOpenPaths: Dispatch<SetStateAction<Set<string>>>;
  onSelectPagePath: (path: string) => void;
  interactive?: boolean;
}

export function TopNav({
  title,
  roots,
  activePagePath,
  openPaths,
  setOpenPaths,
  onSelectPagePath,
  interactive = true,
}: TopNavProps) {
  const navInteractiveClass = interactive ? "" : "pointer-events-none select-none";

  const renderTopNavItem = (node: ShellTreeNode) => {
    const hasChildren = node.children.length > 0;
    const nodeTitle = node.group?.name ?? node.page?.name ?? node.label;
    const isActive = Boolean(
      activePagePath &&
        (activePagePath === node.path || activePagePath.startsWith(`${node.path}/`)),
    );

    if (!hasChildren) {
      const page = node.page;
      if (!page) return null;
      return (
        <button
          key={node.path}
          type="button"
          onClick={() => onSelectPagePath(page.path)}
          className={`h-10 rounded-2xl px-4 text-sm font-medium transition-all ${
            page.path === activePagePath
              ? "bg-[#f3efff] text-[#6f52ed]"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {page.name}
        </button>
      );
    }

    const isOpen = openPaths.has(node.path);

    const renderDropdownNode = (child: ShellTreeNode, depth: number) => {
      if (!child.children.length) {
        const page = child.page;
        if (!page) return null;
        const active = page.path === activePagePath;
        return (
          <button
            key={page.id}
            type="button"
            onClick={() => onSelectPagePath(page.path)}
            className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[#f3efff] text-[#6f52ed]"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            style={{ paddingLeft: 12 + depth * 12 }}
          >
            {page.name}
          </button>
        );
      }

      const activeGroup = Boolean(
        activePagePath &&
          (activePagePath === child.path || activePagePath.startsWith(`${child.path}/`)),
      );
      const overview = child.group ? null : child.page;
      return (
        <div key={child.path} className="flex flex-col gap-1">
          <div
            className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${
              activeGroup ? "text-slate-800" : "text-slate-400"
            }`}
            style={{ paddingLeft: 12 + depth * 12 }}
          >
            {child.group?.name ?? child.page?.name ?? child.label}
          </div>
          {overview ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(overview.path)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                overview.path === activePagePath
                  ? "bg-[#f3efff] text-[#6f52ed]"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              style={{ paddingLeft: 24 + depth * 12 }}
            >
              {overview.name}
            </button>
          ) : null}
          {child.children.map((grand) => renderDropdownNode(grand, depth + 1))}
        </div>
      );
    };

    return (
      <details
        key={node.path}
        open={isOpen}
        onToggle={(event) => {
          const target = event.currentTarget;
          setOpenPaths((prev) => {
            const next = new Set(prev);
            if (target.open) {
              next.add(node.path);
            } else {
              next.delete(node.path);
            }
            return next;
          });
        }}
        className="relative"
      >
        <summary
          className={`list-none flex h-10 cursor-pointer items-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all ${
            isActive
              ? "bg-[#f3efff] text-[#6f52ed]"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="truncate">{nodeTitle}</span>
          <span className={`text-[10px] text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>v</span>
        </summary>
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          {node.page && !node.group ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(node.page!.path)}
              className={`mb-1 w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                node.page!.path === activePagePath
                ? "bg-[#f3efff] text-[#6f52ed]"
                : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {node.page!.name}
            </button>
          ) : null}
          <div className="max-h-[320px] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {node.children.map((child) => renderDropdownNode(child, 0))}
            </div>
          </div>
        </div>
      </details>
    );
  };

  return (
    <header
      className={`shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur ${navInteractiveClass}`}
    >
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-5 md:px-8">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b7cff] to-[#6f52ed] text-sm font-bold text-white shadow-[0_16px_32px_rgba(111,82,237,0.22)]">
            VA
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
            <div className="truncate text-[11px] uppercase tracking-[0.22em] text-slate-400">Workspace</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-2">{roots.map(renderTopNavItem)}</nav>
      </div>
      <div className="border-t border-slate-100 px-3 py-3 md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {roots.map(renderTopNavItem)}
        </div>
      </div>
    </header>
  );
}
