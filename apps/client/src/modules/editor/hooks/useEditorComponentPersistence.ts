import { action, toJS } from "mobx";
import { message } from "antd";
import { ulid } from "ulid";
import type { CodeFramework, TStorePage } from "@/shared/stores";
import type { IPageSchema } from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import {
  normalizeEditorPages,
  normalizeFromSchema,
  sanitizeCodeSyncNodes,
  serializeStore,
  type CodeSyncNode,
} from "@/modules/editor/utils/pageSchema";

interface EditorPageSettingsSnapshot {
  title?: string;
  description?: string;
  tdk?: string;
  pageCategory?: TStorePage["pageCategory"];
  layoutMode?: TStorePage["layoutMode"];
  grid?: TStorePage["grid"];
  shellLayout?: TStorePage["shellLayout"];
  deviceType?: TStorePage["deviceType"];
  canvasWidth?: number;
  canvasHeight?: number;
  codeFramework?: CodeFramework;
}

interface EditorComponentPersistenceContext {
  storeComponents: TEditorComponentsStore;
  pageStore: Pick<
    TStorePage,
    | "title"
    | "description"
    | "tdk"
    | "pageCategory"
    | "layoutMode"
    | "grid"
    | "shellLayout"
    | "deviceType"
    | "canvasWidth"
    | "canvasHeight"
    | "codeFramework"
  >;
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  updatePage: (page: Partial<TStorePage>) => void;
  setCodeFramework: (codeFramework: CodeFramework) => void;
}

interface LoadPageDataOptions {
  silent?: boolean;
}

const schemaStorageKey = "pageSchema";

/**
 * 兼容旧页面数据中的流式布局值，并统一恢复为自由布局。
 */
function normalizePageLayoutMode(mode?: unknown): TStorePage["layoutMode"] {
  return mode === "grid" || mode === "absolute" ? mode : "absolute";
}

function resolvePageShellLayout(
  layout?: unknown,
): TStorePage["shellLayout"] | null {
  return layout === "none" ||
    layout === "leftRight" ||
    layout === "topBottom" ||
    layout === "leftTop" ||
    layout === "breadcrumb" ||
    layout === "topLeft"
    ? layout
    : null;
}

/**
 * 把草稿中的页面设置恢复回页面 store。
 */
function hydratePageSettings(
  settings: EditorPageSettingsSnapshot | null,
  updatePage: (page: Partial<TStorePage>) => void,
  setCodeFramework: (codeFramework: CodeFramework) => void,
) {
  if (!settings) {
    return;
  }

  const shellLayout = resolvePageShellLayout(settings.shellLayout);
  updatePage({
    title: settings.title ?? "管理系统页面",
    description: settings.description ?? "用于配置管理后台页面的结构与业务说明",
    tdk: settings.tdk ?? "admin dashboard, management system, business console",
    pageCategory: settings.pageCategory ?? "admin",
    layoutMode: normalizePageLayoutMode(settings.layoutMode),
    grid: settings.grid,
    ...(shellLayout !== null ? { shellLayout } : {}),
    deviceType: settings.deviceType ?? "pc",
    canvasWidth: settings.canvasWidth ?? 1280,
    canvasHeight: settings.canvasHeight ?? 900,
  });

  if (settings.codeFramework) {
    setCodeFramework(settings.codeFramework);
  }
}

/**
 * 判断本地草稿是否比已发布数据更新。
 */
function shouldUseLocalDraft(
  storeTime: string | null,
  releaseTime: string | null,
) {
  if (!storeTime) {
    return false;
  }

  return Number(storeTime) > (releaseTime ? Number(releaseTime) : 0);
}

/**
 * 拉取服务端页面数据，失败时返回空值。
 */
async function fetchServerPageData(
  fetchServerData?: () => Promise<{ data: any }>,
) {
  if (!fetchServerData) {
    return null;
  }

  try {
    const { data } = await fetchServerData();
    return data;
  } catch (error) {
    console.error("获取服务端数据失败", error);
    return null;
  }
}

/**
 * 根据场景决定是否显示数据恢复提示。
 */
function notifyHydrationResult(content: string, options?: LoadPageDataOptions) {
  if (options?.silent) {
    return;
  }

  message.success(content);
}

/**
 * 创建 editor 草稿持久化与恢复能力。
 */
export function createEditorComponentPersistence(
  context: EditorComponentPersistenceContext,
) {
  const {
    addOperationLog,
    ensurePermission,
    pageStore,
    setCodeFramework,
    storeComponents,
    updatePage,
  } = context;

  /**
   * 根据 schema 恢复当前组件树与多页面状态。
   */
  const hydrateStoreFromSchema = action(
    (
      schema: IPageSchema,
      layoutMode: TStorePage["layoutMode"],
      grid: TStorePage["grid"] | undefined,
      preferredCurrentCompId?: string | null,
    ) => {
      const { pages, pageGroups, activePageId } = normalizeEditorPages(schema);
      const activePage =
        pages.find((page) => page.id === activePageId) ?? pages[0] ?? null;
      const normalized = normalizeFromSchema(
        {
          version: schema.version ?? 3,
          components: activePage?.components ?? [],
        },
        layoutMode,
        grid,
      );

      storeComponents.pages = pages;
      storeComponents.pageGroups = pageGroups;
      storeComponents.activePageId = activePage?.id ?? null;
      storeComponents.compConfigs = normalized.compConfigs;
      storeComponents.sortableCompConfig = normalized.sortableCompConfig;
      storeComponents.currentCompConfig =
        preferredCurrentCompId && normalized.compConfigs[preferredCurrentCompId]
          ? preferredCurrentCompId
          : (normalized.sortableCompConfig[0] ?? null);
      storeComponents.selectedCompIds = storeComponents.currentCompConfig
        ? [storeComponents.currentCompConfig]
        : [];
    },
  );

  /**
   * 把当前 schema 保存到本地草稿。
   */
  const storeInLocalStorage = action(() => {
    if (!ensurePermission("save_draft", "当前角色不能保存草稿")) {
      return;
    }

    const pageSchema = JSON.stringify(serializeStore(storeComponents));
    const currentCompConfig = JSON.stringify(toJS(storeComponents.currentCompConfig));
    const pageSettings = JSON.stringify({
      title: pageStore.title,
      description: pageStore.description,
      tdk: pageStore.tdk,
      pageCategory: pageStore.pageCategory,
      layoutMode: pageStore.layoutMode,
      grid: pageStore.grid,
      shellLayout: pageStore.shellLayout,
      deviceType: pageStore.deviceType,
      canvasWidth: pageStore.canvasWidth,
      canvasHeight: pageStore.canvasHeight,
      codeFramework: pageStore.codeFramework,
    });

    localStorage.setItem(schemaStorageKey, pageSchema);
    localStorage.setItem("currentCompConfig", currentCompConfig);
    localStorage.setItem("pageSettings", pageSettings);
    localStorage.setItem("store_time", String(Date.now()));
    message.success("保存成功");
    addOperationLog("save_draft", "本地草稿");
  });

  /**
   * 用服务端返回的页面数据初始化编辑器状态。
   */
  const initFromServerData = action((data: any, options?: LoadPageDataOptions) => {
    const schema = data?.schema
      ? (data.schema as IPageSchema)
      : ({
          version: 2,
          components: sanitizeCodeSyncNodes(
            (data?.components ?? []).map((comp: any) => ({
              id: comp.node_id || ulid(),
              type: comp.type,
              props: comp.options ?? {},
              styles: comp.styles ?? comp.options?.styles,
              slot: comp.slot,
            })),
          ),
        } satisfies IPageSchema);

    const layoutMode = normalizePageLayoutMode(data?.layoutMode);
    hydrateStoreFromSchema(schema, layoutMode, data?.grid);
    const shellLayout = resolvePageShellLayout(data?.shellLayout);
    updatePage({
      tdk: data?.tdk || "",
      title: data?.page_name,
      description: data?.desc,
      pageCategory: "admin",
      layoutMode,
      grid: data?.grid,
      ...(shellLayout !== null ? { shellLayout } : {}),
      deviceType: data?.deviceType ?? "pc",
      canvasWidth: data?.canvasWidth ?? 1280,
      canvasHeight: data?.canvasHeight ?? 900,
    });
    notifyHydrationResult("已自动从服务器读取数据", options);
  });

  /**
   * 按草稿优先策略加载本地或服务端页面数据。
   */
  const loadPageData = action(
    async (
      fetchServerData?: () => Promise<{ data: any }>,
      options?: LoadPageDataOptions,
    ) => {
      const pageSchema = localStorage.getItem(schemaStorageKey);
      const compConfig = localStorage.getItem("compConfig");
      const sortableCompConfig = localStorage.getItem("sortableCompConfig");
      const currentCompConfig = localStorage.getItem("currentCompConfig");
      const pageSettings = localStorage.getItem("pageSettings");
      const storeTime = localStorage.getItem("store_time");
      const releaseTime = localStorage.getItem("release_time");
      const serverData = await fetchServerPageData(fetchServerData);

      if (pageSchema && shouldUseLocalDraft(storeTime, releaseTime)) {
        const settings = pageSettings ? JSON.parse(pageSettings) : null;
        const layoutMode = normalizePageLayoutMode(settings?.layoutMode);
        hydrateStoreFromSchema(
          JSON.parse(pageSchema),
          layoutMode,
          settings?.grid,
          currentCompConfig ? JSON.parse(currentCompConfig) : null,
        );
        hydratePageSettings(settings, updatePage, setCodeFramework);
        notifyHydrationResult("已自动从草稿中读取数据", options);
        return serverData;
      }

      if (pageSchema && serverData) {
        initFromServerData(serverData, options);
        return serverData;
      }

      if (
        compConfig &&
        compConfig !== "{}" &&
        shouldUseLocalDraft(storeTime, releaseTime)
      ) {
        const legacyComponents = JSON.parse(compConfig);
        const legacyOrder = JSON.parse(sortableCompConfig || "[]");
        const settings = pageSettings ? JSON.parse(pageSettings) : null;
        const layoutMode = normalizePageLayoutMode(settings?.layoutMode);
        const legacySchema = {
          version: 2,
          components: sanitizeCodeSyncNodes(
            legacyOrder
              .map((id: string) => legacyComponents[id])
              .filter(Boolean) as CodeSyncNode[],
          ),
        } satisfies IPageSchema;
        hydrateStoreFromSchema(
          legacySchema,
          layoutMode,
          settings?.grid,
          currentCompConfig ? JSON.parse(currentCompConfig) : null,
        );
        hydratePageSettings(settings, updatePage, setCodeFramework);
        notifyHydrationResult("已自动从草稿中读取数据", options);
        return serverData;
      }

      if (serverData) {
        initFromServerData(serverData, options);
      }

      return serverData;
    },
  );

  return {
    hydrateStoreFromSchema,
    initFromServerData,
    loadPageData,
    storeInLocalStorage,
  };
}
