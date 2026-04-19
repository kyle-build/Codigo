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
          className={`h-9 px-3 rounded-md text-sm transition-colors ${
            page.path === activePagePath
              ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
              : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
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
                ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
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
      const overview = child.page;
      return (
        <div key={child.path} className="flex flex-col gap-1">
          <div
            className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${
              activeGroup ? "text-[var(--ide-text)]" : "text-[var(--ide-text-muted)]"
            }`}
            style={{ paddingLeft: 12 + depth * 12 }}
          >
            {child.label}
          </div>
          {overview ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(overview.path)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                overview.path === activePagePath
                  ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                  : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
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
          className={`list-none h-9 px-3 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-2 ${
            isActive
              ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
              : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
          }`}
        >
          <span className="truncate">{node.label}</span>
          <span
            className={`text-xs text-[var(--ide-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </summary>
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] p-2 shadow-xl">
          {node.page ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(node.page!.path)}
              className={`mb-1 w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                node.page!.path === activePagePath
                  ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                  : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
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
      className={`h-14 shrink-0 border-b border-[var(--ide-border)] bg-[var(--ide-header-bg)] ${navInteractiveClass}`}
    >
      <div className="h-full px-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="shrink-0 h-8 w-8 rounded-lg bg-[var(--ide-accent)] text-[var(--ide-statusbar-text)] flex items-center justify-center font-semibold">
            C
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--ide-text)]">{title}</div>
            <div className="truncate text-[11px] text-[var(--ide-text-muted)]">Workspace</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1">{roots.map(renderTopNavItem)}</nav>
      </div>
      <div className="md:hidden border-t border-[var(--ide-border)] px-3 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {roots.map(renderTopNavItem)}
        </div>
      </div>
    </header>
  );
}
