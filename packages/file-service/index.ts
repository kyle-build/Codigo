export type FileServiceNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileServiceNode[];
};

export type FileServiceContext = {
  pageId?: number;
  token?: string;
  baseUrl?: string;
};

type ApiEnvelope<T> = {
  data?: T;
};

type WorkspaceExplorerResponse = {
  tree: FileServiceNode[];
};

type WorkspaceFileResponse = {
  content: string;
};

const searchParams =
  typeof window === "undefined"
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);
const embedded = typeof window !== "undefined" && window.parent !== window;

let context: FileServiceContext = {
  pageId: parsePageId(searchParams.get("pageId")),
  baseUrl: readString(searchParams.get("apiBaseUrl")),
};

let explorerCache: Promise<WorkspaceExplorerResponse> | undefined;
let resolveReady: (() => void) | undefined;
const whenContextReady = embedded
  ? new Promise<void>((resolve) => {
      resolveReady = resolve;
    })
  : Promise.resolve();

if (!embedded || isContextReady(context)) {
  resolveReady?.();
  resolveReady = undefined;
}

export function configureFileServiceContext(nextContext: FileServiceContext) {
  if (hasContextChanged(context, nextContext)) {
    explorerCache = undefined;
  }
  context = mergeContext(context, nextContext);
  if (isContextReady(context)) {
    resolveReady?.();
    resolveReady = undefined;
  }
}

export function getFileServiceContext() {
  return { ...context };
}

export function resetFileServiceCache() {
  explorerCache = undefined;
}

export async function readFile(path: string) {
  await waitForRuntimeContext();
  const pageId = getPageId();
  const targetPath = normalizePath(path);
  const response = await requestJson<WorkspaceFileResponse>(
    `/pages/${pageId}/workspace/file?path=${encodeURIComponent(targetPath)}`,
  );
  return response.content;
}

export async function readDir(path: string) {
  await waitForRuntimeContext();
  const tree = (await loadExplorer()).tree;
  const targetPath = normalizePath(path);

  if (!targetPath) {
    return tree;
  }

  const targetNode = findNode(tree, targetPath);
  if (!targetNode || targetNode.type !== "directory") {
    return [];
  }

  return targetNode.children ?? [];
}

export async function writeFile(path: string, content: string) {
  await waitForRuntimeContext();
  const pageId = getPageId();
  const targetPath = normalizePath(path);
  await requestJson(`/pages/${pageId}/workspace/file`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: targetPath,
      content,
    }),
  });
}

async function loadExplorer() {
  if (!explorerCache) {
    const pageId = getPageId();
    explorerCache = requestJson<WorkspaceExplorerResponse>(
      `/pages/${pageId}/workspace/explorer`,
    );
  }
  return explorerCache;
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init?.headers),
  });

  if (!response.ok) {
    throw new Error(`File service request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}

function buildHeaders(headers?: HeadersInit) {
  const mergedHeaders = new Headers(headers);
  if (context.token) {
    mergedHeaders.set("Authorization", context.token);
  }
  return mergedHeaders;
}

function buildUrl(path: string) {
  if (!context.baseUrl) {
    return path;
  }
  const baseUrl = context.baseUrl.endsWith("/")
    ? context.baseUrl.slice(0, -1)
    : context.baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function findNode(
  nodes: FileServiceNode[],
  targetPath: string,
): FileServiceNode | undefined {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node;
    }

    if (node.type === "directory" && node.children?.length) {
      const matchedNode = findNode(node.children, targetPath);
      if (matchedNode) {
        return matchedNode;
      }
    }
  }

  return undefined;
}

function getPageId() {
  if (!context.pageId) {
    throw new Error("Missing pageId for file service");
  }
  return context.pageId;
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

function parsePageId(value: string | null) {
  if (!value) {
    return undefined;
  }

  const pageId = Number(value);
  return Number.isNaN(pageId) ? undefined : pageId;
}

function readString(value: string | null) {
  return value ? value : undefined;
}

async function waitForRuntimeContext() {
  if (!embedded) {
    return;
  }

  await whenContextReady;
}

function isContextReady(value: FileServiceContext) {
  return Boolean(value.pageId && (!embedded || value.token));
}

function mergeContext(
  currentContext: FileServiceContext,
  nextContext: FileServiceContext,
) {
  return {
    pageId:
      nextContext.pageId !== undefined
        ? nextContext.pageId
        : currentContext.pageId,
    token:
      nextContext.token !== undefined
        ? nextContext.token
        : currentContext.token,
    baseUrl:
      nextContext.baseUrl !== undefined
        ? nextContext.baseUrl
        : currentContext.baseUrl,
  };
}

/**
 * 仅在运行时关键上下文变更时清空文件树缓存，避免 iframe 首次无 token 请求失败后长期复用旧 Promise。
 */
function hasContextChanged(
  currentContext: FileServiceContext,
  nextContext: FileServiceContext,
) {
  return (
    (nextContext.pageId !== undefined && nextContext.pageId !== currentContext.pageId) ||
    (nextContext.token !== undefined && nextContext.token !== currentContext.token) ||
    (nextContext.baseUrl !== undefined && nextContext.baseUrl !== currentContext.baseUrl)
  );
}
