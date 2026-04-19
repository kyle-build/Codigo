import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import type { PageShellLayout } from "@codigo/schema";
import { BreadcrumbRow } from "./BreadcrumbRow";
import { SidebarNav } from "./SidebarNav";
import { TopNav } from "./TopNav";
import type { AdminShellPage, AdminShellPageGroup } from "../utils/tree";
import { buildShellTree, deriveOpenPaths, resolveActiveTopNode } from "../utils/tree";

interface AdminShellProps extends PropsWithChildren {
  pages: AdminShellPage[];
  pageGroups?: AdminShellPageGroup[];
  activePagePath: string | null;
  onSelectPagePath: (path: string) => void;
  title?: string;
  layout?: PageShellLayout;
  interactive?: boolean;
}

export function AdminShell({
  pages,
  pageGroups = [],
  activePagePath,
  onSelectPagePath,
  title = "管理后台",
  layout = "leftRight",
  interactive = true,
  children,
}: AdminShellProps) {
  const treeRoots = useMemo(() => buildShellTree(pages, pageGroups), [pageGroups, pages]);
  const pagePathIndex = useMemo(() => {
    const map = new Map<string, AdminShellPage>();
    pages.forEach((p) => map.set(p.path, p));
    return map;
  }, [pages]);

  const derivedOpenPaths = useMemo(() => deriveOpenPaths(activePagePath), [activePagePath]);
  const [openPaths, setOpenPaths] = useState<Set<string>>(() => derivedOpenPaths);
  useEffect(() => {
    setOpenPaths(derivedOpenPaths);
  }, [derivedOpenPaths]);

  if (layout === "none") {
    return <>{children}</>;
  }

  if (layout === "topBottom" || layout === "breadcrumb") {
    return (
      <div className="h-full w-full flex flex-col bg-[var(--ide-bg)]">
        <TopNav
          title={title}
          roots={treeRoots}
          activePagePath={activePagePath}
          openPaths={openPaths}
          setOpenPaths={setOpenPaths}
          onSelectPagePath={onSelectPagePath}
          interactive={interactive}
        />
        {layout === "breadcrumb" ? (
          <BreadcrumbRow
            activePagePath={activePagePath}
            pagePathIndex={pagePathIndex}
            onSelectPagePath={onSelectPagePath}
            interactive={interactive}
          />
        ) : null}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    );
  }

  if (layout === "topLeft") {
    const activeTop = resolveActiveTopNode(treeRoots, activePagePath);
    return (
      <div className="h-full w-full flex flex-col bg-[var(--ide-bg)]">
        <TopNav
          title={title}
          roots={treeRoots}
          activePagePath={activePagePath}
          openPaths={openPaths}
          setOpenPaths={setOpenPaths}
          onSelectPagePath={onSelectPagePath}
          interactive={interactive}
        />
        <div className="flex-1 min-h-0 flex">
          <SidebarNav
            roots={activeTop?.children ?? []}
            activePagePath={activePagePath}
            openPaths={openPaths}
            setOpenPaths={setOpenPaths}
            onSelectPagePath={onSelectPagePath}
            header={{ title: activeTop?.label ?? "导航" }}
            extraTopPage={activeTop?.page ?? null}
            interactive={interactive}
          />
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </div>
    );
  }

  if (layout === "leftTop") {
    const navInteractiveClass = interactive ? "" : "pointer-events-none select-none";
    return (
      <div className="h-full w-full flex flex-col bg-[var(--ide-bg)]">
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
            <div className="text-[11px] text-[var(--ide-text-muted)]">预览/发布壳布局</div>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex">
          <SidebarNav
            roots={treeRoots}
            activePagePath={activePagePath}
            openPaths={openPaths}
            setOpenPaths={setOpenPaths}
            onSelectPagePath={onSelectPagePath}
            interactive={interactive}
          />
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-[var(--ide-bg)]">
      <SidebarNav
        roots={treeRoots}
        activePagePath={activePagePath}
        openPaths={openPaths}
        setOpenPaths={setOpenPaths}
        onSelectPagePath={onSelectPagePath}
        header={{ title }}
        interactive={interactive}
      />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
