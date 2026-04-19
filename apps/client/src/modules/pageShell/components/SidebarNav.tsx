import type { Dispatch, ReactNode, SetStateAction } from "react";
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

/**
 * Returns the visible label for a tree node using the explicit page-group name first.
 */
function getNodeTitle(node: ShellTreeNode) {
  return node.group?.name ?? node.page?.name ?? node.label;
}

/**
 * Renders lightweight inline icons that stay close to the Vuestic sidebar style.
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
  const itemBaseClass = "group flex w-full items-center text-left transition-colors";

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
      const title = getNodeTitle(node);
      const isTopLevel = depth === 0;
      return (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPagePath(page.path)}
          className={`${itemBaseClass} ${
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
              {renderTopLevelIcon(title, isActive)}
            </span>
          ) : null}
          <span className={`min-w-0 flex-1 truncate ${isTopLevel ? "text-[15px] font-semibold" : "text-[14px] font-medium"}`}>
            {title}
          </span>
        </button>
      );
    }

    const isOpen = openPaths.has(node.path);
    const overviewPage = node.group ? null : node.page;
    const childPages = node.children.map((child) => renderNode(child, depth + 1));
    const title = getNodeTitle(node);
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
                {renderTopLevelIcon(title, isActiveGroup)}
              </span>
            ) : null}
            <div className={`min-w-0 flex-1 truncate ${isTopLevel ? "text-[15px] font-semibold" : "text-[14px] font-medium"}`}>
              {title}
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
              className={`${itemBaseClass} ${
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
    <aside
      className={`h-full w-[218px] shrink-0 border-r border-[#e5e9f2] bg-white text-[#253448] flex flex-col ${navInteractiveClass} ${className}`}
    >
      {header ? (
        <div className="border-b border-[#eef1f6] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {header.subtitle ?? header.title}
        </div>
      ) : null}
      <nav className="flex-1 min-h-0 py-1.5 flex flex-col overflow-y-auto">
        {extraTopPage ? (
          <button
            type="button"
            onClick={() => onSelectPagePath(extraTopPage.path)}
            className={`${itemBaseClass} ${
              extraTopPage.path === activePagePath
                ? "bg-[#edf4ff] text-[#2356d8]"
                : "text-[#253448] hover:bg-[#f5f7fb]"
            }`}
            style={{ minHeight: 34, paddingLeft: 14, paddingRight: 14 }}
          >
            <span className="mr-2 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
              {renderTopLevelIcon(extraTopPage.name, extraTopPage.path === activePagePath)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{extraTopPage.name}</span>
          </button>
        ) : null}
        {roots.map((node) => renderNode(node, 0))}
      </nav>
    </aside>
  );
}
