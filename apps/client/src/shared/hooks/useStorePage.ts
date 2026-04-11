import { action } from "mobx";
import { createStorePage } from "@/shared/stores";
import type {
  TStorePage,
  DeviceType,
  CodeFramework,
  EditorMode,
} from "@/shared/stores";
import { setDefaultEChartsTheme } from "@codigo/materials";
import type {
  PageCategory,
  PageLayoutMode,
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
} from "@codigo/schema";

const storePage = createStorePage();
const OUTLINE_TREE_STORAGE_KEY = "editor:outline-tree";

setDefaultEChartsTheme(storePage.chartTheme || undefined);

function getOutlineTreeStorageKey(pageId: number) {
  return `${OUTLINE_TREE_STORAGE_KEY}:${pageId}`;
}

/**
 * 兼容旧草稿中的流式布局配置，并统一收口到自由布局。
 */
function normalizePageLayoutMode() {
  return "absolute" as const;
}

export function useStorePage() {
  const syncPageCategoryDefaults = action((category: PageCategory) => {
    if (category === "admin") {
      storePage.deviceType = "pc";
      storePage.canvasWidth = 1280;
      storePage.canvasHeight = 900;
      storePage.layoutMode = normalizePageLayoutMode();
      return;
    }

    storePage.deviceType = "mobile";
    storePage.canvasWidth = 380;
    storePage.canvasHeight = 700;
    storePage.layoutMode = normalizePageLayoutMode();
  });

  /**
   * 设置页面标题
   * @param title - 页面标题
   */
  const setPageTitle = action((title: string) => {
    storePage.title = title;
  });

  const setDeviceType = action((type: DeviceType) => {
    storePage.deviceType = type;
    if (type === "mobile") {
      storePage.canvasWidth = 380;
      storePage.canvasHeight = 700;
    } else {
      storePage.canvasWidth = storePage.pageCategory === "admin" ? 1280 : 1024;
      storePage.canvasHeight = storePage.pageCategory === "admin" ? 900 : 768;
    }
  });

  const setCanvasSize = action((width: number, height: number) => {
    storePage.canvasWidth = width;
    storePage.canvasHeight = height;
  });

  const setCodeFramework = action((framework: CodeFramework) => {
    storePage.codeFramework = framework;
  });

  const setPageCategory = action((category: PageCategory) => {
    storePage.pageCategory = category;
    syncPageCategoryDefaults(category);
  });

  const setLayoutMode = action((mode: PageLayoutMode) => {
    storePage.layoutMode = mode ?? normalizePageLayoutMode();
  });

  const setEditorMode = action((mode: EditorMode) => {
    storePage.editorMode = mode;
  });

  const setOutlineTreeVisible = action((visible: boolean, pageId?: number) => {
    storePage.showOutlineTree = visible;

    if (pageId && Number.isFinite(pageId) && pageId > 0) {
      localStorage.setItem(getOutlineTreeStorageKey(pageId), String(visible));
    }
  });

  const hydrateOutlineTreeVisible = action((pageId?: number | null) => {
    if (!pageId || !Number.isFinite(pageId) || pageId <= 0) {
      storePage.showOutlineTree = true;
      return;
    }

    const savedValue = localStorage.getItem(getOutlineTreeStorageKey(pageId));
    storePage.showOutlineTree = savedValue ? savedValue === "true" : true;
  });

  const setWorkspace = action((workspace: PageWorkspaceResponse | null) => {
    storePage.workspace = workspace;
  });

  const setWorkspaceExplorer = action(
    (workspaceExplorer: PageWorkspaceExplorerResponse | null) => {
      storePage.workspaceExplorer = workspaceExplorer;
    },
  );

  const setWorkspaceSession = action(
    (workspaceSession: PageWorkspaceSessionResponse | null) => {
      storePage.workspaceSession = workspaceSession;
    },
  );

  const setWorkspaceRuntime = action(
    (workspaceRuntime: PageWorkspaceRuntimeResponse | null) => {
      storePage.workspaceRuntime = workspaceRuntime;
    },
  );

  const setWorkspaceIDEConfig = action(
    (workspaceIDEConfig: PageWorkspaceIDEConfigResponse | null) => {
      storePage.workspaceIDEConfig = workspaceIDEConfig;
    },
  );

  const setActiveWorkspaceFilePath = action((path: string | null) => {
    storePage.activeWorkspaceFilePath = path;
  });

  const upsertWorkspaceFile = action((file: PageWorkspaceFileResponse) => {
    const currentFileState = storePage.workspaceFiles[file.path];

    storePage.workspaceFiles[file.path] = {
      file,
      isDirty: currentFileState?.isDirty ?? false,
      isSaving: false,
    };

    if (!storePage.workspaceOpenFilePaths.includes(file.path)) {
      storePage.workspaceOpenFilePaths.push(file.path);
    }

    storePage.activeWorkspaceFilePath = file.path;
  });

  const updateWorkspaceFileContent = action((path: string, content: string) => {
    const currentFileState = storePage.workspaceFiles[path];
    if (!currentFileState) return;

    currentFileState.file = {
      ...currentFileState.file,
      content,
    };
    currentFileState.isDirty = true;
  });

  const setWorkspaceFileSaving = action((path: string, isSaving: boolean) => {
    const currentFileState = storePage.workspaceFiles[path];
    if (!currentFileState) return;

    currentFileState.isSaving = isSaving;
  });

  const markWorkspaceFileSaved = action((file: PageWorkspaceFileResponse) => {
    storePage.workspaceFiles[file.path] = {
      file,
      isDirty: false,
      isSaving: false,
    };

    if (!storePage.workspaceOpenFilePaths.includes(file.path)) {
      storePage.workspaceOpenFilePaths.push(file.path);
    }

    storePage.activeWorkspaceFilePath = file.path;
  });

  const resetWorkspaceFiles = action(() => {
    storePage.workspaceExplorer = null;
    storePage.activeWorkspaceFilePath = null;
    storePage.workspaceOpenFilePaths = [];
    storePage.workspaceFiles = {};
  });

  /**
   * 更新页面信息
   * @param page - 部分页面信息
   */
  const updatePage = action((page: Partial<TStorePage>) => {
    if (!page) return;
    for (const [key, value] of Object.entries(page))
      // @ts-ignore
      storePage[key as keyof TStorePage] = value;

    if (page.pageCategory) {
      if (page.pageCategory === "admin") {
        storePage.deviceType = page.deviceType ?? "pc";
        storePage.canvasWidth = page.canvasWidth ?? 1280;
        storePage.canvasHeight = page.canvasHeight ?? 900;
        storePage.layoutMode = normalizePageLayoutMode();
      } else {
        storePage.deviceType = page.deviceType ?? storePage.deviceType;
        storePage.layoutMode = normalizePageLayoutMode();
      }
    } else if (Object.prototype.hasOwnProperty.call(page, "layoutMode")) {
      storePage.layoutMode = normalizePageLayoutMode();
    }

    if (Object.prototype.hasOwnProperty.call(page, "chartTheme")) {
      setDefaultEChartsTheme(storePage.chartTheme || undefined);
    }
  });

  return {
    updatePage,
    setPageTitle,
    setPageCategory,
    setLayoutMode,
    setDeviceType,
    setCanvasSize,
    setCodeFramework,
    setEditorMode,
    setOutlineTreeVisible,
    hydrateOutlineTreeVisible,
    setWorkspace,
    setWorkspaceExplorer,
    setWorkspaceSession,
    setWorkspaceRuntime,
    setWorkspaceIDEConfig,
    setActiveWorkspaceFilePath,
    upsertWorkspaceFile,
    updateWorkspaceFileContent,
    setWorkspaceFileSaving,
    markWorkspaceFileSaved,
    resetWorkspaceFiles,
    store: storePage,
  };
}
