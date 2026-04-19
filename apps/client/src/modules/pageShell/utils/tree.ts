import type { IEditorPageGroupSchema, IEditorPageSchema } from "@codigo/schema";

export type AdminShellPage = Pick<IEditorPageSchema, "id" | "name" | "path">;
export type AdminShellPageGroup = Pick<IEditorPageGroupSchema, "id" | "name" | "path">;

export type ShellTreeNode = {
  path: string;
  label: string;
  group?: AdminShellPageGroup;
  page?: AdminShellPage;
  children: ShellTreeNode[];
  order: number;
};

export function buildShellTree(
  pages: AdminShellPage[],
  pageGroups: AdminShellPageGroup[] = [],
) {
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

export function deriveOpenPaths(activePagePath: string | null) {
  const next = new Set<string>();
  const path = activePagePath?.trim() ?? "";
  if (!path) return next;
  const segments = path.split("/").filter(Boolean);
  let current = "";
  for (let i = 0; i < segments.length - 1; i += 1) {
    current = current ? `${current}/${segments[i]}` : segments[i];
    next.add(current);
  }
  return next;
}

export function resolveActiveTopNode(roots: ShellTreeNode[], activePagePath: string | null) {
  const path = activePagePath?.trim() ?? "";
  if (!path) return null;
  const first = path.split("/").filter(Boolean)[0];
  if (!first) return null;
  return roots.find((node) => node.path === first) ?? null;
}
