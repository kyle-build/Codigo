import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { IEditorPageGroupSchema, IEditorPageSchema } from "@codigo/schema";

type AdminShellPage = Pick<IEditorPageSchema, "id" | "name" | "path">;
type AdminShellPageGroup = Pick<IEditorPageGroupSchema, "id" | "name" | "path">;
type ShellTreeNode = {
  path: string;
  label: string;
  group?: AdminShellPageGroup;
  page?: AdminShellPage;
  children: ShellTreeNode[];
  order: number;
};

interface AdminShellProps extends PropsWithChildren {
  pages: AdminShellPage[];
  pageGroups?: AdminShellPageGroup[];
  activePagePath: string | null;
  onSelectPagePath: (path: string) => void;
  title?: string;
}

/**
 * Builds the release navigation tree from explicit page groups and page paths.
 */
function buildReleaseShellTree(pages: AdminShellPage[], pageGroups: AdminShellPageGroup[] = []) {
  const roots = new Map<string, ShellTreeNode>();
  const childrenMap = new Map<string, Map<string, ShellTreeNode>>();

  const getChildren = (path: string) => {
    const existing = childrenMap.get(path);
    if (existing) return existing;
    const created = new Map<string, ShellTreeNode>();
    childrenMap.set(path, created);
    return created;
  };

  const ensureNode = (
    parent: string,
    segment: string,
    fullPath: string,
    order: number,
    group?: AdminShellPageGroup,
  ) => {
    const map = parent ? getChildren(parent) : roots;
    const existing = map.get(segment);
    if (existing) {
      existing.order = Math.min(existing.order, order);
      if (group) {
        existing.group = group;
        existing.label = group.name;
      }
      return existing;
    }
    const created: ShellTreeNode = {
      path: fullPath,
      label: group?.name ?? segment,
      group,
      children: [],
      order,
    };
    map.set(segment, created);
    return created;
  };

  pageGroups.forEach((group, index) => {
    const segments = group.path.split("/").filter(Boolean);
    if (!segments.length) return;
    let parent = "";
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const fullPath = parent ? `${parent}/${segment}` : segment;
      ensureNode(parent, segment, fullPath, index, i === segments.length - 1 ? group : undefined);
      parent = fullPath;
    }
  });

  pages.forEach((page, index) => {
    const segments = page.path.split("/").filter(Boolean);
    if (!segments.length) return;
    let parent = "";
    let currentNode: ShellTreeNode | null = null;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const fullPath = parent ? `${parent}/${segment}` : segment;
      currentNode = ensureNode(parent, segment, fullPath, pageGroups.length + index);
      parent = fullPath;
    }
    if (currentNode) {
      currentNode.page = page;
      if (!currentNode.group && currentNode.children.length > 0) {
        currentNode.label = page.name;
      }
    }
  });

  const materialize = (map: Map<string, ShellTreeNode>): ShellTreeNode[] => {
    const nodes = Array.from(map.values());
    nodes.forEach((node) => {
      const childMap = childrenMap.get(node.path);
      if (childMap) {
        node.children = materialize(childMap);
        if (node.children.length) {
          node.order = Math.min(node.order, node.children[0]?.order ?? node.order);
          if (node.page && !node.group) {
            node.label = node.page.name;
          }
        }
      }
    });
    return nodes.sort((a, b) =>
      a.order !== b.order ? a.order - b.order : a.path.localeCompare(b.path),
    );
  };

  return materialize(roots);
}

/**
 * Returns the visible label for a release shell node.
 */
function getNodeTitle(node: ShellTreeNode) {
  return node.group?.name ?? node.page?.name ?? node.label;
}

/**
 * Renders simple sidebar icons that visually align with the target admin shell.
 */
function renderTopLevelIcon(label: string, active: boolean): ReactNode {
  const stroke = active ? "#2356d8" : "#5b6472";
  const key = label.trim().toLowerCase();

  switch (key) {
    case "dashboard":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="14" height="10" rx="1.8" stroke={stroke} strokeWidth="1.6" />
          <path d="M7 16H13M10 14V16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <circle cx="8" cy="7" r="2.2" stroke={stroke} strokeWidth="1.6" />
          <circle cx="13.5" cy="8" r="1.8" stroke={stroke} strokeWidth="1.6" />
          <path d="M4.8 14.4c.9-1.7 2.3-2.5 4.1-2.5s3.2.8 4.1 2.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11.8 13.6c.5-1.1 1.4-1.7 2.7-1.7 1 0 1.8.4 2.5 1.3" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M3.5 6.2h4.3l1.2 1.5H16.5v6.8a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V6.2Z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M3.5 7.8h13" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="14" height="10" rx="1.8" stroke={stroke} strokeWidth="1.6" />
          <path d="M3.8 8.2h12.4" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case "auth":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M11.2 4H15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3.8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9.8 6.5 12.8 10l-3 3.5M12.4 10H4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "faq":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="6.5" stroke={stroke} strokeWidth="1.6" />
          <path d="M8.6 8.1c0-1 1-1.8 2.2-1.8 1.1 0 2 .6 2 1.7 0 1.4-1.5 1.7-2.2 2.5-.3.3-.4.7-.4 1" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="10.1" cy="13.8" r=".9" fill={stroke} />
        </svg>
      );
    case "404":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M6 3.8h6l3 3v9.4a.8.8 0 0 1-.8.8H6a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1Z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 3.8v3h3" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "account preferences":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <circle cx="8.2" cy="7" r="2.3" stroke={stroke} strokeWidth="1.6" />
          <path d="M4.7 14.7c.8-1.8 2.1-2.8 3.9-2.8 1.9 0 3.3 1 4.1 2.8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14.8 7.5v3M13.3 9h3" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "application settings":
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="2.3" stroke={stroke} strokeWidth="1.6" />
          <path d="M10 4.1v1.7M10 14.2v1.7M15.9 10h-1.7M5.8 10H4.1M14.2 5.8 13 7M7 13l-1.2 1.2M14.2 14.2 13 13M7 7 5.8 5.8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="4.8" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
  }
}

export default function AdminShell({
  pages,
  pageGroups = [],
  activePagePath,
  onSelectPagePath,
  title = "管理后台",
  children,
}: AdminShellProps) {
  const treeRoots = useMemo(() => buildReleaseShellTree(pages, pageGroups), [pageGroups, pages]);

  const derivedOpenPaths = useMemo(() => {
    const next = new Set<string>();
    const path = activePagePath?.trim() ?? "";
    if (!path) {
      return next;
    }
    const segments = path.split("/").filter(Boolean);
    let current = "";
    for (let i = 0; i < segments.length - 1; i += 1) {
      current = current ? `${current}/${segments[i]}` : segments[i];
      next.add(current);
    }
    return next;
  }, [activePagePath]);

  const [openPaths, setOpenPaths] = useState<Set<string>>(() => derivedOpenPaths);
  const isAuthLikePage =
    activePagePath?.startsWith("auth/") ||
    activePagePath === "auth" ||
    activePagePath === "404";

  useEffect(() => {
    setOpenPaths(derivedOpenPaths);
  }, [derivedOpenPaths]);

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
      const titleText = getNodeTitle(node);
      const isTopLevel = depth === 0;
      return (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPagePath(page.path)}
          className={`group flex w-full items-center text-left transition-colors ${
            isActive
              ? "bg-[#edf4ff] text-[#2356d8]"
              : "text-[#253448] hover:bg-[#f5f7fb]"
          }`}
          style={{
            minHeight: isTopLevel ? 34 : 32,
            paddingLeft: isTopLevel ? 14 : 36 + (depth - 1) * 16,
            paddingRight: 14,
          }}
        >
          {isTopLevel ? (
            <span className="mr-2 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
              {renderTopLevelIcon(titleText, isActive)}
            </span>
          ) : null}
          <span className={`min-w-0 flex-1 truncate ${isTopLevel ? "text-[15px] font-semibold" : "text-[14px] font-medium"}`}>
            {titleText}
          </span>
        </button>
      );
    }

    const isOpen = openPaths.has(node.path);
    const overviewPage = node.group ? null : node.page;
    const childPages = node.children.map((child) => renderNode(child, depth + 1));
    const titleText = getNodeTitle(node);
    const isTopLevel = depth === 0;

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
          className={`list-none cursor-pointer transition-colors ${
            isActiveGroup
              ? "bg-[#edf4ff] text-[#2356d8]"
              : "text-[#253448] hover:bg-[#f5f7fb]"
          }`}
          style={{
            minHeight: isTopLevel ? 34 : 32,
            paddingLeft: isTopLevel ? 14 : 36 + (depth - 1) * 16,
            paddingRight: 14,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <div className="flex items-center">
            {isTopLevel ? (
              <span className="mr-2 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                {renderTopLevelIcon(titleText, isActiveGroup)}
              </span>
            ) : null}
            <div className={`min-w-0 flex-1 truncate ${isTopLevel ? "text-[15px] font-semibold" : "text-[14px] font-medium"}`}>
              {titleText}
            </div>
            <span className={`ml-2 inline-flex h-4 w-4 items-center justify-center transition-transform ${isOpen ? "rotate-180" : ""}`}>
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                <path d="m4 6 4 4 4-4" stroke={isActiveGroup ? "#2356d8" : "#5b6472"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </summary>
        <div className="flex flex-col">
          {overviewPage ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(overviewPage.path)}
              className={`group flex w-full items-center text-left transition-colors ${
                isActiveLeaf
                  ? "bg-[#edf4ff] text-[#2356d8]"
                  : "text-[#253448] hover:bg-[#f5f7fb]"
              }`}
              style={{
                minHeight: 32,
                paddingLeft: 36 + depth * 16,
                paddingRight: 14,
              }}
            >
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{overviewPage.name}</span>
            </button>
          ) : null}
          {childPages}
        </div>
      </details>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#f5f7fb]">
      {isAuthLikePage ? (
        <main className="flex-1 min-h-0 overflow-auto bg-[#f5f7fb]">{children}</main>
      ) : (
        <>
          <header className="shrink-0 border-b border-[#e5e9f2] bg-white">
            <div className="flex min-h-[52px] items-center justify-between gap-4 px-4 md:px-5">
              <div className="flex items-end gap-1.5">
                <div className="text-[19px] font-extrabold uppercase tracking-[0.36em] text-[#2356d8]">
                  VUESTIC
                </div>
                <span className="mb-[2px] hidden text-[10px] font-bold uppercase tracking-[0.12em] text-[#2356d8] md:inline-flex">
                  ADMIN
                </span>
              </div>
              <div className="hidden items-center gap-8 text-[14px] font-medium text-slate-800 lg:flex">
                <button type="button" className="transition-colors hover:text-[#2356d8]">
                  Support &amp; Consulting
                </button>
                <button type="button" className="transition-colors hover:text-[#2356d8]">
                  About Vuestic Admin
                </button>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden h-8 w-8 items-center justify-center rounded-full text-slate-700 md:inline-flex">
                  <span className="text-[18px]">◔</span>
                </div>
                <div className="hidden h-8 w-8 items-center justify-center rounded-full text-slate-700 md:inline-flex">
                  <span className="text-[16px]">◎</span>
                </div>
                <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700">
                  <span className="text-[16px]">◌</span>
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    2+
                  </span>
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ffd75f] text-base">
                  🙂
                </div>
              </div>
            </div>
          </header>
          <div className="flex flex-1 min-h-0">
            <aside className="h-full w-[218px] shrink-0 border-r border-[#e5e9f2] bg-white text-[#253448] flex flex-col">
              <nav className="flex-1 min-h-0 py-1.5 flex flex-col overflow-y-auto">
                {treeRoots.map((node) => renderNode(node, 0))}
              </nav>
            </aside>
            <main className="flex-1 min-h-0 overflow-auto bg-[#f5f7fb]">
              <div className="min-h-full p-3 md:p-4">{children}</div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
