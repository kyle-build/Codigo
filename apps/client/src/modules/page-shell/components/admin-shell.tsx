/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import type { PageShellLayout } from "@codigo/schema";
import { BreadcrumbRow } from "./breadcrumb-row";
import { SidebarNav } from "./sidebar-nav";
import { TopNav } from "./top-nav";
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
  const isAuthLikePage =
    activePagePath?.startsWith("auth/") ||
    activePagePath === "auth" ||
    activePagePath === "404";

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
    <div className="h-full w-full flex flex-col bg-[#f5f7fb]">
      {isAuthLikePage ? (
        <main className="flex-1 min-h-0 overflow-auto bg-[#f5f7fb]">{children}</main>
      ) : (
        <>
          <header className="shrink-0 border-b border-[#e5e9f2] bg-white">
            <div className="flex min-h-[52px] items-center justify-between gap-4 px-4 md:px-5">
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-1.5">
                  <div className="text-[19px] font-extrabold uppercase tracking-[0.36em] text-[#2356d8]">
                    CODIGO
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="flex flex-1 min-h-0">
            <SidebarNav
              roots={treeRoots}
              activePagePath={activePagePath}
              openPaths={openPaths}
              setOpenPaths={setOpenPaths}
              onSelectPagePath={onSelectPagePath}
              interactive={interactive}
            />
            <main className="flex-1 min-h-0 overflow-auto bg-[#f5f7fb]">
              <div className="min-h-full p-3 md:p-4">{children}</div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
