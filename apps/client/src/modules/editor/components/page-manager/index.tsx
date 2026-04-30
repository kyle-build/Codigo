import { observer } from "mobx-react-lite";
import { Button, Input } from "antd";
import {
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useEditorComponents } from "@/modules/editor/hooks";
import {
  buildShellTree,
  type ShellTreeNode,
} from "@/modules/page-shell/utils/tree";
import { useEffect, useMemo, useState } from "react";

interface EditorPageManagerProps {
  embedded?: boolean;
  variant?: "sidebar" | "dropdown";
}

function EditorPageManager({
  embedded = false,
  variant = "sidebar",
}: EditorPageManagerProps) {
  const {
    getPages,
    getPageGroups,
    getActivePage,
    createEditorPage,
    createEditorPageGroup,
    switchEditorPage,
    updateEditorPageMeta,
  } = useEditorComponents();
  const pages = getPages.get();
  const pageGroups = getPageGroups.get();
  const activePage = getActivePage.get();
  const [keyword, setKeyword] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<
    | { type: "page"; id: string }
    | { type: "group"; path: string }
    | null
  >(null);
  const [openPaths, setOpenPaths] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!activePage) {
      return;
    }
    setSelectedTarget({ type: "page", id: activePage.id });
    const segments = activePage.path.split("/").filter(Boolean);
    if (segments.length <= 1) {
      return;
    }
    setOpenPaths((prev) => {
      const next = new Set(prev);
      let current = "";
      for (let i = 0; i < segments.length - 1; i += 1) {
        current = current ? `${current}/${segments[i]}` : segments[i];
        next.add(current);
      }
      return next;
    });
  }, [activePage?.id, activePage?.path]);

  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredPages = useMemo(() => {
    if (!normalizedKeyword) {
      return pages;
    }
    return pages.filter((page) => {
      const name = page.name?.toLowerCase() ?? "";
      const path = page.path?.toLowerCase() ?? "";
      return name.includes(normalizedKeyword) || path.includes(normalizedKeyword);
    });
  }, [normalizedKeyword, pages]);

  const filteredGroups = useMemo(() => {
    if (!normalizedKeyword) {
      return pageGroups;
    }
    return pageGroups.filter((group) => {
      const name = group.name?.toLowerCase() ?? "";
      const path = group.path?.toLowerCase() ?? "";
      return name.includes(normalizedKeyword) || path.includes(normalizedKeyword);
    });
  }, [normalizedKeyword, pageGroups]);

  const treeRoots = useMemo(
    () => buildShellTree(filteredPages, filteredGroups),
    [filteredGroups, filteredPages],
  );

  const selectedGroupPath = useMemo(() => {
    if (selectedTarget?.type === "group") {
      return selectedTarget.path;
    }
    return null;
  }, [selectedTarget]);

  const toggleOpen = (path: string) => {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTreeNode = (node: ShellTreeNode, depth: number) => {
    const isOpen = openPaths.has(node.path);
    const hasChildren = node.children.length > 0;
    const isGroupNode = Boolean(node.group);
    const isActive = Boolean(activePage && node.page?.id === activePage.id);
    const isSelected =
      (selectedTarget?.type === "group" && selectedTarget.path === node.path) ||
      (selectedTarget?.type === "page" && node.page?.id === selectedTarget.id);

    const rowClassName = `w-full border-0 px-2 py-1.5 text-left transition-colors ${
      isActive
        ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
        : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
    }`;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 ${isSelected ? "outline outline-1 outline-[var(--ide-accent)]/35 outline-offset-[-1px]" : ""}`}
          style={{ paddingLeft: depth * 10 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleOpen(node.path);
                if (isGroupNode) {
                  setSelectedTarget({ type: "group", path: node.path });
                }
              }}
              className="flex h-6 w-6 items-center justify-center rounded-sm text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]"
              aria-label={isOpen ? "收起" : "展开"}
            >
              <RightOutlined className={isOpen ? "rotate-90 text-[11px]" : "text-[11px]"} />
            </button>
          ) : (
            <div className="h-6 w-6" />
          )}
          <button
            type="button"
            onClick={() => {
              if (isGroupNode) {
                setSelectedTarget({ type: "group", path: node.path });
                if (hasChildren) {
                  toggleOpen(node.path);
                }
                return;
              }
              if (node.page) {
                setSelectedTarget({ type: "page", id: node.page.id });
                switchEditorPage(node.page.id);
                return;
              }
              if (hasChildren) {
                toggleOpen(node.path);
              }
            }}
            className={rowClassName}
          >
            <div className="flex items-center gap-2">
              {isGroupNode || hasChildren ? (
                isOpen ? (
                  <FolderOpenOutlined className={isActive ? "text-[var(--ide-accent)]" : "text-[var(--ide-text-muted)]"} />
                ) : (
                  <FolderOutlined className={isActive ? "text-[var(--ide-accent)]" : "text-[var(--ide-text-muted)]"} />
                )
              ) : (
                <FileTextOutlined className={isActive ? "text-[var(--ide-accent)]" : "text-[var(--ide-text-muted)]"} />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium">
                  {node.group?.name ?? node.page?.name ?? node.label}
                </div>
                <div className="truncate text-[10px] opacity-60 font-mono">
                  {isGroupNode ? `group:${node.path}` : (node.page?.path ?? node.path)}
                </div>
              </div>
            </div>
          </button>
        </div>
        {hasChildren && isOpen ? (
          <div className="space-y-1">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  if (embedded) {
    const containerClassName =
      variant === "dropdown"
        ? "flex w-[340px] max-h-[560px] min-h-0 flex-col overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] shadow-[0_14px_40px_-28px_rgba(0,0,0,0.55)]"
        : "flex h-full min-h-0 flex-col overflow-hidden bg-[var(--ide-sidebar-bg)]";

    return (
      <div className={containerClassName}>
        <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">页面管理</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() =>
                createEditorPage({
                  parentGroupPath: selectedGroupPath,
                  switchToNewPage: !selectedGroupPath,
                })
              }
              className="!rounded-sm"
            >
              页面
            </Button>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                const nextGroup = createEditorPageGroup({
                  parentGroupPath: selectedGroupPath,
                });
                if (!nextGroup) {
                  return;
                }
                setSelectedTarget({ type: "group", path: nextGroup.path });
                setOpenPaths((prev) => {
                  const next = new Set(prev);
                  if (selectedGroupPath) {
                    next.add(selectedGroupPath);
                  }
                  next.add(nextGroup.path);
                  return next;
                });
              }}
              className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
            >
              页面集
            </Button>
          </div>
        </div>

        <div className="border-b border-[var(--ide-border)] px-3 py-2">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
            size="small"
            placeholder="搜索页面（名称 / 路径）"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
          <div className="space-y-1">
            {treeRoots.map((node) => renderTreeNode(node, 0))}
          </div>
        </div>

        {activePage ? (
          <div className="border-t border-[var(--ide-border)] p-3">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
                当前页面配置
              </div>
              <Input
                key={`${activePage.id}-${activePage.name}-embedded-name`}
                defaultValue={activePage.name}
                size="small"
                onBlur={(event) =>
                  updateEditorPageMeta(activePage.id, {
                    name: event.target.value,
                  })
                }
                className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
              />
              <Input
                key={`${activePage.id}-${activePage.path}-embedded-path`}
                defaultValue={activePage.path}
                size="small"
                onBlur={(event) =>
                  updateEditorPageMeta(activePage.id, {
                    path: event.target.value,
                  })
                }
                className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full w-[272px] shrink-0 flex-col border-r border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-3 py-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
          页面管理
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() =>
              createEditorPage({
                parentGroupPath: selectedGroupPath,
                switchToNewPage: !selectedGroupPath,
              })
            }
            className="!rounded-sm"
          >
            页面
          </Button>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              const nextGroup = createEditorPageGroup({
                parentGroupPath: selectedGroupPath,
              });
              if (!nextGroup) {
                return;
              }
              setSelectedTarget({ type: "group", path: nextGroup.path });
              setOpenPaths((prev) => {
                const next = new Set(prev);
                if (selectedGroupPath) {
                  next.add(selectedGroupPath);
                }
                next.add(nextGroup.path);
                return next;
              });
            }}
            className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
          >
            页面集
          </Button>
        </div>
      </div>

      <div className="border-b border-[var(--ide-border)] px-3 py-2">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          allowClear
          size="small"
          placeholder="搜索页面（名称 / 路径）"
          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
        <div className="space-y-1">
          {treeRoots.map((node) => renderTreeNode(node, 0))}
        </div>
      </div>

      {activePage ? (
        <div className="border-t border-[var(--ide-border)] p-3">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
              当前页面配置
            </div>
            <Input
              key={`${activePage.id}-${activePage.name}-name`}
              defaultValue={activePage.name}
              size="small"
              onBlur={(event) =>
                updateEditorPageMeta(activePage.id, {
                  name: event.target.value,
                })
              }
              onPressEnter={(event) => {
                updateEditorPageMeta(activePage.id, {
                  name: event.currentTarget.value,
                });
                event.currentTarget.blur();
              }}
              placeholder="页面名称"
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
            <Input
              key={`${activePage.id}-${activePage.path}-path`}
              defaultValue={activePage.path}
              size="small"
              onBlur={(event) =>
                updateEditorPageMeta(activePage.id, {
                  path: event.target.value,
                })
              }
              onPressEnter={(event) => {
                updateEditorPageMeta(activePage.id, {
                  path: event.currentTarget.value,
                });
                event.currentTarget.blur();
              }}
              placeholder="跳转路径标识"
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
          </div>
          <div className="mt-3 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2 py-1.5 text-[12px] leading-5 text-[var(--ide-text-muted)]">
            页面跳转动作里填写
            <span className="mx-1 inline-flex items-center rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--ide-accent)]">
              {`page:${activePage.path}`}
            </span>
            即可切到当前页。
          </div>
        </div>
      ) : null}
    </div>
  );
}

const EditorPageManagerComponent = observer(EditorPageManager);

export default EditorPageManagerComponent;
