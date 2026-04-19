import type { Dispatch, SetStateAction } from "react";
import type { AdminShellPage, ShellTreeNode } from "../utils/tree";

interface SidebarNavProps {
  roots: ShellTreeNode[];
  activePagePath: string | null;
  openPaths: Set<string>;
  setOpenPaths: Dispatch<SetStateAction<Set<string>>>;
  onSelectPagePath: (path: string) => void;
  className?: string;
  header?: {
    title: string;
    subtitle?: string;
  };
  extraTopPage?: AdminShellPage | null;
  interactive?: boolean;
}

export function SidebarNav({
  roots,
  activePagePath,
  openPaths,
  setOpenPaths,
  onSelectPagePath,
  className = "",
  header,
  extraTopPage,
  interactive = true,
}: SidebarNavProps) {
  const navInteractiveClass = interactive ? "" : "pointer-events-none select-none";

  const renderNode = (node: ShellTreeNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const isActiveLeaf = Boolean(node.page && node.page.path === activePagePath);
    const isActiveGroup = Boolean(
      activePagePath &&
        (activePagePath === node.path || activePagePath.startsWith(`${node.path}/`)),
    );

    if (!hasChildren) {
      const page = node.page;
      if (!page) return null;
      const isActive = page.path === activePagePath;
      return (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPagePath(page.path)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            isActive
              ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
              : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
          }`}
          style={{ paddingLeft: 12 + depth * 12 }}
        >
          {page.name}
        </button>
      );
    }

    const isOpen = openPaths.has(node.path);
    const overviewPage = node.group ? null : node.page;
    const childPages = node.children.map((child) => renderNode(child, depth + 1));

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
        className="group"
      >
        <summary
          className={`list-none flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
            isActiveGroup
              ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
              : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
          }`}
          style={{ paddingLeft: 12 + depth * 12 }}
        >
          <span className="truncate font-medium">
            {node.group?.name ?? node.page?.name ?? node.label}
          </span>
          <span
            className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded text-xs text-[var(--ide-text-muted)] transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </summary>
        <div className="mt-1 flex flex-col gap-1">
          {overviewPage ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(overviewPage.path)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                isActiveLeaf
                  ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                  : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
              }`}
              style={{ paddingLeft: 24 + depth * 12 }}
            >
              {overviewPage.name}
            </button>
          ) : null}
          {childPages}
        </div>
      </details>
    );
  };

  return (
    <aside
      className={`h-full w-56 shrink-0 border-r border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] flex flex-col ${navInteractiveClass} ${className}`}
    >
      {header ? (
        <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--ide-border)]">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--ide-text)]">{header.title}</div>
            {header.subtitle ? (
              <div className="truncate text-[11px] text-[var(--ide-text-muted)]">{header.subtitle}</div>
            ) : null}
          </div>
        </div>
      ) : null}
      <nav className="flex-1 min-h-0 p-2 flex flex-col gap-1 overflow-y-auto">
        {extraTopPage ? (
          <button
            type="button"
            onClick={() => onSelectPagePath(extraTopPage.path)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              extraTopPage.path === activePagePath
                ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
            }`}
          >
            {extraTopPage.name}
          </button>
        ) : null}
        {roots.map((node) => renderNode(node, 0))}
      </nav>
    </aside>
  );
}
