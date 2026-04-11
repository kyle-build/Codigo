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

const schemaStorageKey = "pageSchema";

/**
 * 兼容旧页面数据中的流式布局值，并统一恢复为自由布局。
 */
function normalizePageLayoutMode() {
  return "absolute" as const;
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

  updatePage({
    title: settings.title ?? "Codigo低代码平台",
    description: settings.description ?? "Codigo低代码开发页面详情",
    tdk:
      settings.tdk ??
      "lowcode platform, lowcode development, lowcode page details",
    pageCategory: settings.pageCategory ?? "marketing",
    layoutMode: normalizePageLayoutMode(),
    deviceType: settings.deviceType ?? "mobile",
    canvasWidth: settings.canvasWidth ?? 380,
    canvasHeight: settings.canvasHeight ?? 700,
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
      layoutMode: "absolute",
      preferredCurrentCompId?: string | null,
    ) => {
      const { pages, activePageId } = normalizeEditorPages(schema);
      const activePage =
        pages.find((page) => page.id === activePageId) ?? pages[0] ?? null;
      const normalized = normalizeFromSchema(
        {
          version: schema.version ?? 3,
          components: activePage?.components ?? [],
        },
        layoutMode,
      );

      storeComponents.pages = pages;
      storeComponents.activePageId = activePage?.id ?? null;
      storeComponents.compConfigs = normalized.compConfigs;
      storeComponents.sortableCompConfig = normalized.sortableCompConfig;
      storeComponents.currentCompConfig =
        preferredCurrentCompId && normalized.compConfigs[preferredCurrentCompId]
          ? preferredCurrentCompId
          : (normalized.sortableCompConfig[0] ?? null);
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
  const initFromServerData = action((data: any) => {
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

    hydrateStoreFromSchema(schema, normalizePageLayoutMode());
    updatePage({
      tdk: data?.tdk || "",
      title: data?.page_name,
      description: data?.desc,
      pageCategory: data?.pageCategory ?? "marketing",
      layoutMode: normalizePageLayoutMode(),
      deviceType: data?.deviceType ?? "mobile",
      canvasWidth: data?.canvasWidth ?? 380,
      canvasHeight: data?.canvasHeight ?? 700,
    });
    message.success("已自动从服务器读取数据");
  });

  /**
   * 按草稿优先策略加载本地或服务端页面数据。
   */
  const loadPageData = action(
    async (fetchServerData?: () => Promise<{ data: any }>) => {
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
        hydrateStoreFromSchema(
          JSON.parse(pageSchema),
          normalizePageLayoutMode(),
          currentCompConfig ? JSON.parse(currentCompConfig) : null,
        );
        hydratePageSettings(settings, updatePage, setCodeFramework);
        message.success("已自动从草稿中读取数据");
        return serverData;
      }

      if (pageSchema && serverData) {
        initFromServerData(serverData);
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
          normalizePageLayoutMode(),
          currentCompConfig ? JSON.parse(currentCompConfig) : null,
        );
        hydratePageSettings(settings, updatePage, setCodeFramework);
        message.success("已自动从草稿中读取数据");
        return serverData;
      }

      if (serverData) {
        initFromServerData(serverData);
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
