import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import type { IEditorPageSchema } from "@codigo/schema";

type AdminShellPage = Pick<IEditorPageSchema, "id" | "name" | "path">;

interface AdminShellProps extends PropsWithChildren {
  pages: AdminShellPage[];
  activePagePath: string | null;
  onSelectPagePath: (path: string) => void;
  title?: string;
}

export default function AdminShell({
  pages,
  activePagePath,
  onSelectPagePath,
  title = "管理后台",
  children,
}: AdminShellProps) {
  type ShellTreeNode = {
    path: string;
    label: string;
    page?: AdminShellPage;
    children: ShellTreeNode[];
    order: number;
  };

  const treeRoots = useMemo<ShellTreeNode[]>(() => {
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
    ) => {
      const map = parent ? getChildren(parent) : roots;
      const existing = map.get(segment);
      if (existing) {
        existing.order = Math.min(existing.order, order);
        return existing;
      }
      const created: ShellTreeNode = {
        path: fullPath,
        label: segment,
        children: [],
        order,
      };
      map.set(segment, created);
      return created;
    };

    pages.forEach((page, index) => {
      const segments = page.path.split("/").filter(Boolean);
      if (!segments.length) {
        return;
      }
      let parent = "";
      let currentNode: ShellTreeNode | null = null;
      for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        const fullPath = parent ? `${parent}/${segment}` : segment;
        currentNode = ensureNode(parent, segment, fullPath, index);
        parent = fullPath;
      }
      if (currentNode) {
        currentNode.page = page;
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
          }
        }
      });
      return nodes.sort((a, b) =>
        a.order !== b.order ? a.order - b.order : a.path.localeCompare(b.path),
      );
    };

    return materialize(roots);
  }, [pages]);

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
      if (!page) {
        return null;
      }
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
    const overviewPage = node.page;
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
          className={`list-none flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors cursor-pointer select-none ${
            isActiveGroup
              ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
              : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
          }`}
          style={{ paddingLeft: 12 + depth * 12 }}
        >
          <span className="truncate font-medium">{node.label}</span>
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
    <div className="h-screen w-full flex bg-[var(--ide-bg)]">
      <aside className="h-screen w-60 shrink-0 border-r border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-[var(--ide-border)] font-semibold text-[var(--ide-text)] bg-[var(--ide-header-bg)]">
          {title}
        </div>
        <nav className="flex-1 min-h-0 p-2 flex flex-col gap-1 overflow-y-auto">
          {treeRoots.map((node) => renderNode(node, 0))}
        </nav>
      </aside>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
